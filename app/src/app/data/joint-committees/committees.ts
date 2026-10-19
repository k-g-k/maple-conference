// The joint committees of the 194th General Court, and who sits on each.
//
// Every bill is sent to one of these, and its public hearing is held there, so
// this is where a reader's testimony goes. The legislature's page lists
// thirty-three under Joint and one more, Initiative Petitions, under Special
// Joint Committees. MAPLE's own learn page counts thirty-three, so the special
// one is marked rather than counted in with the rest.
//
// Taken on 14 October 2026 from three places, because no one of them has it all:
//
//   malegislature.gov/Committees/Joint, for the list and its order.
//
//   malegislature.gov/Committees/Detail/{code}, for the members and their
//   offices. The API names only the two chairs.
//
//   /api/GeneralCourts/194/LegislativeMembers/{code}, for each member's party
//   and district, which the committee page does not show.
//
// The chairs were checked against the API's SenateChairperson and
// HouseChairperson for all thirty-four, and agree. Education was checked against
// the rosters copied by hand in bill-lineage/committees.ts, and agrees member
// for member.
//
// Bundled rather than fetched, for the same reason as the bill texts: the API
// sends no CORS headers.
//
// Where the legislature names no one, neither does this file:
//
//   Agriculture and Fisheries lists no House chair.
//
//   Ways and Means lists no House vice chair. It names an assistant vice chair
//   in each chamber instead, the only committee that does.
//
//   Initiative Petitions has its two chairs and no vice chairs.
//
//   Higher Education, Racial Equity, Community Development and Ways and Means
//   each show one vacant House seat.
//
// Members are in the order the legislature lists them, which puts the chair and
// vice chair first.

import { MEMBER_BY_SEAT } from "../bill-lineage/members";

export type JointRole =
  | "Chair"
  | "Vice Chair"
  | "Ranking Minority"
  | "Assistant Vice Chair";

export interface JointMember {
  /** The General Court's member code, which is also the profile URL. */
  code: string;
  name: string;
  /**
   * "D", "R" or "U". The one "U" is Susannah M. Whipps, whom the API lists as
   * Unenrolled.
   */
  party: string;
  district: string;
  /** Only where the committee page names one. Most members hold none. */
  role?: JointRole;
}

/**
 * The subject areas the landing page groups committees under, in the order it
 * shows them. MAPLE's grouping, not the legislature's, which lists its joint
 * committees alphabetically. Each committee was placed by its charge, the
 * Description field in the API, except Racial Equity, whose charge is blank and
 * whose name placed it. The close calls say why beside them.
 */
export const TOPICS = [
  "Education, Youth & Families",
  "Healthcare & Human Services",
  "Climate, Energy & Environment",
  "Democracy, Rights & Safety",
  "Housing, Transit & Community",
  "Work, Money & Business",
  "Government Affairs",
] as const;

export type Topic = (typeof TOPICS)[number];

export interface JointCommittee {
  /** The legislature's own code, e.g. "J14". */
  code: string;
  slug: string;
  /** The subject alone, which is what a list of joint committees needs. */
  name: string;
  /** The legislature's own name for it. */
  fullName: string;
  /** Which of `TOPICS` the landing page shows it under. */
  topic: Topic;
  /** Listed under Special Joint Committees rather than Joint. */
  special?: true;
  senate: JointMember[];
  house: JointMember[];
  /** Seats the committee page shows as vacant. */
  vacant: { senate: number; house: number };
}

export const JOINT_COMMITTEES: JointCommittee[] = [
  {
    code: "J33",
    slug: "advanced-information-technology-the-internet-and-cybersecurity",
    name: "Advanced Information Technology, the Internet and Cybersecurity",
    fullName: "Joint Committee on Advanced Information Technology, the Internet and Cybersecurity",
    // Its charge is information technology, the internet, broadband and
    // cybersecurity, which puts it beside Economic Development and Emerging
    // Technologies.
    topic: "Work, Money & Business",
    senate: [
      { code: "MOM0", name: "Michael O. Moore", party: "D", district: "Second Worcester", role: "Chair" },
      { code: "PMP0", name: "Pavel M. Payano", party: "D", district: "First Essex", role: "Vice Chair" },
      { code: "MJB0", name: "Michael J. Barrett", party: "D", district: "Third Middlesex" },
      { code: "BRF0", name: "Barry R. Finegold", party: "D", district: "Second Essex and Middlesex" },
      { code: "PWM0", name: "Paul W. Mark", party: "D", district: "Berkshire, Hampden, Franklin and Hampshire" },
      { code: "PJD0", name: "Peter J. Durant", party: "R", district: "Worcester and Hampshire", role: "Ranking Minority" },
    ],
    house: [
      { code: "TFB1", name: "Tricia Farley-Bouvier", party: "D", district: "2nd Berkshire", role: "Chair" },
      { code: "JKH1", name: "James K. Hawkins", party: "D", district: "2nd Bristol", role: "Vice Chair" },
      { code: "SJO1", name: "Steven J. Ouellette", party: "D", district: "8th Bristol" },
      { code: "CRF1", name: "Christopher Richard Flanagan", party: "D", district: "1st Barnstable" },
      { code: "TWM1", name: "Thomas W. Moakley", party: "D", district: "Barnstable, Dukes and Nantucket" },
      { code: "O_R1", name: "Orlando Ramos", party: "D", district: "9th Hampden" },
      { code: "SCO1", name: "Steven Owens", party: "D", district: "29th Middlesex" },
      { code: "T_V1", name: "Tommy Vitolo", party: "D", district: "15th Norfolk" },
      { code: "J_M1", name: "Joan Meschino", party: "D", district: "3rd Plymouth" },
      { code: "MTL1", name: "Marc T. Lombardo", party: "R", district: "22nd Middlesex", role: "Ranking Minority" },
      { code: "JRG2", name: "John R. Gaskey", party: "R", district: "2nd Plymouth" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J46",
    slug: "aging-and-independence",
    name: "Aging and Independence",
    fullName: "Joint Committee on Aging and Independence",
    topic: "Healthcare & Human Services",
    senate: [
      { code: "PDJ0", name: "Patricia D. Jehlen", party: "D", district: "Second Middlesex", role: "Chair" },
      { code: "JCV0", name: "John C. Velis", party: "D", district: "Hampden and Hampshire", role: "Vice Chair" },
      { code: "CFF0", name: "Cindy F. Friedman", party: "D", district: "Fourth Middlesex" },
      { code: "JBL0", name: "Joan B. Lovely", party: "D", district: "Second Essex" },
      { code: "MFR0", name: "Michael F. Rush", party: "D", district: "Norfolk and Suffolk" },
      { code: "PJD0", name: "Peter J. Durant", party: "R", district: "Worcester and Hampshire", role: "Ranking Minority" },
    ],
    house: [
      { code: "TMS1", name: "Thomas M. Stanley", party: "D", district: "9th Middlesex", role: "Chair" },
      { code: "S_M1", name: "Samantha Montaño", party: "D", district: "15th Suffolk", role: "Vice Chair" },
      { code: "SLG1", name: "Susannah M. Whipps", party: "U", district: "2nd Franklin" },
      { code: "M_C2", name: "Michelle L. Ciccolo", party: "D", district: "15th Middlesex" },
      { code: "LMF1", name: "Lisa Field", party: "D", district: "3rd Bristol" },
      { code: "E_U1", name: "Erika Uyterhoeven", party: "D", district: "27th Middlesex" },
      { code: "D_B1", name: "David Biele", party: "D", district: "4th Suffolk" },
      { code: "MRS1", name: "Margaret R. Scarsdale", party: "D", district: "1st Middlesex" },
      { code: "CLG1", name: "Carmine Lawrence Gentile", party: "D", district: "13th Middlesex" },
      { code: "NAG1", name: "Nicholas A. Boldyga", party: "R", district: "3rd Hampden", role: "Ranking Minority" },
      { code: "DFD1", name: "David F. DeCoste", party: "R", district: "5th Plymouth" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J45",
    slug: "agriculture-and-fisheries",
    name: "Agriculture and Fisheries",
    fullName: "Joint Committee on Agriculture and Fisheries",
    topic: "Climate, Energy & Environment",
    senate: [
      { code: "DAF0", name: "Dylan A. Fernandes", party: "D", district: "Plymouth and Barnstable", role: "Chair" },
      { code: "JMC0", name: "Joanne M. Comerford", party: "D", district: "Hampshire, Franklin and Worcester", role: "Vice Chair" },
      { code: "RKK0", name: "Robyn K. Kennedy", party: "D", district: "First Worcester" },
      { code: "JBL0", name: "Joan B. Lovely", party: "D", district: "Second Essex" },
      { code: "JRO0", name: "Jacob R. Oliveira", party: "D", district: "Hampden, Hampshire and Worcester" },
      { code: "RCF0", name: "Ryan C. Fattman", party: "R", district: "Worcester and Hampden", role: "Ranking Minority" },
    ],
    house: [
      { code: "ALS1", name: "Aaron L. Saunders", party: "D", district: "7th Hampden", role: "Vice Chair" },
      { code: "H_G1", name: "Homar Gómez", party: "D", district: "2nd Hampshire" },
      { code: "JCD1", name: "James C. Arena-DeRosa", party: "D", district: "8th Middlesex" },
      { code: "CRF1", name: "Christopher Richard Flanagan", party: "D", district: "1st Barnstable" },
      { code: "SJO1", name: "Steven J. Ouellette", party: "D", district: "8th Bristol" },
      { code: "DAS1", name: "Danillo A. Sena", party: "D", district: "37th Middlesex" },
      { code: "JDZ1", name: "Jonathan D. Zlotnik", party: "D", district: "2nd Worcester" },
      { code: "H_L1", name: "Hadley Luddy", party: "D", district: "4th Barnstable" },
      { code: "NAG1", name: "Nicholas A. Boldyga", party: "R", district: "3rd Hampden", role: "Ranking Minority" },
      { code: "KNF1", name: "Kimberly N. Ferguson", party: "R", district: "1st Worcester" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J32",
    slug: "bonding-capital-expenditures-and-state-assets",
    name: "Bonding, Capital Expenditures and State Assets",
    fullName: "Joint Committee on Bonding, Capital Expenditures and State Assets",
    topic: "Government Affairs",
    senate: [
      { code: "JJC0", name: "John J. Cronin", party: "D", district: "Worcester and Middlesex", role: "Chair" },
      { code: "PWM0", name: "Paul W. Mark", party: "D", district: "Berkshire, Hampden, Franklin and Hampshire", role: "Vice Chair" },
      { code: "WJD0", name: "William J. Driscoll, Jr.", party: "D", district: "Norfolk, Plymouth and Bristol" },
      { code: "MOM0", name: "Michael O. Moore", party: "D", district: "Second Worcester" },
      { code: "JRO0", name: "Jacob R. Oliveira", party: "D", district: "Hampden, Hampshire and Worcester" },
      { code: "JCV0", name: "John C. Velis", party: "D", district: "Hampden and Hampshire" },
      { code: "RCF0", name: "Ryan C. Fattman", party: "R", district: "Worcester and Hampden", role: "Ranking Minority" },
    ],
    house: [
      { code: "MJF1", name: "Michael J. Finn", party: "D", district: "6th Hampden", role: "Chair" },
      { code: "JHR1", name: "John H. Rogers", party: "D", district: "12th Norfolk", role: "Vice Chair" },
      { code: "E_U1", name: "Erika Uyterhoeven", party: "D", district: "27th Middlesex" },
      { code: "H_L1", name: "Hadley Luddy", party: "D", district: "4th Barnstable" },
      { code: "FEP1", name: "Francisco E. Paulino", party: "D", district: "16th Essex" },
      { code: "D_S1", name: "Dawne Shand", party: "D", district: "1st Essex" },
      { code: "ALS1", name: "Aaron L. Saunders", party: "D", district: "7th Hampden" },
      { code: "LMF1", name: "Lisa Field", party: "D", district: "3rd Bristol" },
      { code: "M_C1", name: "Mike Connolly", party: "D", district: "26th Middlesex" },
      { code: "G_S1", name: "Greg Schwartz", party: "D", district: "12th Middlesex" },
      { code: "NJO1", name: "Norman J. Orrall", party: "R", district: "12th Bristol", role: "Ranking Minority" },
      { code: "KWP1", name: "Kelly W. Pease", party: "R", district: "4th Hampden" },
      { code: "JDM1", name: "Joseph D. McKenna", party: "R", district: "18th Worcester" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J50",
    slug: "cannabis-policy",
    name: "Cannabis Policy",
    fullName: "Joint Committee on Cannabis Policy",
    // Its whole charge is "the subject of marijuana", so Healthcare would
    // hold it as well.
    topic: "Work, Money & Business",
    senate: [
      { code: "A_G0", name: "Adam Gómez", party: "D", district: "Hampden", role: "Chair" },
      { code: "DAF0", name: "Dylan A. Fernandes", party: "D", district: "Plymouth and Barnstable", role: "Vice Chair" },
      { code: "JBE0", name: "James B. Eldridge", party: "D", district: "Middlesex and Worcester" },
      { code: "PDJ0", name: "Patricia D. Jehlen", party: "D", district: "Second Middlesex" },
      { code: "JFK0", name: "John F. Keenan", party: "D", district: "Norfolk and Plymouth" },
      { code: "PJD0", name: "Peter J. Durant", party: "R", district: "Worcester and Hampshire", role: "Ranking Minority" },
    ],
    house: [
      { code: "DMD1", name: "Daniel M. Donahue", party: "D", district: "16th Worcester", role: "Chair" },
      { code: "PAD1", name: "Patricia A. Duffy", party: "D", district: "5th Hampden", role: "Vice Chair" },
      { code: "D_S1", name: "Dawne Shand", party: "D", district: "1st Essex" },
      { code: "BFR1", name: "Brandy Fluker-Reid", party: "D", district: "12th Suffolk" },
      { code: "BMP1", name: "Bridget Plouffe", party: "D", district: "9th Plymouth" },
      { code: "WFM1", name: "William F. MacGregor", party: "D", district: "10th Suffolk" },
      { code: "M_C3", name: "Manny Cruz", party: "D", district: "7th Essex" },
      { code: "JAG1", name: "Jessica Ann Giannino", party: "D", district: "16th Suffolk" },
      { code: "G_S1", name: "Greg Schwartz", party: "D", district: "12th Middlesex" },
      { code: "DRB1", name: "Donald R. Berthiaume, Jr.", party: "R", district: "5th Worcester", role: "Ranking Minority" },
      { code: "MJS3", name: "Michael J. Soter", party: "R", district: "8th Worcester" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J13",
    slug: "children-families-and-persons-with-disabilities",
    name: "Children, Families and Persons with Disabilities",
    fullName: "Joint Committee on Children, Families and Persons with Disabilities",
    // Oversees Children and Families, Developmental Services and Transitional
    // Assistance, so as much human services as youth and families.
    topic: "Education, Youth & Families",
    senate: [
      { code: "RKK0", name: "Robyn K. Kennedy", party: "D", district: "First Worcester", role: "Chair" },
      { code: "L M0", name: "Liz Miranda", party: "D", district: "Second Suffolk", role: "Vice Chair" },
      { code: "LME0", name: "Lydia Edwards", party: "D", district: "Third Suffolk" },
      { code: "JBE0", name: "James B. Eldridge", party: "D", district: "Middlesex and Worcester" },
      { code: "RLR0", name: "Rebecca L. Rausch", party: "D", district: "Norfolk, Worcester and Middlesex" },
      { code: "PMO", name: "Patrick M. O'Connor", party: "R", district: "First Plymouth and Norfolk", role: "Ranking Minority" },
    ],
    house: [
      { code: "J_L1", name: "Jay D. Livingstone", party: "D", district: "8th Suffolk", role: "Chair" },
      { code: "JAG2", name: "Judith A. Garcia", party: "D", district: "11th Suffolk", role: "Vice Chair" },
      { code: "ALS1", name: "Aaron L. Saunders", party: "D", district: "7th Hampden" },
      { code: "K_D1", name: "Kate Donaghue", party: "D", district: "19th Worcester" },
      { code: "LMF1", name: "Lisa Field", party: "D", district: "3rd Bristol" },
      { code: "MMD1", name: "Michelle M. DuBois", party: "D", district: "10th Plymouth" },
      { code: "DAS1", name: "Danillo A. Sena", party: "D", district: "37th Middlesex" },
      { code: "DAL1", name: "David Henry Argosky LeBoeuf", party: "D", district: "17th Worcester" },
      { code: "TWM1", name: "Thomas W. Moakley", party: "D", district: "Barnstable, Dukes and Nantucket" },
      { code: "AMS2", name: "Alyson M. Sullivan-Almeida", party: "R", district: "7th Plymouth", role: "Ranking Minority" },
      { code: "JJM1", name: "John J. Marsi", party: "R", district: "6th Worcester" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J47",
    slug: "community-development-and-small-businesses",
    name: "Community Development and Small Businesses",
    fullName: "Joint Committee on Community Development and Small Businesses",
    topic: "Housing, Transit & Community",
    senate: [
      { code: "A_G0", name: "Adam Gómez", party: "D", district: "Hampden", role: "Chair" },
      { code: "MDB0", name: "Michael D. Brady", party: "D", district: "Second Plymouth and Norfolk", role: "Vice Chair" },
      { code: "N_C0", name: "Nick Collins", party: "D", district: "First Suffolk" },
      { code: "JFK0", name: "John F. Keenan", party: "D", district: "Norfolk and Plymouth" },
      { code: "JBL0", name: "Joan B. Lovely", party: "D", district: "Second Essex" },
      { code: "KAD0", name: "Kelly A. Dooner", party: "R", district: "Third Bristol and Plymouth", role: "Ranking Minority" },
    ],
    house: [
      { code: "AXV1", name: "Andres X. Vargas", party: "D", district: "3rd Essex", role: "Chair" },
      { code: "JDZ1", name: "Jonathan D. Zlotnik", party: "D", district: "2nd Worcester", role: "Vice Chair" },
      { code: "TTH1", name: "Tara T. Hong", party: "D", district: "18th Middlesex" },
      { code: "BMA1", name: "Brian M. Ashe", party: "D", district: "2nd Hampden" },
      { code: "K_D1", name: "Kate Donaghue", party: "D", district: "19th Worcester" },
      { code: "PJK1", name: "Patrick Joseph Kearney", party: "D", district: "4th Plymouth" },
      { code: "C_H1", name: "Christopher Hendricks", party: "D", district: "11th Bristol" },
      { code: "JHR1", name: "John H. Rogers", party: "D", district: "12th Norfolk" },
      { code: "J_T2", name: "Justin Thurber", party: "R", district: "5th Bristol", role: "Ranking Minority" },
      { code: "MSC1", name: "Michael S. Chaisson", party: "R", district: "1st Bristol" },
    ],
    vacant: { senate: 0, house: 1 },
  },
  {
    code: "J17",
    slug: "consumer-protection-and-professional-licensure",
    name: "Consumer Protection and Professional Licensure",
    fullName: "Joint Committee on Consumer Protection and Professional Licensure",
    topic: "Work, Money & Business",
    senate: [
      { code: "PMP0", name: "Pavel M. Payano", party: "D", district: "First Essex", role: "Chair" },
      { code: "WJD0", name: "William J. Driscoll, Jr.", party: "D", district: "Norfolk, Plymouth and Bristol", role: "Vice Chair" },
      { code: "JJC0", name: "John J. Cronin", party: "D", district: "Worcester and Middlesex" },
      { code: "LME0", name: "Lydia Edwards", party: "D", district: "Third Suffolk" },
      { code: "JRO0", name: "Jacob R. Oliveira", party: "D", district: "Hampden, Hampshire and Worcester" },
      { code: "KAD0", name: "Kelly A. Dooner", party: "R", district: "Third Bristol and Plymouth", role: "Ranking Minority" },
    ],
    house: [
      { code: "T_C1", name: "Tackey Chan", party: "D", district: "2nd Norfolk", role: "Chair" },
      { code: "MSK1", name: "Mary S. Keefe", party: "D", district: "15th Worcester", role: "Vice Chair" },
      { code: "AMS3", name: "Amy Mah Sangiolo", party: "D", district: "11th Middlesex" },
      { code: "EAR1", name: "Estela A. Reyes", party: "D", district: "4th Essex" },
      { code: "LMF1", name: "Lisa Field", party: "D", district: "3rd Bristol" },
      { code: "T_V1", name: "Tommy Vitolo", party: "D", district: "15th Norfolk" },
      { code: "DAL1", name: "David Henry Argosky LeBoeuf", party: "D", district: "17th Worcester" },
      { code: "JKH1", name: "James K. Hawkins", party: "D", district: "2nd Bristol" },
      { code: "J_M1", name: "Joan Meschino", party: "D", district: "3rd Plymouth" },
      { code: "JDM1", name: "Joseph D. McKenna", party: "R", district: "18th Worcester", role: "Ranking Minority" },
      { code: "DRB1", name: "Donald R. Berthiaume, Jr.", party: "R", district: "5th Worcester" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J12",
    slug: "economic-development-and-emerging-technologies",
    name: "Economic Development and Emerging Technologies",
    fullName: "Joint Committee on Economic Development and Emerging Technologies",
    topic: "Work, Money & Business",
    senate: [
      { code: "BRF0", name: "Barry R. Finegold", party: "D", district: "Second Essex and Middlesex", role: "Chair" },
      { code: "N_C0", name: "Nick Collins", party: "D", district: "First Suffolk", role: "Vice Chair" },
      { code: "JJC0", name: "John J. Cronin", party: "D", district: "Worcester and Middlesex" },
      { code: "PRF0", name: "Paul R. Feeney", party: "D", district: "Bristol and Norfolk" },
      { code: "PWM0", name: "Paul W. Mark", party: "D", district: "Berkshire, Hampden, Franklin and Hampshire" },
      { code: "L M0", name: "Liz Miranda", party: "D", district: "Second Suffolk" },
      { code: "PJD0", name: "Peter J. Durant", party: "R", district: "Worcester and Hampshire", role: "Ranking Minority" },
    ],
    house: [
      { code: "CAF1", name: "Carole A. Fiola", party: "D", district: "6th Bristol", role: "Chair" },
      { code: "JAG1", name: "Jessica Ann Giannino", party: "D", district: "16th Suffolk", role: "Vice Chair" },
      { code: "MPK1", name: "Michael P. Kushmerek", party: "D", district: "3rd Worcester" },
      { code: "C_H1", name: "Christopher Hendricks", party: "D", district: "11th Bristol" },
      { code: "WFM1", name: "William F. MacGregor", party: "D", district: "10th Suffolk" },
      { code: "M_C3", name: "Manny Cruz", party: "D", district: "7th Essex" },
      { code: "AJS1", name: "Adam J. Scanlon", party: "D", district: "14th Bristol" },
      { code: "G_S1", name: "Greg Schwartz", party: "D", district: "12th Middlesex" },
      { code: "JDZ1", name: "Jonathan D. Zlotnik", party: "D", district: "2nd Worcester" },
      { code: "MJS3", name: "Michael J. Soter", party: "R", district: "8th Worcester", role: "Ranking Minority" },
      { code: "MSV1", name: "Marcus S. Vaughn", party: "R", district: "9th Norfolk" },
      { code: "KPS1", name: "Kenneth P. Sweezey", party: "R", district: "6th Plymouth" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J14",
    slug: "education",
    name: "Education",
    fullName: "Joint Committee on Education",
    topic: "Education, Youth & Families",
    senate: [
      { code: "jml0", name: "Jason M. Lewis", party: "D", district: "Fifth Middlesex", role: "Chair" },
      { code: "PDJ0", name: "Patricia D. Jehlen", party: "D", district: "Second Middlesex", role: "Vice Chair" },
      { code: "SND0", name: "Sal N. DiDomenico", party: "D", district: "Middlesex and Suffolk" },
      { code: "RKK0", name: "Robyn K. Kennedy", party: "D", district: "First Worcester" },
      { code: "PMP0", name: "Pavel M. Payano", party: "D", district: "First Essex" },
      { code: "PMO", name: "Patrick M. O'Connor", party: "R", district: "First Plymouth and Norfolk", role: "Ranking Minority" },
    ],
    house: [
      { code: "KIG1", name: "Kenneth I. Gordon", party: "D", district: "21st Middlesex", role: "Chair" },
      { code: "BJA1", name: "Bruce J. Ayers", party: "D", district: "1st Norfolk", role: "Vice Chair" },
      { code: "CJW1", name: "Christopher J. Worrell", party: "D", district: "5th Suffolk" },
      { code: "PSS1", name: "Priscila S. Sousa", party: "D", district: "6th Middlesex" },
      { code: "JAG2", name: "Judith A. Garcia", party: "D", district: "11th Suffolk" },
      { code: "M_C3", name: "Manny Cruz", party: "D", district: "7th Essex" },
      { code: "MPK1", name: "Michael P. Kushmerek", party: "D", district: "3rd Worcester" },
      { code: "BMP1", name: "Bridget Plouffe", party: "D", district: "9th Plymouth" },
      { code: "S_C1", name: "Simon Cataldo", party: "D", district: "14th Middlesex" },
      { code: "JJM1", name: "John J. Marsi", party: "R", district: "6th Worcester", role: "Ranking Minority" },
      { code: "AMS2", name: "Alyson M. Sullivan-Almeida", party: "R", district: "7th Plymouth" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J15",
    slug: "election-laws",
    name: "Election Laws",
    fullName: "Joint Committee on Election Laws",
    topic: "Democracy, Rights & Safety",
    senate: [
      { code: "JFK0", name: "John F. Keenan", party: "D", district: "Norfolk and Plymouth", role: "Chair" },
      { code: "JRO0", name: "Jacob R. Oliveira", party: "D", district: "Hampden, Hampshire and Worcester", role: "Vice Chair" },
      { code: "CSC0", name: "Cynthia Stone Creem", party: "D", district: "Norfolk and Middlesex" },
      { code: "JBE0", name: "James B. Eldridge", party: "D", district: "Middlesex and Worcester" },
      { code: "RLR0", name: "Rebecca L. Rausch", party: "D", district: "Norfolk, Worcester and Middlesex" },
      { code: "RCF0", name: "Ryan C. Fattman", party: "R", district: "Worcester and Hampden", role: "Ranking Minority" },
    ],
    house: [
      { code: "djh1", name: "Daniel J. Hunt", party: "D", district: "13th Suffolk", role: "Chair" },
      { code: "RAM1", name: "Rita A. Mendes", party: "D", district: "11th Plymouth", role: "Vice Chair" },
      { code: "D_R1", name: "David Allen Robertson", party: "D", district: "19th Middlesex" },
      { code: "RMH2", name: "Ryan M. Hamilton", party: "D", district: "15th Essex" },
      { code: "PSS1", name: "Priscila S. Sousa", party: "D", district: "6th Middlesex" },
      { code: "TTH1", name: "Tara T. Hong", party: "D", district: "18th Middlesex" },
      { code: "J_M1", name: "Joan Meschino", party: "D", district: "3rd Plymouth" },
      { code: "CMM1", name: "Christopher M. Markey", party: "D", district: "9th Bristol" },
      { code: "LSD1", name: "Leigh Davis", party: "D", district: "3rd Berkshire" },
      { code: "PKF1", name: "Paul K. Frost", party: "R", district: "7th Worcester", role: "Ranking Minority" },
      { code: "MTL1", name: "Marc T. Lombardo", party: "R", district: "22nd Middlesex" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J52",
    slug: "emergency-preparedness-and-management",
    name: "Emergency Preparedness and Management",
    fullName: "Joint Committee on Emergency Preparedness and Management",
    topic: "Democracy, Rights & Safety",
    senate: [
      { code: "V_H0", name: "Vanna Howard", party: "D", district: "First Middlesex", role: "Chair" },
      { code: "JBL0", name: "Joan B. Lovely", party: "D", district: "Second Essex", role: "Vice Chair" },
      { code: "MDB0", name: "Michael D. Brady", party: "D", district: "Second Plymouth and Norfolk" },
      { code: "WJD0", name: "William J. Driscoll, Jr.", party: "D", district: "Norfolk, Plymouth and Bristol" },
      { code: "A_G0", name: "Adam Gómez", party: "D", district: "Hampden" },
      { code: "RCF0", name: "Ryan C. Fattman", party: "R", district: "Worcester and Hampden", role: "Ranking Minority" },
    ],
    house: [
      { code: "S_G2", name: "Steven Ultrino", party: "D", district: "33rd Middlesex", role: "Chair" },
      { code: "EAR1", name: "Estela A. Reyes", party: "D", district: "4th Essex", role: "Vice Chair" },
      { code: "AJS1", name: "Adam J. Scanlon", party: "D", district: "14th Bristol" },
      { code: "JRT1", name: "Jeffrey Rosario Turco", party: "D", district: "19th Suffolk" },
      { code: "SJO1", name: "Steven J. Ouellette", party: "D", district: "8th Bristol" },
      { code: "CRF1", name: "Christopher Richard Flanagan", party: "D", district: "1st Barnstable" },
      { code: "MLB1", name: "Michelle L. Badger", party: "D", district: "1st Plymouth" },
      { code: "D_B1", name: "David Biele", party: "D", district: "4th Suffolk" },
      { code: "G_S1", name: "Greg Schwartz", party: "D", district: "12th Middlesex" },
      { code: "SGX1", name: "Steven George Xiarhos", party: "R", district: "5th Barnstable", role: "Ranking Minority" },
      { code: "DTV1", name: "David T. Vieira", party: "R", district: "3rd Barnstable" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J21",
    slug: "environment-and-natural-resources",
    name: "Environment and Natural Resources",
    fullName: "Joint Committee on Environment and Natural Resources",
    topic: "Climate, Energy & Environment",
    senate: [
      { code: "RLR0", name: "Rebecca L. Rausch", party: "D", district: "Norfolk, Worcester and Middlesex", role: "Chair" },
      { code: "DAF0", name: "Dylan A. Fernandes", party: "D", district: "Plymouth and Barnstable", role: "Vice Chair" },
      { code: "MOM0", name: "Michael O. Moore", party: "D", district: "Second Worcester" },
      { code: "MFR0", name: "Michael F. Rush", party: "D", district: "Norfolk and Suffolk" },
      { code: "V_H0", name: "Vanna Howard", party: "D", district: "First Middlesex" },
      { code: "BET0", name: "Bruce E. Tarr", party: "R", district: "First Essex and Middlesex", role: "Ranking Minority" },
    ],
    house: [
      { code: "CPB2", name: "Christine P. Barber", party: "D", district: "34th Middlesex", role: "Chair" },
      { code: "S_C1", name: "Simon Cataldo", party: "D", district: "14th Middlesex", role: "Vice Chair" },
      { code: "D_S1", name: "Dawne Shand", party: "D", district: "1st Essex" },
      { code: "MRS1", name: "Margaret R. Scarsdale", party: "D", district: "1st Middlesex" },
      { code: "K_K2", name: "Kristin E. Kassner", party: "D", district: "2nd Essex" },
      { code: "JBA1", name: "Jennifer Balinsky Armini", party: "D", district: "8th Essex" },
      { code: "JDZ1", name: "Jonathan D. Zlotnik", party: "D", district: "2nd Worcester" },
      { code: "MDS1", name: "Mark D. Sylvia", party: "D", district: "10th Bristol" },
      { code: "TTH1", name: "Tara T. Hong", party: "D", district: "18th Middlesex" },
      { code: "KPS1", name: "Kenneth P. Sweezey", party: "R", district: "6th Plymouth", role: "Ranking Minority" },
      { code: "JRG2", name: "John R. Gaskey", party: "R", district: "2nd Plymouth" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J11",
    slug: "financial-services",
    name: "Financial Services",
    fullName: "Joint Committee on Financial Services",
    topic: "Work, Money & Business",
    senate: [
      { code: "PRF0", name: "Paul R. Feeney", party: "D", district: "Bristol and Norfolk", role: "Chair" },
      { code: "MOM0", name: "Michael O. Moore", party: "D", district: "Second Worcester", role: "Vice Chair" },
      { code: "WJD0", name: "William J. Driscoll, Jr.", party: "D", district: "Norfolk, Plymouth and Bristol" },
      { code: "A_G0", name: "Adam Gómez", party: "D", district: "Hampden" },
      { code: "JRO0", name: "Jacob R. Oliveira", party: "D", district: "Hampden, Hampshire and Worcester" },
      { code: "BET0", name: "Bruce E. Tarr", party: "R", district: "First Essex and Middlesex", role: "Ranking Minority" },
    ],
    house: [
      { code: "JMM1", name: "James M. Murphy", party: "D", district: "4th Norfolk", role: "Chair" },
      { code: "D_B1", name: "David Biele", party: "D", district: "4th Suffolk", role: "Vice Chair" },
      { code: "CJW1", name: "Christopher J. Worrell", party: "D", district: "5th Suffolk" },
      { code: "WFM1", name: "William F. MacGregor", party: "D", district: "10th Suffolk" },
      { code: "RMH2", name: "Ryan M. Hamilton", party: "D", district: "15th Essex" },
      { code: "TTN1", name: "Tram T. Nguyen", party: "D", district: "18th Essex" },
      { code: "KLG1", name: "Kate Lipper-Garabedian", party: "D", district: "32nd Middlesex" },
      { code: "SPK1", name: "Sally P. Kerans", party: "D", district: "13th Essex" },
      { code: "S_C1", name: "Simon Cataldo", party: "D", district: "14th Middlesex" },
      { code: "SSH1", name: "Steven S. Howitt", party: "R", district: "4th Bristol", role: "Ranking Minority" },
      { code: "MSC1", name: "Michael S. Chaisson", party: "R", district: "1st Bristol" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J24",
    slug: "health-care-financing",
    name: "Health Care Financing",
    fullName: "Joint Committee on Health Care Financing",
    topic: "Healthcare & Human Services",
    senate: [
      { code: "CFF0", name: "Cindy F. Friedman", party: "D", district: "Fourth Middlesex", role: "Chair" },
      { code: "JJC0", name: "John J. Cronin", party: "D", district: "Worcester and Middlesex", role: "Vice Chair" },
      { code: "JAC0", name: "Julian Cyr", party: "D", district: "Cape and Islands" },
      { code: "WJD0", name: "William J. Driscoll, Jr.", party: "D", district: "Norfolk, Plymouth and Bristol" },
      { code: "PRF0", name: "Paul R. Feeney", party: "D", district: "Bristol and Norfolk" },
      { code: "PMP0", name: "Pavel M. Payano", party: "D", district: "First Essex" },
      { code: "KAD0", name: "Kelly A. Dooner", party: "R", district: "Third Bristol and Plymouth", role: "Ranking Minority" },
    ],
    house: [
      { code: "JJL2", name: "John J. Lawn, Jr.", party: "D", district: "10th Middlesex", role: "Chair" },
      { code: "M_K1", name: "Meghan K. Kilcoyne", party: "D", district: "12th Worcester", role: "Vice Chair" },
      { code: "D_S1", name: "Dawne Shand", party: "D", district: "1st Essex" },
      { code: "JFM1", name: "John Francis Moran", party: "D", district: "9th Suffolk" },
      { code: "T_V1", name: "Tommy Vitolo", party: "D", district: "15th Norfolk" },
      { code: "JAG2", name: "Judith A. Garcia", party: "D", district: "11th Suffolk" },
      { code: "KAD1", name: "Kip A. Diggs", party: "D", district: "2nd Barnstable" },
      { code: "L_S1", name: "Lindsay N. Sabadosa", party: "D", district: "1st Hampshire" },
      { code: "C_T1", name: "Chynah Tyler", party: "D", district: "7th Suffolk" },
      { code: "CMM1", name: "Christopher M. Markey", party: "D", district: "9th Bristol" },
      { code: "HEK1", name: "Hannah Kane", party: "R", district: "11th Worcester", role: "Ranking Minority" },
      { code: "DKM1", name: "David K. Muradian, Jr.", party: "R", district: "9th Worcester" },
      { code: "PKF1", name: "Paul K. Frost", party: "R", district: "7th Worcester" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J29",
    slug: "higher-education",
    name: "Higher Education",
    fullName: "Joint Committee on Higher Education",
    topic: "Education, Youth & Families",
    senate: [
      { code: "JMC0", name: "Joanne M. Comerford", party: "D", district: "Hampshire, Franklin and Worcester", role: "Chair" },
      { code: "V_H0", name: "Vanna Howard", party: "D", district: "First Middlesex", role: "Vice Chair" },
      { code: "PWM0", name: "Paul W. Mark", party: "D", district: "Berkshire, Hampden, Franklin and Hampshire" },
      { code: "MOM0", name: "Michael O. Moore", party: "D", district: "Second Worcester" },
      { code: "PMP0", name: "Pavel M. Payano", party: "D", district: "First Essex" },
      { code: "KAD0", name: "Kelly A. Dooner", party: "R", district: "Third Bristol and Plymouth", role: "Ranking Minority" },
    ],
    house: [
      { code: "DMR1", name: "David M. Rogers", party: "D", district: "24th Middlesex", role: "Chair" },
      { code: "CLG1", name: "Carmine Lawrence Gentile", party: "D", district: "13th Middlesex", role: "Vice Chair" },
      { code: "SLG1", name: "Susannah M. Whipps", party: "U", district: "2nd Franklin" },
      { code: "SBA1", name: "Shirley B. Arriaga", party: "D", district: "8th Hampden" },
      { code: "TTH1", name: "Tara T. Hong", party: "D", district: "18th Middlesex" },
      { code: "MLB1", name: "Michelle L. Badger", party: "D", district: "1st Plymouth" },
      { code: "J_M1", name: "Joan Meschino", party: "D", district: "3rd Plymouth" },
      { code: "RGW1", name: "Richard G. Wells, Jr.", party: "D", district: "7th Norfolk" },
      { code: "MJS3", name: "Michael J. Soter", party: "R", district: "8th Worcester", role: "Ranking Minority" },
      { code: "KWP1", name: "Kelly W. Pease", party: "R", district: "4th Hampden" },
    ],
    vacant: { senate: 0, house: 1 },
  },
  {
    code: "J28",
    slug: "housing",
    name: "Housing",
    fullName: "Joint Committee on Housing",
    topic: "Housing, Transit & Community",
    senate: [
      { code: "JAC0", name: "Julian Cyr", party: "D", district: "Cape and Islands", role: "Chair" },
      { code: "LME0", name: "Lydia Edwards", party: "D", district: "Third Suffolk", role: "Vice Chair" },
      { code: "WNB0", name: "William N. Brownsberger", party: "D", district: "Suffolk and Middlesex" },
      { code: "PRF0", name: "Paul R. Feeney", party: "D", district: "Bristol and Norfolk" },
      { code: "BRF0", name: "Barry R. Finegold", party: "D", district: "Second Essex and Middlesex" },
      { code: "PMO", name: "Patrick M. O'Connor", party: "R", district: "First Plymouth and Norfolk", role: "Ranking Minority" },
    ],
    house: [
      { code: "RMH1", name: "Richard M. Haggerty", party: "D", district: "30th Middlesex", role: "Chair" },
      { code: "APR1", name: "Adrianne Pusateri Ramos", party: "D", district: "14th Essex", role: "Vice Chair" },
      { code: "HLB1", name: "Hannah Bowen", party: "D", district: "6th Essex" },
      { code: "R_C1", name: "Rob Consalvo", party: "D", district: "14th Suffolk" },
      { code: "JCD1", name: "James C. Arena-DeRosa", party: "D", district: "8th Middlesex" },
      { code: "KAD1", name: "Kip A. Diggs", party: "D", district: "2nd Barnstable" },
      { code: "DAL1", name: "David Henry Argosky LeBoeuf", party: "D", district: "17th Worcester" },
      { code: "CMM1", name: "Christopher M. Markey", party: "D", district: "9th Bristol" },
      { code: "MLB1", name: "Michelle L. Badger", party: "D", district: "1st Plymouth" },
      { code: "DFD1", name: "David F. DeCoste", party: "R", district: "5th Plymouth", role: "Ranking Minority" },
      { code: "DRB1", name: "Donald R. Berthiaume, Jr.", party: "R", district: "5th Worcester" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J19",
    slug: "judiciary",
    name: "Judiciary",
    fullName: "Joint Committee on the Judiciary",
    topic: "Democracy, Rights & Safety",
    senate: [
      { code: "LME0", name: "Lydia Edwards", party: "D", district: "Third Suffolk", role: "Chair" },
      { code: "JBE0", name: "James B. Eldridge", party: "D", district: "Middlesex and Worcester", role: "Vice Chair" },
      { code: "PDJ0", name: "Patricia D. Jehlen", party: "D", district: "Second Middlesex" },
      { code: "L M0", name: "Liz Miranda", party: "D", district: "Second Suffolk" },
      { code: "JCV0", name: "John C. Velis", party: "D", district: "Hampden and Hampshire" },
      { code: "PMO", name: "Patrick M. O'Connor", party: "R", district: "First Plymouth and Norfolk", role: "Ranking Minority" },
    ],
    house: [
      { code: "MSD1", name: "Michael S. Day", party: "D", district: "31st Middlesex", role: "Chair" },
      { code: "BFR1", name: "Brandy Fluker-Reid", party: "D", district: "12th Suffolk", role: "Vice Chair" },
      { code: "APR1", name: "Adrianne Pusateri Ramos", party: "D", district: "14th Essex" },
      { code: "RAM1", name: "Rita A. Mendes", party: "D", district: "11th Plymouth" },
      { code: "S_C1", name: "Simon Cataldo", party: "D", district: "14th Middlesex" },
      { code: "M_K1", name: "Meghan K. Kilcoyne", party: "D", district: "12th Worcester" },
      { code: "N_H1", name: "Natalie M. Higgins", party: "D", district: "4th Worcester" },
      { code: "CMG1", name: "Colleen M. Garry", party: "D", district: "36th Middlesex" },
      { code: "TWM1", name: "Thomas W. Moakley", party: "D", district: "Barnstable, Dukes and Nantucket" },
      { code: "DRB1", name: "Donald R. Berthiaume, Jr.", party: "R", district: "5th Worcester", role: "Ranking Minority" },
      { code: "AMS2", name: "Alyson M. Sullivan-Almeida", party: "R", district: "7th Plymouth" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J43",
    slug: "labor-and-workforce-development",
    name: "Labor and Workforce Development",
    fullName: "Joint Committee on Labor and Workforce Development",
    topic: "Work, Money & Business",
    senate: [
      { code: "JRO0", name: "Jacob R. Oliveira", party: "D", district: "Hampden, Hampshire and Worcester", role: "Chair" },
      { code: "jml0", name: "Jason M. Lewis", party: "D", district: "Fifth Middlesex", role: "Vice Chair" },
      { code: "SND0", name: "Sal N. DiDomenico", party: "D", district: "Middlesex and Suffolk" },
      { code: "PRF0", name: "Paul R. Feeney", party: "D", district: "Bristol and Norfolk" },
      { code: "PDJ0", name: "Patricia D. Jehlen", party: "D", district: "Second Middlesex" },
      { code: "PMO", name: "Patrick M. O'Connor", party: "R", district: "First Plymouth and Norfolk", role: "Ranking Minority" },
    ],
    house: [
      { code: "P_M1", name: "Paul McMurtry", party: "D", district: "11th Norfolk", role: "Chair" },
      { code: "T_V1", name: "Tommy Vitolo", party: "D", district: "15th Norfolk", role: "Vice Chair" },
      { code: "APR1", name: "Adrianne Pusateri Ramos", party: "D", district: "14th Essex" },
      { code: "MDS1", name: "Mark D. Sylvia", party: "D", district: "10th Bristol" },
      { code: "RMH2", name: "Ryan M. Hamilton", party: "D", district: "15th Essex" },
      { code: "BJA1", name: "Bruce J. Ayers", party: "D", district: "1st Norfolk" },
      { code: "HLB1", name: "Hannah Bowen", party: "D", district: "6th Essex" },
      { code: "R_C1", name: "Rob Consalvo", party: "D", district: "14th Suffolk" },
      { code: "DCG2", name: "Dennis C. Gallagher", party: "D", district: "8th Plymouth" },
      { code: "KPS1", name: "Kenneth P. Sweezey", party: "R", district: "6th Plymouth", role: "Ranking Minority" },
      { code: "DHW1", name: "Donald H. Wong", party: "R", district: "9th Essex" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J18",
    slug: "mental-health-substance-use-and-recovery",
    name: "Mental Health, Substance Use and Recovery",
    fullName: "Joint Committee on Mental Health, Substance Use and Recovery",
    topic: "Healthcare & Human Services",
    senate: [
      { code: "JCV0", name: "John C. Velis", party: "D", district: "Hampden and Hampshire", role: "Chair" },
      { code: "RKK0", name: "Robyn K. Kennedy", party: "D", district: "First Worcester", role: "Vice Chair" },
      { code: "N_C0", name: "Nick Collins", party: "D", district: "First Suffolk" },
      { code: "CSC0", name: "Cynthia Stone Creem", party: "D", district: "Norfolk and Middlesex" },
      { code: "JAC0", name: "Julian Cyr", party: "D", district: "Cape and Islands" },
      { code: "JFK0", name: "John F. Keenan", party: "D", district: "Norfolk and Plymouth" },
      { code: "KAD0", name: "Kelly A. Dooner", party: "R", district: "Third Bristol and Plymouth", role: "Ranking Minority" },
    ],
    house: [
      { code: "M_D2", name: "Mindy Domb", party: "D", district: "3rd Hampshire", role: "Chair" },
      { code: "MMD1", name: "Michelle M. DuBois", party: "D", district: "10th Plymouth", role: "Vice Chair" },
      { code: "SLG1", name: "Susannah M. Whipps", party: "U", district: "2nd Franklin" },
      { code: "S_R1", name: "Sean Reid", party: "D", district: "11th Essex" },
      { code: "JFM1", name: "John Francis Moran", party: "D", district: "9th Suffolk" },
      { code: "K_D1", name: "Kate Donaghue", party: "D", district: "19th Worcester" },
      { code: "CMG1", name: "Colleen M. Garry", party: "D", district: "36th Middlesex" },
      { code: "MSK1", name: "Mary S. Keefe", party: "D", district: "15th Worcester" },
      { code: "CMM1", name: "Christopher M. Markey", party: "D", district: "9th Bristol" },
      { code: "REH1", name: "Russell E. Holmes", party: "D", district: "6th Suffolk" },
      { code: "SGX1", name: "Steven George Xiarhos", party: "R", district: "5th Barnstable", role: "Ranking Minority" },
      { code: "DKM1", name: "David K. Muradian, Jr.", party: "R", district: "9th Worcester" },
      { code: "SSH1", name: "Steven S. Howitt", party: "R", district: "4th Bristol" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J10",
    slug: "municipalities-and-regional-government",
    name: "Municipalities and Regional Government",
    fullName: "Joint Committee on Municipalities and Regional Government",
    topic: "Housing, Transit & Community",
    senate: [
      { code: "RLR0", name: "Rebecca L. Rausch", party: "D", district: "Norfolk, Worcester and Middlesex", role: "Chair" },
      { code: "JFK0", name: "John F. Keenan", party: "D", district: "Norfolk and Plymouth", role: "Vice Chair" },
      { code: "MOM0", name: "Michael O. Moore", party: "D", district: "Second Worcester" },
      { code: "MFR0", name: "Michael F. Rush", party: "D", district: "Norfolk and Suffolk" },
      { code: "V_H0", name: "Vanna Howard", party: "D", district: "First Middlesex" },
      { code: "PJD0", name: "Peter J. Durant", party: "R", district: "Worcester and Hampshire", role: "Ranking Minority" },
    ],
    house: [
      { code: "JPL1", name: "Jack Patrick Lewis", party: "D", district: "7th Middlesex", role: "Chair" },
      { code: "L_S1", name: "Lindsay N. Sabadosa", party: "D", district: "1st Hampshire", role: "Vice Chair" },
      { code: "H_G1", name: "Homar Gómez", party: "D", district: "2nd Hampshire" },
      { code: "S_M1", name: "Samantha Montaño", party: "D", district: "15th Suffolk" },
      { code: "K_K2", name: "Kristin E. Kassner", party: "D", district: "2nd Essex" },
      { code: "M_C1", name: "Mike Connolly", party: "D", district: "26th Middlesex" },
      { code: "CLG1", name: "Carmine Lawrence Gentile", party: "D", district: "13th Middlesex" },
      { code: "J_T1", name: "Joshua Tarsky", party: "D", district: "13th Norfolk" },
      { code: "RGW1", name: "Richard G. Wells, Jr.", party: "D", district: "7th Norfolk" },
      { code: "MSC1", name: "Michael S. Chaisson", party: "R", district: "1st Bristol", role: "Ranking Minority" },
      { code: "NJO1", name: "Norman J. Orrall", party: "R", district: "12th Bristol" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J16",
    slug: "public-health",
    name: "Public Health",
    fullName: "Joint Committee on Public Health",
    topic: "Healthcare & Human Services",
    senate: [
      { code: "WJD0", name: "William J. Driscoll, Jr.", party: "D", district: "Norfolk, Plymouth and Bristol", role: "Chair" },
      { code: "JAC0", name: "Julian Cyr", party: "D", district: "Cape and Islands", role: "Vice Chair" },
      { code: "JFK0", name: "John F. Keenan", party: "D", district: "Norfolk and Plymouth" },
      { code: "RKK0", name: "Robyn K. Kennedy", party: "D", district: "First Worcester" },
      { code: "jml0", name: "Jason M. Lewis", party: "D", district: "Fifth Middlesex" },
      { code: "KAD0", name: "Kelly A. Dooner", party: "R", district: "Third Bristol and Plymouth", role: "Ranking Minority" },
    ],
    house: [
      { code: "MCD1", name: "Marjorie C. Decker", party: "D", district: "25th Middlesex", role: "Chair" },
      { code: "SPK1", name: "Sally P. Kerans", party: "D", district: "13th Essex", role: "Vice Chair" },
      { code: "PSS1", name: "Priscila S. Sousa", party: "D", district: "6th Middlesex" },
      { code: "S_M1", name: "Samantha Montaño", party: "D", district: "15th Suffolk" },
      { code: "SBA1", name: "Shirley B. Arriaga", party: "D", district: "8th Hampden" },
      { code: "BJA1", name: "Bruce J. Ayers", party: "D", district: "1st Norfolk" },
      { code: "M_C2", name: "Michelle L. Ciccolo", party: "D", district: "15th Middlesex" },
      { code: "S_R1", name: "Sean Reid", party: "D", district: "11th Essex" },
      { code: "AMS3", name: "Amy Mah Sangiolo", party: "D", district: "11th Middlesex" },
      { code: "HEK1", name: "Hannah Kane", party: "R", district: "11th Worcester", role: "Ranking Minority" },
      { code: "J_T2", name: "Justin Thurber", party: "R", district: "5th Bristol" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J22",
    slug: "public-safety-and-homeland-security",
    name: "Public Safety and Homeland Security",
    fullName: "Joint Committee on Public Safety and Homeland Security",
    topic: "Democracy, Rights & Safety",
    senate: [
      { code: "JJC0", name: "John J. Cronin", party: "D", district: "Worcester and Middlesex", role: "Chair" },
      { code: "WJD0", name: "William J. Driscoll, Jr.", party: "D", district: "Norfolk, Plymouth and Bristol", role: "Vice Chair" },
      { code: "JBE0", name: "James B. Eldridge", party: "D", district: "Middlesex and Worcester" },
      { code: "DAF0", name: "Dylan A. Fernandes", party: "D", district: "Plymouth and Barnstable" },
      { code: "MOM0", name: "Michael O. Moore", party: "D", district: "Second Worcester" },
      { code: "JCV0", name: "John C. Velis", party: "D", district: "Hampden and Hampshire" },
      { code: "PJD0", name: "Peter J. Durant", party: "R", district: "Worcester and Hampshire", role: "Ranking Minority" },
    ],
    house: [
      { code: "DFC1", name: "Daniel Cahill", party: "D", district: "10th Essex", role: "Chair" },
      { code: "CJW1", name: "Christopher J. Worrell", party: "D", district: "5th Suffolk", role: "Vice Chair" },
      { code: "RGW1", name: "Richard G. Wells, Jr.", party: "D", district: "7th Norfolk" },
      { code: "BMP1", name: "Bridget Plouffe", party: "D", district: "9th Plymouth" },
      { code: "A_S1", name: "Alan Silvia", party: "D", district: "7th Bristol" },
      { code: "DPL1", name: "David Paul Linsky", party: "D", district: "5th Middlesex" },
      { code: "H_G1", name: "Homar Gómez", party: "D", district: "2nd Hampshire" },
      { code: "AMS3", name: "Amy Mah Sangiolo", party: "D", district: "11th Middlesex" },
      { code: "M_C2", name: "Michelle L. Ciccolo", party: "D", district: "15th Middlesex" },
      { code: "MSV1", name: "Marcus S. Vaughn", party: "R", district: "9th Norfolk", role: "Ranking Minority" },
      { code: "SGX1", name: "Steven George Xiarhos", party: "R", district: "5th Barnstable" },
      { code: "KPS1", name: "Kenneth P. Sweezey", party: "R", district: "6th Plymouth" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J23",
    slug: "public-service",
    name: "Public Service",
    fullName: "Joint Committee on Public Service",
    topic: "Government Affairs",
    senate: [
      { code: "MDB0", name: "Michael D. Brady", party: "D", district: "Second Plymouth and Norfolk", role: "Chair" },
      { code: "MCM0", name: "Mark C. Montigny", party: "D", district: "Second Bristol and Plymouth", role: "Vice Chair" },
      { code: "JBE0", name: "James B. Eldridge", party: "D", district: "Middlesex and Worcester" },
      { code: "JFK0", name: "John F. Keenan", party: "D", district: "Norfolk and Plymouth" },
      { code: "JRO0", name: "Jacob R. Oliveira", party: "D", district: "Hampden, Hampshire and Worcester" },
      { code: "KAD0", name: "Kelly A. Dooner", party: "R", district: "Third Bristol and Plymouth", role: "Ranking Minority" },
    ],
    house: [
      { code: "djr1", name: "Daniel J. Ryan", party: "D", district: "2nd Suffolk", role: "Chair" },
      { code: "N_H1", name: "Natalie M. Higgins", party: "D", district: "4th Worcester", role: "Vice Chair" },
      { code: "JFM1", name: "John Francis Moran", party: "D", district: "9th Suffolk" },
      { code: "JCD1", name: "James C. Arena-DeRosa", party: "D", district: "8th Middlesex" },
      { code: "J_T1", name: "Joshua Tarsky", party: "D", district: "13th Norfolk" },
      { code: "D_R1", name: "David Allen Robertson", party: "D", district: "19th Middlesex" },
      { code: "A_S1", name: "Alan Silvia", party: "D", district: "7th Bristol" },
      { code: "CMG1", name: "Colleen M. Garry", party: "D", district: "36th Middlesex" },
      { code: "DFD1", name: "David F. DeCoste", party: "R", district: "5th Plymouth", role: "Ranking Minority" },
      { code: "TMS2", name: "Todd M. Smola", party: "R", district: "1st Hampden" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J34",
    slug: "racial-equity-civil-rights-and-inclusion",
    name: "Racial Equity, Civil Rights, and Inclusion",
    fullName: "Joint Committee on Racial Equity, Civil Rights, and Inclusion",
    topic: "Democracy, Rights & Safety",
    senate: [
      { code: "L M0", name: "Liz Miranda", party: "D", district: "Second Suffolk", role: "Chair" },
      { code: "A_G0", name: "Adam Gómez", party: "D", district: "Hampden", role: "Vice Chair" },
      { code: "JMC0", name: "Joanne M. Comerford", party: "D", district: "Hampshire, Franklin and Worcester" },
      { code: "JAC0", name: "Julian Cyr", party: "D", district: "Cape and Islands" },
      { code: "RKK0", name: "Robyn K. Kennedy", party: "D", district: "First Worcester" },
      { code: "BET0", name: "Bruce E. Tarr", party: "R", district: "First Essex and Middlesex", role: "Ranking Minority" },
    ],
    house: [
      { code: "BLW1", name: "Bud L. Williams", party: "D", district: "11th Hampden", role: "Chair" },
      { code: "O_R1", name: "Orlando Ramos", party: "D", district: "9th Hampden", role: "Vice Chair" },
      { code: "RAM1", name: "Rita A. Mendes", party: "D", district: "11th Plymouth" },
      { code: "E_U1", name: "Erika Uyterhoeven", party: "D", district: "27th Middlesex" },
      { code: "KAD1", name: "Kip A. Diggs", party: "D", district: "2nd Barnstable" },
      { code: "MSK1", name: "Mary S. Keefe", party: "D", district: "15th Worcester" },
      { code: "REH1", name: "Russell E. Holmes", party: "D", district: "6th Suffolk" },
      { code: "AMS3", name: "Amy Mah Sangiolo", party: "D", district: "11th Middlesex" },
      { code: "DHW1", name: "Donald H. Wong", party: "R", district: "9th Essex", role: "Ranking Minority" },
      { code: "DFD1", name: "David F. DeCoste", party: "R", district: "5th Plymouth" },
    ],
    vacant: { senate: 0, house: 1 },
  },
  {
    code: "J26",
    slug: "revenue",
    name: "Revenue",
    fullName: "Joint Committee on Revenue",
    // Taxes, which a reader may look for under money. Here because they are
    // the state's own finances, with Ways and Means.
    topic: "Government Affairs",
    senate: [
      { code: "JBE0", name: "James B. Eldridge", party: "D", district: "Middlesex and Worcester", role: "Chair" },
      { code: "PDJ0", name: "Patricia D. Jehlen", party: "D", district: "Second Middlesex", role: "Vice Chair" },
      { code: "MDB0", name: "Michael D. Brady", party: "D", district: "Second Plymouth and Norfolk" },
      { code: "JFK0", name: "John F. Keenan", party: "D", district: "Norfolk and Plymouth" },
      { code: "RLR0", name: "Rebecca L. Rausch", party: "D", district: "Norfolk, Worcester and Middlesex" },
      { code: "RCF0", name: "Ryan C. Fattman", party: "R", district: "Worcester and Hampden", role: "Ranking Minority" },
    ],
    house: [
      { code: "ACM1", name: "Adrian C. Madaro", party: "D", district: "1st Suffolk", role: "Chair" },
      { code: "DPL1", name: "David Paul Linsky", party: "D", district: "5th Middlesex", role: "Vice Chair" },
      { code: "FEP1", name: "Francisco E. Paulino", party: "D", district: "16th Essex" },
      { code: "K_K2", name: "Kristin E. Kassner", party: "D", district: "2nd Essex" },
      { code: "ERP1", name: "Edward R. Philips", party: "D", district: "8th Norfolk" },
      { code: "BMP1", name: "Bridget Plouffe", party: "D", district: "9th Plymouth" },
      { code: "PJD1", name: "Paul J. Donato", party: "D", district: "35th Middlesex" },
      { code: "H_G1", name: "Homar Gómez", party: "D", district: "2nd Hampshire" },
      { code: "RGW1", name: "Richard G. Wells, Jr.", party: "D", district: "7th Norfolk" },
      { code: "MTL1", name: "Marc T. Lombardo", party: "R", district: "22nd Middlesex", role: "Ranking Minority" },
      { code: "NAG1", name: "Nicholas A. Boldyga", party: "R", district: "3rd Hampden" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J40",
    slug: "rules",
    name: "Rules",
    fullName: "Joint Committee on Rules",
    topic: "Government Affairs",
    senate: [
      { code: "JBL0", name: "Joan B. Lovely", party: "D", district: "Second Essex", role: "Chair" },
      { code: "CFF0", name: "Cindy F. Friedman", party: "D", district: "Fourth Middlesex", role: "Vice Chair" },
      { code: "WNB0", name: "William N. Brownsberger", party: "D", district: "Suffolk and Middlesex" },
      { code: "BPC0", name: "Brendan P. Crighton", party: "D", district: "Third Essex" },
      { code: "jml0", name: "Jason M. Lewis", party: "D", district: "Fifth Middlesex" },
      { code: "RCF0", name: "Ryan C. Fattman", party: "R", district: "Worcester and Hampden", role: "Ranking Minority" },
      { code: "BET0", name: "Bruce E. Tarr", party: "R", district: "First Essex and Middlesex" },
    ],
    house: [
      { code: "WCG1", name: "William C. Galvin", party: "D", district: "6th Norfolk", role: "Chair" },
      { code: "R_C1", name: "Rob Consalvo", party: "D", district: "14th Suffolk", role: "Vice Chair" },
      { code: "MJM1", name: "Michael J. Moran", party: "D", district: "18th Suffolk" },
      { code: "K_H1", name: "Kate Hogan", party: "D", district: "3rd Middlesex" },
      { code: "AHP1", name: "Alice Hanlon Peisch", party: "D", district: "14th Norfolk" },
      { code: "FAM1", name: "Frank A. Moran", party: "D", district: "17th Essex" },
      { code: "CAF1", name: "Carole A. Fiola", party: "D", district: "6th Bristol" },
      { code: "MJC1", name: "Mark J. Cusack", party: "D", district: "5th Norfolk" },
      { code: "PJD1", name: "Paul J. Donato", party: "D", district: "35th Middlesex" },
      { code: "C_G1", name: "Carlos González", party: "D", district: "10th Hampden" },
      { code: "DWG1", name: "Danielle W. Gregoire", party: "D", district: "4th Middlesex" },
      { code: "DHW1", name: "Donald H. Wong", party: "R", district: "9th Essex", role: "Ranking Minority" },
      { code: "PKF1", name: "Paul K. Frost", party: "R", district: "7th Worcester" },
      { code: "DKM1", name: "David K. Muradian, Jr.", party: "R", district: "9th Worcester" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J25",
    slug: "state-administration-and-regulatory-oversight",
    name: "State Administration and Regulatory Oversight",
    fullName: "Joint Committee on State Administration and Regulatory Oversight",
    topic: "Government Affairs",
    senate: [
      { code: "N_C0", name: "Nick Collins", party: "D", district: "First Suffolk", role: "Chair" },
      { code: "JBE0", name: "James B. Eldridge", party: "D", district: "Middlesex and Worcester", role: "Vice Chair" },
      { code: "SND0", name: "Sal N. DiDomenico", party: "D", district: "Middlesex and Suffolk" },
      { code: "RLR0", name: "Rebecca L. Rausch", party: "D", district: "Norfolk, Worcester and Middlesex" },
      { code: "JCV0", name: "John C. Velis", party: "D", district: "Hampden and Hampshire" },
      { code: "PJD0", name: "Peter J. Durant", party: "R", district: "Worcester and Hampshire", role: "Ranking Minority" },
    ],
    house: [
      { code: "AFC1", name: "Antonio F. D. Cabral", party: "D", district: "13th Bristol", role: "Chair" },
      { code: "C_T1", name: "Chynah Tyler", party: "D", district: "7th Suffolk", role: "Vice Chair" },
      { code: "EAR1", name: "Estela A. Reyes", party: "D", district: "4th Essex" },
      { code: "JBA1", name: "Jennifer Balinsky Armini", party: "D", district: "8th Essex" },
      { code: "DCG2", name: "Dennis C. Gallagher", party: "D", district: "8th Plymouth" },
      { code: "LSD1", name: "Leigh Davis", party: "D", district: "3rd Berkshire" },
      { code: "CLG1", name: "Carmine Lawrence Gentile", party: "D", district: "13th Middlesex" },
      { code: "HLB1", name: "Hannah Bowen", party: "D", district: "6th Essex" },
      { code: "CMG1", name: "Colleen M. Garry", party: "D", district: "36th Middlesex" },
      { code: "HEK1", name: "Hannah Kane", party: "R", district: "11th Worcester", role: "Ranking Minority" },
      { code: "MSC1", name: "Michael S. Chaisson", party: "R", district: "1st Bristol" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J37",
    slug: "telecommunications-utilities-and-energy",
    name: "Telecommunications, Utilities and Energy",
    fullName: "Joint Committee on Telecommunications, Utilities and Energy",
    // Telecommunications in name only: its charge is energy sources, siting
    // and utilities.
    topic: "Climate, Energy & Environment",
    senate: [
      { code: "MJB0", name: "Michael J. Barrett", party: "D", district: "Third Middlesex", role: "Chair" },
      { code: "MDB0", name: "Michael D. Brady", party: "D", district: "Second Plymouth and Norfolk", role: "Vice Chair" },
      { code: "JJC0", name: "John J. Cronin", party: "D", district: "Worcester and Middlesex" },
      { code: "JAC0", name: "Julian Cyr", party: "D", district: "Cape and Islands" },
      { code: "DAF0", name: "Dylan A. Fernandes", party: "D", district: "Plymouth and Barnstable" },
      { code: "BET0", name: "Bruce E. Tarr", party: "R", district: "First Essex and Middlesex", role: "Ranking Minority" },
    ],
    house: [
      { code: "MJC1", name: "Mark J. Cusack", party: "D", district: "5th Norfolk", role: "Chair" },
      { code: "MPK1", name: "Michael P. Kushmerek", party: "D", district: "3rd Worcester", role: "Vice Chair" },
      { code: "WFM1", name: "William F. MacGregor", party: "D", district: "10th Suffolk" },
      { code: "JRT1", name: "Jeffrey Rosario Turco", party: "D", district: "19th Suffolk" },
      { code: "D_R1", name: "David Allen Robertson", party: "D", district: "19th Middlesex" },
      { code: "C_T1", name: "Chynah Tyler", party: "D", district: "7th Suffolk" },
      { code: "N_H1", name: "Natalie M. Higgins", party: "D", district: "4th Worcester" },
      { code: "MRS1", name: "Margaret R. Scarsdale", party: "D", district: "1st Middlesex" },
      { code: "S_R1", name: "Sean Reid", party: "D", district: "11th Essex" },
      { code: "BHJ1", name: "Bradley H. Jones, Jr.", party: "R", district: "20th Middlesex", role: "Ranking Minority" },
      { code: "KNF1", name: "Kimberly N. Ferguson", party: "R", district: "1st Worcester" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J30",
    slug: "tourism-arts-and-cultural-development",
    name: "Tourism, Arts and Cultural Development",
    fullName: "Joint Committee on Tourism, Arts and Cultural Development",
    // No natural home. Community is the nearest.
    topic: "Housing, Transit & Community",
    senate: [
      { code: "PWM0", name: "Paul W. Mark", party: "D", district: "Berkshire, Hampden, Franklin and Hampshire", role: "Chair" },
      { code: "A_G0", name: "Adam Gómez", party: "D", district: "Hampden", role: "Vice Chair" },
      { code: "MJB0", name: "Michael J. Barrett", party: "D", district: "Third Middlesex" },
      { code: "RLR0", name: "Rebecca L. Rausch", party: "D", district: "Norfolk, Worcester and Middlesex" },
      { code: "V_H0", name: "Vanna Howard", party: "D", district: "First Middlesex" },
      { code: "BET0", name: "Bruce E. Tarr", party: "R", district: "First Essex and Middlesex", role: "Ranking Minority" },
    ],
    house: [
      { code: "S_G1", name: "Sean Garballey", party: "D", district: "23rd Middlesex", role: "Chair" },
      { code: "SCO1", name: "Steven Owens", party: "D", district: "29th Middlesex", role: "Vice Chair" },
      { code: "BMA1", name: "Brian M. Ashe", party: "D", district: "2nd Hampden" },
      { code: "TWM1", name: "Thomas W. Moakley", party: "D", district: "Barnstable, Dukes and Nantucket" },
      { code: "H_L1", name: "Hadley Luddy", party: "D", district: "4th Barnstable" },
      { code: "M_C1", name: "Mike Connolly", party: "D", district: "26th Middlesex" },
      { code: "MSK1", name: "Mary S. Keefe", party: "D", district: "15th Worcester" },
      { code: "DPL1", name: "David Paul Linsky", party: "D", district: "5th Middlesex" },
      { code: "BJA1", name: "Bruce J. Ayers", party: "D", district: "1st Norfolk" },
      { code: "DHW1", name: "Donald H. Wong", party: "R", district: "9th Essex", role: "Ranking Minority" },
      { code: "DTV1", name: "David T. Vieira", party: "R", district: "3rd Barnstable" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J27",
    slug: "transportation",
    name: "Transportation",
    fullName: "Joint Committee on Transportation",
    topic: "Housing, Transit & Community",
    senate: [
      { code: "BPC0", name: "Brendan P. Crighton", party: "D", district: "Third Essex", role: "Chair" },
      { code: "PWM0", name: "Paul W. Mark", party: "D", district: "Berkshire, Hampden, Franklin and Hampshire", role: "Vice Chair" },
      { code: "WNB0", name: "William N. Brownsberger", party: "D", district: "Suffolk and Middlesex" },
      { code: "LME0", name: "Lydia Edwards", party: "D", district: "Third Suffolk" },
      { code: "DAF0", name: "Dylan A. Fernandes", party: "D", district: "Plymouth and Barnstable" },
      { code: "jml0", name: "Jason M. Lewis", party: "D", district: "Fifth Middlesex" },
      { code: "PMO", name: "Patrick M. O'Connor", party: "R", district: "First Plymouth and Norfolk", role: "Ranking Minority" },
    ],
    house: [
      { code: "J_A1", name: "James Arciero", party: "D", district: "2nd Middlesex", role: "Chair" },
      { code: "ERP1", name: "Edward R. Philips", party: "D", district: "8th Norfolk", role: "Vice Chair" },
      { code: "C_H1", name: "Christopher Hendricks", party: "D", district: "11th Bristol" },
      { code: "HLB1", name: "Hannah Bowen", party: "D", district: "6th Essex" },
      { code: "JBA1", name: "Jennifer Balinsky Armini", party: "D", district: "8th Essex" },
      { code: "O_R1", name: "Orlando Ramos", party: "D", district: "9th Hampden" },
      { code: "SCO1", name: "Steven Owens", party: "D", district: "29th Middlesex" },
      { code: "L_S1", name: "Lindsay N. Sabadosa", party: "D", district: "1st Hampshire" },
      { code: "JKH1", name: "James K. Hawkins", party: "D", district: "2nd Bristol" },
      { code: "DPL1", name: "David Paul Linsky", party: "D", district: "5th Middlesex" },
      { code: "DFD1", name: "David F. DeCoste", party: "R", district: "5th Plymouth", role: "Ranking Minority" },
      { code: "NJO1", name: "Norman J. Orrall", party: "R", district: "12th Bristol" },
      { code: "JJM1", name: "John J. Marsi", party: "R", district: "6th Worcester" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J31",
    slug: "veterans-and-federal-affairs",
    name: "Veterans and Federal Affairs",
    fullName: "Joint Committee on Veterans and Federal Affairs",
    // Veterans are a constituency rather than a branch of government. Here for
    // the federal affairs half of its charge.
    topic: "Government Affairs",
    senate: [
      { code: "JCV0", name: "John C. Velis", party: "D", district: "Hampden and Hampshire", role: "Chair" },
      { code: "MFR0", name: "Michael F. Rush", party: "D", district: "Norfolk and Suffolk", role: "Vice Chair" },
      { code: "MDB0", name: "Michael D. Brady", party: "D", district: "Second Plymouth and Norfolk" },
      { code: "N_C0", name: "Nick Collins", party: "D", district: "First Suffolk" },
      { code: "MCM0", name: "Mark C. Montigny", party: "D", district: "Second Bristol and Plymouth" },
      { code: "RCF0", name: "Ryan C. Fattman", party: "R", district: "Worcester and Hampden", role: "Ranking Minority" },
    ],
    house: [
      { code: "jwm1", name: "Joseph W. McGonagle, Jr.", party: "D", district: "28th Middlesex", role: "Chair" },
      { code: "JRT1", name: "Jeffrey Rosario Turco", party: "D", district: "19th Suffolk", role: "Vice Chair" },
      { code: "EAR1", name: "Estela A. Reyes", party: "D", district: "4th Essex" },
      { code: "SBA1", name: "Shirley B. Arriaga", party: "D", district: "8th Hampden" },
      { code: "JCD1", name: "James C. Arena-DeRosa", party: "D", district: "8th Middlesex" },
      { code: "A_S1", name: "Alan Silvia", party: "D", district: "7th Bristol" },
      { code: "PAD1", name: "Patricia A. Duffy", party: "D", district: "5th Hampden" },
      { code: "J_T1", name: "Joshua Tarsky", party: "D", district: "13th Norfolk" },
      { code: "PJK1", name: "Patrick Joseph Kearney", party: "D", district: "4th Plymouth" },
      { code: "J_T2", name: "Justin Thurber", party: "R", district: "5th Bristol", role: "Ranking Minority" },
      { code: "JRG2", name: "John R. Gaskey", party: "R", district: "2nd Plymouth" },
    ],
    vacant: { senate: 0, house: 0 },
  },
  {
    code: "J39",
    slug: "ways-and-means",
    name: "Ways and Means",
    fullName: "Joint Committee on Ways and Means",
    topic: "Government Affairs",
    senate: [
      { code: "MJR0", name: "Michael J. Rodrigues", party: "D", district: "First Bristol and Plymouth", role: "Chair" },
      { code: "JMC0", name: "Joanne M. Comerford", party: "D", district: "Hampshire, Franklin and Worcester", role: "Vice Chair" },
      { code: "PRF0", name: "Paul R. Feeney", party: "D", district: "Bristol and Norfolk", role: "Assistant Vice Chair" },
      { code: "MDB0", name: "Michael D. Brady", party: "D", district: "Second Plymouth and Norfolk" },
      { code: "N_C0", name: "Nick Collins", party: "D", district: "First Suffolk" },
      { code: "BPC0", name: "Brendan P. Crighton", party: "D", district: "Third Essex" },
      { code: "JJC0", name: "John J. Cronin", party: "D", district: "Worcester and Middlesex" },
      { code: "LME0", name: "Lydia Edwards", party: "D", district: "Third Suffolk" },
      { code: "A_G0", name: "Adam Gómez", party: "D", district: "Hampden" },
      { code: "RKK0", name: "Robyn K. Kennedy", party: "D", district: "First Worcester" },
      { code: "PWM0", name: "Paul W. Mark", party: "D", district: "Berkshire, Hampden, Franklin and Hampshire" },
      { code: "L M0", name: "Liz Miranda", party: "D", district: "Second Suffolk" },
      { code: "JRO0", name: "Jacob R. Oliveira", party: "D", district: "Hampden, Hampshire and Worcester" },
      { code: "PMP0", name: "Pavel M. Payano", party: "D", district: "First Essex" },
      { code: "MFR0", name: "Michael F. Rush", party: "D", district: "Norfolk and Suffolk" },
      { code: "PMO", name: "Patrick M. O'Connor", party: "R", district: "First Plymouth and Norfolk", role: "Ranking Minority" },
      { code: "RCF0", name: "Ryan C. Fattman", party: "R", district: "Worcester and Hampden" },
      { code: "KAD0", name: "Kelly A. Dooner", party: "R", district: "Third Bristol and Plymouth" },
    ],
    house: [
      { code: "AMM1", name: "Aaron Michlewitz", party: "D", district: "3rd Suffolk", role: "Chair" },
      { code: "KAD1", name: "Kip A. Diggs", party: "D", district: "2nd Barnstable", role: "Assistant Vice Chair" },
      { code: "SBA1", name: "Shirley B. Arriaga", party: "D", district: "8th Hampden" },
      { code: "D_B1", name: "David Biele", party: "D", district: "4th Suffolk" },
      { code: "M_C3", name: "Manny Cruz", party: "D", district: "7th Essex" },
      { code: "PAD1", name: "Patricia A. Duffy", party: "D", district: "5th Hampden" },
      { code: "JAG2", name: "Judith A. Garcia", party: "D", district: "11th Suffolk" },
      { code: "RMH2", name: "Ryan M. Hamilton", party: "D", district: "15th Essex" },
      { code: "JKH1", name: "James K. Hawkins", party: "D", district: "2nd Bristol" },
      { code: "N_H1", name: "Natalie M. Higgins", party: "D", district: "4th Worcester" },
      { code: "REH1", name: "Russell E. Holmes", party: "D", district: "6th Suffolk" },
      { code: "K_K2", name: "Kristin E. Kassner", party: "D", district: "2nd Essex" },
      { code: "PJK1", name: "Patrick Joseph Kearney", party: "D", district: "4th Plymouth" },
      { code: "SPK1", name: "Sally P. Kerans", party: "D", district: "13th Essex" },
      { code: "M_K1", name: "Meghan K. Kilcoyne", party: "D", district: "12th Worcester" },
      { code: "RAM1", name: "Rita A. Mendes", party: "D", district: "11th Plymouth" },
      { code: "S_M1", name: "Samantha Montaño", party: "D", district: "15th Suffolk" },
      { code: "JFM1", name: "John Francis Moran", party: "D", district: "9th Suffolk" },
      { code: "SCO1", name: "Steven Owens", party: "D", district: "29th Middlesex" },
      { code: "O_R1", name: "Orlando Ramos", party: "D", district: "9th Hampden" },
      { code: "L_S1", name: "Lindsay N. Sabadosa", party: "D", district: "1st Hampshire" },
      { code: "MRS1", name: "Margaret R. Scarsdale", party: "D", district: "1st Middlesex" },
      { code: "A_S1", name: "Alan Silvia", party: "D", district: "7th Bristol" },
      { code: "PSS1", name: "Priscila S. Sousa", party: "D", district: "6th Middlesex" },
      { code: "C_T1", name: "Chynah Tyler", party: "D", district: "7th Suffolk" },
      { code: "TMS2", name: "Todd M. Smola", party: "R", district: "1st Hampden", role: "Ranking Minority" },
      { code: "JDM1", name: "Joseph D. McKenna", party: "R", district: "18th Worcester" },
      { code: "KWP1", name: "Kelly W. Pease", party: "R", district: "4th Hampden" },
      { code: "MSC1", name: "Michael S. Chaisson", party: "R", district: "1st Bristol" },
      { code: "JJM1", name: "John J. Marsi", party: "R", district: "6th Worcester" },
      { code: "AMS2", name: "Alyson M. Sullivan-Almeida", party: "R", district: "7th Plymouth" },
      { code: "MSV1", name: "Marcus S. Vaughn", party: "R", district: "9th Norfolk" },
      { code: "SGX1", name: "Steven George Xiarhos", party: "R", district: "5th Barnstable" },
    ],
    vacant: { senate: 0, house: 1 },
  },
  {
    code: "SJ42",
    slug: "initiative-petitions",
    name: "Initiative Petitions",
    fullName: "Special Joint Committee on Initiative Petitions",
    topic: "Democracy, Rights & Safety",
    special: true,
    senate: [
      { code: "CFF0", name: "Cindy F. Friedman", party: "D", district: "Fourth Middlesex", role: "Chair" },
      { code: "BPC0", name: "Brendan P. Crighton", party: "D", district: "Third Essex" },
      { code: "PRF0", name: "Paul R. Feeney", party: "D", district: "Bristol and Norfolk" },
      { code: "BRF0", name: "Barry R. Finegold", party: "D", district: "Second Essex and Middlesex" },
      { code: "RCF0", name: "Ryan C. Fattman", party: "R", district: "Worcester and Hampden", role: "Ranking Minority" },
    ],
    house: [
      { code: "AHP1", name: "Alice Hanlon Peisch", party: "D", district: "14th Norfolk", role: "Chair" },
      { code: "K_H1", name: "Kate Hogan", party: "D", district: "3rd Middlesex" },
      { code: "FAM1", name: "Frank A. Moran", party: "D", district: "17th Essex" },
      { code: "MSD1", name: "Michael S. Day", party: "D", district: "31st Middlesex" },
      { code: "DTV1", name: "David T. Vieira", party: "R", district: "3rd Barnstable", role: "Ranking Minority" },
    ],
    vacant: { senate: 0, house: 0 },
  },
];

export const JOINT_BY_SLUG: Record<string, JointCommittee> =
  Object.fromEntries(JOINT_COMMITTEES.map((c) => [c.slug, c]));

/** The committee's own page on malegislature.gov. */
export const committeeUrl = (code: string) =>
  `https://malegislature.gov/Committees/Detail/${code}`;

/** A chamber's chair or vice chair, or nothing where the page names no one. */
export const officer = (members: JointMember[], role: JointRole) =>
  members.find((m) => m.role === role);

/**
 * Each member's seat and portrait, by member code.
 *
 * The roster stores Liz Miranda's code with a hyphen where the legislature has a
 * space ("L M0"), the same swap her portrait's file name makes, so the lookup
 * makes it too. The seat is what the reader's own legislators are keyed by.
 */
const SEAT_BY_CODE = Object.fromEntries(
  Object.entries(MEMBER_BY_SEAT).map(([seat, m]) => [
    m.code,
    { seat, portrait: m.portrait },
  ]),
);

export const seatOf = (code: string) =>
  SEAT_BY_CODE[code.replace(" ", "-")] as
    | { seat: string; portrait: string }
    | undefined;
