// Everyone sitting on a conference committee now, counted once.
//
// The twelve lists are each six people, and read separately they hide the one
// thing the set of them says: the same fourteen people are sitting in half the
// rooms. Counting per person rather than per committee is the whole purpose of
// this file, and the numbers the page states come from here so that a change to
// the twelve lists cannot leave the prose claiming a count that has stopped
// being true.
//
// The join is name to seat, the same one the detail page makes, because the
// scorecard's conferees carry no member id. All seventy-two entries match a
// sitting member exactly today. Anyone who stopped matching would lose their
// portrait and their district, so they are dropped rather than half drawn, and
// the tally counts what was found rather than asserting a total.

import { MEMBER_BY_SEAT } from "../bill-lineage/members";
import { COMMITTEES } from "./committees";
import { displayName } from "./index";

/** One of a person's seats: whose conference, and whether they lead it. */
export interface RosterSeat {
  slug: string;
  /** The name the index list and the committee's own page both use. */
  committee: string;
  chair: boolean;
}

export interface RosterPerson {
  name: string;
  /** Seat key, which is what the district maps are drawn against. */
  seat: string;
  code: string;
  portrait: string;
  district: string;
  /** "D" or "R". */
  party: string;
  chamber: "senate" | "house";
  /** The General Court's own office, where the member holds one. */
  title?: string;
  /** Every conference they sit on, oldest first, as the index lists them. */
  on: RosterSeat[];
}

const SEAT_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(MEMBER_BY_SEAT).map(([seat, m]) => [m.name, seat]),
);

function collect(): RosterPerson[] {
  const byName = new Map<string, RosterPerson>();
  for (const c of COMMITTEES) {
    for (const chamber of ["senate", "house"] as const) {
      for (const d of c.conferees[chamber]) {
        const seat = SEAT_BY_NAME[d.name];
        const member = seat ? MEMBER_BY_SEAT[seat] : undefined;
        if (!seat || !member) continue;
        const person =
          byName.get(d.name) ??
          ({
            name: d.name,
            seat,
            code: member.code,
            portrait: member.portrait,
            district: d.district,
            party: d.party,
            chamber,
            title: member.title,
            on: [],
          } satisfies RosterPerson);
        person.on.push({
          slug: c.slug,
          committee: displayName(c.slug, c.short),
          chair: Boolean(d.chair),
        });
        byName.set(d.name, person);
      }
    }
  }
  return [...byName.values()];
}

/**
 * The fifty, most seats first.
 *
 * Senate before House inside a tier, because every other list on these pages
 * is ordered that way, and alphabetically inside a chamber, which is the order
 * of the name as it is printed rather than of a surname the row never shows.
 */
export const ROSTER: RosterPerson[] = collect().sort(
  (a, b) =>
    b.on.length - a.on.length ||
    (a.chamber === b.chamber ? 0 : a.chamber === "house" ? -1 : 1) ||
    a.name.localeCompare(b.name),
);

/** By seat key, since a map hands back the district that was pressed. */
export const ROSTER_BY_SEAT: Record<string, RosterPerson> = Object.fromEntries(
  ROSTER.map((p) => [p.seat, p]),
);

/** The people the concentration is about, in the same order. */
export const REPEATERS = ROSTER.filter((p) => p.on.length > 1);

const seatsOf = (people: RosterPerson[]) =>
  people.reduce((n, p) => n + p.on.length, 0);

/** One party's half of one chamber, which is where the repetition lives. */
const side = (chamber: RosterPerson["chamber"], party: string) => {
  const people = ROSTER.filter(
    (p) => p.chamber === chamber && p.party === party,
  );
  return { people: people.length, seats: seatsOf(people) };
};

export const SIDES = {
  senateD: side("senate", "D"),
  senateR: side("senate", "R"),
  houseD: side("house", "D"),
  houseR: side("house", "R"),
};

export const TALLY = {
  committees: COMMITTEES.length,
  seats: seatsOf(ROSTER),
  people: ROSTER.length,
  /** How many sit on more than one, and how many seats they hold between them. */
  repeat: REPEATERS.length,
  repeatSeats: seatsOf(REPEATERS),
  /** The most anyone sits on, which is the number that decides the whole view. */
  most: Math.max(...ROSTER.map((p) => p.on.length)),
  /** Two per committee, one for each chamber's half of the room. */
  chairSeats: ROSTER.flatMap((p) => p.on).filter((s) => s.chair).length,
  chairs: ROSTER.filter((p) => p.on.some((s) => s.chair)).length,
  /** The answer to whether chairing is held by a small repeating set. */
  chairsTwice: ROSTER.filter((p) => p.on.filter((s) => s.chair).length > 1)
    .length,
};

/**
 * Whether every committee is split the same way.
 *
 * The page states the two-to-one split as a rule, so it is checked rather than
 * trusted: a thirteenth committee put together differently should take the
 * sentence off the page instead of making it false.
 */
export const SAME_SPLIT = COMMITTEES.every((c) =>
  (["senate", "house"] as const).every(
    (ch) =>
      c.conferees[ch].filter((d) => d.party === "D").length === 2 &&
      c.conferees[ch].filter((d) => d.party === "R").length === 1,
  ),
);

/**
 * Whether any district holds two conferees.
 *
 * Asked because it decides whether the maps need a second treatment for a
 * doubled district. Today nobody shares a seat with anybody, so the maps say
 * one lit cell, one person, and can be read that simply.
 */
export const SHARED_DISTRICTS =
  ROSTER.length !== Object.keys(ROSTER_BY_SEAT).length;

/**
 * Where a title sits in a chamber's own order of precedence.
 *
 * The General Court's leadership ladder, read off the titles its members
 * actually hold. Anyone without one is last, which is most of them: a seat on
 * a conference is not a rank. Lower is higher, so this sorts ascending.
 */
const RANK: [RegExp, number][] = [
  [/^Speaker of the House$/, 1],
  [/^President of the Senate$/, 1],
  [/Ways and Means Chair/, 2],
  [/^Majority Leader$/, 3],
  [/^Minority Leader$/, 3],
  [/Pro Tempore/, 4],
  [/^Assistant Majority Leader$/, 5],
  [/^Assistant Minority Leader$/, 5],
  [/^First Assistant/, 5],
  [/^Second Assistant/, 6],
  [/^Third Assistant/, 7],
  [/Whip/, 8],
  [/Division Chair/, 9],
];

export function rankOf(title?: string): number {
  if (!title) return 99;
  for (const [re, n] of RANK) if (re.test(title)) return n;
  return 10;
}

/**
 * The order the chamber cards read the repeat-holders in.
 *
 * Chairmanships lead, then the count. Running a room outranks sitting in one,
 * so someone chairing two is ahead of someone merely on three. Then the
 * majority bench ahead of the minority at the same standing, then rank, then
 * the name.
 *
 * Worth knowing when reading it: every committee is two and one, so a
 * Republican on three holds a quarter of what is available to that bench and a
 * Democrat on three does not.
 */
export function byStanding(a: RosterPerson, b: RosterPerson): number {
  const party = (p: RosterPerson) => (p.party === "R" ? 1 : 0);
  const chairs = (p: RosterPerson) => p.on.filter((x) => x.chair).length;
  return (
    chairs(b) - chairs(a) ||
    b.on.length - a.on.length ||
    party(a) - party(b) ||
    rankOf(a.title) - rankOf(b.title) ||
    a.name.localeCompare(b.name)
  );
}

/**
 * A weight for how much of this session a member is carrying.
 *
 * Not a measure of power in the General Court, which this data cannot see:
 * seniority, committee of jurisdiction, the Speaker's regard, none of it is
 * here. It is a weight over the four things the conference data does carry,
 * and the weights are arguable on purpose, which is why they are written out
 * as numbers rather than buried in a comparison.
 *
 *   a seat on a conference      2 each
 *   chairing one                5 each, on top of the seat
 *   the majority bench          2, because its members are choosing from
 *                               twice the seats the minority is
 *
 * A leadership title is deliberately not in the sum. Being Majority Leader is
 * power in the chamber, not weight in these twelve rooms, and adding it made
 * the size say something the conference data has no view on. It is the
 * tiebreak instead: two members carrying the same conference load, the one
 * ranking higher in the chamber comes first.
 *
 * Chairing two rooms therefore outweighs sitting in three, which is the thing
 * the ordered rows already say and this is meant to show at a glance.
 */
/** Only for breaking a tie in weight, never added to it. */
const LEAD_POINTS: Record<number, number> = {
  1: 8,
  2: 7,
  3: 6,
  4: 4,
  5: 3,
  6: 3,
  7: 2,
  8: 2,
  9: 1,
  10: 1,
  99: 0,
};

export function influence(p: RosterPerson): number {
  const chairs = p.on.filter((x) => x.chair).length;
  return p.on.length * 2 + chairs * 5 + (p.party === "R" ? 0 : 2);
}

/** The largest and smallest weights in the set, for scaling a face to them. */
export const INFLUENCE_RANGE = ROSTER.reduce(
  (r, p) => {
    const n = influence(p);
    return { lo: Math.min(r.lo, n), hi: Math.max(r.hi, n) };
  },
  { lo: Infinity, hi: -Infinity },
);
