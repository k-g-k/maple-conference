// Account and position presentation for the conference pages' public input.
//
// The ballot pages have their own copy of the first two of these, typed against
// that question's account model. This one is typed against the conference's, and
// the chip is the conference's four positions rather than support, oppose and no
// position, so the two are not the same component with a wider type.

import { Megaphone, Lectern, UserRound } from "lucide-react";
import type { ConferenceAccount } from "../../data/conference-committees/testimony";
import type { ConferencePosition } from "../../data/conference-committees/positions";
import { POSITIONS } from "../../data/conference-committees/positions";
import { Hint } from "../ballot";

/**
 * The account's own mark where it has one, initials where it does not.
 *
 * Most of these accounts are placeholders, and a placeholder cannot carry a
 * logo: a logo belongs to somebody. The two that are real do carry theirs, and
 * the disc is the same disc either way, so a feed of both reads as one list.
 */
export function AccountAvatar({
  account,
  size = 40,
}: {
  account: ConferenceAccount;
  size?: number;
}) {
  if (account.avatar) {
    return (
      <img
        src={account.avatar}
        alt=""
        style={{ width: size, height: size }}
        // Cover rather than contain: both marks are square and sit on their own
        // ground, so the only thing the circle takes off them is the corners.
        className="rounded-full object-cover bg-surface border border-line shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-brand-soft border border-brand-edge flex items-center justify-center shrink-0"
    >
      <span
        style={{ fontSize: size >= 40 ? 12 : 10 }}
        className="font-body font-semibold text-brand-ink tracking-[0.02em]"
      >
        {account.initials}
      </span>
    </div>
  );
}

const ACCOUNT_TYPE_ICON: Record<
  ConferenceAccount["userType"],
  { Icon: typeof Megaphone; label: string }
> = {
  organization: { Icon: Megaphone, label: "Organization" },
  government: { Icon: Lectern, label: "Government office" },
  // TEMPORARY: trying the ringed one. UserRound is what this was.
  individual: { Icon: UserRound, label: "Individual" },
};

export function AccountTypeIcon({
  type,
  size = 16,
}: {
  type: ConferenceAccount["userType"];
  size?: number;
}) {
  const { Icon, label } = ACCOUNT_TYPE_ICON[type];
  return (
    <Hint text={label} ariaLabel={label} className="shrink-0 leading-none">
      <Icon style={{ width: size, height: size }} />
    </Hint>
  );
}

/**
 * What a submission asked the conference for.
 *
 * Words and color, no thumb. The thumbs belong to the filter row, where they
 * are the mark you press; here the chip is already color coded and already
 * sitting beside the name of whoever filed, so the label is all it needs, and a
 * thumb beside a person's name is louder than what they wrote.
 */
export function PositionChip({ position }: { position: ConferencePosition }) {
  const p = POSITIONS[position];
  return (
    <span
      // Never broken across two lines. These labels are two words at their
      // longest and the chip shares a line with a name in the submission card's
      // header, so at a panel's width a wrapped pill reads as two chips rather
      // than one and takes the whole line a step taller with it.
      className={`${p.tone} shrink-0 px-[8px] py-[1px] rounded-pill font-body font-semibold text-2xs whitespace-nowrap`}
    >
      {p.short}
    </span>
  );
}
