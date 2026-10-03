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
  /** Initials for the avatar. There are no uploaded ones here, by design. */
  initials: string;
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
    id: "cc-ind-jordan",
    name: "Jordan M.",
    userType: "individual",
    descriptor: "Individual account, Hampden County",
    initials: "JM",
  },
  {
    id: "cc-ind-priya",
    name: "Priya S.",
    userType: "individual",
    descriptor: "Individual account, Middlesex County",
    initials: "PS",
    followedByViewer: true,
  },
  {
    id: "cc-ind-dana",
    name: "Dana W.",
    userType: "individual",
    descriptor: "Individual account, Berkshire County",
    initials: "DW",
  },
  {
    id: "cc-ind-samir",
    name: "Samir H.",
    userType: "individual",
    descriptor: "Individual account, Suffolk County",
    initials: "SH",
  },
  {
    id: "cc-ind-terry",
    name: "Terry O.",
    userType: "individual",
    descriptor: "Individual account, Bristol County",
    initials: "TO",
  },
  {
    id: "cc-ind-nadia",
    name: "Nadia K.",
    userType: "individual",
    descriptor: "Individual account, Worcester County",
    initials: "NK",
  },
  {
    id: "cc-ind-marcus",
    name: "Marcus B.",
    userType: "individual",
    descriptor: "Individual account, Essex County",
    initials: "MB",
    followedByViewer: true,
  },
  {
    id: "cc-ind-lian",
    name: "Lian T.",
    userType: "individual",
    descriptor: "Individual account, Norfolk County",
    initials: "LT",
  },

  // ── Organizations ─────────────────────────────────────────────────────────
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
    followedByViewer: true,
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
  descriptor: "Individual account, Suffolk County",
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
};
