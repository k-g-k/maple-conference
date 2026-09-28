import { useEffect, useState, type ReactNode } from "react";

// Below `width`, the page stops reflowing and scales down to fit the window
// instead, the way a phone shows a desktop site zoomed out. At or above it
// nothing is applied and the layout is untouched.
//
// This is the desktop half of the scaling; phones do not reach it. index.html
// pins their layout viewport to this same width and scales it natively, so
// clientWidth already reports the floor and no style is applied here. Native
// scaling is used there because it is the browser's own zoom rather than a
// property the page has to fight for.
//
// The text-size-adjust below is load-bearing either way. iOS inflates text in a
// scaled or wide layout while leaving icons and fixed-width boxes at their
// scaled size, so the page comes apart: oversized words in correctly-shrunk
// boxes. Tailwind's preflight sets -webkit-text-size-adjust: 100% and iOS
// boosts through it; none is the value that holds. globals.css sets it on html
// for the native path, and this sets it again for anything landing here.
//
// Scales with CSS zoom rather than a transform. Zoom reflows, so the page keeps
// its true height and sticky children go on pinning normally; a transform would
// leave the page reporting its full unscaled height and would turn every
// fixed-position descendant into a child of the scaled box.
//
// One thing to know when adding breakpoints under this floor: media queries
// read the real viewport, not the 875px the content is laid out in. So a 390px
// phone still resolves the narrow variants, and what they produce is then
// scaled. Variants above the floor stay consistent because everything from 0 to
// 875 resolves the same set; a new variant *below* 875 would fire while the
// content is still being laid out at 875px wide.
export function ScaleFloor({
  width,
  children,
}: {
  width: number;
  children: ReactNode;
}) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // clientWidth rather than innerWidth so a desktop scrollbar is excluded and
    // scaling to fit does not itself provoke a horizontal scrollbar.
    const measure = () => {
      const w = document.documentElement.clientWidth;
      setScale(w < width ? w / width : 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [width]);

  // The wrapper is always rendered, even at scale 1, so crossing the floor
  // changes a style rather than the shape of the tree — otherwise React would
  // remount everything below and drop the active tab.
  return (
    <div
      style={
        scale === 1
          ? undefined
          : { zoom: scale, width, WebkitTextSizeAdjust: "none" }
      }
    >
      {children}
    </div>
  );
}
