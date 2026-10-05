// Public input on a conference committee: the feed, its filters, and a
// submission opened in place.
//
// A fork of the ballot pages' feed (components/tax-rebate-62f/testimony.tsx),
// which is left exactly as it was. The two are not one component with a wider
// stance model on purpose: a conference offers four positions a conferee could
// act on, and a ballot question offers support, oppose and no position, so a
// shared feed would have to chip and filter on the union of two sets of
// positions and would say the wrong thing on one page or the other.
//
// What the fork dropped, because the conference pages never used it: the
// composer and its three shells (this page has its own, in the panel), the
// non-card list, the account-type and position dropdowns that the original
// parks behind `false`, the locked variants of both pickers, and the two cards
// that read the ballot question's own record. Nothing here imports that
// question's data.

import type { ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  X,
  Check,
  ChevronDown,
  MoreVertical,
  Flag,
  FileText,
  Plus,
  Users,
  BadgeCheck,
  ArrowDownUp,
  BellPlus,
  Repeat2,
  ListFilter,
  Share,
  ThumbsUp,
  UsersRound,
  SquarePen,
} from "lucide-react";
import { ClampedText, Hint, Modal, Pagination } from "../ballot";
import { DEMO_SEATS } from "../../data/conference-committees/testimony";
import { AccountAvatar, AccountTypeIcon, PositionChip } from "./accounts";
import type {
  ConferenceAccount,
  ConferenceAccountType,
  ConferenceSubmission,
} from "../../data/conference-committees/testimony";
import type {
  ConferenceAsk,
  ConferencePosition,
} from "../../data/conference-committees/positions";
import {
  CONFERENCE_POSITIONS,
  POSITIONS,
} from "../../data/conference-committees/positions";

/**
 * Per-entry actions. A kebab rather than more visible buttons: following an
 * account and reporting a statement are both rare next to reading one, and a
 * row of controls beside every date would compete with the submission itself.
 */
function EntryActions({ name, own = false }: { name: string; own?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${name}`}
        className="flex items-center justify-center w-[30px] h-[30px] rounded-control text-ink-mid hover:text-ink hover:bg-wash cursor-pointer transition-colors"
      >
        <MoreVertical className="w-[19px] h-[19px]" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[180px] bg-surface border border-line rounded-control shadow-popover py-[4px]"
        >
          {/* First, because it is the one a reader wants: the others act on
              the submission, this one opens it. Inert for now, until there is
              a route for a single filing. */}
          {[
            // The only one that keeps the noun: this is the item that opens
            // the thing, and "View" on its own does not say what it opens.
            { label: "View submission", Icon: FileText },
            // Only on the reader's own. Offering it on somebody else's entry
            // would be offering something the record cannot allow, and
            // following yourself is the same kind of nonsense.
            ...(own ? [{ label: "Edit", Icon: SquarePen }] : []),
            { label: "Share", Icon: Share },
            ...(own ? [] : [{ label: "Follow user", Icon: BellPlus }]),
            { label: "Report", Icon: Flag },
          ].map(({ label, Icon }) => (
            <button
              key={label}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-[9px] w-full text-left font-body text-sm text-ink px-[12px] py-[7px] cursor-pointer hover:bg-wash"
            >
              <Icon className="w-[15px] h-[15px] shrink-0 text-ink-mid" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * One submission, renderable on its own: everything in it comes from the filing
 * and the account that filed it, which is what a per-submission URL will need.
 *
 * It reflows on its own width rather than the window's, because the window is
 * not what decides how much room it has. The same card is drawn in the page's
 * own column, in the panel at anything from 400 to 520, and on the review step
 * inside either of those, and the panel opening does not move the window. So the
 * card declares itself a container and every rule below is a query on it.
 *
 * One threshold, 600px of card:
 *
 *   under it   the header is held to one line and the name gives way with an
 *              ellipsis; the position chip and the date leave the header for a
 *              foot row under the body; the body loses the indent that lines it
 *              up under the name, and drops a type step so six lines still hold
 *              something worth reading.
 *   over it    what has always been drawn here: the name line wraps with the
 *              icon and chip beside it, the date holds the top-right corner
 *              beside the kebab, and the body is indented past the avatar.
 *
 * Why 600: a phone's card is about 300 to 355 and the panel's is 364 to 484, so
 * both take the compact header at every width they can be, and the full one
 * belongs to the page's own feed, which is the only place with room for a
 * header holding a name, an icon, a chip and a date on one line.
 */
/**
 * Lucide's `circle-star`, drawn here rather than imported.
 *
 * It exists upstream but not in the version this project is pinned to, and
 * moving from 0.487 to 1.52 for one glyph would re-point every other icon on
 * these pages. Same geometry and stroke conventions, so it swaps for the real
 * import whenever the package does move.
 */
function CircleStar({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M11.051 7.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.867l-1.156-1.152a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z" />
    </svg>
  );
}

/**
 * Several thumbs up, which Lucide does not have.
 *
 * It has exactly two thumb glyphs, up and down, both singular, so a count of
 * people approving something has no mark of its own. This is Lucide's own
 * `thumbs-up` twice, the front one whole and the one behind cut back to the
 * contour that clears it, the way `users-round` draws its second figure as an
 * arc rather than a whole head. The stroke scales with the shapes rather than
 * being held at full width: two thumbs at two thirds the size carry twice the
 * line of one, and holding the width turned the mark into a blot.
 *
 * Unlike the other glyphs drawn here, this one is not waiting for a package
 * version to catch up: it does not exist upstream, so it stays until a real
 * one does.
 */
function ThumbsUpGroup({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        transform="translate(4.4 1.4) scale(0.78)"
        d="M12 2a3.13 3.13 0 0 1 3 3.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8"
      />
      <g transform="translate(-0.8 4) scale(0.78)">
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
        <path d="M7 10v12" />
      </g>
    </svg>
  );
}

/**
 * The bar colour for each ask, at full strength.
 *
 * The chip's own `tone` is a wash, which is right behind two words and wrong
 * in a bar four pixels tall: at that size a pale fill reads as nothing at all.
 */
const ASK_BAR: Record<ConferencePosition, string> = {
  pass: "bg-positive",
  house: "bg-house",
  senate: "bg-official",
  none: "bg-negative",
};

/**
 * What the filings add up to, over the row that narrows them.
 *
 * One bar rather than four numbers: the question a reader arrives with is what
 * the public wants here, and that is a shape before it is a count. The figures
 * are under it for anyone who wants them.
 *
 * Built from what is on screen, so it answers to the filters rather than
 * standing apart from them: narrowing to one position leaves a full bar of
 * that colour, which is the honest picture of what was asked for.
 */
function InputSummary({
  items,
  note,
}: {
  items: ConferenceSubmission[];
  /** Drawn at the right of the legend row: the way in, beside the shape. */
  note?: ReactNode;
}) {
  // One per card, and nothing else. A co-sign is an entry of its own in this
  // feed, so the letter's own count is already standing in the list below:
  // adding it here as well counted the same people twice, and the two letters
  // on their own came to twenty-seven.
  const total = items.length;
  if (!total) return null;
  const counts = CONFERENCE_POSITIONS.map((p) => ({
    p,
    n: items.filter((t) => t.position === p.k).length,
  })).filter((x) => x.n > 0);
  return (
    // Without the bar the legend is the only thing in the gap under the
    // controls, so it takes its own space on both sides rather than sitting up
    // against the row it follows.
    <div className="mb-[16px]">
      <div className="flex h-[6px] gap-[2px] overflow-hidden rounded-pill">
        {counts.map(({ p, n }) => (
          <div
            key={p.k}
            className={`${ASK_BAR[p.k]} rounded-pill`}
            style={{ width: `${(n / total) * 100}%` }}
            title={`${n} ${p.short}`}
          />
        ))}
      </div>
      {/* The legend and the way in as two blocks on one row, rather than as
          one run of items: side by side while there is room, and the note on
          its own line under the counts when there is not. Held together they
          wrapped mid-legend, which put "Pass nothing" under the others and
          the sentence beside it. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-[16px] gap-y-[8px] mt-[9px]">
        <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[4px] font-body text-xs text-ink-mid">
          {counts.map(({ p, n }) => (
            <span key={p.k} className="flex items-center gap-[5px]">
              <span
                aria-hidden
                className={`${ASK_BAR[p.k]} w-[7px] h-[7px] rounded-full`}
              />
              <span className="font-semibold text-ink">{n}</span>
              {p.short}
            </span>
          ))}
        </div>
        {/* Right at every width, wrapped or not: the counts own the left
            edge, and this answers them from the other end. */}
        {note && <div className="ml-auto text-right">{note}</div>}
      </div>
    </div>
  );
}

/**
 * Which experiment the address is asking for.
 *
 * A hook rather than a few lines inside the feed, because the page now draws
 * the reader's own entry outside the feed and has to draw it the same way.
 */
export function useDemoMode(): SubmissionMode | null {
  // The co-sign work has a route of its own while it is being built, so the
  // committee page everybody else is looking at is untouched by it. One line
  // to delete when it ships, and the feature goes with the route.
  const path = useLocation().pathname;
  // The two that survived the comparison. `/cosign` is the reading the numbered
  // eighth and tenth arrived at; `/cosign-viz` is the ninth, which keeps the
  // shape of the input over the list.
  const cosigning = path.endsWith("/cosign");
  const cosigningViz = path.endsWith("/cosign-viz");
  // A second copy of the same route, so one reading can be changed while the
  // other stays put beside it.
  const cosigning2 = path.endsWith("/cosign-2");
  // And a third, which is the second with the band at the foot of the card
  // rather than over it.
  const cosigning3 = path.endsWith("/cosign-3");
  // A fourth, started as a copy of the second so the next change has somewhere
  // to land without disturbing it.
  const cosigning4 = path.endsWith("/cosign-4");
  // A fifth, started as a copy of the second, for the next thing to try
  // without disturbing what is already there.
  const cosigning5 = path.endsWith("/cosign-5");
  // A sixth, where the title, the map and the filters are drawn as one card.
  const cosigning6 = path.endsWith("/cosign-6");
  // A seventh, where the map stands in a column beside the list.
  const cosigning7 = path.endsWith("/cosign-7");
  // An eighth, started as a copy of the fifth, for a different flow to be
  // tried without disturbing the reading it came from.
  const cosigning8 = path.endsWith("/cosign-8");
  // A ninth: the eighth, landing on the reader’s own section instead of the
  // public one, so the two endings can be compared.
  const cosigning9 = path.endsWith("/cosign-9");
  // A tenth: the ninth with the position bar off and its legend kept.
  const cosigning10 = path.endsWith("/cosign-10");
  // The same records, read the other way: your own input with the letter
  // attached to it, rather than your name attached to the letter.
  const reposting = path.endsWith("/repost");
  // The fourth: nothing of your own at all. The letter, carried, with your
  // name above it.
  const endorsing = path.endsWith("/endorse");
  /** Which experiment is being looked at, for the records that belong to one. */
  const demo = cosigning
    ? "cosign10"
    : cosigningViz
      ? "cosign9"
      : cosigning2
        ? "cosign2"
        : cosigning3
          ? "cosign3"
          : cosigning4
            ? "cosign4"
            : cosigning5
              ? "cosign5"
              : cosigning6
                ? "cosign6"
                : cosigning7
                  ? "cosign7"
                  : cosigning8
                    ? "cosign8"
                    : cosigning9
                      ? "cosign9"
                      : cosigning10
                        ? "cosign10"
                        : reposting
                          ? "repost"
                          : endorsing
                            ? "endorse"
                            : null;
  return demo;
}

/**
 * The reader's own entry, drawn outside the feed.
 *
 * It answers to none of the feed's controls, so it is not in the feed: a card
 * that ignores the sort, the filters and the paging while sitting among cards
 * that obey them is a list with one row lying about itself.
 */
export function OwnSubmission({
  items,
  accounts,
}: {
  items: ConferenceSubmission[];
  accounts: ConferenceAccount[];
}) {
  const demo = useDemoMode();
  const own = items.find((t) => t.id === OWN_ID);
  if (!own) return null;
  const of = own.cosignOf
    ? items.find((x) => x.id === own.cosignOf)
    : undefined;
  const who = of && accounts.find((u) => u.id === of.userId);
  return (
    // No `overflow-hidden`: the card holds a kebab whose menu opens past its
    // own bottom edge, and clipping cut the menu in half. It was there to hold
    // a tinted strip inside the radius, and that strip is gone.
    <div className="rounded-control border border-line bg-surface shadow-raised">
      <SubmissionEntry
        t={own}
        accounts={accounts}
        mode={demo}
        quoted={isCosign(demo) && of && who ? { account: who, of } : undefined}
      />
    </div>
  );
}

/** The one setting in the panel that orders the feed rather than narrowing it. */
const COPY_WORDLESS = "Show cosigns without content";

/** The card the reader filed themselves, which no control may carry off. */
export const OWN_ID = "cc-viewer-draft";

/** Which of the four experiments a card is being drawn for. */
type SubmissionMode =
  | "cosign"
  | "cosign2"
  | "cosign3"
  | "cosign4"
  | "cosign5"
  | "cosign6"
  | "cosign7"
  | "cosign8"
  | "cosign9"
  | "cosign10"
  | "repost"
  | "endorse";

/**
 * Both co-sign routes.
 *
 * The second one is a copy of the first, kept so the two readings can be
 * changed against each other. They answer alike everywhere until something on
 * one of them is meant to differ, and then that branch names the mode itself
 * rather than going through here.
 */
const isCosign = (mode?: SubmissionMode | null) =>
  mode === "cosign" ||
  mode === "cosign2" ||
  mode === "cosign3" ||
  mode === "cosign4" ||
  mode === "cosign5" ||
  mode === "cosign6" ||
  mode === "cosign7" ||
  mode === "cosign8" ||
  mode === "cosign9" ||
  mode === "cosign10";

/**
 * The two readings that carry a band rather than a corner button.
 *
 * They differ only in where the band sits, so everything the band displaces
 * (the date, the space over the letter) answers to this rather than to either
 * one of them.
 */
/**
 * The readings that name the letter on the card rather than carrying it.
 *
 * The fifth and the sixth draw the same card. They differ in what the section
 * around it looks like, not in what a filing looks like.
 */
const isPlain = (mode?: SubmissionMode | null) =>
  mode === "cosign5" ||
  mode === "cosign6" ||
  mode === "cosign7" ||
  mode === "cosign8" ||
  mode === "cosign9" ||
  mode === "cosign10";

const isBanded = (mode?: SubmissionMode | null) =>
  mode === "cosign2" ||
  mode === "cosign3" ||
  mode === "cosign4" ||
  mode === "cosign5" ||
  mode === "cosign6" ||
  mode === "cosign7" ||
  mode === "cosign8" ||
  mode === "cosign9" ||
  mode === "cosign10";

/**
 * The tally on a letter, counting up to its new figure once.
 *
 * Only where the reader has just put their own name to it. The number is the
 * page's claim about how many people stand behind the letter, and watching it
 * move is the one confirmation that says what they did rather than that
 * something happened: twenty becomes twenty-one because of them, in front of
 * them.
 */
function Tally({ to, run }: { to: number; run: boolean }) {
  const [n, setN] = useState(run ? Math.max(0, to - 1) : to);
  useEffect(() => {
    if (!run) {
      setN(to);
      return;
    }
    // A beat after the page has landed, which is when this is switched on. A
    // number that moves while something else is moving is a number nobody saw
    // move.
    const up = setTimeout(() => setN(to), 180);
    return () => clearTimeout(up);
  }, [run, to]);
  // Keyed on the figure, so React replaces the element when it changes and the
  // animation runs from its start rather than being skipped as a re-render of
  // something already on screen.
  return (
    <span
      key={n}
      className={`inline-block font-bold origin-center ${
        run && n === to ? "animate-pop motion-reduce:animate-none" : ""
      }`}
    >
      {n}
    </span>
  );
}

export function SubmissionEntry({
  t,
  accounts,
  onOpen,
  fullBody = false,
  actions = true,
  onCosign,
  endorsedBy,
  quoted,
  mode = null,
  yours = false,
  fresh = false,
}: {
  t: ConferenceSubmission;
  /** The roster `t.userId` resolves against. */
  accounts: ConferenceAccount[];
  /** Click-through to the submission's own page (routing wired later). */
  onOpen?: (id: string) => void;
  /** Whether the reader is one of the names in this letter's count. */
  yours?: boolean;
  /** That name was added a moment ago, so the count is worth watching move. */
  fresh?: boolean;
  /**
   * Render the body whole, without the six-line clamp and its Show more.
   * Used where the submission is the point rather than one of a list.
   */
  fullBody?: boolean;
  /**
   * The kebab of per-entry actions. Dropped on the review step, where following
   * the account and reporting the statement are both offers to act on your own
   * unposted words.
   */
  actions?: boolean;
  /**
   * Put your name to an organisation's letter.
   *
   * Only under one: co-signing is a person agreeing with an organisation, and
   * an organisation seconding another organisation is a different thing we have
   * not built. It sits at the foot of the card rather than beside the kebab,
   * because it is the one action here that is about the letter rather than
   * about the account that filed it.
   */
  onCosign?: (id: string) => void;
  /**
   * Whose letter this one signs, where it is a co-sign.
   *
   * Resolved by the feed, which holds the other filings; the card only needs
   * the name to say what was signed.
   */
  /** Whose words this filing took, where it took them. */
  /**
   * Who stood behind this one, where the card is somebody else's letter and
   * the reader added nothing but their agreement.
   *
   * The card then draws the letter itself: the account, the position and the
   * body are all the letter's, and this is the only thing on it belonging to
   * the person who endorsed it.
   */
  endorsedBy?: string;
  /**
   * Which reading of the same act the card is drawing.
   *
   * The three experiments differ in what the press is called and in what it
   * leaves behind: your name on their letter, their letter attached to your
   * own input, or their words taken into it. The control says which.
   */
  mode?: SubmissionMode | null;
  /**
   * The letter this input has attached to it, drawn inside the card.
   *
   * The other reading of the same record: instead of the reader's name going
   * on somebody else's letter, the letter comes along with the reader's own
   * words, quoted the way a post quotes a post.
   */
  quoted?: { account: ConferenceAccount; of: ConferenceSubmission };
}) {
  const user = accounts.find((u) => u.id === t.userId);
  const cosignedName = quoted?.account.name;
  if (!user) return null;
  /**
   * The strip that says who already stands behind this, and offers the way to
   * join them.
   *
   * Built here rather than inline because the two banded readings differ only
   * in which end of the card it sits on, and a strip written twice is two
   * places for the wording to drift.
   */
  const bottom = mode === "cosign3";
  const band =
    user.userType === "organization" && t.cosignCount ? (
      <p
        /* The height is held rather than left to the contents: where the act
           is in the band it is a bordered button, and where it has gone to the
           floor the band holds a line of text, which is ten pixels shorter.
           Two strips of different heights read as two components. */
        /* Gray rather than the position's colour. The strip reports how many
           people signed, which is not a property of what was asked for, and a
           full-width band in the position's hue says it is. Colour on these
           pages already carries provenance and position; a third use of it
           weakens both. */
        className={`flex items-center gap-[9px] min-h-[50px] -mx-[20px] px-[20px] py-[10px] bg-wash font-body text-sm text-ink-midheavy ${
          yours && fresh
            ? "animate-lit [animation-delay:160ms] motion-reduce:animate-none "
            : ""
        }${
          bottom
            ? "-mb-[20px] mt-[16px] rounded-b-[7px]"
            : "-mt-[20px] mb-[16px] rounded-t-[7px]"
        }`}
      >
        {/* Temporarily the plural users. `ThumbsUpGroup` above is the drawn
            one, kept while the two are compared. */}
        <UsersRound aria-hidden className="w-[16px] h-[16px] shrink-0" />
        <span>
          <Tally to={t.cosignCount ?? 0} run={yours && fresh} />{" "}
          {t.cosignCount === 1 ? "constituent has" : "constituents have"}{" "}
          cosigned this
          {/* Said on the letter itself, where the number is: the reader is one
              of the names in it, and a count that does not say so is the page
              leaving them out of their own total. The way back to their own
              entry follows it, since that is what they will look for next. */}
          {yours && (
            <span
              className={
                fresh
                  ? "inline animate-rise [animation-delay:240ms] motion-reduce:animate-none"
                  : "inline"
              }
            >
              {", including you! "}
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("your-input")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="font-body font-semibold text-sm text-brand-ink hover:text-brand cursor-pointer underline decoration-dotted underline-offset-[3px]"
              >
                View input
              </button>
            </span>
          )}
        </span>
        {/* The act sits in the band rather than in the card's corner, beside
            what the band says: who already stands behind this, and the way to
            join them.

            The fourth reading trades places with the floor: the band keeps the
            two facts together, how many and how lately, and the act goes down
            to the end of the letter where somebody has just read it. */}
        {mode === "cosign4" ? (
          t.cosignLatest ? (
            <span className="ml-auto shrink-0 font-body text-sm text-ink-faint whitespace-nowrap">
              Last cosigned: {t.cosignLatest}
            </span>
          ) : null
        ) : onCosign ? (
          <button
            type="button"
            onClick={() => onCosign(t.id)}
            className="ml-auto shrink-0 flex items-center rounded-control border border-line bg-surface px-[12px] py-[4px] font-body font-semibold text-sm text-ink hover:bg-surface hover:border-line-strong transition-colors cursor-pointer"
          >
            Cosign
          </button>
        ) : null}
      </p>
    ) : null;

  return (
    // `@container` makes the card its own containment context, which also makes
    // it a stacking context: the kebab's menu can no longer paint over the card
    // below this one the way it did while the card was only `relative`. So a
    // card holding an open menu lifts above its neighbours, which is the one
    // thing the container type took away.
    <div className="@container relative p-[20px] rounded-control [&:has([role=menu])]:z-10">
      {/* Above the letter rather than under it, on the second reading only.
          What is being said is who stands behind this, and that belongs to
          the card before its words rather than after them.

          Every organisation gets the band, including the ones nobody has
          signed yet: an empty strip on one card and none at all on the next
          are different things to look at, and the comparison is the point
          while this is being decided. The empty one holds a blank line so it
          stands as tall as a filled one. */}
      {(mode === "cosign2" ||
        mode === "cosign4" ||
        mode === "cosign5" ||
        mode === "cosign6" ||
        mode === "cosign7" ||
        mode === "cosign8" ||
        mode === "cosign9" ||
        mode === "cosign10") &&
        band}
      {endorsedBy && (
        /* Above the card rather than inside it, because what follows is not
           this person's filing: they put their name on somebody else's and
           passed it on, and the card underneath should stay that letter's. */
        <p className="flex items-center gap-[6px] mb-[10px] font-body text-xs text-ink-mid">
          <ThumbsUp aria-hidden className="w-[13px] h-[13px] shrink-0" />
          <span className="font-semibold text-ink">{endorsedBy}</span> endorsed
          this
        </p>
      )}
      {/* Narrow, the avatar sits against the top of the name block rather than
          centred on it: there is a truncated name and a descriptor there, and
          centring a 40px disc on two lines of text leaves it floating. */}
      <div className="relative flex items-start @[600px]:items-center gap-[14px] @[600px]:gap-[18px]">
        <AccountAvatar account={user} />
        <div className="flex-1 min-w-0">
          {/* Name, type and position wrap inside their own box; the date sits
              outside it so it always holds the top-right corner. */}
          <div className="flex items-center gap-[6px]">
            <div className="flex-1 min-w-0">
              {/* One line while the card is narrow, where a name, an icon and a
                  chip wrapping into three rows costs more height than the body
                  they sit above. Over the threshold it wraps as it always has. */}
              <p
                /* Bottom edges elsewhere, centres on a co-sign. The row
                   normally holds a name, a mark and a chip, three boxes of a
                   height, and a shared bottom edge is right for those. A
                   co-sign makes it a sentence with a chip in it, and every
                   item on it is set at one size so that centring them lines
                   the words up as well as the boxes. */
                className={`flex gap-[6px] @[600px]:flex-wrap font-body font-semibold text-base text-ink leading-none ${
                  isPlain(mode) && cosignedName ? "items-center" : "items-end"
                }`}
              >
                {/* Plain text for now. The name should be a link to the
                  submission's own page, and it will be an anchor when that page
                  exists; a button that opens a modal is not that, and dressing
                  it as a link before there is a URL behind it teaches the wrong
                  thing about what clicking a name does. `onOpen` is kept so the
                  wiring is here when the route is. */}
                {/* The name is what gives way, so the icon and the chip beside it
                    never land on a line of their own. The whole name is in the
                    title while it is cut. */}
                {/* Ahead of the name rather than after it: it says what kind
                    of account is speaking before it says who, which is the
                    order the sentence is read in. */}
                <Hint
                  text={user.name}
                  // No leading under the letters, so the name's box ends where
                  // the letters do and everything on this line can share one
                  // bottom edge. Descenders still paint; they simply do not
                  // reserve space that pushes the glyph and the chip up.
                  className="min-w-0 truncate leading-none @[600px]:overflow-visible @[600px]:whitespace-normal"
                >
                  {user.name}
                </Hint>
                {/* Flush with the name and the chip: one bottom edge for the
                    three of them, with the space under it coming from the line
                    below rather than from the name's own leading. */}
                <span className="flex shrink-0">
                  <AccountTypeIcon type={user.userType} />
                </span>
                {/* Always on, unlike the ballot pages' chip, which no-position
                    leaves off. All four of these are an ask, so there is no
                    entry here whose position is nothing to report.

                    Narrow, it is in the foot row instead. These labels are two
                    words rather than the one word a ballot stance takes, so a
                    chip held on the name's line would leave the name about
                    fifty pixels to be read in. */}
                {/* Whose letter, in the chip's place. The chip names what was
                    asked for, and on a co-sign that ask came with the letter
                    rather than being chosen: putting it on the name's line
                    tells the reader what this person did before telling them
                    what it amounted to. The line then reads who, what they
                    did, whose. */}
                {isPlain(mode) && cosignedName ? (
                  <>
                    {/* Every item its own child of the row, at the row's own
                        size. The connective is told apart by weight and
                        colour rather than by being smaller, which is what put
                        two line heights on one line and made the alignment
                        unfixable from any single property. */}
                    <span className="shrink-0 font-normal text-ink-mid">
                      cosigned
                    </span>
                    {/* The letter is the way in, and the letter is its name,
                        its account's mark and its ask together. The rule runs
                        under the three of them; the verb before it is this
                        card's own and stays out. */}
                    <button
                      type="button"
                      onClick={() => onOpen?.(quoted.of.id)}
                      aria-label={`View ${cosignedName}'s input`}
                      /* The name, its mark and the rule all answer the hover
                         together, because the target is the letter and not
                         one word of its name. Brand rather than the link
                         blue: at rest this is an account's name like the one
                         above it, and a name that turns blue on hover reads
                         as having been a link all along. */
                      className="group flex min-w-0 items-center gap-[6px] border-b border-dotted border-line-strong hover:border-brand cursor-pointer transition-colors"
                    >
                      <span className="min-w-0 truncate group-hover:text-brand transition-colors">
                        {cosignedName}
                      </span>
                      {/* The same mark the organisation wears beside its own
                          name further down the feed, so the two read as the
                          same account. */}
                      {/* A few pixels of the rule taken back off the end, so
                          it stops under the mark rather than running a dot
                          past it. The chip gives the width back. */}
                      <span className="flex shrink-0 -mr-[3px] group-hover:text-brand transition-colors">
                        <AccountTypeIcon type={quoted.account.userType} />
                      </span>
                    </button>
                    {/* The letter's own chip, which is where this card's
                        position came from. Beside the letter rather than
                        beside Ava: the ask belongs to what she signed. Outside
                        the rule, because a pill with a line under it reads as
                        a second control. */}
                    <span className="flex shrink-0 ml-[3px]">
                      <PositionChip position={quoted.of.position} />
                    </span>
                  </>
                ) : (
                  <span className="flex shrink-0">
                    <PositionChip position={t.position} />
                  </span>
                )}
              </p>
              {/* Inside the name's own cell, not below the whole row: it
                  describes the account, so it belongs to the name, and the date
                  should centre against the pair rather than against the name
                  alone. */}
              {/* The byline: what kind of account filed, and when. The mark
                  leads it at the byline's own weight rather than sitting up on
                  the name's line, where it was a third thing competing with a
                  name and a chip.

                  Only the experiments move the date here. A card with no mode
                  is the prototype's own and keeps it in the corner. */}
              <p className="font-body text-xs text-ink-faint leading-[1.4] mt-[8px] min-w-0 truncate">
                {user.descriptor}
                {mode && !isBanded(mode) && (
                  <>
                    <span aria-hidden className="mx-[6px]">
                      ·
                    </span>
                    {t.date}
                  </>
                )}
              </p>
            </div>
            {/* The corner. Narrow it holds the kebab alone, and nothing at all
                on the review step, which has no kebab: the date has gone to the
                foot of the card and an empty cell would still be taking the
                gap beside the name. */}
            <div
              className={`shrink-0 self-start items-center gap-[2px] -mt-[5px] -mr-[6px] ${
                actions ? "flex" : "hidden @[600px]:flex"
              }`}
            >
              {/* Cosign leads the corner, ahead of the date. It is the
                  thing the card is inviting, and behind a timestamp it read as
                  an afterthought. The rest sit after. */}
              {onCosign &&
                user.userType === "organization" &&
                (mode === "cosign" ||
                  (isBanded(mode) && !t.cosignCount && mode !== "cosign4")) && (
                  <button
                    type="button"
                    onClick={() => onCosign(t.id)}
                    className="mr-[8px] shrink-0 flex items-center rounded-control border border-line bg-surface px-[12px] py-[4px] font-body font-semibold text-sm text-ink hover:bg-wash hover:border-line-strong transition-colors cursor-pointer"
                  >
                    Cosign
                  </button>
                )}
              {/* The experiments put the date on the card's floor instead,
                  under everything, so it lands in the same place whatever the
                  corner is holding. A card with no mode is the prototype's own
                  and keeps it here. */}
              {/* The second reading takes it back, because the corner it was
                  moved out of is empty there: the act went up into the band. */}
              {(!mode || isBanded(mode)) && (
                <span
                  className={`hidden @[600px]:inline font-body text-ink-mid whitespace-nowrap mr-[2px] ${
                    isBanded(mode) ? "text-sm" : "text-xs"
                  }`}
                >
                  {t.date}
                </span>
              )}
              {/* The rest are a mark beside the kebab. The act belongs with the
                  card's other per-entry controls, and a bordered button in the
                  corner read as the card's purpose rather than as one thing you
                  can do with it. */}
              {onCosign &&
                user.userType === "organization" &&
                !isCosign(mode) && (
                  <button
                    type="button"
                    onClick={() => onCosign(t.id)}
                    aria-label={
                      mode === "repost"
                        ? "Repost this"
                        : mode === "endorse"
                          ? "Endorse this"
                          : "Cosign this"
                    }
                    title={
                      mode === "repost"
                        ? "Repost this"
                        : mode === "endorse"
                          ? "Endorse this"
                          : "Cosign this"
                    }
                    className="ml-[6px] flex items-center justify-center w-[32px] h-[32px] rounded-control text-ink-mid hover:text-ink hover:bg-wash cursor-pointer transition-colors"
                  >
                    {mode === "repost" ? (
                      <Repeat2 aria-hidden className="w-[20px] h-[20px]" />
                    ) : mode === "endorse" ? (
                      <ThumbsUp aria-hidden className="w-[20px] h-[20px]" />
                    ) : (
                      <Plus aria-hidden className="w-[20px] h-[20px]" />
                    )}
                  </button>
                )}
              {actions && (
                <EntryActions name={user.name} own={t.id === OWN_ID} />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* The body sits in the same two-column frame the header does, with an
          empty cell where the avatar is, so its first character lands under the
          name rather than under the avatar. A spacer rather than a left
          padding, because it is the avatar's own width and should change when
          that does. */}
      {/* Narrow, the spacer goes and the body takes the card's full width: a
          column of empty space under the avatar costs too much there. */}
      <div className="flex gap-[18px]">
        <div aria-hidden className="hidden @[600px]:block w-[40px] shrink-0" />
        {/* More air under the byline on the second reading: the date left
            it for the corner, so what is above the letter is one short line
            where the others have two things on it. */}
        <div
          className={`flex-1 min-w-0 @[600px]:pr-[12px] ${
            isBanded(mode)
              ? // The band eats the card's top padding, so what is left above
                // the name is the band's own bottom margin, sixteen. The foot
                // of the card keeps the full twenty, which the count line
                // also takes above itself: the floor sits in equal air.
                "pt-[16px] @[600px]:pt-[12px] pb-0"
              : "pt-[12px] @[600px]:pt-[8px] pb-[4px] @[600px]:pb-[8px]"
          }`}
        >
          {/* A line where there are no words, so the card is not read as a
              filing with its text missing. As faint as the page goes: it is
              the same sentence on every one of these, and a reader needs it
              once rather than at every card. */}
          {!t.body && t.cosignOf ? (
            <p className="mt-[4px] font-body italic text-sm @[600px]:text-base text-ink-faint leading-[1.55]">
              Each individual can provide input or cosign one position. This
              individual decided not to publicly share additional input.
            </p>
          ) : null}
          {!t.body ? null : fullBody ? (
            <p
              className={`font-body text-base text-ink leading-[1.55] ${
                isBanded(mode) ? "" : "whitespace-pre-line"
              }`}
            >
              {isBanded(mode)
                ? t.body.split(/\n{2,}/).map((para, i) => (
                    <span key={i} className="block whitespace-pre-line">
                      {i > 0 && <span aria-hidden className="block h-[10px]" />}
                      {para}
                    </span>
                  ))
                : t.body}
            </p>
          ) : (
            // A step smaller while the card is narrow, so six lines still hold
            // a readable amount of what was filed. Line breaks are kept, the
            // same as the unclamped body above: the clamp is meant to shorten
            // what somebody wrote, not to re-set it as one paragraph.
            <ClampedText
              text={t.body}
              /* The banded readings close the gap between paragraphs: a blank
                 line is a whole line of leading, which in a letter this size
                 reads as a hole rather than as a break. */
              paragraphGap={isBanded(mode) ? 10 : undefined}
              className="font-body text-sm @[600px]:text-base text-ink leading-[1.55] whitespace-pre-line"
            />
          )}
          {quoted && (
            /* The letter, carried inside the card rather than linked from it.
               Quieter than the card around it at every level: a hairline
               instead of the page's border, the author at body size rather
               than heading size, and the words clamped, because what is being
               read here is the input above and this is what it rests on. */
            <>
              {/* What the card below is, said once, as a label for it rather
                  than as a line in the filing. Over the words it came between
                  a name and what that person wrote; here it binds to the thing
                  it describes and the reading runs name, words, letter. */}
              {isCosign(mode) && !isPlain(mode) && (
                <p className="flex items-center gap-[6px] mt-[14px] mb-[6px] font-body text-xs text-ink-mid">
                  <BadgeCheck
                    aria-hidden
                    className="w-[13px] h-[13px] shrink-0"
                  />
                  Cosigned
                </p>
              )}
              {/* Filled rather than outlined, now that the section around the
                  feed is white: a tone reads as set into the card, where on a
                  gray page it was a third box. The band's own gray, so that a
                  card carrying both is wearing one tone and not two that are
                  nearly the same. */}
              {!isPlain(mode) && (
                <div className="mb-[8px] rounded-control border border-line px-[14px] py-[12px]">
                  <div className="flex items-center gap-[8px]">
                    <AccountAvatar account={quoted.account} size={22} />
                    <p className="min-w-0 truncate font-body font-semibold text-sm text-ink">
                      {quoted.account.name}
                    </p>
                    {/* The letter's date rather than its chip. The chip is the
                    same one the card above is already wearing, since a
                    co-sign takes the letter's position: twice on one card it
                    reads as two claims agreeing rather than as one. */}
                    <span className="ml-auto shrink-0 font-body text-xs text-ink-faint whitespace-nowrap">
                      {quoted.of.date}
                    </span>
                  </div>
                  <ClampedText
                    text={quoted.of.body}
                    lines={3}
                    className="mt-[8px] font-body text-sm text-ink-mid leading-[1.55] whitespace-pre-line"
                  />
                </div>
              )}
            </>
          )}
          {/* Narrow, the card closes on what the header could not hold: the
              date, on the right. Above the count rather than under it: the
              letter was filed before anybody signed it, and the two read in
              that order. */}
          <div className="@[600px]:hidden flex items-center justify-end mt-[12px]">
            <span className="font-body text-sm text-ink-mid whitespace-nowrap">
              {t.date}
            </span>
          </div>
          {/* Not on the third reading: the band at the foot of the card is
              already the last thing read, and a count a line above it saying
              the same number twice is the floor arguing with the strip. */}
          {mode &&
          mode !== "cosign3" &&
          user.userType === "organization" &&
          (t.cosignCount || mode === "cosign4") ? (
            // The count on the card's own floor. The date is up in the byline,
            // beside what kind of account filed it.
            /* Floated, so the count keeps the left edge and wraps against
               what is on the right. Where that is a button rather than a line
               of text the two have different heights, and floats line them up
               by their tops: there the row is a flex box so they share a
               centre. */
            <div
              className={`${isBanded(mode) ? "mt-[20px]" : "mt-[14px]"} ${
                mode === "cosign4"
                  ? "flex items-center justify-between gap-[12px]"
                  : "flow-root"
              }`}
            >
              {/* The mark carries the word: beside a control that already
                  names the act, a second naming of it is the same sentence
                  said twice. */}
              {/* Nothing yet on a letter nobody has signed. The row still
                  runs, because the fourth reading keeps the act here and a
                  letter with no names is the one most in need of it. */}
              {t.cosignCount ? (
                <span
                  className={`flex items-center gap-[4px] font-body text-sm text-ink-mid ${
                    mode === "cosign4" ? "" : "float-left"
                  }`}
                >
                  {mode === "repost" ? (
                    <Repeat2 aria-hidden className="w-[16px] h-[16px]" />
                  ) : mode === "endorse" ? (
                    <ThumbsUp aria-hidden className="w-[16px] h-[16px]" />
                  ) : (
                    /* Six from the mark, four between the words: the row's
                     gap is the narrow one, and the badge makes up the rest
                     with a margin of its own. */
                    <BadgeCheck
                      aria-hidden
                      className="mr-[2px] w-[16px] h-[16px]"
                    />
                  )}
                  <span className="font-semibold">{t.cosignCount}</span>
                  {isCosign(mode) ? (
                    <>
                      <span>cosigned</span>
                      {t.cosignInDistrict ? (
                        <>
                          {/* Flex items like the rest of the row, so the dot
                            sits in the same four pixels that separate every
                            other word here. */}
                          <span aria-hidden className="mx-[2px] text-ink-faint">
                            ·
                          </span>
                          <span className="font-semibold">
                            {t.cosignInDistrict}
                          </span>
                          <span>
                            {t.cosignInDistrict === 1
                              ? "district"
                              : "districts"}
                          </span>
                        </>
                      ) : null}
                    </>
                  ) : null}
                </span>
              ) : null}
              {/* When the most recent of them signed. The byline's date is the
                  letter's own and never moves; this one says whether the names
                  are still coming in. On the fourth reading the act stands
                  here instead, under the words it is agreeing with. */}
              {mode === "cosign4" ? (
                onCosign ? (
                  <button
                    type="button"
                    onClick={() => onCosign(t.id)}
                    className="ml-auto shrink-0 flex items-center rounded-control border border-line bg-surface px-[12px] py-[4px] font-body font-semibold text-sm text-ink hover:bg-wash hover:border-line-strong transition-colors cursor-pointer"
                  >
                    Cosign
                  </button>
                ) : null
              ) : t.cosignLatest ? (
                <span className="float-right ml-[12px] font-body text-sm text-ink-mid leading-[24px] whitespace-nowrap">
                  Last cosigned: {t.cosignLatest}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {mode === "cosign3" && band}
    </div>
  );
}

// Filter chips appear only once the feed reaches FEED_CONTROLS_MIN.
const FEED_CONTROLS_MIN = 4;

/** One of the four, or all of them. */
export type PositionFilter = "all" | ConferencePosition;

export type AccountTypeFilter = "all" | ConferenceAccountType;

const TYPE_FILTERS: { id: AccountTypeFilter; label: string }[] = [
  { id: "all", label: "All Accounts" },
  { id: "individual", label: "Individuals" },
  { id: "organization", label: "Organizations" },
  { id: "government", label: "Gov Officials" },
];

/**
 * The thumb, for the one place it appears: the pill naming the position the feed
 * is currently narrowed to.
 *
 * It marks the direction rather than the position, which is why three of the
 * four share it, and it is why it is not on the menu, on the chip beside a
 * name, or in the composer. Four labels each wearing one of two thumbs is
 * decoration; one thumb on the position you have actually chosen says which way
 * the thing you are reading is pushing.
 *
 * The offset on the thumbs down is a property of the artwork, which nothing
 * structural can derive.
 */
const ASK_THUMB: Record<ConferenceAsk, { glyph: string; nudge: string }> = {
  bill: { glyph: "\u{1F44D}", nudge: "" },
  nothing: { glyph: "\u{1F44E}", nudge: "translate-y-[2px]" },
};

/**
 * The four positions, as one pill that opens the rest.
 *
 * The ballot pages put their three out bare, as glyphs and nothing else, because
 * a thumbs up, a thumbs down and a speech bubble tell themselves apart at a
 * glance. Three of these four share the thumbs up, so the words are what
 * distinguish them, and four labeled chips do not fit a feed that also lives in
 * a panel. So they collapse into one: the pill names the position being looked
 * at, and the menu behind it states all four in full.
 */
/** How the feed is ordered, and what each one is called on the control. */
const SORTS = [
  { k: "new", label: "Newest first" },
  { k: "signed", label: "Most cosigned" },
  { k: "old", label: "Oldest first" },
] as const;

type SortKey = (typeof SORTS)[number]["k"];

/** The shape every control in the panel wears, so the column reads as one. */
function MenuSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { k: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-[5px]">
      <span className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid">
        {label}
      </span>
      {/* A real select. The row's own pickers are custom because they carry a
          glyph and a clear button; these carry neither, and a native control
          brings its own keyboard, its own scrolling and its own behaviour on a
          phone for nothing. */}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none h-[34px] pl-[12px] pr-[32px] rounded-control border border-line bg-surface font-body text-sm text-ink hover:bg-wash cursor-pointer transition-colors"
        >
          {options.map((o) => (
            <option key={o.k} value={o.k}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-[11px] top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-ink-mid"
        />
      </div>
    </label>
  );
}

/**
 * The rest of the filters, behind one mark.
 *
 * Here for the things that do not earn a pill of their own: the two pickers on
 * the row are what people reach for, and everything else can wait behind a
 * press. The mark carries a count when something inside is set, because a
 * control that hides its state is a control a reader has to open to trust.
 */
function MoreFilters({
  sort,
  onSort,
  county,
  onCounty,
  counties,
  countyCounts,
  followed,
  onFollowed,
  followable,
  wordless,
  onWordless,
  cosigns,
  set,
}: {
  sort: SortKey;
  onSort: (v: SortKey) => void;
  county: string[];
  onCounty: (v: string[]) => void;
  counties: string[];
  /** How many entries each one stands for, beside its name. */
  countyCounts: Record<string, number>;
  followed: string[];
  onFollowed: (v: string[]) => void;
  /** The accounts the reader follows, which is what the list offers. */
  followable: ConferenceAccount[];
  /** Whether co-signs with nothing written stand as cards of their own. */
  wordless: boolean;
  onWordless: (v: boolean) => void;
  /** Whether this reading has co-signs in it to order at all. */
  cosigns: boolean;
  /** How many of them are off their default, for the mark's own badge. */
  set: number;
}) {
  const [open, setOpen] = useState(false);
  // The county list, shut until asked for.
  const [places, setPlaces] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Filters"
        // The mark alone, with no pill around it. Two labelled pickers already
        // sit on this row; a third control dressed the same way made the row
        // read as three equal things when this one only opens the rest.
        className={`relative flex items-center justify-center gap-[6px] w-[34px] h-[34px] rounded-control transition-colors cursor-pointer ${
          open
            ? "bg-wash text-ink"
            : "text-ink-mid hover:bg-wash hover:text-ink"
        }`}
      >
        <ListFilter aria-hidden className="w-[17px] h-[17px]" />
        {/* Over the corner of the mark now that there is no pill to sit
            inside. */}
        {set > 0 && (
          <span className="absolute -top-[3px] -right-[3px] flex items-center justify-center min-w-[16px] h-[16px] px-[4px] rounded-full bg-ink font-body font-bold text-[10px] leading-none text-ink-inverse">
            {set}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[248px] bg-surface border border-line rounded-control shadow-popover p-[16px] flex flex-col gap-[20px]">
          {/* Two states, so both are on screen and one is lit. A dropdown
              hides half the answer behind a press, and a checkbox makes the
              other half the absence of a tick: this is a choice between two
              things that a reader should be able to see the whole of. */}
          {/* The accounts being followed, listed. A switch said "the ones I
              follow" and left the reader to remember who that was; the names
              say it, and picking one of three is a thing the switch could not
              do at all. */}
          {followable.length > 0 && (
            <div className="flex flex-col gap-[7px]">
              <div className="flex items-baseline justify-between gap-[8px]">
                <span className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid">
                  Following
                </span>
                {/* The committees page's own switch, for both ends of the
                    list at once: every name or none of them. Three names is
                    few enough to pick one at a time, so this is only for the
                    two answers nobody wants three presses for. */}
                {(() => {
                  const all = followed.length === followable.length;
                  return (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={all}
                      aria-label="Follow all"
                      onClick={() =>
                        onFollowed(all ? [] : followable.map((u) => u.id))
                      }
                      className="group/sw shrink-0 cursor-pointer"
                    >
                      <span
                        className={`relative block w-[28px] h-[16px] rounded-full transition-colors motion-reduce:transition-none ${
                          all
                            ? "bg-ink"
                            : "bg-line-strong group-hover/sw:bg-ink-faint"
                        }`}
                      >
                        <span
                          className={`absolute top-[2px] left-[2px] w-[12px] h-[12px] rounded-full bg-surface shadow-popover transition-transform motion-reduce:transition-none ${
                            all ? "translate-x-[12px]" : ""
                          }`}
                        />
                      </span>
                    </button>
                  );
                })()}
              </div>
              {/* No box: three names do not need one, and the rule around
                  them made a short list look like a scrolling one. */}
              <div className="flex flex-col">
                {followable.map((u) => {
                  const on = followed.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      role="menuitemcheckbox"
                      aria-checked={on}
                      onClick={() =>
                        onFollowed(
                          on
                            ? followed.filter((x) => x !== u.id)
                            : [...followed, u.id],
                        )
                      }
                      // No inset now that the box around the list is gone:
                      // the names line up with the heading over them and with
                      // the setting above that.
                      className={`flex items-center gap-[8px] py-[5px] text-left font-body text-sm cursor-pointer ${
                        on
                          ? "font-semibold text-ink"
                          : "text-ink-mid hover:text-ink"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`flex items-center justify-center w-[15px] h-[15px] shrink-0 rounded-[4px] border transition-colors ${
                          on
                            ? "bg-ink border-ink text-ink-inverse"
                            : "border-line-strong"
                        }`}
                      >
                        {on && <Check className="w-[11px] h-[11px]" />}
                      </span>
                      <span className="min-w-0 truncate">{u.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Checkboxes rather than a select: a reader narrowing by place
              usually wants two or three of them, and a second popover inside
              this one to hold them would be a menu inside a menu. */}
          <div className="flex flex-col gap-[7px]">
            <div className="flex items-baseline justify-between gap-[8px]">
              <span className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid">
                County
              </span>
              {county.length > 0 && (
                <button
                  onClick={() => onCounty([])}
                  className="font-body font-semibold text-2xs text-brand-ink hover:text-brand cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="max-h-[164px] overflow-y-auto rounded-control border border-line py-[2px]">
              {counties.map((c) => {
                const on = county.includes(c);
                return (
                  <button
                    key={c}
                    role="menuitemcheckbox"
                    aria-checked={on}
                    onClick={() =>
                      onCounty(
                        on ? county.filter((x) => x !== c) : [...county, c],
                      )
                    }
                    className={`w-full flex items-center gap-[8px] px-[10px] py-[6px] text-left font-body text-sm hover:bg-wash cursor-pointer ${
                      on ? "font-semibold text-ink" : "text-ink-mid"
                    }`}
                  >
                    {/* A box rather than a tick that appears: the empty
                        state has to look like something a reader can turn
                        on, and a blank space does not. */}
                    <span
                      aria-hidden
                      className={`flex items-center justify-center w-[15px] h-[15px] shrink-0 rounded-[4px] border transition-colors ${
                        on
                          ? "bg-ink border-ink text-ink-inverse"
                          : "border-line-strong"
                      }`}
                    >
                      {on && <Check className="w-[11px] h-[11px]" />}
                    </span>
                    {/* The size beside the name rather than off at the right
                        edge: it belongs to the place, and a column of figures
                        down the side read as a second thing to scan. */}
                    <span className="min-w-0 truncate">
                      {c}{" "}
                      <span className="font-normal text-ink-faint">
                        ({countyCounts[c] ?? 0})
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Last, under the two lists that narrow the feed, because this one
              narrows nothing: it says where a kind of entry sits rather than
              which entries are shown.

              Only where there are co-signs to order: the committee page's
              own feed has none. */}
          {cosigns && (
            <div className="flex flex-col gap-[7px]">
              <span className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid">
                Cosigns
              </span>
              <button
                role="menuitemcheckbox"
                aria-checked={wordless}
                onClick={() => onWordless(!wordless)}
                className={`flex items-start gap-[8px] text-left font-body text-sm cursor-pointer hover:text-ink ${
                  wordless ? "text-ink" : "text-ink-mid"
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-[2px] flex items-center justify-center w-[15px] h-[15px] shrink-0 rounded-[4px] border transition-colors ${
                    wordless
                      ? "bg-ink border-ink text-ink-inverse"
                      : "border-line-strong"
                  }`}
                >
                  {wordless && <Check className="w-[11px] h-[11px]" />}
                </span>
                <span className="min-w-0">{COPY_WORDLESS}</span>
              </button>
              {/* Under the box rather than over it: the label says what ticking
                does, and this says what the feed is doing meanwhile, which is
                the question a reader asks second. */}
              <p className="font-body text-[12px] text-ink-faint leading-[1.45]">
                Cosigns without content appear last by default, select to
                display in date order
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PositionPicker({
  value,
  onChange,
}: {
  value: PositionFilter;
  onChange: (v: PositionFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const [room, setRoom] = useState<number>();
  useEffect(() => {
    if (!open) return;
    const read = () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(min-width: 640px)").matches)
        return setRoom(undefined);
      setRoom(
        Math.max(
          200,
          Math.round(window.innerWidth - el.getBoundingClientRect().left - 16),
        ),
      );
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, [open]);

  const current = value === "all" ? null : POSITIONS[value];

  return (
    <div ref={ref} className="relative">
      {/* Held at one height in both states, so choosing a position does not
          change the row's height and step everything beside it down. The wash
          lives on the whole chip; the clear button then stacks its own round
          wash on top, which is how it reads as a second target inside the first
          rather than as a hole in it. */}
      <div
        className={`relative flex items-center h-[34px] rounded-pill border border-line hover:bg-wash transition-colors ${
          open ? "bg-wash" : ""
        } ${current ? "pr-[4px]" : ""}`}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={
            current
              ? `Position: ${current.short}. Change`
              : "Filter by position"
          }
          className={`flex h-full items-center gap-[7px] rounded-l-pill cursor-pointer ${
            current
              ? "pl-[14px] pr-[11px] sm:pl-[9px] sm:pr-[7px]"
              : "pl-[18px] pr-[16px] sm:pl-[11px] sm:pr-[10px]"
          }`}
        >
          {current && (
            // Centred on the pill rather than sharing a baseline with the word,
            // so the word lines up with the clear button on the other end
            // instead of following wherever the glyph's baseline falls.
            <span
              aria-hidden
              className={`flex h-full items-center text-[19px] leading-none drop-shadow-[0_1px_1px_rgba(20,20,19,0.12)] ${
                ASK_THUMB[current.ask].nudge
              }`}
            >
              {ASK_THUMB[current.ask].glyph}
            </span>
          )}
          {/* The short form here and the sentence in the menu, both from the
              position itself: the pill is narrow and the whole sentence would
              crowd the control that clears it. */}
          <span className="flex h-full items-center font-body font-semibold text-sm leading-none text-ink whitespace-nowrap">
            {current ? current.short : "All positions"}
          </span>
          {!current && (
            <ChevronDown
              aria-hidden
              className="w-[13px] h-[13px] text-ink-mid"
            />
          )}
        </button>
        {current && (
          // Swapping is the likelier next move than clearing, so the pill's body
          // opens the others and this only clears.
          <button
            onClick={() => onChange("all")}
            aria-label={`Clear the ${current.short} filter`}
            className="relative z-10 flex items-center justify-center w-[26px] h-[26px] rounded-full text-ink-mid hover:text-ink hover:bg-wash-strong cursor-pointer transition-colors"
          >
            <X aria-hidden className="w-[13px] h-[13px]" />
          </button>
        )}
      </div>
      {open && (
        <div
          role="listbox"
          style={room ? { maxWidth: room } : undefined}
          className="absolute left-0 top-[calc(100%+6px)] z-20 w-[min(340px,calc(100vw-32px))] sm:w-max sm:min-w-[236px] bg-surface border border-line rounded-control shadow-popover py-[8px] sm:py-[4px]"
        >
          {/* The sentence rather than the pill's two words: there is room for it
              here, and this is the list of what the four actually are. Labels
              alone, all the way down, the current one included: it is marked the
              way the account menu beside it marks its own, and a column of two
              thumbs repeated four times would be decoration rather than a
              distinction anyone could use. */}
          {CONFERENCE_POSITIONS.map((p) => (
            <button
              key={p.k}
              role="option"
              aria-selected={p.k === value}
              onClick={() => {
                onChange(p.k);
                setOpen(false);
              }}
              className={`flex items-center w-full text-left font-body text-sm px-[16px] sm:px-[12px] py-[16px] sm:py-[6px] leading-[1.35] cursor-pointer hover:bg-wash ${
                p.k === value ? "font-semibold text-brand" : "text-ink"
              }`}
            >
              {p.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The account-type picker, sitting beside the heading rather than inside it.
 * It names its own selection and changes nothing else: the heading is a
 * heading, and this is the control next to it.
 */
function AccountTypePicker({
  value,
  onChange,
}: {
  value: AccountTypeFilter;
  onChange: (v: AccountTypeFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const [room, setRoom] = useState<number>();
  useEffect(() => {
    if (!open) return;
    const read = () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(min-width: 640px)").matches)
        return setRoom(undefined);
      setRoom(
        Math.max(
          200,
          Math.round(window.innerWidth - el.getBoundingClientRect().left - 16),
        ),
      );
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, [open]);

  const current = TYPE_FILTERS.find((t) => t.id === value) ?? TYPE_FILTERS[0];
  const label = current.id === "all" ? "All users" : current.label;
  const icon =
    current.id === "all" ? (
      <Users className="w-[17px] h-[17px]" />
    ) : (
      <AccountTypeIcon type={current.id} size={17} />
    );
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-label="Filter by account type"
        aria-expanded={open}
        className="inline-flex h-[28px] items-center gap-[7px] font-display font-medium text-base @[576px]:text-lg uppercase tracking-[0.08em] text-ink hover:text-brand cursor-pointer transition-colors"
      >
        {icon}
        {label}
        <ChevronDown className="w-[15px] h-[15px]" />
      </button>
      {open && (
        <div
          role="listbox"
          style={room ? { maxWidth: room } : undefined}
          className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-[200px] bg-surface border border-line rounded-control shadow-popover py-[8px] sm:py-[4px]"
        >
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.id}
              role="option"
              aria-selected={t.id === value}
              onClick={() => {
                onChange(t.id);
                setOpen(false);
              }}
              className={`flex items-center gap-[8px] w-full text-left font-body text-sm px-[16px] sm:px-[12px] py-[16px] sm:py-[6px] cursor-pointer hover:bg-wash ${
                t.id === value ? "font-semibold text-brand" : "text-ink"
              }`}
            >
              <span className="w-[15px] shrink-0 flex items-center justify-center">
                {t.id === "all" ? (
                  <Users className="w-[15px] h-[15px]" />
                ) : (
                  <AccountTypeIcon type={t.id} />
                )}
              </span>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Opens a submission in place. The body is the same SubmissionEntry the feed
// renders, so the card a reader clicked is literally the card they get. Later
// this gets its own route; the modal is the step before that.
function SubmissionModal({
  t,
  accounts,
  subject,
  mode,
  onCosign,
  onClose,
}: {
  t: ConferenceSubmission;
  accounts: ConferenceAccount[];
  /** What this was filed on, for the header. */
  subject?: string;
  /** Which experiment opened it, so the modal reads the way the card does. */
  mode?: SubmissionMode | null;
  onCosign?: (id: string) => void;
  onClose: () => void;
}) {
  // Opened from a co-sign, this is the letter being signed, and the one thing
  // a reader arrives wanting to do with it is add their name. The card in the
  // feed says who already has; the modal has to say it too, or the act stops
  // at the door it was opened through.
  const signable =
    isCosign(mode) &&
    accounts.find((u) => u.id === t.userId)?.userType === "organization";
  return (
    <Modal
      onClose={onClose}
      title={
        <div className="flex items-center gap-[12px] flex-wrap">
          {/* No chip here. The card below carries it, next to the account that
              asked for it, and in the header it named a position without
              saying whose. */}
          {subject && (
            <p className="font-body font-normal text-xl text-ink">
              Input for Conference Committee on {subject}
            </p>
          )}
        </div>
      }
      headerActions={
        <button
          aria-label="Share this submission"
          className="text-ink-mid hover:text-ink cursor-pointer"
        >
          <Share className="w-[19px] h-[19px]" />
        </button>
      }
      footer={
        // Deliberately empty: the bar is here so its slots have somewhere to
        // go, and so the scroll behavior beneath it can be judged.
        <div className="h-[36px]" />
      }
      maxWidth="880px"
      minHeight="480px"
      mainMinWidth="600px"
      aside={
        // Everything that acts on this submission rather than being part of it.
        <>
          <div className="bg-surface rounded-control p-[16px]">
            {/* What the letter has already gathered, above the things a reader
              can do about it. A count with no way to join it is a fact; the
              two together are the offer. */}
            {signable && t.cosignCount ? (
              <p className="flex items-center gap-[7px] mb-[14px] pb-[14px] border-b border-line font-body text-sm text-ink-midheavy">
                <UsersRound
                  aria-hidden
                  className="w-[16px] h-[16px] shrink-0"
                />
                <span>
                  <span className="font-bold">{t.cosignCount}</span>{" "}
                  {t.cosignCount === 1
                    ? "constituent has"
                    : "constituents have"}{" "}
                  cosigned this
                </span>
              </p>
            ) : null}
            <p className="font-body font-semibold text-2xs text-ink-mid mb-[10px]">
              Actions
            </p>
            <div className="flex flex-col gap-[8px]">
              {/* First in the list, where the letter can be signed: it is what
                a reader who opened this from a co-sign came to do, and the
                two below are things done to an account rather than to what
                it filed. */}
              {signable && onCosign && (
                <button
                  onClick={() => {
                    onCosign(t.id);
                    onClose();
                  }}
                  className="w-full text-left font-body font-semibold text-sm text-brand hover:bg-wash rounded-control px-[8px] py-[6px] cursor-pointer"
                >
                  Cosign This
                </button>
              )}
              {["Follow This Account", "Report"].map((label) => (
                <button
                  key={label}
                  className="w-full text-left font-body font-semibold text-sm text-brand hover:bg-wash rounded-control px-[8px] py-[6px] cursor-pointer"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* On the ground below the card rather than inside it: these are
              facts about the letter, not things to do with it, and the card
              is where the doing lives.

              Set as sentences rather than as a label column. The aside is
              narrow, and a two-column list of labels and figures wrapped
              every label onto a second line to hold a column that only ever
              carried one digit. */}
          {signable && t.cosignCount ? (
            <div className="px-[16px] pt-[18px]">
              <p className="font-body font-semibold text-2xs text-ink-mid mb-[8px]">
                The signatures
              </p>
              <ul className="flex flex-col gap-[6px] font-body text-sm text-ink-mid">
                {t.cosignInDistrict ? (
                  <li>
                    <span className="font-bold text-ink">
                      {t.cosignInDistrict}
                    </span>{" "}
                    {t.cosignInDistrict === 1
                      ? "committee district"
                      : "committee districts"}
                  </li>
                ) : null}
                {t.cosignWithInput ? (
                  <li>
                    <span className="font-bold text-ink">
                      {t.cosignWithInput}
                    </span>{" "}
                    added their own words
                  </li>
                ) : null}
                {t.cosignLatest ? (
                  <li>Last cosigned {t.cosignLatest}</li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </>
      }
    >
      <div className="bg-surface rounded-control">
        <SubmissionEntry t={t} accounts={accounts} fullBody />
      </div>
    </Modal>
  );
}

/**
 * Everything filed on a conference, with the controls that narrow it.
 *
 * No composer of its own. The page owns the form, because filing on a conference
 * offers the weekly update to the conferees and a ballot question has no such
 * thing, and a second copy of the form in here would be a second set of four
 * positions to keep in step. What the feed can carry is the way in: `onAdd` puts
 * a plus at the end of the filter row and hands the press straight back out, the
 * way the panel's own header does.
 */
export function SubmissionFeed({
  items,
  accounts,
  subject,
  includeFollowingFilter = false,
  includeTypeFilter = false,
  stickyTop,
  pageSize,
  onAdd,
  addLabel = "Add",
  typeFilter: controlledType,
  onTypeFilterChange,
  filter: controlledFilter,
  onFilterChange,
  onCountChange,
  fresh = false,
  offerCosign = true,
  onFilteredChange,
  resetSignal = 0,
  onCosign,
  confereeSeats = [],
  map,
  summaryNote,
  heading,
  headingTop,
}: {
  items: ConferenceSubmission[];
  /** The roster these submissions were filed by. */
  accounts: ConferenceAccount[];
  /** What they were filed on, passed through to an opened submission. */
  subject?: string;
  /** Add the account-type dropdown ahead of the position chip. */
  includeTypeFilter?: boolean;
  /** When set, the filter bar pins at this offset while the feed scrolls. */
  stickyTop?: string;
  /** Show this many at a time and page through the rest, for a view with a
      fixed height. Unpaged when omitted. */
  pageSize?: number;
  /**
   * A way to file, at the end of the filter row. The feed does not know what
   * filing involves, so the press goes back to whoever mounted it; left off,
   * there is no plus, the way the panel leaves its own off without `onAdd`.
   */
  onAdd?: () => void;
  addLabel?: string;
  /** Add a "Following" toggle that narrows any position filter to accounts the
      viewer follows. */
  includeFollowingFilter?: boolean;
  /** Drive the account-type filter from outside, for pages that report on it
      somewhere the feed cannot reach. Uncontrolled when omitted. */
  typeFilter?: AccountTypeFilter;
  onTypeFilterChange?: (v: AccountTypeFilter) => void;
  /** Same, for the position filter. */
  filter?: PositionFilter;
  onFilterChange?: (v: PositionFilter) => void;
  /** How many entries the current filters leave on screen, for chrome outside
      the feed that wants to say so. */
  onCountChange?: (n: number) => void;
  /**
   * Whether co-signing is still available.
   *
   * Off once the reader has words of their own waiting, which the page knows
   * and the feed does not.
   */
  offerCosign?: boolean;
  /**
   * Something was filed a moment ago.
   *
   * The feed hands it to the letter that was signed, which counts itself up to
   * its new figure rather than arriving at it.
   */
  fresh?: boolean;
  /**
   * Whether anything is currently narrowing the list.
   *
   * Reported rather than inferred, because Following lives inside the feed and
   * a page holding only the position and type filters would think the list was
   * unfiltered while it was not.
   */
  onFilteredChange?: (filtered: boolean) => void;
  /** Bump to clear the filters the feed owns itself, so a page can reset a view
      it does not hold all the state for. */
  resetSignal?: number;
  /**
   * Put your name to an organisation's letter.
   *
   * Handed straight out to whoever mounted the feed, the same way `onAdd` is:
   * the feed knows which submission was pressed and nothing about what signing
   * one involves.
   */
  onCosign?: (id: string) => void;
  /** The six seats, for the filter that narrows to their own districts. */
  confereeSeats?: string[];
  /** Drawn above the filters: where the input on this came from. */
  map?: ReactNode;
  /** Drawn at the right of the summary's legend: the way in. */
  summaryNote?: ReactNode;
  /**
   * The section's own title, drawn in here rather than above.
   *
   * Taken over from the page so that the title, the map and the filters can
   * be one card: drawn where they belong, the title sits in a different
   * wrapper from the rest and no box can hold the three of them.
   */
  heading?: { title: string; action?: ReactNode };
  /** Where that title comes to rest. The filters stack under it. */
  headingTop?: string;
}) {
  const demo = useDemoMode();
  const path = useLocation().pathname;
  const endorsing = path.endsWith("/endorse");
  const reposting = path.endsWith("/repost");
  // A record built for one experiment only shows on that experiment's route.
  // Everything without a tag is the placeholder set and shows everywhere.
  // Declared above the ordering that reads it: the sort runs while the feed
  // is being built, so a state hook under it is reached before it exists.
  const [sort, setSort] = useState<SortKey>("new");
  // The three behind the mark at the end of the row.
  const [county, setCounty] = useState<string[]>([]);
  // On by default. Nothing is hidden: most co-signs are a name and nothing
  // else, and a feed that mixes them through buries the filings that have
  // something in them, so they go to the end instead of going away.
  // Off by default, and off is the feed's own order: the co-signs with
  // nothing written go last, because a feed that mixes them through buries the
  // filings that have something in them.
  //
  // Named for what ticking does rather than for what the default is, so the
  // resting state is the unticked one and the mark on Filters stays at nothing
  // until the reader has actually changed something.
  // Off, which is the feed's own order: the co-signs with nothing written go
  // last, because mixing them through buries the filings that have something
  // in them. Ticked, they fall back into date order with everything else.
  //
  // The label names the other ordering rather than this one, which is what
  // lets the resting state be unticked and still say where they are: not in
  // date order, so at the end.
  const [wordlessByDate, setWordlessByDate] = useState(false);
  const matching = items.filter(
    (t) => !t.demoFor || (demo && t.demoFor.includes(demo)),
  );
  /**
   * Newest first, where a letter is as new as the last name put to it.
   *
   * A co-sign lifts the thing it signs back up the feed, because somebody
   * standing behind a letter is news about that letter and not only about
   * them. Both kinds of name count: the ones published as their own entry,
   * and the ones that exist only as the count on the card.
   *
   * On the same day the filing goes above the co-sign. The co-sign is a second
   * reading of something already here, so it reads as the answer and belongs
   * under the thing it is answering.
   *
   * Only on the experiment routes. The committee page's own feed is ordered by
   * hand, grouped so that a filing and the replies to it stay together, and a
   * sort would pull those apart.
   */
  // "Just now" is a date like any other here, and the one the reader cares
  // about: without this it parses to NaN, their own entry sorts nowhere, and
  // the letter they signed is not lifted by the signing.
  const when = (d?: string) => {
    if (!d) return 0;
    const at = Date.parse(d);
    return Number.isNaN(at) ? Date.now() : at;
  };
  const lifted = new Map<string, number>();
  for (const t of matching) {
    if (!t.cosignOf) continue;
    lifted.set(t.cosignOf, Math.max(lifted.get(t.cosignOf) ?? 0, when(t.date)));
  }
  const rank = (t: ConferenceSubmission) =>
    Math.max(when(t.date), when(t.cosignLatest), lifted.get(t.id) ?? 0);
  const byRank = (a: ConferenceSubmission, b: ConferenceSubmission) =>
    rank(b) - rank(a) || (a.cosignOf ? 1 : 0) - (b.cosignOf ? 1 : 0);
  // Most cosigned puts the letters at the top, which is what a reader asking
  // that question wants. An entry nobody signed has nothing to be ordered by,
  // so those keep the date order underneath it.
  const order = (a: ConferenceSubmission, b: ConferenceSubmission) =>
    sort === "old"
      ? -byRank(a, b)
      : sort === "signed"
        ? (b.cosignCount ?? 0) - (a.cosignCount ?? 0) || byRank(a, b)
        : byRank(a, b);
  const forDemo = demo ? [...matching].sort(order) : matching;
  const [ownFilter, setOwnFilter] = useState<PositionFilter>("all");
  const filter = controlledFilter ?? ownFilter;
  const setFilter = onFilterChange ?? setOwnFilter;
  // Following is an overlay, not a position: it combines with every chip.
  const [followed, setFollowed] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  // Remember the value, not whether this is the first run. A boolean flag flips
  // on mount and then stays flipped, so anything that re-runs effects without
  // remounting (a hot reload, a StrictMode double-invoke) sees an already-used
  // flag and acts for no reason. Comparing values only ever fires when the
  // number actually moved.
  const lastReset = useRef(resetSignal);
  useEffect(() => {
    if (lastReset.current === resetSignal) return;
    lastReset.current = resetSignal;
    setFollowed([]);
    setPage(0);
  }, [resetSignal]);
  const openItem = forDemo.find((t) => t.id === openId);
  const [ownType, setOwnType] = useState<AccountTypeFilter>("all");
  const typeFilter = controlledType ?? ownType;

  const setTypeFilter = onTypeFilterChange ?? setOwnType;
  // The feed itself is masked so entries fade out in opacity as they rise
  // toward the pinned bar. The fade line is fixed to the viewport while the
  // feed scrolls, so its offset within the feed is recomputed on scroll and
  // handed to the mask as a CSS variable.
  const barRef = useRef<HTMLDivElement>(null);
  // The title's own height, so the filters know where to stop under it.
  const headRef = useRef<HTMLDivElement>(null);
  const [headH, setHeadH] = useState(0);
  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    const read = () => setHeadH(el.offsetHeight);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [heading]);
  const feedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = barRef.current;
    const feed = feedRef.current;
    if (!stickyTop || !bar || !feed) return;
    // The feed does not always scroll with the window. In the public-input panel
    // it sits in a scroller of its own, and there the sticky offset is measured
    // from that panel's top edge rather than from the viewport's.
    const scroller = (() => {
      for (let el = bar.parentElement; el; el = el.parentElement) {
        const oy = getComputedStyle(el).overflowY;
        if (oy === "auto" || oy === "scroll") return el;
      }
      return null;
    })();
    const onScroll = () => {
      const rect = bar.getBoundingClientRect();
      const feedTop = feed.getBoundingClientRect().top;
      feed.style.setProperty(
        "--fade-end",
        `${Math.max(0, rect.bottom - feedTop)}px`,
      );
      // Pinned, the bar is chrome over the list and wants to sit tight to it;
      // at rest it is a row in the page and wants the page's spacing. CSS has
      // no selector for "currently stuck", so the state is measured: the bar is
      // stuck once its top has reached the offset it sticks at, counted from
      // whatever it is actually sticking inside.
      const base = scroller ? scroller.getBoundingClientRect().top : 0;
      const stuckAt = base + (parseFloat(getComputedStyle(bar).top) || 0);
      const wasStuck = bar.dataset.stuck === "true";
      // Two thresholds, not one: it takes 2px of scroll to leave the stuck
      // state and none to enter it, so the boundary cannot flutter.
      const stuck = wasStuck
        ? rect.top <= stuckAt + 3
        : rect.top <= stuckAt + 1;
      bar.dataset.stuck = String(stuck);
      /**
       * A readout of the numbers this row is positioned by, for working out
       * why it sits differently pinned than at rest.
       *
       * Behind `?debug=sticky` and drawn into a corner of the page, because
       * the thing being measured only exists while the page is scrolling and
       * the measurement has to be taken from the same frame the reader is
       * looking at.
       */
      if (!new URLSearchParams(location.search).has("debug")) return;
      const head = document.querySelector("[data-band='input']");
      const headRect = head?.getBoundingClientRect();
      let out = document.getElementById("sticky-debug");
      if (!out) {
        out = document.createElement("pre");
        out.id = "sticky-debug";
        out.style.cssText =
          "position:fixed;right:8px;bottom:8px;z-index:9999;margin:0;padding:8px 10px;background:#141413;color:#fff;font:11px/1.5 ui-monospace,monospace;border-radius:6px;white-space:pre;pointer-events:none";
        document.body.appendChild(out);
      }
      out.textContent = [
        `stuck        ${stuck}`,
        `bar top css  ${getComputedStyle(bar).top}`,
        `bar rect top ${Math.round(rect.top)}`,
        `bar pad      ${getComputedStyle(bar).paddingTop} / ${getComputedStyle(bar).paddingBottom}`,
        headRect
          ? `head bottom  ${Math.round(headRect.bottom)}  (h ${Math.round(headRect.height)})`
          : "head         not found",
        headRect ? `gap         ${Math.round(rect.top - headRect.bottom)}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    };
    onScroll();
    // Capture, because a scroll event on an inner scroller does not bubble and
    // a window listener would never hear the panel move.
    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, [stickyTop]);

  // Nothing has been filed at all, which is a different thing from a filter
  // that matched nothing and wants a different answer.
  const nothingFiled = forDemo.length === 0;
  // The controls stay on an empty feed. Hiding them says the feed has no
  // filters rather than that it has nothing to filter, and a reader who
  // arrives to an empty panel should still be able to see what the filters are.
  const showFilters = nothingFiled || forDemo.length >= FEED_CONTROLS_MIN;
  // What a combination of the three controls would leave on screen. The
  // controls are guarded with it rather than the list being filtered and then
  // repaired: a change that would empty the feed is refused before it lands,
  // so the reader never sees a blank list and never has to work out which of
  // three controls to undo.
  const countFor = (
    position: PositionFilter,
    type: AccountTypeFilter,
    following: boolean,
  ) =>
    forDemo.filter((t) => {
      const user = accounts.find((u) => u.id === t.userId);
      if (position !== "all" && t.position !== position) return false;
      if (includeTypeFilter && type !== "all" && user?.userType !== type)
        return false;
      if (following && !user?.followedByViewer) return false;
      return true;
    }).length;
  const pickPosition = (v: PositionFilter) => setFilter(v);
  const pickType = (v: AccountTypeFilter) => setTypeFilter(v);
  const positionMatched =
    !showFilters || filter === "all"
      ? forDemo
      : forDemo.filter((t) => t.position === filter);
  /**
   * Narrowed to the accounts picked out of the ones being followed.
   *
   * None picked means everyone, the way no county picked means anywhere: a
   * list of checkboxes with nothing ticked is a filter that is not being
   * used, and it needs no separate switch to say so.
   */
  const filtered =
    showFilters && followed.length > 0
      ? positionMatched.filter((t) => followed.includes(t.userId))
      : positionMatched;
  const byType =
    showFilters && includeTypeFilter && typeFilter !== "all"
      ? filtered.filter(
          (t) =>
            accounts.find((u) => u.id === t.userId)?.userType === typeFilter,
        )
      : filtered;
  /**
   * A co-sign with no words of its own, held back until somebody asks for
   * people.
   *
   * Most co-signs are a name and nothing else, and a feed of them buries the
   * filings that have something in them: the count on the letter already says
   * how many there are. Asking for individuals is asking to see the people,
   * so that is where they appear.
   */
  /**
   * The county an account names at the end of its descriptor.
   *
   * Only where the last segment actually is one. An organisation's descriptor
   * ends "account, verified" and a placeholder's ends in its own words, and
   * taking the last segment from every account put both in the county list.
   */
  const countyOf = (t: ConferenceSubmission) => {
    const last =
      accounts
        .find((u) => u.id === t.userId)
        ?.descriptor.split(",")
        .pop()
        ?.trim() ?? "";
    return last.endsWith("County") ? last : "";
  };
  // Built from everything on this route, not from what the other controls
  // have left: turning Following on narrows the set to the two organisations,
  // which carry no county, and the list of places emptied under the reader.
  const counties = [...new Set(forDemo.map(countyOf).filter(Boolean))].sort();
  const countyCounts = forDemo.reduce<Record<string, number>>((all, t) => {
    const place = countyOf(t);
    if (place) all[place] = (all[place] ?? 0) + 1;
    return all;
  }, {});
  /** What is behind the mark, applied after the row's own controls. */
  const narrowed2 = byType.filter(
    (t) => county.length === 0 || county.includes(countyOf(t)),
  );
  // Every co-sign is a card, wordless ones included. They were folded into
  // the count before, which left the tally claiming signatures the list could
  // not show and hid the entry a reader had just filed themselves.
  //
  // The reader's own stands first whatever the controls say, and is taken from
  // the unfiltered set so that a sort, a county or a position cannot carry it
  // off: somebody looking for what they just filed should not have to work out
  // which control is hiding it. Everybody else sees it in its place, which the
  // card says on the card.
  // Everything stays in the list; the setting decides where the wordless
  // co-signs sit in it. A stable partition, so each half keeps the order the
  // sort gave it.
  const silent = (t: ConferenceSubmission) => !t.body && !!t.cosignOf;
  // Ticked, the wordless co-signs go to the end; each half keeps the order the
  // sort gave it. Unticked, there is no grouping at all and they fall back
  // into date order among everything else, which is where a reader looking for
  // one by date expects to find it.
  const mine = narrowed2.find((t) => t.id === OWN_ID);
  // Each individual can provide input or cosign one position. Once they have
  // done either, the offer is spent, so every card stops making it rather than
  // making one the page would have to refuse. A draft counts: words of their
  // own already written are the other half of the same choice.
  const filed = items.some((t) => t.id === OWN_ID) || !offerCosign;
  // Ticked, there is no grouping at all and they fall back into date order
  // among everything else, which is where a reader looking for one by date
  // expects to find it. Unticked, they go to the end, each half keeping the
  // order the sort gave it.
  const kept = wordlessByDate
    ? narrowed2
    : [...narrowed2.filter((t) => !silent(t)), ...narrowed2.filter(silent)];
  // The reader's own stands first and answers to none of it. Taken from the
  // unfiltered set, so no control can carry off the thing they just filed.
  const shown = kept;
  // Following stays on the row whatever else is set, guarded rather than
  // withdrawn: a control the reader turned on should not vanish under them, so
  // it is always there and simply declines to empty the feed.
  const anyFollowed = accounts.some((u) => u.followedByViewer);
  // Not on the seventh, where the map stands at the right of the row and a
  // chip pinned to that edge lands under it.
  const followingChip =
    isCosign(demo) &&
    demo !== "cosign7" &&
    includeFollowingFilter &&
    anyFollowed;

  // Paged, the feed fits a fixed height instead of scrolling inside one. The
  // page is clamped rather than reset, so narrowing the list while on a later
  // page lands on the last one that still has entries instead of an empty view.
  // Reported rather than recomputed outside: the feed is the only place that
  // knows all three filters, Following included.
  const count = shown.length;
  useEffect(() => {
    onCountChange?.(count);
  }, [count, onCountChange]);

  const narrowed =
    showFilters &&
    (filter !== "all" || typeFilter !== "all" || followed.length > 0);
  useEffect(() => {
    onFilteredChange?.(narrowed);
  }, [narrowed, onFilteredChange]);

  const pageCount = pageSize
    ? Math.max(1, Math.ceil(shown.length / pageSize))
    : 1;
  const current = Math.min(page, pageCount - 1);
  const paged = pageSize
    ? shown.slice(current * pageSize, current * pageSize + pageSize)
    : shown;

  // Where the filters come to rest: under the title when the feed is carrying
  // one, under whatever the page has pinned otherwise.
  const barTop = heading
    ? `calc(${headingTop ?? "0px"} + ${headH}px)`
    : stickyTop;

  // The seventh stands the map in a column beside the list rather than over
  // it. `contents` everywhere else, so the wrapper is not in the layout at all
  // on the readings that have no column.
  const aside = demo === "cosign7" && map;

  return (
    <div className={aside ? "@container flex items-start gap-[24px]" : ""}>
      <div className={aside ? "min-w-0 flex-1" : "contents"}>
        {/* The title, the map and the filters as one card, where the feed has
          been handed the title. The card ends under the filters: the entries
          below are cards of their own and a box around all of it would be a
          box inside a box. */}
        {heading && (
          <div className="rounded-card border border-line bg-surface overflow-hidden mb-[16px]">
            <div
              ref={headRef}
              style={headingTop ? { top: headingTop } : undefined}
              className="sticky z-[9] flex items-start justify-between gap-[20px] bg-surface px-[20px] pt-[16px] pb-[12px]"
            >
              <h2 className="font-display font-medium text-xl sm:text-2xl tracking-display text-ink">
                {heading.title}
              </h2>
              {heading.action && (
                <div className="shrink-0">{heading.action}</div>
              )}
            </div>
            {map && <div className="px-[20px] pb-[4px]">{map}</div>}
          </div>
        )}
        {/* Stuck, the bar needs the page colour behind it and a gap beneath, or
          white submission cards scroll flush against the white filter card. */}
        {showFilters && (
          <div
            ref={barRef}
            style={barTop ? { top: barTop } : undefined}
            className={
              barTop
                ? /* The paint behind the row has to match whatever it is pinned
                   over, because the cards scroll underneath it. `--band` is
                   what a filled section sets for exactly this, so the row
                   follows the card it is in and falls back to the page where
                   there is no card. */
                  /* One padding in both states. It used to shrink on
                     pinning, which meant the block was one height in flow and
                     another stuck, and the page it was tightened against had
                     to be tightened by a margin that only applies in flow:
                     the two disagreed and the row sprang open as it pinned. */
                  "sticky z-[8] bg-[var(--band,var(--color-ground))] pt-[10px] pb-[16px]"
                : "mb-[16px]"
            }
          >
            {/* The fifth reading had the map as a card of its own above the
              row, parked while the sixth tries it as part of the section's
              own header. Put the condition back to see it there again. */}
            {false && map && <div className="mb-[16px]">{map}</div>}
            {/* One row above the cards: the two pickers on the left, Following
              pinned right. Following is an overlay on whatever they set rather
              than a third way to narrow, so it sits apart.

              Wrapping, because the row is four controls wide and the feed is
              drawn in a panel and on a phone as well as in the page's own
              column. */}
            <div className="@container flex flex-wrap items-center gap-x-[12px] gap-y-[8px] mb-[12px]">
              {includeTypeFilter && (
                <AccountTypePicker value={typeFilter} onChange={pickType} />
              )}
              <PositionPicker value={filter} onChange={pickPosition} />
              {/* The right end. Following first, then the way to add one: the plus
                narrows nothing at all, so it sits past the control that does,
                and that puts it in the same corner of the same row the panel's
                own header keeps it in. */}
              {/* At the end of the row, holding everything that does not
                  earn a pill of its own. Following moved inside it: it is a
                  switch rather than a way into a list, and beside two pickers
                  it was a third kind of control saying so. */}
              {/* The committee page carries it too, without the co-sign
                  section: nothing in that feed is a co-sign to order. */}
              {(isPlain(demo) || !demo) && (
                <div className="ml-auto">
                  <MoreFilters
                    sort={sort}
                    onSort={setSort}
                    county={county}
                    onCounty={setCounty}
                    counties={counties}
                    countyCounts={countyCounts}
                    followed={followed}
                    onFollowed={setFollowed}
                    followable={
                      includeFollowingFilter
                        ? accounts.filter((u) => u.followedByViewer)
                        : []
                    }
                    wordless={wordlessByDate}
                    onWordless={setWordlessByDate}
                    cosigns={isCosign(demo)}
                    set={
                      (county.length === 0 ? 0 : 1) +
                      (followed.length === 0 ? 0 : 1) +
                      // Counted once it is off its default, like the two
                      // above it: the reader has changed what the feed does
                      // and the mark is how a shut panel says so.
                      (wordlessByDate ? 1 : 0)
                    }
                  />
                </div>
              )}
              {onAdd && (
                <div
                  className={`shrink-0 flex items-center gap-[10px] ${
                    followingChip ? "" : "ml-auto"
                  }`}
                >
                  {onAdd && (
                    <Hint text={addLabel} className="shrink-0 inline-block">
                      <button
                        onClick={onAdd}
                        aria-label={addLabel}
                        // The panel's own plus takes a gray wash, because it
                        // sits on the panel's chrome. This one sits in the page,
                        // where the way in should look like the thing it opens.
                        className="block p-[6px] rounded-control text-ink-mid hover:bg-brand hover:text-ink-inverse cursor-pointer transition-colors"
                      >
                        <Plus className="w-[18px] h-[18px]" />
                      </button>
                    </Hint>
                  )}
                </div>
              )}
            </div>
            {/* And under the row, the shape of what is left after it. Below
              rather than above because it reports the result of the controls
              rather than introducing them. */}
            {/* Counted before the wordless co-signs are held back, because the
                bar is a summary of what was filed rather than of what the
                list is currently showing. */}
            {/* Not on the tenth, which is the ninth with the shape of the
                input taken off the row entirely. */}
            {isPlain(demo) && demo !== "cosign10" && (
              <InputSummary items={byType} note={summaryNote} />
            )}
          </div>
        )}

        {shown.length > 0 ? (
          <>
            <div
              ref={feedRef}
              style={
                stickyTop
                  ? {
                      maskImage:
                        "linear-gradient(to bottom, transparent calc(var(--fade-end, 0px) - 44px), #000 var(--fade-end, 0px))",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, transparent calc(var(--fade-end, 0px) - 44px), #000 var(--fade-end, 0px))",
                    }
                  : undefined
              }
              className="flex flex-col gap-[20px]"
            >
              {paged.map((t) => (
                <div
                  key={t.id}
                  /* The lightest of the three shadows, one pixel of lift. In a
                   white section the cards' own border is the only thing
                   holding them apart; a touch of shadow does it without a
                   second line. */
                  className="bg-surface rounded-control border border-line shadow-raised"
                >
                  <SubmissionEntry
                    // Sharing draws the letter itself. The record that carried
                    // it supplies only the name on top, so nothing of the
                    // sharer's own words is shown: they wrote none.
                    t={
                      (endorsing &&
                        t.cosignOf &&
                        items.find((x) => x.id === t.cosignOf)) ||
                      t
                    }
                    accounts={accounts}
                    onOpen={setOpenId}
                    endorsedBy={
                      endorsing && t.cosignOf
                        ? accounts.find((u) => u.id === t.userId)?.name
                        : undefined
                    }
                    // Only where the experiment is being built, and only with
                    // somewhere for the press to go.
                    onCosign={demo && !filed ? onCosign : undefined}
                    mode={demo}
                    yours={!!mine?.cosignOf && mine.cosignOf === t.id}
                    fresh={fresh}
                    quoted={(() => {
                      // Both readings draw the letter the same way. What differs
                      // between them is the press that made it, not the record
                      // it left behind.
                      if (!(isCosign(demo) || reposting) || !t.cosignOf)
                        return undefined;
                      const of = items.find((x) => x.id === t.cosignOf);
                      const who =
                        of && accounts.find((u) => u.id === of.userId);
                      return of && who ? { account: who, of } : undefined;
                    })()}
                  />
                </div>
              ))}
            </div>
            {pageSize && pageCount > 1 && (
              <Pagination
                page={current}
                pageCount={pageCount}
                onPage={setPage}
              />
            )}
          </>
        ) : (
          // No invitation to file from in here. A conference takes no testimony of
          // its own, so the page's own form is the only place that offers it, and
          // an empty result can only offer a way back out of the filters.
          <div className="border-[1.5px] border-dashed border-line-strong rounded-panel p-[22px] text-center bg-surface">
            <p className="font-body font-semibold text-lg text-ink mb-[4px]">
              {nothingFiled
                ? "No public input yet"
                : "Nothing matches these filters"}
            </p>
            <p className="font-body text-sm text-ink-mid leading-[1.5] max-w-[560px] mx-auto">
              {nothingFiled
                ? "No public input has been submitted yet."
                : "Try widening your selection to see more input on this topic."}
            </p>
            {/* Nothing to clear when nothing was filed: the filters are not why
              the feed is empty. */}
            {!nothingFiled && (
              <div className="flex justify-center mt-[14px]">
                <button
                  onClick={() => {
                    setFilter("all");
                    setTypeFilter("all");
                    setFollowed([]);
                  }}
                  className="bg-surface border border-brand text-brand font-body font-semibold text-sm px-[18px] py-[8px] rounded-pill cursor-pointer hover:bg-brand-soft/60"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
        {openItem && (
          <SubmissionModal
            t={openItem}
            accounts={accounts}
            subject={subject}
            mode={demo}
            onCosign={demo && !filed ? onCosign : undefined}
            onClose={() => setOpenId(null)}
          />
        )}
      </div>
      {/* Beside the list, and staying put while it scrolls: the map is about
          the whole set, so it should not leave the screen when a reader goes
          looking through it. Hidden where the column would squeeze the cards,
          since the list is the thing being read. */}
      {aside && (
        <aside className="hidden @[860px]:block w-[300px] shrink-0 sticky top-[88px]">
          {map}
        </aside>
      )}
    </div>
  );
}
