import { useEffect, useRef } from "react";

// The tab control for a ballot-question page. One list in two shapes: a
// vertical card of tabs beside the content at >= 950px, and a horizontal,
// sideways-scrolling strip above it below that. Each shape marks the active tab
// the way that shape reads best — a filled pill in the column, a thick blue
// underline in the strip, which runs flush with the bottom edge of the strip
// rather than floating inside it — hence no bottom padding narrow.
//
// Question-agnostic: it takes `{ id, label }[]` and hands the id back. Keep the
// 950px breakpoint in sync with the page shell's own min-[950px] variants.
export function TabBar<Id extends string>({
  tabs,
  active,
  onChange,
  className = "",
}: {
  tabs: readonly { id: Id; label: string }[];
  active: Id;
  onChange: (id: Id) => void;
  className?: string;
}) {
  // Narrow, the leftover room goes into the buttons rather than between them:
  // each one grows by an equal share and centres its label in what it gets, so
  // the underline runs the full width of the tab instead of just the width of
  // the word. That is also why the strip carries no gap here — a gap would be
  // gutter the underline could not reach. Should a question ever carry enough
  // tabs to overflow, there is nothing left to grow into and the strip falls
  // back to scrolling at natural widths.
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Tabs also change from inside the content — each tab's closing call to
  // action opens the next one — so the strip pulls the newly active pill into
  // view instead of leaving it off the end. Setting scrollLeft directly rather
  // than calling scrollIntoView keeps this from moving the page itself.
  useEffect(() => {
    const list = listRef.current;
    const pill = activeRef.current;
    if (!list || !pill) return;
    if (list.scrollWidth <= list.clientWidth) return;
    const centered = pill.offsetLeft - (list.clientWidth - pill.clientWidth) / 2;
    list.scrollTo({ left: Math.max(0, centered) });
  }, [active]);

  return (
    <div
      ref={listRef}
      role="tablist"
      className={`bg-surface flex rounded-card flex-row gap-0 px-[8px] pt-[8px] pb-0 overflow-x-auto scrollbar-hide min-[950px]:flex-col min-[950px]:gap-[8px] min-[950px]:p-[16px] min-[950px]:overflow-visible ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            ref={isActive ? activeRef : undefined}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            // Narrow, the height comes from padding rather than h-[36px]: the
            // extra below the label lifts it clear of the underline and gives
            // the strip a little more height, and because the padding is inside
            // the button the border stays on its bottom edge, still flush with
            // the strip. Wide, the fixed height and even padding come back.
            //
            // Two selected treatments, one per shape. Narrow, the active tab
            // carries a thick blue underline and no fill; wide, it is the
            // filled pill the sidebar has always used. Every wide rule is a
            // border-width or radius on all four sides, so it fully overrides
            // the narrow bottom-only border rather than half-inheriting it.
            //
            // The inactive border is transparent rather than absent so pills
            // keep their width, and labels their baseline, as the selection
            // moves along the strip.
            className={`cursor-pointer shrink-0 grow h-auto rounded-none border-b-[3px] px-[10px] pt-[6px] pb-[12px] flex items-center justify-center transition-colors min-[950px]:grow-0 min-[950px]:justify-start min-[950px]:h-[36px] min-[950px]:py-[6px] min-[950px]:rounded-card min-[950px]:border-[1px] ${
              isActive
                ? "border-b-brand-ink min-[950px]:border-brand-edge min-[950px]:bg-brand-soft"
                : "border-b-transparent min-[950px]:border-transparent"
            }`}
          >
            <p
              className={`font-body font-semibold text-base tracking-[0.14px] whitespace-nowrap ${
                isActive ? "text-brand-ink" : "text-ink"
              }`}
            >
              {tab.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}
