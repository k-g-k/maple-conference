// What each conference committee has already agreed, and what it has not.
//
// Ported from the bill-explorer prototype, which is the source of truth for
// this material. The field names and the vocabulary are its own, deliberately:
// "settled" and "open" are the two ideas the whole page rests on, and the three
// kinds of open question below are its taxonomy rather than one invented here.
//
// Eleven of the twelve committees carry a comparison. Economic development does
// not, and the page says so rather than showing an empty one.

import type { Conferee } from "./index";

/**
 * The three ways two bills can disagree.
 *
 * Worth separating, because they are not the same argument. Whether a provision
 * exists at all is a different conversation from how high to set a number, and
 * both are different from picking between two mechanisms for the same goal.
 * Across the twelve committees it is only ever one of these three: 26 include,
 * 25 calibrate, 6 tool.
 */
export type OpenKind = "include" | "tool" | "calibrate";

export const KIND: Record<OpenKind, { label: string; prompt: string }> = {
  include: {
    label: "Keep it or drop it",
    prompt: "whether this belongs in the final bill",
  },
  tool: {
    label: "Which approach",
    prompt: "which chamber's approach the final bill should take",
  },
  calibrate: {
    label: "Where to set it",
    prompt: "where the final bill should set this",
  },
};

/** One thing both bills already say, so it survives whatever the six decide. */
export interface Settled {
  /** The provision, in a line. */
  p: string;
  /** How each chamber words it, and where they differ in wording but not effect. */
  d: string;
  /** Source id, into `SOURCES`. */
  c?: string;
}

/** A conferee with a hand in the provision under discussion. */
export interface Tie {
  n: string;
  /** What connects them to it. */
  w: string;
}

/** One thing the two bills do not agree on. */
export interface OpenQuestion {
  q: string;
  /** The subject in a few words, for a list you scan before you read. */
  topic?: string;
  kind: OpenKind;
  /** The Senate's position, or null where the Senate bill is silent. */
  s: string | null;
  sc?: string;
  /** The House's position, or null where the House bill is silent. */
  h: string | null;
  hc?: string;
  snote?: string;
  hnote?: string;
  /**
   * Terms inside either answer that carry their own note, keyed by the exact
   * phrase as it appears in the text. For a term of art the page cannot spend
   * a sentence explaining, like a chapter number that is a whole regime.
   */
  notes?: Record<string, string[]>;
  /** Why it is the hard part, where it is. */
  why: string;
  /** Whether other states have done this, where that bears on it. */
  regional?: { t: string; c?: string };
  ties: Tie[];
}

/** Background the comparison assumes but does not state. */
export interface ContextNote {
  h: string;
  p: string;
  c?: string;
}

/** A member of the committee, as this prototype records them. */
export interface ConfereeDetail {
  name: string;
  district: string;
  party: string;
  chair?: boolean;
  note?: string;
  /** How they voted on their own chamber's version, where it is on the record. */
  vote?: { v: string; t: string; c?: string; note?: string };
}

export interface CommitteeDetail {
  slug: string;
  /** For a list, where the full title is too long. */
  short: string;
  title: string;
  subtitle: string;
  senateBill?: { n: string; u: string };
  houseBill?: { n: string; u: string };
  since: string;
  /** When the comparison below was last read against the bills. */
  checked: string;
  /** Whether both texts were read in full, rather than summarised from reporting. */
  textRead?: boolean;
  /** A clause naming how the two texts differ, read mid sentence. */
  claim?: string;
  /** Who in the room wrote or carried this bill, read after "includes". */
  who?: string;
  settled?: Settled[];
  open?: OpenQuestion[];
  /** Claims the prototype could not confirm against the texts. */
  unverified?: Settled[];
  context?: ContextNote[];
  conferees: { senate: ConfereeDetail[]; house: ConfereeDetail[] };
}

export const COMMITTEES: CommitteeDetail[] = [
  {
    slug: "phone-free-schools",
    short: "Phone-free schools",
    title: "Phones in schools, and who gets on social media",
    subtitle:
      "Both chambers wrote nearly the same phone policy. The House then added a chapter regulating social media platforms, a school curriculum on social media harms, and a device-lockout pilot, none of which the Senate has voted on.",
    senateBill: {
      n: "S.2581",
      u: "https://malegislature.gov/Bills/194/S2581.pdf",
    },
    houseBill: {
      n: "H.5366",
      u: "https://malegislature.gov/Bills/194/H5366.pdf",
    },
    since: "May 2026",
    checked: "September 17, 2026",
    textRead: true,
    claim: "the House adding a social media ban for children under 14",
    who: "Peisch, who filed the only bill that included a social media ban, and Crighton, who filed one of the seven phone bills the Senate merged",
    settled: [
      {
        p: "Phones barred during the school day",
        d: "Every district must have a policy prohibiting student use of personal electronic devices during the school day, including lunch, passing time and school-sponsored activities during the day.",
        c: "s29",
      },
      {
        p: "DESE issues guidance and a model policy",
        d: "Both bills direct the department to publish guidance, recommendations and a model policy, update it annually for new technology, and solicit public input first.",
        c: "s30",
      },
      {
        p: "Model policy takes over if a district misses the deadline",
        d: "If no local policy is approved by September 1, the state model policy applies until one is.",
        c: "s29",
      },
      {
        p: "Districts file their policy with DESE every year by September 1",
        d: "Identical in both bills.",
        c: "s30",
      },
      {
        p: "Families are told about the policy every year",
        d: "Senate: notice by September 1 and posted on the school website. House: at least once per school year on a schedule DESE sets.",
        c: "s29",
      },
      {
        p: "Exceptions for IEPs, disability accommodations and medical need",
        d: "Both bills allow use under an IEP or 504 plan, under an ADA or other legal accommodation, and on a health care provider's written note.",
        c: "s30",
      },
      {
        p: "A guaranteed way for families and students to reach each other",
        d: "At least one method each way during the school day, with consideration for emergencies.",
        c: "s29",
      },
      {
        p: "No suspension or expulsion just for breaking the phone rule",
        d: "Both bills bar it and require safeguards against inequitable discipline.",
        c: "s30",
      },
      {
        p: "DESE reports back to the Legislature on implementation",
        d: "Senate by December 31, 2027; House by September 1, 2028.",
        c: "s29",
      },
    ],
    open: [
      {
        topic: "Social media ban",
        q: "Does the bill regulate social media companies at all?",
        kind: "include",
        s: null,
        snote:
          "Not in the Senate bill. The Senate text is about phones in schools and nothing else.",
        h: "Regulates social media companies within the new law under Chapter 93M Online Protections. The House writes this as a new chapter of the consumer protection law, alongside the 93A the Attorney General already enforces under: platforms must bar users under 14; require verifiable parental consent at 14 and 15; give 14\u201315 year olds locked-down default settings, no addictive feed, and no notifications between midnight and 6 a.m.; run an age-assurance system with a three-day appeal; segregate the age data and never share a minor's LGBTQ+ status; publish counts of users processed and denied. Violations are 93A violations with fines of up to $5,000 per non-compliant account, and up to $1 million per day for failing to publish the counts. The Attorney General writes the rules and runs a complaint portal.",
        hc: "s30",
        why: "This is the negotiation. It is a full regulatory chapter travelling inside a school bill. The conferees can keep it, drop it, or split it. Sen. Comerford reports constituents raising concerns about the age-verification piece specifically.",
        regional: {
          t: "No New England state has enacted an age-verification or under-14 parental-consent regime like the House's Chapter 93M, and comparable laws elsewhere have been challenged and partly enjoined in ongoing NetChoice litigation. There is no regional precedent to lean on here: the House provision would be new to the region and legally untested.",
          c: "s78",
        },
        notes: {
          "Chapter 93M Online Protections": [
            "Platforms must bar users under 14.",
            "At 14 and 15, verifiable parental consent is required.",
            "Those accounts get locked-down defaults: no algorithmic feed, and no notifications between midnight and 6 a.m.",
            "An age-assurance system, with a three-day appeal for anyone wrongly denied.",
            "Age data kept separate, and a minor's LGBTQ+ status never shared.",
            "Published counts of users processed and users denied.",
            "Violations are 93A violations: up to $5,000 per non-compliant account, and up to $1 million a day for failing to publish the counts.",
            "The Attorney General writes the rules and runs a complaint portal.",
          ],
        },
        ties: [
          {
            n: "Alice Hanlon Peisch",
            w: "wrote the original social media language (H.666)",
          },
          { n: "David T. Vieira", w: "co-sponsored H.666" },
        ],
      },
      {
        topic: "Social media curriculum",
        q: "Must schools teach about the harms of social media?",
        kind: "include",
        s: null,
        h: "Schools must teach about the social, emotional and physical risks of social media use, at age-appropriate grade levels, with DESE guidance developed alongside the Attorney General and Department of Public Health.",
        hc: "s30",
        why: "A curriculum mandate, separate from the platform rules. Easier to keep than Chapter 93M if the conferees want to give the House something.",
        ties: [],
      },
      {
        topic: "Device lockout pilot",
        q: "Should DESE run a pilot to lock students' devices?",
        kind: "include",
        s: null,
        h: "DESE runs a one-year, ten-district pilot of technology that renders devices inoperable on school grounds, competitively procured, with 911 always reachable and strict data-privacy terms for the vendor.",
        hc: "s30",
        why: "",
        ties: [],
      },
      {
        topic: "Use or possession",
        q: "Is it a ban on using a phone, or on having one?",
        kind: "calibrate",
        s: "Bans use and 'actual possession, strictly on their person' during the school day.",
        sc: "s29",
        h: "Bans use, and requires the policy to specify a method for keeping devices out of reach: secure storage, lockout technology, or another DESE-approved method.",
        hc: "s30",
        why: "The Senate writes a possession ban into statute; the House leaves the mechanism to the district's chosen method.",
        ties: [],
      },
      {
        topic: "Extra exceptions",
        q: "Which extra exceptions apply?",
        kind: "calibrate",
        s: "Adds travel off campus to early college, dual enrollment or vocational sites, and case-specific exemptions DESE builds into the model policy on a finding of compelling need.",
        sc: "s29",
        h: "Adds emergencies, as determined by the district, and language access, meaning translation or interpretation, on the superintendent's written authorisation.",
        hc: "s30",
        why: "Both lists are additions to a shared core. A final bill could simply take both.",
        ties: [],
      },
      {
        topic: "Hearing on the guidance",
        q: "Does DESE have to hold a hearing before finalising its guidance?",
        kind: "calibrate",
        s: "DESE must take public input and hold at least one public hearing before finalizing its guidance.",
        sc: "s29",
        h: "Requires public input only, with no hearing before DESE finalizes its guidance.",
        hc: "s30",
        why: "",
        ties: [],
      },
      {
        topic: "Effective dates",
        q: "When does any of this take effect?",
        kind: "calibrate",
        s: "District policies are due before the 2026\u201327 school year. DESE guidance is due within 180 days of enactment.",
        sc: "s29",
        h: "Districts file their policies by September 1, 2026. Attorney General rules by September 1, 2026. Chapter 93M effective October 1, 2026. Emergency preamble so the act takes effect on signature.",
        hc: "s30",
        why: "Every date in both bills has now passed. Whatever the conferees agree, they are writing a new calendar.",
        ties: [],
      },
    ],
    unverified: [],
    context: [
      {
        h: "How the social media language got here",
        p: "It began as the STUDY Act, filed in January 2025 by Attorney General Campbell with Sen. Cyr, Rep. Peisch and Rep. Lipper-Garabedian. The Senate merged seven phone bills and left the social media half out. The House put it back in April 2026 when it amended the Senate bill, and passed it 129\u201325 \u2014 the only one of these five bills to draw a substantial no vote.",
        c: "s31",
      },
    ],
    conferees: {
      senate: [
        {
          name: "Brendan P. Crighton",
          district: "Third Essex",
          party: "D",
          chair: true,
          note: "Filed S.323, one of the seven Senate bills merged into the Senate version. Appointed May 7, 2026.",
          vote: {
            v: "unverified",
            t: "38\u20132, individual votes not verified",
          },
        },
        {
          name: "Michael J. Rodrigues",
          district: "First Bristol and Plymouth",
          party: "D",
          note: "Senate Ways and Means chair.",
          vote: {
            v: "unverified",
            t: "38\u20132, individual votes not verified",
          },
        },
        {
          name: "Peter J. Durant",
          district: "Worcester and Hampshire",
          party: "R",
          vote: {
            v: "unverified",
            t: "38\u20132, individual votes not verified",
          },
        },
      ],
      house: [
        {
          name: "Alice Hanlon Peisch",
          district: "14th Norfolk",
          party: "D",
          chair: true,
          note: "Lead sponsor of H.666, the STUDY Act, origin of the social media provisions. Appointed May 20, 2026.",
          vote: { v: "Y", t: "129\u201325", c: "s42" },
        },
        {
          name: "Frank A. Moran",
          district: "17th Essex",
          party: "D",
          vote: { v: "Y", t: "129\u201325", c: "s42" },
        },
        {
          name: "David T. Vieira",
          district: "3rd Barnstable",
          party: "R",
          note: "Co-sponsored H.666.",
          vote: {
            v: "N",
            t: "129\u201325",
            c: "s42",
            note: "Also voted for the rejected amendment #15 and for Consolidated Amendment B.",
          },
        },
      ],
    },
  },
  {
    slug: "workplace-violence",
    short: "Health care workplace violence",
    title: "Assaults on health care workers, and what to charge them as",
    subtitle:
      "The two bills are close to word-for-word on prevention, reporting and paid leave. They part on one thing: whether the answer to an assault is a new felony or a new arrest power.",
    senateBill: {
      n: "S.3184",
      u: "https://malegislature.gov/Bills/194/S3184.pdf",
    },
    houseBill: {
      n: "H.4767",
      u: "https://malegislature.gov/Bills/194/H4767.pdf",
    },
    since: "July 2026",
    checked: "September 17, 2026",
    textRead: true,
    claim:
      "the House making assault on a health care worker a felony and the Senate keeping it a misdemeanor",
    who: "Lovely, who filed the Senate bill",
    settled: [
      {
        p: "Facility violence prevention program and written plan",
        d: "Annual facility-specific risk assessment, a prevention program with training and incident reporting, and a written plan available to every employee and to their union on request. The two texts are nearly identical.",
        c: "s33",
      },
      {
        p: "Risk assessment done with workers and their unions",
        d: "Both bills require the assessment be performed in cooperation with employees and any labor organization representing them, against the same ten listed risk factors.",
        c: "s32",
      },
      {
        p: "A senior manager and a crisis response team for assaulted staff",
        d: "Both require an assaulted-staff action program with group and individual crisis counselling, support groups, family intervention and peer help.",
        c: "s33",
      },
      {
        p: "Annual incident reports to the state, published in aggregate",
        d: "Employers report every incident to the Department of Public Health and the local district attorney; DPH publishes county and statewide aggregates within 90 days.",
        c: "s32",
      },
      {
        p: "Paid, job-protected leave after an assault",
        d: "For medical treatment, victim services, a protective order, or court and prosecutor appointments. Does not draw down sick, vacation or personal time; runs concurrently with PFML; confidential; job restored on return.",
        c: "s33",
      },
      {
        p: "Victims can keep their home address off the criminal complaint",
        d: "Both let an assaulted worker list the facility's or their union's address instead, with the facility or union obliged to forward court papers promptly.",
        c: "s32",
      },
      {
        p: "The offense covers the whole shift, not just patient care",
        d: "Both bills strike the words 'treating or transporting a person' from the existing assault statute so it applies to a health care worker any time they are in the line of duty.",
        c: "s33",
      },
      {
        p: "A state report on alternatives to arrest for patients in crisis",
        d: "Both direct Health and Human Services and Public Safety to report within a year on interagency data sharing and on pathways into treatment that do not require an arrest.",
        c: "s32",
      },
      {
        p: "No employer retaliation for reporting",
        d: "Identical protection in both bills.",
        c: "s33",
      },
    ],
    open: [
      {
        topic: "Criminal penalty",
        q: "What happens to someone who assaults a health care worker?",
        kind: "tool",
        s: "Keeps the assault a misdemeanor and creates no new crime, adding a warrantless arrest power instead. A police officer with probable cause may arrest for a misdemeanor assault on a health care worker in the line of duty, the authority that already exists for domestic violence, and must use de-escalation and diversion first. It applies immediately at hospitals, and extends one year later to every other covered facility, including group homes run or funded by the Departments of Mental Health and Developmental Services.",
        sc: "s33",
        h: "Creates a new felony, Section 13I\u00bd, for knowing and intentional assault causing bodily injury. The penalty is up to 5 years in state prison, or up to 2\u00bd years in a house of correction, or a $500\u2013$5,000 fine. Causing serious bodily injury: up to 10 years in state prison, with the same alternatives.",
        hc: "s32",
        why: "Same goal, two instruments. The Senate's one-year delay is narrower than reported: it delays the extension of arrest power beyond hospitals, not the power itself. The Senate report also asks specifically about de-escalation in DDS group homes and patients with autism or developmental disabilities; the House report does not mention them.",
        regional: {
          t: "The House's felony is the mainstream approach: 32 states, including Connecticut, Maine and Rhode Island, already make assaulting a health-care worker a felony, and Maine's 2023 law reads much like the House bill — a second-degree felony punishable by up to 10 years. The Senate's warrantless-arrest-instead-of-felony route is the regional outlier.",
          c: "s75",
        },
        ties: [
          {
            n: "Joan B. Lovely",
            w: "lead Senate sponsor; explained the arrest provision on the floor",
          },
          { n: "Michael S. Day", w: "Judiciary co-chair" },
        ],
      },
      {
        topic: "Enforcement and fines",
        q: "Who enforces the employer duties, and what is the fine?",
        kind: "calibrate",
        s: "The Attorney General sues in Superior Court for an injunction; the court may add a civil penalty of up to $5,000 per violation.",
        sc: "s33",
        h: "The Department of Public Health may fine up to $2,000 per offense; employees, unions or any interested party may file a complaint in district court; the Attorney General may order a facility closed by cease-and-desist.",
        hc: "s32",
        why: "The Senate route is narrower and the fine larger; the House route opens the door to more complainants and includes a closure power.",
        ties: [],
      },
      {
        topic: "Contracted crisis teams",
        q: "Can the crisis response team be contracted out?",
        kind: "calibrate",
        s: "The crisis response team may be 'in-house or contracted'.",
        sc: "s33",
        h: "The crisis response team must be 'in-house'.",
        hc: "s32",
        why: "",
        ties: [],
      },
      {
        topic: "Regulation deadline",
        q: "Is there a deadline for the regulations?",
        kind: "calibrate",
        s: "Sets no deadline for the regulations. DPH 'shall' promulgate; Labor Standards 'shall' promulgate.",
        sc: "s33",
        h: "Gives both agencies 180 days after enactment.",
        hc: "s32",
        why: "",
        ties: [],
      },
    ],
    unverified: [],
    context: [
      {
        h: "Who wrote this bill",
        p: "The framework came from consensus legislation negotiated by the Massachusetts Health & Hospital Association, the Massachusetts Nurses Association and the Massachusetts division of 1199SEIU. That is why it passed the House 158\u20130 and the Senate without a dissenting vote, and why the conference is so narrow.",
        c: "s10",
      },
      {
        h: "Effective on signature",
        p: "The vehicle is H.4767, which carries an emergency preamble. The Senate amendment replaced everything after the enacting clause and left the preamble in place, so either version takes effect when signed.",
        c: "s34",
      },
      {
        h: "No deadline",
        p: "Under new joint rules the chambers only had to move the bill into conference by July 31. A final text can arrive during or after the campaign season.",
        c: "s11",
      },
    ],
    conferees: {
      senate: [
        {
          name: "Cindy F. Friedman",
          district: "Fourth Middlesex",
          party: "D",
          chair: true,
          note: "Appointed July 23, 2026.",
          vote: { v: "voice", t: "passed without a roll call", c: "s34" },
        },
        {
          name: "Joan B. Lovely",
          district: "Second Essex",
          party: "D",
          note: "Lead sponsor of the Senate bill (S.1718).",
          vote: { v: "voice", t: "passed without a roll call", c: "s34" },
        },
        {
          name: "Kelly A. Dooner",
          district: "Third Bristol and Plymouth",
          party: "R",
          vote: { v: "voice", t: "passed without a roll call", c: "s34" },
        },
      ],
      house: [
        {
          name: "Michael S. Day",
          district: "31st Middlesex",
          party: "D",
          chair: true,
          note: "Co-chair of the Judiciary Committee. Appointed July 23, 2026.",
          vote: { v: "unan", t: "158\u20130", c: "s34" },
        },
        {
          name: "Brandy Fluker-Reid",
          district: "12th Suffolk",
          party: "D",
          vote: { v: "unan", t: "158\u20130", c: "s34" },
        },
        {
          name: "Hannah Kane",
          district: "11th Worcester",
          party: "R",
          vote: { v: "unan", t: "158\u20130", c: "s34" },
        },
      ],
    },
  },
  {
    slug: "data-privacy",
    short: "Data privacy",
    title: "A consumer data privacy law, with the dials still unset",
    subtitle:
      "Both chambers passed a comprehensive privacy act unanimously. They share the architecture \u2014 rights, notices, assessments, AG enforcement \u2014 and disagree on nearly every number in it.",
    senateBill: {
      n: "S.2619",
      u: "https://malegislature.gov/Bills/194/S2619.pdf",
    },
    houseBill: {
      n: "H.5479",
      u: "https://malegislature.gov/Bills/194/H5479.pdf",
    },
    since: "June 2026",
    checked: "September 17, 2026",
    textRead: true,
    claim:
      "the House rewriting the Senate's bill so that the two now differ on about a dozen thresholds",
    settled: [
      {
        p: "The core consumer rights",
        d: "Access, correction, deletion, portability, a list of third parties who got your data, and the right to opt out of targeted advertising, sale and significant automated decisions. Same in both.",
        c: "s36",
      },
      {
        p: "No selling precise location data, ever",
        d: "An outright ban, not waivable by consent, covering data collected in Massachusetts regardless of the person's residency.",
        c: "s35",
      },
      {
        p: "Nothing targeted at minors",
        d: "No targeted advertising to, or sale of the data of, a known minor. Both treat minors' data as sensitive.",
        c: "s36",
      },
      {
        p: "A universal opt-out signal must be honoured",
        d: "Both require controllers to respect a browser or device-level opt-out preference signal.",
        c: "s35",
      },
      {
        p: "Consumers can appeal a refusal",
        d: "A conspicuous appeal process, a written answer within 60 days, and a route to complain to the Attorney General if denied.",
        c: "s36",
      },
      {
        p: "No discrimination by data",
        d: "Both bar collecting or processing personal data in a way that discriminates on race, sex, sexual orientation, gender identity, disability, religion, immigration status and the other Chapter 151B categories.",
        c: "s35",
      },
      {
        p: "Privacy notices and two ways to submit requests",
        d: "Both require a clear privacy notice and at least two secure channels for rights requests, without forcing a new account.",
        c: "s36",
      },
      {
        p: "Risk assessments for high-risk processing",
        d: "Both require documented data protection assessments for targeted advertising, sale, risky profiling and sensitive data, disclosable to the Attorney General.",
        c: "s35",
      },
      {
        p: "Attorney General enforces, $5,000 per violation",
        d: "Both make a violation a Chapter 93A unfair practice, give the AG the same remedies, cap civil penalties at $5,000 per violation, and require an AG complaint mechanism.",
        c: "s36",
      },
    ],
    open: [
      {
        topic: "Private right to sue",
        q: "Can consumers sue?",
        kind: "tool",
        s: "No private right to sue; the Attorney General has exclusive authority to bring an action.",
        sc: "s36",
        h: "Consumers may sue 'large data holders' (companies handling data of more than two million consumers, or sensitive data of more than 200,000) through Chapter 93A. AG enforcement stays exclusive for everyone else.",
        hc: "s35",
        why: "The single biggest structural difference. It decides who polices the law.",
        regional: {
          t: "No comprehensive state privacy law yet includes a general private right of action — Connecticut, New Hampshire and Rhode Island are all Attorney-General-only. The House's provision, even limited to large data holders, would reach further than any state in the region or the country.",
          c: "s64",
        },
        ties: [],
      },
      {
        topic: "Sensitive data sales",
        q: "Can companies sell sensitive data at all?",
        kind: "tool",
        s: "A flat ban on selling sensitive data, which may be processed only when strictly necessary for the product the consumer asked for.",
        sc: "s36",
        h: "Sensitive data may be sold with affirmative consent, except precise geolocation, which stays banned. Processing sensitive data also requires affirmative consent.",
        hc: "s35",
        why: "Advocates describe the Senate as stronger here and the House as stronger on the right to sue.",
        regional: {
          t: "Here the House has the regional cover: Connecticut, New Hampshire and Rhode Island all use opt-in consent for sensitive data rather than a flat ban on selling it. The Senate's outright ban follows Maryland, outside New England.",
          c: "s67",
        },
        ties: [],
      },
      {
        topic: "Cure period",
        q: "Do companies get time to fix violations before the AG sues?",
        kind: "include",
        s: "The AG must send a notice of violation and wait 60 days for a cure, unless a cure is impossible or immediate enforcement is needed. The cure period is repealed on June 1, 2027.",
        sc: "s36",
        h: "No cure period.",
        hc: "s35",
        why: "",
        regional: {
          t: "The Senate's cure-then-sunset tracks the region. Connecticut's cure period sunset at the end of 2024 and New Hampshire's has expired, while Rhode Island's law never had one. The House's no-cure approach matches Rhode Island.",
          c: "s65",
        },
        ties: [],
      },
      {
        topic: "Who must comply",
        q: "Who has to comply?",
        kind: "calibrate",
        s: "Covers businesses handling data of 60,000 or more consumers; or 20,000 with a fifth of revenue from data sales; or any reproductive or sexual health data.",
        sc: "s36",
        h: "Covers businesses handling data of 100,000 or more consumers; or earning $100,000 or more from data sales; or handling any sensitive data.",
        hc: "s35",
        why: "Higher headcount threshold in the House, but the 'any sensitive data' trigger may pull in more small businesses than the Senate's version.",
        regional: {
          t: "Both Massachusetts thresholds sit above the neighbors'. New Hampshire and Rhode Island each cover businesses at 35,000 consumers, so the MA bills reach fewer small businesses than either.",
          c: "s66",
        },
        ties: [],
      },
      {
        topic: "Data minimization",
        q: "How little data must a company get away with collecting?",
        kind: "calibrate",
        s: "Limits collection to what is reasonably necessary to provide or maintain the specific product or service requested.",
        sc: "s36",
        h: "Limits collection to what is reasonably necessary and proportionate to the disclosed purpose, consistent with the consumer's reasonable expectations, judged by a four-factor test.",
        hc: "s35",
        why: "The Senate standard is tighter and simpler; the House standard is more flexible and harder to apply.",
        ties: [],
      },
      {
        topic: "Attorney General rulemaking",
        q: "Must the Attorney General write rules?",
        kind: "calibrate",
        s: "The Attorney General may write rules. The grant is open-ended and optional.",
        sc: "s36",
        h: "The Attorney General must write rules in six named areas by May 1, 2027.",
        hc: "s35",
        why: "",
        ties: [],
      },
      {
        topic: "Definition of sensitive",
        q: "What counts as sensitive?",
        kind: "calibrate",
        s: "Sensitive means government IDs, health data including neural data, biometric and genetic data, precise location, log-in credentials, children's data, race and ethnicity, religion, immigration status, sex life and sexual orientation, transgender or non-binary status, crime-victim status.",
        sc: "s36",
        h: "The Senate list plus union membership, veteran status, and a separate 'consumer health and wellness data' category for fitness, sleep and mood tracking.",
        hc: "s35",
        why: "",
        ties: [],
      },
      {
        topic: "Exemptions",
        q: "Who is exempt?",
        kind: "calibrate",
        s: "Exempts government, banks and credit unions, broker-dealers, insurance-fraud nonprofits, securities associations, and HIPAA entities handling 60,000 or fewer consumers.",
        sc: "s36",
        h: "The Senate's list, plus educational nonprofits including colleges, and blood banks; and all HIPAA entities regardless of size.",
        hc: "s35",
        why: "",
        ties: [],
      },
      {
        topic: "Algorithmic decisions",
        q: "Do you get an explanation when an algorithm decides against you?",
        kind: "include",
        s: "If profiling drives a decision about credit, housing, insurance, education, employment or health care, the consumer may question it, be told why, be told what would change the outcome, and have it re-run on corrected data.",
        sc: "s36",
        h: "The consumer may opt out of profiling that drives solely automated decisions, but gets no right to an explanation.",
        hc: "s35",
        why: "Both bills carry the opt-out. Only the Senate turns it into a right to be told why, and to have the decision re-run on corrected data.",
        ties: [],
      },
      {
        topic: "Data in a sale",
        q: "What happens to your data when a company is sold?",
        kind: "calibrate",
        s: "The acquiring company must notify consumers after the acquisition.",
        sc: "s36",
        h: "The transferring company must notify consumers before the transfer and give them a reasonable chance to withdraw consent, at least 60 days for genetic, neural or biometric data.",
        hc: "s35",
        why: "",
        ties: [],
      },
      {
        topic: "Data broker study",
        q: "Should the state study data brokers?",
        kind: "include",
        s: null,
        h: "The Office of Consumer Affairs studies data brokers. It reports by July 1, 2027 with proposed legislation, including on a registry.",
        hc: "s35",
        why: "",
        ties: [],
      },
      {
        topic: "Effective date",
        q: "When does it take effect?",
        kind: "calibrate",
        s: "Takes effect January 1, 2027.",
        sc: "s36",
        h: "Takes effect July 1, 2027, with the AG barred from requesting data protection assessments before July 1, 2028.",
        hc: "s35",
        why: "Six months apart. The Senate date is now under four months away.",
        ties: [],
      },
    ],
    unverified: [],
    context: [
      {
        h: "Two unanimous votes, a year apart",
        p: "The Senate passed its bill 40\u20130 in September 2025. The House passed its rewrite 146\u20130 in June 2026. Nobody voted against either, which means the conference is where all the actual disagreement lives.",
        c: "s18",
      },
    ],
    conferees: {
      senate: [
        {
          name: "Cynthia Stone Creem",
          district: "Norfolk and Middlesex",
          party: "D",
          chair: true,
          note: "Senate Majority Leader.",
          vote: { v: "unan", t: "40\u20130", c: "s18" },
        },
        {
          name: "Barry R. Finegold",
          district: "Second Essex and Middlesex",
          party: "D",
          vote: { v: "unan", t: "40\u20130", c: "s18" },
        },
        {
          name: "Patrick M. O'Connor",
          district: "First Plymouth and Norfolk",
          party: "R",
          vote: { v: "unan", t: "40\u20130", c: "s18" },
        },
      ],
      house: [
        {
          name: "Michael J. Moran",
          district: "18th Suffolk",
          party: "D",
          chair: true,
          vote: { v: "unan", t: "146\u20130", c: "s18" },
        },
        {
          name: "Tricia Farley-Bouvier",
          district: "2nd Berkshire",
          party: "D",
          vote: { v: "unan", t: "146\u20130", c: "s18" },
        },
        {
          name: "David T. Vieira",
          district: "3rd Barnstable",
          party: "R",
          vote: { v: "unan", t: "146\u20130", c: "s18" },
        },
      ],
    },
  },
  {
    slug: "public-records",
    short: "Public records",
    title: "Opening the Legislature's records, with a ballot question watching",
    subtitle:
      "The two chambers agree on the mechanics of legislative records requests almost line for line. They disagree on what a court can do when the Legislature says no, on a press shield, on the State Auditor, and on whether the Governor gets a new exemption.",
    senateBill: {
      n: "S.3244",
      u: "https://malegislature.gov/Bills/194/S3244.pdf",
    },
    houseBill: {
      n: "H.5469",
      u: "https://malegislature.gov/Bills/194/H5469.pdf",
    },
    since: "July 2026",
    checked: "September 28, 2026",
    textRead: true,
    claim:
      "differing on how far the Legislature itself can be made to answer a records request",
    who: "Creem, who shepherded the Senate bill, Friedman, whose amendment to it was rejected on the floor, and Vargas, who spoke for the House bill on passage",
    settled: [
      {
        p: "The Governor's office comes under the public records law",
        d: "Both bills apply Chapter 66 to the Office of the Governor, prospectively from early January 2027.",
        c: "s37",
      },
      {
        p: "An enumerated list of legislative records, not the whole public records law",
        d: "Both create a defined category \u2014 bills and amendments, hearing notices and attendance, written testimony, committee votes and reports, journals and roll calls, assignments, appointments, statutory reports, comptroller financial records including salaries, ethics disclosures, press credentials, district maps \u2014 and make it the sole route to legislative records.",
        c: "s38",
      },
      {
        p: "A records access officer in each chamber",
        d: "Both require one per branch, with posted contact details and published guidelines, including guidelines for frivolous or harassing requests.",
        c: "s37",
      },
      {
        p: "Ten business days to respond, thirty at most",
        d: "Both set the same clock: produce or explain within 10 business days; if the request is burdensome, a written response and a production date no more than 30 business days out.",
        c: "s38",
      },
      {
        p: "Reconsideration, then the Rules Committee, then a court",
        d: "Both: a denied requester asks the officer to reconsider within 30 days; the officer answers in 10 business days; the chamber's Rules Committee may reverse; then the requester may go to court.",
        c: "s37",
      },
      {
        p: "Records that would endanger safety are excluded",
        d: "Blueprints, floor plans, security protocols and access-control information in both.",
        c: "s38",
      },
      {
        p: "Electronic delivery in a usable format",
        d: "Both require records be provided electronically, in the requester's preferred format where feasible, and bar demanding creation of new records.",
        c: "s37",
      },
    ],
    open: [
      {
        topic: "Court review",
        q: "What can a court actually do when the Legislature says no?",
        kind: "tool",
        s: "A petition in the nature of certiorari to Suffolk Superior Court within 60 days, reviewed on the administrative record alone. There is no discovery, and the court may find only that the determination did or did not contain 'substantial errors of law'. It may not order production, grant injunctive or declaratory relief, or award fees.",
        sc: "s38",
        h: "A petition to the Supreme Judicial Court, which has original and exclusive jurisdiction, reviews de novo, and must presume the record is public with the burden on the Legislature to prove otherwise by a preponderance of the evidence.",
        hc: "s37",
        why: "This cuts against the easy story. The Senate's court is easier to reach but can do very little; the House's court is the highest in the state, but once there, it reviews everything fresh and the Legislature carries the burden. Neither is simply 'stronger'.",
        ties: [],
      },
      {
        topic: "Journalist shield",
        q: "Should journalists be protected from being forced to reveal sources?",
        kind: "include",
        s: "No court, grand jury or body with subpoena power may compel a journalist or news organisation to identify a confidential source, except on a court finding by clear and convincing evidence that the information is material, critical, unavailable elsewhere, and of overriding public interest. Adopted 40\u20130 as a floor amendment from Sen. Rausch.",
        sc: "s38",
        h: null,
        why: "Massachusetts is one of nine states without a shield law. The provision was never offered in the House, so the House conferees have not voted on it. The Senate definition covers journalists working for a news organisation; it does not reach independent writers.",
        regional: {
          t: "Rhode Island, Maine and Connecticut all have journalist shield statutes; Massachusetts and New Hampshire rely only on a case-by-case common-law privilege. The Senate's shield would bring Massachusetts in line with most of its neighbors.",
          c: "s71",
        },
        ties: [],
      },
      {
        topic: "The Auditor's power",
        q: "Should the State Auditor's power over the Legislature be written into statute?",
        kind: "include",
        s: null,
        snote:
          "Not in the Senate bill. The Senate text has no audit provisions at all.",
        h: "The Auditor may audit the Legislature's 'administrative functions' (budgets, official audits, expenditures and settlement agreements from FY2021 on) but not its 'constitutional functions' such as deliberation. Records requests get a 60-day response; interviews need the presiding officer's authorisation; disputes go into a 'statement of dispute' in the audit report, and no court may compel production.",
        hc: "s37",
        why: "This responds to the 2024 ballot question authorising a legislative audit, and to the litigation that followed. The House framework is the only place in either bill where a court is expressly told it has no jurisdiction.",
        ties: [],
      },
      {
        topic: "Governor's policy drafts",
        q: "Can the Governor withhold policy-in-development documents?",
        kind: "include",
        s: "In addition to the existing exemptions, the Governor's office may withhold 'communications, memoranda, drafts or other documents relating to developing policy positions'.",
        sc: "s38",
        h: null,
        hnote:
          "No such exemption. The Governor's office is treated as any other agency under Chapter 66.",
        why: "A deliberative-process exemption that the executive branch has long argued for and that the House bill does not grant.",
        ties: [],
      },
      {
        topic: "Existing records",
        q: "Does it reach records that already exist?",
        kind: "calibrate",
        s: "The act takes effect January 1, 2027 and applies only to records made or received on or after January 6, 2027. Earlier records are not legislative records, though the officer may help find ones that are readily available.",
        sc: "s38",
        h: "For the Governor, records from January 7, 2027 on; for the Legislature, no date limit is written into the legislative records section.",
        hc: "s37",
        why: "Both make the Governor's obligation prospective. Only the Senate makes the Legislature's prospective too.",
        ties: [],
      },
      {
        topic: "Which records qualify",
        q: "Which records make the list?",
        kind: "calibrate",
        s: "Adds names, titles and salaries as kept by each chamber's HR office, and procurements and contracts for goods and services.",
        sc: "s38",
        h: "Adds the final report of any audit by the State Auditor under the new audit section.",
        hc: "s37",
        why: "Both lists share about seventeen categories. These are the additions on each side.",
        ties: [],
      },
      {
        topic: "Fees",
        q: "What can the Legislature charge?",
        kind: "calibrate",
        s: "Sets no fee schedule. Because the section sits inside Chapter 66, the general public records fee rules would presumably apply, but the text does not say so.",
        sc: "s38",
        h: "An explicit schedule: 5 cents a page, up to $25 an hour after the first four hours, no charge for redaction unless required, waivers for public-interest requests and for requesters who cannot pay.",
        hc: "s37",
        why: "",
        ties: [],
      },
      {
        topic: "Funding",
        q: "Is there money to implement it?",
        kind: "include",
        s: null,
        h: "Provides $1 million to implement it. That is $250,000 each for the Governor's office, the Senate, the House and joint operations, for technology, records systems and staff.",
        hc: "s37",
        why: "",
        ties: [],
      },
    ],
    unverified: [],
    context: [
      {
        h: "Where Massachusetts stands regionally",
        p: "Massachusetts is the only state where the Legislature, the governor's office and the judiciary all claim to be exempt from the public records law. Every other state — all five New England neighbors included — already subjects its legislature to public records to some degree, so the shared parts of these bills are Massachusetts catching up to a regional floor rather than setting a new standard.",
        c: "s73",
      },
      {
        h: "Question 1 on November 3",
        p: "A ballot initiative would apply the full public records law to both the Legislature and the Governor's office. Senate Republicans argued the bill could interfere with the vote; under the new rules a conference report may not appear until after it. Whichever way the vote goes, it changes what the conferees are negotiating against.",
        c: "s27",
      },
      {
        h: "Same architecture, different statute",
        p: "The House puts the legislative records regime in Chapter 3 and says Chapter 66 does not apply to the Legislature. The Senate puts it inside Chapter 66 as a new Section 22 and amends the definition of public record so that, for the Legislature, it means only legislative records. The practical mechanics are nearly identical; the framing differs.",
        c: "s38",
      },
      {
        h: "Disclosure",
        p: "Partners in Democracy, the organisation that runs MAPLE, joined a public statement criticising the House for passing H.5469 within a day of its release and without a hearing, and supports the ballot question. MAPLE takes no position on this bill; this page describes both chambers' texts on the same terms.",
        c: "s28",
      },
    ],
    conferees: {
      senate: [
        {
          name: "Cynthia Stone Creem",
          district: "Norfolk and Middlesex",
          party: "D",
          chair: true,
          note: "Senate Majority Leader; shepherded the Senate bill.",
          vote: { v: "Y", t: "34\u20136", c: "s43" },
        },
        {
          name: "Cindy F. Friedman",
          district: "Fourth Middlesex",
          party: "D",
          vote: { v: "Y", t: "34\u20136", c: "s43" },
        },
        {
          name: "Kelly A. Dooner",
          district: "Third Bristol and Plymouth",
          party: "R",
          note: "Filed an amendment to the Senate bill that was rejected on the floor.",
          vote: { v: "N", t: "34\u20136", c: "s43" },
        },
      ],
      house: [
        {
          name: "Alice Hanlon Peisch",
          district: "14th Norfolk",
          party: "D",
          chair: true,
          vote: {
            v: "unverified",
            t: "125\u201328, individual votes not verified",
          },
        },
        {
          name: "Andres X. Vargas",
          district: "3rd Essex",
          party: "D",
          note: "Spoke for the House bill on passage.",
          vote: {
            v: "unverified",
            t: "125\u201328, individual votes not verified",
          },
        },
        {
          name: "David K. Muradian, Jr.",
          district: "9th Worcester",
          party: "R",
          vote: {
            v: "unverified",
            t: "125\u201328, individual votes not verified",
          },
        },
      ],
    },
  },
  {
    slug: "ballot-question-finance",
    short: "Ballot question finance",
    title:
      "Who pays for ballot questions, and whether to rethink the whole process",
    subtitle:
      "The disclosure rules are word-for-word the same in both bills. The House added a commission to redesign the initiative process, post-election compliance certifications, and a rule pointing voters to the money; the Senate added disclosure for the campaign to get on the ballot in the first place.",
    senateBill: {
      n: "S.2916",
      u: "https://malegislature.gov/Bills/194/S2916.pdf",
    },
    houseBill: {
      n: "H.5558",
      u: "https://malegislature.gov/Bills/194/H5558.Html",
    },
    since: "July 2026",
    checked: "September 17, 2026",
    textRead: true,
    claim:
      "the House adding a commission to draft constitutional changes to the initiative process",
    who: "Peisch, who led the House review of initiative petitions in the last two cycles",
    settled: [
      {
        p: "Monthly disclosure, then twice a month",
        d: "Statewide ballot question committees file by the 5th of each month until 60 days before the election, then on the 5th and 20th, then November 20 and January 20. Identical text.",
        c: "s41",
      },
      {
        p: "Paid signature gatherers must say so on the form",
        d: "Petition forms circulated by paid gatherers must carry a disclosure set by the Secretary of the Commonwealth.",
        c: "s40",
      },
      {
        p: "No pay per signature",
        d: "Nothing of value contingent on the number of signatures, including bonuses. $100 to $10,000 per signature collected in violation.",
        c: "s41",
      },
      {
        p: "In-kind gifts and new debts itemised monthly",
        d: "Every in-kind contribution over $50, and every new liability, listed by name and purpose.",
        c: "s40",
      },
      {
        p: "Big late money reported within 72 hours",
        d: "A contribution of $500 or more in the last 18 days must be reported within 72 hours of deposit.",
        c: "s41",
      },
      {
        p: "First report reaches back to January 1, 2026",
        d: "Both require the first filing after enactment to cover everything since the last report or since January 1, 2026.",
        c: "s40",
      },
      {
        p: "Effective on signature",
        d: "The vehicle is S.2916, which carries an emergency preamble the House left intact.",
        c: "s41",
      },
    ],
    open: [
      {
        topic: "Initiative process commission",
        q: "Should a commission redesign the initiative petition process?",
        kind: "include",
        s: null,
        h: "Creates a 13-member special commission on the initiative petition process, co-chaired by the Election Laws chairs. It also seats the Judiciary chairs, the Secretary and Attorney General, two ballot-campaign veterans named by the Speaker and Senate President, minority-leader designees, and three gubernatorial appointees including a retired SJC justice, a Common Cause representative and a city or town clerk. It must report by December 31, 2027 with draft constitutional amendments on the AG's certification power, ballot summaries, signature thresholds and geographic distribution, paid gathering, and deadlines.",
        hc: "s40",
        why: "The House conference chair led the committee that recommended no action on ballot questions in the last two cycles. Supporters of this year's questions read a review commission as a step toward tightening the process; the commission's charge includes whether to expand the AG's power to block questions before they reach the ballot.",
        ties: [
          {
            n: "Alice Hanlon Peisch",
            w: "led the House review of initiative petitions in the last two cycles",
          },
          {
            n: "Daniel J. Hunt",
            w: "Election Laws co-chair; would co-chair the commission",
          },
        ],
      },
      {
        topic: "Ballot access campaigns",
        q: "Does the campaign to get on the ballot have to disclose too?",
        kind: "include",
        s: "'Supporting or opposing a question' expressly includes the effort to place it on the ballot, with OCPF to define what counts (polling, research, legal and consulting spending). Disclosure begins when petition forms are issued. Lobbying is excluded.",
        sc: "s41",
        h: null,
        why: "The one Senate addition the House did not take. It pulls the pre-signature phase into the reporting regime.",
        ties: [],
      },
      {
        topic: "Compliance certification",
        q: "Should the state certify compliance after each election?",
        kind: "include",
        s: null,
        h: "Within 60 days of the election, the Secretary certifies whether signature payments complied, and the OCPF director certifies whether each committee complied with reporting rules. A supplemental report follows if a case is referred to the Attorney General.",
        hc: "s40",
        why: "",
        ties: [],
      },
      {
        topic: "Pointing voters to the money",
        q: "Should voters be pointed to the money?",
        kind: "include",
        s: null,
        h: "Voters are pointed to OCPF's campaign finance reports for each question. The notice must appear on petition forms and in the state voter information booklet.",
        hc: "s40",
        why: "",
        ties: [],
      },
      {
        topic: "OCPF referral deadline",
        q: "How long does OCPF have to refer a violation?",
        kind: "include",
        s: null,
        h: "Statewide ballot question violations must be referred to the Attorney General no later than 30 days before, or three years after, the election.",
        hc: "s40",
        why: "",
        ties: [],
      },
    ],
    unverified: [],
    context: [
      {
        h: "Timing",
        p: "Nine questions are on the November 2026 ballot. Under the new rules the conference report may not come until after the election, so none of this applies to the campaigns now running. The Senate passed its bill 38\u20130 in January; the House passed its version 149\u20130 in July.",
        c: "s41",
      },
    ],
    conferees: {
      senate: [
        {
          name: "Sal N. DiDomenico",
          district: "Middlesex and Suffolk",
          party: "D",
          chair: true,
          note: "Appointed July 20, 2026.",
          vote: { v: "Y", t: "38\u20130", c: "s44" },
        },
        {
          name: "Jacob R. Oliveira",
          district: "Hampden, Hampshire and Worcester",
          party: "D",
          vote: { v: "Y", t: "38\u20130", c: "s44" },
        },
        {
          name: "Ryan C. Fattman",
          district: "Worcester and Hampden",
          party: "R",
          vote: { v: "Y", t: "38\u20130", c: "s44" },
        },
      ],
      house: [
        {
          name: "Daniel J. Hunt",
          district: "13th Suffolk",
          party: "D",
          chair: true,
          note: "Co-chair of Election Laws. Appointed July 23, 2026.",
          vote: { v: "Y", t: "149\u20130", c: "s45" },
        },
        {
          name: "Alice Hanlon Peisch",
          district: "14th Norfolk",
          party: "D",
          note: "Led the House review of initiative petitions in the last two cycles.",
          vote: { v: "Y", t: "149\u20130", c: "s45" },
        },
        {
          name: "Paul K. Frost",
          district: "7th Worcester",
          party: "R",
          vote: { v: "Y", t: "149\u20130", c: "s45" },
        },
      ],
    },
  },
  /* ---- stubs: conferees only ---- */
  {
    slug: "bright-act",
    short: "BRIGHT Act",
    title: "Modernizing every public college campus, and how much to borrow",
    subtitle:
      "Both chambers back a Fair Share-funded bond to fix and decarbonize all 29 public higher-ed campuses. They agree on the mechanism and differ mainly on the size of the authorization.",
    senateBill: { n: "S.2993", u: "https://malegislature.gov/Bills/194/S2993" },
    houseBill: { n: "H.4769", u: "https://malegislature.gov/Bills/194/H4769" },
    since: "April 2026",
    checked: "September 28, 2026",
    textRead: false,
    claim:
      "about $66 million apart on how much to borrow, with the Senate the higher of the two",
    settled: [
      {
        p: "Fair Share revenue backs new special obligation bonds",
        d: "Both bills finance the program with special obligation bonds backed by the voter-approved Fair Share surtax, issued for a term of up to 30 years, modeled on the transportation fund approach.",
        c: "s47",
      },
      {
        p: "Every public campus is covered",
        d: "All 15 community colleges, 9 state universities and the UMass system.",
        c: "s46",
      },
      {
        p: "Deferred maintenance, modernization and decarbonization",
        d: "Both direct the bulk of the money at the maintenance backlog, modern labs and classrooms, and cutting fossil-fuel reliance.",
        c: "s47",
      },
    ],
    open: [
      {
        topic: "Authorization amount",
        q: "How much should the bill authorize?",
        kind: "calibrate",
        s: "Authorizes about $3.71 billion, with $125 million a year in Fair Share revenue dedicated to campus capital.",
        sc: "s46",
        h: "Authorizes about $3.65 billion, with $100 million a year in Fair Share revenue dedicated to campus capital.",
        hc: "s47",
        why: "About $66 million apart on the total, and $25 million a year apart on the dedicated surtax revenue behind it. Both set aside roughly $2.5 billion of the total for deferred maintenance.",
        ties: [],
      },
      {
        topic: "Property sale proceeds",
        q: "Where do proceeds from selling or leasing campus property go?",
        kind: "include",
        s: "A floor amendment directs proceeds from a public college's sold or leased land or buildings back to the institution that sold it.",
        sc: "s46",
        h: "Proceeds go into a new Higher Education Property Disposition Fund held centrally under chapter 29.",
        hc: "s47",
        why: "The same money, sent to different places: back to the campus that sold the property, or into a central fund.",
        ties: [],
      },
    ],
    unverified: [],
    context: [
      {
        h: "Where it came from",
        p: "Filed by Governor Healey in January 2025 to unlock capital for campuses she described as suffering historic underinvestment since the 1970s. The House passed it 148–5 in November 2025; the Senate passed it unanimously in February 2026.",
        c: "s46",
      },
    ],
    conferees: {
      senate: [
        {
          name: "Joanne M. Comerford",
          district: "Hampshire, Franklin and Worcester",
          party: "D",
          chair: true,
          note: "Higher Education Committee co-chair; leads the Senate side.",
          vote: { v: "unan", t: "unanimous", c: "s46" },
        },
        {
          name: "Michael F. Rush",
          district: "Norfolk and Suffolk",
          party: "D",
          vote: { v: "unan", t: "unanimous", c: "s46" },
        },
        {
          name: "Kelly A. Dooner",
          district: "Third Bristol and Plymouth",
          party: "R",
          vote: { v: "unan", t: "unanimous", c: "s46" },
        },
      ],
      house: [
        {
          name: "David M. Rogers",
          district: "24th Middlesex",
          party: "D",
          chair: true,
          note: "House Higher Education Committee chair; leads the House side.",
          vote: {
            v: "unverified",
            t: "148\u20135, individual votes not verified",
          },
        },
        {
          name: "Michael J. Finn",
          district: "6th Hampden",
          party: "D",
          note: "House Bonding Committee chair.",
          vote: {
            v: "unverified",
            t: "148\u20135, individual votes not verified",
          },
        },
        {
          name: "Kelly W. Pease",
          district: "4th Hampden",
          party: "R",
          vote: {
            v: "unverified",
            t: "148\u20135, individual votes not verified",
          },
        },
      ],
    },
  },
  {
    slug: "mass-ready",
    short: "Mass Ready Act",
    title: "The environmental bond, plus the policy the Senate hung on it",
    subtitle:
      "Both chambers back a multibillion-dollar environmental bond for climate resilience, water and land, and they differ on its size. The Senate attached policy the House did not, a plastic-bag ban and flood-risk disclosure among them, and the House waives more local process for the culvert permits both bills fast-track.",
    senateBill: { n: "S.3064", u: "https://malegislature.gov/Bills/194/S3064" },
    houseBill: { n: "H.5518", u: "https://malegislature.gov/Bills/194/H5518" },
    since: "July 2026",
    checked: "September 28, 2026",
    textRead: false,
    claim:
      "apart on the borrowing and further apart on the policy riding with it, including a statewide plastic bag ban and how much local process to waive for culvert permits",
    who: "Cyr, who represents more coastline than any other senator",
    settled: [
      {
        p: "A multibillion-dollar, five-year environmental bond",
        d: "Both authorize borrowing in the billions for climate resilience, drinking water, land and infrastructure; this bill is passed roughly once every five years. The House authorizes about $3.08 billion and the Senate about $3.95 billion.",
        c: "s48",
      },
      {
        p: "Protecting drinking water and removing 'forever chemicals'",
        d: "Both fund PFAS removal and municipal water resilience against floods and droughts.",
        c: "s48",
      },
      {
        p: "Outdoor recreation and land conservation",
        d: "Both invest in trails, parks and natural and working lands.",
        c: "s49",
      },
    ],
    open: [
      {
        topic: "Plastic bag ban",
        q: "Ban single-use plastic bags at checkout statewide?",
        kind: "include",
        s: "Removes single-use plastic bags from retail checkout; shoppers get a reusable or recyclable paper bag instead.",
        sc: "s48",
        h: null,
        hnote:
          "Not established in the published House materials. A statewide bag ban was dropped from the 2018 environmental bond in conference, so its fate here is a live question.",
        why: "A high-profile policy the Senate wrote into a bond bill. The conferees can keep it, drop it, or narrow it.",
        regional: {
          t: "Four of the six New England states — Connecticut, Maine, Rhode Island and Vermont — already ban single-use plastic bags; New Hampshire is the only other holdout. A statewide ban has repeatedly stalled in Massachusetts, including a Senate-passed version that died in the House in 2024.",
          c: "s74",
        },
        ties: [],
      },
      {
        topic: "Flood-risk disclosure",
        q: "Tell homebuyers and renters about flood risk?",
        kind: "include",
        s: "Requires disclosure of flood risk to prospective buyers and renters.",
        sc: "s48",
        h: null,
        hnote: "Not established in the published House materials.",
        why: "A Senate consumer-disclosure addition with no confirmed House counterpart.",
        ties: [],
      },
      {
        topic: "Culvert permitting",
        q: "How far to fast-track permits for municipal culvert work?",
        kind: "calibrate",
        s: "A general permit for municipal culvert repair and replacement that meets new resilient-design standards, with water-quality certification due within 60 days.",
        sc: "s89",
        h: "The same general permit, reaching further: local wetlands bylaws and ordinances do not apply, and no public hearing is required.",
        hc: "s90",
        why: "The permitting easing in both texts is this one class of municipal culvert work, not housing. The House waives more of the local process, which is where the two part.",
        ties: [],
      },
    ],
    unverified: [
      {
        p: "Total authorization size",
        d: "Senate ~$3.64 billion. The House total was not established from published materials.",
        c: "s48",
      },
      {
        p: "Public beach access",
        d: "In the Senate bill. House position not compared.",
        c: "s48",
      },
    ],
    context: [
      {
        h: "What Comerford is tracking",
        p: "Sen. Comerford has flagged funding for the Quabbin Watershed, Connecticut River Valley community provisions, and accessible trails as items she wants kept in the final bill.",
        c: "s62",
      },
    ],
    conferees: {
      senate: [
        {
          name: "Julian Cyr",
          district: "Cape and Islands",
          party: "D",
          chair: true,
          note: "Leads the Senate side; represents more coastline than any other senator.",
          vote: {
            v: "unverified",
            t: "36\u20133, individual votes not verified",
          },
        },
        {
          name: "Rebecca L. Rausch",
          district: "Norfolk, Worcester and Middlesex",
          party: "D",
          vote: {
            v: "unverified",
            t: "36\u20133, individual votes not verified",
          },
        },
        {
          name: "Peter J. Durant",
          district: "Worcester and Hampshire",
          party: "R",
          vote: {
            v: "unverified",
            t: "36\u20133, individual votes not verified",
          },
        },
      ],
      house: [
        {
          name: "Michael J. Finn",
          district: "6th Hampden",
          party: "D",
          chair: true,
          note: "Leads the House side.",
          vote: {
            v: "unverified",
            t: "passed June 17, individual votes not verified",
          },
        },
        {
          name: "Christine P. Barber",
          district: "34th Middlesex",
          party: "D",
          note: "House Environment Committee chair.",
          vote: {
            v: "unverified",
            t: "passed June 17, individual votes not verified",
          },
        },
        {
          name: "Kenneth P. Sweezey",
          district: "6th Plymouth",
          party: "R",
          vote: {
            v: "unverified",
            t: "passed June 17, individual votes not verified",
          },
        },
      ],
    },
  },
  {
    slug: "energy-affordability",
    short: "Energy affordability",
    title: "Two ways to cut the country's highest energy bills",
    subtitle:
      "Both chambers promise billions in savings on some of the nation's highest energy bills, and target almost entirely different mechanisms to get there. The House also carries a nuclear provision, and the Senate a local supplier opt-out, that the other chamber left out.",
    senateBill: {
      n: "S.3166",
      u: "https://malegislature.gov/Bills/194/S3166",
    },
    houseBill: {
      n: "H.5175",
      u: "https://malegislature.gov/Bills/194/H5175.Html",
    },
    since: "July 2026",
    checked: "September 21, 2026",
    textRead: true,
    claim:
      "the House cutting the Mass Save efficiency program and opening the way for new nuclear, the Senate keeping Mass Save and phasing out a gas pipeline surcharge instead",
    who: "Barrett, who wrote the Senate approach, and Cusack, who championed the House bill",
    settled: [
      {
        p: "Lowering ratepayer bills is the shared goal",
        d: "Both respond to bills that have roughly doubled over a decade and project multibillion-dollar 10-year savings — the Senate $14 billion, the House $9 billion.",
        c: "s80",
      },
      {
        p: "Cracking down on predatory energy-supplier sales",
        d: "Both target aggressive competitive-supplier practices; the Senate adds a statutory definition of 'energy marketer' reaching door-to-door and telemarketing sales.",
        c: "s79",
      },
      {
        p: "Prevailing wage for clean-thermal (geothermal) network construction",
        d: "Both require prescribed wage rates for thermal-energy-network and associated pipeline work not done by utility employees.",
        c: "s79",
      },
      {
        p: "Expanded clean-energy procurement and siting",
        d: "Both build on the Governor's bill with centralized clean-energy solicitations, offshore-wind and solar procurement targets, and streamlined siting and interconnection.",
        c: "s79",
      },
      {
        p: "Effective on signature",
        d: "Both carry an emergency preamble.",
        c: "s80",
      },
    ],
    open: [
      {
        topic: "Mass Save or gas pipelines",
        q: "Cut Mass Save, or protect it and cut gas pipelines instead?",
        kind: "tool",
        s: "Protects Mass Save and finds its savings elsewhere, by phasing out the Gas System Enhancement Program (GSEP) by 2030, for an estimated $1.46 billion. The Senate also restructures the efficiency program: gas utilities are barred from administering it, funds are pooled, and 20% is reserved for low-income households.",
        sc: "s81",
        h: "Cuts Mass Save with a one-time funding reduction to the program, reported at roughly $1 billion.",
        hc: "s80",
        why: "The core disagreement, and the one with the most direct effect on next year's heat-pump and weatherization rebates. Both cut something; they cut opposite things.",
        ties: [],
      },
      {
        topic: "New nuclear",
        q: "Clear the way for new nuclear power?",
        kind: "include",
        s: "Leaves the 1982 approval requirement in place, but newly classifies nuclear fission as 'clean energy' and 'clean energy research' in its definitions.",
        sc: "s79",
        h: "Repeals chapter 503 of the acts of 1982, which requires statewide voter approval and legislative certification for any new nuclear plant or low-level radioactive-waste facility.",
        hc: "s80",
        why: "A structural energy-policy choice only the House put on the table. Reading the Senate text shows it is not simply anti-nuclear — it treats fission as clean energy — but it keeps the ballot safeguard the House removes.",
        ties: [],
      },
      {
        topic: "Municipal supplier opt-out",
        q: "Let cities and towns bar competitive electricity suppliers?",
        kind: "include",
        s: "Section 35 lets a municipality that accepts it prohibit energy suppliers, marketers and brokers from signing or renewing generation contracts with individual residential customers, enforced by the Attorney General under Chapter 93A.",
        sc: "s79",
        h: null,
        hnote:
          "Not established in the House enumeration; the House addresses predatory practices but not through a local supplier ban.",
        why: "A concrete Senate tool aimed at the competitive-supply market, which studies have found costs residential customers more than utility basic service.",
        ties: [],
      },
      {
        topic: "Utility cost refinancing",
        q: "Refinance utility costs to cut bills (securitization)?",
        kind: "tool",
        s: "Lets utilities securitize, or refinance at lower cost, grid-modernization, storm-recovery and gas-transition expenses, for an estimated $7.1 billion. That is about half the Senate's total savings, and its single biggest lever.",
        sc: "s79",
        h: null,
        hnote: "Not a headline feature of the House bill.",
        why: "The largest dollar item in either bill, and largely one-sided. Also Senate-only: comprehensive distribution planning and a public bill-component dashboard benchmarked against the other New England states.",
        ties: [],
      },
      {
        topic: "Supplier compliance payments",
        q: "Divert supplier compliance payments back to residents?",
        kind: "include",
        s: null,
        snote: "Not established as a distinct Senate provision.",
        h: "Diverts alternative-compliance payments from electricity suppliers back to residents.",
        hc: "s80",
        why: "A House-only rebate mechanism.",
        ties: [],
      },
      {
        topic: "Claimed savings",
        q: "How large are the claimed savings?",
        kind: "calibrate",
        s: "Claims more than $14 billion in savings over 10 years.",
        sc: "s79",
        h: "Claims roughly $9 billion in savings over 10 years.",
        hc: "s80",
        why: "The chambers score their own approaches very differently, shaping the case each makes in conference.",
        ties: [],
      },
    ],
    unverified: [
      {
        p: "High-voltage transmission on state highways; geothermal labor-peace agreements; gas-worker transition plans",
        d: "Named in the House enumeration; the Senate text's treatment of each was not separately confirmed.",
        c: "s80",
      },
      {
        p: "Conditioning data-center tax credits on clean energy",
        d: "Attributed to a Senate floor amendment in early reporting but not located in the engrossed text read here; treat as unconfirmed.",
        c: "s51",
      },
    ],
    context: [
      {
        h: "How it got to conference",
        p: "The House passed H.5175 128\u201327 in February 2026. The Senate struck the text, replaced it with S.3143 and passed it 32\u20138 on July 1; the House refused to concur on July 16 and both chambers named conferees the same day. Energy negotiations are historically among the hardest to settle.",
        c: "s53",
      },
    ],
    conferees: {
      senate: [
        {
          name: "Michael J. Barrett",
          district: "Third Middlesex",
          party: "D",
          chair: true,
          note: "Chairs Telecommunications, Utilities and Energy and wrote the Senate approach.",
          vote: {
            v: "unverified",
            t: "32\u20138, individual votes not verified",
          },
        },
        {
          name: "Cynthia Stone Creem",
          district: "Norfolk and Middlesex",
          party: "D",
          note: "Senate Majority Leader.",
          vote: {
            v: "unverified",
            t: "32\u20138, individual votes not verified",
          },
        },
        {
          name: "Bruce E. Tarr",
          district: "First Essex and Middlesex",
          party: "R",
          vote: {
            v: "unverified",
            t: "32\u20138, individual votes not verified",
          },
        },
      ],
      house: [
        {
          name: "Mark J. Cusack",
          district: "5th Norfolk",
          party: "D",
          chair: true,
          note: "House Telecommunications, Utilities and Energy chair; championed the House bill.",
          vote: {
            v: "unverified",
            t: "128\u201327, individual votes not verified",
          },
        },
        {
          name: "Aaron Michlewitz",
          district: "3rd Suffolk",
          party: "D",
          note: "House Ways and Means chair.",
          vote: {
            v: "unverified",
            t: "128\u201327, individual votes not verified",
          },
        },
        {
          name: "Bradley H. Jones, Jr.",
          district: "20th Middlesex",
          party: "R",
          note: "House Minority Leader.",
          vote: {
            v: "unverified",
            t: "128\u201327, individual votes not verified",
          },
        },
      ],
    },
  },
  {
    slug: "pets-act",
    short: "PETS Act",
    title: "Animal welfare both chambers want, minus the pet-shop ban",
    subtitle:
      "Both chambers passed animal-welfare bills near-unanimously and share most of the package. The Senate's signature provision \u2014 banning pet-shop sales of dogs, cats and rabbits \u2014 is the one the House dropped.",
    senateBill: { n: "S.3028", u: "https://malegislature.gov/Bills/194/S3028" },
    houseBill: { n: "H.5589", u: "https://malegislature.gov/Bills/194/H5589" },
    since: "July 2026",
    checked: "September 21, 2026",
    textRead: false,
    claim:
      "the House removing the Senate's ban on pet shops selling dogs, cats and rabbits",
    settled: [
      {
        p: "No breed, size or weight discrimination in pet insurance",
        d: "Both bar homeowners and renters insurers from refusing or non-renewing a policy based on a dog's breed, size or weight.",
        c: "s55",
      },
      {
        p: "Cruelty citations expanded to all household pets",
        d: "Both expand the civil citation for cruel conditions from dogs to all household pets.",
        c: "s55",
      },
      {
        p: "Pet-friendly state-aided public housing",
        d: "Both require a uniform pet-ownership program for state-aided public housing and bar size- or breed-based limits.",
        c: "s54",
      },
      {
        p: "Alternatives to animal testing for cosmetics and household goods",
        d: "Both end unnecessary animal testing for non-medical products while continuing to allow medical research.",
        c: "s55",
      },
    ],
    open: [
      {
        topic: "Pet shop sales ban",
        q: "Ban commercial pet-shop sales of dogs, cats and rabbits?",
        kind: "include",
        s: "Ends the puppy-mill-to-pet-shop pipeline by cutting off commercial sales of dogs, cats and rabbits in pet stores, while letting shops sell supplies and partner with shelters.",
        sc: "s54",
        h: "No ban: the House Ways and Means redraft dropped it, and a floor amendment to restore it was withdrawn. House leaders said they chose to focus on cruelty penalties and licensing instead.",
        hc: "s55",
        why: "The Senate's hallmark provision and the whole reason a conference is needed. Retailers opposed the ban; animal-welfare groups back it.",
        ties: [],
      },
      {
        topic: "Seizure and cruelty penalties",
        q: "Add a seizure protocol and stronger cruelty penalties?",
        kind: "include",
        s: null,
        snote: "Not established as a distinct Senate provision.",
        h: "Adds a new protocol to seize animals in neglect cases, and strengthens animal-cruelty penalties and licensing.",
        hc: "s55",
        why: "The House's own additions, which it substituted for the sales ban.",
        ties: [],
      },
    ],
    unverified: [],
    context: [
      {
        h: "A decade of consensus, minus one fight",
        p: "The PETS Act is an omnibus combining nearly a decade of animal-welfare bills. The Senate passed it 38\u20130 in March; the House passed its version 151\u20131 in July. Both share most provisions \u2014 the disagreement is narrow but high-profile.",
        c: "s54",
      },
    ],
    conferees: {
      senate: [
        {
          name: "Paul R. Feeney",
          district: "Bristol and Norfolk",
          party: "D",
          chair: true,
          vote: { v: "unan", t: "38–0", c: "s54" },
        },
        {
          name: "Jason M. Lewis",
          district: "Fifth Middlesex",
          party: "D",
          vote: { v: "unan", t: "38–0", c: "s54" },
        },
        {
          name: "Bruce E. Tarr",
          district: "First Essex and Middlesex",
          party: "R",
          vote: { v: "unan", t: "38–0", c: "s54" },
        },
      ],
      house: [
        {
          name: "James J. O'Day",
          district: "14th Worcester",
          party: "D",
          chair: true,
          vote: { v: "Y", t: "151–1", c: "s56" },
        },
        {
          name: "Jack Patrick Lewis",
          district: "7th Middlesex",
          party: "D",
          vote: { v: "Y", t: "151–1", c: "s56" },
        },
        {
          name: "Steven S. Howitt",
          district: "4th Bristol",
          party: "R",
          vote: { v: "Y", t: "151–1", c: "s56" },
        },
      ],
    },
  },
  {
    slug: "economic-development",
    short: "Economic development",
    title: "Economic development bill",
    subtitle: "Innovation, housing production, research, small business.",
    since: "2026",
    checked: "August 6, 2026",
    conferees: {
      senate: [
        {
          name: "Barry R. Finegold",
          district: "Second Essex and Middlesex",
          party: "D",
          chair: true,
        },
        {
          name: "Michael J. Rodrigues",
          district: "First Bristol and Plymouth",
          party: "D",
        },
        {
          name: "Peter J. Durant",
          district: "Worcester and Hampshire",
          party: "R",
        },
      ],
      house: [
        {
          name: "Aaron Michlewitz",
          district: "3rd Suffolk",
          party: "D",
          chair: true,
        },
        { name: "Carole A. Fiola", district: "6th Bristol", party: "D" },
        { name: "Michael J. Soter", district: "8th Worcester", party: "R" },
      ],
    },
  },
  {
    slug: "teacher-benefits",
    short: "Teacher benefits",
    title: "A second chance at RetirementPlus, and who gets it",
    subtitle:
      "Both chambers agree on the fix: give teachers who missed the 2001 RetirementPlus window a second chance to buy in. They differ on who qualifies, how long they get, and how the buy-back is calculated.",
    senateBill: { n: "S.3109", u: "https://malegislature.gov/Bills/194/S3109" },
    houseBill: { n: "H.4361", u: "https://malegislature.gov/Bills/194/H4361" },
    since: "July 2026",
    checked: "September 21, 2026",
    textRead: false,
    claim:
      "differing on who qualifies for a second chance at RetirementPlus and how the buy-back is calculated",
    settled: [
      {
        p: "A one-time second chance to opt into RetirementPlus",
        d: "Both give teachers who missed the original enrollment a new window to join the enhanced pension program that later hires receive automatically.",
        c: "s57",
      },
      {
        p: "Enrollees pay a make-up contribution plus interest",
        d: "Both require newly enrolling teachers to pay what they would have contributed, with assumed actuarial interest, and direct the retirement systems to notify eligible teachers.",
        c: "s57",
      },
    ],
    open: [
      {
        topic: "Eligibility",
        q: "Who is eligible for the second chance?",
        kind: "calibrate",
        s: "Reaches only teachers who missed the original 2001 six-month enrollment window.",
        sc: "s58",
        h: "Reaches anyone who missed opting in, whether in 2001 or at any time before September 1, 2025, a broader group.",
        hc: "s58",
        why: "The single biggest difference: how many teachers the fix reaches, and how much it costs the pension system.",
        ties: [],
      },
      {
        topic: "Opt-in window",
        q: "How long is the opt-in window?",
        kind: "calibrate",
        s: "The window runs through June 30, 2027.",
        sc: "s58",
        h: "The window runs 180 days from the law's effective date.",
        hc: "s58",
        why: "",
        ties: [],
      },
      {
        topic: "Buy-back formula",
        q: "How is the buy-back calculated?",
        kind: "calibrate",
        s: "Sets a precise formula for retroactive contributions and assumed interest.",
        sc: "s58",
        h: "Leaves the buy-back formula less specified.",
        hc: "s58",
        why: "The formula determines what each teacher pays and the cost to the Commonwealth; the Senate is more detailed, and the teachers' unions have raised cost concerns about the latest version.",
        ties: [],
      },
    ],
    unverified: [],
    context: [
      {
        h: "A long-stalled fix",
        p: "An administrative ruling held that teachers who missed the 2001 deadline could not join even without notice. The House favored a fix for years and it died in the Senate three times; the Senate joined this session after heavy constituent correspondence.",
        c: "s57",
      },
    ],
    conferees: {
      senate: [
        {
          name: "Michael J. Rodrigues",
          district: "First Bristol and Plymouth",
          party: "D",
          chair: true,
          note: "Senate Ways and Means chair.",
          vote: { v: "unan", t: "unanimous", c: "s57" },
        },
        {
          name: "Joan B. Lovely",
          district: "Second Essex",
          party: "D",
          vote: { v: "unan", t: "unanimous", c: "s57" },
        },
        {
          name: "Patrick M. O'Connor",
          district: "First Plymouth and Norfolk",
          party: "R",
          vote: { v: "unan", t: "unanimous", c: "s57" },
        },
      ],
      house: [
        {
          name: "Daniel J. Ryan",
          district: "2nd Suffolk",
          party: "D",
          chair: true,
          note: "House Public Service Committee chair.",
          vote: {
            v: "unverified",
            t: "passed by the House, individual votes not verified",
          },
        },
        {
          name: "Carlos Gonz\u00e1lez",
          district: "10th Hampden",
          party: "D",
          vote: {
            v: "unverified",
            t: "passed by the House, individual votes not verified",
          },
        },
        {
          name: "Kimberly N. Ferguson",
          district: "1st Worcester",
          party: "R",
          vote: {
            v: "unverified",
            t: "passed by the House, individual votes not verified",
          },
        },
      ],
    },
  },
  {
    slug: "primary-care",
    short: "Primary care",
    title: "Steering health-care dollars into primary care",
    subtitle:
      "Both chambers want more health-care spending in primary care without growing the overall pie. They agree on a spending target — the House adopted the Senate's idea — and differ on the timeline, the enforcement, and what each added around it.",
    senateBill: { n: "S.3141", u: "https://malegislature.gov/Bills/194/S3141" },
    houseBill: { n: "H.5630", u: "https://malegislature.gov/Bills/194/H5630" },
    since: "July 2026",
    checked: "September 21, 2026",
    textRead: false,
    claim:
      "agreeing on a primary-care spending target and not on how fast it takes effect or how it is enforced",
    who: "Friedman, who filed the Senate bill and sat on the Primary Care Task Force",
    settled: [
      {
        p: "A primary-care spending target, without pushing up premiums",
        d: "Both raise the share of spending that goes to primary care, and both direct the state to monitor that the increase does not add to overall cost growth or to premiums and cost-sharing. The House adopted this from the Senate.",
        c: "s60",
      },
      {
        p: "Fairer reimbursement for community health centers",
        d: "Both raise reimbursement for the community health centers that serve as frontline primary care in lower-income neighborhoods.",
        c: "s59",
      },
      {
        p: "Growing the primary-care workforce",
        d: "Both invest in recruiting and training primary-care providers; the House earmarks at least 80% of the Workforce Transformation Fund for it.",
        c: "s61",
      },
    ],
    open: [
      {
        topic: "The spending target",
        q: "How high, how fast, and how enforced is the target?",
        kind: "calibrate",
        s: "The target rises to 9% of total health care expenditures in 2028, 12% in 2029 and 15% in 2030, and applies both statewide and to each health care entity.",
        sc: "s59",
        h: "The same three steps six years later, 9% by 2030, 12% by 2033 and 15% by 2036, statewide only and with no required annual progress before each target year.",
        hc: "s60",
        why: "Both now have a target; the numbers, timeline and enforcement are where they meet, and where insurers are expected to press.",
        regional: {
          t: "Rhode Island has run this exact policy since 2010 — the first primary-care spending target in the nation — and now requires insurers to spend at least 10.7% on primary care, with the increase barred from being passed to premiums, the same constraint both MA bills use. It has held near 10.7%, which makes the Senate's climb to 15% by 2030 notably steeper, and Rhode Island did it by regulation rather than statute.",
          c: "s68",
        },
        ties: [],
      },
      {
        topic: "Deductibles",
        q: "Remove deductibles for seeing your own primary-care doctor?",
        kind: "include",
        s: "Advocates name the removal of deductibles for seeing your own PCP, plus reduced prior authorization, as core Senate provisions.",
        sc: "s63",
        h: null,
        hnote: "Not established from the published House materials.",
        why: "A direct cost-to-patient change that advocates expect to be contested in conference.",
        ties: [],
      },
      {
        topic: "Health center payment floor",
        q: "Set the community-health-center payment floor at the MassHealth rate?",
        kind: "calibrate",
        s: "Commercial insurers must reimburse community health centers at no less than what MassHealth pays; some now pay as little as 70% of that rate.",
        sc: "s59",
        h: "Raises reimbursement for health centers, by a different mechanism.",
        hc: "s61",
        why: "Both raise CHC pay; the Senate sets an explicit floor tied to MassHealth.",
        ties: [],
      },
      {
        topic: "AI rules",
        q: "Add new AI rules?",
        kind: "include",
        s: null,
        snote: "Not established from the published Senate materials.",
        h: "Adds rules governing artificial intelligence in health care.",
        hc: "s60",
        why: "A House addition with no confirmed Senate counterpart.",
        ties: [],
      },
      {
        topic: "Pharmacy deserts and rebates",
        q: "Tackle pharmacy deserts, drug rebates and mobile care?",
        kind: "include",
        s: null,
        snote: "Not established from the published Senate materials.",
        h: "Adds provisions on pharmacy deserts, passing drug rebates through to patients, and coverage for mobile integrated health-care programs.",
        hc: "s61",
        why: "A cluster of House additions around affordability and access.",
        ties: [],
      },
    ],
    unverified: [],
    context: [
      {
        h: "The numbers behind it",
        p: "About 43% of Massachusetts residents have difficulty accessing primary care, and 40% of emergency-room visits could have been handled in a primary-care setting. Primary care was only about 6.7% of commercial spending in recent years. The Senate passed its bill 35–4 on June 18; the House engrossed its redraft June 30 after Speaker Mariano moved from skeptic to adopting the spending target.",
        c: "s59",
      },
    ],
    conferees: {
      senate: [
        {
          name: "Cindy F. Friedman",
          district: "Fourth Middlesex",
          party: "D",
          chair: true,
          note: "Health Care Financing chair; filed the Senate bill and sat on the Primary Care Task Force.",
          vote: {
            v: "unverified",
            t: "35\u20134, individual votes not verified",
          },
        },
        {
          name: "John J. Cronin",
          district: "Worcester and Middlesex",
          party: "D",
          vote: {
            v: "unverified",
            t: "35\u20134, individual votes not verified",
          },
        },
        {
          name: "Bruce E. Tarr",
          district: "First Essex and Middlesex",
          party: "R",
          vote: {
            v: "unverified",
            t: "35\u20134, individual votes not verified",
          },
        },
      ],
      house: [
        {
          name: "Aaron Michlewitz",
          district: "3rd Suffolk",
          party: "D",
          chair: true,
          note: "House Ways and Means chair.",
          vote: {
            v: "unverified",
            t: "engrossed June 30, individual votes not verified",
          },
        },
        {
          name: "Meghan K. Kilcoyne",
          district: "12th Worcester",
          party: "D",
          vote: {
            v: "unverified",
            t: "engrossed June 30, individual votes not verified",
          },
        },
        {
          name: "Hannah Kane",
          district: "11th Worcester",
          party: "R",
          vote: {
            v: "unverified",
            t: "engrossed June 30, individual votes not verified",
          },
        },
      ],
    },
  },
];

/** By slug, since that is how a page arrives. */
export const BY_SLUG: Record<string, CommitteeDetail> = Object.fromEntries(
  COMMITTEES.map((c) => [c.slug, c]),
);

/** Whether this committee has a settled/open comparison compiled yet. */
export const hasComparison = (c: CommitteeDetail) =>
  Boolean(c.settled?.length || c.open?.length);
