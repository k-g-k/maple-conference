// The document's ancestry, as a strip above the contents bar.
//
// Half the documents on these pages are amendments: one chamber takes the
// other's bill and replaces its text wholesale. The new number inherits no
// sponsor, no cosponsors, and a two-line history, while everything a reader
// wants sits on the bill it replaced. H.5630 records two actions; S.3141, the
// bill it is an amendment of, records twenty.
//
// So the chain goes at the top, above the page's own navigation rather than
// inside it, because it is not a section of the page: it says which object the
// page is about, the way a breadcrumb says where you are. A reader who arrived
// at a hollow number needs to be told that before they read anything else.
//
// Quiet on purpose. Most readers arrive at the current document and are in the
// right place; this is for the ones who are not.

import { Link } from "react-router-dom";
import { BILLS, LINEAGE, slugFor, type BillRecord } from "../../data/bills-194";

export function LineageStrip({ bill }: { bill: BillRecord }) {
  const chain = LINEAGE[bill.number];
  if (!chain || chain.length < 2) return null;

  const parent = chain[chain.length - 2];
  const parentRecord = BILLS[parent];

  return (
    <div className="border-b border-line lg:mr-[var(--taken-w)] transition-[margin] duration-300 ease-out motion-reduce:transition-none [[data-resizing]_&]:transition-none">
      <div className="mx-auto max-w-[1180px] px-[20px] sm:px-[32px] py-[10px] lg:mx-0 lg:max-w-[var(--page-right)] lg:pl-[var(--page-gutter)] lg:pr-[32px]">
        <nav
          aria-label="How this document came about"
          className="flex items-center gap-[8px] flex-wrap"
        >
          {chain.map((n, i) => {
            const here = n === bill.number;
            const known = Boolean(BILLS[n]);
            const label = (
              <span
                className={
                  here
                    ? "font-body font-semibold text-sm text-ink"
                    : "font-body text-sm text-ink-muted"
                }
              >
                {n}
              </span>
            );
            return (
              <span key={n} className="flex items-center gap-[8px]">
                {i > 0 && (
                  // An arrow, not a slash: this is a sequence of one document
                  // becoming another, not a hierarchy.
                  <span aria-hidden className="text-ink-faint text-sm">
                    →
                  </span>
                )}
                {here || !known ? (
                  label
                ) : (
                  <Link
                    to={`/bills/${slugFor(n)}`}
                    className="rounded-control hover:bg-wash px-[4px] -mx-[4px] py-[1px]"
                  >
                    {label}
                  </Link>
                )}
              </span>
            );
          })}

          {/* What the chain means, in one line. The numbers alone tell a reader
              who already knows how the legislature works; this is for everyone
              else. */}
          <span className="font-body text-sm text-ink-muted">
            {bill.kind === "Amendment" ? (
              <>
                · {bill.number} is the{" "}
                {bill.number.startsWith("H") ? "House" : "Senate"}&rsquo;s
                replacement text for {parent}
                {parentRecord
                  ? `, which carries ${parentRecord.history.length} recorded actions and ${parentRecord.cosponsors.length} cosponsors`
                  : ""}
                .
              </>
            ) : (
              <>· {bill.number} is a later printing of {parent}.</>
            )}
          </span>
        </nav>
      </div>
    </div>
  );
}
