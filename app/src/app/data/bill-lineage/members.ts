// Every seat in both chambers, the 194th General Court.
//
// The committee steps carry their members already, because a committee is small
// enough to list. A roll call is not: every seat is coloured and any of them can
// be pointed at, so what opens beside the map needs all two hundred.
//
// Matched seat by seat against the members API on district, and by surname where
// a district changed hands mid-session and two members share it. One member code
// contains a space ("L M0", Liz Miranda), which is why the files are named with
// the space turned into a hyphen.
//
// The title is the API\'s own LeadershipPosition, so it covers both chamber
// offices ("Speaker of the House") and committee chairs ("House Ways and Means
// Chair"). Most members hold none.
//
// Globbed rather than two hundred import lines. Vite resolves each to a hashed
// asset URL at build time, and the browser only fetches the one it draws.

const files = import.meta.glob("../../../assets/legislators/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const file = (code: string) =>
  files[`../../../assets/legislators/${code}.jpg`];

export interface SeatMember {
  /** The member's full name, so a first initial can be taken from it. */
  name: string;
  /** The General Court's own member code, which is also the profile URL. */
  code: string;
  portrait: string;
  /** Only where the General Court records one. */
  title?: string;
}

/** Seat key, as the vote maps use it, to whoever holds it. */
export const MEMBER_BY_SEAT: Record<string, SeatMember> = {
  "Barnstable-1": { name: "Christopher Richard Flanagan", code: "CRF1", portrait: file("CRF1") },
  "Barnstable-2": { name: "Kip A. Diggs", code: "KAD1", portrait: file("KAD1") },
  "Barnstable-3": { name: "David T. Vieira", code: "DTV1", portrait: file("DTV1"), title: "Third Assistant Minority Leader" },
  "Barnstable-4": { name: "Hadley Luddy", code: "H_L1", portrait: file("H_L1") },
  "Barnstable-5": { name: "Steven George Xiarhos", code: "SGX1", portrait: file("SGX1") },
  "Barnstable-6": { name: "Thomas W. Moakley", code: "TWM1", portrait: file("TWM1") },
  "Berkshire-1": { name: "John Barrett, III", code: "J_B1", portrait: file("J_B1") },
  "Berkshire-2": { name: "Tricia Farley-Bouvier", code: "TFB1", portrait: file("TFB1") },
  "Berkshire-3": { name: "Leigh Davis", code: "LSD1", portrait: file("LSD1") },
  "Bristol-1": { name: "Michael S. Chaisson", code: "MSC1", portrait: file("MSC1") },
  "Bristol-10": { name: "Mark D. Sylvia", code: "MDS1", portrait: file("MDS1") },
  "Bristol-11": { name: "Christopher Hendricks", code: "C_H1", portrait: file("C_H1") },
  "Bristol-12": { name: "Norman J. Orrall", code: "NJO1", portrait: file("NJO1") },
  "Bristol-13": { name: "Antonio F. D. Cabral", code: "AFC1", portrait: file("AFC1") },
  "Bristol-14": { name: "Adam J. Scanlon", code: "AJS1", portrait: file("AJS1") },
  "Bristol-2": { name: "James K. Hawkins", code: "JKH1", portrait: file("JKH1") },
  "Bristol-3": { name: "Lisa Field", code: "LMF1", portrait: file("LMF1") },
  "Bristol-4": { name: "Steven S. Howitt", code: "SSH1", portrait: file("SSH1") },
  "Bristol-5": { name: "Justin Thurber", code: "J_T2", portrait: file("J_T2") },
  "Bristol-6": { name: "Carole A. Fiola", code: "CAF1", portrait: file("CAF1") },
  "Bristol-7": { name: "Alan Silvia", code: "A_S1", portrait: file("A_S1") },
  "Bristol-8": { name: "Steven J. Ouellette", code: "SJO1", portrait: file("SJO1") },
  "Bristol-9": { name: "Christopher M. Markey", code: "CMM1", portrait: file("CMM1") },
  "Essex-1": { name: "Dawne Shand", code: "D_S1", portrait: file("D_S1") },
  "Essex-10": { name: "Daniel Cahill", code: "DFC1", portrait: file("DFC1") },
  "Essex-11": { name: "Sean Reid", code: "S_R1", portrait: file("S_R1") },
  "Essex-12": { name: "Thomas P. Walsh", code: "TJW1", portrait: file("TJW1") },
  "Essex-13": { name: "Sally P. Kerans", code: "SPK1", portrait: file("SPK1") },
  "Essex-14": { name: "Adrianne Pusateri Ramos", code: "APR1", portrait: file("APR1") },
  "Essex-15": { name: "Ryan M. Hamilton", code: "RMH2", portrait: file("RMH2") },
  "Essex-16": { name: "Francisco E. Paulino", code: "FEP1", portrait: file("FEP1") },
  "Essex-17": { name: "Frank A. Moran", code: "FAM1", portrait: file("FAM1"), title: "Second Assistant Majority Leader" },
  "Essex-18": { name: "Tram T. Nguyen", code: "TTN1", portrait: file("TTN1") },
  "Essex-2": { name: "Kristin E. Kassner", code: "K_K2", portrait: file("K_K2") },
  "Essex-3": { name: "Andres X. Vargas", code: "AXV1", portrait: file("AXV1") },
  "Essex-4": { name: "Estela A. Reyes", code: "EAR1", portrait: file("EAR1") },
  "Essex-5": { name: "Andrew Tarr", code: "AFT1", portrait: file("AFT1") },
  "Essex-6": { name: "Hannah Bowen", code: "HLB1", portrait: file("HLB1") },
  "Essex-7": { name: "Manny Cruz", code: "M_C3", portrait: file("M_C3") },
  "Essex-8": { name: "Jennifer Balinsky Armini", code: "JBA1", portrait: file("JBA1") },
  "Essex-9": { name: "Donald H. Wong", code: "DHW1", portrait: file("DHW1") },
  "Franklin-1": { name: "Natalie M. Blais", code: "NMB1", portrait: file("NMB1") },
  "Franklin-2": { name: "Susannah M. Whipps", code: "SLG1", portrait: file("SLG1") },
  "Hampden-1": { name: "Todd M. Smola", code: "TMS2", portrait: file("TMS2") },
  "Hampden-10": { name: "Carlos Gonz\u00e1lez", code: "C_G1", portrait: file("C_G1"), title: "Third Division Chair" },
  "Hampden-11": { name: "Bud L. Williams", code: "BLW1", portrait: file("BLW1") },
  "Hampden-12": { name: "Angelo J. Puppolo, Jr.", code: "AJP1", portrait: file("AJP1") },
  "Hampden-2": { name: "Brian M. Ashe", code: "BMA1", portrait: file("BMA1") },
  "Hampden-3": { name: "Nicholas A. Boldyga", code: "NAG1", portrait: file("NAG1") },
  "Hampden-4": { name: "Kelly W. Pease", code: "KWP1", portrait: file("KWP1") },
  "Hampden-5": { name: "Patricia A. Duffy", code: "PAD1", portrait: file("PAD1") },
  "Hampden-6": { name: "Michael J. Finn", code: "MJF1", portrait: file("MJF1") },
  "Hampden-7": { name: "Aaron L. Saunders", code: "ALS1", portrait: file("ALS1") },
  "Hampden-8": { name: "Shirley B. Arriaga", code: "SBA1", portrait: file("SBA1") },
  "Hampden-9": { name: "Orlando Ramos", code: "O_R1", portrait: file("O_R1") },
  "Hampshire-1": { name: "Lindsay N. Sabadosa", code: "L_S1", portrait: file("L_S1") },
  "Hampshire-2": { name: "Homar G\u00f3mez", code: "H_G1", portrait: file("H_G1") },
  "Hampshire-3": { name: "Mindy Domb", code: "M_D2", portrait: file("M_D2") },
  "Middlesex-1": { name: "Margaret R. Scarsdale", code: "MRS1", portrait: file("MRS1") },
  "Middlesex-10": { name: "John J. Lawn, Jr.", code: "JJL2", portrait: file("JJL2") },
  "Middlesex-11": { name: "Amy Mah Sangiolo", code: "AMS3", portrait: file("AMS3") },
  "Middlesex-12": { name: "Greg Schwartz", code: "G_S1", portrait: file("G_S1") },
  "Middlesex-13": { name: "Carmine Lawrence Gentile", code: "CLG1", portrait: file("CLG1") },
  "Middlesex-14": { name: "Simon Cataldo", code: "S_C1", portrait: file("S_C1") },
  "Middlesex-15": { name: "Michelle L. Ciccolo", code: "M_C2", portrait: file("M_C2") },
  "Middlesex-16": { name: "Rodney M. Elliott", code: "RME1", portrait: file("RME1") },
  "Middlesex-17": { name: "Vanna Howard", code: "V_H1", portrait: file("V_H1") },
  "Middlesex-18": { name: "Tara T. Hong", code: "TTH1", portrait: file("TTH1") },
  "Middlesex-19": { name: "David Allen Robertson", code: "D_R1", portrait: file("D_R1") },
  "Middlesex-2": { name: "James Arciero", code: "J_A1", portrait: file("J_A1") },
  "Middlesex-20": { name: "Bradley H. Jones, Jr.", code: "BHJ1", portrait: file("BHJ1"), title: "Minority Leader" },
  "Middlesex-21": { name: "Kenneth I. Gordon", code: "KIG1", portrait: file("KIG1") },
  "Middlesex-22": { name: "Marc T. Lombardo", code: "MTL1", portrait: file("MTL1") },
  "Middlesex-23": { name: "Sean Garballey", code: "S_G1", portrait: file("S_G1") },
  "Middlesex-24": { name: "David M. Rogers", code: "DMR1", portrait: file("DMR1") },
  "Middlesex-25": { name: "Marjorie C. Decker", code: "MCD1", portrait: file("MCD1") },
  "Middlesex-26": { name: "Mike Connolly", code: "M_C1", portrait: file("M_C1") },
  "Middlesex-27": { name: "Erika Uyterhoeven", code: "E_U1", portrait: file("E_U1") },
  "Middlesex-28": { name: "Joseph W. McGonagle, Jr.", code: "jwm1", portrait: file("jwm1") },
  "Middlesex-29": { name: "Steven Owens", code: "SCO1", portrait: file("SCO1") },
  "Middlesex-3": { name: "Kate Hogan", code: "K_H1", portrait: file("K_H1"), title: "Speaker Pro Tempore" },
  "Middlesex-30": { name: "Richard M. Haggerty", code: "RMH1", portrait: file("RMH1") },
  "Middlesex-31": { name: "Michael S. Day", code: "MSD1", portrait: file("MSD1") },
  "Middlesex-32": { name: "Kate Lipper-Garabedian", code: "KLG1", portrait: file("KLG1") },
  "Middlesex-33": { name: "Steven Ultrino", code: "S_G2", portrait: file("S_G2") },
  "Middlesex-34": { name: "Christine P. Barber", code: "CPB2", portrait: file("CPB2") },
  "Middlesex-35": { name: "Paul J. Donato", code: "PJD1", portrait: file("PJD1"), title: "Second Assistant Majority Leader" },
  "Middlesex-36": { name: "Colleen M. Garry", code: "CMG1", portrait: file("CMG1") },
  "Middlesex-37": { name: "Danillo A. Sena", code: "DAS1", portrait: file("DAS1") },
  "Middlesex-4": { name: "Danielle W. Gregoire", code: "DWG1", portrait: file("DWG1"), title: "First Division Chair" },
  "Middlesex-5": { name: "David Paul Linsky", code: "DPL1", portrait: file("DPL1") },
  "Middlesex-6": { name: "Priscila S. Sousa", code: "PSS1", portrait: file("PSS1") },
  "Middlesex-7": { name: "Jack Patrick Lewis", code: "JPL1", portrait: file("JPL1") },
  "Middlesex-8": { name: "James C. Arena-DeRosa", code: "JCD1", portrait: file("JCD1") },
  "Middlesex-9": { name: "Thomas M. Stanley", code: "TMS1", portrait: file("TMS1") },
  "Norfolk-1": { name: "Bruce J. Ayers", code: "BJA1", portrait: file("BJA1") },
  "Norfolk-10": { name: "Jeffrey N. Roy", code: "JNR1", portrait: file("JNR1"), title: "Second Division Chair" },
  "Norfolk-11": { name: "Paul McMurtry", code: "P_M1", portrait: file("P_M1") },
  "Norfolk-12": { name: "John H. Rogers", code: "JHR1", portrait: file("JHR1") },
  "Norfolk-13": { name: "Joshua Tarsky", code: "J_T1", portrait: file("J_T1") },
  "Norfolk-14": { name: "Alice Hanlon Peisch", code: "AHP1", portrait: file("AHP1"), title: "Assistant Majority Leader" },
  "Norfolk-15": { name: "Tommy Vitolo", code: "T_V1", portrait: file("T_V1") },
  "Norfolk-2": { name: "Tackey Chan", code: "T_C1", portrait: file("T_C1") },
  "Norfolk-3": { name: "Ronald Mariano", code: "R_M1", portrait: file("R_M1"), title: "Speaker of the House" },
  "Norfolk-4": { name: "James M. Murphy", code: "JMM1", portrait: file("JMM1") },
  "Norfolk-5": { name: "Mark J. Cusack", code: "MJC1", portrait: file("MJC1") },
  "Norfolk-6": { name: "William C. Galvin", code: "WCG1", portrait: file("WCG1") },
  "Norfolk-7": { name: "Richard G. Wells, Jr.", code: "RGW1", portrait: file("RGW1") },
  "Norfolk-8": { name: "Edward R. Philips", code: "ERP1", portrait: file("ERP1") },
  "Norfolk-9": { name: "Marcus S. Vaughn", code: "MSV1", portrait: file("MSV1") },
  "Plymouth-1": { name: "Michelle L. Badger", code: "MLB1", portrait: file("MLB1") },
  "Plymouth-10": { name: "Michelle M. DuBois", code: "MMD1", portrait: file("MMD1") },
  "Plymouth-11": { name: "Rita A. Mendes", code: "RAM1", portrait: file("RAM1") },
  "Plymouth-12": { name: "Kathleen R. LaNatra", code: "KPL1", portrait: file("KPL1") },
  "Plymouth-2": { name: "John R. Gaskey", code: "JRG2", portrait: file("JRG2") },
  "Plymouth-3": { name: "Joan Meschino", code: "J_M1", portrait: file("J_M1") },
  "Plymouth-4": { name: "Patrick Joseph Kearney", code: "PJK1", portrait: file("PJK1") },
  "Plymouth-5": { name: "David F. DeCoste", code: "DFD1", portrait: file("DFD1") },
  "Plymouth-6": { name: "Kenneth P. Sweezey", code: "KPS1", portrait: file("KPS1") },
  "Plymouth-7": { name: "Alyson M. Sullivan-Almeida", code: "AMS2", portrait: file("AMS2") },
  "Plymouth-8": { name: "Dennis C. Gallagher", code: "DCG2", portrait: file("DCG2") },
  "Plymouth-9": { name: "Bridget Plouffe", code: "BMP1", portrait: file("BMP1") },
  "S:Barrett": { name: "Michael J. Barrett", code: "MJB0", portrait: file("MJB0"), title: "Assistant Majority Leader" },
  "S:Brady": { name: "Michael D. Brady", code: "MDB0", portrait: file("MDB0") },
  "S:Brownsberger": { name: "William N. Brownsberger", code: "WNB0", portrait: file("WNB0"), title: "President Pro Tempore" },
  "S:Collins": { name: "Nick Collins", code: "N_C0", portrait: file("N_C0") },
  "S:Comerford": { name: "Joanne M. Comerford", code: "JMC0", portrait: file("JMC0") },
  "S:Creem": { name: "Cynthia Stone Creem", code: "CSC0", portrait: file("CSC0"), title: "Majority Leader" },
  "S:Crighton": { name: "Brendan P. Crighton", code: "BPC0", portrait: file("BPC0") },
  "S:Cronin": { name: "John J. Cronin", code: "JJC0", portrait: file("JJC0") },
  "S:Cyr": { name: "Julian Cyr", code: "JAC0", portrait: file("JAC0"), title: "Assistant Majority Whip" },
  "S:DiDomenico": { name: "Sal N. DiDomenico", code: "SND0", portrait: file("SND0"), title: "Assistant Majority Leader" },
  "S:Dooner": { name: "Kelly A. Dooner", code: "KAD0", portrait: file("KAD0"), title: "Assistant Minority Leader" },
  "S:Driscoll": { name: "William J. Driscoll, Jr.", code: "WJD0", portrait: file("WJD0") },
  "S:Durant": { name: "Peter J. Durant", code: "PJD0", portrait: file("PJD0"), title: "Assistant Minority Leader" },
  "S:Edwards": { name: "Lydia Edwards", code: "LME0", portrait: file("LME0") },
  "S:Eldridge": { name: "James B. Eldridge", code: "JBE0", portrait: file("JBE0") },
  "S:Fattman": { name: "Ryan C. Fattman", code: "RCF0", portrait: file("RCF0"), title: "Assistant Minority Leader" },
  "S:Feeney": { name: "Paul R. Feeney", code: "PRF0", portrait: file("PRF0") },
  "S:Fernandes": { name: "Dylan A. Fernandes", code: "DAF0", portrait: file("DAF0") },
  "S:Finegold": { name: "Barry R. Finegold", code: "BRF0", portrait: file("BRF0") },
  "S:Friedman": { name: "Cindy F. Friedman", code: "CFF0", portrait: file("CFF0") },
  "S:G\u00f3mez": { name: "Adam G\u00f3mez", code: "A_G0", portrait: file("A_G0") },
  "S:Howard": { name: "Vanna Howard", code: "V_H0", portrait: file("V_H0") },
  "S:J. Lewis": { name: "Jason M. Lewis", code: "jml0", portrait: file("jml0") },
  "S:Jehlen": { name: "Patricia D. Jehlen", code: "PDJ0", portrait: file("PDJ0") },
  "S:Keenan": { name: "John F. Keenan", code: "JFK0", portrait: file("JFK0") },
  "S:Kennedy": { name: "Robyn K. Kennedy", code: "RKK0", portrait: file("RKK0") },
  "S:Lovely": { name: "Joan B. Lovely", code: "JBL0", portrait: file("JBL0"), title: "Assistant Majority Leader" },
  "S:Mark": { name: "Paul W. Mark", code: "PWM0", portrait: file("PWM0") },
  "S:Miranda": { name: "Liz Miranda", code: "L-M0", portrait: file("L-M0") },
  "S:Montigny": { name: "Mark C. Montigny", code: "MCM0", portrait: file("MCM0") },
  "S:Moore": { name: "Michael O. Moore", code: "MOM0", portrait: file("MOM0") },
  "S:O'Connor": { name: "Patrick M. O'Connor", code: "PMO", portrait: file("PMO"), title: "Assistant Minority Leader" },
  "S:Oliveira": { name: "Jacob R. Oliveira", code: "JRO0", portrait: file("JRO0") },
  "S:Payano": { name: "Pavel M. Payano", code: "PMP0", portrait: file("PMP0") },
  "S:Rausch": { name: "Rebecca L. Rausch", code: "RLR0", portrait: file("RLR0") },
  "S:Rodrigues": { name: "Michael J. Rodrigues", code: "MJR0", portrait: file("MJR0") },
  "S:Rush": { name: "Michael F. Rush", code: "MFR0", portrait: file("MFR0"), title: "Senate Majority Whip" },
  "S:Spilka": { name: "Karen E. Spilka", code: "KES0", portrait: file("KES0"), title: "President of the Senate" },
  "S:Tarr": { name: "Bruce E. Tarr", code: "BET0", portrait: file("BET0"), title: "Minority Leader" },
  "S:Velis": { name: "John C. Velis", code: "JCV0", portrait: file("JCV0") },
  "Suffolk-1": { name: "Adrian C. Madaro", code: "ACM1", portrait: file("ACM1") },
  "Suffolk-10": { name: "William F. MacGregor", code: "WFM1", portrait: file("WFM1") },
  "Suffolk-11": { name: "Judith A. Garcia", code: "JAG2", portrait: file("JAG2") },
  "Suffolk-12": { name: "Brandy Fluker-Reid", code: "BFR1", portrait: file("BFR1") },
  "Suffolk-13": { name: "Daniel J. Hunt", code: "djh1", portrait: file("djh1") },
  "Suffolk-14": { name: "Rob Consalvo", code: "R_C1", portrait: file("R_C1") },
  "Suffolk-15": { name: "Samantha Monta\u00f1o", code: "S_M1", portrait: file("S_M1") },
  "Suffolk-16": { name: "Jessica Ann Giannino", code: "JAG1", portrait: file("JAG1") },
  "Suffolk-17": { name: "Kevin G. Honan", code: "KGH1", portrait: file("KGH1") },
  "Suffolk-18": { name: "Michael J. Moran", code: "MJM1", portrait: file("MJM1"), title: "Majority Leader" },
  "Suffolk-19": { name: "Jeffrey Rosario Turco", code: "JRT1", portrait: file("JRT1") },
  "Suffolk-2": { name: "Daniel J. Ryan", code: "djr1", portrait: file("djr1") },
  "Suffolk-3": { name: "Aaron Michlewitz", code: "AMM1", portrait: file("AMM1"), title: "House Ways and Means Chair" },
  "Suffolk-4": { name: "David Biele", code: "D_B1", portrait: file("D_B1") },
  "Suffolk-5": { name: "Christopher J. Worrell", code: "CJW1", portrait: file("CJW1") },
  "Suffolk-6": { name: "Russell E. Holmes", code: "REH1", portrait: file("REH1") },
  "Suffolk-7": { name: "Chynah Tyler", code: "C_T1", portrait: file("C_T1") },
  "Suffolk-8": { name: "Jay D. Livingstone", code: "J_L1", portrait: file("J_L1") },
  "Suffolk-9": { name: "John Francis Moran", code: "JFM1", portrait: file("JFM1") },
  "Worcester-1": { name: "Kimberly N. Ferguson", code: "KNF1", portrait: file("KNF1"), title: "First Assistant Minority Leader" },
  "Worcester-10": { name: "Brian W. Murray", code: "BWM1", portrait: file("BWM1") },
  "Worcester-11": { name: "Hannah Kane", code: "HEK1", portrait: file("HEK1") },
  "Worcester-12": { name: "Meghan K. Kilcoyne", code: "M_K1", portrait: file("M_K1") },
  "Worcester-13": { name: "John J. Mahoney", code: "JJM2", portrait: file("JJM2") },
  "Worcester-14": { name: "James J. O'Day", code: "JJO1", portrait: file("JJO1"), title: "Fourth Division Chair" },
  "Worcester-15": { name: "Mary S. Keefe", code: "MSK1", portrait: file("MSK1") },
  "Worcester-16": { name: "Daniel M. Donahue", code: "DMD1", portrait: file("DMD1") },
  "Worcester-17": { name: "David Henry Argosky LeBoeuf", code: "DAL1", portrait: file("DAL1") },
  "Worcester-18": { name: "Joseph D. McKenna", code: "JDM1", portrait: file("JDM1") },
  "Worcester-19": { name: "Kate Donaghue", code: "K_D1", portrait: file("K_D1") },
  "Worcester-2": { name: "Jonathan D. Zlotnik", code: "JDZ1", portrait: file("JDZ1") },
  "Worcester-3": { name: "Michael P. Kushmerek", code: "MPK1", portrait: file("MPK1") },
  "Worcester-4": { name: "Natalie M. Higgins", code: "N_H1", portrait: file("N_H1") },
  "Worcester-5": { name: "Donald R. Berthiaume, Jr.", code: "DRB1", portrait: file("DRB1") },
  "Worcester-6": { name: "John J. Marsi", code: "JJM1", portrait: file("JJM1") },
  "Worcester-7": { name: "Paul K. Frost", code: "PKF1", portrait: file("PKF1"), title: "Second Assistant Minority Leader" },
  "Worcester-8": { name: "Michael J. Soter", code: "MJS3", portrait: file("MJS3") },
  "Worcester-9": { name: "David K. Muradian, Jr.", code: "DKM1", portrait: file("DKM1"), title: "Third Assistant Minority Leader" },
};

/**
 * The same people, by name.
 *
 * Bill sponsors and cosponsors arrive from the document API as bare strings,
 * with no member id attached, so a name is the only join available. It holds:
 * 296 of the 305 sponsor and cosponsor entries across the twenty-four bills
 * match a sitting member exactly.
 *
 * The nine that do not are not legislators. Two are the Governor and the
 * Attorney General, who may file bills and hold no seat, and the rest name a
 * committee rather than a person, which is what a Ways and Means redraft
 * carries in place of a sponsor. A caller that finds nothing here should say
 * so rather than guess.
 *
 * One name sits on two seats: Vanna Howard, who moved from the House to the
 * Senate mid-session and so has a member code in each chamber. First wins, and
 * the portrait is the same person either way; only the profile link differs.
 */
export const MEMBER_BY_NAME: Record<string, SeatMember> = Object.fromEntries(
  Object.values(MEMBER_BY_SEAT)
    .reverse()
    .map((m) => [m.name, m]),
);

/** The General Court's profile page for a member code. */
export const profileUrl = (code: string) =>
  `https://malegislature.gov/Legislators/Profile/${encodeURIComponent(code)}`;
