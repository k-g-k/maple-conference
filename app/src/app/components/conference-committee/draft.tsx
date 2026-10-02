// The one submission being written, and the three ways the review step can be
// drawn.
//
// Everything here exists because the review step is being compared in three
// containers at once: a second pane in the flyout, a modal, and a page of its
// own. The pane and the modal both keep the page mounted, so a draft held in
// the page's own state would survive either of them. The page does not: routing
// to it unmounts the committee page and takes any state in it along.
//
// So the draft lives above <Routes>, in a provider App.tsx mounts once. That is
// the cost the route option carries, written out rather than argued about: a
// form that never leaves its page needs none of this, and the other two styles
// are reading a provider they do not need so that the comparison is fair. If
// the pane wins, this file collapses back into one useState inside the page.

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { STARTING_DRAFT } from "./compose";
import type { ConferencePosition } from "../../data/conference-committees/positions";

/**
 * Which container draws the review step.
 *
 * Read off the URL rather than a switch on the page: the designer is comparing
 * three builds, and a link is how she gets to each of them.
 */
export type ReviewStyle = "pane" | "modal" | "page";

/** The detail page, in one of the three styles. */
export const detailPath = (slug: string, style: ReviewStyle) =>
  `/conferenceCommittees/${slug}${style === "pane" ? "" : `/${style}`}`;

/**
 * The full-page review, which only the page style has.
 *
 * Under the page style's own path rather than beside it, so the trailing
 * segment still names the style a reader is looking at.
 */
export const reviewPath = (slug: string) =>
  `/conferenceCommittees/${slug}/page/review`;

/**
 * One submission, from the first keystroke to the record.
 *
 * `posted` is on here rather than in the page, because the page style posts on
 * a different route from the one the result is read on: the confirmation, and
 * the card prepended to the feed, both have to survive the trip back. It is
 * the prototype's stand-in for a submission having been filed, and nothing is
 * sent anywhere.
 *
 * `slug` is which committee this was started on. The draft is keyed to nothing,
 * so a reader who wanders to another committee mid-sentence would otherwise
 * find their words waiting under the wrong bill.
 */
export interface Draft {
  slug: string;
  position: ConferencePosition;
  body: string;
  /** Whether MAPLE may carry this in the weekly update to the conferees. */
  digest: boolean;
  /** Whether it also goes to the reader's own two legislators, by email. */
  email: boolean;
  posted: boolean;
}

/**
 * A fresh one, for a committee.
 *
 * The position and the words come from STARTING_DRAFT, which sits with the rest
 * of the form's copy: they are what the prototype opens on so the flow can be
 * walked through without typing, and that is a copy decision rather than a state
 * one. The weekly update keeps the default it had in the composer, which is on:
 * somebody filing on a conference wants the conferees to read it, so opting out
 * is the deliberate act.
 */
/**
 * The one committee that opens with something already written.
 *
 * Phone-free schools is the page the prototype is walked through, so its form
 * is filled in and the flow can be shown without typing. Every other committee
 * opens empty, which is what a reader actually meets, and which is also the
 * only way the empty-field refusal can be seen at all.
 */
const PREFILLED = "phone-free-schools";

export const emptyDraft = (slug: string): Draft => ({
  slug,
  ...(slug === PREFILLED
    ? STARTING_DRAFT
    : { position: STARTING_DRAFT.position, body: "" }),
  digest: true,
  email: true,
  posted: false,
});

/**
 * What one committee remembers between visits.
 *
 * The draft, and whether its panel was open and on which view. All three
 * belong to the committee rather than to the page: a reader who goes to look
 * at how another conference phrased something, writes a note while they are
 * there, and comes back, should find both committees exactly as they left
 * them. One slot for the whole app meant the second one they typed in
 * destroyed the first, silently.
 */
export interface Session {
  draft: Draft;
  /** Per layout, because the two readings keep their own panel. */
  rail: Record<"card" | "stacked", "open" | "min">;
  railView: Record<"card" | "stacked", string>;
}

const emptySession = (slug: string, open: boolean, view: string): Session => ({
  draft: emptyDraft(slug),
  rail: { card: open ? "open" : "min", stacked: open ? "open" : "min" },
  railView: { card: view, stacked: view },
});

const DraftContext = createContext<{
  sessions: Record<string, Session>;
  update: (slug: string, patch: Partial<Session>) => void;
} | null>(null);

/** Mounted once, above the routes, so navigation cannot throw the draft away. */
export function DraftProvider({ children }: { children: ReactNode }) {
  // Keyed by committee. A committee with no entry has never been written on or
  // opened, and reads as a closed panel and an empty form, which is what a
  // reader arriving somewhere new should find.
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const value = useMemo(
    () => ({
      sessions,
      update: (slug: string, patch: Partial<Session>) =>
        setSessions((all) => {
          const was = all[slug] ?? emptySession(slug, false, "perspectives");
          return { ...all, [slug]: { ...was, ...patch } };
        }),
    }),
    [sessions],
  );
  return (
    <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
  );
}

/**
 * Which committees have something written and not yet posted.
 *
 * Drafts are per committee and survive going to look at another one, which is
 * no use if nothing says where they are. The list reads this to mark them.
 */
export function useDrafted(): Set<string> {
  const ctx = useContext(DraftContext);
  const sessions = ctx?.sessions ?? {};
  return useMemo(
    () =>
      new Set(
        Object.entries(sessions)
          .filter(([, v]) => v.draft.body.trim() && !v.draft.posted)
          .map(([slug]) => slug),
      ),
    [sessions],
  );
}

/** One committee's session, created on demand. */
function useSession(slug: string, open = false, view = "perspectives") {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error("useSession needs a DraftProvider above it");
  return {
    session: ctx.sessions[slug] ?? emptySession(slug, open, view),
    update: (patch: Partial<Session>) => ctx.update(slug, patch),
  };
}

/**
 * Whether this committee's panel is open, and on what.
 *
 * Returned as the same shape the page held in its own state, so the page reads
 * as it did: the only difference is where it is kept.
 */
export function useRail(slug: string, open: boolean, view: string) {
  const { session, update } = useSession(slug, open, view);
  return {
    rail: session.rail,
    setRail: (next: Session["rail"]) => update({ rail: next }),
    railView: session.railView,
    setRailView: (next: Session["railView"]) => update({ railView: next }),
  };
}

/**
 * This committee's draft, and a way to change part of it.
 *
 * The staleness check is derived rather than run in an effect: a draft that
 * belongs to another committee is simply not returned, so a reader who deep
 * links straight to a review page sees an empty form instead of somebody
 * else's bill for one frame. Writing always stamps the current slug, which is
 * what claims the draft for this page.
 */
export function useDraft(
  slug: string,
): [Draft, (patch: Partial<Draft>) => void] {
  const { session, update } = useSession(slug);
  return [
    session.draft,
    (patch) => update({ draft: { ...session.draft, ...patch, slug } }),
  ];
}
