// Where a marker for a legislative seat goes on the district map.
//
// The public-input map borrows the district map's outline and draws a dot per
// place instead of filling districts, so it needs a point for each place. The
// points are not stored here and nothing is hand-placed: every one is computed
// from the map's own geometry, so a seat that moves on the map moves its
// marker with it.
//
// Why compute rather than copy a projection. The ballot-question map keeps its
// towns as coordinates projected into its own hand-simplified viewBox. That
// viewBox is not this map's, and the two shapes are simplified differently, so
// carrying those numbers across would put dots in the sea. Latitude and
// longitude would be no better, because the district cells are Voronoi cells
// grown from seed points rather than real boundaries, so there is no true
// projection to invert.
//
// What is used instead: the point the district's cell was grown from. It is
// already in the map's own coordinates, it is inside the cell by construction,
// and it is where the district is rather than where its cell happens to reach,
// which matters on the coast, where a cell runs out over the water and takes
// its own middle with it.
//
// Two of the forty seeds are not on land: a district on the harbour or at the
// end of the Cape has its centre where this simplified outline has already cut
// to water. Those fall back to the middle of the part of the cell that is drawn
// on land, which the cell and the coastline between them decide, so every
// marker is on land by construction rather than by inspection.

import { PHONE_FREE_LINEAGE as L } from "../bill-lineage";

/** The state, as the district map draws it: mainland and the two islands. */
export const MAP_OUTLINE = L.geo.outline;

/**
 * How much the drawing is flattened on the y axis.
 *
 * The district map is taller in proportion than the ballot question's, and in a
 * wide two-column row that reads tall: a column of state with a column of text
 * beside it. Flattened, it sits in the row rather than standing in it.
 *
 * This is a squash of the picture and not a projection of anything, so it has
 * to be visible as a decision rather than mistaken for a map that is slightly
 * wrong. A tenth would pass for a bad projection; a sixth would be a different
 * shape. This is the largest flattening the coastline still reads at.
 */
export const MAP_SQUASH = 0.85;

/**
 * The space the map is drawn in: the district map's own, flattened.
 *
 * The box comes with the squash so the drawing keeps all of its room. Scaling
 * inside an unchanged box would leave the state sitting in the top six sevenths
 * of a frame with a band of nothing under it.
 */
export const MAP_VIEWBOX = [
  L.geo.box[0],
  L.geo.box[1] * MAP_SQUASH,
  L.geo.box[2],
  L.geo.box[3] * MAP_SQUASH,
]
  .map((v) => Math.round(v * 1000) / 1000)
  .join(" ");

type Point = [number, number];

/**
 * The outline as polygons.
 *
 * The paths are straight lines only ("M x y L x y … Z"), which is what lets
 * this be a few lines rather than a path parser.
 */
const LAND: Point[][] = MAP_OUTLINE.map((d) =>
  d
    .split(/[MLZ]/)
    .filter((pair) => pair.trim())
    .map((pair) => {
      const [x, y] = pair
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      return [x, y] as Point;
    }),
);

/** A district cell, "x,y x,y …", as one polygon per ring. */
const cellOf = (seat: string): Point[][] | undefined => {
  // Either chamber, since a seat key is a seat whichever map is drawn.
  const rings = L.geo.senate[seat] ?? L.geo.house[seat];
  return rings?.map((ring) =>
    ring
      .trim()
      .split(/\s+/)
      .map((pair) => {
        const [x, y] = pair.split(",").map(Number);
        return [x, y] as Point;
      }),
  );
};

/** Ray casting, the standard even-odd test. */
function within([px, py]: Point, poly: Point[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      hit = !hit;
    }
  }
  return hit;
}

const inAny = (p: Point, polys: Point[][]) => polys.some((s) => within(p, s));

/**
 * How finely the district is sampled, per side of its bounding box.
 *
 * The overlap of two concave polygons is not something to clip exactly for a
 * dot: sampling a grid and averaging what lands inside both gets the same
 * answer to within a fraction of a district, for forty lines less code. At 48
 * the coarsest district still contributes dozens of samples.
 */
const GRID = 48;

/**
 * The middle of the district's land, in the map's coordinates.
 *
 * An average can fall outside the shape it averages when the shape wraps around
 * water, which a district on Buzzards Bay does. Where it does, the nearest
 * sampled point inside takes its place.
 */
function landCentre(seat: string): Point | undefined {
  const cell = cellOf(seat);
  if (!cell?.length) return undefined;

  const pts = cell.flat();
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);

  const inside: Point[] = [];
  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      const p: Point = [
        x0 + ((x1 - x0) * (i + 0.5)) / GRID,
        y0 + ((y1 - y0) * (j + 0.5)) / GRID,
      ];
      if (inAny(p, cell) && inAny(p, LAND)) inside.push(p);
    }
  }
  if (!inside.length) return undefined;

  const mean: Point = [
    inside.reduce((n, p) => n + p[0], 0) / inside.length,
    inside.reduce((n, p) => n + p[1], 0) / inside.length,
  ];
  if (inAny(mean, cell) && inAny(mean, LAND)) return mean;

  return inside.reduce((best, p) =>
    (p[0] - mean[0]) ** 2 + (p[1] - mean[1]) ** 2 <
    (best[0] - mean[0]) ** 2 + (best[1] - mean[1]) ** 2
      ? p
      : best,
  );
}

/** The seat's own point where the map draws land under it. */
function marker(seat: string): Point | undefined {
  const seed = L.geo.seeds[seat];
  if (seed && inAny(seed, LAND)) return seed;
  return landCentre(seat);
}

/** Worked out once per seat, since the geometry never changes. */
const CACHE = new Map<string, Point | undefined>();

/**
 * Where this seat's marker goes, or nothing for a seat the map has not got.
 *
 * Flattened here, in the coordinates the map is drawn in. The outline is path
 * data and can only be squashed by a transform on the group holding it; a
 * marker is a number, so it can be squashed where the number is made. That is
 * what keeps the dots round and the labels upright: the group that carries the
 * transform holds nothing but the coastline.
 */
export function seatPoint(seat: string): { x: number; y: number } | undefined {
  if (!CACHE.has(seat)) CACHE.set(seat, marker(seat));
  const p = CACHE.get(seat);
  return p && { x: p[0], y: p[1] * MAP_SQUASH };
}
