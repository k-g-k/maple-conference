import { useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * A one line tooltip in the page's own style.
 *
 * For the small marks that would otherwise lean on the browser's `title`,
 * which arrives after about a second, paints in the operating system's style
 * and reads as something other than part of the page. Portalled, because a
 * card clips its contents and a tooltip has to be able to leave.
 *
 * It wraps whatever it labels rather than replacing it: the mark keeps its own
 * element, its own classes and its own behaviour, and the hint is drawn at the
 * pointer and follows it.
 */
export function Hint({
  text,
  className = "",
  style,
  ariaLabel,
  onEnter,
  onLeave,
  onClick,
  children,
}: {
  text: string;
  className?: string;
  /** Inline, for the one rule that has to beat whatever a block forces. */
  style?: CSSProperties;
  /** Where the mark carried the name for a screen reader as well. */
  ariaLabel?: string;
  /** The mark is a control as well as a label where it is given one. */
  onEnter?: () => void;
  onLeave?: () => void;
  /** Given one, the mark takes the press rather than whatever is under it. */
  onClick?: (e: MouseEvent) => void;
  children?: ReactNode;
}) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const hide = () => setAt(null);
  return (
    <span
      className={className}
      style={style}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={(e) => {
        onEnter?.();
        setAt({ x: e.clientX, y: e.clientY });
      }}
      onMouseMove={(e) => {
        if (!at) return;
        setAt({ x: e.clientX, y: e.clientY });
      }}
      onMouseLeave={() => {
        onLeave?.();
        hide();
      }}
    >
      {children}
      {at &&
        text &&
        createPortal(
          // Hung from the mark's left edge and running right, rather than
          // centered over it: a mark this small sits at the end of its row,
          // and a centered bubble put half its width back over the faces.
          <span
            // Moved on the compositor rather than through layout: a fixed
            // box re-laid-out under the pointer makes Chrome re-run its hit
            // test, and the cursor blinks back to the default for a frame.
            style={{
              transform: `translate3d(${at.x + 12}px, ${at.y - 10}px, 0) translateY(-100%)`,
            }}
            className="pointer-events-none cursor-pointer fixed left-0 top-0 z-[80] w-max max-w-[220px] animate-[tip-in_120ms_linear] motion-reduce:animate-none opacity-90 rounded-control bg-black/85 shadow-popover px-[7px] py-[3px] font-body text-2xs leading-[1.35] text-ink-inverse"
          >
            {text}
          </span>,
          document.body,
        )}
    </span>
  );
}
