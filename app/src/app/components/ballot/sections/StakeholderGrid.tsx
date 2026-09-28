import type { Stakeholder, StakeholderImpact } from "../types";

const IMPACT_BADGE: Record<
  StakeholderImpact,
  { bg: string; tx: string; label: string }
> = {
  benefits: { bg: "bg-outside-soft", tx: "text-outside-ink", label: "Benefits" },
  cost: { bg: "bg-negative-soft", tx: "text-negative-ink", label: "Bears cost" },
  neutral: {
    bg: "bg-sunken",
    tx: "text-ink-muted",
    label: "Exempt or neutral",
  },
};

// Per-group impact tiles — who benefits, who bears cost, who is exempt.
export function StakeholderGrid({ rows }: { rows: Stakeholder[] }) {
  return (
    <div className="grid grid-cols-2 gap-[10px]">
      {rows.map((s) => {
        const badge = IMPACT_BADGE[s.impact];
        return (
          <div
            key={s.group}
            className="flex flex-col h-full bg-surface border border-line rounded-control p-[12px]"
          >
            <div className="flex items-start justify-between gap-[8px] mb-[6px]">
              <p className="font-body font-semibold text-sm text-ink">
                {s.group}
                {s.disputed && (
                  // On the name rather than the body: it marks the group's
                  // claim as contested, not one sentence within it. Hover
                  // explains the mark in place, so the card needs no legend and
                  // the meaning travels with the row.
                  <span className="relative inline-block group align-baseline ml-[5px] text-caution-ink">
                    <span>⚠</span>
                    <span className="absolute left-0 bottom-full mb-[6px] hidden group-hover:block w-[250px] bg-surface border border-line-strong rounded-control shadow-[0_10px_28px_rgba(0,0,0,0.14)] p-[10px] z-30 font-body font-normal text-xs text-ink leading-[1.5] pointer-events-none">
                      <span className="font-semibold">Disputed:</span> opponents
                      and proponents do not agree on this statement.
                    </span>
                  </span>
                )}
              </p>
              <span
                className={`shrink-0 font-body font-semibold text-2xs tracking-[0.08em] px-[8px] py-[2px] rounded-pill ${badge.bg} ${badge.tx}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="font-body text-sm text-ink leading-[1.5]">{s.body}</p>
            <p className="font-body text-2xs text-ink-faint mt-auto pt-[8px]">
              Basis: {s.basis}
            </p>
          </div>
        );
      })}
    </div>
  );
}
