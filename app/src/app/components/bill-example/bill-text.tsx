// This bill's text, read in full.
//
// The lineage says what each step did to the text; this is the text. Where a
// bill has a transcribed lineage the two are one selection: choosing a document
// here moves the stepper, and choosing a step there moves the picker, so a
// reader is never looking at one bill's history beside another bill's words.

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { LINEAGE_TEXTS } from "../../data/bill-lineage/texts";
import {
  billDocument,
  mapleBillUrl,
  type TextAbsence,
} from "../../data/bills-194/texts";
import type { BillRecord } from "../../data/bills-194";
import { Chapter, Span } from "./spine";

/** What the well can show, whichever set the document came from. */
interface ViewerDoc {
  number: string;
  title: string;
  text: string;
  /** Why there is no text, in the record's own terms, where it explains itself. */
  note?: string;
  /** Which kind of empty, where the note does not say. */
  absence?: TextAbsence;
}

export function BillTextSection({
  bill,
  number,
  onNumber,
}: {
  /** The bill whose page this is. Its own text is what the viewer opens on. */
  bill: BillRecord;
  /** The document on screen, held by the page and shared with the lineage. */
  number: string;
  onNumber: (n: string) => void;
}) {
  /**
   * The documents this viewer can offer.
   *
   * One bill has a lineage transcribed a dozen documents deep, and on its page
   * the picker is the point: a reader travels back through what the current text
   * came out of. Every other bill has one document, its own, so there is nothing
   * to choose between. Offering the transcribed dozen everywhere was the bug
   * worth fixing first, because it put one bill's words under another bill's
   * number, which is the one thing a text viewer must never do.
   */
  const docs: ViewerDoc[] = LINEAGE_TEXTS.some((d) => d.number === bill.number)
    ? LINEAGE_TEXTS
    : [
        billDocument(bill.number) ?? {
          number: bill.number,
          title: bill.title,
          text: "",
          absence: "not-bundled",
        },
      ];
  const doc = docs.find((d) => d.number === number) ?? docs[0];
  /**
   * Where a reader goes when there is nothing to show. The General Court
   * publishes some documents as a PDF and carries no text under the number, so
   * its own API returns nothing for them and MAPLE has the words. Null on the
   * consolidated amendments in the lineage, which are not documents MAPLE has a
   * page for.
   */
  const maple = mapleBillUrl(doc.number);

  // `focus-visible` is not enough on a select: browsers count a click as a
  // visible focus, so the ring flashed up every time the menu was opened. This
  // watches how the focus actually arrived, and shows the ring only when it
  // came from the keyboard.
  const byPointer = useRef(false);
  const [kbFocus, setKbFocus] = useState(false);

  return (
    <Chapter id="text" question="What does it actually say?">
      <div>
        {/* No picker where there is nothing to pick. A menu of one is a control
            that does nothing, and it tells a reader there are other versions to
            find when there are not. */}
        <div
          className={`items-center gap-[10px] flex-wrap ${
            docs.length > 1 ? "flex" : "hidden"
          }`}
        >
          <label
            htmlFor="bill-text-version"
            className="font-body font-semibold text-sm text-ink"
          >
            Version
          </label>
          {/* The browser's own select draws its chevron inside the right
              padding, so text runs into it and the focus ring is whatever the
              platform feels like. Appearance off, our own chevron, our own
              focus ring. */}
          <span className="relative inline-flex items-center">
            <select
              id="bill-text-version"
              value={doc.number}
              onChange={(e) => onNumber(e.target.value)}
              onPointerDown={() => (byPointer.current = true)}
              onFocus={() => {
                setKbFocus(!byPointer.current);
                byPointer.current = false;
              }}
              onBlur={() => setKbFocus(false)}
              onKeyDown={() => setKbFocus(true)}
              className={`appearance-none font-body text-sm text-ink bg-surface border border-line rounded-control pl-[12px] pr-[34px] py-[7px] cursor-pointer focus:outline-none ${
                kbFocus ? "ring-2 ring-focus" : ""
              }`}
            >
              {/* Newest first, the way the lineage strip reads: a reader arrives
                at the current text and travels back through what it came
                out of. */}
              {[...docs].reverse().map((d) => (
                // The number alone. A select sizes itself to its widest option,
                // so hanging "(no text published)" off one of them left every
                // other value floating a long way from the chevron. The document
                // with no text says so in the viewer, which is where a reader
                // finds out anyway.
                <option key={d.number} value={d.number}>
                  {d.number}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-[11px] w-[15px] h-[15px] text-ink-mid"
            />
          </span>
        </div>

        {/* A viewer, not a block of text on the page: a recessed grey well
            no taller than the window, with the document sitting in it as a
            sheet. The sheet is what scrolls, so the grey stays put around it.

            With nothing to show there is no sheet: a blank page would say the
            document is empty, when what is true is that none was published. The
            well carries the explanation itself, and shrinks to it rather than
            holding a window's worth of grey around one sentence. */}
        <div
          className={`mt-[16px] bg-sunken border border-line rounded-card p-[20px] sm:p-[28px] flex ${
            doc.text ? "h-[min(74vh,860px)]" : ""
          }`}
        >
          {doc.text ? (
            <div className="mx-auto w-full max-w-[680px] bg-surface shadow-popover rounded-[3px] overflow-y-auto scrollbar-always px-[28px] py-[34px] sm:px-[52px] sm:py-[44px]">
              <p className="font-body font-semibold text-sm text-ink-mid">
                {doc.number}
              </p>
              <p className="font-display font-medium text-lg text-ink leading-[1.3] mt-[2px] mb-[24px]">
                {doc.title}
              </p>
              {/* Preformatted, because the legislature's own line breaks carry
                  the only structure a bill has: section numbers, clause letters
                  and indents. */}
              <pre className="font-body text-sm text-ink leading-[1.75] whitespace-pre-wrap break-words">
                {doc.text}
              </pre>
            </div>
          ) : (
            <div className="mx-auto max-w-[560px] text-center py-[14px]">
              <p className="font-body text-sm text-ink-mid leading-[1.7]">
                {doc.note ??
                  (doc.absence === "none-published"
                    ? `The legislature's machine-readable record has no text for ${doc.number}.`
                    : `The text of ${doc.number} is not bundled with this prototype yet.`)}{" "}
                {/* Only where the record does not already explain itself. A
                    document whose own note names what it became is answered by
                    the note and by the picker, and a link away from both would
                    be the worse answer. */}
                {!doc.note && maple && (
                  <a
                    href={maple}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline decoration-dotted underline-offset-[4px] text-link hover:text-brand"
                  >
                    Read it on MAPLE
                  </a>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </Chapter>
  );
}
