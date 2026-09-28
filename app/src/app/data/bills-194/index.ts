// Every bill currently before a conference committee, from the legislature.
//
// Fetched from malegislature.gov's own document API rather than transcribed:
//
//   /api/GeneralCourts/194/Documents/{number}
//   /api/GeneralCourts/194/Documents/{number}/DocumentHistoryActions
//
// so the titles, sponsors, cosponsors and action history are the record itself.
// Nothing here is written for the prototype. Where a field is null or empty,
// that is what the legislature publishes, and the page says so rather than
// filling the gap.
//
// Two things the API makes plain that a bill page has to handle honestly:
//
//   `kind` is often "Amendment" rather than "Bill". A chamber frequently takes
//   the other chamber's bill and replaces its text wholesale, so the document
//   a reader lands on may be an amendment carrying an entire proposal. The
//   Pinslip is where that is stated, and it is the only place it is stated.
//
//   A redrafted document inherits almost no history. H.5630 has two actions
//   where S.3141 has twenty, because the twenty belong to the bill it came out
//   of. A page that shows only its own document's history will look like
//   nothing happened.

export interface BillAction {
  date: string;
  branch: string;
  action: string;
}

export interface BillRecord {
  number: string;
  title: string;
  /** "Bill" or "Amendment", as the legislature classifies the document. */
  kind: string;
  /** The legislature's own one-line note on what the document is. */
  pinslip: string | null;
  sponsor: string | null;
  cosponsors: string[];
  /** Characters of bill text on file. Zero means none is published. */
  textLength: number;
  /**
   * MAPLE's plain-language summary, generated from the bill text.
   *
   * Null on every bill here, because none has been generated yet. The
   * legislature publishes no plain-language summary of a bill, so there is
   * nothing to fall back on and nothing to check one against: this field is
   * either MAPLE's work or it is empty, and it should never be quietly filled
   * with the Pinslip, which is the legislature's own note about what the
   * document is rather than what it would do.
   */
  summary?: string | null;
  /**
   * Which document the summary was written from.
   *
   * Usually the bill itself. Where a document is a redraft with no summary of
   * its own, the summary comes from the bill it came out of, traced through the
   * Pinslip, and this names it. The page has to say so: a summary of the Senate
   * bill shown on a House amendment of it is close, but it is not the same
   * text, and a reader deserves to know which one they are reading.
   *
   * Only the Pinslip chain is followed. Firestore's `similar` field is related
   * bills rather than lineage, and following it walked H.5630 to a community
   * preservation surcharge and H.4769 to broadband.
   */
  summarySource?: string | null;
  /**
   * MAPLE's own subject tags, each a category and a topic within it. Ten of
   * these twenty-four have none: they are the hollow amendment documents, and
   * MAPLE tags the bill they came out of instead.
   */
  topics?: { category: string; topic: string }[];
  history: BillAction[];
}

export const BILLS: Record<string, BillRecord> = {
  "H.5630": {
    number: "H.5630",
    summary:
      "The bill would set a target for how much of Massachusetts health care spending goes to primary care: 9 per cent by 2030, 12 per cent by 2033 and 15 per cent from 2036. The Health Policy Commission would administer the target and report progress annually from 2028, though the bill does not require that it be met. Insurers and the state employee plan would have to offer primary care providers a new payment model, which providers could choose to join and which is meant to reduce prior authorization and patient cost-sharing. The bill also creates a capital fund for community hospitals serving mostly public-payer patients.",
    summarySource: "H.5630",
    title:
      "An Act strengthening primary care and advancing health care affordability",
    kind: "Amendment",
    pinslip:
      "Text of House document No. 5618, being House amendments of the Senate Bill relative to primary care for you (Senate bill No. 3141), as amended by the House.  July 30, 2026.",
    sponsor: null,
    cosponsors: ["Francisco E. Paulino"],
    textLength: 143976,
    history: [
      {
        date: "2026-07-30",
        branch: "House",
        action: "H5618, published as amended",
      },
      { date: "2026-07-30", branch: "House", action: "See S3141" },
    ],
  },
  "S.3141": {
    topics: [
      { category: "Healthcare", topic: "Health facilities and institutions" },
      { category: "Healthcare", topic: "Mental health" },
      { category: "Healthcare", topic: "Health insurance and coverage" },
      { category: "Healthcare", topic: "Health care costs" },
      { category: "Healthcare", topic: "Healthcare workforce" },
    ],
    number: "S.3141",
    summary:
      "The bill aims to enhance primary care services by establishing specific expenditure targets for primary care within the overall health care budget. It introduces a new payment model that encourages providers to deliver comprehensive and accessible care while ensuring that spending on primary care does not lead to increased overall health care costs. Additionally, it mandates the creation of a dedicated office to oversee primary care policy and payment, which will work on improving access and integration of services, including behavioral health. The bill also emphasizes the importance of independent primary care practices and sets guidelines for monitoring and reporting on primary care expenditures.",
    summarySource: "S.3141",
    title: "An Act relative to primary care for you",
    kind: "Bill",
    pinslip:
      "Senate, June 18, 2016 -- Text of the Senate Bill relative to primary care for you (Senate, No. 3141) (being the text of Senate, No. 3116, printed as amended)",
    sponsor: null,
    cosponsors: [
      "Cindy F. Friedman",
      "Rebecca L. Rausch",
      "Joanne M. Comerford",
      "Mike Connolly",
      "James B. Eldridge",
      "Adam J. Scanlon",
      "Julian Cyr",
      "Michael D. Brady",
      "Margaret R. Scarsdale",
      "Pavel M. Payano",
      "Jason M. Lewis",
      "John F. Keenan",
      "William J. Driscoll, Jr.",
      "Jacob R. Oliveira",
    ],
    textLength: 71829,
    history: [
      {
        date: "2026-06-18",
        branch: "Senate",
        action: "S3116, reprinted as amended",
      },
      {
        date: "2026-06-18",
        branch: "Senate",
        action:
          "Passed to be engrossed -see Roll Call #197 (Yeas 35 to Nays 4)",
      },
      {
        date: "2026-06-24",
        branch: "House",
        action: "Read; and referred to the committee on House Ways and Means",
      },
      {
        date: "2026-07-30",
        branch: "House",
        action:
          "Committee recommended ought to pass with an amendment, striking out all after the enacting clause and inserting the text of H5618, and referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-07-30",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting with the amendment pending",
      },
      { date: "2026-07-30", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-30",
        branch: "House",
        action:
          "Read second, amended (as recommended by the committee on House Ways and Means)",
      },
      {
        date: "2026-07-30",
        branch: "House",
        action: "Ordered to a third reading",
      },
      { date: "2026-07-30", branch: "House", action: "Rules suspended" },
      { date: "2026-07-30", branch: "House", action: "Read third" },
      { date: "2026-07-30", branch: "House", action: "Amendment 110 adopted" },
      {
        date: "2026-07-30",
        branch: "House",
        action: "Amendment 3 adopted, as changed",
      },
      {
        date: "2026-07-30",
        branch: "House",
        action:
          "Consolidated amendment A adopted - 158 YEAS to 0 NAYS (See YEA and NAY No. 252)",
      },
      {
        date: "2026-07-30",
        branch: "House",
        action: "Text of H5618, published as H5630",
      },
      {
        date: "2026-07-30",
        branch: "House",
        action:
          "Passed to be engrossed - 158 YEAS to 0 NAYS (See YEA and NAY No. 253)",
      },
      { date: "2026-07-31", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-07-31",
        branch: "Senate",
        action: "Senate NON-concurred in the House amendment",
      },
      {
        date: "2026-07-31",
        branch: "Senate",
        action: "Committee of conference appointed (Friedman-Cronin-Tarr)",
      },
      {
        date: "2026-07-31",
        branch: "House",
        action: "House insisted on its amendment",
      },
      {
        date: "2026-07-31",
        branch: "House",
        action:
          "Committee of conference appointed - (Michlewitz-Kilcoyne-Kane), in concurrence",
      },
    ],
  },
  "H.5469": {
    topics: [
      { category: "Economics and Public Finance", topic: "Budget process" },
      {
        category: "Government Operations and Elections",
        topic: "Government studies and investigations",
      },
      {
        category: "Government Operations and Elections",
        topic: "Government information and archives",
      },
    ],
    number: "H.5469",
    summary:
      "The bill aims to enhance transparency and public access to government records by establishing clearer guidelines for how residents can request and obtain legislative documents. It proposes the appointment of records access officers to assist the public in navigating these requests and mandates timely responses to inquiries. Additionally, the bill outlines the responsibilities of government entities in managing and disclosing records, ensuring that the public can better understand government operations and decisions. Funding is allocated to support the implementation of these measures, including technology and personnel costs.",
    summarySource: "H.5469",
    title:
      "An Act promoting transparency and public access in state government",
    kind: "Bill",
    pinslip: null,
    sponsor: "House Committee on Ways and Means",
    cosponsors: [],
    textLength: 0,
    history: [
      {
        date: "2026-06-03",
        branch: "House",
        action: "Reported by the committee on House Ways and Means",
      },
      {
        date: "2026-06-03",
        branch: "House",
        action: "Reported on a part of H5050",
      },
      {
        date: "2026-06-03",
        branch: "House",
        action:
          "Committee recommended ought to pass and referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-06-03",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting",
      },
      { date: "2026-06-03", branch: "House", action: "Rules suspended" },
      {
        date: "2026-06-03",
        branch: "House",
        action: "Read second and ordered to a third reading",
      },
      { date: "2026-06-03", branch: "House", action: "Rules suspended" },
      { date: "2026-06-03", branch: "House", action: "Read third" },
      {
        date: "2026-06-03",
        branch: "House",
        action:
          "Passed to be engrossed - 125 YEAS to 28 NAYS (See YEA and NAY No. 201)",
      },
      {
        date: "2026-07-06",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendment striking out all after the enacting clause and inserting in place thereof the text of S3200",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Order relative to subject matter adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Placed in the Orders of the Day for Thursday, July 30, 2026",
      },
      { date: "2026-07-30", branch: "Senate", action: "Read second " },
      {
        date: "2026-07-30",
        branch: "Senate",
        action:
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S3200",
      },
      {
        date: "2026-07-30",
        branch: "Senate",
        action: "Reprinted, as amended, see S3244",
      },
      {
        date: "2026-07-30",
        branch: "Senate",
        action: "Ordered to a third reading",
      },
      { date: "2026-07-30", branch: "Senate", action: "Read third" },
      {
        date: "2026-07-30",
        branch: "Senate",
        action:
          "Passed to be engrossed -see Roll Call #217 (Yeas 34 to Nays 6)",
      },
      { date: "2026-07-31", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-31",
        branch: "House",
        action: "House NON-concurred in the Senate amendment",
      },
      {
        date: "2026-07-31",
        branch: "House",
        action: "Committee of conference appointed - (Peisch-Vargas-Muradian)",
      },
      { date: "2026-07-31", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-07-31",
        branch: "Senate",
        action: "Senate insisted on its amendment",
      },
      {
        date: "2026-07-31",
        branch: "Senate",
        action:
          "Committee of conference appointed (Creem-Friedman-Dooner), in concurrence",
      },
    ],
  },
  "S.3244": {
    number: "S.3244",
    summary:
      "The bill would make records of the Legislature subject to the public records law for the first time, defining a category of legislative record that includes bills, amendments, committee hearing notices and attendance, written testimony, committee votes, committee reports, session calendars and chamber journals. The governor's office and each branch would designate records access officers to handle requests. The bill also creates a shield protecting journalists from being compelled to disclose sources or unpublished material. It would take effect in January 2027 and apply only to records created from that point forward.",
    summarySource: "S.3244",
    title:
      "An Act promoting transparency and public access in state government",
    kind: "Amendment",
    pinslip:
      "Senate, July 30, 2026 -- Text of the Senate amendment to the House Bill promoting transparency and public access in state government (House, No. 5469)",
    sponsor: null,
    cosponsors: [],
    textLength: 22221,
    history: [
      {
        date: "2026-07-30",
        branch: "Senate",
        action: "Text of S3200, reprinted as amended",
      },
      { date: "2026-07-30", branch: "Senate", action: "See H5469" },
    ],
  },
  "H.5576": {
    number: "H.5576",
    title: "An Act relative to economic development in the commonwealth",
    kind: "Bill",
    pinslip:
      "House bill No. 5562, amended and passed to be engrossed by the House. July 8, 2026.",
    sponsor: null,
    cosponsors: ["Maura T. Healey"],
    textLength: 0,
    history: [
      {
        date: "2026-07-08",
        branch: "House",
        action: "H5562, published as amended",
      },
      {
        date: "2026-07-08",
        branch: "House",
        action:
          "Passed to be engrossed - 148 YEAS to 2 NAYS (See YEA and NAY No. 231)",
      },
      {
        date: "2026-07-13",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      {
        date: "2026-07-16",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendment striking out all after the enacting clause and inserting in place thereof the text of S3178",
      },
      {
        date: "2026-07-16",
        branch: "Senate",
        action: "Order relative to subject matter adopted",
      },
      {
        date: "2026-07-16",
        branch: "Senate",
        action: "Placed in the Orders of the Day for Wednesday, July 22, 2026",
      },
      { date: "2026-07-22", branch: "Senate", action: "Read second" },
      {
        date: "2026-07-24",
        branch: "Senate",
        action:
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S3178",
      },
      {
        date: "2026-07-24",
        branch: "Senate",
        action: "Reprinted, as amended, see S3228",
      },
      {
        date: "2026-07-24",
        branch: "Senate",
        action: "Ordered to a third reading ",
      },
      {
        date: "2026-07-24",
        branch: "Senate",
        action: "Read third and passed to be engrossed ",
      },
      { date: "2026-07-30", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-30",
        branch: "House",
        action: "House NON-concurred in the Senate amendment",
      },
      {
        date: "2026-07-30",
        branch: "House",
        action: "Committee of conference appointed - (Michlewitz-Fiola-Soter)",
      },
      { date: "2026-07-30", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-07-30",
        branch: "Senate",
        action: "Senate insisted on its amendment",
      },
      {
        date: "2026-07-30",
        branch: "Senate",
        action:
          "Committee of conference appointed (Finegold-Rodrigues-Durant), in concurrence",
      },
    ],
  },
  "S.3228": {
    number: "S.3228",
    summary:
      "The bill authorizes more than $325 million in borrowing for economic development, directed toward housing production, life sciences, climate technology, advanced manufacturing, robotics and downtown revitalization. It creates and extends a range of tax credits aimed at small businesses, tourism and job creation, and funds programs supporting artificial intelligence applications in sectors the state has identified as strategic. Separately, it would regulate developers of the largest artificial intelligence models, requiring those with revenues above $500 million to account for catastrophic risks. It is the session's broad economic development package.",
    summarySource: "S.3228",
    title: "An Act relative to economic development in the commonwealth",
    kind: "Amendment",
    pinslip:
      "Senate, July 24, 2026 -- Text of the Senate amendment to the House Bill relative to economic development in the commonwealth (House, No. 5576) (being the text of Senate document numbered 3178, printed as amended)",
    sponsor: null,
    cosponsors: [],
    textLength: 601838,
    history: [
      {
        date: "2026-07-24",
        branch: "Senate",
        action: "Text of S3178, reprinted as amended",
      },
      { date: "2026-07-24", branch: "Senate", action: "See H5576" },
    ],
  },
  "H.5589": {
    number: "H.5589",
    summary:
      "The bill would change how pets are treated in Massachusetts law across several areas. Courts deciding animal neglect cases could order outcomes based on the animal's best interests, including forfeiture or placement. Public housing would no longer be able to ban pets outright, discriminate by breed, size or appearance, require declawing as a condition of keeping a pet, or evict a tenant solely for having one. The bill also sets requirements for pet insurance policies, including how preexisting conditions are defined and disclosed, and addresses veterinary practice and microchipping.",
    summarySource: "H.5589",
    title: "An Act promoting pet equity, treatment and safety",
    kind: "Amendment",
    pinslip:
      "House bill No. 5581, as changed by the committee on Bills in the Third Reading, and as amended and passed to be engrossed by the House. July 15, 2026.",
    sponsor: null,
    cosponsors: [],
    textLength: 51714,
    history: [
      {
        date: "2026-07-15",
        branch: "House",
        action: "H5581, published as amended",
      },
      { date: "2026-07-15", branch: "House", action: "See S3028" },
    ],
  },
  "S.3028": {
    topics: [
      {
        category: "Crime and Law Enforcement",
        topic: "Crimes against animals and natural resources",
      },
      {
        category: "Housing and Community Development",
        topic: "Housing discrimination",
      },
      {
        category: "Housing and Community Development",
        topic: "Housing supply and affordability",
      },
      {
        category: "Housing and Community Development",
        topic: "Homelessness and emergency shelter",
      },
    ],
    number: "S.3028",
    summary:
      "The bill aims to enhance the welfare and treatment of pets, particularly in public housing, by allowing residents to keep pets under specific conditions, such as requiring a pet deposit and ensuring proper care. It prohibits discrimination against pets based on breed or appearance and establishes guidelines for the humane treatment of animals, including penalties for cruelty. Additionally, it seeks to create a fund to support the vaccination and spaying/neutering of homeless animals and to regulate pet shops to prevent the sale of dogs and cats, promoting adoption instead. The bill also mandates a study on the impact of pet-related fees on housing access for pet owners.",
    summarySource: "S.3028",
    title: "An Act promoting pet equity, treatment and safety",
    kind: "Bill",
    pinslip:
      "Senate, March 19, 2026 -- Text of the Senate Bill promoting pet equity, treatment and safety (Senate, No. 3028) (being the text of the Senate, No. 3014, printed as amended)",
    sponsor: null,
    cosponsors: [
      "Patrick M. O'Connor",
      "Jason M. Lewis",
      "Michael O. Moore",
      "Michael D. Brady",
      "Marcus S. Vaughn",
      "James K. Hawkins",
      "Manny Cruz",
      "John C. Velis",
      "John F. Keenan",
      "Vanna Howard",
      "Bruce E. Tarr",
      "Adam J. Scanlon",
      "Adam Gómez",
      "Paul W. Mark",
      "Patricia D. Jehlen",
      "John J. Cronin",
      "Robyn K. Kennedy",
      "Joanne M. Comerford",
      "Bruce J. Ayers",
      "Kathleen R. LaNatra",
      "Steven S. Howitt",
      "Bradley H. Jones, Jr.",
      "Paul K. Frost",
      "David F. DeCoste",
      "Ryan C. Fattman",
      "Pavel M. Payano",
      "William J. Driscoll, Jr.",
      "Dylan A. Fernandes",
      "James B. Eldridge",
      "Angelo J. Puppolo, Jr.",
    ],
    textLength: 19780,
    history: [
      {
        date: "2026-03-19",
        branch: "Senate",
        action: "S3014, reprinted as amended",
      },
      {
        date: "2026-03-19",
        branch: "Senate",
        action:
          "Passed to be engrossed -see Roll Call #142 (Yeas 38 to Nays 0)",
      },
      {
        date: "2026-03-23",
        branch: "House",
        action: "Read; and referred to the committee on House Ways and Means",
      },
      {
        date: "2026-07-15",
        branch: "House",
        action:
          "Committee recommended ought to pass with an amendment, striking out all after the enacting clause and inserting the text of H5581, and referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-07-15",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting with the amendment pending",
      },
      { date: "2026-07-15", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-15",
        branch: "House",
        action:
          "Read second, amended (as recommended by the committee on House Ways and Means)",
      },
      {
        date: "2026-07-15",
        branch: "House",
        action: "Ordered to a third reading",
      },
      { date: "2026-07-15", branch: "House", action: "Rules suspended" },
      { date: "2026-07-15", branch: "House", action: "Read third" },
      { date: "2026-07-15", branch: "House", action: "Amendment 13 rejected" },
      { date: "2026-07-15", branch: "House", action: "Amendment 21 rejected" },
      {
        date: "2026-07-15",
        branch: "House",
        action: "Amendment 18 adopted, as changed",
      },
      {
        date: "2026-07-15",
        branch: "House",
        action: "Amendment 22 adopted, as changed",
      },
      {
        date: "2026-07-15",
        branch: "House",
        action: "Amendment 23 adopted, as changed",
      },
      {
        date: "2026-07-15",
        branch: "House",
        action: "Text of H5581 amended, published as H5589",
      },
      {
        date: "2026-07-15",
        branch: "House",
        action:
          "Passed to be engrossed - 151 YEAS to 1 NAYS (See YEA and NAY No. 233)\r\n",
      },
      { date: "2026-07-27", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-07-27",
        branch: "Senate",
        action: "Senate NON-concurred in the House amendment",
      },
      {
        date: "2026-07-27",
        branch: "Senate",
        action: "Committee of conference appointed (Feeney-Lewis-Tarr)",
      },
      {
        date: "2026-07-29",
        branch: "House",
        action: "House insisted on its amendment",
      },
      {
        date: "2026-07-29",
        branch: "House",
        action:
          "Committee of conference appointed - (O'Day-Lewis-Howitt), in concurrence",
      },
    ],
  },
  "H.4767": {
    number: "H.4767",
    title:
      "An Act requiring health care employers to develop and implement programs to prevent workplace violence",
    kind: "Bill",
    pinslip: null,
    sponsor: "House Committee on Ways and Means",
    cosponsors: [
      "Francisco E. Paulino",
      "John J. Lawn, Jr.",
      "John J. Mahoney",
      "Sean Reid",
      "Vanna Howard",
      "Mike Connolly",
      "Steven Owens",
      "Hannah Kane",
      "Mindy Domb",
      "Christopher Hendricks",
      "Angelo J. Puppolo, Jr.",
      "David Paul Linsky",
      "Lindsay N. Sabadosa",
      "James K. Hawkins",
      "Tram T. Nguyen",
      "Brian W. Murray",
      "Steven Ultrino",
      "William F. MacGregor",
      "Natalie M. Blais",
      "Paul McMurtry",
      "Paul J. Donato",
      "Rodney M. Elliott",
      "Joseph W. McGonagle, Jr.",
      "Natalie M. Higgins",
      "Simon Cataldo",
      "Kathleen R. LaNatra",
      "Danillo A. Sena",
      "Sean Garballey",
      "Christine P. Barber",
      "Michael D. Brady",
      "Christopher M. Markey",
      "Estela A. Reyes",
      "Susannah M. Whipps",
      "Michelle L. Badger",
      "Colleen M. Garry",
      "Carole A. Fiola",
      "James C. Arena-DeRosa",
      "Margaret R. Scarsdale",
      "Paul R. Feeney",
      "Thomas M. Stanley",
      "Carmine Lawrence Gentile",
      "Erika Uyterhoeven",
      "Carlos González",
      "Priscila S. Sousa",
      "James Arciero",
      "Samantha Montaño",
      "Kevin G. Honan",
      "Manny Cruz",
      "Kimberly N. Ferguson",
      "Adrian C. Madaro",
      "Antonio F. D. Cabral",
      "Christopher J. Worrell",
      "Adrianne Pusateri Ramos",
      "Christopher Richard Flanagan",
      "Kristin E. Kassner",
      "Michael P. Kushmerek",
      "Bud L. Williams",
      "Joan B. Lovely",
      "Steven George Xiarhos",
      "Tackey Chan",
      "Bridget Plouffe",
      "Rita A. Mendes",
      "Marjorie C. Decker",
      "Jessica Ann Giannino",
      "Russell E. Holmes",
      "Dennis C. Gallagher",
      "Michelle M. DuBois",
      "David Henry Argosky LeBoeuf",
      "Jack Patrick Lewis",
      "Daniel J. Hunt",
    ],
    textLength: 0,
    history: [
      {
        date: "2025-11-18",
        branch: "House",
        action: "Reported from the committee on House Ways and Means",
      },
      {
        date: "2025-11-18",
        branch: "House",
        action: "Pending new draft of H2655",
      },
      { date: "2025-11-19", branch: "House", action: "New draft of H2655" },
      {
        date: "2025-11-19",
        branch: "House",
        action: "Ordered to a third reading",
      },
      { date: "2025-11-19", branch: "House", action: "Rules suspended" },
      { date: "2025-11-19", branch: "House", action: "Read third" },
      {
        date: "2025-11-19",
        branch: "House",
        action: "Amendment 1 adopted, as changed",
      },
      {
        date: "2025-11-19",
        branch: "House",
        action:
          "Passed to be engrossed - 158 YEAS to 0 NAYS (See YEA and NAY No. 114)",
      },
      {
        date: "2025-11-24",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      { date: "2026-07-09", branch: "Senate", action: "Also based on S1718" },
      {
        date: "2026-07-09",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendment striking out all after the enacting clause and inserting in place thereof the text of S3171",
      },
      {
        date: "2026-07-09",
        branch: "Senate",
        action: "Order relative to subject matter adopted",
      },
      {
        date: "2026-07-09",
        branch: "Senate",
        action: "Placed in the Orders of the Day for Thursday, July 16, 2026",
      },
      { date: "2026-07-16", branch: "Senate", action: "Read second" },
      {
        date: "2026-07-16",
        branch: "Senate",
        action:
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S3171",
      },
      {
        date: "2026-07-16",
        branch: "Senate",
        action: "Reprinted, as amended, see S3184",
      },
      {
        date: "2026-07-16",
        branch: "Senate",
        action: "Ordered to a third reading",
      },
      { date: "2026-07-16", branch: "Senate", action: "Read third" },
      {
        date: "2026-07-16",
        branch: "Senate",
        action: "Passed to be engrossed",
      },
      { date: "2026-07-23", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-23",
        branch: "House",
        action: "House NON-concurred in the Senate amendment",
      },
      {
        date: "2026-07-23",
        branch: "House",
        action: "Committee of conference appointed - (Day-Fluker-Reid-Kane)",
      },
      { date: "2026-07-23", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Senate insisted on its amendment",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action:
          "Committee of conference appointed (Friedman-Lovely-Dooner), in concurrence",
      },
    ],
  },
  "S.3184": {
    number: "S.3184",
    summary:
      "Health care employers would be required to assess the risk of violence in their workplaces and put prevention programs in place for staff. The bill increases penalties for assaulting a health care worker and extends existing protections for emergency medical technicians and ambulance staff to cover more situations. It also allows officers to arrest without a warrant in certain cases involving assaults on health care employees. The state would be required to report on implementation within a year of the law taking effect.",
    summarySource: "S.3184",
    title:
      "An Act requiring health care employers to develop and implement programs to prevent workplace violence",
    kind: "Amendment",
    pinslip:
      "Senate, July 16, 2026 -- Text of the Senate amendment to the House Bill requiring health care employers to develop and implement programs to prevent workplace violence (House, No. 4767, amended) (being the text of Senate document numbered 3171, printed as amended)",
    sponsor: null,
    cosponsors: [],
    textLength: 21986,
    history: [
      {
        date: "2026-07-16",
        branch: "Senate",
        action: "Text of S3171, reprinted as amended",
      },
      { date: "2026-07-16", branch: "Senate", action: "See H4767" },
    ],
  },
  "H.5558": {
    number: "H.5558",
    summary:
      "The bill aims to enhance transparency in campaign finance related to statewide ballot questions. It requires that signature collection forms for initiative or referendum petitions clearly indicate if they are being circulated by paid gatherers. Additionally, it prohibits compensation based on the number of signatures collected and imposes penalties for violations. The bill also mandates detailed reporting of contributions and expenditures by political committees involved in supporting or opposing ballot questions.",
    summarySource: "S.2916",
    title:
      "An Act improving campaign finance reporting for statewide ballot questions",
    kind: "Amendment",
    pinslip:
      "Text of House document No. 5549, being House amendments and committee on Bills in the Third Reading changes of the Senate Bill improving campaign finance reporting for statewide ballot questions (Senate bill No. 2916), as amended by the House.  July 1, 2026.",
    sponsor: null,
    cosponsors: [],
    textLength: 15260,
    history: [
      {
        date: "2026-07-01",
        branch: "House",
        action: "H5549, published as amendment",
      },
      { date: "2026-07-01", branch: "House", action: "See S2916" },
    ],
  },
  "S.2916": {
    topics: [
      {
        category: "Government Operations and Elections",
        topic: "Government information and archives",
      },
      {
        category: "Government Operations and Elections",
        topic: "Government studies and investigations",
      },
      {
        category: "Government Operations and Elections",
        topic: "Lobbying and campaign finance",
      },
    ],
    number: "S.2916",
    summary:
      "The bill aims to enhance transparency in campaign finance related to statewide ballot questions. It requires that signature collection forms for initiative or referendum petitions clearly indicate if they are being circulated by paid gatherers. Additionally, it prohibits compensation based on the number of signatures collected and imposes penalties for violations. The bill also mandates detailed reporting of contributions and expenditures by political committees involved in supporting or opposing ballot questions.",
    summarySource: "S.2916",
    title:
      "An Act improving campaign finance reporting for statewide ballot questions ",
    kind: "Bill",
    pinslip:
      "Senate, January 15, 2026 -- Text of the Senate Bill improving campaign finance reporting for statewide ballot questions (Senate, No. 2916) (being the text of Senate, No. 2898, printed as amended)",
    sponsor: null,
    cosponsors: [
      "Sal N. DiDomenico",
      "John F. Keenan",
      "Bruce E. Tarr",
      "Paul W. Mark",
      "James B. Eldridge",
      "Mike Connolly",
      "Joanne M. Comerford",
      "Bradley H. Jones, Jr.",
      "William J. Driscoll, Jr.",
      "Michael J. Barrett",
      "Pavel M. Payano",
    ],
    textLength: 6399,
    history: [
      {
        date: "2026-01-15",
        branch: "Senate",
        action: "Text of S2898, reprinted as amended",
      },
      {
        date: "2026-01-15",
        branch: "Senate",
        action:
          "Passed to be engrossed -see Roll Call #127 (Yeas 38 to Nays 0)",
      },
      {
        date: "2026-01-22",
        branch: "House",
        action: "Read; and referred to the committee on House Ways and Means",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action:
          "Committee recommended ought to pass with an amendment, striking out all after the enacting clause and inserting the text of H5549, and referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting with the amendment pending",
      },
      { date: "2026-07-01", branch: "House", action: "Rules suspended   " },
      {
        date: "2026-07-01",
        branch: "House",
        action:
          "Read second, amended (as recommended by the committee on House Ways and Means)",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action: "Ordered to a third reading",
      },
      { date: "2026-07-01", branch: "House", action: "Rules suspended" },
      { date: "2026-07-01", branch: "House", action: "Read third" },
      {
        date: "2026-07-01",
        branch: "House",
        action: "Amendment #7 adopted, as changed",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action: "Amendment #9 adopted, as changed",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action: "Text of H5549 amended, published as H5558",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action:
          "Passed to be engrossed -149 YEAS to 0 NAYS (See YEA and NAY No. 222)\r\n",
      },
      { date: "2026-07-20", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-07-20",
        branch: "Senate",
        action: "Senate NON-concurred in the House amendment",
      },
      {
        date: "2026-07-20",
        branch: "Senate",
        action:
          "Committee of conference appointed (DiDomenico-Oliveira-Fattman)",
      },
      {
        date: "2026-07-23",
        branch: "House",
        action: "House insisted on its amendment",
      },
      {
        date: "2026-07-23",
        branch: "House",
        action:
          "Committee of conference appointed - (Hunt-Peisch-Frost), in concurrence",
      },
    ],
  },
  "H.5151": {
    topics: [
      { category: "Energy", topic: "Renewable energy sources" },
      { category: "Energy", topic: "Energy efficiency and conservation" },
    ],
    number: "H.5151",
    summary:
      "The bill aims to enhance energy affordability and promote clean energy initiatives. It proposes the creation of a public dashboard for residential energy bills, providing transparency on costs and benefits of clean energy programs. Additionally, it seeks to establish a statewide solar permitting platform to streamline the installation of solar energy systems and includes provisions for financial incentives for low-income customers. The bill also emphasizes the importance of workforce development and environmental justice in energy projects, ensuring that benefits are equitably distributed among residents.",
    summarySource: "H.5151",
    title:
      "An Act relative to energy affordability, clean power and economic competitiveness",
    kind: "Bill",
    pinslip: null,
    sponsor: "House Committee on Ways and Means",
    cosponsors: [
      "Mark J. Cusack",
      "Tackey Chan",
      "Daniel Cahill",
      "Jack Patrick Lewis",
      "Frank A. Moran",
      "Orlando Ramos",
      "David Allen Robertson",
      "Jeffrey N. Roy",
      "Steven Owens",
      "Danielle W. Gregoire",
      "Paul McMurtry",
      "Lindsay N. Sabadosa",
      "Mark D. Sylvia",
      "Chynah Tyler",
      "Carlos González",
      "William C. Galvin",
      "Kevin G. Honan",
      "Kathleen R. LaNatra",
      "Kenneth P. Sweezey",
      "Sean Reid",
      "Christopher Hendricks",
      "Samantha Montaño",
      "John R. Gaskey",
      "Patricia A. Duffy",
      "Adrianne Pusateri Ramos",
      "Shirley B. Arriaga",
      "Steven Ultrino",
      "David M. Rogers",
      "Estela A. Reyes",
      "Bud L. Williams",
      "Priscila S. Sousa",
      "Lisa Field",
      "Dennis C. Gallagher",
      "Michelle L. Badger",
      "Nick Collins",
      "Vanna Howard",
      "Patrick Joseph Kearney",
      "Steven George Xiarhos",
      "Bruce E. Tarr",
      "Bradley H. Jones, Jr.",
    ],
    textLength: 192825,
    history: [
      {
        date: "2026-02-25",
        branch: "House",
        action: "Reported from the committee on House Ways and Means",
      },
      {
        date: "2026-02-25",
        branch: "House",
        action: "Pending new draft of H4744",
      },
      { date: "2026-02-26", branch: "House", action: "New draft of H4744" },
      {
        date: "2026-02-26",
        branch: "House",
        action: "Ordered to a third reading",
      },
      { date: "2026-02-26", branch: "House", action: "Rules suspended" },
      { date: "2026-02-26", branch: "House", action: "Read third" },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Amendment 24 rejected - 26 YEAS to 128 NAYS (See YEA and NAY No. 126)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Amendment 13 rejected - 26 YEAS to 128 NAYS (See YEA and NAY No. 127)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Amendment 105 rejected - 25 YEAS to 130 NAYS (See YEA and NAY No. 128)",
      },
      { date: "2026-02-26", branch: "House", action: "Amendment 89 rejected" },
      { date: "2026-02-26", branch: "House", action: "Amendment 90 rejected" },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Consolidated amendment A adopted - 128 YEAS to 27 NAYS (See YEA and NAY No. 129)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Amendment 8 rejected - 25 YEAS to 130 NAYS (See YEA and NAY No. 130)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Amendment 21 rejected - 26 YEAS to 128 NAYS (See YEA and NAY No. 131)",
      },
      { date: "2026-02-26", branch: "House", action: "Amendment 22 rejected" },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Amendment 38 rejected - 25 YEAS to 130 NAYS (See YEA and NAY No. 132)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Consolidated amendment B adopted - 139 YEAS to 16 NAYS (See YEA and NAY No. 133)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Amendment 113 rejected - 17 YEAS to 138 NAYS (See YEA and NAY No. 134)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Amendment 7 rejected - 25 YEAS to 129 NAYS (See YEA and NAY No. 135)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Amendment 78 rejected - 26 YEAS to 130 NAYS (See YEA and NAY No. 136)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Amendment 46 rejected - 25 YEAS to 130 NAYS (See YEA and NAY No. 137)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Amendment 101 rejected - 25 YEAS to 130 NAYS (See YEA and NAY No. 138)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Amendment 109 rejected - 25 YEAS to 130 NAYS (See YEA and NAY No. 139)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Consolidated amendment C adopted - 121 YEAS to 26 NAYS (See YEA and NAY No. 140)",
      },
      {
        date: "2026-02-26",
        branch: "House",
        action: "Published as amended, see H5175",
      },
    ],
  },
  "S.3166": {
    number: "S.3166",
    summary:
      "The bill aims to lower energy costs for households while continuing the state's climate commitments. It would cap what competitive electricity suppliers can charge customers who receive a low-income discount rate, tying the price to the utility's own default rate. It directs regulators toward integrated energy planning, requiring gas infrastructure investments to be weighed against non-pipeline alternatives and aligning efficiency programs, climate compliance plans and utility incentives with that planning. The bill also addresses siting and permitting for clean energy projects, procurement, demand response and electric vehicle infrastructure.",
    summarySource: "S.3166",
    title:
      "An Act to save people money, repair the climate and grow the economy",
    kind: "Amendment",
    pinslip:
      "Senate, July 1, 2016 -- Text of the Senate amendment to the House Bill relative to energy affordability, clean power and economic competitiveness (House, No. 5175) (being the text of Senate document numbered 3143, printed as amended)",
    sponsor: null,
    cosponsors: [],
    textLength: 325880,
    history: [
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Text of S3143, reprinted as amended",
      },
      { date: "2026-07-01", branch: "Senate", action: "See H5175" },
    ],
  },
  "H.4361": {
    number: "H.4361",
    title: "An Act relative to benefits for teachers",
    kind: "Bill",
    pinslip: null,
    sponsor: "House Committee on Ways and Means",
    cosponsors: [
      "Alice Hanlon Peisch",
      "Rob Consalvo",
      "Dennis C. Gallagher",
      "Paul McMurtry",
      "Mark D. Sylvia",
      "Kimberly N. Ferguson",
      "David Paul Linsky",
      "Ryan C. Fattman",
      "William F. MacGregor",
      "Susannah M. Whipps",
      "Bradley H. Jones, Jr.",
      "Peter J. Durant",
      "Lindsay N. Sabadosa",
      "Meghan K. Kilcoyne",
      "Joan Meschino",
      "Richard M. Haggerty",
      "David T. Vieira",
      "Vanna Howard",
      "Sean Reid",
      "Christine P. Barber",
      "Michael D. Brady",
      "Christopher Richard Flanagan",
      "Rodney M. Elliott",
      "Danillo A. Sena",
      "Brian W. Murray",
      "Hannah Kane",
      "William C. Galvin",
      "Erika Uyterhoeven",
      "Jacob R. Oliveira",
      "Natalie M. Higgins",
      "Jennifer Balinsky Armini",
      "James K. Hawkins",
      "James C. Arena-DeRosa",
      "Patricia A. Duffy",
      "John J. Marsi",
      "Margaret R. Scarsdale",
      "Mike Connolly",
      "Paul R. Feeney",
      "Thomas M. Stanley",
      "Steven Owens",
      "Marjorie C. Decker",
      "Christopher Hendricks",
      "Colleen M. Garry",
      "Edward R. Philips",
      "Sal N. DiDomenico",
      "Sean Garballey",
      "Russell E. Holmes",
      "Richard G. Wells, Jr.",
      "Steven George Xiarhos",
      "Tara T. Hong",
      "Tricia Farley-Bouvier",
      "Michelle L. Badger",
      "Michael O. Moore",
      "Daniel Cahill",
      "James Arciero",
      "Tram T. Nguyen",
      "Thomas P. Walsh",
      "Michael J. Soter",
      "Carmine Lawrence Gentile",
      "Kevin G. Honan",
      "Patrick Joseph Kearney",
      "Bruce E. Tarr",
      "Marcus S. Vaughn",
      "Manny Cruz",
      "Thomas W. Moakley",
      "Adrianne Pusateri Ramos",
      "Bud L. Williams",
      "David Henry Argosky LeBoeuf",
      "Adrian C. Madaro",
      "Christopher J. Worrell",
      "Patrick M. O'Connor",
      "Kristin E. Kassner",
      "Priscila S. Sousa",
      "James B. Eldridge",
      "Joshua Tarsky",
      "John J. Cronin",
      "James M. Murphy",
      "Mark J. Cusack",
      "Angelo J. Puppolo, Jr.",
      "Michael P. Kushmerek",
      "Shirley B. Arriaga",
      "James J. O'Day",
      "Danielle W. Gregoire",
      "Sally P. Kerans",
      "Jessica Ann Giannino",
      "John Barrett, III",
      "Homar Gómez",
      "Simon Cataldo",
      "Steven Ultrino",
      "Adam J. Scanlon",
      "Brian M. Ashe",
      "Joan B. Lovely",
      "Joanne M. Comerford",
      "Tackey Chan",
      "Paul J. Donato",
      "David Biele",
      "Michelle M. DuBois",
      "Samantha Montaño",
      "Ryan M. Hamilton",
      "Dawne Shand",
      "Marc T. Lombardo",
      "Bridget Plouffe",
      "Jack Patrick Lewis",
      "John Francis Moran",
      "David M. Rogers",
    ],
    textLength: 0,
    history: [
      {
        date: "2025-07-30",
        branch: "House",
        action: "Reported from the committee on House Ways and Means",
      },
      {
        date: "2025-07-30",
        branch: "House",
        action: "Pending new draft of H2932",
      },
      { date: "2025-07-30", branch: "House", action: "New draft of H2932" },
      {
        date: "2025-07-30",
        branch: "House",
        action: "Ordered to a third reading",
      },
      { date: "2025-07-30", branch: "House", action: "Rules supended" },
      { date: "2025-07-30", branch: "House", action: "Read third" },
      {
        date: "2025-07-30",
        branch: "House",
        action:
          "Passed to be engrossed - 158 YEAS to 0 NAYS (See YEA and NAY No. 67)",
      },
      {
        date: "2025-08-04",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      {
        date: "2026-06-04",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendments by striking out all after the enacting clause and inserting in place thereof the text of S3109; and by inserting before the enacting clause an emergence preamble",
      },
      { date: "2026-06-04", branch: "Senate", action: "Also based on S1884" },
      { date: "2026-06-04", branch: "Senate", action: "Rules suspended" },
      { date: "2026-06-04", branch: "Senate", action: "Read second " },
      {
        date: "2026-06-04",
        branch: "Senate",
        action:
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S3109; and by inserting before the enacting clause an emergence preamble",
      },
      {
        date: "2026-06-04",
        branch: "Senate",
        action: "Ordered to a third reading",
      },
      { date: "2026-06-04", branch: "Senate", action: "Read third" },
      {
        date: "2026-06-04",
        branch: "Senate",
        action:
          "Passed to be engrossed -see Roll Call #187 (Yeas 39 to Nays 0)",
      },
      {
        date: "2026-06-08",
        branch: "House",
        action: "Referred to the committee on Bills in the Third Reading",
      },
      { date: "2026-07-15", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-15",
        branch: "House",
        action: "House NON-concurred in the Senate amendment",
      },
      {
        date: "2026-07-15",
        branch: "House",
        action: "Committee of conference appointed - (Ryan-Gonzalez-Ferguson)",
      },
      { date: "2026-07-30", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-07-30",
        branch: "Senate",
        action: "Senate insisted on its amendment",
      },
      {
        date: "2026-07-30",
        branch: "Senate",
        action:
          "Committee of conference appointed (Rodrigues-Lovely-O'Connor), in concurrence",
      },
    ],
  },
  "S.3109": {
    topics: [
      { category: "Labor and Employment", topic: "Employee benefits" },
      { category: "Labor and Employment", topic: "Employee pensions" },
      {
        category: "Economics and Public Finance",
        topic: "Pension and retirement benefits",
      },
      { category: "Education", topic: "Teachers and educators" },
    ],
    number: "S.3109",
    summary:
      "The bill provides eligible teachers who joined the retirement system before a certain date with a one-time opportunity to opt into an alternative retirement benefit program. Those who choose to participate must contribute a specified percentage of their salary and may need to make up for any past contributions not made. If they do not elect to participate within the designated timeframe, they will be considered to have opted out. Additionally, if a participant does not meet the required service criteria upon retirement, they will receive a refund of their additional contributions.",
    summarySource: "S.3109",
    title: "An Act relative to benefits for teachers",
    kind: "Amendment",
    pinslip:
      "Senate, June 4, 2026 -- The committee on Senate Ways and Means to whom was referred the House Bill relative to benefits for teachers (House, No. 4361) (also based on Senate, No. 1884); reports, recommending that the same ought to pass with an amendment striking out all after the enacting clause and inserting in place thereof the text of Senate document numbered 3109.",
    sponsor: "Senate Committee on Ways and Means",
    cosponsors: [],
    textLength: 3318,
    history: [
      {
        date: "2026-06-04",
        branch: "Senate",
        action: "Reported from the committee on Senate Ways and Means",
      },
      {
        date: "2026-06-04",
        branch: "Senate",
        action: "Recommended new text for H4361",
      },
      { date: "2026-06-04", branch: "Senate", action: "Substituted for H4361" },
      { date: "2026-06-04", branch: "Senate", action: "See H4361" },
    ],
  },
  "H.5518": {
    topics: [
      { category: "Sports and Recreation", topic: "Public parks" },
      {
        category: "Environmental Protection",
        topic: "Pollution control and abatement",
      },
      { category: "Environmental Protection", topic: "Water quality" },
      {
        category: "Environmental Protection",
        topic: "Environmental assessment, monitoring, research",
      },
    ],
    number: "H.5518",
    summary:
      "The bill proposes funding for various climate resilience and environmental projects aimed at improving infrastructure and natural resources. It includes financial support for land acquisition, tree planting, dam repairs, and the restoration of coastal and inland waterways. Additionally, it establishes programs for assessing and mitigating pollution from solid waste facilities and promotes sustainable practices in agriculture and housing. If passed, the bill would allocate significant resources to enhance community resilience against climate change impacts and improve public access to recreational areas.",
    summarySource: "H.5518",
    title: "An Act to build resilience for Massachusetts communities\r\n\r\n",
    kind: "Amendment",
    pinslip:
      "Text of House amendments to the Senate Bill to build resilience for Massachusetts communities (being the text of House document numbered 5510, published as amended). June 18, 2026.",
    sponsor: null,
    cosponsors: [],
    textLength: 0,
    history: [
      {
        date: "2026-06-17",
        branch: "House",
        action: "H5510, published as amended",
      },
      { date: "2026-06-17", branch: "House", action: "See S3064" },
    ],
  },
  "S.3064": {
    topics: [
      {
        category: "Environmental Protection",
        topic: "Pollution control and abatement",
      },
      { category: "Environmental Protection", topic: "Water quality" },
      {
        category: "Environmental Protection",
        topic: "Environmental assessment, monitoring, research",
      },
      {
        category: "Public and Natural Resources",
        topic: "Forests, forestry, trees",
      },
    ],
    number: "S.3064",
    summary:
      "The bill aims to enhance climate change adaptation and improve environmental and recreational assets through significant funding for various projects. It proposes investments in land acquisition, tree planting, dam improvements, and infrastructure upgrades to bolster resilience against climate impacts. Additionally, it establishes funds for clean water initiatives, pollution control, and support for local communities in addressing environmental challenges. The bill emphasizes collaboration with municipalities and prioritizes projects that benefit disadvantaged populations and promote sustainable practices.",
    summarySource: "S.3064",
    title: "An Act to build resilience for Massachusetts communities",
    kind: "Bill",
    pinslip:
      "Senate, April 15, 2026 -- Text of the Senate Bill to build resilience for Massachusetts communities (Senate, No. 3064) (being the text of Senate No. 3050, printed as amended)",
    sponsor: null,
    cosponsors: ["Maura T. Healey"],
    textLength: 316266,
    history: [
      {
        date: "2026-04-15",
        branch: "Senate",
        action: "S3050, reprinted as amended",
      },
      {
        date: "2026-04-15",
        branch: "Senate",
        action:
          "Passed to be engrossed -see Roll Call #152 (Yeas 36 to Nays 3)",
      },
      {
        date: "2026-04-27",
        branch: "House",
        action: "Read; and referred to the committee on House Ways and Means",
      },
      {
        date: "2026-06-17",
        branch: "House",
        action:
          "Committee recommended ought to pass with an amendment, striking out all after the enacting clause and inserting the text of H5510, and referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-06-17",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting with the amendment pending",
      },
      { date: "2026-06-17", branch: "House", action: "Rules suspended" },
      {
        date: "2026-06-17",
        branch: "House",
        action:
          "Read second, amended (as recommended by the committee on House Ways and Means)",
      },
      {
        date: "2026-06-17",
        branch: "House",
        action: "Ordered to a third reading",
      },
      { date: "2026-06-17", branch: "House", action: "Rules suspended" },
      { date: "2026-06-17", branch: "House", action: "Read third" },
      {
        date: "2026-06-17",
        branch: "House",
        action:
          "Consolidated amendment A adopted - 153 YEAS to 0 NAYS (See YEA and NAY No. 218)",
      },
      {
        date: "2026-06-17",
        branch: "House",
        action:
          "Consolidated amendment B adopted - 152 YEAS to 0 NAYS (See YEA and NAY No. 219)",
      },
      {
        date: "2026-06-17",
        branch: "House",
        action: "Amended by substitution of a new text, see H5518\r\n",
      },
      {
        date: "2026-06-17",
        branch: "House",
        action:
          "Passed to be engrossed - 151 YEAS to 0 NAYS (See YEA and NAY No. 220)",
      },
      { date: "2026-06-23", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-06-23",
        branch: "Senate",
        action: "Senate NON-concurred in the House amendment",
      },
      {
        date: "2026-06-23",
        branch: "Senate",
        action: "Committee of conference appointed (Cyr-Rausch-Durant)",
      },
      { date: "2026-07-01", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-01",
        branch: "House",
        action: "House insisted on its amendment",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action:
          "Committee of conference appointed - (Finn-Barber-Sweezey), in concurrence\r\n",
      },
    ],
  },
  "H.5479": {
    topics: [
      {
        category: "Technology and Communications",
        topic: "Internet, web applications, social media",
      },
      {
        category: "Government Operations and Elections",
        topic: "Government information and archives",
      },
    ],
    number: "H.5479",
    summary:
      "The proposed legislation aims to enhance consumer data privacy by establishing clear rights for individuals regarding their personal data. It would require businesses to obtain explicit consent before collecting or processing personal data and provide consumers with the ability to access, correct, or delete their information. Additionally, the bill would impose restrictions on the sale of sensitive data and mandate transparency in data handling practices. If passed, the Attorney General would oversee enforcement and compliance, ensuring that consumers are protected from unfair data practices.",
    summarySource: "H.5479",
    title: "An Act establishing the Massachusetts consumer data privacy act",
    kind: "Amendment",
    pinslip:
      "Text of House amendments to the Senate Bill establishing the Massachusetts data privacy act (being the text of House document numbered 5472, published as amended). June 4, 2026.",
    sponsor: null,
    cosponsors: [],
    textLength: 66177,
    history: [
      {
        date: "2026-06-04",
        branch: "House",
        action: "H5472, published as amended",
      },
      { date: "2026-06-05", branch: "House", action: "See S2619" },
    ],
  },
  "S.2619": {
    topics: [
      {
        category: "Technology and Communications",
        topic: "Internet, web applications, social media",
      },
    ],
    number: "S.2619",
    summary:
      "The proposed legislation aims to enhance data privacy protections for residents by establishing clear guidelines on how personal data is collected, processed, and shared by businesses. It requires companies to obtain explicit consent from consumers before using their data for purposes like targeted advertising or selling to third parties. Additionally, it grants consumers rights to access, correct, and delete their personal data, while imposing penalties on businesses that fail to comply with these regulations. If passed, the law would also create a framework for enforcement and oversight by the attorney general's office.",
    summarySource: "S.2619",
    title: "An Act establishing the Massachusetts data privacy act",
    kind: "Bill",
    pinslip:
      "Senate, September 25, 2025 -- Text of the Senate Bill establishing the Massachusetts data privacy act (being the text of Senate document 2608, printed as amended)",
    sponsor: null,
    cosponsors: [
      "Michael O. Moore",
      "Cynthia Stone Creem",
      "William J. Driscoll, Jr.",
      "Joanne M. Comerford",
      "Rebecca L. Rausch",
      "James B. Eldridge",
      "Julian Cyr",
      "Bradley H. Jones, Jr.",
      "Patricia D. Jehlen",
    ],
    textLength: 58766,
    history: [
      {
        date: "2025-09-25",
        branch: "Senate",
        action: "S2608, reprinted as amended",
      },
      {
        date: "2025-09-25",
        branch: "Senate",
        action: "Passed to be engrossed -see Roll Call #71 (Yeas 40 to Nays 0)",
      },
      {
        date: "2025-09-29",
        branch: "House",
        action: "Read; and referred to the committee on House Ways and Means",
      },
      {
        date: "2026-06-04",
        branch: "House",
        action:
          "Committee recommended ought to pass with an amendment, striking out all after the enacting clause and inserting the text of H5472, and referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-06-04",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting with the amendment pending\r\n",
      },
      { date: "2026-06-04", branch: "House", action: "Rules suspended" },
      {
        date: "2026-06-04",
        branch: "House",
        action:
          "Read second, amended (as recommended by the committee on House Ways and Means)",
      },
      {
        date: "2026-06-04",
        branch: "House",
        action: "Ordered to a third reading",
      },
      { date: "2026-06-04", branch: "House", action: "Rules suspended" },
      { date: "2026-06-04", branch: "House", action: "Read third" },
      {
        date: "2026-06-04",
        branch: "House",
        action:
          "Consolidated amendment A adopted - 146 YEAS to 0 NAYS (See YEA and NAY No. 207)",
      },
      {
        date: "2026-06-04",
        branch: "House",
        action: "Text of H5472 amended, published as H5479",
      },
      {
        date: "2026-06-04",
        branch: "House",
        action:
          "Passed to be engrossed - 146 YEAS to 0 NAYS (See YEA and NAY No. 208)",
      },
      { date: "2026-06-11", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-06-11",
        branch: "Senate",
        action: "Senate NON-concurred in the House amendment",
      },
      {
        date: "2026-06-11",
        branch: "Senate",
        action: "Committee of conference appointed (Creem-Finegold-O'Connor)",
      },
      { date: "2026-06-17", branch: "House", action: "Rules suspended" },
      {
        date: "2026-06-17",
        branch: "House",
        action: "House insisted on its amendment",
      },
      {
        date: "2026-06-17",
        branch: "House",
        action:
          "Committee of conference appointed - (M. Moran-Farley-Bouvier-Vieira), in concurrence",
      },
    ],
  },
  "H.5366": {
    topics: [
      { category: "Education", topic: "Curriculum and standards" },
      {
        category: "Technology and Communications",
        topic: "Internet, web applications, social media",
      },
      { category: "Healthcare", topic: "Mental health" },
      { category: "Education", topic: "Elementary and secondary education" },
    ],
    number: "H.5366",
    summary:
      "The proposed legislation aims to enhance student safety and focus in schools by regulating the use of personal electronic devices during school hours. It would require schools to develop policies that restrict students from using personal devices, while allowing for secure storage options and emergency communication methods. Additionally, the bill mandates education on the risks associated with social media use, ensuring that students are informed about its potential impacts on their well-being. Schools would also be required to implement age verification systems for social media platforms to protect minors from harmful content.",
    summarySource: "H.5366",
    title:
      "An Act promoting safe technology use and distraction-free education for youth",
    kind: "Amendment",
    pinslip:
      "Text of the House amendments to the Senate Bill to promote student learning and mental health (Senate, No. 2581) (being the text of House document numbered 5349, published as amended). April 8, 2026.",
    sponsor: null,
    cosponsors: [],
    textLength: 28296,
    history: [
      {
        date: "2026-04-08",
        branch: "House",
        action:
          "Text of House amendments to the Senate Bill to promote student learning and mental health (text of H5349, as amended)",
      },
      { date: "2026-04-08", branch: "House", action: "See S2581" },
    ],
  },
  "S.2581": {
    topics: [
      { category: "Education", topic: "Special education" },
      { category: "Education", topic: "Elementary and secondary education" },
      { category: "Healthcare", topic: "Mental health" },
      { category: "Education", topic: "Curriculum and standards" },
    ],
    number: "S.2581",
    summary:
      "The bill aims to establish guidelines for the use of personal electronic devices in schools, prohibiting their use during the school day and at school-sponsored activities. Schools would need to create policies that include secure storage options for these devices and ensure that enforcement does not lead to unfair discipline. There would be allowances for specific situations, such as for students with disabilities or health needs. Schools must notify families of their policies and submit them for review, with the goal of implementing these changes by the start of the 2026-2027 school year.",
    summarySource: "S.2581",
    title: "An Act to promote student learning and mental health ",
    kind: "Bill",
    pinslip:
      "Senate, July 31, 2025 -- Text of the Senate Bill to promote student learning and mental health (Senate, No. 2581) (being the text of Senate document numbered 2561, printed as amended)",
    sponsor: null,
    cosponsors: [
      "Julian Cyr",
      "Brendan P. Crighton",
      "John J. Cronin",
      "John F. Keenan",
      "Patrick M. O'Connor",
      "John C. Velis",
      "Andrea Joy Campbell",
      "Mark C. Montigny",
      "Carmine Lawrence Gentile",
      "Nick Collins",
      "Donald R. Berthiaume, Jr.",
      "James C. Arena-DeRosa",
      "Barry R. Finegold",
      "Paul R. Feeney",
      "Mike Connolly",
      "Lindsay N. Sabadosa",
      "Joanne M. Comerford",
    ],
    textLength: 7432,
    history: [
      {
        date: "2025-07-31",
        branch: "Senate",
        action: "S2561, reprinted as amended",
      },
      {
        date: "2025-07-31",
        branch: "Senate",
        action: "Passed to be engrossed -see Roll Call #66 (Yeas 38 to Nays 2)",
      },
      {
        date: "2025-08-04",
        branch: "House",
        action: "Read; and referred to the committee on House Ways and Means",
      },
      {
        date: "2026-04-08",
        branch: "House",
        action:
          "Committee recommended ought to pass with an amendment, striking out all after the enacting clause and inserting the text of H5349, and referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-04-08",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting with the amendment pending",
      },
      { date: "2026-04-08", branch: "House", action: "Rules suspended   " },
      {
        date: "2026-04-08",
        branch: "House",
        action:
          "Read second, amended (as recommended by the committee on\r\nHouse Ways and Means)",
      },
      {
        date: "2026-04-08",
        branch: "House",
        action: "Ordered to a third reading",
      },
      { date: "2026-04-08", branch: "House", action: "Rules suspended" },
      { date: "2026-04-08", branch: "House", action: "Read third" },
      { date: "2026-04-08", branch: "House", action: "Amendment 7 rejected" },
      {
        date: "2026-04-08",
        branch: "House",
        action:
          "Amendment 15 rejected - 27 YEAS to 128 NAYS (See YEA and NAY No. 152)",
      },
      {
        date: "2026-04-08",
        branch: "House",
        action:
          "Consolidated amendment A adopted - 155 YEAS to 0 NAYS (See YEA and NAY No. 153)",
      },
      {
        date: "2026-04-08",
        branch: "House",
        action: "Consolidated amendment B pending",
      },
      {
        date: "2026-04-08",
        branch: "House",
        action:
          "Quorum Roll Call - 154 YEAS to 0 NAYS (See YEA and NAY No. 154)",
      },
      {
        date: "2026-04-08",
        branch: "House",
        action:
          "Consolidated amendment B adopted - 144 YEAS to 10 NAYS (See YEA and NAY No. 155)",
      },
      {
        date: "2026-04-08",
        branch: "House",
        action: "For the text of House amendments, see H5366",
      },
      {
        date: "2026-04-08",
        branch: "House",
        action:
          "Passed to be engrossed - 129 YEAS to 25 NAYS (See YEA and NAY No. 156)",
      },
      { date: "2026-05-07", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-05-07",
        branch: "Senate",
        action: "Senate NON-concurred in the House amendment",
      },
      {
        date: "2026-05-07",
        branch: "Senate",
        action: "Committee of conference appointed (Crighton-Rodrigues-Durant)",
      },
      { date: "2026-05-20", branch: "House", action: "Rules suspended" },
      {
        date: "2026-05-20",
        branch: "House",
        action: "House insisted on its amendment",
      },
      {
        date: "2026-05-20",
        branch: "House",
        action:
          "Committee of conference appointed - (Peisch-F. Moran-Vieira), in concurrence",
      },
    ],
  },
  "H.4769": {
    number: "H.4769",
    title:
      "An Act to build resilient infrastructure to generate higher-ed transformation",
    kind: "Bill",
    pinslip:
      "House bill No. 4750, as amended and as adopted by the House. November 18, 2025.",
    sponsor: null,
    cosponsors: ["Maura T. Healey"],
    textLength: 0,
    history: [
      {
        date: "2025-11-18",
        branch: "House",
        action: "H4750, published as amended",
      },
      {
        date: "2025-11-18",
        branch: "House",
        action:
          "Passed to be engrossed - 148 YEAS to 5 NAYS (See YEA and NAY No. 109)",
      },
      {
        date: "2025-11-19",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      {
        date: "2026-02-19",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendment striking out all after the enacting clause and inserting in place thereof the text of S2962",
      },
      {
        date: "2026-02-19",
        branch: "Senate",
        action: "Order relative to subject matter adopted",
      },
      {
        date: "2026-02-19",
        branch: "Senate",
        action:
          "Placed in the Orders of the Day for Thursday, February 26, 2026",
      },
      { date: "2026-02-26", branch: "Senate", action: "Read second " },
      {
        date: "2026-02-26",
        branch: "Senate",
        action:
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S2962",
      },
      {
        date: "2026-02-26",
        branch: "Senate",
        action: "Reprinted, as amended, see S2993",
      },
      {
        date: "2026-02-26",
        branch: "Senate",
        action: "Ordered to a third reading",
      },
      { date: "2026-02-26", branch: "Senate", action: "Read third " },
      {
        date: "2026-02-26",
        branch: "Senate",
        action:
          "Passed to be engrossed -- see Roll Call #140 (Yeas 38 to Nays 0)",
      },
      {
        date: "2026-04-08",
        branch: "House",
        action: "House NON-concurred in the Senate amendment\r\n",
      },
      {
        date: "2026-04-08",
        branch: "House",
        action:
          "Committee of conference appointed - (D. Rogers-Finn-Pease)\r\n",
      },
      { date: "2026-04-09", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-04-09",
        branch: "Senate",
        action: "Senate insisted on its amendment",
      },
      {
        date: "2026-04-09",
        branch: "Senate",
        action:
          "Committee of conference appointed (Comerford-Rush-Dooner), in concurrence",
      },
    ],
  },
  "S.2993": {
    topics: [
      {
        category: "Housing and Community Development",
        topic: "Housing supply and affordability",
      },
      {
        category: "Education",
        topic: "Educational facilities and institutions",
      },
      { category: "Energy", topic: "Energy efficiency and conservation" },
      { category: "Education", topic: "Higher education" },
    ],
    number: "S.2993",
    summary:
      "This bill proposes significant funding for capital improvements at public higher education institutions to enhance their educational missions and support regional economic development. It allocates funds for various projects, including maintenance, modernization, and energy efficiency upgrades, as well as the development of housing and mixed-use facilities on campuses. Additionally, it establishes a new fund specifically for public higher education capital projects, ensuring that proceeds from property disposals and dedicated tax revenues are used for these purposes. The bill aims to improve infrastructure and support student needs while promoting sustainability and collaboration between institutions.",
    summarySource: "S.2993",
    title:
      "An Act to build resilient infrastructure to generate higher-ed transformation",
    kind: "Amendment",
    pinslip:
      "Senate, February 26, 2026 -- Text of the Senate amendment to the House Bill to build resilient infrastructure to generate higher-ed transformation (House, No. 4769) (being the text of Senate document numbered 2962, printed as amended)",
    sponsor: null,
    cosponsors: [],
    textLength: 62184,
    history: [
      {
        date: "2026-02-26",
        branch: "Senate",
        action: "Text of S2962, reprinted as amended ",
      },
      { date: "2026-02-26", branch: "Senate", action: "See H4769" },
    ],
  },
};

/**
 * Where a document came from, oldest first, ending with the document itself.
 *
 * Read out of the Pinslip, which is the only place the legislature records it,
 * and only out of the Pinslip: Firestore's `similar` field is related bills
 * rather than ancestry, and following it walked H.5630 to a community
 * preservation surcharge.
 *
 * This is the fix for the hollow-document problem. Half of these numbers are
 * amendments: one chamber takes the other's bill and replaces its text, and the
 * new document inherits no sponsor, no cosponsors, and a two-line history while
 * the record sits on the bill it replaced. H.5630 has two recorded actions;
 * S.3141, the bill it is an amendment of, has twenty. A reader who arrived at
 * the first number needs to be shown the second.
 *
 * Chains run deep. The PETS bill is six documents: S.651 in a previous session
 * became S.2720, then S.3014, then S.3028, which the House replaced as H.5581
 * and then H.5589.
 */
export const LINEAGE: Record<string, string[]> = {
  "H.5630": ["S.867", "S.3116", "S.3141", "H.5630"],
  "S.3141": ["S.867", "S.3116", "S.3141"],
  "S.3244": ["H.5469", "S.3244"],
  "H.5576": ["H.5562", "H.5576"],
  "S.3228": ["H.5562", "H.5576", "S.3228"],
  "H.5589": ["S.651", "S.2720", "S.3014", "S.3028", "H.5581", "H.5589"],
  "S.3028": ["S.651", "S.2720", "S.3014", "S.3028"],
  "S.3184": ["H.4767", "S.3184"],
  "H.5558": ["S.507", "S.2898", "S.2916", "H.5558"],
  "S.2916": ["S.507", "S.2898", "S.2916"],
  "S.3166": ["H.5151", "H.5175", "S.3166"],
  "S.3109": ["S.1884", "S.3109"],
  "S.3064": ["S.2542", "S.3050", "S.3064"],
  "H.5366": ["S.2581", "H.5366"],
  "H.4769": ["H.4750", "H.4769"],
  "S.2993": ["H.4750", "H.4769", "S.2993"],
};

/** The document this one was made from, or null if it is the origin. */
export function parentOf(number: string): string | null {
  const c = LINEAGE[number];
  if (!c || c.length < 2) return null;
  return c[c.length - 2];
}

/** "H.5630" as it appears in a URL. */
export const slugFor = (n: string) => n.replace(".", "").toLowerCase();

export const BY_SLUG: Record<string, BillRecord> = Object.fromEntries(
  Object.values(BILLS).map((b) => [slugFor(b.number), b]),
);
