// The conference committee index: what they are, and the twelve sitting now.
//
// Deliberately plain. The point of this pass is that the pages exist and carry
// real data, so the design can happen in context rather than in the abstract.
// Everything here is a block you can move, restyle or throw away.

import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { ACTIVE, COMPLETED, slugFor } from "../../data/conference-committees";
import {
  COMMITTEES,
  hasComparison,
} from "../../data/conference-committees/committees";
import { SiteNav } from "../site-nav";

/** Our own record for a committee, matched on the Senate bill number. */
const recordFor = (senateBill?: string) =>
  [...ACTIVE, ...COMPLETED].find((c) => c.senate === senateBill);

function Bill({ number }: { number?: string }) {
  if (!number) return null;
  return (
    <Link
      to={`/bills/${slugFor(number)}`}
      className="font-body font-semibold text-sm underline decoration-dotted underline-offset-[4px] text-official-ink hover:text-official"
    >
      {number}
    </Link>
  );
}

export function ConferenceCommittees() {
  return (
    <div className="bg-ground min-h-screen font-body text-ink">
      <SiteNav inner="w-full px-[20px] sm:px-[32px]" />
      <main className="mx-auto max-w-[1180px] px-[20px] sm:px-[32px] pt-[48px] pb-[80px]">
        <nav
          aria-label="Where this page sits"
          className="font-body text-sm text-ink-muted flex items-center gap-[7px]"
        >
          <span>194th General Court</span>
          <span aria-hidden className="text-ink-faint">
            ›
          </span>
          <span className="font-semibold text-brand">
            Conference committees
          </span>
        </nav>

        <h1 className="font-display font-medium text-3xl @[980px]:text-[48px] leading-[1.15] tracking-display text-ink mt-[16px]">
          Conference committees
        </h1>

        {/* What they are. Placeholder copy: this is the explainer slot, and it
            should end up in MAPLE's learn-page voice rather than mine. */}
        <div className="mt-[18px] max-w-[70ch] flex flex-col gap-[12px]">
          <p className="font-body text-lg text-ink leading-[1.6]">
            When the House and the Senate pass different versions of the same
            bill, six legislators, three from each chamber, meet to reconcile
            them into one text.
          </p>
          <p className="font-body text-base text-ink-muted leading-[1.65]">
            They meet in private. No testimony is taken and nothing is published
            until they report. Both chambers then vote the result up or down
            with no further amendments, so whatever these six agree is the bill.
          </p>
        </div>

        {/* The list. Two things per committee: what both bills already agree,
            and what the six are still deciding. */}
        <h2 className="font-display font-medium text-xl text-ink mt-[44px]">
          Sitting now
        </h2>
        <ul className="mt-[16px] flex flex-col gap-[12px]">
          {COMMITTEES.map((c) => {
            const rec = recordFor(c.senateBill?.n);
            return (
              <li key={c.slug}>
                <Link
                  to={`/conferenceCommittees/${c.slug}`}
                  className="block bg-surface border border-line rounded-card px-[20px] py-[18px] hover:border-line-strong"
                >
                  <p className="font-display font-medium text-lg text-ink leading-[1.3]">
                    {c.short}
                  </p>
                  <p className="font-body text-sm text-ink-muted leading-[1.6] mt-[4px] max-w-[80ch]">
                    {c.subtitle}
                  </p>
                  <p className="font-body text-xs text-ink-faint mt-[10px]">
                    {c.houseBill?.n} and {c.senateBill?.n}
                    {rec && ` · sent to conference ${rec.sentToConference}`}
                    {hasComparison(c)
                      ? ` · ${c.settled?.length ?? 0} settled, ${c.open?.length ?? 0} open`
                      : " · comparison not compiled yet"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Finished ones, for the range they give: how long this actually
            takes, and what the end looks like. */}
        <h2 className="font-display font-medium text-xl text-ink mt-[44px]">
          Already reported
        </h2>
        <p className="font-body text-sm text-ink-muted leading-[1.65] mt-[6px] max-w-[70ch]">
          A finished conference reports one new bill number, and that text is
          what becomes law. The two originals are superseded.
        </p>
        <ul className="mt-[16px] flex flex-col gap-[8px]">
          {COMPLETED.map((c) => (
            <li
              key={c.id}
              className="bg-surface border border-line rounded-card px-[20px] py-[14px]"
            >
              <p className="font-body font-semibold text-base text-ink">
                {c.name}
              </p>
              <p className="font-body text-xs text-ink-muted mt-[4px]">
                <Bill number={c.house} /> and <Bill number={c.senate} />
                {c.reported && (
                  <>
                    {" · reported "}
                    {c.reported.on} as <Bill number={c.reported.as} />
                  </>
                )}
                {c.enacted && ` · enacted ${c.enacted}`}
                {c.signed && ` · signed ${c.signed}`}
              </p>
            </li>
          ))}
        </ul>

        <p className="font-body text-xs text-ink-faint mt-[32px] max-w-[70ch] leading-[1.6]">
          Committee membership and dates come from the State House News Service
          scorecard. The settled and open comparisons come from the bill
          explorer prototype, which read both texts.{" "}
          <a
            href="https://malegislature.gov/Bills"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[3px] underline decoration-dotted underline-offset-[3px] hover:text-ink"
          >
            malegislature.gov
            <ArrowUpRight className="w-[11px] h-[11px]" />
          </a>
        </p>
      </main>
    </div>
  );
}
