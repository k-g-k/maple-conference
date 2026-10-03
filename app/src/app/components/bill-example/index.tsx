// A bill page, in the alt-3 language.
//
// Route: /bills/:billId, where billId is the number, e.g. "h5630".
//
// This is the bill's own page and the source of truth for the bill, whatever
// stage it is at. It knows nothing about conference committees; that is a
// separate thing that will point at these pages rather than change them.
//
// The same shell as the ballot pages: a nav, a contents bar, chapters down the
// middle, and the rail on the right holding testimony. What differs is the
// subject. A ballot question is one decision with two outcomes; a bill is a
// document with a number, a sponsor, and a history, so the hero leads with the
// number and the last thing that happened to it.

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Menu, Plus, X } from "lucide-react";
import { SourcesProvider, SynthSourcesNote } from "../ballot";
import { SOURCES } from "../../data/tax-rebate-62f";
import {
  BY_SLUG,
  BILLS,
  LINEAGE,
  slugFor,
  type BillRecord,
} from "../../data/bills-194";
import { MapleFab } from "../tax-rebate-62f/maple-fab";
import {
  TestimonyFeed,
  ComposeActions,
  ComposeFields,
  ComposeGuidance,
  type StanceFilter,
  type TypeFilter,
} from "../tax-rebate-62f/testimony";
import type { TestimonyStance } from "../../data/tax-rebate-62f";
import { Rail } from "./rail";
import { BillPicker } from "./picker";
import { LineageStrip } from "./lineage";
import { WhatItDoes, WhoFiledIt, History } from "./sections";
import { BillLineageSection } from "./lineage-section";
import { BillTextSection } from "./bill-text";
import { LINEAGE_TEXTS, TEXT_FOR_STAGE } from "../../data/bill-lineage/texts";
import { SiteNav } from "../site-nav";

// Two tabs while we look at the lineage material. Overview is deliberately
// empty: the page's own content is being rethought and standing it back up
// before that is decided would just be something else to undo.
const CONTENTS = [
  { id: "overview", label: "Overview" },
  { id: "lineage", label: "Bill lineage" },
  { id: "text", label: "Bill text" },
];

/** The panel's default width, as numbers the drag handler can also read. */
const DRAWER_MIN = 400;
const DRAWER_VW = 0.34;
const DRAWER_MAX = 520;
const drawerWidth = () =>
  Math.min(Math.max(DRAWER_MIN, DRAWER_VW * window.innerWidth), DRAWER_MAX);

const RAIL_MAX_SHARE = 0.6;
const RAIL_GUTTER_DROP = 0.4;

function Contents({ active }: { active: string }) {
  return (
    <div className="sticky top-0 lg:top-[calc(var(--nav-h)+1px)] z-20 bg-ground/95 backdrop-blur border-b border-line lg:mr-[var(--taken-w)] transition-[margin] duration-300 ease-out motion-reduce:transition-none [[data-resizing]_&]:transition-none">
      <div className="mx-auto max-w-[1180px] px-[20px] sm:px-[32px] lg:mx-0 lg:max-w-[var(--page-right)] lg:pl-[var(--page-gutter)] lg:pr-[32px]">
        <div className="flex items-stretch gap-[18px] sm:gap-[22px] h-[var(--subnav-h)] overflow-x-auto scrollbar-hide">
          {CONTENTS.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              onClick={(e) => {
                if (
                  window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ) {
                  return;
                }
                const target = document.getElementById(c.id);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", `#${c.id}`);
              }}
              className={`shrink-0 whitespace-nowrap font-body text-sm flex items-center border-b-2 transition-colors ${
                active === c.id
                  ? "text-ink border-brand font-semibold"
                  : "text-ink-mid border-transparent hover:text-ink"
              }`}
            >
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The hero.
 *
 * The number leads, because on a bill the number is the name: it is what a
 * reader arrived with, what they will search for, and what a committee calls
 * it. The title sits under it at reading size rather than heading size, which
 * is the reverse of the ballot pages, where the plain-language name is the
 * thing and the number is a label.
 */
/**
 * What is actually happening to the bill.
 *
 * Not simply the last line of the history. Half the documents on these pages
 * are amendments whose entire record is two entries, and neither is an action:
 * one describes the document ("Text of House amendments to the Senate Bill...")
 * and the other points at the bill it amends ("See S2581"). Reading the bottom
 * of that list gives a status that is not one.
 *
 * So a two-line record is taken to have no status of its own, and the chain is
 * walked upward to the first bill that has a real history. Where that happens
 * the status is labeled with whose record it came from, because it is not this
 * document's.
 */
function statusOf(bill: BillRecord): {
  action: string;
  date: string;
  from?: string;
} | null {
  const describes = (a: string) =>
    /^see\s+[hs]\.?\d+/i.test(a.trim()) || /^text of\b/i.test(a.trim());
  const lastReal = (b: BillRecord | undefined) =>
    b && [...b.history].reverse().find((h) => !describes(h.action));

  if (bill.history.length > 2) {
    const own = lastReal(bill);
    if (own) return { action: own.action, date: own.date };
  }

  // The record's own pointer first. A hollow amendment ends with "See S3064",
  // which names the document its history continues on, and that is a more
  // direct answer than anything the lineage chain can offer.
  const pointer = [...bill.history]
    .reverse()
    .map((h) => /^see\s+([hs])\.?(\d+)/i.exec(h.action.trim()))
    .find(Boolean);
  if (pointer) {
    const named = `${pointer[1].toUpperCase()}.${pointer[2]}`;
    const rec = BILLS[named];
    const found = lastReal(rec);
    if (found && rec.history.length > 2)
      return { action: found.action, date: found.date, from: named };
  }

  // Failing that, up the chain, skipping any step we hold no record for.
  const chain = LINEAGE[bill.number] ?? [];
  for (const up of [...chain.slice(0, -1)].reverse()) {
    const rec = BILLS[up];
    if (!rec || rec.history.length <= 2) continue;
    const found = lastReal(rec);
    if (found) return { action: found.action, date: found.date, from: up };
  }

  const fallback = lastReal(bill);
  return fallback ? { action: fallback.action, date: fallback.date } : null;
}

/**
 * The status in words a reader has.
 *
 * The record's own wording is a clerk's: "Committee of conference appointed
 * (Peisch-F. Moran-Vieira), in concurrence" means the House agreed to a
 * conference and named its three. Quoting it verbatim is good provenance and
 * bad reading, and it also makes two bills at the same stage look different
 * because different clerks wrote the lines. The exact wording stays available
 * on the element itself.
 */
function plainStatus(action: string): string {
  if (/committee of conference appointed/i.test(action))
    return "In conference committee";
  if (/published as amended/i.test(action)) return "Published as amended";
  const sub = /^substituted for\s+([hs])\.?(\d+)/i.exec(action.trim());
  if (sub) return `Substituted for ${sub[1].toUpperCase()}.${sub[2]}`;
  return action;
}

function Brief({ bill }: { bill: BillRecord }) {
  return (
    <div className="@container mx-auto max-w-[1180px] px-[20px] sm:px-[32px] pt-[48px] sm:pt-[64px] pb-[48px] sm:pb-[64px] lg:mx-0 lg:max-w-[var(--page-right)] lg:pl-[var(--page-gutter)] lg:pr-[32px]">
      {/* A breadcrumb rather than a standalone label: it says where the page
          sits as well as what the document is, and gives a reader a way back
          out, which this page had none of. */}
      <nav
        aria-label="Where this page sits"
        className="font-body text-sm text-ink-mid flex items-center gap-[7px] flex-wrap"
      >
        <span>Bills</span>
        <span aria-hidden className="text-ink-faint">
          ›
        </span>
        <span>194th General Court</span>
        <span aria-hidden className="text-ink-faint">
          ›
        </span>
        <span className="font-semibold text-brand">{bill.number}</span>
      </nav>

      <h1 className="font-display font-medium text-3xl @[980px]:text-[48px] leading-[1.15] tracking-display text-ink mt-[16px]">
        {bill.number}
      </h1>
      <p className="font-body text-xl @[980px]:text-2xl text-ink leading-[1.4] mt-[10px] max-w-[46ch] text-balance">
        {bill.title}
      </p>

      {/* What the record says is happening to it, which both of the mocks lead
          with and this page did not show at all. */}
      {(() => {
        const status = statusOf(bill);
        if (!status) return null;
        return (
          <p className="font-body text-base text-ink-mid leading-[1.5] mt-[18px] max-w-[62ch]">
            <span className="font-semibold text-brand">Current status: </span>
            <span title={status.action}>{plainStatus(status.action)}</span>
            {/* The bill this came off, as a link rather than a phrase. It only
                appears where the status is another document's, so the link is
                both the attribution and the way to go read it. */}
            {status.from && (
              <>
                {" "}
                <Link
                  to={`/bills/${slugFor(status.from)}`}
                  className="font-semibold underline decoration-dotted underline-offset-[4px] text-official-ink hover:text-official"
                >
                  {status.from}
                </Link>
              </>
            )}
          </p>
        );
      })()}

      {/* MAPLE's own subject tags, shown as labels rather than links. MAPLE's
          search has no topic facet, so there is no URL that means "other bills
          about this" to point them at. The category is the tooltip. */}
      {bill.topics?.length ? (
        <ul className="flex flex-wrap gap-[7px] mt-[18px]">
          {bill.topics.map((t) => (
            <li key={`${t.category}-${t.topic}`}>
              <span
                title={t.category}
                className="inline-block font-body text-xs text-ink-mid bg-surface border border-line rounded-pill px-[11px] py-[4px]"
              >
                {t.topic}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * A bill this prototype does not carry.
 *
 * Out to the General Court rather than back to the index: the reader came for
 * one bill, and the place that has it is one press away.
 */
function NoBill({ number }: { number?: string }) {
  const shown = number ? number.toUpperCase().replace(/^([HS])/, "$1.") : null;
  return (
    <div className="bg-ground min-h-screen font-body text-ink">
      <main className="mx-auto max-w-[680px] px-[20px] sm:px-[32px] pt-[48px]">
        <h1 className="font-display font-semibold text-2xl text-ink">
          {shown ?? "That bill"} is not in this prototype
        </h1>
        <p className="font-body text-base text-ink-mid leading-[1.6] mt-[12px]">
          Only some of the 194th General Court's bills are bundled here.{" "}
          {shown && (
            <a
              href={`https://malegislature.gov/Bills/194/${shown.replace(".", "")}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline decoration-dotted underline-offset-[3px] text-link hover:text-brand"
            >
              Read {shown} on malegislature.gov
            </a>
          )}
          {shown ? ", or go " : "Go "}
          <Link
            to="/conferenceCommittees"
            className="font-semibold underline decoration-dotted underline-offset-[3px] text-link hover:text-brand"
          >
            back to the conference committees
          </Link>
          .
        </p>
      </main>
    </div>
  );
}

export function BillExample() {
  const { billId } = useParams();
  const bill = billId ? BY_SLUG[billId] : undefined;
  // An unknown number says so. It used to go to the first bill instead, on the
  // grounds that a prototype should always land on something, and that turned
  // out to be the worse failure: a reader who pressed H.5175 arrived on H.5630
  // with the page presenting it as the bill they had asked for. A dead end you
  // can see beats a wrong answer you cannot.
  if (!bill) return <NoBill number={billId} />;
  return <BillPage bill={bill} />;
}

function BillPage({ bill }: { bill: BillRecord }) {
  // One selection, two views of it. The lineage names a step and the text
  // viewer names a document, and each step that produced a document is tied to
  // it, so choosing either moves the other.
  const [stage, setStage] = useState("conf");
  // The bill this page is about, not the last document of somebody else's
  // lineage. Seeding from the lineage put one bill's text under every bill's
  // number, which was invisible while one bill was reachable and is not now.
  const [textNumber, setTextNumber] = useState(bill.number);
  // Only one bill's lineage is transcribed, so only on its page does a step name
  // a document the viewer can show. Elsewhere the stepper moves on its own and
  // the viewer stays on the bill the page is about.
  const stepsCarryText = LINEAGE_TEXTS.some((d) => d.number === bill.number);
  const pickStage = (id: string) => {
    setStage(id);
    const doc = stepsCarryText ? TEXT_FOR_STAGE[id] : undefined;
    if (doc) setTextNumber(doc);
  };
  const pickText = (n: string) => {
    setTextNumber(n);
    const doc = LINEAGE_TEXTS.find((d) => d.number === n);
    if (doc) setStage(doc.stage);
  };
  const [rail, setRail] = useState<"open" | "min">("min");
  const [railView, setRailView] = useState("testimony");
  const [stance, setStance] = useState<StanceFilter>("all");
  const [accountType, setAccountType] = useState<TypeFilter>("all");
  const [railCount, setRailCount] = useState(0);
  const [railFiltered, setRailFiltered] = useState(false);
  const [railReset, setRailReset] = useState(0);
  const [composeStance, setComposeStance] =
    useState<TestimonyStance>("endorse");
  const [askOpen, setAskOpen] = useState(false);
  const [active, setActive] = useState(CONTENTS[0].id);

  const shellRef = useRef<HTMLDivElement>(null);
  // What the reader dragged the panel to, remembered so collapsing and
  // reopening returns to it rather than snapping back to the default.
  const railWidthRef = useRef<number | null>(null);

  /** Write the dragged width to the DOM, or clear it and fall back to the presets. */
  const applyRailWidth = (px: number | null) => {
    const el = shellRef.current;
    if (!el) return;
    if (px === null) {
      // Inline styles beat the class ternaries, which is what makes a dragged
      // width stick. Collapsing has to remove them or the page keeps the
      // margin it had while the panel was open.
      el.style.removeProperty("--rail-w");
      el.style.removeProperty("--taken-w");
      return;
    }
    el.style.setProperty("--rail-w", `${px}px`);
    el.style.setProperty("--taken-w", `${px}px`);
  };

  const setRailWidth = (px: number | null) => {
    const el = shellRef.current;
    if (!el) return;
    if (px === null) {
      railWidthRef.current = null;
      applyRailWidth(null);
      el.removeAttribute("data-resizing");
      return;
    }
    const w = Math.round(
      Math.min(Math.max(px, drawerWidth()), RAIL_MAX_SHARE * window.innerWidth),
    );
    el.dataset.resizing = "true";
    railWidthRef.current = w;
    applyRailWidth(w);
  };

  /** Drag over: the width stays, the "do not animate" flag does not. */
  const endRailResize = () =>
    shellRef.current?.removeAttribute("data-resizing");

  const clearRailFilters = () => {
    setStance("all");
    setAccountType("all");
    setRailReset((n) => n + 1);
  };
  const openRailClean = () => {
    clearRailFilters();
    applyRailWidth(railWidthRef.current);
    setRailView("testimony");
    setRail("open");
  };
  const collapseRail = () => {
    clearRailFilters();
    // The strip has one width, so the dragged one has to come off or the page
    // stays pushed over by a panel that is no longer there.
    applyRailWidth(null);
    setRail("min");
  };

  useEffect(() => {
    const onScroll = () => {
      const seen = CONTENTS.filter((c) => {
        const el = document.getElementById(c.id);
        return el && el.getBoundingClientRect().top <= 160;
      });
      setActive(seen.length ? seen[seen.length - 1].id : CONTENTS[0].id);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <SourcesProvider value={SOURCES}>
      <div
        ref={shellRef}
        style={
          {
            "--drawer-w": `clamp(${DRAWER_MIN}px, ${DRAWER_VW * 100}vw, ${DRAWER_MAX}px)`,
            "--rail-share": `calc((${RAIL_GUTTER_DROP * 100}vw - var(--taken-w, 0px)) * 1000)`,
            "--page-gutter":
              "max(32px, min(calc((100vw - min(1180px, 100vw)) / 2 + 32px), var(--rail-share)))",
            "--page-right":
              "min(100vw, max(calc((100vw - min(1180px, 100vw)) / 2 + 1180px), calc(-1 * var(--rail-share))))",
          } as CSSProperties
        }
        className={`bg-ground min-h-screen font-body text-ink overflow-x-clip [--rail-tab-w:44px] lg:[--fab-r:calc(var(--taken-w)+24px)] [--subnav-h:46px] ${
          rail === "open"
            ? "lg:[--rail-w:var(--drawer-w)] lg:[--taken-w:var(--drawer-w)]"
            : "lg:[--rail-w:var(--rail-tab-w)] lg:[--taken-w:var(--rail-tab-w)]"
        }`}
      >
        <SiteNav />
        <div className="lg:mr-[var(--taken-w)] transition-[margin] duration-300 ease-out motion-reduce:transition-none [[data-resizing]_&]:transition-none">
          <Brief bill={bill} />
        </div>
        {/* Parked: the Pinslip chain as a strip above the contents bar. The
            lineage section below covers the same ground with far more, so two
            of them would be two answers to one question.
        <LineageStrip bill={bill} />
        */}
        <Contents active={active} />
        <div className="lg:mr-[var(--taken-w)] lg:[--page-w:calc(100vw-var(--taken-w))] transition-[margin] duration-300 ease-out motion-reduce:transition-none [[data-resizing]_&]:transition-none">
          <main className="mx-auto max-w-[1180px] px-[20px] sm:px-[32px] pt-[36px] sm:pt-[48px] pb-[80px] flex flex-col gap-[44px] sm:gap-[64px] lg:mx-0 lg:max-w-[var(--page-right)] lg:pl-[var(--page-gutter)] lg:pr-[32px]">
            {/* Still parked while the page is rethought: what it does, and
                the action history. Both read from the legislature's record and
                come back by uncommenting.
            <WhatItDoes bill={bill} />
            <History bill={bill} />
            */}
            <section
              id="overview"
              className="scroll-mt-[76px] lg:scroll-mt-[132px]"
            >
              {/* The plain-language summary, in the synthesis treatment the ballot
              pages use: the purple rule, greyed until you reach it. A bill has no
              official summary, so this is MAPLE's or it is nothing, and the empty
              state says which rather than leaving a gap the reader has to explain
              to themselves. */}
              {/* On a card rather than bare on the ground. It separates what the bill
              is, which is the record's, from what it means in plain words, which is
              MAPLE's; and on a cooler paper a white card is what carries text. The
              coral rule stays as the card's left edge, still marking the synthesis
              rather than being decoration. */}
              <div className="max-w-[74ch]">
                <div className="group relative bg-surface border border-line rounded-card overflow-hidden pl-[16px] sm:pl-[22px] pr-[18px] py-[18px]">
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-ai grayscale-[50%] group-hover:filter-none"
                  />
                  {bill.summary ? (
                    <>
                      <p className="font-body text-lg text-ink leading-[1.65] text-pretty">
                        {bill.summary}
                      </p>
                      {/* Under the text, the way the ballot pages mark
                          synthesis: the chip labels the layer, and where the
                          summary came from is behind "Check our work" rather
                          than printed under every bill. No source ids here,
                          because a bill's material is the bill, which is not in
                          any registry: the note says it in words instead. */}
                      <div className="mt-[14px]">
                        <SynthSourcesNote
                          ids={[]}
                          note={
                            <>
                              Written by MAPLE from the bill text. The
                              legislature publishes no plain-language summary of
                              a bill, so there is no official version to check
                              this against.
                              {bill.summarySource &&
                                bill.summarySource !== bill.number && (
                                  <>
                                    {" "}
                                    This one was written from{" "}
                                    <span className="font-semibold">
                                      {bill.summarySource}
                                    </span>
                                    , the bill {bill.number} came out of,
                                    because {bill.number} has no summary of its
                                    own.
                                  </>
                                )}
                            </>
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <p className="font-body text-lg text-ink-mid leading-[1.65] text-pretty">
                      No plain-language summary yet. MAPLE generates these from
                      the bill text; the legislature publishes none.
                    </p>
                  )}
                </div>
              </div>
            </section>
            {/* Who filed it, back in the overview. The sponsor record is the
                legislature's own and it is the part of a bill a reader can act
                on, so it belongs above the lineage rather than behind it. */}
            <WhoFiledIt bill={bill} />
            <BillLineageSection
              bill={bill}
              active={stage}
              onActive={pickStage}
            />
            <BillTextSection
              bill={bill}
              number={textNumber}
              onNumber={pickText}
            />
          </main>
        </div>

        <Rail
          views={[
            {
              id: "testimony",
              title: "Testimony",
              action: railFiltered ? (
                <button
                  onClick={clearRailFilters}
                  className="shrink-0 font-body font-semibold text-xs text-brand-ink hover:text-brand cursor-pointer"
                >
                  Clear filters
                </button>
              ) : undefined,
              content: (
                <div className="flex-1 min-h-0 overflow-y-auto px-[var(--rail-pad,18px)] pb-[22px] [--pinned-h:0px]">
                  <TestimonyFeed
                    filter={stance}
                    onFilterChange={setStance}
                    typeFilter={accountType}
                    onTypeFilterChange={setAccountType}
                    hideAddButton
                    // Blank for now. The only testimony in this prototype was
                    // filed on Question 5, and showing it under a bill would
                    // say people testified on something they did not.
                    items={[]}
                    stickyTop="var(--pinned-h)"
                    includeFollowingFilter
                    includeTypeFilter
                    asCards
                    onCountChange={setRailCount}
                    onFilteredChange={setRailFiltered}
                    resetSignal={railReset}
                  />
                </div>
              ),
            },
            {
              id: "compose",
              title: "Write Testimony",
              surface: "bg-surface",
              content: (
                <div className="flex-1 min-h-0 flex flex-col gap-[16px] px-[var(--rail-pad,18px)] pt-[12px] pb-[22px]">
                  <div className="shrink-0 bg-sunken rounded-control p-[16px]">
                    <ComposeGuidance compact />
                  </div>
                  <ComposeFields
                    stance={composeStance}
                    onStanceChange={setComposeStance}
                    grow
                    bare
                  />
                  <div className="shrink-0">
                    <ComposeActions onCancel={() => setRailView("testimony")} />
                  </div>
                </div>
              ),
            },
          ]}
          view={railView}
          onViewChange={setRailView}
          open={rail === "open"}
          onOpenChange={(o) => (o ? openRailClean() : collapseRail())}
          count={railCount}
          onAdd={() => setRailView("compose")}
          addLabel="Write testimony"
          onResize={setRailWidth}
          onResizeEnd={endRailResize}
        />

        <div className="fixed bottom-[24px] right-[var(--fab-r,24px)] z-50 flex items-center gap-[12px] transition-[right] duration-300 ease-out motion-reduce:transition-none [[data-resizing]_&]:transition-none">
          <MapleFab inline open={askOpen} onOpenChange={setAskOpen} />
          <button
            onClick={() => {
              setRailView("compose");
              setRail("open");
            }}
            aria-label="Write testimony"
            className="group hidden lg:inline-flex items-center h-[52px] px-[16px] rounded-pill border border-brand bg-brand text-ink-inverse hover:bg-brand-hover hover:border-brand-hover cursor-pointer transition-colors"
          >
            <Plus className="w-[22px] h-[22px] shrink-0" />
            <span className="grid grid-cols-[0fr] group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr] transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none">
              <span className="overflow-hidden">
                <span className="block pl-[10px] pr-[2px] font-body font-semibold text-sm whitespace-nowrap">
                  Write testimony
                </span>
              </span>
            </span>
          </button>
        </div>
        <BillPicker />
      </div>
    </SourcesProvider>
  );
}

export default BillExample;
