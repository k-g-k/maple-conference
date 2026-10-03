import { useEffect, useState } from "react";

/**
 * Whether the window is phone width, as a live value.
 *
 * Not `innerWidth` read once at mount: these pages ask the browser for the
 * device's real width in an effect, so the first render still sees the 875px
 * layout viewport the prototypes are otherwise drawn at. Anything deciding its
 * shape from the width has to hear about the correction, which a media query
 * listener does and a one-off read does not.
 */
export function useNarrow(query = "(max-width: 767px)") {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const read = () => setNarrow(mq.matches);
    read();
    mq.addEventListener("change", read);
    // The viewport swap lands after this mounts, and on iOS it does not always
    // fire the query; a resize follows it either way.
    window.addEventListener("resize", read);
    return () => {
      mq.removeEventListener("change", read);
      window.removeEventListener("resize", read);
    };
  }, [query]);
  return narrow;
}
