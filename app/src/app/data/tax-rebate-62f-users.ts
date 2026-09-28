// User accounts for organizations and officials that have taken a public
// position on the 2026 Massachusetts Chapter 62F reform ballot question, per
// Ballotpedia (see the "Change State Tax Revenue Limit Initiative" page).
// Rendered in the Public Perspectives tab as if each had registered a MAPLE
// account with an uploaded avatar. Parallels src/app/data/rent-control-users.ts.
//
// Avatars are official images, or initials if no image is available.

import avatarPMF from "../../assets/avatars/protect-ma-future.png";
import avatarTAM from "../../assets/avatars/taxpayers-affordable-ma.png";
import avatarSpilka from "../../assets/avatars/spilka.jpg";
// The nine members who signed the Special Joint Committee on Initiative
// Petitions' majority report, and the one who signed the minority report.
// Official General Court portraits, from each member's profile on
// malegislature.gov.
import avatarFriedman from "../../assets/avatars/friedman.jpg";
import avatarCrighton from "../../assets/avatars/crighton.jpg";
import avatarFeeney from "../../assets/avatars/feeney.jpg";
import avatarFinegold from "../../assets/avatars/finegold.jpg";
import avatarFattman from "../../assets/avatars/fattman.jpg";
import avatarPeisch from "../../assets/avatars/peisch.jpg";
import avatarHogan from "../../assets/avatars/hogan.jpg";
import avatarMoran from "../../assets/avatars/moran.jpg";
import avatarDay from "../../assets/avatars/day.jpg";
import avatarVieira from "../../assets/avatars/vieira.jpg";
import avatarMassFiscal from "../../assets/avatars/mass-fiscal.png";
import avatarSeiu509 from "../../assets/avatars/seiu-509.png";
import avatarPioneer from "../../assets/avatars/pioneer-institute.png";
import avatarMHTC from "../../assets/avatars/mass-high-tech-council.png";
import avatarMassBudget from "../../assets/avatars/massbudget.png";
import avatarMTA from "../../assets/avatars/mta.png";
import avatarMOA from "../../assets/avatars/mass-opportunity-alliance.png";
import avatarMTF from "../../assets/avatars/mtf.png";

// "organization" — advocacy groups, unions, and trade associations.
// "legislator" — individual members of the General Court.
// "government" — executive-office accounts ("Office of …").
export type PositionUserType =
  | "organization"
  | "legislator"
  | "government"
  | "individual";
/**
 * "neutral" exists for accounts that filed without taking a side. The roster
 * and the campaign coalitions read this field, so an account that has not
 * endorsed either campaign must not be counted into one of them.
 */
export type PositionStance = "supports" | "opposes" | "neutral";

export interface PositionUser {
  id: string;
  name: string;
  userType: PositionUserType;
  /** Short account descriptor shown under the name. */
  descriptor: string;
  stance: PositionStance;
  /** Uploaded avatar; when absent the UI renders an initials avatar. */
  avatar?: string;
  /** Initials for the fallback avatar (required when `avatar` is absent). */
  initials?: string;
  /** Sample viewer data: whether the prototype's current user follows this account. */
  followedByViewer?: boolean;
}

export const POSITION_USERS: PositionUser[] = [
  // ── Individuals ───────────────────────────────────────────────────────────
  // Fabricated for the prototype: invented people, invented statements, no
  // real filings behind them. They exist because the account-type and
  // no-position filters had nothing to find without them, and because a
  // question decided by voters should not read as a fight between ten
  // organizations. No avatars by design; initials are the individual's mark.
  {
    id: "p-ramirez",
    name: "Dolores Ramirez",
    userType: "individual",
    descriptor: "Retired, Holyoke",
    stance: "supports",
    initials: "DR",
  },
  {
    id: "p-okafor",
    name: "Chidi Okafor",
    userType: "individual",
    descriptor: "Small-business owner, Lowell",
    stance: "supports",
    initials: "CO",
  },
  {
    id: "p-bergeron",
    name: "Paul Bergeron",
    userType: "individual",
    descriptor: "Machinist, New Bedford",
    stance: "supports",
    initials: "PB",
    followedByViewer: true,
  },
  {
    id: "p-whitcomb",
    name: "Sarah Whitcomb",
    userType: "individual",
    descriptor: "Homeowner, Pittsfield",
    stance: "supports",
    initials: "SW",
  },
  {
    id: "p-tran",
    name: "Linh Tran",
    userType: "individual",
    descriptor: "School counselor, Worcester",
    stance: "opposes",
    initials: "LT",
  },
  {
    id: "p-alvarez",
    name: "Marisol Alvarez",
    userType: "individual",
    descriptor: "Home health aide, Springfield",
    stance: "opposes",
    initials: "MA",
    followedByViewer: true,
  },
  {
    id: "p-donnelly",
    name: "Kevin Donnelly",
    userType: "individual",
    descriptor: "Transit operator, Boston",
    stance: "opposes",
    initials: "KD",
  },
  {
    id: "p-shah",
    name: "Priya Shah",
    userType: "individual",
    descriptor: "Software engineer, Cambridge",
    stance: "opposes",
    initials: "PS",
  },
  {
    id: "p-lindqvist",
    name: "Erik Lindqvist",
    userType: "individual",
    descriptor: "Accountant, Framingham",
    stance: "neutral",
    initials: "EL",
  },
  {
    id: "p-boudreau",
    name: "Renée Boudreau",
    userType: "individual",
    descriptor: "Nurse, Fall River",
    stance: "neutral",
    initials: "RB",
  },

  // ── Supporting (endorse) ─────────────────────────────────────────────────────
  {
    id: "mass-fiscal",
    name: "Massachusetts Fiscal Alliance",
    userType: "organization",
    descriptor: "Fiscal-policy advocacy nonprofit",
    stance: "supports",
    avatar: avatarMassFiscal,
    followedByViewer: true,
  },
  {
    id: "mass-opportunity-alliance",
    name: "Massachusetts Opportunity Alliance",
    userType: "organization",
    descriptor: "Free-market policy coalition",
    stance: "supports",
    avatar: avatarMOA,
  },
  {
    id: "pioneer-institute",
    name: "Pioneer Institute",
    userType: "organization",
    descriptor: "Free-market public-policy think tank",
    stance: "supports",
    avatar: avatarPioneer,
  },
  {
    id: "mass-high-tech-council",
    name: "Massachusetts High Technology Council",
    userType: "organization",
    descriptor: "Technology-industry association",
    stance: "supports",
    avatar: avatarMHTC,
  },
  {
    id: "taxpayers-affordable-ma",
    name: "Taxpayers for an Affordable Massachusetts",
    userType: "organization",
    descriptor: "Ballot committee registered in support of the measure",
    stance: "supports",
    initials: "TAM",
    avatar: avatarTAM,
  },

  // ── Opposing ─────────────────────────────────────────────────────────────────
  {
    id: "protect-ma-future",
    name: "Protect Massachusetts' Future",
    userType: "organization",
    descriptor: "Coalition opposing the tax ballot questions",
    stance: "opposes",
    initials: "PMF",
    avatar: avatarPMF,
  },
  {
    id: "massbudget",
    name: "Massachusetts Budget & Policy Center",
    userType: "organization",
    descriptor: "Nonpartisan budget & tax-policy research nonprofit",
    stance: "opposes",
    avatar: avatarMassBudget,
  },
  {
    id: "seiu-509",
    name: "SEIU Local 509",
    userType: "organization",
    descriptor: "Human-service workers & educators union",
    stance: "opposes",
    avatar: avatarSeiu509,
    followedByViewer: true,
  },
  {
    id: "mtf",
    name: "Massachusetts Taxpayers Foundation",
    userType: "organization",
    descriptor: "Nonpartisan fiscal-research nonprofit",
    stance: "opposes",
    avatar: avatarMTF,
  },
  {
    id: "mta",
    name: "Massachusetts Teachers Association",
    userType: "organization",
    descriptor: "Statewide educators union",
    stance: "opposes",
    avatar: avatarMTA,
  },
  {
    id: "spilka",
    name: "Sen. Karen Spilka",
    userType: "legislator",
    descriptor:
      "President of the Senate · Represents the Middlesex and Norfolk District · Framingham, Ashland, Holliston, Hopkinton, Natick & Medway (D)",
    stance: "opposes",
    avatar: avatarSpilka,
  },

  // ── Special Joint Committee on Initiative Petitions ────────────────────
  //
  // Their stance is the report they signed, not a campaign endorsement.
  // "Supports" here means the member signed the minority report recommending
  // the General Court adopt the petition, and "opposes" means they signed the
  // majority report recommending no action. A committee recommendation is a
  // narrower thing than a vote for or against the ballot question, and nothing
  // on the page should let the two be read as the same.
  {
    id: "friedman",
    name: "Sen. Cindy F. Friedman",
    userType: "legislator",
    descriptor: "Fourth Middlesex · Signed the majority report (D)",
    stance: "opposes",
    avatar: avatarFriedman,
  },
  {
    id: "crighton",
    name: "Sen. Brendan P. Crighton",
    userType: "legislator",
    descriptor: "Third Essex · Signed the majority report (D)",
    stance: "opposes",
    avatar: avatarCrighton,
  },
  {
    id: "feeney",
    name: "Sen. Paul R. Feeney",
    userType: "legislator",
    descriptor: "Bristol and Norfolk · Signed the majority report (D)",
    stance: "opposes",
    avatar: avatarFeeney,
  },
  {
    id: "finegold",
    name: "Sen. Barry R. Finegold",
    userType: "legislator",
    descriptor:
      "Second Essex and Middlesex · Signed the majority report (D)",
    stance: "opposes",
    avatar: avatarFinegold,
  },
  {
    id: "peisch",
    name: "Rep. Alice Hanlon Peisch",
    userType: "legislator",
    descriptor: "14th Norfolk · Signed the majority report (D)",
    stance: "opposes",
    avatar: avatarPeisch,
  },
  {
    id: "hogan",
    name: "Rep. Kate Hogan",
    userType: "legislator",
    descriptor: "3rd Middlesex · Signed the majority report (D)",
    stance: "opposes",
    avatar: avatarHogan,
  },
  {
    id: "moran",
    name: "Rep. Frank A. Moran",
    userType: "legislator",
    descriptor: "17th Essex · Signed the majority report (D)",
    stance: "opposes",
    avatar: avatarMoran,
  },
  {
    id: "day",
    name: "Rep. Michael S. Day",
    userType: "legislator",
    descriptor: "31st Middlesex · Signed the majority report (D)",
    stance: "opposes",
    avatar: avatarDay,
  },
  {
    id: "vieira",
    name: "Rep. David T. Vieira",
    userType: "legislator",
    descriptor: "3rd Barnstable · Signed the majority report (R)",
    stance: "opposes",
    avatar: avatarVieira,
  },
  {
    id: "fattman",
    name: "Sen. Ryan C. Fattman",
    userType: "legislator",
    descriptor:
      "Worcester and Hampden · Signed the minority report (R)",
    stance: "supports",
    avatar: avatarFattman,
  },
];
