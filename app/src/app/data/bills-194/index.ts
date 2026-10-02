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
  "H.5527": {
    number: "H.5527",
    title:
      "An Act relative to Massachusetts winning global investment, talent, and innovation",
    kind: "Bill",
    pinslip: null,
    sponsor:
      "Joint Committee on Economic Development and Emerging Technologies",
    cosponsors: ["Maura T. Healey"],
    textLength: 250285,
    history: [
      {
        date: "2026-06-22",
        branch: "House",
        action:
          "Reported from the committee on Economic Development and Emerging Technologies",
      },
      { date: "2026-06-22", branch: "House", action: "New draft of H5386" },
      {
        date: "2026-06-22",
        branch: "House",
        action:
          "Reported favorably by committee and referred to the committee on Bonding, Capital Expenditures and State Assets",
      },
      {
        date: "2026-06-22",
        branch: "Joint",
        action:
          "Hearing scheduled for 07/02/2026 from 01:00 PM-05:00 PM in A-1  ",
      },
      {
        date: "2026-07-02",
        branch: "House",
        action:
          "Committee recommended bill ought to pass and referred to the committee on House Ways and Means",
      },
      {
        date: "2026-07-06",
        branch: "House",
        action:
          "Committee recommended ought to pass with an amendment, substituting therefor a bill, see H5562",
      },
      {
        date: "2026-07-06",
        branch: "House",
        action:
          "Referred to the committee on House Steering, Policy and Scheduling with the amendment pending",
      },
      {
        date: "2026-07-08",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting for a second reading with the amendment pending",
      },
      { date: "2026-07-08", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-08",
        branch: "House",
        action:
          "Read second, amended (as recommended by the committee on House Ways and Means)",
      },
      {
        date: "2026-07-08",
        branch: "House",
        action: "New draft substituted, see H5562",
      },
    ],
  },
  "S.3178": {
    number: "S.3178",
    title: "An Act relative to economic development in the commonwealth",
    kind: "Amendment",
    pinslip:
      "Senate, July 16, 2026 -- Text of the Senate amendment to the House Bill relative to economic development in the commonwealth (House, No. 5576) [This legislation authorizes $325,100,000 in bond obligations and $100,000,000 in direct fiscal year 2026 appropriations from the Education and Transportation Fund.]",
    sponsor: "Senate Committee on Ways and Means",
    cosponsors: [],
    textLength: 169725,
    history: [
      {
        date: "2026-07-16",
        branch: "Senate",
        action: "Reported from the committee on Senate Ways and Means",
      },
      {
        date: "2026-07-16",
        branch: "Senate",
        action: "Recommended new text for H5576",
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
      {
        date: "2026-07-22",
        branch: "Senate",
        action: "Amendment #55 (Keenan) adopted",
      },
      {
        date: "2026-07-22",
        branch: "Senate",
        action: "Amendment #196 (Oliveira) adopted",
      },
      {
        date: "2026-07-22",
        branch: "Senate",
        action: "Amendment #366 (Lovely) adopted",
      },
      {
        date: "2026-07-22",
        branch: "Senate",
        action: "Amendment #554 (Collins) adopted",
      },
      {
        date: "2026-07-22",
        branch: "Senate",
        action: "Amendment #374 (Cronin) adopted",
      },
      {
        date: "2026-07-22",
        branch: "Senate",
        action: "Amendment #56 (Miranda) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action:
          "The following amendments were considered as one and adopted:22, 27, 42, 47, 58, 59, 61, 62, 77, 102, 103, 104, 105, 106, 107, 108, 115, 125, 126, 128, 129, 130, 131, 132, 133, 158, 184, 186, 187, 190, 191, 195, 199, 200, 207, 211, 212, 214, 217, 218, 220, 225, 227, 229, 230, 231, 233, 243, 246, 247, 248, 249, 250, 251, 252, 253, 254, 272, 282, 285, 287, 291, 294, 295, 298, 301, 303, 311, 313, 314, 315, 316, 317, 319, 320, 321, 328, 329, 330, 331, 332, 333, 334, 335, 336, 340, 362, 379, 389, 392, 398, 413, 414, 415, 416, 424, 430, 436, 439, 446, 448, 450, 452, 454, 455, 456, 461, 466, 468, 472, 473, 474, 475, 477, 478, 479, 480, 481, 482, 485, 487, 488, 494, 500, 502, 504, 508, 510, 515, 518, 523, 524, 530, 545, 581, 588, 589, 590, 591, 593, 594",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action:
          "The following amendments were considered as one and rejected:3, 6, 7, 8, 9, 10, 26, 39, 40, 44, 45, 50, 51, 54, 57, 64, 65, 66, 67, 68, 75, 76, 80, 82, 84, 86, 87, 88, 89, 90, 93, 95, 96, 97, 98, 99, 100, 101, 109, 110, 124, 140, 141, 142, 143, 145, 146, 147, 148, 149, 150, 151, 152, 153, 155, 163, 164, 176, 178, 180, 183, 189, 193, 194, 197, 198, 210, 219, 221, 223, 228, 234, 236, 239, 241, 242, 244, 245, 258, 266, 267, 274, 277, 278, 279, 299, 323, 325, 348, 351, 352, 377, 378, 380, 382, 390, 400, 408, 433, 434, 435, 443, 457, 462, 463, 464, 467, 469, 470, 476, 484, 522, 529, 534, 535, 536, 537, 538, 543, 577, 580",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #511 (Friedman) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #43 (Miranda) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #46 (Miranda) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #213 (Driscoll) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #281 ( Gómez) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #297 (Miranda) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #305 (Miranda) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #341 (Dooner) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #356 (O'Connor) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #460 (Cronin) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #491 (Edwards) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #372 (Cyr) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #499 (Brady) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #595 (Feeney) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #354 (Cyr) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #78 (Cyr) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #70 (Comerford) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #309 (Kennedy) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #19 (Comerford) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #24 (Fernandes) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #29 (Miranda) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #33 (Miranda) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #48 (Keenan) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #49 (Keenan) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #52 (Keenan) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #53 (Keenan) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #136 (Moore) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #179 (Fernandes) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #265 ( Gómez) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #275 (Creem) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #11 (Creem) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #168 (Payano) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #270 ( Gómez) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #276 ( Gómez) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #288 ( Gómez) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #292 (Tarr) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #310 (Rausch) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #349 (Rausch) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #222 (Kennedy) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #363 (Tarr) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #368 (Tarr) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #393 (DiDomenico) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #397 (DiDomenico) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #404 (DiDomenico) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #417 (Fattman) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action:
          "Amendment #418 (Fattman) rejected -see Roll Call #210 (Yeas 7 to Nays 32)",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #447 (Feeney) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #483 (Barrett) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #495 (Crighton) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #505 (Driscoll) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #506 (Edwards) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #528 (Montigny) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #531 (Montigny) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #546 (Montigny) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #402 (DiDomenico) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #561 (Montigny) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #564 (Collins) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #569 (Collins) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #570 (Collins) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #571 (Collins) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #81 (Creem) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #192 (Howard) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #428.1 (Lovely) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #428 (Fattman) adopted, as amended",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #18 (Eldridge) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #34 (Tarr) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #94 (Mark) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #166 (Comerford) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #205 (Tarr) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #237 (Fernandes) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #539 (Montigny) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action:
          "Amendment #41 (Tarr) rejected -see Roll Call #211 (Yeas 5 to Nays 34)",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action:
          "Amendment #235 (Tarr) rejected -see Roll Call #212 (Yeas 7 to Nays 32)",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #135 (Cronin) rejected",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #526 (Montigny) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #471 (Rush) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #157 (Brownsberger) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action:
          "Amendment #14 (Lewis) adopted -see Roll Call #213 (Yeas 31 to Nays 8)",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action:
          "Amendment #343 (Tarr) rejected -see Roll Call #214 (Yeas 5 to Nays 34)",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #118 (Moore) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #558 (Collins) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #327 (Rausch) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #215 (Brownsberger) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #182 (Velis) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #492 (Driscoll) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #20 (Fernandes) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #160 (Brownsberger) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #256 (Durant) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #296 (Rausch) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #544 (Feeney) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #345 (Comerford) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #401 (DiDomenico) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #441 (Edwards) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #465 (Feeney) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #367 (Cyr) adopted",
      },
      {
        date: "2026-07-23",
        branch: "Senate",
        action: "Amendment #410 (Edwards) adopted",
      },
      {
        date: "2026-07-24",
        branch: "Senate",
        action: "Amendment #12 (Jehlen) adopted",
      },
      {
        date: "2026-07-24",
        branch: "Senate",
        action: "Amendment #350 (Rodrigues) adopted",
      },
      {
        date: "2026-07-24",
        branch: "Senate",
        action: "Reprinted, as amended, see S3228",
      },
      {
        date: "2026-07-24",
        branch: "Senate",
        action: "Substituted, as amended for H5576",
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
  "H.5175": {
    summary:
      "The bill would require the Department of Public Utilities to maintain a real-time public dashboard of every component of a residential gas or electric bill, together with an analysis of the benefits of the programs ratepayers fund. Competitive suppliers could no longer sell electricity to a customer on a low-income discount rate, and could not renew a residential fixed-rate contract into a variable-rate one without the customer's consent. Discounted rates for low-income and eligible moderate-income customers would become mandatory for electric and gas companies, funded by a fixed monthly charge on every customer. The Department of Energy Resources would run competitive solicitations for clean energy generation and energy services, and gas companies could build and own geothermal infrastructure for large customers. The bill also directs the inspector general to review the Mass Save program and establishes an electric rates task force.",
    summarySource: "H.5175",
    number: "H.5175",
    title:
      "An Act relative to energy affordability, clean power and economic competitiveness",
    kind: "Bill",
    pinslip:
      "House bill No. 5151, as amended and as adopted by the House. February 26, 2026.",
    sponsor: null,
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
    textLength: 207021,
    history: [
      {
        date: "2026-02-26",
        branch: "House",
        action:
          "Passed to be engrossed - 128 YEAS to 27 NAYS (See YEA and NAY No. 141)",
      },
      {
        date: "2026-02-27",
        branch: "House",
        action: "H5151, published as amended",
      },
      {
        date: "2026-03-02",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      {
        date: "2026-06-23",
        branch: "Senate",
        action: "Order relative to subject matter adopted",
      },
      {
        date: "2026-06-25",
        branch: "Senate",
        action:
          "Also based on S2228, S2232, S2239, S2249, S2255, S2262, S2281, S2282, S2612 and S2780",
      },
      {
        date: "2026-06-25",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendment striking out all after the enacting clause and inserting in place thereof the text of S3143; and by striking out the title and inserting in place thereof a new title",
      },
      {
        date: "2026-06-25",
        branch: "Senate",
        action: "Placed in the Orders of the Day for Wednesday, July 1, 2026",
      },
      { date: "2026-07-01", branch: "Senate", action: "Read second " },
      {
        date: "2026-07-01",
        branch: "Senate",
        action:
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S3143",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Reprinted, as amended, see S3166",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Ordered to a third reading ",
      },
      { date: "2026-07-01", branch: "Senate", action: "Read third " },
      {
        date: "2026-07-01",
        branch: "Senate",
        action:
          "Passed to be engrossed -- see Roll Call #205 (Yeas 32 to Nays 8)",
      },
      { date: "2026-07-16", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-16",
        branch: "House",
        action: "House NON-concurred in the Senate amendment",
      },
      {
        date: "2026-07-16",
        branch: "House",
        action: "Committee of conference appointed - (Cusack-Michlewitz-Jones)",
      },
      { date: "2026-07-16", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-07-16",
        branch: "Senate",
        action: "Senate insisted on its amendment",
      },
      {
        date: "2026-07-16",
        branch: "Senate",
        action:
          "Committee of conference appointed (Barrett-Creem-Tarr), in concurrence",
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
  "S.3143": {
    number: "S.3143",
    title:
      "An Act to save people money, repair the climate and grow the economy",
    kind: "Amendment",
    pinslip:
      "Senate, June 25, 2026 -- Text of the Senate amendment to the House Bill relative to energy affordability, clean power and economic competitiveness (House, No. 5175) [also based on Senate, Nos. Senate, Nos. 2228, 2232, 2239, 2249, 2255, 2262, 2281, 2282, 2612 and 2780]",
    sponsor: "Senate Committee on Ways and Means",
    cosponsors: [],
    textLength: 0,
    history: [
      {
        date: "2026-06-23",
        branch: "Senate",
        action: "Order relative to subject matter adopted",
      },
      {
        date: "2026-06-25",
        branch: "Senate",
        action: "Reported from the committee on Senate Ways and Means",
      },
      {
        date: "2026-06-25",
        branch: "Senate",
        action: "Recommended new text for H5175",
      },
      {
        date: "2026-06-25",
        branch: "Senate",
        action: "Placed in the Orders of the Day for Wednesday, July 1, 2026",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #9 (Lovely) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #10 (Lovely) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #14 (Comerford) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #15 (Rausch) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #19 (Driscoll) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #26 ( Gómez) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #27 (Rausch) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #28 (Rausch) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #35 (Brady) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #36 (Jehlen) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #38 (Cyr) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #39 (Crighton) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #40 (Crighton) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #42 (Mark) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #43 (Mark) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #44 (Mark) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #50 (Creem) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #64 (Brady) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #66 (Mark) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #67 (Cronin) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #72 (Eldridge) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #73 (Eldridge) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #75 (Eldridge) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #82 (Rausch) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #86 (Eldridge) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #99 (Brady) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #103 (Crighton) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #105 (Fernandes) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #108 (Fernandes) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #110 (Keenan) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #111 (Keenan) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #112 (Fernandes) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #114 (Fernandes) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #115 (Fernandes) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #116 (Fernandes) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #125 (Cyr) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #136 ( Gómez) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #138 ( Gómez) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #161 (Brady) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #165 (Cyr) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #171 (Fernandes) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #173 (Montigny) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #174 (Montigny) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #175 (Montigny) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #179 (Fernandes) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #1 (Comerford) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #3 (Comerford) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action:
          "Amendment #25 (Gómez) adopted -see Roll Call #199 (Yeas 35 to Nays 4)",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #71 (Brownsberger) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #4 (Comerford) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #30 (Cyr) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action:
          "The following amendments were considered as one and rejected:2, 5, 16, 18, 20, 21, 24, 31, 32, 53, 54, 57, 59, 60, 62, 63, 70, 87, 89, 90, 91, 92, 93, 95, 96, 98, 100, 104, 106, 128, 129, 132, 133, 137, 139, 140, 158, 164, 167, 168, 169, 172",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action:
          "The following amendments were considered as one and adopted:11, 33, 45, 83, 101, 113, 135, 177",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #6 (Moore) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #12 (Oliveira) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #56 (Durant) rejected",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #94 (Cronin) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #85 (Tarr) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action:
          "Amendment #17 (Tarr) rejected -see Roll Call #201 (Yeas 9 to Nays 30)",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action:
          "Amendment #22 (Tarr) rejected -see Roll Call #202 (Yeas 5 to Nays 34)",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action:
          "Amendment #34 (Tarr) rejected -see Roll Call #203 (Yeas 5 to Nays 34)",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action:
          "Amendment #77 (Eldridge) rejected -see Roll Call #204 (Yeas 19 to Nays 20)",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #134 (Payano) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #141 (Collins) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #162 (Howard) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #166 (Fernandes) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Amendment #159 (Rodrigues) adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Reprinted, as amended, see S3166",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Substituted, as amended, for H5175",
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
  "H.4706": {
    number: "H.4706",
    title: "An Act to improve Massachusetts home care",
    kind: "Bill",
    pinslip: null,
    sponsor: "House Committee on Ways and Means",
    cosponsors: [
      "Thomas M. Stanley",
      "Brian W. Murray",
      "Lindsay N. Sabadosa",
      "Paul K. Frost",
      "Rodney M. Elliott",
      "Rebecca L. Rausch",
      "Danillo A. Sena",
      "Paul McMurtry",
      "Samantha Montaño",
      "Erika Uyterhoeven",
      "James B. Eldridge",
      "James C. Arena-DeRosa",
      "Bruce J. Ayers",
      "Jason M. Lewis",
      "Patricia D. Jehlen",
      "Carmine Lawrence Gentile",
      "Carlos González",
      "Natalie M. Higgins",
      "Manny Cruz",
      "James Arciero",
      "Adam J. Scanlon",
      "Michael D. Brady",
      "Mary S. Keefe",
      "Adrianne Pusateri Ramos",
      "Kevin G. Honan",
      "Adrian C. Madaro",
      "Susannah M. Whipps",
      "Amy Mah Sangiolo",
      "Bud L. Williams",
      "Tackey Chan",
      "Mark D. Sylvia",
      "Christopher J. Worrell",
      "Michael P. Kushmerek",
      "Rita A. Mendes",
      "Jessica Ann Giannino",
      "Estela A. Reyes",
      "Sean Garballey",
      "Russell E. Holmes",
      "Joseph W. McGonagle, Jr.",
      "Dennis C. Gallagher",
      "Michelle M. DuBois",
      "David Henry Argosky LeBoeuf",
      "Jack Patrick Lewis",
      "Chynah Tyler",
      "Kristin E. Kassner",
    ],
    textLength: 0,
    history: [
      {
        date: "2025-11-05",
        branch: "House",
        action: "Reported from the committee on House Ways and Means",
      },
      {
        date: "2025-11-05",
        branch: "House",
        action: "Pending new draft of H4306",
      },
      { date: "2025-11-05", branch: "House", action: "New draft of H4306" },
      {
        date: "2025-11-05",
        branch: "House",
        action: "Ordered to a third reading",
      },
      { date: "2025-11-05", branch: "House", action: "Rules suspended" },
      { date: "2025-11-05", branch: "House", action: "Read third" },
      {
        date: "2025-11-05",
        branch: "House",
        action:
          "Amendment 5 adopted, as changed - 154 YEAS to 0 NAYS (See YEA and NAY No. 106)",
      },
      {
        date: "2025-11-05",
        branch: "House",
        action:
          "Passed to be engrossed - 153 YEAS to 1 NAYS (See YEA and NAY No. 107)",
      },
      {
        date: "2025-11-06",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      { date: "2026-07-09", branch: "Senate", action: "Also based on S2645" },
      {
        date: "2026-07-09",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendment striking out all after the enacting clause and inserting in place thereof the text of S3170",
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
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S3170",
      },
      {
        date: "2026-07-16",
        branch: "Senate",
        action: "Reprinted, as amended, see S3183",
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
      { date: "2026-07-23", branch: "House", action: "Rules suspended\r\n" },
      {
        date: "2026-07-23",
        branch: "House",
        action: "House NON-concurred in the Senate amendment",
      },
      {
        date: "2026-07-23",
        branch: "House",
        action:
          "Committee of conference appointed - (Stanley-F. Moran-DeCoste)",
      },
      { date: "2026-07-27", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-07-27",
        branch: "Senate",
        action: "Senate insisted on its amendment",
      },
      {
        date: "2026-07-27",
        branch: "Senate",
        action:
          "Committee of conference appointed (Brownsberger-Jehlen-Fattman), in concurrence",
      },
      { date: "2026-07-30", branch: "House", action: "Reported by H5627" },
    ],
  },
  "S.3183": {
    number: "S.3183",
    title: "An Act to improve Massachusetts home care",
    kind: "Amendment",
    pinslip:
      "Senate, July 16, 2026 -- Text of the Senate amendment to the House Bill to improve Massachusetts home care (House, No. 4706, amended) (being the text of Senate document numbered 3170, printed as amended)",
    sponsor: null,
    cosponsors: [],
    textLength: 24720,
    history: [
      { date: "2026-07-16", branch: "Senate", action: "See H4706" },
      {
        date: "2026-07-16",
        branch: "Senate",
        action: "Text of S3170, reprinted as amended",
      },
    ],
  },
  "H.5627": {
    number: "H.5627",
    title: "An Act to improve Massachusetts home care",
    kind: "Bill",
    pinslip: null,
    sponsor: "Home Care",
    cosponsors: [
      "Thomas M. Stanley",
      "Brian W. Murray",
      "Lindsay N. Sabadosa",
      "Paul K. Frost",
      "Rodney M. Elliott",
      "Rebecca L. Rausch",
      "Danillo A. Sena",
      "Paul McMurtry",
      "Samantha Montaño",
      "Erika Uyterhoeven",
      "James B. Eldridge",
      "James C. Arena-DeRosa",
      "Bruce J. Ayers",
      "Jason M. Lewis",
      "Patricia D. Jehlen",
      "Carmine Lawrence Gentile",
      "Carlos González",
      "Natalie M. Higgins",
      "Manny Cruz",
      "James Arciero",
      "Adam J. Scanlon",
      "Michael D. Brady",
      "Mary S. Keefe",
      "Adrianne Pusateri Ramos",
      "Kevin G. Honan",
      "Adrian C. Madaro",
      "Susannah M. Whipps",
      "Amy Mah Sangiolo",
      "Bud L. Williams",
      "Tackey Chan",
      "Mark D. Sylvia",
      "Christopher J. Worrell",
      "Michael P. Kushmerek",
      "Rita A. Mendes",
      "Jessica Ann Giannino",
      "Estela A. Reyes",
      "Sean Garballey",
      "Russell E. Holmes",
      "Joseph W. McGonagle, Jr.",
      "Dennis C. Gallagher",
      "Michelle M. DuBois",
      "David Henry Argosky LeBoeuf",
      "Jack Patrick Lewis",
      "Chynah Tyler",
      "Kristin E. Kassner",
    ],
    textLength: 0,
    history: [
      {
        date: "2026-07-30",
        branch: "House",
        action: "Reported from the committee of conference",
      },
      { date: "2026-07-30", branch: "House", action: "Reported on H4706" },
      {
        date: "2026-07-30",
        branch: "House",
        action:
          "Referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-07-31",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting, the question being on acceptance",
      },
      {
        date: "2026-07-31",
        branch: "House",
        action:
          "Committee of conference report accepted - 157 YEAS to 0 NAYS (See YEA and NAY No. 259)",
      },
      {
        date: "2026-07-31",
        branch: "Senate",
        action:
          "Committee of conference report accepted, in concurrence -see Roll Call #228 (Yeas 40 to Nays 0)",
      },
      {
        date: "2026-07-31",
        branch: "House",
        action: "Enacted - 157 YEAS to 0 NAYS (See YEA and NAY No. 260)",
      },
      {
        date: "2026-07-31",
        branch: "Senate",
        action: "Enacted and laid before the Governor",
      },
      {
        date: "2026-08-06",
        branch: "Executive",
        action: "Signed by the Governor, Chapter 180 of the Acts of 2026",
      },
    ],
  },
  "H.4644": {
    number: "H.4644",
    title: "An Act enhancing child welfare protections",
    kind: "Bill",
    pinslip: null,
    sponsor: "House Committee on Ways and Means",
    cosponsors: [
      "Jay D. Livingstone",
      "Thomas W. Moakley",
      "Sean Garballey",
      "Christopher J. Worrell",
      "Russell E. Holmes",
    ],
    textLength: 0,
    history: [
      {
        date: "2025-10-22",
        branch: "House",
        action: "Reported from the committee on House Ways and Means",
      },
      {
        date: "2025-10-22",
        branch: "House",
        action: "Pending new draft of H4416",
      },
      { date: "2025-10-22", branch: "House", action: "New draft of H4416" },
      {
        date: "2025-10-22",
        branch: "House",
        action: "Ordered to a third reading",
      },
      { date: "2025-10-22", branch: "House", action: "Rules suspended" },
      { date: "2025-10-22", branch: "House", action: "Read third" },
      { date: "2025-10-22", branch: "House", action: "Amendment 6 pending" },
      { date: "2025-10-22", branch: "House", action: "Point of Order pending" },
      {
        date: "2025-10-22",
        branch: "House",
        action: "Point of Order well taken",
      },
      { date: "2025-10-22", branch: "House", action: "Amendment 6 laid aside" },
      { date: "2025-10-22", branch: "House", action: "Amendment 3 adopted" },
      {
        date: "2025-10-22",
        branch: "House",
        action:
          "Amendment 17 adopted, as changed - 159 YEAS to 1 NAYS (See YEA and NAY No. 94)",
      },
      {
        date: "2025-10-22",
        branch: "House",
        action:
          "Amendment 5 adopted, as changed - 160 YEAS to 0 NAYS (See YEA and NAY No. 95)",
      },
      {
        date: "2025-10-22",
        branch: "House",
        action: "Published as amended, see H4646",
      },
    ],
  },
  "H.4646": {
    number: "H.4646",
    title: "An Act enhancing child welfare protections",
    kind: "Bill",
    pinslip:
      "House bill No. 4644, as amended and passed to be engrossed by the House. October 22, 2025.",
    sponsor: null,
    cosponsors: [
      "Jay D. Livingstone",
      "Thomas W. Moakley",
      "Sean Garballey",
      "Christopher J. Worrell",
      "Russell E. Holmes",
    ],
    textLength: 0,
    history: [
      {
        date: "2025-10-22",
        branch: "House",
        action: "H4644, published as amended",
      },
      {
        date: "2025-10-22",
        branch: "House",
        action:
          "Passed to be engrossed - 159 YEAS to 1 NAYS (See YEA and NAY No. 96)",
      },
      {
        date: "2025-10-27",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      { date: "2026-06-04", branch: "Senate", action: "Also based on S2659" },
      {
        date: "2026-06-04",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendment striking out all after the enacting clause and inserting in place thereof the text of S3111",
      },
      {
        date: "2026-06-04",
        branch: "Senate",
        action: "Order relative to subject matter adopted",
      },
      {
        date: "2026-06-04",
        branch: "Senate",
        action: "Placed in the Orders of the Day for Thursday, June 11, 2026",
      },
      { date: "2026-06-11", branch: "Senate", action: "Read second" },
      {
        date: "2026-06-11",
        branch: "Senate",
        action:
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S3111",
      },
      {
        date: "2026-06-11",
        branch: "Senate",
        action: "Reprinted, as amended, see S3121",
      },
      {
        date: "2026-06-11",
        branch: "Senate",
        action: "Ordered to a third reading",
      },
      { date: "2026-06-11", branch: "Senate", action: "Read third" },
      {
        date: "2026-06-11",
        branch: "Senate",
        action:
          "Passed to be engrossed -- see Roll Call #192 (Yeas 39 to Nays 0)",
      },
      { date: "2026-07-01", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-01",
        branch: "House",
        action: "House NON-concurred in the Senate amendment",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action:
          "Committee of conference appointed - (Livingstone-Garcia-Sullivan-Almeida)",
      },
      { date: "2026-07-02", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-07-02",
        branch: "Senate",
        action: "Senate insisted on its amendment",
      },
      {
        date: "2026-07-02",
        branch: "Senate",
        action:
          "Committee of conference appointed (Comerford-Kennedy-O'Connor), in concurrence",
      },
      { date: "2026-07-30", branch: "House", action: "Reported by H5629" },
    ],
  },
  "S.2659": {
    number: "S.2659",
    title: "An Act enhancing child welfare protections",
    kind: "Bill",
    pinslip:
      "Senate, October 23, 2025 -- The committee on Children, Families and Persons with Disabilities, to whom was referred the petitions (accompanied by bill, Senate, No. 107) of Joanne M. Comerford and Nick Collins for legislation to establish a bill of rights for children in foster care; (accompanied by bill, Senate, No. 125) of Ryan C. Fattman, Joseph D. McKenna and Bruce E. Tarr for legislation to create an electronic backpack for foster children; (accompanied by bill, Senate, No. 127) of Paul R. Feeney and Michael S. Chaisson for legislation to authorize the Commonwealth of Massachusetts to establish additional mandated reporters for the purpose of the protection and care of children; (accompanied by bill, Senate, No. 129) of Paul R. Feeney for legislation to require that mandated reporters complete training at least every two years to recognize and report suspected child abuse or neglect; (accompanied by bill, Senate, No. 133) of Adam Gomez for legislation relative to child fatality review; (accompanied by bill, Senate, No. 148) of Robyn K. Kennedy for legislation to enhance child welfare protections; (accompanied by bill, Senate, No. 159) of Joan B. Lovely for legislation relative to supporting families dealing with sudden unexplained death in pediatrics; and (accompanied by bill, Senate, No. 2585) (subject to Joint Rule 12) of Michael O. Moore for legislation to establish compliance with federal education reporting requirements for out of home placement students, report the accompanying bill (Senate, No. 2659).",
    sponsor:
      "Joint Committee on Children, Families and Persons with Disabilities",
    cosponsors: [
      "Robyn K. Kennedy",
      "Joanne M. Comerford",
      "Ryan C. Fattman",
      "Paul R. Feeney",
      "Adam Gómez",
      "Joan B. Lovely",
      "Michael O. Moore",
      "Lydia Edwards",
      "Nick Collins",
      "Joseph D. McKenna",
      "Michael S. Chaisson",
      "John F. Keenan",
      "Patrick Joseph Kearney",
      "Bruce E. Tarr",
      "Hannah Kane",
      "Kelly W. Pease",
    ],
    textLength: 94967,
    history: [
      {
        date: "2025-11-03",
        branch: "Senate",
        action:
          "Bill reported favorably by committee and referred to the committee on Rules of the two branches, acting concurrently",
      },
      {
        date: "2025-11-24",
        branch: "Senate",
        action:
          "Committee recommended ought to pass and referred to the committee on Senate Ways and Means",
      },
      { date: "2026-06-04", branch: "Senate", action: "Accompanied H4646" },
    ],
  },
  "S.3121": {
    number: "S.3121",
    title: "An Act enhancing child welfare protections",
    kind: "Amendment",
    pinslip:
      "Senate, June 11, 2026 -- Text of the Senate amendment to the House Bill enhancing child welfare protections (House, No. 4646) (being the text of Senate  document numbered 3111, printed as amended)",
    sponsor: null,
    cosponsors: [],
    textLength: 126138,
    history: [
      {
        date: "2026-06-11",
        branch: "Senate",
        action: "Text of S3111, reprinted as amended",
      },
      { date: "2026-06-11", branch: "Senate", action: "See H4646" },
    ],
  },
  "H.5629": {
    number: "H.5629",
    title: "An Act enhancing child welfare protections",
    kind: "Bill",
    pinslip: null,
    sponsor: "Child Welfare Protection",
    cosponsors: [
      "Jay D. Livingstone",
      "Thomas W. Moakley",
      "Sean Garballey",
      "Christopher J. Worrell",
      "Russell E. Holmes",
    ],
    textLength: 0,
    history: [
      {
        date: "2026-07-30",
        branch: "House",
        action: "Reported from the committee of conference",
      },
      { date: "2026-07-30", branch: "House", action: "Reported on H4646" },
      {
        date: "2026-07-30",
        branch: "House",
        action:
          "Referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-07-31",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting, the question being on acceptance",
      },
      { date: "2026-07-31", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-31",
        branch: "House",
        action:
          "Committee of conference report accepted - 157 YEAS to 0 NAYS (See YEA and NAY No. 261)",
      },
      {
        date: "2026-07-31",
        branch: "Senate",
        action:
          "Committee of conference report accepted, in concurrence -see Roll Call #229 (Yeas 40 to Nays 0)",
      },
      { date: "2026-07-31", branch: "House", action: "Enacted" },
      {
        date: "2026-07-31",
        branch: "Senate",
        action: "Enacted and laid before the Governor",
      },
      {
        date: "2026-08-06",
        branch: "Executive",
        action: "Signed by the Governor, Chapter 179 of the Acts of 2026",
      },
    ],
  },
  "H.5316": {
    number: "H.5316",
    title:
      "An Act promoting rule of law, oversight, trust and equal constitutional treatment",
    kind: "Bill",
    pinslip:
      "House bill No. 5305, as amended and passed to be engrossed by the House. March 25, 2026.",
    sponsor: null,
    cosponsors: [
      "Andres X. Vargas",
      "Judith A. Garcia",
      "Frank A. Moran",
      "Carlos González",
      "Marcus S. Vaughn",
      "Priscila S. Sousa",
      "Manny Cruz",
      "Rita A. Mendes",
      "Samantha Montaño",
      "Brandy Fluker-Reid",
      "Kip A. Diggs",
      "Leigh Davis",
      "Shirley B. Arriaga",
      "Homar Gómez",
      "Russell E. Holmes",
      "Orlando Ramos",
      "Estela A. Reyes",
      "Francisco E. Paulino",
      "Danillo A. Sena",
      "Chynah Tyler",
      "Christopher J. Worrell",
      "Bud L. Williams",
      "Liz Miranda",
      "Adam Gómez",
      "Lydia Edwards",
      "Mindy Domb",
      "David Henry Argosky LeBoeuf",
      "Lindsay N. Sabadosa",
      "Tara T. Hong",
      "Christopher Hendricks",
      "Sal N. DiDomenico",
      "Hannah Bowen",
      "Pavel M. Payano",
      "Tommy Vitolo",
      "Sally P. Kerans",
      "Tricia Farley-Bouvier",
      "Vanna Howard",
      "Jack Patrick Lewis",
      "Steven Owens",
      "David Paul Linsky",
      "Michelle M. DuBois",
      "Amy Mah Sangiolo",
      "Thomas M. Stanley",
      "Marjorie C. Decker",
      "Christine P. Barber",
      "Natalie M. Higgins",
      "Patricia A. Duffy",
      "Thomas W. Moakley",
      "Jennifer Balinsky Armini",
      "Dawne Shand",
      "William F. MacGregor",
      "Sean Reid",
      "Rodney M. Elliott",
      "Ryan M. Hamilton",
      "Tram T. Nguyen",
      "Steven Ultrino",
      "Mike Connolly",
      "Aaron L. Saunders",
      "Simon Cataldo",
      "James C. Arena-DeRosa",
      "Michelle L. Badger",
      "John Barrett, III",
      "Michelle L. Ciccolo",
      "William J. Driscoll, Jr.",
      "Lisa Field",
      "Barry R. Finegold",
      "Sean Garballey",
      "Carmine Lawrence Gentile",
      "Jessica Ann Giannino",
      "Kenneth I. Gordon",
      "James K. Hawkins",
      "Kevin G. Honan",
      "Kristin E. Kassner",
      "Robyn K. Kennedy",
      "Michael P. Kushmerek",
      "Jason M. Lewis",
      "Jay D. Livingstone",
      "Adrian C. Madaro",
      "Rebecca L. Rausch",
      "David M. Rogers",
      "Adam J. Scanlon",
      "Greg Schwartz",
      "Mary S. Keefe",
      "Michael J. Barrett",
      "Tackey Chan",
      "Nick Collins",
      "Rob Consalvo",
      "Patricia D. Jehlen",
      "John J. Lawn, Jr.",
      "Hadley Luddy",
      "John Francis Moran",
      "Edward R. Philips",
      "Erika Uyterhoeven",
      "Susannah M. Whipps",
      "Paul J. Donato",
    ],
    textLength: 36491,
    history: [
      {
        date: "2026-03-25",
        branch: "House",
        action: "H5305, published as amended",
      },
      {
        date: "2026-03-25",
        branch: "House",
        action:
          "Passed to be engrossed - 134 YEAS to 21 NAYS (See YEA and NAY No. 150)",
      },
      {
        date: "2026-04-30",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      {
        date: "2026-04-30",
        branch: "Senate",
        action: "Also based on S1059, S1122, S1127 and S2665",
      },
      {
        date: "2026-04-30",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendment striking out all after the enacting clause and inserting in place thereof the text of S3072",
      },
      {
        date: "2026-04-30",
        branch: "Senate",
        action: "Order relative to subject matter adopted ",
      },
      {
        date: "2026-04-30",
        branch: "Senate",
        action: "Placed in the Orders of the Day for Thursday, May 7th, 2026",
      },
      { date: "2026-05-07", branch: "Senate", action: "Read second " },
      {
        date: "2026-05-07",
        branch: "Senate",
        action:
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S3072",
      },
      {
        date: "2026-05-07",
        branch: "Senate",
        action: "Reprinted, as amended, see S3086",
      },
      {
        date: "2026-05-07",
        branch: "Senate",
        action: "Ordered to a third reading ",
      },
      { date: "2026-05-07", branch: "Senate", action: "Read third " },
      {
        date: "2026-05-07",
        branch: "Senate",
        action:
          "Passed to be engrossed -see Roll Call #158 (Yeas 37 to Nays 3)",
      },
      { date: "2026-05-18", branch: "House", action: "Rules suspended" },
      {
        date: "2026-05-18",
        branch: "House",
        action: "House NON-concurred in the Senate amendment",
      },
      {
        date: "2026-05-18",
        branch: "House",
        action: "Committee of conference appointed - (Cahill-Vargas-Vaughn)",
      },
      { date: "2026-05-18", branch: "Senate", action: "Rules suspended " },
      {
        date: "2026-05-18",
        branch: "Senate",
        action: "Senate insisted on its amendment ",
      },
      {
        date: "2026-05-18",
        branch: "Senate",
        action:
          "Committee of conference appointed (Friedman-Payano-Fattman), in concurrence ",
      },
      { date: "2026-07-29", branch: "House", action: "Reported by H5620" },
    ],
  },
  "S.3086": {
    number: "S.3086",
    title:
      "An Act promoting rule of law, oversight, trust and equal constitutional treatment",
    kind: "Amendment",
    pinslip:
      "Senate, May 7, 2026 -- Text of the Senate amendment to the House Bill promoting rule of law, oversight, trust and equal constitutional treatment (House, No. 5316) (being the text of the Senate document numbered 3072, printed as amended)",
    sponsor: null,
    cosponsors: [],
    textLength: 57696,
    history: [
      {
        date: "2026-05-07",
        branch: "Senate",
        action: "Text of S3072, reprinted as amended",
      },
      { date: "2026-05-07", branch: "Senate", action: "See H5316" },
    ],
  },
  "H.5620": {
    number: "H.5620",
    title:
      "An Act promoting rule of law, oversight, trust and equal constitutional treatment",
    kind: "Bill",
    pinslip: null,
    sponsor: "Protect Act",
    cosponsors: [
      "Andres X. Vargas",
      "Judith A. Garcia",
      "Frank A. Moran",
      "Carlos González",
      "Marcus S. Vaughn",
      "Priscila S. Sousa",
      "Manny Cruz",
      "Rita A. Mendes",
      "Samantha Montaño",
      "Brandy Fluker-Reid",
      "Kip A. Diggs",
      "Leigh Davis",
      "Shirley B. Arriaga",
      "Homar Gómez",
      "Russell E. Holmes",
      "Orlando Ramos",
      "Estela A. Reyes",
      "Francisco E. Paulino",
      "Danillo A. Sena",
      "Chynah Tyler",
      "Christopher J. Worrell",
      "Bud L. Williams",
      "Liz Miranda",
      "Adam Gómez",
      "Lydia Edwards",
      "Mindy Domb",
      "David Henry Argosky LeBoeuf",
      "Lindsay N. Sabadosa",
      "Tara T. Hong",
      "Christopher Hendricks",
      "Sal N. DiDomenico",
      "Hannah Bowen",
      "Pavel M. Payano",
      "Tommy Vitolo",
      "Sally P. Kerans",
      "Tricia Farley-Bouvier",
      "Vanna Howard",
      "Jack Patrick Lewis",
      "Steven Owens",
      "David Paul Linsky",
      "Michelle M. DuBois",
      "Amy Mah Sangiolo",
      "Thomas M. Stanley",
      "Marjorie C. Decker",
      "Christine P. Barber",
      "Natalie M. Higgins",
      "Patricia A. Duffy",
      "Thomas W. Moakley",
      "Jennifer Balinsky Armini",
      "Dawne Shand",
      "William F. MacGregor",
      "Sean Reid",
      "Rodney M. Elliott",
      "Ryan M. Hamilton",
      "Tram T. Nguyen",
      "Steven Ultrino",
      "Mike Connolly",
      "Aaron L. Saunders",
      "Simon Cataldo",
      "James C. Arena-DeRosa",
      "Michelle L. Badger",
      "John Barrett, III",
      "Michelle L. Ciccolo",
      "William J. Driscoll, Jr.",
      "Lisa Field",
      "Barry R. Finegold",
      "Sean Garballey",
      "Carmine Lawrence Gentile",
      "Jessica Ann Giannino",
      "Kenneth I. Gordon",
      "James K. Hawkins",
      "Kevin G. Honan",
      "Kristin E. Kassner",
      "Robyn K. Kennedy",
      "Michael P. Kushmerek",
      "Jason M. Lewis",
      "Jay D. Livingstone",
      "Adrian C. Madaro",
      "Rebecca L. Rausch",
      "David M. Rogers",
      "Adam J. Scanlon",
      "Greg Schwartz",
      "Mary S. Keefe",
      "Michael J. Barrett",
      "Tackey Chan",
      "Nick Collins",
      "Rob Consalvo",
      "Patricia D. Jehlen",
      "John J. Lawn, Jr.",
      "Hadley Luddy",
      "John Francis Moran",
      "Edward R. Philips",
      "Erika Uyterhoeven",
      "Susannah M. Whipps",
      "Paul J. Donato",
    ],
    textLength: 0,
    history: [
      {
        date: "2026-07-29",
        branch: "House",
        action: "Reported from the committee of conference",
      },
      { date: "2026-07-29", branch: "House", action: "Reported on H5316" },
      {
        date: "2026-07-29",
        branch: "House",
        action:
          "Referred to the committee on House Steering, Policy and Scheduling",
      },
      { date: "2026-07-30", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-30",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting, the question being on acceptance",
      },
      { date: "2026-07-30", branch: "House", action: "Rules suspended" },
      {
        date: "2026-07-30",
        branch: "House",
        action:
          "Committee of conference report accepted - 137 YEAS to 21 NAYS (See YEA and NAY No. 243)",
      },
      {
        date: "2026-07-30",
        branch: "Senate",
        action: "Committee of conference report accepted, in concurrence",
      },
      {
        date: "2026-07-30",
        branch: "House",
        action: "Emergency preamble pending",
      },
      {
        date: "2026-07-30",
        branch: "House",
        action:
          "Quorum Roll Call - 149 YEAS to 0 NAYS (See YEA and NAY No. 249)",
      },
      {
        date: "2026-07-30",
        branch: "House",
        action: "Emergency preamble adopted",
      },
      {
        date: "2026-07-30",
        branch: "Senate",
        action: "Emergency preamble adopted",
      },
      {
        date: "2026-07-30",
        branch: "House",
        action: "Enacted - 137 YEAS to 21 NAYS (See YEA and NAY No. 251)",
      },
      {
        date: "2026-07-30",
        branch: "Senate",
        action: "Enacted and laid before the Governor",
      },
      {
        date: "2026-08-05",
        branch: "Executive",
        action: "Signed by the Governor, Chapter 163 of the Acts of 2026",
      },
    ],
  },
  "H.5501": {
    number: "H.5501",
    title:
      "An Act making appropriations for the fiscal year 2027 for the maintenance of the departments, boards, commissions, institutions, and certain activities of the commonwealth, for interest, sinking fund, and serial bond requirements, and for certain permanent improvements",
    kind: "Bill",
    pinslip: null,
    sponsor: null,
    cosponsors: [],
    textLength: 0,
    history: [
      {
        date: "2026-04-29",
        branch: "House",
        action: "H5500, published as amended",
      },
      {
        date: "2026-04-29",
        branch: "House",
        action:
          "Passed to be engrossed - 149 YEAS to 9 NAYS (See YEA and NAY No. 191)",
      },
      {
        date: "2026-05-04",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      {
        date: "2026-05-07",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendment, striking out all after the enacting clause and inserting in place thereof the text of S4",
      },
      {
        date: "2026-05-07",
        branch: "Senate",
        action:
          "Placed in the Orders of the Day for Tuesday, May 19, 2026 pursuant to an order previously adopted",
      },
      { date: "2026-05-19", branch: "Senate", action: "Read second" },
      {
        date: "2026-05-21",
        branch: "Senate",
        action:
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S4",
      },
      {
        date: "2026-05-21",
        branch: "Senate",
        action: "Reprinted, as amended, see S3100",
      },
      {
        date: "2026-05-21",
        branch: "Senate",
        action: "Ordered to a third reading ",
      },
      { date: "2026-05-21", branch: "Senate", action: "Read third " },
      {
        date: "2026-05-21",
        branch: "Senate",
        action:
          "Passed to be engrossed -see Roll Call #185 (Yeas 40 to Nays 0)",
      },
      { date: "2026-05-28", branch: "House", action: "Rules suspended" },
      {
        date: "2026-05-28",
        branch: "House",
        action: "House NON-concurred in the Senate amendment",
      },
      {
        date: "2026-05-28",
        branch: "House",
        action: "Committee of conference appointed - (Michlewitz-Diggs-Smola)",
      },
      { date: "2026-05-28", branch: "Senate", action: "Rules supended" },
      {
        date: "2026-05-28",
        branch: "Senate",
        action: "Senate insisted on its amendment",
      },
      {
        date: "2026-05-28",
        branch: "Senate",
        action:
          "Committee of conference appointed (Rodrigues-Comerford-O'Connor), in concurrence",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action: "Reported, in part, by H5555",
      },
    ],
  },
  "S.3100": {
    number: "S.3100",
    title:
      "An Act making appropriations for the fiscal year 2027 for the maintenance of the departments, boards, commissions, institutions, and certain activities of the commonwealth, for interest, sinking fund, and serial bond requirements, and for certain permanent improvements",
    kind: "Amendment",
    pinslip:
      "Senate, May 21, 2026 – Text of the Senate amendment to the House Bill making appropriations for the fiscal year 2027 for the maintenance of the departments, boards, commissions, institutions and certain activities of the commonwealth, for interest, sinking fund and serial bond requirements and for certain permanent improvements (House, No. 4001) (being the text of Senate, No. 4, printed as amended). ",
    sponsor: null,
    cosponsors: [],
    textLength: 0,
    history: [
      {
        date: "2026-05-21",
        branch: "Senate",
        action: "Text of S4, reprinted as amended",
      },
      { date: "2026-05-21", branch: "Senate", action: "See H5501" },
    ],
  },
  "H.5555": {
    number: "H.5555",
    title:
      "An Act making appropriations for the fiscal year 2027 for the maintenance of the departments, boards, commissions, institutions, and certain activities of the commonwealth, for interest, sinking fund, and serial bond requirements, and for certain permanent improvements",
    kind: "Bill",
    pinslip: null,
    sponsor: "FY27 General Appropriation",
    cosponsors: [],
    textLength: 0,
    history: [
      {
        date: "2026-07-01",
        branch: "House",
        action: "Reported from the committee of conference",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action: "Reported on a part of H5501",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action:
          "Referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting, the question being on acceptance",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action:
          "Committee of conference report accepted - 142 YEAS to 6\r\nNAYS (See YEA and NAY No. 223)",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Committee of conference report accepted, in concurrence",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action: "Emergency preamble adopted",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Emergency preamble adopted",
      },
      {
        date: "2026-07-01",
        branch: "House",
        action: "Enacted - 142 YEAS to 6 NAYS (See YEA and NAY No. 224)",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Enacted -see Roll Call #200 (Yeas 39 to Nays 1)",
      },
      {
        date: "2026-07-01",
        branch: "Senate",
        action: "Laid before the Governor",
      },
      {
        date: "2026-07-09",
        branch: "Executive",
        action: "Signed by the Governor, Chapter 137 of the Acts of 2026",
      },
    ],
  },
  "H.4683": {
    number: "H.4683",
    title: "An Act relative to teacher preparation and student literacy",
    kind: "Bill",
    pinslip:
      "House bill No. 4672, as changed by the committee on Bills in the Third Reading, amended and passed to be engrossed by the House. October 29, 2025.",
    sponsor: null,
    cosponsors: [
      "Estela A. Reyes",
      "Alice Hanlon Peisch",
      "Danillo A. Sena",
      "Simon Cataldo",
      "Michael O. Moore",
      "Patrick Joseph Kearney",
      "Mary S. Keefe",
      "Bud L. Williams",
      "Patricia A. Duffy",
      "Margaret R. Scarsdale",
      "Andres X. Vargas",
      "Justin Thurber",
    ],
    textLength: 19090,
    history: [
      {
        date: "2025-10-29",
        branch: "House",
        action: "H4672, published as amended",
      },
      {
        date: "2025-10-29",
        branch: "House",
        action:
          "Passed to be engrossed - 155 YEAS to 0 NAYS (See YEA and NAY No. 104)",
      },
      {
        date: "2025-11-03",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      { date: "2026-01-22", branch: "Senate", action: "Also based on S2855" },
      {
        date: "2026-01-22",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendment striking out all after the enacting clause and inserting in place thereof the text of S2924",
      },
      {
        date: "2026-01-22",
        branch: "Senate",
        action: "Order relative to subject matter adopted ",
      },
      {
        date: "2026-01-22",
        branch: "Senate",
        action:
          "Placed in the Orders of the Day for Thursday, January 29, 2026",
      },
      { date: "2026-01-29", branch: "Senate", action: "Read second" },
      {
        date: "2026-01-29",
        branch: "Senate",
        action:
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S2924",
      },
      {
        date: "2026-01-29",
        branch: "Senate",
        action: "Reprinted, as amended, see S2940",
      },
      {
        date: "2026-01-29",
        branch: "Senate",
        action: "Ordered to a third reading ",
      },
      { date: "2026-01-29", branch: "Senate", action: "Read third " },
      {
        date: "2026-01-29",
        branch: "Senate",
        action:
          "Passed to be engrossed -see Roll Call #131 (Yeas 38 to Nays 0)",
      },
      { date: "2026-02-11", branch: "House", action: "Rules suspended" },
      {
        date: "2026-02-11",
        branch: "House",
        action: "House NON-concurred in the Senate amendment",
      },
      {
        date: "2026-02-11",
        branch: "House",
        action: "Committee of conference appointed - (Gordon-Cataldo-Marsi)",
      },
      { date: "2026-02-17", branch: "Senate", action: "Rules suspended " },
      {
        date: "2026-02-17",
        branch: "Senate",
        action: "Senate insisted on its amendment ",
      },
      {
        date: "2026-02-17",
        branch: "Senate",
        action:
          "Committee of conference appointed (DiDomenico-Lewis-O'Connor), in concurrence ",
      },
      { date: "2026-06-17", branch: "House", action: "Reported by H5511" },
    ],
  },
  "S.2940": {
    number: "S.2940",
    title: "An Act relative to teacher preparation and student literacy",
    kind: "Amendment",
    pinslip:
      "Senate, January 29, 2026 -- Text of the Senate amendment to the House Bill relative to teacher preparation and student literacy (House, No. 4683) (being the text of Senate, No. 2924, printed as amended)",
    sponsor: null,
    cosponsors: [],
    textLength: 16579,
    history: [
      {
        date: "2026-01-29",
        branch: "Senate",
        action: "Text of S2924, reprinted as amended",
      },
      { date: "2026-01-29", branch: "Senate", action: "See H4683" },
    ],
  },
  "H.5511": {
    number: "H.5511",
    title: "An Act relative to teacher preparation and student literacy",
    kind: "Bill",
    pinslip:
      "The committee of conference on the disagreeing votes of the two branches with reference to the Senate amendment of the House Bill relative to teacher preparation and student literacy (House, No. 4683), reports, recommending passage of the accompanying bill (House, No. 5511).",
    sponsor: "Teacher Preparation and Student Literacy",
    cosponsors: [
      "Estela A. Reyes",
      "Alice Hanlon Peisch",
      "Danillo A. Sena",
      "Simon Cataldo",
      "Michael O. Moore",
      "Patrick Joseph Kearney",
      "Mary S. Keefe",
      "Bud L. Williams",
      "Patricia A. Duffy",
      "Margaret R. Scarsdale",
      "Andres X. Vargas",
      "Justin Thurber",
    ],
    textLength: 0,
    history: [
      {
        date: "2026-06-17",
        branch: "House",
        action: "Reported from the committee of conference",
      },
      { date: "2026-06-17", branch: "House", action: "Reported on H4683" },
      {
        date: "2026-06-17",
        branch: "House",
        action:
          "Referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-06-17",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting, the question being on acceptance",
      },
      { date: "2026-06-17", branch: "House", action: "Rules suspended" },
      {
        date: "2026-06-17",
        branch: "House",
        action:
          "Committee of conference report accepted - 153 YEAS to 0 NAYS (See YEA and NAY No. 217)",
      },
      {
        date: "2026-06-18",
        branch: "Senate",
        action: "Committee of conference report accepted, in concurrence",
      },
      { date: "2026-06-18", branch: "House", action: "Enacted" },
      {
        date: "2026-06-18",
        branch: "Senate",
        action: "Enacted -see Roll Call #195 (Yeas 39 to Nays 0)",
      },
      {
        date: "2026-06-18",
        branch: "Senate",
        action: "Laid before the Governor",
      },
      {
        date: "2026-06-26",
        branch: "Executive",
        action: "Signed by the Governor, Chapter 113 of the Acts of 2026",
      },
    ],
  },
  "H.5280": {
    number: "H.5280",
    title:
      "An Act making appropriations for the fiscal year 2026 to provide for supplementing certain existing appropriations and for certain other activities and projects",
    kind: "Bill",
    pinslip:
      "House bill No. 5264, as amended and passed to be engrossed by the House. March 18, 2026.",
    sponsor: null,
    cosponsors: [],
    textLength: 0,
    history: [
      {
        date: "2026-03-18",
        branch: "House",
        action: "H5264, published as amended",
      },
      {
        date: "2026-03-18",
        branch: "House",
        action:
          "Passed to be engrossed - 150 YEAS to 3 NAYS (See YEA and NAY No. 145)",
      },
      {
        date: "2026-03-23",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      {
        date: "2026-04-02",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendment striking out all after the enacting clause and inserting in place thereof the text of S3041",
      },
      {
        date: "2026-04-02",
        branch: "Senate",
        action: "Order relative to subject matter adopted\r\n\r\n",
      },
      {
        date: "2026-04-02",
        branch: "Senate",
        action: "Placed in the Orders of the Day for Thursday, April 9, 2026",
      },
      { date: "2026-04-09", branch: "Senate", action: "Read second " },
      {
        date: "2026-04-09",
        branch: "Senate",
        action:
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S3041",
      },
      {
        date: "2026-04-09",
        branch: "Senate",
        action: "Reprinted, as amended, see S3054",
      },
      {
        date: "2026-04-09",
        branch: "Senate",
        action: "Ordered to a third reading ",
      },
      { date: "2026-04-09", branch: "Senate", action: "Read third" },
      {
        date: "2026-04-09",
        branch: "Senate",
        action:
          "Passed to be engrossed -see Roll Call #148 (Yeas 35 to Nays 4)",
      },
      { date: "2026-04-16", branch: "House", action: "Rules suspended" },
      {
        date: "2026-04-16",
        branch: "House",
        action: "House NON-concurred in the Senate amendment",
      },
      {
        date: "2026-04-16",
        branch: "House",
        action:
          "Committee of conference appointed - (Michlewitz-Diggs-Sweezey)",
      },
      { date: "2026-04-16", branch: "Senate", action: "Rules suspended" },
      {
        date: "2026-04-16",
        branch: "Senate",
        action: "Senate insisted on its amendment",
      },
      {
        date: "2026-04-16",
        branch: "Senate",
        action:
          "Committee of conference appointed  (Rodrigues-Comerford-O'connor), in concurrence",
      },
      {
        date: "2026-06-03",
        branch: "House",
        action: "Reported, in part, by H5470",
      },
    ],
  },
  "S.3054": {
    number: "S.3054",
    title:
      "An Act making appropriations for the fiscal year 2026 to provide for supplementing certain existing appropriations and for certain other activities and projects",
    kind: "Amendment",
    pinslip:
      "Senate, April 9, 2026 -- Text of the Senate amendment to the House Bill making appropriations for the fiscal year 2026 to provide for supplementing certain existing appropriations and for certain other activities and projects (Senate, No, 3054) (being the text of Senate document numbered 3041, printed as amended)",
    sponsor: null,
    cosponsors: [],
    textLength: 137027,
    history: [
      {
        date: "2026-04-09",
        branch: "Senate",
        action: "Text of S3041, reprinted as amended",
      },
      { date: "2026-04-09", branch: "Senate", action: "See H5280" },
    ],
  },
  "H.5470": {
    number: "H.5470",
    title:
      "An Act making appropriations for the fiscal year 2026 to provide for supplementing certain existing appropriations and for certain other activities and projects",
    kind: "Bill",
    pinslip:
      "The committee of conference on the disagreeing votes of the two branches with reference to the Senate amendment of the House Bill making appropriations for the fiscal year 2026 for supplementing certain existing appropriations and for certain other activities and projects (House, No. 5280), reports, in part, recommending passage of the accompanying bill (House, No. 5470).",
    sponsor: "FY26 Supplemental Appropriations",
    cosponsors: [],
    textLength: 0,
    history: [
      {
        date: "2026-06-02",
        branch: "House",
        action: "Reported from the committee of conference",
      },
      {
        date: "2026-06-03",
        branch: "House",
        action: "Reported on a part of H5280",
      },
      {
        date: "2026-06-03",
        branch: "House",
        action:
          "Referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-06-03",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting, the question being on acceptance\r\n",
      },
      { date: "2026-06-03", branch: "House", action: "Rules suspended" },
      {
        date: "2026-06-03",
        branch: "House",
        action:
          "Committee of conference report accepted - 153 YEAS to 0 NAYS (See YEA and NAY No. 199)",
      },
      {
        date: "2026-06-04",
        branch: "Senate",
        action:
          "Committee of conference report accepted, in concurrence -see Roll Call #188 (Yeas 37 to Nays 3)",
      },
      {
        date: "2026-06-04",
        branch: "House",
        action: "Emergency preamble adopted",
      },
      {
        date: "2026-06-04",
        branch: "Senate",
        action: "Emergency preamble adopted",
      },
      {
        date: "2026-06-04",
        branch: "House",
        action: "Enacted - 151 YEAS to 0 NAYS (See YEA and NAY No. 205)",
      },
      {
        date: "2026-06-04",
        branch: "Senate",
        action: "Enacted and laid before the Governor",
      },
      {
        date: "2026-06-12",
        branch: "Executive",
        action: "Signed by the Governor, Chapter 101 of the Acts of 2026",
      },
    ],
  },
  "H.4206": {
    number: "H.4206",
    title: "An Act modernizing the commonwealth’s cannabis laws",
    kind: "Bill",
    pinslip:
      "House bill No. 4187, as changed by the committee on Bills in the Third Reading, and as amended and passed to be engrossed by the House. June 4, 2025.",
    sponsor: null,
    cosponsors: [
      "Samantha Montaño",
      "Meghan K. Kilcoyne",
      "Mark J. Cusack",
      "Michael J. Soter",
      "David M. Rogers",
      "Susannah M. Whipps",
      "Chynah Tyler",
      "Manny Cruz",
      "Dawne Shand",
      "Michael P. Kushmerek",
      "John C. Velis",
      "Daniel Cahill",
      "Angelo J. Puppolo, Jr.",
      "Jacob R. Oliveira",
    ],
    textLength: 0,
    history: [
      {
        date: "2025-06-04",
        branch: "House",
        action:
          "Passed to be engrossed -\r\n153 YEAS to 0 NAYS (See YEA and NAY No. 55)",
      },
      {
        date: "2025-06-05",
        branch: "House",
        action: "H4187, published as amended",
      },
      {
        date: "2025-06-09",
        branch: "Senate",
        action: "Read; and referred to the committee on Senate Ways and Means",
      },
      {
        date: "2025-11-13",
        branch: "Senate",
        action:
          "Committee recommended ought to pass with an amendment striking out all after the enacting clause and inserting in place thereof the text of S2722",
      },
      {
        date: "2025-11-13",
        branch: "Senate",
        action: "Order relative to subject matter adopted ",
      },
      {
        date: "2025-11-13",
        branch: "Senate",
        action:
          "Placed in the Orders of the Day for Wednesday, November 19, 2025",
      },
      { date: "2025-11-19", branch: "Senate", action: "Read second" },
      {
        date: "2025-11-19",
        branch: "Senate",
        action:
          "Amended by striking out all after the enacting clause and inserting in place thereof the text of S2722",
      },
      {
        date: "2025-11-19",
        branch: "Senate",
        action: "Reprinted, as amended, see S2749",
      },
      {
        date: "2025-11-19",
        branch: "Senate",
        action: "Ordered to a third reading ",
      },
      { date: "2025-11-19", branch: "Senate", action: "Read third " },
      {
        date: "2025-11-19",
        branch: "Senate",
        action:
          "Passed to be engrossed -- see Roll Call #116 (Yeas 30 to Nays 7)",
      },
      { date: "2025-12-24", branch: "House", action: "Rules suspended" },
      {
        date: "2025-12-24",
        branch: "House",
        action: "House NON-concurred in the Senate amendment",
      },
      {
        date: "2025-12-24",
        branch: "House",
        action: "Committee of conference appointed - (Donahue-Gonzalez-Soter)",
      },
      { date: "2025-12-31", branch: "Senate", action: "Rules suspended" },
      {
        date: "2025-12-31",
        branch: "Senate",
        action: "Senate insisted on its amendment ",
      },
      {
        date: "2025-12-31",
        branch: "Senate",
        action:
          "Committee of conference appointed (Gomez-Comerford-Durant), in concurrence",
      },
      { date: "2026-04-06", branch: "House", action: "Reported by H5350" },
    ],
  },
  "S.2749": {
    number: "S.2749",
    title: "An Act modernizing the commonwealth’s cannabis laws",
    kind: "Amendment",
    pinslip:
      "Senate, November 19, 2025 -- Text of the Senate amendment to the House Bill modernizing the commonwealth’s cannabis laws (being the text of Senate document numbered 2722, printed as amended)",
    sponsor: null,
    cosponsors: [],
    textLength: 45996,
    history: [
      {
        date: "2025-11-19",
        branch: "Senate",
        action: "Text of S2722, reprinted as amended",
      },
      { date: "2025-11-19", branch: "Senate", action: "See H4206" },
    ],
  },
  "H.5350": {
    number: "H.5350",
    title: "An Act modernizing the commonwealth’s cannabis laws",
    kind: "Bill",
    pinslip:
      "The committee of conference on the disagreeing votes of the two branches with reference to the Senate amendment of the House Bill modernizing the Commonwealth’s cannabis laws (House, No. 4206), reports, recommending passage of the accompanying bill (House, No. 5350).",
    sponsor: "Cannabis Laws",
    cosponsors: [
      "Samantha Montaño",
      "Meghan K. Kilcoyne",
      "Mark J. Cusack",
      "Michael J. Soter",
      "David M. Rogers",
      "Susannah M. Whipps",
      "Chynah Tyler",
      "Manny Cruz",
      "Dawne Shand",
      "Michael P. Kushmerek",
      "John C. Velis",
      "Daniel Cahill",
      "Angelo J. Puppolo, Jr.",
      "Jacob R. Oliveira",
    ],
    textLength: 0,
    history: [
      {
        date: "2026-04-06",
        branch: "House",
        action: "Reported from the committee of conference",
      },
      { date: "2026-04-06", branch: "House", action: "Reported on H4206" },
      {
        date: "2026-04-06",
        branch: "House",
        action:
          "Referred to the committee on House Steering, Policy and Scheduling",
      },
      {
        date: "2026-04-06",
        branch: "House",
        action:
          "Committee reported that the matter be placed in the Orders of the Day for the next sitting, the question being on acceptance",
      },
      { date: "2026-04-08", branch: "House", action: "Rules suspended" },
      {
        date: "2026-04-08",
        branch: "House",
        action:
          "Committee of conference report accepted - 155 YEAS to 0 NAYS (See YEA and NAY No. 151)",
      },
      {
        date: "2026-04-09",
        branch: "Senate",
        action: "Committee of conference report accepted, in concurrence ",
      },
      {
        date: "2026-04-09",
        branch: "House",
        action: "Emergency preamble adopted",
      },
      {
        date: "2026-04-09",
        branch: "Senate",
        action: "Emergency preamble adopted",
      },
      { date: "2026-04-09", branch: "House", action: "Enacted" },
      {
        date: "2026-04-09",
        branch: "Senate",
        action: "Enacted -see Roll Call #146 (Yeas 33 to Nays 6)",
      },
      {
        date: "2026-04-09",
        branch: "Senate",
        action: "Laid before the Governor",
      },
      {
        date: "2026-04-19",
        branch: "Executive",
        action: "Signed by the Governor, Chapter 65 of the Acts of 2026",
      },
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
  "H.5175": ["H.5151", "H.5175"],
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
