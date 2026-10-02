// A scratch page for picking a mark, not part of the prototype.
//
// Route: /icons. It exists so a glyph can be judged at the size and color it
// would actually be used at, in the row it would sit in, rather than from a
// name in a list. Delete the file and its route when the choice is made.

import {
  BadgeCheck,
  Bookmark,
  Check,
  CircleCheck,
  FileCheck,
  Flag,
  MailCheck,
  MessageSquareText,
  NotebookPen,
  PenLine,
  Send,
  SendHorizontal,
  Signature,
  Stamp,
  ThumbsUp,
  UserCheck,
} from "lucide-react";
import type { ComponentType } from "react";

const ICONS: [string, ComponentType<{ className?: string }>][] = [
  ["Check", Check],
  ["CircleCheck", CircleCheck],
  ["BadgeCheck", BadgeCheck],
  ["FileCheck", FileCheck],
  ["MailCheck", MailCheck],
  ["Send", Send],
  ["SendHorizontal", SendHorizontal],
  ["PenLine", PenLine],
  ["NotebookPen", NotebookPen],
  ["Signature", Signature],
  ["Stamp", Stamp],
  ["MessageSquareText", MessageSquareText],
  ["ThumbsUp", ThumbsUp],
  ["UserCheck", UserCheck],
  ["Bookmark", Bookmark],
  ["Flag", Flag],
];

/** The list row the mark would sit in, so it is judged in place. */
function Row({
  name,
  Icon,
}: {
  name: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  return (
    <li className="border-l-[3px] border-transparent pl-[11px] pr-[8px] py-[7px]">
      <span className="flex items-start justify-between gap-[8px]">
        <span className="block font-body text-sm text-ink leading-[1.35]">
          Healthcare Workplace Violence
        </span>
        <Icon className="shrink-0 mt-[2px] w-[13px] h-[13px] text-ink-faint" />
      </span>
      <span className="block font-body text-xs text-ink-faint leading-[1.35] mt-[1px]">
        {name}
      </span>
    </li>
  );
}

export default function IconSample() {
  return (
    <div className="bg-ground min-h-screen font-body text-ink">
      <main className="mx-auto max-w-[900px] px-[24px] py-[40px]">
        <h1 className="font-display font-medium text-2xl text-ink">
          Marks for a committee you have filed on
        </h1>
        <p className="font-body text-sm text-ink-muted leading-[1.6] mt-[8px] max-w-[60ch]">
          Each one at 13px in the page&rsquo;s faint ink, in the row it would
          sit in, beside the word treatment for comparison. The name is under
          each row rather than beside it so the glyph is what you look at.
        </p>

        <div className="mt-[28px] grid gap-x-[32px] gap-y-[4px] sm:grid-cols-2">
          <ul className="bg-surface border border-line rounded-card px-[12px] py-[8px]">
            {ICONS.slice(0, 8).map(([name, Icon]) => (
              <Row key={name} name={name} Icon={Icon} />
            ))}
          </ul>
          <ul className="bg-surface border border-line rounded-card px-[12px] py-[8px]">
            {ICONS.slice(8).map(([name, Icon]) => (
              <Row key={name} name={name} Icon={Icon} />
            ))}
          </ul>
        </div>

        <h2 className="font-display font-medium text-lg text-ink mt-[36px]">
          The word, for comparison
        </h2>
        <ul className="bg-surface border border-line rounded-card px-[12px] py-[8px] mt-[12px] sm:max-w-[420px]">
          {["draft", "filed", "posted", "sent"].map((word) => (
            <li
              key={word}
              className="border-l-[3px] border-transparent pl-[11px] pr-[8px] py-[7px]"
            >
              <span className="flex items-start justify-between gap-[8px]">
                <span className="block font-body text-sm text-ink leading-[1.35]">
                  Healthcare Workplace Violence
                </span>
                <span className="shrink-0 mt-[2px] font-body text-2xs italic text-ink-faint">
                  {word}
                </span>
              </span>
              <span className="block font-body text-xs text-ink-faint leading-[1.35] mt-[1px]">
                H.4767 &middot; S.3184
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
