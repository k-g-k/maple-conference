// Prose that was living inside tab components rather than in data.
//
// Moved here verbatim so a second presentation of this question can render the
// same words without importing the first one's JSX. Copy is content; it belongs
// in the data layer with everything else.

export const PROSE = {
  whatHappens: {
    ids: ["petition", "chapter62F", "section2BBBBBB"],
    prompt:
      "Summarize what would happen if the measure passes — how the recalculated cap is computed, when surtax revenue starts counting, what remains for the Legislature and agencies to implement, and what the official fiscal statement says. Use only the sources listed below and cite nothing else. (Filler prompt for prototype purposes.)",
    text: "Beginning with the first applicable tax year, the 62F revenue limit would be recomputed from the net revenue the state actually collected the prior year, plus three-year wage growth — and revenue from the 2022 income surtax would be counted toward the total. Because the base would track real collections rather than the higher allowable maximum, the cap would generally sit lower and be exceeded more often, triggering automatic refunds in more years. The Department of Revenue and the Auditor would apply the revised formula; how the change interacts with the surtax's dedicated education-and-transportation purpose is an open legal question. The official statement of fiscal consequences would say what effect this has on state finances once the Information for Voters is published.",
  },

  argumentsGlance: {
    ids: ["petition", "maoBrief", "massBudget", "mtfPosition", "masslive62F"],
    prompt:
      "Summarize what the 62F reform measure would do and how each side frames it. Use only the sources listed below and cite nothing else. (Filler prompt for prototype purposes.)",
    text: "The measure would amend Massachusetts' Chapter 62F law to significantly increase the frequency of taxpayer refunds. Supporters, including the sponsoring campaign, business groups, and fiscal conservatives, argue it fulfills promises to return over-collected taxes. Opponents, including budget analysts, unions, and fiscal watchdogs, warn it would reduce the state budget, threaten funding for schools and transportation, and favor high earners with the largest refunds.",
  },

  fiscal: {
    official: {
      caveat:
        "Sample — replaced by the official statement when the Information for Voters is published.",
      text: "The proposed law would change the calculation of the state tax revenue limit and may have fiscal consequences for state government finances; the amount cannot be determined with certainty.",
      attribution: "Massachusetts Executive Office for Administration and Finance",
      note: "As required by law, statements of fiscal consequences are written by the Executive Office for Administration and Finance and published in the Information for Voters.",
    },
    // Each side's money claim, kept beside the official statement rather than
    // above it, and attributed rather than asserted.
    claims: {
      yes: {
        title:
          "“A revised cap would have returned ~$19 billion to taxpayers over four decades”",
        body: "Made by the Massachusetts Opportunity Alliance in its policy brief — a projection from the campaign's own recalculation, not an independent estimate; disputed by the opposing campaign.",
        ids: ["maoBrief"],
      },
      no: {
        title:
          "“The measures would strip billions from schools, hospitals, and services”",
        body: "Made by the opposing campaign about the two tax questions combined — a projected impact the official statement does not make; the size depends on future revenue and is contested.",
        ids: ["protectMAFuture", "massBudget"],
      },
    },
  },

  ballotHistory: {
    ids: [
      "petition",
      "ballotpedia",
      "h5006",
      "masslive62F",
      "wgbhAnalysts",
      "globeTaxCutOff",
      "secBallotNumbers",
      "cwbSenateRepeal",
    ],
    prompt:
      "Summarize how Petition No. 25-17 reached the November 2026 ballot: filing, certification, signature rounds, legislative review, the court rulings, numbering, and the current legislative threat. Use only the sources listed below and cite nothing else. (Filler prompt for prototype purposes.)",
    paragraphs: [
      "The petition to make taxpayer refunds more frequent was filed in August 2025 and certified in December 2025 after gathering 85,588 first-round signatures. Supporters argue it restores a taxpayer refund guarantee that has been quietly eroded, while opponents warn it would shrink the state budget and send the largest refunds to the highest earners.",
      "The measure entered the Legislature as House Bill 5006 in February 2026, where leaders labeled it a special-interest measure and let the May deadline pass without enacting it, sending supporters back out to gather a second round of signatures. After clearing the second-round threshold of 12,429 signatures, the ballot initiative was certified and numbered Question 5 on July 21.",
    ],
    /**
     * The same account as beats rather than prose, for scanning. `lead` keeps
     * the one thing a list cannot carry, which is why the two sides care; the
     * bullets carry the chronology, which is what a reader skims for.
     */
    lead: "Supporters argue the measure restores a taxpayer refund guarantee that has been quietly eroded. Opponents warn it would shrink the state budget and send the largest refunds to the highest earners.",
    /**
     * The same route to the ballot as five steps, for the top of the chapter.
     * Labels are deliberately the same words the full timeline uses, so the
     * summary and the record read as one account rather than two.
     */
    steps: [
      { when: "Aug 2025", label: "Petition filed" },
      { when: "Dec 2025", label: "Signatures certified" },
      { when: "Feb 2026", label: "Introduced as H.5006" },
      { when: "May 2026", label: "Legislature does not act" },
      { when: "Jul 2026", label: "Numbered Question 5" },
    ],
    bullets: [
      "Filed August 2025, certified that December after 85,588 first-round signatures",
      "Entered the Legislature as House Bill 5006 in February 2026, where leaders called it a special-interest measure",
      "The May deadline passed without a vote, sending supporters back out for a second round of signatures",
      "Cleared the second-round threshold of 12,429 signatures, and was certified and numbered Question 5 on July 21",
    ],
  },

  fundingPattern: {
    ids: ["ocpf", "ballotpedia"],
    prompt:
      "Summarize the OCPF campaign-finance filings for the committees supporting and opposing the 62F reform question: totals raised, cash versus in-kind contributions, notable donors, and the fact that the support committee also backs the companion income-tax question. Use only the sources listed below and cite nothing else. (Filler prompt for prototype purposes.)",
    text: "Through the January 20, 2026 filing window, the support side had reported roughly $1.7 million, almost entirely in-kind — dominated by a single $1.6 million in-kind contribution from the Massachusetts Opportunity Alliance, with smaller amounts from the Massachusetts High Technology Council and the Pioneer Institute. The same committee, Taxpayers for an Affordable Massachusetts, also supports the companion income-tax-cut question. The opposition committee, Protect Massachusetts' Future, had registered but reported no contributions or spending in this window. Dollar amounts are drawn from itemized OCPF filings; MAPLE does not estimate figures, and the next scheduled reports were due in September 2026.",
    windowNote:
      "From Massachusetts OCPF filings covering through January 20, 2026 — an early snapshot; the next scheduled reports were due September 2026.",
  },

  deliberation: {
    note: "Sample layout — discussions begin fall 2026.",
    body: "Massachusetts residents meet in facilitated groups — in person through GenUnity and the Mass Voter Table's Democracy Hubs, and online every Wednesday at 7pm — to reason through this question together. Sessions are recorded and synthesized with Dembrane ECHO; anonymized transcripts are public, so every synthesized claim below can be checked against what was actually said.",
    recruitment:
      "Participants are recruited across geography, age, tax situation (renters, homeowners, retirees, small-business owners), and politics, with informed consent for recording and publication.",
    stats: [
      { n: "3", label: "in-person cohorts" },
      { n: "2", label: "online sessions" },
      { n: "44", label: "participants" },
      { n: "6", label: "regions" },
      { n: "5", label: "public transcripts" },
    ],
    themesNote:
      "Each theme shows where groups agreed, where they split, and the trade-off they weighed — synthesized from session transcripts. (Illustrative)",
  },

  bibliographyNote:
    "Every source used to create the contents of this ballot initiative, with the exception of user-submitted testimony, is cited below.",
} as const;
