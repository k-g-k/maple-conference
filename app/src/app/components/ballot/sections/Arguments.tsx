import type { Arg } from "../types";

// Purple argument boxes (stacked).
export function ArgList({ args }: { args: Arg[] }) {
  return (
    <div className="space-y-[12px]">
      {args.map((a) => (
        <div
          key={a.title}
          className="bg-ai-soft border border-ai-edge rounded-control p-[16px]"
        >
          <p className="font-body font-semibold text-base text-ai-ink mb-[4px]">
            {a.title}
          </p>
          <p className="font-body text-base text-ink leading-[1.5]">
            {a.body}
          </p>
        </div>
      ))}
    </div>
  );
}

// One argument column in the "Arguments at a Glance" style — a purple left bar
// per point; empty state when a source type has no arguments on file.
export function ArgColumn({ title, args }: { title: string; args: Arg[] }) {
  return (
    <div className="flex-1 space-y-[10px]">
      <p className="font-body font-semibold text-xs text-ink mb-[4px]">
        {title}
      </p>
      {args.length === 0 && (
        <p className="font-body text-sm text-ink-muted">
          No arguments from this source type on file.
        </p>
      )}
      {args.map((a) => (
        <div
          key={a.title}
          className="border-l-[3px] border-ai pl-[12px] py-[2px]"
        >
          <p className="font-body font-semibold text-sm text-ink">
            {a.title}
          </p>
          <p className="font-body text-sm text-ink-muted leading-[1.5]">
            {a.body}
          </p>
        </div>
      ))}
    </div>
  );
}
