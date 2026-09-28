// The site header, shared by every prototype page.
//
// Matched to the live MAPLE bar rather than invented: a full-bleed band in the
// brand navy with the wordmark on the left, white links that take a
// translucent white wash on hover, and the account control on the right.
// Colours and hover values are the ones in the MAPLE repo
// (`$maple-brand-primary`, `.desktop-navbar-link`), not approximations.

import { useState } from "react";
import { Menu, TreePine, X } from "lucide-react";

/** The live bar's order: bills first, the standing sections after. */
const NAV = [
  "Bills",
  "Ballot questions",
  "Hearings",
  "Testimony",
  "About",
  "Learn",
];

/** MAPLE's `$maple-brand-primary`, the same value links use. */
const BAR = "var(--color-link)";

export function SiteNav({
  sticky = true,
  inner = "mx-auto max-w-[1180px] px-[20px] sm:px-[32px]",
}: {
  /**
   * The bar's own column, for a page whose content is not on the 1180 grid.
   * The wordmark should start where the page starts, so a page that sets its
   * own width hands the same one to the bar.
   */
  inner?: string;
  /** Off for a page that pins something of its own instead. Two stacked bars
   *  take a sixth of a laptop viewport between them. */
  sticky?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Fixed rather than sticky. A sticky bar is still in the flow, so it is
          re-laid out on every scroll frame along with the pinned things below
          it, and on this page that stack showed as a bounce. Fixed takes the
          bar out of the flow and leaves the rest of the pinning to resolve
          against a header that no longer moves. */}
      <header
        className={`z-40 text-white ${
          sticky ? "fixed top-0 left-0 right-0" : "relative"
        }`}
        style={{ backgroundColor: BAR }}
      >
        <div
          className={`${inner} h-[var(--nav-h)] flex items-center gap-[20px]`}
        >
          <span className="flex items-center gap-[8px]">
            {/* The mark the first prototype's bar carried: the tree in a
                translucent white disc, which is what makes it read on the
                navy. */}
            <span
              aria-hidden
              className="w-[32px] h-[32px] shrink-0 rounded-full bg-white/15 flex items-center justify-center"
            >
              <TreePine className="w-[18px] h-[18px]" />
            </span>
            <span className="font-display font-semibold text-xl tracking-heading">
              MAPLE
            </span>
          </span>
          {/* Pushed to the right, so the links sit with the account control
            rather than trailing the wordmark. */}
          <nav className="hidden lg:flex lg:ml-auto items-center gap-[2px]">
            {NAV.map((n) => (
              <button
                key={n}
                // Nothing lit. The bar marks where you can go, not where you
                // are, and a page can sit under more than one of these.
                className="font-body text-base rounded-control px-[12px] py-[6px] cursor-pointer transition-colors hover:bg-white/[0.12]"
              >
                {n}
              </button>
            ))}
          </nav>
          <button
            aria-label="Account"
            // The nav takes the space at wide sizes, so this only has to push
            // itself over where the nav is not there to do it.
            className="ml-auto lg:ml-0 hidden sm:inline-flex items-center cursor-pointer group"
          >
            <span className="inline-flex items-center justify-center w-[36px] h-[36px] rounded-full border border-white/40 group-hover:bg-white/[0.12] group-hover:border-white transition-colors">
              <span
                style={{ fontSize: 12 }}
                className="font-body font-semibold tracking-[0.02em]"
              >
                GK
              </span>
            </span>
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="ml-auto lg:hidden inline-flex items-center justify-center w-[40px] h-[40px] -mr-[8px] rounded-control hover:bg-white/[0.12] cursor-pointer"
          >
            {open ? (
              <X className="w-[20px] h-[20px]" />
            ) : (
              <Menu className="w-[20px] h-[20px]" />
            )}
          </button>
        </div>
        {open && (
          <div className="lg:hidden border-t border-white/20">
            <nav className={`${inner} py-[8px] flex flex-col`}>
              {NAV.map((n) => (
                <button
                  key={n}
                  className="text-left font-body text-base py-[10px]"
                >
                  {n}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>
      {/* The height the bar no longer occupies. Out of the flow, it would
          otherwise sit over the top of the page. */}
      {sticky && <div aria-hidden className="h-[var(--nav-h)]" />}
    </>
  );
}
