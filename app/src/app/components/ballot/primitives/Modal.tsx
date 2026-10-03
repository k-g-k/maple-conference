import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { useMatchMedia, useVisibleBox } from "./sheet";

// The overlay panel every modal on the page is built from. Gray ground with
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
//
// Below SHEET_BELOW the panel is a full-screen sheet instead: no scrim showing
// around it, square corners, and the two columns stacked, body then aside, or
// aside then body with `asideFirst`. `maxWidth`, `minHeight` and `mainMinWidth`
// all stop applying there, because a window that narrow has no room to honour
// any of them and a body held to its floor would simply run off the side.
//
// The sheet is sized to the part of the screen in view rather than to the
// viewport, so when the on-screen keyboard opens the panel shortens above it and
// the sticky footer stays reachable.
const PAD = 20;

/**
 * Where the modal gives up being a panel on a scrim and becomes a sheet.
 *
 * The widest thing here asks for 760px of panel and 32px of scrim on each side,
 * so below about 950 the scrim is decoration around a panel that has already run
 * out of room.
 */
const SHEET_BELOW = "(max-width: 949.98px)";

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
  const sheet = useMatchMedia(SHEET_BELOW);
  const box = useVisibleBox(sheet);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const body = document.body;
    const was = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    const y = window.scrollY;
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = was.overflow;
      body.style.position = was.position;
      body.style.top = was.top;
      body.style.width = was.width;
      window.scrollTo(0, y);
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
      // Above the page's own side panel, which becomes a sheet at a narrower
      // window than this: a modal opened from inside that sheet is the surface
      // that has taken over, so it has to be the one on top.
      style={
        box ? { top: box.top, height: box.height, bottom: "auto" } : undefined
      }
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-[3px] min-[950px]:p-[32px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        // The width cap and the height floor apply from 950px up only. Below
        // that the panel is a sheet filling the screen that is in view, which the
        // keyboard can make shorter than any floor.
        style={
          {
            "--panel-max": maxWidth,
            ...(minHeight ? { "--panel-min": minHeight } : {}),
          } as CSSProperties
        }
        className={`relative flex w-full h-full max-h-full min-[950px]:h-auto flex-col overflow-y-auto bg-ground min-[950px]:max-w-[var(--panel-max)] ${
          minHeight ? "min-[950px]:min-h-[var(--panel-min)]" : ""
        } min-[950px]:rounded-panel shadow-[0_20px_60px_rgba(0,0,0,0.28)]`}
      >
        <div
          ref={headerRef}
          style={{ padding: `${PAD}px ${PAD}px 12px` }}
          className="sticky top-0 z-20 flex items-center gap-[12px] bg-ground min-[950px]:rounded-t-panel"
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

        {/* Side by side from 950px up, stacked below it: the body first, or the
            aside first where the page asked for that, which is the order the
            columns already read in. */}
        <div
          style={{ padding: `0 ${PAD}px ${footer ? 0 : PAD}px` }}
          className={`flex flex-1 items-stretch gap-[16px] ${
            asideFirst
              ? "flex-col-reverse min-[950px]:flex-row-reverse"
              : "flex-col min-[950px]:flex-row"
          }`}
        >
          <div
            style={
              mainMinWidth
                ? ({ "--main-min": mainMinWidth } as CSSProperties)
                : undefined
            }
            className={`flex-1 min-w-0 ${
              mainMinWidth ? "min-[950px]:min-w-[var(--main-min)]" : ""
            }`}
          >
            {children}
          </div>
          {aside && (
            <div
              style={asidePinned ? { top: headerH } : undefined}
              className={`w-full min-[950px]:w-[200px] shrink-0 self-start ${
                asidePinned ? "min-[950px]:sticky" : ""
              }`}
            >
              {aside}
            </div>
          )}
        </div>

        {footer && (
          <div
            style={{ padding: `12px ${PAD}px ${PAD}px` }}
            className="sticky bottom-0 z-20 mt-auto bg-ground min-[950px]:rounded-b-panel"
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
