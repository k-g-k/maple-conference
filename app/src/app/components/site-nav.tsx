// The site header, shared by every prototype page.
//
// Matched to the live MAPLE bar rather than invented: a full-bleed band in the
// brand navy with the wordmark on the left, white links that take a
// translucent white wash on hover, and the account control on the right.
// Colours and hover values are the ones in the MAPLE repo
// (`$maple-brand-primary`, `.desktop-navbar-link`), not approximations.

import { Fragment, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, TreePine, X } from "lucide-react";

/**
 * The prototypes this bar can reach, not the live site's sections.
 *
 * The live bar reads Bills, Ballot questions, Hearings, Testimony, About,
 * Learn, and none of those exist here. What does exist is four readings of one
 * committee, so the bar names those and the designer can move between them
 * without the address bar. Phone-Free Schools is the committee they all open
 * on: it is the only one with bill text and a lobbying register behind it.
 */
const HOME = "/conferenceCommittees/phone-free-schools";
/**
 * What each item is lit by.
 *
 * The reading rather than the address: the links all open Phone-Free Schools,
 * but a reader who walks to another committee from the list on the left is
 * still in the same prototype, and the bar should go on saying which one.
 */
const NAV: { label: string; to: string; at: RegExp; rule?: true }[] = [
  {
    label: "Conference Explorer",
    to: "/conferenceCommittees",
    at: /^\/conferenceCommittees\/?$/,
  },
  { label: "Committees", to: HOME, at: /^\/conferenceCommittees\/[^/]+$/ },
  // Straight to the feed, which is the part of those two being compared. The
  // rule marks where the bar stops being the site and starts being the two
  // readings of one page.
  { label: "Cosign", to: `${HOME}/cosign#input`, at: /\/cosign$/, rule: true },
  { label: "Cosign-Viz", to: `${HOME}/cosign-viz#input`, at: /\/cosign-viz$/ },
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
  // Which of the four the reader is on. Read off the path alone, so a fragment
  // or a query cannot stop an item recognising its own page.
  const { pathname } = useLocation();
  const here = (at: RegExp) => at.test(pathname);
  // The one ladder these pages climb, written down where the bar that sits
  // in the middle of it can be read:
  //
  //   0-9   inside a card: a sticky column head, a rim drawn over a face
  //   10    a heading pinned inside its own section
  //   20    a bar pinned to the top of a section
  //   30-40 a rail or a drawer at the edge of the window
  //   40    this bar
  //   50    the floating buttons, above everything except the next two
  //   60-70 something the reader just opened: a drawer, a modal, a menu
  //   80    a tooltip, which is never the thing underneath it
  //
  // Maps and faces carry no z at all. They are content, and anything that
  // needs to sit over them says so.
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
              <Fragment key={n.label}>
                {n.rule && (
                  <span
                    aria-hidden
                    className="mx-[8px] h-[18px] w-px bg-white/25"
                  />
                )}
                <Link
                  to={n.to}
                  aria-current={here(n.at) ? "page" : undefined}
                  // The one you are on is lit. Four prototypes of the same
                  // committee look alike at a glance, so the bar has to say
                  // which one is on screen.
                  className={`font-body text-base rounded-control px-[12px] py-[6px] cursor-pointer transition-colors ${
                    here(n.at)
                      ? "bg-white/[0.18] font-semibold"
                      : "hover:bg-white/[0.12]"
                  }`}
                >
                  {n.label}
                </Link>
              </Fragment>
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
            // Only this pushes right when the account control is not there to
            // do it. With both claiming the space, the account circle stopped
            // in the middle of the bar instead of sitting next to the menu.
            className="ml-auto sm:ml-0 lg:hidden inline-flex items-center justify-center w-[40px] h-[40px] -mr-[8px] rounded-control hover:bg-white/[0.12] cursor-pointer"
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
                <Link
                  key={n.label}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  aria-current={here(n.at) ? "page" : undefined}
                  className={`text-left font-body text-base py-[10px] ${
                    here(n.at) ? "font-semibold" : ""
                  }`}
                >
                  {n.label}
                </Link>
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
