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

/**
 * How to write a card. Learned the hard way, October 2026.
 *
 * COLLAPSED, A CARD SHOWS ONE SENTENCE. The page runs every position through
 * `lead()`, which cuts at the first period. So a position beginning "Yes." or
 * "No." renders as "Yes." and nothing else. Fold it into the sentence with a
 * comma: not "Yes. Landlords may charge a monthly pet fee" but "Yes, landlords
 * may charge a monthly pet fee". This was shipped three times before it stuck.
 *
 * WRITE FOR THE TOPIC, NOT THE QUESTION. The list a reader scans is topics. A
 * position written as an answer to the question is a non sequitur where it
 * actually appears, and one that restates the topic wastes the only sentence
 * the card shows. Write `s` and `h` to stand under `topic`; write `sAsked` and
 * `hAsked` as answers to `q`. Both, separately. Do not rewrite `q` to fit a
 * position you have already written.
 *
 * SAY WHAT THE LAW DOES. Not what the document looks like, not what a drafter
 * chose, not what a section is titled. "Bars a landlord from charging a monthly
 * fee for a pet", not "takes a different approach to pet fees".
 *
 * NOTHING SELF-REFERENTIAL. Never mention the comparison, the list, the bill's
 * structure, or this page. A reader wants the law, not the method.
 *
 * NAME THE PREDICATE. "Which records qualify" says nothing. Say which records.
 * Every noun phrase a reader cannot picture is a failure.
 *
 * NO FLUFF. If a line points at something the reader cannot see, cut it. "On
 * top of every exemption the public records law already carries" tells a reader
 * nothing they can act on.
 *
 * SILENCE IS SILENCE. Where a chamber's bill does not address something, the
 * position is `null`, which renders as a bare italic "Not in the bill". Do not
 * reason about what the silence implies. Do not write "does not rule it out".
 *
 * DOUBLE NEGATIVES READ AS ERRORS. "Bars nobody from charging one" is a
 * sentence a reader has to solve. Say who may do what.
 *
 * AMERICAN SPELLING. organization, not organisation. Seven data files had to be
 * swept for this once already.
 */
/**
 * One thing the two bills do not agree on.
 *
 * Write the two positions to stand under `topic`, not under `q`. The list a
 * reader scans is topics, and a collapsed card shows the topic with the two
 * positions under it; the question is behind the chevron. A position written
 * as an answer reads as a non sequitur in the place it actually appears, and
 * one that restates the topic wastes the only sentence the card shows.
 *
 * So: under "Teachers who take a state education job", the position is "Keeps
 * teacher status and stays in the teachers' retirement system", not "A teacher
 * who moves to DESE keeps teacher status" and never "No."
 */
export interface OpenQuestion {
  q: string;
  /** The subject in a few words, for a list you scan before you read. */
  topic?: string;
  kind: OpenKind;
  /**
   * The Senate's position, or null where the Senate bill is silent.
   *
   * Written to stand under `topic`, which is how the stacked reading prints
   * it: topic above, two positions under it, question behind the chevron.
   */
  s: string | null;
  /**
   * The same position, written as an answer to `q`.
   *
   * The card reading presses on the question instead of the topic, and a
   * position written for the topic reads as a non sequitur under a question
   * (and the other way round). Both readings are real, so both get their own
   * sentence rather than one being made to serve twice. Falls back to `s`
   * where it is not given, which is right for a position that happens to read
   * the same either way.
   */
  sAsked?: string;
  sc?: string;
  /** The House's position, or null where the House bill is silent. Written for `topic`. */
  h: string | null;
  /** The House position written for `q`. Falls back to `h`. See `sAsked`. */
  hAsked?: string;
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
  /** Whether both texts were read in full, rather than summarized from reporting. */
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

const FILED: CommitteeDetail[] = [
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
        why: "This is the negotiation. It is a full regulatory chapter traveling inside a school bill. The conferees can keep it, drop it, or split it. Sen. Comerford reports constituents raising concerns about the age-verification piece specifically.",
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
        h: "Adds emergencies, as determined by the district, and language access, meaning translation or interpretation, on the superintendent's written authorization.",
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
      "The two bills are close to word-for-word on prevention, reporting and paid leave. They part on how the state answers an assault, and on which workers are protected in the first place.",
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
        d: "Both require an assaulted-staff action program with group and individual crisis counseling, support groups, family intervention and peer help.",
        c: "s33",
      },
      {
        p: "Annual incident reports to the state, published in aggregate",
        d: "Employers report every incident to the Department of Public Health and the local district attorney; DPH publishes county and statewide aggregates within 90 days.",
        c: "s32",
      },
      {
        p: "Paid, job-protected leave after an assault",
        d: "Does not draw down sick, vacation or personal time; runs concurrently with PFML; confidential; job restored on return. What the leave may be used for is not settled, and is listed on the left.",
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
        topic: "Who the law protects",
        q: "Which hospital workers does this protect?",
        kind: "calibrate",
        s: "Anyone a hospital employs, whatever their job, plus contract staff, vendors and volunteers.",
        sAsked:
          "Anyone the hospital employs, whatever their job, plus contract staff, vendors and volunteers.",
        sc: "s33",
        h: "Only hospital staff who provide health care services, plus contract staff, vendors and volunteers.",
        hAsked:
          "Only those providing health care services, plus contract staff, vendors and volunteers.",
        hc: "s32",
        why: "The House definition adds the words 'who is providing health care services at'. The Senate's does not. A security guard, a housekeeper or a food service worker assaulted at work is covered by the Senate bill and may fall outside the House one.",
        ties: [],
      },
      {
        topic: "Reporting a safety problem",
        q: "Who can a worker tell about a safety problem without being punished?",
        kind: "calibrate",
        s: "Protected whether the worker reports to their own employer or to the state.",
        sAsked: "Their own employer or the state.",
        sc: "s33",
        h: "Protected only when the worker reports to the state.",
        hAsked: "The state only, not their own employer.",
        hc: "s32",
        why: "The two bills carry the same subsection, identical but for four words: the Senate adds 'the employee's health care employer or'. Under the House text a worker who raises a concern with their own manager is not protected by this section.",
        ties: [],
      },
      {
        topic: "What the leave covers",
        q: "What can a worker use the paid leave for?",
        kind: "calibrate",
        s: "Covers mental health treatment for the assault, and getting a harassment prevention order, on top of medical care, victim services, legal help, and court.",
        sAsked:
          "Medical care, mental health treatment for the assault, victim services, legal help, a protective or harassment prevention order, and court.",
        sc: "s33",
        h: "Covers medical treatment, victim services, legal help, a court protective order, and court appearances.",
        hAsked:
          "Medical treatment, victim services, legal help, a court protective order, and court appearances.",
        hc: "s32",
        why: "Only the Senate names an acute mental health or behavioral health need arising from the assault, and only the Senate lets the leave be used to get a harassment prevention order. A worker seeking counselling after being attacked is covered by one bill and not named in the other.",
        ties: [],
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
        h: "When it takes effect",
        p: "Neither bill sets a date for the act as a whole. The Senate delays one section by a year: the extension of the arrest power beyond hospitals to every other covered facility.",
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
        p: "A universal opt-out signal must be honored",
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
        q: "You asked the Legislature for a record and it said no. What can a court do?",
        kind: "tool",
        s: "A judge cannot order the Legislature to hand over a record. The court can only decide whether the Legislature made a serious legal mistake. You file in Suffolk Superior Court within 60 days of the final refusal, the judge reads only the paperwork the Legislature already produced, and there is no discovery. The judge may look at a withheld record privately, but it stays sealed.",
        sc: "s38",
        h: "The state\u2019s highest court decides fresh whether the Legislature was right to withhold a record, starting from the assumption that it is public. The Legislature has to prove it was right. There is no filing deadline, and the court is told to move quickly where it can.",
        hc: "s37",
        why: "This cuts against the easy story. The Senate's court is easier to reach but can do very little; the House's court is the highest in the state, but once there, it reviews everything fresh and the Legislature carries the burden. Neither is simply 'stronger'.",
        ties: [],
      },
      {
        topic: "Journalist shield",
        q: "Should journalists be protected from being forced to reveal sources?",
        kind: "include",
        s: "No court, grand jury or body with subpoena power may compel a journalist or news organization to identify a confidential source, except on a court finding by clear and convincing evidence that the information is material, critical, unavailable elsewhere, and of overriding public interest. Adopted 40\u20130 as a floor amendment from Sen. Rausch.",
        sc: "s38",
        h: null,
        why: "Massachusetts is one of nine states without a shield law. The provision was never offered in the House, so the House conferees have not voted on it. The Senate definition covers journalists working for a news organization; it does not reach independent writers.",
        regional: {
          t: "Rhode Island, Maine and Connecticut all have journalist shield statutes; Massachusetts and New Hampshire rely only on a case-by-case common-law privilege. The Senate's shield would bring Massachusetts in line with most of its neighbors.",
          c: "s71",
        },
        ties: [],
      },
      {
        topic: "Additional reasons to refuse",
        q: "Can they turn you down for a reason that is not written in this bill?",
        kind: "include",
        s: "Any exemption in the existing public records law, including personnel files and memos about a policy still being decided.",
        sAsked:
          "Yes, because the Senate adds a sentence letting the Legislature withhold or redact anything the existing public records exemptions cover. Personnel files and memos about a policy still being decided are on that list.",
        sc: "s37",
        h: "No additional reasons beyond the three the bill already gives.",
        hAsked:
          "No, the three reasons in the bill are the only ones. None of the exemptions in the existing public records law are carried over.",
        hc: "s38",
        why: "Both bills start from the same three grounds. The Senate then adds a sentence that reaches a much longer list, which decides how often a request can be turned down and on what basis.",
        ties: [],
      },
      {
        topic: "Written testimony",
        q: "If you write to a committee on your own, does your letter become public?",
        kind: "calibrate",
        s: "Only testimony a committee solicited can be requested as a public record.",
        sAsked:
          "Only if the committee asked for it. Testimony you send unprompted is not a legislative record under the Senate bill, and the Legislature can refuse it on that ground alone.",
        sc: "s37",
        h: "All written testimony sent to the Legislature can be requested as a public record.",
        hAsked:
          "Yes, whether or not anyone asked for it. The House list says \u2018written testimony\u2019 with no condition attached.",
        hc: "s38",
        why: "One word decides it. The Senate requires testimony to be solicited; the House does not. Joint committees are where most testimony arrives, so this reaches a large share of what the public actually sends the Legislature.",
        ties: [],
      },
      {
        topic: "The Auditor's power",
        q: "Should the State Auditor's power over the Legislature be written into statute?",
        kind: "include",
        s: null,
        h: "The Auditor may audit the Legislature's 'administrative functions' (budgets, official audits, expenditures and settlement agreements from FY2021 on) but not its 'constitutional functions' such as deliberation. Records requests get a 60-day response; interviews need the presiding officer's authorization; disputes go into a 'statement of dispute' in the audit report, and no court may compel production.",
        hc: "s37",
        why: "This responds to the 2024 ballot question authorizing a legislative audit, and to the litigation that followed. The House framework is the only place in either bill where a court is expressly told it has no jurisdiction.",
        ties: [],
      },
      {
        topic: "Governor's policy drafts",
        q: "Can the Governor withhold policy-in-development documents?",
        kind: "include",
        s: "Policy drafts such as \u2018communications, memoranda, drafts or other documents relating to developing policy positions\u2019 are exempt from disclosure.",
        sc: "s38",
        h: null,
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
        s: null,
        sc: "s38",
        h: "Five cents a page, the first four hours of staff time free, then up to $25 an hour. Answer late and they lose the right to charge anything at all. No fee for redacting unless a rule requires it, and waivers for requests that serve the public and for people who cannot pay.",
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
        p: "Partners in Democracy, the organization that runs MAPLE, joined a public statement criticising the House for passing H.5469 within a day of its release and without a hearing, and supports the ballot question. MAPLE takes no position on this bill; this page describes both chambers' texts on the same terms.",
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
        p: "In-kind gifts and new debts itemized monthly",
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
      "Both chambers back a surtax-funded bond to repair and decarbonize public higher education, and seven of their eight funding accounts carry identical figures. They disagree on how the borrowing is secured: the Senate creates a dedicated fund of its own with a trust behind it, the House pledges the fund the surtax already feeds.",
    senateBill: { n: "S.2993", u: "https://malegislature.gov/Bills/194/S2993" },
    houseBill: { n: "H.4769", u: "https://malegislature.gov/Bills/194/H4769" },
    since: "April 2026",
    checked: "October 6, 2026",
    textRead: true,
    claim:
      "the Senate securing the bonds on a new dedicated fund and the House on the one the surtax already feeds",
    settled: [
      {
        p: "Seven of the eight funding accounts carry identical figures",
        d: "$1,250,000,000 for state university and community college maintenance, $1,250,000,000 for UMass, $100,000,000 for housing and mixed-use conversion, $80,000,000 for decarbonization, $120,000,000 for labs and voc-tech partnerships, $30,000,000 for campus master plans, and $275,000,000 for the Huntington Tower at MassArt. Only the earmark account differs.",
        c: "s97",
      },
      {
        p: "Two thirds of the money is maintenance, split evenly",
        d: "$2,500,000,000 of the schedule goes to deferred maintenance, modernization and decarbonization, divided equally between UMass and the state universities and community colleges.",
        c: "s98",
      },
      {
        p: "A separate $170,000,000 for grants and technology, identical in both",
        d: "$50,000,000 for an administration and finance capital grant program, $20,000,000 for technology, and $100,000,000 for career technical education, carried by its own bond authorization of the same size in each bill.",
        c: "s97",
      },
      {
        p: "The bond terms are the same",
        d: "Special obligations rather than general obligations, named the Public Higher Education Capital Expenditure Act of 2025 on their face, a term up to 30 years, payable no later than June 30, 2070, and outside the statutory debt and debt service limits.",
        c: "s98",
      },
      {
        p: "The campus money comes out of discretionary surtax spending",
        d: "Both reduce the Education and Transportation Fund's annual spending threshold by the higher education set-aside, so this is not new revenue on top of what the surtax already funds.",
        c: "s97",
      },
      {
        p: "A new process for selling surplus campus property",
        d: "Both add chapter 7C section 34A: a trustee veto within 60 days, notice to municipal officials and local legislators, a public hearing above 2 acres, inspector general review of the appraisal, and filings to the ways and means committees 15 days before closing.",
        c: "s98",
      },
      {
        p: "An annual capital report, due every December 31",
        d: "Both require decarbonization and deferred-maintenance progress, a system-wide forecast of needs and funding gaps, committed against expended dollars, a per-project tracker, and outcome metrics down to square footage and metric tons of CO2e avoided. First one due March 1, 2027 in both.",
        c: "s97",
      },
      {
        p: "DCAMM can hand smaller projects to the State College Building Authority",
        d: "Control and supervision of structural or mechanical projects under $10,000,000 may be delegated, in word-for-word identical text, and the Authority's board gains two non-voting members drawn from the state university and community college presidents.",
        c: "s98",
      },
    ],
    open: [
      {
        topic: "What stands behind the bonds",
        q: "If the surtax comes in light one year, who gets paid first?",
        kind: "tool",
        s: "Creates a new Commonwealth Public Higher Education Capital Projects Fund, credits it with $125,000,000 of surtax a year, and impresses that money with a trust for the bondholders, with the bonds payable solely from it. The surtax reaches this fund before the transportation set-aside, and the fund pays debt service first, deferred maintenance second, and named projects third.",
        sAsked:
          "The bondholders, out of a fund that exists only for them. The Senate writes $125,000,000 a year into a new fund held in trust, reached before the transportation set-aside, and nothing else can be paid from it until debt service is covered.",
        sc: "s97",
        h: "Pledges the existing Education and Transportation Fund and caps annual debt service at $100,000,000, a figure defined in the statute without a fund of its own. It also folds the Education and Transportation Innovation and Capital Fund into the pledged fund so the pledge can reach it.",
        hAsked:
          "Whoever the existing Education and Transportation Fund pays, with campus debt service capped at $100,000,000 a year inside it. The House creates no separate fund and no trust, so higher education borrowing competes with everything else that fund carries.",
        hc: "s98",
        why: "The page has said these two agree on the mechanism. They do not. One builds a segregated fund with a trust and a priority order ahead of transportation; the other sets a borrowing ceiling against the fund the surtax already feeds. The annual set-aside also differs by $25,000,000.",
        ties: [],
      },
      {
        topic: "How much it borrows",
        q: "What is the headline number?",
        kind: "calibrate",
        s: "Authorizes $3,541,400,000, which matches its own funding schedule to the dollar.",
        sc: "s97",
        h: "Authorizes $3,105,000,000, which is $436,400,000 less than the Senate and, oddly, $370,450,000 less than the House's own schedule totals.",
        hc: "s98",
        why: "The gap between the two authorizations is $436,400,000. The House figure also does not reconcile with its own accounts, by exactly the size of its earmark account, which is a drafting problem the conference has to resolve whatever number it lands on.",
        ties: [],
      },
      {
        topic: "Size of the earmark account",
        q: "How much is committed up front to projects named in the bill?",
        kind: "calibrate",
        s: "$436,400,000 across 26 named projects, the largest of them $30,000,000, shared by three: Northern Essex career and technical education, the Sullivan building at Salem State, and the Whittemore library at Framingham State.",
        sc: "s97",
        h: "$370,450,000 across 29 named projects, $65,950,000 less than the Senate, with a quarter of it in one line: $100,000,000 for a human health hub at Westfield State.",
        hc: "s98",
        why: "Every other account in both bills is identical, so this one account carries the entire difference between them. The House concentrates; the Senate spreads.",
        ties: [],
      },
      {
        topic: "Campuses named in only one bill",
        q: "Which campuses have only one chamber behind them?",
        kind: "include",
        s: "Names six the House does not: North Shore, Cape Cod, Berkshire, and Holyoke community colleges, the Massachusetts College of Liberal Arts, and UMass Dartmouth. It also funds the schooner Ernestina-Morrissey and the UMass Amherst marine station at Gloucester.",
        sAsked:
          "Six on the Senate side alone, from North Shore and Cape Cod community colleges to UMass Dartmouth, plus a schooner and a marine station the House does not fund.",
        sc: "s97",
        h: "Names three the Senate does not: Westfield State at $100,000,000, UMass Lowell at $25,000,000, and Bay Path University, a private college, at $400,000 across two lines.",
        hAsked:
          "Three on the House side alone, including a $100,000,000 line for Westfield State and $400,000 for Bay Path University, which is private.",
        hc: "s98",
        why: "Eighteen institutions appear in both lists, six only in the Senate's and three only in the House's. Nine campuses are therefore one chamber's project rather than an agreed one, and the House list reaches a private college in a public higher education bond bill.",
        ties: [],
      },
      {
        topic: "Proceeds from selling campus property",
        q: "A campus sells a building. Who gets the money?",
        kind: "tool",
        s: "Proceeds go into the new capital projects fund and are then made available to the campus that sold the property, with no restriction on what it may spend them on.",
        sAsked:
          "The campus that sold it, through the new fund, with no strings on how it spends the money.",
        sc: "s97",
        h: "Proceeds go into a new Higher Education Property Disposition Fund the DCAMM commissioner administers, spendable without appropriation only on decarbonization, deferred maintenance and critical repairs including accessibility, anywhere in the system. No share is reserved for the selling campus.",
        hAsked:
          "A central fund any campus can draw on, restricted to repairs, accessibility and decarbonization. The campus that sold the building gets no claim on the proceeds.",
        hc: "s98",
        why: "Same proceeds, opposite incentives. The Senate gives a campus a reason to sell; the House gives the system a reason to.",
        ties: [],
      },
      {
        topic: "Who counts as a community college",
        q: "Should private colleges draw on community college programs?",
        kind: "include",
        s: null,
        h: "Folds private nonprofit colleges carrying a federal minority-serving designation, plus Quincy College, into the community college segment for Department of Higher Education programs, naming the SUCCESS equity program and the free community college program.",
        hAsked:
          "Yes, for two kinds: private nonprofits with a federal minority-serving designation, and Quincy College, which is a city department. Both would reach programs including free community college.",
        hc: "s98",
        why: "The only section in either bill that changes which institutions count as public community colleges rather than which buildings get money, and it reaches the free community college program rather than the capital program.",
        ties: [],
      },
      {
        topic: "A plan for the worst repair jobs",
        q: "Does anyone list the biggest repair jobs before the money moves?",
        kind: "include",
        s: null,
        snote:
          "Not in the Senate bill, which relies on the annual report both chambers create. That one forecasts system-wide needs with no dollar threshold and no project-level plan, and the first is not due until March 2027.",
        h: "Requires a report within 90 days naming every deferred-maintenance project above $50,000,000 at UMass, the state universities or the community colleges, with a five-year timeline, a per-project plan, a total cost, and a breakdown of design and consultant spending.",
        hAsked:
          "The House says yes, within 90 days: every project above $50,000,000, with a five-year repair timeline and a cost breakdown for each.",
        hc: "s98",
        why: "Both bills get the same annual report, so the question is only whether the worst of the backlog is itemized up front. Neither bill states what the statewide backlog actually is.",
        ties: [],
      },
      {
        topic: "Spreading the grant money",
        q: "Must the $150,000,000 in grants be spread across regions?",
        kind: "include",
        s: "Requires both grant programs to consider equitable distribution among the UMass, state university and community college segments, and equitable geographic distribution across the state.",
        sAsked:
          "Yes. Both programs must consider equitable distribution across the three segments and across the state geographically.",
        sc: "s97",
        h: null,
        hnote:
          "Not in the House bill, which funds both programs at the same amounts through the same agencies and attaches no distribution requirement.",
        why: "$150,000,000 of competitive grants with the same administering secretaries either way. The Senate language gives a shut-out campus or region something to point at; without it the awards are discretionary.",
        ties: [],
      },
    ],
    unverified: [],
    context: [
      {
        h: "The House bond section does not match the House schedule",
        p: "Both bills share an identical base of $3,105,000,000 across their seven non-earmark accounts. The Senate adds its $436,400,000 earmark account and authorizes the sum, $3,541,400,000. The House adds a $370,450,000 earmark account and authorizes $3,105,000,000, the base alone. The House earmarks were added by floor amendment on November 18, 2025, the day the bill passed 148 to 5, and the bond section was not conformed. It is a drafting gap in the engrossed bill rather than a stale copy, and the conference has to close it whatever number it lands on.",
        c: "s98",
      },
      {
        h: "Fair Share is not in either bill",
        p: "Neither text uses the phrase. Both draw on the 4 percent income surtax under Article XLIV, which is what the nickname refers to, but the bills speak only of income surtax revenue.",
        c: "s97",
      },
      {
        h: "Neither bill names the campuses",
        p: "Eligibility runs entirely through \u201cpublic institution of higher education\u201d as defined in chapter 15A. No campus count appears in either text, so a reader cannot tell from the bills which institutions the program covers.",
        c: "s98",
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
      "Both chambers passed animal-welfare bills near-unanimously and overlap on four subjects: public housing pet programs, research animals, the welfare fund, and animal testing. The Senate's signature provision, banning pet-shop sales of dogs and cats, is the one the House dropped, and the House added pet insurance rules, veterinary technician licensing and kennel oversight the Senate has not voted on.",
    senateBill: { n: "S.3028", u: "https://malegislature.gov/Bills/194/S3028" },
    houseBill: { n: "H.5589", u: "https://malegislature.gov/Bills/194/H5589" },
    since: "July 2026",
    checked: "October 6, 2026",
    textRead: true,
    claim:
      "the Senate banning pet-shop sales of dogs and cats, and the House adding pet insurance rules, veterinary licensing and kennel oversight the Senate has not voted on",
    settled: [
      {
        p: "Animal cruelty fines feed the Homeless Animal Prevention and Care Fund",
        d: "Fines assessed under chapter 129 section 37 are deposited into the fund, and the fund's revenue list picks them up. Identical language in both.",
        c: "s95",
      },
      {
        p: "Public housing cannot ban pets outright",
        d: "No blanket prohibition, no discrimination on a pet's breed, size, weight or appearance, no declawing as a condition, and no eviction for having a pet that follows the rules. Both chambers, same list.",
        c: "s96",
      },
      {
        p: "The public housing pet deposit is capped at $160 or one month's rent, whichever is less",
        d: "The same figure and the same formula in both, inside the same list of things a facility may reasonably require: number of pets by unit size, spay or neuter, a care plan with an emergency contact, and registration.",
        c: "s95",
      },
      {
        p: "Research facilities must try to place surviving dogs and cats",
        d: "After testing that does not require euthanasia, the facility assesses the animal and must make a reasonable effort to offer it to a rescue before euthanizing. Each facility holds an agreement with at least one rescue and must vet that rescue first. Word for word in both.",
        c: "s96",
      },
      {
        p: "The same four exemptions from the adoption duty",
        d: "A behavioral or medical defect posing a public risk, disease or injury or congenital condition, placement with an employee as a permanent home, or an animal under 8 weeks still needing maternal care. The attending veterinarian decides.",
        c: "s95",
      },
      {
        p: "The same liability shield for placing facilities",
        d: "No duty of care owed to the rescue or the adopter, and no liability for injury, property damage or loss resulting from the placement.",
        c: "s96",
      },
      {
        p: "Animal testing is barred where a valid alternative exists, and medical research is exempt",
        d: "Both create chapter 140 section 174I with the same eight definitions, direct the public health commissioner to set alternative-method standards weighing the OECD guidelines, and exempt medical research.",
        c: "s95",
      },
      {
        p: "Rescue organizations and research facilities are redefined the same way",
        d: "\u201cAnimal rescue organization\u201d is rewritten and \u201canimal shelter\u201d struck; \u201cproduct testing facility\u201d and \u201cresearch institution\u201d replace the old \u201cresearch facility.\u201d Identical in both.",
        c: "s96",
      },
    ],
    open: [
      {
        topic: "Pet shop sales ban",
        q: "Where would somebody get a puppy instead?",
        kind: "include",
        s: "Licensed pet shops lose the right to sell or offer for sale a dog or cat, facing civil penalties of up to $1,000, $2,500 and $5,000 for a first, second, and third or later offense, plus suspension or revocation of the license. A shop may still give floor space to a shelter showing animals for adoption as long as it holds no ownership interest, and every advertisement counts as a separate violation.",
        sAsked:
          "No, selling or offering one becomes a violation carrying up to $1,000, $2,500 and $5,000 for a first, second, and third or later offense, and the shop can lose its license. It may still host a shelter\u2019s adoption animals if it has no ownership interest in them.",
        sc: "s95",
        h: null,
        why: "The provision the conference is actually about. The Senate closes the retail channel for dogs and cats; the House does not touch it. Neither bill reaches breeders or direct and online sales, so the channel closing is narrower than it sounds.",
        ties: [],
      },
      {
        topic: "Seizure and cruelty penalties",
        q: "What happens to an animal whose keeper is not caring for it?",
        kind: "tool",
        s: "An animal control officer cites the keeper directly, with fines of up to $50, then $200, then $500, and on a third offense the animal can be impounded at the owner\u2019s expense or taken away for good. The offense is keeping a pet in cruel conditions, defined to cover excessive waste, non-potable water, inadequate food, no protection from weather, and for dogs, inhumane chaining at any time.",
        sAsked:
          "An animal control officer writes a citation, starting at a warning or $50 and rising to $200 and $500. On a third offense the animal can be impounded at the owner\u2019s expense or taken away entirely, and no court is involved at any point.",
        sc: "s95",
        h: "An officer petitions a district court, which must hear it within 10 days and can then order the keeper to provide care, hand the animal to the enforcing authority, or have it euthanized, and can bar that person from keeping any animal at all. The standard is animal neglect, defined as failing to provide adequate food, water, shelter or veterinary care, or keeping the animal in an unsanitary environment.",
        hAsked:
          "An officer takes it to a district court, which must hear it within 10 days. A judge finding neglect can order care, take the animal, order it euthanized, remove the person\u2019s other animals and bar them from keeping animals in future. There is no fine.",
        hc: "s96",
        why: "Both chambers answer the same situation and neither copied the other. The Senate built a ladder an animal control officer can climb the same day, with money at the bottom and the animal at the top. The House built a court process with no fine at all, where the only outcomes are the animal\u2019s. Speed against due process, and the House version says nothing about who pays for the animal\u2019s care while the case runs.",
        ties: [],
      },
      {
        topic: "Pet fees in private rentals",
        q: "Does the state look at what private landlords charge for a pet?",
        kind: "include",
        s: "The housing office must study pet fees across state-aided and privately owned rental housing: how common they are, how large, their effect on housing stability for pet-owning households, their relationship to pets being given up at shelters, and what fee limits in other states have done. Due December 31, 2027.",
        sAsked:
          "It studies them: the housing office must report by December 31, 2027 on how common and how large pet fees are in private rentals, and on whether they drive people to give their pets up.",
        sc: "s95",
        h: null,
        why: "Both chambers cap a public housing pet deposit at $160 and neither reaches a private landlord, which is where most renters live. The Senate at least orders somebody to find out what private pet fees are doing to pet owners; the House stops at the cap.",
        ties: [],
      },
      {
        topic: "Who in public housing may keep a pet",
        q: "Which public housing residents get the right to keep a pet?",
        kind: "include",
        s: "Every resident of state-aided public housing who can reasonably care for a pet, with the elderly named as one group among all such residents rather than as the limit. A facility may still refuse a dog a municipality has declared a nuisance or dangerous, or one with a known history of biting.",
        sAsked:
          "Any resident who can reasonably care for one. Age is not a condition.",
        sc: "s95",
        h: "Residents 60 and older, with the program scoped to public housing as defined in chapter 121B. A facility may refuse only a dog a municipality has formally declared dangerous, with no nuisance declaration and no bite history as grounds.",
        hAsked:
          "Only residents 60 and older, with everyone younger left outside the program entirely.",
        hc: "s96",
        why: "The same program, reaching either everybody in state-aided public housing or only its older residents, which decides how many households the bill actually touches. The two also differ on which dogs a facility can turn away: the Senate gives three grounds including an undeclared bite history, the House only a dog the town has already declared dangerous.",
        ties: [],
      },
      {
        topic: "Service animals in ride-hailing",
        q: "What happens when a driver refuses a rider with a service animal?",
        kind: "include",
        s: null,
        h: "Rideshare companies must build an in-app feature telling the driver that a rider will have a service animal, and the driver and the company each face fines of $500, $750 and $1,000 for a first, second and third refusal, imposed by the Department of Public Utilities.",
        hAsked:
          "The driver and the company are each fined, $500 for a first refusal, $750 for a second and $1,000 after that. The app also has to warn the driver in advance so the refusal is less likely to happen at the curb.",
        hc: "s96",
        why: "The only service animal provision in either bill. Everything else in both is about pets, which are not the same thing in law, and the Senate bill contains no service animal language at all.",
        ties: [],
      },
      {
        topic: "Licensing the veterinary workforce",
        q: "Who besides a veterinarian is licensed to do veterinary work?",
        kind: "include",
        s: null,
        h: "Veterinary technicians become state-licensed, and only licensees may use the title. The registration board is restructured to four veterinarians, three licensed technicians and two public members, and must define which duties a veterinarian may assign to a licensed technician rather than an unlicensed assistant. A no-degree pathway by national exam plus on-the-job hours runs until 2031, when everyone in scope must be licensed.",
        hAsked:
          "Veterinary technicians, under a new license only holders may claim. The board that writes the rules gains three technician seats, and a route in by exam and work hours stays open until 2031 for people already doing the job.",
        hc: "s96",
        why: "A workforce licensing regime inside an animal welfare bill, twelve of the House bill's sections. It decides who can legally do the work in a field short of staff, and the Senate has not voted on it.",
        ties: [],
      },
      {
        topic: "Kennel oversight",
        q: "What does the public get to know about the kennel boarding their dog?",
        kind: "include",
        s: null,
        h: "Municipal kennel lists must carry license status, owner name, maximum dogs permitted, the last inspection date, the last passing inspection date, and for commercial boarding kennels the number of injuries that drew enforcement in the last year, with fines for a licensing authority that does not comply. Kennels may not accept unlicensed dogs, must keep sale records for 36 months, and an inspector is directed to pull the license of a kennel not kept sanitary and humane.",
        hAsked:
          "Whether it is licensed, how many dogs it may hold, when it was last inspected, when it last passed, and how many injuries drew enforcement there in the past year. A town that does not publish it can be fined.",
        hc: "s96",
        why: "Fourteen House sections on an industry the Senate bill does not mention. The injury disclosure is the part with teeth: it makes a kennel's record public before somebody leaves a dog there.",
        ties: [],
      },
      {
        topic: "Pet insurance consumer protections",
        q: "What must a pet insurer tell a buyer before they sign?",
        kind: "include",
        s: null,
        h: "Pet insurers must disclose every exclusion for preexisting, hereditary, congenital and chronic conditions, publish a standalone disclosure in at least 12-point type, give buyers 30 days to return a policy for a full refund, and carry the burden of proving a preexisting-condition exclusion applies. Waiting periods are capped at 30 days for illness, banned outright for accidents, and waivable by a vet exam; wellness programs may not be sold as insurance.",
        hAsked:
          "Every exclusion for a preexisting, hereditary, congenital or chronic condition, in a standalone disclosure set in at least 12-point type. The buyer gets 30 days to return the policy for a full refund, and if the insurer later denies a claim as preexisting, it has to prove it.",
        hc: "s96",
        why: "A consumer protection chapter written into an animal welfare bill, and the Senate has not voted on any of it. Cost of care is the reason people give up pets, which makes this closer to the bill's purpose than its placement suggests.",
        ties: [],
      },
      {
        topic: "Dog breed in home insurance",
        q: "Can an insurer price or refuse a home policy over the dog's breed?",
        kind: "include",
        s: "Homeowners and renters insurers, and the joint underwriting association, may not consider a dog's breed or mixture of breeds when writing, renewing, cancelling or pricing a policy, and may not ask about breed at all. They may still ask about a municipal dangerous-dog declaration or a known bite history.",
        sAsked:
          "No, breed cannot be used to write, renew, cancel or price a homeowners or renters policy, and the insurer cannot even ask. A dangerous-dog declaration or a known bite history is still fair to consider.",
        sc: "s95",
        h: null,
        why: "Breed-based underwriting is how a housing protection gets undone: both bills bar a housing authority from discriminating on breed, and without this an insurer still can. The House barred it in housing and left it standing in insurance.",
        ties: [],
      },
      {
        topic: "Reach of the animal testing ban",
        q: "Which products can no longer be tested on animals?",
        kind: "include",
        s: "Covers cosmetics and household products, their formulations, chemicals and ingredients, and bites whenever a valid alternative test method exists with no agency standing in the way. Regulations are due within 180 days of passage.",
        sAsked:
          "Cosmetics and household products, including their formulations and ingredients. The ban applies the moment a valid alternative exists, without waiting for anyone to certify it.",
        sc: "s95",
        h: "Covers every product, formulation, chemical and ingredient with no category limit, but only where the public health commissioner has determined a valid alternative exists. The section takes effect 180 days after the act, with regulations due by a fixed date.",
        hAsked:
          "Every product, with no category limit at all. The catch is that the ban only bites once the public health commissioner has determined an alternative is valid, so its reach depends on an agency acting.",
        hc: "s96",
        why: "The House ban is wider on paper and narrower in practice: it covers everything but waits on a commissioner's determination, while the Senate covers two categories and applies on its own. A conference can take the House's scope with the Senate's trigger, or the reverse, and those are very different laws.",
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
      {
        h: "The ban never lost a vote",
        p: "In July the House Ways and Means committee recommended the Senate bill ought to pass with an amendment striking out all after the enacting clause and inserting the text of H.5581. That is how the pet shop ban left the bill: the House did not vote it down, it replaced the whole text and the ban went with it.",
        c: "s54",
      },
      {
        h: "Most of these conferences start with a substitution",
        p: "It is the usual move, not a slight. House Ways and Means did the same to the Mass Ready Act and the primary care bill, and Senate Ways and Means did it to the House teacher benefits bill. In four of the five, one chamber struck the other\u2019s text entirely and inserted its own, which is why the two versions diverge so widely rather than line by line.",
        c: "s54",
      },
      {
        h: "Neither bill appropriates a dollar",
        p: "Both create a statewide public housing pet program, and the House also builds a licensing system for veterinary technicians and an advisory group, with no funding line anywhere. The only dollar figures in either bill are penalties and the $160 deposit cap.",
        c: "s95",
      },
      {
        h: "The retail ban is narrower than it sounds",
        p: "It reaches dogs and cats sold through licensed pet shops. Neither bill mentions rabbits, birds or any other species, and neither touches breeders or direct and online sales, which is how most animals in Massachusetts already change hands.",
        c: "s95",
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
    senateBill: {
      n: "S.3228",
      u: "https://malegislature.gov/Bills/194/S3228.pdf",
    },
    houseBill: {
      n: "H.5576",
      u: "https://malegislature.gov/Bills/194/H5576.pdf",
    },
    since: "2026",
    checked: "October 5, 2026",
    claim:
      "the Senate adding a frontier AI regulation chapter and moving 18 year olds into the juvenile system, neither of which the House has voted on",
    settled: [
      {
        p: "Life sciences tax incentives rewritten",
        d: "Both bills give the Massachusetts Life Sciences Center sole discretion over certification, bar judicial review of its decisions, require a written agreement before credits can be claimed, and raise the annual cap to $40,000,000.",
        c: "s91",
      },
      {
        p: "The Renewable Energy Trust Fund becomes the Climatetech Investment Fund",
        d: "Both repeal the old trust fund, redirect the half-mill per kilowatt-hour utility charge into the new one, and move the unexpended balances across. Roughly twenty sections in each bill doing the same work.",
        c: "s91",
      },
      {
        p: "Commercial-to-residential conversion allowed as of right",
        d: "Both let a municipality adopt as-of-right zoning for converting commercial buildings to housing, with parking exemptions near transit and a cap on how much affordability can be required. Chapter 40A section 3C in both.",
        c: "s92",
      },
      {
        p: "Site plan review written into the zoning act",
        d: "Both add chapter 40A section 7A: performance standards must be definite and objective, aesthetics cannot be regulated, and failure to act within 90 days is an approval.",
        c: "s91",
      },
      {
        p: "Micromobility gets a full regime",
        d: "Both define class 3 electric bicycles, sort powered devices into four speed tiers, set battery and electrical safety standards, and set helmet and age rules. Both also convene the same working group to report by the end of 2027.",
        c: "s92",
      },
      {
        p: "A gridtech deployment advisory board",
        d: "Both create the board inside chapter 23J, require electric companies to file expedited waiver processes with the DPU, and give both the same 270-day deadline.",
        c: "s91",
      },
      {
        p: "Economic development rates for large new businesses",
        d: "Both require every distribution company to offer discounted utility rates and negotiated special contracts, provided no cost shifts to other ratepayers.",
        c: "s92",
      },
      {
        p: "MassDevelopment and MTDC investment caps doubled",
        d: "Both raise the single-investment limits in chapter 40G from $1,000,000 and $2,000,000 to $2,000,000 and $4,000,000, and restructure the Massachusetts Technology Park Corporation board the same way.",
        c: "s91",
      },
      {
        p: "LLC annual report fees put on a rising schedule",
        d: "Both replace the flat fee with $200 rising to $500 by the fourth annual report, with a $500 flat rate for real-estate holding companies over $1,000,000 in assets and a lower schedule for micro businesses.",
        c: "s92",
      },
      {
        p: "Tax increment exemptions for adaptive reuse",
        d: "Both add sections 5P and 5Q to chapter 59, letting a municipality exempt the residential portion of a conversion for 5 to 20 years.",
        c: "s91",
      },
      {
        p: "MOBD references replaced throughout chapter 121C",
        d: "Eight sections in each bill, swapping the Massachusetts Office of Business Development for the secretary. Identical in both.",
        c: "s92",
      },
      {
        p: "Annual food truck health inspections",
        d: "Both add chapter 111 section 250 and give the commissioner of public health a year to write the regulations.",
        c: "s91",
      },
    ],
    open: [
      {
        topic: "Frontier AI regulation",
        q: "Does Massachusetts write its own AI safety law?",
        kind: "include",
        s: "Regulates any AI model trained with more than a set amount of computing power. Developers must test for catastrophic risk and submit to outside evaluation. Companies above $500 million in revenue add an annual audit. The Attorney General enforces it.",
        sc: "s91",
        h: null,
        why: "The largest difference between the two bills, and not one you settle by splitting a number. Both bills also insert a new chapter 93M, the Senate for this and the House for film exhibition. They cannot both be 93M.",
        notes: {
          "a set amount of computing power": [
            "The bill sets the line at 10^26 floating-point operations, meaning the raw arithmetic used to train the model.",
            "It is a measure of scale, not of capability: nothing in it asks what the model can do.",
            "The count includes the original training run plus any later fine-tuning and reinforcement learning.",
            "Only the largest models trained today reach it, so the chapter applies to a handful of developers rather than to anyone building software.",
          ],
          "large frontier developer": [
            "A frontier developer whose group revenue exceeds $500,000,000 a year.",
            "The audit and the published-framework duties attach at this tier.",
            "A smaller developer over the compute threshold carries the lighter set.",
          ],
        },
        ties: [],
      },
      {
        topic: "Juvenile jurisdiction",
        q: "What happens to an 18 year old who gets arrested?",
        kind: "include",
        s: "Raises the age of criminal majority from 18 to 19, so an 18 year old goes to juvenile court rather than adult court. About eighty sections carry that through the criminal code, and parts of it wait on the courts certifying they are ready.",
        sc: "s91",
        h: null,
        why: "A criminal justice overhaul large enough to be its own bill, riding in an economic development package. It has its own effective dates and its own readiness condition, so dropping it is cleaner than amending it.",
        ties: [],
      },
      {
        topic: "Public meetings and records",
        q: "Who gets to watch the government work?",
        kind: "include",
        s: "Makes remote participation in public meetings permanent: hybrid meetings, a roll call vote whenever anyone attends remotely, documents posted before the meeting, and access the public cannot be charged for. It also rewrites how open meeting law complaints are filed and answered, on a 20-day and 14-day clock. Separately, it creates a speed camera program and exempts the photographs, video and identifying information those cameras collect from the public records law.",
        sc: "s91",
        h: null,
        why: "Three transparency changes pulling in two directions. Meetings get easier to watch and complaints get a defined process, while a new camera system\u2019s footage is closed off. None of it is in the House bill, so all of it is open.",
        ties: [],
      },
      {
        topic: "Automatic retirement savings",
        q: "Who is responsible for a worker\u2019s retirement savings?",
        kind: "include",
        s: null,
        h: "Employers of 25 or more with no retirement plan must enroll every worker automatically at 6 percent of pay, rising to 10. Workers have to opt out. Penalties start at $250 per employee.",
        hc: "s92",
        why: "A mandate on employers, not a spending item, which is why it sits oddly in a bond bill. It is an opt-out, so the default does the work.",
        ties: [],
      },
      {
        topic: "Digital driver's licenses",
        q: "Can your license live on your phone, and who gets to look?",
        kind: "include",
        s: null,
        h: "The registrar must issue a digital license to anyone eligible for a physical one. Showing it is not consent to search the phone, and police must hand it back once identity is confirmed.",
        hc: "s92",
        why: "The privacy question in this conference. The limits are in the statute rather than left to the registrar, so dropping the section drops the protections with it.",
        ties: [],
      },
      {
        topic: "Tenant right to purchase",
        q: "What happens to renters when their building changes hands?",
        kind: "include",
        s: null,
        h: "A local option. Where a town adopts it, tenants get first refusal when their building sells: 15 days to make an offer, 160 days to close, with separate tracks for foreclosure and short sale.",
        hc: "s92",
        why: "Among the most contested housing measures in the state, and it is here rather than in a housing bill. The local option is what makes it passable and what makes it easy to trade away.",
        ties: [],
      },
      {
        topic: "Gambling",
        q: "Is a terminal replaying an old horse race a slot machine?",
        kind: "include",
        s: null,
        h: "Racing licensees may run betting terminals on past races, with no cap on how many. A 2.5 percent excise funds the Health Safety Net, with $75 million paid up front.",
        hc: "s92",
        why: "Gambling expansion outside the casino law, written so the terminals count as horse betting. The money arrives before anyone can judge the policy.",
        ties: [],
      },
      {
        topic: "Labor provisions",
        q: "Whose labor agenda ends up in the final bill?",
        kind: "include",
        s: "Rewrites the labor relations act across about twenty sections: bargaining units, elections, representation. Nothing about wages.",
        sc: "s91",
        h: "Extends prevailing wage to work done offsite in a shop, and takes minor league players out of the state wage laws. Nothing about bargaining.",
        hc: "s92",
        why: "Both chambers wrote labor provisions and the two sets do not touch: the Senate on how workers organize, the House on what they are paid. Nothing to split, so each survives or dies on its own.",
        ties: [],
      },
      {
        topic: "Travel insurance",
        q: "Who regulates the insurance sold alongside a plane ticket?",
        kind: "include",
        s: null,
        h: "Creates a chapter governing travel insurance: how it is rated, what a retailer may say without a license, what must be disclosed, a refund window, and no pre-checked boxes.",
        hc: "s92",
        why: "Consumer protection written as industry framework. Uncontested only because one chamber wrote it.",
        ties: [],
      },
      {
        topic: "Video game tax credit",
        q: "Which industries does the state pay to grow?",
        kind: "include",
        s: null,
        snote:
          "Not in the Senate bill, which reworks the caps on the life sciences and climatetech credits it already has rather than adding a sector.",
        h: "25 percent of Massachusetts payroll and development costs, 25 percent more in a gateway municipality. Sellable to another taxpayer. A $50,000 floor and a five-year limit.",
        hc: "s92",
        why: "Modeled on the film credit, transferability included. The Senate tightened the credits it already has instead of adding a sector.",
        ties: [],
      },
      {
        topic: "Housing on church land",
        q: "Can a church build apartments without asking the town?",
        kind: "include",
        s: null,
        snote:
          "Not in the Senate bill, which has the commercial conversion zoning both bills share but not this.",
        h: "Multifamily housing as of right on land owned by religious organizations, with no special permit. Up to 30 units an acre at 20 percent affordable, 50 if deeper. No parking required near transit.",
        hc: "s92",
        why: "The House paired this with the conversion zoning both bills share. The conference can keep the shared one and drop this without losing the housing story.",
        ties: [],
      },
      {
        topic: "How much it borrows",
        q: "Where does the $100 million difference land?",
        kind: "calibrate",
        s: "Borrows $325,100,000.",
        sc: "s91",
        h: "Borrows $425,100,000.",
        hc: "s92",
        why: "A $100 million gap on the headline number, though both bills name the bonds the same thing. The programs underneath differ item by item too.",
        ties: [],
      },
      {
        topic: "How much it costs",
        q: "Who gets help when federal research money disappears?",
        kind: "calibrate",
        s: "$100 million for public institutions of higher education, appropriated from the Education and Transportation Fund for the year ending June 30, 2026. Private institutions get nothing.",
        sc: "s91",
        h: "$200 million for higher education, drawn from the Commonwealth Federal Matching, Fiscal Resilience and Debt Reduction Fund. $175 million goes to public institutions and $25 million to private ones.",
        hc: "s92",
        why: "Both chambers are backfilling federal research cuts, outside the borrowing and on top of it. They differ on the amount, on which fund pays, and on whether private colleges get anything at all. Counting both the bonds and this, the House commits $200 million more than the Senate.",
        ties: [],
      },
    ],
    context: [
      {
        h: "How complete this comparison is",
        p: "Both texts were read, but not line by line. The section inventory of each bill is complete, and the items above were confirmed by reading the sections they describe. What is not here is the authorization-by-authorization comparison: the capital programs name hundreds of local projects and differ in most of them, usually over an amount. Those differences are real and are not listed.",
        c: "s91",
      },
      {
        h: "Why this bill is so much larger than the others",
        p: "H.5576 runs 264 sections, S.3228 runs 359, and together they come to about a million characters. Eleven of the twelve conferences compare two bills of a few dozen pages. This one compares the two longest bills in any of the twelve, either of which outruns the next longest conference bill by half again, and the two chambers did not write the same bill.",
        c: "s92",
      },
      {
        h: "Most of the policy is not about economic development",
        p: "Both chambers used the bill as a vehicle. Riding in it, in one chamber or the other: a retirement mandate, a gambling expansion, frontier AI regulation, a juvenile justice overhaul, criminal record sealing, kratom labeling, a medical psychedelics pilot, alcohol licensing, ticket resale, two new banking chapters, and film exhibition antitrust. A reader expecting capital grants will not guess at that from the title.",
        c: "s91",
      },
    ],
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
      "Both chambers agree on the fix: give teachers who missed the 2001 RetirementPlus window a second chance to buy in. They differ on who qualifies, how long they get, and what the buy-back costs, and the House added three sections on teachers who leave the classroom for a state education job that the Senate has not voted on.",
    senateBill: { n: "S.3109", u: "https://malegislature.gov/Bills/194/S3109" },
    houseBill: { n: "H.4361", u: "https://malegislature.gov/Bills/194/H4361" },
    since: "July 2026",
    checked: "October 6, 2026",
    textRead: true,
    claim:
      "differing on who qualifies for a second chance at RetirementPlus and what the buy-back costs",
    settled: [
      {
        p: "A one-time second chance to opt into RetirementPlus",
        d: "Both give teachers who missed the original enrollment a new window to join the enhanced pension program that later hires receive automatically. Both cover the teachers' retirement system and the Boston retirement system.",
        c: "s93",
      },
      {
        p: "Enrollees contribute at 11 percent",
        d: "Identical in both: anyone taking the second chance contributes at 11 percent under section 22 of chapter 32 going forward.",
        c: "s94",
      },
      {
        p: "The retirement systems must go find the people this applies to",
        d: "Both require the teachers' and Boston retirement systems to notify eligible active and inactive members and to inform school districts. The House adds a 90-day deadline for doing it; the Senate sets none.",
        c: "s93",
      },
    ],
    open: [
      {
        topic: "Who qualifies",
        q: "Does a teacher who turned this down in 2010 get another look?",
        kind: "calibrate",
        s: "Reaches teachers who did not elect, or declined, before July 1, 2001, and leaves who counts as a teacher to the definition already in chapter 32.",
        sAsked:
          "No, the Senate reopens only the 2001 decision, so a teacher who declined later is still out.",
        sc: "s93",
        h: "Reaches teachers who did not elect, or declined, at any point up to September 1, 2025, and names school nurses in the bill rather than leaving them to the chapter 32 definition.",
        hAsked:
          "Yes, the House reopens any decision made up to September 1, 2025, and names school nurses as covered.",
        hc: "s94",
        why: "The widest practical difference between the two bills. The Senate reopens the 2001 decision; the House reopens every decision made since. How many people that is, and what it costs the pension system, is the argument.",
        ties: [],
      },
      {
        topic: "What the buy-back costs",
        q: "How far back does a teacher have to pay?",
        kind: "calibrate",
        s: "Runs back to July 1, 2001, charged as the gap between 11 percent and what was actually withheld, plus actuarial interest compounding annually. Payable in one sum or in installments.",
        sAsked:
          "Back to July 1, 2001, paying the gap between 11 percent and what was withheld, plus interest compounding annually.",
        sc: "s93",
        h: "Runs back to the date the member joined the retirement system, which for a long-serving teacher is further back than 2001. Charged at 11 percent, with no interest named, and a member may be required to pay rather than must.",
        hAsked:
          "Back to the day they joined the system, which for a long-serving teacher is further than 2001. No interest is named, and the bill says a member may be required to pay rather than must.",
        hc: "s94",
        why: "Two separate questions inside one provision: how many years a teacher pays for, and whether interest is charged on top. The Senate is the more precisely drafted and the House the more open-ended, which is not the same as the cheaper.",
        ties: [],
      },
      {
        topic: "Opt-in window",
        q: "How long does a teacher have to decide?",
        kind: "calibrate",
        s: "Runs from the effective date through June 30, 2027, a fixed end date.",
        sAsked:
          "Until June 30, 2027, however long that turns out to be from the day the bill passes.",
        sc: "s93",
        h: "Runs 180 days from the effective date, so the deadline moves with the signing.",
        hAsked: "180 days, counted from whenever the bill is signed.",
        hc: "s94",
        why: "A fixed date is easier to publicize and easier to miss if the bill passes late. 180 days is the same length of notice whenever it passes.",
        ties: [],
      },
      {
        topic: "Teachers who take a state education job",
        q: "Does a teacher who moves to DESE stop being a teacher?",
        kind: "include",
        s: null,
        snote:
          "Not in the Senate bill. The Senate replaced the House text outright and kept only the RetirementPlus reopening.",
        h: "Keeps teacher status and stays in the teachers’ or Boston retirement system, with no break in service. Anyone already moved to the state employees’ system is reinstated on paying the difference in contributions, and retires in group 1.",
        hAsked:
          "No, they keep teacher status and stay in the teachers’ or Boston retirement system, treated as having had no break in service. A teacher already moved to the state employees’ system is reinstated on paying the difference, and retires in group 1.",
        hc: "s94",
        why: "A separate subject riding in the same bill, and the Senate cut it. Because S.3109 is a replacement text for H.4361 rather than a bill of its own, dropping these provisions was a decision the Senate made rather than a subject it never reached.",
        ties: [],
      },
      {
        topic: "Backing out",
        q: "What happens if a teacher opts in and then cannot finish?",
        kind: "include",
        s: "The election is irrevocable, and a teacher who does nothing is treated as having affirmatively declined. A teacher who opts in, pays, and then does not complete the creditable service requirement is reimbursed the extra contributions with regular interest.",
        sAsked:
          "They are reimbursed the extra contributions with regular interest, though the election itself cannot be undone, and a teacher who never responds counts as having declined.",
        sc: "s93",
        h: null,
        hnote:
          "Not in the House bill, which says nothing about reversing an election or about refunding a teacher who pays in and does not qualify in the end.",
        why: "The Senate wrote the exits and the House did not. Whether that silence is deliberate or an omission is the kind of thing a conference settles quietly, and it decides what happens to a teacher who buys in and then leaves early.",
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
      {
        h: "One bill replaced the other",
        p: "These two are not parallel drafts. The House passed H.4361 in July 2025; the Senate reported S.3109 in June 2026 as a new text for that same bill, replacing it outright. So the Senate version is not a bill that happens to be shorter, it is the House bill rewritten, and everything the Senate left out it left out on purpose.",
        c: "s94",
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

/**
 * The three that go last, in this order.
 *
 * All three authorise borrowing, where the two texts differ in hundreds of
 * places and most of the differences are dollar amounts and named local
 * projects; two of them have no comparison written at all. They are listed and
 * they open, but a reader running down the twelve should meet the ones with
 * something to read first.
 */
const TAIL = ["bright-act", "mass-ready", "economic-development"];

/**
 * The twelve, in reading order.
 *
 * One array, read by the explorer's list and by the rail down the side of a
 * committee page, so the two cannot disagree about the order.
 */
export const COMMITTEES: CommitteeDetail[] = [
  ...FILED.filter((c) => !TAIL.includes(c.slug)),
  // In the order `TAIL` names them, not the order they were filed in.
  ...TAIL.map((slug) => FILED.find((c) => c.slug === slug)).filter(
    (c): c is CommitteeDetail => !!c,
  ),
];

/** By slug, since that is how a page arrives. */
export const BY_SLUG: Record<string, CommitteeDetail> = Object.fromEntries(
  COMMITTEES.map((c) => [c.slug, c]),
);

/** Whether this committee has a settled/open comparison compiled yet. */
export const hasComparison = (c: CommitteeDetail) =>
  Boolean(c.settled?.length || c.open?.length);
