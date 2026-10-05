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

import { useId, useMemo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import {
  useParams,
  useSearchParams,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Bell,
  BellOff,
  BellPlus,
  BellRing,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Share,
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
import { BY_SLUG as BILL_BY_SLUG } from "../../data/bills-194";
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
  MINE_FULL,
  profileUrl,
} from "../../data/bill-lineage/members";
import {
  ClampedText,
  Hint,
  Pagination,
  holdPlace,
  holdPress,
  useMatchMedia,
} from "../ballot";
import {
  Chapter,
  Span,
  Disclosure,
  StickyBand,
  HEAD_GAP,
} from "../bill-example/spine";

/**
 * What a card on this page is padded by. Held here rather than taken from the
 * bill page's spine, so this page can change its own without reaching into
 * another page's module.
 */
const CARD_PX = "px-[32px]";
const CARD_PT = "pt-[24px]";
const CARD_PB = "pb-[32px]";
import {
  Conferees,
  VoteMap,
  surname as shortName,
} from "../bill-example/lineage-section";
import { billDocument, mapleBillUrl } from "../../data/bills-194/texts";
import { MapleFab } from "../tax-rebate-62f/maple-fab";
import {
  SubmissionFeed,
  OwnSubmission,
  type PositionFilter,
  type AccountTypeFilter,
} from "./testimony";
import { AccountAvatar, AccountTypeIcon, PositionChip } from "./accounts";
import { SentimentMap } from "./sentiment-map";
import {
  DEMO_ACCOUNTS,
  DEMO_SEATS,
  DEMO_TESTIMONY,
  VIEWER,
} from "../../data/conference-committees/testimony";
import type { ConferenceSubmission } from "../../data/conference-committees/testimony";
import { POSITIONS } from "../../data/conference-committees/positions";
import type { ConferencePosition } from "../../data/conference-committees/positions";
import {
  MAP_OUTLINE,
  MAP_SQUASH,
  MAP_VIEWBOX,
  seatCell,
  seatPoint,
} from "../../data/conference-committees/geography";
import { SiteNav } from "../site-nav";
import { LobbyingDisclosures } from "./lobbying";
import { orgLobbying } from "../../data/conference-committees/lobbying";
import { useDeviceViewport } from "../use-device-viewport";
import { useNarrow } from "../use-narrow";
// The writing step, the review step and the three containers it is being
// compared in. The page decides which container a route asks for; none of them
// knows about the others.
import {
  ConferenceCompose,
  asSubmission,
  REVIEW_PAGE_COPY,
  ReviewModal,
  ReviewPageBody,
  ReviewPane,
  reviewTitle,
} from "./compose";
import {
  detailPath,
  reviewPath,
  useDraft,
  useDrafted,
  usePosted,
  useRail,
} from "./draft";
import type { ReviewStyle } from "./draft";
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
 * One shape for all twelve: "Conference committee" + the subject, + "to
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
  // Drawn as links and going nowhere, for now.
  //
  // The two numbers are part of the sentence and the page reads wrong without
  // them marked, but neither destination is right yet: the bill pages this
  // prototype carries are a different prototype's, and sending a reader out to
  // the General Court mid-sentence ends the visit. They stay inert until there
  // is somewhere of our own to send them.
  //
  // To restore: a number in `BILL_BY_SLUG` goes to `/bills/${slugFor(n)}`, and
  // anything else to `https://malegislature.gov/Bills/194/` with the dot
  // stripped out of the number.
  const linkClass =
    "font-semibold underline decoration-dotted underline-offset-[3px] text-link hover:text-brand";
  const bill = (n?: string) =>
    n ? <span className={linkClass}>{n}</span> : null;
  // One sentence with the resolving as the means rather than the purpose:
  // what the committee is for is passing the act, and reconciling the two
  // texts is how.
  return (
    <>
      Conference committee to pass &ldquo;<em>An Act {phrase}</em>&rdquo; by
      resolving differences between {bill(senate)} and {bill(house)}
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
  // A source the page did not collect has no number, and printing 0 is worse
  // than printing nothing: it reads as a footnote the reader cannot find. The
  // mark is dropped instead, which is true, and the id is still in the data
  // for whoever is reading the file.
  const n = order.indexOf(id) + 1;
  if (!n) return null;
  return (
    <sup className="font-body font-semibold text-[0.55em] ml-[1px] align-super text-ink-faint">
      {n}
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
        className={`pointer-events-none absolute left-0 w-[320px] max-w-[80vw] bg-surface border border-line-strong rounded-control shadow-popover p-[14px] z-[80] text-left ${
          open ? "block" : "hidden"
        } ${up ? "bottom-full mb-[8px]" : "top-full mt-[8px]"}`}
      >
        <span className="block font-body font-semibold text-2xs uppercase tracking-[0.07em] text-ink-mid mb-[8px]">
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
        className={`font-body text-sm min-[390px]:text-base leading-[1.4] mt-[2px] ${
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
                <p className="font-body text-sm text-ink-mid leading-[1.65] border-l-2 border-line-strong pl-[14px]">
                  {o.why}
                </p>
              )}
              {o.regional && (
                <p className="font-body text-sm text-ink-mid leading-[1.65] border-l-2 border-official pl-[14px]">
                  <span className="font-semibold text-ink">Elsewhere. </span>
                  {o.regional.t}
                  <Cite id={o.regional.c} order={order} />
                </p>
              )}
              {o.ties.map((t) => (
                <p key={t.n} className="font-body text-sm text-caution-ink">
                  <span className="font-semibold">{t.n}</span>{" "}
                  <span className="text-ink-mid">{t.w}</span>
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
  className = "font-body text-sm text-ink-mid leading-[1.65]",
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
        <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid">
          Hearings
        </p>
      )}
      {/* The heading stays when there is nothing under it. That a conference
          has never met in public is the more interesting fact, and a section
          that vanishes reads as missing data rather than as an answer. */}
      {meetings.length === 0 && (
        // What the record supports is that nothing was noticed, which is not
        // the same claim as that nothing happened. A conference can meet
        // without filing a notice and nothing published would show it.
        <p className="font-body text-sm text-ink-mid">
          No meeting has been noticed.
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
  // A finger has no hover, but iOS sends one on the way to a tap, so the
  // section was told to read one person and hold another in the same gesture
  // and took turns between them. On a coarse pointer only the tap counts.
  const touch = useNarrow("(pointer: coarse)");
  const showing = (touch ? null : hovered) ?? picked;
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
  // The map is the grid cell rather than something inside one: a wrapper
  // around it only moved the cap a level away from the thing being capped.
  //
  // Capped below the breakpoint where the three columns become one stack, the
  // same cap and the same currency the bill page uses for this pair. Given a
  // whole row the map grew to fill it while the names beside it stayed at
  // reading size, which put a map the height of a phone screen between two
  // short lists. Above the breakpoint the two 1fr columns already hold it, so
  // the cap comes off and the pair stays equal to each other.
  const map = (chamber: "senate" | "house") => (
    <VoteMap
      key={chamber}
      className="flex-1 min-w-0"
      chamber={chamber}
      dim={!!showing}
      veil
      veilAt={0.35}
      paired
      highlight={six
        .filter((m) => m.key.startsWith("S:") === (chamber === "senate"))
        .map((m) => m.key)}
      selected={showing ? [showing] : []}
      // A cell leaving is not an answer: dragging across the map crosses the
      // hairline between two districts, and clearing on that gap made the
      // section flicker between every one of them. The reading changes when
      // something else claims it, and is let go of when the pointer leaves
      // the block altogether.
      onHover={(k) => !touch && k && setHovered(k)}
      onPin={pin}
      people={people}
    />
  );
  const names = (ch: "S" | "H") => (
    <Conferees
      ch={ch}
      people={six}
      showing={showing ? [showing] : []}
      onHover={(k) => !touch && k && setHovered(k)}
      onPin={pin}
    />
  );
  return (
    // Map, the two name lists, map. Both map columns are 1fr, so they are
    // identical and take every pixel the names leave. The wider break on
    // either side of the pair is padding on the name columns, never on a map
    // cell: padding inside a 1fr column would make that map the smaller one.
    //
    // Its own container, so the pairing is chosen by how much room this block
    // actually has rather than by how wide the window is. The two differ
    // whenever the panel is open or the card is narrow, and the window was
    // telling it to lay out four columns in the width of two.
    <div className="@container">
      {/* No card and no card title: a section heading in the page's own
          hierarchy, the same one the chapters below use, pinned the same way
          where the layout pins them. */}
      {title && (
        <p className="font-display font-medium text-xl text-ink leading-[1.3]">
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
      {/* One arrangement at every width: two pairs, each chamber's names
          beside its own map, the House pair mirrored so the two maps meet in
          the middle.

          There used to be a second, wider one, both name lists then both maps
          in a single row of four. It only appeared on a page with nothing else
          open, so the same card looked like two different things depending on
          whether the input panel was out. */}
      <div
        // The names and the maps are one area to the pointer: moving between a
        // conferee and their district, or between the two chambers, holds the
        // reading, and leaving the block is what lets it go.
        onPointerLeave={() => !touch && setHovered(null)}
        className={`grid grid-cols-2 gap-y-[32px] gap-x-[20px] @[720px]:grid-cols-[max-content_max-content_minmax(0,1fr)_minmax(0,1fr)] ${
          // The gap belongs to whatever sits above, the section heading or the
          // card's own title, and it is the same gap a chapter leaves under
          // its heading. With neither, the block around this already carries
          // the space and a second gap is a hole.
          heading || title ? HEAD_GAP : ""
        }`}
      >
        {/* The list is centred across its half while its own text stays left
            aligned, and sits at the top of the row rather than the middle of
            it: centred vertically, its chamber heading fell half a map below
            the map's own, and the two headings are a pair. */}
        {/* The Senate list sits on the block's left edge in both layouts: it
            is the first thing read, and centring it in a half-width cell put
            it adrift of everything above it. The House list keeps its own
            placement, mirrored against the map beside it. */}
        <div className="justify-self-start @[720px]:col-start-1 @[720px]:row-start-1">
          {names("S")}
        </div>
        <div className="min-w-0 max-w-[300px] @[720px]:max-w-none @[720px]:col-start-3 @[720px]:row-start-1">
          {map("senate")}
        </div>
        {/* Mirrored below the breakpoint: the map on the left so the two maps
            sit together, the names on the right. Above it, both name lists are
            together instead. */}
        <div className="min-w-0 max-w-[300px] @[720px]:max-w-none @[720px]:col-start-4 @[720px]:row-start-1">
          {map("house")}
        </div>
        <div className="justify-self-center @[720px]:justify-self-start @[720px]:col-start-2 @[720px]:row-start-1 @[720px]:pr-[28px]">
          {names("H")}
        </div>
        {/* The hearings close the block, so the space under them is what
            separates this section from the next. */}
        <div className="col-span-2 @[720px]:col-start-1 @[720px]:col-span-2 @[720px]:row-start-2">
          <Hearings meetings={meetings} />
        </div>
      </div>
    </div>
  );
}

/** Parked: the "The committee includes ..." sentence in the card. */
const SHOW_MEMBERS: boolean = false;

/** Parked: the clause naming what the two chambers differ on. */
const SHOW_CLAIM: boolean = false;

/** The switch between reading public input inline and in the panel. */
const SHOW_TESTIMONY_SWITCH: boolean = true;

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
              className="font-body text-base text-ink-mid leading-[1.6] mt-[8px]"
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
 * How long each county holds before the map moves on.
 *
 * Long enough to read the shortest submission in the panel rather than to
 * register that something changed. A carousel that turns faster than it can be
 * read is a distraction with the same shape as an advert. The ballot question's
 * map holds for the same count, because it is the same act of reading.
 */
const TOUR_MS = 7000;

/**
 * How many of a county's filers the column prints before the rest go behind a
 * pager.
 *
 * Five, the same number the Public Input section deals its own feed out in, so
 * the two lists of submissions on this page turn at the same length and the
 * control under them is the same control. Eight filers across the state is what
 * the placeholder data holds today; thirty from one county is the case this is
 * for, and thirty printed in a column beside a map is a column nobody reaches
 * the bottom of.
 */
const COUNTY_PAGE = 5;

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
 * a filled map would paint a district the color of one submission and invite a
 * reader to take an empty district as a district that disagrees. A dot can only
 * say "somebody here filed", which is all the data carries.
 *
 * Color follows the one axis the four positions share. Three of them ask the
 * conference to pass something and the fourth asks it to pass nothing, so a
 * county can lean toward a bill or toward none: green for a bill, red for none,
 * the map's own faint ink where the two are even. Which of the two texts a
 * county prefers is deliberately not here. House and Senate are a choice, not a
 * scale, and a dot cannot hold three colors and still be read as one place.
 */
function PublicMap({
  conferees,
  onOpenRail,
}: {
  /** The six seats on this conference, for the ground behind the dots. */
  conferees: string[];
  onOpenRail?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  /** For the clip path, which has to be addressable and must not collide. */
  const clipId = useId();
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
  // own faint ink rather than a color that would take a side.
  const places = useMemo(
    () =>
      [...new Set(filers.map((f) => f.seat))].flatMap((seat) => {
        const point = seatPoint(seat);
        if (!point) return [];
        const here = filers.filter((f) => f.seat === seat);
        // Which of the four this place is asking for, not which direction
        // it leans. Three of the four ask for a bill, so a two-colour lean
        // put the House version and the Senate version in the same green and
        // the map could not show the thing being negotiated. Even between the
        // top two, it keeps the map's own faint ink rather than taking a side.
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

  // Which page of a county's filers is showing, held with the county it belongs
  // to rather than beside it. Derived rather than reset in an effect: the
  // rotation changes the county without any control being pressed, and a page
  // number that outlived the county it was counted in would open the next one
  // part way down.
  const [paging, setPaging] = useState<{ seat: string | null; page: number }>({
    seat: null,
    page: 0,
  });
  const pageCount = Math.max(1, Math.ceil(shown.length / COUNTY_PAGE));
  // Clamped rather than trusted, the way the feed clamps its own.
  const page = Math.min(
    paging.seat === selected ? paging.page : 0,
    pageCount - 1,
  );
  const paged = shown.slice(
    page * COUNTY_PAGE,
    page * COUNTY_PAGE + COUNTY_PAGE,
  );

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
          <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid mb-[8px]">
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
              {/* The six conferees' districts, as ground rather than as
                  shapes. No edges: these are cells grown from a point each,
                  not boundaries, and two of them meeting should read as one
                  area rather than as two districts. The question the map is
                  being asked is coverage, whether the input came from
                  somewhere with somebody in the room, so the areas only have
                  to be roughly right and the dots are what carry the detail. */}
              {/* Clipped to the coastline. A cell is a Voronoi cell grown
                  from a seed, so the ones on the edge of the state run out to
                  the bounding box: unclipped, a district on the south coast
                  paints a wedge of open water the size of the Cape. */}
              <defs>
                <clipPath id={clipId}>
                  {MAP_OUTLINE.map((d) => (
                    <path key={d.slice(0, 24)} d={d} />
                  ))}
                </clipPath>
              </defs>
              <g clipPath={`url(#${clipId})`}>
                {conferees.flatMap((seat) => {
                  const cell = seatCell(seat);
                  return cell
                    ? [
                        <polygon
                          key={seat}
                          points={cell}
                          className="fill-ink-faint"
                          fillOpacity={0.45}
                        />,
                      ]
                    : [];
                })}
              </g>
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
                  aria-label={`${m.label}, ${m.count}`}
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
                    className={`${m.fill} transition-opacity duration-400 ${
                      selected && !active ? "opacity-25" : "opacity-90"
                    }`}
                  />
                  <text
                    x={m.point.x}
                    y={m.point.y - 12 - m.count * 3}
                    textAnchor="middle"
                    className={`font-body fill-ink text-[19px] pointer-events-none transition-opacity duration-400 ${
                      active ? "opacity-100" : "opacity-0"
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
            <p className="font-body text-sm text-ink-mid leading-[1.6]">
              Select a county.
            </p>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-[12px] pb-[12px] border-b border-line">
                <p className="font-display font-medium text-lg text-ink">
                  {shown[0]?.place ?? "This county"}
                  <span className="font-body font-normal text-sm text-ink-mid">
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
              {/* Five at a time, each one clamped, and both of those are the
                  feed's own behaviour rather than a second way of handling a long
                  list: without either, one county with thirty filers who each
                  wrote at length is a column several screens tall with the map
                  stranded at the top of it. */}
              <ul className="flex flex-col gap-[20px] mt-[16px]">
                {paged.map((f) => (
                  <li key={f.id}>
                    <p className="font-body font-semibold text-sm text-ink">
                      {f.name}
                    </p>
                    <div className="mt-[6px]">
                      <ClampedText
                        text={f.excerpt}
                        className="font-body text-sm text-ink leading-[1.65] whitespace-pre-line"
                      />
                    </div>
                  </li>
                ))}
              </ul>
              {pageCount > 1 && (
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onPage={(p) => {
                    // Through `choose`, like every other control in here, so
                    // turning a page stops the rotation and keeps the county it
                    // was turned in.
                    choose(selected);
                    setPaging({ seat: selected, page: p });
                  }}
                />
              )}
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
 * The way in, beside the section's heading.
 *
 * The panel's own plus, exactly: the same glyph at the same size, the same
 * padding, the same gray wash arriving on hover at the control radius. The one
 * difference is that this one says what it does as it lights up, because it
 * stands in the page beside a heading rather than in a panel header where the
 * title above it has already said.
 */
function AddInput({
  onClick,
  mine,
  posted = false,
}: {
  onClick: () => void;
  /** The six, so the line can say whether one of them is the reader's. */
  mine: CommitteeMember[];
  /** Already on the record, so the invitation has been taken. */
  posted?: boolean;
}) {
  // Once they have filed, the nudge has nothing to ask for and nothing to say
  // here: what happened is said over the section that holds what they filed.
  if (posted) return null;
  return (
    // The control the column of unresolved questions ends on, so the way in
    // is one thing a reader learns once. Right of the heading while they share
    // a line, and under the title and centred below 580.
    <p className="font-body text-sm text-ink leading-[1.5] text-right max-[580px]:text-center">
      {/* The star alone, where one of the six is the reader's own. The
          sentence that used to follow it says the same thing the column of
          unresolved questions already says further up the page, and beside a
          heading the mark is enough to carry it. */}
      {mine.length > 0 && (
        <Star
          aria-hidden
          className="inline align-[-2px] mr-[7px] w-[13px] h-[13px] text-caution fill-caution"
        />
      )}
      <button
        onClick={onClick}
        className="inline-flex items-baseline gap-[4px] font-body font-semibold text-sm text-brand-ink hover:text-brand cursor-pointer underline decoration-dotted underline-offset-[4px]"
      >
        Share your input
        <ArrowRight className="w-[13px] h-[13px] shrink-0 self-center no-underline" />
      </button>
    </p>
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
  asked = false,
  onCompose,
  posted = false,
}: {
  c: CommitteeDetail;
  /** The card view presses on the question itself and opens onto the two
   *  answers. The stacked one presses on the topic and opens onto the
   *  question with the answers under it, so its column scans as subjects. */
  card?: boolean;
  /**
   * Press on the question rather than on the topic.
   *
   * Two readings of the same list. Topics scan as subjects, which is the
   * faster way to find the one you care about; questions say what is actually
   * unresolved about each, which is the honest way to see how much is open.
   * Either reading works in either layout, so this is its own choice.
   */
  asked?: boolean;
  /** Offered where one of the six is the reader's own legislator. */
  onCompose?: () => void;
  /** Already on the record, so the sentence closes rather than inviting. */
  posted?: boolean;
}) {
  const settled = c.settled ?? [];
  const open = c.open ?? [];
  // Whichever of the six the reader is represented by, if either.
  // Both of them, not the first: a conference can hold the reader's
  // representative and their senator at once, and public records does.
  const mine = sixOf(c).filter((m) => MINE[m.key]);
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
        {/* No padding of its own in either view. The card around the section
            holds the gutter, and 18px more here stood the chevrons in from the
            heading above them and started the list lower in the tabbed view
            than in the scrolling one. */}
        <div>
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
                      // Outlined in the chamber's own color, which is the one
                      // the label above it is already set in, so the box says
                      // whose answer it is before the word does. The fill alone
                      // separated these while the section around them was the
                      // page's gray; on a white section it does nothing.
                      className={`flex-1 min-w-0 bg-surface border rounded-card p-[16px] ${
                        ch === "Senate" ? "border-[#2562b9]" : "border-user-ink"
                      }`}
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
                    contentClass="pl-0 min-[390px]:pl-[27px]"
                    // Tabbed shows the questions and nothing else, so there is
                    // room to answer them where they stand. Scroll keeps them
                    // folded, since they sit among everything else.
                    // Shut in both views. The column of topics is the thing
                    // to read first: what is unresolved, at a glance, before
                    // any one of them is opened.
                    // Card presses on the question; stacked presses on the
                    // topic and prints the question inside.
                    label={asked ? o.q : (o.topic ?? o.q)}
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
          {mine.length > 0 && (
            // Prose, not a row of boxes. As flex items the star wrapped onto a
            // line of its own and the control onto a third; inline, the star
            // sits with the first words and the control follows the sentence
            // and wraps only when it has to.
            <p className="font-body text-base text-ink leading-[1.6] mt-[48px] mb-[32px] @[720px]:mb-0">
              <Star
                aria-hidden
                className="inline align-[-2px] mr-[8px] w-[14px] h-[14px] text-caution fill-caution"
              />
              <span>
                {mine.length > 1 ? (
                  <>
                    Both of your legislators are on this committee,{" "}
                    <span className="font-semibold">
                      {shortName(mine[0].name)}
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold">
                      {shortName(mine[1].name)}
                    </span>
                    .
                  </>
                ) : (
                  <>
                    {MINE_FULL[mine[0].key]} is on this committee,{" "}
                    <span className="font-semibold">
                      {shortName(mine[0].name)}
                    </span>
                    .
                  </>
                )}
              </span>
              {/* Once they have filed, the sentence says so and stops. The
                  fact above it is still worth saying: one of the people
                  answering these questions is theirs, and now they have told
                  them something. */}
              {posted ? (
                <>
                  {" "}
                  <span className="font-semibold text-positive-ink">
                    Your input is on the record.
                  </span>
                </>
              ) : (
                onCompose && (
                  <>
                    {" "}
                    {/* The arrow the ballot pages' testimony link carried, kept
                      inside the control so it is part of the target rather than
                      punctuation after it.

                      `items-baseline` rather than the centred version that link
                      used: this one sits mid-sentence, and a flex container only
                      hands its own baseline to the line it is on if something
                      inside it is baseline aligned. Without it the words drop
                      below the sentence they belong to. The arrow is centred
                      against them on its own, and carries `no-underline` so the
                      dotted rule stops at the last word. */}
                    <button
                      onClick={onCompose}
                      className="inline-flex items-baseline gap-[4px] font-body font-semibold text-base text-brand-ink hover:text-brand cursor-pointer underline decoration-dotted underline-offset-[4px]"
                    >
                      Share your input
                      <ArrowRight className="w-[14px] h-[14px] shrink-0 self-center no-underline" />
                    </button>
                  </>
                )
              )}
            </p>
          )}
        </div>

        {/* Pulled up so the label sits level with the section heading rather
            than a list-length below it. One offset for both views now that
            neither column carries padding of its own: the pull is HEAD_GAP
            plus the 14px that lands the label on the heading's own line.

            This is the one section whose heading does not pin, which is what
            lets the label sit level with it in normal flow. A pinned heading's
            band is opaque and runs the full width of the card, so it would
            paint over the label. */}
        <div className="hidden @[720px]:block @[720px]:-mt-[44px]">
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
                <p className="font-body text-sm text-ink-mid leading-[1.6]">
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
          className={`flex items-baseline gap-[8px] font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid ${
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
  glyph?: React.ReactNode;
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
        className="group w-full text-left flex items-start gap-[6px] py-[5px] cursor-pointer"
      >
        {/* Control, then mark, then words. The chevron leads, so this column
            opens the same way the questions beside it do, and the check sits
            with the words it qualifies. Optional, for a list without one. */}
        <span className="shrink-0 flex items-start gap-[10px]">
          <ChevronRight
            aria-hidden
            // Lighter than the rest of the row: it is the affordance, not
            // the content, and it only has to be found when looked for.
            className={`mt-[2px] w-[15px] h-[15px] text-line-strong group-hover:text-ink-faint transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
          {glyph && (
            <span className="w-[18px] flex justify-center">{glyph}</span>
          )}
        </span>
        <span className="flex-1 font-body text-sm text-ink leading-[1.5]">
          {title}
        </span>
      </button>
      {/* Indented to the words: the mark and the chevron together, plus the
          gap after them. */}
      {open && (
        <div className={`${glyph ? "pl-[49px]" : "pl-[21px]"} pb-[12px]`}>
          {children}
        </div>
      )}
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
function Rail({
  current,
  composing = false,
  hidden = false,
  label,
  href,
}: {
  /** Out of the way while the panel is taking a share of the window: with
   *  both open the reading column is narrower than either, and the list is
   *  the one of the three a reader is not working in. */
  hidden?: boolean;
  /** Whether the composer is open on the current committee. The mark is for
   *  a draft you are not looking at, so it comes back the moment the form is
   *  put away, even without leaving the page. */
  composing?: boolean;
  current: string;
  label: boolean;
  /**
   * Where a committee is. Handed in rather than written here, because the
   * address carries which container draws the review step and which layout the
   * page is read in, and neither is this list's business to know.
   */
  href: (slug: string) => string;
}) {
  const drafted = useDrafted();
  const posted = usePosted();
  return (
    // In the flow, not absolute. The page below the nav widens by exactly the
    // rail plus its gap, so the rail lands in what would otherwise be margin
    // and the reading column still begins where the nav's content does.
    <nav
      aria-label="Conference committees"
      // It narrows rather than collapsing, and narrows by the window rather
      // than at a step: a strip of twelve pills across the top costs a whole
      // band of the page and still has to be scrolled sideways, while a
      // column that gives up a few pixels at a time keeps the list where a
      // reader already found it. 236 down to 168, and the names wrap rather
      // than being cut.
      className={`hidden w-[clamp(168px,19vw,236px)] shrink-0 sticky top-[var(--nav-h)] self-start max-h-[calc(100vh-var(--nav-h))] overflow-y-auto pt-[26px] pb-[48px] ${
        hidden ? "min-[1480px]:block" : "md:block"
      }`}
    >
      {label && (
        <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid mb-[14px]">
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
                {/* The mark sits at the far edge of the row rather than
                    against the name, so a column of them reads down the right
                    the way a list of unread things does. Never on the one you
                    are reading: the draft is on screen, and a mark pointing at
                    where you already are says nothing. */}
                <span className="flex items-start justify-between gap-[8px]">
                  <span className="min-w-0">
                    {displayName(x.slug, x.short)}
                  </span>
                  {/* Finished work takes the mark a word cannot: a check
                      says done at a glance, where "posted" would read as one
                      more label to compare against "draft". Shown on the
                      committee you are reading as well, because unlike a
                      draft it is not already on screen. */}
                  {posted.has(x.slug) ? (
                    <span
                      // On the wrapper rather than the glyph: a title on an
                      // SVG is not shown by every browser, and this one has to
                      // be, since the mark says nothing on its own.
                      title="Submitted input"
                      aria-label="Submitted input"
                      className="shrink-0 mt-[2px]"
                    >
                      <Check
                        aria-hidden
                        className="w-[13px] h-[13px] text-positive-ink"
                        strokeWidth={2.5}
                      />
                    </span>
                  ) : (
                    (!on || !composing) &&
                    drafted.has(x.slug) && (
                      // A word rather than a glyph, because an icon says there
                      // is something here without saying it is unfinished and
                      // yours. No fill and no caps: at this size the word alone
                      // is enough, and the row is a list of committees rather
                      // than a list of drafts.
                      <span className="shrink-0 mt-[2px] font-body text-2xs italic text-ink-faint">
                        draft
                      </span>
                    )
                  )}
                </span>
              </span>
              <span className="block font-body text-xs text-ink-faint leading-[1.35] mt-[1px]">
                {[recordForSlug(x.slug)?.senate, recordForSlug(x.slug)?.house]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </>
          );
          // overflow-hidden on the row, so the rounded right edge clips its
          // own background instead of the rail's scroll box cutting it.
          const box =
            "block overflow-hidden border-l-[3px] pl-[11px] pr-[8px] py-[7px] rounded-r-control transition-colors";
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
                  to={href(x.slug)}
                  aria-current={on ? "page" : undefined}
                  className={`${box} group ${
                    on
                      ? // A hairline rather than more colour: the ground is
                        // within three per cent of white, so the white row
                        // needed an edge to read as white at all. Drawn as a
                        // half pixel ring rather than a border, because three
                        // of the four sides are free but the fourth carries
                        // the brand bar that marks where you are. Inset, so
                        // the list's own scroller cannot clip it: an outer
                        // ring was cut off down the column's edge.
                        "border-brand bg-surface shadow-[inset_0_0_0_0.5px_var(--color-line)]"
                      : // No rule on hover. The left bar is what marks the one
                        // you are on, so lighting it under the pointer says
                        // you are somewhere you are not.
                        "border-transparent hover:bg-wash"
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
/**
 * The committee list where there is no room for a column.
 *
 * A picker rather than a strip of twelve pills: the pills cost a whole band of
 * the page, had to be scrolled sideways to reach the twelfth, and still only
 * showed one at a time as the current one. This says which committee you are
 * reading and opens the rest on a press, in the platform's own list, and it
 * stays under the nav as the page scrolls so changing committee never means
 * scrolling back up.
 */
/**
 * The committee list as the title itself, where there is no room for a column.
 *
 * A panel of our own rather than the browser's select, which paints in the
 * operating system's style and arrives nothing like the rest of the page. The
 * rows are the rail's rows: the name, the two bill numbers under it, and the
 * one being read marked rather than ticked.
 */
function TitlePicker({
  slug,
  short,
  href,
}: {
  slug: string;
  short: string;
  href: (slug: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  // Where the panel is drawn. It hangs off the body rather than off the
  // heading, so no card, sticky band or overflow on the way up can clip it or
  // paint over it, and it is placed against the button by hand instead.
  const [at, setAt] = useState<{ left: number; top: number } | null>(null);
  useEffect(() => {
    if (!open) return;
    // The heading is sticky, so the button moves under the pointer as the
    // page scrolls. Measured on every scroll in any ancestor, not only once.
    const place = () => {
      const r = box.current?.getBoundingClientRect();
      if (r) setAt({ left: r.left, top: r.bottom + 10 });
    };
    place();
    const away = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!box.current?.contains(t) && !panel.current?.contains(t))
        setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    window.addEventListener("pointerdown", away);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      window.removeEventListener("pointerdown", away);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div ref={box} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        // Inert once the rail is back: above the breakpoint the heading is a
        // heading and the list is a column down the left.
        className="md:pointer-events-none flex w-full items-start gap-[8px] text-left cursor-pointer"
      >
        <h1 className="min-w-0 font-body font-bold text-[28px] @[700px]:text-[40px] leading-[1.2] text-[#0b1a4d] text-balance">
          {displayName(slug, short)}
        </h1>
        <ChevronDown
          aria-hidden
          strokeWidth={2.5}
          className={`md:hidden shrink-0 mt-[9px] w-[22px] h-[22px] text-[#0b1a4d] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open &&
        at &&
        createPortal(
          <div
            ref={panel}
            role="listbox"
            style={{ left: at.left, top: at.top }}
            // Z_MENU: something the reader has just opened, so it sits above
            // the nav and the floating buttons. Scrolls inside itself, and
            // keeps that scroll off the page behind it.
            className="md:hidden fixed z-[70] w-[min(340px,calc(100vw-40px))] max-h-[62vh] overflow-y-auto overscroll-contain rounded-card bg-surface border border-line shadow-popover py-[6px]"
          >
            {COMMITTEES.map((x) => {
              const on = x.slug === slug;
              const rec = recordForSlug(x.slug);
              const meta = [rec?.senate, rec?.house]
                .filter(Boolean)
                .join(" · ");
              const inside = (
                <>
                  <span className="block font-body text-base leading-[1.3]">
                    {displayName(x.slug, x.short)}
                  </span>
                  <span className="block font-body text-xs text-ink-faint leading-[1.35] mt-[1px]">
                    {meta}
                  </span>
                </>
              );
              const row =
                "block border-l-[3px] pl-[13px] pr-[12px] py-[9px] transition-colors";
              return NOT_LINKED.has(x.slug) ? (
                <span
                  key={x.slug}
                  aria-disabled
                  className={`${row} border-transparent text-ink-faint cursor-default`}
                >
                  {inside}
                </span>
              ) : (
                <Link
                  key={x.slug}
                  to={href(x.slug)}
                  role="option"
                  aria-selected={on}
                  onClick={() => setOpen(false)}
                  className={`${row} ${
                    on
                      ? "border-brand bg-wash font-semibold text-brand"
                      : "border-transparent text-ink hover:bg-wash"
                  }`}
                >
                  {inside}
                </Link>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

function RailStrip({
  current,
  href,
}: {
  current: string;
  href: (slug: string) => string;
}) {
  const navigate = useNavigate();
  return (
    <nav
      aria-label="Conference committees"
      className="md:hidden sticky top-[var(--nav-h)] z-[12] -mx-[20px] sm:-mx-[32px] px-[20px] sm:px-[32px] pt-[16px] pb-[12px] bg-ground"
    >
      <div className="relative">
        <select
          aria-label="Conference committee"
          value={current}
          onChange={(e) => navigate(href(e.target.value))}
          className="appearance-none w-full font-body font-semibold text-base text-ink bg-surface border border-line rounded-control pl-[14px] pr-[38px] py-[10px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {COMMITTEES.map((x) => (
            <option
              key={x.slug}
              value={x.slug}
              disabled={NOT_LINKED.has(x.slug)}
            >
              {displayName(x.slug, x.short)}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-ink-mid"
        />
      </div>
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
  const [picked, setSide] = useState<"house" | "senate" | "both" | null>(null);
  const narrow = useNarrow();
  const side = picked ?? (narrow ? "senate" : "both");
  const bill = side === "house" ? c.houseBill : c.senateBill;
  const doc = billDocument(bill?.n);
  // Both, side by side in the same well. A conference is two texts being
  // reconciled, so the comparison is the thing; one sheet at a time makes the
  // reader hold one of them in their head.
  const pair = side === "both";
  const other = side === "house" ? c.senateBill : c.houseBill;
  const otherDoc = billDocument(other?.n);
  /** Where a reader goes when there is nothing to show. MAPLE has the text of
      all five documents whose own API record carries none. */
  const maple = bill ? mapleBillUrl(bill.n) : null;
  /**
   * Where the box comes to rest: everything the page has pinned above it, plus
   * the air a landed section leaves under the bar, so the picker comes to rest
   * exactly where the jump put it instead of sliding the last few pixels. It
   * had 20 of its own against the page's 24, and that 4px slide was visible.
   * One expression, used twice: as the offset it rests at, and taken off the
   * window to get the height that reaches the bottom of the screen.
   */
  const rest = pinTop ? `calc(${pinTop} + ${SECTION_AIR}px)` : undefined;
  /**
   * Whether the viewer takes the window.
   *
   * Only where there is a document to read. Five of the twenty-two documents
   * carry no text, and the economic development conference has no bills
   * recorded at all, and a full window of empty well behind one line of
   * apology is worse than the short box it replaces.
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

        Unpinned, on a chamber whose document carries no text, the well keeps its
        own height and the section carries the bottom of the page itself.
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
              onChange={(e) =>
                setSide(e.target.value as "house" | "senate" | "both")
              }
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
              <option value="senate">Senate Version</option>
              <option value="house">House Version</option>
              <option value="both">Senate and House</option>
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-[11px] w-[15px] h-[15px] text-ink-mid"
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
          {pair ? (
            // Two sheets in the one well, each scrolling on its own, so a
            // reader can hold a section of one against the same section of
            // the other. Always side by side, and narrow: a column of statute
            // at half the width reads like the phone does, which is a shape
            // the page already handles.
            <div className="flex-1 min-w-0 min-h-0 flex gap-[16px]">
              {[doc, otherDoc].map((d, i) => (
                <div key={i} className="flex-1 min-w-0 min-h-0 flex">
                  {d?.text ? (
                    <Sheet doc={d} locked={fill && !parked} />
                  ) : (
                    <div className="m-auto max-w-[280px] text-center">
                      <p className="font-body text-sm text-ink-mid leading-[1.7]">
                        {(i === 0 ? bill : other)?.n ?? "This side"} is not
                        bundled here.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : doc?.text ? (
            <Sheet doc={doc} locked={fill && !parked} />
          ) : (
            <div className="mx-auto max-w-[560px] text-center py-[14px]">
              <p className="font-body text-sm text-ink-mid leading-[1.7]">
                {!bill
                  ? "This committee's bills are not recorded yet."
                  : doc?.absence === "none-published"
                    ? `The legislature's machine-readable record has no text for ${bill.n}.`
                    : `The text of ${bill.n} is not bundled with this prototype yet.`}{" "}
                {/* MAPLE rather than the General Court. The General Court
                    publishes these five as a PDF and carries no text under the
                    number, which is why its own API returns nothing; MAPLE has
                    the words, so it is the link that answers the question the
                    reader just asked. */}
                {bill && (
                  <a
                    href={maple ?? bill.u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline decoration-dotted underline-offset-[4px] text-link hover:text-brand"
                  >
                    {maple
                      ? "Read it on MAPLE"
                      : "Read it on malegislature.gov"}
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
 * The gap above every section, in both layouts. The one number.
 *
 * Read by the box that draws it and by the jump that lands a section under the
 * bar, so a section you pressed a tab to reach sits where one you scrolled to
 * sits. It was three numbers in four places before, and they had drifted: the
 * boxes said 24, the jump said 24 but measured it from the wrong box, the bill
 * text's well came to rest at 20, and a scroll margin said 120.
 */
const SECTION_AIR = 24;
/** The tab bar's own height, its rule included. */
const BAR_H = 47;
/**
 * Everything pinned above a section, as a CSS length: the fixed nav and the
 * bar resting under it. `pinned()` is the same sum in numbers, so an offset
 * and a height cannot drift apart.
 */
const PINNED_H = `calc(var(--nav-h) + ${BAR_H}px)`;

/**
 * The box a section's air is measured from.
 *
 * The id sits on the heading's own `<section>`, which in the scrolling view is
 * inside the card rather than around it: a jump that landed that put the
 * card's own top padding above the bar and its edge behind it. The box is the
 * outermost one, the one carrying the air, and `Boxed` marks it.
 */
const sectionBox = (id: string) => {
  const el = document.getElementById(id);
  // `closest` starts at the element, so a section that is its own box in the
  // tabbed view answers for itself.
  return el?.closest<HTMLElement>("[data-air]") ?? el;
};

/**
 * How much of a box's top the reader cannot see.
 *
 * A framed section shows its edge, so the air is the gap to the box. A
 * frameless one shows nothing until its content, so the padding inside it is
 * not air anybody can see and the gap is measured past it. Read off the box
 * rather than written down a second time: the box already knows.
 */
const unpainted = (el: HTMLElement) => {
  if ("frame" in el.dataset) return 0;
  const cs = getComputedStyle(el);
  return (
    (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.borderTopWidth) || 0)
  );
};

/**
 * A section's own box, and the air above it.
 *
 * Always here, in both layouts: `on` decides whether it draws a card, not
 * whether it exists. It is the section's outermost box either way, which is
 * what lets one margin and one jump agree about where a section starts.
 *
 * Vertical only. The white cards came off, and with them the reason to inset
 * from the sides: a section should start where the heading above it starts.
 */
function Boxed({
  id,
  on,
  flushBottom,
  plain,
  filled,
  tint,
  bleed,
  children,
}: {
  /** For the one section whose heading is not drawn by a `Chapter`. */
  id?: string;
  on: boolean;
  /** Drop the padding underneath, for a section that ends the page. */
  flushBottom?: boolean;
  /**
   * Keep the box and lose the line. For a section whose own content is
   * already framed, where a second border is a box inside a box.
   */
  plain?: boolean;
  /** White rather than the page ground. */
  /** White rather than the page ground. */
  filled?: boolean;
  /**
   * A point off that white, for a filled section whose content is itself
   * cards. White cards on a white card have only their own edges to be found
   * by; a shade behind them gives them something to sit on.
   */
  tint?: boolean;
  /**
   * Keep the vertical rhythm and give the width back.
   *
   * For a section whose content is already a run of cards: a second card
   * around them is a box inside a box, and the inset made them narrower than
   * the card above for no reason a reader could see. The block pulls back out
   * by exactly the padding it sets, so its content starts on the page column
   * and lines up with the outside edge of the cards above it.
   */
  bleed?: boolean;
  children: React.ReactNode;
}) {
  // Whether the box's own top edge is something the reader can see: a line, a
  // fill, or both. A bled or plain box paints nothing until its content, so
  // the air above it is measured to that instead.
  const framed = on && (filled || !(plain || bleed));
  return (
    // The card, where it draws one, is outlined rather than filled: each
    // section is its own block on a page that is otherwise one long column.
    // The side padding matches the bleed a pinned heading takes, so the
    // heading's band runs to the inside of the line rather than over it.
    <div
      id={id}
      // What the jump measures from. The id it would otherwise find is on the
      // heading's section, one box further in.
      data-air=""
      // Whether that measurement stops at this edge or goes on to the content.
      data-frame={framed ? "" : undefined}
      // The air, from the one constant rather than from a class, because a
      // class would be a second place to write the number down.
      //
      // Anything inside that paints a band of the page's own color, a pinned
      // heading or a pinned row of controls, reads --band and so follows the
      // card rather than the page. Written as a style rather than a class:
      // an arbitrary custom property whose value is itself a var() generates
      // no rule, so as a class it silently did nothing.
      style={
        {
          marginTop: SECTION_AIR,
          ...(filled && on
            ? {
                "--band": tint
                  ? "var(--color-surface-tinted)"
                  : "var(--color-surface)",
              }
            : null),
        } as CSSProperties
      }
      // flow-root, so nothing inside can move this edge. A pinned heading's
      // band carries a negative top margin, and through a box with no padding
      // of its own that margin collapsed outward and took the box up with it:
      // 12px in the scrolling view and none in the tabbed one, from the same
      // markup.
      className={`flow-root ${
        on
          ? `border rounded-card ${
              // A white card is padded two pixels past the usual 32, and its
              // heading is drawn four back from that: the body sits at 34
              // and the heading at 30, which is the four pixels the first
              // capital of a heading asks for and the body does not.
              filled
                ? `on-surface pl-[34px] pr-[32px] ${
                    tint ? "bg-surface-tinted" : "bg-surface"
                  }`
                : CARD_PX
            } ${CARD_PT} ${plain || bleed ? "border-transparent" : "border-line"} ${
              bleed ? "-mx-[32px]" : ""
            } ${flushBottom ? "" : CARD_PB}`
          : ""
      }`}
    >
      {children}
    </div>
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
     * other.
     *
     * The mark is where a jump parks a section: its own box top, SECTION_AIR
     * below the underside of the bar. That is the whole point. The handover
     * used to sit at the midpoint of the gap above a section, which is 12px
     * higher, so pressing a tab scrolled the section into place and then left
     * the bar lit on the section before it. A control that does not light when
     * you press it is the page telling the reader it did not hear them.
     */
    const read = () => {
      const line = barRef.current?.getBoundingClientRect().bottom ?? 0;
      let current = sections[0]?.id ?? "";
      for (const x of sections) {
        // The section's own box, the one the jump measures, rather than the
        // inner element, which sits 25px inside a card.
        const el = sectionBox(x.id);
        if (!el) continue;
        // The half pixel keeps a landing that rounds down from missing it.
        if (el.getBoundingClientRect().top <= line + SECTION_AIR + 0.5)
          current = x.id;
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
      className="sticky z-10 -mx-[32px] px-[32px] bg-ground border-b border-line"
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
                : "text-ink-mid border-transparent hover:text-ink"
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
  "relative [.on-surface_&]:left-[-4px] font-display font-normal text-xl lg:text-[22px] text-ink text-balance";

/**
 * Every section the address can name.
 *
 * Your Input is not in the contents bar, because it only exists once the
 * reader has filed something, but a link can still land on it and the page
 * writes it into the address after posting. A fragment the page does not
 * recognise is one it will not position, which left the reader holding a
 * `#your-input` that behaved like no anchor at all.
 */
const ANCHORS = () => [...CONTENTS.map((x) => x.id), "your-input"];

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
  head,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  /** What the switch is for, over the top of it. Two of these sit together and
   *  neither pair says on its own which axis it moves. */
  head?: string;
  /** What each option is called, where the word on the switch is not the word
   *  the state is keyed by. */
  labels?: Partial<Record<T, string>>;
}) {
  return (
    <div className="flex flex-col items-start gap-[4px]">
      {head && (
        <span className="font-body font-semibold text-2xs uppercase tracking-[0.07em] text-ink-faint">
          {head}
        </span>
      )}
      <div className="flex items-center gap-[2px] bg-surface border border-line-strong rounded-pill shadow-popover p-[3px]">
        {options.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={`min-w-[62px] text-center font-body font-semibold text-sm capitalize rounded-pill px-[10px] py-[4px] cursor-pointer transition-colors ${
              value === v
                ? "bg-ink text-ink-inverse"
                : "text-ink-mid hover:bg-wash"
            }`}
          >
            {labels?.[v] ?? v}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * One document, as a sheet in the well.
 *
 * `locked` holds its scroll until the well itself has come to rest, so the
 * wheel finishes the page before it starts on the bill.
 */
function Sheet({
  doc,
  locked,
}: {
  doc: { number: string; title: string; text: string };
  locked: boolean;
}) {
  return (
    <div
      // overflow-x-hidden is not belt and braces: setting only the y axis
      // leaves x as `visible`, which the spec then computes to `auto` because
      // the two cannot differ that way, so the page scrolled sideways over a
      // pixel of rounding.
      className={`mx-auto w-full max-w-[680px] overflow-x-hidden bg-surface shadow-popover rounded-[3px] scrollbar-always px-[28px] py-[34px] sm:px-[52px] sm:py-[44px] ${
        locked ? "overflow-hidden" : "overflow-y-auto"
      }`}
    >
      {/* The chamber before the number. Side by side, two numbers alone make
          a reader work out which text they are in from the prefix on them. */}
      <p className="font-body font-semibold text-sm text-ink-mid">
        {doc.number.startsWith("S") ? "Senate" : "House"} &ndash; {doc.number}
      </p>
      <p className="font-display font-medium text-lg text-ink leading-[1.3] mt-[2px] mb-[24px]">
        {doc.title}
      </p>
      {/* One block per line the legislature broke, rather than one block for
          the whole bill. Its line breaks are the only structure a bill has, and
          as a single preformatted run they could only be breaks; split, each
          one is a paragraph and can take space after it, which is what makes a
          wall of statute readable. Blank lines are dropped, since the space is
          now carried by the margin. */}
      {doc.text
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line, i) => (
          <p
            key={i}
            className="font-body text-sm text-ink leading-[1.7] mb-[12px] last:mb-0 whitespace-pre-wrap break-words"
          >
            {line}
          </p>
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
const RAIL_MAX_SHARE = 0.48;
/**
 * What the page keeps, whatever the panel is dragged to.
 *
 * A share of the window is the wrong limit on its own: the committee list and
 * the gutters come off the same side, so the panel was leaving the cards
 * narrower than a phone, with names wrapping a word to a line. This is the
 * list, both gutters, the card's own padding either side, and 390px of card,
 * which is where the committee block stops being readable.
 */
const PAGE_MIN = 236 + 64 + 64 + 390;
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
/** Which of the two the unresolved list presses on. */
type UnresolvedMode = "topics" | "questions";

function Detail({ c, style }: { c: CommitteeDetail; style: ReviewStyle }) {
  const rec = recordForSlug(c.slug);
  const meetings = MEETINGS[c.slug] ?? [];
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, patchDraft] = useDraft(c.slug);
  /**
   * What the full-page review sent the reader back with.
   *
   * Only the page style needs this. Routing away unmounts the page, so coming
   * back from the review lands on a fresh one with everything shut: "Back to
   * editing" would make the reader reopen the form they were in the middle of,
   * and
   * "Read what others filed" would drop them at the top of the page rather
   * than on the list. History state rather than a query parameter, so the URL
   * still says only which committee and which layout, and it survives
   * HashRouter because it is held in the history entry rather than the address.
   *
   * This is the bookkeeping the route option costs. The pane and the modal
   * never unmount the page, so neither of them needs a line of it.
   */
  const landed = location.state as {
    compose?: boolean;
    feed?: boolean;
  } | null;
  const returning = landed?.compose === true;
  const landedOnFeed = landed?.feed === true;
  /**
   * Whether the review step is in front, for the two styles that draw it here.
   *
   * The page style has no flag of its own: its review is a route, and the URL
   * is the state. That asymmetry is most of what is being compared, so it is
   * left standing rather than smoothed over with a flag the route never reads.
   */
  const [review, setReview] = useState(false);
  /**
   * Which of the two reads this is, and a way to link to either.
   *
   * `?view=scroll` and `?view=tabbed` name them by what they do rather than by
   * what the code calls them, so a link can be sent to someone and land them
   * in the right one. Anything else, or nothing, is the tabbed read.
   */
  const [params, setParams] = useSearchParams();
  const layout: Layout = params.get("view") === "tabbed" ? "card" : "stacked";
  const setLayout = (v: Layout) => {
    const next = new URLSearchParams(params);
    next.set("view", v === "stacked" ? "scroll" : "tabbed");
    // Replaced, not pushed: the switch is how the page is being read rather
    // than somewhere the reader went, so Back should leave the page.
    setParams(next, { replace: true });
  };
  // One choice for the page rather than one per layout: it is the same question
  // in both, where the perspectives are read, and it sits beside the layout
  // switch as one control. The panel's own state stays keyed by layout under
  // it, so the two axes do not interfere.
  // In the URL beside the layout, for the same reason: a link can say how the
  // page should be read, not only which page it is. ?input=sidebar opens in
  // the panel; anything else, or nothing, is the inline read, because the page
  // reads on its own and the panel is something the reader opens rather than
  // something already taking width.
  const testimony: TestimonyMode =
    params.get("input") === "sidebar" ? "sidebar" : "inline";
  // Not in the URL, unlike the layout and where input is read. Those two are
  // how a link asks for the page to be read; this is a preference inside one
  // section, and a link that carried it would be making a claim about the
  // page it is not entitled to make.
  //
  // Topics by default: the list is quicker to scan as subjects, and the
  // question is one press away either way.
  const [unresolved, setUnresolved] = useState<UnresolvedMode>("topics");
  const [following, setFollowing] = useState(false);
  // Folded away while the panel is open or the window is narrow, which are the
  // two cases where the corner is not the page's to spend.
  // 1440 rather than the lg breakpoint: the twelve committees down the left
  // are part of a centred block, so the corner stops being free long before
  // the window is a phone's. Below this the switches sit over that list.
  const narrowControls = useMatchMedia("(max-width: 1439.98px)");
  const [controlsOpen, setControlsOpen] = useState(true);
  const [controlsTouched, setControlsTouched] = useState(false);
  const setTestimony = (v: TestimonyMode) => {
    const next = new URLSearchParams(params);
    next.set("input", v);
    setParams(next, { replace: true });
  };
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
  //
  // Opened on the form when the reader is coming back from the full-page
  // review, so "Back to editing" puts them where they were rather than on a
  // page with everything shut.
  // Held per committee rather than per page, so going to look at another
  // conference does not shut the one you were writing on, and coming back
  // finds it open on the form with your own words still in it.
  const { rail, setRail, railView, setRailView } = useRail(
    c.slug,
    returning,
    returning ? "compose" : RAIL_DEFAULT,
  );
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
  // The co-sign experiment's own route, and nothing else. The committee page
  // everyone else is looking at keeps the panel it had.
  // Both copies of the route, which behave alike until one is changed.
  const cosignRoute = /\/cosign(-\d+|-viz)?$/.test(location.pathname);
  // The eighth and ninth readings have two steps rather than three: the terms
  // are on the step that asks, and the writing step ends in the act itself.
  //
  // They differ only in where the reader lands afterwards and which of the two
  // moments plays. The eighth leaves them in the public record and runs the
  // count up on the letter; the ninth puts them in their own section and plays
  // the line over it. One at a time, so each ending is judged on its own.
  const ownEnding =
    location.pathname.endsWith("/cosign") ||
    location.pathname.endsWith("/cosign-viz") ||
    location.pathname.endsWith("/cosign-9") ||
    location.pathname.endsWith("/cosign-10");
  const directCosign = location.pathname.endsWith("/cosign-8") || ownEnding;
  // The sixth alone, where the feed is handed the section's own title so that
  // the title, the map and the filters can be drawn as one card.
  const headedFeed = location.pathname.endsWith("/cosign-6");
  /**
   * The panel over the whole window rather than a column of it.
   *
   * Co-signing is reading and writing at once: the letter being signed on one
   * side, the form on the other. A column cannot hold both, and widening it by
   * drag only takes the room from the page behind it, which is where the
   * letter is.
   */
  const [panelFull, setPanelFull] = useState(false);
  /** When the corner is not the page's to spend on three stacked switches. */
  const tightControls = narrowControls || panelOpen;
  // The default follows the room available; a press overrides it for good.
  const showControls = controlsTouched ? controlsOpen : !tightControls;
  const openControls = (v: boolean) => {
    setControlsTouched(true);
    setControlsOpen(v);
  };
  /** The form is open, so the control that opens it has nothing to offer. */
  const composing = panelOpen && railView[layout] === "compose";
  const showView = (id: string) => setRailView({ ...railView, [layout]: id });
  const openWhen = (state: "open" | "min") =>
    setRail({ ...rail, [layout]: state });

  // What the feed is showing and what is narrowing it. Shared by both layouts
  // rather than keyed: there is one feed mounted, so there is one set of
  // filters to report on, and a second copy would describe a list that is not
  // on screen.
  const [position, setPosition] = useState<PositionFilter>("all");
  const [accountType, setAccountType] = useState<AccountTypeFilter>("all");
  const [railCount, setRailCount] = useState(DEMO_TESTIMONY.length);
  const [railFiltered, setRailFiltered] = useState(false);
  const [railReset, setRailReset] = useState(0);

  /**
   * The list, with the reader's own submission at the top of it once it is
   * posted.
   *
   * Prepended rather than appended, so the press has somewhere to land: a post
   * that left the feed looking exactly as it did would be asking the reader to
   * take it on trust. The card is the one `asSubmission` built for the review
   * step, unchanged, which is the promise the review step makes.
   *
   * The viewer is in the roster either way, because the roster is who the feed
   * can resolve rather than who is in it.
   */
  // A filing that names a bill belongs to the conference it was written to.
  // The placeholders carry no committee and stand on all twelve, which is what
  // lets one set of filler fill every page; a real letter cannot, so it is
  // dropped from the eleven it was not addressed to.
  /**
   * Which letter is being seconded, or nothing.
   *
   * Held beside the draft rather than on it: the draft is what the reader
   * wrote, and this is what they wrote it under. The composer reads it to know
   * whose position it is inheriting.
   */
  const [cosignOf, setCosignOf] = useState<string | null>(null);
  const forHere = DEMO_TESTIMONY.filter(
    (t) => !t.committee || t.committee === c.slug,
  );
  // The letter the reader just signed has one more name on it, from one more
  // district. The count is the page's own claim about how many people stand
  // behind it, so it has to move when somebody does: a tally that still says
  // twenty while twenty-one cards sit under it is the page contradicting
  // itself on the same screen.
  const signedHere = draft.posted ? cosignOf : null;
  const withOwn = signedHere
    ? forHere.map((t) =>
        t.id === signedHere
          ? {
              ...t,
              cosignCount: (t.cosignCount ?? 0) + 1,
              // The count moves, the spread does not: the reader is in
              // Norfolk and the letter already carries names from there, so a
              // district it had reached is not a district it has just reached.
              cosignLatest: "Just now",
            }
          : t,
      )
    : forHere;
  const feedItems: ConferenceSubmission[] = draft.posted
    ? [asSubmission(draft, cosignOf), ...withOwn]
    : forHere;
  const feedAccounts = [VIEWER, ...DEMO_ACCOUNTS];

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
    // Whichever limit bites first: the share of the window, or leaving the
    // page enough to stay a page. Never below the panel's own resting width.
    const ceiling = Math.max(
      drawerWidth(),
      Math.min(
        RAIL_MAX_SHARE * window.innerWidth,
        window.innerWidth - PAGE_MIN,
      ),
    );
    const w = Math.round(Math.min(Math.max(px, drawerWidth()), ceiling));
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
    let first: HTMLElement | null = null;
    for (const x of CONTENTS) {
      const found = sectionBox(x.id);
      if (!found) continue;
      // The first one on the page, for a reader who has not scrolled yet.
      // Without it there was no anchor at the top of the page, which is
      // exactly where the header rewraps as the column narrows and takes
      // everything below it down the screen.
      first ??= found;
      if (found.getBoundingClientRect().top <= line + 1) el = found;
    }
    // The panel's own transition is 400ms, so the correction runs a little
    // past it and catches the last frame.
    holdPlace(el ?? first, run, 480);
  };

  // Arriving at a different committee is not the panel closing, it is a
  // different page. The shell keeps its dragged width as an inline style, so
  // without this the margin transitions back over 400ms and reads as a slide.
  // `data-resizing` is the page's own way of saying "this change is not an
  // animation", and it is lifted for the frame the width lands on.
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    el.dataset.resizing = "true";
    applyRailWidth(panelOpen ? railWidthRef.current[layout] : null);
    const id = requestAnimationFrame(() => el.removeAttribute("data-resizing"));
    return () => cancelAnimationFrame(id);
    // The committee, and nothing else: a width change inside one committee is
    // a drag or a press, and both of those should animate.
  }, [c.slug]);

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
      // Opening the form on a submission that is already on the record is
      // revising it, so it comes off the feed until it is posted again. The
      // review step's promise is that the card in the list is the card that
      // was approved, and a card left standing while its words are being
      // rewritten is the one way to break it.
      if (draft.posted) patchDraft({ posted: false });
      // The plus is a filing of the reader's own, so it leaves co-sign mode,
      // and with it the window: there is no letter to put beside the form.
      setCosignOf(null);
      setPanelFull(false);
      setReview(false);
      showView("compose");
      openWhen("open");
    });
  /**
   * The letter being seconded, resolved, or nothing.
   *
   * Only on the route the experiment lives on, so a stale id cannot put the
   * ordinary composer into a mode it has no way out of.
   */
  // Whether the reader has agreed to cosign and moved on to writing. Here
  // rather than in the composer, because the panel's title changes with it.
  const [cosignAsked, setCosignAsked] = useState(false);
  // Whether they have said they are adding no words of their own. Here too,
  // because the review shows the entry that answer decides.
  const [cosignNoWords, setCosignNoWords] = useState(false);
  const cosignLetter = (() => {
    if (!cosignRoute || !cosignOf) return undefined;
    const t = feedItems.find((x) => x.id === cosignOf);
    const who = t && feedAccounts.find((u) => u.id === t.userId);
    return t && who
      ? {
          name: who.name,
          // The whole account, so the sheet can draw the head the feed draws
          // rather than a name on its own.
          account: who,
          date: t.date,
          position: t.position,
          body: t.body,
          count: t.cosignCount ?? 0,
          inDistrict: t.cosignInDistrict ?? 0,
          // Whether one of the six is the reader's own, which is the fact
          // that makes a co-sign worth more here than anywhere else.
          yours: sixOf(c).some((m) => MINE[m.key]),
        }
      : undefined;
  })();
  /** Put your name to a letter: the same panel the plus opens, on that letter. */
  const startCosign = (id: string) =>
    holdAnchor(() => {
      setCosignOf(id);
      setCosignAsked(false);
      setCosignNoWords(false);
      // Open on the whole window. Signing is reading and writing at once, and
      // the column can only hold the writing half, so the reader would have to
      // ask for the letter before they could see what they were putting their
      // name to. Collapsing is still one press away.
      setPanelFull(true);
      // The position is recorded as the reader's own, copied from the letter
      // at the moment they sign. A later change by the organisation does not
      // rewrite what anybody agreed to.
      const t = feedItems.find((x) => x.id === id);
      if (t) patchDraft({ position: t.position });
      if (draft.posted) patchDraft({ posted: false });
      setReview(false);
      showView("compose");
      openWhen("open");
    });
  // The tabs a layout offers, and which one is open. Card has no Committee
  // tab: its card sits above the bar rather than in a section you pick.
  const hasLobbying = orgLobbying(c.senateBill?.n, c.houseBill?.n).length > 0;
  const tabs =
    layout === "stacked"
      ? CONTENTS
      : CONTENTS.filter((x) => x.id !== "committee");
  // Opened on the public input when the full-page review sent the reader back
  // to read the list, since in this view that section is a page of its own.
  const [tab, setTab] = useState(landedOnFeed ? "input" : tabs[0].id);
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
  /**
   * How much of the top of the window is spoken for right now.
   *
   * The nav and the bar, in both layouts. The header used to be a third term
   * here, measured with an observer because the title wraps to two lines on
   * about half the twelve. It went when the header stopped pinning: the sum no
   * longer depends on anything that can change height, so nothing downstream
   * has to be told when it does.
   */
  // The title's own height, so everything resting under it knows where that
  // is. Measured rather than assumed: a long name wraps to two lines on a
  // phone, where the title is the one thing on this page that pins.
  const titleBand = useBandHeight(mode);
  const onPhone = useNarrow();
  const oneColumn = useNarrow("(max-width: 1117.98px)");
  const pinned = () => {
    const navH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
      ) || 0;
    return navH + BAR_H + (onPhone ? titleBand.h : 0);
  };
  /** The same sum as a CSS length, for the things that rest at it. */
  const pinnedTop = onPhone
    ? `calc(var(--nav-h) + ${titleBand.h}px + ${BAR_H}px)`
    : PINNED_H;
  /**
   * Where a section heading comes to rest: under the nav and the bar, which is
   * the same sum `pinned()` uses to land a jump. One value rather than three
   * copies, because the three had already drifted from it once.
   *
   * The scrolling view only. Tabbed shows one section at a time, so a heading
   * that stayed on screen would be naming the only thing there is.
   */
  const stickyTop = mode === "scroll" || onPhone ? pinnedTop : undefined;
  /**
   * A section's own chrome, a filter row or a table head, comes to rest under
   * everything above it, which in the scrolling view includes that section's
   * pinned heading. Tabbed does not pin its headings, so there the chrome
   * rests against the bar itself.
   */
  const inputBand = useBandHeight(mode);
  const lobbyBand = useBandHeight(mode);
  const underHeading = (h: number) =>
    mode === "scroll" ? `calc(${pinnedTop} + ${h}px)` : pinnedTop;
  const smooth = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? ("auto" as const)
      : ("smooth" as const);
  /**
   * Where the page has to be for a section to sit SECTION_AIR under the bar.
   *
   * The one sum, so a landed section and a scrolled-to one cannot
   * disagree: `SECTION_AIR` is the same number the box above draws as its
   * margin, measured to the same edge the reader sees. Flush against the rule
   * a card reads as attached to the bar; landed here, the space above it says
   * the card is a thing on a page and there is more of the page above it.
   */
  const landing = (el: HTMLElement) =>
    Math.max(
      0,
      el.getBoundingClientRect().top +
        window.scrollY +
        unpainted(el) -
        pinned() -
        SECTION_AIR,
    );
  // Lands a section's own top under the bar, scrolling up or down. A scroll
  // margin cannot do it: the pinned height changes with the nav's own height,
  // and an element's margin is written once.
  const to = (el: HTMLElement) =>
    window.scrollTo({ top: landing(el), behavior: smooth() });
  const jumpTo = (id: string) => {
    const el = sectionBox(id);
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
      const el = sectionBox(id);
      if (!el) return;
      // Only ever upward. A reader at the bottom of one section should not
      // arrive at the bottom of the next, but a reader who has not scrolled
      // at all should see nothing move: the tab already put them at the top.
      //
      // Landed, not scrolled. The section under the bar is a different page,
      // so traveling to it says the two are one long thing, and animating
      // past content the reader did not ask to see is worse than arriving.
      const top = landing(el);
      if (window.scrollY > top) window.scrollTo({ top, behavior: "auto" });
    });
  };

  /**
   * The search string survives every move, because it is what selects the
   * layout: a review that dropped `?view=scroll` would hand the reader back a
   * differently built page than the one they left.
   */
  const keepSearch = (path: string) => `${path}${location.search}`;
  /**
   * Another committee, read the same way this one is.
   *
   * The twelve down the left keep both the container being compared and the
   * layout, so changing committee mid-comparison does not quietly change what
   * is being compared.
   */
  const committeeHref = (slug: string) => {
    // The reading, not only the style. A co-sign route is a different page
    // from the plain one, and the twelve down the left are for changing
    // committee rather than for leaving the thing being compared.
    const tail = location.pathname.match(/\/(cosign(?:-\d+|-viz)?)$/)?.[1];
    return keepSearch(
      tail ? `/conferenceCommittees/${slug}/${tail}` : detailPath(slug, style),
    );
  };

  /**
   * "Review and Post", in whichever container this route asks for.
   *
   * The one branch in the page. Every press under it does the same thing
   * whichever container drew it, which is what makes the three comparable.
   */
  const toReview = () => {
    // Back to the panel's own width. The wide reading exists so the letter can
    // be read beside the form; the review has no letter in it, and leaving the
    // panel stretched across the page would hand that width to an empty half.
    setPanelFull(false);
    if (style === "page") navigate(keepSearch(reviewPath(c.slug)));
    else setReview(true);
  };
  /**
   * The review has taken the flyout's second pane.
   *
   * The other two styles leave the form standing where it is: the modal covers
   * it and the page navigates away from it.
   */
  const paneReview = style === "pane" && review;
  /**
   * Whether the panel is showing the letter beside the form.
   *
   * Only when it has been given the window: a column cannot hold a letter and
   * a form at once, which is what the expand control is for.
   */
  const wideCosign = !!cosignLetter && panelFull && !paneReview;
  /** Back to the form, from the pane or the modal in front of it. */
  const toEditing = () => setReview(false);
  /** Nothing is sent. The flag is as far as a prototype with no backend goes. */
  const post = () => patchDraft({ posted: true });
  /**
   * The eighth reading's last press: on the record, and straight to the word
   * that says so. No review between, because the step that offered the co-sign
   * carried the terms and the writing step showed the entry.
   */
  // A moment long enough for the count on the letter to be watched moving,
  // and no longer: it is the one thing on the page that says what the reader
  // just did, and a page that keeps saying it is a page congratulating itself.
  const [fresh, setFresh] = useState(false);
  useEffect(() => {
    if (!fresh) return;
    const done = setTimeout(() => setFresh(false), 2600);
    return () => clearTimeout(done);
  }, [fresh]);
  /**
   * The end of either path on the two-step readings.
   *
   * Filing your own words and co-signing somebody else's are the same act
   * under the page's own rule, so they end the same way: on the record, panel
   * away, and the reader standing in front of what they filed.
   */
  const postCosign = () => {
    setPanelFull(false);
    post();
    // The review goes with the panel. Left standing, reopening the panel for
    // anything else lands on a review of something already on the record.
    setReview(false);

    // A co-sign ends where the route says; words of your own have no letter
    // carrying the moment in the public list, so they land in the section that
    // holds them.
    const to = cosignOf ? (ownEnding ? "your-input" : "input") : "your-input";
    const land = (smooth: boolean, after: () => void) => {
      const at = document.getElementById(to);
      if (!at) return after();
      const still = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      at.scrollIntoView({
        behavior: smooth && !still ? "smooth" : "auto",
        block: "start",
      });
      history.replaceState(null, "", `${location.pathname}#${to}`);
      after();
    };

    if (cosignOf) {
      // The co-sign ending keeps its slide and its clock: the delay here plus
      // the one inside each piece comes to the timings it was tuned at.
      //
      // What it does not keep is `collapseRail`'s anchor hold, which pins the
      // page to whichever section the reader was in and keeps correcting for
      // 480ms. The landing was being applied and then dragged back, which is
      // why the fragment never took.
      setTimeout(() => setFresh(true), 340);
      clearRailFilters();
      applyRailWidth(null);
      openWhen("min");
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => land(false, () => {})),
        ),
      );
      return;
    }

    // Filing words of your own, where the panel going is not the interesting
    // part. `data-resizing` is the page's own way of saying a width change is
    // not an animation, so the panel is simply gone and the only thing moving
    // is the page travelling to what was filed. The moment then waits for that
    // travel: `scrollend` says when the page has settled, with a timeout
    // behind it for browsers that do not fire it and for a scroll that had
    // nowhere to go.
    const shell = shellRef.current;
    shell?.setAttribute("data-resizing", "true");
    clearRailFilters();
    applyRailWidth(null);
    openWhen("min");
    requestAnimationFrame(() => {
      shell?.removeAttribute("data-resizing");
      land(true, () => {
        let fired = false;
        const settled = () => {
          if (fired) return;
          fired = true;
          window.removeEventListener("scrollend", settled);
          setFresh(true);
        };
        window.addEventListener("scrollend", settled, { once: true });
        window.setTimeout(settled, 900);
      });
    });
  };
  /** The review put away from a container's own close control. */
  const closeReview = () => {
    setReview(false);
    // Once it is on the record there is nothing left to write, so the form goes
    // with the review rather than being left standing behind it.
    if (draft.posted) collapseRail();
  };
  /**
   * Off the review and onto the list the card is now at the top of.
   *
   * Where the list is depends on the mode rather than on the style: inline
   * reads it in the page's own section, sidebar rests it in the panel.
   */
  const readOthers = () => {
    setReview(false);
    if (!inlineTestimony) {
      openRailClean();
      return;
    }
    // The panel closed without the hold `collapseRail` puts on the reader's
    // place. This press is a request to be moved, and the hold runs for the
    // length of the panel's transition: it would correct the jump straight
    // back out again.
    clearRailFilters();
    applyRailWidth(null);
    openWhen("min");
    if (mode === "scroll") jumpTo("input");
    else pickTab("input");
  };
  // The scrolling view's share of landing on the feed after the full-page
  // review. The tabbed view opens on the section instead, which it can do
  // before the first paint; this one has to wait for the section to exist.
  useEffect(() => {
    if (landedOnFeed && mode === "scroll") {
      requestAnimationFrame(() => jumpTo("input"));
      return;
    }
    // A link to one section, or a reload of a page the bar had put a fragment
    // on. The browser lands a fragment with the element's own scroll margin,
    // which is a second opinion about this gap and sat 11px off the jump's:
    // the page lands it itself instead, so arriving by link and arriving by
    // press put the section in the same place.
    const id = location.hash.slice(1);
    if (!id || !ANCHORS().includes(id)) return;
    if (mode === "tabbed" && tabs.some((x) => x.id === id)) pickTab(id);
    else requestAnimationFrame(() => jumpTo(id));
    // On every arrival, not only the first. Every reading of a committee is
    // this one component, so moving from the committee page to a co-sign
    // route, or pressing a bar link while already on one, changes the address
    // without mounting anything: the effect that lands the fragment has to
    // answer the navigation rather than the mount.
    //
    // Keyed on the router's own key, which changes once per navigation. A
    // press on the contents bar writes its fragment with `replaceState` and
    // leaves the key alone, so the bar still owns its own landing and this
    // does not fire a second one on top of it.
  }, [location.key]);

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
      <div className="fixed bottom-[24px] right-[var(--fab-r,24px)] z-50 flex items-center gap-[12px] transition-[right] duration-400 ease-out motion-reduce:transition-none [[data-resizing]_&]:transition-none">
        <MapleFab inline open={askOpen} onOpenChange={setAskOpen} />
        {/* Hidden while the form it opens is already open, where it would be
            an invitation to do the thing being done. */}
        {/* At every width. Below lg the panel it opens is a sheet rather than a
            rail, so this is the way in on a phone as well as the shortcut on a
            wide window; --fab-r falls back to the plain 24px there, since
            nothing is being taken from the page for a panel to stand in. */}
        {/* And gone once something is on the record: the page already carries
            their entry, pinned above the list, and a standing invitation to
            add another is an offer the page cannot keep. */}
        {!composing && !draft.posted && (
          <button
            onClick={compose}
            aria-label="Add public input"
            className="group inline-flex items-center h-[52px] px-[16px] rounded-pill border border-brand bg-brand text-ink-inverse hover:bg-brand-hover hover:border-brand-hover cursor-pointer transition-colors"
          >
            <Plus className="w-[22px] h-[22px] shrink-0" />
            <span className="grid grid-cols-[0fr] group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr] transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none">
              <span className="overflow-hidden">
                <span className="block pl-[10px] pr-[10px] font-body font-semibold text-sm whitespace-nowrap">
                  Add Public Input
                </span>
              </span>
            </span>
          </button>
        )}
      </div>

      {/* Prototype controls, not part of the page: where public input is read,
          and which of the two layouts draws it. */}
      {/* In the corner itself rather than floating near it: shut, it is a tab
          growing out of the window's edge, so it reads as a drawer rather than
          another floating button competing with the two on the right. Open, the
          same corner holds a white panel with the way to shut it at the top,
          above the switches it controls. */}
      {/* Not on the co-sign readings. Those are settled: the layout and the
          container are decided, and a drawer offering to change them is a
          switch for a comparison that is over. */}
      <div
        className={`${cosignRoute ? "hidden" : "hidden md:block"} fixed bottom-0 left-0 z-50`}
      >
        {!showControls ? (
          <Hint text="Prototype controls" className="block">
            <button
              onClick={() => openControls(true)}
              className="flex items-center gap-[8px] rounded-tr-card bg-ink px-[16px] py-[11px] font-body font-semibold text-2xs uppercase tracking-[0.09em] text-ink-inverse hover:bg-ink/90 cursor-pointer transition-colors"
            >
              Toggles
            </button>
          </Hint>
        ) : (
          // Clipped, so the black head takes the panel's own rounded corner
          // rather than sitting square inside it.
          <div className="rounded-tr-card overflow-hidden bg-surface border-t border-r border-line-strong shadow-popover">
            {
              <button
                onClick={() => openControls(false)}
                aria-label="Hide prototype controls"
                className="w-full flex items-center gap-[6px] bg-ink px-[16px] py-[11px] font-body font-semibold text-2xs uppercase tracking-[0.09em] text-ink-inverse hover:bg-ink/90 cursor-pointer transition-colors"
              >
                <ChevronDown className="w-[14px] h-[14px]" />
                Hide
              </button>
            }
            <div className="flex flex-col items-start gap-[10px] px-[16px] pt-[14px] pb-[16px]">
              {/* Where public input is read. Inline keeps it in the page's own section
            and opens the panel only to write; sidebar rests the panel on the
            feed down the right edge. */}
              <Pills
                head="Page"
                // Tabbed first, scroll second, which is the order she reads them in.
                // The default being second is fine: this switch says which of the two
                // you are in, not which one comes first.
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
                    panelStanding(v, testimony)
                      ? railWidthRef.current[v]
                      : null,
                  );
                }}
              />
              {SHOW_TESTIMONY_SWITCH && (
                <Pills
                  head="Input"
                  options={["inline", "sidebar"] as const}
                  value={testimony}
                  onChange={(v) => {
                    setTestimony(v);
                    // A dragged width is an inline style on the shell and beats the
                    // class ternaries, so the shell has to be told whether the panel
                    // is still standing under the mode being switched to.
                    applyRailWidth(
                      panelStanding(layout, v)
                        ? railWidthRef.current[layout]
                        : null,
                    );
                  }}
                />
              )}
              <Pills
                head="Resolution"
                options={["questions", "topics"] as const}
                labels={{ questions: "Qs?" }}
                value={unresolved}
                onChange={setUnresolved}
              />
            </div>
          </div>
        )}
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
            // Slide before shrinking. The panel takes width from the right, so
            // the column first gives up the margin centring had left it on the
            // left, moving bodily into that whitespace, and only narrows once
            // that margin is spent. Clamped at 0 so it never leaves the page's
            // own gutter, and still dropped outright past the share where the
            // panel is wide enough that holding the left edge is pointless.
            "--page-left":
              "max(0px, min(calc((100% - var(--page-cap, 1180px)) / 2 - var(--taken-w, 0px)), var(--rail-share)))",
          } as CSSProperties
        }
        className={`${PAGE_COLUMN} [--page-cap:1180px] lg:[--page-cap:1320px] min-[1480px]:[--page-cap:1764px] flex gap-[24px] lg:gap-[56px] lg:mx-0 lg:ml-[var(--page-left)] lg:mr-[var(--taken-w)] lg:[--page-w:calc(100vw-var(--taken-w))] transition-[margin] duration-400 ease-out motion-reduce:transition-none [[data-resizing]_&]:transition-none`}
      >
        <Rail
          current={c.slug}
          label={false}
          href={committeeHref}
          composing={composing}
          hidden={panelOpen}
        />

        <div className="min-w-0 flex-1">
          {/* The title and its byline scroll away, in both layouts. Nothing
              pins here: the tab bar is the only thing that comes to rest under
              the nav, so the sum every pinned offset on this page is built from
              never has to know how the title wrapped.

              The bleed and the ground are what the band keeps from when it did
              pin, and they are why the two layouts read the same at the top of
              the page. The negative margins let the band's own background run
              to the edge of the reading column; the padding gives that width
              back, so the column inside is the one it would have had. */}
          <div
            ref={titleBand.ref}
            className="@container sticky top-[var(--nav-h)] z-[14] -mx-[32px] px-[32px] pt-[26px] pb-[12px] bg-ground md:static md:z-20 md:pb-0"
          >
            <div className="flex items-start justify-between gap-[24px]">
              {/* The picker is the row's flexible half, so the heading can
                      run the full width before it wraps. */}
              <TitlePicker slug={c.slug} short={c.short} href={committeeHref} />
              {/* Follow and Share are parked. Uncomment to restore them.
                  <div className="shrink-0 flex items-center gap-[18px] mt-[6px]">
                    <button
                      onClick={() => setFollowing((f) => !f)}
                      aria-pressed={following}
                      // Following, it steps back to gray and only reports a
                      // state; before, it is asking to be pressed. On hover each
                      // half swaps to the sign of what a press would do, so the
                      // outcome shows before it happens.
                      // Blue in both states. The ballot pages grayed it once
                      // followed, on the argument that it was then only reporting
                      // a state; here it stays a control you can press again, and
                      // the icon and the word already say which way it goes.
                      className="group inline-flex items-center gap-[6px] font-body font-semibold text-sm text-link hover:text-brand cursor-pointer"
                    >
                      {following ? (
                        <>
                          <BellRing className="w-[15px] h-[15px] group-hover:hidden" />
                          <BellOff className="w-[15px] h-[15px] hidden group-hover:block" />
                          <span className="group-hover:hidden">Following</span>
                          <span className="hidden group-hover:inline">
                            Unfollow
                          </span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-[15px] h-[15px] group-hover:hidden" />
                          <BellPlus className="w-[15px] h-[15px] hidden group-hover:block" />
                          Follow
                        </>
                      )}
                    </button>
                    <button className="inline-flex items-center gap-[6px] font-body font-semibold text-sm text-link hover:text-brand cursor-pointer">
                      <Share className="w-[15px] h-[15px]" />
                      Share
                    </button>
                  </div>
                  */}
            </div>
          </div>
          <div className="z-20 -mx-[32px] px-[32px] bg-ground/95 backdrop-blur">
            <div className="@container pb-[24px]">
              <p className="font-body text-xl @[980px]:text-2xl text-ink-mid leading-[1.4] mt-[10px]">
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
                // The same padding the boxes in the scrolling view carry, so
                // a card reads the same whichever view it is in.
                className={`mt-[8px] border border-line rounded-card ${CARD_PX} ${CARD_PT} ${CARD_PB} scroll-mt-[120px]`}
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
            offset={
              onPhone ? `calc(var(--nav-h) + ${titleBand.h}px)` : "var(--nav-h)"
            }
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
                      className="font-body text-lg text-ink-mid leading-[1.6] max-w-[74ch]"
                    />
                  </div>
                )}

                {show("committee") && (
                  // Sits outside <main>, and needs nothing arranged for it
                  // there: the box carries the air wherever it is put. The id
                  // is on the box here rather than on a heading's section,
                  // because the people and the maps are not drawn by a
                  // Chapter.
                  <Boxed id="committee" on={layout === "stacked"} filled>
                    <PeopleAndMaps
                      six={sixOf(c)}
                      meetings={meetings}
                      stickyTop={stickyTop}
                    />
                  </Boxed>
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
            // No gap set here and no margin on the children from here either.
            // Each section's own box carries SECTION_AIR above it, so the
            // number lives in one place and the sections outside this element
            // get it on the same terms as the ones inside. Nothing carries a
            // bottom margin, which is what lets the bill text's well end
            // exactly where the page ends; it measures itself against the
            // bottom of the window.
            className="pt-0 pb-0 flex flex-col gap-0"
          >
            {/* The same chapter the bill page's lineage uses for "How did it
                get here?", so the two pages open a section the same way. */}
            {/* Both layouts. The two column labels below say what each list
                is; this says why either of them is there. */}
            {show("decided") && (
              <Boxed on={layout === "stacked"} filled>
                <Chapter
                  id="decided"
                  question="What needs to be resolved?"
                  titleClass={SUB_HEAD}
                  stickyHeading={oneColumn ? pinnedTop : undefined}
                  flush
                >
                  <Scan
                    c={c}
                    card={layout === "card"}
                    asked={unresolved === "questions"}
                    onCompose={compose}
                    posted={draft.posted}
                  />
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
                                <span className="block font-body text-sm text-ink-mid leading-[1.55] mt-[1px]">
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
                        <p className="font-body text-sm text-ink-mid leading-[1.65] max-w-[74ch]">
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
                    <p className="font-body text-sm text-ink-mid leading-[1.65] max-w-[74ch] border-l-2 border-line-strong pl-[16px]">
                      The comparison for this committee has not been compiled
                      yet. It needs both texts read side by side.
                    </p>
                  </Span>
                </Chapter>
              ))}

            {show("lobbying") && (
              <Boxed on={layout === "stacked"} filled>
                <LobbyingDisclosures
                  c={c}
                  titleClass={SUB_HEAD}
                  // Scrolling pins it at every width. Tabbed does not pin its
                  // headings, with one exception: below sm the table becomes a
                  // stack and loses its column heads, and then the section's
                  // own heading is the only thing naming what the rows are.
                  stickyHeading={
                    hasLobbying ? (stickyTop ?? pinnedTop) : undefined
                  }
                  narrowPin={hasLobbying && mode === "tabbed"}
                  // The column heads still travel back up the window when they
                  // let go, so the heading needs the band's paint order even
                  // without the pin.
                  bandHeading={hasLobbying && mode === "tabbed"}
                  headingRef={lobbyBand.ref}
                  // The column heads stay over the rows they name, the way
                  // the Public Input filters stay over the list.
                  headerTop={underHeading(lobbyBand.h)}
                  flush
                />
              </Boxed>
            )}

            {/* A section of its own, above the public one. What the reader
                filed is not one of the things the page is showing them; it is
                the thing they did, and it answers to none of the controls the
                section below carries. */}
            {show("input") && draft.posted && (
              <Boxed
                on={layout === "stacked"}
                bleed={inlineTestimony}
                filled={!inlineTestimony}
              >
                <Chapter
                  id="your-input"
                  question="Your Input"
                  titleClass={SUB_HEAD}
                  tightBody
                  stickyHeading={stickyTop}
                  bandHeading={mode === "tabbed"}
                  // Beside the heading of the section it is about, which is
                  // the section holding the thing it reports on.
                  action={
                    <p
                      className={`flex items-center gap-[7px] font-body text-sm text-ink leading-[1.5] ${
                        fresh && ownEnding
                          ? "animate-rise [animation-delay:120ms] motion-reduce:animate-none"
                          : ""
                      }`}
                    >
                      <Check
                        aria-hidden
                        className={`w-[14px] h-[14px] shrink-0 text-positive-ink ${
                          fresh && ownEnding
                            ? "animate-pop [animation-delay:300ms] motion-reduce:animate-none"
                            : ""
                        }`}
                        strokeWidth={2.5}
                      />
                      Your input is on the record.
                    </p>
                  }
                >
                  <div>
                    <OwnSubmission items={feedItems} accounts={feedAccounts} />
                    {/* Under the card, as a footnote to it: what this
                        section is, and where the same entry can be found in
                        the record everybody else reads. */}
                    <p className="mt-[12px] font-body text-sm text-ink-mid leading-[1.5]">
                      This section is only visible to you. You can also find
                      your post below in the public record.
                      {/* Only where they co-signed: words of their own always
                          stand in the list, and the setting this is about has
                          nothing to say about them. */}
                      {cosignOf
                        ? " If your post has no additional content you can find it by changing your filters."
                        : ""}
                    </p>
                  </div>
                </Chapter>
              </Boxed>
            )}
            {show("input") && (
              <Boxed
                on={layout === "stacked"}
                bleed={inlineTestimony}
                filled={!inlineTestimony}
              >
                <Chapter
                  id="input"
                  question="Public Input"
                  hideQuestion={headedFeed}
                  titleClass={SUB_HEAD}
                  // Reading it inline, this is the way in. Reading it in the
                  // panel, the panel's header already has one and a second
                  // here would be two doors to the same room.
                  action={
                    inlineTestimony && !headedFeed ? (
                      <AddInput
                        onClick={compose}
                        mine={sixOf(c).filter((m) => MINE[m.key])}
                        posted={draft.posted}
                      />
                    ) : undefined
                  }
                  //
                  stickyHeading={stickyTop}
                  bandHeading={mode === "tabbed"}
                  headingRef={inputBand.ref}
                  headingData="input"
                  flush
                >
                  {/* The conference pages' own feed, filtering and chipping on
                      the same four positions the composer offers. It began as
                      the ballot pages' feed and is now a fork of it: sharing
                      one would mean one set of positions covering a ballot
                      question and a conference, and a reader who asked for the
                      Senate text would have come back as "Supports".

                      No form inside it: the page owns that, and the panel is
                      where it is written. What the feed does carry is the way in,
                      the same plus the panel's own header shows, so the inline
                      reading has it where the sidebar reading has it. */}
                  {/* The filter row carries its own 16px of air above it,
                      for a feed that begins a section on its own. Here a
                      heading is already doing that, so the row's share comes
                      back off: the controls belong to the title above them,
                      and a chapter's own gap is sized for prose starting
                      under a question. The row's own padding is ten now
                      rather than sixteen, so this gives back six less. */}
                  {inlineTestimony ? (
                    <div className="-mt-[18px]">
                      <SubmissionFeed
                        items={feedItems}
                        fresh={fresh && !ownEnding}
                        accounts={feedAccounts}
                        subject={displayName(c.slug, c.short)}
                        pageSize={5}
                        includeTypeFilter
                        confereeSeats={sixOf(c).map((m) => m.key)}
                        map={
                          <SentimentMap
                            items={feedItems}
                            conferees={sixOf(c).map((m) => m.key)}
                          />
                        }
                        includeFollowingFilter
                        // The filters stay reachable while the list runs past
                        // them, in both views: they come to rest under whatever
                        // the view has pinned above them.
                        stickyTop={underHeading(inputBand.h)}
                        heading={
                          headedFeed
                            ? {
                                title: "Public Input",
                                action: (
                                  <AddInput
                                    onClick={compose}
                                    mine={sixOf(c).filter((m) => MINE[m.key])}
                                    posted={draft.posted}
                                  />
                                ),
                              }
                            : undefined
                        }
                        headingTop={stickyTop}
                        onCosign={startCosign}
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
                      <PublicMap
                        conferees={sixOf(c).map((m) => m.key)}
                        onOpenRail={openRailClean}
                      />
                    </div>
                  )}
                </Chapter>
              </Boxed>
            )}

            {show("text") && (
              // Nothing under this section: the well ends the page.
              <Boxed on={layout === "stacked"} flushBottom bleed>
                <ConferenceText
                  c={c}
                  titleClass={SUB_HEAD}
                  flush
                  hideQuestion={layout === "card"}
                  // Both layouts. The picker and the well rest against the
                  // underside of the bar and the well takes the window that is
                  // left, which is the same sum every other pinned thing on
                  // this page resolves to rather than a height of its own.
                  pinTop={pinnedTop}
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
                        <p className="font-body text-sm text-ink-mid leading-[1.65] mt-[6px] max-w-[74ch]">
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
        // Keyed by committee, so changing committee replaces the panel rather
        // than animating the old one shut. Shut is a thing a reader does; a
        // different committee simply has a different panel, and it should
        // arrive the way the rest of the page arrives.
        key={c.slug}
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
                  items={feedItems}
                  fresh={fresh && !ownEnding}
                  accounts={feedAccounts}
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
                  onCosign={startCosign}
                />
              </div>
            ),
          },
          {
            id: "compose",
            // The pane style draws the review in this same view, so the header
            // names whichever of the two steps is showing rather than calling
            // both of them the form.
            // Not "Cosign" on the co-sign step: the button inside says that,
            // and the same word as a title and as an act read as two things
            // with one name. The title says what the panel is for, and on a
            // co-sign it says what the press would mean.
            // One title for the panel whichever way the reader came to it:
            // filing their own words and co-signing somebody else's are the
            // same act under your rules, so the header says so.
            title: paneReview
              ? reviewTitle(draft.posted, !!cosignLetter)
              : "Add Your Input",
            content: (
              <div
                className={`flex-1 min-h-0 px-[var(--rail-pad,18px)] pt-[12px] pb-[22px] ${
                  // Reading and writing at once, but only where there is room
                  // for both. Below lg the panel is a sheet the width of the
                  // phone, so the letter goes above the form and the column
                  // scrolls, which is the same two things in the order a
                  // narrow screen can hold them.
                  wideCosign
                    ? "flex flex-col gap-[20px] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,calc(var(--rail-w)-36px))] lg:gap-x-[32px] lg:gap-y-0"
                    : "flex flex-col"
                }`}
              >
                {wideCosign && cosignLetter && (
                  /* The same well the bill text sits in: a sunken tray holding
                     a sheet. What is being signed is a document, and reading a
                     document on the same surface as the form you are filling
                     in makes the two one thing.

                     The scroll is the sheet's, not the column's: these run to
                     six paragraphs and a list of thirty-one names, and the
                     tray should stay put while the page of it moves.

                     Lifted into the header's band, which is empty on this
                     side: the title and its controls are pinned over the form
                     column, so the letter would otherwise start half a header
                     below the top of a panel it has all to itself. */
                  <div className="min-h-0 flex-1 lg:flex-none lg:h-auto lg:-mt-[48px] flex bg-sunken border border-line rounded-card p-[16px] sm:p-[24px]">
                    <div className="mx-auto w-full max-w-[68ch] overflow-y-auto scrollbar-always bg-surface shadow-popover rounded-[3px] px-[28px] py-[30px] sm:px-[40px] sm:py-[38px]">
                      {/* The same head the feed gives this account: the
                          portrait, the name with its type mark, the position,
                          and what the account is. A bare name over a letter
                          was the one place on these pages where a filing did
                          not visibly belong to anybody. */}
                      <div className="flex items-start gap-[12px] pb-[18px] mb-[20px] border-b border-line">
                        <AccountAvatar
                          account={cosignLetter.account}
                          size={44}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-x-[8px] gap-y-[4px] font-body font-semibold text-base text-ink">
                            {cosignLetter.name}
                            <AccountTypeIcon
                              type={cosignLetter.account.userType}
                            />
                            <PositionChip position={cosignLetter.position} />
                          </p>
                          <p className="mt-[2px] font-body text-sm text-ink-faint">
                            {cosignLetter.account.descriptor}
                          </p>
                        </div>
                        <p className="shrink-0 font-body text-xs text-ink-mid">
                          {cosignLetter.date}
                        </p>
                      </div>
                      <p className="font-body text-sm text-ink leading-[1.7] whitespace-pre-line">
                        {cosignLetter.body}
                      </p>
                    </div>
                  </div>
                )}
                {paneReview ? (
                  <ReviewPane
                    draft={draft}
                    onChange={patchDraft}
                    six={sixOf(c)}
                    subject={displayName(c.slug, c.short)}
                    cosign={cosignLetter}
                    noWords={cosignNoWords}
                    onBack={toEditing}
                    // Every reading in the panel ends the same way: away, and
                    // standing in front of what was filed.
                    onPost={postCosign}
                    onClose={closeReview}
                    onSeeOthers={readOthers}
                  />
                ) : (
                  /* Cancel goes where the close control goes. In sidebar mode
                     that is back to the list the panel rests on; inline mode
                     has no such rest, so it puts the panel away, as the close
                     control does. */
                  <ConferenceCompose
                    draft={draft}
                    onChange={patchDraft}
                    six={sixOf(c)}
                    signing={cosignAsked}
                    onSigning={setCosignAsked}
                    skipReview={directCosign && !!cosignLetter}
                    letterShown={wideCosign}
                    noWords={cosignNoWords}
                    onNoWords={setCosignNoWords}
                    onCancel={
                      inlineTestimony
                        ? collapseRail
                        : () => showView(RAIL_DEFAULT)
                    }
                    onReview={
                      directCosign && cosignLetter ? postCosign : toReview
                    }
                    active={railView[layout] === "compose"}
                    cosign={cosignLetter}
                  />
                )}
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
        expanded={cosignRoute && panelFull}
        onExpandedChange={cosignRoute ? setPanelFull : undefined}
      />

      {/* Style two. Over the page rather than in it, so the form the reader
          came from is still behind the scrim: the modal is the only one of the
          three that shows you where you were while you check what you wrote. */}
      {style === "modal" && review && (
        <ReviewModal
          draft={draft}
          onChange={patchDraft}
          six={sixOf(c)}
          subject={displayName(c.slug, c.short)}
          onBack={toEditing}
          onPost={post}
          onClose={closeReview}
          onSeeOthers={readOthers}
        />
      )}
    </div>
  );
}

/** No committee at that slug, on whichever of the routes asked for one. */
function NoCommittee() {
  return (
    <div className="bg-ground min-h-screen font-body text-ink">
      <SiteNav inner={NAV_COLUMN} />
      <main className="mx-auto max-w-[1180px] px-[20px] sm:px-[32px] pt-[48px]">
        <p className="font-body text-base text-ink-mid">
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

/**
 * One committee's page, drawing the review step the way its route says to.
 *
 * Three routes reach this, one per container, and the style is a prop rather
 * than something read off the URL in here: the routes are where the comparison
 * is set up, so that is where it should be legible.
 */
export function ConferenceCommittee({
  style = "pane",
}: {
  style?: ReviewStyle;
}) {
  useDeviceViewport();
  const { slug } = useParams();
  const c = slug ? BY_SLUG[slug] : undefined;
  if (!c) return <NoCommittee />;
  return <Detail c={c} style={style} />;
}

/**
 * Style three: the review with a page and an address of its own.
 *
 * A component rather than a mode of the page above, because that is what the
 * option being compared actually costs. The committee page unmounts on the way
 * here, so the heading, the way back out and the width are this file's problem
 * again, and the draft has to have been kept somewhere neither page owns. The
 * pane and the modal are a flag.
 */
export function ConferenceReview() {
  useDeviceViewport();
  const { slug } = useParams();
  const c = slug ? BY_SLUG[slug] : undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, patchDraft] = useDraft(slug ?? "");
  if (!c) return <NoCommittee />;

  // Back to the committee, in the style and the layout it was read in. What is
  // handed along in history state says what the reader asked for: the form they
  // were in the middle of, the list their card is now on top of, or neither.
  const back = (state?: { compose?: boolean; feed?: boolean }) =>
    navigate(`${detailPath(c.slug, "page")}${location.search}`, { state });

  return (
    <div className="bg-ground min-h-screen font-body text-ink">
      <SiteNav inner={NAV_COLUMN} />
      {/* Narrower than the committee page. The two columns below put the card
          in about the measure the feed sets it in, which is the width a review
          has to show it at: the page's full 1180 would re-set the reader's
          paragraph in a measure it will never appear in, at the moment they
          are checking where the lines break. */}
      <main className="mx-auto max-w-[880px] px-[20px] sm:px-[32px] pt-[28px] pb-[80px]">
        <button
          onClick={() => back()}
          className="inline-flex items-center gap-[4px] -ml-[4px] font-body font-semibold text-sm text-ink-mid hover:text-ink cursor-pointer"
        >
          <ChevronLeft className="w-[16px] h-[16px] shrink-0" />
          {REVIEW_PAGE_COPY.back}
        </button>
        <h1 className="font-body font-bold text-[28px] sm:text-[40px] leading-[1.2] text-brand mt-[14px]">
          {reviewTitle(draft.posted)}
        </h1>
        {/* Before posting only. Afterwards the heading is already the sentence
            that says what happened, and a lead under it would be telling the
            reader to read it once more. */}
        {!draft.posted && (
          <p className="font-body text-lg text-ink-mid leading-[1.5] mt-[10px] max-w-[56ch]">
            {REVIEW_PAGE_COPY.lead}
          </p>
        )}
        <ReviewPageBody
          draft={draft}
          subject={displayName(c.slug, c.short)}
          six={sixOf(c)}
          onChange={patchDraft}
          onBack={() => back({ compose: true })}
          onPost={() => patchDraft({ posted: true })}
          onClose={() => back()}
          onSeeOthers={() => back({ feed: true })}
        />
      </main>
    </div>
  );
}
