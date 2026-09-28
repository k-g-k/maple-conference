// The conference committee index: what a conference is, and the twelve sitting
// now.
//
// A door rather than a briefing. Each committee has a page of its own, so the
// only jobs here are saying what a conference does and letting a reader pick
// one. Anything used to compare committees belongs on those pages, where there
// is room to show the evidence for it.

import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import {
  COMPLETED,
  NOT_LINKED,
  displayName,
  recordForSlug,
} from "../../data/conference-committees";
import {
  COMMITTEES,
  hasComparison,
} from "../../data/conference-committees/committees";
import { SiteNav } from "../site-nav";

/**
 * What a row admits it does not have.
 *
 * Rules rather than exceptions, so the list keeps telling the truth as the data
 * fills in: a reader should not have to open a page to find out that nothing
 * has been compiled behind it.
 */
const caveats = (slug: string, compared: boolean) =>
  [
    NOT_LINKED.has(slug) ? "no page yet" : null,
    compared ? null : "comparison not compiled",
  ].filter(Boolean) as string[];

export function ConferenceCommittees() {
  return (
    <div className="bg-ground min-h-screen font-body text-ink">
      <SiteNav inner="w-full px-[20px] sm:px-[32px]" />
      <main className="mx-auto max-w-[1180px] px-[20px] sm:px-[32px] pt-[48px] pb-[80px]">
        {/* The detail page's hero, at the same face and weight, so arriving
            here and arriving there feel like one place. */}
        <h1 className="font-body font-bold text-[28px] sm:text-[40px] leading-[1.2] text-brand">
          Conference committees
        </h1>

        {/* One paragraph. The mechanism, and the half that makes it matter:
            nobody watches, and neither chamber can amend what comes back. */}
        <p className="font-body text-lg sm:text-xl text-ink-muted leading-[1.5] mt-[12px] max-w-[56ch]">
          When the House and the Senate pass different versions of the same
          bill, six legislators, three from each chamber, meet in private to
          reconcile them into one text. Both chambers then vote that text up or
          down with no amendments, so whatever these six agree is the bill.
        </p>

        <div className="mt-[40px] max-w-[720px]">
          {/* The rail's own label on the detail page, in the same quiet key. A
              heading here would compete with the one above it for no gain:
              what the reader needs told is that these twelve are current. */}
          <h2 className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-muted">
            Sitting now
          </h2>

          {/* One object with twelve rows, not twelve cards. The page is a
              choice between things of equal weight, and hairlines say that
              where a stack of bordered cards says twelve separate matters.
              Clipped, so a hovered first or last row keeps the corner. */}
          <ul className="mt-[12px] bg-surface border border-line rounded-card overflow-hidden">
            {COMMITTEES.map((c, i) => {
              const rec = recordForSlug(c.slug);
              // From the scorecard record rather than the explorer data, which
              // is missing both numbers for economic development.
              const meta = [rec?.house, rec?.senate]
                .filter(Boolean)
                .concat(caveats(c.slug, hasComparison(c)))
                .join(" · ");
              const off = NOT_LINKED.has(c.slug);
              const row = `flex items-center gap-[12px] px-[18px] py-[13px] ${
                i > 0 ? "border-t border-line-ghost" : ""
              }`;
              const inside = (
                <span className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-baseline sm:gap-[16px]">
                  <span
                    className={`font-body text-lg leading-[1.35] ${
                      off ? "text-ink-muted" : "text-ink"
                    }`}
                  >
                    {displayName(c.slug, c.short)}
                  </span>
                  <span className="font-body text-xs text-ink-faint leading-[1.4] sm:ml-auto sm:text-right">
                    {meta}
                  </span>
                </span>
              );
              return (
                <li key={c.slug}>
                  {off ? (
                    // A span, not a disabled link: nothing to press, so nothing
                    // that looks pressable and nothing a keyboard stops on.
                    <span aria-disabled className={`${row} cursor-default`}>
                      {inside}
                    </span>
                  ) : (
                    <Link
                      to={`/conferenceCommittees/${c.slug}`}
                      className={`${row} group transition-colors hover:bg-wash`}
                    >
                      {inside}
                      <ChevronRight className="w-[16px] h-[16px] shrink-0 text-ink-faint group-hover:text-ink" />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* What the end looks like, which the list of finished conferences
              used to carry a row at a time. The count is the part that dates,
              so it is read from the record rather than written here. */}
          <p className="font-body text-xs text-ink-faint leading-[1.6] mt-[16px]">
            Another {COMPLETED.length} conferences have already reported this
            session. A conference reports one new bill number, and that text is
            what becomes law.
          </p>

          <p className="font-body text-xs text-ink-faint leading-[1.6] mt-[8px]">
            Members, bill numbers and dates come from the State House News
            Service scorecard, checked against{" "}
            <a
              href="https://malegislature.gov/Bills"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[3px] underline decoration-dotted underline-offset-[3px] hover:text-ink"
            >
              malegislature.gov
              <ArrowUpRight className="w-[11px] h-[11px]" />
            </a>
            . The comparisons are our own reading of the two texts.
          </p>
        </div>
      </main>
    </div>
  );
}
