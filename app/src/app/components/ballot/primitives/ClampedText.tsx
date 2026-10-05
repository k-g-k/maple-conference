// A passage capped at a number of lines, with an inline control that opens the
// rest of it.
//
// Lifted out of the submission feed, which is where it was written, because the
// public-input map needs the same thing: a county's filers listed beside it, each
// one's words as long as they happen to be. Two copies of a measuring loop is two
// places for the line count and the wording to drift apart, and the reader is
// meant to recognize the control as the same one.
//
// How it holds the cap: a hidden measurer wearing the same type as the paragraph
// binary-searches the longest prefix that, with "… Show more" appended, still
// fits. The prefix is recomputed whenever the paragraph's own width changes, so
// it is correct in a panel, in a page column, and on a phone without anything
// telling it which it is in.

import { Fragment, useEffect, useRef, useState } from "react";

export function ClampedText({
  text,
  lines = 6,
  className = "",
  paragraphGap,
}: {
  text: string;
  /** How many lines are shown before the control. */
  lines?: number;
  /**
   * The type the passage is set in. Worn by the measurer as well, which is what
   * makes the search measure against the right line height, so it has to carry
   * the font, the size and the leading rather than only the color.
   */
  className?: string;
  /**
   * The gap between paragraphs, in pixels, where a blank line is too much.
   *
   * Preformatted text spaces its paragraphs with a blank line, which is a
   * whole line of the passage's own leading and reads as a hole in a letter
   * set at this size. Given a number, the blank lines come out and a spacer of
   * that height goes in instead.
   *
   * The measurer still measures the text with its blank lines, so the cap is
   * reached a little early: the passage shows slightly less than its line
   * count rather than slightly more, which is the right way to be wrong.
   */
  paragraphGap?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cutoff, setCutoff] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const m = measureRef.current;
    if (!wrap || !m) return;
    const compute = () => {
      m.style.width = `${wrap.clientWidth}px`;
      const maxH = parseFloat(getComputedStyle(m).lineHeight) * lines + 2;
      m.textContent = text;
      if (m.scrollHeight <= maxH) {
        setCutoff(null);
        return;
      }
      let lo = 0;
      let hi = text.length;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        m.textContent = text.slice(0, mid).trimEnd() + "… Show more";
        if (m.scrollHeight <= maxH) lo = mid;
        else hi = mid - 1;
      }
      setCutoff(lo);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [text, lines]);

  const collapsed = !expanded && cutoff !== null;
  return (
    // Positioned, so the measurer is laid out against this box rather than
    // against whatever happens to be positioned above it in the page.
    <div ref={wrapRef} className="relative">
      <p
        ref={measureRef}
        aria-hidden="true"
        className={`${className} absolute invisible pointer-events-none`}
      />
      <p className={className}>
        {paragraphGap === undefined
          ? collapsed
            ? `${text.slice(0, cutoff).trimEnd()}… `
            : `${text} `
          : (collapsed ? `${text.slice(0, cutoff).trimEnd()}… ` : `${text} `)
              .split(/\n{2,}/)
              .map((para, i) => (
                <Fragment key={i}>
                  {i > 0 && (
                    <span className="block" style={{ height: paragraphGap }} />
                  )}
                  {para}
                </Fragment>
              ))}
        {cutoff !== null && (
          <button
            onClick={(e) => {
              // Keep expand/collapse from triggering the row's click-through.
              e.stopPropagation();
              setExpanded((x) => !x);
            }}
            className="font-body font-semibold text-sm text-brand hover:text-alert cursor-pointer"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </p>
    </div>
  );
}
