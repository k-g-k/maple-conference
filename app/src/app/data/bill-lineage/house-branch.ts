// The House's own route on phones in schools, which is the half the lineage was
// missing.
//
// Six representatives filed six bills. The Education Committee merged them into
// H.4745 on 17 November 2025 and sent it to House Ways and Means, where it
// stopped. Five months later the same committee took the Senate's bill instead
// and replaced its text, and that replacement is H.5349.
//
// So the House had a vehicle of its own and set it aside. Without these two
// steps the lineage opens with "House Ways and Means struck everything" and
// leaves a reader with no idea what they struck it in favour of.
//
// One inference, marked as one: the Pinslip for H.5349 names only S.2581, the
// bill it amends. That H.5349's text came from H.4745 is not stated anywhere.
// It is the same title, out of the same committee, five months after H.4745
// landed there, which is strong but is not the record saying so.

import type { Stage } from "./index";

import pDFD1 from "../../../assets/legislators/DFD1.jpg";
import pCAF1 from "../../../assets/legislators/CAF1.jpg";
import pAHP1 from "../../../assets/legislators/AHP1.jpg";
import pAJS1 from "../../../assets/legislators/AJS1.jpg";
import pJ_T1 from "../../../assets/legislators/J_T1.jpg";
import pJRT1 from "../../../assets/legislators/JRT1.jpg";

export interface HouseOrigin {
  num: string;
  title: string;
  sponsor: string;
  /** The General Court's member code, e.g. "AHP1". */
  code: string;
  district: string;
  /** "D" or "R". */
  party: string;
  portrait: string;
  /** Seat key, matching the vote maps. */
  key: string;
}

export const HOUSE_ORIGINS: HouseOrigin[] = [
  {
    num: "H.549",
    title: "An Act to regulate the use of mobile communication devices in educational institutions",
    sponsor: "David F. DeCoste",
    code: "DFD1",
    district: "5th Plymouth",
    party: "R",
    portrait: pDFD1,
    key: "Plymouth-5",
  },
  {
    num: "H.574",
    title: "An Act relative to the use of mobile devices in public schools",
    sponsor: "Carole A. Fiola",
    code: "CAF1",
    district: "6th Bristol",
    party: "D",
    portrait: pCAF1,
    key: "Bristol-6",
  },
  {
    num: "H.666",
    title: "An Act promoting safe technology use and distraction-free education for youth",
    sponsor: "Alice Hanlon Peisch",
    code: "AHP1",
    district: "14th Norfolk",
    party: "D",
    portrait: pAHP1,
    key: "Norfolk-14",
  },
  {
    num: "H.696",
    title: "An Act establishing a commission regarding phones in schools",
    sponsor: "Adam J. Scanlon",
    code: "AJS1",
    district: "14th Bristol",
    party: "D",
    portrait: pAJS1,
    key: "Bristol-14",
  },
  {
    num: "H.715",
    title: "An Act relative to phone-free schools",
    sponsor: "Joshua Tarsky",
    code: "J_T1",
    district: "13th Norfolk",
    party: "D",
    portrait: pJ_T1,
    key: "Norfolk-13",
  },
  {
    num: "H.720",
    title: "An Act prohibiting cell phone usage during the school day",
    sponsor: "Jeffrey Rosario Turco",
    code: "JRT1",
    district: "19th Suffolk",
    party: "D",
    portrait: pJRT1,
    key: "Suffolk-19",
  },
];

/** The two steps that precede the vehicle swap, oldest first. */
export const HOUSE_EARLY_STAGES: Stage[] = [
  {
    id: "h-filed",
    label: "6 bills filed",
    date: "Feb 2025",
    chamber: "House",
    head: "Six separate House bills",
    body: "Six representatives filed six bills on phones in schools. All were referred to the Joint Committee on Education and heard alongside the Senate’s seven on 17 June 2025. Peisch, who filed one of them, now sits on the conference committee.",
  },
  {
    id: "h4745",
    label: "H.4745",
    date: "17 Nov 2025",
    chamber: "House",
    head: "Education Committee sent one consolidated bill to Ways & Means",
    body: "Massachusetts policy committees are joint: each has members from both the House and the Senate, and related bills from both chambers are heard together. A joint committee sends its work on to one branch at a time, though, so the House bills and the Senate bills come back out separately. Ways and Means is the committee that weighs what a bill would cost. That referral is the last action recorded on this draft.",
  },
];

/**
 * Where the vehicle changes hands.
 *
 * The step after this one is not a later printing of the step before it: the
 * House abandoned H.4745 and started amending the Senate's bill instead. Every
 * other gap in this chain is one document becoming the next, so this one has to
 * look different or it reads as continuous when it is not.
 */
export const VEHICLE_SWAP_BEFORE = "h5349";
