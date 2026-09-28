// Bill lineage: one chamber's route with this bill.
//
// Scoped to the chamber whose page it is. A House bill page shows the House's
// steps and its own conferees; the Senate's route is not explained here, it is
// linked to, so a reader who wants it lands on the Senate bill's own page and
// gets the whole thing rather than a summary written from across the aisle.
// A combined view belongs on the conference committee page, where the subject
// is the reconciliation rather than either bill.
//
// The conference is the one step both chambers share, and it stays, because it
// is where this bill actually is. Leaving it off would end the story at "passed
// the House" when the bill has moved on.
//
// The maps need saying out loud: each cell is one seat, grown from a seed
// point, so they are nothing like equal in size. A filled map overstates the
// rural seats and understates the city ones, and the caption says so.

import { Fragment, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Scale,
  Star,
} from "lucide-react";
import {
  PHONE_FREE_LINEAGE as L,
  type Provision,
  type RollCall,
  type Stage,
} from "../../data/bill-lineage";
import type { BillRecord } from "../../data/bills-194";
import {
  CONFEREES,
  HOUSE_EDUCATION,
  HOUSE_WAYS_AND_MEANS,
  type CommitteeMember,
} from "../../data/bill-lineage/committees";
import { MINE, MEMBER_BY_SEAT } from "../../data/bill-lineage/members";
import { EDUCATION_HEARING, hearingUrl } from "../../data/bill-lineage/hearing";
import {
  HOUSE_EARLY_STAGES,
  HOUSE_ORIGINS,
  VEHICLE_SWAP_BEFORE,
} from "../../data/bill-lineage/house-branch";
import { Chapter, Span, Disclosure } from "./spine";

// Purple is the AI provenance colour on these pages, so a chamber cannot wear
// it. The conference takes the brand navy: blue, like the Senate's, but darker,
// so the two are not mistaken for each other.
export const CHAMBER_INK: Record<string, string> = {
  Senate: "text-official-ink",
  House: "text-user-ink",
  Conference: "text-brand",
};

/**
 * What kind of step it was, for the line under the date.
 *
 * A vote is read off the roll calls, so only the steps that are neither a vote
 * nor the current one need naming here. "New draft" is the legislature's own
 * phrase, out of "Accompanied a new draft, see H4745".
 */
const KIND: Record<string, string> = {
  filed: "filed",
  "h-filed": "filed",
  // Short for the committee's own first action on each of these drafts,
  // "Reported from the committee on Education".
  s2549: "reported",
  s2561: "floor amendments",
  h4745: "reported",
  h5349: "new draft",
};

/**
 * The office, said as shortly as it can be without changing what it is.
 *
 * The stored role carries the chamber ("House Chair") because the committee
 * names it that way, but the page is already one chamber's, so repeating it
 * under every portrait would be noise.
 */
/**
 * The centre of a cell, in the map's own coordinates.
 *
 * Averaging the corners would pull toward whichever edge has the most of them,
 * and Voronoi cells are lopsided that way, so this is the area centroid: the
 * point the shape balances on. It is where the card wants to point.
 */
function centroid(points: string): [number, number] {
  const pts = points
    .trim()
    .split(/\s+/)
    .map((p) => p.split(",").map(Number) as [number, number]);
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    const cross = x0 * y1 - x1 * y0;
    a += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  // A degenerate cell has no area to balance on, so fall back to the corners.
  if (a === 0) {
    const n = pts.length;
    return [
      pts.reduce((t, q) => t + q[0], 0) / n,
      pts.reduce((t, q) => t + q[1], 0) / n,
    ];
  }
  return [cx / (3 * a), cy / (3 * a)];
}

/** Who a seat is, as much of it as the step happens to know. */
interface SeatCard {
  name: string;
  district: string;
  party: string;
  portrait?: string;
  /** An office, where the member holds one. Most do not. */
  title?: string;
}

/**
 * First initial and surname. The legislature refers to its members by surname,
 * and the initial is what keeps two Morans or two Lewises apart without
 * spending a whole given name on it.
 */
const SUFFIX = /^(jr|sr|ii|iii|iv)\.?$/i;

const surname = (name: string) => {
  const parts = name.replace(/,/g, "").split(" ").filter(Boolean);
  let last = parts[parts.length - 1];
  let suffix = "";
  // "Bradley H. Jones, Jr." ends in the suffix, not the surname. Taking the
  // last word gave "B. Jr.", which names nobody.
  if (SUFFIX.test(last) && parts.length > 2) {
    suffix = `, ${last}`;
    last = parts[parts.length - 2];
  }
  return `${parts[0][0]}. ${last}${suffix}`;
};

/**
 * A leadership title, short enough to sit beside a name.
 *
 * The General Court writes these out in full ("Second Assistant Majority
 * Leader" is thirty-two characters), which pushes the name onto a second line
 * and clips the title on the first. Four rules, applied to every title rather
 * than to particular ones, so this keeps working for any bill's lineage:
 *
 *   The chamber goes, because the page is already one chamber's and "House
 *   Ways and Means Chair" says House twice.
 *
 *   "Speaker of the House" is just the Speaker, and the same for the Senate
 *   President. There is only one of each.
 *
 *   Ordinals become figures, and "Pro Tempore" becomes "Pro Tem".
 *
 *   Assistant, Majority and Minority abbreviate only in the titles that carry
 *   "Assistant", which are the long ones. A bare "Majority Leader" fits and
 *   reads better spelled out, so it stays.
 *
 * Longest result is "1st Asst. Min. Leader", down from thirty-two characters.
 */
const shortTitle = (role: string) => {
  const r = role
    .replace(/^(House|Senate) /, "")
    .replace(/^Speaker of the House$/, "Speaker")
    .replace(/^President of the Senate$/, "President")
    .replace("Pro Tempore", "Pro Tem")
    .replace(/^First /, "1st ")
    .replace(/^Second /, "2nd ")
    .replace(/^Third /, "3rd ")
    .replace(/^Fourth /, "4th ");
  return r.includes("Assistant")
    ? r
        .replace("Assistant", "Asst.")
        .replace("Majority", "Maj.")
        .replace("Minority", "Min.")
    : r;
};

const office = (role: string) =>
  role
    .replace(/^(House|Senate) /, "")
    // The only title long enough to drive the line width, and the only word in
    // any of them that abbreviates without losing what it says.
    .replace(/^Assistant /, "Asst. ")
    .replace(/^(.)(.*)$/, (_, a: string, b: string) => a + b.toLowerCase());

function SubHead({ title, note }: { title: string; note?: string }) {
  return (
    <>
      <h3 className="font-display font-medium text-xl text-ink mb-[4px]">
        {title}
      </h3>
      {note && (
        <p className="font-body text-sm text-ink-muted mb-[14px] max-w-[74ch]">
          {note}
        </p>
      )}
      {!note && <div className="mb-[12px]" />}
    </>
  );
}

// ── The chain ─────────────────────────────────────────────────────────────

/**
 * A break in the strip, drawn rather than left to be noticed.
 *
 * Two things earn one. Where the bill is now is a different kind of fact from
 * how it got there, so the current step is cut off from the history behind it.
 * And everywhere else in this chain one document becomes the next, except at
 * the vehicle swap, where the House dropped its own bill and picked up the
 * Senate's.
 */
function Break({ label }: { label: string }) {
  return (
    // Padding on the left only. On the right the strip's own gap already
    // supplies the same space, so padding there was a second helping of it.
    // Twelve matches what the gap and the clearance margin come to on the other
    // side, so the line sits centred in its break rather than shoved left.
    // No spacing of its own. Every place it is used sits it in a flex row whose
    // gap already separates it from its neighbours, so padding here would be a
    // second helping on one side and not the other, which is exactly how the
    // two breaks ended up different widths.
    <span className="flex flex-col items-center justify-center shrink-0">
      <span
        aria-hidden
        className="w-px flex-1 border-l border-dashed border-line-strong"
      />
      <span className="font-body text-2xs uppercase tracking-[0.08em] text-ink-faint py-[6px] [writing-mode:vertical-rl] rotate-180">
        {label}
      </span>
      <span
        aria-hidden
        className="w-px flex-1 border-l border-dashed border-line-strong"
      />
    </span>
  );
}

/** One step in the chain. */
function StageCard({
  s,
  on,
  now,
  onPick,
}: {
  s: Stage;
  on: boolean;
  now: boolean;
  onPick: (id: string) => void;
}) {
  const votable = Boolean(L.votes[s.id]);
  return (
    <button
      onClick={() => onPick(s.id)}
      aria-pressed={on}
      className={`w-[168px] h-full text-left rounded-card border px-[14px] py-[12px] transition-colors cursor-pointer ${
        // The active card is the one on paper; the rest sit back into the page.
        // That is the whole of what the strip has to say at a glance, so it is
        // the only thing the colour does.
        on ? "border-brand bg-surface" : "border-line bg-wash hover:bg-surface"
      }`}
    >
      <p
        className={`font-body font-semibold text-2xs uppercase tracking-[0.08em] ${CHAMBER_INK[s.chamber] ?? "text-ink-muted"}`}
      >
        {s.chamber}
      </p>
      <p className="font-display font-medium text-lg text-ink mt-[6px] leading-[1.2]">
        {s.label}
      </p>
      <p className="font-body text-xs text-ink-muted mt-[4px]">{s.date}</p>
      {/* The eyebrow already names the chamber, so this says only what kind of
          step it was. "Roll call" was the clerk's word for it. */}
      <p className="font-body text-xs text-ink-faint mt-[8px]">
        {now ? "where it is now" : votable ? "vote" : (KIND[s.id] ?? "")}
      </p>
    </button>
  );
}

/**
 * One chamber's half of the conference, to stand beside that chamber's map.
 *
 * Split rather than listed together because the maps are split: three names
 * beside the map they belong to answers "who are those three cells" without the
 * reader carrying an answer across the page.
 */
export function Conferees({
  ch,
  showing,
  onHover,
  onPin,
  people = CONFEREES,
}: {
  ch: "S" | "H";
  /** Every seat being read, so this list can answer the map. */
  showing: string[];
  onHover: (key: string | null) => void;
  onPin: (key: string) => void;
  /** Whose conference. Defaults to the one this bill went to. */
  people?: CommitteeMember[];
}) {
  return (
    <div className="shrink-0">
      <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-muted mb-[10px]">
        {ch === "S" ? "Senate" : "House"}
      </p>
      <ul className="flex flex-col gap-[10px]">
        {people
          .filter((m) => m.key.startsWith("S:") === (ch === "S"))
          .map((m) => (
            <li key={m.code}>
              <button
                type="button"
                onPointerEnter={() => onHover(m.key)}
                onPointerLeave={() => onHover(null)}
                onFocus={() => onHover(m.key)}
                onBlur={() => onHover(null)}
                onClick={() => onPin(m.key)}
                className="flex items-center gap-[10px] text-left cursor-pointer"
              >
                <span className="relative shrink-0">
                  <img
                    src={m.portrait}
                    alt=""
                    className={`block w-[36px] h-[36px] rounded-full object-cover bg-sunken border-[3px] transition-[box-shadow] ${
                      m.party === "R" ? "border-negative" : "border-official"
                    } ${
                      showing.includes(m.key)
                        ? "ring-2 ring-ink ring-offset-2 ring-offset-ground"
                        : ""
                    }`}
                  />
                  {/* On the portrait rather than beside the name: the face is
                      what a reader scans down this column, and the star has to
                      be on the thing being scanned. */}
                  {MINE[m.key] && (
                    <span
                      title={MINE[m.key]}
                      className="absolute -bottom-[2px] -right-[2px] w-[16px] h-[16px] rounded-full bg-ground flex items-center justify-center"
                    >
                      <Star
                        aria-label={MINE[m.key]}
                        className="w-[11px] h-[11px] text-caution fill-caution"
                      />
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block leading-[1.3] whitespace-nowrap">
                    <span className="font-body font-semibold text-sm text-ink">
                      {surname(m.name)}
                    </span>
                    {m.role && (
                      <span className="ml-[6px] font-body text-xs text-caution-ink">
                        {office(m.role).toLowerCase()}
                      </span>
                    )}
                  </span>
                  <span className="block font-body text-xs text-ink-muted leading-[1.4]">
                    {m.district}
                  </span>
                </span>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}

function Stages({
  stages,
  active,
  onPick,
}: {
  stages: Stage[];
  active: string;
  onPick: (id: string) => void;
}) {
  // Where the bill is now sits outside the scroller, not pinned inside it.
  //
  // Sticky was the wrong tool: it left the current card on a raised layer
  // sharing a row with the cards scrolling past, so the two were always
  // arguing over the pixels where their boxes met and the raised one won,
  // squaring off the corners of the card beside it. Lifting it out of the
  // scroll container removes the argument rather than tuning it. The history
  // now scrolls in its own box and is clipped by that box's own edge, which is
  // what a scroll container is for.
  const current = stages[stages.length - 1];
  const history = [...stages.slice(0, -1)].reverse();

  // The fade at the right edge stands in for the hidden scrollbar, so it has to
  // mean what a scrollbar would: there is more this way. Left on at the end of
  // the strip it says the opposite, and dims a card for no reason.
  const rail = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const update = () =>
      setMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    update();
    el.addEventListener("scroll", update, { passive: true });
    // Resizing changes the answer without anything scrolling, and so does the
    // rail opening beside it.
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [stages]);

  return (
    <div className="flex items-stretch">
      {/* The same 10px the strip uses between cards, so the break is spaced
              the same here as it is inside the list. */}
      <div className="shrink-0 flex items-stretch gap-[10px]">
        <StageCard s={current} on={current.id === active} now onPick={onPick} />
        {history.length > 0 && <Break label="current" />}
      </div>

      {/* Horizontal and scrollable: the sequence is the point, so it stays one
              line at any width rather than reflowing into a grid that loses the
              order. The scrollbar is hidden, so the fade at the right edge is what
              says there is more. */}
      <div
        ref={rail}
        className={`ml-[10px] min-w-0 flex-1 overflow-x-auto scrollbar-hide ${
          more
            ? "[mask-image:linear-gradient(to_right,black_calc(100%-40px),transparent)]"
            : ""
        }`}
      >
        <ol className="flex items-stretch gap-[10px] min-w-max">
          {history.map((s) => (
            <Fragment key={s.id}>
              <li className="flex items-stretch">
                <StageCard
                  s={s}
                  on={s.id === active}
                  now={false}
                  onPick={onPick}
                />
              </li>
              {/* Its own item, so the strip's gap falls on both sides of it.
                      Inside a card's item the gap landed on one side only, which
                      is what made this break wider than the other one. Newest
                      first, so it sits after this card rather than before. */}
              {s.id === VEHICLE_SWAP_BEFORE && (
                <li aria-hidden className="flex items-stretch">
                  <Break label="new bill" />
                </li>
              )}
            </Fragment>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ── The maps ──────────────────────────────────────────────────────────────

/**
 * Two palettes, deliberately unmixed.
 *
 *   Blue and red mean party, and nothing else.
 *   Green and brick mean how someone voted.
 *
 * The two never appear on one map: a roll call colours by vote, anything else
 * colours by party. They stay separate palettes anyway, so a reader moving
 * between steps is never asked to work out which meaning a colour is carrying.
 */
/** The same two palettes as values, for the fill and its edge. */
const PARTY_COLOR: Record<string, string> = {
  D: "var(--color-official)",
  R: "var(--color-negative)",
  U: "var(--color-ink-faint)",
  X: "var(--color-ink-faint)",
};
const VOTE_COLOR: Record<string, string> = {
  Y: "var(--color-yea)",
  N: "var(--color-nay)",
};

/**
 * One chamber, one cell per seat.
 *
 * Two things a cell can be showing, and the stage decides which:
 *
 *   A roll call colours every seat by how that member voted.
 *   Anything else colours only the people the stage is about, by party, and
 *   leaves the rest of the chamber blank. That is what makes the conference
 *   step legible: three cells lit in a chamber of a hundred and sixty says how
 *   few people are in the room better than any sentence.
 *
 * The cells are nothing like equal in size, so a filled map overstates rural
 * seats and understates city ones. That is the trade for reading a chamber's
 * split at a glance, and the caption says so.
 */
export function VoteMap({
  chamber,
  roll,
  highlight,
  selected = [],
  enlarged,
  onHover,
  onPin,
  people,
  className,
  dim = true,
  label,
  fit = false,
}: {
  chamber: "house" | "senate";
  roll?: RollCall;
  /** Seat keys to fill by party, when there is no roll call to show. */
  highlight?: string[];
  /** Every seat currently being read: the page showing, plus any hover. */
  selected?: string[];
  /**
   * Which of those get the thick edge. Separate from `selected` because the
   * two say different things now: a page of six is all equally the subject and
   * sits at full strength, while the one under the pointer is the only one
   * worth growing. Left out, the old rule applies and every lit selected seat
   * is drawn thick.
   */
  enlarged?: string[];
  /** Given, the lit seats become the way to read the rest of the committee. */
  onHover?: (key: string | null) => void;
  onPin?: (key: string) => void;
  /** Who each seat is, for the card that opens over the map. */
  people?: Record<string, SeatCard>;
  /** Room for the map, since a lone map given a whole column reads as a hero. */
  className?: string;
  /**
   * Scale to the height available rather than to the width.
   *
   * `w-full h-auto` ties the map's height to its width, so it can never match
   * the height of the column beside it. Fitting lets it grow into whatever room
   * is there and stop, with its own width cap still the ceiling.
   */
  fit?: boolean;
  /**
   * Whether the unchosen seats sit back at partial opacity. Off where all the
   * lit seats are equally the subject, so bringing one forward would say the
   * others had receded.
   */
  dim?: boolean;
  /**
   * What the lit seats are, where naming them says more than naming the
   * chamber. The count stays either way.
   */
  label?: string;
}) {
  const cells = L.geo[chamber];
  const [x, y, w, h] = L.geo.box;
  const seats = Object.keys(cells).length;
  const live = roll && roll.ch === (chamber === "house" ? "H" : "S");
  const lit = new Set(highlight ?? []);
  // Cells are grown from seed points, so they tile the whole bounding
  // rectangle rather than the state. Clipping them to the coastline is what
  // makes the map Massachusetts instead of a grid of tiles.
  const clip = `ma-clip-${chamber}`;
  // Counted against this chamber's own seats: on the conference step both maps
  // are drawn and the highlight list holds keys from both.
  const shown = live
    ? Object.keys(roll.votes).filter((k) => k in cells).length
    : lit.size
      ? [...lit].filter((k) => k in cells).length
      : null;

  // Which seat is being read, and its shape, when this map is the one holding
  // it: on the conference step both maps are drawn and a Senate key means
  // nothing to the House.
  const sel = new Set(selected);
  // Only the ones this map actually holds: on the conference step both maps
  // are drawn and a Senate key means nothing to the House.
  const mine = selected.filter((k) => k in cells);
  // The edge that marks the chosen seat, in whatever colour that seat already
  // is. Opacity alone will not carry it: a seat recorded as neither yea nor
  // nay is drawn in faint grey, and taking faint grey to full grey is
  // invisible.
  const edgeFor = (key: string) => {
    const vote = live ? roll.votes[key] : undefined;
    if (vote) return VOTE_COLOR[vote] ?? "var(--color-ink)";
    const party = L.seats[key]?.p;
    return party === "R"
      ? "var(--color-negative)"
      : party === "D"
        ? "var(--color-official)"
        : "var(--color-ink-faint)";
  };

  return (
    <div
      className={`${fit ? "@[840px]:flex @[840px]:flex-col" : ""} ${className ?? ""}`}
    >
      {/* How much of the chamber this step involved, rather than how big the
              chamber is. Three of a hundred and sixty is the fact the map is
              making, and the label should not leave it to be counted off the
              picture. On a roll call the number is how many votes were recorded,
              which is rarely the whole chamber. */}
      <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-muted mb-[8px]">
        {label ?? (chamber === "house" ? "House" : "Senate")} ·{" "}
        {shown === null ? seats : `${shown} of ${seats}`}
      </p>
      <div
        className={`relative ${fit ? "@[840px]:flex-1 @[840px]:min-h-0" : ""}`}
      >
        <svg
          viewBox={`${x} ${y} ${w} ${h}`}
          // Out of flow when fitting. In flow, an SVG still reports its own
          // intrinsic height, so it grew the row it was meant to be fitting
          // into and then filled the row it had grown. Absolute, it contributes
          // no height and can only take what the column beside it allows.
          className={
            fit
              ? "w-full h-auto @[840px]:absolute @[840px]:inset-0 @[840px]:h-full"
              : "w-full h-auto"
          }
        >
          <defs>
            <clipPath id={clip}>
              {L.geo.outline.map((d) => (
                <path key={d.slice(0, 24)} d={d} />
              ))}
            </clipPath>
          </defs>
          {/* The coastline under the cells, so any sliver a cell does not reach
                still reads as land rather than as a hole. */}
          {L.geo.outline.map((d) => (
            <path key={d.slice(0, 24)} d={d} className="fill-sunken" />
          ))}
          <g clipPath={`url(#${clip})`}>
            {Object.entries(cells).map(([key, pts]) => {
              const vote = live ? roll?.votes[key] : undefined;
              const party = lit.has(key) ? L.seats[key]?.p : undefined;
              // Only the lit seats do anything. On a step about a committee they
              // are the committee, so the map stops being a picture of who was in
              // the room and becomes the way to read who.
              //
              // Hovering reads a seat, clicking keeps it. Sweeping the map is how
              // you find someone; pinning is how you hold onto them long enough
              // to follow the link out.
              const can = Boolean(onPin) && Boolean(people?.[key]);
              // Every coloured seat sits back at partial opacity, and the one
              // being read comes forward to full. The colour never changes, so
              // a seat cannot be mistaken for a different vote or a different
              // party on the way past.
              const coloured = Boolean(vote || party);
              // The fill carries the transparency; the edge does not. Drawn in
              // the cell's own colour at full strength, it keeps one seat
              // distinct from the next without a white hairline cutting across
              // the map.
              const colour = vote
                ? (VOTE_COLOR[vote] ?? "var(--color-ink-faint)")
                : party
                  ? (PARTY_COLOR[party] ?? "var(--color-ink-faint)")
                  : "var(--color-sunken)";
              return (
                <polygon
                  key={key}
                  points={Array.isArray(pts) ? pts[0] : pts}
                  className={`[transition:fill-opacity_120ms_ease] ${
                    can ? "cursor-pointer outline-none" : ""
                  }`}
                  fill={colour}
                  fillOpacity={dim && coloured && !sel.has(key) ? 0.45 : 1}
                  // One edge colour for every seat, lit or not, so the grid of
                  // districts reads as a single surface. The seat being read is
                  // the only one that takes its own colour, which is what makes
                  // it findable.
                  stroke={sel.has(key) ? colour : "var(--color-ground)"}
                  strokeWidth={1.2}
                  vectorEffect="non-scaling-stroke"
                  {...(can && {
                    role: "button",
                    tabIndex: 0,
                    "aria-pressed": sel.has(key),
                    "aria-label": L.seats[key]?.n ?? key,
                    onPointerEnter: () => onHover?.(key),
                    onPointerLeave: () => onHover?.(null),
                    // Keyboard has no hover, so focus stands in for it.
                    onFocus: () => onHover?.(key),
                    onBlur: () => onHover?.(null),
                    onClick: () => onPin?.(key),
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onPin?.(key);
                      }
                    },
                  })}
                />
              );
            })}
            {/* Drawn last so no later cell paints over them. Outline only:
                    the fill underneath is already at full opacity. */}
            {/* Only where a few seats are lit in a mostly empty chamber. On a
                    roll call every seat is filled, so an edge that grows past the
                    white separators reads as one cell swallowing its neighbours;
                    there the chosen seat is marked by taking the separator's own
                    colour instead. */}
            {(enlarged ?? (live ? [] : mine.filter((k) => lit.has(k))))
              .filter((k) => k in cells)
              .map((k) => {
                const pts = cells[k];
                return (
                  <polygon
                    key={k}
                    points={Array.isArray(pts) ? pts[0] : pts}
                    fill="none"
                    stroke={edgeFor(k)}
                    strokeWidth={5}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                );
              })}
          </g>
          {/* The coastline again on top, as a hairline, so the state has an edge
                of its own rather than ending wherever the cells happen to. */}
          {L.geo.outline.map((d) => (
            <path
              key={d.slice(0, 24)}
              d={d}
              fill="none"
              stroke="var(--color-line-strong)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── What survived ─────────────────────────────────────────────────────────

function ProvisionRow({ p }: { p: Provision }) {
  return (
    <li className="py-[14px] border-b border-line last:border-0">
      <div className="flex items-start gap-[12px]">
        <span
          className={`shrink-0 font-body font-semibold text-2xs uppercase tracking-[0.08em] px-[8px] py-[2px] rounded-pill border ${
            p.s === "kept"
              ? "bg-positive-soft border-positive text-positive-ink"
              : "bg-caution-soft border-caution text-caution-ink"
          }`}
        >
          {p.s}
        </span>
        <div className="min-w-0">
          <p className="font-body text-base text-ink leading-[1.5]">{p.t}</p>
          <p className="font-body text-sm text-ink-muted mt-[4px]">
            {p.from.length ? (
              <>
                traced to{" "}
                <span className="font-semibold text-ink">
                  {p.from.join(", ")}
                </span>
              </>
            ) : (
              "no single originating bill"
            )}
            {/* How solid the trace is, said on the row rather than in a note
                    at the bottom. "Inferred" is doing real work here: it marks a
                    judgement rather than a record. */}
            <span
              className={`ml-[8px] font-semibold text-2xs uppercase tracking-[0.08em] ${
                p.conf === "documented" ? "text-ink-muted" : "text-user-ink"
              }`}
            >
              {p.conf}
            </span>
          </p>
          <p className="font-body text-sm text-ink-muted leading-[1.6] mt-[6px] max-w-[74ch]">
            {p.why}
          </p>
        </div>
      </div>
    </li>
  );
}

// ── The chapter ───────────────────────────────────────────────────────────

/**
 * Where a step took its text from, when that is another chamber's bill.
 *
 * A link rather than a card. This page is one chamber's lineage; the other
 * chamber's belongs on the other chamber's page, and a reader who wants it can
 * go there. Anything more would be a House page explaining the Senate.
 */
const STAGE_SOURCE: Record<
  string,
  { number: string; what: string; href?: string }
> = {
  h5349: {
    number: "S.2581",
    what: "the Senate bill whose text this replaced",
  },
  // The same committee reported the Senate's seven bills as their own draft
  // four months earlier. That is the fact that makes this step legible: the
  // House draft was not the committee's only output, and it was not the one
  // that survived. Out to the General Court, since S.2549 has no page here.
  h4745: {
    number: "S.2549",
    what: "the Senate draft the same committee reported",
    href: "https://malegislature.gov/Bills/194/S2549",
  },
  // The hearing, on the step where the bills were filed rather than on a step
  // of its own. Both chambers' filings were heard in one afternoon, so the same
  // link sits on each route.
  //
  // It is also the only one. Joint Rule 1B requires a hearing on every matter
  // referred to a joint standing committee, and this chain got exactly that
  // one: every step after it happened on the floor, where no testimony is
  // taken.
  "h-filed": {
    number: "17 June 2025",
    what: "the hearing where all six were heard",
    href: hearingUrl(EDUCATION_HEARING.eventId),
  },
  filed: {
    number: "17 June 2025",
    what: "the hearing where all seven were heard",
    href: hearingUrl(EDUCATION_HEARING.eventId),
  },
};

/**
 * Which bills this lineage belongs to.
 *
 * One chain has been traced: the phone-free schools bill, whose two halves are
 * S.2581 in the Senate and H.5366 in the House. Every other bill on this
 * prototype gets the same section saying it has not been traced, rather than
 * the wrong bill's history under its own number.
 */
const TRACED = new Set(["H.5366", "S.2581"]);

export function BillLineageSection({
  bill,
  active,
  onActive,
}: {
  bill: BillRecord;
  /** The chosen step, held by the page so the text viewer can share it. */
  active: string;
  onActive: (id: string) => void;
}) {
  if (!TRACED.has(bill.number)) {
    return (
      <Chapter
        id="lineage"
        question="How did it get here?"
        answer={
          <Span>
            <p className="font-body text-sm text-ink-muted leading-[1.65] max-w-[74ch]">
              This bill&rsquo;s route has not been traced yet. Tracing one means
              following its text back through every draft and amendment it came
              out of, which the legislature&rsquo;s own record does not do for
              you.
            </p>
          </Span>
        }
      />
    );
  }
  return <TracedLineage bill={bill} active={active} onActive={onActive} />;
}

/**
 * How many members the panel shows at once.
 *
 * Six is what fits the panel stacked without it becoming the tallest thing on
 * the card. It also changes what the map is saying: a page of six is six people
 * equally the subject, so they all sit at full strength and none is singled
 * out until the pointer picks one.
 */
const PAGE = 6;

function TracedLineage({
  bill,
  active,
  onActive,
}: {
  bill: BillRecord;
  active: string;
  onActive: (id: string) => void;
}) {
  const chamber: "House" | "Senate" = bill.number.startsWith("H")
    ? "House"
    : "Senate";
  // One chamber's route, not both. The conference is the exception: it is the
  // step this bill is actually at, and leaving it off would end the story at
  // "passed the House" when the bill has moved on.
  const own = L.stages.filter(
    (s) => s.chamber === chamber || s.chamber === "Conference",
  );
  // The House's route starts with its own six bills and its own merged draft,
  // which the prototype left out entirely. Without them the chain opens on
  // "Ways and Means struck everything" and never says what they struck it for.
  const stages = chamber === "House" ? [...HOUSE_EARLY_STAGES, ...own] : own;

  // Which page the panel is on, and which name the pointer is over. Both reset
  // on a new step, because the roster changes with it.
  const [page, setPage] = useState(0);
  // The conference and the filings carry their own lists and no roster to page
  // through, so on those two steps the map still follows one chosen entry.
  const [picked, setPicked] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const stage = stages.find((s) => s.id === active) ?? stages[0];
  const roll = L.votes[active];
  const source = STAGE_SOURCE[stage.id];
  // The conference is the one step that is genuinely both chambers': six people
  // in one room, three from each. Showing only this chamber's three would be
  // describing half a committee, so this is the exception to the page keeping
  // to its own side.
  // The conference is the one step that is genuinely both chambers': six people
  // in one room, three from each. It is the only place language crosses the
  // aisle. A joint committee does not: it reports each chamber's own filings
  // back into that chamber as a separate draft, which is why the Education step
  // is a House step even though senators sit on the committee.
  const joint = stage.id === "conf";
  // Each step has an actor, and naming the wrong one would be worse than naming
  // none. Education merged the six House bills into H.4745; Ways and Means is
  // where that draft stopped and where the Senate's text was replaced instead.
  const committee: {
    name: string;
    label: string;
    members: CommitteeMember[];
  } | null =
    chamber !== "House"
      ? null
      : stage.id === "h4745"
        ? {
            name: "Joint Committee on Education",
            label: `Joint Committee on Education · ${HOUSE_EDUCATION.length} House members`,
            members: HOUSE_EDUCATION,
          }
        : stage.id === "h5349"
          ? {
              name: "House Ways and Means",
              label: `House Ways and Means · ${HOUSE_WAYS_AND_MEANS.length} members`,
              members: HOUSE_WAYS_AND_MEANS,
            }
          : null;
  // Who each lit seat is, for the card that opens over the map. Only the
  // committee steps have portraits on file, so only they get a card; a roll
  // call lights every seat in the chamber and we have faces for none of them.
  const people: Record<string, SeatCard> | undefined = committee
    ? Object.fromEntries(
        committee.members.map((m) => [
          m.key,
          {
            name: surname(m.name),
            district: m.district,
            party: m.party,
            portrait: m.portrait,
            title: m.role,
          },
        ]),
      )
    : stage.id === "conf"
      ? Object.fromEntries(
          CONFEREES.map((m) => [
            m.key,
            {
              name: surname(m.name),
              district: m.district,
              party: m.party,
              portrait: m.portrait,
              title: m.role,
            },
          ]),
        )
      : stage.id === "h-filed"
        ? Object.fromEntries(
            HOUSE_ORIGINS.map((o) => [
              o.key,
              {
                name: surname(o.sponsor),
                district: o.district,
                party: o.party,
                portrait: o.portrait,
                title: o.num,
              },
            ]),
          )
        : roll
          ? // A roll call colours every seat, so every seat answers for itself.
            Object.fromEntries(
              Object.entries(L.seats).map(([k, v]) => [
                k,
                {
                  // The seat list holds surnames only, so the full name
                  // comes from the members data and the initial from that.
                  name: MEMBER_BY_SEAT[k]
                    ? surname(MEMBER_BY_SEAT[k].name)
                    : v.n,
                  district: v.d,
                  party: v.p,
                  portrait: MEMBER_BY_SEAT[k]?.portrait,
                  title: MEMBER_BY_SEAT[k]?.title,
                },
              ]),
            )
          : undefined;
  /**
   * Rank first, then alphabetical.
   *
   * Rank is the order the body itself puts its members in, which for every
   * committee here is its officers and then everyone else. A member with no
   * place in that order still outranks one with no office at all, so a chamber
   * leader sorts above a back-bencher on a roll call, where there is no
   * committee list to sort against.
   */
  const order = committee?.members.map((m) => m.key) ?? [];
  const rankOf = (key: string) => {
    const i = order.indexOf(key);
    if (i >= 0) return i;
    return people?.[key]?.title ? 500 : 1000;
  };
  /** One seat, as much as the step knows about it. */
  const readSeat = (key: string) => {
    const seat = L.seats[key];
    return {
      key,
      seat,
      // Three House seats are empty, which is the whole of the gap between
      // 157 votes cast and 160 seats.
      vacant: seat?.p === "X" || seat?.n === "vacant",
      card: people?.[key],
      vote: roll ? roll.votes[key] : undefined,
    };
  };
  // Everyone the panel can show: the committee on a committee step, the whole
  // voting chamber on a roll call.
  const rotatable: string[] = committee
    ? committee.members.map((m) => m.key)
    : roll
      ? Object.entries(L.seats)
          .filter(([, v]) => v.c === roll.ch)
          .sort((a, b) => a[1].n.localeCompare(b[1].n))
          .map(([k]) => k)
      : [];
  /**
   * Leadership first, then alphabetical.
   *
   * On a committee step the body's own order already is that: its officers,
   * then the rest by surname. On a roll call there is no such list, so rank
   * falls back to whether the General Court records an office at all, and a
   * chamber leader sorts above a back-bencher.
   */
  const ordered = [...rotatable].sort(
    (a, b) =>
      rankOf(a) - rankOf(b) ||
      (people?.[a]?.name ?? "").localeCompare(people?.[b]?.name ?? ""),
  );
  /**
   * Committees page six at a time; votes rotate one at a time.
   *
   * A committee is a list, short enough to read down, so the panel shows it as
   * one. A roll call is the whole chamber: there is no list to read, so paging
   * through 160 members six at a time would be a phone book. There the panel
   * offers one member at random and the arrows walk the alphabet, which is
   * what it did before and what the map's own rotation does elsewhere.
   *
   * Keyed on whether the step has a committee, not on which step it is, so it
   * holds for any bill's lineage.
   */
  const paged = Boolean(committee);
  const pageCount = Math.max(1, Math.ceil(ordered.length / PAGE));
  const onPage = Math.min(page, pageCount - 1);
  const solo = hovered ?? picked;
  const shownKeys = paged
    ? ordered.slice(onPage * PAGE, onPage * PAGE + PAGE)
    : solo
      ? [solo]
      : [];

  // A new step clears both. A committee opens on its first page, which is its
  // own order. A vote opens on somebody, chosen at random: an empty panel asks
  // the reader to discover that the map is pointable, and a fixed default would
  // say that member mattered more than the rest.
  //
  // Keyed to the step as well as its roster: the three roll calls share one
  // chamber and so one roster, and keying on the roster alone left the same
  // member seated as a reader moved between them.
  /**
   * Whether the office sits under the name rather than beside it.
   *
   * All or nothing across the page. One office wrapping while its neighbours
   * stay inline gives six cells three different shapes, which reads as a
   * mistake; moving them together reads as a layout. Decided on length rather
   * than by asking the browser, because the answer has to be the same for all
   * six before any of them is drawn.
   */
  const officeBelow =
    paged &&
    shownKeys.some((k) => {
      const t = people?.[k]?.title;
      return t ? shortTitle(t).length > 12 : false;
    });

  const roster = rotatable.join(",");
  useEffect(() => {
    const keys = roster ? roster.split(",") : [];
    setHovered(null);
    setPage(0);
    setPicked(
      committee || !keys.length
        ? null
        : keys[Math.floor(Math.random() * keys.length)],
    );
    // `committee` is derived from the step, so `active` already covers it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, roster]);

  // Both arrows are always there and both wrap around, so the panel never
  // presents a dead control. There is nothing to step through when a roster
  // fits on one page.
  const canStep = paged ? pageCount > 1 : rotatable.length > 0;

  const step = (dir: 1 | -1) => {
    setHovered(null);
    if (paged) {
      if (pageCount > 1) setPage((onPage + dir + pageCount) % pageCount);
      return;
    }
    if (!rotatable.length) return;
    const i = picked ? rotatable.indexOf(picked) : -1;
    const next =
      i < 0
        ? dir === 1
          ? 0
          : rotatable.length - 1
        : (i + dir + rotatable.length) % rotatable.length;
    setPicked(rotatable[next]);
  };

  // The two steps that carry their own list; everywhere else the panel does it.
  const hasList = stage.id === "conf" || stage.id === "h-filed";
  // Narrow, the map and the people stack: the map under the blurb and the
  // people under the map. Side by side in a column this narrow left the name
  // panel too tight to hold a district and a vote on one line. The conference
  // has two maps and orders itself.
  const stackPair = !joint;
  // Clicking a seat on the map turns to the page that holds it, rather than
  // pulling it out of the list. The panel is the list; the map is a way into
  // it.
  const showSeat = (key: string) => {
    if (paged) {
      const i = ordered.indexOf(key);
      if (i >= 0) setPage(Math.floor(i / PAGE));
      return;
    }
    // One at a time. Clicking another seat replaces the one held; clicking the
    // held seat again hands it back to chance rather than emptying the panel,
    // which is where the step started. With no roster to fall back on, it
    // simply lets go.
    setPicked((prev) => {
      if (prev !== key) return key;
      const others = rotatable.filter((k) => k !== key);
      if (!others.length) return rotatable.length ? key : null;
      return others[Math.floor(Math.random() * others.length)];
    });
  };

  // Who the step is about, when it is not a vote.
  //
  // The Ways and Means step is the one worth lighting. "The committee struck
  // everything" is thirty-three people, a fifth of the House, and the map is
  // the only place that reads as a number rather than a phrase.
  const highlight =
    stage.id === "conf"
      ? L.conf.map((c) => c.key)
      : stage.id === "h-filed"
        ? HOUSE_ORIGINS.map((o) => o.key)
        : stage.id === "filed"
          ? L.origins.map((o) => o.key)
          : stage.id === "h5349"
            ? HOUSE_WAYS_AND_MEANS.map((m) => m.key)
            : stage.id === "h4745"
              ? HOUSE_EDUCATION.map((m) => m.key)
              : undefined;

  return (
    <Chapter
      id="lineage"
      question="How did it get here?"
      answer={
        <Span>
          <p className="font-body text-sm text-ink-muted leading-[1.65] max-w-[74ch]">
            Bills in Massachusetts get renumbered after any modification to
            their text. Newer versions of the same bill often contain missing or
            incomplete information. We made this bill tracker to make it easier
            to understand where a bill is in its lifecycle and how it got there.
          </p>
        </Span>
      }
    >
      <div>
        <Stages
          stages={stages}
          active={active}
          onPick={(id) => {
            onActive(id);
            // The effect above reseats the selection for the new step.
            setHovered(null);
          }}
        />

        {/* Container queries, not viewport ones. This section sits in a column
                the testimony rail can narrow by several hundred pixels, so a `lg:`
                breakpoint asks the wrong box how much room there is and lays out
                two columns into the width of one. Everything below sizes against
                whatever box it is actually in. */}
        {/* The container is a wrapper, not the grid itself: `@container` sets
                up a context for an element's descendants, so a query written on the
                same element has nothing to measure and never matches. */}
        <div className="@container mt-[24px]">
          <div
            // The map, or both maps on the conference step, then one column
            // holding what the step says with who did it underneath.
            // Everything the chosen step shows sits on one surface, so
            // clicking a card in the strip swaps the contents of a single
            // panel rather than rearranging loose pieces of the page.
            // Rows sized to the blurb, then everything left. Without this the
            // map spanning both rows has its height shared between them, so a
            // short blurb is stretched and the people below it start further
            // down on one step than on another.
            className={`grid gap-[24px] border border-line rounded-card p-[24px] @[840px]:items-stretch @[840px]:grid-rows-[auto_1fr] grid-cols-1 ${
              joint
                ? "@[840px]:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)]"
                : roll
                  ? // A roll call is about the chamber, so its map leads and
                    // the text follows. Every other step is about what the
                    // step did, so the text leads.
                    "@[840px]:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
                  : "@[840px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
            }`}
          >
            {/* The extra room goes here rather than on the grid's gap, which
                    would also push the two maps apart on the conference step. On
                    the right of this column now, since the maps sit to its
                    right. */}
            {/* Three siblings, placed rather than nested, so the same three
                    blocks can sit one way across and another way stacked. */}
            <div
              className={`${stackPair ? "row-start-1" : ""} @[840px]:col-span-1 @[840px]:row-start-1 ${
                roll
                  ? "@[840px]:col-start-2 @[840px]:pl-[16px]"
                  : "@[840px]:col-start-1 @[840px]:pr-[16px]"
              }`}
            >
              <div>
                <p className="font-display font-medium text-lg text-ink leading-[1.3]">
                  {stage.head}
                </p>
                {stage.body && (
                  <p className="font-body text-sm text-ink leading-[1.65] mt-[8px]">
                    {stage.body}
                  </p>
                )}
                {/* On its own line, like every other step's link, rather than
                    trailing the sentence. */}
                {stage.id === "conf" && (
                  <a
                    href="/conferenceCommittees/phone-free-schools"
                    className="inline-flex items-center gap-[4px] mt-[12px] font-body font-semibold text-sm underline decoration-dotted underline-offset-[4px] text-official-ink hover:text-official"
                  >
                    Go to conference committee
                    <ArrowUpRight className="w-[13px] h-[13px] no-underline" />
                  </a>
                )}
                {source && (
                  <a
                    href={
                      source.href ??
                      `/bills/${source.number.replace(".", "").toLowerCase()}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[4px] mt-[12px] font-body font-semibold text-sm underline decoration-dotted underline-offset-[4px] text-official-ink hover:text-official"
                  >
                    {source.number}, {source.what}
                    <ArrowUpRight className="w-[13px] h-[13px] no-underline" />
                  </a>
                )}

                {roll && (
                  <p className="font-body text-sm text-ink-muted mt-[12px]">
                    <span className="font-semibold text-yea">
                      {
                        Object.values(roll.votes).filter((v) => v === "Y")
                          .length
                      }{" "}
                      yea
                    </span>
                    {" · "}
                    <span className="font-semibold text-nay">
                      {
                        Object.values(roll.votes).filter((v) => v === "N")
                          .length
                      }{" "}
                      nay
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div
              className={`@container ${stackPair ? "row-start-3" : ""} @[840px]:row-start-2 flex flex-col gap-[22px] ${
                roll
                  ? "@[840px]:col-start-2 @[840px]:pl-[16px]"
                  : "@[840px]:col-start-1 @[840px]:pr-[16px]"
              }`}
            >
              {/* Where a step has no list of its own, the seats being read
                      are printed here. More than one can be held at a time, so
                      they sit side by side, senior first and alphabetical after
                      that. Steps that already show their members do not need this
                      and do not get it. */}
              {!hasList && people && (
                <div className="flex-1 flex flex-col">
                  {/* Names the set the faces come from, the way the filings
                      step says "six bills, six sponsors". On a roll call that
                      set is the whole chamber, and what the panel offers is any
                      one of them, so it says so rather than repeating the vote
                      the card has already named twice above. */}
                  {(committee || roll) && (
                    <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-muted mb-[8px]">
                      {committee ? committee.name : "How each voted"}
                    </p>
                  )}
                  {/* Floor set to what one filled row measures: a 36px
                      portrait between 10px of padding. The panel then keeps its
                      size whether or not a seat is chosen, so nothing below it
                      moves when one is. */}
                  <div className="group min-h-[60px] flex items-stretch gap-[4px] flex-1 bg-sunken rounded-panel overflow-hidden">
                    {/* Chevrons at the panel's edges, the way the followed
                          testimony card cycles its entries. Hidden by opacity
                          rather than display, so the panel keeps its width and the
                          member beside them does not shift when they appear, and
                          so they stay reachable by keyboard.
                          testimony card cycles its entries. Stepping is a third way
                          into the same one selection, beside the map and the lists,
                          and the only one that works without knowing which district
                          to point at. */}
                    <button
                      disabled={!canStep}
                      onClick={() => step(-1)}
                      aria-label={paged ? "Previous six" : "Previous member"}
                      className="shrink-0 self-stretch w-[25px] flex items-center justify-center text-ink-muted hover:text-ink hover:bg-wash-strong disabled:text-ink-faint disabled:hover:bg-transparent disabled:cursor-default cursor-pointer opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <ChevronLeft className="w-[14px] h-[14px]" />
                    </button>

                    <div className="flex-1 min-w-0 flex flex-col justify-center py-[10px]">
                      {shownKeys.length ? (
                        // A page of six is three across and two down.
                        //
                        // `auto` rather than equal thirds: a column takes the
                        // width its own content needs and the surplus is shared
                        // out. Equal thirds gave the same width to a cell holding
                        // "A. Michlewitz chair" and one holding "K. Diggs asst.
                        // vice chair", so the first had slack going spare while
                        // the second wrapped. The cost is that columns are no
                        // longer identical and shift a little between pages.
                        <div
                          className={
                            paged
                              ? "grid grid-cols-[auto_auto_auto] auto-rows-[minmax(48px,auto)] gap-x-[20px] gap-y-[10px]"
                              : "flex"
                          }
                        >
                          {shownKeys.map((key) => {
                            const { seat, vacant, card, vote } = readSeat(key);
                            if (!card && !vacant) return null;
                            return (
                              <div
                                key={key}
                                // Hovering a name is what grows its district on
                                // the map. The six are already at full strength
                                // there, so this is the only thing singling one
                                // out, and it reads in both directions: the map
                                // answers the list and the list answers the map.
                                onPointerEnter={() => setHovered(key)}
                                onPointerLeave={() => setHovered(null)}
                                className={`min-w-0 h-full flex items-center gap-[10px] ${
                                  // Alone, claim the panel. In a grid the cell
                                  // already sets the width.
                                  paged ? "" : "flex-1"
                                }`}
                              >
                                {vacant || !card?.portrait ? (
                                  <span className="shrink-0 w-[36px] h-[36px] rounded-full bg-sunken border border-line flex items-center justify-center">
                                    <Scale className="w-[18px] h-[18px] text-ink-faint" />
                                  </span>
                                ) : (
                                  <img
                                    src={card.portrait}
                                    alt=""
                                    className={`shrink-0 w-[36px] h-[36px] rounded-full object-cover bg-sunken border-[3px] transition-[box-shadow] ${
                                      card.party === "R"
                                        ? "border-negative"
                                        : "border-official"
                                    } ${
                                      hovered === key
                                        ? "ring-2 ring-ink ring-offset-2 ring-offset-sunken"
                                        : ""
                                    }`}
                                  />
                                )}
                                <span className="min-w-0">
                                  {/* Name, then office. The office sits with the
                                    name because it qualifies who they are.
                                    The line wraps rather than running on: the
                                    panel is a fixed box and a long surname
                                    ("A. Sullivan-Almeida") is wider than it. Each
                                    piece still holds together, so a break lands
                                    between the name and the office rather than
                                    inside either. */}
                                  {/* The leading goes on the same elements as
                                      the type sizes, not on this wrapper. In
                                      Tailwind v4 `text-sm` and `text-xs` set a
                                      line-height of their own through
                                      `--tw-leading`, which does not inherit, so a
                                      `leading` on the parent is silently ignored.
                                      That is why the district below, which
                                      carries its own, has always spaced
                                      correctly and the name never did.

                                      It also has to sit on this wrapper, because
                                      the height of a line box is the larger of
                                      the inline content and the block's own
                                      strut. Tightening only the inline spans left
                                      the strut inheriting 1.5 and holding the
                                      lines apart anyway.

                                      Under 1 on purpose: the two halves of a
                                      wrapped name should read as one thing, and
                                      at 1 the gap left over is the font's own
                                      space inside the em box. */}
                                  <span className="block leading-[0.9]">
                                    <span className="font-body font-semibold text-sm leading-[0.9] text-ink">
                                      {vacant ? "Vacant seat" : card?.name}
                                    </span>
                                    {/* A real space, not just the margin. Two
                                      adjacent spans give the browser nowhere to
                                      break, so it was splitting the name itself
                                      and leaving "K." alone. With a space here
                                      the break falls between the name and the
                                      office, and the office, being nowrap,
                                      moves down whole. */}
                                    {!vacant &&
                                      card?.title &&
                                      !officeBelow &&
                                      " "}
                                    {!vacant && card?.title && (
                                      <span
                                        className={`font-body text-xs leading-[0.9] text-caution-ink whitespace-nowrap ${
                                          officeBelow ? "block mt-[1px]" : ""
                                        }`}
                                      >
                                        {shortTitle(card.title).toLowerCase()}
                                      </span>
                                    )}
                                  </span>
                                  <span className="block mt-[3px] font-body text-xs text-ink-muted leading-[1.3]">
                                    {seat?.d}
                                    {/* With the district rather than the name: a
                                      vote is something the seat did, not part of
                                      who holds it. */}
                                    {/* No vote line on a vacant seat: "Vacant
                                        seat" has already said there was nobody
                                        to cast one. */}
                                    {roll && !vacant && (
                                      <span
                                        className={`ml-[7px] font-semibold ${
                                          vote === "Y"
                                            ? "text-yea"
                                            : vote === "N"
                                              ? "text-nay"
                                              : "text-ink-faint"
                                        }`}
                                      >
                                        {vote === "Y"
                                          ? "voted yea"
                                          : vote === "N"
                                            ? "voted nay"
                                            : "no vote recorded"}
                                      </span>
                                    )}
                                  </span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        // A recessed panel rather than a line of grey text: the
                        // slot is waiting to be filled, and saying so with a
                        // surface reads as somewhere to look rather than as
                        // something missing.
                        <div className="flex-1">
                          <p className="font-body text-sm text-ink-muted leading-[1.5]">
                            {roll
                              ? "Hover or click on a district to see the vote."
                              : "Hover or click on a district to see whose seat it is."}
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      disabled={!canStep}
                      onClick={() => step(1)}
                      aria-label={paged ? "Next six" : "Next member"}
                      className="shrink-0 self-stretch w-[25px] flex items-center justify-center text-ink-muted hover:text-ink hover:bg-wash-strong disabled:text-ink-faint disabled:hover:bg-transparent disabled:cursor-default cursor-pointer opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <ChevronRight className="w-[14px] h-[14px]" />
                    </button>
                  </div>
                </div>
              )}
              {stage.id === "conf" && (
                // Senate districts are named rather than numbered, so
                // "First Bristol and Plymouth" needs about 170px of its own.
                // Below two of those the chambers stack instead of splitting,
                // which is what keeps the names off a second line.
                <div className="grid gap-x-[20px] gap-y-[16px] @[440px]:grid-cols-2">
                  <Conferees
                    ch="S"
                    showing={shownKeys}
                    onHover={setHovered}
                    onPin={showSeat}
                  />
                  <Conferees
                    ch="H"
                    showing={shownKeys}
                    onHover={setHovered}
                    onPin={showSeat}
                  />
                </div>
              )}
              {stage.id === "h-filed" && (
                // Six bills and six sponsors, which is the whole of this step.
                // Each row hovers and pins like a committee member, so pointing
                // at a bill lights the district its sponsor represents.
                <div>
                  <div>
                    <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-muted mb-[14px]">
                      Six bills, six sponsors
                    </p>
                    <ul className="flex flex-wrap gap-x-[24px] gap-y-[10px]">
                      {HOUSE_ORIGINS.map((o) => {
                        const on = shownKeys.includes(o.key);
                        return (
                          // The row hovers, the portrait pins, and the number is
                          // a link out to the bill on MAPLE. A link cannot sit
                          // inside a button, so the three jobs are three
                          // elements rather than one that tries to be all of
                          // them.
                          <li
                            key={o.num}
                            onPointerEnter={() => setHovered(o.key)}
                            onPointerLeave={() => setHovered(null)}
                            className="flex items-center gap-[10px]"
                          >
                            <button
                              type="button"
                              aria-label={o.sponsor}
                              aria-pressed={shownKeys.includes(o.key)}
                              onFocus={() => setHovered(o.key)}
                              onBlur={() => setHovered(null)}
                              onClick={() => showSeat(o.key)}
                              className="shrink-0 block rounded-full cursor-pointer"
                            >
                              <img
                                src={o.portrait}
                                alt=""
                                className={`w-[36px] h-[36px] rounded-full object-cover bg-sunken border-[3px] transition-[box-shadow] ${
                                  o.party === "R"
                                    ? "border-negative"
                                    : "border-official"
                                } ${
                                  on
                                    ? "ring-2 ring-ink ring-offset-2 ring-offset-ground"
                                    : ""
                                }`}
                              />
                            </button>
                            <span className="min-w-0">
                              <span className="block leading-[1.3]">
                                <span className="font-body font-semibold text-sm text-ink">
                                  {surname(o.sponsor)}
                                </span>
                                <a
                                  href={`https://www.mapletestimony.org/bills/194/${o.num.replace(".", "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={o.title}
                                  className="ml-[6px] font-body text-xs text-caution-ink underline decoration-dotted underline-offset-[3px] hover:text-ink"
                                >
                                  {o.num}
                                </a>
                              </span>
                              <span className="block font-body text-xs text-ink-muted leading-[1.4]">
                                {o.district}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Senate before House wherever both are shown, so the pair sits
                in the same order every time and a reader never has to check
                which chamber they are looking at. On a step only one chamber
                took, it is that chamber's map alone. */}
            {(joint
              ? (["senate", "house"] as const)
              : chamber === "House"
                ? (["house"] as const)
                : (["senate"] as const)
            ).map((ch) => (
              <VoteMap
                key={ch}
                // The six filings are all equally the subject of this step,
                // so none of them fades; the edge alone marks the one being
                // read.
                // Nothing fades where the members are already listed beside
                // the map: bringing one forward would say the others had
                // receded, and they have not.
                dim={!hasList}
                // The map caption names the chamber. Which committee it is
                // sits over the faces instead, where the faces are the thing it
                // is naming.
                label={undefined}
                fit={!joint && !roll}
                // The conference pair fills its columns edge to edge. A lone
                // map has a whole column to itself, so it is capped and
                // centred instead: it grows from the middle of its column
                // outward rather than being pinned to both sides of it.
                className={`${
                  stackPair ? "row-start-2" : ""
                } @[840px]:row-start-1 @[840px]:row-span-2 ${
                  joint
                    ? ch === "senate"
                      ? "@[840px]:col-start-2"
                      : "@[840px]:col-start-3"
                    : roll
                      ? "@[840px]:col-start-1"
                      : // Every step in this column has a tall block of
                        // text and faces beside it, so the map fits that height
                        // rather than following its own width. No cap: with
                        // Massachusetts twice as wide as it is tall, a cap
                        // binds before the height ever does.
                        // `max-h` is the ceiling. The map scales proportionally to
                        // fit its box, so capping the height caps the width
                        // with it: this is the largest a map can ever be, on
                        // any step and at any card width.
                        "@[840px]:col-start-2 max-w-[520px] mx-auto @[840px]:max-w-none @[840px]:mx-0 @[840px]:h-full @[840px]:max-h-[340px] @[840px]:p-[20px]"
                } ${joint ? "max-w-[420px] mx-auto" : roll ? "max-w-[520px] mx-auto" : ""}`}
                chamber={ch}
                roll={roll}
                highlight={highlight}
                selected={shownKeys}
                // Only the name under the pointer grows. The page of six is
                // already at full strength; growing all six would say the
                // chamber had six edges rather than six members on it.
                // On a committee step only the name under the pointer grows:
                // the page of six is already at full strength. On a roll call
                // nothing grows, because every seat is filled and a thick edge
                // reads as one cell swallowing its neighbours. On the two steps
                // with their own list, the chosen entry grows as it always did.
                enlarged={
                  paged ? (hovered ? [hovered] : []) : roll ? [] : shownKeys
                }
                onHover={setHovered}
                onPin={people ? showSeat : undefined}
                people={people}
              />
            ))}

            {/* The right column: what the step says, then who did it. */}
          </div>
        </div>
      </div>

      {/* Parked, not deleted. The provisions are traced and the documented /
          inferred marks on them are real work; this is only about what belongs
          on the page right now.

                <Span>
                  <SubHead
                    title="What survived the merge"
                    note="Which ideas from the seven original filings are in the text now, and which changed on the way. Where a provision is traced to a bill, the label says whether that trace is documented or inferred."
                  />
                  <ul className="flex flex-col">
                    {L.provisions.map((p) => (
                      <ProvisionRow key={p.t} p={p} />
                    ))}
                  </ul>
                </Span>
      */}

      {/* Only on the Senate side: these are the Senate's filings, and on a House
          page they would be the other chamber's business. */}
      {chamber === "Senate" && (
        <Span>
          <Disclosure variant="heading" label="The seven bills it started as">
            <ul className="flex flex-col gap-[14px]">
              {L.origins.map((o) => (
                <li key={o.num}>
                  <p className="font-body font-semibold text-base text-ink leading-[1.4]">
                    {o.num} · {o.title}
                  </p>
                  <p className="font-body text-sm text-ink-muted mt-[2px]">
                    {o.sponsor} · {o.district}
                    {o.note ? ` · ${o.note}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </Disclosure>
        </Span>
      )}
    </Chapter>
  );
}
