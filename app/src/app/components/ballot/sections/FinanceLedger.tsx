import { SourceNote } from "../primitives";
import type { Committee } from "../types";

// Committee finance cards + top-donor tables.
export function FinanceLedger({
  committees,
  ids,
}: {
  committees: Committee[];
  ids: string[];
}) {
  return (
    <div>
      <div className="flex gap-[16px]">
        {committees.map((c) => (
          <div
            key={c.name}
            // A column, so the donor list is the part that grows and the two
            // cards end level whether or not a committee filed anything.
            className="flex-1 flex flex-col border border-line-strong rounded-panel p-[18px]"
          >
            <div className="flex items-center gap-[8px] flex-wrap">
              <p className="font-body font-semibold text-lg text-ink">
                {c.name}
              </p>
              <span
                className={`font-body font-semibold text-2xs px-[10px] py-[2px] rounded-pill ${
                  c.stance === "yes"
                    ? "bg-positive-soft text-positive-ink"
                    : "bg-negative-soft text-negative-ink"
                }`}
              >
                {c.stance === "yes" ? "Yes" : "No"}
              </span>
            </div>
            <p className="font-body font-semibold text-2xl text-ink mt-[8px]">
              {c.total}
            </p>
            <p className="font-body text-xs text-ink-muted">
              total contributions · {c.cash} cash · {c.inKind} in-kind ·{" "}
              {c.spent} spent
            </p>
            <p className="font-body text-sm text-ink mt-[8px] leading-[1.5]">
              {c.note}
            </p>
            <p className="font-body font-semibold text-2xs text-ink-muted mt-[14px] mb-[6px]">
              Top donors
            </p>
            {c.donors.length ? (
              <div className="space-y-[5px]">
                {c.donors.map((d) => (
                  <div
                    key={d.name}
                    className="flex justify-between gap-[12px] text-sm border-b border-dotted border-line pb-[4px]"
                  >
                    <span className="font-body text-ink">{d.name}</span>
                    <span className="font-body text-ink whitespace-nowrap tabular-nums">
                      {d.amount}{" "}
                      <span className="text-ink-faint">{d.kind}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              // A recessed panel rather than blank space. A committee that
              // filed nothing is a fact, and an empty gap under a heading reads
              // as something that failed to load.
              <div className="flex-1 bg-sunken rounded-panel px-[14px] py-[12px]">
                <p className="font-body text-sm text-ink-muted leading-[1.5]">
                  None reported in this filing window.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      <SourceNote ids={ids} />
    </div>
  );
}
