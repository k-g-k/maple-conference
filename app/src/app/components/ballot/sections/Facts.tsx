import { Cite } from "../primitives";
import type { Fact } from "../types";

// Key/value fact list with optional inline citations.
export function Facts({ items }: { items: Fact[] }) {
  return (
    <div className="space-y-[8px]">
      {items.map((f) => (
        <div key={f.k} className="flex gap-[10px] text-base leading-[1.5]">
          <span className="font-body font-semibold text-ink min-w-[190px] shrink-0">
            {f.k}
          </span>
          <span className="font-body text-ink">
            {f.v}
            {f.ids && <Cite ids={f.ids} />}
          </span>
        </div>
      ))}
    </div>
  );
}
