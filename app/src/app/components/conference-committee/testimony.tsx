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

import { useState, useRef, useEffect } from "react";
import {
  X,
  ChevronDown,
  MoreVertical,
  UserPlus,
  Flag,
  FileText,
  Plus,
  Users,
  Share,
} from "lucide-react";
import { ClampedText, FilterChip, Modal, Pagination } from "../ballot";
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
function EntryActions({ name }: { name: string }) {
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
        className="flex items-center justify-center w-[30px] h-[30px] rounded-control text-ink-muted hover:text-ink hover:bg-wash cursor-pointer transition-colors"
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
            { label: "View submission", Icon: FileText },
            { label: "Share", Icon: Share },
            { label: "Follow user", Icon: UserPlus },
            { label: "Report submission", Icon: Flag },
          ].map(({ label, Icon }) => (
            <button
              key={label}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-[9px] w-full text-left font-body text-sm text-ink px-[12px] py-[7px] cursor-pointer hover:bg-wash"
            >
              <Icon className="w-[15px] h-[15px] shrink-0 text-ink-muted" />
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
 * One threshold, 360px of card:
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
 * Why 360: the panel's own narrowest card is 364px, its 400px resting width less
 * the 18px of padding on each side, so every width the panel can be dragged to
 * keeps the layout that ships today. A phone puts the card between about 300 and
 * 355 and gets the compact header. If DRAWER_MIN or --rail-pad in the page ever
 * move, this number has to be checked against them again.
 */
export function SubmissionEntry({
  t,
  accounts,
  onOpen,
  fullBody = false,
  actions = true,
}: {
  t: ConferenceSubmission;
  /** The roster `t.userId` resolves against. */
  accounts: ConferenceAccount[];
  /** Click-through to the submission's own page (routing wired later). */
  onOpen?: (id: string) => void;
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
}) {
  const user = accounts.find((u) => u.id === t.userId);
  if (!user) return null;
  return (
    // `@container` makes the card its own containment context, which also makes
    // it a stacking context: the kebab's menu can no longer paint over the card
    // below this one the way it did while the card was only `relative`. So a
    // card holding an open menu lifts above its neighbours, which is the one
    // thing the container type took away.
    <div className="@container relative p-[20px] rounded-control [&:has([role=menu])]:z-10">
      {/* Narrow, the avatar sits against the top of the name block rather than
          centred on it: there is a truncated name and a descriptor there, and
          centring a 40px disc on two lines of text leaves it floating. */}
      <div className="relative flex items-start @[360px]:items-center gap-[14px] @[360px]:gap-[18px]">
        <AccountAvatar account={user} />
        <div className="flex-1 min-w-0">
          {/* Name, type and position wrap inside their own box; the date sits
              outside it so it always holds the top-right corner. */}
          <div className="flex items-center gap-[6px]">
            <div className="flex-1 min-w-0">
              {/* One line while the card is narrow, where a name, an icon and a
                  chip wrapping into three rows costs more height than the body
                  they sit above. Over the threshold it wraps as it always has. */}
              <p className="flex items-end gap-[6px] @[360px]:flex-wrap font-body font-semibold text-base text-ink leading-none">
                {/* Plain text for now. The name should be a link to the
                  submission's own page, and it will be an anchor when that page
                  exists; a button that opens a modal is not that, and dressing
                  it as a link before there is a URL behind it teaches the wrong
                  thing about what clicking a name does. `onOpen` is kept so the
                  wiring is here when the route is. */}
                {/* The name is what gives way, so the icon and the chip beside it
                    never land on a line of their own. The whole name is in the
                    title while it is cut. */}
                <span
                  title={user.name}
                  // No leading under the letters, so the name's box ends where
                  // the letters do and everything on this line can share one
                  // bottom edge. Descenders still paint; they simply do not
                  // reserve space that pushes the glyph and the chip up.
                  className="min-w-0 truncate leading-none @[360px]:overflow-visible @[360px]:whitespace-normal"
                >
                  {user.name}
                </span>
                {/* Flush with the name and the chip: one bottom edge for the
                    three of them, with the space under it coming from the
                    line below rather than from the name's own leading. */}
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
                <span className="flex shrink-0">
                  <PositionChip position={t.position} />
                </span>
              </p>
              {/* Inside the name's own cell, not below the whole row: it
                  describes the account, so it belongs to the name, and the date
                  should centre against the pair rather than against the name
                  alone. */}
              <p className="font-body text-xs text-ink-faint leading-[1.4] mt-[8px]">
                {user.descriptor}
              </p>
            </div>
            {/* The corner. Narrow it holds the kebab alone, and nothing at all
                on the review step, which has no kebab: the date has gone to the
                foot of the card and an empty cell would still be taking the
                gap beside the name. */}
            <div
              className={`shrink-0 self-start items-center gap-[2px] -mt-[5px] -mr-[6px] ${
                actions ? "flex" : "hidden"
              }`}
            >
              {actions && <EntryActions name={user.name} />}
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
        <div aria-hidden className="hidden @[360px]:block w-[40px] shrink-0" />
        <div className="flex-1 min-w-0 pt-[12px] @[360px]:pt-[8px] @[360px]:pr-[12px] pb-[4px] @[360px]:pb-[8px]">
          {fullBody ? (
            <p className="font-body text-base text-ink leading-[1.55] whitespace-pre-line">
              {t.body}
            </p>
          ) : (
            // A step smaller while the card is narrow, so six lines still hold
            // a readable amount of what was filed. Line breaks are kept, the
            // same as the unclamped body above: the clamp is meant to shorten
            // what somebody wrote, not to re-set it as one paragraph.
            <ClampedText
              text={t.body}
              className="font-body text-sm @[360px]:text-base text-ink leading-[1.55] whitespace-pre-line"
            />
          )}
          {/* Narrow, the card closes on what the header could not hold: the
              position on the left, the date on the right, one line. */}
          <div className="flex items-center justify-end mt-[12px]">
            <span className="font-body text-xs text-ink-muted whitespace-nowrap">
              {t.date}
            </span>
          </div>
        </div>
      </div>
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
  { id: "legislator", label: "Legislators" },
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
          current ? "pr-[4px]" : ""
        }`}
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
            current ? "pl-[9px] pr-[7px]" : "pl-[11px] pr-[10px]"
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
              className="w-[13px] h-[13px] text-ink-muted"
            />
          )}
        </button>
        {current && (
          // Swapping is the likelier next move than clearing, so the pill's body
          // opens the others and this only clears.
          <button
            onClick={() => onChange("all")}
            aria-label={`Clear the ${current.short} filter`}
            className="relative z-10 flex items-center justify-center w-[26px] h-[26px] rounded-full text-ink-muted hover:text-ink hover:bg-wash-strong cursor-pointer transition-colors"
          >
            <X aria-hidden className="w-[13px] h-[13px]" />
          </button>
        )}
      </div>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-[236px] bg-surface border border-line rounded-control shadow-popover py-[4px]"
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
              className={`flex items-center w-full text-left font-body text-sm px-[12px] py-[6px] cursor-pointer hover:bg-wash ${
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
          className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-[200px] bg-surface border border-line rounded-control shadow-popover py-[4px]"
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
              className={`flex items-center gap-[8px] w-full text-left font-body text-sm px-[12px] py-[6px] cursor-pointer hover:bg-wash ${
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
  onClose,
}: {
  t: ConferenceSubmission;
  accounts: ConferenceAccount[];
  /** What this was filed on, for the header. */
  subject?: string;
  onClose: () => void;
}) {
  return (
    <Modal
      onClose={onClose}
      title={
        <div className="flex items-center gap-[12px] flex-wrap">
          {/* The position as the chip the card carries, not as a mark of its
              own: three of the four share the thumbs up, so a ringed glyph here
              would name one of three and the reader would have to guess which.
              It says what was asked for; the card below says who asked. */}
          <PositionChip position={t.position} />
          {subject && (
            <p className="font-body font-normal text-xl text-ink">{subject}</p>
          )}
        </div>
      }
      headerActions={
        <button
          aria-label="Share this submission"
          className="text-ink-muted hover:text-ink cursor-pointer"
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
        <div className="bg-surface rounded-control p-[16px]">
          <p className="font-body font-semibold text-2xs text-ink-muted mb-[10px]">
            Actions
          </p>
          <div className="flex flex-col gap-[8px]">
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
  onFilteredChange,
  resetSignal = 0,
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
}) {
  const [ownFilter, setOwnFilter] = useState<PositionFilter>("all");
  const filter = controlledFilter ?? ownFilter;
  const setFilter = onFilterChange ?? setOwnFilter;
  // Following is an overlay, not a position: it combines with every chip.
  const [followingOnly, setFollowingOnly] = useState(false);
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
    setFollowingOnly(false);
    setPage(0);
  }, [resetSignal]);
  const openItem = items.find((t) => t.id === openId);
  const [ownType, setOwnType] = useState<AccountTypeFilter>("all");
  const typeFilter = controlledType ?? ownType;
  const setTypeFilter = onTypeFilterChange ?? setOwnType;
  // The feed itself is masked so entries fade out in opacity as they rise
  // toward the pinned bar. The fade line is fixed to the viewport while the
  // feed scrolls, so its offset within the feed is recomputed on scroll and
  // handed to the mask as a CSS variable.
  const barRef = useRef<HTMLDivElement>(null);
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
      bar.dataset.stuck = String(
        wasStuck ? rect.top <= stuckAt + 3 : rect.top <= stuckAt + 1,
      );
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
  const nothingFiled = items.length === 0;
  // The controls stay on an empty feed. Hiding them says the feed has no
  // filters rather than that it has nothing to filter, and a reader who
  // arrives to an empty panel should still be able to see what the filters are.
  const showFilters = nothingFiled || items.length >= FEED_CONTROLS_MIN;
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
    items.filter((t) => {
      const user = accounts.find((u) => u.id === t.userId);
      if (position !== "all" && t.position !== position) return false;
      if (includeTypeFilter && type !== "all" && user?.userType !== type)
        return false;
      if (following && !user?.followedByViewer) return false;
      return true;
    }).length;
  // Each control commits only if something survives it. Refusing the move is
  // the same thing as undoing it the instant it empties the list, and it keeps
  // whatever the reader set before, including Following.
  const pickPosition = (v: PositionFilter) => {
    if (countFor(v, typeFilter, followingOnly) > 0) setFilter(v);
  };
  const pickType = (v: AccountTypeFilter) => {
    if (countFor(filter, v, followingOnly) > 0) setTypeFilter(v);
  };
  const toggleFollowing = () => {
    const next = !followingOnly;
    if (countFor(filter, typeFilter, next) > 0) setFollowingOnly(next);
  };
  const positionMatched =
    !showFilters || filter === "all"
      ? items
      : items.filter((t) => t.position === filter);
  const filtered =
    showFilters && followingOnly
      ? positionMatched.filter(
          (t) => accounts.find((u) => u.id === t.userId)?.followedByViewer,
        )
      : positionMatched;
  const shown =
    showFilters && includeTypeFilter && typeFilter !== "all"
      ? filtered.filter(
          (t) =>
            accounts.find((u) => u.id === t.userId)?.userType === typeFilter,
        )
      : filtered;
  // Following stays on the row whatever else is set, guarded rather than
  // withdrawn: a control the reader turned on should not vanish under them, so
  // it is always there and simply declines to empty the feed.
  const anyFollowed = accounts.some((u) => u.followedByViewer);

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
    showFilters && (filter !== "all" || typeFilter !== "all" || followingOnly);
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

  return (
    <div>
      {/* Stuck, the bar needs the page colour behind it and a gap beneath, or
          white submission cards scroll flush against the white filter card. */}
      {showFilters && (
        <div
          ref={barRef}
          style={stickyTop ? { top: stickyTop } : undefined}
          className={
            stickyTop
              ? "sticky z-[8] bg-ground pt-[16px] pb-[16px] data-[stuck=true]:pt-[10px] data-[stuck=true]:pb-[8px]"
              : "mb-[16px]"
          }
        >
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
            {onAdd && (
              <div className="ml-auto shrink-0 flex items-center gap-[10px]">
                {/*
                {includeFollowingFilter && anyFollowed && (
                  <FilterChip
                    active={followingOnly}
                    ariaPressed={followingOnly}
                    onClick={toggleFollowing}
                    title={
                      followingOnly
                        ? "Clear the Following filter"
                        : "Only accounts you follow"
                    }
                    className="inline-flex items-center gap-[5px]"
                  >
                    Following
                    {followingOnly && <X className="w-[12px] h-[12px]" />}
                  </FilterChip>
                )}
                */}
                {onAdd && (
                  <button
                    onClick={onAdd}
                    aria-label={addLabel}
                    title={addLabel}
                    // The panel's own plus takes a gray wash, because it sits
                    // on the panel's chrome. This one sits in the page, where
                    // the way in should look like the thing it opens.
                    className="shrink-0 p-[6px] rounded-control text-ink-muted hover:bg-brand hover:text-ink-inverse cursor-pointer transition-colors"
                  >
                    <Plus className="w-[18px] h-[18px]" />
                  </button>
                )}
              </div>
            )}
          </div>
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
                className="bg-surface rounded-control border border-line"
              >
                <SubmissionEntry t={t} accounts={accounts} onOpen={setOpenId} />
              </div>
            ))}
          </div>
          {pageSize && pageCount > 1 && (
            <Pagination page={current} pageCount={pageCount} onPage={setPage} />
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
              : "Nothing filed matches these filters"}
          </p>
          <p className="font-body text-sm text-ink-muted leading-[1.5] max-w-[560px] mx-auto">
            {nothingFiled
              ? "Nothing has been filed on this conference yet."
              : "Try widening your selection to see what has been filed."}
          </p>
          {/* Nothing to clear when nothing was filed: the filters are not why
              the feed is empty. */}
          {!nothingFiled && (
            <div className="flex justify-center mt-[14px]">
              <button
                onClick={() => {
                  setFilter("all");
                  setTypeFilter("all");
                  setFollowingOnly(false);
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
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
