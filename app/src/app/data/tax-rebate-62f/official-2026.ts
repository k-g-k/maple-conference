// Question 5 as it appears in the Commonwealth's own voter guide.
//
// Source: "Information for Voters: 2026 Ballot Questions", Office of the
// Secretary of the Commonwealth. Every string in this file is quoted from that
// document rather than summarised, because each one is attributed to a named
// office by statute and paraphrasing would put words in that office's mouth.
// The author of each piece is carried alongside it for the same reason: who
// wrote a thing is part of what it is here.
//
// This is the only file on the alt-2 page holding official text. Nothing in it
// is written for the prototype.

export interface OfficialBlock {
  /** Who the statute assigns this text to. */
  author: string;
  /** The note the voter guide prints above it, in its own words. */
  provenance: string;
  paragraphs: string[];
}

/** Written by the State Attorney General. */
export const SUMMARY: OfficialBlock = {
  author: "Office of the Attorney General",
  provenance: "As required by law, summaries are written by the State Attorney General.",
  paragraphs: [
    "This proposed law would change the limit on how much revenue the state can collect in a given year. The proposal would limit state revenue in a given year to the net amount of state revenue from the year before, increased by a rate equal to the average growth of wages and salaries in Massachusetts over the most recent three years. If revenue collected by the state in a given year exceeds the limit, the excess amount would be refunded to taxpayers the following year. The proposed law would include all revenue from the surtax on incomes over $1 million when calculating the revenue limit and when determining whether state revenue exceeds the limit.",
    "The provisions of the proposed law would all be effective as of July 1, 2027.",
    "The proposed law states that, if any of its parts were declared invalid, the other parts would stay in effect.",
  ],
};

/** Written jointly by the Attorney General and the Secretary of the Commonwealth. */
export const WHAT_YOUR_VOTE_DOES = {
  author: "Attorney General and Secretary of the Commonwealth",
  provenance:
    "As required by law, the statements describing the effect of a “yes” or “no” vote are written jointly by the State Attorney General and the Secretary of the Commonwealth.",
  yes: "A YES VOTE would change the limit on state revenue collection, tying it to prior year collections plus average wage and salary growth, and provide for a rebate of revenue exceeding that limit.",
  no: "A NO VOTE would make no change in the law relative to state revenue collection.",
  /**
   * The same sentences with their subject removed, for a card that already
   * names the vote in its heading. "Voting Yes / A YES VOTE would change…"
   * says it twice, and the second one is the card shouting.
   *
   * Only the opening noun phrase is dropped and the next word is capitalised.
   * Nothing else is reworded, so the claim each statement makes is unchanged.
   * The full sentences above are still what the page cites as the official
   * text; use those anywhere the statement stands on its own.
   */
  yesTrimmed:
    "Would change the limit on state revenue collection, tying it to prior year collections plus average wage and salary growth, and provide for a rebate of revenue exceeding that limit.",
  noTrimmed:
    "Would make no change in the law relative to state revenue collection.",
};

/** Written by the Executive Office of Administration and Finance. */
export const FISCAL_CONSEQUENCES: OfficialBlock = {
  author: "Executive Office for Administration and Finance",
  provenance:
    "As required by law, statements of fiscal consequences are written by the Executive Office of Administration and Finance.",
  paragraphs: [
    "The proposed law would put stricter limits on allowable annual revenue growth available for budgeting. As a result, the proposal would reduce the amount of money available to support the state budget, which includes local aid for schools and municipal budgets. The proposal would also reduce the amounts available to build the state's Stabilization, or “rainy day,” Fund, a reserve of money set aside to help Massachusetts manage economic downturns or emergencies without raising taxes or making major spending cuts. Depending on future conditions, the proposal could change the frequency of statutorily-required refunds to taxpayers.",
  ],
};

/**
 * The statutory 150-word arguments. The Commonwealth prints a disclaimer above
 * these and it travels with them here, because without it a reader takes them
 * for findings rather than for what the campaigns chose to say.
 */
export const ARGUMENTS_DISCLAIMER =
  "As provided by law, the 150-word arguments are written by proponents and opponents of each question, and reflect their opinions. The Commonwealth of Massachusetts does not endorse these arguments, and does not certify the truth or accuracy of any statement made in these arguments.";

export interface StatutoryArgument {
  heading: string;
  paragraphs: string[];
  /** The byline the guide prints, on one line. The mailing address and website
      it also prints are left out: they are how you contact a campaign, not part
      of the argument, and on screen they read as the page endorsing a
      destination. */
  authoredBy: string;
}

export const ARGUMENT_FOR: StatutoryArgument = {
  heading: "Official Statement",
  paragraphs: [
    "A YES vote sets reasonable limits on the growth of state government revenue and ensures that taxpayers receive refunds when the Commonwealth collects more money than it needs.",
    "This proposal modernizes the state's existing laws to create stronger fiscal guardrails, promote accountability, guard against future tax increases, and ensure government growth reflects what taxpayers can afford. It will not cut state spending for important services like education, transportation, or healthcare.",
    "Massachusetts families are struggling with the rising cost of housing, groceries, and childcare. When government collects excess revenue, taxpayers deserve to get that money back instead of seeing it absorbed into a state budget that is growing faster than inflation.",
    "With Massachusetts continuing to lose residents to lower-cost states, this ballot question puts taxpayers first. A YES vote means you keep more of your hard-earned money, and makes Massachusetts a more affordable place to live, work, and raise a family.",
  ],
  authoredBy: "Taxpayers for an Affordable Massachusetts",
};

export const ARGUMENT_AGAINST: StatutoryArgument = {
  heading: "Official Statement",
  paragraphs: [
    "Vote NO on 5 to protect public schools, healthcare, and public safety.",
    "Question 5 would put a strict limit on state revenue and investment, requiring repeated budget cuts. Healthcare costs would rise, and cities and towns would have to raise property taxes or lay off teachers and firefighters.",
    "Question 5 would reduce the state's ‘Rainy Day’ fund, forcing massive budget cuts to schools, healthcare, affordable housing, and public safety during recessions, when spending to create jobs and support residents is needed most.",
    "Question 5 would include revenue from the ‘millionaires’ tax,’ which funds schools and transportation, in the complex, unpredictable algorithm that sets the revenue limit. Millionaires would get frequent tax rebates, while the rest of us pay the price.",
    "Question 5 would even threaten Massachusetts' bond rating, raising the cost of repairing bridges and schools.",
    "The multi-millionaires funding Question 5 don't need public services themselves. Vote NO on 5.",
  ],
  authoredBy:
    "Colette Berard, History Teacher, Andover Public Schools, Protect Massachusetts' Future",
};

// ── The Legislature's own record ──────────────────────────────────────────

export interface CommitteeReport {
  kind: "majority" | "minority";
  /** What the report asked the General Court to do. */
  recommendation: string;
  /**
   * What the report argues, in plain language.
   *
   * Written from the report itself and marked as synthesis on the page, so it
   * is never mistaken for the committee's own words. It sits outside the rule
   * for the same reason. The verbatim text is one click away, which is what
   * makes a summary safe to offer here: a reader who doubts it can check it.
   */
  summary: string;
  /** What the summary was written from. */
  summarySourceIds: string[];
  /** The prompt behind the summary, shown with its sources. */
  summaryPrompt: string;
  /** The reasoning, condensed to the passages that are about Question 5. */
  paragraphs: string[];
  signers: { chamber: string; names: string[] }[];
}

/**
 * Both reports discuss Question 5 alongside a separate income-tax petition that
 * is not on the ballot. The guide's own note about that travels with them.
 */
export const REPORTS_NOTE =
  "Note: The reports relating to Question 5 make several references to an “Initiative Petition for a Law Relative to Reducing the State Personal Income Tax Rate from 5% to 4%.” This initiative is not one of the questions appearing on the 2026 State Election ballot.";

/**
 * The reports, whole.
 *
 * Every paragraph from the point each report begins arguing, in order, with
 * nothing cut and nothing reworded. An earlier version of this file carried a
 * condensed version, which cannot be true: the page marks these with the rule
 * it uses for the state's own words, and a summary in that rule claims an
 * authorship it does not have. Either it is what they wrote or it does not go
 * in the rule.
 *
 * Both reports open with several paragraphs of Article 48 procedure, which the
 * page describes in its own voice elsewhere; those are the only paragraphs not
 * here, and they precede the argument rather than forming part of it.
 *
 * The doubled full stop in "on March 30, 2026.." is the Commonwealth's, kept
 * because fixing a typo is still an edit.
 */
export const MAJORITY_REPORT: CommitteeReport = {
  kind: "majority",
  recommendation:
    "Recommends that the General Court take no action on Initiative Petition 25-17, House No. 5006.",
  summary:
    "The committee's worry is about timing. Today the cap is set from last year's cap. Question 5 would set it from what the state actually collected. After a bad year, collections are low, so the next year's cap is low too, and an ordinary recovery could push the state past it. The state would owe refunds in the same year it was trying to restore what it had cut and refill the rainy day fund. Counting the millionaires tax toward the cap makes refunds likelier still, and that money is set aside for schools and transportation. The committee also points out that no court has ruled on whether the measure is constitutional.",
  summarySourceIds: ["voterGuide"],
  summaryPrompt:
    "Explain the majority report's reasoning about Question 5 to someone who has never read a committee report. Short sentences, no jargon, and say what the mechanism actually does rather than naming it. Cover only the passages about the 62F petition, not the separate income-tax petition, and keep the committee's own emphasis rather than weighing its argument.",
  paragraphs: [
    "The Committee held a hearing on Initiative Petition 25-17, House 5006, Initiative Petition for a Law Relative to Limiting State Tax Collection Growth and Returning Surpluses to Taxpayers, and Initiative Petition 25-18, House 5007, Initiative Petition for a Law Relative to Reducing the State Personal Income Tax Rate from 5% to 4%, on March 30, 2026.. The Special Joint Committee on Initiative Petitions held public hearings throughout March 2026 to gather testimony and inform its review. The Committee considered input from subject matter experts, proponents and opponents of the Petitions, as well as members of the public. The full hearing record and supporting documentation is available to the public at malegislature.gov/Events/Hearings/Detail/5631.",
    "On May 4, 2026 a majority of the Special Joint Committee on Initiative Petitions (\"the Committee\") voted to recommend that the General Court take no action on Initiative Petition 25-17, House No. 5006, Initiative Petition for a Law Relative to Limiting State Tax Collection Growth and Returning Surpluses to Taxpayers and Initiative Petition 25-18, House No. 5007, Initiative Petition for a Law Relative to Reducing the State Personal Income Tax Rate from 5% to 4%.",
    "In reaching this determination, the Committee conducted a comprehensive review of the proposed measure, including a detailed analysis of its language, structure, and intended effect. The Committee evaluated testimony and supporting evidence presented during the public hearing, as well as supportive written submissions from policy and economic experts, advocacy and labor organizations, and members of the public. The review found that together, these Initiative Petitions would significantly weaken the Commonwealth's ability to respond to economic downturns by reducing revenues, limiting reserves, and triggering refunds after recessions, jeopardizing funding for essential services while disproportionately benefiting high-income earners over lower- and middle-income residents.",
    "The two Petitions, if implemented, would reduce or limit the amount of revenue the state government receives in a fiscal year. The Petition reducing the income tax from 5% to 4% would result in a projected loss of over $5.3 billion in state revenues in the first full fiscal year after implementation, according to an analysis by the Massachusetts Taxpayers Foundation. This reduction is equivalent to 406.7% of Fiscal Year (FY) 2026 Unrestricted General Government Aid, which is state aid that goes directly to cities and towns to reduce the amount of local spending funded by property taxes, or 73.1% of FY 2026 Chapter 70 education aid, which is state aid to cities, towns, and regional school districts to cover educational expenses. This reduction would have a drastic impact on state budgeting and the ability to fund the programs and services that the residents of the Commonwealth expect and deserve.",
    "During the hearing, the proponents of the Petition noted projected tax savings under the reduction of the income tax, but these savings are largely gained by taxpayers with over $1 million in taxable income. Those at the threshold of the Fair Share surtax – the amount where an additional 4% in income tax begins to be assessed – would see estimated tax savings of $10,744 per year, while full-time, married workers at $25 an hour would see savings of $381 per year, and a full-time, married couple earning an income of $80,115 would see savings of $713 per year, for example. Further to the benefit of million-dollar plus earners, the reduction in income tax would also reduce the current short-term capital gains tax on investments from 8.5% to 4%. Lower- and middle-income earners without substantial investment income would see a much smaller savings in income taxes compared to million-dollar plus earners.",
    "The Petition related to changing the formula that calculates the Chapter 62F revenue growth limit would tweak a law that has only been triggered twice since the law was enacted in 1986, once in 1987 and again in 2022. Chapter 62F was established to serve as a check on state spending by ensuring that revenue could not grow excessively. The law requires the Department of Revenue to issue a credit to taxpayers if total tax revenues in a given fiscal year exceed an annual cap tied to wage and salary growth in the Commonwealth. This Petition aims to change the Chapter 62F calculation by including revenues collected through the Fair Share Amendment, which are currently not part of the formula. It would also base the maximum revenue the state could collect on the actual amount of revenue collected in the previous year, rather than the current formula which is based on the previous year's limit. This would hinder the state's economic resiliency during uncertain times, as a bad economic year would likely result in lower revenues, and a resulting economic bounce back the following year would more likely trigger a tax refund. This would mean that the state would have less of an ability to restore funding to programs that were cut or to replenish the state's stabilization fund (\"Rainy Day Fund\") that is used to supplement a loss of revenue and keep programs funded during a bad economic outlook.",
    "In combination, these Petitions would severely impact the Commonwealth's ability to withstand fluctuating economic conditions created by periods of recession or high inflation, where expenses grow faster than revenue. In the Great Recession of 2008, Massachusetts turned to the Stabilization Fund to ensure that schools were able to be funded, programs were not drastically slashed across the board, and state employees would receive their paychecks. With the reduction in revenue from reducing the income tax, the state would very likely struggle to maintain a healthy set of reserves in the stabilization fund to get through a recession, and the new calculation of the Chapter 62F revenue limit would likely trigger refunds in the year following a recession. Combined, these Petitions have the potential to bring a devastating impact to funding for our roads, bridges, schools, safety net programs, while bringing minimal savings back to lower- and median-income residents and, instead, funding large tax savings and rebates for million- dollar plus earners.",
    "It is important to note that Article 48 of the Amendments to the Massachusetts Constitution, which governs the initiative petition process, requires the Attorney General to provide initial certification of initiative petitions that meet the specific and limited requirements listed in Article 48. In making a decision on whether to initially certify an initiative petition, the Attorney General does not evaluate a petition's broader constitutionality; her certification decision is limited only to the narrow criteria listed in Article 48. Thus, this Petition has been certified by the Attorney General under Article 48, but it has not been evaluated by her or the courts for its constitutionality at this time.",
    "For these reasons, a majority of the Committee recommends that the General Court take no action on Initiative Petition 25-17, House No. 5006, Initiative Petition for a Law Relative to Limiting State Tax Collection Growth and Returning Surpluses to Taxpayers, and Initiative Petition 25-18, House 5007, Initiative Petition for a Law Relative to Reducing the State Personal Income Tax Rate from 5% to 4%.",
  ],
  signers: [
    {
      chamber: "Senators",
      names: [
        "Cindy F. Friedman",
        "Brendan P. Crighton",
        "Paul R. Feeney",
        "Barry R. Finegold",
      ],
    },
    {
      chamber: "Representatives",
      names: [
        "Alice Hanlon Peisch",
        "Kate Hogan",
        "Frank A. Moran",
        "Michael S. Day",
        "David T. Vieira",
      ],
    },
  ],
};

export const MINORITY_REPORT: CommitteeReport = {
  kind: "minority",
  recommendation:
    "Recommends that the General Court adopt Initiative Petition 25-17, House 5006.",
  summary:
    "The minority's argument is about the cost of living. Massachusetts is one of the most expensive states to live in, and more people are leaving than arriving. Residents need relief from housing, childcare, and energy costs. On Question 5 itself the report makes one point: the state should not collect more than it needs to pay for essential services. Most of the report is about a separate proposal to cut the income tax, which is not on this ballot.",
  summarySourceIds: ["voterGuide"],
  summaryPrompt:
    "Explain the minority report's reasoning to someone who has never read a committee report. Short sentences, no jargon. Say plainly how much of it is about Question 5 rather than the separate income-tax petition.",
  paragraphs: [
    "Reducing the income tax would place an average of $1,500 in the pockets of Massachusetts families, providing meaningful financial relief and helping to make the Commonwealth more affordable across essential cost areas, including housing, childcare, electricity, fuel, and healthcare. Massachusetts is amongst the least affordable states to live in with one of the highest rates of net out-migration. Our neighbors, friends, and family are leaving and taking with them the state's economic future. The Commonwealth ranked last in private sector job creation, a bleak illustration of the state's waning economic vitality. Families and individuals of all income brackets are leaving the state in search of a more affordable cost of living because of the state's misaligned priorities, and without a significant change in course, the consequences of these policies will not meet the needs of residents. The Commonwealth turned a blind eye to reforming the state's so-called \"Right-to-Shelter Law\", which siphoned a multi-billion-dollar hole in the state budget, despite legislative efforts to reign in the law. Further, at its peak, more than $3,300 was spent per week per family, many of whom were not legally present and could not be legally permitted to contribute to the state's economy by entering the state's workforce. The Commonwealth's clean energy and climate plan adopted in the Global Warming Solutions Act has further exacerbated the affordability crisis. During the hearing for these petitions, some provided testimony suggested that a 1% cut to the state income tax was insignificant for Massachusetts residents. Providing tax relief is not simply a matter of economic policy; it is an acknowledgment of the everyday challenges facing residents and a commitment to making Massachusetts a place where people can afford to live, work, and build their futures. If Massachusetts hopes to remain competitive with neighboring states, it must meaningfully address the financial pressures residents face. Residents of the state need relief from the unaffordable policies that the state legislature and Governor have adopted, driving up the costs of housing and energy. These two initiative petitions provide a practical pathway toward relieving some of this burden by reducing the tax load on individuals and ensuring that the Commonwealth does not collect revenue beyond what is reasonably needed to fund essential services.",
    "For these reasons, the minority of the Committee recommends that the General Court adopt Initiative Petition 25-18, House 5007, Initiative Petition for a Law Relative to Reducing the State Personal Income Tax Rate from 5% to 4%, and Initiative Petition 25- 17, House 5006, Initiative Petition for a Law Relative to Limiting State Tax Collection Growth and Returning Surpluses to Taxpayers.",
  ],
  signers: [{ chamber: "Senator", names: ["Ryan C. Fattman"] }],
};

// ── The law itself ────────────────────────────────────────────────────────

export const FULL_TEXT_TITLE =
  "An Act relative to limiting state tax collection growth and returning surpluses to taxpayers.";

export const FULL_TEXT: { section: string; body: string }[] = [
  {
    section: "Section 1",
    body: "Section 2 of chapter 62F of the General Laws as appearing in the 2024 Official Edition is hereby amended by replacing the definitions of “Computed Maximum State Tax Revenues” and “State Tax Revenues” with the following: “Computed Maximum State Tax Revenues” means for any fiscal year beginning after June 30, 2027 an amount determined by multiplying the Net State Tax Revenues, as defined herein, for the immediately preceding fiscal year by the allowable state tax growth factor, as defined herein, for the then current fiscal year.",
  },
  {
    section: "Section 2",
    body: "Effective for purposes of any calculation under chapter 62F of the General Laws for any fiscal year beginning after June 30, 2027, Section 2BBBBBB of chapter 29 of the General Laws is hereby amended by striking out subparagraph (d).",
  },
  {
    section: "Section 3",
    body: "The provisions of this law are severable, and if any clause, sentence, paragraph or section of this chapter, or an application thereof, shall be adjudged by any court of competent jurisdiction to be invalid, such judgment shall not affect, impair, or invalidate the remainder thereof but shall be confined in its operation to the clause, sentence, paragraph, section, or application adjudged invalid.",
  },
];

/** Where the committee's own record lives, for anyone who wants the hearing. */
export const HEARING_RECORD = {
  label: "Hearing record, Special Joint Committee on Initiative Petitions",
  href: "https://www.mapletestimony.org/hearing/5631",
  detail: "Hearing held March 30, 2026. Committee reported May 4, 2026.",
};
