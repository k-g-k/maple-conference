// The conference committee index: what a conference is, and the twelve sitting
// now.
//
// A door rather than a briefing. Each committee has a page of its own, so the
// first jobs here are saying what a conference does and letting a reader pick
// one. Anything used to compare committees belongs on those pages, where there
// is room to show the evidence for it.
//
// Below that door sits the one thing none of the twelve pages can say, because
// each of them only knows its own six: the same people keep coming back. That
// is a fact about the set rather than about any committee in it, so it is
// answered here. It stays subordinate to the list, and every committee it names
// is plain text rather than a link, so the twelve rows remain the only door on
// the page.

import { Fragment, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { MINE } from "../../data/bill-lineage/members";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  Star,
  X,
} from "lucide-react";
import {
  COMPLETED,
  NOT_LINKED,
  displayName,
  recordForSlug,
} from "../../data/conference-committees";
import { MEETINGS } from "../../data/conference-committees/meetings";
import { COMMITTEES } from "../../data/conference-committees/committees";
import { BILLS } from "../../data/bills-194";
import {
  REPEATERS,
  ROSTER,
  byStanding,
  ROSTER_BY_SEAT,
  SAME_SPLIT,
  SHARED_DISTRICTS,
  SIDES,
  TALLY,
  type RosterPerson,
} from "../../data/conference-committees/roster";
import { VoteMap, shortTitle, surname } from "../bill-example/lineage-section";
import { SiteNav } from "../site-nav";
import { useDeviceViewport } from "../use-device-viewport";

/**
 * The dotted leader, as a background rather than a border.
 *
 * A border restarts its dash pattern at the edge of every box it is drawn on,
 * so a run assembled out of several boxes shows a seam wherever they meet. A
 * repeating gradient has one phase across whatever it is painted on, and it
 * costs nothing in layout because it is painted on something absolute.
 */
const DOTS = {
  backgroundImage:
    "repeating-linear-gradient(to right, transparent 0 1.5px, var(--color-line-strong) 1.5px 2.5px, transparent 2.5px 4px)",
};

/**
 * The chosen committee's name, wherever it is printed.
 *
 * The row in the grid and the heading over the six are one name, so they take
 * one style: tuning the press means tuning it in a single place.
 */
const PICKED = "font-semibold text-ink";

/**
 * A one line tooltip in the card's own style.
 *
 * For the small marks that would otherwise lean on the browser's `title`,
 * which arrives after about a second, paints in the operating system's style
 * and reads as something other than part of the page. Portalled, because the
 * card clips its contents and a tooltip has to be able to leave.
 */
function Hint({
  text,
  className = "",
  onEnter,
  onLeave,
  onClick,
  children,
}: {
  text: string;
  className?: string;
  /** The mark is a control as well as a label where the card gives it one. */
  onEnter?: () => void;
  onLeave?: () => void;
  /** Given one, the mark takes the press rather than whatever is under it. */
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const hide = () => setAt(null);
  return (
    <span
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        onEnter?.();
        setAt({ x: e.clientX, y: e.clientY });
      }}
      onMouseMove={(e) => {
        if (!at) return;
        setAt({ x: e.clientX, y: e.clientY });
      }}
      onMouseLeave={() => {
        onLeave?.();
        hide();
      }}
    >
      {children}
      {at &&
        text &&
        createPortal(
          // Hung from the mark's left edge and running right, rather than
          // centered over it: a mark this small sits at the end of its row,
          // and a centered bubble put half its width back over the faces.
          <span
            style={{ left: at.x + 12, top: at.y - 10 }}
            className="pointer-events-none fixed z-[80] w-max max-w-[220px] animate-[tip-in_120ms_linear] opacity-90 -translate-y-full rounded-control bg-black/85 shadow-popover px-[7px] py-[3px] font-body text-2xs leading-[1.35] text-ink-inverse"
          >
            {text}
          </span>,
          document.body,
        )}
    </span>
  );
}

/** The small caps label the maps and the member lists already share. */
const LABEL =
  "font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-muted";

/**
 * A face at the size and the ring the committee pages use.
 *
 * The ring carries the party, and it is on the portrait rather than beside the
 * name because the column of faces is what a reader scans: the one piece of
 * color has to be on the thing being scanned.
 */
function Face({ p }: { p: RosterPerson }) {
  return (
    <span className="relative shrink-0">
      {/* Sitting back is opacity alone. Grayscale took the party ring with
          it, so a face that had merely receded had also stopped being a
          Democrat or a Republican. */}
      <img
        src={p.portrait}
        alt=""
        className={`block w-[36px] h-[36px] rounded-full object-cover bg-sunken border-[3px] ${
          p.party === "R" ? "border-negative" : "border-official"
        }`}
      />
      {/* The reader's own two, marked the way every other page marks them. */}
      {MINE[p.seat] && (
        <span className="absolute -bottom-[1px] -right-[1px] w-[14px] h-[14px] rounded-full bg-surface flex items-center justify-center">
          <Star
            aria-label={MINE[p.seat]}
            className="w-[9px] h-[9px] text-caution fill-caution"
          />
        </span>
      )}
    </span>
  );
}

/**
 * A face in a committee row, with its own name on hover.
 *
 * The page's own tooltip rather than the browser's, which arrives after about
 * a second and paints in the operating system's style. The delay is on the way
 * in only: a third of a second is long enough that running the pointer along
 * six faces does not flash six labels, and short enough to feel like an
 * answer.
 */
function RowFace({
  p,
  dim = false,
  size = 32,
  chairMark = false,
  ring = false,
  clear = false,
  soft = false,
  lift = false,
  gray = false,
  tip = true,
  rimScale = 1,
  star = true,
}: {
  p: RosterPerson;
  dim?: boolean;
  size?: number | string;
  /** Ring this face as a chair. It marks one seat, not the person. */
  chairMark?: boolean;
  /** Ring this face as the one being read, wherever it appears. */
  ring?: boolean;
  /** Mark this face as one a click would let go of. */
  clear?: boolean;
  /** Sit back, but not as far: for a face that is the answer somewhere else. */
  soft?: boolean;
  /**
   * A touch stronger again than `soft`.
   *
   * For the hovered row on a card where nothing has been pressed yet: there is
   * no selection for it to be weaker than, so it can stand further forward
   * than the same row would while another committee is held.
   */
  lift?: boolean;
  /**
   * Drain the color as well as the strength.
   *
   * Dimming says "not what you are reading". Gray says "not in the room at
   * all", which is a harder line and the one a chosen committee draws: the
   * party ring and the reader's own star go with it, because neither is a fact
   * about the committee on the card.
   */
  gray?: boolean;
  /** Off where the card answers the pointer itself and a tooltip would be a
   *  second answer to the same gesture. */
  tip?: boolean;
  /** Off where faces overlap and the badge would land on a neighbour. */
  star?: boolean;
  /**
   * Thin the party ring past what the face's size asks for.
   *
   * The ring is drawn in proportion so that one face reads like another, which
   * is right everywhere a face stands on its own. In a grid of seventy two it
   * is not: at that density the rings are most of what the eye receives, and
   * the portraits read as a field of color rather than as people.
   */
  rimScale?: number;
}) {
  const role = MINE[p.seat];
  // Scaled with the face, in whatever unit the face was given. A fixed badge
  // was a sticker on the big ones and a smudge on the small.
  const part = (f: number) =>
    typeof size === "number"
      ? Math.max(10, Math.round(size * f))
      : `calc(${size} * ${f})`;
  // The same proportion without `part`'s floor. That floor exists so a badge
  // never disappears, and it is wrong for anything drawn inside one: at a
  // 30px face, part(0.12) is not 3.6px, it is 10. Rounded, so edges land on
  // whole pixels rather than halves.
  const exact = (f: number) =>
    typeof size === "number" ? Math.round(size * f) : `calc(${size} * ${f})`;
  /** The cross inside the badge: a quarter of the face, and a pixel over. */
  const cross =
    typeof size === "number"
      ? Math.round(size * 0.24) + 1
      : `calc(${size} * 0.24 + 1px)`;
  /** How far the badge hangs off the face, a whole number of pixels. */
  const hang =
    typeof size === "number"
      ? `${-Math.round((1 + size * 0.045) * 1.8 + 1)}px`
      : `calc((1px + ${size} * 0.045) * -1.8 - 1px)`;
  // The party ring grows with the face, but at less than half its rate, so a
  // 130px face carries a ring you can read without the small ones losing
  // theirs. The constant is set to land on the familiar 3px at the default 32.
  const rim =
    typeof size === "number"
      ? `${(1.7 + size * 0.06) * rimScale}px`
      : `calc((1.7px + ${size} * 0.06) * ${rimScale})`;
  // The ink ring keeps its own weight. It is the pointer's mark, not the
  // party's, and thickening the party border should not thicken it.
  const ink =
    typeof size === "number"
      ? `${1 + size * 0.045}px`
      : `calc(1px + ${size} * 0.045)`;
  // A chair wears a second ring outside the party one, with a gap of page
  // between the two so the pair reads as two rings rather than one thick one.
  // On a Democrat it doubles their own ring; on a Republican it is the other
  // chamber color outside their red.
  const chairRing = chairMark
    ? `0 0 0 calc(${rim} * 0.6) var(--color-surface), 0 0 0 calc(${rim} * 1.45) var(--color-official)`
    : undefined;
  // Ink, and outside everything, because it answers the pointer rather than
  // saying anything about the person.
  const readRing = ring
    ? `0 0 0 calc(${ink} * 0.95) var(--color-surface), 0 0 0 calc(${ink} * 1.8) var(--color-ink)`
    : undefined;
  // Painted into the page body rather than into the row. The card clips its
  // contents so a row at either end keeps the card's corner, and anything
  // inside it is cut at that edge; a tooltip has to be able to leave. Which
  // means the position cannot be CSS either, so it is measured off the face
  // when the pointer arrives.
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<number | null>(null);
  const show = (el: HTMLElement) => {
    if (!tip) return;
    const r = el.getBoundingClientRect();
    // The same third of a second the other tooltips wait: long enough that
    // sweeping a column of faces does not flash a label on each.
    timer.current = window.setTimeout(
      () => setAt({ x: r.left + r.width / 2, y: r.top }),
      320,
    );
  };
  const hide = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setAt(null);
  };
  return (
    <span
      // The whole face sits back, badges included. With the opacity on the
      // portrait alone a dimmed face kept a gold star at full strength, which
      // made the one thing that was not the answer the brightest mark on the
      // card.
      // shrink-0, or a face in a flex row gives up width to a long line of
      // type beside it and stops being a circle.
      className={`relative shrink-0 transition-[opacity,filter] ease-out ${
        dim ? "duration-150" : "duration-200"
      } ${
        dim ? (soft ? (lift ? "opacity-75" : "opacity-60") : "opacity-35") : ""
      } ${gray ? "grayscale" : ""}`}
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={hide}
      onFocus={(e) => show(e.currentTarget)}
      onBlur={hide}
    >
      <img
        src={p.portrait}
        alt=""
        style={{
          width: size,
          height: size,
          borderWidth: rim,
          boxShadow: readRing ?? chairRing,
        }}
        className={`block rounded-full object-cover bg-sunken border-solid transition-[box-shadow] duration-100 ease-out ${
          p.party === "R" ? "border-negative" : "border-official"
        }`}
      />
      {/* The way out, on a face that is being held. The click target is the
          whole face, as it was before; this only says so, because a pinned
          face that looks exactly like a hovered one gives a reader nothing to
          aim at once the pointer has moved on. */}
      {clear && (
        <span
          // Outside the ring rather than on it: pushed out by the ring's own
          // thickness, the badge hangs off the edge and the circles stay
          // circles. The mark inside it is small and heavy, so the disc reads
          // as a button rather than as a cross drawn on the portrait.
          style={{
            width: exact(0.4),
            height: exact(0.4),
            top: `calc(${hang} - 1px)`,
            right: hang,
          }}
          className="absolute rounded-full bg-ink shadow-[0_0_0_1.5px_var(--color-surface)] flex items-center justify-center"
        >
          {/* Lucide's own X at Lucide's own proportions: their icons are
              drawn on a 24 grid with a 2 stroke, and scaling the glyph while
              fattening the stroke is how that drawing gets broken.
              absoluteStrokeWidth holds the stroke at 2 device pixels however
              small the icon is set, which is what the set is built for. */}
          <X
            aria-hidden
            strokeWidth={4}
            absoluteStrokeWidth
            style={{ width: cross, height: cross }}
            className="text-ink-inverse"
          />
        </span>
      )}
      {role && star && (
        <span
          style={{ width: part(0.36), height: part(0.36) }}
          className="absolute -bottom-[1px] -right-[1px] rounded-full bg-surface flex items-center justify-center"
        >
          <Star
            aria-label={role}
            style={{ width: part(0.23), height: part(0.23) }}
            className="text-caution fill-caution"
          />
        </span>
      )}
      {at &&
        createPortal(
          // One size throughout and two weights, semibold for the name and
          // regular for everything under it. The size changes were doing the
          // work color and the rule already do, and three sizes in a box this
          // small read as three separate things rather than one card.
          <span
            style={{ left: at.x, top: at.y - 10 }}
            className="pointer-events-none fixed z-[80] w-max max-w-[260px] -translate-x-1/2 -translate-y-full text-left rounded-card bg-ink shadow-popover px-[12px] py-[10px] font-body text-xs leading-[1.5]"
          >
            <span className="block font-semibold text-ink-inverse">
              {p.name}
              {/* The star says it twice over with the line below, which is the
                  point: it is the mark their face wears everywhere else. */}
              {role && (
                <Star
                  aria-hidden
                  className="inline-block align-[-1px] ml-[5px] w-[11px] h-[11px] text-caution fill-caution"
                />
              )}
            </span>
            <span className="block text-ink-inverse/70">
              {p.district}
              {role && <>, {role.toLowerCase()}</>}
            </span>
            {/* Which rooms, by name. The face says how many and how many it
                chairs; without the names that is a number about a person the
                reader cannot check. */}
            <span className="block mt-[7px] pt-[7px] border-t border-white/20">
              {p.on.map((x) => (
                <span key={x.slug} className="block text-ink-inverse">
                  {x.committee}
                  {/* The gold the chair label uses on the page is a dark gold,
                      which is unreadable on ink; on this ground it takes the
                      bright one the star is filled with. */}
                  {x.chair && (
                    <span className="ml-[5px] text-caution">chair</span>
                  )}
                </span>
              ))}
            </span>
          </span>,
          document.body,
        )}
    </span>
  );
}

/**
 * One of a person's conferences.
 *
 * Amber is the office color everywhere else on these pages, so a chaired one
 * wears it and the rest stay a quiet wash. That is what makes the chair
 * question readable down the column instead of countable off a footnote: a row
 * with two amber chips is someone leading two rooms, and there turn out to be
 * very few of those.
 */
function Seat({ committee, chair }: { committee: string; chair: boolean }) {
  return (
    <span
      className={`shrink-0 font-body text-xs leading-[1.4] px-[7px] py-[2px] rounded-chip border ${
        chair
          ? "bg-caution-soft border-caution text-caution-ink"
          : "bg-wash border-transparent text-ink-muted"
      }`}
    >
      {committee}
    </span>
  );
}

function RepeaterRow({ p }: { p: RosterPerson }) {
  return (
    <li className="flex items-start gap-[12px] px-[18px] py-[11px] border-t border-line-ghost">
      <Face p={p} />
      {/* Name left, conferences right: the same arrangement the twelve rows
          above use for their bill numbers. Under the break the two stack, since
          three chips and a name cannot share a phone's width. */}
      <span className="min-w-0 flex-1 flex flex-col @[560px]:flex-row @[560px]:items-baseline @[560px]:gap-[16px]">
        <span className="min-w-0">
          <span className="block leading-[1.35]">
            <span className="font-body font-semibold text-base text-ink">
              {p.name}
            </span>
            {p.title && (
              <span className="ml-[6px] font-body text-xs text-caution-ink">
                {shortTitle(p.title)}
              </span>
            )}
          </span>
          <span className="block font-body text-xs text-ink-faint leading-[1.4]">
            {p.chamber === "senate" ? "Senate" : "House"}, {p.district}
          </span>
        </span>
        <span className="flex flex-wrap gap-[5px] mt-[7px] @[560px]:mt-0 @[560px]:ml-auto @[560px]:justify-end">
          {p.on.map((s) => (
            <Seat key={s.slug} committee={s.committee} chair={s.chair} />
          ))}
        </span>
      </span>
    </li>
  );
}

/**
 * Everyone, in one card.
 *
 * The card under it answers a question about the appointments; this one just
 * says who they are. Fifty people, House first and then Senate, alphabetical
 * inside each, with the same row the repeaters use so the two cards read as
 * one list seen two ways.
 */
/** A tenth of a card: a heading, a drawing, and one line saying what it is. */
function Panel({
  head,
  note,
  wide = false,
  children,
}: {
  head: string;
  note: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "@[640px]:col-span-2" : ""}>
      <p className={LABEL}>{head}</p>
      <div className="mt-[10px]">{children}</div>
      <p className="font-body text-xs text-ink-muted leading-[1.5] mt-[8px] max-w-[52ch]">
        {note}
      </p>
    </div>
  );
}

/**
 * Five readings of the same fifty people.
 *
 * Deliberately not five charts of one number each. Each panel answers a
 * question the list cannot: how concentrated the bench is, how the two parties
 * hold their seats, whether chairing repeats the way membership does, whether
 * the rooms are built alike, and which of them share the same people.
 */
function Figures() {
  const tiers = [3, 2, 1].map((n) => {
    const people = ROSTER.filter((p) => p.on.length === n);
    return { n, people: people.length, seats: people.length * n };
  });
  const benches = [
    { key: "Senate Democrats", side: SIDES.senateD, party: "D" },
    { key: "Senate Republicans", side: SIDES.senateR, party: "R" },
    { key: "House Democrats", side: SIDES.houseD, party: "D" },
    { key: "House Republicans", side: SIDES.houseR, party: "R" },
  ];
  // Seats held by someone who holds more than one, against chairmanships held
  // by someone who holds more than one. The question is whether the second
  // repeats the way the first does.
  const twiceChairSeats = ROSTER.filter(
    (p) => p.on.filter((x) => x.chair).length > 1,
  ).reduce((n, p) => n + p.on.filter((x) => x.chair).length, 0);
  const rooms = COMMITTEES.map((c) => ({
    slug: c.slug,
    short: displayName(c.slug, c.short),
    seats: (["senate", "house"] as const).flatMap((chamber) =>
      ROSTER.filter(
        (p) => p.chamber === chamber && p.on.some((x) => x.slug === c.slug),
      )
        .sort((a, b) => (a.party === "R" ? 1 : 0) - (b.party === "R" ? 1 : 0))
        .map((p) => p.party),
    ),
  }));
  const shared = rooms.map((a) =>
    rooms.map((b) =>
      a.slug === b.slug
        ? -1
        : ROSTER.filter(
            (p) =>
              p.on.some((x) => x.slug === a.slug) &&
              p.on.some((x) => x.slug === b.slug),
          ).length,
    ),
  );
  // At least one, so an empty matrix cannot divide by zero.
  const most = Math.max(1, ...shared.flat());
  const bar = (v: number, total: number) => `${(v / total) * 100}%`;
  // The session's own clock. Formal business ended 31 July, but Joint Rule 12A
  // lets both chambers meet formally to take up a conference report where the
  // conference was formed on or before that date, which all twelve were.
  const DEADLINE = new Date("2026-07-31").getTime();
  const today = Date.now();
  const sitting = COMMITTEES.map((c) => {
    const rec = recordForSlug(c.slug);
    const sent = rec?.sentToConference
      ? new Date(rec.sentToConference).getTime()
      : null;
    const met = (MEETINGS[c.slug] ?? []).map((m) => new Date(m.date).getTime());
    return { slug: c.slug, short: displayName(c.slug, c.short), sent, met };
  }).filter((r) => r.sent);
  const first = Math.min(...sitting.map((r) => r.sent!));
  const span = today - first;
  const at = (t: number) => `${((t - first) / span) * 100}%`;
  const days = (a: number, b: number) => Math.round((b - a) / 86400000);
  const notices = sitting.flatMap((r) => r.met);
  const onDeadline = notices.filter((t) => t === DEADLINE).length;
  const sinceDeadline = notices.filter((t) => t > DEADLINE).length;
  // A finished conference, from the day it reported to the day both chambers
  // enacted what it wrote.
  const finished = COMPLETED.filter((c) => c.reported && c.enacted).map(
    (c) => ({
      name: c.name,
      gap: days(
        new Date(c.reported!.on).getTime(),
        new Date(c.enacted!).getTime(),
      ),
      as: c.reported!.as,
    }),
  );
  const slowest = Math.max(...finished.map((f) => f.gap));
  return (
    <div className="@container mt-[20px] bg-surface border border-line rounded-card px-[18px] pt-[16px] pb-[18px]">
      <div className="grid gap-x-[28px] gap-y-[24px] @[640px]:grid-cols-2">
        <Panel
          head="Concentration"
          note={`Both bars hold the same three groups: the ${tiers[0].people} people who sit on three conferences, the ${tiers[1].people} who sit on two, and the ${tiers[2].people} who sit on one. They are different shapes because the first group is ${Math.round((tiers[0].people / TALLY.people) * 100)} per cent of the bench and ${Math.round((tiers[0].seats / TALLY.seats) * 100)} per cent of the seats.`}
        >
          {(["seats", "people"] as const).map((of) => (
            <div key={of} className="mb-[12px] last:mb-0">
              <p className="font-body text-2xs text-ink-muted leading-none mb-[4px]">
                {of === "seats"
                  ? `${TALLY.seats} seats`
                  : `${TALLY.people} people`}
              </p>
              <div className="flex h-[22px] w-full overflow-hidden rounded-[4px]">
                {tiers.map((t, i) => {
                  const v = of === "seats" ? t.seats : t.people;
                  return (
                    <span
                      key={t.n}
                      title={`${t.people} on ${t.n} · ${t.seats} seats`}
                      style={{
                        width: bar(
                          v,
                          of === "seats" ? TALLY.seats : TALLY.people,
                        ),
                        opacity: 1 - i * 0.3,
                      }}
                      className="bg-brand flex items-center justify-center font-body text-2xs text-ink-inverse"
                    >
                      {v}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="font-body text-2xs text-ink-faint leading-none">
            Darkest: on three conferences. Lightest: on one.
          </p>
        </Panel>

        <Panel
          head="Seats per bench"
          note={`Every square is a seat, grouped by the person holding it. ${SIDES.senateR.people} Senate Republicans hold all ${SIDES.senateR.seats} of the Senate's Republican places, which is the narrowest bench in the set.`}
        >
          {benches.map((b) => (
            <div key={b.key} className="mb-[8px] last:mb-0">
              <div className="flex items-center gap-[6px]">
                <span className="w-[104px] shrink-0 font-body text-2xs text-ink-muted leading-none">
                  {b.key}
                </span>
                <span className="flex flex-wrap gap-[2px]">
                  {ROSTER.filter(
                    (p) =>
                      (b.key.startsWith("House") ? "house" : "senate") ===
                        p.chamber && p.party === b.party,
                  )
                    .sort((x, y) => y.on.length - x.on.length)
                    .map((p) => (
                      // One group per person, one square per seat.
                      <span key={p.seat} className="flex gap-[1px] mr-[5px]">
                        {p.on.map((x) => (
                          <span
                            key={x.slug}
                            className={`block w-[8px] h-[14px] rounded-[1px] ${
                              p.party === "R" ? "bg-negative" : "bg-official"
                            }`}
                          />
                        ))}
                      </span>
                    ))}
                </span>
              </div>
            </div>
          ))}
        </Panel>

        <Panel
          wide
          head="Still sitting, against the clock"
          note={`Every bar starts the day the bill went to conference and runs to today. The line is 31 July, the end of formal business. All ${sitting.length} were formed before it, which under Joint Rule 12A keeps their reports eligible for a formal session, so the deadline has not shut them. What has happened instead is nothing: ${sinceDeadline} meetings in the ${days(DEADLINE, today)} days since. Dots are noticed meetings.`}
        >
          <div className="relative">
            {/* The deadline, drawn behind the bars rather than beside them. */}
            <span
              style={{ left: at(DEADLINE) }}
              className="absolute top-0 bottom-0 w-px bg-negative/60"
              aria-hidden
            />
            <div className="flex flex-col gap-[4px]">
              {sitting.map((r) => (
                <div key={r.slug} className="flex items-center gap-[10px]">
                  <span className="w-[160px] shrink-0 text-right font-body text-2xs text-ink-muted leading-[1.3]">
                    {r.short}
                  </span>
                  <span className="relative flex-1 h-[14px]">
                    <span
                      style={{ left: at(r.sent!), right: 0 }}
                      className="absolute top-[4px] h-[6px] rounded-full bg-wash-strong"
                    />
                    {r.met.map((t) => (
                      <span
                        key={t}
                        style={{ left: at(t) }}
                        title={new Date(t).toDateString()}
                        className="absolute top-[2px] -ml-[5px] w-[10px] h-[10px] rounded-full bg-brand border-2 border-surface"
                      />
                    ))}
                  </span>
                  <span className="w-[54px] shrink-0 font-body text-2xs text-ink-faint leading-none">
                    {days(r.sent!, today)}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel
          head="Meetings, and when they happened"
          note={`${notices.length} meetings have been noticed across the ${sitting.length} conferences since April. ${onDeadline} of them were on 31 July itself, the last day of formal session, and only ${sinceDeadline} have happened in the ${days(DEADLINE, today)} days since.`}
        >
          <div className="flex items-end gap-[8px] h-[110px]">
            {[
              "2026-04",
              "2026-05",
              "2026-06",
              "2026-07",
              "2026-08",
              "2026-09",
            ].map((month) => {
              const n = notices.filter(
                (t) => new Date(t).toISOString().slice(0, 7) === month,
              ).length;
              const tall = Math.max(
                ...[
                  "2026-04",
                  "2026-05",
                  "2026-06",
                  "2026-07",
                  "2026-08",
                  "2026-09",
                ].map(
                  (m) =>
                    notices.filter(
                      (t) => new Date(t).toISOString().slice(0, 7) === m,
                    ).length,
                ),
              );
              return (
                <span
                  key={month}
                  className="flex-1 flex flex-col items-center gap-[4px]"
                >
                  <span className="font-body text-2xs text-ink-faint leading-none">
                    {n || ""}
                  </span>
                  <span
                    style={{ height: `${(n / tall) * 78}px` }}
                    className={`w-full rounded-t-[3px] ${
                      month === "2026-07" ? "bg-brand" : "bg-wash-strong"
                    }`}
                  />
                  <span className="font-body text-2xs text-ink-muted leading-none">
                    {new Date(`${month}-02`).toLocaleDateString("en-GB", {
                      month: "short",
                    })}
                  </span>
                </span>
              );
            })}
          </div>
        </Panel>

        <Panel
          head="Report to enactment"
          note={`The ${finished.length} conferences that have finished took between one and ${slowest} days to go from reporting their text to both chambers enacting it. The negotiation is the whole of the delay; the votes that follow it are not where the time goes.`}
        >
          <div className="flex flex-col gap-[6px]">
            {finished.map((f) => (
              <div key={f.as} className="flex items-center gap-[10px]">
                <span className="w-[160px] shrink-0 text-right font-body text-2xs text-ink-muted leading-[1.3]">
                  {f.name}
                </span>
                <span className="flex-1 h-[10px] rounded-full bg-wash overflow-hidden">
                  <span
                    style={{ width: `${(f.gap / slowest) * 100}%` }}
                    className="block h-full rounded-full bg-brand"
                  />
                </span>
                <span className="w-[54px] shrink-0 font-body text-2xs text-ink-faint leading-none">
                  {f.gap}d
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/**
 * Twelve rooms, six seats each, against the districts they come from.
 *
 * The grid answers who is in the room; the maps answer where the room comes
 * from. They are one card because the two questions are asked in one gesture:
 * run the pointer down the rows and the maps fall to that committee's six
 * districts, stop on a face and that person is ringed in every room they sit
 * in, which is the only way to see the overlap without counting.
 *
 * Nothing is lost at rest. With no pointer on it the maps carry all fifty and
 * the card reads as the two cards it replaced.
 */
/**
 * How a row is told apart from the rows above and below it.
 *
 * Three answers to the same question, so they can be looked at side by side:
 * a band under every other row, a dotted leader carrying the name across to
 * the faces, or a rule between one row and the next.
 */
type RowStyle = "band" | "leader" | "rule";

function Rooms({ rowStyle = "band" }: { rowStyle?: RowStyle }) {
  const [hoverRoom, setHoverRoom] = useState<string | null>(null);
  // The row whose count is under the pointer. Hovering a row says which room
  // the pointer is on and nothing more; the count beside it is the control
  // that asks "and who do these two have in common".
  const [hoverShare, setHoverShare] = useState<string | null>(null);
  // The row under the pointer, for everything the card draws. While the count
  // is held the row is not lit: the overlap is what the pointer is asking
  // about, not the row it happens to sit at the end of.
  const hoverRow = hoverShare ? null : hoverRoom;
  const cursor = useRef({ x: 0, y: 0 });
  // Whether the pointer is on the strip at the end of a row. Held in a ref as
  // well as in state, because the row's move handler reads it in the same
  // beat the strip sets it.
  const onStrip = useRef(false);
  // Where the sentence about what is being read gets drawn: at the pointer,
  // and with it while it moves.
  const [popAt, setPopAt] = useState<{ x: number; y: number } | null>(null);
  // What a press on a row does, said in words. The rows look like a chart and
  // behave like a list of links, and nothing else on the card says so.
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const [tipClear, setTipClear] = useState(false);
  const tipAt = useRef<number | null>(null);
  const spot = useRef({ x: 0, y: 0 });
  const tipUp = useRef(false);
  const showTip = (x: number, y: number, clear = false) => {
    setTipClear(clear);
    if (tipAt.current) window.clearTimeout(tipAt.current);
    spot.current = { x, y };
    tipAt.current = window.setTimeout(() => {
      tipUp.current = true;
      setTip({ ...spot.current });
    }, 250);
  };
  const hideTip = () => {
    if (tipAt.current) window.clearTimeout(tipAt.current);
    tipUp.current = false;
    setTip(null);
  };
  const [pinRoom, setPinRoom] = useState<string | null>(null);
  const [hoverWho, setHoverWho] = useState<string | null>(null);
  // A district can be held, where nothing else on the card can. A hover is a
  // glance and goes when the pointer does; a press keeps that person on the
  // right hand side while the pointer goes elsewhere, which is the only way
  // to read what is written about them without holding the mouse still.
  const [lockWho, setLockWho] = useState<string | null>(null);
  // The press that sets the lock also reaches the window, where every other
  // press clears it. The flag lets that one through.
  const justLocked = useRef(false);
  useEffect(() => {
    if (!lockWho) return;
    const away = () => {
      if (justLocked.current) {
        justLocked.current = false;
        return;
      }
      setLockWho(null);
    };
    window.addEventListener("click", away);
    return () => window.removeEventListener("click", away);
  }, [lockWho]);
  // Nothing on this card is kept except the committee. A person is read while
  // the pointer is on them and let go of when it leaves, which on a phone is
  // what a tap does.
  //
  // Which face the pointer is actually on, as against which person it is
  // reading: a person sits in up to three rows, and only the one under the
  // hand should be treated as touched.
  const [hoverAt, setHoverAt] = useState<{
    seat: string;
    slug: string;
  } | null>(null);
  /**
   * A district holds for as long as the pointer is on the map.
   *
   * Dragging across the map crosses the hairline between two cells, and that
   * gap reports as "nothing under the pointer" for a frame or two, which made
   * the card flicker back to rest between every district. So a cell leaving is
   * ignored: the reading changes when another cell claims it, and is let go of
   * when the pointer leaves the maps altogether, which the surrounding box
   * reports with a little room to spare.
   */
  const offCell = useRef<number | null>(null);
  // Leaving a district does clear it, after just long enough to cross a
  // hairline. The gap between two cells is a frame or two wide and used to
  // flicker the whole right hand side; blank map is not a gap, and resting on
  // it should read as nothing being pointed at.
  const readDistrict = (k: string | null) => {
    if (offCell.current) window.clearTimeout(offCell.current);
    if (k) setHoverWho(k);
    else offCell.current = window.setTimeout(() => setHoverWho(null), 60);
  };
  //
  // A committee is chosen by pressing its row. Passing over the row previews
  // the same thing without committing to it: the six light up and the maps
  // take their districts, and nothing is ringed, because nothing has been
  // chosen yet.
  const room = pinRoom;
  const shownRoom = room ?? hoverRow;
  // Held beats hovered, and a row beats both: running down the twelve is a
  // question about rooms, and the card answers that one for as long as the
  // pointer is on them. Coming off the rows gives the held district back.
  const who = hoverRow ? null : (lockWho ?? hoverWho);
  // A district under the pointer while another is held. It is not what the
  // card is reading, so it is not painted; it is outlined, to say it can be.
  const peek = lockWho && hoverWho !== lockWho ? hoverWho : null;
  /** Whoever the pointer is on, if anyone. */
  const reading = who ? [who] : [];
  const isRead = (key: string) => reading.includes(key);
  const readers = reading
    .map((k) => ROSTER.find((p) => p.seat === k))
    .filter((p): p is RosterPerson => !!p);
  const leads = (p: RosterPerson, slug: string) =>
    p.on.some((x) => x.slug === slug && x.chair);
  const six = (slug: string, chamber: "house" | "senate") =>
    ROSTER.filter(
      (p) => p.chamber === chamber && p.on.some((x) => x.slug === slug),
    ).sort(
      (a, b) =>
        Number(leads(b, slug)) - Number(leads(a, slug)) ||
        (a.party === "R" ? 1 : 0) - (b.party === "R" ? 1 : 0) ||
        byStanding(a, b),
    );
  const inRoom = (slug: string) =>
    ROSTER.filter((p) => p.on.some((x) => x.slug === slug));
  // The maps always hold all fifty, so the headings keep counting the whole
  // bench. What changes is which of them are painted over the veil: the people
  // being read, and the six of a chosen committee.
  const shown = ROSTER;
  // Everyone in the chosen committee, wherever they turn up. A person on three
  // conferences is the same person in all three rows, and dimming their other
  // faces said the committee stopped at its own line.
  const chosen = new Set(shownRoom ? inRoom(shownRoom).map((p) => p.seat) : []);
  // While a committee is held and the pointer is on another row, the people
  // the two rooms have in common are what the card is being asked about. They
  // are marked the way a person being read is marked: the rim in both rows and
  // in the box, and the maps down to their districts. The difference is that
  // there can be more than one of them, and that the rest of the column is
  // left alone.
  const sharedHover =
    room && hoverShare && hoverShare !== room
      ? inRoom(hoverShare)
          .filter((q) => chosen.has(q.seat))
          .map((q) => q.seat)
      : [];
  /** Whoever the card is pointing at: one person read, or the shared few. */
  const marked = who ? [who] : sharedHover;

  // What the maps paint over the veil. A person being read is the whole
  // answer, the same as in the grid: a committee's other five step back on the
  // map as well as in the box.
  // What the maps paint over the veil: the committee being shown, and anyone
  // being read. Both at once where a reader is inside a committee, with the
  // person forward and the room behind them.
  // With a committee on the card the maps hold that committee and stop there.
  // Reading one of its six changes the grid and the box; the map is the
  // picture of the room, and it should not be redrawn every time the pointer
  // moves inside it.
  const front = shownRoom ? inRoom(shownRoom).map((p) => p.seat) : reading;
  // Who the map will answer about. With a committee selected that is its six
  // and nobody else: the other districts are drawn as unlit, and a cell that
  // cannot be seen should not be able to be read either.
  const people = Object.fromEntries(
    (room ? inRoom(room) : ROSTER).map((p) => [
      p.seat,
      {
        name: p.name,
        district: p.district,
        party: p.party,
        portrait: p.portrait,
        title: p.title,
      },
    ]),
  );
  const map = (chamber: "senate" | "house") => {
    // The map is redrawn the moment a committee is in play, hovered or
    // pressed: down to that committee's districts, with the headings counting
    // them. A hover gets the same picture at less than full strength, so a
    // press is the difference between looking and choosing rather than the
    // difference between two drawings.
    const focus = shownRoom ? inRoom(shownRoom).map((p) => p.seat) : null;
    return (
      <span
        className={`block transition-opacity ${
          focus && !room ? "opacity-60" : ""
        }`}
      >
        <VoteMap
          key={chamber}
          chamber={chamber}
          // Reading one person sends everything else back: inside a committee
          // that is its other five, and outside one it is the whole bench
          // behind a veil.
          dim={marked.length > 0}
          veil={marked.length > 0}
          // One picture of one committee rather than two maps being compared:
          // the headings stay level with each other, and under the veil both
          // coastlines step back together.
          paired
          veilAt={0.35}
          highlight={focus ?? shown.map((p) => p.seat)}
          selected={focus ? marked : front}
          enlarged={focus ? [] : peek ? [...marked, peek] : marked}
          full={peek ? [peek] : undefined}
          onHover={readDistrict}
          // A press on a district is a tap's hover and nothing else: on a
          // phone it reads that district, and on a desktop it repeats what the
          // pointer has already said rather than undoing it.
          onPin={(k) => {
            // Holding a district is this view's own gesture. With a committee
            // on the card the maps are its picture and a press says nothing.
            if (room) return;
            justLocked.current = true;
            window.setTimeout(() => (justLocked.current = false), 0);
            setLockWho((v) => (v === k ? null : k));
          }}
          people={people}
        />
      </span>
    );
  };
  const seat = (p: RosterPerson, lit: boolean, slug: string) => {
    // A face in this grid answers nothing. The row is the only target on the
    // left: the pointer chooses a committee, not a person, and a face that
    // took the card over on the way past was answering a question the reader
    // had not asked. Reading one person is what the box and the maps are for.
    //
    // Sitting back means: outside the committee being shown, and not whoever
    // is being read from one of those. The committee being shown is the one
    // pressed or, failing that, the one the pointer is over.
    // Three strengths. The committee that has been pressed stands at full;
    // the one merely under the pointer is lit but still back, so a press is
    // visibly different from a pass; everything else is back and gray.
    // Whether this is the face the pointer is actually on. A hover that came
    // from the box or the map is on a person rather than on a face, and then
    // no face in the grid is the one being touched: they all take the ring.
    const here = hoverAt
      ? hoverAt.seat === p.seat && hoverAt.slug === slug
      : false;
    // One of the few two rooms have in common, standing in one of those two
    // rooms. Both ends of the overlap are marked: the row whose count is
    // held and the committee that was pressed.
    const over =
      sharedHover.includes(p.seat) && (slug === room || slug === hoverShare);
    const back = chosen.size
      ? room
        ? // A committee has been pressed: the room stands at full, and so
          // does whoever is being read, in every room they sit in. The row
          // itself holds all six at full however the pointer moves along it:
          // the ring is what says which one is being read.
          slug === room
          ? false
          : who
            ? !isRead(p.seat)
            : hoverRow && hoverRow !== room
              ? slug !== hoverRow || !sharedHover.includes(p.seat)
              : !over
        : true
      : // Nothing asked yet: the whole wall stands at full. Dimming is what
        // happens when there is something to dim against.
        //
        // With no committee on the card, reading someone lights the face
        // under the hand and nothing else. Their other rooms light up only
        // once a committee has been pressed, where the question is what that
        // room reaches into.
        reading.length
        ? // Read from the map or the box, the person lights wherever they sit;
          // read from a face in the grid, only that face lights.
          !(hoverAt ? here : who === p.seat)
        : // At rest the whole wall stands at full. Dimming is an answer, and
          // with nothing asked there is nothing to be answering.
          false;
    return (
      // Room for a ring on every side. The ink ring is drawn outside the
      // face, so without the padding it would cross into the row above and
      // below and be cut by whichever band is painted over it.
      //
      // The face reads on hover and nothing more: the ring marks the person
      // and the maps follow them, while the press underneath still belongs to
      // the row, so pointing at someone never takes a committee away.
      <span key={p.seat} className="flex px-[5px] py-[5px]">
        {/* The ring is the selected state, in the grid and in the list alike.
          The pointer does not borrow it: hovering only sends everything else
          back. */}
        <RowFace
          p={p}
          size="var(--face)"
          // Thinner than the proportion would draw it. Seventy two faces in a
          // block is the one place where the party rings add up to more than
          // the portraits inside them.
          rimScale={0.8}
          tip={false}
          // Not on the face under the hand: the pointer is already on it, so
          // the ring there says nothing. It goes on the other instances of
          // that person, which is the thing worth pointing out, and on their
          // entry in the box.
          // The ring marks the other instances of whoever is being read, and
          // only while a committee is on the card: reading a face on its own
          // is about that face, not about the rooms it turns up in.
          ring={
            (who === p.seat && !here) ||
            // The shared few, in the row under the pointer and in the row that
            // was pressed: the same person marked at both ends of the overlap
            // the number at the end of the row counts.
            over
          }
          // Dim at rest, and dim again outside whatever is being read. A
          // chosen committee lights its own row and no further: the same
          // people elsewhere are other rooms' business until the pointer asks
          // about one of them, and then they light wherever they sit.
          dim={back}
          // Gray belongs to a committee that has been pressed. A hover is not
          // a decision, so passing down the column sends the other rows back
          // on strength alone.
          gray={
            (!!room || !!hoverRow) &&
            slug !== room &&
            slug !== hoverRow &&
            !over &&
            !isRead(p.seat)
          }
          // At rest the whole wall sits at the middle strength rather than
          // the deep one: nothing has been asked about yet, so nothing has
          // been pushed back behind anything else.
          // A row under the pointer is lit but not fully: color, at the
          // middle strength, and a step stronger where nothing has been
          // pressed for it to sit under.
          lift={!room}
          soft={
            (!chosen.size && !reading.length) ||
            (!!room && isRead(p.seat)) ||
            (slug === hoverRow && slug !== room)
          }
        />
      </span>
    );
  };
  // The committee page's own conferee row, at its size and in its order: the
  // face with the party ring, the surname, the office beside it, the district
  // under it. A reader arriving from that page should not have to learn a
  // second way of reading the same six people.
  /**
   * The line under the box, which says what the card is doing in words.
   *
   * Three things to say, in the order the pointer asks them. Reading a person:
   * how much of the session they are in. Holding a count: what the two rooms
   * have in common, and that it can be opened. Neither: what there is to point
   * at, because a card that answers the pointer has to say that it does.
   */
  const COUNT = ["no", "one", "two", "three", "four", "five", "six"];
  const nameOf = (seat: string) => {
    const r = ROSTER.find((x) => x.seat === seat);
    return r ? surname(r.name) : "";
  };
  const strong = (t: string) => (
    <span className="font-semibold text-ink">{t}</span>
  );
  const list = (names: string[]) =>
    names.length < 2
      ? strong(names[0] ?? "")
      : names.map((n, k) => (
          <Fragment key={n}>
            {k > 0 && (k === names.length - 1 ? " and " : ", ")}
            {strong(n)}
          </Fragment>
        ));
  const reads = !!who || (!!hoverShare && sharedHover.length > 0);
  const [onRight, setOnRight] = useState(false);
  const [onMap, setOnMap] = useState(false);
  /** Whether anything is drawn at the pointer. */
  const showPop = lockWho ? onRight : reads;
  const mapHint =
    !room && onMap && hoverWho
      ? hoverWho === lockWho
        ? "click to unselect"
        : "click to select"
      : lockWho
        ? "click anywhere to unselect"
        : null;
  useEffect(() => {
    setPopAt(showPop ? { ...cursor.current } : null);
  }, [showPop, who, hoverShare, hoverWho, lockWho, onRight]);
  const resting = () => (
    <>
      Hover over <span className="italic">map areas</span>,{" "}
      <span className="italic">avatars</span>, or the{" "}
      <span className="italic">shared member count</span> to highlight specific
      legislators. Or select another committee.
    </>
  );
  const helper = () => {
    if (hoverShare && sharedHover.length) {
      const other = COMMITTEES.find((c) => c.slug === hoverShare);
      const title = displayName(hoverShare, other?.short ?? "");
      const names = sharedHover.map(nameOf);
      const chairs = sharedHover
        .filter((seat) => {
          const r = ROSTER.find((x) => x.seat === seat);
          return r ? leads(r, hoverShare) : false;
        })
        .map(nameOf);
      return (
        <>
          {list(names)} also {names.length > 1 ? "serve" : "serves"} on{" "}
          <span className="italic">{title}</span>
          {chairs.length > 0 &&
            (names.length === 1 ? (
              <> as its chair</>
            ) : (
              <>
                , which {list(chairs)} {chairs.length > 1 ? "chair" : "chairs"}
              </>
            ))}
          .
        </>
      );
    }
    if (who) {
      const r = ROSTER.find((x) => x.seat === who);
      if (!r) return null;
      const n = r.on.length;
      const chairs = r.on.filter((x) => x.chair).length;
      if (n === 1) {
        return (
          <>
            {strong(surname(r.name))} serves on one committee
            {chairs > 0 && <> and is the chair</>}.
          </>
        );
      }
      return (
        <>
          {strong(surname(r.name))} serves on {COUNT[n] ?? n} committees
          {chairs > 0 && (
            <>
              {" "}
              and is the chair of{" "}
              {chairs === n
                ? n === 2
                  ? "both"
                  : "all of them"
                : COUNT[chairs]}
            </>
          )}
          .
        </>
      );
    }
    return resting();
  };

  const card = (p: RosterPerson, slug?: string) => {
    // Inside a committee's box the pointer reads one of the six: that one
    // takes the ring and the other five sit back. In the list of pins there
    // is nothing to sit back from, so they stay as they are.
    // Reading one of the six sends the other five back, here as in the row.
    const back = !!who && who !== p.seat;
    return (
      <div
        key={p.seat}
        // A previewed committee's box is a picture of the room, not somewhere
        // to point: until the row has been pressed, nothing in here answers.
        onMouseEnter={() => room && setHoverWho(p.seat)}
        onMouseLeave={() => room && setHoverWho(null)}
        // A pill on hover, with the way out at its far end. The entry is the
        // whole target, as it was; the X says so, and the ground under it
        // says how far the target reaches.
        className="group/pin relative flex w-fit items-center gap-[10px] cursor-default"
      >
        {/* Nothing in this list sits back. Everyone in it is pinned or
            under the pointer, which is to say everyone in it was asked for.
            No tooltip anywhere on this card: the card answers the pointer
            itself, and a label arriving on top of that answer is a second
            answer to the same gesture. */}
        {/* No clear badge here: the grid is where a pin is let go of, and
            this list has its own instructions coming. */}
        {/* The ring belongs to a committee that has been pressed. While this
            box is only a preview of the row under the pointer, nothing in it
            is marked. */}
        <RowFace
          p={p}
          size={36}
          tip={false}
          dim={back}
          ring={!!room && marked.includes(p.seat)}
        />
        <span className="min-w-0">
          <span className="block leading-[1.3] whitespace-nowrap">
            <span
              className={`font-body font-semibold text-sm ${
                back ? "text-ink-faint" : "text-ink"
              }`}
            >
              {surname(p.name)}
            </span>
            {slug && leads(p, slug) && (
              <span
                className={`ml-[6px] font-body text-xs ${
                  back ? "text-ink-faint" : "text-caution-ink"
                }`}
              >
                chair
              </span>
            )}
          </span>
          <span
            className={`block font-body text-xs leading-[1.4] ${
              back ? "text-ink-faint" : "text-ink-muted"
            }`}
          >
            {MINE[p.seat] ?? p.district}
          </span>
        </span>
      </div>
    );
  };
  return (
    <div className="@container mt-[20px] bg-surface border border-line rounded-card px-[18px] pt-[16px] pb-[18px]">
      {/* Narrow, the card is a list and nothing else: twelve rows that open
          their committee's page, with each chamber's three stacked into one
          mark. The maps, the box and the reading they support all want a
          pointer and a second column, and a phone has neither. */}
      <ul className="mt-[12px] @[736px]:hidden">
        {COMMITTEES.map((c, i) => {
          const face = (p: RosterPerson) => (
            <span
              key={p.seat}
              className="-ml-[10px] first:ml-0 rounded-full shadow-[0_0_0_2px_var(--color-surface)]"
            >
              <RowFace
                p={p}
                size={26}
                rimScale={0.7}
                tip={false}
                star={false}
              />
            </span>
          );
          const inside = (
            <>
              <span className="min-w-0 flex-1 font-body font-semibold text-sm text-ink leading-[1.3]">
                {displayName(c.slug, c.short)}
              </span>
              <span className="shrink-0 flex items-center">
                {six(c.slug, "senate").map(face)}
              </span>
              <span className="w-[10px] shrink-0" aria-hidden />
              <span className="shrink-0 flex items-center">
                {six(c.slug, "house").map(face)}
              </span>
              <ChevronRight
                aria-hidden
                className="shrink-0 ml-[6px] w-[16px] h-[16px] text-line-strong"
              />
            </>
          );
          const row = `flex items-center gap-[10px] py-[10px] ${
            i > 0 ? "border-t border-line-ghost" : ""
          }`;
          return (
            <li key={c.slug}>
              {NOT_LINKED.has(c.slug) ? (
                <span aria-disabled className={`${row} opacity-55`}>
                  {inside}
                </span>
              ) : (
                <Link to={`/conferenceCommittees/${c.slug}`} className={row}>
                  {inside}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {popAt &&
        createPortal(
          mapHint ? (
            <span
              style={{ left: popAt.x + 14, top: popAt.y + 14 }}
              className="pointer-events-none fixed z-[80] w-max animate-[tip-in_120ms_linear] opacity-90 rounded-control bg-surface border border-line shadow-popover px-[7px] py-[3px] font-body font-semibold text-2xs leading-[1.35] text-ink-muted"
            >
              {mapHint}
            </span>
          ) : (
            <span
              style={{ left: popAt.x + 14, top: popAt.y + 14 }}
              className="pointer-events-none fixed z-[80] w-max max-w-[300px] animate-[tip-in_120ms_linear] rounded-card bg-surface border border-line shadow-popover px-[13px] py-[10px] font-body text-sm text-ink-muted leading-[1.55]"
            >
              {helper()}
            </span>
          ),
          document.body,
        )}
      {tip &&
        createPortal(
          <span
            style={{ left: tip.x, top: tip.y - 16 }}
            className={`pointer-events-none fixed z-[80] w-max animate-[tip-in_120ms_linear] opacity-90 -translate-x-1/2 -translate-y-full rounded-control bg-surface border border-line shadow-popover px-[7px] py-[3px] font-body font-semibold text-2xs leading-[1.35] text-ink-muted`}
          >
            {tipClear ? "click to unselect" : "click to select"}
          </span>,
          document.body,
        )}
      <div
        onMouseMove={(e) => {
          cursor.current = { x: e.clientX, y: e.clientY };
          if (showPop) setPopAt(cursor.current);
        }}
        className="mt-[12px] hidden @[736px]:flex @[736px]:flex-row gap-[24px]"
      >
        <div className="shrink-0">
          {/* No mark on the faces. Every seat in a column holds the same
              office in every room, so the column is the label.

              The face size is a custom property rather than a number, so it
              can answer the card's own width: below a thousand pixels the
              portraits and their party rings, which are drawn in proportion,
              come down a size. */}
          {/* The twelve are one area to the pointer, the way the two maps are.
              Crossing the gap between one row and the next used to let go of
              the hover and take it again, which flickered the whole right hand
              side; a row is let go of when something else claims it, or when
              the pointer leaves the block altogether. */}
          <div
            onPointerLeave={() => {
              setHoverRoom(null);
              hideTip();
            }}
            className="w-max cursor-pointer [--face:22px] [--cell:32px] @[1000px]:[--face:26px] @[1000px]:[--cell:36px]"
          >
            <div className="flex items-end gap-[14px] pb-[6px]">
              <span className="w-[150px] shrink-0" aria-hidden />
              {(["Senate", "House"] as const).map((chamber, i) => (
                <Fragment key={chamber}>
                  {i > 0 && <span className="w-[38px]" aria-hidden />}
                  <span className="flex flex-col items-stretch">
                    <span className={`${LABEL} pb-[6px] text-center`}>
                      {chamber}
                    </span>
                    {/* The middle column goes unnamed. "Member" was the one
                        head that said nothing the column did not already say,
                        and at this width it ran into "Minority". */}
                    <span className="flex items-end">
                      {["Chair", "", "Minority"].map((head, k) => (
                        <span
                          key={k}
                          className="w-[var(--cell)] shrink-0 text-center font-body text-2xs text-ink-faint leading-none"
                        >
                          {head}
                        </span>
                      ))}
                    </span>
                  </span>
                </Fragment>
              ))}
            </div>
            {COMMITTEES.map((c, i) => {
              const on = room === c.slug;
              // A row stays lit either because it is the row being read or
              // because the person being read sits in it. That second rule is
              // the whole point of the ring: three rows light at once and the
              // reader sees the overlap without counting.
              // Only the chosen committee's own name stays dark. The rooms
              // its people also sit in light up while the pointer is on one
              // of them, and go back when it leaves.
              const holds = readers.some((p) =>
                p.on.some((x) => x.slug === c.slug),
              );
              // At rest every name is back too: the card opens as a wall
              // nobody has asked about, and a row of full-strength names over
              // dimmed faces was half the card still at full strength.
              const back = !on && !holds;
              // How many of this room's six also sit in the one that has been
              // pressed. The faces say it by standing forward of the wall they
              // are in; the number says how many there are, which is the thing
              // a reader would otherwise be counting by eye.
              const shared =
                room && !on
                  ? inRoom(c.slug).filter((p) => chosen.has(p.seat)).length
                  : 0;
              return (
                <div
                  key={c.slug}
                  // Coming back to the wall is the next answer, so whatever
                  // the map was holding is let go of here.
                  onMouseEnter={(e) => {
                    setHoverRoom(c.slug);
                    if (!room) setHoverWho(null);
                    hideTip();
                    if (!reads && !onStrip.current)
                      showTip(e.clientX, e.clientY, on);
                  }}
                  onMouseMove={(e) => {
                    spot.current = { x: e.clientX, y: e.clientY };
                    if (reads || onStrip.current) hideTip();
                    else if (tipUp.current) setTip(spot.current);
                    else showTip(e.clientX, e.clientY, on);
                  }}
                  onMouseLeave={hideTip}
                  onClick={() => {
                    hideTip();
                    setPinRoom(on ? null : c.slug);
                  }}
                  // Hover is paint only. The row says it is a thing you are
                  // over, and nothing on the right hand side moves: the maps
                  // and the list still answer to a face or a district.
                  // The whole strip is the target, not the faces on it: full
                  // width of the grid, with the padding inside the row so the
                  // press reaches past the last face and before the name.
                  className={`relative flex items-center gap-[14px] px-[8px] -mx-[8px] cursor-pointer transition-colors ${
                    // Banded and ruled rows run into each other on purpose:
                    // the band and the rule are what separate them, and a gap
                    // as well would be the separation said twice. The leader
                    // has nothing drawn between rows, so it keeps the gap.
                    rowStyle === "leader"
                      ? "my-[6px] rounded-control"
                      : "py-[5px]"
                  } ${
                    rowStyle === "rule" && i < COMMITTEES.length - 1
                      ? "after:content-[''] after:absolute after:inset-x-[8px] after:bottom-0 after:h-px after:bg-[#f2f2f2]"
                      : ""
                  } bg-no-repeat bg-left ${
                    on
                      ? "bg-[linear-gradient(var(--color-wash),var(--color-wash))] bg-[length:100%_100%]"
                      : rowStyle === "band" && i % 2 === 0
                        ? // The band at rest is half the strength of the one
                          // a press paints, so a chosen row still stands out
                          // from the striping it sits in.
                          "bg-wash/50"
                        : ""
                  }`}
                >
                  <span
                    // Dark for the committee being shown, pressed or merely
                    // passed over, and for any room holding someone being
                    // read. Everything else sits back.
                    // Three states, and only one of them is the subject. The
                    // Two schemes. With nothing held, every name is ink and
                    // weight alone marks what the pointer is on. With a
                    // committee held, it is the only one in ink and the column
                    // behind it goes gray.
                    className={`w-[150px] shrink-0 font-body text-sm leading-[1.3] transition-colors ${
                      on
                        ? PICKED
                        : c.slug === hoverRow
                          ? "font-bold text-ink-muted"
                          : shownRoom
                            ? // A committee is being shown, pressed or hovered:
                              // the rest of the column goes back, and a room
                              // holding the person being read comes forward a
                              // weight. It is the whole point of reading one
                              // face: three rooms answer at once, and they
                              // have to be findable down a column of twelve.
                              back
                              ? // How far back depends on what is holding the
                                // card. A press is a decision, so the rest of
                                // the column goes to the faintest ink. A hover
                                // is only a pass, so the rest stays readable.
                                room
                                ? "font-normal text-ink-faint"
                                : "font-normal text-ink-muted"
                              : "font-bold text-ink-muted"
                            : back
                              ? who
                                ? "font-normal text-ink-faint"
                                : "font-normal text-ink"
                              : "font-semibold text-ink"
                    }`}
                  >
                    {rowStyle === "leader" ? (
                      // The committee's own line, with a dotted rule filling
                      // whatever the name leaves of the column. It sits on the
                      // name's baseline, a couple of pixels clear of the
                      // descenders, rather than halfway up the letters.
                      <span className="flex items-baseline gap-[6px]">
                        <span className="shrink-0">
                          {displayName(c.slug, c.short)}
                        </span>
                        <span
                          aria-hidden
                          className="relative flex-1 translate-y-[2px]"
                        >
                          <span
                            style={DOTS}
                            className="absolute left-0 right-[-13px] bottom-0 h-px"
                          />
                        </span>
                      </span>
                    ) : (
                      displayName(c.slug, c.short)
                    )}
                    {/* The two bills the room was called to reconcile, under
                        the name that stands for them. Faint and at one weight
                        throughout: it is what the row is about, not a second
                        thing competing with the name for the scan. The faces
                        came down a size to pay for the line, so the row is no
                        taller than it was. */}
                    <span className="block font-normal text-2xs text-ink-faint leading-[1.35] mt-[1px]">
                      {[
                        recordForSlug(c.slug)?.senate,
                        recordForSlug(c.slug)?.house,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="flex items-center">
                    {six(c.slug, "senate").map((p) => seat(p, on, c.slug))}
                  </span>
                  {/* The leader again, carried across the break between the
                      two chambers. Empty of content, so its rule lands on the
                      row's own middle, which is where the name's baseline sits
                      once the bill numbers are counted under it.

                      The break is wider than this span: the row sets a 14px
                      gap, so the spacer has one on either side of it, and each
                      neighbouring face carries 5px of padding. 52px of empty
                      run in all, which the rule crosses to within 3px of each
                      portrait. */}
                  <span aria-hidden className="relative w-[38px] self-center">
                    {rowStyle === "leader" && (
                      <span
                        style={DOTS}
                        className="absolute left-[-13px] right-[-13px] bottom-0 h-px"
                      />
                    )}
                  </span>
                  <span className="flex items-center">
                    {six(c.slug, "house").map((p) => seat(p, on, c.slug))}
                  </span>
                  {/* The way out of a chosen committee. It keeps its place in
                      the row, so the row is no wider than it already was, and
                      sits a little in from the end rather than hard against
                      it. */}
                  <span className="relative shrink-0 self-stretch ml-[18px] -translate-x-[10px] w-[13px] flex items-center justify-center">
                    {on ? (
                      // The only way out of a chosen committee, and the only
                      // part of a chosen row that answers a press: pressing
                      // the row itself does nothing once it is the subject.
                      <button
                        type="button"
                        aria-label="Clear this committee"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPinRoom(null);
                        }}
                        className="absolute -inset-y-[8px] -inset-x-[7px] flex items-center justify-center cursor-pointer"
                      >
                        <X
                          aria-hidden
                          strokeWidth={2.75}
                          className="w-[13px] h-[13px] text-ink-muted"
                        />
                      </button>
                    ) : (
                      <>
                        {!!shared && (
                          <span className="font-body text-2xs text-ink-faint tabular-nums leading-none">
                            {shared}
                          </span>
                        )}
                        {/* The end of a row is the card's other control, and
                            it is one whether or not there is a number in it:
                            the strip is not part of the row, so resting here
                            neither lights the row nor selects it. */}
                        <Hint
                          text=""
                          className="absolute -inset-y-[6px] -left-[8px] -right-[26px] cursor-default"
                          onEnter={() => {
                            onStrip.current = true;
                            hideTip();
                            setHoverShare(c.slug);
                          }}
                          onLeave={() => {
                            onStrip.current = false;
                            setHoverShare(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div
          onMouseEnter={() => setOnRight(true)}
          onMouseLeave={() => setOnRight(false)}
          className={`min-w-0 flex-1 flex flex-col cursor-default ${
            room ? "[&_polygon]:cursor-default" : ""
          }`}
        >
          {/* Equal columns, so the two maps are drawn at the same size and
              the lists under them start on the same line. */}
          <div className="relative order-2 mt-auto pt-[24px]">
            {/* The pair is one area to the pointer: the gutter between the
                two maps is inside it, so crossing from the Senate to the House
                does not let go of what was being read. The padding gives the
                edges a little slack, and leaving this box is what clears it. */}
            <div
              onMouseEnter={() => setOnMap(true)}
              onMouseLeave={() => setOnMap(false)}
              onPointerLeave={() => setHoverWho(null)}
              className="grid gap-[20px] @[560px]:grid-cols-2 items-start p-[10px] -m-[10px]"
            >
              {map("senate")}
              {map("house")}
            </div>
          </div>
          {/* A floor under the readout, so the card does not grow and shrink
              as the pointer moves down the rows. Three rows of a name and a
              district is the tallest it gets. */}
          <div
            className={`order-3 ${
              rowStyle === "leader" ? "mb-[11px]" : "mb-[10px]"
            }`}
          >
            <div className="h-[40px] mt-[16px] font-body text-xs text-ink-muted leading-[1.55]">
              {room && resting()}
            </div>
            <div className="h-[22px] text-right">
              {room && !NOT_LINKED.has(room) && (
                <Link
                  to={`/conferenceCommittees/${room}`}
                  className="inline-flex items-center gap-[5px] font-body font-semibold text-sm text-brand-ink hover:text-brand"
                >
                  Go to conference committee
                  <ArrowRight aria-hidden className="w-[14px] h-[14px]" />
                </Link>
              )}
            </div>
          </div>
          <div className="order-1 h-[230px] flex flex-col">
            {/* Named above its own box: the grid says which row is chosen by
                lighting it, and the right hand side should not make a reader
                look back across the card to find out. The slot holds its line
                whether or not there is a name in it, so arriving on a row does
                not shunt the box down the card. */}
            <div className="mb-[10px] min-h-[24px] flex items-center">
              {room ? (
                NOT_LINKED.has(room) ? (
                  <h2 className={`font-body text-lg leading-[1.3] ${PICKED}`}>
                    {displayName(
                      room,
                      COMMITTEES.find((c) => c.slug === room)?.short ?? "",
                    )}
                  </h2>
                ) : (
                  <Link
                    to={`/conferenceCommittees/${room}`}
                    className="group/go flex-1 flex items-center gap-[8px] cursor-pointer"
                  >
                    <h2
                      className={`font-body text-lg leading-[1.3] ${PICKED} group-hover/go:text-brand transition-colors`}
                    >
                      {displayName(
                        room,
                        COMMITTEES.find((c) => c.slug === room)?.short ?? "",
                      )}
                    </h2>
                    <ChevronRight
                      aria-hidden
                      strokeWidth={2.5}
                      className="ml-auto w-[18px] h-[18px] text-ink-faint group-hover/go:text-brand transition-colors"
                    />
                  </Link>
                )
              ) : shownRoom ? (
                // Hovered, the box is not yet anybody's: it says what kind of
                // thing is about to be named, in the same eyebrow the maps and
                // the member lists use.
                <p className={`${LABEL} text-ink-faint`}>
                  Conference Committee
                </p>
              ) : null}
            </div>
            {shownRoom ? (
              <>
                {/* A committee's six read as one thing, so they are drawn as
                    one: a single box holding both chambers' halves. */}
                {/* Hovered, the box is the shape of the answer rather than
                    the answer: the room it would fill and what to do to fill
                    it. The six arrive when the committee is pressed. */}
                {!room ? (
                  <div
                    className={`flex-1 rounded-card bg-[#f7f7f7] pl-[20px] pr-[16px] pt-[14px] pb-[26px] min-h-[194px] flex items-center justify-center ${
                      rowStyle === "leader" ? "mb-[11px]" : "mb-[10px]"
                    }`}
                  >
                    <p className="font-body text-sm text-ink-muted">
                      Click to see{" "}
                      {displayName(
                        shownRoom,
                        COMMITTEES.find((c) => c.slug === shownRoom)?.short ??
                          "",
                      )}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`grid gap-x-[20px] gap-y-[10px] @[560px]:grid-cols-2 rounded-card bg-wash pl-[20px] pr-[16px] pt-[14px] pb-[26px] min-h-[194px] transition-opacity ${
                      room ? "" : "opacity-60"
                    }`}
                  >
                    {/* Each half named inside the box, under the committee's
                      own name above it: three faces with no heading leave a
                      reader matching them to the maps by position. */}
                    {(["senate", "house"] as const).map((chamber) => (
                      <div key={chamber} className="flex flex-col gap-[10px]">
                        <p className={LABEL}>
                          {chamber === "senate" ? "Senate" : "House"}
                        </p>
                        {six(shownRoom, chamber).map((p) => card(p, shownRoom))}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : readers.length ? (
              // Each under their own chamber's map, in the order they were
              // pinned, with the one under the pointer last. A House member
              // printed under the Senate map is pointing at the wrong picture.
              <div className="grid gap-x-[20px] @[560px]:grid-cols-2">
                {(["senate", "house"] as const).map((chamber) => (
                  <div key={chamber} className="flex flex-col gap-[10px]">
                    {readers
                      .filter((p) => p.chamber === chamber)
                      .map((p) => (
                        <div key={p.seat}>
                          {card(p)}
                          {/* With nothing pressed, the space under the maps is
                              the only thing this card has to say about one
                              person, so it says the rest of it: the office
                              they hold in their chamber, where they hold one,
                              and the rooms they sit in. Indented to the name
                              above, not to the face. */}
                          <div className="mt-[12px] pl-[46px] flex flex-col gap-[10px]">
                            {p.title && (
                              <div>
                                <p className={LABEL}>Office</p>
                                <p className="mt-[3px] font-body text-xs text-caution-ink leading-[1.4]">
                                  {/^(House|Senate|Speaker|President)/.test(
                                    p.title,
                                  )
                                    ? p.title
                                    : `${p.chamber === "senate" ? "Senate" : "House"} ${p.title}`}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className={LABEL}>Conference</p>
                              <div className="mt-[3px] flex flex-col gap-[3px]">
                                {p.on.map((x) => (
                                  <p
                                    key={x.slug}
                                    className="font-body text-xs text-ink leading-[1.4]"
                                  >
                                    {x.committee}
                                    {x.chair && (
                                      <span className="ml-[6px] text-caution-ink">
                                        chair
                                      </span>
                                    )}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            ) : (
              // Nothing asked yet. The right hand side is the half of the card
              // that answers questions, so at rest it says which two questions
              // it answers rather than sitting there as white space.
              <div
                className={`flex-1 rounded-card bg-[#f7f7f7] pl-[20px] pr-[16px] pt-[46px] pb-[26px] min-h-[194px] flex items-center justify-center ${
                  rowStyle === "leader" ? "mb-[11px]" : "mb-[10px]"
                }`}
              >
                <p className="font-body text-sm text-ink-muted leading-[1.6] text-center text-balance max-w-[34ch]">
                  Hover over a district to view a legislator&rsquo;s committee
                  affiliation, or select a committee to view all six members.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A second copy of the card above, to try a different idea on.
 *
 * Deliberately a duplicate rather than a prop: the two are meant to diverge,
 * and sharing one component would mean every change having to be true of both.
 * Whichever one wins, the other goes.
 *
 * Twelve rooms, six seats each, against the districts they come from.
 *
 * The grid answers who is in the room; the maps answer where the room comes
 * from. They are one card because the two questions are asked in one gesture:
 * run the pointer down the rows and the maps fall to that committee's six
 * districts, stop on a face and that person is ringed in every room they sit
 * in, which is the only way to see the overlap without counting.
 *
 * Nothing is lost at rest. With no pointer on it the maps carry all fifty and
 * the card reads as the two cards it replaced.
 */
function RoomsTwo() {
  const [hoverRoom, setHoverRoom] = useState<string | null>(null);
  const [pinRoom, setPinRoom] = useState<string | null>(null);
  const [hoverWho, setHoverWho] = useState<string | null>(null);
  // Nothing on this card is kept except the committee. A person is read while
  // the pointer is on them and let go of when it leaves, which on a phone is
  // what a tap does.
  //
  // Which face the pointer is actually on, as against which person it is
  // reading: a person sits in up to three rows, and only the one under the
  // hand should be treated as touched.
  const [hoverAt, setHoverAt] = useState<{
    seat: string;
    slug: string;
  } | null>(null);
  /**
   * A district holds for as long as the pointer is on the map.
   *
   * Dragging across the map crosses the hairline between two cells, and that
   * gap reports as "nothing under the pointer" for a frame or two, which made
   * the card flicker back to rest between every district. So a cell leaving is
   * ignored: the reading changes when another cell claims it, and is let go of
   * when the pointer leaves the maps altogether, which the surrounding box
   * reports with a little room to spare.
   */
  const readDistrict = (k: string | null) => k && setHoverWho(k);
  //
  // A committee is chosen by pressing its row. Passing over the row previews
  // the same thing without committing to it: the six light up and the maps
  // take their districts, and nothing is ringed, because nothing has been
  // chosen yet.
  const room = pinRoom;
  const shownRoom = room ?? hoverRoom;
  const who = hoverWho;
  /** Whoever the pointer is on, if anyone. */
  const reading = who ? [who] : [];
  const isRead = (key: string) => reading.includes(key);
  const readers = reading
    .map((k) => ROSTER.find((p) => p.seat === k))
    .filter((p): p is RosterPerson => !!p);
  const leads = (p: RosterPerson, slug: string) =>
    p.on.some((x) => x.slug === slug && x.chair);
  const six = (slug: string, chamber: "house" | "senate") =>
    ROSTER.filter(
      (p) => p.chamber === chamber && p.on.some((x) => x.slug === slug),
    ).sort(
      (a, b) =>
        Number(leads(b, slug)) - Number(leads(a, slug)) ||
        (a.party === "R" ? 1 : 0) - (b.party === "R" ? 1 : 0) ||
        byStanding(a, b),
    );
  const inRoom = (slug: string) =>
    ROSTER.filter((p) => p.on.some((x) => x.slug === slug));
  // The maps always hold all fifty, so the headings keep counting the whole
  // bench. What changes is which of them are painted over the veil: the people
  // being read, and the six of a chosen committee.
  const shown = ROSTER;
  // Everyone in the chosen committee, wherever they turn up. A person on three
  // conferences is the same person in all three rows, and dimming their other
  // faces said the committee stopped at its own line.
  const chosen = new Set(shownRoom ? inRoom(shownRoom).map((p) => p.seat) : []);
  // What the maps paint over the veil. A person being read is the whole
  // answer, the same as in the grid: a committee's other five step back on the
  // map as well as in the box.
  // What the maps paint over the veil: the committee being shown, and anyone
  // being read. Both at once where a reader is inside a committee, with the
  // person forward and the room behind them.
  // With a committee on the card the maps hold that committee and stop there.
  // Reading one of its six changes the grid and the box; the map is the
  // picture of the room, and it should not be redrawn every time the pointer
  // moves inside it.
  const front = shownRoom ? inRoom(shownRoom).map((p) => p.seat) : reading;
  // Who the map will answer about. With a committee selected that is its six
  // and nobody else: the other districts are drawn as unlit, and a cell that
  // cannot be seen should not be able to be read either.
  const people = Object.fromEntries(
    (room ? inRoom(room) : ROSTER).map((p) => [
      p.seat,
      {
        name: p.name,
        district: p.district,
        party: p.party,
        portrait: p.portrait,
        title: p.title,
      },
    ]),
  );
  const map = (chamber: "senate" | "house") => {
    // The map is redrawn the moment a committee is in play, hovered or
    // pressed: down to that committee's districts, with the headings counting
    // them. A hover gets the same picture at less than full strength, so a
    // press is the difference between looking and choosing rather than the
    // difference between two drawings.
    const focus = shownRoom ? inRoom(shownRoom).map((p) => p.seat) : null;
    return (
      <span
        className={`block transition-opacity ${
          focus && !room ? "opacity-60" : ""
        }`}
      >
        <VoteMap
          key={chamber}
          chamber={chamber}
          // Reading one person sends everything else back: inside a committee
          // that is its other five, and outside one it is the whole bench
          // behind a veil.
          dim={reading.length > 0}
          veil={!focus && reading.length > 0}
          veilAt={0.35}
          highlight={focus ?? shown.map((p) => p.seat)}
          selected={focus ? reading : front}
          enlarged={focus ? [] : reading}
          onHover={readDistrict}
          // A press on a district is a tap's hover and nothing else: on a
          // phone it reads that district, and on a desktop it repeats what the
          // pointer has already said rather than undoing it.
          onPin={(k) => setHoverWho(k)}
          people={people}
        />
      </span>
    );
  };
  const seat = (p: RosterPerson, lit: boolean, slug: string) => {
    // A face in this grid answers nothing. The row is the only target on the
    // left: the pointer chooses a committee, not a person, and a face that
    // took the card over on the way past was answering a question the reader
    // had not asked. Reading one person is what the box and the maps are for.
    //
    // Sitting back means: outside the committee being shown, and not whoever
    // is being read from one of those. The committee being shown is the one
    // pressed or, failing that, the one the pointer is over.
    // Whether this is the face the pointer is actually on. A hover that came
    // from the box or the map is on a person rather than on a face, and then
    // no face in the grid is the one being touched: they all take the ring.
    const here = hoverAt
      ? hoverAt.seat === p.seat && hoverAt.slug === slug
      : false;
    const back = chosen.size
      ? slug !== shownRoom && !isRead(p.seat)
      : // Nothing asked yet: the whole wall stands at full. Dimming is what
        // happens when there is something to dim against.
        //
        // With no committee on the card, reading someone lights the face
        // under the hand and nothing else. Their other rooms light up only
        // once a committee has been pressed, where the question is what that
        // room reaches into.
        reading.length
        ? // Read from the map or the box, the person lights wherever they sit;
          // read from a face in the grid, only that face lights.
          !(hoverAt ? here : who === p.seat)
        : // At rest the wall sits back at the middle strength: it is a wall of
          // faces nobody has asked about yet, and the maps beside it are the
          // thing that is actually saying something.
          true;
    return (
      // Room for a ring on every side. The ink ring is drawn outside the
      // face, so without the padding it would cross into the row above and
      // below and be cut by whichever band is painted over it.
      //
      // The face reads on hover and nothing more: the ring marks the person
      // and the maps follow them, while the press underneath still belongs to
      // the row, so pointing at someone never takes a committee away.
      <span
        key={p.seat}
        className="flex px-[5px] py-[7px]"
        // With a row selected the only moves left are releasing it or taking
        // another: a face outside that row answers nothing, or the reader
        // ends up reading a person out of a room they did not choose.
        onMouseEnter={() => {
          if (!room || slug !== room) return;
          setHoverWho(p.seat);
          setHoverAt({ seat: p.seat, slug });
        }}
        onMouseLeave={() => {
          setHoverWho(null);
          setHoverAt(null);
        }}
      >
        {/* The ring is the selected state, in the grid and in the list alike.
          The pointer does not borrow it: hovering only sends everything else
          back. */}
        <RowFace
          p={p}
          size={30}
          tip={false}
          // Not on the face under the hand: the pointer is already on it, so
          // the ring there says nothing. It goes on the other instances of
          // that person, which is the thing worth pointing out, and on their
          // entry in the box.
          // The ring marks the other instances of whoever is being read, and
          // only while a committee is on the card: reading a face on its own
          // is about that face, not about the rooms it turns up in.
          ring={who === p.seat && !here}
          // Dim at rest, and dim again outside whatever is being read. A
          // chosen committee lights its own row and no further: the same
          // people elsewhere are other rooms' business until the pointer asks
          // about one of them, and then they light wherever they sit.
          dim={back}
          // Gray is about the room: everyone outside the committee being
          // shown loses their color. The person being read keeps theirs
          // wherever they are standing, and still sits back, so their other
          // rooms read as "also here" rather than as part of the answer.
          // Gray is for rows nobody is pointing at. The hovered row keeps its
          // color even while another committee is pressed.
          // A person's other rooms only come out of the gray once a committee
          // has been pressed. With nothing held, reading someone is about the
          // face under the hand and the rest of the wall stays as it was.
          gray={
            chosen.size > 0 &&
            slug !== room &&
            slug !== hoverRoom &&
            !(!!room && isRead(p.seat))
          }
          // At rest the whole wall sits at the middle strength rather than
          // the deep one: nothing has been asked about yet, so nothing has
          // been pushed back behind anything else.
          // A row under the pointer is lit but not fully: color, at the
          // middle strength, and a step stronger where nothing has been
          // pressed for it to sit under.
          lift={!room}
          soft={
            (!chosen.size && !reading.length) ||
            (!!room && isRead(p.seat)) ||
            (slug === hoverRoom && slug !== room)
          }
        />
      </span>
    );
  };
  // The committee page's own conferee row, at its size and in its order: the
  // face with the party ring, the surname, the office beside it, the district
  // under it. A reader arriving from that page should not have to learn a
  // second way of reading the same six people.
  const card = (p: RosterPerson, slug?: string) => {
    // Inside a committee's box the pointer reads one of the six: that one
    // takes the ring and the other five sit back. In the list of pins there
    // is nothing to sit back from, so they stay as they are.
    // Reading one of the six sends the other five back, here as in the row.
    const back = !!who && who !== p.seat;
    return (
      <div
        key={p.seat}
        // A previewed committee's box is a picture of the room, not somewhere
        // to point: until the row has been pressed, nothing in here answers.
        onMouseEnter={() => room && setHoverWho(p.seat)}
        onMouseLeave={() => room && setHoverWho(null)}
        // A pill on hover, with the way out at its far end. The entry is the
        // whole target, as it was; the X says so, and the ground under it
        // says how far the target reaches.
        className="group/pin relative flex items-center gap-[10px] cursor-pointer"
      >
        {/* Nothing in this list sits back. Everyone in it is pinned or
            under the pointer, which is to say everyone in it was asked for.
            No tooltip anywhere on this card: the card answers the pointer
            itself, and a label arriving on top of that answer is a second
            answer to the same gesture. */}
        {/* No clear badge here: the grid is where a pin is let go of, and
            this list has its own instructions coming. */}
        {/* The ring belongs to a committee that has been pressed. While this
            box is only a preview of the row under the pointer, nothing in it
            is marked. */}
        <RowFace
          p={p}
          size={36}
          tip={false}
          dim={back}
          ring={!!room && who === p.seat}
        />
        <span className="min-w-0">
          <span className="block leading-[1.3] whitespace-nowrap">
            <span
              className={`font-body font-semibold text-sm ${
                back ? "text-ink-faint" : "text-ink"
              }`}
            >
              {surname(p.name)}
            </span>
            {slug && leads(p, slug) && (
              <span
                className={`ml-[6px] font-body text-xs ${
                  back ? "text-ink-faint" : "text-caution-ink"
                }`}
              >
                chair
              </span>
            )}
          </span>
          <span
            className={`block font-body text-xs leading-[1.4] ${
              back ? "text-ink-faint" : "text-ink-muted"
            }`}
          >
            {p.district}
          </span>
        </span>
      </div>
    );
  };
  return (
    <div className="@container mt-[20px] bg-surface border border-line rounded-card px-[18px] pt-[16px] pb-[18px]">
      <p className={LABEL}>
        Twelve rooms · {TALLY.seats} seats · {TALLY.people} people
      </p>
      <div className="mt-[12px] flex flex-col @[900px]:flex-row gap-[24px]">
        <div className="shrink-0">
          {/* No mark on the faces. Every seat in a column holds the same
              office in every room, so the column is the label. */}
          <div className="w-max">
            <div className="flex items-end gap-[14px] pb-[6px]">
              <span className="w-[150px] shrink-0" aria-hidden />
              {(["Senate", "House"] as const).map((chamber, i) => (
                <Fragment key={chamber}>
                  {i > 0 && <span className="w-[14px]" aria-hidden />}
                  <span className="flex flex-col items-stretch">
                    <span className={`${LABEL} pb-[6px] text-center`}>
                      {chamber}
                    </span>
                    {/* The middle column goes unnamed. "Member" was the one
                        head that said nothing the column did not already say,
                        and at this width it ran into "Minority". */}
                    <span className="flex items-end">
                      {["Chair", "", "Minority"].map((head, k) => (
                        <span
                          key={k}
                          className="w-[40px] shrink-0 text-center font-body text-2xs text-ink-faint leading-none"
                        >
                          {head}
                        </span>
                      ))}
                    </span>
                  </span>
                </Fragment>
              ))}
            </div>
            {COMMITTEES.map((c) => {
              const on = room === c.slug;
              // A row stays lit either because it is the row being read or
              // because the person being read sits in it. That second rule is
              // the whole point of the ring: three rows light at once and the
              // reader sees the overlap without counting.
              // Only the chosen committee's own name stays dark. The rooms
              // its people also sit in light up while the pointer is on one
              // of them, and go back when it leaves.
              const holds = readers.some((p) =>
                p.on.some((x) => x.slug === c.slug),
              );
              // At rest every name is back too: the card opens as a wall
              // nobody has asked about, and a row of full-strength names over
              // dimmed faces was half the card still at full strength.
              const back = !on && !holds;
              return (
                <div
                  key={c.slug}
                  // Coming back to the wall is the next answer, so whatever
                  // the map was holding is let go of here.
                  onMouseEnter={() => {
                    setHoverRoom(c.slug);
                    if (!room) setHoverWho(null);
                  }}
                  onMouseLeave={() => setHoverRoom(null)}
                  // The press leaves the page rather than choosing on it:
                  // a new tab, so the card a reader was working through is
                  // still there when they come back. A committee with no page
                  // behind it is not opened at all.
                  onClick={() => {
                    if (NOT_LINKED.has(c.slug)) return;
                    window.open(
                      `/conferenceCommittees/${c.slug}`,
                      "_blank",
                      "noopener",
                    );
                  }}
                  // Hover is paint only. The row says it is a thing you are
                  // over, and nothing on the right hand side moves: the maps
                  // and the list still answer to a face or a district.
                  // The whole strip is the target, not the faces on it: full
                  // width of the grid, with the padding inside the row so the
                  // press reaches past the last face and before the name.
                  className={`relative flex items-center gap-[14px] rounded-control px-[8px] -mx-[8px] cursor-pointer transition-colors hover:bg-wash ${
                    on ? "bg-wash" : ""
                  }`}
                >
                  <span
                    // Dark for the committee being shown, pressed or merely
                    // passed over, and for any room holding someone being
                    // read. Everything else sits back.
                    // Three states, and only one of them is the subject. The
                    // Two schemes. With nothing held, every name is ink and
                    // weight alone marks what the pointer is on. With a
                    // committee held, it is the only one in ink and the column
                    // behind it goes gray.
                    className={`w-[150px] shrink-0 font-body text-sm leading-[1.3] transition-colors ${
                      on
                        ? "font-bold text-ink"
                        : c.slug === hoverRoom
                          ? "font-medium text-ink"
                          : shownRoom
                            ? // A committee is being shown, pressed or hovered:
                              // the rest of the column goes back, and a room
                              // holding the person being read comes halfway.
                              back
                              ? "font-normal text-ink-faint"
                              : "font-semibold text-ink-muted"
                            : // Nothing held: every name is ink and weight
                              // alone says what the pointer is on.
                              back
                              ? "font-normal text-ink"
                              : "font-medium text-ink"
                    }`}
                  >
                    {displayName(c.slug, c.short)}
                  </span>
                  <span className="flex items-center">
                    {six(c.slug, "senate").map((p) => seat(p, on, c.slug))}
                  </span>
                  <span className="w-[14px]" aria-hidden />
                  <span className="flex items-center">
                    {six(c.slug, "house").map((p) => seat(p, on, c.slug))}
                  </span>
                  {/* Where the press goes. It keeps its place in the row, so
                      the row is no wider with it than without, and it only
                      appears on the row under the pointer. */}
                  <ExternalLink
                    aria-hidden
                    strokeWidth={2.25}
                    className={`shrink-0 ml-[6px] -translate-x-[10px] w-[13px] h-[13px] text-ink-muted transition-opacity ${
                      c.slug === shownRoom && !NOT_LINKED.has(c.slug)
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          {/* Equal columns, so the two maps are drawn at the same size and
              the lists under them start on the same line. */}
          <div className="relative">
            {/* The pair is one area to the pointer: the gutter between the
                two maps is inside it, so crossing from the Senate to the House
                does not let go of what was being read. The padding gives the
                edges a little slack, and leaving this box is what clears it. */}
            <div
              onPointerLeave={() => setHoverWho(null)}
              className="grid gap-[20px] @[560px]:grid-cols-2 items-start p-[10px] -m-[10px]"
            >
              {map("senate")}
              {map("house")}
            </div>
          </div>
          {/* A floor under the readout, so the card does not grow and shrink
              as the pointer moves down the rows. Three rows of a name and a
              district is the tallest it gets. */}
          <div className="mt-[24px] min-h-[104px]">
            {shownRoom ? (
              <>
                {/* Named above its own box: the grid says which row is chosen
                    by lighting it, and the right hand side should not make a
                    reader look back across the card to find out. */}
                {/* Printed for whichever committee is being shown, pressed
                    or hovered: the right hand side answers the pointer at the
                    same moment the row does. */}
                {/* The same name at the same weight and size as the row it
                    came from, so the two read as one thing rather than as a
                    heading about it. */}
                <p
                  // Invisible while the committee is only being hovered, but
                  // still in the layout, so the box below it does not move
                  // when the name arrives.
                  className={`font-body font-bold text-sm text-ink leading-[1.3] mb-[10px] transition-opacity ${
                    room ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {displayName(
                    shownRoom,
                    COMMITTEES.find((c) => c.slug === shownRoom)?.short ?? "",
                  )}
                </p>
                {/* A committee's six read as one thing, so they are drawn as
                    one: a single box holding both chambers' halves. */}
                {/* Hovered, the box is the shape of the answer rather than
                    the answer: the room it would fill and what to do to fill
                    it. The six arrive when the committee is pressed. */}
                {!room ? (
                  <div className="rounded-card bg-wash px-[16px] py-[14px] min-h-[104px] flex items-center justify-center">
                    <p className="font-body text-sm text-ink-muted">
                      Click to see{" "}
                      {displayName(
                        shownRoom,
                        COMMITTEES.find((c) => c.slug === shownRoom)?.short ??
                          "",
                      )}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`grid gap-x-[20px] gap-y-[10px] @[560px]:grid-cols-2 rounded-card bg-wash px-[16px] py-[14px] transition-opacity ${
                      room ? "" : "opacity-60"
                    }`}
                  >
                    {/* Each half named inside the box, under the committee's
                      own name above it: three faces with no heading leave a
                      reader matching them to the maps by position. */}
                    {(["senate", "house"] as const).map((chamber) => (
                      <div key={chamber} className="flex flex-col gap-[10px]">
                        <p className={LABEL}>
                          {chamber === "senate" ? "Senate" : "House"}
                        </p>
                        {six(shownRoom, chamber).map((p) => card(p, shownRoom))}
                      </div>
                    ))}
                  </div>
                )}
                {/* Out of the card and into the committee's own page. Only
                    once one has been pressed: a hovered preview is not
                    somewhere a reader has decided to go. */}
                {room && !NOT_LINKED.has(room) && (
                  <p className="mt-[12px] text-right">
                    <Link
                      to={`/conferenceCommittees/${room}`}
                      className="inline-flex items-center gap-[5px] font-body font-semibold text-sm text-brand-ink hover:text-brand"
                    >
                      Go to conference committee
                      <ArrowRight aria-hidden className="w-[14px] h-[14px]" />
                    </Link>
                  </p>
                )}
              </>
            ) : readers.length ? (
              // Each under their own chamber's map, in the order they were
              // pinned, with the one under the pointer last. A House member
              // printed under the Senate map is pointing at the wrong picture.
              <div className="grid gap-x-[20px] @[560px]:grid-cols-2">
                {(["senate", "house"] as const).map((chamber) => (
                  <div key={chamber} className="flex flex-col gap-[10px]">
                    {readers
                      .filter((p) => p.chamber === chamber)
                      .map((p) => card(p))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The fifty once each, in three tiers.
 *
 * The two cards below it count seats, so a face there is a seat and the same
 * person appears three times. This one counts people: one face each, grouped
 * by how many rooms they are in, both chambers in the one card because the
 * fact it carries is about the set rather than about either bench.
 */
function Bench() {
  const tier = (n: number) =>
    ROSTER.filter((p) => p.on.length === n).sort(
      // Senate first, then standing inside each chamber.
      (a, b) =>
        (a.chamber === "senate" ? 0 : 1) - (b.chamber === "senate" ? 0 : 1) ||
        byStanding(a, b),
    );
  const word = (n: number) => (n === 3 ? "Three" : n === 2 ? "Two" : "One");
  return (
    // The three tiers side by side rather than one above the other, each given
    // width in proportion to how many people are in it, so the faces wrap at
    // about the same number of rows in all three and the widths themselves say
    // how lopsided the set is.
    <div className="mt-[20px] bg-surface border border-line rounded-card px-[18px] pt-[16px] pb-[18px] flex flex-wrap items-end gap-x-[28px] gap-y-[20px]">
      {[3, 2, 1].map((n) => {
        const people = tier(n);
        if (!people.length) return null;
        return (
          <div
            key={n}
            style={{ flexGrow: people.length, flexBasis: 0 }}
            className="min-w-[132px]"
          >
            {/* flex-wrap-reverse, so the rows fill from the bottom up and
                each tier stands on the card's floor like a bar. The label
                sits under it, where a chart's categories go. */}
            <div className="flex flex-wrap-reverse content-end items-end gap-[6px]">
              {people.map((p) => (
                // The same reserve the walls below use, so a ring spends
                // space that was already set aside for it.
                <span key={p.seat} className="flex p-[4px]">
                  <RowFace
                    p={p}
                    size={34}
                    chairMark={p.on.some((x) => x.chair)}
                  />
                </span>
              ))}
            </div>
            <p className={`${LABEL} mt-[10px]`}>
              {word(n)} committee{n > 1 ? "s" : ""} · {people.length}{" "}
              {people.length === 1 ? "person" : "people"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Everyone() {
  // One column per person, ordered by how many conferences they are on and
  // then by standing: chairmanships, conferences, the majority bench, then
  // rank in the chamber.
  const side = (p: RosterPerson) => (p.party === "R" ? 1 : 0);
  const all = (chamber: "senate" | "house") =>
    ROSTER.filter((p) => p.chamber === chamber).sort(
      (a, b) => b.on.length - a.on.length || byStanding(a, b),
    );
  const seats = (chamber: "senate" | "house") =>
    all(chamber).reduce((n, p) => n + p.on.length, 0);
  /** Everyone with either a second conference or a gavel. */
  const held = (p: RosterPerson) =>
    p.on.length > 1 || p.on.some((x) => x.chair);
  // A seat is a face. Someone sitting in three rooms is drawn three times,
  // stacked, so the column is as tall as their claim on the session and the
  // wall counts seats rather than people. Columns grow upwards from a common
  // floor, which is what makes two of them comparable at a glance.
  const column = (p: RosterPerson) => (
    <span key={p.seat} className="flex flex-col-reverse items-center gap-[2px]">
      {p.on
        // Chaired seats at the foot of the stack, so the ringed faces sit on
        // one line across the wall instead of at whatever height the committee
        // order happened to put them.
        .slice()
        .sort((a, b) => Number(b.chair) - Number(a.chair))
        .map((seat) => (
          // Every face reserves the room a chair's ring needs, whether it
          // wears one or not. A ring is a box shadow, which takes no space in
          // the layout, so without the reserve a ringed face sat as close to
          // its neighbor as a plain one and the wall lost its rhythm.
          <span key={seat.slug} className="flex p-[4px]">
            <RowFace p={p} size={28} chairMark={seat.chair} />
          </span>
        ))}
    </span>
  );
  return (
    // One card per chamber, side by side. A chamber's bench is one line of
    // columns and nothing wraps: a wrapped line puts the twentieth person
    // under the first, and the length of the line is the fact the card is for.
    // Past the card's own width the line scrolls instead.
    <div className="mt-[20px] grid gap-[16px] sm:grid-cols-2">
      {(["senate", "house"] as const).map((chamber) => (
        <div
          key={chamber}
          // min-w-0, or the grid column widens to hold the whole line and
          // the two cards stop being halves.
          className="min-w-0 bg-surface border border-line rounded-card px-[18px] pt-[16px] pb-[18px] overflow-x-auto"
        >
          <p className={LABEL}>
            {chamber === "senate" ? "Senate" : "House"} · {seats(chamber)} seats
            · {all(chamber).length} people
          </p>
          {/* Two lines. The first is everyone carrying more than one room or
              a gavel in the one they have; the second is the single seat held
              without a chairmanship, which is most of the chamber and the
              least remarkable thing in it. Both parties sit in both lines. */}
          <div className="mt-[12px] flex items-end gap-[2px] w-max">
            {/* Only this line takes the party as its first key: the minority
                holds no gavel, so running them to the end of it puts every
                ring in one run. Sorting is stable, so seats and standing still
                order each party inside its own block. */}
            {all(chamber)
              .filter(held)
              .sort((a, b) => side(a) - side(b))
              .map(column)}
          </div>
          <div className="mt-[14px] flex items-end gap-[2px] w-max">
            {all(chamber).map(column)}
          </div>
        </div>
      ))}
    </div>
  );
}

/** How many committees the rows under it hold, said once above them. */
function Tier({ n }: { n: number }) {
  return (
    <li className="px-[18px] pt-[16px] pb-[6px] border-t border-line first:border-0 first:pt-0">
      <p className={LABEL}>{n === 3 ? "Three committees" : "Two committees"}</p>
    </li>
  );
}

/**
 * Who the pointer is on, in one line under both maps.
 *
 * One readout rather than a tooltip on each cell. A cell here can be a sliver
 * on the coast, and a card anchored to it would cover its neighbours, which are
 * the next thing a reader wants to try. Fixed height, so sweeping the map never
 * moves the legend under it or the maps themselves.
 */
function Readout({ p }: { p: RosterPerson | null }) {
  return (
    <div
      aria-live="polite"
      className="mt-[14px] mb-[16px] min-h-[70px] flex items-start gap-[12px]"
    >
      {p ? (
        <>
          <Face p={p} />
          <span className="min-w-0">
            <span className="block leading-[1.35]">
              <span className="font-body font-semibold text-base text-ink">
                {p.name}
              </span>
              <span className="ml-[6px] font-body text-xs text-ink-muted">
                {p.party === "R" ? "Republican" : "Democrat"}
              </span>
              {p.title && (
                <span className="ml-[6px] font-body text-xs text-caution-ink">
                  {shortTitle(p.title)}
                </span>
              )}
            </span>
            <span className="block font-body text-xs text-ink-muted leading-[1.45]">
              {p.chamber === "senate" ? "Senate" : "House"}, {p.district}
            </span>
            {/* The same chips the rows above use, so a chaired conference is
                amber here too rather than the word "(chair)" in a run of
                prose. */}
            <span className="flex flex-wrap gap-[5px] mt-[5px]">
              {p.on.map((s) => (
                <Seat key={s.slug} committee={s.committee} chair={s.chair} />
              ))}
            </span>
          </span>
        </>
      ) : (
        <p className="font-body text-base text-ink-faint leading-[1.5]">
          Hover, tap or tab a filled district to read who holds it.
        </p>
      )}
    </div>
  );
}

function Swatch({ fill, label }: { fill: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-[6px]">
      <span aria-hidden className={`w-[10px] h-[10px] rounded-[2px] ${fill}`} />
      <span className="font-body text-xs text-ink-muted">{label}</span>
    </span>
  );
}

/**
 * The fifty as geography: every district with a conferee in it, both chambers.
 *
 * The two maps encode exactly the same thing, so there is one legend under the
 * pair. Two would say the Senate map and the House map mean different things,
 * when the only difference between them is how much of a chamber is lit.
 */
function Districts() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const showing = hovered ?? picked;
  const people = Object.fromEntries(
    ROSTER.map((p) => [
      p.seat,
      {
        name: p.name,
        district: p.district,
        party: p.party,
        portrait: p.portrait,
        title: p.title,
      },
    ]),
  );
  const map = (chamber: "senate" | "house") => (
    <VoteMap
      key={chamber}
      chamber={chamber}
      // Every filled district is equally the subject, so none of them sits
      // back: dimming the other forty-nine to read one would say they had
      // stopped counting.
      dim={false}
      highlight={ROSTER.filter(
        (p) => (p.chamber === "senate") === (chamber === "senate"),
      ).map((p) => p.seat)}
      selected={showing ? [showing] : []}
      onHover={setHovered}
      onPin={(k) => setPicked((v) => (v === k ? null : k))}
      people={people}
    />
  );
  // The maps, their own chamber headings, and the one line that answers a
  // pointer. Everything else the card used to carry is parked below.
  return (
    <div className="bg-surface border border-line rounded-card p-[18px]">
      {/* Stacked on a phone and side by side once there is room for both. */}
      <div className="grid gap-x-[20px] gap-y-[20px] @[520px]:grid-cols-2">
        {map("senate")}
        {map("house")}
      </div>
      <Readout p={showing ? (ROSTER_BY_SEAT[showing] ?? null) : null} />
    </div>
  );
}

// The card this was cut down from, parked here while the experiment above
// runs: the words, the legend and the note on how the cells are drawn, which
// the stripped version leaves out.
//
// function Districts() {
//   const [hovered, setHovered] = useState<string | null>(null);
//   const [picked, setPicked] = useState<string | null>(null);
//   const showing = hovered ?? picked;
//   const people = Object.fromEntries(
//     ROSTER.map((p) => [
//       p.seat,
//       {
//         name: p.name,
//         district: p.district,
//         party: p.party,
//         portrait: p.portrait,
//         title: p.title,
//       },
//     ]),
//   );
//   const map = (chamber: "senate" | "house") => (
//     <VoteMap
//       key={chamber}
//       chamber={chamber}
//       // Every filled district is equally the subject, so none of them sits
//       // back: dimming the other forty-nine to read one would say they had
//       // stopped counting.
//       dim={false}
//       highlight={ROSTER.filter(
//         (p) => (p.chamber === "senate") === (chamber === "senate"),
//       ).map((p) => p.seat)}
//       selected={showing ? [showing] : []}
//       onHover={setHovered}
//       onPin={(k) => setPicked((v) => (v === k ? null : k))}
//       people={people}
//     />
//   );
//   return (
//     <div className="bg-surface border border-line rounded-card p-[18px]">
//       <p className={LABEL}>Where they come from</p>
//       <p className="font-body text-base text-ink-muted leading-[1.6] mt-[8px] max-w-[62ch]">
//         Every district with a conferee in it, filled in that member&rsquo;s
//         party color.
//         {!SHARED_DISTRICTS && (
//           <> No district holds two, so each filled cell is one person.</>
//         )}
//       </p>
//       {/* Stacked on a phone and side by side once there is room for both. A map
//           given a whole column grows to fill it, and two full-width maps would
//           put a screen and a half of coastline between the words above and the
//           legend below. */}
//       {/* Capped, so a wide card does not turn the pair into two wall maps.
//           Side by side at four hundred or so each is the size at which a
//           district is still a shape rather than a county. */}
//       <div className="grid gap-x-[20px] gap-y-[20px] mt-[16px] max-w-[860px] @[520px]:grid-cols-2">
//         {map("house")}
//         {map("senate")}
//       </div>
//       <Readout p={showing ? (ROSTER_BY_SEAT[showing] ?? null) : null} />
//       <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[6px] pt-[12px] border-t border-line-ghost">
//         <Swatch fill="bg-official" label="Democrat" />
//         <Swatch fill="bg-negative" label="Republican" />
//         <Swatch fill="bg-sunken border border-line" label="No conferee" />
//       </div>
//       <p className="font-body text-xs text-ink-faint leading-[1.6] mt-[10px] max-w-[70ch]">
//         One cell per seat, grown from a single point inside each district rather
//         than traced from its boundary. The cells are nothing like equal in size
//         and the shape of one is not the shape of the district, so these are maps
//         to count off rather than to measure.
//       </p>
//     </div>
//   );
// }

/**
 * The second section: the fifty people behind the twelve rows.
 *
 * Its own heading, and the same measure the list keeps, so it reads as
 * something further down the page rather than as a wider, louder answer to it.
 *
 * Why a roster and not a ranking. Nobody sits on more than three committees, so
 * a chart of who sits on the most would be eight threes, six twos and thirty-six
 * ones: a shape that implies a hierarchy the appointments do not have. The
 * finding the data does carry is the split, half the seats to fourteen people,
 * and a roster in two tiers shows that without drawing a distribution out of a
 * range of three.
 */
function WhoSitsOnThem() {
  return (
    <section className="@container mt-[56px]">
      <h2 className="font-display font-normal text-xl text-ink text-balance max-w-[720px]">
        Who sits on them
      </h2>
      <p className="font-body text-base text-ink-muted leading-[1.6] mt-[10px] max-w-[62ch]">
        {TALLY.committees} committees, {TALLY.seats} seats, {TALLY.people}{" "}
        people. No one sits on more than three of them, so there is no single
        figure running the end of the session. What the count shows instead is a
        narrow bench: {TALLY.repeat} of the {TALLY.people} hold{" "}
        {TALLY.repeatSeats} of the {TALLY.seats} seats between them, and the
        narrowest part of it is the minority side, where {SIDES.senateR.people}{" "}
        Republican senators take all {SIDES.senateR.seats} of the Senate&rsquo;s
        Republican places.
        {SAME_SPLIT && (
          <>
            {" "}
            All {TALLY.committees} are put together the same way: two Democrats
            and one Republican from each chamber, without exception.
          </>
        )}
      </p>

      <Figures />

      <Rooms />

      <Bench />

      <Everyone />

      {/* Clipped like the list above, so a row at either end keeps the card's
          corner. */}
      <div className="mt-[20px] max-w-[720px] bg-surface border border-line rounded-card overflow-hidden">
        <div className="px-[18px] pt-[16px] pb-[12px]">
          <p className={LABEL}>
            On more than one · {TALLY.repeat} of {TALLY.people}
          </p>
        </div>
        <ul>
          {REPEATERS.flatMap((p, i) => {
            const opens = i === 0 || REPEATERS[i - 1].on.length !== p.on.length;
            return [
              ...(opens
                ? [<Tier key={`tier-${p.on.length}`} n={p.on.length} />]
                : []),
              <RepeaterRow key={p.code} p={p} />,
            ];
          })}
        </ul>
        <div className="px-[18px] py-[14px] border-t border-line bg-wash">
          <p className="font-body text-xs text-ink-muted leading-[1.6]">
            Amber marks a committee they chair. Chairing spreads further than
            membership does: {TALLY.chairs} different people hold the{" "}
            {TALLY.chairSeats} chairmanships and only {TALLY.chairsTwice} hold
            two, so these rooms repeat their members far more than their chairs.
            The other {TALLY.people - TALLY.repeat} conferees sit on one
            committee each, and all {TALLY.people} are a filled district on the
            maps above.
          </p>
        </div>
      </div>
    </section>
  );
}

export function ConferenceCommittees() {
  useDeviceViewport();
  return (
    <div className="bg-ground min-h-screen font-body text-ink">
      <SiteNav inner="w-full px-[20px] sm:px-[32px]" />
      <main className="mx-auto max-w-[1180px] px-[20px] sm:px-[32px] pt-[48px] pb-[80px]">
        {/* The detail page's hero, at the same face and weight, so arriving
            here and arriving there feel like one place. */}
        <h1 className="font-body font-bold text-[28px] sm:text-[40px] leading-[1.2] text-brand">
          Conference Committees
        </h1>

        {/* One paragraph. The mechanism, and the half that makes it matter:
            nobody watches, and neither chamber can amend what comes back. */}
        <p className="font-body text-base sm:text-lg text-ink-muted leading-[1.55] mt-[12px]">
          When the House and the Senate pass different versions of the same
          bill, six legislators, three from each chamber, meet to reconcile them
          into one text. Both chambers then vote on that text and, if passed, it
          becomes &ldquo;enacted&rdquo; and is sent to the Governor to sign.
        </p>

        {/* Everything else on this page is parked while the card below is
            worked on: the maps card, the twelve-row list and the whole "Who
            sits on them" section. Uncomment the block at the foot of this
            component to bring them back. */}
        {/* The same card three times, each answering the same question a
            different way: how a row is told apart from the one under it.
            Labelled above rather than inside, so the cards themselves stay
            exactly as they would ship. Two of these come out once one is
            chosen. */}
        {/* The banded and the leader cards are parked while the ruled one is
            worked on. Uncomment either to put it back for comparison. */}
        {/* <p className={`${LABEL} mt-[28px]`}>One · banded rows</p> */}
        {/* <Rooms rowStyle="band" /> */}
        {/* <p className={`${LABEL} mt-[36px]`}>Two · leader to the faces</p> */}
        {/* <Rooms rowStyle="leader" /> */}
        <Rooms rowStyle="rule" />
        {/* The second card, the one whose rows open the committee page in a
            new tab, is parked. Uncomment to put it back below the first. */}
        {/* <RoomsTwo /> */}
      </main>
    </div>
  );
}

// ── Parked ──────────────────────────────────────────────────────────────
//
// The page's other blocks, in the order they were in, commented out rather
// than deleted so they can go back where they were.
//
// {/* The maps before the list. Where the fifty come from is a fact
// about the whole set, and the twelve rows below are what a reader
// does something with. */}
// {/* Its own container. The card's maps pair off at 520px of card
// rather than of window, and up here it is outside the section that
// used to provide that container. */}
// <div className="@container mt-[40px]">
// <Districts />
// </div>
//
// <div className="mt-[40px]">
// {/* One object with twelve rows, not twelve cards. The page is a
// choice between things of equal weight, and hairlines say that
// where a stack of bordered cards says twelve separate matters.
// Clipped, so a hovered first or last row keeps the corner. */}
// <ul className="mt-[12px] bg-surface border border-line rounded-card overflow-hidden">
// {COMMITTEES.map((c, i) => {
// const rec = recordForSlug(c.slug);
// // From the scorecard record rather than the explorer data, which
// // is missing both numbers for economic development.
// // The two bill numbers and nothing else. A row that cannot be
// // opened says so by being dimmed, which is a thing a reader
// // already understands, rather than by explaining itself in
// // words beside every other row's facts.
// const meta = [rec?.senate, rec?.house]
// .filter(Boolean)
// .join(" · ");
// // The act as it is actually titled, taken from the Senate bill
// // and falling back to the House's where we hold only that one.
// // The two chambers title the same act differently often enough
// // that one of them has to be chosen rather than both printed.
// // Without its opening words: every act is "An Act", so the
// // two words are a column of noise down the twelve rows.
// const act = (
// (rec?.senate && BILLS[rec.senate]?.title) ||
// (rec?.house && BILLS[rec.house]?.title) ||
// ""
// ).replace(/^an act\s+/i, "");
// const off = NOT_LINKED.has(c.slug);
// const row = `flex items-center gap-[12px] px-[18px] py-[13px] ${
// i > 0 ? "border-t border-line-ghost" : ""
// }`;
// // Whether one of the reader's own is on it, and which.
// // The reader's own, if either is in this room.
// const mine = ROSTER.filter(
// (p) => MINE[p.seat] && p.on.some((x) => x.slug === c.slug),
// );
// const inside = (
// <span className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-[16px]">
// {/* A floor the height of a portrait, so a row with one is
// not taller than a row without: the face is 36px with its
// ring and the line of type is about 24. */}
// <span className="min-w-0 min-h-[36px] flex items-center gap-[10px]">
// <span
// className={`font-body text-lg leading-[1.35] ${
// off ? "text-ink-muted" : "text-ink"
// }`}
// >
// {displayName(c.slug, c.short)}
// </span>
// {/* Between the name and the numbers: the name is what we
// call it, this is what it is called. Truncated rather
// than wrapped, so a long title cannot make one row
// taller than the eleven around it. */}
// {act && (
// <span className="min-w-0 truncate font-body italic text-sm text-ink-muted leading-[1.4]">
// &ldquo;{act}&rdquo;
// </span>
// )}
// {/* Beside the name: the two numbers are what the name is
// short for. */}
// <span className="shrink-0 font-body text-xs text-ink-faint leading-[1.4]">
// {meta}
// </span>
// </span>
// {/* At the far edge. On a page whose job is to say which
// conference to open, whether one of the reader's own is in
// the room is the fact that sorts twelve rows, and the end
// of the row is where the eye lands last. */}
// {mine.length > 0 && (
// <span className="shrink-0 flex items-center gap-[6px] sm:ml-auto">
// {mine.map((p) => (
// <RowFace key={p.seat} p={p} dim={off} />
// ))}
// </span>
// )}
// </span>
// );
// return (
// <li key={c.slug}>
// {off ? (
// // A span, not a disabled link: nothing to press, so nothing
// // that looks pressable and nothing a keyboard stops on.
// <span
// aria-disabled
// className={`${row} bg-wash cursor-default`}
// >
// {inside}
// <ChevronRight className="w-[16px] h-[16px] shrink-0 text-line-strong" />
// </span>
// ) : (
// <Link
// to={`/conferenceCommittees/${c.slug}`}
// className={`${row} group transition-colors hover:bg-wash`}
// >
// {inside}
// <ChevronRight className="w-[16px] h-[16px] shrink-0 text-ink-muted group-hover:text-ink" />
// </Link>
// )}
// </li>
// );
// })}
// </ul>
//
// <p className="font-body text-xs text-ink-faint leading-[1.6] mt-[8px]">
// Members, bill numbers and dates come from the State House News
// Service scorecard, checked against{" "}
// <a
// href="https://malegislature.gov/Bills"
// target="_blank"
// rel="noopener noreferrer"
// className="inline-flex items-center gap-[3px] underline decoration-dotted underline-offset-[3px] hover:text-ink"
// >
// malegislature.gov
// <ArrowUpRight className="w-[11px] h-[11px]" />
// </a>
// . The comparisons are our own reading of the two texts.
// </p>
// </div>
//
// <WhoSitsOnThem />
