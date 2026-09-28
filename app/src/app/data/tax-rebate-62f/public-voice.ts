// What the public is saying, in the same shape the chapter above uses for the
// campaigns: each side in its own words, then what they nonetheless agree on,
// then what stays contested, then what came up that neither campaign says.
//
// Two rules govern everything in this file.
//
// The points are summaries, not quotations. Each carries `from`, the filed
// statements it was drawn from, so a summary can be traced back to documents
// rather than standing on its own authority. Nothing here is presented as
// somebody's words.
//
// Session material is not real yet. The sessions begin in fall 2026, so every
// point marked `session`, and everything under `nuance`, is written to show
// what this section would carry once they have happened, and is marked as such
// wherever it renders. It is never merged with what filers actually said.

/**
 * One point a side makes, summarized rather than quoted. `from` names the
 * filed statements it was drawn from, so a summary can be traced back to
 * documents; `session` marks a point that came out of the facilitated
 * discussions instead, which have not happened yet.
 */
export type ArgPoint = {
  text: string;
  from?: string[];
  session?: boolean;
};

export const PUBLIC_VOICE = {
  /**
   * The plain answer, before any of the evidence. Says what the argument is
   * about rather than how many are on each side: nine organizations filing is
   * not a poll, and on a page that takes no position a count would read as one.
   */
  synthesis:
    "Almost nobody on the record argues that the state should keep money it has genuinely over-collected. What is contested is how the limit gets set, and what happens to the money voters already dedicated to schools and transportation.",

  basis: { filed: 9, sessions: 3, participants: 44 },

  supporting: [
    {
      text: "The guarantee voters approved has been narrowed until it almost never fires. The 1986 law has triggered twice in forty years, which supporters attribute to what the formula leaves out rather than to the state collecting responsibly.",
      from: ["massfiscal-craney-loophole", "htc-original-intent"],
    },
    {
      text: "A limit set from actual collections would have returned money 24 times over the same four decades, roughly $19 billion that supporters say should already have gone back.",
      from: ["moa-brief-spending"],
    },
    {
      text: "State spending has grown at close to double the rate of wages, and a limit tied to what is actually collected is the constraint that would hold.",
      from: ["moa-brief-spending", "pioneer-stergios-competitiveness"],
    },
    {
      text: "Counting all revenue, surtax included, is what the original promise implied: the excess comes back to the people who paid it.",
      from: ["htc-original-intent", "massfiscal-craney-loophole"],
    },
    {
      text: "Once the mechanics were explained, groups found the idea of an automatic refund easy to accept. The objection they expected to have was not about getting money back.",
      session: true,
    },
  ] as ArgPoint[],

  opposing: [
    {
      text: "The formula ratchets. A limit set from actual collections falls when collections fall, and falls again the year after a refund, so the ceiling declines over time rather than tracking need.",
      from: ["massbudget-baxandall-ratchet"],
    },
    {
      text: "The first cuts land on schools, healthcare and public services rather than on slack, and the size of any impact is not knowable in advance.",
      from: ["pmf-statement-cuts", "mta-classroom-cuts", "seiu509-foley-chaos"],
    },
    {
      text: "Refunds proportional to tax paid send the largest amounts to the highest earners, which opponents call the point of the measure rather than a side effect.",
      from: ["pmf-statement-cuts"],
    },
    {
      text: "Counting the 2022 surtax toward the limit works against the vote that dedicated that revenue to education and transportation.",
      from: ["mta-classroom-cuts"],
    },
    {
      text: "Refunds tend to trigger after a downturn, drawing money out at exactly the point the state would otherwise be investing to recover.",
      from: ["massbudget-baxandall-ratchet"],
    },
    {
      text: "The concern that held across groups was not one year's refund but the ceiling after two lean years in a row.",
      session: true,
    },
  ] as ArgPoint[],

  /** What both sides state, in statements filed from opposite positions. */
  agreement: [
    "Money the state genuinely over-collects should go back to taxpayers. No filed statement argues the cap should never trigger.",
    "Counting surtax revenue toward the limit is what would make refunds trigger more often. Both sides describe that mechanism the same way and disagree about whether it is right.",
  ],

  /** The live disagreements, stated without resolving them. */
  contested: [
    "Whether a limit set from actual collections restores the guarantee voters approved in 1986, or narrows the budget a little further every lean year.",
    "Whether counting the 2022 surtax honours the earlier vote or overrides the more recent one, since both were decided by the same electorate.",
    "Whether refunds proportional to tax paid are the fair way to return money, given that the largest amounts go to the highest earners.",
  ],

  /**
   * The part no campaign is making: what residents raised once they had the
   * mechanics in front of them. This is the material MAPLE has and nobody else
   * does, which is why it gets its own place rather than being folded in.
   */
  nuance: [
    "The worry was rarely about a single year. It was about the ceiling after two lean years in a row, which is a question neither campaign answers directly.",
    "Learning that refunds are proportional to tax paid moved people in both directions: some read it as fair, some as the whole problem.",
    "Groups wanted to know who decides that a year has produced a surplus, and found that the answer is a formula rather than a judgment.",
  ],
};
