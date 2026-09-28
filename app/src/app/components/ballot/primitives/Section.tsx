import type { ReactNode } from "react";
import { useDepth } from "./depth";

/**
 * One chapter of a ballot-question page.
 *
 * The scaffolding lives in the order of the parts rather than in a control: the
 * summary answers the section's question in plain language, and everything
 * after it is the evidence for that answer. A reader who stops at the top of a
 * section has still been told something true.
 *
 * In summary mode only the summary renders, which is the same promise made
 * shorter rather than a different page.
 *
 * The heading sits on the page ground rather than in a card, so sections read
 * as chapters and cards read as the material inside them.
 */
export function Section({
  id,
  title,
  lede,
  summary,
  children,
}: {
  /** Anchor and scroll target. Also what the rail tracks. */
  id: string;
  title: string;
  /** One line under the heading saying what the section is for. */
  lede?: string;
  /** The plain-language answer. The only thing shown in summary mode. */
  summary?: ReactNode;
  children?: ReactNode;
}) {
  const mode = useDepth();
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      // Anchor jumps have to clear whatever is pinned above the content.
      style={{ scrollMarginTop: "calc(var(--pinned-h, 0px) + 16px)" }}
      className="flex flex-col gap-[16px]"
    >
      <header className="flex flex-col gap-[6px] pt-[8px]">
        <h2
          id={`${id}-title`}
          className="font-display font-medium text-2xl tracking-heading text-ink"
        >
          {title}
        </h2>
        {lede && (
          <p className="font-body text-lg text-ink-muted max-w-[68ch]">
            {lede}
          </p>
        )}
      </header>
      {summary}
      {mode === "full" && children}
    </section>
  );
}
