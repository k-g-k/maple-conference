// Public surface of the reusable ballot-question library.
//
// Layering: primitives (generic UI) → sections (typed, data-driven blocks).
// Both depend only on ./types, ./helpers, and ./sources-context — never on any
// one question's data. A page supplies its source registry via <SourcesProvider>
// and its content via the section props.

export * from "./types";
export * from "./helpers";
export * from "./hold-place";
export { SourcesProvider, useSources } from "./sources-context";
export * from "./primitives";
export * from "./sections";
