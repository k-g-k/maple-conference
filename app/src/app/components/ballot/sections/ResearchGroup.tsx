import { ArrowUpRight } from "lucide-react";
import type { Study } from "../types";

// A titled, bulleted list of studies (citation — affiliation — finding — link).
export function ResearchGroup({
  title,
  studies,
}: {
  title: string;
  studies: Study[];
}) {
  if (!studies.length) return null;
  return (
    <div>
      <p className="font-body font-semibold text-base text-ink mb-[8px]">
        {title}
      </p>
      <ul className="list-disc list-outside pl-[18px] space-y-[8px]">
        {studies.map((s) => (
          <li
            key={s.citation}
            className="font-body text-sm text-ink leading-[1.5]"
          >
            <span className="font-semibold text-ink">{s.citation}</span>
            {s.affiliation && s.affiliation !== "peer-reviewed" && (
              <span className="italic text-ink-muted"> — {s.affiliation}</span>
            )}
            {" — "}
            {s.finding}
            {s.url && (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs font-semibold text-brand hover:text-alert inline-flex items-center gap-[3px] ml-[4px] align-baseline"
              >
                Source <ArrowUpRight className="w-[13px] h-[13px]" />
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
