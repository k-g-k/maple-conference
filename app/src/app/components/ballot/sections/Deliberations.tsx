// Building blocks for the Citizen Deliberations tab.

// A single participation-stat tile (big number + label).
export function DelibStat({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex-1 min-w-[104px] border border-line rounded-control px-[10px] py-[12px] text-center">
      <p className="font-body font-semibold text-2xl text-ink leading-none">
        {n}
      </p>
      <p className="font-body text-2xs text-ink-muted mt-[5px] leading-[1.3]">
        {label}
      </p>
    </div>
  );
}

// One theme column — top rule, uppercase label, body. Neutral (uncolored).
export function DelibThemeCol({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex-1 min-w-0 border-t-[3px] border-line-strong pt-[10px]">
      <p className="font-body font-semibold text-2xs text-ink-muted">
        {label}
      </p>
      <p className="font-body text-sm text-ink leading-[1.55] mt-[6px]">
        {text}
      </p>
    </div>
  );
}
