// Every joint committee, grouped by subject. Who sits on each is on the
// committee's own page.

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import {
  JOINT_COMMITTEES,
  TOPICS,
  type JointCommittee,
} from "../../data/joint-committees/committees";
import { hearingsHeld } from "../../data/joint-committees/hearings";
import { SiteNav } from "../site-nav";

/**
 * One of the tile's counts. A count not pulled yet is held open, so adding it
 * later changes nothing around it, and is a bar rather than a zero, which would
 * read as a count.
 */
function Stat({ label, count }: { label: string; count?: number }) {
  return (
    <span
      aria-hidden={count === undefined}
      className="flex items-center gap-[8px]"
    >
      <span className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid">
        {label}
      </span>
      {count === undefined ? (
        <span className="block w-[24px] h-[10px] rounded-chip bg-sunken" />
      ) : (
        <span className="font-body font-semibold text-sm text-ink tabular-nums">
          {count}
        </span>
      )}
    </span>
  );
}

function Tile({ c }: { c: JointCommittee }) {
  return (
    <li>
      {/* Full height and a column, so every footer in a row of tiles sits on
          the same line however many lines the name above it takes. */}
      <Link
        to={`/jointCommittees/${c.slug}`}
        className="h-full flex flex-col bg-surface border border-line rounded-card"
      >
        <div className="px-[18px] sm:px-[20px] pt-[16px] pb-[18px]">
          {/* Initiative Petitions sits with its subject rather than in a
              section of its own, so the tile says what the legislature's
              heading for it said. */}
          {c.special && (
            <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid mb-[4px]">
              Special Joint Committee
            </p>
          )}
          <div className="flex items-start justify-between gap-[12px]">
            <h3 className="font-display font-medium text-lg text-ink leading-[1.25]">
              {c.name}
            </h3>
            <ChevronRight
              aria-hidden
              className="shrink-0 mt-[3px] w-[16px] h-[16px] text-line-strong"
            />
          </div>
        </div>
        <div className="mt-auto border-t border-line-ghost px-[18px] sm:px-[20px] py-[12px] flex flex-wrap gap-x-[24px] gap-y-[8px]">
          <Stat label="Bills" />
          <Stat label="Hearings" count={hearingsHeld(c.code)} />
        </div>
      </Link>
    </li>
  );
}

/**
 * Tiles that wrap, two across at full width and one on a phone. The 484 is
 * left from when each tile held its two chambers side by side.
 */
function Tiles({ committees }: { committees: JointCommittee[] }) {
  return (
    <ul className="grid gap-[16px] grid-cols-[repeat(auto-fill,minmax(min(100%,484px),1fr))]">
      {committees.map((c) => (
        <Tile key={c.code} c={c} />
      ))}
    </ul>
  );
}

export function JointCommittees() {
  return (
    <div className="bg-ground min-h-screen font-body text-ink">
      <SiteNav inner="w-full px-[20px] sm:px-[32px]" />
      <main className="mx-auto max-w-[1180px] px-[20px] sm:px-[32px] pt-[20px] pb-[64px]">
        {/* The conference index's hero, at the same face, weight and step. */}
        <div className="@container">
          <h1 className="font-display font-bold text-[29.7px] @[800px]:text-[36px] leading-[1.2] text-[#0f2275] text-balance">
            Joint Committees
          </h1>
        </div>

        {/* Alphabetical within a subject. */}
        {TOPICS.map((topic) => (
          <section key={topic} className="mt-[32px]">
            <h2 className="font-display font-medium text-xl text-ink mb-[12px]">
              {topic}
            </h2>
            <Tiles
              committees={JOINT_COMMITTEES.filter(
                (c) => c.topic === topic,
              ).sort((a, b) => a.name.localeCompare(b.name))}
            />
          </section>
        ))}
      </main>
    </div>
  );
}
