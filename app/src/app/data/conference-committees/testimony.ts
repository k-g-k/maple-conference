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
// Stances follow the one rule we already know will hold: an organisation, a
// legislator or an agency filing on a conference is on the record as having
// filed, not as having taken a side, so all three carry "no-position" here.
// Individuals vary, because that is where the stance filter earns its keep.
//
// Types come from the 62F question's model rather than a second copy of it,
// because the feed rendering this data is typed against that model. They are
// type-only imports, so none of that question's content is pulled in.

import type { PositionUser } from "../tax-rebate-62f-users";
import type { TestimonyItem } from "../tax-rebate-62f-testimony";

/**
 * The four account types MAPLE has, so the account-type filter has something in
 * every position: individuals, organizations, legislators, government offices.
 *
 * No avatars. Initials are all a placeholder account should carry, and a logo
 * would have to belong to somebody.
 */
export const DEMO_ACCOUNTS: PositionUser[] = [
  // ── Individuals ───────────────────────────────────────────────────────────
  // First name and an initial: enough to look like an account, not enough to
  // be mistaken for a named person.
  {
    id: "cc-ind-jordan",
    name: "Jordan M.",
    userType: "individual",
    descriptor: "Individual account, Hampden County",
    stance: "supports",
    initials: "JM",
  },
  {
    id: "cc-ind-priya",
    name: "Priya S.",
    userType: "individual",
    descriptor: "Individual account, Middlesex County",
    stance: "supports",
    initials: "PS",
    followedByViewer: true,
  },
  {
    id: "cc-ind-dana",
    name: "Dana W.",
    userType: "individual",
    descriptor: "Individual account, Berkshire County",
    stance: "opposes",
    initials: "DW",
  },
  {
    id: "cc-ind-samir",
    name: "Samir H.",
    userType: "individual",
    descriptor: "Individual account, Suffolk County",
    stance: "opposes",
    initials: "SH",
  },
  {
    id: "cc-ind-terry",
    name: "Terry O.",
    userType: "individual",
    descriptor: "Individual account, Bristol County",
    stance: "neutral",
    initials: "TO",
  },
  {
    id: "cc-ind-nadia",
    name: "Nadia K.",
    userType: "individual",
    descriptor: "Individual account, Worcester County",
    stance: "supports",
    initials: "NK",
  },
  {
    id: "cc-ind-marcus",
    name: "Marcus B.",
    userType: "individual",
    descriptor: "Individual account, Essex County",
    stance: "opposes",
    initials: "MB",
    followedByViewer: true,
  },
  {
    id: "cc-ind-lian",
    name: "Lian T.",
    userType: "individual",
    descriptor: "Individual account, Norfolk County",
    stance: "neutral",
    initials: "LT",
  },

  // ── Organizations ─────────────────────────────────────────────────────────
  {
    id: "cc-org-coalition",
    name: "Example Statewide Coalition",
    userType: "organization",
    descriptor: "Organization account, placeholder record",
    stance: "neutral",
    initials: "EC",
  },
  {
    id: "cc-org-association",
    name: "Sample Trade Association",
    userType: "organization",
    descriptor: "Organization account, placeholder record",
    stance: "neutral",
    initials: "SA",
    followedByViewer: true,
  },
  {
    id: "cc-org-local",
    name: "Placeholder Workers Alliance",
    userType: "organization",
    descriptor: "Organization account, placeholder record",
    stance: "neutral",
    initials: "PW",
  },

  // ── Legislators ───────────────────────────────────────────────────────────
  // Not conferees, and not named after any sitting member. A legislator account
  // is its own type in the feed, so the filter needs one to find.
  {
    id: "cc-leg-rep",
    name: "Rep. Sample Member",
    userType: "legislator",
    descriptor: "State Representative, placeholder district",
    stance: "neutral",
    initials: "SM",
  },
  {
    id: "cc-leg-sen",
    name: "Sen. Example Member",
    userType: "legislator",
    descriptor: "State Senator, placeholder district",
    stance: "neutral",
    initials: "EM",
  },

  // ── Government offices ────────────────────────────────────────────────────
  {
    id: "cc-gov-agency",
    name: "Office of an Example Agency",
    userType: "government",
    descriptor: "Government account, placeholder office",
    stance: "neutral",
    initials: "EA",
  },
  {
    id: "cc-gov-city",
    name: "Office of a Placeholder Municipality",
    userType: "government",
    descriptor: "Government account, placeholder office",
    stance: "neutral",
    initials: "PM",
  },
];

/**
 * Fifteen submissions, newest first, one per account.
 *
 * Fifteen because the feed only shows its filters above four entries and only
 * pages above whatever page size it is given, and a shell that never paginates
 * hides half of what the section will do.
 */
export const DEMO_TESTIMONY: TestimonyItem[] = [
  {
    id: "cc-t-jordan",
    userId: "cc-ind-jordan",
    stance: "endorse",
    date: "September 18, 2026",
    body: "This is what a submitted position looks like. An individual writes a few sentences about why the outcome matters to them, and it appears here with their name and the date. Nothing has been edited or ranked.",
  },
  {
    id: "cc-t-coalition",
    userId: "cc-org-coalition",
    stance: "no-position",
    date: "September 16, 2026",
    body: "An organization account files under its own name. This one is on the record without taking a side, which is how the feed shows a filing that argues about detail rather than about the outcome. The text is placeholder; the shape of the entry is not.",
  },
  {
    id: "cc-t-dana",
    userId: "cc-ind-dana",
    stance: "oppose",
    date: "September 15, 2026",
    body: "Here is a longer submission, because people do not all write the same amount. Some arrive as a single line and some run past what the card will show, and the card clamps those at six lines with a control to open the rest. This one exists to be long enough to need it, so the clamp can be seen working rather than described. Everything above is filler.",
  },
  {
    id: "cc-t-rep",
    userId: "cc-leg-rep",
    stance: "no-position",
    date: "September 14, 2026",
    body: "A legislator account files the same way everyone else does. The account type sits beside the name, so a reader can tell at a glance who is speaking.",
  },
  {
    id: "cc-t-priya",
    userId: "cc-ind-priya",
    stance: "endorse",
    date: "September 12, 2026",
    body: "Short, on purpose. Not every submission is an essay, and the feed should look right when one is two sentences long.",
  },
  {
    id: "cc-t-agency",
    userId: "cc-gov-agency",
    stance: "no-position",
    date: "September 11, 2026",
    body: "A government office files as an office rather than as a person. These usually describe what the office would have to do under either text, which is information rather than a position, so the entry carries no stance chip. Placeholder text.",
  },
  {
    id: "cc-t-samir",
    userId: "cc-ind-samir",
    stance: "oppose",
    date: "September 9, 2026",
    body: "This entry stands in for someone who disagrees with where things are heading and says so plainly. The position and the reasoning are both blank here: only the layout is real.",
  },
  {
    id: "cc-t-association",
    userId: "cc-org-association",
    stance: "no-position",
    date: "September 8, 2026",
    body: "Another organization, another filing on the record without a side. Two of these in the list is deliberate, because the account-type filter should have more than one thing to find when a reader narrows to organizations.",
  },
  {
    id: "cc-t-terry",
    userId: "cc-ind-terry",
    stance: "no-position",
    date: "September 5, 2026",
    body: "An individual can file without picking a side too. This one is here so the neutral position is not something only organizations and officials do.",
  },
  {
    id: "cc-t-sen",
    userId: "cc-leg-sen",
    stance: "no-position",
    date: "September 3, 2026",
    body: "A second legislator account, so the type reads as a category rather than as one odd entry. What a member actually writes would name the two texts and the difference between them. This does not, because it has to sit on every page.",
  },
  {
    id: "cc-t-nadia",
    userId: "cc-ind-nadia",
    stance: "endorse",
    date: "September 1, 2026",
    body: "Filler standing in for a resident who wants the outcome and explains what it would change for them. Real submissions are specific, and specificity is the one thing a placeholder cannot have.",
  },
  {
    id: "cc-t-city",
    userId: "cc-gov-city",
    stance: "no-position",
    date: "August 28, 2026",
    body: "A municipal office files about what either version would mean to carry out locally. Like the other office above it, that is a description rather than an argument, so it sits in the feed with no side attached.",
  },
  {
    id: "cc-t-marcus",
    userId: "cc-ind-marcus",
    stance: "oppose",
    date: "August 26, 2026",
    body: "This one is medium length, which is where most submissions land. A few sentences of reasoning, a line about the writer's own situation, and no summary at the end. It is here to keep the list from alternating between very short and very long.",
  },
  {
    id: "cc-t-local",
    userId: "cc-org-local",
    stance: "no-position",
    date: "August 24, 2026",
    body: "A third organization, filed neutral like the rest of them. Placeholder copy, so nothing in it should be read as a position anybody holds.",
  },
  {
    id: "cc-t-lian",
    userId: "cc-ind-lian",
    stance: "no-position",
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
    stance: "endorse",
    date: "August 19, 2026",
    body: "This is one of the long ones, and it is long on purpose. The reason it exists is that the card holds a submission at six lines and offers a control for the rest, and a clamp cannot be judged against copy that is only just long enough to trigger it. So this runs well past the fold. A person writing at this length usually does it for one of a few reasons. They have a specific situation and they think the general argument has missed it. They work in the thing being legislated and they know where the text will meet reality. Or they have written to their legislator before, heard nothing back, and are trying to leave a record that cannot be summarized away. All three produce a wall of text, and none of them is the same as not having a point. The design question underneath this placeholder is what the page owes that person. Clamping the card keeps a list readable when most entries are short. Hiding the rest behind a control means the reader chooses to spend the time rather than having it taken. What the page must not do is imply that a long submission is worth less than a short one by making it harder to reach than the ones that happen to fit. Everything here is filler and none of it is anybody's position on anything.",
  },
  {
    id: "cc-t-samir-long",
    userId: "cc-ind-samir",
    stance: "oppose",
    date: "August 17, 2026",
    body: "Another long one, written in a different shape, because people who write at length do not all write the same way. This one is a list of worries rather than an argument. First, that the committee will split the difference on something that does not divide: half of a mechanism is often worse than either whole version of it, and the record of conference committees is full of compromises that did not work because they were arrived at by arithmetic rather than by deciding. Second, that the parts that both chambers already agree on are the parts nobody will write about, so the public record will be all disagreement and none of the substance. Third, that the dates in both texts have already passed, which means whatever is agreed has to come with a new calendar, and a new calendar is where things quietly get delayed by a year. Fourth, and this is the one that is hardest to put into a form field: that a committee of six people meeting in private is being asked to make a decision that neither chamber was willing to make in public, and that the reason it went to conference at all is that the disagreement is real rather than technical. None of that is a reason not to file. It is a reason to file at length. This text is a placeholder and stands in for a submission nobody has written.",
  },
  {
    id: "cc-t-association-long",
    userId: "cc-org-association",
    stance: "no-position",
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
