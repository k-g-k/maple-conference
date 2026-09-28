// The citation / provenance stack. Every component here resolves source ids
// against the registry supplied by <SourcesProvider> (useSources()), so the
// same components work for any ballot question.

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { useSources } from "../sources-context";
import { SRC_CHIP } from "../types";
import { shortSourceName } from "../helpers";

// Inline superscript citation chips — each links out to a verified source.
export function Cite({ ids }: { ids: string[] }) {
  const sources = useSources();
  return (
    <sup className="ml-[3px] whitespace-nowrap">
      {ids.map((id, i) => {
        const s = sources[id];
        if (!s) return null;
        return (
          <a
            key={id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
            className="font-body font-semibold text-2xs text-ai-ink no-underline hover:text-brand"
          >
            [{i > 0 ? "" : "src"}
            {i > 0 ? i + 1 : ""}↗]
          </a>
        );
      })}
    </sup>
  );
}

// Muted "Source: …" line linking each id.
export function SourceNote({ ids, text }: { ids?: string[]; text?: string }) {
  const sources = useSources();
  return (
    <p className="font-body text-xs text-ink-faint mt-[8px] leading-[1.5]">
      {text ? `${text} ` : "Source: "}
      {ids?.map((id, i) => {
        const s = sources[id];
        if (!s) return null;
        return (
          <span key={id}>
            {i > 0 && "; "}
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:text-alert"
            >
              {s.label}
              {s.date ? ` (${s.date})` : ""}
            </a>
          </span>
        );
      })}
    </p>
  );
}

// Source line for AI-synthesized passages: sparkle badge, then each source as
// a short-name link with an outbound arrow.
export function AISynthSources({ ids }: { ids: string[] }) {
  const sources = useSources();
  return (
    <p className="font-body text-xs text-ink-faint mt-[8px] leading-[1.5]">
      <Sparkles className="w-[12px] h-[12px] text-ai-ink inline-block align-[-1.5px] mr-[4px]" />
      AI Synthesis of{" "}
      {ids.map((id, i) => {
        const s = sources[id];
        if (!s) return null;
        return (
          <span key={id}>
            {i > 0 && "; "}
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:text-alert whitespace-nowrap"
            >
              {shortSourceName(s)}
              <ArrowUpRight className="w-[11px] h-[11px] inline-block align-[-1px]" />
            </a>
          </span>
        );
      })}
    </p>
  );
}

/**
 * The mark that says a block is synthesis rather than record.
 *
 * Greyscaled at rest and full colour on hover, so a page carrying synthesis in
 * most of its sections is not covered in purple. It expects a `group` on an
 * ancestor; standing alone it simply stays muted, which is the resting state
 * anyway.
 */
export function AIChip({ label = "AI Synthesis" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-[4px] border border-ai-edge text-ai-ink grayscale-[50%] group-hover:filter-none group-focus-within:filter-none font-body font-semibold text-2xs uppercase tracking-[0.08em] px-[7px] py-[2px] rounded-control">
      <Sparkles className="w-[10px] h-[10px]" />
      {label}
    </span>
  );
}

// Sources popover trigger.
//  - "ai" (default): muted AI Synthesis chip + "Check our work".
//  - "plain": no chip, "View Sources" — for non-AI provenance (e.g. claims).
// Opens a bibliography popover (optional prompt, then each source with
// provenance chip, title, issuer · date, note, outbound link). Closes on
// outside click or Escape.

export function SynthSourcesNote({
  ids,
  prompt,
  variant = "ai",
  linkClass,
  inline = false,
  extra,
  note,
}: {
  ids: string[];
  prompt?: string;
  variant?: "ai" | "plain";
  /** Tailwind text/hover classes for the plain-variant trigger. */
  linkClass?: string;
  /** Render as an inline trigger (e.g. at the end of a sentence). */
  inline?: boolean;
  /** Extra content rendered in the trigger row, beside the trigger. */
  extra?: ReactNode;
  /**
   * Provenance told in words rather than through the source registry, for a
   * page whose material is not in one. Shown in place of the source list.
   */
  note?: ReactNode;
}) {
  const sources = useSources();
  const [open, setOpen] = useState(false);
  // Open downward by default; flip up when there isn't room below the trigger.
  const [placement, setPlacement] = useState<"down" | "up">("down");
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = wrapRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const POPOVER_MAX = 440; // max-h-[420px] + margin
      setPlacement(
        spaceBelow < POPOVER_MAX && spaceAbove > spaceBelow ? "up" : "down",
      );
    }
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerLabel =
    variant === "ai"
      ? "Check our work"
      : ids.length === 1
        ? "View Source"
        : "View Sources";
  const triggerClass = `font-body font-semibold text-sm underline decoration-dotted underline-offset-[4px] cursor-pointer ${
    variant === "ai"
      ? "text-ai-ink hover:text-ai-deep"
      : (linkClass ?? "text-brand hover:text-alert")
  }`;
  const trigger = (
    <button
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      className={triggerClass}
    >
      {triggerLabel}
    </button>
  );
  const popover = open && (
    <div
      role="dialog"
      aria-label="Sources"
      className={`absolute left-0 ${
        placement === "up" ? "bottom-full mb-[8px]" : "top-full mt-[8px]"
      } w-[440px] max-w-[80vw] max-h-[420px] overflow-y-auto bg-surface border border-line-strong rounded-control shadow-[0_10px_28px_rgba(0,0,0,0.14)] p-[18px] z-30 text-left`}
    >
      {prompt && (
        <div className="border-b border-dotted border-line-strong mb-[14px] pb-[14px]">
          <span className="inline-block bg-surface border border-ai-edge text-ai-ink font-body font-semibold text-2xs px-[8px] py-[2px] rounded-control">
            Prompt
          </span>
          <p className="font-body text-sm text-ink leading-[1.5] mt-[8px]">
            {prompt}
          </p>
        </div>
      )}
      {note && (
        <div className="font-body text-sm text-ink leading-[1.55]">{note}</div>
      )}
      {ids.map((id, i) => {
        const s = sources[id];
        if (!s) return null;
        const chip = SRC_CHIP[s.kind];
        const metaLine =
          s.meta && s.date && !s.meta.includes(s.date)
            ? `${s.meta} · ${s.date}`
            : (s.meta ?? s.date);
        return (
          <div
            key={id}
            className={
              i > 0
                ? "border-t border-dotted border-line-strong mt-[14px] pt-[14px]"
                : ""
            }
          >
            <span
              className={`inline-block bg-surface border ${chip.bd} ${chip.tx} font-body font-semibold text-2xs px-[8px] py-[2px] rounded-control`}
            >
              {chip.label}
            </span>
            <p className="font-body font-semibold text-base text-ink leading-[1.4] mt-[8px]">
              {s.title ?? s.label}
            </p>
            {metaLine && (
              <p className="font-body text-sm text-ink-muted mt-[2px]">
                {metaLine}
              </p>
            )}
            {s.note && (
              <p className="font-body text-sm text-ink leading-[1.5] mt-[4px]">
                {s.note}
              </p>
            )}
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-[3px] font-body font-semibold text-sm text-brand underline underline-offset-2 hover:text-alert mt-[6px]"
              >
                Open source <ArrowUpRight className="w-[13px] h-[13px]" />
              </a>
            ) : (
              <p className="font-body text-sm text-ink-muted mt-[6px]">
                Link not yet on file
              </p>
            )}
          </div>
        );
      })}
    </div>
  );

  if (inline) {
    return (
      <span ref={wrapRef} className="relative inline-block">
        {trigger}
        {popover}
      </span>
    );
  }
  return (
    <span ref={wrapRef} className="relative block mt-[10px]">
      {/* The chip is the affordance; "Check our work" only appears once
          you are already on it, so the resting state stays quiet on a page that
          carries synthesis in most sections. Opacity rather than display, so
          nothing shifts on hover and the control stays reachable by keyboard. */}
      <span className="group flex items-center gap-[10px] flex-wrap">
        {variant === "ai" && <AIChip />}
        <span
          className={
            variant === "ai"
              ? "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
              : ""
          }
        >
          {trigger}
        </span>
        {extra}
      </span>
      {popover}
    </span>
  );
}
