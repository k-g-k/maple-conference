import { ArrowUpRight } from "lucide-react";
import { useSources } from "../sources-context";

// A titled, bulleted bibliography group rendered from source ids in the
// registry (title — meta · date — note — link).
export function RefGroup({ title, ids }: { title?: string; ids: string[] }) {
  const sources = useSources();
  return (
    <div>
      {title && (
        <p className="font-body font-semibold text-base text-ink mb-[8px]">
          {title}
        </p>
      )}
      <ul className="list-disc list-outside pl-[18px] space-y-[8px]">
        {ids.map((id) => {
          const s = sources[id];
          if (!s) return null;
          const metaLine =
            s.meta && s.date && !s.meta.includes(s.date)
              ? `${s.meta} · ${s.date}`
              : (s.meta ?? s.date);
          return (
            <li
              key={id}
              className="font-body text-sm text-ink leading-[1.5]"
            >
              <span className="font-semibold text-ink">
                {s.title ?? s.label}
              </span>
              {metaLine && (
                <span className="italic text-ink-muted"> — {metaLine}</span>
              )}
              {s.note && <> — {s.note}</>}
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
          );
        })}
      </ul>
    </div>
  );
}
