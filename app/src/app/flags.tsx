// Which build you are looking at.
//
// The prototype answers to two addresses. The plain one is the build: what we
// actually intend to ship, with the experiments and the half-finished chrome
// switched off. It is the link to send an engineer, and it is the path every
// existing link already points at, so nothing shared before this existed
// broke when this arrived.
//
//   /conferenceCommittees/phone-free-schools              the build
//   /playground/conferenceCommittees/phone-free-schools   everything
//
// Everything underneath the prefix is the same route tree rendered twice, so
// a page does not have to know which mode it is in. It asks `useFlags()` and
// gets an answer.
//
// Before this, each of these was a `const SHOW_X = false` sitting next to the
// component that read it, flipped by hand and flipped back. That works for one
// trial at a time and stops working when you want two builds at once: a flag
// is either on for everybody or off for everybody. Collecting them here is
// what makes "off for the engineer, on for the designer" a thing you can say.

import { createContext, useContext, type ReactNode } from "react";

export interface Flags {
  /** The chip row under the committee title: bill kind, then MAPLE's topics. */
  billKind: boolean;
  /** The clause naming how the two texts differ, read mid sentence. */
  claim: boolean;
  /** The six conferees, named in the byline. */
  members: boolean;
  /**
   * The "Input" control: whether public input is read inline or in the panel.
   *
   * Off in both presets. Parked rather than deleted, because the two readings
   * still work and the choice may come back; the page just does not offer it.
   */
  testimonySwitch: boolean;
  /**
   * The "Page" control: the tabbed read against the scrolling one.
   *
   * Off in both presets, like the one above. `?view=` still selects the layout
   * directly, so both readings stay reachable by address without a control on
   * the page offering them.
   */
  pageSwitch: boolean;
  /** The comparison drawn as cards rather than as a column. */
  card: boolean;
  /**
   * Inline Public Input: the heading on a white band, padded in from the
   * sides. Off, the heading sits on the page's ground like the filters.
   */
  inlineInputStyle: boolean;
  /** The thumb on the position filter pill once a position is chosen. */
  positionThumbs: boolean;
  /**
   * "Share your input" beside the Public Input heading as a starred link with
   * an arrow. Off, it is a primary button.
   */
  shareLink: boolean;
  /** "Most committees" and "Highest ranked" under the committee index maps. */
  legislatorSorts: boolean;
}

/**
 * What an engineer sees.
 *
 * The honest subset: everything here is something we mean to build. A flag
 * goes true in this preset when the thing behind it is decided, not when it
 * is interesting.
 */
export const BUILD: Flags = {
  billKind: false,
  claim: false,
  members: false,
  testimonySwitch: true,
  pageSwitch: false,
  card: false,
  inlineInputStyle: false,
  positionThumbs: false,
  shareLink: false,
  legislatorSorts: false,
};

/**
 * What the designer sees.
 *
 * Everything on, including the parts still being argued about. This is the
 * place to look at the whole idea at once rather than the part of it that
 * survived triage.
 */
export const VISION: Flags = {
  billKind: true,
  claim: true,
  members: true,
  // These two are off here as well. Everything else in this preset is on; a
  // flag that is false in both is a thing taken off the page rather than a
  // difference between the two builds, and it lives here so it is one line to
  // bring back rather than a hunt through the component.
  testimonySwitch: true,
  pageSwitch: false,
  card: true,
  inlineInputStyle: true,
  positionThumbs: true,
  shareLink: true,
  legislatorSorts: true,
};

const FlagsContext = createContext<Flags>(BUILD);

export function FlagsProvider({
  value,
  children,
}: {
  value: Flags;
  children: ReactNode;
}) {
  return (
    <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>
  );
}

/** The flags for the build being rendered. Defaults to `BUILD` outside a provider. */
export const useFlags = () => useContext(FlagsContext);
