// Source registry for the 2026 Massachusetts Chapter 62F reform ballot
// question ("An Act Relative to Limiting State Tax Collection Growth and
// Returning Surpluses to Taxpayers," Petition No. 25-17). Every citable fact on
// the page references one of these by key. Supplied to the page via
// <SourcesProvider value={SOURCES}>.

import type { Sources } from "../../components/ballot/types";

export const SOURCES: Sources = {
  petition: {
    label: "Petition No. 25-17 (Mass.gov)",
    kind: "official",
    url: "https://www.mass.gov/doc/25-17-initiative-petition-for-a-law-relative-to-limiting-state-tax-collection-growth-and-returning-surpluses-to-taxpayers/download",
    title:
      "An Initiative Petition for a Law Relative to Limiting State Tax Collection Growth and Returning Surpluses to Taxpayers — certified petition text",
    meta: "Secretary of the Commonwealth / Office of the Attorney General · Certified Sep 3, 2025",
    note: "The full legal text of the measure, including how the revenue limit would be recalculated and the treatment of surtax revenue.",
  },
  agSummary: {
    label: "AG Summary of No. 25-17 (Mass.gov)",
    kind: "official",
    url: "https://www.mass.gov/doc/final-summary-for-25-17-initiative-petition-for-a-law-relative-to-limiting-state-tax-collection-growth-and-returning-surpluses-to-taxpayers/download",
    title: "Attorney General's final summary of Petition No. 25-17",
    meta: "Office of the Attorney General",
    note: "The AG's plain-language summary of the measure, prepared for voters and signature sheets.",
  },
  voterGuide: {
    label: "Information for Voters: 2026 Ballot Questions",
    kind: "official",
    url: "https://www.sec.state.ma.us/divisions/elections/download/voter-info/2026-Information-for-Voters.pdf",
    title: "Information for Voters — 2026 Ballot Questions",
    meta: "Office of the Secretary of the Commonwealth",
    note: "The Commonwealth's own voter guide: the Attorney General's summary, what a yes or no vote does, the fiscal-consequences statement, both statutory 150-word arguments, the Special Joint Committee's majority and minority reports, and the full text of the proposed law.",
  },
  chapter62F: {
    label: "M.G.L. c. 62F, §2 (Mass. Legislature)",
    kind: "official",
    url: "https://malegislature.gov/Laws/GeneralLaws/PartI/TitleIX/Chapter62F/Section2",
    title: "Chapter 62F, Section 2 — Definitions",
    meta: "General Court of the Commonwealth of Massachusetts",
    note: "The current statute defining the allowable state tax revenue limit and how it is computed from prior-year figures and wage growth.",
  },
  section2BBBBBB: {
    label: "M.G.L. c. 29, §2BBBBBB (Mass. Legislature)",
    kind: "official",
    url: "https://malegislature.gov/Laws/GeneralLaws/PartI/TitleIII/Chapter29/Section2BBBBBB",
    title:
      "Chapter 29, Section 2BBBBBB — Education and Transportation Fund; income surtax revenues",
    meta: "General Court of the Commonwealth of Massachusetts",
    note: "The account that holds revenue from the 2022 income surtax (the 'millionaire's tax'); the initiative would fold this revenue into the 62F limit calculation.",
  },
  h5006: {
    label: "House Bill 5006, MA Legislature",
    kind: "official",
    url: "https://malegislature.gov/Bills/194/H5006",
    title: "House Bill 5006 — the initiative's legislative form",
    meta: "Massachusetts General Court · Feb 2026",
    note: "The bill the Legislature took up during its review window; lawmakers did not act by the May 2026 deadline.",
  },
  ballotpedia: {
    label:
      "Massachusetts Change State Tax Revenue Limit Initiative 2026 (Ballotpedia)",
    kind: "outside",
    url: "https://ballotpedia.org/Massachusetts_Change_State_Tax_Revenue_Limit_Initiative_(2026)",
    title: "Massachusetts Change State Tax Revenue Limit Initiative (2026)",
    meta: "Ballotpedia",
    note: "Encyclopedia entry covering the measure text, support and opposition, campaign finance, polling, and the history of the 62F cap.",
  },
  maoBrief: {
    label:
      "Massachusetts Opportunity Alliance — Taxpayer Benefits of Massachusetts Revenue Cap Revision",
    kind: "outside",
    url: "https://massopportunity.org/wp-content/uploads/2025/08/POLICY-BRIEF-Revenue-Cap-.pdf",
    date: "Aug 2025",
    title: "Taxpayer Benefits of Massachusetts Revenue Cap Revision",
    meta: "Backs the measure — Massachusetts Opportunity Alliance",
    note: "The proponents' policy brief; projects that a revised limit based on actual collections would have triggered refunds 24 times over four decades (~$19B).",
  },
  massBudget: {
    label:
      "Massachusetts Budget & Policy Center — Testimony opposing the two anti-tax ballot initiatives",
    kind: "outside",
    url: "https://massbudget.org/2026/03/30/testimony-in-opposition-to-the-two-anti-tax-ballot-initiatives-cutting-the-personal-income-tax-amending-chapter-62f/",
    date: "Mar 30, 2026",
    title:
      "Testimony in opposition to the two anti-tax ballot initiatives cutting the personal income tax and amending Chapter 62F",
    meta: "Massachusetts Budget & Policy Center (opposes the measure)",
    note: "Analysis arguing the reform would progressively lower the revenue cap over time and force unpredictable cuts, especially after recessions.",
  },
  wgbhAnalysts: {
    label:
      "GBH News — More competitive or more chaotic? Analysts paint possible outcomes",
    kind: "outside",
    url: "https://www.wgbh.org/news/local/2026-03-30/more-competitive-or-more-chaotic-tax-cut-analysts-paint-possible-outcomes",
    date: "Mar 30, 2026",
    title:
      "More competitive or more chaotic? Tax cut analysts paint possible outcomes",
    meta: "GBH News",
    note: "Coverage weighing the competing fiscal arguments; includes the SEIU 509 characterization of the revenue impact as destabilizing.",
  },
  masslive62F: {
    label:
      "MassLive — Top legislators slap 'special interest' tag on ballot questions",
    kind: "outside",
    url: "https://www.masslive.com/politics/2026/02/top-legislators-slap-special-interest-tag-on-ballot-questions.html",
    date: "Feb 2026",
    title: "Top legislators slap 'special interest' tag on ballot questions",
    meta: "MassLive",
    note: "Reports Senate President Spilka and other leaders framing the tax questions as benefiting high earners; source of the rebate-distribution comparison.",
  },
  cwbBoogeyman: {
    label:
      "CommonWealth Beacon — Tax ballot questions emerging as Beacon Hill boogeyman",
    kind: "outside",
    url: "https://commonwealthbeacon.org/government/state-government/tax-ballot-questions-emerging-as-beacon-hill-boogeyman/",
    date: "Dec 16, 2025",
    title: "Tax ballot questions emerging as Beacon Hill boogeyman",
    meta: "CommonWealth Beacon",
    note: "Reporting on the business-backed coalition behind the 62F and income-tax questions and the legislative reaction. Published Dec 16, 2025 (updated Dec 18, 2025).",
  },
  cwbRecord: {
    label:
      "CommonWealth Beacon — Record number of ballot questions in the mix for 2026",
    kind: "outside",
    url: "https://commonwealthbeacon.org/ballot-questions/cutting-taxes-recriminalizing-recreational-pot-scrutinizing-beacon-hill-record-number-of-ballot-questions-in-the-mix-for-2026/",
    date: "Nov 20, 2025",
    title:
      "Cutting taxes, recriminalizing recreational pot, scrutinizing Beacon Hill: record number of ballot questions in the mix for 2026",
    meta: "CommonWealth Beacon",
    note: "Coverage of the November 2025 signature filing across the 2026 initiative field, including the 62F reform.",
  },
  wburSigs: {
    label:
      "WBUR — Ballot questions expected to move forward after signature filing",
    kind: "outside",
    url: "https://www.wbur.org/news/2025/11/19/massachusetts-ballot-questions-signatures-rent-control-legislative-stipends",
    date: "Nov 19, 2025",
    title:
      "Several 2026 ballot questions — including the state tax-revenue-limit measure — expected to move forward after signature filing",
    meta: "WBUR",
    note: "Reports the first-round signature totals filed by the 2026 initiative campaigns, including the tax-cap measure.",
  },
  wburPreview: {
    label:
      "WBUR — Massachusetts could see a record number of ballot questions in 2026",
    kind: "outside",
    url: "https://www.wbur.org/news/2025/12/04/massachusetts-ballot-questions-2026-galvin",
    date: "Dec 4, 2025",
    title:
      "Massachusetts could see a record number of ballot questions in 2026",
    meta: "WBUR",
    note: "Overview of the certified 2026 field; describes the 62F question as changing the surplus cap to account for surtax revenue so rebates trigger more often.",
  },
  agReceives47: {
    label:
      "Mass.gov — AG Campbell's Office Receives 47 Ballot Initiative Petitions",
    kind: "official",
    url: "https://www.mass.gov/news/ag-campbells-office-receives-47-ballot-initiative-petitions-proposing-42-laws-and-5-constitutional-amendments",
    date: "Aug 2025",
    title:
      "AG Campbell's Office Receives 47 Ballot Initiative Petitions Proposing 42 Laws and 5 Constitutional Amendments",
    meta: "Office of the Attorney General",
    note: "The AG's announcement that it received the 2026 initiative petitions, including No. 25-17.",
  },
  agCertifies44: {
    label: "Mass.gov — AG Campbell's Office Certifies 44 Initiative Petitions",
    kind: "official",
    url: "https://www.mass.gov/news/ag-campbells-office-certifies-44-initiative-petitions",
    date: "Sep 2025",
    title: "AG Campbell's Office Certifies 44 Initiative Petitions",
    meta: "Office of the Attorney General",
    note: "The AG's certification of the petitions cleared for signature gathering, including the 62F measure.",
  },
  secCertifiesBatch: {
    label:
      "Secretary of the Commonwealth — State Elections Division Certifies New Batch of Ballot Questions",
    kind: "official",
    url: "https://www.sec.state.ma.us/divisions/news/news-archives/archived-news-stories.htm",
    date: "Dec 2025",
    title: "State Elections Division Certifies New Batch of Ballot Questions",
    meta: "Secretary of the Commonwealth · Elections Division",
    note: "The Elections Division announcement certifying first-round signatures for 2026 measures.",
  },
  cwbSignatureHurdle: {
    label:
      "CommonWealth Beacon — Four more initiative petitions clear signature hurdle for 2026 Mass. ballot",
    kind: "outside",
    url: "https://commonwealthbeacon.org/ballot-questions/four-more-initiative-petitions-clear-signature-hurdle-for-2026-mass-ballot/",
    date: "Dec 2025",
    title:
      "Four more initiative petitions clear signature hurdle for 2026 Mass. ballot",
    meta: "CommonWealth Beacon",
    note: "Coverage of the first-round signature certification sending measures to the Legislature.",
  },
  cwbShakyEconomy: {
    label:
      "CommonWealth Beacon — Amid shaky economy, tax cut proposal draws heightened scrutiny",
    kind: "outside",
    url: "https://commonwealthbeacon.org/government/state-government/tax-ballot-questions-emerging-as-beacon-hill-boogeyman/",
    date: "Dec 16, 2025",
    title: "Amid shaky economy, tax cut proposal draws heightened scrutiny",
    meta: "CommonWealth Beacon",
    note: "Coverage of scrutiny on the tax-cut proposal amid economic uncertainty.",
  },
  polityPoll: {
    label: "Polity Research Consulting — 2026 ballot survey (via RAM)",
    kind: "outside",
    url: "https://www.retailersma.org/assets/Polity%20FINAL_2026_Q6066_TOPLINE_2%20%28002%29.pdf",
    date: "May 2026",
    title: "2026 statewide ballot survey — topline",
    meta: "Polity Research Consulting, commissioned by the Retailers Association of Massachusetts",
    note: "Survey of 608 respondents (Apr 29–May 7, 2026) finding 76% support for adjusting the tax cap to trigger more frequent refunds.",
  },
  ocpf: {
    label: "Massachusetts OCPF — Active Ballot Question Committee Reports",
    kind: "outside",
    url: "https://www.ocpf.us/Reports/ActiveBallotQuestionReports",
    date: "2026",
    title: "Active Ballot Question Committee Reports",
    meta: "Office of Campaign and Political Finance",
    note: "The state filings behind the committees' totals; support figures through Jan 20, 2026 are dominated by in-kind support from the Massachusetts Opportunity Alliance.",
  },
  wbur62F2022: {
    label: "WBUR — Baker sees 1986 law triggering $2.5 billion in rebates",
    kind: "outside",
    url: "https://www.wbur.org/news/2022/07/29/massachusetts-governor-taxpayer-relief-payouts-law",
    date: "Jul 29, 2022",
    title: "Baker sees 1986 law triggering $2.5 billion in rebates",
    meta: "WBUR",
    note: "Coverage of the 2022 62F trigger that returned roughly $3 billion to taxpayers — the second trigger in the law's history.",
  },
  taxPolicyCenter: {
    label: "Tax Policy Center — What are tax and expenditure limits?",
    kind: "outside",
    url: "https://taxpolicycenter.org/briefing-book/what-are-tax-and-expenditure-limits",
    title: "What are tax and expenditure limits?",
    meta: "Tax Policy Center",
    note: "Reference on tax and expenditure limits (TELs) across the states; Massachusetts is one of 19 states with a tax revenue limit.",
  },
  question3_1986: {
    label: "Massachusetts Question 3 (1986) — Ballotpedia",
    kind: "official",
    url: "https://ballotpedia.org/Massachusetts_Question_3,_State_Income_Tax_Surtax_Repeal_and_Revenue_Growth_Limit_Initiative_(1986)",
    title:
      "Question 3: State Income Tax Surtax Repeal and Revenue Growth Limit (1986)",
    meta: "Massachusetts election results · Nov 1986",
    note: "The voter-approved measure that created the 62F revenue limit; sponsored by the Massachusetts High Technology Council and Citizens for Limited Taxation; passed 54.4%.",
  },
  question1_2022: {
    label: "Massachusetts Question 1 (2022) — Ballotpedia",
    kind: "official",
    url: "https://ballotpedia.org/Massachusetts_Question_1,_Tax_on_Income_Above_$1_Million_for_Education_and_Transportation_Amendment_(2022)",
    title:
      "Question 1: Tax on Income Above $1 Million for Education and Transportation (2022)",
    meta: "Massachusetts election results · Nov 2022",
    note: "The constitutional amendment creating the 4% surtax on income above $1M for education and transportation; approved 52.26%. Its revenue is the subject of this measure's carve-in.",
  },
  fairShare: {
    label: "Mass. Budget & Policy Center — Fair Share Amendment",
    kind: "outside",
    url: "https://massbudget.org/fairshare/",
    title: "Fair Share Amendment",
    meta: "Massachusetts Budget & Policy Center",
    note: "Background on the 2022 surtax and the dedicated Education and Transportation Fund its revenue supports.",
  },
  taxpayersForAffordableMA: {
    label: "Taxpayers for an Affordable Massachusetts (Yes committee)",
    kind: "official",
    url: "https://massopportunity.org/",
    title: "Taxpayers for an Affordable Massachusetts",
    meta: "Ballot question committee supporting the measure",
    note: "The committee registered to support the 62F reform (and the companion income-tax question); financed largely by the Massachusetts Opportunity Alliance.",
  },
  protectMAFuture: {
    label: "Protect Massachusetts' Future (No committee)",
    kind: "official",
    url: "https://www.protectmassachusettsfuture.com/",
    title: "Protect Massachusetts' Future",
    meta: "Ballot question committee opposing the measure",
    note: "The labor- and community-backed committee leading opposition to the 62F and income-tax questions.",
  },
  massFiscalPraise: {
    label:
      "Massachusetts Fiscal Alliance — MassFiscal praises trio of 2026 ballot questions",
    kind: "outside",
    url: "https://www.massfiscal.org/massfiscal-praises-trio-2026-ballot-questions",
    date: "2026",
    title: "MassFiscal praises trio of 2026 ballot questions",
    meta: "Backs the measure — Massachusetts Fiscal Alliance",
    note: "Statement from Paul Craney framing the measure as closing a '62F loophole,' especially the carve-out for surtax revenue.",
  },
  mtfPosition: {
    label: "Mass. Taxpayers Foundation — Position on 2026 ballot questions",
    kind: "outside",
    url: "https://www.masstaxpayers.org/mtf-position-ballot-questions-2026",
    date: "May 4, 2026",
    title: "MTF Position on Ballot Questions in 2026",
    meta: "Massachusetts Taxpayers Foundation (opposes the measure)",
    note: "A business-aligned fiscal watchdog that nonetheless opposes the tax questions, arguing the impacts would be counterproductive for fiscal sustainability.",
  },
  cwbSenateRepeal: {
    label: "CommonWealth Beacon — Senate move on the tax cap",
    kind: "outside",
    url: "https://commonwealthbeacon.org/politics/eleventh-hour-senate-move-could-upend-tax-rebate-ballot-question/",
    title: "Eleventh-hour Senate move could upend tax rebate ballot question",
    meta: "CommonWealth Beacon · Jul 2026",
    note: "Reports an amendment repealing Chapter 62F outright, with at least 20 cosponsors in the 40-member Senate.",
  },
  shnsSpeakerTreads: {
    label: "State House News Service — House response",
    kind: "outside",
    url: "https://www.statehousenews.com/news/economy/taxation/as-senate-weighs-tax-cap-repeal-speaker-treads-carefully-in-house/article_a04d259c-e9e1-4494-b412-270fdf856fb6.html",
    title: "As Senate weighs tax cap repeal, speaker treads carefully in House",
    meta: "State House News Service · Jul 2026",
    note: "The House's more cautious posture toward the Senate repeal amendment.",
  },
  secBallotNumbers: {
    label: "Secretary of the Commonwealth — ballot numbers",
    kind: "official",
    url: "https://www.sec.state.ma.us/divisions/news/left-story.htm",
    title: "Ballot Question Numbers Assigned for November Ballot",
    meta: "Elections Division · Jul 21, 2026",
    note: "The announcement assigning this measure its number, Question 5, on the Nov. 3, 2026 ballot.",
  },
  cwbNumbers: {
    label: "CommonWealth Beacon — numbers assigned",
    kind: "outside",
    url: "https://commonwealthbeacon.org/ballot-questions/marijuana-question-survives-as-all-nine-ballot-questions-get-their-numbers/",
    title:
      "Marijuana question survives as all nine ballot questions get their numbers",
    meta: "CommonWealth Beacon · Jul 21, 2026",
    note: "Reports the final nine-question field and the order assigned to each.",
  },
  wburFinalized: {
    label: "WBUR — final ballot list",
    kind: "outside",
    url: "https://www.wbur.org/news/2026/07/22/massachusetts-ballot-question-order-challenges",
    title:
      "Massachusetts has finalized its list of 9 ballot questions for 2026. Now comes the tricky part",
    meta: "WBUR · Jul 22, 2026",
    note: "On the finalized ballot and the campaigns ahead.",
  },
  globeTaxCutOff: {
    label: "Boston Globe — after the court rulings",
    kind: "outside",
    url: "https://www.bostonglobe.com/2026/06/22/business/massachusetts-tax-revenue-ballot-proposal/",
    title:
      "With tax cut off the ballot, the battle shifts to making excess revenue refunds more frequent",
    meta: "Boston Globe · Jun 22, 2026",
    note: "Coverage of 62F becoming the surviving tax question after the SJC struck the income-tax cut.",
  },
  mapleTestimony: {
    label: "Testimony submitted to MAPLE (this question)",
    kind: "user",
    url: "",
    title: "Verified account testimony on this question",
    meta: "MAPLE · Public Perspectives tab",
    note: "Statements submitted by organization, executive-office, and legislator accounts, shown in their own words on the Public Perspectives tab.",
  },
  policyResearch: {
    label:
      "Fiscal-policy research on tax and expenditure limits (see Research & Evidence)",
    kind: "outside",
    url: "",
    title: "Research on tax and expenditure limits",
    meta: "Tax Policy Center · NASBO · state TEL studies",
    note: "The reference material summarized under Research & Evidence on the Bibliography tab.",
  },
};
