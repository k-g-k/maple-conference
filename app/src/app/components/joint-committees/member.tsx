// One legislator on a joint committee, drawn the way the bill lineage draws a
// conferee: portrait with its party ring, surname, office, district.
//
// A copy of that look rather than a use of `Conferees`, which renders each
// member as a button wired to the vote map. Here the member sits inside a row
// that is itself a link, and a button cannot go inside a link.

import type { ReactNode } from "react";
import { Scale, Star } from "lucide-react";
import {
  officer,
  seatOf,
  type JointMember,
  type JointRole,
} from "../../data/joint-committees/committees";
import { MINE, MINE_FULL } from "../../data/bill-lineage/members";
import { shortTitle, surname } from "../bill-example/lineage-section";
import { Hint } from "../ballot";

/**
 * Party on the ring, as everywhere else. Unenrolled takes the faint ink the
 * vote map gives it, so the one unenrolled member is not drawn as a Democrat.
 */
const RING: Record<string, string> = {
  D: "border-official",
  R: "border-negative",
};

/**
 * Name, office, district. Beside the name in a column of officers, as the
 * lineage's conferees have it; under the name in a grid, as the lineage's
 * committee panel has it, where an office running on beside a long surname
 * would push the cell wider than its neighbours.
 */
const office = (role: string) => shortTitle(role).toLowerCase();

export function Member({
  m,
  below = false,
}: {
  m: JointMember;
  /** The committee panel's arrangement, with the office on its own line. */
  below?: boolean;
}) {
  const seat = seatOf(m.code);
  const mine = seat ? MINE_FULL[seat.seat] : undefined;
  const portrait = (
    <span className="relative shrink-0">
      <img
        src={seat?.portrait}
        alt=""
        className={`block w-[36px] h-[36px] rounded-full object-cover bg-sunken border-[3px] ${
          RING[m.party] ?? "border-ink-faint"
        }`}
      />
      {seat && MINE[seat.seat] && (
        <Hint
          text={MINE_FULL[seat.seat]}
          className="absolute -bottom-[2px] -right-[2px] w-[16px] h-[16px] rounded-full bg-ground flex items-center justify-center"
        >
          <Star
            aria-label={MINE_FULL[seat.seat]}
            className="w-[11px] h-[11px] text-caution fill-caution"
          />
        </Hint>
      )}
    </span>
  );
  if (below)
    return (
      <div className="min-w-0 h-full flex items-center gap-[10px]">
        {portrait}
        {/* The panel's own leading, under 1 so a name and its office read
            as one thing. It goes on the type as well as the wrapper because
            Tailwind's text sizes set a line height that does not inherit. */}
        <span className="min-w-0">
          <span className="block leading-[0.9]">
            <span className="font-body font-semibold text-sm leading-[0.9] text-ink">
              {surname(m.name)}
            </span>
            {m.role && (
              <span className="block mt-[1px] font-body text-xs leading-[0.9] text-caution-ink whitespace-nowrap">
                {office(m.role)}
              </span>
            )}
          </span>
          <span className="block mt-[3px] font-body text-xs text-ink-mid leading-[1.3]">
            {mine ?? m.district}
          </span>
        </span>
      </div>
    );
  return (
    <div className="flex items-center gap-[10px]">
      {portrait}
      <span className="min-w-0">
        <span className="block leading-[1.3] whitespace-nowrap">
          <span className="font-body font-semibold text-sm text-ink">
            {surname(m.name)}
          </span>
          {m.role && (
            <span className="ml-[6px] font-body text-xs text-caution-ink">
              {office(m.role)}
            </span>
          )}
        </span>
        <span className="block font-body text-xs leading-[1.4] text-ink-mid">
          {mine ?? m.district}
        </span>
      </span>
    </div>
  );
}

/**
 * An office the committee page leaves empty, held open rather than closed up.
 * A chamber showing one officer where every other row shows two would read as
 * a rendering fault; the empty ring says the office is there and the legislature
 * names no one to it.
 */
export function NoneListed({
  role,
  below = false,
}: {
  role: JointRole;
  below?: boolean;
}) {
  return (
    <div className="min-w-0 h-full flex items-center gap-[10px]">
      <span
        aria-hidden
        className="block shrink-0 w-[36px] h-[36px] rounded-full border-[3px] border-dashed border-line-strong"
      />
      {below ? (
        <span className="block leading-[0.9]">
          <span className="font-body text-sm leading-[0.9] text-ink-mid">
            None listed
          </span>
          <span className="block mt-[1px] font-body text-xs leading-[0.9] text-caution-ink whitespace-nowrap">
            {office(role)}
          </span>
        </span>
      ) : (
        <span className="block leading-[1.3] whitespace-nowrap">
          <span className="font-body text-sm text-ink-mid">None listed</span>
          <span className="ml-[6px] font-body text-xs text-caution-ink">
            {office(role)}
          </span>
        </span>
      )}
    </div>
  );
}

/**
 * A seat the committee page shows as vacant, drawn as the lineage's committee
 * panel draws one: the scale in an empty circle, and its words for it.
 */
export function VacantSeat() {
  return (
    <div className="min-w-0 h-full flex items-center gap-[10px]">
      <span className="shrink-0 w-[36px] h-[36px] rounded-full bg-sunken border border-line flex items-center justify-center">
        <Scale aria-hidden className="w-[18px] h-[18px] text-ink-faint" />
      </span>
      <span className="font-body font-semibold text-sm leading-[0.9] text-ink">
        Vacant seat
      </span>
    </div>
  );
}

/** The chamber's name over its members, as the lineage heads each column. */
function Chamber({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid mb-[10px]">
        {label}
      </p>
      <ul className="flex flex-col gap-[10px]">{children}</ul>
    </div>
  );
}

/**
 * A chamber's chair and vice chair, which is what the landing page shows. An
 * empty office is held open, so every tile shows two a side.
 */
export function Officers({
  label,
  members,
}: {
  label: string;
  members: JointMember[];
}) {
  return (
    <Chamber label={label}>
      {(["Chair", "Vice Chair"] as const).map((role) => {
        const m = officer(members, role);
        return (
          <li key={role}>{m ? <Member m={m} /> : <NoneListed role={role} />}</li>
        );
      })}
    </Chamber>
  );
}
