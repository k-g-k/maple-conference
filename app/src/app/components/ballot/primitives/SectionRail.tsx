import { useEffect, useState } from "react";
import { TabBar } from "./TabBar";
import type { DepthMode } from "./depth";

/**
 * Reports which section is currently being read, so the rail can mark it.
 *
 * Picks the last section whose top has passed the pinned stack rather than the
 * one occupying the most screen. On a page of very unequal section lengths that
 * is the one that matches where a reader thinks they are.
 */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const pinned = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(
        "--pinned-h",
      );
      return parseFloat(raw) || 0;
    };
    const onScroll = () => {
      const line = pinned() + 24;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);
  return active;
}

/**
 * The page's table of contents, and the one control over how much it shows.
 *
 * Reuses TabBar for the list, so the rail keeps the same two shapes the tabs
 * had: a column beside the content at 950px and up, a pinned horizontal strip
 * below. What changed is the job, jumping to a section rather than swapping one
 * out for another.
 */
export function SectionRail({
  sections,
  active,
  onJump,
  mode,
  onModeChange,
}: {
  sections: readonly { id: string; label: string }[];
  active: string;
  onJump: (id: string) => void;
  mode: DepthMode;
  onModeChange: (mode: DepthMode) => void;
}) {
  const summarising = mode === "summary";
  return (
    <div className="flex flex-col gap-[12px]">
      <TabBar tabs={sections} active={active} onChange={onJump} />
      {/* Says what it is doing rather than naming a mode, and states plainly
          that nothing was thrown away: on a page that must not look like it is
          arguing, a control that hides content has to account for itself. */}
      <div className="bg-surface rounded-card border border-line p-[12px] flex flex-col gap-[6px]">
        <button
          onClick={() => onModeChange(summarising ? "full" : "summary")}
          aria-pressed={summarising}
          className="flex items-center gap-[8px] text-left font-body font-semibold text-sm text-brand hover:text-alert cursor-pointer"
        >
          <span
            aria-hidden
            className={`shrink-0 w-[30px] h-[18px] rounded-pill border transition-colors ${
              summarising
                ? "bg-brand border-brand"
                : "bg-sunken border-line-strong"
            } relative`}
          >
            <span
              className={`absolute top-[2px] w-[12px] h-[12px] rounded-full bg-surface transition-all ${
                summarising ? "left-[15px]" : "left-[2px]"
              }`}
            />
          </span>
          {summarising ? "Showing summaries only" : "Show summaries only"}
        </button>
        <p className="font-body text-xs text-ink-muted">
          {summarising
            ? "Every section is collapsed to its plain-language answer. Nothing has been removed."
            : "Collapses every section to its plain-language answer, for a short read."}
        </p>
      </div>
    </div>
  );
}
