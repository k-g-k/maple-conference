// Quotes below are public statements reported by Ballotpedia and Massachusetts
// news outlets, recast as MAPLE submissions; submission dates are prototype
// placeholders. Some statements cover this measure and the companion
// income-tax-rate question together; those are included because they were made
// about this measure as part of that pair.

export type TestimonyStance = "endorse" | "oppose" | "no-position";

export interface TestimonyItem {
  /** Stable slug — future per-testimony URL, never reuse or rename. */
  id: string;
  /** Submitting account — `PositionUser.id` in tax-rebate-62f-users.ts. */
  userId: string;
  /** Person speaking for the account, when the statement names one. */
  speaker?: string;
  stance: TestimonyStance;
  date: string;
  body: string;
}

export const TESTIMONY: TestimonyItem[] = [
  // ── Individuals ───────────────────────────────────────────────────────────
  // Fabricated for the prototype. Unlike the organizational statements above,
  // which are real public positions recast as MAPLE submissions, nothing below
  // was said by anyone: these are written to show what a page carrying
  // individual testimony would hold, and to give the account-type and
  // no-position filters something to find.
  {
    id: "ramirez-fixed-income",
    userId: "p-ramirez",
    stance: "endorse",
    date: "June 7, 2026",
    body: "I retired in 2019 and my property tax has gone up every year since. In 2022 I got a 62F check and it covered most of that increase. Then it never happened again, and the state kept collecting more. If the law was supposed to send money back when there is extra, I would like it to actually do that instead of almost doing it once every twenty years.",
  },
  {
    id: "okafor-small-business",
    userId: "p-okafor",
    stance: "endorse",
    date: "May 16, 2026",
    body: "I run a two-location print shop and I plan a year at a time. What I want from the state is a rule I can read. Right now the cap is calculated off a number that is itself a cap, which is not something any of my customers could explain to me. Tying it to what was actually collected is at least a number that means something.",
  },
  {
    id: "bergeron-promise-kept",
    userId: "p-bergeron",
    stance: "endorse",
    date: "April 29, 2026",
    body: "I voted for this in 1986 and I am voting for it again. The argument against it seems to be that the state has found ways around it and we should leave those in place. That is not a reason. If the Legislature thinks the refund is bad policy they should repeal it in the open rather than let the formula quietly do it for them.",
  },
  {
    id: "whitcomb-not-a-windfall",
    userId: "p-whitcomb",
    stance: "endorse",
    date: "April 9, 2026",
    body: "My refund in 2022 was about $200. Nobody is getting rich. But it arrived the same month my heating bill did, and I noticed it. I understand the people worried about school funding and I do not think they are wrong to worry. I would rather the state budget to the money it should have than keep money it said it would return.",
  },
  {
    id: "tran-counselor-caseload",
    userId: "p-tran",
    stance: "oppose",
    date: "May 28, 2026",
    body: "I am one of two counselors for about 900 students. The last time the budget tightened, the second position was frozen for a year and I did that alone. A rule that lowers the ceiling a little more after every slow year is not an abstraction to me. It is the year they do not refill the position, and it is a lot of kids who do not get seen.",
  },
  {
    id: "alvarez-surtax-vote",
    userId: "p-alvarez",
    stance: "oppose",
    date: "May 8, 2026",
    body: "We voted in 2022 to have the highest earners pay more and to send that money to schools and transportation. I knocked doors for it. Now the same money would count toward a cap that sends refunds back out, and most of the dollars would go to the people who paid the surtax. I do not understand how that is anything but undoing what we just decided.",
  },
  {
    id: "donnelly-after-the-downturn",
    userId: "p-donnelly",
    stance: "oppose",
    date: "April 18, 2026",
    body: "In 2009 they cut service and it took eight years to get it back. This measure would pull money out right after a bad year, which is exactly when the buses are how people get to work. I would rather a refund I do not get than a route that does not run.",
  },
  {
    id: "shah-would-benefit",
    userId: "p-shah",
    stance: "oppose",
    date: "April 2, 2026",
    body: "I would get money back under this and I am voting against it. A refund proportional to what you paid is the most regressive way to return a surplus: it gives the most to the people who needed it least. If the state genuinely over-collects, I would rather it went to the T or to childcare than came back to me in a check I would not notice.",
  },
  {
    id: "lindqvist-open-question",
    userId: "p-lindqvist",
    stance: "no-position",
    date: "March 24, 2026",
    body: "I prepare returns for a few hundred households and I have read the petition twice. Nobody has explained what happens in the first year the recalculated base is set: whether it is drawn from a normal year or from whichever year happens to precede the vote. That choice decides how often this triggers for a decade. I am not arguing either way, I am asking somebody to answer it.",
  },
  {
    id: "boudreau-both-true",
    userId: "p-boudreau",
    stance: "no-position",
    date: "March 18, 2026",
    body: "Both sides here are describing something real. The refund has been triggered twice in forty years, which does look like a promise that stopped working. And a cap that steps down after every lean year does look like it would squeeze the budget over time. I have not seen anyone address both of those honestly in the same sentence, and until somebody does I am undecided.",
  },

  // ── Endorse ─────────────────────────────────────────────────────────────────
  {
    id: "massfiscal-craney-loophole",
    userId: "mass-fiscal",
    stance: "endorse",
    date: "June 9, 2026",
    body: "Fixing the 62F Tax Cap Loophole is a no-brainer. Voters wanted guardrails on runaway spending, with automatic rebates to taxpayers triggered when the state collects too much, and that's exactly what makes the 62F law so popular. Due to loopholes and exclusions, especially the carveout for new surtax revenues, the law has only been triggered twice in 40 years. Beacon Hill always finds ways around the law as it's currently written. This fix closes the loopholes and restores the taxpayer protections voters overwhelmingly approved.",
  },
  {
    id: "moa-brief-spending",
    userId: "mass-opportunity-alliance",
    stance: "endorse",
    date: "June 2, 2026",
    body: "The current revenue cap has not constrained budget growth; instead budget spending levels have grown at nearly double the rate of Massachusetts average wages and local inflation. Under the revised revenue limit rooted in actual tax collections, Massachusetts taxpayers would have received a refund 24 times in the last four decades. This amounts to nearly $19 billion in taxes that should have been given back to taxpayers.",
  },
  {
    id: "pioneer-stergios-competitiveness",
    userId: "pioneer-institute",
    stance: "endorse",
    date: "May 20, 2026",
    body: "Massachusetts needs to abandon the tax-and-spend mentality that's making it harder for people and businesses to thrive. If we don't do something to control state spending and bring relief to residents, data and experience show we will continue to bleed talent and tax revenue. We look forward to educating the public on these policies that encourage fiscal responsibility and ease the burden on taxpayers as the cost-of-living continues to rise.",
  },
  {
    id: "htc-original-intent",
    userId: "mass-high-tech-council",
    stance: "endorse",
    date: "May 12, 2026",
    body: "Our organization helped write the 1986 law that gave Massachusetts taxpayers a guarantee: when the state collects far more than it needs, the excess comes back to the people who paid it. That guarantee has been hollowed out. Restoring a cap tied to what the state actually collects — and counting all of the revenue it collects — simply returns the law to what voters were promised.",
  },

  // ── Oppose ───────────────────────────────────────────────────────────────────
  {
    id: "pmf-statement-cuts",
    userId: "protect-ma-future",
    stance: "oppose",
    date: "June 5, 2026",
    body: "Massachusetts succeeds because we invest in each other — in strong public schools, reliable healthcare, safe communities, and modern infrastructure. But this measure threatens that progress by imposing an arbitrary revenue cap that could force billions of dollars in cuts. Wealthy investors and CEOs are backing it because they stand to benefit the most, while working families would pay the price through reduced public services. Together with the income-tax question, these initiatives would strip billions from classrooms, hospitals, and research that Massachusetts communities depend on.",
  },
  {
    id: "massbudget-baxandall-ratchet",
    userId: "massbudget",
    stance: "oppose",
    date: "March 30, 2026",
    body: "The ballot initiative would make the already flawed mechanism of the 62F law far more constraining over time. By ratcheting down the growth of Computed Maximum State Tax Revenues every time actual revenue growth is slow or is reduced the next year by a 62F refund, the policy would tend to continually reduce the cap on state revenues available for budgetary purposes. The result will be often unpredictable budget cuts and the abandonment of planned public investments. On top of that, because the triggered diversions of revenue into 62F payments will tend to follow a recession, the new rules will impair the state's ability to make investments at just the time when they are most needed to jumpstart the economy.",
  },
  {
    id: "seiu509-foley-chaos",
    userId: "seiu-509",
    stance: "oppose",
    date: "March 30, 2026",
    body: "Corporations in the state, they want a stable workforce, and they want a stable state, and this would completely destabilize the workforce and destabilize the working infrastructure in Massachusetts. Seven billion dollars out of a $61 billion budget is devastating. It would completely upend the Massachusetts State House and what they do, and create chaos, and chaos isn't good for business.",
  },
  {
    id: "mtf-position-counterproductive",
    userId: "mtf",
    stance: "oppose",
    date: "May 4, 2026",
    body: "These questions are intended to address real issues — affordability, competitiveness, and fiscal sustainability. But the impacts of limiting the state's annual cap on allowable tax collections would be counterproductive, putting the fiscal and economic health of the Commonwealth and its residents in a worse position. We oppose this ballot question and instead propose an alternative policy agenda to meaningfully address those same concerns.",
  },
  {
    id: "mta-classroom-cuts",
    userId: "mta",
    stance: "oppose",
    date: "April 22, 2026",
    body: "Educators across the Commonwealth have seen what happens when budgets are squeezed: larger classes, fewer counselors, and programs cut mid-year. Locking in a cap that falls a little further every lean year is a recipe for exactly that. And counting the revenue voters dedicated to schools and transportation in 2022 toward a refund cap works directly against the choice those same voters just made.",
  },

];
