import type { ReactNode } from "react";

// The rounded pill used for every filter/toggle chip on the page (argument
// source filters, testimony stance filters, the Following toggle). `active`
// swaps to the selected blue treatment; `className` appends layout tweaks
// (e.g. `ml-auto` or `inline-flex gap` when the chip carries an icon).
export function FilterChip({
  active,
  onClick,
  className = "",
  title,
  ariaPressed,
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
  ariaPressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={ariaPressed}
      className={`font-body font-semibold text-xs px-[10px] py-[4px] rounded-pill border cursor-pointer transition-colors ${
        active
          ? "bg-brand-soft border-brand-edge text-brand-ink"
          : "border-line-strong text-ink-muted hover:bg-wash"
      } ${className}`}
    >
      {children}
    </button>
  );
}
