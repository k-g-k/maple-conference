// Submitted-testimony UI. Each entry is renderable standalone (everything comes
// from the testimony record + its account), anticipating per-testimony URLs.

import { useState, useRef, useEffect, useMemo } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  UserPlus,
  Flag,
  FileText,
  Users,
  Plus,
  Share,
  ArrowUpRight,
} from "lucide-react";
import { Card, FilterChip, Modal, Pagination } from "../ballot";
import type { DescriptorMode } from "../ballot";
import { UserAvatar, UserTypeIcon, StanceChip, STANCE_CHIP } from "./accounts";
import { EndorseIcon, OpposeIcon, NeutralIcon } from "./stance-icons";
import {
  RC,
  POSITION_USERS,
  testimonyFor,
  type TestimonyItem,
  type TestimonyStance,
  type PositionUser,
  type PositionUserType,
} from "../../data/tax-rebate-62f";

// Body text capped at six lines with an inline "Show more". A hidden measurer
// binary-searches the longest prefix that, with "… Show more" appended, still
// fits six lines at the current width; recomputed on resize.
function ClampedBody({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [cutoff, setCutoff] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const m = measureRef.current;
    if (!wrap || !m) return;
    const compute = () => {
      m.style.width = `${wrap.clientWidth}px`;
      const maxH = parseFloat(getComputedStyle(m).lineHeight) * 6 + 2;
      m.textContent = text;
      if (m.scrollHeight <= maxH) {
        setCutoff(null);
        return;
      }
      let lo = 0;
      let hi = text.length;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        m.textContent = text.slice(0, mid).trimEnd() + "… Show more";
        if (m.scrollHeight <= maxH) lo = mid;
        else hi = mid - 1;
      }
      setCutoff(lo);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [text]);

  const collapsed = !expanded && cutoff !== null;
  return (
    <div ref={wrapRef}>
      <p
        ref={measureRef}
        aria-hidden="true"
        className="font-body text-base leading-[1.55] absolute invisible pointer-events-none"
      />
      <p className="font-body text-base text-ink leading-[1.55]">
        {collapsed ? `${text.slice(0, cutoff).trimEnd()}… ` : `${text} `}
        {cutoff !== null && (
          <button
            onClick={(e) => {
              // Keep expand/collapse from triggering the row's click-through.
              e.stopPropagation();
              setExpanded((x) => !x);
            }}
            className="font-body font-semibold text-sm text-brand hover:text-alert cursor-pointer"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </p>
    </div>
  );
}

export function TestimonyEntry({
  t,
  accounts = POSITION_USERS,
  showTypeIcon = true,
  showDescriptor = true,
  onOpen,
  fullBody = false,
  hideAvatar = false,
}: {
  t: TestimonyItem;
  /**
   * The roster a submission's `userId` resolves against. Defaults to the 62F
   * question's accounts, so every existing call site is unchanged; a page whose
   * testimony belongs to a different record (a conference committee, say) hands
   * in its own roster rather than having its accounts added to this question's.
   */
  accounts?: PositionUser[];
  showTypeIcon?: boolean;
  showDescriptor?: DescriptorMode;
  /** Click-through to the testimony's own page (routing wired later). */
  onOpen?: (id: string) => void;
  /**
   * Render the body whole, without the six-line clamp and its Show more.
   * Used where the testimony is the point rather than one of a list.
   */
  fullBody?: boolean;
  /** Omit the avatar, for views that already show it above the card. */
  hideAvatar?: boolean;
}) {
  const user = accounts.find((u) => u.id === t.userId);
  if (!user) return null;
  const showDesc =
    showDescriptor === true ||
    (showDescriptor === "officials" && user.userType !== "organization");
  return (
    <div className="relative p-[20px] rounded-control">
      <div className="relative flex items-center gap-[18px]">
        {!hideAvatar && <UserAvatar user={user} />}
        <div className="flex-1 min-w-0">
          {/* Name, type and stance wrap inside their own box; the date sits
              outside it so it always holds the top-right corner. */}
          <div className="flex items-center gap-[6px]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[6px] flex-wrap">
                {/* Plain text for now. The name should be a link to the
                  testimony's own page, and it will be an anchor when that page
                  exists; a button that opens a modal is not that, and dressing
                  it as a link before there is a URL behind it teaches the wrong
                  thing about what clicking a name does. `onOpen` is kept so the
                  wiring is here when the route is. */}
                <p className="font-body font-semibold text-base text-ink leading-[1.3]">
                  {user.name}
                </p>
                {showTypeIcon && <UserTypeIcon type={user.userType} />}
                {t.stance !== "no-position" && <StanceChip stance={t.stance} />}
              </div>
              {/* Inside the name's own cell, not below the whole row: it
                  describes the account, so it belongs to the name, and the date
                  should centre against the pair rather than against the name
                  alone. */}
              {showDesc && (
                <p className="font-body text-xs text-ink-faint leading-[1.4] mt-[1px]">
                  {user.descriptor}
                </p>
              )}
            </div>
            <div className="shrink-0 self-start flex items-center gap-[2px] -mt-[5px] -mr-[6px]">
              <span className="font-body text-xs text-ink-mid whitespace-nowrap mr-[2px]">
                {t.date}
              </span>
              <EntryActions name={user.name} />
            </div>
          </div>
        </div>
      </div>
      {/* The body sits in the same two-column frame the header does, with an
          empty cell where the avatar is, so its first character lands under the
          name rather than under the avatar. A spacer rather than a left
          padding, because it is the avatar's own width and should change when
          that does. */}
      <div className="flex gap-[18px]">
        {!hideAvatar && <div aria-hidden className="w-[40px] shrink-0" />}
        <div className="flex-1 min-w-0 pt-[8px] pr-[12px] pb-[8px]">
          {fullBody ? (
            <p className="font-body text-base text-ink leading-[1.55] whitespace-pre-line">
              {t.body}
            </p>
          ) : (
            <ClampedBody text={t.body} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Per-entry actions. A kebab rather than more visible buttons: following an
 * account and reporting a statement are both rare next to reading one, and a
 * row of controls beside every date would compete with the testimony itself.
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
              the statement, this one opens it. Inert for now, until there is
              a route for a single piece of testimony. */}
          {[
            { label: "View testimony", Icon: FileText },
            { label: "Share", Icon: Share },
            { label: "Follow user", Icon: UserPlus },
            { label: "Report testimony", Icon: Flag },
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

export function TestimonyList({
  items,
  accounts,
  showTypeIcon = true,
  showDescriptor = true,
}: {
  items: TestimonyItem[];
  /** Passed through to each entry; see TestimonyEntry. */
  accounts?: PositionUser[];
  showTypeIcon?: boolean;
  showDescriptor?: DescriptorMode;
}) {
  return (
    <div>
      {items.map((t, i) => (
        <div key={t.id} className="mb-[14px] last:mb-0">
          {i > 0 && (
            <div className="border-t border-dotted border-line-strong mb-[14px]" />
          )}
          <TestimonyEntry
            t={t}
            accounts={accounts}
            showTypeIcon={showTypeIcon}
            showDescriptor={showDescriptor}
          />
        </div>
      ))}
    </div>
  );
}

// Filter chips appear only once the feed reaches FEED_CONTROLS_MIN.
const FEED_CONTROLS_MIN = 4;
export type StanceFilter = "all" | "endorsing" | "opposing" | "no-position";
// Rendered as a segmented control, so "All" is a real segment: stance is
// one-of, and an empty segmented control reads as broken where a pill does not.
type Stance = Exclude<StanceFilter, "all">;
const STANCE_FILTERS: {
  id: StanceFilter;
  label: string;
  /** Shown in place of the label in the parked segmented control. */
  glyph?: string;
}[] = [
  { id: "all", label: "All" },
  { id: "endorsing", label: "Supporting", glyph: "\u{1F44D}" },
  { id: "opposing", label: "Opposing", glyph: "\u{1F44E}" },
  { id: "no-position", label: "Neutral" },
];

// EXPERIMENT: the same three positions as bare glyphs rather than a control.
// No border, no fill; the selected one is at full strength and the rest sit
// back, so the row reads as three marks instead of three buttons.
const STANCE_GLYPHS: {
  id: Stance;
  label: string;
  /** What the glyph means, spelled out. The label is for prose ("Endorsing
      Testimony"); this is for the tooltip and the accessible name. */
  tip: string;
  /** Optical offset. A transform rather than padding, so it moves what you see
      without moving anything around it. One value per glyph, used in every
      state, so selecting one never makes it jump. Empty where the artwork
      already sits right. */
  chipOffset?: string;
  glyph: string;
}[] = [
  {
    id: "endorsing",
    label: "Supporting",
    tip: "Supports",
    glyph: "\u{1F44D}",
  },
  {
    id: "opposing",
    label: "Opposing",
    tip: "Opposes",
    chipOffset: "translate-y-[2px]",
    glyph: "\u{1F44E}",
  },
  {
    id: "no-position",
    label: "Neutral",
    tip: "Neutral",
    glyph: "\u{1F4AC}",
  },
];

export type TypeFilter = "all" | PositionUserType;

const TYPE_FILTERS: { id: TypeFilter; label: string; word?: string }[] = [
  { id: "all", label: "All Accounts" },
  { id: "individual", label: "Individuals", word: "Individual" },
  { id: "organization", label: "Organizations", word: "Organization" },
  { id: "government", label: "Gov Officials", word: "Gov" },
  { id: "legislator", label: "Legislators", word: "Legislator" },
];

// Single-select account-type chooser. A dropdown rather than more pills so the
// row does not read as one undifferentiated set of toggles: the shape says
// "pick one of these", where a pill says "on or off".
function TypeFilterMenu({
  value,
  onChange,
}: {
  value: TypeFilter;
  onChange: (v: TypeFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  const current = TYPE_FILTERS.find((t) => t.id === value) ?? TYPE_FILTERS[0];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-[5px] font-body font-semibold text-xs px-[10px] py-[4px] rounded-pill border cursor-pointer transition-colors bg-brand-soft border-brand-edge text-brand-ink"
      >
        {current.id === "all" ? (
          <Users className="w-[13px] h-[13px]" />
        ) : (
          <UserTypeIcon type={current.id} size={13} />
        )}
        {current.label}
        <ChevronDown className="w-[12px] h-[12px]" />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-[190px] bg-surface border border-line rounded-control shadow-popover py-[4px]"
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
                  <UserTypeIcon type={t.id} />
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

// The stance filter as a dropdown, for widths where the four-segment control
// no longer fits. Same shape and behavior as TypeFilterMenu so the two read as
// a pair when both are collapsed.
function StanceFilterMenu({
  value,
  onChange,
}: {
  value: StanceFilter;
  onChange: (v: StanceFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  const current =
    STANCE_FILTERS.find((t) => t.id === value) ?? STANCE_FILTERS[0];
  // Standing alone in a dropdown, "All" has nothing to be all of. In the
  // segmented control the other three segments supply that context.
  const label = (t: (typeof STANCE_FILTERS)[number]) =>
    t.id === "all" ? "All Positions" : t.label;
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-[5px] font-body font-semibold text-xs px-[10px] py-[4px] rounded-pill border cursor-pointer transition-colors bg-brand-soft border-brand-edge text-brand-ink"
      >
        {label(current)}
        <ChevronDown className="w-[12px] h-[12px]" />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-[160px] bg-surface border border-line rounded-control shadow-popover py-[4px]"
        >
          {STANCE_FILTERS.map((t) => (
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
              {label(t)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// The stance as a large mark for the modal header, borrowing the chip's own
// colors so the two agree at a glance.
// Outline in the chip's text color, filled with the chip's border color: a
// lighter tone of the same hue, so the shape stays readable at badge size.
// The stance as a mark for the modal header. The icon and the ring take the
// same color, so the mark reads as one thing rather than a badge on a circle.
// Oppose is orange here rather than the chip's red: against the endorse green,
// orange separates far better for the common red-green color blindness. The
// chips keep their own reds, since there the word carries the meaning.
const STANCE_MARK: Record<
  TestimonyStance,
  { Icon: typeof EndorseIcon; hex: string }
> = {
  endorse: { Icon: EndorseIcon, hex: "var(--color-positive-ink)" },
  oppose: { Icon: OpposeIcon, hex: "var(--color-caution-ink)" },
  "no-position": { Icon: NeutralIcon, hex: "var(--color-ink-mid)" },
};

// Opens a testimony in place. The body is the same TestimonyEntry the feed
// renders, so the card a reader clicked is literally the card they get. Later
// this gets its own route; the modal is the step before that.
function TestimonyModal({
  t,
  accounts = POSITION_USERS,
  showTypeIcon,
  showDescriptor,
  onClose,
}: {
  t: TestimonyItem;
  accounts?: PositionUser[];
  showTypeIcon?: boolean;
  showDescriptor?: DescriptorMode;
  onClose: () => void;
}) {
  const user = accounts.find((u) => u.id === t.userId);
  return (
    <Modal
      onClose={onClose}
      title={
        <div className="flex items-center gap-[12px]">
          {/* The stance alone, ringed in its own colour. The account's logo is
              in the card below, so this says what was said, not who said it. */}
          {(() => {
            const { Icon, hex } = STANCE_MARK[t.stance];
            return (
              <div
                // Inline width: Tailwind reads a bare border-[…] as a color,
                // so an arbitrary pixel width compiles to nothing.
                style={{ borderColor: hex, color: hex, borderWidth: 3 }}
                className="w-[40px] h-[40px] shrink-0 rounded-full border-solid bg-surface flex items-center justify-center"
              >
                <Icon className="h-[18px] w-auto" />
              </div>
            );
          })()}
          <p className="font-body font-normal text-xl text-ink">
            Ballot Question {RC.number} - {RC.title}
          </p>
        </div>
      }
      headerActions={
        <button
          aria-label="Share this testimony"
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
        // Everything that acts on this testimony rather than being part of it.
        <div className="bg-surface rounded-control p-[16px]">
          <p className="font-body font-semibold text-2xs text-ink-mid mb-[10px]">
            Actions
          </p>
          <div className="flex flex-col gap-[8px]">
            {["Follow This Account", "Add Your Perspective", "Report"].map(
              (label) => (
                <button
                  key={label}
                  className="w-full text-left font-body font-semibold text-sm text-brand hover:bg-wash rounded-control px-[8px] py-[6px] cursor-pointer"
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>
      }
    >
      <div className="bg-surface rounded-control">
        <TestimonyEntry
          t={t}
          accounts={accounts}
          showTypeIcon={showTypeIcon}
          showDescriptor={showDescriptor}
          fullBody
        />
      </div>
    </Modal>
  );
}

// ── Composing ─────────────────────────────────────────────────────────────
//
// One form, three places: a modal over the page, the testimony rail in place of
// the feed, and a page of its own for anyone who wants the room. The fields are
// written once and the shell is what differs, so the three cannot drift into
// three slightly different forms.
//
// Nothing submits. This is the form, not the plumbing.

const COMPOSE_CHOICES: { id: TestimonyStance; label: string }[] = [
  { id: "endorse", label: "I support it" },
  { id: "oppose", label: "I oppose it" },
  { id: "no-position", label: "No position" },
];

const COMPOSE_PROMPT =
  "What do you want lawmakers and other voters to know about this question?";

export const COMPOSE_TITLE = `Add your perspective on Ballot Question ${RC.number}`;

/** The rules of the road. Beside the form where there is room, above it where there is not. */
export function ComposeGuidance({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col gap-[16px]">
      <div className={compact ? "" : "bg-surface rounded-control p-[20px]"}>
        <p className="font-body font-semibold text-2xs text-ink-mid mb-[8px]">
          Before you post
        </p>
        <ul className="list-disc list-outside pl-[16px] space-y-[8px] font-body text-xs text-ink-mid leading-[1.5] marker:text-ink-faint">
          <li>
            Write in your own words. MAPLE does not edit or rank what you say.
          </li>
          <li>Posting is public and stays attached to your account.</li>
          <li>You can revise it later; earlier versions stay on the record.</li>
        </ul>
      </div>
      {/* Both sit on the panel's grey rather than in cards: they point off this
          form rather than being part of it. */}
      <a
        href="https://www.mapletestimony.org/learn/writing-effective-testimony"
        target="_blank"
        rel="noopener noreferrer"
        className={`font-body text-xs text-ink-mid hover:text-brand ${compact ? "" : "px-[16px]"}`}
      >
        Testimony writing tips
      </a>
      <button
        className={`text-left font-body text-xs text-ink-mid hover:text-brand cursor-pointer ${compact ? "" : "px-[16px]"}`}
      >
        View our code of conduct
      </button>
    </div>
  );
}

/**
 * The fields themselves: where you stand, and what you want to say.
 *
 * `rows` is the one thing the callers set, because the amount of room differs
 * and the textarea should use what there is rather than a fixed guess.
 */
export function ComposeFields({
  stance,
  onStanceChange,
  rows = 10,
  grow = false,
  bare = false,
}: {
  stance: TestimonyStance;
  onStanceChange: (s: TestimonyStance) => void;
  rows?: number;
  /** Let the textarea take the height it is given instead of counting rows. */
  grow?: boolean;
  /**
   * Drop the card around the fields, for a surface that is already white. A
   * white card on a white panel is a container around a container.
   */
  bare?: boolean;
}) {
  return (
    <div
      className={`${bare ? "" : "bg-surface rounded-control p-[20px]"} ${
        grow ? "flex flex-col flex-1 min-h-0" : ""
      }`}
    >
      <p className="font-body font-semibold text-2xs text-ink-mid mb-[8px]">
        Your position
      </p>
      <div className="flex gap-[8px] flex-wrap mb-[20px]">
        {COMPOSE_CHOICES.map(({ id, label }) => {
          const { Icon } = STANCE_MARK[id];
          const c = STANCE_CHIP[id];
          const on = stance === id;
          return (
            <button
              key={id}
              onClick={() => onStanceChange(id)}
              aria-pressed={on}
              // Selected, it wears the same colors the chip on a posted
              // testimony will, so the choice previews its own result.
              className={`inline-flex items-center gap-[8px] rounded-control border px-[14px] py-[8px] font-body font-semibold text-sm cursor-pointer transition-colors ${
                on
                  ? `${c.bg} border-line-strong ${c.tx}`
                  : "bg-surface border-line-strong text-ink-mid hover:bg-wash"
              }`}
            >
              <Icon className="h-[16px] w-auto" />
              {label}
            </button>
          );
        })}
      </div>

      <textarea
        rows={grow ? undefined : rows}
        placeholder={COMPOSE_PROMPT}
        className={`w-full resize-none border border-line-strong rounded-control p-[12px] font-body text-base text-ink leading-[1.55] placeholder:text-ink-mid focus:outline-none focus:border-brand ${
          grow ? "flex-1 min-h-0" : ""
        }`}
      />
    </div>
  );
}

/** Cancel and post, for whichever shell is holding the form. */
export function ComposeActions({
  onCancel,
  cancelLabel = "Cancel",
}: {
  onCancel: () => void;
  cancelLabel?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-[12px]">
      <button
        onClick={onCancel}
        className="font-body font-semibold text-sm text-ink-mid hover:text-ink cursor-pointer px-[8px] py-[8px]"
      >
        {cancelLabel}
      </button>
      <button className="bg-brand text-ink-inverse font-body font-semibold text-sm px-[18px] py-[8px] rounded-control cursor-pointer hover:bg-brand-hover">
        Review and Post
      </button>
    </div>
  );
}

/**
 * The form in a narrow column, for a feed that lives in a panel.
 *
 * The guidance moves above the fields rather than beside them, because there is
 * no beside. It is set quiet and left open: it is three short lines, and a
 * collapsed version of something that short is a control standing in for less
 * text than the control itself.
 */
function ComposeInline({
  onClose,
  composeHref,
}: {
  onClose: () => void;
  composeHref?: string;
}) {
  const [stance, setStance] = useState<TestimonyStance>("endorse");
  return (
    // Exactly the panel's height, so the panel does not scroll. A form taller
    // than its container put three scrolls on top of each other: the page
    // behind, the panel around, and the textarea within. The textarea takes
    // whatever height is left, so the only thing that scrolls is the thing you
    // are writing.
    <div className="h-full flex flex-col gap-[16px] min-h-0">
      <div className="shrink-0 flex items-baseline justify-between gap-[12px]">
        <p className="font-body font-normal text-lg text-ink">
          Add your perspective
        </p>
        {composeHref && (
          // A narrow column is fine for a paragraph and tight for an argument.
          // The page is the same form with room, so the offer is a link rather
          // than a different feature.
          <a
            href={composeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-[4px] font-body font-semibold text-xs text-brand-ink hover:text-brand"
          >
            More room
            <ArrowUpRight className="w-[12px] h-[12px]" />
          </a>
        )}
      </div>
      <div className="shrink-0">
        <ComposeGuidance compact />
      </div>
      <ComposeFields stance={stance} onStanceChange={setStance} grow />
      <div className="shrink-0">
        <ComposeActions onCancel={onClose} cancelLabel="Back" />
      </div>
    </div>
  );
}

function AddPerspectiveModal({ onClose }: { onClose: () => void }) {
  const [stance, setStance] = useState<TestimonyStance>("endorse");
  return (
    <Modal
      onClose={onClose}
      maxWidth="860px"
      minHeight="520px"
      mainMinWidth="520px"
      asideFirst
      footer={<ComposeActions onCancel={onClose} />}
      title={
        <p className="font-body font-normal text-xl text-ink">
          {COMPOSE_TITLE}
        </p>
      }
      aside={<ComposeGuidance />}
    >
      <ComposeFields stance={stance} onStanceChange={setStance} />
    </Modal>
  );
}

/**
 * The account-type picker, sitting beside the heading rather than inside it.
 * It names its own selection and changes nothing else: the heading is a
 * heading, and this is the control next to it.
 */
/**
 * The three positions as bare glyphs. Exported so a page can put it beside its
 * own heading rather than inside the feed's controls.
 */
export function PositionPicker({
  value,
  onChange,
  locked = false,
}: {
  value: StanceFilter;
  onChange: (v: StanceFilter) => void;
  /** State the position without offering to change or clear it. */
  locked?: boolean;
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

  const current = STANCE_GLYPHS.find((g) => g.id === value);

  // Locked and set: the glyph and the word, and nothing else. No chip, no
  // clear, no menu, because the view was opened at this position deliberately.
  if (locked) {
    if (!current) return null;
    return (
      <p className="flex h-[34px] items-center gap-[8px]">
        <span
          aria-hidden
          className={`flex h-full items-center text-[20px] leading-none drop-shadow-[0_1px_1px_rgba(20,20,19,0.12)] ${
            current.chipOffset ?? ""
          }`}
        >
          {current.glyph}
        </span>
        <span className="flex h-full items-center font-body font-semibold text-sm leading-none text-ink whitespace-nowrap">
          {current.tip}
        </span>
      </p>
    );
  }

  // Nothing chosen: three labeled options, each one a direct pick.
  if (!current) {
    return (
      // Held at the selected chip's height, so picking one does not change the
      // row's height and step everything beside it down. No gap between the
      // options either: the buttons' own padding does the spacing, and they
      // stay edge to edge so the wash shows exactly where each one begins.
      <div
        role="group"
        aria-label="Filter by position"
        className="flex h-[34px] items-center"
      >
        {STANCE_GLYPHS.map(({ id, tip, glyph, chipOffset }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-label={tip}
            className="flex h-full items-center gap-0 @[666px]:gap-[8px] px-[9px] rounded-pill hover:bg-wash cursor-pointer transition-colors duration-150"
          >
            <span
              aria-hidden
              className={`flex h-full items-center text-[20px] leading-none drop-shadow-[0_1px_1px_rgba(20,20,19,0.12)] ${
                chipOffset ?? ""
              }`}
            >
              {glyph}
            </span>
            {/* Three labelled options are the widest thing on this row, so
                in a narrow column the words go and the gap goes with them.
                Measured against the row itself rather than the window, since
                the row is narrow in the rail while the window is not. The glyph
                carries the meaning once you have seen it labelled, and the
                button's aria-label keeps the name for a screen reader. The
                selected chip keeps its word at every width: that one is
                stating the filter you are looking at. */}
            <span
              aria-hidden
              className="hidden @[666px]:flex h-full items-center font-body font-semibold text-sm leading-none text-ink whitespace-nowrap"
            >
              {tip}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Chosen: the chip states the filter and carries two different actions. Its
  // body opens the other positions, because swapping is the likelier next move
  // than clearing; the X on the end clears, with its own round hover so the
  // two targets are legible before you commit to one.
  return (
    <div ref={ref} className="relative">
      {/* The wash lives on the chip, so anywhere on it lights the whole shape.
          The X then stacks its own round wash on top of that, which is how it
          reads as a second target inside the first rather than as a hole in
          it. */}
      <div className="relative flex items-center h-[34px] pr-[4px] rounded-pill border border-line hover:bg-wash transition-colors">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Position: ${current.tip}. Change`}
          className="flex h-full items-center gap-[8px] pl-[8px] pr-[7px] rounded-l-pill cursor-pointer"
        >
          {/* Each centred on the chip rather than sharing a baseline, so the
              word lines up with the X on the other end instead of following
              wherever the glyph's baseline falls. The glyph then carries its
              own optical offset, because that is a property of the artwork and
              nothing structural can derive it. */}
          <span
            aria-hidden
            className={`flex h-full items-center text-[20px] leading-none drop-shadow-[0_1px_1px_rgba(20,20,19,0.12)] ${
              current.chipOffset ?? ""
            }`}
          >
            {current.glyph}
          </span>
          <span className="flex h-full items-center font-body font-semibold text-sm leading-none text-ink whitespace-nowrap">
            {current.tip}
          </span>
        </button>
        <button
          onClick={() => onChange("all")}
          aria-label={`Clear the ${current.label} filter`}
          className="relative z-10 flex items-center justify-center w-[26px] h-[26px] rounded-full text-ink-mid hover:text-ink hover:bg-wash-strong cursor-pointer transition-colors"
        >
          <X aria-hidden className="w-[13px] h-[13px]" />
        </button>
      </div>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-[190px] bg-surface border border-line rounded-control shadow-popover py-[4px]"
        >
          {/* Only the alternatives. The chip already names what is selected, so
              listing it again offers a choice that changes nothing. */}
          {STANCE_GLYPHS.filter((g) => g.id !== value).map(
            ({ id, tip, glyph, chipOffset }) => (
              <button
                key={id}
                role="option"
                aria-selected={false}
                onClick={() => {
                  onChange(id);
                  setOpen(false);
                }}
                className="flex items-center gap-[10px] w-full text-left font-body text-sm text-ink px-[12px] py-[6px] cursor-pointer hover:bg-wash"
              >
                <span
                  aria-hidden
                  className={`flex h-[22px] items-center text-[20px] leading-none ${
                    chipOffset ?? ""
                  }`}
                >
                  {glyph}
                </span>
                {tip}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export function AccountTypePicker({
  value,
  onChange,
  locked = false,
}: {
  value: TypeFilter;
  onChange: (v: TypeFilter) => void;
  /** State the filter without offering to change it. */
  locked?: boolean;
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
      <UserTypeIcon type={current.id} size={17} />
    );
  // Locked, it is a statement rather than a control: no chevron, no hover, and
  // not focusable, so nothing about it suggests it can be changed.
  if (locked) {
    return (
      <p className="shrink-0 inline-flex h-[28px] items-center gap-[7px] font-display font-medium text-base @[576px]:text-lg uppercase tracking-[0.08em] text-ink">
        {icon}
        {label}
      </p>
    );
  }
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
                  <UserTypeIcon type={t.id} />
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

export function TestimonyFeed({
  items,
  accounts = POSITION_USERS,
  showTypeIcon = true,
  showDescriptor = true,
  includeFollowingFilter = false,
  initialFilter = "all",
  initialTypeFilter = "all",
  asCards = false,
  includeTypeFilter = false,
  title,
  stickyTop,
  hideAddButton = false,
  lockTypeFilter = false,
  pageSize,
  composeSignal = 0,
  typeFilter: controlledType,
  onTypeFilterChange,
  filter: controlledFilter,
  onFilterChange,
  onCountChange,
  onFilteredChange,
  resetSignal = 0,
  composeMode = "modal",
  composeHref,
}: {
  items: TestimonyItem[];
  /**
   * The roster these submissions were filed by. Defaults to the 62F question's
   * accounts, so the ballot pages are unchanged; the feed reaches for the
   * roster on every name, type filter and Following check, so a page with its
   * own record supplies it here once rather than in each of those places.
   */
  accounts?: PositionUser[];
  showTypeIcon?: boolean;
  showDescriptor?: DescriptorMode;
  /** Render each entry in its own card instead of as rows inside one. */
  asCards?: boolean;
  /** Add the account-type dropdown ahead of the stance chips. */
  includeTypeFilter?: boolean;
  /** Heading rendered inline at the head of the filter row. */
  title?: string;
  /** When set, the filter bar pins at this offset while the feed scrolls. */
  stickyTop?: string;
  /** Drop the bar's own add button, for pages that put one somewhere better. */
  hideAddButton?: boolean;
  /** State the account type without offering to change it, for a view opened
      on one kind of account. The position filter stays live, so a reader can
      still move between endorsing and opposing inside it. */
  lockTypeFilter?: boolean;
  /** Show this many at a time and page through the rest, for a view with a
      fixed height. Unpaged when omitted. */
  pageSize?: number;
  /** Bump to open the compose modal from outside the feed. Same pattern as the
      Maple leaf's nudge: a counter rather than a boolean, so repeat requests
      still register. */
  composeSignal?: number;
  /** Add a "Following" toggle that narrows any stance filter to accounts the
      viewer follows. */
  includeFollowingFilter?: boolean;
  /** Stance filter to open with (e.g. when arriving from a Vote card). */
  initialFilter?: StanceFilter;
  /** Account-type filter to open with, alongside `initialFilter`. */
  initialTypeFilter?: TypeFilter;
  /** Drive the account-type filter from outside, for pages that render
      AccountTypePicker somewhere the feed cannot reach. Uncontrolled when
      omitted. */
  typeFilter?: TypeFilter;
  onTypeFilterChange?: (v: TypeFilter) => void;
  /** Same, for the position filter. */
  filter?: StanceFilter;
  onFilterChange?: (v: StanceFilter) => void;
  /** How many entries the current filters leave on screen, for chrome outside
      the feed that wants to say so. */
  onCountChange?: (n: number) => void;
  /**
   * Whether anything is currently narrowing the list.
   *
   * Reported rather than inferred, because Following lives inside the feed and
   * a page holding only the stance and type filters would think the list was
   * unfiltered while it was not.
   */
  onFilteredChange?: (filtered: boolean) => void;
  /** Bump to clear the filters the feed owns itself. Same counter pattern as
      `composeSignal`: the page can reset a view it does not hold all the state
      for. */
  resetSignal?: number;
  /**
   * Where composing happens.
   *
   * "modal" (default) opens the form over the page. "inline" puts it where the
   * feed is, for a feed that already lives in a panel of its own: a modal over
   * a testimony rail dims the perspectives the reader opened it to answer,
   * which is the wrong way round.
   */
  composeMode?: "modal" | "inline";
  /** Where the form's own page lives, for the "open in a new tab" link. */
  composeHref?: string;
}) {
  const [ownFilter, setOwnFilter] = useState<StanceFilter>(initialFilter);
  const filter = controlledFilter ?? ownFilter;
  const setFilter = onFilterChange ?? setOwnFilter;
  // Following is an overlay, not a stance: it combines with every stance chip.
  const [followingOnly, setFollowingOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  // Remember the value, not whether this is the first run. A boolean flag flips
  // on mount and then stays flipped, so anything that re-runs effects without
  // remounting (a hot reload, a StrictMode double-invoke) sees an already-used
  // flag and opens the composer for no reason. Comparing values only ever fires
  // when the number actually moved.
  const lastSignal = useRef(composeSignal);
  useEffect(() => {
    if (lastSignal.current === composeSignal) return;
    lastSignal.current = composeSignal;
    setComposing(true);
  }, [composeSignal]);
  const lastReset = useRef(resetSignal);
  useEffect(() => {
    if (lastReset.current === resetSignal) return;
    lastReset.current = resetSignal;
    setFollowingOnly(false);
    setPage(0);
  }, [resetSignal]);
  const openItem = items.find((t) => t.id === openId);
  const [ownType, setOwnType] = useState<TypeFilter>(initialTypeFilter);
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
    // The feed does not always scroll with the window. In the testimony rail it
    // sits in a panel with its own scroller, and there the sticky offset is
    // measured from that panel's top edge rather than from the viewport's.
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
    // a window listener would never hear the rail move.
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
  // arrives to an empty rail should still be able to see what the filters are.
  const showFilters = nothingFiled || items.length >= FEED_CONTROLS_MIN;
  // What a combination of the three controls would leave on screen. The
  // controls are guarded with it rather than the list being filtered and then
  // repaired: a change that would empty the feed is refused before it lands,
  // so the reader never sees a blank list and never has to work out which of
  // three controls to undo.
  const countFor = (
    stance: StanceFilter,
    type: TypeFilter,
    following: boolean,
  ) =>
    items.filter((t) => {
      const user = accounts.find((u) => u.id === t.userId);
      if (stance !== "all") {
        const want =
          stance === "endorsing"
            ? "endorse"
            : stance === "opposing"
              ? "oppose"
              : "no-position";
        if (t.stance !== want) return false;
      }
      if (includeTypeFilter && type !== "all" && user?.userType !== type)
        return false;
      if (following && !user?.followedByViewer) return false;
      return true;
    }).length;
  // Each control commits only if something survives it. Refusing the move is
  // the same thing as undoing it the instant it empties the list, and it keeps
  // whatever the reader set before, including Following.
  const pickStance = (v: StanceFilter) => {
    if (countFor(v, typeFilter, followingOnly) > 0) setFilter(v);
  };
  const pickType = (v: TypeFilter) => {
    if (countFor(filter, v, followingOnly) > 0) setTypeFilter(v);
  };
  const toggleFollowing = () => {
    const next = !followingOnly;
    if (countFor(filter, typeFilter, next) > 0) setFollowingOnly(next);
  };
  const stanceMatched =
    !showFilters || filter === "all"
      ? items
      : items.filter((t) => {
          if (filter === "endorsing") return t.stance === "endorse";
          if (filter === "opposing") return t.stance === "oppose";
          return t.stance === "no-position";
        });
  const filtered =
    showFilters && followingOnly
      ? stanceMatched.filter(
          (t) => accounts.find((u) => u.id === t.userId)?.followedByViewer,
        )
      : stanceMatched;
  const shown =
    showFilters && includeTypeFilter && typeFilter !== "all"
      ? filtered.filter(
          (t) =>
            accounts.find((u) => u.id === t.userId)?.userType === typeFilter,
        )
      : filtered;
  // Following stays on the row whatever else is set. It used to be withdrawn
  // when the narrowed list held nobody followed, which meant a control the
  // reader had turned on could vanish under them; it is guarded now instead,
  // so it is always there and simply declines to empty the feed.
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

  // Composing in place takes the whole surface rather than sitting above the
  // feed. Half a narrow column each would make both worse, and the reading that
  // matters happens before you start writing, not while.
  if (composing && composeMode === "inline") {
    return (
      <ComposeInline
        onClose={() => setComposing(false)}
        composeHref={composeHref}
      />
    );
  }

  return (
    <div>
      {/* Stuck, the bar needs the page colour behind it and a gap beneath, or
          white testimony cards scroll flush against the white filter card. */}
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
          <div className={asCards ? "" : ""}>
            {/* One row above the cards: the two pickers on the left, Following
                pinned right. Following is an overlay on whatever they set
                rather than a third way to narrow, so it sits apart. */}
            <div className="@container flex items-center gap-[12px] mb-[12px]">
              <AccountTypePicker
                value={typeFilter}
                onChange={pickType}
                locked={lockTypeFilter}
              />
              <PositionPicker value={filter} onChange={pickStance} />
              {/* Following and the action are one group pinned to the end of
                  the row, with their own spacing. Held together rather than
                  laid out as two more items in the filter row, so a wider
                  account picker or a selected position moves the filters on the
                  left without moving this pair or the gap inside it. */}
              <div className="ml-auto shrink-0 flex items-center gap-[8px]">
                {includeFollowingFilter && anyFollowed && (
                  // Following is an overlay on whatever else is set rather than
                  // another way to narrow by position or account, so it reads
                  // better here than as the last item among the chips.
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
                {!hideAddButton && (
                  <button
                    onClick={() => setComposing(true)}
                    className="shrink-0 inline-flex items-center gap-[5px] font-body font-semibold text-xs px-[10px] py-[4px] rounded-control border border-brand bg-brand text-ink-inverse hover:bg-brand-hover hover:border-brand-hover cursor-pointer transition-colors"
                  >
                    <Plus className="w-[13px] h-[13px]" />
                    {/* Two labels, one shown at a time: at narrow widths the
                        row needs the space more than the sentence. */}
                    <span className="@max-[946px]:hidden">
                      Add Your Perspective
                    </span>
                    <span className="hidden @max-[946px]:inline">Add</span>
                  </button>
                )}
              </div>
            </div>
            {/* Parked: the narrowing row that sat closest to the cards.
                Account type moved up to the picker and Following with it,
                so this held only the superseded stance controls. */}
            {false && (
              <div className="flex min-h-[30px] items-center gap-[6px] flex-wrap">
                <div className="flex items-center gap-[6px]">
                  {includeTypeFilter && (
                    <>
                      <TypeFilterMenu value={typeFilter} onChange={pickType} />
                      <span
                        aria-hidden="true"
                        className="text-line-strong select-none mx-[2px]"
                      >
                        |
                      </span>
                    </>
                  )}
                  {/* Parked: the original position picker, a segmented
                      control at width and a dropdown below 1191px. The glyph
                      row above replaces it.

                  <div className="min-[1191px]:hidden">
                    <StanceFilterMenu value={filter} onChange={pickStance} />
                  </div>
                  <div
                    role="group"
                    aria-label="Filter by stance"
                    className="hidden min-[1191px]:inline-flex items-center rounded-pill border border-line-strong overflow-hidden"
                  >
                    {STANCE_FILTERS.map(({ id, label, glyph }) => (
                      <button
                        key={id}
                        onClick={() => pickStance(id)}
                        aria-pressed={filter === id}
                        aria-label={glyph ? label : undefined}
                        title={glyph ? label : undefined}
                        className={`font-body font-semibold text-xs px-[12px] py-[4px] cursor-pointer transition-colors border-l border-line first:border-l-0 ${
                          filter === id
                            ? "bg-brand-soft text-brand-ink"
                            : "text-ink-mid hover:bg-wash"
                        }`}
                      >
                        {glyph ? (
                          <span aria-hidden className="text-base leading-none">
                            {glyph}
                          </span>
                        ) : (
                          label
                        )}
                      </button>
                    ))}
                  </div>
                  */}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {shown.length > 0 ? (
        <>
          {asCards ? (
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
                  <TestimonyEntry
                    t={t}
                    accounts={accounts}
                    showTypeIcon={showTypeIcon}
                    showDescriptor={showDescriptor}
                    onOpen={setOpenId}
                  />
                </div>
              ))}
            </div>
          ) : (
            <TestimonyList
              items={paged}
              accounts={accounts}
              showTypeIcon={showTypeIcon}
              showDescriptor={showDescriptor}
            />
          )}
          {pageSize && pageCount > 1 && (
            <Pagination page={current} pageCount={pageCount} onPage={setPage} />
          )}
        </>
      ) : (
        // Individuals is the one empty result a visitor can act on themselves,
        // so it keeps the invitation; every other empty result only offers a
        // way back out of the filters.
        <div className="border-[1.5px] border-dashed border-line-strong rounded-panel p-[22px] text-center bg-surface">
          <p className="font-body font-semibold text-lg text-ink mb-[4px]">
            {nothingFiled
              ? "No testimony yet"
              : typeFilter === "individual"
                ? "No individual testimony yet"
                : "No testimony matches these filters"}
          </p>
          <p className="font-body text-sm text-ink-mid leading-[1.5] max-w-[560px] mx-auto">
            {nothingFiled
              ? "Nobody has written about this yet. Yours would be the first on the record."
              : typeFilter === "individual"
                ? "No residents have submitted testimony on this question yet. Be among the first to add your perspective."
                : "Try widening your selection to see submissions on this question."}
          </p>
          <div className="flex gap-[10px] justify-center mt-[14px] flex-wrap">
            {(nothingFiled || typeFilter === "individual") && (
              <button
                onClick={() => setComposing(true)}
                className="bg-brand text-ink-inverse font-body font-semibold text-sm px-[18px] py-[8px] rounded-pill cursor-pointer hover:bg-brand-hover"
              >
                Add Your Perspective
              </button>
            )}
            {/* Nothing to clear when nothing was filed: the filters are not
                why the feed is empty. */}
            {!nothingFiled && (
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
            )}
          </div>
        </div>
      )}
      {composing && <AddPerspectiveModal onClose={() => setComposing(false)} />}
      {openItem && (
        <TestimonyModal
          t={openItem}
          accounts={accounts}
          showTypeIcon={showTypeIcon}
          showDescriptor={showDescriptor}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

// Testimony from followed accounts — an infinite carousel showing one entry at
// a time, starting at a random one, with edge chevrons. Every entry is also an
// invisible sizer stacked in the same grid cell so the container holds the
// tallest (collapsed) height and cycling never shifts layout.
export function FollowedTestimonyCard() {
  const items = useMemo(
    () => testimonyFor((u) => Boolean(u.followedByViewer)),
    [],
  );
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * Math.max(1, items.length)),
  );
  if (items.length === 0) return null;
  const current = index % items.length;
  const step = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + items.length) % items.length);
  return (
    <Card
      title="Featured Testimony"
      subtitle="Testimony of the organizations, officials, and individuals that you follow on MAPLE."
    >
      {/* Chevrons sit at the card edges and stretch the full height of the row
          for a large click target; the entry is width-capped and centered. */}
      <div className="flex items-stretch gap-[10px]">
        <button
          onClick={() => step(-1)}
          aria-label="Previous testimony"
          className="text-ink hover:text-alert hover:bg-wash cursor-pointer shrink-0 self-stretch flex items-center px-[14px] rounded-control"
        >
          <ChevronLeft className="w-[18px] h-[18px]" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="max-w-[760px] mx-auto grid">
            {items.map((t) => (
              <div
                key={t.id}
                aria-hidden="true"
                className="col-start-1 row-start-1 invisible pointer-events-none"
              >
                <TestimonyEntry t={t} showDescriptor="officials" />
              </div>
            ))}
            <div key={items[current].id} className="col-start-1 row-start-1">
              <TestimonyEntry t={items[current]} showDescriptor="officials" />
            </div>
          </div>
        </div>

        <button
          onClick={() => step(1)}
          aria-label="Next testimony"
          className="text-ink hover:text-alert hover:bg-wash cursor-pointer shrink-0 self-stretch flex items-center px-[14px] rounded-control"
        >
          <ChevronRight className="w-[18px] h-[18px]" />
        </button>
      </div>
    </Card>
  );
}

export function OrganizationTestimonyCard({
  initialFilter,
}: {
  initialFilter?: StanceFilter;
}) {
  return (
    <Card
      title="Organization Testimony"
      subtitle="Submitted by verified organization user accounts. Each account chose endorse, oppose, or no position before writing; testimony appears in the account's own words and is never edited."
    >
      <TestimonyFeed
        items={testimonyFor((u) => u.userType === "organization")}
        showDescriptor={false}
        includeFollowingFilter
        initialFilter={initialFilter}
      />
    </Card>
  );
}
