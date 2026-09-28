import { Cite } from "../primitives";
import type { PollRow } from "../types";

// Support/oppose/undecided bar + methodology row per poll.
export function Polls({ rows }: { rows: PollRow[] }) {
  return (
    <div className="space-y-[16px]">
      {rows.map((p) => (
        <div
          key={p.pollster + p.dates}
          className="border-t border-dotted border-line-strong pt-[12px] first:border-0 first:pt-0"
        >
          <p className="font-body font-semibold text-base text-ink">
            {p.pollster}
            <Cite ids={p.ids} />
          </p>
          <div className="flex h-[26px] rounded-control overflow-hidden my-[8px] font-body font-semibold text-2xs text-ink-inverse">
            <div
              className="bg-brand flex items-center pl-[9px]"
              style={{ width: `${p.support}%` }}
            >
              {p.support}%
            </div>
            <div
              className="bg-ink-muted flex items-center pl-[9px]"
              style={{ width: `${p.oppose}%` }}
            >
              {p.oppose}%
            </div>
            <div
              className="bg-ink-faint text-ink flex items-center pl-[9px]"
              style={{ width: `${p.undecided}%` }}
            >
              {p.undecided}%
            </div>
          </div>
          <p className="font-body text-xs text-ink-muted">
            Support {p.support}% · Oppose {p.oppose}% · Undecided {p.undecided}%
            · {p.dates} · {p.sample} · MoE {p.moe}
          </p>
        </div>
      ))}
    </div>
  );
}
