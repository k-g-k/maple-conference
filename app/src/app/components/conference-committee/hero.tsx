// The introduction every conference committee page opens under: what a
// conference committee is, and the five steps it goes through.
//
// One hero for all of them, above whichever committee is open, because to a
// reader the landing and the twelve committees are one place. They arrive on a
// committee, and scrolling up from it is how they get back to what a conference
// committee is.

import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight } from "lucide-react";
import {
  EXPLORER,
  JOINT_RULES,
  LEAD,
  MAPLE_PROCESS,
  STEPS,
} from "../../data/conference-committees/intro";

const LINK =
  "underline decoration-dotted underline-offset-[3px] hover:text-ink";

/**
 * The process as numbered steps, in the order they happen. Across the page
 * where five fit side by side and down it where they do not, joined by the
 * line the bill page's timeline uses, so the five read as one sequence rather
 * than as separate facts.
 */
function Steps() {
  return (
    <div className="@container">
      <ol className="grid gap-y-[20px] @[880px]:grid-cols-5 @[880px]:gap-x-[24px]">
        {STEPS.map((step, i) => (
          <li
            key={step.h}
            className="relative flex gap-[14px] @[880px]:flex-col @[880px]:gap-[12px]"
          >
            {/* The line on to the next number, stopping 8px short of each.
                Down: from under this number to the next, across the 20px
                between steps. Across: from beside it, across the 24px. */}
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className="absolute bg-line left-[15px] top-[40px] -bottom-[12px] w-[2px] @[880px]:left-[40px] @[880px]:-right-[16px] @[880px]:top-[15px] @[880px]:bottom-auto @[880px]:w-auto @[880px]:h-[2px]"
              />
            )}
            <span className="shrink-0 w-[32px] h-[32px] rounded-full bg-brand text-ink-inverse flex items-center justify-center font-display font-semibold text-sm">
              {i + 1}
            </span>
            {/* Down the page the title sits level with its number. */}
            <div className="min-w-0 pt-[5px] @[880px]:pt-0 @[880px]:pr-[8px]">
              <h2 className="font-body font-semibold text-base text-ink leading-[1.35]">
                {step.h}
              </h2>
              <p className="mt-[4px] font-body text-sm text-ink-mid leading-[1.5]">
                {step.p}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** A screen of its own above the committee. */
export function Hero() {
  // The committee's top, just under the hero. Landed under the fixed bar, so
  // the button puts the committee where arriving at its address does.
  const end = useRef<HTMLDivElement>(null);
  const toCommittee = () =>
    end.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  return (
    <>
      {/* A screen of its own, so the committee begins below the fold and the
          button is what says it is there. The block sits in the middle of that
          screen rather than at the top, so the space a tall window leaves over
          is split above and below it. Where the steps are taller than the
          window, as down a phone, it is simply as tall as they are. Capped at
          the reading width the other pages use, because the committee page's
          column runs wider and five steps across all of it spread apart.

          One of the page's two resting places, the committee being the other
          (see the snapping in the committee page). The margin is the bar's
          height, so resting here puts the hero's top just under the bar
          rather than behind it.

          The large viewport rather than the small one: on a phone whose
          toolbars have folded away, a hero sized to the small one leaves the
          committee's top showing under it, which is the half and half state
          the snapping exists to rule out. */}
      <section className="max-w-[1180px] min-h-[calc(100lvh-var(--nav-h))] flex flex-col py-[32px] snap-start snap-always scroll-mt-[var(--nav-h)]">
        <div className="my-auto">
          {/* Lexend, as every other page's heading, and a step over them:
              this heads the whole place, and the committee's own title, in
              Nunito, now takes the size this used to be. */}
          <div className="@container">
            <h1 className="font-display font-bold text-[36px] @[800px]:text-[48px] leading-[1.15] text-[#0f2275] text-balance">
              Conference Committees
            </h1>
          </div>
          <p className="max-w-[720px] font-body text-base sm:text-lg text-ink leading-[1.55] mt-[6px]">
            {LEAD}
          </p>
          <div className="mt-[36px]">
            <Steps />
          </div>
          <p className="mt-[24px] font-body text-xs text-ink-faint leading-[1.6]">
            From MAPLE&rsquo;s{" "}
            <a
              href={MAPLE_PROCESS}
              target="_blank"
              rel="noreferrer"
              className={LINK}
            >
              guide to the legislative process
            </a>{" "}
            and the legislature&rsquo;s{" "}
            <a
              href={JOINT_RULES}
              target="_blank"
              rel="noreferrer"
              className={LINK}
            >
              Joint Rules
            </a>
            .
          </p>
          <div className="mt-[32px] flex flex-wrap items-center gap-x-[24px] gap-y-[12px]">
            <button
              type="button"
              onClick={toCommittee}
              className="inline-flex items-center gap-[8px] bg-brand text-ink-inverse font-body font-semibold text-sm px-[18px] py-[8px] rounded-pill cursor-pointer hover:bg-brand-hover"
            >
              See the committees
              <ArrowDown aria-hidden className="w-[16px] h-[16px]" />
            </button>
            {/* The explorer's way in, now that the landing is no longer it.
                Quieter than the button, which is the way on. */}
            <Link
              to="/conferenceCommittees/explorer"
              className="inline-flex items-center gap-[4px] font-body font-semibold text-sm text-link hover:text-brand"
            >
              {EXPLORER}
              <ArrowRight aria-hidden className="w-[14px] h-[14px]" />
            </Link>
          </div>
        </div>
      </section>
      <div ref={end} aria-hidden className="scroll-mt-[var(--nav-h)]" />
    </>
  );
}
