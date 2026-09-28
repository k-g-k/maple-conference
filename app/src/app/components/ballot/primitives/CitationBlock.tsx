import type { ReactNode } from "react";
import { KIND_DOT, type SrcKind } from "../types";

// A colored left-bar block whose bar color encodes provenance:
//   official = blue · outside = green · ai = purple · user = orange.
// Unifies the hand-inlined "border-l-[3px] border-<color>" blocks used across
// the page. Renders an optional bold title, then children (body + whatever
// source note the caller supplies — SourceNote / SynthSourcesNote).
export function CitationBlock({
  kind,
  title,
  children,
}: {
  kind: SrcKind;
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="border-l-[3px] pl-[14px]"
      style={{ borderColor: KIND_DOT[kind] }}
    >
      {title && (
        <p className="font-body font-semibold text-base text-ink leading-[1.5]">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
