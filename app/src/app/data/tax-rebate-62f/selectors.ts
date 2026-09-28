// Selectors that join this question's testimony to its accounts. They read the
// 62F data model directly, so they live with the data (not in the generic
// ballot library). Parallel to src/app/data/rent-control/selectors.ts.

import { POSITION_USERS, type PositionUser } from "../tax-rebate-62f-users";
import {
  TESTIMONY,
  type TestimonyItem,
  type TestimonyStance,
} from "../tax-rebate-62f-testimony";

// Organization accounts that submitted testimony with the given stance,
// de-duplicated, in testimony order.
export function orgTestifiers(stance: TestimonyStance): PositionUser[] {
  const seen = new Set<string>();
  const out: PositionUser[] = [];
  for (const t of TESTIMONY) {
    if (t.stance !== stance || seen.has(t.userId)) continue;
    const u = POSITION_USERS.find((x) => x.id === t.userId);
    if (u && u.userType === "organization") {
      seen.add(t.userId);
      out.push(u);
    }
  }
  return out;
}

// Testimony whose submitting account matches the predicate, newest first.
export function testimonyFor(
  match: (u: PositionUser) => boolean,
): TestimonyItem[] {
  return TESTIMONY.filter((t) => {
    const u = POSITION_USERS.find((x) => x.id === t.userId);
    return u ? match(u) : false;
  }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}
