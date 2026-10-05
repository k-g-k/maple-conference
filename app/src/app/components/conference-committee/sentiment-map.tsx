// Where the input on a conference is coming from.
//
// One dot per person, not per district and not per area. A reader looking at
// this is asking two things at once, and only a scatter answers both: how much
// of the state is in it, and how much of it is in one place. A merged marker
// answers neither, because the merging decides the shape before the reader
// sees it.
//
// What is counted:
//
// Individuals only. An organization files once for twenty-two thousand members
// and has no address a reader would recognize; drawing it as one dot in one
// district would say something untrue about where support is.
//
// Co-signs included. A name on a letter is that person's own position, and the
// people who only ever sign are most of the public here. Without them this is
// the state drawn from the handful who wrote something.
//
// What the figure underneath says is reach, not totals. The bar below the
// filters already counts positions, and a second count here disagreed with it
// on sight because the two are measuring different populations. This says the
// thing no bar can: whether any of it came from a district with somebody in
// the room.

import { useMemo } from "react";

import {
  MAP_OUTLINE,
  MAP_SQUASH,
  MAP_VIEWBOX,
  seatCell,
  seatPoint,
} from "../../data/conference-committees/geography";
import {
  DEMO_ACCOUNTS,
  DEMO_SEATS,
} from "../../data/conference-committees/testimony";
import type { ConferenceSubmission } from "../../data/conference-committees/testimony";
import type { ConferencePosition } from "../../data/conference-committees/positions";

/** The dot colour per ask, the same four the chips and the bar wear. */
const FILL: Record<ConferencePosition, string> = {
  pass: "fill-positive",
  house: "fill-house",
  senate: "fill-official",
  none: "fill-negative",
};

/**
 * Where a dot sits inside its district.
 *
 * Scattered around the district's own point rather than stacked on it, so
 * twenty in one seat read as twenty. Worked out from the index rather than
 * from a random number, so the same input draws the same map every time: a
 * scatter that moved on every render would look like data changing.
 */
function spread(i: number, of: number) {
  if (of === 1) return { dx: 0, dy: 0 };
  // Points on a turn of the golden angle, which fills a disc evenly without
  // the rings a regular spiral leaves.
  const a = i * 2.39996;
  const r = 20 * Math.sqrt((i + 0.5) / of);
  return { dx: Math.cos(a) * r, dy: Math.sin(a) * r * MAP_SQUASH };
}

export function SentimentMap({
  items,
  conferees,
}: {
  items: ConferenceSubmission[];
  /** The six seats, for the ground that says somebody here is in the room. */
  conferees: string[];
}) {
  /**
   * One entry per person: a seat, and what they asked for.
   *
   * Every co-sign is an entry in the feed now, wordless ones included, so the
   * filings are the whole population. Nothing is added from a list of names
   * on the side.
   */
  const voices = useMemo(() => {
    const type = new Map(DEMO_ACCOUNTS.map((u) => [u.id, u.userType]));
    return items.flatMap((t) =>
      type.get(t.userId) === "individual" && DEMO_SEATS[t.userId]
        ? [{ seat: DEMO_SEATS[t.userId], position: t.position }]
        : [],
    );
  }, [items]);

  const dots = useMemo(
    () =>
      [...new Set(voices.map((v) => v.seat))].flatMap((seat) => {
        const point = seatPoint(seat);
        if (!point) return [];
        const here = voices.filter((v) => v.seat === seat);
        return here.map((v, i) => {
          const { dx, dy } = spread(i, here.length);
          return {
            key: `${seat}:${i}`,
            x: point.x + dx,
            y: point.y + dy,
            fill: FILL[v.position],
          };
        });
      }),
    [voices],
  );

  const inRoom = voices.filter((v) => conferees.includes(v.seat)).length;
  if (!voices.length) return null;

  return (
    // The card is drawn around the map and its line, not around the column
    // they sit in: at the page's width the block is a third of it, and a card
    // spanning the rest would be mostly empty.
    <div className="inline-block rounded-card border border-line bg-surface px-[16px] pt-[14px] pb-[12px]">
      <div className="w-[420px] max-w-full">
        <svg
          viewBox={MAP_VIEWBOX}
          role="img"
          aria-label={`Massachusetts, with a dot for each of ${voices.length} people who have weighed in`}
          className="w-full h-auto"
        >
          <g transform={`scale(1 ${MAP_SQUASH})`}>
            {/* Barely there. The state is the thing the dots are placed on,
                not a thing to read: at the weight the explorer's map uses it
                was the loudest shape on the card. */}
            {MAP_OUTLINE.map((d) => (
              <path key={d.slice(0, 24)} d={d} className="fill-wash" />
            ))}
            {/* The six, a shade up from the rest. Unlabelled and unedged:
                the question is whether a dot landed in one, and an outline
                would turn that into a map of districts. */}
            {conferees.flatMap((seat) => {
              const d = seatCell(seat);
              return d
                ? [<path key={seat} d={d} className="fill-wash-strong" />]
                : [];
            })}
          </g>
          {dots.map((d) => (
            <circle
              key={d.key}
              cx={d.x}
              cy={d.y}
              r={7}
              className={`${d.fill} opacity-80`}
            />
          ))}
        </svg>
      </div>
      {/* Reach, not totals. The bar under the filters counts positions, and a
          second count here would be read against it and lose. */}
      <p className="mt-[6px] font-body text-xs text-ink-mid">
        <span className="font-semibold text-ink">{voices.length}</span> people,{" "}
        <span className="font-semibold text-ink">{inRoom}</span> from a
        committee member&rsquo;s district
      </p>
    </div>
  );
}
