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
    <div className="flex items-center justify-center gap-[4px] sm:gap-[14px] mt-[18px]">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        aria-label="Previous page"
        className="flex items-center justify-center w-[44px] h-[44px] sm:w-auto sm:h-auto text-ink hover:text-alert cursor-pointer disabled:text-ink-faint disabled:cursor-default"
      >
        <ChevronLeft className="w-[18px] h-[18px] sm:w-[16px] sm:h-[16px]" />
      </button>
      <span className="sm:hidden font-body text-sm text-ink-muted tabular-nums">
        Page {page + 1} of {pageCount}
      </span>
      <span className="hidden sm:contents">
        {pageWindow(page, pageCount).map((item, i) =>
          item === "…" ? (
            <span key={`gap-${i}`} className="font-body text-sm text-ink-muted">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPage(item)}
              aria-current={item === page ? "page" : undefined}
              className={`font-body text-sm cursor-pointer px-[4px] py-[6px] sm:p-0 ${
                item === page
                  ? "font-semibold text-ink cursor-default"
                  : "text-brand hover:text-alert"
              }`}
            >
              {item + 1}
            </button>
          ),
        )}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= pageCount - 1}
        aria-label="Next page"
        className="flex items-center justify-center w-[44px] h-[44px] sm:w-auto sm:h-auto text-ink hover:text-alert cursor-pointer disabled:text-ink-faint disabled:cursor-default"
      >
        <ChevronRight className="w-[18px] h-[18px] sm:w-[16px] sm:h-[16px]" />
      </button>
    </div>
  );
}
