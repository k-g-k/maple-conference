// MAPLE's subject tags for a conference, as a row of chips.
//
// The same pill the bill page gives these tags, to the pixel: both are a quiet
// fact about the bill sitting under its byline. Deliberately not the filled,
// coloured chip these pages use for a position, which says what somebody asked
// for rather than what the thing is about.

import {
  BILL_KIND_LABEL,
  COMMITTEE_TOPICS,
  billKind,
} from "../../data/conference-committees";

/** One pill, the shape the bill page gives a subject tag. */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block font-body text-xs text-ink-mid bg-surface border border-line rounded-pill px-[11px] py-[4px]">
      {children}
    </span>
  );
}

export function CommitteeTopics({
  slug,
  className = "",
}: {
  slug: string;
  /** For a caller that needs the row to sit differently in its own layout. */
  className?: string;
}) {
  // Ours first, then MAPLE's. The kind of bill is the fact that changes what a
  // reader should expect the rest of the page to hold, so it leads; the
  // subjects say what it is about, which the committee's own name already
  // half-answers.
  //
  // Two conferences have no tags at all and show the kind alone.
  const topics = COMMITTEE_TOPICS[slug] ?? [];
  return (
    <ul className={`flex flex-wrap gap-[7px] ${className}`}>
      <li>
        <Chip>{BILL_KIND_LABEL[billKind(slug)]}</Chip>
      </li>
      {topics.map((t) => (
        <li key={t}>
          <Chip>{t}</Chip>
        </li>
      ))}
    </ul>
  );
}
