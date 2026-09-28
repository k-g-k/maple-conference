// Every document in the lineage, read in full.
//
// The lineage says what each step did to the text; this is the text. The two
// are one selection: choosing a document here moves the stepper, and choosing a
// step there moves the picker, so a reader is never looking at one bill's
// history beside another bill's words.

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { LINEAGE_TEXTS } from "../../data/bill-lineage/texts";
import { Chapter, Span } from "./spine";

export function BillTextSection({
  number,
  onNumber,
}: {
  /** The document on screen, held by the page and shared with the lineage. */
  number: string;
  onNumber: (n: string) => void;
}) {
  const doc =
    LINEAGE_TEXTS.find((d) => d.number === number) ?? LINEAGE_TEXTS[0];

  // `focus-visible` is not enough on a select: browsers count a click as a
  // visible focus, so the ring flashed up every time the menu was opened. This
  // watches how the focus actually arrived, and shows the ring only when it
  // came from the keyboard.
  const byPointer = useRef(false);
  const [kbFocus, setKbFocus] = useState(false);

  return (
    <Chapter id="text" question="What does it actually say?">
      <div>
        <div className="flex items-center gap-[10px] flex-wrap">
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
              {[...LINEAGE_TEXTS].reverse().map((d) => (
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
              className="pointer-events-none absolute right-[11px] w-[15px] h-[15px] text-ink-muted"
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
              <p className="font-body font-semibold text-sm text-ink-muted">
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
              <p className="font-body text-sm text-ink-muted leading-[1.7]">
                {doc.note ??
                  `The legislature publishes no text for ${doc.number}.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </Chapter>
  );
}
