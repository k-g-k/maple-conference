// Shared data-shape vocabulary for ballot-question deep-dive pages.
//
// These are the single source of truth for the types that the generic section
// components (in ./sections) render from, and that a question's content module
// (e.g. src/app/data/rent-control/content.ts) is authored against. Keeping them
// here — not inside any one page — is what lets a new ballot question reuse the
// same layout by supplying the same shapes.
//
// Provenance model: every citable fact carries a `SrcKind`, which drives the
// left-bar / chip / dot color wherever it is shown. Sources themselves live in a
// per-question registry (Record<string, Source>) and are referenced by id.

export type SrcKind = "official" | "outside" | "ai" | "user";

// Left-bar / dot color per source kind. Used by CitationBlock, Cite, RefGroup…
// Read from inline styles (CitationBlock paints its left bar with
// style.borderColor), so these point at the theme variables rather than
// repeating their values. theme.css uses `@theme static` to keep them emitted.
export const KIND_DOT: Record<SrcKind, string> = {
  official: "var(--color-official)",
  user: "var(--color-user)",
  outside: "var(--color-outside)",
  ai: "var(--color-ai)",
};

// Outlined provenance chips used in the sources popover.
export const SRC_CHIP: Record<
  SrcKind,
  { bd: string; tx: string; label: string }
> = {
  official: {
    bd: "border-official-edge",
    tx: "text-official-ink",
    label: "Official info",
  },
  outside: {
    bd: "border-outside-edge",
    tx: "text-outside-ink",
    label: "Outside content",
  },
  user: {
    bd: "border-user-edge",
    tx: "text-user-ink",
    label: "User-submitted",
  },
  ai: { bd: "border-ai-edge", tx: "text-ai-ink", label: "AI synthesis" },
};

// A single cited source. Referenced by its key in the per-question registry.
export interface Source {
  label: string; // outlet / publisher
  kind: SrcKind;
  url: string;
  date?: string;
  /** Popover bibliography fields — title, issuer/author line, and a one-line note. */
  title?: string;
  meta?: string;
  note?: string;
}

// Per-question source registry: id → source.
export type Sources = Record<string, Source>;

// ── Stakeholder Impact ──────────────────────────────────────────────────────
export type StakeholderImpact = "benefits" | "cost" | "neutral";
export interface Stakeholder {
  group: string;
  impact: StakeholderImpact;
  body: string;
  /** Projected or disputed claim — marked with a warning triangle. */
  disputed?: boolean;
  basis: string;
}

// ── Vote (Yes/No) comparison card ───────────────────────────────────────────
export interface VoteSide {
  vote: "yes" | "no";
  summary: string;
  /** Account ids of the campaign organizers — avatars with hover tooltip, no link-out. */
  organizerIds: string[];
  /** Total raised — links to this page's Campaign Finance tab, not externally. */
  funding: string;
  /**
   * How the total splits. Shown only on hover, since the headline figure is
   * what a reader scans for and the breakdown is what they ask about second.
   * Omit both when nothing was raised.
   */
  fundingCash?: string;
  fundingInKind?: string;
  sideLabel: string;
  /** This side's AG-approved statement (filler language in this prototype). */
  official: { text: string; who: string };
  ids?: string[];
}

// ── Arguments ("Arguments at a Glance") ─────────────────────────────────────
export type ArgSourceTag =
  | "official"
  | "academic"
  | "organization"
  | "elected"
  | "citizen";
export interface Arg {
  title: string;
  body: string;
  quote?: { text: string; who: string; ids: string[] };
}
export type ArgSet = { yes: Arg[]; no: Arg[] };
// "all" rolls up every source category; the rest narrow to one.
export type ArgFilter = "all" | ArgSourceTag;

// ── Timeline milestone ──────────────────────────────────────────────────────
export interface TL {
  when: string;
  label: string;
  body?: string;
  ids?: string[];
}

// ── Claim mapping ───────────────────────────────────────────────────────────
export type ClaimSource = "outside" | "testimony";
export interface ClaimRow {
  claim: string;
  mark: "verified" | "attributed";
  source: ClaimSource;
  note: string;
  ids?: string[];
}

// ── Polls ───────────────────────────────────────────────────────────────────
export interface PollRow {
  pollster: string;
  dates: string;
  sample: string;
  moe: string;
  support: number;
  oppose: number;
  undecided: number;
  ids: string[];
}

// ── Campaign finance ────────────────────────────────────────────────────────
export interface Committee {
  name: string;
  stance: "yes" | "no";
  total: string;
  cash: string;
  inKind: string;
  spent: string;
  note: string;
  donors: { name: string; amount: string; kind: string }[];
}

// ── Research & media ────────────────────────────────────────────────────────
export interface Study {
  citation: string;
  affiliation?: string;
  finding: string;
  url?: string;
}
export interface Article {
  outlet: string;
  title: string;
  url: string;
  type: string;
}

// ── Testimony display mode ──────────────────────────────────────────────────
// `true`/`false` = always/never show the gray descriptor line; "officials" =
// show it only for executive-office and legislator accounts (mixed feeds).
export type DescriptorMode = boolean | "officials";

// ── Facts (key/value rows) ──────────────────────────────────────────────────
export interface Fact {
  k: string;
  v: string;
  ids?: string[];
}
