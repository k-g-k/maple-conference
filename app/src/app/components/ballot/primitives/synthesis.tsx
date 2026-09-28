// AI-synthesis presentation blocks. "AI synthesis" is a layer, not a section:
// a labeled purple treatment with a prompt/sources popover.

import type { ReactNode } from "react";
import { Card } from "./Card";
import { Cite, SynthSourcesNote } from "./citations";
import type { SrcKind } from "../types";

// Lead summary card for a tab: card title, AI-synthesized paragraphs in a
// purple citation-line block, then the AI Synthesis chip + prompt/sources
// popover.
export function SynthSummaryCard({
  title,
  subtitle,
  ids,
  prompt,
  children,
  extra,
}: {
  title: string;
  subtitle?: string;
  ids: string[];
  prompt?: string;
  children: ReactNode;
  /** Extra content rendered beside the AI Synthesis prompt/sources trigger. */
  extra?: ReactNode;
}) {
  return (
    <Card title={title} subtitle={subtitle}>
      <div className="border-l-[3px] border-ai pl-[14px]">
        <div className="space-y-[12px] font-body text-base text-ink leading-[1.6]">
          {children}
        </div>
        <SynthSourcesNote ids={ids} prompt={prompt} extra={extra} />
      </div>
    </Card>
  );
}

// A labeled purple AI-synthesis block. Pass `ids` for its own prompt/sources
// popover; omit them when a parent renders one shared attribution instead.
export function AnalysisSection({
  title,
  ids,
  prompt,
  children,
}: {
  title: string;
  ids?: string[];
  prompt?: string;
  children: ReactNode;
}) {
  return (
    <div className="border-l-[3px] border-ai pl-[14px]">
      <p className="font-body font-semibold text-base text-ink mb-[6px]">
        {title}
      </p>
      {children}
      {ids && <SynthSourcesNote ids={ids} prompt={prompt} />}
    </div>
  );
}

// Compact purple synthesis box with an inline chip.
export function AISynth({
  title,
  ids,
  children,
}: {
  title: string;
  ids?: string[];
  children: ReactNode;
}) {
  return (
    <div className="bg-ai-soft border border-ai-edge rounded-control p-[16px]">
      <div className="flex items-center gap-[8px] mb-[8px] flex-wrap">
        <span className="bg-ai-soft text-ai-ink font-body font-semibold text-2xs px-[7px] py-[2px] rounded-control">
          AI synthesis
        </span>
        <p className="font-body font-semibold text-base text-ai-ink">
          {title}
          {ids && <Cite ids={ids} />}
        </p>
      </div>
      <div className="font-body text-base text-ink leading-[1.55]">
        {children}
      </div>
    </div>
  );
}

// Source-type-coded content box (official / user / outside / ai).
export function ContentItem({
  type,
  children,
}: {
  type: SrcKind;
  children: ReactNode;
}) {
  const c = {
    official: {
      bg: "bg-official-soft",
      bd: "border-official-edge",
      tx: "text-official-ink",
    },
    user: { bg: "bg-user-soft", bd: "border-user-edge", tx: "text-user-ink" },
    outside: {
      bg: "bg-outside-soft",
      bd: "border-outside-edge",
      tx: "text-outside-ink",
    },
    ai: { bg: "bg-ai-soft", bd: "border-ai-edge", tx: "text-ai-ink" },
  }[type];
  return (
    <div
      className={`${c.bg} border ${c.bd} rounded-control px-[12px] py-[8px]`}
    >
      <div className={`font-body text-base ${c.tx} tracking-[0.14px]`}>
        {children}
      </div>
    </div>
  );
}
