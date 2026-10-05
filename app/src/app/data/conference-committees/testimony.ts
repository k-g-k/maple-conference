// Placeholder accounts and submissions for the conference-committee pages'
// public-input section.
//
// Nothing here is real. No account is a person or an organisation that exists,
// and no submission is anyone's position on anything. The section is a shell we
// want to see at full size before we know where the real filings come from: a
// conference takes no testimony of its own, so whatever eventually lands here
// will be collected from the two bills that went into it.
//
// The bodies are deliberately about themselves rather than about a subject. One
// set of filler serves all twelve committees, so a sentence about phones in
// schools or about energy bills would be wrong on eleven pages, and a reader
// who knows the page is a prototype is better served by copy that says so than
// by invented positions they might take for real ones.
//
// Positions follow the one rule we already know will hold: an organisation, a
// an agency writing on a conference is on the record as having
// filed, not as having taken a side. None of the four is "no side", so the rule
// lands on the least loaded of them: all three kinds carry "Please pass
// something", which asks the conference to do its job without choosing a
// chamber. Individuals vary, because that is where the position filter earns
// its keep, and each of them keeps the direction they had: the ones who wanted
// the outcome now ask for a text, the ones against it ask for none.
//
// An account has no position of its own. A position is a thing somebody said in
// a submission, so it lives on the submission; an account that filed twice is
// read from its filings. The placeholders keep one position per account, so the
// map has one answer per marker.
//
// The record is the conference pages' own, so the types are too. They were the
// 62F question's, imported for their shape, which coupled a conference's public
// input to a ballot question that has nothing to do with it.

import type { ConferencePosition } from "./positions";
// The two real accounts' own marks. Everything else here carries initials,
// which is right for a placeholder: a logo has to belong to somebody.
import fftfLogo from "../../../assets/orgs/fight-for-the-future.jpg";
import mmsSeal from "../../../assets/orgs/massachusetts-medical-society.png";

/**
 * "organization" for accounts writing under an organisation's name,
 * "government" for public offices, "individual" for a person.
 */
export type ConferenceAccountType =
  "organization" | "government" | "individual";

export interface ConferenceAccount {
  id: string;
  name: string;
  userType: ConferenceAccountType;
  /** Short account descriptor shown under the name. */
  descriptor: string;
  /** Initials for the avatar, and the fallback wherever there is no mark. */
  initials: string;
  /**
   * The account's own mark, for the accounts that are real.
   *
   * Square, because the avatar is a disc and a wordmark cannot be read inside
   * one at forty pixels. Initials stand in wherever this is missing.
   */
  avatar?: string;
  /** Sample viewer data: whether the prototype's reader follows this account. */
  followedByViewer?: boolean;
}

export interface ConferenceSubmission {
  /** Stable slug, for a future per-submission URL. Never reuse or rename. */
  id: string;
  /** The filing account, a `ConferenceAccount.id` below. */
  userId: string;
  /** Which of the four this filing asks the conference for. */
  position: ConferencePosition;
  date: string;
  body: string;
  /**
   * The one committee this filing belongs to, where it is about a real bill.
   *
   * The placeholders carry no slug and show on all twelve, which is what lets
   * one set of filler fill every page. A filing that names a bill cannot do
   * that, so it says which conference it was written to and appears there
   * only.
   */
  committee?: string;
  /** Where the filing was published, where it was published anywhere. */
  source?: string;
  /**
   * Everyone who put their name to the letter without writing it.
   *
   * Seconding, with the weight of a signature behind it. A coalition letter is
   * one filing with many signatories rather than many filings: the account
   * drafted it and the rest signed what it wrote, which is why this sits on
   * the submission rather than on an account.
   *
   * Not the same thing as writing it together. Co-authorship is a second
   * feature and a different relationship: several people with their hands on
   * the text, all of them answerable for the wording. Signing is agreement
   * with wording somebody else settled, and anybody can do it, which is what
   * makes the two worth keeping apart rather than collapsing into one list.
   */
  cosigners?: string[];
  /**
   * The filing this one seconds, where it is a co-sign rather than its own
   * words.
   *
   * The position on a co-sign is the signer's own, copied from the letter when
   * they signed, so nothing here is read through to the letter at display
   * time: a later change by the organisation does not rewrite what somebody
   * agreed to.
   */
  cosignOf?: string;
  /**
   * How many have put their name to this one.
   *
   * On the filing being signed rather than counted from the feed, because a
   * co-sign whose words were kept private never appears there: it goes to the
   * organisation and into this number, and nowhere else.
   */
  cosignCount?: number;
  /**
   * How many of those live in one of the six's own districts.
   *
   * The number a conferee reacts to. A letter with a thousand names on it is a
   * petition; a letter with forty names from the districts of the people in
   * the room is a constituency, and the two read very differently to the six.
   */
  cosignInDistrict?: number;
  /**
   * When the most recent of them signed.
   *
   * Not the filing's own date, which is in the byline and never moves. This
   * one says whether the letter is still gathering names or stopped weeks
   * ago, which is the difference between a live coalition and a filed record.
   */
  cosignLatest?: string;
  /**
   * How many of them wrote something of their own.
   *
   * The rest put their name to it and nothing else, which is the whole act and
   * not a lesser version of it. This figure exists because the two are read
   * differently: a name is agreement, and a name with words is a constituent
   * the six can be shown something from.
   */
  cosignWithInput?: number;
  /**
   * Which of the experiments this placeholder belongs to.
   *
   * Three routes are reading the same act three ways, and each wants its own
   * worked example: a signature on somebody's letter, that letter quoted
   * inside your own input, or its words copied into yours. A record with none
   * of these shows on all of them.
   */
  demoFor?: string[];
}

/**
 * The four account types MAPLE has, so the account-type filter has something in
 * every position: individuals, organizations, government offices.
 *
 * No avatars. Initials are all a placeholder account should carry, and a logo
 * would have to belong to somebody.
 */
export const DEMO_ACCOUNTS: ConferenceAccount[] = [
  // ── Individuals ───────────────────────────────────────────────────────────
  // First name and an initial: enough to look like an account, not enough to
  // be mistaken for a named person.
  {
    id: "cc-ind-elena",
    name: "Elena R.",
    userType: "individual",
    descriptor: "Eighth grade teacher, Essex County",
    initials: "ER",
  },
  {
    id: "cc-ind-cass",
    name: "Cass W.",
    userType: "individual",
    descriptor: "Dental hygienist, Worcester County",
    initials: "CW",
  },
  {
    id: "cc-ind-omar",
    name: "Omar F.",
    userType: "individual",
    descriptor: "Bus mechanic, Suffolk County",
    initials: "OF",
  },
  {
    id: "cc-ind-kira",
    name: "Kira D.",
    userType: "individual",
    descriptor: "Barista, Suffolk County",
    initials: "KD",
  },
  {
    id: "cc-ind-paul",
    name: "Paul E.",
    userType: "individual",
    descriptor: "Retired engineer, Middlesex County",
    initials: "PE",
  },
  {
    id: "cc-ind-nia",
    name: "Nia J.",
    userType: "individual",
    descriptor: "Hairdresser, Suffolk County",
    initials: "NJ",
  },
  {
    id: "cc-ind-levi",
    name: "Levi S.",
    userType: "individual",
    descriptor: "Line cook, Suffolk County",
    initials: "LS",
  },
  {
    id: "cc-ind-tess",
    name: "Tess M.",
    userType: "individual",
    descriptor: "Veterinary tech, Essex County",
    initials: "TM",
  },
  {
    id: "cc-ind-arun",
    name: "Arun K.",
    userType: "individual",
    descriptor: "Postal carrier, Hampden County",
    initials: "AK",
  },
  {
    id: "cc-ind-gia",
    name: "Gia R.",
    userType: "individual",
    descriptor: "Day care owner, Hampden County",
    initials: "GR",
  },
  {
    id: "cc-ind-blake",
    name: "Blake T.",
    userType: "individual",
    descriptor: "Plumber, Norfolk County",
    initials: "BT",
  },
  {
    id: "cc-ind-ivy",
    name: "Ivy C.",
    userType: "individual",
    descriptor: "Bookkeeper, Worcester County",
    initials: "IC",
  },
  {
    id: "cc-ind-sol",
    name: "Sol N.",
    userType: "individual",
    descriptor: "Grocery clerk, Middlesex County",
    initials: "SN",
  },
  {
    id: "cc-ind-wren",
    name: "Wren O.",
    userType: "individual",
    descriptor: "Music teacher, Norfolk County",
    initials: "WO",
  },
  {
    id: "cc-ind-hugo",
    name: "Hugo V.",
    userType: "individual",
    descriptor: "Landscaper, Norfolk County",
    initials: "HV",
  },
  {
    id: "cc-ind-fern",
    name: "Fern L.",
    userType: "individual",
    descriptor: "Home health aide, Middlesex County",
    initials: "FL",
  },
  {
    id: "cc-ind-reid",
    name: "Reid G.",
    userType: "individual",
    descriptor: "Electrician, Essex County",
    initials: "RG",
  },
  {
    id: "cc-ind-asha",
    name: "Asha B.",
    userType: "individual",
    descriptor: "Translator, Worcester County",
    initials: "AB",
  },
  {
    id: "cc-ind-milo",
    name: "Milo Z.",
    userType: "individual",
    descriptor: "Shop owner, Essex County",
    initials: "MZ",
  },
  {
    id: "cc-ind-nora",
    name: "Nora P.",
    userType: "individual",
    descriptor: "Pharmacist, Essex County",
    initials: "NP",
  },
  {
    id: "cc-ind-theo",
    name: "Theo B.",
    userType: "individual",
    descriptor: "Carpenter, Middlesex County",
    initials: "TB",
  },
  {
    id: "cc-ind-mina",
    name: "Mina H.",
    userType: "individual",
    descriptor: "Nurse, Berkshire County",
    initials: "MH",
  },
  {
    id: "cc-ind-russ",
    name: "Russ A.",
    userType: "individual",
    descriptor: "Fisherman, Barnstable County",
    initials: "RA",
  },
  {
    id: "cc-ind-desmond",
    name: "Desmond K.",
    userType: "individual",
    descriptor: "Youth worker, Bristol County",
    initials: "DK",
  },
  {
    id: "cc-ind-ava",
    name: "Ava L.",
    userType: "individual",
    descriptor: "School librarian, Hampshire County",
    initials: "AL",
  },
  {
    id: "cc-ind-jordan",
    name: "Jordan M.",
    userType: "individual",
    descriptor: "School counselor, Hampden County",
    initials: "JM",
  },
  {
    id: "cc-ind-priya",
    name: "Priya S.",
    userType: "individual",
    descriptor: "Pediatric nurse, Middlesex County",
    initials: "PS",
  },
  {
    id: "cc-ind-dana",
    name: "Dana W.",
    userType: "individual",
    descriptor: "High school teacher, Berkshire County",
    initials: "DW",
  },
  {
    id: "cc-ind-samir",
    name: "Samir H.",
    userType: "individual",
    descriptor: "Parent, Suffolk County",
    initials: "SH",
  },
  {
    id: "cc-ind-terry",
    name: "Terry O.",
    userType: "individual",
    descriptor: "Middle school principal, Bristol County",
    initials: "TO",
  },
  {
    id: "cc-ind-nadia",
    name: "Nadia K.",
    userType: "individual",
    descriptor: "Librarian, Worcester County",
    initials: "NK",
  },
  {
    id: "cc-ind-marcus",
    name: "Marcus B.",
    userType: "individual",
    descriptor: "Parent and PTO co-chair, Essex County",
    initials: "MB",
  },
  {
    id: "cc-ind-lian",
    name: "Lian T.",
    userType: "individual",
    descriptor: "Speech language pathologist, Norfolk County",
    initials: "LT",
  },

  // ── Organizations ─────────────────────────────────────────────────────────
  // ── Real, and the only one here that is ──────────────────────────────────
  // Everything else on this page is filler. This account is an organisation
  // that exists, filing a letter it actually sent, because the co-sign work
  // needs one true example to be built against: a drafting organisation, a
  // letter, and thirty other names on it.
  {
    id: "cc-org-mms",
    name: "Massachusetts Medical Society",
    userType: "organization",
    descriptor: "Organization account, verified",
    initials: "MM",
    // The Society's seal, taken from its own letterhead on the letter below.
    avatar: mmsSeal,
    // The viewer follows the two real organisations and nobody else:
    // following is what puts their letters in reach, and the co-sign work is
    // read from the position of somebody who already did that.
    followedByViewer: true,
  },
  {
    id: "cc-org-fftf",
    name: "Fight for the Future",
    userType: "organization",
    descriptor: "Organization account, verified",
    initials: "FF",
    avatar: fftfLogo,
    followedByViewer: true,
  },
  {
    id: "cc-org-coalition",
    name: "Example Statewide Coalition",
    userType: "organization",
    descriptor: "Organization account, placeholder record",
    initials: "EC",
  },
  {
    id: "cc-org-association",
    name: "Sample Trade Association",
    userType: "organization",
    descriptor: "Organization account, placeholder record",
    initials: "SA",
  },
  {
    id: "cc-org-local",
    name: "Placeholder Workers Alliance",
    userType: "organization",
    descriptor: "Organization account, placeholder record",
    initials: "PW",
  },

  // ── More government offices ───────────────────────────────────────────────
  {
    id: "cc-gov-dept",
    name: "Office of a Placeholder Department",
    userType: "government",
    descriptor: "Government account, placeholder department",
    initials: "PD",
  },
  {
    id: "cc-gov-board",
    name: "Example Regional Board",
    userType: "government",
    descriptor: "Government account, placeholder board",
    initials: "RB",
  },

  // ── Government offices ────────────────────────────────────────────────────
  {
    id: "cc-gov-agency",
    name: "Office of an Example Agency",
    userType: "government",
    descriptor: "Government account, placeholder office",
    initials: "EA",
  },
  {
    id: "cc-gov-city",
    name: "Office of a Placeholder Municipality",
    userType: "government",
    descriptor: "Government account, placeholder office",
    initials: "PM",
  },
];

/**
 * The prototype's own reader, so the review step can show them what they are
 * about to become.
 *
 * Not one of the placeholders above, and not a person: this is whoever is
 * looking at the prototype, and it exists because a preview of a submission
 * needs a name and a pair of initials to draw. The initials are the ones the
 * site bar already wears, so the account in the corner and the card on the
 * review step are recognisably the same account.
 *
 * Kept out of DEMO_ACCOUNTS, which is the roster the feed and the map read from.
 * This account belongs in the feed only once the reader has posted, and the page
 * adds it then.
 */
export const VIEWER: ConferenceAccount = {
  id: "cc-viewer",
  name: "Gina K.",
  userType: "individual",
  descriptor: "Parent, Norfolk County",
  initials: "GK",
};

/**
 * Eighteen submissions, newest first: one from each account, and a second from
 * three of them at the length people actually write at.
 *
 * This many because the feed only shows its filters above four entries and only
 * pages above whatever page size it is given, and a shell that never paginates
 * hides half of what the section will do. Every one of the four positions has
 * more than one submission under it, so none of the filters lands on a single
 * entry and reads as an accident.
 *
 * Where an account filed twice, both filings carry the same position. Nothing
 * stops a person changing their mind, but the map reads a county from the
 * accounts that filed in it, and an account arguing two ways would give a
 * marker no colour to take.
 */
export const DEMO_TESTIMONY: ConferenceSubmission[] = [
  // Filler, so the co-sign work is read in a feed rather than against four
  // real records. Deliberately blank prose: anything written here would be
  // read as a position somebody holds, and these are here for their shape.
  {
    id: "cc-t-sample-house",
    userId: "cc-ind-jordan",
    position: "house",
    date: "October 2, 2026",
    committee: "phone-free-schools",
    demoFor: ["cosign", "cosign2", "cosign3", "cosign4"],
    body: "This is sample text for a filing that asks the conference to report the House version. The words are placeholder. What is real here is the shape of the entry: an account, an ask, a date, and a body of whatever length the person wrote.",
  },
  {
    id: "cc-t-sample-senate",
    userId: "cc-ind-dana",
    position: "senate",
    date: "October 2, 2026",
    committee: "phone-free-schools",
    demoFor: ["cosign", "cosign2", "cosign3", "cosign4"],
    body: "This is sample text for a short filing. A line or two, which is what most of them are, and the reason the card has to look right at that length as well as at the length of a letter.",
  },
  {
    // Real. The Massachusetts Medical Society's letter of 5 June 2026, which
    // opens "Dear Members of the Conference Committee". Published at
    // massmed.org/Advocacy/State-Advocacy/State-Advocacy-Letters/Letter-to-Conference-Committee-in-Support-of-Legislation-to-Establish-Reasonable-Limits-on-Student-Smartphone-Use-During-the-School-Day/
    //
    // Quoted in full, salutation and signature included.
    // Its own numbering says S.2561 where this conference is S.2581; that is
    // the letter's, left as written.
    //
    // It supports the smartphone limits in both texts without choosing one,
    // and asks for two things inside them: accommodation for students who
    // need a device, and media literacy taught alongside the restriction.
    // "Please pass something" is the only one of the four that carries a
    // position of that shape.
    id: "cc-t-mms-letter",
    userId: "cc-org-mms",
    position: "pass",
    // Five have signed it. One of them published what she wrote and is in the
    // feed below; the rest kept theirs to the Society and the committee, which
    // is why the number is larger than the list.
    cosignCount: 5,
    // How many of the six conferees' districts the five reach into: one, Elena
    // R.'s Third Essex. That is the half of the number the conferees read.
    cosignInDistrict: 1,
    // Two of the five added words. One of those two published hers and is the
    // card below; the other went to the Society and the digest.
    cosignWithInput: 2,
    // After Elena R.'s, which is the one published below.
    cosignLatest: "October 2, 2026",
    date: "June 5, 2026",
    committee: "phone-free-schools",
    source:
      "https://www.massmed.org/Advocacy/State-Advocacy/State-Advocacy-Letters/Letter-to-Conference-Committee-in-Support-of-Legislation-to-Establish-Reasonable-Limits-on-Student-Smartphone-Use-During-the-School-Day/",
    body: "Dear Members of the Conference Committee:\n\nOn behalf of the over 22,000 members of the Massachusetts Medical Society (MMS), I write to convey our support of legislation to establish reasonable limits on student smartphone use during the school day, as proposed by H.5366 and S.2561. We appreciate the conference committee\u2019s thoughtful consideration of this issue and your commitment to promoting the healthy development and educational success of Massachusetts students.\n\nConsistent with our organizational policy, the Society supports limiting smartphone use in K\u201312 schools during school hours, while recognizing that implementation should consider individual student, school, and community needs. This includes ensuring appropriate accommodation for students with disabilities or health conditions who may require access to devices during the school day. In addition, the MMS supports school-based media literacy programs that teach critical thinking, learning, and safety skills related to internet and social media use. Efforts to reduce distraction during the school day should be paired with education that helps young people navigate digital environments safely and responsibly outside the classroom.\n\nA growing body of evidence demonstrates that excessive smartphone and social media use can negatively affect the mental, emotional, physical, and academic well-being of children and adolescents. Studies have associated problematic smartphone use among youth with increased rates of anxiety, depression, poor sleep, stress, reduced attention, and diminished academic performance. Additionally, frequent social media use may increase adolescents\u2019 exposure to cyberbullying and online harassment, disrupt healthy peer relationships, and displace time spent in activities and experiences that are protective for healthy development and emotional well-being.\n\nTeachers and school administrators across the country report that smartphone distraction is a significant barrier to learning and classroom engagement. Schools that have implemented smartphone restrictions have reported encouraging early outcomes, including reduced classroom distraction, improved student engagement, and a more positive school climate.\n\nImportantly, national medical organizations, including the American Academy of Pediatrics and the American Medical Association, have recognized the importance of limiting smartphone distraction during the school day to support students\u2019 focus, healthy development, and overall well-being. Creating learning environments with fewer digital distractions can help students engage more fully socially, emotionally, and academically throughout the school day.\n\nAccordingly, the MMS supports thoughtful, developmentally appropriate approaches to limiting smartphone use during the school day as part of broader efforts to promote students\u2019 academic success, social connection, and overall well-being.\n\nThank you for your consideration of our comments. Please do not hesitate to contact us if you have any questions.\n\nSincerely,\n\nRebecca W. Brendel, MD, JD",
  },
  // The rest of the names on the two letters. No words of their own, so no
  // body: the count on a letter and the cards beneath it are the same people
  // rather than a figure with nothing behind it.
  ...[
    {
      id: "cc-t-cass-cosign",
      userId: "cc-ind-cass",
      position: "senate" as const,
      date: "September 28, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-omar-cosign",
      userId: "cc-ind-omar",
      position: "senate" as const,
      date: "September 27, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-kira-cosign",
      userId: "cc-ind-kira",
      position: "senate" as const,
      date: "September 26, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-paul-cosign",
      userId: "cc-ind-paul",
      position: "senate" as const,
      date: "September 25, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-nia-cosign",
      userId: "cc-ind-nia",
      position: "senate" as const,
      date: "September 24, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-levi-cosign",
      userId: "cc-ind-levi",
      position: "senate" as const,
      date: "September 23, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-tess-cosign",
      userId: "cc-ind-tess",
      position: "senate" as const,
      date: "September 22, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-arun-cosign",
      userId: "cc-ind-arun",
      position: "senate" as const,
      date: "September 21, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-gia-cosign",
      userId: "cc-ind-gia",
      position: "senate" as const,
      date: "September 20, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-blake-cosign",
      userId: "cc-ind-blake",
      position: "senate" as const,
      date: "September 19, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-ivy-cosign",
      userId: "cc-ind-ivy",
      position: "senate" as const,
      date: "September 18, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-sol-cosign",
      userId: "cc-ind-sol",
      position: "senate" as const,
      date: "September 17, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-wren-cosign",
      userId: "cc-ind-wren",
      position: "senate" as const,
      date: "September 16, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-hugo-cosign",
      userId: "cc-ind-hugo",
      position: "senate" as const,
      date: "September 15, 2026",
      cosignOf: "cc-t-fftf-letter",
    },
    {
      id: "cc-t-fern-cosign",
      userId: "cc-ind-fern",
      position: "pass" as const,
      date: "September 28, 2026",
      cosignOf: "cc-t-mms-letter",
    },
    {
      id: "cc-t-reid-cosign",
      userId: "cc-ind-reid",
      position: "pass" as const,
      date: "September 27, 2026",
      cosignOf: "cc-t-mms-letter",
    },
    {
      id: "cc-t-asha-cosign",
      userId: "cc-ind-asha",
      position: "pass" as const,
      date: "September 26, 2026",
      cosignOf: "cc-t-mms-letter",
    },
    {
      id: "cc-t-milo-cosign",
      userId: "cc-ind-milo",
      position: "pass" as const,
      date: "September 25, 2026",
      cosignOf: "cc-t-mms-letter",
    },
  ].map((x) => ({
    ...x,
    committee: "phone-free-schools",
    demoFor: [
      "cosign",
      "cosign2",
      "cosign3",
      "cosign4",
      "cosign5",
      "cosign6",
      "cosign7",
      "cosign8",
      "cosign9",
      "cosign10",
    ],
    body: "",
  })),
  // A co-sign and nothing else, which is what most of them are: a name put to
  // somebody's letter, with no words added. The card is the header and the
  // byline, and the letter it names is the body.
  //
  // Four of them, because one would read as a record that had lost its text.
  ...[
    { id: "cc-t-nora-cosign", userId: "cc-ind-nora", date: "October 2, 2026" },
    { id: "cc-t-theo-cosign", userId: "cc-ind-theo", date: "October 1, 2026" },
    {
      id: "cc-t-mina-cosign",
      userId: "cc-ind-mina",
      date: "September 30, 2026",
    },
    {
      id: "cc-t-russ-cosign",
      userId: "cc-ind-russ",
      date: "September 29, 2026",
    },
  ].map((x) => ({
    ...x,
    position: "senate" as const,
    committee: "phone-free-schools",
    cosignOf: "cc-t-fftf-letter",
    demoFor: [
      "cosign",
      "cosign2",
      "cosign3",
      "cosign4",
      "cosign5",
      "cosign6",
      "cosign8",
      "cosign9",
      "cosign10",
    ],
    body: "",
  })),
  {
    // The same act against the other letter, so the two sides of the question
    // both have a worked example: one person co-signing a coalition that
    // wants the bill fixed, as well as one co-signing a society that wants it
    // passed. A reader scrolling the feed should find the act on both.
    //
    // Filed from the Hampshire district, which nobody on this conference
    // represents. That is the ordinary case, and the count on the letter says
    // so: twenty names, four of the six districts.
    id: "cc-t-ava-cosign",
    userId: "cc-ind-ava",
    position: "senate",
    date: "October 3, 2026",
    committee: "phone-free-schools",
    cosignOf: "cc-t-fftf-letter",
    demoFor: [
      "cosign",
      "cosign2",
      "cosign3",
      "cosign4",
      "cosign5",
      "cosign6",
      "cosign7",
      "cosign8",
      "cosign9",
      "cosign10",
      "repost",
      "endorse",
    ],
    body: "I am concerned about my students' use of social media and agree there needs to be more regulation, but the House bill goes too far. I'm more concerned about my students' privacy and safety. I oppose the social media ban as written. Pass the Senate's language.",
  },
  {
    // A second name on the coalition letter, and this one from a district on
    // the conference. Twenty signed it and four of the six districts are in
    // that number, so at least one of the published two has to be a
    // constituent or the figure on the card has nothing behind it.
    id: "cc-t-desmond-cosign",
    userId: "cc-ind-desmond",
    position: "senate",
    date: "October 1, 2026",
    committee: "phone-free-schools",
    cosignOf: "cc-t-fftf-letter",
    demoFor: [
      "cosign",
      "cosign2",
      "cosign3",
      "cosign4",
      "cosign5",
      "cosign6",
      "cosign7",
      "cosign8",
      "cosign9",
      "cosign10",
      "repost",
      "endorse",
    ],
    body: "I run an after-school program and I am concerned about my students' privacy with the current language for the social media ban. The age check at sign-up is the part that worries me. The Senate version got closer than the House did, but that question is still in there.",
  },
  {
    // A co-sign, published. Somebody who read the Society's letter, put their
    // name to it, and added a line of their own. The position is the letter's,
    // recorded here as theirs.
    //
    // Filed from the Third Essex, which is Senator Crighton's district and so
    // one of the six on this conference: a constituent of somebody in the room
    // is the case the whole feature is for.
    id: "cc-t-elena-cosign",
    userId: "cc-ind-elena",
    position: "pass",
    date: "September 29, 2026",
    committee: "phone-free-schools",
    cosignOf: "cc-t-mms-letter",
    demoFor: [
      "cosign",
      "cosign2",
      "cosign3",
      "cosign4",
      "cosign5",
      "cosign6",
      "cosign7",
      "cosign8",
      "cosign9",
      "cosign10",
      "repost",
      "endorse",
    ],
    body: "I teach eighth grade in Lynn and I would have written this myself if I had the words for it. The accommodation point matters where I work: two of my students carry glucose monitors on their phones, and a ban written without that in it would land on them first.",
  },
  {
    id: "cc-t-sample-none",
    userId: "cc-ind-priya",
    position: "none",
    date: "September 28, 2026",
    committee: "phone-free-schools",
    demoFor: ["cosign", "cosign2", "cosign3", "cosign4"],
    body: "This is sample text for a filing that asks the conference to report nothing at all. The words are placeholder and the position is here so that every one of the four has an entry in the feed to sit against.",
  },
  {
    id: "cc-t-sample-pass",
    userId: "cc-org-association",
    position: "pass",
    date: "September 25, 2026",
    committee: "phone-free-schools",
    demoFor: ["cosign", "cosign2", "cosign3", "cosign4"],
    body: "This is sample text for an organization filing that asks the conference to report something rather than letting the session end. The words are placeholder. This one is an organization account, so it is a card that could carry a band and a count.",
  },
  {
    // The real one. Fight for the Future's updated coalition letter of 27 July
    // 2026, which the organisation published at
    // fightforthefuture.org/news/2026-07-27-updated-letter-massachusetts-lawmakers-must-assure-constituents-and-human-rights-organizations-that-new-social-media-bill-does-not-require-invasive-online-id-checks
    //
    // The body is the July update and the three asks, which is the part of the
    // letter written to a conference committee. The letter that update sits on
    // top of is longer and argues the case; this is what it asks for. Quoted
    // exactly, including its own numbering of the bills.
    //
    id: "cc-t-fftf-letter",
    userId: "cc-org-fftf",
    position: "senate",
    date: "July 27, 2026",
    // Twenty have signed it, and they reach into four of the six conferees'
    // districts. The coalition letter draws more than the Society's because it
    // was the one circulated publicly.
    cosignCount: 20,
    // Three of the six: Crighton and Durant among the twenty below, and
    // Rodrigues through Desmond K. The other three conferees are House
    // members, whom this placeholder placement cannot reach.
    cosignInDistrict: 3,
    // Ava L. and Desmond K., both below.
    cosignWithInput: 2,
    cosignLatest: "October 3, 2026",
    committee: "phone-free-schools",
    source:
      "https://www.fightforthefuture.org/news/2026-07-27-updated-letter-massachusetts-lawmakers-must-assure-constituents-and-human-rights-organizations-that-new-social-media-bill-does-not-require-invasive-online-id-checks",
    body: "Our growing coalition of LGBTQ+, civil liberties, racial justice and human rights groups continues to oppose any legislation that requires online age checks or undermines the ability of marginalized people to use social media safely and anonymously. We appreciate that public backlash to House bill H. 5366 and Governor\u2019s Healey\u2019s proposal was reflected in the legislation offered by the MA Senate, and we appreciate that many Senators backed amendments that improved the bill.\n\nHowever, the Senate bill, S. 3164, as amended, still contains significant issues that could harm marginalized communities, undermine human rights, and chill freedom of expression. We urge House and Senate leaders to address remaining concerns with the legislation in the conference committee, or to table the legislation for a further session if an agreement on rights-preserving language cannot be reached.\n\nSpecifically, the conference committee must:\n\nAdopt changes substantively similar to proposed Amendment #19 to ensure that the bill does not require companies to implement an age assurance or age verification process upon account creation. The ability to opt-out is insufficient when users don\u2019t understand their rights or how to exercise them, and requiring platforms to request age information upon account sign-up creates a substantial barrier to adults\u2019 ability to speak anonymously online, violating First Amendment rights and making the legislation vulnerable to legal challenges.\n\nReject any changes that would require age gating of content or limit visibility of accounts that have not age verified. Any bill that requires age verification or age assurance in order to speak or read online is unconstitutional and poses a danger to marginalized communities in Massachusetts.\n\nReject any changes that would require age determination as a condition of accessing a social media platform or an account, any requirement to age gate access to content or the ability to post content, and any requirement to set a default limit on the amount of time minors can spend on social media or the visibility of users\u2019 posts.\n\nSigned,\n\nAct on Mass\nAdvocates for Youth\nArts Equity Group\nArtsWorcester\nAsian American Resource Workshop\nAsian Pacific Islanders Civic Action Network \u2013 Massachusetts\nBoston Democratic Socialists of America\nBoston Sex Workers and Allies Collective\nBrandeis Democrats\nDigital Fourth\nEducateUS\nEpiscopal City Misson\nFight for the Future\nFor Artists By Artists\nFrizz Media\nGreenRoots\nGuardian Project\nIfNotNow Boston\nIndivisible Upper Cape\nIntersectional Innovation and Impact (III) Labs\nJamaica Plain for Palestine\nJamaica Plain Progressives\nJewish Voice for Peace \u2013 Boston\nMass 50501\nMassachusetts Pirate Party\nMassachusetts Transgender Political Coalition (MTPC)\nMassEquality\nMatahari Women\u2019s Worker Center\nMid Cape Indivisible\nMRKH Intersex\nMuslim Justice League",
    // The other thirty names on the letter, in the order it prints them.
    // Fight for the Future led it and is the account, so it is not repeated
    // here.
    cosigners: [
      "Act on Mass",
      "Advocates for Youth",
      "Arts Equity Group",
      "ArtsWorcester",
      "Asian American Resource Workshop",
      "Asian Pacific Islanders Civic Action Network \u2013 Massachusetts",
      "Boston Democratic Socialists of America",
      "Boston Sex Workers and Allies Collective",
      "Brandeis Democrats",
      "Digital Fourth",
      "EducateUS",
      "Episcopal City Misson",
      "For Artists By Artists",
      "Frizz Media",
      "GreenRoots",
      "Guardian Project",
      "IfNotNow Boston",
      "Indivisible Upper Cape",
      "Intersectional Innovation and Impact (III) Labs",
      "Jamaica Plain for Palestine",
      "Jamaica Plain Progressives",
      "Jewish Voice for Peace \u2013 Boston",
      "Mass 50501",
      "Massachusetts Pirate Party",
      "Massachusetts Transgender Political Coalition (MTPC)",
      "MassEquality",
      "Matahari Women\u2019s Worker Center",
      "Mid Cape Indivisible",
      "MRKH Intersex",
      "Muslim Justice League",
    ],
  },
  {
    id: "cc-t-jordan",
    userId: "cc-ind-jordan",
    position: "house",
    date: "September 18, 2026",
    body: "This is what a submitted position looks like. An individual writes a few sentences about why the outcome matters to them, and it appears here with their name and the date. Nothing has been edited or ranked.",
  },
  {
    id: "cc-t-coalition",
    userId: "cc-org-coalition",
    position: "pass",
    date: "September 16, 2026",
    body: "An organization account files under its own name. This one asks the conference to reach agreement without saying which chamber's text should win, which is how the feed shows a filing that argues about detail rather than about the outcome. The text is placeholder; the shape of the entry is not.",
  },
  {
    id: "cc-t-dana",
    userId: "cc-ind-dana",
    position: "none",
    date: "September 15, 2026",
    body: "Here is a longer submission, because people do not all write the same amount. Some arrive as a single line and some run past what the card will show, and the card clamps those at six lines with a control to open the rest. This one exists to be long enough to need it, so the clamp can be seen working rather than described. Everything above is filler.",
  },
  {
    id: "cc-t-rep",
    userId: "cc-gov-dept",
    position: "pass",
    date: "September 14, 2026",
    body: "A public office writes under its own name. The account type sits beside the name, so a reader can tell at a glance who is speaking.",
  },
  {
    id: "cc-t-terry-agree",
    userId: "cc-ind-terry",
    position: "pass",
    date: "September 11, 2026",
    body: "Neither text is the one I would write. What I want is the version that comes out of the room with the parts both chambers can live with, and without the one provision that is going to sink it.",
  },
  {
    id: "cc-t-association-agree",
    userId: "cc-org-association",
    position: "pass",
    date: "September 10, 2026",
    body: "An organization asking for the middle rather than for its own side. Filings like this usually name the provisions they can accept either way, which is the most useful thing a conference can be told. Placeholder copy, so nothing here is anyone's position.",
  },
  {
    id: "cc-t-city-agree",
    userId: "cc-gov-city",
    position: "pass",
    date: "September 9, 2026",
    body: "A municipal office would have to carry out whichever text is agreed, so what it asks for is a single set of rules rather than one chamber's version of them.",
  },
  {
    id: "cc-t-priya",
    userId: "cc-ind-priya",
    position: "senate",
    date: "September 12, 2026",
    body: "Short, on purpose. Not every submission is an essay, and the feed should look right when one is two sentences long.",
  },
  {
    id: "cc-t-agency",
    userId: "cc-gov-agency",
    position: "pass",
    date: "September 11, 2026",
    body: "A government office files as an office rather than as a person. These usually describe what the office would have to do under either text, so the ask is that the conference agree on one rather than that it pick a chamber.",
  },
  {
    id: "cc-t-samir",
    userId: "cc-ind-samir",
    position: "none",
    date: "September 9, 2026",
    body: "This entry stands in for someone who disagrees with where things are heading and says so plainly. The position and the reasoning are both blank here: only the layout is real.",
  },
  {
    id: "cc-t-association",
    userId: "cc-org-association",
    position: "pass",
    date: "September 8, 2026",
    body: "Another organization, asking the conference to land on something. Two of these in the list is deliberate, because the account-type filter should have more than one thing to find when a reader narrows to organizations.",
  },
  {
    id: "cc-t-terry",
    userId: "cc-ind-terry",
    position: "pass",
    date: "September 5, 2026",
    body: "An individual can ask for agreement without preferring a chamber. This one is here so that position is not something only organizations and officials take.",
  },
  {
    id: "cc-t-sen",
    userId: "cc-gov-board",
    position: "pass",
    date: "September 3, 2026",
    body: "A second government account, so the type reads as a category rather than as one odd entry. What an office actually writes would name the two texts and the difference between them. This does not, because it has to sit on every page.",
  },
  {
    id: "cc-t-nadia",
    userId: "cc-ind-nadia",
    position: "house",
    date: "September 1, 2026",
    body: "Filler standing in for a resident who wants the outcome and explains what it would change for them. Real submissions are specific, and specificity is the one thing a placeholder cannot have.",
  },
  {
    id: "cc-t-city",
    userId: "cc-gov-city",
    position: "pass",
    date: "August 28, 2026",
    body: "A municipal office files about what either version would mean to carry out locally. Like the other office above it, that is a description rather than an argument, so what it asks for is a result rather than a text.",
  },
  {
    id: "cc-t-marcus",
    userId: "cc-ind-marcus",
    position: "none",
    date: "August 26, 2026",
    body: "This one is medium length, which is where most submissions land. A few sentences of reasoning, a line about the writer's own situation, and no summary at the end. It is here to keep the list from alternating between very short and very long.",
  },
  {
    id: "cc-t-local",
    userId: "cc-org-local",
    position: "pass",
    date: "August 24, 2026",
    body: "A third organization, asking for agreement like the rest of them. Placeholder copy, so nothing in it should be read as a position anybody holds.",
  },
  {
    id: "cc-t-lian",
    userId: "cc-ind-lian",
    position: "pass",
    date: "August 21, 2026",
    body: "The last of the placeholders. By the time a reader reaches it they are on the third page, which is the point of having this many.",
  },
  // The long ones. A six-line clamp cannot be judged against copy that only
  // just reaches seven, so these run well past it, in three different shapes:
  // one person arguing, one person listing what worries them, and one
  // organisation filing a drafted document.
  {
    id: "cc-t-priya-long",
    userId: "cc-ind-priya",
    position: "senate",
    date: "August 19, 2026",
    body: "This is one of the long ones, and it is long on purpose. The reason it exists is that the card holds a submission at six lines and offers a control for the rest, and a clamp cannot be judged against copy that is only just long enough to trigger it. So this runs well past the fold. A person writing at this length usually does it for one of a few reasons. They have a specific situation and they think the general argument has missed it. They work in the thing being legislated and they know where the text will meet reality. Or they have written to their legislator before, heard nothing back, and are trying to leave a record that cannot be summarized away. All three produce a wall of text, and none of them is the same as not having a point. The design question underneath this placeholder is what the page owes that person. Clamping the card keeps a list readable when most entries are short. Hiding the rest behind a control means the reader chooses to spend the time rather than having it taken. What the page must not do is imply that a long submission is worth less than a short one by making it harder to reach than the ones that happen to fit. Everything here is filler and none of it is anybody's position on anything.",
  },
  {
    id: "cc-t-samir-long",
    userId: "cc-ind-samir",
    position: "none",
    date: "August 17, 2026",
    body: "Another long one, written in a different shape, because people who write at length do not all write the same way. This one is a list of worries rather than an argument. First, that the committee will split the difference on something that does not divide: half of a mechanism is often worse than either whole version of it, and the record of conference committees is full of compromises that did not work because they were arrived at by arithmetic rather than by deciding. Second, that the parts that both chambers already agree on are the parts nobody will write about, so the public record will be all disagreement and none of the substance. Third, that the dates in both texts have already passed, which means whatever is agreed has to come with a new calendar, and a new calendar is where things quietly get delayed by a year. Fourth, and this is the one that is hardest to put into a form field: that a committee of six people meeting in private is being asked to make a decision that neither chamber was willing to make in public, and that the reason it went to conference at all is that the disagreement is real rather than technical. None of that is a reason not to file. It is a reason to file at length. This text is a placeholder and stands in for a submission nobody has written.",
  },
  {
    id: "cc-t-association-long",
    userId: "cc-org-association",
    position: "pass",
    date: "August 14, 2026",
    body: "A long submission from an organization account, which reads differently again: it is drafted rather than written, and it shows. It opens by stating who is filing and what they do, because the reader is assumed not to know. It notes the sections it is addressing by number, which is how a filing gets used by staff rather than only read. It then works through the provisions one at a time, saying for each whether the position is support, opposition, or a request for a change, and why, with the reasons kept separate from the requests so the two can be taken separately. It avoids the word unacceptable. It avoids naming a legislator. It does not claim to speak for anyone who has not asked it to, and where it is speaking for members it says how many and how they were consulted. It offers to answer questions and gives a way to do that. It is, in other words, a long document written to be skimmed by someone with forty of them to get through before a meeting, which is the real audience for most of what arrives here. The point of showing one at full length is that the page has to hold this shape as well as the two-line one above it. Placeholder copy throughout.",
  },
];

/**
 * Where each demo individual files from, as a Senate seat.
 *
 * Placeholder placement, like everything else here. The accounts name a county
 * and the map draws districts, so one district inside each named county stands
 * in for it. Nothing about these seats is a claim: no submission here is real,
 * and none of these senators has anything to do with it. When real filings
 * arrive they will carry their own addresses and this goes away.
 */
export const DEMO_SEATS: Record<string, string> = {
  "cc-ind-jordan": "S:Gómez", // Hampden
  "cc-ind-priya": "S:Jehlen", // Middlesex
  "cc-ind-dana": "S:Mark", // Berkshire
  "cc-ind-samir": "S:Collins", // Suffolk
  "cc-ind-terry": "S:Montigny", // Bristol
  "cc-ind-nadia": "S:Kennedy", // Worcester
  "cc-ind-marcus": "S:Lovely", // Essex
  "cc-ind-lian": "S:Rush", // Norfolk
  "cc-ind-elena": "S:Crighton", // Third Essex, a conferee's own district
  "cc-ind-ava": "S:Comerford", // Hampshire, nobody on this conference
  "cc-ind-desmond": "S:Rodrigues", // First Bristol and Plymouth, a conferee's
  // The four who signed and wrote nothing, taking the seats their placements
  // held in DEMO_COSIGN_SEATS before they had names.
  "cc-ind-nora": "S:Crighton",
  "cc-ind-theo": "S:Jehlen",
  "cc-ind-mina": "S:Mark",
  "cc-ind-russ": "S:Cyr",
  // The rest of the names on the two letters, each where they live. Every
  // co-sign the count claims is an entry in the feed now, so the figure on a
  // letter and the cards under it are the same people.
  "cc-ind-cass": "S:Durant",
  "cc-ind-omar": "S:Collins",
  "cc-ind-kira": "S:Collins",
  "cc-ind-paul": "S:Jehlen",
  "cc-ind-nia": "S:Edwards",
  "cc-ind-levi": "S:Miranda",
  "cc-ind-tess": "S:Lovely",
  "cc-ind-arun": "S:Oliveira",
  "cc-ind-gia": "S:Velis",
  "cc-ind-blake": "S:Feeney",
  "cc-ind-ivy": "S:Moore",
  "cc-ind-sol": "S:Barrett",
  "cc-ind-wren": "S:Creem",
  "cc-ind-hugo": "S:Rausch",
  "cc-ind-fern": "S:Jehlen",
  "cc-ind-reid": "S:Lovely",
  "cc-ind-asha": "S:Moore",
  "cc-ind-milo": "S:Tarr",
};
