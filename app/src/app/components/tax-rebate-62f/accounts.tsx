// Account/user presentation, bound to this question's account model
// (PositionUser / TestimonyStance). Kept with the page rather than the generic
// ballot library because it depends on that data model; generalize later by
// lifting those types into ballot/types.

import { Megaphone, Scale, Lectern, UserRound } from "lucide-react";
import type { PositionUser, TestimonyStance } from "../../data/tax-rebate-62f";

export function UserAvatar({
  user,
  size = 40,
  bordered = true,
}: {
  user: PositionUser;
  size?: number;
  /** Drop the hairline when something else already outlines the avatar. */
  bordered?: boolean;
}) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover bg-surface shrink-0 ${
          bordered ? "border border-line" : ""
        }`}
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-brand-soft flex items-center justify-center shrink-0 ${
        bordered ? "border border-brand-edge" : ""
      }`}
    >
      <span
        style={{ fontSize: size >= 40 ? 12 : 10 }}
        className="font-body font-semibold text-brand-ink tracking-[0.02em]"
      >
        {user.initials ?? user.name.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

export function AvatarWithTooltip({
  user,
  size = 40,
  ringColor,
}: {
  user: PositionUser;
  size?: number;
  /** Wraps the avatar in a coloured ring, e.g. the side it has taken. */
  ringColor?: string;
}) {
  return (
    <div className="relative group shrink-0">
      {ringColor ? (
        <div
          style={{ borderColor: ringColor }}
          className="rounded-full border-2 leading-none"
        >
          <UserAvatar user={user} size={size} />
        </div>
      ) : (
        <UserAvatar user={user} size={size} />
      )}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[6px] hidden group-hover:block bg-ink text-ink-inverse font-body text-xs px-[8px] py-[4px] rounded-control whitespace-nowrap z-20 pointer-events-none">
        {user.name}
      </div>
    </div>
  );
}

const USER_TYPE_ICON: Record<
  PositionUser["userType"],
  { Icon: typeof Megaphone; color?: string; label: string }
> = {
  organization: { Icon: Megaphone, label: "Organization" },
  legislator: { Icon: Scale, label: "Legislator" },
  government: { Icon: Lectern, label: "Executive office" },
  individual: { Icon: UserRound, label: "Individual" },
};

export function UserTypeIcon({
  type,
  size = 15,
}: {
  type: PositionUser["userType"];
  size?: number;
}) {
  const { Icon, color, label } = USER_TYPE_ICON[type];
  return (
    <span title={label} aria-label={label} className="shrink-0 leading-none">
      <Icon style={{ width: size, height: size, color }} />
    </span>
  );
}

export function PositionUserRow({ user }: { user: PositionUser }) {
  return (
    <div className="flex items-center gap-[12px] min-w-0">
      <UserAvatar user={user} />
      <div className="min-w-0">
        <div className="flex items-center gap-[6px] flex-wrap">
          <p className="font-body font-semibold text-base text-ink leading-[1.3]">
            {user.name}
          </p>
          <UserTypeIcon type={user.userType} />
        </div>
        <p className="font-body text-xs text-ink-faint leading-[1.4]">
          {user.descriptor}
        </p>
      </div>
    </div>
  );
}

export function PositionUserGroup({
  heading,
  users,
}: {
  heading: string;
  users: PositionUser[];
}) {
  return (
    <div>
      <p className="font-body font-semibold text-sm text-ink-muted mb-[10px]">
        {heading} ({users.length})
      </p>
      <div className="grid grid-cols-2 gap-x-[24px] gap-y-[12px]">
        {users.map((u) => (
          <PositionUserRow key={u.id} user={u} />
        ))}
      </div>
    </div>
  );
}

export const STANCE_CHIP: Record<
  TestimonyStance,
  { bg: string; bd: string; tx: string; label: string }
> = {
  endorse: {
    bg: "bg-positive-soft",
    bd: "border-positive",
    tx: "text-positive-ink",
    label: "Supports",
  },
  oppose: {
    bg: "bg-negative-soft",
    bd: "border-negative",
    tx: "text-negative-ink",
    label: "Opposes",
  },
  "no-position": {
    bg: "bg-sunken",
    bd: "border-line-strong",
    tx: "text-ink-muted",
    label: "No Position",
  },
};

export function StanceChip({ stance }: { stance: TestimonyStance }) {
  const c = STANCE_CHIP[stance];
  return (
    <span
      className={`${c.bg} border ${c.bd} ${c.tx} px-[8px] py-[1px] rounded-pill font-body font-semibold text-2xs`}
    >
      {c.label}
    </span>
  );
}
