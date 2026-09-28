// Empty / invitation state. `shareOnly` drops every action except
// "Share your perspective".
export function EmptyState({
  title,
  body,
  shareOnly = false,
}: {
  title: string;
  body: string;
  shareOnly?: boolean;
}) {
  return (
    <div className="border-[1.5px] border-dashed border-line-strong rounded-panel p-[22px] text-center bg-sunken">
      <p className="font-body font-semibold text-lg text-ink mb-[4px]">
        {title}
      </p>
      <p className="font-body text-sm text-ink-muted leading-[1.5] max-w-[560px] mx-auto">
        {body}
      </p>
      <div className="flex gap-[10px] justify-center mt-[14px] flex-wrap">
        <button className="bg-brand text-ink-inverse font-body font-semibold text-sm px-[18px] py-[8px] rounded-pill">
          Share your perspective
        </button>
        {!shareOnly && (
          <button className="bg-surface border border-brand text-brand font-body font-semibold text-sm px-[18px] py-[8px] rounded-pill">
            Ask a question
          </button>
        )}
      </div>
    </div>
  );
}
