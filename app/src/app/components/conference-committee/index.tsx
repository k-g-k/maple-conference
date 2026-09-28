// One conference committee: what both bills already say, and what the six are
// still deciding.
//
// Built on the bill page's own vocabulary rather than a new one: the same
// `Chapter` spine, the same disclosure for material the chapter is offering,
// and the same conferee portraits the lineage step draws.
//
// The page is short on purpose. Every position in the data is written lead
// first ("No. The Senate bill is about phones in schools and nothing else"), so
// the first sentence is a real answer and the rest is evidence. The summary
// prints the answer and puts the evidence behind a control.

import { useMemo, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Star,
  X,
} from "lucide-react";
import {
  BILL_TITLES,
  NOT_LINKED,
  displayName,
  recordForSlug,
  slugFor,
} from "../../data/conference-committees";
import {
  BY_SLUG,
  COMMITTEES,
  KIND,
  hasComparison,
  type CommitteeDetail,
  type ConfereeDetail,
  type OpenQuestion,
} from "../../data/conference-committees/committees";
import { SOURCES } from "../../data/conference-committees/sources";
import type { Meeting } from "../../data/conference-committees/meetings";
import {
  MEETINGS,
  legislatureName,
  meetingDate,
  meetingUrl,
} from "../../data/conference-committees/meetings";
import type { CommitteeMember } from "../../data/bill-lineage/committees";
import {
  MEMBER_BY_NAME,
  MEMBER_BY_SEAT,
  MINE,
  profileUrl,
} from "../../data/bill-lineage/members";
import { holdPlace, holdPress } from "../ballot";
import { Chapter, Span, Disclosure, StickyBand } from "../bill-example/spine";
import { Conferees, VoteMap } from "../bill-example/lineage-section";
import { LINEAGE_TEXTS } from "../../data/bill-lineage/texts";
import { MapleFab } from "../tax-rebate-62f/maple-fab";
import {
  SubmissionFeed,
  type PositionFilter,
  type AccountTypeFilter,
} from "./testimony";
import {
  DEMO_ACCOUNTS,
  DEMO_SEATS,
  DEMO_TESTIMONY,
} from "../../data/conference-committees/testimony";
import type { ConferencePosition } from "../../data/conference-committees/positions";
import {
  CONFERENCE_POSITIONS,
  POSITIONS,
} from "../../data/conference-committees/positions";
import {
  MAP_OUTLINE,
  MAP_SQUASH,
  MAP_VIEWBOX,
  seatPoint,
} from "../../data/conference-committees/geography";
import { SiteNav } from "../site-nav";
import { LobbyingDisclosures } from "./lobbying";
// The bill page's panel on the right edge, under a second name: this page
// already calls the twelve committees down the left a rail, and two rails
// would be one word doing two jobs.
import { Rail as Panel } from "../bill-example/rail";

/**
 * What the General Court calls this conference.
 *
 * It has no name of its own, so the notice uses the Senate bill's title
 * without its "An Act": the 4 June notice for this one reads "Student learning
 * and mental health". The heading above is a readable shorthand; this is the
 * name the record uses.
 */
const officialName = (senateBill?: string) => {
  const t = senateBill ? BILL_TITLES[senateBill] : undefined;
  if (!t) return null;
  const stripped = t.replace(/^An Act\s+/i, "");
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
};

/** Name to the seat key the vote maps are drawn against. */
const SEAT_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(MEMBER_BY_SEAT).map(([seat, m]) => [m.name, seat]),
);

/**
 * This committee's six, in the shape the lineage's list and maps want.
 *
 * Built from the committee's own conferees rather than the bill page's
 * constant, which holds the phone conference and only the phone conference.
 * Anyone the roll of 200 does not know is dropped, because a portrait and a
 * district on the map both need a seat.
 */
const sixOf = (c: CommitteeDetail): CommitteeMember[] =>
  [...c.conferees.senate, ...c.conferees.house].flatMap((d) => {
    const m = MEMBER_BY_NAME[d.name];
    const key = SEAT_BY_NAME[d.name];
    return m && key
      ? [
          {
            key,
            code: m.code,
            name: d.name,
            district: d.district,
            party: d.party,
            portrait: m.portrait,
            role: d.chair ? "Chair" : undefined,
          },
        ]
      : [];
  });

/** The portrait we hold for a conferee, where we hold one. */
const portraitFor = (name: string) => MEMBER_BY_NAME[name]?.portrait;

/**
 * The answer, without the evidence.
 *
 * Each position is written lead first, so the opening sentence carries the
 * whole of it: "No.", "Both.", "Yes, in a new Chapter 93M." Printing the rest
 * in the summary is what made this page long.
 */
const lead = (t: string) => {
  const m = /^.*?[.!?](?=\s|$)/.exec(t.trim());
  return m ? m[0] : t;
};

/**
 * What the committee is, in the legislature's own construction.
 *
 * One shape for all twelve: "Committee of conference" + the subject, + "to
 * resolve differences between" the two bills.
 *
 * The subject defaults to the House bill's title with its "An Act" removed,
 * which is why the verb varies: relative to, to build, promoting, improving.
 * That is the bill's wording rather than a choice made here.
 *
 * Where the legislature words it differently in its own notice, that wins and
 * sits in the map below. There is no rule to derive: energy, teacher benefits
 * and home care are named off the House bill, phones and primary care off the
 * Senate's.
 */
const SUBJECT: Record<string, string> = {
  "phone-free-schools": "to promote student learning and mental health",
};

function ConferenceByline({
  slug,
  house,
  senate,
}: {
  slug: string;
  house?: string;
  senate?: string;
}) {
  // The bill's title without its "An Act", since the sentence supplies that
  // itself: "to pass the act requiring health care employers to ...".
  const phrase =
    SUBJECT[slug] ??
    (house ? BILL_TITLES[house]?.replace(/^An Act\s+/i, "") : undefined);
  const bill = (n?: string) =>
    n ? (
      <Link
        to={`/bills/${slugFor(n)}`}
        className="font-semibold underline decoration-dotted underline-offset-[3px] text-link hover:text-brand"
      >
        {n}
      </Link>
    ) : null;
  // One sentence with the resolving as the means rather than the purpose:
  // what the committee is for is passing the act, and reconciling the two
  // texts is how.
  return (
    <>
      Committee of conference to pass &ldquo;<em>An Act {phrase}</em>&rdquo; by
      resolving differences between {bill(house)} and {bill(senate)}
    </>
  );
}

/** The host of a source URL, without the scheme or a leading "www.". */
function hostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

// The ballot page's footnote marker, lifted as-is: a bare superscript sized
// off the text it hangs from, so it scales with whatever it marks. Not a
// link, because where these resolve to is still being decided; the number is
// the position of the source in the list below, ordered by first mention.
function Cite({ id, order }: { id?: string; order: string[] }) {
  if (!id || !SOURCES[id]) return null;
  return (
    <sup className="font-body font-semibold text-[0.55em] ml-[1px] align-super text-ink-faint">
      {order.indexOf(id) + 1}
    </sup>
  );
}

/**
 * An entry split into the part IEEE italicises and the part it does not.
 *
 * The prototype wrote each description as prose that opens with the publisher
 * and date and then, sometimes, says what the source supports. The opening
 * sentence is the citation proper; anything after it is a note.
 */
function ieeeParts(d: string) {
  const m = /^.*?[.!?](?=\s|$)/.exec(d.trim());
  if (!m) return { pub: d.trim(), note: "" };
  return {
    pub: m[0].replace(/[.]$/, ""),
    note: d.trim().slice(m[0].length).trim(),
  };
}

/**
 * The chamber inks, matched to each other rather than lightened.
 *
 * The House amber is the lineage's, untouched. The Senate blue is darkened
 * from #2a6fd5 until its relative luminance meets the amber's: 0.126 against
 * 0.127. The two labels sit side by side down a whole column, and at the
 * lineage's own values the blue is half a step brighter, so it reads as the
 * louder of the pair when neither chamber is being emphasised.
 *
 * Local to this page, and written out rather than composed at runtime: the
 * bill page shows one chamber per card, where the brighter blue is right, and
 * Tailwind only generates class names it can find in the source text.
 */
const CHAMBER_MUTED: Record<string, string> = {
  Senate: "text-[#2562b9]",
  House: "text-user-ink",
};

/** One chamber's answer, in as few words as the data allows. */
/**
 * A term of art the answer cannot stop to explain, with what it means on hover.
 *
 * "Chapter 93M" is a whole regulatory regime in two words. Spelling it out in
 * the answer would bury the answer; leaving it unexplained asks the reader to
 * already know. The same footnote treatment the 62F spine uses: a button
 * rather than a span, because the note has to be reachable without a pointer,
 * opening on plain focus so a tap gets it too.
 */
function Term({ label, note }: { label: string; note: string[] }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // Down by default, up where there is not room below. The same rule the
  // source notes use, and for the same reason: a note that opens off the
  // bottom of the window is a note nobody reads.
  const [up, setUp] = useState(false);
  const show = () => {
    const el = ref.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const below = window.innerHeight - r.bottom;
      const above = r.top;
      // The note's own height at its widest, plus the gap it leaves.
      const NOTE_H = 380;
      setUp(below < NOTE_H && above > below);
    }
    setOpen(true);
  };
  return (
    <button
      ref={ref}
      type="button"
      onPointerEnter={show}
      onPointerLeave={() => setOpen(false)}
      onFocus={show}
      onBlur={() => setOpen(false)}
      className="relative inline text-left cursor-default underline decoration-dotted decoration-line-strong underline-offset-[4px]"
    >
      {label}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-0 w-[320px] max-w-[80vw] bg-surface border border-line-strong rounded-control shadow-popover p-[14px] z-40 text-left ${
          open ? "block" : "hidden"
        } ${up ? "bottom-full mb-[8px]" : "top-full mt-[8px]"}`}
      >
        <span className="block font-body font-semibold text-2xs uppercase tracking-[0.07em] text-ink-muted mb-[8px]">
          {label}
        </span>
        <span className="block font-body font-normal text-sm text-ink leading-[1.55]">
          {note.map((line) => (
            <span key={line} className="flex gap-[8px] mt-[6px] first:mt-0">
              <span aria-hidden className="text-ink-faint">
                &bull;
              </span>
              <span>{line}</span>
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}

/** The answer's words, with any term that carries a note made hoverable. */
function Marked({
  text,
  notes,
}: {
  text: string;
  notes?: Record<string, string[]>;
}) {
  const term = notes && Object.keys(notes).find((k) => text.includes(k));
  if (!term || !notes) return <>{text}</>;
  const [before, ...rest] = text.split(term);
  return (
    <>
      {before}
      <Term label={term} note={notes[term]} />
      {rest.join(term)}
    </>
  );
}

function Answer({
  chamber,
  text,
  notes,
}: {
  chamber: string;
  text: string | null;
  notes?: Record<string, string[]>;
}) {
  return (
    <div className="flex-1 min-w-0">
      <p
        className={`font-body font-semibold text-2xs uppercase tracking-[0.08em] ${
          CHAMBER_MUTED[chamber] ?? "text-ink-faint"
        }`}
      >
        {chamber}
      </p>
      <p
        className={`font-body text-base leading-[1.4] mt-[2px] ${
          text ? "text-ink" : "text-ink-faint italic"
        }`}
      >
        {text ? <Marked text={lead(text)} notes={notes} /> : "Not in its bill"}
      </p>
    </div>
  );
}

function Open({ o, order }: { o: OpenQuestion; order: string[] }) {
  const hasMore =
    (o.s && o.s !== lead(o.s)) ||
    (o.h && o.h !== lead(o.h)) ||
    o.why ||
    o.regional ||
    o.ties.length > 0;

  return (
    <li className="bg-surface border border-line rounded-card px-[20px] py-[16px]">
      <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-caution-ink">
        {KIND[o.kind].label}
      </p>
      <p className="font-display font-medium text-lg text-ink leading-[1.3] mt-[4px]">
        {o.q}
      </p>

      <div className="flex gap-[24px] mt-[12px]">
        <Answer chamber="Senate" text={o.s} notes={o.notes} />
        <Answer chamber="House" text={o.h} notes={o.notes} />
      </div>

      {hasMore && (
        <div className="mt-[12px]">
          <Disclosure label="What each bill says">
            <div className="flex flex-col gap-[12px] pt-[10px]">
              {(["s", "h"] as const).map((k) => {
                const text = o[k];
                if (!text) return null;
                return (
                  <p
                    key={k}
                    className="font-body text-sm text-ink leading-[1.65]"
                  >
                    <span className="font-semibold">
                      {k === "s" ? "Senate. " : "House. "}
                    </span>
                    {text}
                    <Cite id={k === "s" ? o.sc : o.hc} order={order} />
                  </p>
                );
              })}
              {o.why && (
                <p className="font-body text-sm text-ink-muted leading-[1.65] border-l-2 border-line-strong pl-[14px]">
                  {o.why}
                </p>
              )}
              {o.regional && (
                <p className="font-body text-sm text-ink-muted leading-[1.65] border-l-2 border-official pl-[14px]">
                  <span className="font-semibold text-ink">Elsewhere. </span>
                  {o.regional.t}
                  <Cite id={o.regional.c} order={order} />
                </p>
              )}
              {o.ties.map((t) => (
                <p key={t.n} className="font-body text-sm text-caution-ink">
                  <span className="font-semibold">{t.n}</span>{" "}
                  <span className="text-ink-muted">{t.w}</span>
                </p>
              ))}
            </div>
          </Disclosure>
        </div>
      )}
    </li>
  );
}

/**
 * The six, drawn the way the lineage step draws them.
 *
 * Same component, same portraits, same two maps, so a reader arriving from the
 * bill page recognises the thing they clicked. Hover or click a name to light
 * that district, which is the lineage's own interaction rather than a new one.
 */
/**
 * A conferee's surname where the prose mentions them.
 *
 * The link goes to their profile; the hover goes to the rest of the card. The
 * portrait ring and the district on the map are already driven by one seat
 * key, so naming someone in a sentence is another way of pointing at the same
 * person rather than a second mechanism.
 */
function Named({
  m,
  onHover,
  onPin,
}: {
  m: CommitteeMember;
  onHover: (key: string | null) => void;
  onPin: (key: string) => void;
}) {
  return (
    <a
      href={profileUrl(m.code)}
      target="_blank"
      rel="noopener noreferrer"
      onPointerEnter={() => onHover(m.key)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(m.key)}
      onBlur={() => onHover(null)}
      onClick={() => onPin(m.key)}
      className="font-semibold underline decoration-dotted underline-offset-[4px] text-link hover:text-brand"
    >
      {surname(m.name)}
    </a>
  );
}

/** Everything after the last comma in a name, which is the family name. */
const surname = (n: string) => n.split(" ").filter(Boolean).slice(-1)[0];

/**
 * The `who` sentence with every conferee's surname turned into a link.
 *
 * Split on the surnames we hold rather than marked up in the data, so the
 * prose stays one readable string and a name added to a committee is linked
 * without anyone editing the sentence.
 */
function withNames(
  text: string,
  six: CommitteeMember[],
  onHover: (key: string | null) => void,
  onPin: (key: string) => void,
) {
  const found = six
    .map((m) => ({ m, i: text.indexOf(surname(m.name)) }))
    .filter((x) => x.i >= 0)
    .sort((a, b) => a.i - b.i);
  const out: React.ReactNode[] = [];
  let at = 0;
  found.forEach(({ m, i }) => {
    if (i < at) return;
    out.push(text.slice(at, i));
    out.push(<Named key={m.key} m={m} onHover={onHover} onPin={onPin} />);
    at = i + surname(m.name).length;
  });
  out.push(text.slice(at));
  return out;
}

/**
 * The card's paragraph, on its own.
 *
 * Extracted so the same sentence can be shown somewhere else without the two
 * copies drifting. The hover callbacks default to nothing, because outside
 * the card there are no portraits or maps for a name to light.
 */
function Summary({
  claim,
  who,
  meetings,
  six,
  className = "font-body text-sm text-ink-muted leading-[1.65]",
  onHover = () => {},
  onPin = () => {},
}: {
  claim?: string;
  who?: string;
  meetings: Meeting[];
  six: CommitteeMember[];
  className?: string;
  onHover?: (key: string | null) => void;
  onPin?: (key: string) => void;
}) {
  return (
    <div>
      <p className={className}>
        {/* Parked: the clause naming how the two texts differ, and the count
            of hearings. The clause is in `claim` on every committee and the
            count is derived, so both come back by flipping SHOW_CLAIM. */}
        The two chambers passed different texts
        {SHOW_CLAIM && claim ? (
          <>
            {", "}
            <strong className="font-semibold italic text-ink">{claim}</strong>
            {","}
          </>
        ) : null}{" "}
        so a conference committee was appointed to reconcile each version into
        one text.
        {SHOW_MEMBERS && who && (
          <> The committee includes {withNames(who, six, onHover, onPin)}.</>
        )}
      </p>
    </div>
  );
}

/**
 * The legislature's notices for one conference, listed.
 *
 * A conference deliberates in private, so a noticed meeting is the only thing
 * it does in public and the only date a reader can act on.
 */
function Hearings({
  meetings,
  heading = true,
}: {
  meetings: Meeting[];
  heading?: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      {heading && (
        <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-muted mb-[10px]">
          Hearings
        </p>
      )}
      {/* The heading stays when there is nothing under it. That a conference
          has never met in public is the more interesting fact, and a section
          that vanishes reads as missing data rather than as an answer. */}
      {meetings.length === 0 && (
        <p className="font-body text-sm text-ink-muted">
          No hearing has been held.
        </p>
      )}
      {/* The description's own metrics, 16px at 1.6, so every row is the same
          25.6px line box it is and the second link lands on the second line.
          The 5px is the head start the card title has on this label: 18px at
          1.3 plus 8px against 11px at 1.5 plus 10px. */}
      <ul className="mt-[5px] text-base leading-[1.6]">
        {meetings.map((m) => (
          <li key={m.eventId}>
            <a
              href={meetingUrl(m)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[4px] font-body font-semibold text-sm leading-none underline decoration-dotted underline-offset-[4px] text-link hover:text-brand"
            >
              {m.date <= today ? "Hearing held " : "Hearing scheduled for "}
              {meetingDate(m.date)}
              <ArrowUpRight className="w-[13px] h-[13px] shrink-0 no-underline" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * EXPERIMENT, above the card. Map, Senate, House, map.
 *
 * The two name lists meet in the middle and the maps sit outside them, so the
 * six read as one committee with the geography bracketing it rather than as
 * two chambers that happen to be next to each other. The inner gap is tighter
 * than the outer ones, which is what makes the pair in the middle a pair.
 */
function PeopleAndMaps({
  six,
  meetings,
  heading = true,
  title,
  stickyTop,
}: {
  six: CommitteeMember[];
  meetings: Meeting[];
  heading?: boolean;
  /** A card title in place of the page heading, for a block inside a card. */
  title?: string;
  /** Where the heading comes to rest, for a layout that pins its headings.
   *  Left off, the heading scrolls with its section. */
  stickyTop?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const showing = hovered ?? picked;
  if (!six.length) return null;
  const pin = (k: string) => setPicked((v) => (v === k ? null : k));
  const people = Object.fromEntries(
    six.map((m) => [
      m.key,
      {
        name: m.name,
        district: m.district,
        party: m.party,
        portrait: m.portrait,
        title: m.role,
      },
    ]),
  );
  // Given the leftover width rather than a fixed 200: the names are the
  // fixed-size thing in this row, so the two maps take what is left of it and
  // stay equal to each other.
  const map = (chamber: "senate" | "house") => (
    <div className="flex-1 min-w-0">
      <VoteMap
        chamber={chamber}
        dim={false}
        highlight={six
          .filter((m) => m.key.startsWith("S:") === (chamber === "senate"))
          .map((m) => m.key)}
        selected={showing ? [showing] : []}
        onHover={setHovered}
        onPin={pin}
        people={people}
      />
    </div>
  );
  const names = (ch: "S" | "H") => (
    <Conferees
      ch={ch}
      people={six}
      showing={showing ? [showing] : []}
      onHover={setHovered}
      onPin={pin}
    />
  );
  return (
    // Map, the two name lists, map. Both map columns are 1fr, so they are
    // identical and take every pixel the names leave. The wider break on
    // either side of the pair is padding on the name columns, never on a map
    // cell: padding inside a 1fr column would make that map the smaller one.
    <div>
      {/* No card and no card title: a section heading in the page's own
          hierarchy, the same one the chapters below use, pinned the same way
          where the layout pins them. */}
      {title && (
        <p className="font-display font-medium text-xl text-ink leading-[1.3] mb-[18px]">
          {title}
        </p>
      )}
      {heading &&
        (stickyTop ? (
          <StickyBand top={stickyTop}>
            <h2 className={SUB_HEAD}>Who&rsquo;s in the committee?</h2>
          </StickyBand>
        ) : (
          <h2 className={SUB_HEAD}>Who&rsquo;s in the committee?</h2>
        ))}
      {/* The name columns take what they need and the two maps split the
          rest, so the maps stay identical. The break between the names and
          the maps is padding on the House column, never on a map cell. */}
      <div
        className={`grid gap-y-[32px] gap-x-[20px] sm:pl-[14px] min-[880px]:grid-cols-[max-content_minmax(0,1fr)_minmax(0,1fr)] ${
          // The gap belongs to whatever sits above: the heading, or the
          // reader's own line where there is one. With neither, the block
          // around this already carries the space and a second gap is a hole.
          heading ? "mt-[28px]" : ""
        }`}
      >
        <div className="min-[880px]:pr-[28px]">
          <div className="flex items-start gap-[20px]">
            {names("S")}
            {names("H")}
          </div>
          {/* The hearings close the column, so the space under them is what
              separates this section from the next rather than two rows of the
              same block. */}
          <div className="mt-[24px]">
            <Hearings meetings={meetings} />
          </div>
          <div className="mb-[36px]" />
        </div>
        {map("senate")}
        {map("house")}
      </div>
    </div>
  );
}

/** Parked: the "The committee includes ..." sentence in the card. */
const SHOW_MEMBERS: boolean = false;

/** Parked: the clause naming what the two chambers differ on. */
const SHOW_CLAIM: boolean = false;

/** Parked: the switch between reading public input inline and in the panel. */
const SHOW_TESTIMONY_SWITCH: boolean = false;

/**
 * Parked: the committee card in the card layout.
 *
 * The same six people now appear there in the stacked layout's arrangement,
 * names beside the two maps, so the header reads the same either way and the
 * card is only a switch away if it is wanted back.
 */
const SHOW_CARD: boolean = false;

function Six({
  claim,
  who,
  meetings,
  six,
}: {
  claim?: string;
  who?: string;
  meetings: Meeting[];
  six: CommitteeMember[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const held = meetings.filter((m) => m.date <= today);
  const next = meetings.filter((m) => m.date > today);
  const [hovered, setHovered] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const showing = hovered ?? picked;
  return (
    <div className="@container">
      {/* The same panel the bill page's lineage uses, for the same reason:
          the six people and the two chambers they were drawn from are one
          fact, so they sit on one surface rather than loose on the page. */}
      <div className="bg-surface rounded-card p-[24px]">
        {/* One grid for both rows, so the hearings begin exactly where the
            Senate map begins. That means the name columns are fixed rather
            than content-sized: a paragraph spanning two max-content columns
            would stretch them to its own width. */}
        <div className="grid gap-x-[20px] gap-y-[16px] @[840px]:grid-cols-[228px_228px_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="@[840px]:col-span-2 @[840px]:pr-[36px]">
            <p className="font-display font-medium text-xl text-ink leading-[1.3]">
              Meet the Committee
            </p>
            <Summary
              claim={claim}
              who={who}
              meetings={meetings}
              six={six}
              className="font-body text-base text-ink-muted leading-[1.6] mt-[8px]"
              onHover={setHovered}
              onPin={(k) => setPicked((v) => (v === k ? null : k))}
            />
          </div>
          <div className="@[840px]:col-span-2">
            <Hearings meetings={meetings} />
          </div>

          {(["S", "H"] as const).map((ch) => (
            <div key={ch} className={ch === "H" ? "@[840px]:pr-[36px]" : ""}>
              <Conferees
                ch={ch}
                people={six}
                showing={showing ? [showing] : []}
                onHover={setHovered}
                onPin={(k) => setPicked((v) => (v === k ? null : k))}
              />
            </div>
          ))}
          {(["senate", "house"] as const).map((ch) => (
            <VoteMap
              key={ch}
              chamber={ch}
              dim={false}
              highlight={six
                .filter((m) =>
                  ch === "senate"
                    ? m.key.startsWith("S:")
                    : !m.key.startsWith("S:"),
                )
                .map((m) => m.key)}
              selected={showing ? [showing] : []}
              onHover={setHovered}
              onPin={(k) => setPicked((v) => (v === k ? null : k))}
              people={Object.fromEntries(
                six.map((m) => [
                  m.key,
                  {
                    name: m.name,
                    district: m.district,
                    party: m.party,
                    portrait: m.portrait,
                    title: m.role,
                  },
                ]),
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Filing on a conference.
 *
 * The ballot pages' composer, with the two things a conference changes: the
 * positions are the four a conferee could act on rather than support and
 * oppose, and the weekly update to the conferees is offered at the bottom,
 * which is the one thing this page can do that a bill page cannot, because the
 * conferees are six named people. The guidance block that used to sit on top
 * is gone: three lines of rules before the reader has done anything.
 *
 * The four come from the conference data rather than from a list in here, so the
 * form, the feed's filter, the chip on a submission and the map are all reading
 * the same four.
 */
function ConferenceCompose({ onCancel }: { onCancel: () => void }) {
  const [position, setPosition] = useState<ConferencePosition>("pass");
  const [digest, setDigest] = useState(true);

  return (
    // Exactly the panel's height, so the panel itself never scrolls. The
    // textarea takes what is left, which makes the thing you are writing the
    // only thing that scrolls.
    <div className="h-full flex flex-col gap-[16px] min-h-0">
      <div className="flex-1 min-h-0 flex flex-col">
        {/* One a row rather than a wrapping line of chips. Four of these are
            sentences, not one-word stances, and on a panel's width they wrapped
            into a block a reader had to pick apart. */}
        <div className="flex flex-col gap-[8px] mb-[20px]">
          {CONFERENCE_POSITIONS.map((o) => {
            const on = position === o.k;
            return (
              <button
                key={o.k}
                type="button"
                onClick={() => setPosition(o.k)}
                aria-pressed={on}
                className={`w-full text-left rounded-control border px-[14px] py-[10px] font-body font-semibold text-sm cursor-pointer transition-colors ${
                  on
                    ? o.on
                    : "bg-surface border-line-strong text-ink-muted hover:bg-wash"
                }`}
              >
                {/* The sentence alone. No thumb: the form has room to state each
                    position in full, and the mark is for the filter row, where
                    a row of sentences would not fit. */}
                {o.l}
              </button>
            );
          })}
        </div>
        <textarea
          placeholder="What do you want lawmakers and other voters to know about this question?"
          // White on the panel's grey: the one place you are meant to type
          // should look like the one place you are meant to type.
          className="flex-1 min-h-0 w-full resize-none bg-surface border border-line-strong rounded-control p-[12px] font-body text-base text-ink leading-[1.55] placeholder:text-ink-muted focus:outline-none focus:border-brand"
        />
      </div>

      {/* On the panel's own surface. A tinted band around one line of text
          made it the loudest thing in the form, ahead of what you came to
          write. */}
      <label className="shrink-0 flex items-center gap-[10px] cursor-pointer">
        <input
          type="checkbox"
          checked={digest}
          onChange={(e) => setDigest(e.target.checked)}
          className="w-[16px] h-[16px] shrink-0 cursor-pointer accent-brand"
        />
        <span className="font-body text-sm text-ink leading-[1.4]">
          Include my input in MAPLE&rsquo;s weekly update to the conferees
        </span>
      </label>

      <div className="shrink-0 flex items-center justify-end gap-[12px]">
        <button
          onClick={onCancel}
          className="font-body font-semibold text-sm text-ink-muted hover:text-ink cursor-pointer px-[8px] py-[8px]"
        >
          Cancel
        </button>
        <button className="bg-brand text-ink-inverse font-body font-semibold text-sm px-[18px] py-[8px] rounded-control cursor-pointer hover:bg-brand-hover">
          Review and Post
        </button>
      </div>
    </div>
  );
}

/**
 * How long each county holds before the map moves on.
 *
 * Long enough to read the shortest submission in the panel rather than to
 * register that something changed. A carousel that turns faster than it can be
 * read is a distraction with the same shape as an advert. The ballot question's
 * map holds for the same count, because it is the same act of reading.
 */
const TOUR_MS = 7000;

/**
 * Public input as a map, for the view where the whole feed is a press away.
 *
 * The rail already holds every submission in one column, so repeating that
 * column on the page says the same thing twice. The map says the other thing:
 * where this came from. Clicking a district is the only way in, which is the
 * point, because a summary here would be the page telling you what the public
 * thinks before you had looked.
 *
 * The state is the page's own outline rather than a second one drawn for this,
 * and the places on it are dots rather than filled districts. Eight people, and
 * a filled map would paint a district the colour of one submission and invite a
 * reader to take an empty district as a district that disagrees. A dot can only
 * say "somebody here filed", which is all the data carries.
 *
 * Colour follows the one axis the four positions share. Three of them ask the
 * conference to pass something and the fourth asks it to pass nothing, so a
 * county can lean toward a bill or toward none: green for a bill, red for none,
 * the map's own faint ink where the two are even. Which of the two texts a
 * county prefers is deliberately not here. House and Senate are a choice, not a
 * scale, and a dot cannot hold three colours and still be read as one place.
 */
function PublicMap({ onOpenRail }: { onOpenRail?: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  // Set the moment the reader does anything here, and never unset. A rotation
  // that resumed would move the ground under someone who is reading, which is
  // worse than one that never started.
  const [touched, setTouched] = useState(false);
  const [step, setStep] = useState(0);

  const filers = useMemo(() => {
    // The account's position, taken from what it filed. A position belongs to a
    // submission rather than to an account, and where an account filed twice
    // both filings carry the same one, so there is a single answer per filer.
    const filed = new Map(DEMO_TESTIMONY.map((t) => [t.userId, t]));
    return DEMO_ACCOUNTS.flatMap((u) => {
      const seat = DEMO_SEATS[u.id];
      const mine = filed.get(u.id);
      if (!seat || !mine) return [];
      return [
        {
          id: u.id,
          name: u.name,
          seat,
          // "Individual account, Hampden County" is a kind of account and a
          // place. The place is what the map is about.
          place: u.descriptor.split(",").pop()?.trim() ?? "",
          position: mine.position,
          excerpt: mine.body,
        },
      ];
    });
  }, []);

  const at = (seat: string) => filers.filter((f) => f.seat === seat);

  // One marker per place, at the middle of the district the account is
  // assigned to. A place leans whichever way more of its filers are asking:
  // toward a bill, or toward none. Where those two are even it keeps the map's
  // own faint ink rather than a colour that would take a side.
  const places = useMemo(
    () =>
      [...new Set(filers.map((f) => f.seat))].flatMap((seat) => {
        const point = seatPoint(seat);
        if (!point) return [];
        const here = filers.filter((f) => f.seat === seat);
        const up = here.filter(
          (f) => POSITIONS[f.position].ask === "bill",
        ).length;
        const down = here.length - up;
        return [
          {
            seat,
            point,
            count: here.length,
            // The same words the panel puts at the top when this marker is
            // chosen, because they are the same fact said twice.
            label: here[0]?.place ?? seat,
            fill:
              up > down
                ? "fill-positive"
                : down > up
                  ? "fill-negative"
                  : "fill-ink-faint",
          },
        ];
      }),
    [filers],
  );

  // The counties somebody filed from, in a random order per visit.
  //
  // Opens on one rather than empty, then moves through the rest. The panel
  // beside the map was a prompt and nothing else, which asked the reader to
  // work out what a marker does before showing them. Rotating shows it
  // instead: what a county is, what is in it, and that there is more than one.
  // Shuffled per visit so the section does not always lead with the same place.
  const tour = useMemo(() => {
    const order = places.map((p) => p.seat);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }, [places]);

  const selected = touched ? picked : (tour[step % tour.length] ?? null);
  const shown = selected ? at(selected) : [];

  useEffect(() => {
    if (touched || tour.length < 2) return;
    const id = window.setInterval(() => setStep((n) => n + 1), TOUR_MS);
    return () => window.clearInterval(id);
  }, [touched, tour.length]);

  /** Every control in here goes through this, so any of them stops the tour. */
  const choose = (seat: string | null) => {
    setTouched(true);
    setPicked(seat);
  };

  const toggle = (seat: string) => choose(selected === seat ? null : seat);

  return (
    <div className="@container">
      <div className="grid gap-x-[40px] gap-y-[28px] items-start @[760px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
          <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-muted mb-[8px]">
            Counties heard from · {places.length}
          </p>
          <svg
            viewBox={MAP_VIEWBOX}
            role="img"
            aria-label="Massachusetts, with a marker for each county public input came from"
            className="w-full h-auto"
          >
            {/* The coastline, and only the coastline, inside the squash. The
                markers are flattened where their coordinates are worked out
                instead, so a dot stays round and a label stays upright: both
                would be stretched by a transform that scales one axis.

                The hairline is kept honest by its non-scaling stroke, which is
                already there for the districts' sake and would otherwise come
                out thinner along the top and bottom of the state than down
                the sides. */}
            <g transform={`scale(1 ${MAP_SQUASH})`}>
              {MAP_OUTLINE.map((d) => (
                <path key={d.slice(0, 24)} d={d} className="fill-sunken" />
              ))}
              {/* The coastline as a hairline, so the state has an edge of its
                  own, the same way the district maps above draw it. */}
              {MAP_OUTLINE.map((d) => (
                <path
                  key={d.slice(0, 24)}
                  d={d}
                  fill="none"
                  stroke="var(--color-line-strong)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
            {places.map((m) => {
              const active = selected === m.seat;
              return (
                <g
                  key={m.seat}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  aria-label={`${m.label}, ${m.count} on file`}
                  className="cursor-pointer outline-none"
                  onClick={() => toggle(m.seat)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    toggle(m.seat);
                  }}
                >
                  {/* A ring rather than a size change marks the selection, so
                      the dot keeps meaning "how many from here" throughout. */}
                  {active && (
                    <circle
                      cx={m.point.x}
                      cy={m.point.y}
                      r={9 + m.count * 3}
                      className="fill-none stroke-ink"
                      strokeWidth={2}
                    />
                  )}
                  <circle
                    cx={m.point.x}
                    cy={m.point.y}
                    r={5 + m.count * 3}
                    // Long enough that the dimming reads as the map turning
                    // its attention rather than as a flicker.
                    className={`${m.fill} transition-opacity duration-500 ${
                      selected && !active ? "opacity-25" : "opacity-90"
                    }`}
                  />
                  <text
                    x={m.point.x}
                    y={m.point.y - 12 - m.count * 3}
                    textAnchor="middle"
                    className={`font-body fill-ink-muted text-[19px] transition-opacity duration-500 ${
                      selected && !active ? "opacity-35" : ""
                    }`}
                  >
                    {m.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Opens on whichever county the rotation is holding, and is empty only
            after a reader has cleared it. The section still does not open by
            telling you what the public thinks: it opens on one county's own
            words, which is arriving part way into the map rather than being
            handed a summary of it. */}
        <div>
          {!selected ? (
            <p className="font-body text-sm text-ink-muted leading-[1.6]">
              Select a county.
            </p>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-[12px] pb-[12px] border-b border-line">
                <p className="font-display font-medium text-lg text-ink">
                  {shown[0]?.place ?? "This county"}
                  <span className="font-body font-normal text-sm text-ink-muted">
                    {" · "}
                    {shown.length}
                  </span>
                </p>
                <button
                  onClick={() => choose(null)}
                  className="shrink-0 font-body font-semibold text-xs text-brand-ink hover:text-brand cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <ul className="flex flex-col gap-[20px] mt-[16px]">
                {shown.map((f) => (
                  <li key={f.id}>
                    <p className="font-body font-semibold text-sm text-ink">
                      {f.name}
                    </p>
                    <p className="font-body text-sm text-ink leading-[1.65] mt-[6px]">
                      {f.excerpt}
                    </p>
                  </li>
                ))}
              </ul>
              {onOpenRail && (
                <button
                  onClick={() => {
                    // Stops the rotation as well as opening the panel: a reader
                    // who has gone to read everything should not come back to a
                    // different county than the one they left.
                    setTouched(true);
                    onOpenRail();
                  }}
                  className="mt-[20px] font-body font-semibold text-sm text-brand-ink hover:text-brand cursor-pointer"
                >
                  Read everything in Public Input
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The negotiation at a glance, as built: two columns.
 *
 * Two thirds to the argument, one third to what is already agreed. The
 * questions carry both chambers' answers under them, because that is the
 * reason the question is on the page. The settled list stays small and folds
 * its detail away, since a reader checking what is safe wants the list, not
 * the reasoning.
 */
function Scan({
  c,
  card = false,
  onCompose,
}: {
  c: CommitteeDetail;
  /** The card view presses on the question itself and opens onto the two
   *  answers. The stacked one presses on the topic and opens onto the
   *  question with the answers under it, so its column scans as subjects. */
  card?: boolean;
  /** Offered where one of the six is the reader's own legislator. */
  onCompose?: () => void;
}) {
  const settled = c.settled ?? [];
  const open = c.open ?? [];
  // Whichever of the six the reader is represented by, if either.
  const mine = sixOf(c).find((m) => MINE[m.key]);
  if (!settled.length && !open.length) return null;
  return (
    <div className="@container">
      {/* items-start, so the agreed card ends where its list ends. A grid
          stretches its children to the row's height by default, which left it
          running the full length of the questions beside it. */}
      <div
        // Tabbed keeps the narrower gutter it had: its questions are full
        // sentences, so the settled column is already tight and a wider gap
        // wraps every line of it.
        className={`relative grid ${
          card ? "gap-x-[48px]" : "gap-x-[80px]"
        } gap-y-[32px] items-start @[720px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]`}
      >
        {/* Tabbed view keeps what the surface gave it on three sides and
            drops it on the left, so the chevrons line up with the heading
            above them rather than standing in from it. */}
        <div className={card ? "py-[18px] pr-[18px]" : ""}>
          {/* No column label in either view. The section heading above
              already says what this column is, and the questions are the
              content rather than a list under a label. */}
          <ScanColumn count={open.length} gap="gap-[26px]">
            {open.map((o, i) => {
              // Two cards, not one card holding two outlines. The chambers are
              // separate answers to the same question, so each takes its own
              // surface and the page ground is what separates them.
              const answers = (
                <div className="flex gap-[14px]">
                  {(["Senate", "House"] as const).map((ch) => (
                    <div
                      key={ch}
                      // Filled, not outlined. On the page's own ground the
                      // fill is what separates one answer from the other, and
                      // a border around a white card only draws it twice.
                      className="flex-1 min-w-0 bg-surface rounded-card p-[16px]"
                    >
                      <Answer
                        chamber={ch}
                        text={ch === "Senate" ? o.s : o.h}
                        notes={o.notes}
                      />
                    </div>
                  ))}
                </div>
              );
              return (
                <li key={o.q}>
                  <Disclosure
                    // Remounted when the view changes, so each view gets its
                    // own resting state rather than inheriting whatever the
                    // reader left open in the other one.
                    key={card ? "tabbed" : "scroll"}
                    variant="heading"
                    size="large"
                    // Tabbed shows the questions and nothing else, so there is
                    // room to answer them where they stand. Scroll keeps them
                    // folded, since they sit among everything else.
                    // Shut in both views. The column of topics is the thing
                    // to read first: what is unresolved, at a glance, before
                    // any one of them is opened.
                    // Card presses on the question; stacked presses on the
                    // topic and prints the question inside.
                    label={card ? o.q : (o.topic ?? o.q)}
                    labelClass="font-body font-medium text-lg text-ink text-left leading-[1.35]"
                    // Tabbed lays the questions out on their own, so a wash
                    // over the row would be a second surface on a page that
                    // has already dropped the first. The words carry the
                    // hover instead, over the same hit area.
                    // The words carry the hover in both views. A wash over
                    // the row competes with the shading the open block takes.
                    hover="text"
                    // No surface on the open block in either view: the two
                    // answers carry their own, and a container around them was
                    // a card holding two cards.
                    shaded={false}
                  >
                    {/* No surface of its own in either view: stacked shades
                        the whole open block instead, so a card here would be
                        a second one inside it. */}
                    {/* Experiment: no question inside the block. The topic
                        above names the subject and the two answers are written
                        to stand on their own, so the question was a third
                        statement of the same thing. */}
                    <div>{answers}</div>
                  </Disclosure>
                </li>
              );
            })}
          </ScanColumn>
          {/* The one line here that is about the reader rather than about the
              bills, so it closes the column of what is still undecided: these
              are the questions, and one of the people answering them is
              theirs. */}
          {mine && (
            <p className="flex flex-wrap items-baseline gap-x-[8px] gap-y-[4px] font-body text-base text-ink leading-[1.5] mt-[48px]">
              <Star
                aria-hidden
                className="self-center w-[14px] h-[14px] shrink-0 text-caution fill-caution"
              />
              <span>
                {MINE[mine.key]} is on this committee,{" "}
                <span className="font-semibold">{mine.name}</span>.
              </span>
              {onCompose && (
                <button
                  onClick={onCompose}
                  className="font-body font-semibold text-base text-brand-ink hover:text-brand cursor-pointer underline decoration-dotted underline-offset-[4px]"
                >
                  Share your input
                </button>
              )}
            </p>
          )}
        </div>

        {/* Same inset as the questions beside it, and the same ground. Pulled
            up in the tabbed view so the label sits level with the section
            heading rather than a list-length below it. The scrolling view
            cannot do this in flow, because there the heading sits in an opaque
            band, so it floats its label instead. */}
        <div
          // The same net offset in both views. Tabbed carries 18px of padding
          // inside the column, so it needs 18 more of pull to land where the
          // scrolling view lands without it.
          className={
            card ? "p-[18px] @[720px]:-mt-[52px]" : "@[720px]:-mt-[34px]"
          }
        >
          <ScanColumn head="Where bill texts match" count={settled.length}>
            {settled.map((x) => (
              <Row
                key={x.p}
                title={x.p}
                glyph={
                  <Check
                    className="w-[15px] h-[15px] mt-[3px] text-yea"
                    strokeWidth={2.5}
                  />
                }
              >
                <p className="font-body text-sm text-ink-muted leading-[1.6]">
                  {x.d}
                  <Cite id={x.c} order={[]} />
                </p>
              </Row>
            ))}
          </ScanColumn>
        </div>
      </div>
    </div>
  );
}

function ScanColumn({
  head,
  count,
  gap = "gap-[2px]",
  floatHead = false,
  children,
}: {
  head?: string;
  count: number;
  gap?: string;
  /**
   * Take the label out of the column's flow once there are two columns, and
   * hang it level with the section heading instead.
   *
   * In the scrolling view the heading sits in an opaque band, so a label level
   * with it in normal flow is painted over. Out of flow and above that band,
   * it can sit where it belongs. The column starts at its first row, since the
   * label is no longer holding a place in it.
   */
  floatHead?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      {head && (
        // The SENATE and HOUSE labels in the committee card, exactly: the same
        // small caps, so a column label reads the same wherever it appears.
        <p
          className={`flex items-baseline gap-[8px] font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-muted ${
            floatHead
              ? // Above the grid, not at its top: the grid starts where the
                // first row starts, so top-0 put the label on top of it. The
                // heading sits about 44px higher, which is where this goes.
                "@[720px]:absolute @[720px]:-top-[44px] @[720px]:right-0 @[720px]:z-10"
              : ""
          }`}
        >
          {head}
          <span className="tabular-nums text-ink-faint">{count}</span>
        </p>
      )}
      <ul
        className={`flex flex-col ${gap} ${
          head ? (floatHead ? "mt-[20px] @[720px]:mt-0" : "mt-[20px]") : ""
        }`}
      >
        {children}
      </ul>
    </div>
  );
}

/** One line of the settled list, with what it stands for folded underneath. */
function Row({
  glyph,
  title,
  children,
}: {
  glyph: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        type="button"
        onClick={(e) => holdPress(e, () => setOpen((v) => !v))}
        aria-expanded={open}
        className="group w-full text-left flex items-start gap-[12px] py-[5px] cursor-pointer"
      >
        <span className="shrink-0 w-[18px] flex justify-center">{glyph}</span>
        <span className="flex-1 font-body text-sm text-ink leading-[1.5]">
          {title}
        </span>
        <ChevronDown
          aria-hidden
          className={`shrink-0 mt-[3px] w-[15px] h-[15px] text-ink-faint group-hover:text-ink-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="pl-[30px] pb-[12px]">{children}</div>}
    </li>
  );
}

/**
 * Every conference, down the left.
 *
 * Twelve is few enough to list in full, so the page can say what else is in
 * conference without the reader going back to an index. The bill numbers are
 * the second line because they are the one descriptor we hold for all twelve.
 */
function Rail({ current, label }: { current: string; label: boolean }) {
  return (
    // In the flow, not absolute. The page below the nav widens by exactly the
    // rail plus its gap, so the rail lands in what would otherwise be margin
    // and the reading column still begins where the nav's content does.
    <nav
      aria-label="Conference committees"
      className="hidden lg:block w-[236px] shrink-0 sticky top-[var(--nav-h)] self-start max-h-[calc(100vh-var(--nav-h))] overflow-y-auto pt-[26px] pb-[48px]"
    >
      {label && (
        <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-muted mb-[14px]">
          In conference
        </p>
      )}
      {/* Darker on hover, not lighter. The wash tokens are a translucent
          black, so both states sit into the ground rather than lifting off it,
          and the bar on the left is what makes the held one unmistakable. */}
      <ul className="flex flex-col gap-[2px]">
        {COMMITTEES.map((x) => {
          const on = x.slug === current;
          const off = NOT_LINKED.has(x.slug);
          const inside = (
            <>
              <span
                className={`block font-body text-sm leading-[1.35] ${
                  off
                    ? "text-ink-faint"
                    : on
                      ? "font-semibold text-brand"
                      : "text-ink"
                }`}
              >
                {displayName(x.slug, x.short)}
              </span>
              <span className="block font-body text-xs text-ink-faint leading-[1.35] mt-[1px]">
                {[recordForSlug(x.slug)?.house, recordForSlug(x.slug)?.senate]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </>
          );
          const box =
            "block border-l-[3px] pl-[11px] pr-[8px] py-[7px] rounded-r-control transition-colors";
          return (
            <li key={x.slug}>
              {off ? (
                // A span, not a disabled link. There is nothing to press, so
                // there should be nothing that looks pressable and nothing a
                // keyboard has to pass through.
                <span
                  aria-disabled
                  className={`${box} border-transparent cursor-default`}
                >
                  {inside}
                </span>
              ) : (
                <Link
                  to={`/conferenceCommittees/${x.slug}`}
                  aria-current={on ? "page" : undefined}
                  className={`${box} group ${
                    on
                      ? "border-brand bg-wash-strong"
                      : "border-transparent hover:border-line-strong hover:bg-wash"
                  }`}
                >
                  {inside}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** The rail's content at widths too narrow to put a column beside the page. */
function RailStrip({ current }: { current: string }) {
  return (
    <nav
      aria-label="Conference committees"
      className="lg:hidden -mx-[20px] sm:-mx-[32px] px-[20px] sm:px-[32px] pt-[20px] overflow-x-auto"
    >
      <ul className="flex gap-[8px] w-max">
        {COMMITTEES.map((x) => {
          const on = x.slug === current;
          return (
            <li key={x.slug}>
              {NOT_LINKED.has(x.slug) ? (
                <span
                  aria-disabled
                  className="block whitespace-nowrap font-body text-sm rounded-pill border px-[12px] py-[6px] text-ink-faint border-line cursor-default"
                >
                  {displayName(x.slug, x.short)}
                </span>
              ) : (
                <Link
                  to={`/conferenceCommittees/${x.slug}`}
                  aria-current={on ? "page" : undefined}
                  className={`block whitespace-nowrap font-body text-sm rounded-pill border px-[12px] py-[6px] transition-colors ${
                    on
                      ? "font-semibold text-brand border-brand bg-wash-strong"
                      : "text-ink border-line hover:border-line-strong hover:bg-wash"
                  }`}
                >
                  {displayName(x.slug, x.short)}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * The two texts this conference is reconciling.
 *
 * A copy rather than the bill page's section: that one lists every document
 * in one bill's lineage, thirteen of them, which is the wrong question here.
 * A conference has exactly two texts, and the only thing worth switching
 * between is which chamber's you are reading.
 */
function ConferenceText({
  c,
  titleClass,
  hideQuestion,
  flush,
  stickyHeading,
  pinTop,
}: {
  c: CommitteeDetail;
  titleClass?: string;
  hideQuestion?: boolean;
  flush?: boolean;
  stickyHeading?: string;
  /**
   * How much of the top of the window is already spoken for, as a CSS length.
   * Set it and the picker and the well come to rest against the underside of
   * whatever is pinned there, and the well takes the rest of the window. The
   * page owns this sum, because the page is what pins things.
   */
  pinTop?: string;
}) {
  const [side, setSide] = useState<"house" | "senate">("house");
  const bill = side === "house" ? c.houseBill : c.senateBill;
  const doc = LINEAGE_TEXTS.find((d) => d.number === bill?.n);
  /**
   * Where the box comes to rest: everything the page has pinned above it, plus
   * the 20px of air `to()` leaves when it lands a section under the bar, so the
   * picker does not sit on the rule. One expression, used twice: as the offset
   * it rests at, and taken off the window to get the height that reaches the
   * bottom of the screen. The two cannot drift.
   */
  const rest = pinTop ? `calc(${pinTop} + 20px)` : undefined;
  /**
   * Whether the viewer takes the window.
   *
   * Only where there is a document to read. Most of the twelve have no text
   * bundled for either chamber yet, and a full window of empty well behind one
   * line of apology is worse than the short box it replaces.
   */
  const fill = !!doc?.text && !!rest;
  /**
   * Air under the parked well.
   *
   * Taken off the height and given back as margin, both, because the two do
   * different jobs: the margin is what puts the gap between the well and the
   * bottom of the window, and the shorter height is what keeps the top of the
   * box against the bar once the page has run out. Change one without the
   * other and the picker row slides.
   */
  const TAIL = 24;
  /**
   * Whether the box has come to rest yet.
   *
   * Until it has, the page still has somewhere to go, and a wheel over the
   * sheet should take it there rather than reading the bill. The sheet only
   * becomes a scroller once the box is parked and page scroll is spent, which
   * is the handover the layout was built for. Measured the same way the
   * testimony bar measures its own pinning: the box is parked once its top has
   * reached the offset it sticks at.
   */
  const boxRef = useRef<HTMLDivElement>(null);
  const [parked, setParked] = useState(false);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || !fill) {
      setParked(false);
      return;
    }
    const read = () => {
      const stuckAt = parseFloat(getComputedStyle(el).top) || 0;
      const top = el.getBoundingClientRect().top;
      // Two thresholds rather than one, so the boundary cannot flutter while
      // the reader is at it.
      setParked((was) => (was ? top <= stuckAt + 3 : top <= stuckAt + 1));
    };
    read();
    document.addEventListener("scroll", read, { passive: true, capture: true });
    window.addEventListener("resize", read);
    return () => {
      document.removeEventListener("scroll", read, { capture: true });
      window.removeEventListener("resize", read);
    };
  }, [fill]);
  // The bill page's own trick: a click counts as a visible focus on a select,
  // so the ring flashed up every time the menu opened. This watches how the
  // focus arrived and shows the ring only when it came from the keyboard.
  const byPointer = useRef(false);
  const [kbFocus, setKbFocus] = useState(false);
  return (
    <Chapter
      id="text"
      question="Bill Text"
      titleClass={titleClass}
      hideQuestion={hideQuestion}
      flush={flush}
      stickyHeading={stickyHeading}
    >
      {/*
        Pinned, the picker and the well are one box: they come to rest together
        under the bar, and the box is exactly the window that is left below it,
        so the well reaches the bottom of the screen.

        It rests there because the page ends with it. Nothing follows the well,
        so the height alone decides where the box stops: the last of the page's
        scroll brings its bottom to the bottom of the window, which puts its top
        at `rest`. From then on the only thing left to scroll is the sheet inside
        the well. `sticky` is what would hold it there if anything were ever put
        underneath, which is also why no padding is left under this section.

        Unpinned, on the committees with no text bundled, the well keeps its own
        height and the section carries the bottom of the page itself.
      */}
      <div
        ref={boxRef}
        style={
          fill
            ? {
                top: rest,
                height: `calc(100dvh - ${rest} - ${TAIL}px)`,
                marginBottom: TAIL,
              }
            : undefined
        }
        className={fill ? "sticky flex flex-col" : "pb-[80px]"}
      >
        {/* The bill page's picker, at two documents rather than thirteen.
            Appearance off, our own chevron, our own focus ring: the browser
            draws its arrow inside the right padding, so text runs into it. */}
        <div className="shrink-0 flex items-center gap-[10px] flex-wrap">
          <label
            htmlFor="cc-text-version"
            className="font-body font-semibold text-sm text-ink"
          >
            Version
          </label>
          <span className="relative inline-flex items-center">
            <select
              id="cc-text-version"
              value={side}
              onChange={(e) => setSide(e.target.value as "house" | "senate")}
              onPointerDown={() => (byPointer.current = true)}
              onFocus={() => {
                setKbFocus(!byPointer.current);
                byPointer.current = false;
              }}
              onBlur={() => setKbFocus(false)}
              onKeyDown={() => setKbFocus(true)}
              className={`appearance-none font-body text-sm text-ink bg-surface border border-line rounded-control pl-[12px] pr-[34px] py-[7px] cursor-pointer focus:outline-none ${
                kbFocus ? "ring-2 ring-focus" : ""
              }`}
            >
              {/* The chamber rather than the number. Two bill numbers in a
                  closed menu say nothing about which is which, and the number
                  is on the sheet below anyway. */}
              <option value="house">House Version</option>
              <option value="senate">Senate Version</option>
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-[11px] w-[15px] h-[15px] text-ink-muted"
            />
          </span>
        </div>

        {/* A viewer, not a block of text on the page: a recessed well with the
            document sitting in it as a sheet, and the sheet is what scrolls. */}
        <div
          className={`mt-[16px] bg-sunken border border-line rounded-card p-[20px] sm:p-[28px] flex ${
            // The same well either way. An empty one shrunk to its sentence
            // read as a different component rather than as the viewer with
            // nothing in it.
            fill ? "flex-1 min-h-0" : "h-[min(74vh,860px)]"
          }`}
        >
          {doc?.text ? (
            <div
              className={`mx-auto w-full max-w-[680px] bg-surface shadow-popover rounded-[3px] scrollbar-always px-[28px] py-[34px] sm:px-[52px] sm:py-[44px] ${
                // Locked until the box is parked, so the wheel finishes the
                // page before it starts on the bill.
                fill && !parked ? "overflow-hidden" : "overflow-y-auto"
              }`}
            >
              <p className="font-body font-semibold text-sm text-ink-muted">
                {doc.number}
              </p>
              <p className="font-display font-medium text-lg text-ink leading-[1.3] mt-[2px] mb-[24px]">
                {doc.title}
              </p>
              {/* Preformatted, because the legislature's own line breaks carry
                  the only structure a bill has. */}
              <pre className="font-body text-sm text-ink leading-[1.75] whitespace-pre-wrap break-words">
                {doc.text}
              </pre>
            </div>
          ) : (
            <div className="mx-auto max-w-[560px] text-center py-[14px]">
              <p className="font-body text-sm text-ink-muted leading-[1.7]">
                {bill
                  ? `The text of ${bill.n} is not bundled with this prototype yet.`
                  : "This committee's bills are not recorded yet."}{" "}
                {bill && (
                  <a
                    href={bill.u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline decoration-dotted underline-offset-[4px] text-link hover:text-brand"
                  >
                    Read it on malegislature.gov
                  </a>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </Chapter>
  );
}

/**
 * A section's own spacing, in the stacked layout.
 *
 * Vertical only. The white cards came off, and with them the reason to inset
 * from the sides: a section should start where the heading above it starts.
 */
function Boxed({
  on,
  flushBottom,
  plain,
  children,
}: {
  on: boolean;
  /** Drop the padding underneath, for a section that ends the page. */
  flushBottom?: boolean;
  /**
   * Keep the box and lose the line. For a section whose own content is
   * already framed, where a second border is a box inside a box.
   */
  plain?: boolean;
  children: React.ReactNode;
}) {
  return on ? (
    // Outlined, not filled: each section is its own block on a page that is
    // otherwise one long column. The side padding matches the bleed a pinned
    // heading takes, so the heading's band runs to the inside of the line
    // rather than over it.
    <div
      className={`border rounded-card px-[20px] sm:px-[32px] ${
        plain ? "border-transparent" : "border-line"
      } ${flushBottom ? "pt-[20px] sm:pt-[24px]" : "py-[20px] sm:py-[24px]"}`}
    >
      {children}
    </div>
  ) : (
    <>{children}</>
  );
}

/**
 * Where you are on the page, and how to get somewhere else.
 *
 * One or two words each: the question headings are what the sections say, and
 * repeating them here would make the bar as wide as the page. Sticky under
 * the nav, and the set changes with the layout, because the stacked one puts
 * the background in its own section and the card folds it in.
 */
function Contents({
  sections,
  offset = 0,
  picked,
  onPick,
  jumpTo,
}: {
  sections: { id: string; label: string }[];
  /** How far down it comes to rest. Any CSS length. */
  offset?: number | string;
  /** Set to make this a tab control: the page shows one section at a time
   *  and the bar chooses it, rather than marking where you have scrolled. */
  picked?: string;
  onPick?: (id: string) => void;
  /** Where to put a section's top, for a page that knows how much of the
   *  window is pinned. Falls back to the element's own scroll margin. */
  jumpTo?: (id: string) => void;
}) {
  const [seen, setActive] = useState(sections[0]?.id ?? "");
  const active = picked ?? seen;
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (picked) return;
    /**
     * The bar changes over halfway through the space between two sections.
     *
     * Measured rather than observed. An IntersectionObserver can only fire on
     * the sections themselves, so it has to pick a band of the window and call
     * that "here", which lands the change somewhere inside one section or the
     * other. The handover belongs in the gap: the line is the underside of the
     * bar, and a section takes the bar once the midpoint of the space above it
     * has passed that line.
     */
    const read = () => {
      const line = barRef.current?.getBoundingClientRect().bottom ?? 0;
      let current = sections[0]?.id ?? "";
      let below: number | null = null;
      for (const x of sections) {
        const el = document.getElementById(x.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        // No gap above the first one, so its own top is the mark.
        const mark = below === null ? r.top : (below + r.top) / 2;
        if (mark <= line) current = x.id;
        below = r.bottom;
      }
      setActive(current);
    };
    read();
    // Capture, so a scroll inside anything on the page is heard too.
    document.addEventListener("scroll", read, { passive: true, capture: true });
    window.addEventListener("resize", read);
    return () => {
      document.removeEventListener("scroll", read, { capture: true });
      window.removeEventListener("resize", read);
    };
  }, [sections, picked]);
  return (
    <div
      ref={barRef}
      style={{ top: offset }}
      // Opaque, and no blur. At 95% with an 8px backdrop blur a heading on its
      // way out stayed visible underneath as a smear, cut hard at the bar's
      // edges rather than going away. A bar has to hide what passes under it:
      // that is what lets a section's own chrome come to rest against its
      // underside. Same opaque ground the heading bands use.
      className="sticky z-10 -mx-[20px] sm:-mx-[32px] px-[20px] sm:px-[32px] bg-ground border-b border-line"
    >
      <div className="flex items-stretch gap-[18px] sm:gap-[22px] h-[46px] overflow-x-auto scrollbar-hide">
        {sections.map((x) => (
          <a
            key={x.id}
            href={`#${x.id}`}
            onClick={(e) => {
              if (onPick) {
                e.preventDefault();
                onPick(x.id);
                return;
              }
              if (!document.getElementById(x.id)) return;
              e.preventDefault();
              setActive(x.id);
              jumpTo?.(x.id);
              history.replaceState(null, "", `#${x.id}`);
            }}
            className={`shrink-0 whitespace-nowrap font-body text-sm flex items-center border-b-2 transition-colors ${
              active === x.id
                ? "text-ink border-brand font-semibold"
                : "text-ink-muted border-transparent hover:text-ink"
            }`}
          >
            {x.label}
          </a>
        ))}
      </div>
    </div>
  );
}

// One set for both layouts. Stacked used to carry a Background tab for the
// paragraph, but with its heading gone there is nothing to arrive at: the
// jump landed mid-air above the committee it belongs to.
/** The section headings. Back in the display face, at the size and weight the
 *  body face had settled on. */
/**
 * The section headings.
 *
 * No measure on them. They are questions of six or eight words, and a 28ch cap
 * broke the longest of them over two lines while the column beside it stood
 * empty. The balance stays, for the ones that do wrap on a narrow window.
 */
const SUB_HEAD =
  "font-display font-normal text-lg sm:text-xl lg:text-[22px] text-ink text-balance";

const CONTENTS = [
  { id: "committee", label: "Committee" },
  { id: "decided", label: "Unresolved Text" },
  { id: "lobbying", label: "Lobbying" },
  { id: "input", label: "Public Input" },
  { id: "text", label: "Bill Text" },
];

/**
 * The page's own column: how wide the reading area is and where it starts.
 *
 * Held in one place because the site bar takes it too. The wordmark lines up
 * with the committee list under it rather than sitting on the 1180 grid the
 * bar uses on pages that have not widened.
 */
/** The bar's own column: the whole window, less the page's gutters. */
const NAV_COLUMN = "w-full px-[20px] sm:px-[32px]";

const PAGE_COLUMN =
  "mx-auto max-w-[1180px] lg:max-w-[1320px] min-[1480px]:max-w-[1764px] px-[20px] sm:px-[32px]";

/** A prototype control: one switch of two named states. Not part of the page. */
function Pills<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  /** What each option is called, where the word on the switch is not the word
   *  the state is keyed by. */
  labels?: Partial<Record<T, string>>;
}) {
  return (
    <div className="flex items-center gap-[4px] bg-surface border border-line-strong rounded-pill shadow-popover p-[4px]">
      {options.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={`font-body font-semibold text-sm capitalize rounded-pill px-[12px] py-[5px] cursor-pointer transition-colors ${
            value === v
              ? "bg-ink text-ink-inverse"
              : "text-ink-muted hover:bg-wash"
          }`}
        >
          {labels?.[v] ?? v}
        </button>
      ))}
    </div>
  );
}

/**
 * How tall a section's pinned heading band is, measured rather than written
 * down: the heading wraps on a narrow column, and anything resting under it
 * has to know the height it actually took.
 *
 * Re-read when the view changes, because one of the two views does not pin its
 * headings at all and there is then no band to measure.
 */
function useBandHeight(mode: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setH(0);
      return;
    }
    const read = () => setH(Math.floor(el.getBoundingClientRect().height));
    const ro = new ResizeObserver(read);
    ro.observe(el);
    read();
    return () => ro.disconnect();
  }, [mode]);
  return { ref, h };
}

/** The panel's default width, as numbers the drag handler can also read. */
const DRAWER_MIN = 400;
const DRAWER_VW = 0.34;
const DRAWER_MAX = 520;
const drawerWidth = () =>
  Math.min(Math.max(DRAWER_MIN, DRAWER_VW * window.innerWidth), DRAWER_MAX);

/** How much of the window the panel may be dragged to hold. */
const RAIL_MAX_SHARE = 0.6;
/**
 * Where the page stops holding its left edge still.
 *
 * Up to this much taken, the content column keeps the left offset centring had
 * already given it and gives up width on the right only, so the twelve
 * committees down the left stay put. Past it the offset goes, because a reader
 * who has dragged the panel that wide is reading the panel and wants the page
 * to use what is left of itself.
 */
const RAIL_GUTTER_DROP = 0.4;

/** The view the panel rests on, named once so the ternaries cannot drift. */
const RAIL_DEFAULT = "perspectives";

/** Which of the two layouts is drawn. Also the key the panel's state is kept under. */
type Layout = "card" | "stacked";

/**
 * Where the perspectives are read.
 *
 * "sidebar" rests the panel on them down the right edge, which is what the page
 * has always done. "inline" reads them in the page's own Public Input section
 * and keeps the panel for writing one: nothing sits on the edge until you ask
 * to add something, and closing the composer gives the width back in full.
 *
 * Crossed with the two layouts, that is four views of the same material.
 */
type TestimonyMode = "sidebar" | "inline";

function Detail({ c }: { c: CommitteeDetail }) {
  const rec = recordForSlug(c.slug);
  const meetings = MEETINGS[c.slug] ?? [];
  // Four views, from two switches. Neither is remembered: a reload is the
  // way back to the pair being treated as the default.
  const [layout, setLayout] = useState<Layout>("card");
  // One choice for the page rather than one per layout: it is the same question
  // in both, where the perspectives are read, and it sits beside the layout
  // switch as one control. The panel's own state stays keyed by layout under
  // it, so the two axes do not interfere.
  // Inline by default: the page reads on its own, and the panel is something
  // the reader opens rather than something that is already taking width.
  const [testimony, setTestimony] = useState<TestimonyMode>("inline");
  const inlineTestimony = testimony === "inline";
  // Two views, not four. The card gathers the committee onto one pinned
  // surface and its bar swaps what sits under it; the stacked one lays every
  // section out and its bar jumps between them.
  const mode = layout === "card" ? "tabbed" : "scroll";
  const [askOpen, setAskOpen] = useState(false);

  // The panel, kept per layout rather than once for the page. The two layouts
  // are two readings of the same material, and a reader who opened the panel
  // over one did not ask for it to be waiting over the other. Keyed rather
  // than remounted, because the panel's own promise is that nothing in it is
  // thrown away: a half-written submission and the feed's filters survive a
  // trip through the other layout.
  const [rail, setRail] = useState<Record<Layout, "open" | "min">>({
    card: "min",
    stacked: "min",
  });
  const [railView, setRailView] = useState<Record<Layout, string>>({
    card: RAIL_DEFAULT,
    stacked: RAIL_DEFAULT,
  });
  /**
   * Whether the panel is standing, for a layout and a mode that may not be the
   * pair on screen yet.
   *
   * Inline mode only counts the composer. It does not rest on the perspectives,
   * so a panel the other mode left open on them is read as closed rather than
   * being forced shut: switching back finds it exactly where it was.
   */
  const panelStanding = (l: Layout, m: TestimonyMode) =>
    rail[l] === "open" && (m === "sidebar" || railView[l] === "compose");
  const panelOpen = panelStanding(layout, testimony);
  const showView = (id: string) => setRailView((v) => ({ ...v, [layout]: id }));
  const openWhen = (state: "open" | "min") =>
    setRail((r) => ({ ...r, [layout]: state }));

  // What the feed is showing and what is narrowing it. Shared by both layouts
  // rather than keyed: there is one feed mounted, so there is one set of
  // filters to report on, and a second copy would describe a list that is not
  // on screen.
  const [position, setPosition] = useState<PositionFilter>("all");
  const [accountType, setAccountType] = useState<AccountTypeFilter>("all");
  const [railCount, setRailCount] = useState(DEMO_TESTIMONY.length);
  const [railFiltered, setRailFiltered] = useState(false);
  const [railReset, setRailReset] = useState(0);

  const shellRef = useRef<HTMLDivElement>(null);
  // What the reader dragged the panel to, remembered so collapsing and
  // reopening returns to it rather than snapping back to the default. Per
  // layout for the same reason the open state is, but held in a ref because it
  // is written to the DOM rather than rendered.
  const railWidthRef = useRef<Record<Layout, number | null>>({
    card: null,
    stacked: null,
  });

  /** Write a dragged width to the DOM, or clear it and fall back to the presets. */
  const applyRailWidth = (px: number | null) => {
    const el = shellRef.current;
    if (!el) return;
    if (px === null) {
      // Inline styles beat the class ternaries, which is what makes a dragged
      // width stick. Collapsing has to remove them or the page keeps the
      // margin it had while the panel was open.
      el.style.removeProperty("--rail-w");
      el.style.removeProperty("--taken-w");
      return;
    }
    el.style.setProperty("--rail-w", `${px}px`);
    el.style.setProperty("--taken-w", `${px}px`);
  };

  const setRailWidth = (px: number | null) => {
    const el = shellRef.current;
    if (!el) return;
    if (px === null) {
      railWidthRef.current[layout] = null;
      applyRailWidth(null);
      el.removeAttribute("data-resizing");
      return;
    }
    const w = Math.round(
      Math.min(Math.max(px, drawerWidth()), RAIL_MAX_SHARE * window.innerWidth),
    );
    el.dataset.resizing = "true";
    railWidthRef.current[layout] = w;
    applyRailWidth(w);
  };

  /** Drag over: the width stays, the "do not animate" flag does not. */
  const endRailResize = () =>
    shellRef.current?.removeAttribute("data-resizing");

  const clearRailFilters = () => {
    setPosition("all");
    setAccountType("all");
    setRailReset((n) => n + 1);
  };
  /**
   * Keep the reader where they were while the panel takes or gives back width.
   *
   * The column reflows when it narrows, so everything above the fold grows
   * taller and what you were reading slides down the screen. The browser's own
   * scroll anchoring does not catch it, because the change comes from a width
   * transition rather than from content arriving. So the page anchors itself:
   * it notes where the section it is sitting in starts, and for as long as the
   * transition runs it scrolls by whatever that section has moved. The reader
   * sees the column narrow and nothing else.
   */
  const holdAnchor = (run: () => void) => {
    // The section the reader is sitting in is the anchor here, because the
    // control that starts this is often not on screen: the panel can be opened
    // from a strip on the edge or from a button pinned to the corner.
    const line = pinned();
    let el: HTMLElement | null = null;
    for (const x of CONTENTS) {
      const found = document.getElementById(x.id);
      if (found && found.getBoundingClientRect().top <= line + 1) el = found;
    }
    // The panel's own transition is 300ms, so the correction runs a little
    // past it and catches the last frame.
    holdPlace(el, run, 380);
  };

  const openRailClean = () =>
    holdAnchor(() => {
      clearRailFilters();
      applyRailWidth(railWidthRef.current[layout]);
      showView(RAIL_DEFAULT);
      openWhen("open");
    });
  const collapseRail = () =>
    holdAnchor(() => {
      clearRailFilters();
      // The strip has one width, so the dragged one has to come off or the
      // page stays pushed over by a panel that is no longer there.
      applyRailWidth(null);
      openWhen("min");
    });
  const compose = () =>
    holdAnchor(() => {
      showView("compose");
      openWhen("open");
    });
  // The tabs a layout offers, and which one is open. Card has no Committee
  // tab: its card sits above the bar rather than in a section you pick.
  const tabs =
    layout === "stacked"
      ? CONTENTS
      : CONTENTS.filter((x) => x.id !== "committee");
  const [tab, setTab] = useState(tabs[0].id);
  useEffect(() => {
    if (!tabs.some((x) => x.id === tab)) setTab(tabs[0].id);
  }, [tabs, tab]);
  /** Scroll lays every section out; tabbed shows the one that is open. */
  const show = (id: string) => mode === "scroll" || tab === id;
  // Picking a tab takes the page to the section's resting place: the header and
  // the card scroll away and the bar comes to rest at the top. Without
  // it a reader who has scrolled down lands mid-page on the new section, and
  // one who has not sees the bar sitting under a card that did not move.
  const mainRef = useRef<HTMLElement>(null);
  const BAR_H = 47;
  /**
   * How much of the top of the window is spoken for right now.
   *
   * The nav and the bar, in both layouts. The header used to be a third term
   * here, measured with an observer because the title wraps to two lines on
   * about half the twelve. It went when the header stopped pinning: the sum no
   * longer depends on anything that can change height, so nothing downstream
   * has to be told when it does.
   */
  const pinned = () => {
    const navH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
      ) || 0;
    return navH + BAR_H;
  };
  /**
   * The same sum as a CSS length, for anything that has to rest against the
   * underside of it or size itself against what is left of the window. The one
   * expression both uses share, so an offset and a height cannot drift apart:
   * `pinned()` in numbers and this in CSS are the same two terms.
   */
  const pinnedH = `calc(var(--nav-h) + ${BAR_H}px)`;
  /**
   * Where a section heading comes to rest: under the nav and the bar, which is
   * the same sum `pinned()` uses to land a jump. One value rather than three
   * copies, because the three had already drifted from it once.
   */
  const stickyTop = mode === "scroll" ? pinnedH : undefined;
  /**
   * A section's own chrome, a filter row or a table head, comes to rest under
   * everything above it, which in the scrolling view includes that section's
   * pinned heading. Tabbed does not pin its headings, so there the chrome
   * rests against the bar itself.
   */
  const inputBand = useBandHeight(mode);
  const lobbyBand = useBandHeight(mode);
  const underHeading = (h: number) =>
    mode === "scroll" ? `calc(${pinnedH} + ${h}px)` : pinnedH;
  const smooth = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? ("auto" as const)
      : ("smooth" as const);
  // 20px of air under the bar, so a section arrives with room above it
  // rather than flush against the rule.
  const to = (el: Element) =>
    window.scrollTo({
      top: Math.max(
        0,
        el.getBoundingClientRect().top + window.scrollY - pinned() - 20,
      ),
      behavior: smooth(),
    });
  // Lands a section's own top on the underside of the bar, scrolling up or
  // down. A scroll margin cannot do it: the pinned height changes with the
  // title's wrap, and an element's margin is written once.
  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) to(el);
  };
  /**
   * Picking a tab shows that section from its top.
   *
   * The sections are as tall as their content, so a reader who had scrolled
   * through one and then picked another landed in the middle of it, or past
   * the end of a shorter one. The jump waits a frame, because the section
   * being landed on does not exist until the tab has changed.
   */
  const pickTab = (id: string) => {
    setTab(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      // Only ever upward. A reader at the bottom of one section should not
      // arrive at the bottom of the next, but a reader who has not scrolled
      // at all should see nothing move: the tab already put them at the top.
      //
      // Landed, not scrolled. The section under the bar is a different page,
      // so travelling to it says the two are one long thing, and animating
      // past content the reader did not ask to see is worse than arriving.
      const top =
        el.getBoundingClientRect().top + window.scrollY - pinned() - 20;
      if (window.scrollY > top)
        window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    });
  };

  const order: string[] = [];
  const see = (id?: string) => {
    if (id && SOURCES[id] && !order.includes(id)) order.push(id);
  };
  c.settled?.forEach((s) => see(s.c));
  c.open?.forEach((o) => {
    see(o.sc);
    see(o.hc);
    see(o.regional?.c);
  });
  c.context?.forEach((x) => see(x.c));
  [...c.conferees.senate, ...c.conferees.house].forEach((m) => see(m.vote?.c));

  return (
    // The page gives up width to the panel on the right, the way the bill page
    // does. What it gives up is never nothing: the panel rests as a strip down
    // the edge, so at rest the page is short by the strip rather than by the
    // whole panel.
    //
    //   --rail-w    how wide the panel itself is drawn.
    //   --taken-w   how much room the page gives up for it, which is the strip
    //               at rest and the panel's full width while it is open.
    //   --fab-r     where the floating buttons sit, always just inside
    //               whatever is taken. Computed from --taken-w rather than
    //               branched again, so there is one place it can be wrong.
    //   --page-w    the width the page currently has, for a full-bleed band
    //               that has to contract with it instead of sliding under the
    //               panel. Nothing on this page bleeds yet; Chapter's band
    //               slot is measured against it, so it is set where the rest
    //               of the page's width is decided.
    <div
      ref={shellRef}
      style={
        {
          "--drawer-w": `clamp(${DRAWER_MIN}px, ${DRAWER_VW * 100}vw, ${DRAWER_MAX}px)`,
          // A step, not a slide: hugely positive while the panel is taking
          // less than the drop share, hugely negative past it, so a min() or a
          // max() against it switches at that point rather than easing across
          // it.
          "--rail-share": `calc((${RAIL_GUTTER_DROP * 100}vw - var(--taken-w, 0px)) * 1000)`,
        } as CSSProperties
      }
      className={`bg-ground min-h-screen font-body text-ink overflow-x-clip [--rail-tab-w:44px] lg:[--fab-r:calc(var(--taken-w)+24px)] ${
        panelOpen
          ? "lg:[--rail-w:var(--drawer-w)] lg:[--taken-w:var(--drawer-w)]"
          : inlineTestimony
            ? // Nothing on the edge, so nothing is taken. The panel keeps its
              // own width while it is closed, or it would shrink to the strip's
              // on its way out and the slide would be over before it read as
              // one.
              "lg:[--rail-w:var(--drawer-w)] lg:[--taken-w:0px]"
            : "lg:[--rail-w:var(--rail-tab-w)] lg:[--taken-w:var(--rail-tab-w)]"
      }`}
    >
      {/* The bar takes the page's own column, so the wordmark starts where
          the committee list starts rather than on the 1180 grid the bar uses
          elsewhere. */}
      {/* No nav item lit: a conference committee is not any one of the
          sections the bar lists. */}
      {/* Full bleed: the bar runs the width of the window, with only the
          page's own gutters holding the wordmark and the account control off
          the edges. */}
      <SiteNav inner={NAV_COLUMN} />
      {/* The bill page's pair, unchanged: ask MAPLE, and write testimony.
          Bottom right, where the layout switch is bottom left. The row's
          --fab-r keeps both clear of the panel instead of under it. */}
      <div className="fixed bottom-[24px] right-[var(--fab-r,24px)] z-50 flex items-center gap-[12px] transition-[right] duration-300 ease-out motion-reduce:transition-none [[data-resizing]_&]:transition-none">
        <MapleFab inline open={askOpen} onOpenChange={setAskOpen} />
        <button
          onClick={compose}
          aria-label="Add public input"
          className="group hidden lg:inline-flex items-center h-[52px] px-[16px] rounded-pill border border-brand bg-brand text-ink-inverse hover:bg-brand-hover hover:border-brand-hover cursor-pointer transition-colors"
        >
          <Plus className="w-[22px] h-[22px] shrink-0" />
          <span className="grid grid-cols-[0fr] group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr] transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none">
            <span className="overflow-hidden">
              <span className="block pl-[10px] pr-[2px] font-body font-semibold text-sm whitespace-nowrap">
                Add Public Input
              </span>
            </span>
          </span>
        </button>
      </div>

      {/* Prototype controls, not part of the page. Only the layout switch is
          offered for now; the testimony one is parked below. */}
      <div className="fixed bottom-[20px] left-[20px] z-50 flex flex-col items-start gap-[8px]">
        {/* Parked: where public input is read. The page runs inline, with the
            panel opening only to write, and the sidebar mode is still here
            behind the switch when it is wanted back. */}
        {SHOW_TESTIMONY_SWITCH && (
          <Pills
            options={["sidebar", "inline"] as const}
            value={testimony}
            onChange={(v) => {
              setTestimony(v);
              // A dragged width is an inline style on the shell and beats the
              // class ternaries, so the shell has to be told whether the panel
              // is still standing under the mode being switched to.
              applyRailWidth(
                panelStanding(layout, v) ? railWidthRef.current[layout] : null,
              );
            }}
          />
        )}
        <Pills
          options={["card", "stacked"] as const}
          // Named for what each one does rather than what it looks like, which
          // is also what the page calls them internally: card is the tabbed
          // read, stacked is the scrolling one.
          labels={{ card: "Tabbed", stacked: "Scroll" }}
          value={layout}
          // Back to the top and the first tab. The two views put different
          // things at different heights, so keeping the scroll position drops
          // you into the middle of a section you did not choose.
          onChange={(v) => {
            setLayout(v);
            setTab(
              (v === "stacked"
                ? CONTENTS
                : CONTENTS.filter((x) => x.id !== "committee"))[0].id,
            );
            window.scrollTo({ top: 0 });
            // One shell for both layouts, so a dragged width is one inline
            // style on it. The layout being switched to has its own, and the
            // shell has to be told which rather than keeping the width the
            // layout being left was at.
            applyRailWidth(
              panelStanding(v, testimony) ? railWidthRef.current[v] : null,
            );
          }}
        />
      </div>

      {/* 1180 of reading column, plus 236 of rail and its 24px gap. Centred at
          1480 the content column lines up with the nav above it exactly; below
          that the rail goes and the page is 1180 again. */}
      {/* The one element the panel moves. On the bill page the sub-nav bar, the
          hero and the main column each carry the margin, because there they are
          siblings; here all three are inside this column, and the bands that
          bleed do so to its edge rather than the window's, so the margin
          belongs on it once.

          Centred at rest, pinned once the panel is open: --page-left holds the
          offset centring would have given, so the page gives up width on the
          right and the twelve committees down the left stay where they are.
          Recentring instead would slide the whole left rail every time the
          panel opened. Past RAIL_GUTTER_DROP the offset goes and the column
          starts at the padding, which is what --rail-share switches.

          --page-cap is the same number as the max-width beside it: the offset
          has to be worked out from the width the column would have taken, and
          CSS cannot read a max-width back. They are written in pairs so the
          two cannot be changed apart. */}
      <div // 1180 + twice the rail and its gap. Centred, that puts the reading
        // column's left edge exactly on the nav's, with every pixel of the
        // extra width going out to the right.
        style={
          {
            // A percentage rather than 100vw, so the offset is the one
            // centring was already giving: a margin resolves against the
            // page's content box, which is the window less its scrollbar,
            // while 100vw counts the scrollbar in and lands a few pixels
            // right of where the column sits today.
            "--page-left":
              "max(0px, min(calc((100% - var(--page-cap, 1180px)) / 2), var(--rail-share)))",
          } as CSSProperties
        }
        className={`${PAGE_COLUMN} [--page-cap:1180px] lg:[--page-cap:1320px] min-[1480px]:[--page-cap:1764px] flex gap-[24px] lg:gap-[56px] lg:mx-0 lg:ml-[var(--page-left)] lg:mr-[var(--taken-w)] lg:[--page-w:calc(100vw-var(--taken-w))] transition-[margin] duration-300 ease-out motion-reduce:transition-none [[data-resizing]_&]:transition-none`}
      >
        <Rail current={c.slug} label={false} />

        <div className="min-w-0 flex-1">
          <RailStrip current={c.slug} />

          {/* The title and its byline scroll away, in both layouts. Nothing
              pins here: the tab bar is the only thing that comes to rest under
              the nav, so the sum every pinned offset on this page is built from
              never has to know how the title wrapped.

              The bleed and the ground are what the band keeps from when it did
              pin, and they are why the two layouts read the same at the top of
              the page. The negative margins let the band's own background run
              to the edge of the reading column; the padding gives that width
              back, so the column inside is the one it would have had. */}
          <div className="z-20 -mx-[20px] sm:-mx-[32px] px-[20px] sm:px-[32px] bg-ground/95 backdrop-blur">
            {/* 26px, so the title's cap sits level with the top of the rail's
                first pill: a 40px face at 1.2 leaves about 10px above the cap
                inside its own line box. */}
            <div className="@container pt-[26px] pb-[24px]">
              {/* MAPLE's h1 is 3rem bold at line-height 1.2, but it is set in
                Nunito. Lexend has a far larger x-height and wider letterforms,
                so the same 48px reads noticeably bigger. 40px is where the two
                match optically. */}
              <h1 className="font-body font-bold text-[28px] @[700px]:text-[40px] leading-[1.2] text-[#0b1a4d] max-w-[22ch]">
                {displayName(c.slug, c.short)}
              </h1>
              <p className="font-body text-xl @[980px]:text-2xl text-ink-muted leading-[1.4] mt-[10px]">
                <ConferenceByline
                  slug={c.slug}
                  house={rec?.house}
                  senate={rec?.senate}
                />
              </p>
            </div>
          </div>

          {/* Between the header and the bar, pinned like neither: the header
              and this card go up the window together, and the bar follows them
              until it comes to rest under the nav. */}
          {layout === "card" && (
            <div className="@container pb-[16px]">
              <div
                id="committee"
                // Outlined rather than filled: the people and the two maps are
                // one block on a page whose sections are otherwise unbounded,
                // and a border says where it ends without adding a surface.
                className="mt-[8px] border border-line rounded-card px-[20px] pt-[20px] pb-[8px] scroll-mt-[120px]"
              >
                {SHOW_CARD ? (
                  <Six
                    claim={c.claim}
                    who={c.who}
                    meetings={meetings}
                    six={sixOf(c)}
                  />
                ) : (
                  <PeopleAndMaps
                    six={sixOf(c)}
                    meetings={meetings}
                    // A card title rather than the page heading: this sits
                    // inside a bordered block directly under the page title.
                    heading={false}
                    title="Meet the Committee"
                  />
                )}
              </div>
            </div>
          )}

          {/* Rests under the nav, in both layouts: it is the first thing the
              page pins, so it has nothing above it but the site bar. The card
              layout drops the Committee tab, since its card sits above this bar
              rather than in a section you jump to. */}
          <Contents
            sections={tabs}
            offset="var(--nav-h)"
            jumpTo={jumpTo}
            picked={mode === "tabbed" ? tab : undefined}
            onPick={mode === "tabbed" ? pickTab : undefined}
          />

          <div className="@container">
            {/* Two layouts for the same material, one at a time. Stacked
                puts the people on the page under a heading and the prose in
                its own chapter; Card puts all of it on one surface. */}
            {layout === "stacked" && (
              <>
                {/* The background reads first, then the six it produced,
                    then what those six have done in public. */}
                {/* Parked in this layout only. The card below still carries
                    the same sentence, so the two can be compared. */}
                {false && (
                  <div id="why-above" className="mt-[36px] scroll-mt-[120px]">
                    <Summary
                      claim={c.claim}
                      who={c.who}
                      meetings={meetings}
                      six={sixOf(c)}
                      className="font-body text-lg text-ink-muted leading-[1.6] max-w-[74ch]"
                    />
                  </div>
                )}

                {show("committee") && (
                  // This section sits outside <main>, so it misses the gap
                  // that separates the sections inside it. It carries the
                  // same gap itself.
                  <div
                    id="committee"
                    // The 24px under the bar plus this makes the same 48px the
                    // sections inside main leave between themselves.
                    className="scroll-mt-[120px] mt-[24px] mb-[24px]"
                  >
                    <Boxed on={layout === "stacked"}>
                      <PeopleAndMaps
                        six={sixOf(c)}
                        meetings={meetings}
                        stickyTop={stickyTop}
                      />
                    </Boxed>
                  </div>
                )}
              </>
            )}
          </div>

          <main
            // No floor under a tabbed section any more: every tab now has
            // enough in it to fill the window on its own, and a floor only
            // pads out the short ones that no longer exist.
            ref={mainRef}
            // No padding under the bill text: its well is sized to reach the
            // bottom of the window, so the page has to end where the well ends.
            // 80px under it and the page would still be scrolling after the well
            // had come to rest, dragging it up behind the bar. The section
            // carries that 80px itself on the committees whose text is not
            // bundled, where the well keeps its own height instead.
            className={`${show("text") ? "pb-0" : "pb-[80px]"} flex flex-col gap-[48px] ${
              // Stacked's sections carry their own 20px of top padding, so this
              // adds nothing on top of it.
              mode === "tabbed" ? "pt-[28px]" : "pt-[24px]"
            }`}
          >
            {/* The same chapter the bill page's lineage uses for "How did it
                get here?", so the two pages open a section the same way. */}
            {/* Both layouts. The two column labels below say what each list
                is; this says why either of them is there. */}
            {show("decided") && (
              <Boxed on={layout === "stacked"}>
                <Chapter
                  id="decided"
                  question="What needs to be resolved?"
                  titleClass={SUB_HEAD}
                  // This heading does not pin. Its section has no chrome of
                  // its own to hide, and an opaque pinned band here would
                  // paint over the settled list's label, which belongs level
                  // with the heading. Lobbying and Public Input still pin,
                  // because their controls pin under them.
                  flush
                >
                  <Scan c={c} card={layout === "card"} onCompose={compose} />
                </Chapter>
              </Boxed>
            )}

            {/* Parked. Good copy, no home decided for it yet. */}
            {false && (
              <Chapter id="why" question="How did it get here?">
                <Span>
                  <p className="font-body text-lg text-ink leading-[1.6] max-w-[74ch]">
                    {c.subtitle}
                  </p>
                </Span>
              </Chapter>
            )}

            {/* Parked: the Scan above is now the whole comparison. */}
            {false &&
              (hasComparison(c) ? (
                <>
                  <Chapter id="settled" question="What is already decided?">
                    {/* Collapsed by default. This is the reassuring half of the
                  page rather than the live half: a reader who wants to know
                  what is safe opens it, and everyone else goes straight to the
                  argument below. */}
                    <Span>
                      <Disclosure
                        variant="heading"
                        label={`All ${c.settled?.length} already in both bills`}
                      >
                        <ul className="grid gap-x-[32px] gap-y-[8px] sm:grid-cols-2 max-w-[92ch] pt-[12px]">
                          {c.settled?.map((s) => (
                            <li
                              key={s.p}
                              className="font-body text-base text-ink leading-[1.45] flex gap-[8px]"
                            >
                              <span aria-hidden className="text-yea">
                                ✓
                              </span>
                              <span>
                                {s.p}
                                <span className="block font-body text-sm text-ink-muted leading-[1.55] mt-[1px]">
                                  {s.d}
                                  <Cite id={s.c} order={order} />
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </Disclosure>
                    </Span>
                  </Chapter>

                  <Chapter
                    id="open"
                    question="What is still being decided?"
                    answer={
                      <Span>
                        <p className="font-body text-sm text-ink-muted leading-[1.65] max-w-[74ch]">
                          {c.open?.length} questions where the two bills differ.
                          The six can take either chamber's answer, or write a
                          third.
                        </p>
                      </Span>
                    }
                  >
                    <Span>
                      <ul className="flex flex-col gap-[10px] max-w-[92ch]">
                        {c.open?.map((o) => (
                          <Open key={o.q} o={o} order={order} />
                        ))}
                      </ul>
                    </Span>
                  </Chapter>
                </>
              ) : (
                <Chapter id="settled" question="What is already decided?">
                  <Span>
                    <p className="font-body text-sm text-ink-muted leading-[1.65] max-w-[74ch] border-l-2 border-line-strong pl-[16px]">
                      The comparison for this committee has not been compiled
                      yet. It needs both texts read side by side.
                    </p>
                  </Span>
                </Chapter>
              ))}

            {show("lobbying") && (
              <Boxed on={layout === "stacked"}>
                <LobbyingDisclosures
                  c={c}
                  titleClass={SUB_HEAD}
                  stickyHeading={stickyTop}
                  // Tabbed does not pin its headings, but the column heads
                  // still travel back up the window when they let go, so the
                  // heading needs the band's paint order even without the pin.
                  bandHeading={mode === "tabbed"}
                  headingRef={lobbyBand.ref}
                  // The column heads stay over the rows they name, the way
                  // the Public Input filters stay over the list.
                  headerTop={underHeading(lobbyBand.h)}
                  flush
                />
              </Boxed>
            )}

            {show("input") && (
              <Boxed on={layout === "stacked"} plain>
                <Chapter
                  id="input"
                  question="Public Input"
                  titleClass={SUB_HEAD}
                  stickyHeading={stickyTop}
                  bandHeading={mode === "tabbed"}
                  headingRef={inputBand.ref}
                  flush
                >
                  {/* The conference pages' own feed, filtering and chipping on
                      the same four positions the composer offers. It began as
                      the ballot pages' feed and is now a fork of it: sharing
                      one would mean one set of positions covering a ballot
                      question and a conference, and a reader who asked for the
                      Senate text would have come back as "Supports".

                      No invitation to file inside it. A conference takes no
                      testimony of its own, so the page's own form is the only
                      place that offers one. */}
                  {/* The filter row carries its own 16px of air above it,
                      for a feed that begins a section on its own. Here a
                      heading is already doing that, so the row's share comes
                      back off. */}
                  {inlineTestimony ? (
                    <div className="-mt-[16px]">
                      <SubmissionFeed
                        items={DEMO_TESTIMONY}
                        accounts={DEMO_ACCOUNTS}
                        subject={displayName(c.slug, c.short)}
                        pageSize={5}
                        includeTypeFilter
                        includeFollowingFilter
                        // The filters stay reachable while the list runs past
                        // them, in both views: they come to rest under whatever
                        // the view has pinned above them.
                        stickyTop={underHeading(inputBand.h)}
                      />
                    </div>
                  ) : (
                    // Sidebar mode: the rail is already holding the feed, so
                    // the page asks the other question instead.
                    //
                    // A floor under it in the tabbed view only, where this is
                    // a page of its own and the map alone leaves the tab bar
                    // sitting over empty ground.
                    <div className={mode === "tabbed" ? "min-h-[500px]" : ""}>
                      <PublicMap onOpenRail={openRailClean} />
                    </div>
                  )}
                </Chapter>
              </Boxed>
            )}

            {show("text") && (
              // Nothing under this section: the well ends the page.
              <Boxed on={layout === "stacked"} flushBottom plain>
                <ConferenceText
                  c={c}
                  titleClass={SUB_HEAD}
                  flush
                  hideQuestion={layout === "card"}
                  // Both layouts. The picker and the well rest against the
                  // underside of the bar and the well takes the window that is
                  // left, which is the same sum every other pinned thing on
                  // this page resolves to rather than a height of its own.
                  pinTop={pinnedH}
                />
              </Boxed>
            )}

            {/* Parked: "Where this comes from". The context notes still exist
                in the data and come back by flipping this. */}
            {false && (
              <>
                {(c.context?.length ?? 0) > 0 && (
                  <Chapter id="record" question="Where this comes from">
                    {c.context?.map((x) => (
                      <Span key={x.h}>
                        <p className="font-display font-medium text-lg text-ink">
                          {x.h}
                        </p>
                        <p className="font-body text-sm text-ink-muted leading-[1.65] mt-[6px] max-w-[74ch]">
                          {x.p}
                          <Cite id={x.c} order={order} />
                        </p>
                      </Span>
                    ))}
                  </Chapter>
                )}
              </>
            )}

            {/* Parked: Sources, replaced here by the bill text. The
                bibliography and its citations are untouched in the data. */}
            {false && (
              <>
                {order.length > 0 && (
                  <Chapter id="sources" question="Sources">
                    <Span>
                      {/* The ballot page's bibliography: IEEE citations as
                        bullets, the host name as the link. A citation is a
                        sentence, so it reads as one rather than splitting into a
                        title line with a byline underneath. */}
                      <ul className="list-disc list-outside pl-[20px] space-y-[8px] marker:text-ink-faint max-w-[74ch]">
                        {order.map((id) => {
                          const { pub, note } = ieeeParts(SOURCES[id].d);
                          return (
                            <li
                              key={id}
                              className="font-body text-sm leading-[1.6] text-ink"
                            >
                              &ldquo;{SOURCES[id].t},&rdquo; <em>{pub}</em>.
                              {note && ` ${note}`} [Online]. Available:{" "}
                              <a
                                href={SOURCES[id].u}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-baseline gap-[3px] text-brand underline underline-offset-[3px] hover:text-alert transition-colors"
                              >
                                {hostLabel(SOURCES[id].u)}
                                <ArrowUpRight className="w-[12px] h-[12px] shrink-0 self-center no-underline" />
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </Span>
                    <Span>
                      <p className="font-body text-xs text-ink-faint">
                        Read against both texts on {c.checked}
                        {c.textRead && ", both bills in full"}.
                      </p>
                    </Span>
                  </Chapter>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Panel
        views={[
          {
            id: RAIL_DEFAULT,
            title: "Public Input",
            action: railFiltered ? (
              <button
                onClick={clearRailFilters}
                className="shrink-0 font-body font-semibold text-xs text-brand-ink hover:text-brand cursor-pointer"
              >
                Clear filters
              </button>
            ) : undefined,
            content: (
              <div className="flex-1 min-h-0 overflow-y-auto px-[var(--rail-pad,18px)] pb-[22px] [--pinned-h:0px]">
                {/* Unpaged here, unlike the section on the page: the panel is a
                    column of its own height, so the list scrolls rather than
                    being dealt out five at a time. */}
                <SubmissionFeed
                  items={DEMO_TESTIMONY}
                  accounts={DEMO_ACCOUNTS}
                  subject={displayName(c.slug, c.short)}
                  filter={position}
                  onFilterChange={setPosition}
                  typeFilter={accountType}
                  onTypeFilterChange={setAccountType}
                  stickyTop="var(--pinned-h)"
                  includeFollowingFilter
                  includeTypeFilter
                  onCountChange={setRailCount}
                  onFilteredChange={setRailFiltered}
                  resetSignal={railReset}
                />
              </div>
            ),
          },
          {
            id: "compose",
            title: "Add Public Input",
            content: (
              <div className="flex-1 min-h-0 flex flex-col px-[var(--rail-pad,18px)] pt-[12px] pb-[22px]">
                {/* Cancel goes where the close control goes. In sidebar mode
                    that is back to the list the panel rests on; inline mode
                    has no such rest, so it puts the panel away, as the close
                    control does. */}
                <ConferenceCompose
                  onCancel={
                    inlineTestimony
                      ? collapseRail
                      : () => showView(RAIL_DEFAULT)
                  }
                />
              </div>
            ),
          },
        ]}
        view={railView[layout]}
        onViewChange={showView}
        // Closing the compose view puts the panel away rather than dropping
        // the reader onto the testimony list: they closed what they opened,
        // and the list is not what they asked to see. Reopening rests on it
        // again, since `openRailClean` returns to the default view.
        onCloseView={collapseRail}
        open={panelOpen}
        onOpenChange={(o) => (o ? openRailClean() : collapseRail())}
        // Inline mode reads the perspectives on the page, so the panel has
        // nothing to rest on: closed means gone, with no strip left on the edge
        // and no width held back for one. Both views stay mounted either way,
        // so a draft and the feed's filters survive the switch.
        strip={!inlineTestimony}
        count={railCount}
        onAdd={compose}
        addLabel="Add Public Input"
        onResize={setRailWidth}
        onResizeEnd={endRailResize}
      />
    </div>
  );
}

export function ConferenceCommittee() {
  const { slug } = useParams();
  const c = slug ? BY_SLUG[slug] : undefined;
  if (!c) {
    return (
      <div className="bg-ground min-h-screen font-body text-ink">
        <SiteNav inner={NAV_COLUMN} />
        <main className="mx-auto max-w-[1180px] px-[20px] sm:px-[32px] pt-[48px]">
          <p className="font-body text-base text-ink-muted">
            No conference committee at that address.{" "}
            <Link
              to="/conferenceCommittees"
              className="underline decoration-dotted underline-offset-[4px] text-link"
            >
              See all twelve
            </Link>
            .
          </p>
        </main>
      </div>
    );
  }
  return <Detail c={c} />;
}
