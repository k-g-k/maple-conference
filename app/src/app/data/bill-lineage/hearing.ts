// The one public hearing in this bill's lineage.
//
// Thirteen bills, two chambers, one afternoon. The Joint Committee on Education
// heard all six House filings and all seven Senate filings together on 17 June
// 2025, alongside 28 other bills, and each branch then produced its own redraft
// from the same afternoon: the Senate's three weeks later, the House's five
// months later.
//
// It is also the only one. No hearing in the 194th covers S.2549, S.2561,
// S.2581, H.5349 or H.5366. That is correct rather than a gap in the fetch:
// once a committee reports, a bill is on the floor, and floor action takes no
// testimony. Every step after this afternoon happened without a public hearing,
// which on a testimony platform is the most pointed fact on the timeline.
//
// From the General Court's own event record rather than from reporting:
//
//   /api/GeneralCourts/194/Committees/J14   the committee's own hearing list
//   /api/Hearings/5220                      this one, and its agenda
//
// The agenda is the only join available. There is no bill-to-hearing lookup,
// only hearing-to-bills, so this was found by checking the Education
// committee's eighteen hearings against the thirteen documents in the lineage.
//
// The agenda was how it was found, but it is not how it would be found live:
// every one of the thirteen filings carries the hearing in its own history as
// "Hearing scheduled for 06/17/2025", posted 6 June. The same endpoint the
// rest of the lineage already reads.

export interface Hearing {
  /** The General Court's event id, which is also its public URL. */
  eventId: number;
  committee: string;
  /** The committee's code, for anything that needs to go back to the API. */
  committeeCode: string;
  date: string;
  /** The agenda's topic, which is the committee's framing and not the bill's. */
  topic: string;
  room: string;
  city: string;
  /** Every document heard that day, ours and everyone else's. */
  agendaSize: number;
  /** How many of those were filings on this bill's subject. */
  ours: number;
}

export const EDUCATION_HEARING: Hearing = {
  eventId: 5220,
  committee: "Joint Committee on Education",
  committeeCode: "J14",
  date: "17 Jun 2025",
  topic: "School Climate and Safety",
  room: "Room B-2",
  city: "24 Beacon Street, Boston",
  agendaSize: 41,
  ours: 13,
};

/** The General Court's public page for a hearing. */
export const hearingUrl = (eventId: number) =>
  `https://malegislature.gov/Events/Hearings/Detail/${eventId}`;
