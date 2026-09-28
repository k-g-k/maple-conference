// Supplies a ballot question's source registry to the citation components
// (Cite, SourceNote, SynthSourcesNote, AISynthSources, RefGroup, CitationBlock)
// so they can resolve source ids without each closing over a module-level
// SOURCES. A page wraps its content once in <SourcesProvider value={SOURCES}>;
// components read the registry via useSources().

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { Sources } from "./types";

const SourcesContext = createContext<Sources>({});

export function SourcesProvider({
  value,
  children,
}: {
  value: Sources;
  children: ReactNode;
}) {
  return (
    <SourcesContext.Provider value={value}>{children}</SourcesContext.Provider>
  );
}

export function useSources(): Sources {
  return useContext(SourcesContext);
}
