// Who runs each chamber, the 194th General Court.
//
// A roll call is the whole chamber acting, so the step has no committee to
// name. The people who set that chamber's agenda are the nearest thing to an
// actor, and naming them is more use than leaving the space empty.
//
// Three each, the officers a floor vote actually runs through: the presiding
// officer, the leader of the majority, and the leader of the minority. The
// General Court names a dozen more assistant leaders and division chairs;
// they are on the leadership page and are not what a vote turns on.
//
// From malegislature.gov/Legislators/Leadership, with districts and party from
// the members API for the same court. The leadership page lists a member's home
// town rather than their district.

import type { CommitteeMember } from "./committees";

import lR_M1 from "../../../assets/legislators/R_M1.jpg";
import lMJM1 from "../../../assets/legislators/MJM1.jpg";
import lBHJ1 from "../../../assets/legislators/BHJ1.jpg";
import lKES0 from "../../../assets/legislators/KES0.jpg";
import lCSC0 from "../../../assets/legislators/CSC0.jpg";
import lBET0 from "../../../assets/legislators/BET0.jpg";

export const HOUSE_LEADERSHIP: CommitteeMember[] = [
  { key: "Norfolk-3", code: "R_M1", name: "Ronald Mariano", district: "3rd Norfolk", party: "D", portrait: lR_M1, role: "Speaker" },
  { key: "Suffolk-18", code: "MJM1", name: "Michael J. Moran", district: "18th Suffolk", party: "D", portrait: lMJM1, role: "Majority Leader" },
  { key: "Middlesex-20", code: "BHJ1", name: "Bradley H. Jones, Jr.", district: "20th Middlesex", party: "R", portrait: lBHJ1, role: "Minority Leader" },
];

export const SENATE_LEADERSHIP: CommitteeMember[] = [
  { key: "S:Spilka", code: "KES0", name: "Karen E. Spilka", district: "Middlesex and Norfolk", party: "D", portrait: lKES0, role: "President" },
  { key: "S:Creem", code: "CSC0", name: "Cynthia Stone Creem", district: "Norfolk and Middlesex", party: "D", portrait: lCSC0, role: "Majority Leader" },
  { key: "S:Tarr", code: "BET0", name: "Bruce E. Tarr", district: "First Essex and Middlesex", party: "R", portrait: lBET0, role: "Minority Leader" },
];
