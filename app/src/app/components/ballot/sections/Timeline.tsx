import { SourceNote } from "../primitives";
import type { TL } from "../types";

// Dated milestone list with a vertical rail.
export function Timeline({ items }: { items: TL[] }) {
  return (
    <div className="ml-[6px] pl-[24px] border-l-[2px] border-line space-y-[18px]">
      {items.map((it) => (
        <div key={it.when + it.label} className="relative">
          <span className="absolute left-[-30px] top-[5px] w-[10px] h-[10px] rounded-full bg-brand" />
          <p className="font-body font-semibold text-2xs text-brand">
            {it.when}
          </p>
          <p className="font-body font-semibold text-lg text-ink mt-[2px]">
            {it.label}
          </p>
          {it.body && (
            <p className="font-body text-base text-ink leading-[1.5] mt-[2px]">
              {it.body}
            </p>
          )}
          {it.ids && <SourceNote ids={it.ids} />}
        </div>
      ))}
    </div>
  );
}
