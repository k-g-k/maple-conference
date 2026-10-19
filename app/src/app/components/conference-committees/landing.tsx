// The conference committee landing page.
//
// The explorer used to be this page, and the feedback was that as a first page
// it did too much. Now the address is the first committee's page, opened at
// the top: on the hero every committee page shares, which says what a
// conference committee is, with Phone-Free Schools under it. Every other
// committee address opens on its committee instead, with the same hero above
// to scroll back up to. The hero itself is `conference-committee/hero.tsx`.

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Star } from "lucide-react";
import {
  NOT_LINKED,
  displayName,
  recordForSlug,
} from "../../data/conference-committees";
import {
  COMMITTEES,
  type CommitteeDetail,
} from "../../data/conference-committees/committees";
import { ROSTER } from "../../data/conference-committees/roster";
import { MINE, MINE_FULL } from "../../data/bill-lineage/members";
import { ConferenceCommittee } from "../conference-committee";

// ── Parked ──────────────────────────────────────────────────────────────
//
// The twelve as tiles and as a list, from when the landing ended on its own
// list of committees rather than on the first one. Not drawn: the committee
// page's own list down the left does that job now. Kept, rather than deleted,
// until the single page has been looked at.

/** What each committee shows, the same in either layout. */
function facts(c: CommitteeDetail) {
  const rec = recordForSlug(c.slug);
  return {
    name: displayName(c.slug, c.short),
    // From the scorecard record rather than the committee's own, as the
    // explorer's list had it: the committee data is missing both numbers for
    // economic development.
    bills: [rec?.senate, rec?.house].filter(Boolean).join(" · "),
    // The reader's own legislators, as the only members this page names.
    mine: ROSTER.filter(
      (p) => MINE[p.seat] && p.on.some((x) => x.slug === c.slug),
    ),
    off: NOT_LINKED.has(c.slug),
  };
}

/** "Your Senator", with the star their face wears everywhere else. */
function Mine({ seat }: { seat: string }) {
  return (
    <span className="shrink-0 inline-flex items-center gap-[4px] font-body text-xs text-ink-mid">
      <Star
        aria-hidden
        className="w-[12px] h-[12px] text-caution fill-caution"
      />
      {MINE_FULL[seat]}
    </span>
  );
}

/**
 * A committee the lists show but do not open is not a link at all rather than
 * a disabled one, as on the explorer: nothing to press, so nothing a keyboard
 * stops on.
 */
function Door({
  c,
  off,
  className,
  children,
}: {
  c: CommitteeDetail;
  off: boolean;
  className: string;
  children: ReactNode;
}) {
  return off ? (
    <div aria-disabled className={`${className} bg-wash cursor-default`}>
      {children}
    </div>
  ) : (
    <Link to={`/conferenceCommittees/${c.slug}`} className={className}>
      {children}
    </Link>
  );
}

function Tile({ c }: { c: CommitteeDetail }) {
  const { name, bills, mine, off } = facts(c);
  return (
    <li>
      {/* Full height and a column, so every footer in a row of tiles sits on
          the same line however long the line above it runs. */}
      <Door
        c={c}
        off={off}
        className="h-full flex flex-col bg-surface border border-line rounded-card"
      >
        <div className="px-[18px] sm:px-[20px] pt-[16px] pb-[18px]">
          <div className="flex items-start justify-between gap-[12px]">
            <h3 className="font-display font-medium text-lg text-ink leading-[1.25]">
              {name}
            </h3>
            <ChevronRight
              aria-hidden
              className="shrink-0 mt-[3px] w-[16px] h-[16px] text-line-strong"
            />
          </div>
          <p className="mt-[6px] font-body text-sm text-ink-mid leading-[1.45]">
            {c.title}
          </p>
        </div>
        <div className="mt-auto border-t border-line-ghost px-[18px] sm:px-[20px] py-[12px] flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[6px]">
          <span className="font-body text-xs text-ink-faint">{bills}</span>
          {mine.length > 0 && (
            <span className="flex flex-wrap gap-x-[12px] gap-y-[4px]">
              {mine.map((p) => (
                <Mine key={p.seat} seat={p.seat} />
              ))}
            </span>
          )}
        </div>
      </Door>
    </li>
  );
}

/** Three across at full width, fewer as the page narrows, one on a phone. */
function Tiles() {
  return (
    <ul className="grid gap-[16px] grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))]">
      {COMMITTEES.map((c) => (
        <Tile key={c.slug} c={c} />
      ))}
    </ul>
  );
}

/**
 * One card of twelve rows, as the explorer's list was before it was parked:
 * hairlines between rows of equal weight rather than twelve separate boxes.
 * Clipped, so a hovered first or last row keeps the corner.
 */
function Rows() {
  return (
    <div className="@container">
      <ul className="bg-surface border border-line rounded-card overflow-hidden">
        {COMMITTEES.map((c, i) => {
          const { name, bills, mine, off } = facts(c);
          return (
            <li key={c.slug} className={i > 0 ? "border-t border-line-ghost" : ""}>
              <Door
                c={c}
                off={off}
                className="group flex items-center gap-[12px] px-[18px] py-[13px] transition-colors hover:bg-wash"
              >
                <span className="min-w-0 flex-1 flex flex-col gap-[2px] @[760px]:flex-row @[760px]:items-baseline @[760px]:gap-[16px]">
                  {/* A fixed column at full width, so the twelve lines
                      beside the names start at one edge. */}
                  <span className="font-display font-medium text-lg text-ink leading-[1.3] @[760px]:shrink-0 @[760px]:w-[240px]">
                    {name}
                  </span>
                  <span className="min-w-0 font-body text-sm text-ink-mid leading-[1.45] @[760px]:truncate">
                    {c.title}
                  </span>
                  <span className="font-body text-xs text-ink-faint @[760px]:hidden">
                    {bills}
                  </span>
                </span>
                <span className="hidden @[760px]:block shrink-0 font-body text-xs text-ink-faint">
                  {bills}
                </span>
                {mine.length > 0 && (
                  <span className="hidden @[520px]:flex shrink-0 gap-[12px]">
                    {mine.map((p) => (
                      <Mine key={p.seat} seat={p.seat} />
                    ))}
                  </span>
                )}
                <ChevronRight
                  aria-hidden
                  className="shrink-0 w-[16px] h-[16px] text-line-strong group-hover:text-ink-mid"
                />
              </Door>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ConferenceCommittees() {
  // The first of the twelve in the list down the left, which is Phone-Free
  // Schools: the committee every other way into this prototype opens on. The
  // one address that opens on the hero rather than on the committee.
  return <ConferenceCommittee slug={COMMITTEES[0].slug} openOnHero />;
}
