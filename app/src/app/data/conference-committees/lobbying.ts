// Who registered to lobby on a conference committee's two bills.
//
// SOURCE
//
// The records are public. Registered lobbyists and lobbying firms file
// semi-annual disclosures with the Secretary of the Commonwealth, and each
// filing itemises, per client, the bills that client paid them to work on and
// the position taken on each:
//
//   https://www.sec.state.ma.us/LobbyistPublicSearch/
//
// MAPLE scrapes that portal and republishes it as a lobbying explorer, which is
// where a page like this one should eventually read from:
//
//   https://www.mapletestimony.org/lobbying
//
// WHAT IS HERE. The phone-free schools committee carries real filings, 27 of
// them, transcribed from the registry into the bill-explorer prototype on
// 23 September 2026 and lifted from there. They are partial: the explorer
// recorded 21 filings on S.2581 and 25 on H.5366 and transcribed 13 and 14 of
// them, so the table shows what was captured, not the full register.
//
// The other eleven committees have nothing. That is the honest state rather
// than a gap to fill with invented names: the portal has no per-bill search,
// so finding a bill's filings means crawling every registrant for a year, and
// MAPLE's own copy is served from Firestore rather than rendered into the
// page.
//
// The field names and the vocabulary follow MAPLE's own `LobbyingFiling`
// model, so adding the rest is a change of data rather than of shape.
//
// WHERE THE REST IS, AND WHY IT IS STILL NOT HERE. Checked on 28 September
// 2026. MAPLE's explorer does have a per-bill page, so the eleven other
// conferences are reachable in principle:
//
//   https://www.mapletestimony.org/lobbying/bills
//   https://www.mapletestimony.org/lobbying/bills/194/H4767
//
// Those pages render on the client and their HTML carries no filings at all,
// only the interface's own labels. Behind them is a Firestore collection,
// `lobbyingFilings`, one document per filed line, selected on `generalCourt`
// plus `billId`: "194" and "H4767", which is the key shape `billIdFor` below
// already produces. An ordinary unauthenticated read of that collection
// answers, with no key and no token, and the documents carry the fields this
// file models: client, chamber and bill number, bill title, lobbyist, position,
// year, amount.
//
// What is missing is the per-bill filter. Picking one bill out needs a query
// rather than a document fetch, and the run that checked was not permitted to
// issue one from its sandbox. So every bill other than S.2581 and H.5366 is
// still empty, and empty here means nobody has looked it up yet rather than
// that nobody lobbied it. Nothing below was filled in from inference or memory.
//
// One thing to correct in the note above when someone next edits it: the
// Secretary's portal does offer a search by activity or bill, so the obstacle
// there is not a missing per-bill search. It is bot protection, which an
// ordinary scripted request does not get past.

/**
 * One filed line: a registrant, a client, and a bill they worked on for it.
 *
 * The portal's unit of record is not the lobbyist and not the bill but the
 * three of them together, because the same firm files separately for each
 * client it represents and lists each bill separately under that client. So one
 * bill collects many rows, and the same firm can appear on both sides of it.
 */
export interface LobbyingFiling {
  /** The person or firm that filed, as the portal spells it. */
  registrant: string;
  /**
   * What the filer is. "Lobbyist" is an individual who lobbies directly,
   * "Employer" is a firm that employs lobbyists and is retained by the client.
   * The portal returns both under one schema and calls the second a "Lobbyist
   * Entity"; the disclosure itself uses "Employer".
   */
  regType: "Lobbyist" | "Employer";
  /** The organisation that paid for the work. */
  client: string;
  /**
   * The position as filed: "Support", "Oppose", "Neutral", or empty where the
   * filer recorded no position. Kept as the portal's own words rather than
   * narrowed to a union, because the field is free text and older filings put
   * other things in it.
   */
  position: string;
  /** The disclosure's year. Filings are semi-annual, so a bill can gather rows across two. */
  year: number;
  /**
   * Compensation the filer allocated to this bill, in dollars, where it was
   * reported at all. Carried because the portal reports it and a later view may
   * want it; the table leaves it out, because a money column that reads "0.00"
   * on most rows costs more attention than it returns.
   */
  amount: number | null;
}

/**
 * The rows are real but partial, and the page says so.
 *
 * Every filing here was filed with the Secretary of the Commonwealth. What is
 * missing is the rest of them: the explorer transcribed 27 of the 46 on record
 * for these two bills, and none at all for the other ten committees.
 */
export const LOBBYING_IS_PARTIAL = true;

const S2581: LobbyingFiling[] = [
  {
    registrant: "Edmund Donnelly",
    regType: "Lobbyist",
    client: "AT&T Services, Inc.",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Anthony Moreschi",
    regType: "Lobbyist",
    client: "Massachusetts Teachers Association",
    position: "Support",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Shai Fuxman",
    regType: "Lobbyist",
    client: "Education Development Center Inc.",
    position: "Support",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Matthew Daniel Allaire",
    regType: "Lobbyist",
    client: "No client",
    position: "Support",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Kevin M Grant",
    regType: "Lobbyist",
    client: "AT&T Services, Inc.",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Max Page",
    regType: "Lobbyist",
    client: "Massachusetts Teachers Association",
    position: "Support",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Jonathan Cohn",
    regType: "Lobbyist",
    client: "Progressive Massachusetts, Inc.",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Noah Berger",
    regType: "Lobbyist",
    client: "Massachusetts Teachers Association",
    position: "Support",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Christopher Koczela",
    regType: "Lobbyist",
    client: "Google Client Services LLC",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Bulfinch Strategies Group LLC",
    regType: "Lobbyist",
    client: "GLBTQ Legal Advocates & Defenders, Inc.",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Alexandra Aesielonis",
    regType: "Lobbyist",
    client: "Meta Platforms, Inc.",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Kathy Bell",
    regType: "Lobbyist",
    client: "Roblox Corporation",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Calvin Feliciano",
    regType: "Lobbyist",
    client: "Massachusetts Teachers Association",
    position: "Support",
    year: 2026,
    amount: null,
  },
];

const H5366: LobbyingFiling[] = [
  {
    registrant: "Daniel R. Cullinane",
    regType: "Lobbyist",
    client: "Entertainment Software Association",
    position: "Oppose",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Bay State Strategies Group, LLC",
    regType: "Lobbyist",
    client: "TIKTOK USDS JOINT VENTURE LLC",
    position: "Oppose",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Jeffrey Perkins",
    regType: "Lobbyist",
    client: "The Massachusetts Medical Society",
    position: "Support",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Andrea M Costa",
    regType: "Lobbyist",
    client: "Computer & Communications Industry Association, Inc.",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Andrea M Costa",
    regType: "Lobbyist",
    client: "Software Publishers Association Inc",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Patrick John Huntington",
    regType: "Lobbyist",
    client: "The Massachusetts Medical Society",
    position: "Support",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Diana Elizabeth Wogan",
    regType: "Lobbyist",
    client: "Education Development Center Inc.",
    position: "Support",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Kevin M Grant",
    regType: "Lobbyist",
    client: "AT&T Services, Inc.",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Alexandra Aesielonis",
    regType: "Lobbyist",
    client: "Meta Platforms, Inc.",
    position: "Oppose",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Leda Ann Anderson",
    regType: "Lobbyist",
    client: "The Massachusetts Medical Society",
    position: "Support",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Nathan Pham",
    regType: "Lobbyist",
    client: "Verizon Corporate Resources Group LLC",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Edmund Donnelly",
    regType: "Lobbyist",
    client: "AT&T Services, Inc.",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Jessianne Brunelle",
    regType: "Lobbyist",
    client: "The Massachusetts Medical Society",
    position: "Support",
    year: 2026,
    amount: null,
  },
  {
    registrant: "Daniel R. Cullinane",
    regType: "Lobbyist",
    client: "GMRI, Inc.",
    position: "Neutral",
    year: 2026,
    amount: null,
  },
];

/**
 * Keyed the way the portal keys a bill, not the way this prototype prints one.
 *
 * The disclosure records a chamber and a bare number, which MAPLE joins into
 * "H5366". The committee data writes the same bill as "H.5366". `filingsFor`
 * below is the one place that difference is handled.
 *
 * Bills absent from this table have no rows, which the section reports as
 * nothing on file rather than as nothing to show. Most of the twelve committees
 * sit there, and one of them has rows on the House side only. That is roughly
 * the mix real data would give: a bill can reach conference before any
 * disclosure covering it has been filed.
 */
export const LOBBYING: Record<string, LobbyingFiling[]> = {
  H5366,
  S2581,
};

/**
 * The portal-style id for a bill number, where there is one.
 *
 * Returns undefined for the entries that are not bill numbers at all. Two
 * committees carry "House bill (no. to confirm)" and one carries "S.3028 (House
 * amended)", and neither can be looked up: the first has no number yet, and the
 * second is the Senate bill wearing House amendments, so its disclosures are
 * filed against the Senate number.
 */
export const billIdFor = (billNumber?: string): string | undefined => {
  const m = billNumber?.trim().match(/^([HS])\.?(\d+)$/);
  return m ? `${m[1]}${m[2]}` : undefined;
};

/** Every filing recorded against one bill, in the order the registry holds them. */
export const filingsFor = (billNumber?: string): LobbyingFiling[] => {
  const id = billIdFor(billNumber);
  return id ? (LOBBYING[id] ?? []) : [];
};

/** One organisation's side of one bill, gathered from however many rows it filed. */
export interface OrgBillSide {
  /**
   * The positions as filed, de-duplicated.
   *
   * Plural because the registry has no rule against two filers for the same
   * client recording different positions on the same bill. Nothing in the data
   * here does, but picking one of two would be inventing the answer, so both
   * would print.
   */
  positions: string[];
  /** The disclosure years this organisation filed in on this bill, earliest first. */
  years: number[];
  /** How many rows the organisation filed on this bill. */
  count: number;
}

/** Every filing one organisation made on a conference committee's two bills. */
export interface OrgLobbying {
  /** The name the row leads with: the client, or the registrant where there was none. */
  name: string;
  /** True where the registry recorded no client, so the filer was working for themselves. */
  ownFiling: boolean;
  /** Everyone who filed for this organisation, either bill, in registry order. */
  lobbyists: string[];
  /** Null where the organisation did not file on that bill at all. */
  senate: OrgBillSide | null;
  house: OrgBillSide | null;
}

/**
 * The filings on a committee's two bills, one entry per organisation.
 *
 * Merged here rather than in the view because it is a question about the
 * records: the registry's unit is a registrant plus a client plus a bill, and an
 * organisation that hired four lobbyists is four rows of the same fact. Reading
 * the two bills side by side means collapsing those first.
 *
 * Keyed on the registrant, not on the client, where the client is "No client":
 * that string is how the registry records a lobbyist filing for themselves, so
 * treating it as a client name would merge unrelated self-filers into one
 * organisation that does not exist.
 */
export const orgLobbying = (
  senateBillNumber?: string,
  houseBillNumber?: string,
): OrgLobbying[] => {
  const byOrg = new Map<string, OrgLobbying>();

  const collect = (side: "senate" | "house", billNumber?: string) => {
    for (const f of filingsFor(billNumber)) {
      const ownFiling = f.client.trim().toLowerCase() === "no client";
      const name = ownFiling ? f.registrant : f.client;
      const key = `${ownFiling ? "self" : "client"}:${name}`;
      const org =
        byOrg.get(key) ??
        ({
          name,
          ownFiling,
          lobbyists: [],
          senate: null,
          house: null,
        } satisfies OrgLobbying);
      byOrg.set(key, org);

      if (!org.lobbyists.includes(f.registrant))
        org.lobbyists.push(f.registrant);

      const s = org[side] ?? { positions: [], years: [], count: 0 };
      if (!s.positions.includes(f.position)) s.positions.push(f.position);
      if (!s.years.includes(f.year)) s.years.push(f.year);
      s.count += 1;
      s.years.sort((a, b) => a - b);
      org[side] = s;
    }
  };

  collect("senate", senateBillNumber);
  collect("house", houseBillNumber);

  // Registry order is the order the rows were transcribed, which says nothing.
  // The organisations that worked both bills come first, because they are the
  // comparison a merged table exists to make; then the ones that paid for the
  // most lobbyists, because that is the next thing the table can tell you; then
  // alphabetically, so the tail is scannable by name.
  return [...byOrg.values()].sort((a, b) => {
    const bothA = a.senate && a.house ? 1 : 0;
    const bothB = b.senate && b.house ? 1 : 0;
    if (bothA !== bothB) return bothB - bothA;
    if (a.lobbyists.length !== b.lobbyists.length)
      return b.lobbyists.length - a.lobbyists.length;
    return a.name.localeCompare(b.name);
  });
};
