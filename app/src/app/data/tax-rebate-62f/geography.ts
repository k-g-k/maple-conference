// Where the individual accounts are filing from.
//
// The accounts already say where they live, in the second half of their
// descriptor ("Retired, Holyoke"). This file is the other half of that fact:
// where Holyoke is. Nothing here is derived from the testimony, so a new filer
// in a town already listed needs no change at all.
//
// Coordinates are projected into the outline's own viewBox rather than stored
// as latitude and longitude, because the outline is hand-simplified and true
// coordinates would land slightly off a shape that is itself approximate. The
// projection used was x = (lon + 73.55) / 3.65 * 1000 and
// y = (42.92 - lat) / 1.72 * 400, with a few points nudged inland where the
// simplified coast cuts across them.

/** The viewBox every path and point in this file is drawn in. */
export const MA_VIEWBOX = "0 0 1000 400";

/**
 * Massachusetts, simplified: the western rectangle, the North Shore, the
 * South Coast, the Cape with its hook, and the notch Rhode Island cuts out of
 * the southeast. Detailed enough to be recognised, not detailed enough to be
 * mistaken for a survey.
 */
export const MA_OUTLINE =
  "M11,40 L299,44 L526,49 L630,44 L718,12 L802,60 L760,100 L712,133 " +
  "L762,176 L795,226 L822,272 L959,267 L921,195 L907,205 L947,250 " +
  "L986,288 L863,307 L808,295 L806,279 L726,300 L644,279 L595,212 " +
  "L479,212 L479,202 L16,202 Z";

/** Martha's Vineyard and Nantucket, drawn but never filed from. */
export const MA_ISLANDS = [
  "M793,352 L838,345 L855,357 L836,370 L800,367 Z",
  "M928,375 L972,372 L975,384 L933,387 Z",
];

export interface Place {
  /** Matches the town named in a `PositionUser` descriptor, exactly. */
  city: string;
  x: number;
  y: number;
}

export const PLACES: Place[] = [
  { city: "Pittsfield", x: 82, y: 109 },
  { city: "Holyoke", x: 252, y: 168 },
  { city: "Springfield", x: 266, y: 191 },
  { city: "Worcester", x: 479, y: 153 },
  { city: "Framingham", x: 584, y: 149 },
  { city: "Lowell", x: 614, y: 67 },
  { city: "Cambridge", x: 663, y: 122 },
  { city: "Boston", x: 686, y: 134 },
  { city: "Fall River", x: 655, y: 284 },
  { city: "New Bedford", x: 714, y: 292 },
];

/** The town in "Retired, Holyoke", or undefined for an account without one. */
export function cityOf(descriptor: string): string | undefined {
  const tail = descriptor.split(",").pop()?.trim();
  return PLACES.some((p) => p.city === tail) ? tail : undefined;
}
