// The four things a reader can ask a conference committee to do.
//
// Not the ballot pages' support, oppose and no position. A conference is not
// deciding whether to pass a bill; it is deciding which of two texts survives,
// so the positions worth offering are the ones a conferee could act on. This is
// the conference pages' own mechanism, and the ballot question's three are left
// exactly as they were.
//
// One list, read by the composer, the filter row, the chip on each submission
// and the public map. A second copy of it anywhere would be a second set of
// positions, and the two would drift.

export type ConferencePosition = "pass" | "senate" | "house" | "none";

/**
 * The one axis all four share: three of them ask the conference to produce a
 * bill and the fourth asks it to produce none.
 *
 * This is the same split the thumbs make, and it is the only comparison the
 * four positions can carry between them. Which of the two texts somebody prefers is
 * not a scale, so nothing should try to average it.
 */
export type ConferenceAsk = "bill" | "nothing";

export interface ConferencePositionOption {
  k: ConferencePosition;
  /** The sentence. Used where there is room for one, which is the composer. */
  l: string;
  /** Two words, for the filter row and for the chip on a submission. */
  short: string;
  /**
   * Selected-state colours: fill, edge and ink. One string, because the three
   * only ever appear together.
   */
  on: string;
  /**
   * Which way this position is pushing. The map reads it, and so does the thumb
   * on the filter pill: the mark belongs to the direction rather than to the
   * position, which is why four of the five share one. The thumbs themselves
   * live with the pill that draws them, in the feed's `ASK_THUMB`.
   */
  ask: ConferenceAsk;
}

/** By key, for anything holding a position and needing its presentation. */
export const POSITIONS: Record<ConferencePosition, ConferencePositionOption> = {
  pass: {
    k: "pass",
    l: "Please pass something",
    short: "Pass something",
    // Asking for anything and asking for nothing are the two positions that
    // are for or against an outcome, so they take the page's for and against.
    on: "bg-positive-soft border-positive text-positive-ink",
    ask: "bill",
  },
  house: {
    k: "house",
    l: "Pass the House version",
    short: "House version",
    // The chamber's own colour, the one the House wears everywhere else on the
    // page, softened to a fill.
    on: "bg-user-soft border-user text-user-ink",
    ask: "bill",
  },
  senate: {
    k: "senate",
    l: "Pass the Senate version",
    short: "Senate version",
    on: "bg-official-soft border-official text-official-ink",
    ask: "bill",
  },
  none: {
    k: "none",
    l: "Don't pass anything",
    short: "Pass nothing",
    on: "bg-negative-soft border-negative text-negative-ink",
    ask: "nothing",
  },
};

/**
 * In the order they are offered.
 *
 * Wanting a result leads, and the composer opens on it: it is the least loaded
 * of the four to arrive already chosen, and it is what most people filing on a
 * conference actually want. Then the two texts, then the refusal, which sits
 * last because it is the only one that ends the process.
 *
 * Written in the first person: a filing is somebody saying what they want, not
 * a label being applied to them.
 */
export const CONFERENCE_POSITIONS: ConferencePositionOption[] = [
  POSITIONS.pass,
  POSITIONS.senate,
  POSITIONS.house,
  POSITIONS.none,
];
