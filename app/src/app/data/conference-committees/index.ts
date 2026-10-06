// The 194th General Court's conference committees.
//
// A conference committee exists when the House and the Senate have each passed
// a different text of the same proposal. Six members, three from each chamber,
// reconcile the two behind closed doors. There is no hearing, no public
// testimony is taken, and nothing is published until they report. The conferees
// are the entire decision surface, which is why they are named here in full.
//
// The clock is the other thing, though not the way it is usually told. Joint
// Rule 12A ends formal business on the last day of July in an election year,
// and the 194th's own amendment to it, adopted 26 June 2025, carves out an
// exception: both chambers may still convene formally to consider "reports of
// committees of conference formed on or before the last day of July of the
// second annual session". Every committee here was formed by 31 July 2026, so
// every one of them can still be taken up formally. What the date changes is
// everything else around them, not their own report.
//
// Verified against the Joint and House Rules on 1 October 2026, which also
// corrected the opposite claim this comment used to make.
//
// ── Source ────────────────────────────────────────────────────────────────
//
// State House News Service's conference committee scorecard, which is the only
// list carrying both bill numbers, all six conferees, and the dates. Four
// things it corrected against the trackers and reporting we had first:
//
//   Energy            H.5151, not H.5175. This one was wrong, and it is the
//                     reason the list is worth distrusting: the journal and
//                     the conference's own meeting notice both name H.5175,
//                     so the correction has been reversed here. Confirmed
//                     again since: notice 5758 names "H5175 and S3166" twice.
//   Economic dev      S.3228, not S.3178. H.5576 is right; H.5527 is not in it.
//   Child welfare     H.4646 / S.3121, not H.4644 / S.2659, and it is finished
//                     rather than active: reported as H.5629 and enacted. The
//                     scorecard was not inventing those numbers: the
//                     conference's own meeting notice, event 5742, names
//                     H4644 and S2659 too. The histories win, but the
//                     legislature's own notice is loose here.
//   Public records    Called "Legislative records access", H.5469 / S.3244.
//
// The economic development number would have pointed a whole page at the wrong
// bill, and the energy one did, in the other direction. Bill numbers in
// reporting are unreliable enough that a page built on them should say where it
// got them, and should lose to the legislature's own record where the two
// disagree.
//
// H.4706 turns out to be home care licensure, a different and now-finished
// conference, which is why it kept turning up beside the workplace violence
// bill: the two were reported in the same week.

export interface Conferee {
  name: string;
  chamber: "House" | "Senate";
  /** Their city or town, as the scorecard gives it. */
  town: string;
  /** Named first for their chamber. */
  chair?: boolean;
}

export interface ConferenceCommittee {
  id: string;
  /** What it is called in the press, which is how a reader will arrive. */
  name: string;
  house: string;
  senate: string;
  conferees: Conferee[];
  sentToConference: string;
  /**
   * Null where the committee has been appointed and has noticed no meeting.
   *
   * Not the same as not having met: a conference can meet without filing a
   * notice, and nothing published would show it.
   */
  firstMeeting: string | null;
  /**
   * A finished conference reports a single new bill number, and that text is
   * what becomes law. Everything before it is superseded, which is the fact a
   * reader following one of the original numbers most needs to be told.
   */
  reported?: { on: string; as: string };
  enacted?: string;
  signed?: string;
}

const people = (
  senate: [string, string][],
  house: [string, string][],
): Conferee[] => [
  ...senate.map(([name, town], i) => ({
    name,
    town,
    chamber: "Senate" as const,
    chair: i === 0,
  })),
  ...house.map(([name, town], i) => ({
    name,
    town,
    chamber: "House" as const,
    chair: i === 0,
  })),
];

/** Still sitting. These are the ones worth a page. */
export const ACTIVE: ConferenceCommittee[] = [
  {
    id: "primarycare",
    name: "Primary care",
    house: "H.5630",
    senate: "S.3141",
    sentToConference: "July 31, 2026",
    firstMeeting: "September 17, 2026",
    conferees: people(
      [
        ["Cindy Friedman", "Arlington"],
        ["John Cronin", "Fitchburg"],
        ["Bruce Tarr", "Gloucester"],
      ],
      [
        ["Aaron Michlewitz", "Boston"],
        ["Meghan Kilcoyne", "Clinton"],
        ["Hannah Kane", "Shrewsbury"],
      ],
    ),
  },
  {
    id: "records",
    name: "Legislative records access",
    house: "H.5469",
    senate: "S.3244",
    sentToConference: "July 31, 2026",
    firstMeeting: "July 31, 2026",
    conferees: people(
      [
        ["Cindy Creem", "Newton"],
        ["Cindy Friedman", "Arlington"],
        ["Kelly Dooner", "Taunton"],
      ],
      [
        ["Alice Peisch", "Wellesley"],
        ["Andres Vargas", "Haverhill"],
        ["David Muradian", "Grafton"],
      ],
    ),
  },
  {
    id: "ecdev",
    name: "Economic development",
    house: "H.5576",
    senate: "S.3228",
    sentToConference: "July 30, 2026",
    firstMeeting: "July 31, 2026",
    conferees: people(
      [
        ["Barry Finegold", "Andover"],
        ["Michael Rodrigues", "Westport"],
        ["Peter Durant", "Spencer"],
      ],
      [
        ["Aaron Michlewitz", "Boston"],
        ["Carole Fiola", "Fall River"],
        ["Michael Soter", "Bellingham"],
      ],
    ),
  },
  {
    id: "pets",
    name: "PETS Act",
    house: "H.5589",
    senate: "S.3028",
    sentToConference: "July 27, 2026",
    firstMeeting: "July 31, 2026",
    conferees: people(
      [
        ["Paul Feeney", "Foxborough"],
        ["Jason Lewis", "Winchester"],
        ["Bruce Tarr", "Gloucester"],
      ],
      [
        ["Jim O'Day", "West Boylston"],
        ["Jack Lewis", "Framingham"],
        ["Steven Howitt", "Seekonk"],
      ],
    ),
  },
  {
    id: "workplace",
    name: "Violence against healthcare workers",
    house: "H.4767",
    senate: "S.3184",
    sentToConference: "July 23, 2026",
    firstMeeting: "September 3, 2026",
    conferees: people(
      [
        ["Cindy Friedman", "Arlington"],
        ["Joan Lovely", "Salem"],
        ["Kelly Dooner", "Taunton"],
      ],
      [
        ["Michael Day", "Stoneham"],
        ["Fluker-Reid", "Boston"],
        ["Hannah Kane", "Shrewsbury"],
      ],
    ),
  },
  {
    id: "ballotfinance",
    name: "Ballot question campaign finance",
    house: "H.5558",
    senate: "S.2916",
    sentToConference: "July 23, 2026",
    firstMeeting: "July 31, 2026",
    conferees: people(
      [
        ["Sal DiDomenico", "Everett"],
        ["Jacob Oliveira", "Ludlow"],
        ["Ryan Fattman", "Sutton"],
      ],
      [
        ["Dan Hunt", "Boston"],
        ["Alice Peisch", "Wellesley"],
        ["Paul Frost", "Auburn"],
      ],
    ),
  },
  {
    id: "energy",
    name: "Energy affordability",
    house: "H.5175",
    senate: "S.3166",
    sentToConference: "July 16, 2026",
    firstMeeting: "July 29, 2026",
    conferees: people(
      [
        ["Michael Barrett", "Lexington"],
        ["Cindy Creem", "Newton"],
        ["Bruce Tarr", "Gloucester"],
      ],
      [
        ["Mark Cusack", "Braintree"],
        ["Aaron Michlewitz", "Boston"],
        ["Brad Jones", "North Reading"],
      ],
    ),
  },
  {
    id: "pension",
    name: "Enhanced teacher retirement benefits",
    house: "H.4361",
    senate: "S.3109",
    sentToConference: "July 15, 2026",
    firstMeeting: "July 31, 2026",
    conferees: people(
      [
        ["Michael Rodrigues", "Westport"],
        ["Joan Lovely", "Salem"],
        ["Patrick O'Connor", "Weymouth"],
      ],
      [
        ["Daniel Ryan", "Boston"],
        ["Carlos González", "Springfield"],
        ["Kimberly Ferguson", "Holden"],
      ],
    ),
  },
  {
    id: "massready",
    name: "Environmental borrowing",
    house: "H.5518",
    senate: "S.3064",
    sentToConference: "July 1, 2026",
    firstMeeting: "July 8, 2026",
    conferees: people(
      [
        ["Julian Cyr", "Provincetown"],
        ["Becca Rausch", "Needham"],
        ["Peter Durant", "Spencer"],
      ],
      [
        ["Michael Finn", "West Springfield"],
        ["Christine Barber", "Somerville"],
        ["Ken Sweezey", "Duxbury"],
      ],
    ),
  },
  {
    id: "privacy",
    name: "Data privacy",
    house: "H.5479",
    senate: "S.2619",
    sentToConference: "June 17, 2026",
    firstMeeting: "July 7, 2026",
    conferees: people(
      [
        ["Cindy Creem", "Newton"],
        ["Barry Finegold", "Andover"],
        ["Patrick O'Connor", "Weymouth"],
      ],
      [
        ["Michael Moran", "Boston"],
        ["Tricia Farley-Bouvier", "Pittsfield"],
        ["David Vieira", "Falmouth"],
      ],
    ),
  },
  {
    id: "phones",
    name: "Cellphones in schools and social media regulation",
    house: "H.5366",
    senate: "S.2581",
    sentToConference: "May 20, 2026",
    firstMeeting: "June 4, 2026",
    conferees: people(
      [
        ["Brendan Crighton", "Lynn"],
        ["Michael Rodrigues", "Westport"],
        ["Peter Durant", "Spencer"],
      ],
      [
        ["Alice Peisch", "Wellesley"],
        ["Frank Moran", "Lawrence"],
        ["David Vieira", "Falmouth"],
      ],
    ),
  },
  {
    id: "bright",
    name: "Higher education infrastructure",
    house: "H.4769",
    senate: "S.2993",
    sentToConference: "April 9, 2026",
    // No notice, in any month of the session. Two sweeps looked: the April
    // 2026 calendar in full, and then all 24 months of the 194th, 1,034
    // events, of which 31 are conference meetings and none is this one. A
    // title match on the bill numbers and on "higher ed" returns only the
    // standing Joint Committee on Higher Education's own hearings, the last
    // of them three weeks before this conference was appointed.
    //
    // It is the only one of the nineteen conferences with no notice at all.
    firstMeeting: null,
    conferees: people(
      [
        ["Jo Comerford", "Northampton"],
        ["Mike Rush", "Boston"],
        ["Kelly Dooner", "Taunton"],
      ],
      [
        ["David Rogers", "Cambridge"],
        ["Mike Finn", "West Springfield"],
        ["Kelly Pease", "Westfield"],
      ],
    ),
  },
];

/**
 * Finished, and useful for exactly that reason.
 *
 * A conference page's hardest question is what happens at the end, and these
 * are the answer: each reported one new bill number, and the gap between being
 * sent to conference and reporting is the only public measure of how long this
 * takes. It also gives the page a real range rather than a guess.
 */
export const COMPLETED: ConferenceCommittee[] = [
  {
    id: "homecare",
    name: "Home care licensure",
    house: "H.4706",
    senate: "S.3183",
    sentToConference: "2026",
    // Event 5759, 29 July 2026, Room 319.
    firstMeeting: "July 29, 2026",
    reported: { on: "July 30, 2026", as: "H.5627" },
    enacted: "July 31, 2026",
    signed: "August 6, 2026",
    conferees: people(
      [
        ["Will Brownsberger", "Belmont"],
        ["Pat Jehlen", "Somerville"],
        ["Ryan Fattman", "Sutton"],
      ],
      [
        ["Thomas Stanley", "Waltham"],
        ["Frank Moran", "Lawrence"],
        ["David DeCoste", "Norwell"],
      ],
    ),
  },
  {
    id: "childwelfare",
    name: "Child welfare",
    house: "H.4646",
    senate: "S.3121",
    sentToConference: "2026",
    // Event 5742, 8 July 2026, Room 437. Its notice names H4644 and S2659.
    firstMeeting: "July 8, 2026",
    reported: { on: "July 30, 2026", as: "H.5629" },
    enacted: "July 31, 2026",
    signed: "August 6, 2026",
    conferees: people(
      [
        ["Jo Comerford", "Northampton"],
        ["Robyn Kennedy", "Worcester"],
        ["Patrick O'Connor", "Weymouth"],
      ],
      [
        ["Jay Livingstone", "Boston"],
        ["Judith Garcia", "Chelsea"],
        ["Alyson Sullivan-Almeida", "Abington"],
      ],
    ),
  },
  {
    id: "immigrant",
    name: "Immigrant protection",
    house: "H.5316",
    senate: "S.3086",
    sentToConference: "2026",
    // Event 5702, 27 May 2026, Room 210, and again 3 June as 5711.
    firstMeeting: "May 27, 2026",
    reported: { on: "July 29, 2026", as: "H.5620" },
    enacted: "July 30, 2026",
    signed: "August 5, 2026",
    conferees: people(
      [
        ["Cindy Friedman", "Arlington"],
        ["Pavel Payano", "Lawrence"],
        ["Ryan Fattman", "Sutton"],
      ],
      [
        ["Dan Cahill", "Lynn"],
        ["Andres Vargas", "Haverhill"],
        ["Marcus Vaughn", "Wrentham"],
      ],
    ),
  },
  {
    id: "budget27",
    name: "Fiscal 2027 annual state budget",
    house: "H.5501",
    senate: "S.3100",
    sentToConference: "2026",
    // Events 5706 and 5736, 3 and 30 June 2026, Room 212.
    firstMeeting: "June 3, 2026",
    // Reported 1 July; the conference's last meeting was 30 June.
    reported: { on: "July 1, 2026", as: "H.5555" },
    enacted: "July 1, 2026",
    signed: "July 9, 2026",
    conferees: people(
      [
        ["Michael Rodrigues", "Westport"],
        ["Jo Comerford", "Northampton"],
        ["Patrick O'Connor", "Weymouth"],
      ],
      [
        ["Aaron Michlewitz", "Boston"],
        ["Kip Diggs", "Cotuit"],
        ["Todd Smola", "Warren"],
      ],
    ),
  },
  {
    id: "literacy",
    name: "Early literacy",
    house: "H.4683",
    senate: "S.2940",
    sentToConference: "2026",
    // Room A-1. Event 5725, the day before it reported, is a press conference rather than a meeting.
    firstMeeting: "June 16, 2026",
    reported: { on: "June 17, 2026", as: "H.5511" },
    enacted: "June 18, 2026",
    signed: "June 26, 2026",
    conferees: people(
      [
        ["Sal DiDomenico", "Everett"],
        ["Jason Lewis", "Winchester"],
        ["Patrick O'Connor", "Weymouth"],
      ],
      [
        ["Ken Gordon", "Bedford"],
        ["Simon Cataldo", "Concord"],
        ["John Marsi", "Dudley"],
      ],
    ),
  },
  {
    id: "surtax",
    name: "Surtax surplus supplemental",
    house: "H.5280",
    senate: "S.3054",
    sentToConference: "2026",
    // Room 243.
    firstMeeting: "June 2, 2026",
    reported: { on: "June 2, 2026", as: "H.5470" },
    enacted: "June 4, 2026",
    signed: "June 12, 2026",
    conferees: people(
      [
        ["Michael Rodrigues", "Westport"],
        ["Jo Comerford", "Northampton"],
        ["Patrick O'Connor", "Weymouth"],
      ],
      [
        ["Aaron Michlewitz", "Boston"],
        ["Kip Diggs", "Cotuit"],
        ["Ken Sweezey", "Duxbury"],
      ],
    ),
  },
  {
    id: "cannabis",
    name: "Cannabis overhaul",
    house: "H.4206",
    senate: "S.2749",
    // The House non-concurred and appointed on 24 December 2025; the
    // Senate concurred on the 31st. The only conference here that
    // crosses a calendar year.
    sentToConference: "December 24, 2025",
    // Room B-1. Its second meeting, 6 April at the UMass Center in Springfield, was called to formalise the agreement and is the only one held outside the State House.
    firstMeeting: "January 14, 2026",
    reported: { on: "April 6, 2026", as: "H.5350" },
    enacted: "April 9, 2026",
    signed: "April 19, 2026",
    conferees: people(
      [
        ["Adam Gomez", "Springfield"],
        ["Jo Comerford", "Northampton"],
        ["Peter Durant", "Spencer"],
      ],
      [
        ["Daniel Donahue", "Worcester"],
        ["Carlos González", "Springfield"],
        ["Michael Soter", "Bellingham"],
      ],
    ),
  },
];

/**
 * Each bill's real title, from the legislature's own document API rather than
 * from reporting. The two chambers usually word the same proposal differently,
 * and the difference is often the first thing worth reading: "An Act relative
 * to energy affordability, clean power and economic competitiveness" against
 * "An Act to save people money, repair the climate and grow the economy" is two
 * chambers describing one bill.
 */
export const BILL_TITLES: Record<string, string> = {
  "H.4361": "An Act relative to benefits for teachers",
  "H.4767":
    "An Act requiring health care employers to develop and implement programs to prevent workplace violence",
  "H.4769":
    "An Act to build resilient infrastructure to generate higher-ed transformation",
  "H.5175":
    "An Act relative to energy affordability, clean power and economic competitiveness",
  "H.5366":
    "An Act promoting safe technology use and distraction-free education for youth",
  "H.5469":
    "An Act promoting transparency and public access in state government",
  "H.5479": "An Act establishing the Massachusetts consumer data privacy act",
  "H.5518": "An Act to build resilience for Massachusetts communities",
  "H.5558":
    "An Act improving campaign finance reporting for statewide ballot questions",
  "H.5576": "An Act relative to economic development in the commonwealth",
  "H.5589": "An Act promoting pet equity, treatment and safety",
  "H.5630":
    "An Act strengthening primary care and advancing health care affordability",
  "S.2581": "An Act to promote student learning and mental health",
  "S.2619": "An Act establishing the Massachusetts data privacy act",
  "S.2916":
    "An Act improving campaign finance reporting for statewide ballot questions",
  "S.2993":
    "An Act to build resilient infrastructure to generate higher-ed transformation",
  "S.3028": "An Act promoting pet equity, treatment and safety",
  "S.3064": "An Act to build resilience for Massachusetts communities",
  "S.3109": "An Act relative to benefits for teachers",
  "S.3141": "An Act relative to primary care for you",
  "S.3166":
    "An Act to save people money, repair the climate and grow the economy",
  "S.3184":
    "An Act requiring health care employers to develop and implement programs to prevent workplace violence",
  "S.3228": "An Act relative to economic development in the commonwealth",
  "S.3244":
    "An Act promoting transparency and public access in state government",
};

export const ALL = [...ACTIVE, ...COMPLETED];

/** "H.5630" as it appears in a URL. */
export const slugFor = (billNumber: string) =>
  billNumber.replace(".", "").toLowerCase();

/**
 * The committee a bill is in, and which chamber's text it is.
 *
 * A bill in conference cannot be understood alone: the whole reason it is here
 * is that another chamber passed something different. So a lookup returns the
 * pair, not the bill.
 */
export function findBill(slug: string) {
  for (const c of ALL) {
    for (const [side, number] of [
      ["House", c.house],
      ["Senate", c.senate],
    ] as const) {
      if (slugFor(number) === slug) {
        const counterpart = side === "House" ? c.senate : c.house;
        return {
          committee: c,
          side,
          number,
          counterpart,
          title: BILL_TITLES[number] ?? "",
          counterpartTitle: BILL_TITLES[counterpart] ?? "",
        };
      }
    }
  }
  return null;
}

/**
 * The bill explorer's slugs, against the scorecard's records.
 *
 * The two disagree on numbers for five of the twelve, because a bill is
 * reprinted under a new number every time its text changes and each source
 * caught it at a different printing. They are the same proposals: H.5151 and
 * H.5175 are both "An Act relative to energy affordability, clean power and
 * economic competitiveness", and S.3166 and S.3143 are both "An Act to save
 * people money, repair the climate and grow the economy".
 *
 * The printing named in the journal's non-concurrence and the conference
 * appointment wins, which is the document actually in conference, and the
 * conference meeting notices corroborate it. That is how energy came to be
 * H.5175 here rather than the scorecard's H.5151.
 */
export const RECORD_FOR_SLUG: Record<string, string> = {
  "phone-free-schools": "phones",
  "workplace-violence": "workplace",
  "data-privacy": "privacy",
  "public-records": "records",
  "ballot-question-finance": "ballotfinance",
  "bright-act": "bright",
  "mass-ready": "massready",
  "energy-affordability": "energy",
  "pets-act": "pets",
  "economic-development": "ecdev",
  "teacher-benefits": "pension",
  "primary-care": "primarycare",
};

/** The scorecard record behind an explorer slug, where there is one. */
export const recordForSlug = (slug: string) =>
  ACTIVE.find((c) => c.id === RECORD_FOR_SLUG[slug]);

/**
 * A committee's name, capitalised.
 *
 * Only touches a word that starts lowercase, so "PETS Act" and "BRIGHT Act"
 * keep their capitals rather than becoming "Pets Act" and "Bright Act".
 */
const capitalise = (short: string) =>
  short.replace(/\b[a-z]/g, (ch) => ch.toUpperCase());

/**
 * A shorter name than the explorer's, where one reads better.
 *
 * Kept here rather than edited into the explorer data, which is the source of
 * truth for the comparison and should stay as it was ported.
 */
const NAME: Record<string, string> = {
  "workplace-violence": "Health Worker Safety",
};

/**
 * The one name the index, the rail and the heading all use.
 *
 * Here rather than in the page, because a reader who picks a committee off the
 * index and lands on its page should find the name they pressed.
 */
export const displayName = (slug: string, short: string) =>
  NAME[slug] ?? capitalise(short);

/**
 * Committees the lists show but do not open.
 *
 * Listed, because leaving one out would say the conference does not exist. Not
 * a link, because the page behind it is not ready to be read. Shared by the
 * index and the detail page's rail, so the two cannot disagree about what
 * opens.
 */
export const NOT_LINKED = new Set<string>([]);

/**
 * What kind of bill a conference is reconciling.
 *
 * Read off the texts rather than assumed: a bond bill is one that carries the
 * authorization formula, "the state treasurer shall ... issue and sell bonds of
 * the commonwealth", together with a schedule of line items keyed by account
 * number. Three of the twelve do, and all three also amend the General Laws in
 * their outside sections, so the label says which kind of bill it is rather
 * than claiming it is only that.
 *
 * It matters to a reader because the two kinds differ in what a conference can
 * even disagree about: a policy bill parts over rules, a bond bill over amounts
 * and over which local projects are named.
 */
/**
 * MAPLE's own subject tags for the bills in each conference.
 *
 * Read off the bill pages and written down here, because they are served from
 * MAPLE's Firestore and this prototype has no access to it. The union of both
 * chambers' tags, in the order they were first met and with duplicates
 * dropped: the two texts are the same question, so a tag on either is a tag on
 * the conference.
 *
 * One conference has no tags on either bill and is absent here rather than
 * carrying an empty list: economic development. One half of a pair having none
 * is normal, H.4361 is an example, and the other half carries the
 * conference.
 */
export const COMMITTEE_TOPICS: Record<string, string[]> = {
  "workplace-violence": [
    "Healthcare workforce",
    "Health care costs",
    "Worker safety and health",
    "Employee leave",
    "Assault and harassment offenses",
  ],
  "phone-free-schools": [
    "Elementary and secondary education",
    "Mental health",
    "Curriculum and standards",
    "Internet, web applications, social media",
  ],
  "data-privacy": [
    "Internet, web applications, social media",
    "Government information and archives",
  ],
  "public-records": [
    "Budget process",
    "Government studies and investigations",
    "Government information and archives",
  ],
  "ballot-question-finance": [
    "Government information and archives",
    "Government studies and investigations",
    "Lobbying and campaign finance",
  ],
  "energy-affordability": [
    "Public utilities and utility rates",
    "Energy efficiency and conservation",
    "Renewable energy sources",
  ],
  "pets-act": [
    "Crimes against animals and natural resources",
    "Housing discrimination",
    "Housing supply and affordability",
    "Homelessness and emergency shelter",
  ],
  "teacher-benefits": [
    "Employee benefits",
    "Employee pensions",
    "Pension and retirement benefits",
    "Teachers and educators",
  ],
  "primary-care": [
    "Health facilities and institutions",
    "Mental health",
    "Health insurance and coverage",
    "Health care costs",
    "Healthcare workforce",
  ],
  "bright-act": [
    "Housing supply and affordability",
    "Educational facilities and institutions",
    "Energy efficiency and conservation",
    "Higher education",
  ],
  "economic-development": [
    "Government information and archives",
    "Transportation safety",
    "Housing supply and affordability",
    "Internet, web applications, social media",
    "Employee pensions",
    "Juvenile crime and gang violence",
    "Labor-management relations",
    "Income tax credits",
  ],
  "mass-ready": [
    "Pollution control and abatement",
    "Water quality",
    "Environmental assessment, monitoring, research",
    "Forests, forestry, trees",
    "Public parks",
  ],
};

const BOND = new Set(["bright-act", "economic-development", "mass-ready"]);

export type BillKind = "policy" | "bond";

export const billKind = (slug: string): BillKind =>
  BOND.has(slug) ? "bond" : "policy";

export const BILL_KIND_LABEL: Record<BillKind, string> = {
  policy: "Policy bill",
  bond: "Bond bill",
};
