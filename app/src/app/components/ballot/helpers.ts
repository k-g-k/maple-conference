// Pure, question-agnostic helpers used by the ballot section components.
// (Data selectors that read a specific question's testimony/users live with
// that question's data module, not here.)

import type { Source } from "./types";

// A shortened display name for a source: strips a trailing " — …" clause or a
// trailing parenthetical for outside sources; otherwise drops a trailing
// parenthetical. Used in AI-synthesis source lines.
export function shortSourceName(s: Source): string {
  if (s.kind === "outside") {
    const beforeDash = s.label.split(" — ")[0];
    if (beforeDash !== s.label) return beforeDash;
    const paren = s.label.match(/\(([^)]+)\)\s*$/);
    if (paren) return paren[1];
    return s.label;
  }
  return s.label.replace(/\s*\([^)]*\)\s*$/, "");
}

// Fisher-Yates shuffle, returning a new array.
export function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Numbered-pagination window: ‹ 1 2 3 … n › with ellipses for long ranges.
// Returns zero-based page indices interleaved with "…" gap markers.
export function pageWindow(current: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i);
  const around = [current - 1, current, current + 1].filter(
    (p) => p > 0 && p < count - 1,
  );
  const items: (number | "…")[] = [0];
  if (around[0] > 1) items.push("…");
  items.push(...around);
  if (around[around.length - 1] < count - 2) items.push("…");
  items.push(count - 1);
  return items;
}
