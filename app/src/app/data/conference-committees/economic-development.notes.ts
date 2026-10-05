// Economic Development: what the two bills actually contain.
//
// Notes for whoever fills this committee's page out. The other eleven
// committees' unresolved questions were written by reading two bills of a few
// dozen pages each. This conference is not that: H.5576 is 474,000 characters
// in 264 sections, S.3228 is 602,000 characters in 359 sections, and the two
// chambers did not write the same bill. This file records the shape so the next
// person does not have to re-read a million characters to find it.
//
// Both texts can be reproduced from source: S.3228 is in BILL_TEXTS in
// data/bills-194/texts.ts; H.5576 is PDF-only from the legislature and extracts
// cleanly with `pdftotext -layout` from
// https://malegislature.gov/Bills/194/H5576.pdf. Keep them as files and query
// them with grep and diff rather than reading them whole.
//
// ---------------------------------------------------------------------------
// STRUCTURE
// ---------------------------------------------------------------------------
//
// Both bills are a capital authorization plus a very long tail of outside
// sections, and the tail is where the policy lives.
//
//   H.5576   SECTION 1-2      capital program, available until June 30 2036
//            SECTION 3-150    outside sections amending the General Laws
//            SECTION 151      bond authorization, $425,100,000
//            SECTION 152-165  effective dates and implementation deadlines
//
//   S.3228   SECTION 1-2A     a supplemental APPROPRIATION from the Education
//                             and Transportation Fund for FY2026. The House
//                             bill has no equivalent. The Senate attached its
//                             economic development bill to a supp budget.
//            SECTION 3A       capital program, parallel to House SECTION 1-2
//            SECTION 4-327    outside sections
//            SECTION 328      bond authorization, $325,100,000
//            SECTION 329-358  effective dates, commissions, and studies
//
// Both bonds carry the same name on their face: "An Act Relative to
// Massachusetts Winning Global Investment, Talent, and Innovation". The
// authorizations differ by $100,000,000.
//
// Section numbers do not line up between the bills. Match by the chapter and
// section of the General Laws being amended, which every section states in its
// first line. Build a skeleton with:
//   sed 's/^ *[0-9][0-9]* *//' H5576.txt | tr '\n' ' ' \
//     | sed 's/SECTION /\n@@SECTION /g' | grep '^@@SECTION' | cut -c1-170
//   grep -o '^\tSECTION [^\t]*' S3228.txt | cut -c1-170
//
// ---------------------------------------------------------------------------
// WHAT IS SETTLED (both chambers, substantially the same)
// ---------------------------------------------------------------------------
//
// These are safe to describe as agreed. Diff the passages before quoting
// language as final; several differ in small ways.
//
//   Life sciences tax incentives     ch 23I s5     H 9-14    / S 20-25
//   Climatetech and the Climatetech
//     Investment Fund, replacing the
//     Renewable Energy Trust Fund    ch 23J        H 15-31   / S 26-43
//   Utility mandatory charge moved
//     to the climatetech fund        ch 25 s20     H 32-36   / S 44-47
//   Commonwealth Federal Matching
//     fund, renamed to add "Fiscal
//     Resilience"                    ch 29         H 37-40   / S 48
//   Commercial-to-residential
//     conversion zoning              ch 40A s3C    H 42      / S 67
//   Site plan review, codified        ch 40A s7A    H 48      / S 72
//   MTDC investment caps raised       ch 40G s4     H 52-57   / S 77-82
//   Mass Technology Park Corporation
//     board restructured              ch 40J s3     H 58      / S 83
//   Tax increment exemptions for
//     adaptive reuse                  ch 59 s5P/5Q  H 62      / S 109
//   MOBD references replaced with
//     "the secretary"                 ch 121C       H 122-129 / S 213-220
//   Stretch energy code reference     ch 143 s100   H 130     / S 241
//   LLC annual report fee schedule    ch 156C s12   H 131     / S 265
//   Micromobility: e-bike classes,
//     speed tiers, battery standards  ch 90, 90E    H 91-109  / S 140-163
//   Micromobility working group       outside       H 148     / S 331
//   Food truck inspection regs        ch 111 s250   H 110     / S 341
//   H-1B item language, visa programs ch 140/2024   H 135     / S 317
//   Ch 238/2024 items 7002-1522/1523  outside       H 140-141 / S 318-319
//
// ---------------------------------------------------------------------------
// HOUSE ONLY (the House's asks, all absent from S.3228)
// ---------------------------------------------------------------------------
//
// Verified absent by grep against the Senate text, counts in parentheses are
// House hits against zero Senate hits.
//
//   Massachusetts Secure Choice Savings Program (11). A state-run auto-IRA.
//     Mandatory for employers of 25 or more with no existing plan, 6% default
//     contribution escalating to 10%, $250 then $500 per-employee penalties.
//     ch 29 s2PPPPPP and s64F-64J, H 40 1/4 and 40 1/2.
//   Historical horse racing (21). Pari-mutuel terminals at racing licensees,
//     a 2.5% excise to the Health Safety Net Trust Fund, a $25,000,000
//     prepayment on commencement and $50,000,000 the following year.
//     ch 128A s5D, H 129B.
//   Travel insurance (81). An entire new chapter 175N plus a rewrite of
//     ch 175 s162Z. The single largest House-only block by volume.
//   Digital game development tax credit (47). 25% of Massachusetts payroll and
//     development costs, transferable, plus a sales tax exemption.
//     ch 62 s6(ll), ch 63 s38XX, ch 64H s6(bbb).
//   Electronic credentials (29). Digital driver's licenses, with explicit
//     limits on what police may search on the phone displaying one.
//     ch 90 s8O, H 107A. The data privacy question in this conference.
//   Tenant right to purchase (31). Local-option first refusal on sale,
//     short-sale, deed in lieu, and foreclosure. ch 184 s36, H 133A.
//   Multifamily housing on land owned by religious sects (11). As-of-right,
//     up to 50 units per acre with affordability tiers. ch 40A s3D, H 42.
//   Kratom regulation (23). Labeling, a 2% 7-hydroxymitragynine cap, a ban on
//     synthetic alkaloids, and a 21 age limit. ch 270 s30, H 133A 1/4.
//   Medical psychedelics (3). A three-clinic psilocybin pilot with a dedicated
//     fund, self-repealing after five years. ch 111 s2L, H 109D-109E.
//   Restraint of trade in film exhibition (1). A new chapter 93M on clearance
//     zones and circuit dealing, protecting independent theaters. SEE THE
//     COLLISION NOTE BELOW: the Senate also inserts a chapter 93M.
//   Minor league baseball wage exemption. ch 151 s2 and s15, H 130I-130J.
//   Offsite fabrication prevailing wage. ch 149 s27B/s27D, H 130G-130H.
//
// ---------------------------------------------------------------------------
// SENATE ONLY (the Senate's asks, all absent from H.5576)
// ---------------------------------------------------------------------------
//
//   FRONTIER AI REGULATION. A new chapter inserted after 93L. Applies to
//     models trained above 10^26 floating-point operations, with heavier
//     duties on a "large frontier developer", defined as over $500,000,000 in
//     annual gross revenue. Catastrophic-risk evaluation, independent
//     evaluation of frontier models, an annual audit, an Attorney General
//     enforcement role, and an "independent evaluation ecosystem plan".
//     S 164, with deadlines in S 342-348. 80 hits on "frontier", 31 on
//     "catastrophic risk"; zero of each in the House bill.
//     This is the largest single policy difference between the two bills and
//     it belongs at or near the top of the page.
//
//   COLLISION: both bills insert a new chapter 93M. The House's is film
//     exhibition antitrust. The Senate's is part of its two-chapter AI block.
//     They cannot both be chapter 93M. The conference has to renumber at
//     minimum, and the collision is a concrete, legible example of how far
//     apart the two bills are.
//
//   RAISE THE AGE. Roughly eighty sections moving juvenile jurisdiction to
//     include 18-year-olds: ch 119 (S 176-209), ch 120 (S 210-212), ch 94C
//     (S 165-169), ch 265, 269, 272, 276, 280, 211D, 250, 258E. Confirmed by
//     S 338, which orders a Department of Youth Services report on "the impact
//     of integrating 18 year olds into the care and custody of the
//     department". Effective dates staged in S 353-354, some contingent on
//     certification by the commissioner of probation.
//     Nothing comparable in the House bill.
//
//   Criminal record sealing. ch 276 s100A-100Q, S 305-311.
//   Labor relations overhaul. About twenty sections rewriting ch 150A,
//     the state labor relations act. S 245-264.
//   Child sexual abuse material and obscenity definitions. ch 272 s29B-29D
//     and s31, including "creates, adapts" language and new definitions.
//     S 293-300. Likely aimed at synthetic imagery; read before describing.
//   Alcohol licensing. ch 138 s12 through s33B, S 221-240, plus S 340 holding
//     municipal license-cap changes until January 1 2027.
//   Ticket resale. ch 140 s185A-185G, S 232-240.
//   Public records exemptions. ch 4 s7 clauses Twenty-sixth and Sixtieth,
//     S 5-6.
//   Open meeting law. ch 30A s20 and s23, S 50-52.
//   Two new banking chapters, after ch 167D and ch 167J. S 268-269.
//   Chapter 62F, the tax revenue cap. S 122.
//   Auto insurance territorial rating factors commission. S 332.
//   Municipal and public safety building authority commission. S 334.
//   Adjunct faculty study. S 333.
//   Gateway municipality definition rewritten. ch 23A s3A, S 14-16.
//   Chapter 40X renamed throughout from municipal to include counties.
//     S 85-104. Mechanical, but twenty sections of it.
//
// ---------------------------------------------------------------------------
// PROPOSED TOPIC TAGS
// ---------------------------------------------------------------------------
//
// In the idiom of COMMITTEE_TOPICS in index.ts, but NOT yet checked against
// MAPLE's real tag list. Confirm these against the dev environment the way the
// other eleven committees' tags were confirmed before treating them as data.
//
//   "Housing supply and affordability"        both bills, zoning and conversion
//   "Economic development"                    the capital program itself
//   "Internet, web applications, social media" the Senate AI chapter
//   "Juvenile crime and gang violence"        the Senate raise-the-age block
//   "Labor-management relations"              the Senate ch 150A rewrite
//   "Transportation safety"                   micromobility, both bills
//   "Income tax credits"                      life sciences, climatetech, games
//   "Government information and archives"     Senate public records and open
//                                             meeting changes
//
// A reader arriving here expecting capital grants will not guess that a
// retirement mandate, a gambling expansion, an AI safety regime, and a
// juvenile justice overhaul are in the same negotiation. Whatever tags ship,
// they should not flatten that.
//
// ---------------------------------------------------------------------------
// DRAFTING ARTIFACTS IN THE SOURCE
// ---------------------------------------------------------------------------
//
// In S.3228 as published, SECTION 349 appears twice and SECTION 308 is absent.
// Present in the text itself, not an extraction error. Worth knowing before
// anyone builds a section index that assumes the numbering is complete.
