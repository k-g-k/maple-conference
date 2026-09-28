// House Ways and Means, the 194th General Court.
//
// The committee that struck the entire Senate text of the phone bill and wrote
// a new one, without publishing a vote. Thirty-three members, a fifth of the
// House, so "the committee rewrote it" is a claim about a lot of people and the
// page should be able to name them.
//
// Not from the API: /Committees/H34 returns the chairs and nothing else, so the
// membership and the roles come from the committee's own page for the 194th,
// and each member's district and party from the members API for the same court.
// The vice chair seat is recorded as vacant, which is why Diggs is assistant
// vice chair and nobody is vice chair.
//
// Keys are the lineage map's seat keys, so a district reading "3rd Suffolk" is
// stored as "Suffolk-3". Portraits are the General Court's own.

import cBPC0 from "../../../assets/legislators/BPC0.jpg";
import cMJR0 from "../../../assets/legislators/MJR0.jpg";
import cPJD0 from "../../../assets/legislators/PJD0.jpg";
import cAHP1 from "../../../assets/legislators/AHP1.jpg";
import cFAM1 from "../../../assets/legislators/FAM1.jpg";
import cDTV1 from "../../../assets/legislators/DTV1.jpg";
import sJML0 from "../../../assets/legislators/jml0.jpg";
import sPDJ0 from "../../../assets/legislators/PDJ0.jpg";
import sSND0 from "../../../assets/legislators/SND0.jpg";
import sRKK0 from "../../../assets/legislators/RKK0.jpg";
import sPMP0 from "../../../assets/legislators/PMP0.jpg";
import sPMO from "../../../assets/legislators/PMO.jpg";
import pAMM1 from "../../../assets/legislators/AMM1.jpg";
import pKAD1 from "../../../assets/legislators/KAD1.jpg";
import pTMS2 from "../../../assets/legislators/TMS2.jpg";
import pSBA1 from "../../../assets/legislators/SBA1.jpg";
import pD_B1 from "../../../assets/legislators/D_B1.jpg";
import pMSC1 from "../../../assets/legislators/MSC1.jpg";
import pM_C3 from "../../../assets/legislators/M_C3.jpg";
import pPAD1 from "../../../assets/legislators/PAD1.jpg";
import pJAG2 from "../../../assets/legislators/JAG2.jpg";
import pRMH2 from "../../../assets/legislators/RMH2.jpg";
import pJKH1 from "../../../assets/legislators/JKH1.jpg";
import pN_H1 from "../../../assets/legislators/N_H1.jpg";
import pREH1 from "../../../assets/legislators/REH1.jpg";
import pK_K2 from "../../../assets/legislators/K_K2.jpg";
import pPJK1 from "../../../assets/legislators/PJK1.jpg";
import pSPK1 from "../../../assets/legislators/SPK1.jpg";
import pM_K1 from "../../../assets/legislators/M_K1.jpg";
import pJJM1 from "../../../assets/legislators/JJM1.jpg";
import pJDM1 from "../../../assets/legislators/JDM1.jpg";
import pRAM1 from "../../../assets/legislators/RAM1.jpg";
import pS_M1 from "../../../assets/legislators/S_M1.jpg";
import pJFM1 from "../../../assets/legislators/JFM1.jpg";
import pSCO1 from "../../../assets/legislators/SCO1.jpg";
import pKWP1 from "../../../assets/legislators/KWP1.jpg";
import pO_R1 from "../../../assets/legislators/O_R1.jpg";
import pL_S1 from "../../../assets/legislators/L_S1.jpg";
import pMRS1 from "../../../assets/legislators/MRS1.jpg";
import pA_S1 from "../../../assets/legislators/A_S1.jpg";
import pPSS1 from "../../../assets/legislators/PSS1.jpg";
import pAMS2 from "../../../assets/legislators/AMS2.jpg";
import pC_T1 from "../../../assets/legislators/C_T1.jpg";
import pMSV1 from "../../../assets/legislators/MSV1.jpg";
import pSGX1 from "../../../assets/legislators/SGX1.jpg";

export interface CommitteeMember {
  /** Seat key, matching the vote maps. */
  key: string;
  /** The General Court's member code, e.g. "AMM1". */
  code: string;
  name: string;
  district: string;
  /** "D" or "R". */
  party: string;
  portrait: string;
  /** Only where the committee names one. Most members hold no office. */
  role?: string;
}

/** Officers first, then everyone else by surname. */
export const HOUSE_WAYS_AND_MEANS: CommitteeMember[] = [
  { key: "Suffolk-3", code: "AMM1", name: "Aaron Michlewitz", district: "3rd Suffolk", party: "D", portrait: pAMM1, role: "Chair" },
  { key: "Barnstable-2", code: "KAD1", name: "Kip A. Diggs", district: "2nd Barnstable", party: "D", portrait: pKAD1, role: "Assistant Vice Chair" },
  { key: "Hampden-1", code: "TMS2", name: "Todd M. Smola", district: "1st Hampden", party: "R", portrait: pTMS2, role: "Ranking Minority" },
  { key: "Hampden-8", code: "SBA1", name: "Shirley B. Arriaga", district: "8th Hampden", party: "D", portrait: pSBA1 },
  { key: "Suffolk-4", code: "D_B1", name: "David Biele", district: "4th Suffolk", party: "D", portrait: pD_B1 },
  { key: "Bristol-1", code: "MSC1", name: "Michael S. Chaisson", district: "1st Bristol", party: "R", portrait: pMSC1 },
  { key: "Essex-7", code: "M_C3", name: "Manny Cruz", district: "7th Essex", party: "D", portrait: pM_C3 },
  { key: "Hampden-5", code: "PAD1", name: "Patricia A. Duffy", district: "5th Hampden", party: "D", portrait: pPAD1 },
  { key: "Suffolk-11", code: "JAG2", name: "Judith A. Garcia", district: "11th Suffolk", party: "D", portrait: pJAG2 },
  { key: "Essex-15", code: "RMH2", name: "Ryan M. Hamilton", district: "15th Essex", party: "D", portrait: pRMH2 },
  { key: "Bristol-2", code: "JKH1", name: "James K. Hawkins", district: "2nd Bristol", party: "D", portrait: pJKH1 },
  { key: "Worcester-4", code: "N_H1", name: "Natalie M. Higgins", district: "4th Worcester", party: "D", portrait: pN_H1 },
  { key: "Suffolk-6", code: "REH1", name: "Russell E. Holmes", district: "6th Suffolk", party: "D", portrait: pREH1 },
  { key: "Essex-2", code: "K_K2", name: "Kristin E. Kassner", district: "2nd Essex", party: "D", portrait: pK_K2 },
  { key: "Plymouth-4", code: "PJK1", name: "Patrick Joseph Kearney", district: "4th Plymouth", party: "D", portrait: pPJK1 },
  { key: "Essex-13", code: "SPK1", name: "Sally P. Kerans", district: "13th Essex", party: "D", portrait: pSPK1 },
  { key: "Worcester-12", code: "M_K1", name: "Meghan K. Kilcoyne", district: "12th Worcester", party: "D", portrait: pM_K1 },
  { key: "Worcester-6", code: "JJM1", name: "John J. Marsi", district: "6th Worcester", party: "R", portrait: pJJM1 },
  { key: "Worcester-18", code: "JDM1", name: "Joseph D. McKenna", district: "18th Worcester", party: "R", portrait: pJDM1 },
  { key: "Plymouth-11", code: "RAM1", name: "Rita A. Mendes", district: "11th Plymouth", party: "D", portrait: pRAM1 },
  { key: "Suffolk-15", code: "S_M1", name: "Samantha Monta\u00f1o", district: "15th Suffolk", party: "D", portrait: pS_M1 },
  { key: "Suffolk-9", code: "JFM1", name: "John Francis Moran", district: "9th Suffolk", party: "D", portrait: pJFM1 },
  { key: "Middlesex-29", code: "SCO1", name: "Steven Owens", district: "29th Middlesex", party: "D", portrait: pSCO1 },
  { key: "Hampden-4", code: "KWP1", name: "Kelly W. Pease", district: "4th Hampden", party: "R", portrait: pKWP1 },
  { key: "Hampden-9", code: "O_R1", name: "Orlando Ramos", district: "9th Hampden", party: "D", portrait: pO_R1 },
  { key: "Hampshire-1", code: "L_S1", name: "Lindsay N. Sabadosa", district: "1st Hampshire", party: "D", portrait: pL_S1 },
  { key: "Middlesex-1", code: "MRS1", name: "Margaret R. Scarsdale", district: "1st Middlesex", party: "D", portrait: pMRS1 },
  { key: "Bristol-7", code: "A_S1", name: "Alan Silvia", district: "7th Bristol", party: "D", portrait: pA_S1 },
  { key: "Middlesex-6", code: "PSS1", name: "Priscila S. Sousa", district: "6th Middlesex", party: "D", portrait: pPSS1 },
  { key: "Plymouth-7", code: "AMS2", name: "Alyson M. Sullivan-Almeida", district: "7th Plymouth", party: "R", portrait: pAMS2 },
  { key: "Suffolk-7", code: "C_T1", name: "Chynah Tyler", district: "7th Suffolk", party: "D", portrait: pC_T1 },
  { key: "Norfolk-9", code: "MSV1", name: "Marcus S. Vaughn", district: "9th Norfolk", party: "R", portrait: pMSV1 },
  { key: "Barnstable-5", code: "SGX1", name: "Steven George Xiarhos", district: "5th Barnstable", party: "R", portrait: pSGX1 },
];

import eKIG1 from "../../../assets/legislators/KIG1.jpg";
import eBJA1 from "../../../assets/legislators/BJA1.jpg";
import eS_C1 from "../../../assets/legislators/S_C1.jpg";
import eMPK1 from "../../../assets/legislators/MPK1.jpg";
import eBMP1 from "../../../assets/legislators/BMP1.jpg";
import eCJW1 from "../../../assets/legislators/CJW1.jpg";

/**
 * The Joint Committee on Education, House side.
 *
 * Joint means both chambers sit on it, seventeen members in all, but a joint
 * committee does not carry language across the aisle. It sorts the bills before
 * it by the branch they were filed in and reports each pile back into that
 * branch as its own draft. Here that produced two different bills months apart:
 * S.2549 out to the Senate on 10 Jul 2025, and H.4745 out to the House on
 * 17 Nov 2025, with a different title, a different chapter of the General Laws,
 * and more than twice the text.
 *
 * So only the House members are here. A House page showing the six senators
 * would imply they had a hand in this draft's language, and the record does not
 * say that.
 */
export const HOUSE_EDUCATION: CommitteeMember[] = [
  { key: "Middlesex-21", code: "KIG1", name: "Kenneth I. Gordon", district: "21st Middlesex", party: "D", portrait: eKIG1, role: "House Chair" },
  { key: "Norfolk-1", code: "BJA1", name: "Bruce J. Ayers", district: "1st Norfolk", party: "D", portrait: eBJA1, role: "House Vice Chair" },
  { key: "Worcester-6", code: "JJM1", name: "John J. Marsi", district: "6th Worcester", party: "R", portrait: pJJM1, role: "Ranking Minority" },
  { key: "Middlesex-14", code: "S_C1", name: "Simon Cataldo", district: "14th Middlesex", party: "D", portrait: eS_C1 },
  { key: "Essex-7", code: "M_C3", name: "Manny Cruz", district: "7th Essex", party: "D", portrait: pM_C3 },
  { key: "Suffolk-11", code: "JAG2", name: "Judith A. Garcia", district: "11th Suffolk", party: "D", portrait: pJAG2 },
  { key: "Worcester-3", code: "MPK1", name: "Michael P. Kushmerek", district: "3rd Worcester", party: "D", portrait: eMPK1 },
  { key: "Plymouth-9", code: "BMP1", name: "Bridget Plouffe", district: "9th Plymouth", party: "D", portrait: eBMP1 },
  { key: "Middlesex-6", code: "PSS1", name: "Priscila S. Sousa", district: "6th Middlesex", party: "D", portrait: pPSS1 },
  { key: "Plymouth-7", code: "AMS2", name: "Alyson M. Sullivan-Almeida", district: "7th Plymouth", party: "R", portrait: pAMS2 },
  { key: "Suffolk-5", code: "CJW1", name: "Christopher J. Worrell", district: "5th Suffolk", party: "D", portrait: eCJW1 },
];

/**
 * The same committee, Senate side.
 *
 * Not used by a House bill's page, and deliberately kept: these are the six who
 * sat on S.2549, so this is the roster a Senate page wants. Stored here rather
 * than fetched again when that page exists.
 */
export const SENATE_EDUCATION: CommitteeMember[] = [
  { key: "S:J. Lewis", code: "jml0", name: "Jason M. Lewis", district: "Fifth Middlesex", party: "D", portrait: sJML0, role: "Senate Chair" },
  { key: "S:Jehlen", code: "PDJ0", name: "Patricia D. Jehlen", district: "Second Middlesex", party: "D", portrait: sPDJ0, role: "Senate Vice Chair" },
  { key: "S:O'Connor", code: "PMO", name: "Patrick M. O'Connor", district: "First Plymouth and Norfolk", party: "R", portrait: sPMO, role: "Ranking Minority" },
  { key: "S:DiDomenico", code: "SND0", name: "Sal N. DiDomenico", district: "Middlesex and Suffolk", party: "D", portrait: sSND0 },
  { key: "S:Kennedy", code: "RKK0", name: "Robyn K. Kennedy", district: "First Worcester", party: "D", portrait: sRKK0 },
  { key: "S:Payano", code: "PMP0", name: "Pavel M. Payano", district: "First Essex", party: "D", portrait: sPMP0 },
];

/**
 * The conference committee on S.2581 / H.5366.
 *
 * Six people, three named by each chamber, and the only body in this lineage
 * that carries language across the aisle. The Senate named its three on 7 May
 * 2026 and the House named its three on 20 May, both on voice votes.
 *
 * Senate keys are "S:Surname" and House keys are "County-N", which is how the
 * maps tell the two apart without a field for it.
 */
export const CONFEREES: CommitteeMember[] = [
  { key: "S:Crighton", code: "BPC0", name: "Brendan P. Crighton", district: "Third Essex", party: "D", portrait: cBPC0, role: "Chair" },
  { key: "S:Rodrigues", code: "MJR0", name: "Michael J. Rodrigues", district: "First Bristol and Plymouth", party: "D", portrait: cMJR0 },
  { key: "S:Durant", code: "PJD0", name: "Peter J. Durant", district: "Worcester and Hampshire", party: "R", portrait: cPJD0 },
  { key: "Norfolk-14", code: "AHP1", name: "Alice Hanlon Peisch", district: "14th Norfolk", party: "D", portrait: cAHP1, role: "Chair" },
  { key: "Essex-17", code: "FAM1", name: "Frank A. Moran", district: "17th Essex", party: "D", portrait: cFAM1 },
  { key: "Barnstable-3", code: "DTV1", name: "David T. Vieira", district: "3rd Barnstable", party: "R", portrait: cDTV1 },
];
