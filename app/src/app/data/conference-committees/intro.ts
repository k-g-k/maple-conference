// What a conference committee is, as the hero above every committee page
// introduces it.
//
// The paragraph says what the place is for: learning how this step works so
// that a reader can say something to the people taking it. Its facts, and
// every step's, come from one of two places, and each step names its own:
//
//   The Joint Rules of the 194th General Court, as amended 26 June 2025.
//   Read on 19 October 2026.
//
//   MAPLE's guide to the legislative process, which is where a MAPLE reader
//   meets the rest of the process, so the two should not tell it differently.
//
// Who appoints the six is left out. Senate Rule 12 has the President appoint
// the Senate's committees, but neither chamber's rules name conference
// committees in particular, and the page does not guess.

export const JOINT_RULES = "https://malegislature.gov/Laws/Rules/Joint";
export const MAPLE_PROCESS =
  "https://www.mapletestimony.org/learn/legislative-process";

/** The paragraph under the heading. */
export const LEAD =
  "When the House and Senate pass different versions of a bill, six legislators work out one final text in a conference committee. Learn how it works, see who’s negotiating and what’s still unresolved, and share your input while they’re still deciding.";

export interface Step {
  h: string;
  p: string;
  /** Where it comes from. Kept here rather than under each step on the page,
   *  where five citations made a row of footnotes; the page names both
   *  sources once, under the steps. */
  source: string;
}

/** In the order they happen, which is the order the page numbers them. */
export const STEPS: Step[] = [
  {
    // "Both the House and Senate go through this process separately and must
    // end up with identical text."
    h: "Two versions pass",
    p: "Each chamber passes its own text of the bill, and the two don't match.",
    source: "MAPLE's guide",
  },
  {
    // "Committees of conference shall consist of 3 members on the part of each
    // branch, one member of each branch being a member of the minority party
    // representing its vote"
    h: "Six are named",
    p: "Three from each chamber. In each, one of the three comes from the minority party.",
    source: "Joint Rule 11",
  },
  {
    // "shall be open to the public, unless a majority shall vote otherwise;
    // provided, however, that no such vote shall be in order at the first duly
    // noticed public meeting"
    h: "They negotiate",
    p: "Their meetings are public unless a majority votes to close them, and they can't close the first one.",
    source: "Joint Rule 1A",
  },
  {
    // 11: "if agreed to by a majority of each committee". 11D: posted "on the
    // official website of the General Court". 11B: not acted on "until 24
    // hours has passed following the time on which said report was filed and
    // made available to the public", longer if filed after 8 p.m.
    h: "The report is posted",
    p: "A majority of each chamber's three has to agree to it. It goes up on the legislature's website, and neither chamber can vote on it for at least 24 hours.",
    source: "Joint Rules 11, 11B and 11D",
  },
  {
    // 11: "may be either accepted or rejected, but no other action shall be
    // had, except through a new committee of conference". MAPLE's guide: "Both
    // chambers then vote to accept or reject it with no further amendments
    // allowed."
    h: "Yes or no",
    p: "Each chamber accepts or rejects it as written. Changing it takes a new conference committee.",
    source: "Joint Rule 11 and MAPLE's guide",
  },
];

/** The way through to the explorer, beside the hero's button. */
export const EXPLORER = "Conference Explorer";
