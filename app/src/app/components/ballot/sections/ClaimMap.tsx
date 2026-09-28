import { ShieldCheck, AlertTriangle } from "lucide-react";
import { SynthSourcesNote } from "../primitives";
import type { ClaimRow, ClaimSource } from "../types";

// Link color matches the claim's source (green = outside, orange = testimony).
const CLAIM_LINK: Record<ClaimSource, string> = {
  outside: "text-outside-ink hover:text-outside-deep",
  testimony: "text-user-ink hover:text-user-deep",
};

// Verified/attributed claim rows: a ✓/⚠ marker + bold label lead the note; the
// "View Source(s)" popover sits inline at the end.
export function ClaimMap({ rows }: { rows: ClaimRow[] }) {
  return (
    <div className="space-y-[16px]">
      {rows.map((r) => {
        const verified = r.mark === "verified";
        return (
          <div
            key={r.claim}
            className="border-t border-dotted border-line-strong pt-[16px] first:border-0 first:pt-0"
          >
            <p className="font-body font-semibold text-lg text-ink leading-[1.45]">
              {r.claim}
            </p>
            <div className="font-body text-sm text-ink-muted mt-[4px] leading-[1.55]">
              {verified ? (
                <ShieldCheck className="w-[14px] h-[14px] text-outside-ink inline-block align-[-2px] mr-[4px]" />
              ) : (
                <AlertTriangle className="w-[14px] h-[14px] text-caution-ink inline-block align-[-2px] mr-[4px]" />
              )}
              <span
                className={`font-semibold ${verified ? "text-outside-ink" : "text-caution-ink"}`}
              >
                {verified ? "Verified. " : "Attributed. "}
              </span>
              {r.note}
              {r.ids && (
                <>
                  {" "}
                  <SynthSourcesNote
                    ids={r.ids}
                    variant="plain"
                    inline
                    linkClass={CLAIM_LINK[r.source]}
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
