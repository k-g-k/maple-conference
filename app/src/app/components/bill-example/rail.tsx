// The rail: one panel on the right edge, whatever is in it.
//
// Copied from the ballot page rather than shared, because the two prototypes
// are meant to be able to diverge. If they stop diverging, lift it.
//
// It started as the testimony drawer and kept being asked to hold other things,
// which is the usual sign that the drawer was never the point. So the panel is
// the mechanism and the content is a slot: a list of views, the first of which
// is the one the rail rests on.
//
// Two controls, and which one you get says what will happen:
//
//   +  a view's own primary action, on the default view only. Whatever the
//      panel rests on is the thing worth adding to.
//   »  minimize, on the default view only. The panel folds to its strip and
//      the page takes the width back.
//   ×  close, on every other view. The content goes and the default comes
//      back. The rail stays open, because you did not ask for it to close,
//      unless the page says otherwise with `onCloseView`: a page whose rail
//      rests on something a reader may not want back can have × put the whole
//      panel away instead.
//
// Its left edge drags, between the default width and whatever leaves a strip
// of page showing.
//
// That pairing means you can only minimize from the default view, which is
// what keeps the strip honest: whatever it says is what is behind it.
//
// Every view stays mounted. A feed keeps its filters and its scroll, and a
// half-written draft survives being closed, because nothing here is ever
// unmounted, only hidden.
//
// A page can also say the panel does not rest, with `strip={false}`. Then
// closing it leaves nothing on the edge to press and the page takes the whole
// width back, for a panel that is opened for one errand rather than lived in.

import type { ReactNode } from "react";
import { ChevronsLeft, ChevronsRight, Plus, X } from "lucide-react";

export interface RailView {
  id: string;
  /** Shown in the panel's header, and on the strip for the default view. */
  title: string;
  /**
   * Sits immediately right of the title, for something that qualifies the view
   * itself.
   */
  action?: ReactNode;
  /** The panel's surface, for a view that wants white rather than the ground. */
  surface?: string;
  content: ReactNode;
}

export function Rail({
  views,
  view,
  onViewChange,
  onCloseView,
  open,
  onOpenChange,
  strip = true,
  count,
  onAdd,
  addLabel = "Add",
  onResize,
  onResizeEnd,
}: {
  /** In order. The first is the default: the view the rail rests on. */
  views: RailView[];
  /** Which view is showing. */
  view: string;
  onViewChange: (id: string) => void;
  /**
   * What × does, where returning to the default view is not what the page
   * wants. Given one, the panel hands the press over and changes nothing
   * itself.
   */
  onCloseView?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Whether the panel rests as a strip down the edge once it is closed.
   *
   * True by default, which is the panel described above. A page that keeps the
   * panel for one errand, and has the material it would rest on somewhere
   * else, passes false: closed then means gone.
   */
  strip?: boolean;
  /** A number worth carrying on the strip, e.g. how many entries are in view. */
  count?: number;
  /**
   * The default view's primary action, offered beside the panel's own
   * controls. Only there: a view you are passing through has its own footer,
   * and two ways to do one thing on one surface is one too many.
   */
  onAdd?: () => void;
  addLabel?: string;
  /**
   * Called while the panel's left edge is dragged, with the width the pointer
   * is asking for, and with null when the drag ends or is reset.
   *
   * The page decides what to do with it. That keeps the rail ignorant of the
   * tokens it is sized by: it knows where the pointer is, nothing else.
   */
  onResize?: (width: number | null) => void;
  /**
   * The drag is over. Separate from `onResize` because "here is a width" and
   * "stop treating this as a drag" are different messages, and the page needs
   * the second one to put its transitions back.
   */
  onResizeEnd?: () => void;
}) {
  const fallback = views[0];
  const current = views.find((v) => v.id === view) ?? fallback;
  const isDefault = current.id === fallback.id;

  return (
    <>
      {/* The panel. Below a modal's layer on purpose: the modal is the same
          content on a surface that has taken over, so the panel belongs behind
          its scrim like everything else. It sits clear of the floating buttons
          by position rather than by stacking, since they are offset by whatever
          the rail is taking. */}
      <aside
        aria-label={current.title}
        aria-hidden={!open}
        // Clipped while it is closed, and only then. The panel is narrower
        // shut than open, and `translate-x-full` moves it by its own width, so
        // anything inside that is wider than the closed box was left standing
        // at the edge of the screen: a button, most visibly. Open, the
        // overflow has to stay visible, because notes and menus inside the
        // panel rise out of it.
        className={`hidden lg:flex fixed right-0 top-[calc(var(--nav-h)+1px)] bottom-0 z-40 w-[var(--rail-w)] flex-col ${current.surface ?? "bg-ground"} border-l border-line transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "translate-x-0" : "translate-x-full overflow-hidden"
        }`}
      >
        {/* The left edge, draggable. Bare for now: no handle, no cursor, no
            hover state, so the mechanism can be judged before it is dressed.

            Pointer capture rather than window listeners, so the drag survives
            the pointer leaving the 6px strip, which it does immediately. The
            page is told the width and decides what to do with it. */}
        {onResize && (
          <div
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              e.preventDefault();
              onResize(window.innerWidth - e.clientX);
            }}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
              onResize(window.innerWidth - e.clientX);
            }}
            onPointerUp={(e) => {
              e.currentTarget.releasePointerCapture(e.pointerId);
              onResizeEnd?.();
            }}
            onPointerCancel={(e) => {
              e.currentTarget.releasePointerCapture(e.pointerId);
              onResizeEnd?.();
            }}
            className="absolute left-0 top-0 bottom-0 w-[6px] -ml-[3px] z-10 cursor-col-resize"
          />
        )}

        <div className="flex-1 min-h-0 flex flex-col w-full [--rail-pad:18px]">
          <header className="shrink-0 flex items-center gap-[12px] px-[var(--rail-pad)] pt-[24px] pb-[4px]">
            {/* Nunito has a smaller x-height than the Lexend this replaced,
                so the same size read smaller. A step up puts it back. */}
            <p className="font-body font-bold text-xl text-ink">
              {current.title}
            </p>
            {current.action}
            {/* Pushes the panel's own control to the far edge and leaves the
              space before it free. */}
            <div className="ml-auto flex items-center gap-[10px]">
              {isDefault && onAdd && (
                <button
                  onClick={onAdd}
                  aria-label={addLabel}
                  title={addLabel}
                  className="shrink-0 p-[6px] rounded-control text-ink-muted hover:text-ink hover:bg-wash cursor-pointer transition-colors"
                >
                  <Plus className="w-[18px] h-[18px]" />
                </button>
              )}
              {isDefault ? (
                <button
                  onClick={() => onOpenChange(false)}
                  aria-label={`Collapse ${current.title}`}
                  title="Collapse"
                  className="shrink-0 -mr-[6px] p-[6px] rounded-control text-ink-muted hover:text-ink hover:bg-wash cursor-pointer transition-colors"
                >
                  <ChevronsRight className="w-[18px] h-[18px]" />
                </button>
              ) : (
                <button
                  onClick={() =>
                    onCloseView ? onCloseView() : onViewChange(fallback.id)
                  }
                  aria-label={`Close ${current.title}`}
                  title="Close"
                  className="shrink-0 -mr-[6px] p-[6px] rounded-control text-ink-muted hover:text-ink hover:bg-wash cursor-pointer transition-colors"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              )}
            </div>
          </header>

          {/* All of them, one visible. `hidden` rather than a conditional render,
            so a view keeps its scroll, its filters, and anything typed into it
            while another view is in front. */}
          {views.map((v) => (
            <div
              key={v.id}
              hidden={v.id !== current.id}
              className="flex-1 min-h-0 flex flex-col"
            >
              {v.content}
            </div>
          ))}
        </div>
      </aside>

      {/* The panel folded to its edge, for a page that rests it there. It never
          moves and never resizes: it sits a layer below the panel, and the
          panel slides over it, so opening covers it and closing uncovers it.
          Sliding both at once put two things crossing in the same strip of
          screen, which read as a scramble.

          It always names the default view, because minimize is only offered
          there, so that is always what is behind it. */}
      {strip && (
        <button
          onClick={() => onOpenChange(true)}
          aria-label={`Show ${fallback.title}${
            count === undefined ? "" : `, ${count} matching`
          }`}
          title={`Show ${fallback.title}`}
          aria-hidden={open}
          tabIndex={open ? -1 : 0}
          className="hidden lg:flex fixed right-0 top-[calc(var(--nav-h)+1px)] bottom-0 z-30 w-[var(--rail-tab-w)] flex-col items-center gap-[14px] pt-[13px] bg-ground border-l border-line text-ink-muted hover:text-ink hover:bg-wash cursor-pointer transition-colors"
        >
          <ChevronsLeft className="shrink-0 w-[18px] h-[18px]" />
          <span className="font-body font-semibold text-sm tracking-[0.02em] text-ink [writing-mode:vertical-rl]">
            {fallback.title}
          </span>
          {count !== undefined && (
            <span className="font-body font-semibold text-xs text-ink-muted [writing-mode:vertical-rl]">
              {count}
            </span>
          )}
        </button>
      )}
    </>
  );
}
