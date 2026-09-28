// The public meetings each conference committee has noticed.
//
// A conference deliberates in private, but it has to notice its meetings like
// any other committee, and those notices are the only public trace of a
// committee that is otherwise silent between appointment and report. Ten of the
// twelve sitting committees have noticed at least one; the higher education and
// economic development conferences have noticed none.
//
// From the General Court's own event list for 1 May to 1 December 2026, with
// each event's date, time and room read from /api/Hearings/{eventId} rather
// than from the list page, whose date cells are grouped and so belong to the
// first row of a day rather than to every row.

export interface Meeting {
  /** The General Court's event id, which is also its public URL. */
  eventId: number;
  /** ISO, so it sorts. */
  date: string;
  /** 24-hour, as the API gives it. */
  time: string;
  room: string;
  /** The notice's own wording, which is rarely the committee's name. */
  description: string;
  /**
   * How the events list names this conference, minus its "(Conference
   * Committee)" suffix. This is the closest thing the committee has to an
   * official name, and it is not always the bill's title: the public records
   * conference is listed as "State Government Transparency and Access".
   */
  title: string;
  /**
   * The notice's own sentence, verbatim.
   *
   * The phrasing is not consistent between committees because the notices are
   * not: some read "to resolve differences between H.5366 and S.2581", some
   * "a meeting of the committee of conference relative to benefits for
   * teachers", some just restate the subject. Kept as written rather than
   * normalised, because it is the committee describing itself.
   */
  byline?: string;
  /** Filed as a Special Event rather than a Hearing, so its URL differs. */
  special?: boolean;
}

/** Keyed by committee slug. */
export const MEETINGS: Record<string, Meeting[]> = {
  "phone-free-schools": [
    {
      eventId: 5710,
      byline:
        "Conference Committee of the House and Senate to Resolve Differences Between H.5366 and S.2581",
      title: "To promote student learning and mental health",
      date: "2026-06-04",
      time: "13:00",
      room: "Room 348",
      description: "Student learning and mental health",
    },
  ],
  "data-privacy": [
    {
      eventId: 5739,
      byline: "Data Privacy Conference Committee Initial Meeting",
      title: "Massachusetts Data Privacy Act",
      date: "2026-07-07",
      time: "14:00",
      room: "A-2",
      description: "Data Privacy Conference Committee Initial Meeting",
    },
    {
      eventId: 5752,
      byline: "Data Privacy Conference Committee Second Public Meeting",
      title: "Massachusetts Data Privacy Act",
      date: "2026-07-30",
      time: "14:00",
      room: "A-2 and Virtual",
      description: "Data Privacy Conference Committee Meeting",
    },
  ],
  "mass-ready": [
    {
      eventId: 5740,
      byline:
        "Conference Committee of the House and Senate to Resolve Differences Between S.3064 and H.5518",
      title: "Environmental Bond",
      date: "2026-07-08",
      time: "14:30",
      room: "428A",
      description: "To resolve differences between S.3064 and H.5518",
    },
  ],
  "energy-affordability": [
    {
      eventId: 5758,
      byline:
        "Representative Mark J. Cusack and Senator Michael J. Barrett will host a meeting of the committee of conference relative to energy affordability, clean power and economic competitiveness",
      title: "Energy",
      date: "2026-07-29",
      time: "13:00",
      room: "428A",
      description: "Energy Committee of Conference, H.5175 and S.3166",
    },
  ],
  "ballot-question-finance": [
    {
      eventId: 5765,
      byline:
        "Improving campaign finance reporting for statewide ballot questions Conference Committee meeting",
      title:
        "Improving campaign finance reporting for statewide ballot questions",
      date: "2026-07-31",
      time: "10:30",
      room: "405",
      description:
        "Improving campaign finance reporting for statewide ballot questions",
    },
  ],
  "pets-act": [
    {
      eventId: 5762,
      byline: "Pet equity, treatment and safety Conference Committee Meeting",
      title: "Pet equity, treatment and safety",
      date: "2026-07-31",
      time: "12:30",
      room: "222",
      description: "Pet equity, treatment and safety",
    },
  ],
  "teacher-benefits": [
    {
      eventId: 5766,
      byline:
        "Representative Daniel Ryan and Senator Michael J. Rodrigues will host a meeting of the committee of conference relative to benefits for teachers, H.4361 and S.3109",
      title: "Teachers Benefits",
      date: "2026-07-31",
      time: "13:30",
      room: "212",
      description:
        "Teacher Benefits Committee of Conference, H.4361 and S.3109",
    },
  ],
  "public-records": [
    {
      eventId: 5767,
      byline:
        "The Public Records Conference Committee (H.5469 and S.3244) will hold its first public meeting",
      title: "State Government Transparency and Access",
      date: "2026-07-31",
      time: "16:00",
      room: "Room 312A",
      description: "First public meeting of the Public Records conference",
    },
  ],
  "workplace-violence": [
    {
      eventId: 5774,
      byline:
        "Conference Committee of the House and Senate to Resolve Differences Between H.4767 and S.3184",
      title: "Health Care Workplace Violence",
      date: "2026-09-03",
      time: "14:00",
      room: "428A",
      description: "To resolve differences between H.4767 and S.3184",
    },
    {
      eventId: 5780,
      byline:
        "Conference Committee of the House and Senate to Resolve Differences Between H.4767 and S.3184",
      title: "Health Care Workplace Violence",
      date: "2026-09-23",
      time: "11:00",
      room: "Room 348",
      description: "To resolve differences between H.4767 and S.3184",
    },
  ],
  "economic-development": [
    {
      eventId: 449,
      special: true,
      date: "2026-07-31",
      time: "11:00",
      room: "Room 243",
      description: "Economic Development Conference Meeting",
      title: "Economic Development",
      byline:
        "Rep Michlewitz and Sen Finegold are the Chairs and hosts of the meeting. The bills being conferenced are H.5576 and S.3228",
    },
  ],
  "primary-care": [
    {
      eventId: 5781,
      byline:
        "Conference Committee of the House and Senate to Resolve Differences Between S.3141 and H.5630",
      title: "Primary care for you",
      date: "2026-09-17",
      time: "13:00",
      room: "428A",
      description: "To resolve differences between S.3141 and H.5630",
    },
  ],
};

export const meetingUrl = (m: Meeting) =>
  m.special
    ? `https://malegislature.gov/Events/SpecialEvents/Detail/${m.eventId}`
    : `https://malegislature.gov/Events/Hearings/Detail/${m.eventId}`;

/** "4 June 2026", from the ISO the API gives. */
export const meetingDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/**
 * How the legislature records each conference, for picking and choosing.
 *
 * Taken from the events list, minus its "(Conference Committee)" suffix. It is
 * a third naming, agreeing with neither chamber's bill title: the public
 * records conference is listed as "State Government Transparency and Access"
 * and Mass Ready as "Environmental Bond". Held here so a page can use it where
 * it helps and ignore it where it does not.
 */
export const legislatureName = (slug: string): string | undefined =>
  MEETINGS[slug]?.[0]?.title;
