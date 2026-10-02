// The two things an overlay needs to know to become a full-screen sheet on a
// narrow window.
//
// Here rather than in either of the two overlays that use them, because a modal
// and the page's side panel both have the same problem below their own
// breakpoints and were about to grow the same two effects. The breakpoint is not
// shared: each overlay names its own, because what is too narrow for a modal and
// what is too narrow for a column beside the page are different widths.

import { useEffect, useState } from "react";

/**
 * Whether a media query currently matches.
 *
 * In state rather than in a class, for the cases where matching has to change
 * what is rendered rather than how it is painted: an overlay that becomes a sheet
 * portals somewhere else, drops controls that mean nothing there, and sizes
 * itself from script.
 */
export function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    // Once here as well: the query can have changed between the first render
    // and this running.
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/**
 * The part of the screen actually in view, while `active`.
 *
 * A fixed element keeps its full height when the on-screen keyboard opens, and
 * iOS then slides the keyboard over the bottom of it, which is where a form's
 * buttons are. visualViewport is the only thing that reports the box that is
 * left, so a sheet sized to it shortens above the keyboard and keeps its footer
 * where a thumb can reach. Both of its events matter, resize for the keyboard
 * arriving and going, scroll for the page being panned under it while it is up.
 *
 * Null where there is nothing to correct for, either because the sheet is not on
 * screen or because the browser does not report this, and then the caller should
 * fall back to the viewport's own edges.
 */
export function useVisibleBox(active: boolean) {
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) {
      setBox(null);
      return;
    }
    const update = () => setBox({ top: vv.offsetTop, height: vv.height });
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);
  return box;
}
