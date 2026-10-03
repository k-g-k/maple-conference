import { useEffect } from "react";

/**
 * Lay this page out at the device's real width.
 *
 * index.html pins the layout viewport to 875px and scales it to fit, which is
 * how the fixed-width prototypes are read on a phone: zoomed out rather than
 * reflowed. A page that does its own responsive work opts out through this,
 * and then two things change. It is drawn at 1:1 instead of shrunk, and the
 * breakpoints resolve against the real width, so `md:` is false on a phone and
 * the committee list is the title picker rather than the rail, which at 875px
 * was resolving true and handing a phone the sidebar.
 *
 * Reverted on unmount, so the prototypes that still want the scaled layout get
 * it back when a reader navigates away.
 */
export function useDeviceViewport() {
  useEffect(() => {
    const el = document.documentElement;
    const fit = (window as { __mapleFitViewport?: () => void })
      .__mapleFitViewport;
    el.dataset.viewport = "device";
    fit?.();
    return () => {
      delete el.dataset.viewport;
      fit?.();
    };
  }, []);
}
