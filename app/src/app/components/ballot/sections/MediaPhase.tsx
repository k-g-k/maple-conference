import type { Article } from "../types";

// Article rows grouped under a phase heading.
export function MediaPhase({
  phase,
  when,
  articles,
}: {
  phase: string;
  when: string;
  articles: Article[];
}) {
  return (
    <div className="border-t border-line pt-[14px]">
      <p className="font-body font-semibold text-lg text-ink">
        {phase}
      </p>
      <p className="font-body font-semibold text-2xs text-ink-muted mt-[2px] mb-[8px]">
        {when}
      </p>
      <div className="space-y-[8px]">
        {articles.map((a) => (
          <div key={a.title} className="flex gap-[12px] items-baseline flex-wrap">
            <span className="font-body font-semibold text-2xs text-ink-muted min-w-[130px]">
              {a.outlet}
            </span>
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body font-semibold text-base text-brand hover:text-alert flex-1"
            >
              {a.title}
            </a>
            <span className="font-body text-2xs text-ink-faint">
              {a.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
