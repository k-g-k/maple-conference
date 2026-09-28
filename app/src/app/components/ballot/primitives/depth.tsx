import { createContext, useContext, type ReactNode } from "react";

/** How much of each section is showing. */
export type DepthMode = "full" | "summary";

const DepthContext = createContext<DepthMode>("full");

/**
 * Controlled on purpose: the page owns the mode, so it can later come from the
 * URL without the library learning about routing.
 */
export function DepthProvider({
  mode,
  children,
}: {
  mode: DepthMode;
  children: ReactNode;
}) {
  return (
    <DepthContext.Provider value={mode}>{children}</DepthContext.Provider>
  );
}

export function useDepth(): DepthMode {
  return useContext(DepthContext);
}
