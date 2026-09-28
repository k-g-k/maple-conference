import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// The overlay panel every modal on the page is built from. Grey ground with
// white cards on it, the same relationship the page itself uses, so a modal
// reads as a small page rather than a floating card.
//
// Slots, all optional except `children`:
//
//   title          the left of the header row
//   headerActions  buttons at the far right of that row; close is always last
//   children       the body, and the part that scrolls. It stretches to the
//                  panel's full height, so a short body still fills the modal
//   aside          a narrower second column beside the body, right by default
//   footer         a bar at the foot of the panel
//
// The whole panel scrolls as one, with the header and footer sticky inside it,
// so body content passes underneath them rather than stopping short. Both bleed
// to the panel edges and carry the panel's own background, which is what hides
// the content moving under them. With no footer the body simply ends at the
// panel's padding.
//
// `asidePinned` (default) makes the aside sticky under the header, so actions
// stay put while a long body scrolls beside them.
const PAD = 20;

export function Modal({
  onClose,
  title,
  headerActions,
  aside,
  asidePinned = true,
  asideFirst = false,
  footer,
  maxWidth = "760px",
  minHeight,
  mainMinWidth,
  children,
}: {
  onClose: () => void;
  title?: ReactNode;
  headerActions?: ReactNode;
  aside?: ReactNode;
  asidePinned?: boolean;
  /**
   * Put the aside on the left. It stays second in the DOM either way, so the
   * body is still what a screen reader and the tab order reach first.
   */
  asideFirst?: boolean;
  footer?: ReactNode;
  maxWidth?: string;
  /** Floor for the panel, so a short body still gets a substantial modal. */
  minHeight?: string;
  /** Floor for the body column. Widen `maxWidth` to match, or the aside gets
   *  squeezed to make room for it. */
  mainMinWidth?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // The aside pins directly beneath the header, so it has to know how tall the
  // header actually is rather than assuming.
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerH, setHeaderH] = useState(0);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeaderH(el.offsetHeight));
    observer.observe(el);
    setHeaderH(el.offsetHeight);
    return () => observer.disconnect();
  }, []);

  // Rendered into the body rather than in place. `position: fixed` is measured
  // against the nearest ancestor with a transform, filter, or containment, not
  // against the viewport, so a modal opened from inside the testimony rail
  // (which slides on a transform) was laying itself out inside that panel. A
  // portal puts it where it has always meant to be.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[3px] p-[32px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth, minHeight }}
        className="relative flex w-full max-h-full flex-col overflow-y-auto bg-ground rounded-panel shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
      >
        <div
          ref={headerRef}
          style={{ padding: `${PAD}px ${PAD}px 12px` }}
          className="sticky top-0 z-20 flex items-center gap-[12px] bg-ground rounded-t-panel"
        >
          <div className="flex-1 min-w-0">{title}</div>
          <div className="shrink-0 flex items-center gap-[18px]">
            {headerActions}
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-[19px] h-[19px]" />
            </button>
          </div>
        </div>

        <div
          style={{ padding: `0 ${PAD}px ${footer ? 0 : PAD}px` }}
          className={`flex flex-1 items-stretch gap-[16px] ${
            asideFirst ? "flex-row-reverse" : ""
          }`}
        >
          <div
            style={{ minWidth: mainMinWidth }}
            className={mainMinWidth ? "flex-1" : "flex-1 min-w-0"}
          >
            {children}
          </div>
          {aside && (
            <div
              style={asidePinned ? { top: headerH } : undefined}
              className={`w-[200px] shrink-0 self-start ${asidePinned ? "sticky" : ""}`}
            >
              {aside}
            </div>
          )}
        </div>

        {footer && (
          <div
            style={{ padding: `12px ${PAD}px ${PAD}px` }}
            className="sticky bottom-0 z-20 mt-auto bg-ground rounded-b-panel"
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
