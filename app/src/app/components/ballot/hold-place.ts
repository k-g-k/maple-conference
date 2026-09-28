// Keeping the reader's place across a layout change.
//
// Anything that fans out adds height, and height added above where you are
// reading pushes the page down under you. The browser has its own scroll
// anchoring for this, but it gives up in exactly the cases that matter here: a
// change driven by a width transition rather than by content arriving, a
// scroller that script has just touched, or a sticky element in the way.
//
// So the page anchors itself, and the rule is the simplest one that covers
// every case: whatever you pressed does not move. Everything else arranges
// itself around that, which means content above the press is what gives way,
// not the thing you were looking at.

/**
 * Run `change`, then scroll so that `anchor` sits where it did before.
 *
 * `ms` keeps the correction running for a transition's worth of frames, for a
 * change that arrives over time rather than in one layout pass. Left at 0 it
 * corrects once, on the frame after the change.
 */
export function holdPlace(
  anchor: Element | null,
  change: () => void,
  ms = 0,
): void {
  const before = anchor?.getBoundingClientRect().top;
  change();
  if (!anchor || before === undefined) return;
  const started = performance.now();
  const step = () => {
    const now = anchor.getBoundingClientRect().top;
    // Rounded, so a sub-pixel difference cannot keep this scrolling for ever.
    if (Math.round(now) !== Math.round(before))
      window.scrollBy(0, now - before);
    if (performance.now() - started < ms) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * The same thing, for a click handler: the control you pressed stays put.
 *
 * Pass the event. The button is the anchor, which is what a reader is looking
 * at when they press it.
 */
export function holdPress(
  e: { currentTarget: Element },
  change: () => void,
  ms = 0,
): void {
  holdPlace(e.currentTarget, change, ms);
}
