// Content for the 2026 Massachusetts Chapter 62F reform ballot question.
//
// All 62F-specific data and prose that drives the page lives here (and in
// ./sources). The section components in components/ballot render from these
// shapes, so this module parallels src/app/data/rent-control/content.ts exactly
// — a new ballot question is authored by supplying a parallel module, not by
// editing layout. Facts reference sources by id (see ./sources).

import type {
  Stakeholder,
  VoteSide,
  Arg,
  ArgSet,
  ArgSourceTag,
  ArgFilter,
  TL,
  ClaimRow,
  PollRow,
  Committee,
  Study,
  SrcKind,
} from "../../components/ballot/types";
import { SOURCES } from "./sources";

/**
 * The hero's own wording. It covers the same ground as CURRENT_LIMIT and
 * PROPOSED_CHANGE below, but weaves the calculation into the sentence that
 * introduces the law and leads with the change of base rather than the surtax.
 * Worded separately for that reason: the two are not substitutable, so a change
 * to how the measure is described has to be made in both places. Only the
 * emphasised clause is shared, since both set the same words in bold.
 */
const HERO_LEAD = "The proposed law would modify ";
const HERO_REST =
  ", a voter-approved law that requires Massachusetts to refund taxpayers when it surpasses its ";

const CURRENT_LIMIT =
  "Massachusetts' revenue limit is calculated by taking last year's limit and adding the average wage growth in Massachusetts over the last three years. It also excludes the 2022 surtax on yearly income over $1 million.";
const CURRENT_LIMIT_SENTENCE =
  "Massachusetts' revenue limit is calculated by taking last year's limit and adding the average wage growth in Massachusetts over the last three years.";
const PROPOSED_CHANGE_LEAD =
  "Question 5 would include the surtax in the calculation and ";
const PROPOSED_CHANGE_EMPHASIS =
  "would change the base from last year's limit to last year's actual tax collections";
const PROPOSED_CHANGE_TAIL = ", triggering refunds more frequently.";
const PROPOSED_CHANGE =
  PROPOSED_CHANGE_LEAD + PROPOSED_CHANGE_EMPHASIS + PROPOSED_CHANGE_TAIL;

export const RC = {
  /** Assigned ballot number for the Nov. 2026 state election. */
  number: 5,
  title: "State Revenue Limit & Rebate",
  plain:
    "Change what the tax limit is based on and what counts toward it, making tax refunds more likely",
  tags: ["Tax Policy", "State Budget", "Taxpayer Refunds"],

  // The Attorney General's certified summary, verbatim, as it appears on
  // signature sheets and in the voter guide. Unlike most prose on this page,
  // this is the real document text and should not be edited for style.
  officialSummary:
    "This proposed law would change the limit on how much revenue the state can collect in a given year. The proposal would limit state revenue in a given year to the net amount of state revenue from the year before, increased by a rate equal to the average growth of wages and salaries in Massachusetts over the most recent three years. If revenue collected by the state in a given year exceeds the limit, the excess amount would be refunded to taxpayers the following year. The proposed law would include all revenue from the surtax on incomes over $1 million when calculating the revenue limit and when determining whether state revenue exceeds the limit. The provisions of the proposed law would all be effective as of July 1, 2027. The proposed law states that, if any of its parts were declared invalid, the other parts would stay in effect.",

  /**
   * The one-breath version, for the top of a page: what the law already does,
   * then what this question would change about it. The first sentence is what
   * makes the second legible, since "how that limit gets calculated" assumes a
   * limit the reader has not met yet. It also names the revenue limit in the
   * same words as the question's own title.
   *
   * Kept separate from `plain` because `plain` is a subtitle and this is a
   * briefing; they are different lengths doing different jobs.
   *
   * Segments rather than one string because the two things the question
   * actually changes are set in emphasis, the conjunction between them is not,
   * and the statute is a link. Bolding "and" would make the pair read as one
   * long phrase instead of two. All of that is a content decision, so it is
   * stated here rather than being marked up at the call site.
   */
  soundbite: [
    [
      // Parked: the footnote markers and their hover notes. `heroFootnotes`
      // below still holds the copy, and Segments still renders both, so this
      // is one line per marker to bring back.
      // { text: `${HERO_LEAD}Chapter 62F${HERO_REST}` },
      // { text: "revenue limit", footnote: 1 },
      // { text: ", changing " },
      // { text: "how that limit gets calculated", emphasis: true, footnote: 2 },
      // { text: " and " },
      // { text: "what would count towards it", emphasis: true, footnote: 3 },
      // { text: "." },
      { text: `${HERO_LEAD}Chapter 62F${HERO_REST}revenue limit, ` },
      {
        text: "changing how that limit gets calculated and what would count towards it, making refunds more likely.",
        emphasis: true,
      },
    ],
  ] as {
    text: string;
    emphasis?: boolean;
    italic?: boolean;
    href?: string;
    block?: boolean;
    footnote?: number;
  }[][],
  /**
   * The two mechanical changes, listed rather than written into the sentence
   * above. The summary says what the measure does; this says what it edits.
   */
  keyChanges: {
    label: "Key Changes:",
    items: [
      "Updates the base formula from last year's tax limit to last year's actual tax collections",
      "Includes the 2022 surtax on $1M+ incomes that funds education and transportation",
      "Because the limit is expected to sit lower, refunds will be more likely",
    ],
  },

  /**
   * The detail the summary sentence leaves out, kept out of it. Numbered to
   * the three terms it marks, so the sentence stays one breath long and the
   * mechanics are there for whoever wants them.
   */
  heroFootnotes: [
    [
      {
        text: "Massachusetts Yearly Revenue Limit",
        emphasis: true,
        block: true,
      },
      {
        text: "Last year's limit + avg wage growth over 3yrs",
        block: true,
      },
    ],
    [
      { text: "Changes the base from last year's limit to " },
      { text: "last year's actual tax collections", emphasis: true },
      { text: "." },
    ],
    [
      {
        text: "Includes the 2022 surtax on $1M+ incomes.",
        emphasis: true,
        block: true,
      },
      {
        text: "How this would impact the surtax's dedicated education and transportation purpose is an open legal question.",
        italic: true,
        block: true,
      },
    ],
  ] as {
    text: string;
    emphasis?: boolean;
    italic?: boolean;
    href?: string;
    block?: boolean;
    footnote?: number;
  }[][],
  /**
   * Kept as two constants above rather than one string: the sentence about
   * current law and the sentence about the change are edited independently,
   * and composing them here means neither can drift from the whole.
   */
  overviewSummary: `${CURRENT_LIMIT} ${PROPOSED_CHANGE}`,
  /**
   * The same paragraph in segments, for the page that sets part of it in
   * emphasis. Which words carry the emphasis is a content decision, so it is
   * stated here rather than marked up at the call site, and both forms are
   * built from the same constants so they cannot disagree.
   */
  /**
   * The answer to "what would it change?", written as consequence first and
   * mechanism second: why refunds get more likely, then what about the formula
   * makes that so. `overviewSummary` above states the same change the other way
   * round, mechanism first, for the tabbed page.
   */
  changeSummary: [
    `${CURRENT_LIMIT_SENTENCE} Question 5 would change the base from last year's limit to last year's actual tax collections, and would include the 2022 surtax on $1M incomes that funds education and transportation.`,
    "Because the base would track real collections rather than the higher allowable maximum and would include the surtax, the limit would generally sit lower and be exceeded more often, triggering refunds in more years. How the change would impact the surtax's dedicated education and transportation purpose is an open legal question.",
  ],
  overviewSegments: [
    { text: `${CURRENT_LIMIT} ${PROPOSED_CHANGE_LEAD}` },
    { text: PROPOSED_CHANGE_EMPHASIS, emphasis: true },
    { text: PROPOSED_CHANGE_TAIL },
  ] as { text: string; emphasis?: boolean }[],

  yes: "The 62F cap is recalculated. Each year's limit is set from actual prior-year collections plus three-year wage growth, and surtax revenue counts toward the total — making the state more likely to exceed the cap and issue automatic refunds to taxpayers.",
  no: "No change in the law. Chapter 62F keeps its current formula, which bases the cap on the prior year's allowable limit and excludes 2022 surtax revenue; refunds continue to trigger only in the rare years collections run far ahead of the cap.",

  covered: [
    "All state tax revenue counted under Chapter 62F, recalculated from actual prior-year collections",
    "Revenue from the 2022 income surtax on earnings above $1 million (Section 2BBBBBB), newly counted toward the cap",
    "Every taxpayer who files a Massachusetts return, who receives any triggered refund in proportion to tax paid",
    "The state operating budget, whose available revenue is constrained by the lower recalculated cap",
  ],
  exempt: [
    "The 4% surtax rate itself — the measure counts surtax revenue toward the cap but does not repeal or lower the surtax",
    "Local (municipal) taxes, which are outside Chapter 62F entirely",
    "Federal funds and non-tax revenue, which are not 'State Tax Revenue' under the statute",
    "The dedicated purposes of surtax revenue (education and transportation) as a spending question — the measure changes the cap calculation, not the constitutional earmark",
  ],

  stakeholders: [
    {
      group: "Taxpayers (all filers)",
      impact: "benefits",
      body: "More frequent automatic refunds when collections exceed the recalculated cap. Refunds are distributed in proportion to income tax paid, so higher earners receive larger dollar amounts.",
      basis:
        "Petition text; not disputed by either campaign",
    },
    {
      group: "Residents using state services",
      impact: "cost",
      body: "Residents who rely on state-funded services would see reductions if refunds draw down the operating budget; which services, and by how much, depends on future revenue.",
      basis:
        "Opponent statements; the impact depends on future revenue",
    },
    {
      group: "Higher-income filers",
      impact: "benefits",
      body: "Because 62F refunds are proportional to tax liability, the largest per-filer refund dollars flow to the highest earners — a distribution opponents highlight and proponents do not dispute.",
      basis:
        "Petition text; not disputed by either campaign",
    },
    {
      group: "Education & transportation (surtax-funded)",
      impact: "cost",
      disputed: true,
      body: "Opponents argue counting surtax revenue toward the cap could pull dollars voters dedicated to schools and transit into refunds; proponents dispute that the earmark is affected.",
      basis:
        "Opponent statements; proponents dispute the earmark is affected",
    },
    {
      group: "Business & fiscal-conservative groups",
      impact: "benefits",
      body: "Supporters view a tighter cap as restoring spending discipline and improving competitiveness. Some business-aligned fiscal watchdogs (MTF) nonetheless oppose it as destabilizing.",
      basis:
        "Proponent statements; MTF dissents",
    },
    {
      group: "Public-sector workers",
      impact: "cost",
      body: "The opposition committee projects layoffs if billions are diverted from the budget; the size of any impact depends on future revenue and is not yet known.",
      basis:
        "Opponent statements; the impact depends on future revenue",
    },
  ] as Stakeholder[],

  overviewFraming:
    "Supporters argue the 62F cap has been quietly loosened over time — especially by excluding the 2022 surtax — so a law voters approved to force refunds now almost never does; recalculating from actual collections would restore its original bite. Opponents argue the change would steadily lower the cap, make revenue less predictable, and divert billions from schools, transit, and public services toward refunds that flow disproportionately to high earners. The support campaign is well funded and largely in-kind; organized opposition had not reported spending in the first filing window.",

  overviewVotes: {
    yes: {
      vote: "yes",
      summary:
        "Recalculates the revenue limit and includes the 2022 surtax on $1M+ incomes.",
      organizerIds: ["taxpayers-affordable-ma"],
      funding: "$1.71m",
      fundingCash: "$100k",
      fundingInKind: "$1.61m",
      sideLabel: "Supporting Orgs",
      official: {
        text: "This is placeholder language standing in for the endorsing parties' official statement as it will appear in the Information for Voters once the question is numbered. It will lay out, in the state's official wording, why supporters believe voters should vote YES to restore the taxpayer-refund guarantee of Chapter 62F.",
        who: "Rep for Taxpayers for an Affordable Massachusetts",
      },
    },
    no: {
      vote: "no",
      summary:
        "Makes no change in the law. Chapter 62F retains its current formula and excludes the 2022 surtax.",
      organizerIds: ["protect-ma-future"],
      funding: "$0",
      sideLabel: "Opposing Orgs",
      official: {
        text: "This is placeholder language standing in for the opposing parties' official statement as it will appear in the Information for Voters once the question is numbered. It will lay out, in the state's official wording, why opponents believe voters should vote NO to protect funding for schools, healthcare, and public services.",
        who: "Rep for Protect Massachusetts' Future",
      },
    },
  } as { yes: VoteSide; no: VoteSide },

  timeline: [
    {
      when: "Aug 7, 2025",
      label: "Petition filed",
      body: "The Attorney General announced the initiative had been filed (No. 25-17).",
      ids: ["ballotpedia", "petition"],
    },
    {
      when: "Sep 3, 2025",
      label: "Cleared for signatures",
      body: "The AG certified the petition; signature gathering began.",
      ids: ["ballotpedia"],
    },
    {
      when: "Nov 19, 2025",
      label: "Signatures submitted",
      body: "Supporters announced they had gathered roughly 86,000 first-round signatures; WBUR reported the measure was among a record field of 2026 ballot questions moving forward.",
      ids: ["wburSigs", "cwbRecord", "wburPreview"],
    },
    {
      when: "Dec 30, 2025",
      label: "Signatures certified",
      body: "The Elections Division certified 85,588 valid signatures (74,574 required), sending the measure to the Legislature.",
      ids: ["ballotpedia"],
    },
    {
      when: "Feb 5, 2026",
      label: "Introduced as H.5006",
      body: "The initiative entered the Legislature as House Bill 5006.",
      ids: ["h5006"],
    },
    {
      when: "Feb 2026",
      label: "Legislative leaders push back",
      body: 'Senate President Spilka and others labeled the tax questions as special-interest measures benefiting high earners; coverage cast the pair as an emerging "Beacon Hill boogeyman."',
      ids: ["masslive62F", "cwbBoogeyman"],
    },
    {
      when: "Mar 30, 2026",
      label: "Fiscal analysts weigh in",
      body: "MassBudget testified in opposition; analysts debated whether the change would improve competitiveness or destabilize the budget.",
      ids: ["massBudget", "wgbhAnalysts"],
    },
    {
      when: "May 5, 2026",
      label: "Legislature does not act",
      body: "With no legislative approval by the deadline, second-round signature collection began.",
      ids: ["ballotpedia"],
    },
  ] as TL[],

  processFacts: [
    {
      k: "Measure type",
      v: "Indirect initiated state statute — goes to the Legislature first, then to voters if it does not act.",
      ids: ["ballotpedia"],
    },
    {
      k: "First-round signatures",
      v: "74,574 required (3% of the last gubernatorial vote); ~86,000 submitted; 85,588 certified.",
      ids: ["ballotpedia", "wburSigs"],
    },
    {
      k: "Second-round signatures",
      v: "12,429 required (0.5%); deadline July 1, 2026.",
      ids: ["ballotpedia"],
    },
    {
      k: "Distribution rule",
      v: "No more than 25% of certified signatures may come from a single county.",
      ids: ["ballotpedia"],
    },
    {
      k: "Approval threshold",
      v: "A simple majority approves the measure, but affirmative votes must exceed 30% of all votes cast in the election.",
      ids: ["ballotpedia"],
    },
    {
      k: "Legislative window",
      v: "The Legislature had until the first Wednesday of May 2026 to enact the measure; it did not, triggering the second signature round.",
      ids: ["ballotpedia"],
    },
  ],

  relatedContext: [
    {
      k: "Current law (62F)",
      v: "Chapter 62F, created by Question 3 in 1986, caps allowable state tax revenue at the prior year's limit plus three-year wage growth; excess is refunded. It has triggered only twice in ~40 years — most recently ~$3B in 2022.",
      ids: ["chapter62F", "question3_1986", "wbur62F2022"],
    },
    {
      k: "The surtax carve-in",
      v: "Revenue from the 2022 'millionaire's tax' (4% on income above $1M, Section 2BBBBBB) is not currently counted as State Tax Revenue under 62F; this measure would count it toward the cap.",
      ids: ["section2BBBBBB", "question1_2022", "fairShare"],
    },
    {
      k: "Companion question",
      v: "The same coalition backed a separate 2026 question to cut the state income tax rate from 5% to 4%; the two were discussed and funded together until the Supreme Judicial Court struck the income-tax question from the ballot in June, leaving this as the surviving tax question.",
      ids: ["cwbBoogeyman", "masslive62F", "globeTaxCutOff"],
    },
    {
      k: "Other states",
      v: "Massachusetts is one of 19 states with a tax revenue limit and one of eight with a revenue limit but no separate expenditure limit.",
      ids: ["taxPolicyCenter"],
    },
  ],

  // "All" — the best and most common arguments rolled up across the source
  // categories (fiscal research, organization / elected-official testimony),
  // with design points derived from the official documents.
  yesArgs: [
    {
      title: "Spending Has Outpaced Wages",
      body: "The proponents' brief argues state spending has grown at nearly double the rate of Massachusetts wages and inflation, and that a revised cap tied to actual collections would have returned roughly $19 billion to taxpayers over four decades.",
    },
    {
      title: "Automatic, Broad-Based Relief",
      body: "Because the refund is triggered by a formula rather than a legislative vote, supporters frame it as reliable relief that reaches every filer when the state runs a genuine surplus — not a discretionary giveaway.",
    },
    {
      title: "Restores a Guarantee Voters Already Approved",
      body: "Supporters argue voters passed 62F in 1986 to force refunds when the state over-collects, but exclusions, especially the 2022 surtax carve-out, have made it trigger only twice in 40 years.",
    },
  ] as Arg[],
  noArgs: [
    {
      title: "The Benefits Flow to the Top",
      body:
        "Because 62F refunds are proportional to tax paid, critics note the largest dollar refunds go to the highest earners, while the services cut to fund them are used most by everyone else.",
    },
    {
      title: "Cuts Hit Schools, Transit, and Health Care",
      body: "The opposition campaign projects that diverting billions from the budget, and counting dedicated surtax revenue toward the cap, would force layoffs and cuts to classrooms, hospitals, and infrastructure that communities depend on.",
    },
    {
      title: "It Progressively Lowers the Budget Over Time",
      body: "Opponents argue basing each year's cap on actual collections means every slow-revenue year or refund permanently lowers the ceiling, steadily shrinking the revenue available for public services regardless of need.",
    },
  ] as Arg[],

  argsBySource: {
    official: {
      yes: [
        {
          title: "The Text Ties the Cap to Real Collections",
          body: "The petition recalculates the limit from the net revenue actually collected the prior year, which supporters say closes the gap between the cap voters intended and the far higher ceiling that has accumulated under current law.",
        },
        {
          title: "It Names the Surtax Explicitly",
          body: "By adding Section 2BBBBBB revenue to the definition of State Tax Revenue, the text directly counts the 2022 surtax toward the cap — the specific 'loophole' supporters say has kept 62F from triggering.",
        },
        {
          title: "Relief Is Automatic, Not Discretionary",
          body: "Because 62F operates by formula, the text produces refunds without a legislative vote whenever collections exceed the recalculated cap — the mechanism supporters value most.",
        },
      ],
      no: [
        {
          title: "The Formula Only Moves One Direction",
          body: "Basing next year's cap on this year's actual collections means the ceiling falls after every weak year and never fully recovers — a downward drift the official text builds in with no floor or recovery mechanism.",
        },
        {
          title: "No Carve-Out for Dedicated Revenue",
          body: "The text folds surtax revenue into the cap without exempting the education and transportation purposes voters attached to it in 2022, raising an unresolved conflict between two voter mandates.",
        },
        {
          title: "No Adjustment for Recessions",
          body: "The text contains no provision to suspend the tighter cap during downturns, when refunds would most reduce the state's ability to invest counter-cyclically.",
        },
      ],
    },
    academic: {
      yes: [
        {
          title: "Tax Limits Can Enforce Discipline",
          body: "The tax-and-expenditure-limit literature holds that formula-based caps can restrain spending growth relative to the economy — the discipline supporters say 62F was meant to provide.",
        },
        {
          title: "Actual-Collections Bases Are Common",
          body: "Anchoring a limit to realized revenue rather than a theoretical maximum is a recognized TEL design; proponents argue it simply makes the cap track what the state truly takes in.",
        },
        {
          title: "Predictable Rules Beat Ad Hoc Rebates",
          body: "A standing formula gives taxpayers and markets a clear rule, which supporters contrast with one-off, politically timed relief packages.",
        },
      ],
      no: [
        {
          title: "Self-Lowering Caps Are a Known Failure Mode",
          body: "Fiscal analysts warn that limits pegged to actual revenue can drift steadily downward after recessions, locking in austerity — the pattern MassBudget projects here.",
        },
        {
          title: "Volatility Undermines Planning",
          body: "Because the cap would move with revenue swings, multi-year commitments to schools, transit, and debt service become harder to budget, raising the cost of volatility.",
        },
        {
          title: "Counter-Cyclical Investment Gets Harder",
          body: "The research on TELs finds they can bind hardest exactly when states most need to spend, weakening the tools available to soften downturns.",
        },
      ],
    },
    organization: {
      yes: [
        {
          title: "Close the 62F Loophole",
          body: "Business and fiscal-policy groups frame the surtax carve-out as a loophole that has neutered a popular law, and the fix as simply restoring what voters approved.",
        },
        {
          title: "Competitiveness and Cost of Living",
          body: "Supporting organizations argue predictable tax relief helps retain residents and employers as living costs rise, and that spending discipline improves the state's competitive position.",
        },
        {
          title: "Give Money Back When Surpluses Are Real",
          body: "Endorsing groups emphasize the measure only returns money when collections genuinely exceed the cap — relief tied to real surpluses, not new borrowing.",
        },
      ],
      no: [
        {
          title: "Billions Out of a Fixed Budget",
          body: "Labor and community groups argue removing several billion dollars from a roughly $61B budget would destabilize the workforce and the services families rely on.",
        },
        {
          title: "Even Fiscal Watchdogs Are Wary",
          body: "The business-aligned Massachusetts Taxpayers Foundation opposes the measure, arguing its impacts would be counterproductive for the state's fiscal sustainability.",
        },
        {
          title: "It Undercuts What Voters Just Funded",
          body: "Opponents note voters approved the surtax in 2022 to fund education and transportation, and say counting that revenue toward a refund cap works against that recent choice.",
        },
      ],
    },
    elected: {
      yes: [
        {
          title: "Voters Deserve the Refund They Approved",
          body: "Sympathetic officials frame a YES as honoring the 1986 vote — restoring an automatic taxpayer protection rather than leaving it dormant.",
        },
        {
          title: "Pressure to Control Spending",
          body: "Some officials view the measure as a check on budget growth that has, in their telling, outpaced what taxpayers can sustain.",
        },
        {
          title: "Relief as Cost-of-Living Response",
          body: "Officials channel affordability frustration into support, arguing periodic refunds put money back in residents' pockets when the state runs ahead.",
        },
      ],
      no: [
        {
          title: "A Special-Interest Tax Cut",
          body: "Senate President Spilka and other leaders characterize the tax questions as special-interest measures whose benefits flow mainly to high earners.",
        },
        {
          title: "Unequal Refunds",
          body: "Officials point out that under 62F's proportional formula, millionaires receive far larger refunds than minimum-wage workers for the same measure.",
        },
        {
          title: "Danger During Federal Uncertainty",
          body: "Legislators warn that constraining revenue during a period of federal funding uncertainty would leave the state unable to backfill lost programs.",
        },
      ],
    },
    citizen: { yes: [], no: [] },
  } as Record<ArgSourceTag, ArgSet>,

  consensus: [
    "Chapter 62F currently triggers refunds only in rare years — twice in nearly four decades — and the measure would make triggers more frequent.",
    "Refunds under 62F are distributed in proportion to income tax paid, so higher earners receive larger dollar amounts; both sides describe the mechanism the same way.",
    "The measure changes how the revenue cap is calculated; it does not repeal the 2022 surtax rate itself.",
  ],
  disagreement: [
    "Whether counting surtax revenue toward the cap 'closes a loophole' or overrides the dedicated education-and-transportation purpose voters approved in 2022.",
    "Whether an actual-collections base restores the law's original intent or steadily lowers the budget over time.",
    "The size and probability of service cuts — the central empirical dispute.",
    "Whether more frequent refunds are broad-based relief or a transfer skewed toward high earners.",
    "Whether tighter caps help or hurt the state's competitiveness and fiscal stability.",
  ],
  openQuestions: [
    "How the recalculated cap would interact legally with the constitutional earmark on surtax revenue for education and transportation.",
    "How often refunds would actually trigger under real future revenue paths — estimates depend on assumptions the text does not fix.",
    "Whether the cap would bind hardest during or after recessions, and with what effect on counter-cyclical spending.",
    "What the official statement of fiscal consequences will say once the Information for Voters is published.",
    "How the measure interacts with the companion income-tax-cut question if both pass.",
    "Whether the Legislature would seek to amend the statute after passage, as it may for voter-approved statutes.",
  ],

  // Checkable claims pulled from the arguments for and against, then vetted.
  claims: [
    {
      claim:
        "Chapter 62F has triggered taxpayer refunds only twice since 1986.",
      mark: "verified",
      source: "outside",
      note: "Confirmed by Ballotpedia and reporting on the 2022 trigger (~$3B refunded) — the second in the law's history.",
      ids: ["ballotpedia", "wbur62F2022"],
    },
    {
      claim:
        "62F refunds are distributed in proportion to income tax paid, so higher earners receive larger amounts.",
      mark: "verified",
      source: "outside",
      note: "The proportional-to-liability design is a feature of the statute and was borne out in the 2022 distribution; not in dispute between the campaigns.",
      ids: ["chapter62F", "masslive62F"],
    },
    {
      claim:
        "“A revised revenue limit would have returned nearly $19 billion to taxpayers over four decades (24 refunds).”",
      mark: "attributed",
      source: "outside",
      note: "From the Massachusetts Opportunity Alliance policy brief, which supports the measure — a proponent projection based on its own recalculation, not an independent estimate.",
      ids: ["maoBrief"],
    },
    {
      claim:
        "“The measures would strip billions from classrooms, hospitals, and research and eliminate hundreds of thousands of jobs.”",
      mark: "attributed",
      source: "testimony",
      note: "Asserted by Protect Massachusetts' Future about the two tax questions combined — a campaign projection, not an official fiscal estimate.",
      ids: ["protectMAFuture", "mapleTestimony"],
    },
  ] as ClaimRow[],

  studies: [
    {
      citation: "Massachusetts Opportunity Alliance, Policy Brief (2025)",
      affiliation: "commissioned by the campaign supporting the measure",
      finding:
        "Projects that recalculating the 62F limit from actual collections would have triggered refunds 24 times over four decades, returning roughly $19 billion; argues spending has grown near double the rate of wages and inflation.",
      url: SOURCES.maoBrief.url,
    },
    {
      citation: "Massachusetts Budget & Policy Center, Testimony (2026)",
      affiliation: "opposes the measure",
      finding:
        "Argues the reform would progressively lower the revenue cap after slow years and refunds, forcing unpredictable cuts and impairing counter-cyclical investment following recessions.",
      url: SOURCES.massBudget.url,
    },
    {
      citation: "Tax Policy Center, Tax and Expenditure Limits (briefing)",
      affiliation: "nonpartisan reference",
      finding:
        "Describes how TELs work across states; notes Massachusetts is one of 19 states with a tax revenue limit and one of eight with a revenue limit but no expenditure limit.",
      url: SOURCES.taxPolicyCenter.url,
    },
    {
      citation: "Massachusetts Taxpayers Foundation, Position Paper (2026)",
      affiliation: "business-aligned; opposes the measure",
      finding:
        "Concludes the 62F and income-tax questions would be counterproductive for affordability, competitiveness, and fiscal sustainability, and offers an alternative agenda.",
      url: SOURCES.mtfPosition.url,
    },
  ] as Study[],

  mediaPhases: [
    {
      phase: "The competitiveness-vs-chaos debate",
      when: "March 2026",
      articles: [
        {
          outlet: "GBH News",
          title:
            "More competitive or more chaotic? Tax cut analysts paint possible outcomes",
          url: SOURCES.wgbhAnalysts.url,
          type: "News",
        },
        {
          outlet: "Mass. Budget & Policy Center",
          title:
            "Testimony in opposition to the two anti-tax ballot initiatives",
          url: SOURCES.massBudget.url,
          type: "Testimony",
        },
      ],
    },
    {
      phase: "Legislative pushback",
      when: "February 2026",
      articles: [
        {
          outlet: "MassLive",
          title:
            "Top legislators slap 'special interest' tag on ballot questions",
          url: SOURCES.masslive62F.url,
          type: "News",
        },
        {
          outlet: "CommonWealth Beacon",
          title: "Tax ballot questions emerging as Beacon Hill boogeyman",
          url: SOURCES.cwbBoogeyman.url,
          type: "News",
        },
      ],
    },
    {
      phase: "Signature drive & certification",
      when: "November – December 2025",
      articles: [
        {
          outlet: "WBUR",
          title:
            "Ballot questions expected to move forward after signature filing",
          url: SOURCES.wburSigs.url,
          type: "News",
        },
        {
          outlet: "WBUR",
          title:
            "Massachusetts could see a record number of ballot questions in 2026",
          url: SOURCES.wburPreview.url,
          type: "News",
        },
      ],
    },
  ],

  polls: [
    {
      pollster: "Polity Research Consulting (for Retailers Assoc. of MA)",
      dates: "Apr 29 – May 7, 2026",
      sample: "608 respondents",
      moe: "±3.97%",
      support: 76,
      oppose: 12,
      undecided: 12,
      ids: ["polityPoll", "ballotpedia"],
    },
  ] as PollRow[],

  committees: [
    {
      name: "Taxpayers for an Affordable Massachusetts",
      stance: "yes",
      total: "$1,707,296",
      cash: "$100,000",
      inKind: "$1,607,296",
      spent: "$1,607,296",
      note: "Support is overwhelmingly in-kind, driven by the Massachusetts Opportunity Alliance; the committee also backed the companion income-tax-cut question, which the Supreme Judicial Court struck from the ballot in June.",
      donors: [
        {
          name: "Massachusetts Opportunity Alliance",
          amount: "$1,600,000",
          kind: "in-kind",
        },
        {
          name: "Massachusetts High Technology Council",
          amount: "$57,296",
          kind: "cash + in-kind",
        },
        { name: "Pioneer Institute", amount: "$50,000", kind: "cash" },
      ],
    },
    {
      name: "Protect Massachusetts' Future",
      stance: "no",
      total: "$0",
      cash: "$0",
      inKind: "$0",
      spent: "$0",
      note: "The opposition committee had registered but reported no contributions or spending through the January 20, 2026 filing window; its coalition is led by labor and community organizations.",
      donors: [],
    },
  ] as Committee[],
};

// ── Ballot Coverage timeline (Grace variant "Path to the Ballot") ───────────
// Curated milestones, newest first, each with the articles/documents that cover
// it (outlet · title · type). Distinct from RC.timeline (which drives the
// Background tab's Path card), so the two can diverge.
export type CoverageType = "NEWS" | "ADVOCACY" | "GOV'T";
export type CoverageArticle = {
  outlet: string;
  title: string;
  type: CoverageType;
  url: string;
};
export const BALLOT_TIMELINE: {
  when: string;
  label: string;
  body?: string;
  articles: CoverageArticle[];
}[] = [
  {
    when: "Jul 2026",
    label: "Senate moves to repeal Chapter 62F outright",
    body: "An amendment to an economic-development bill, filed by Sen. Jason Lewis, would repeal Chapter 62F entirely. At least 20 of the Senate's 40 members signed on as cosponsors. If it becomes law, Question 5 would have little practical effect, since the chapter it amends would no longer exist. The House has been more cautious.",
    articles: [
      {
        outlet: "CommonWealth Beacon",
        title:
          "Eleventh-hour Senate move could upend tax rebate ballot question",
        type: "NEWS",
        url: SOURCES.cwbSenateRepeal.url,
      },
      {
        outlet: "State House News Service",
        title:
          "As Senate weighs tax cap repeal, speaker treads carefully in House",
        type: "NEWS",
        url: SOURCES.shnsSpeakerTreads.url,
      },
    ],
  },
  {
    when: "Jul 21, 2026",
    label: "Certified and numbered Question 5",
    body: "The Secretary of the Commonwealth certified nine questions for the November 3 ballot and assigned this measure Question 5. The Elections Division set the order to make best use of space on the ballot, using the length of each summary as the main consideration.",
    articles: [
      {
        outlet: "Secretary of the Commonwealth",
        title: "Ballot Question Numbers Assigned for November Ballot",
        type: "GOV'T",
        url: SOURCES.secBallotNumbers.url,
      },
      {
        outlet: "CommonWealth Beacon",
        title:
          "Marijuana question survives as all nine ballot questions get their numbers",
        type: "NEWS",
        url: SOURCES.cwbNumbers.url,
      },
      {
        outlet: "WBUR",
        title:
          "Massachusetts has finalized its list of 9 ballot questions for 2026. Now comes the tricky part",
        type: "NEWS",
        url: SOURCES.wburFinalized.url,
      },
    ],
  },
  {
    when: "Jun 2026",
    label: "Companion tax question struck; this one survives",
    body: "The Supreme Judicial Court removed the companion income-tax-cut question from the ballot, along with the rent-control question. This measure was unaffected, leaving it as the surviving tax question of the cycle.",
    articles: [
      {
        outlet: "Boston Globe",
        title:
          "With tax cut off the ballot, the battle shifts to making excess revenue refunds more frequent",
        type: "NEWS",
        url: SOURCES.globeTaxCutOff.url,
      },
    ],
  },
  {
    when: "May 5, 2026",
    label: "Legislature does not act",
    body: "With no legislative approval by the deadline, second-round signature collection began.",
    articles: [
      {
        outlet: "MAlegislature.gov",
        title: "House Bill 5006 — the initiative's legislative form",
        type: "GOV'T",
        url: SOURCES.h5006.url,
      },
    ],
  },
  {
    when: "Mar 2026",
    label: "Fiscal analysts weigh in",
    body: "MassBudget and the Massachusetts Taxpayers Foundation testified against the measure, and analysts debated whether it would improve competitiveness or destabilize the state budget.",
    articles: [
      {
        outlet: "GBH News",
        title:
          "More competitive or more chaotic? Tax cut analysts paint possible outcomes",
        type: "NEWS",
        url: SOURCES.wgbhAnalysts.url,
      },
      {
        outlet: "MassBudget",
        title:
          "Testimony in Opposition to the Two Anti-tax Ballot Initiatives: Cutting the Personal Income Tax & Amending Chapter 62F",
        type: "ADVOCACY",
        url: SOURCES.massBudget.url,
      },
      {
        outlet: "MTF",
        title: "The Tax Growth Limitation Ballot Question",
        type: "ADVOCACY",
        url: SOURCES.mtfPosition.url,
      },
    ],
  },
  {
    when: "Feb 2026",
    label: "Bill introduced and legislative leaders pushback",
    body: "The initiative entered the Legislature as House Bill 5006. Senate President Spilka and others labeled the tax questions as special-interest measures benefiting high earners.",
    articles: [
      {
        outlet: "MAlegislature.gov",
        title:
          "Bill H.5006 — An Act relative to limiting state tax collection growth and returning surpluses to taxpayers",
        type: "GOV'T",
        url: SOURCES.h5006.url,
      },
      {
        outlet: "MassLive",
        title:
          "Top Mass. lawmakers issue a stark warning on these ballot questions that could change everything",
        type: "NEWS",
        url: SOURCES.masslive62F.url,
      },
    ],
  },
  {
    when: "Dec 30, 2025",
    label: "Signatures certified",
    body: "The Elections Division certified 85,588 valid signatures (74,574 required), sending the measure to the Legislature.",
    articles: [
      {
        outlet: "sec.state.ma.us",
        title:
          "State Elections Division Certifies New Batch of Ballot Questions",
        type: "GOV'T",
        url: SOURCES.secCertifiesBatch.url,
      },
      {
        outlet: "CommonWealth Beacon",
        title:
          "Four more initiative petitions clear signature hurdle for 2026 Mass. ballot",
        type: "NEWS",
        url: SOURCES.cwbSignatureHurdle.url,
      },
    ],
  },
  {
    when: "Nov – Dec 2025",
    label: "Signature gathering and initiative scrutiny",
    body: "Supporters gathered roughly 86,000 first-round signatures as the measure drew coverage amid a record field of 2026 ballot questions.",
    articles: [
      {
        outlet: "WBUR",
        title:
          "Ballot questions on rent control, all-party primaries and legislative stipends expected to move forward",
        type: "NEWS",
        url: SOURCES.wburSigs.url,
      },
      {
        outlet: "CommonWealth Beacon",
        title:
          "Cutting taxes, recriminalizing recreational pot, scrutinizing Beacon Hill: record number of ballot questions in the mix for 2026",
        type: "NEWS",
        url: SOURCES.cwbRecord.url,
      },
      {
        outlet: "WBUR",
        title:
          "Massachusetts could see a record number of ballot questions in 2026. Here's a preview",
        type: "NEWS",
        url: SOURCES.wburPreview.url,
      },
      {
        outlet: "CommonWealth Beacon",
        title: "Amid shaky economy, tax cut proposal draws heightened scrutiny",
        type: "NEWS",
        url: SOURCES.cwbShakyEconomy.url,
      },
    ],
  },
  {
    when: "Sep 2025",
    label: "Cleared for signatures",
    body: "The Attorney General certified the petition and signature gathering began.",
    articles: [
      {
        outlet: "mass.gov",
        title: "AG Campbell's Office Certifies 44 Initiative Petitions",
        type: "GOV'T",
        url: SOURCES.agCertifies44.url,
      },
    ],
  },
  {
    when: "Aug 2025",
    label: "Petition filed and advocacy statement from petition sponsor",
    body: "The Attorney General's office received the initiative petition (No. 25-17), and the petition's sponsor released a brief making the case for the measure.",
    articles: [
      {
        outlet: "mass.gov",
        title:
          "AG Campbell's Office Receives 47 Ballot Initiative Petitions Proposing 42 Laws and 5 Constitutional Amendments",
        type: "GOV'T",
        url: SOURCES.agReceives47.url,
      },
      {
        outlet: "MassOpportunity",
        title: "Taxpayer Benefits of Massachusetts Revenue Cap Revision",
        type: "ADVOCACY",
        url: SOURCES.maoBrief.url,
      },
    ],
  },
];

// ── Coverage by Topic (Grace variant "Ballot Coverage" tab) ─────────────────
// Same topics as the former "Media" reference card, regrouped as
// outlet/title/type rows (no timeline/dates) for the Coverage by Topic card.
export const COVERAGE_BY_TOPIC: {
  topic: string;
  articles: CoverageArticle[];
}[] = [
  {
    topic: "Campaign & Ballot Path",
    articles: [
      {
        outlet: "WBUR",
        title:
          "Ballot questions on rent control, all-party primaries and legislative stipends expected to move forward",
        type: "NEWS",
        url: SOURCES.wburSigs.url,
      },
      {
        outlet: "CommonWealth Beacon",
        title:
          "Cutting taxes, recriminalizing recreational pot, scrutinizing Beacon Hill: record number of ballot questions in the mix for 2026",
        type: "NEWS",
        url: SOURCES.cwbRecord.url,
      },
      {
        outlet: "WBUR",
        title:
          "Massachusetts could see a record number of ballot questions in 2026. Here's a preview",
        type: "NEWS",
        url: SOURCES.wburPreview.url,
      },
    ],
  },
  {
    topic: "The Fiscal Debate",
    articles: [
      {
        outlet: "MassLive",
        title:
          "Top Mass. lawmakers issue a stark warning on these ballot questions that could change everything",
        type: "NEWS",
        url: SOURCES.masslive62F.url,
      },
      {
        outlet: "GBH News",
        title:
          "More competitive or more chaotic? Tax cut analysts paint possible outcomes",
        type: "NEWS",
        url: SOURCES.wgbhAnalysts.url,
      },
    ],
  },
  {
    topic: "Polling",
    articles: [
      {
        outlet: "Polity Research Consulting",
        title: "2026 statewide ballot survey — topline",
        type: "ADVOCACY",
        url: SOURCES.polityPoll.url,
      },
    ],
  },
  {
    topic: "Campaign Finance",
    articles: [
      {
        outlet: "OCPF",
        title: "Active Ballot Question Committee Reports",
        type: "GOV'T",
        url: SOURCES.ocpf.url,
      },
    ],
  },
];

// ── Citizen Deliberations content ──────────────────────────────────────────
export const DELIB_THEMES: {
  title: string;
  agreed: string;
  split: string;
  tradeoff: string;
}[] = [
  {
    title:
      "Almost everyone liked the idea of a refund — the mechanism was the question",
    agreed:
      "Getting money back when the state genuinely over-collects was broadly popular; “never trigger a refund” was almost nobody's position.",
    split:
      "Whether basing the cap on actual collections restores the law's intent or quietly lowers the budget over time.",
    tradeoff:
      "Reliable automatic relief now vs. a lower ceiling that could force cuts in lean years later.",
  },
  {
    title: "The surtax carve-in was the single most contested detail",
    agreed:
      "Participants understood that counting surtax revenue toward the cap is what makes refunds trigger more often — the mechanics were clear once explained.",
    split:
      "Whether that 'closes a loophole' or overrides the education-and-transportation purpose voters attached to that money in 2022.",
    tradeoff:
      "Honoring the 1986 refund vote vs. honoring the 2022 surtax-earmark vote when the two pull against each other.",
  },
  {
    title: "Who benefits became a values question, not just a numbers question",
    agreed:
      "Everyone accepted that proportional refunds send larger dollar amounts to higher earners; the fact itself wasn't disputed.",
    split:
      "Whether that distribution is fair (you get back in proportion to what you paid) or regressive (services cut to fund it are used by everyone).",
    tradeoff:
      "Returning surpluses by a neutral formula vs. directing constrained dollars to the services with the widest reach.",
  },
];

export const DELIB_TRANSCRIPTS = [
  {
    title: "Worcester in-person cohort, session 2",
    meta: "Oct 2026 · 13 participants · 2h 05m · facilitated by GenUnity",
  },
  {
    title: "Springfield Democracy Hub session",
    meta: "Oct 2026 · 11 participants · 1h 40m · with Mass Voter Table",
  },
  {
    title: "Statewide online session 1",
    meta: "Nov 2026 · 20 participants · 1h 30m",
  },
];

// ── Argument-filter config (For & Against) ─────────────────────────────────
export const ARG_FILTERS: { id: ArgFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "organization", label: "Organizations" },
  { id: "elected", label: "Elected Officials" },
  { id: "citizen", label: "Citizen" },
];

export const ARG_FILTER_IDS: Record<ArgFilter, string[]> = {
  all: [
    "petition",
    "taxpayersForAffordableMA",
    "protectMAFuture",
    "maoBrief",
    "massBudget",
    "mapleTestimony",
  ],
  official: ["petition", "chapter62F", "section2BBBBBB"],
  academic: ["taxPolicyCenter", "massBudget", "maoBrief"],
  organization: ["mapleTestimony", "massFiscalPraise", "mtfPosition"],
  elected: ["mapleTestimony", "masslive62F"],
  citizen: ["mapleTestimony"],
};

// Preserved AI synthesis of the fiscal research — formerly the "Research &
// Evidence" card on the Bibliography tab, kept here so it can be resurfaced
// later (e.g. on the For & Against or Overview tab).
export const RESEARCH_SYNTHESIS = {
  ids: ["maoBrief", "massBudget", "taxPolicyCenter", "mtfPosition"],
  prompt:
    "Summarize what fiscal analyses find about recalculating the 62F cap from actual collections and counting surtax revenue, naming each source's affiliation and where they diverge. Use only the sources listed below and cite nothing else. (Filler prompt for prototype purposes.)",
  text: "The available analyses read the same mechanism in opposite ways. The proponents' brief projects that a cap tied to actual collections, with surtax revenue counted in, would have returned roughly $19 billion across 24 refunds over four decades, versus the two triggers under current law. MassBudget argues the same design would progressively lower the cap after slow years and refunds, forcing unpredictable cuts and binding hardest after recessions. The nonpartisan literature on tax and expenditure limits documents both possibilities, and the business-aligned MTF — despite its fiscal-conservative orientation — concludes the change would be counterproductive for the state's finances.",
};

// ── Bibliography (APA) ──────────────────────────────────────────────────────
// One flat, sectioned bibliography. Sections mirror the coverage-page source
// types; entries within each are listed newest-first and written APA-style
// (group author · date · title, title italicized except for periodical/news).
export type BibEntry = {
  /** Publishing organization — the institution slot, printed after the title. */
  author: string;
  /** A named individual, when one wrote the source. Printed before the title. */
  person?: string;
  date: string;
  title: string;
  url: string;
};
export const BIBLIOGRAPHY: {
  section: string;
  italicTitle: boolean;
  entries: BibEntry[];
}[] = [
  {
    section: "Official government documentation",
    italicTitle: true,
    entries: [
      {
        author: "Massachusetts General Court",
        date: "2026, February",
        title:
          "House Bill 5006: An act relative to limiting state tax collection growth and returning surpluses to taxpayers",
        url: SOURCES.h5006.url,
      },
      {
        author: "Office of Campaign and Political Finance",
        date: "2026",
        title: "Active ballot question committee reports",
        url: SOURCES.ocpf.url,
      },
      {
        author: "Secretary of the Commonwealth, Elections Division",
        date: "2025, December",
        title:
          "State elections division certifies new batch of ballot questions",
        url: SOURCES.secCertifiesBatch.url,
      },
      {
        author: "Office of the Attorney General",
        date: "2025, September",
        title: "AG Campbell's office certifies 44 initiative petitions",
        url: SOURCES.agCertifies44.url,
      },
      {
        author: "Office of the Attorney General",
        date: "2025",
        title: "Summary of Petition No. 25-17",
        url: SOURCES.agSummary.url,
      },
      {
        author:
          "Office of the Attorney General & Secretary of the Commonwealth",
        date: "2025",
        title:
          "An initiative petition for a law relative to limiting state tax collection growth and returning surpluses to taxpayers (Petition No. 25-17)",
        url: SOURCES.petition.url,
      },
      {
        author: "Office of the Attorney General",
        date: "2025, August",
        title:
          "AG Campbell's office receives 47 ballot initiative petitions proposing 42 laws and 5 constitutional amendments",
        url: SOURCES.agReceives47.url,
      },
      {
        author: "Massachusetts General Court",
        date: "n.d.",
        title: "Massachusetts General Laws Chapter 62F, § 2: Definitions",
        url: SOURCES.chapter62F.url,
      },
      {
        author: "Massachusetts General Court",
        date: "n.d.",
        title:
          "Massachusetts General Laws Chapter 29, § 2BBBBBB: Education and Transportation Fund",
        url: SOURCES.section2BBBBBB.url,
      },
    ],
  },
  {
    section: "Educational (Nonpartisan)",
    italicTitle: true,
    entries: [
      {
        author: "Ballotpedia",
        date: "n.d.",
        title: "Massachusetts Change State Tax Revenue Limit Initiative (2026)",
        url: SOURCES.ballotpedia.url,
      },
      {
        author: "Tax Policy Center",
        date: "n.d.",
        title: "What are tax and expenditure limits?",
        url: SOURCES.taxPolicyCenter.url,
      },
    ],
  },
  {
    section: "News",
    italicTitle: false,
    entries: [
      {
        author: "GBH News",
        person: "K. Castellani, E. Adams, and S. Drysdale",
        date: "2026, March 30",
        title:
          "More competitive or more chaotic? Tax cut analysts paint possible outcomes",
        url: SOURCES.wgbhAnalysts.url,
      },
      {
        author: "MassLive",
        date: "2026, February",
        title:
          "Top Mass. lawmakers issue a stark warning on these ballot questions that could change everything",
        url: SOURCES.masslive62F.url,
      },
      {
        author: "CommonWealth Beacon",
        person: "K. Castellani",
        date: "2025, December",
        title:
          "Four more initiative petitions clear signature hurdle for 2026 Mass. ballot",
        url: SOURCES.cwbSignatureHurdle.url,
      },
      {
        author: "CommonWealth Beacon",
        person: "C. Lisinski",
        date: "2025, December 16",
        title: "Tax ballot questions emerging as Beacon Hill boogeyman",
        url: SOURCES.cwbBoogeyman.url,
      },
      {
        author: "WBUR",
        person: "N. DeCosta-Klipa",
        date: "2025, December 4",
        title:
          "Massachusetts could see a record number of ballot questions in 2026. Here's a preview",
        url: SOURCES.wburPreview.url,
      },
      {
        author: "CommonWealth Beacon",
        person: "C. Lisinski",
        date: "2025, November 20",
        title:
          "Cutting taxes, recriminalizing recreational pot, scrutinizing Beacon Hill: Record number of ballot questions in the mix for 2026",
        url: SOURCES.cwbRecord.url,
      },
      {
        author: "WBUR",
        person: "C. Van Buskirk",
        date: "2025, November 19",
        title:
          "Ballot questions on rent control, all-party primaries and legislative stipends expected to move forward",
        url: SOURCES.wburSigs.url,
      },
      {
        author: "WBUR",
        person: "C. A. Young and C. Lisinski",
        date: "2022, July 29",
        title: "Baker sees 1986 law triggering $2.5 billion in rebates",
        url: SOURCES.wbur62F2022.url,
      },
    ],
  },
  {
    section: "Advocacy",
    italicTitle: true,
    entries: [
      {
        author: "Massachusetts Taxpayers Foundation",
        date: "2026, May 4",
        title: "MTF position on ballot questions in 2026",
        url: SOURCES.mtfPosition.url,
      },
      {
        author: "Polity Research Consulting",
        date: "2026, May",
        title:
          "2026 statewide ballot survey: Topline [Poll commissioned by the Retailers Association of Massachusetts]",
        url: SOURCES.polityPoll.url,
      },
      {
        author: "Massachusetts Budget and Policy Center",
        date: "2026, March 30",
        title:
          "Testimony in opposition to the two anti-tax ballot initiatives cutting the personal income tax and amending Chapter 62F",
        url: SOURCES.massBudget.url,
      },
      {
        author: "Massachusetts Fiscal Alliance",
        date: "2026",
        title: "MassFiscal praises trio of 2026 ballot questions",
        url: SOURCES.massFiscalPraise.url,
      },
      {
        author: "Massachusetts Opportunity Alliance",
        date: "2025, August",
        title:
          "Taxpayer benefits of Massachusetts revenue cap revision [Policy brief]",
        url: SOURCES.maoBrief.url,
      },
      {
        author: "Massachusetts Budget and Policy Center",
        date: "n.d.",
        title: "Fair Share Amendment",
        url: SOURCES.fairShare.url,
      },
      {
        author: "Taxpayers for an Affordable Massachusetts",
        date: "n.d.",
        title:
          "Taxpayers for an Affordable Massachusetts [Ballot question committee]",
        url: SOURCES.taxpayersForAffordableMA.url,
      },
      {
        author: "Protect Massachusetts' Future",
        date: "n.d.",
        title: "Protect Massachusetts' Future [Ballot question committee]",
        url: SOURCES.protectMAFuture.url,
      },
    ],
  },
];

// ── Voter guides (Overview) ────────────────────────────────────────────────
// Prototype: rows are clickable but deliberately have no URL yet.
export const VOTER_GUIDES: {
  name: string;
  publisher: string;
  note: string;
  kind: SrcKind;
}[] = [
  {
    name: "Massachusetts Information For Voters - 2026",
    publisher: "Secretary of the Commonwealth",
    note: "The official guide mailed to every household: certified summary, fiscal statement, and each side's 150-word argument.",
    kind: "official",
  },
  {
    name: "Center for State Policy Analysis (cSPA)",
    publisher: "Tufts University",
    note: "Independent, evidence-based analysis of each statewide ballot question.",
    kind: "outside",
  },
  {
    name: "Ballot Questions Guide",
    publisher: "MassINC / CommonWealth Beacon",
    note: "Nonpartisan explainers and reporting on the 2026 questions.",
    kind: "outside",
  },
  {
    name: "Change State Tax Revenue Limit Initiative (2026)",
    publisher: "Ballotpedia",
    note: "Full measure page with status, text, supporters, and arguments.",
    kind: "outside",
  },
];
