import { ChevronLeft, ChevronRight } from "lucide-react";
import { pageWindow } from "../helpers";

// Numbered pager: ‹ 1 2 3 … n › — current page bold black, others link blue,
// chevrons disabled at the ends.
export function Pagination({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-[14px] mt-[18px]">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        aria-label="Previous page"
        className="text-ink hover:text-alert cursor-pointer disabled:text-ink-faint disabled:cursor-default"
      >
        <ChevronLeft className="w-[16px] h-[16px]" />
      </button>
      {pageWindow(page, pageCount).map((item, i) =>
        item === "…" ? (
          <span
            key={`gap-${i}`}
            className="font-body text-sm text-ink-muted"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPage(item)}
            aria-current={item === page ? "page" : undefined}
            className={`font-body text-sm cursor-pointer ${
              item === page
                ? "font-semibold text-ink cursor-default"
                : "text-brand hover:text-alert"
            }`}
          >
            {item + 1}
          </button>
        ),
      )}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= pageCount - 1}
        aria-label="Next page"
        className="text-ink hover:text-alert cursor-pointer disabled:text-ink-faint disabled:cursor-default"
      >
        <ChevronRight className="w-[16px] h-[16px]" />
      </button>
    </div>
  );
}
