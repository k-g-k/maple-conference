import { useMemo, useState, type Ref } from "react";
import { ChevronUp } from "lucide-react";
import { Pagination } from "../ballot";
import { useNarrow } from "../use-narrow";
import { Chapter, Span } from "../bill-example/spine";
import type { CommitteeDetail } from "../../data/conference-committees/committees";
import {
  orgLobbying,
  type OrgBillSide,
  type OrgLobbying,
} from "../../data/conference-committees/lobbying";

/**
 * Twenty rows a page, which is more than any committee currently has, so the
 * table pages at six, which is short enough that the foot of the list is in
 * view with its head, and the count in the footer says how many there are in
 * all rather than how many are on this page.
 */
const PAGE_SIZE = 6;

/** Where a position gets a color, and where it does not. */
const POSITION_TONE: Record<string, string> = {
  Support: "bg-positive-soft text-positive-ink",
  Oppose: "bg-negative-soft text-negative-ink",
  Neutral: "bg-wash text-ink-mid",
};

function Position({ position }: { position: string }) {
  // A filer can leave the field empty, and an empty chip would read as a
  // position of some kind. Say that nothing was recorded instead.
  if (!position.trim())
    return (
      <span className="font-body text-xs text-ink-faint italic">
        None recorded
      </span>
    );
  return (
    <span
      className={`inline-block font-body font-semibold text-2xs px-[9px] py-[2px] rounded-pill ${
        POSITION_TONE[position] ?? "bg-wash text-ink-mid"
      }`}
    >
      {position}
    </span>
  );
}

/**
 * Five columns on a wide screen; one stack on a phone.
 *
 * All five share the width rather than two names taking it and three fixed
 * columns crowding into what is left, which on a wide table left the two bill
 * headings pushed together in the middle with a gap either side of them.
 *
 * Half the width to the two names, half to the three facts. The names hold the
 * only strings that can run long, so they split their half unevenly, the
 * organisation taking more than the lobbyist. The three on the right are a
 * chip, a chip and a year, all short and of fixed length.
 *
 * The last three take only what their content needs rather than a share of the
 * row: as fractions they held width a pill never used, and the slack sat idle
 * beside a long organisation name wrapping onto a second line. The two text
 * columns divide what is left, which is where the wrapping actually matters.
 */
const COLS =
  "sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_minmax(72px,max-content)_minmax(72px,max-content)_minmax(56px,max-content)]";

/** Which column the table is ordered by. */
type SortKey = "lobbyist" | "org" | "senate" | "house" | "filed";

/**
 * Where a position sits in an ordering.
 *
 * Support first and silence last, so sorting a bill column puts the people who
 * asked for something at the top and the people who filed on the other bill at
 * the bottom. A row with more than one position on a bill takes its strongest.
 */
const POSITION_RANK: Record<string, number> = {
  Support: 0,
  Oppose: 1,
  Neutral: 2,
};

const sideRank = (side: OrgBillSide | null) =>
  side
    ? Math.min(...side.positions.map((p) => POSITION_RANK[p] ?? 3), 3)
    : // No filing on this bill, which is not a position and sorts below them.
      4;

/** The text a cell shows, which is what that column sorts by. */
const lobbyistLabel = (o: OrgLobbying) =>
  o.ownFiling
    ? o.name
    : o.lobbyists.length === 1
      ? o.lobbyists[0]
      : `${o.lobbyists.length} lobbyists`;

const firstYear = (o: OrgLobbying) => {
  const years = [...(o.senate?.years ?? []), ...(o.house?.years ?? [])];
  return years.length ? Math.min(...years) : Infinity;
};

/** How one column compares two rows, ascending. */
const COMPARE: Record<SortKey, (a: OrgLobbying, b: OrgLobbying) => number> = {
  lobbyist: (a, b) => lobbyistLabel(a).localeCompare(lobbyistLabel(b)),
  org: (a, b) => a.name.localeCompare(b.name),
  senate: (a, b) => sideRank(a.senate) - sideRank(b.senate),
  house: (a, b) => sideRank(a.house) - sideRank(b.house),
  filed: (a, b) => firstYear(a) - firstYear(b),
};

/**
 * A column heading, and the control that orders by it.
 *
 * The whole heading is the target rather than an icon beside it, because the
 * word is what a reader aims at. The caret only appears on the column in use:
 * five carets would say five columns were sorted.
 */
function Head({
  children,
  sortKey,
  sort,
  onSort,
  align = "left",
}: {
  children: React.ReactNode;
  sortKey?: SortKey;
  sort?: { key: SortKey; dir: 1 | -1 };
  onSort?: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const type =
    "font-body font-semibold text-2xs uppercase tracking-[0.07em] text-ink-mid";
  if (!sortKey || !onSort) return <span className={type}>{children}</span>;
  const on = sort?.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      aria-label={`Sort by ${String(children)}`}
      className={`group inline-flex items-center gap-[5px] cursor-pointer hover:text-ink transition-colors ${type} ${
        on ? "text-ink" : ""
      } ${
        // The caret keeps its width when it is hidden, so on the right-hand
        // column it would sit between the label and the edge the label is
        // supposed to meet. Reversed, the label ends flush and the caret
        // grows to its left.
        align === "right"
          ? "flex-row-reverse justify-self-end text-right"
          : "text-left"
      }`}
    >
      {children}
      <ChevronUp
        aria-hidden
        className={`w-[12px] h-[12px] shrink-0 transition-[transform,opacity] ${
          on
            ? sort.dir === 1
              ? "opacity-100"
              : "opacity-100 rotate-180"
            : "opacity-0 group-hover:opacity-40"
        }`}
      />
    </button>
  );
}

/** The name of a bill column, on a phone where there is no header row to carry it. */
function StackLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="sm:hidden font-body font-semibold text-2xs uppercase tracking-[0.07em] text-ink-faint">
      {children}
    </span>
  );
}

/**
 * Who filed: the lobbyist's name where there is one of them, the count where
 * there are more.
 *
 * Four names in a table cell would out-weigh the row they belong to, so the
 * cell holds the count and the names sit in the footnote tooltip `Segments`
 * uses in the 62F spine: same anchoring, same surface, same shadow. The trigger
 * is a button rather than that pattern's inline span, because the names have to
 * be reachable without a pointer, and it opens on plain `focus` rather than
 * `focus-visible` so that a tap gets them too.
 */
function Lobbyists({ org }: { org: OrgLobbying }) {
  // The registry recorded no client, which is a lobbyist working for
  // themselves. The row is keyed by their own name, so that name is the
  // lobbyist, and the column beside it says there was nobody behind them.
  if (org.ownFiling || org.lobbyists.length === 1)
    return (
      <span className="font-body text-sm text-ink-mid">
        {org.ownFiling ? org.name : org.lobbyists[0]}
      </span>
    );

  return (
    <button
      type="button"
      // The visible text is the count, so the names have to reach a screen
      // reader some other way: a tooltip hidden with `display: none` is not part
      // of the button's accessible name.
      aria-label={`${org.lobbyists.length} lobbyists: ${org.lobbyists.join(", ")}`}
      className="group/fn relative inline-flex items-baseline text-left font-body text-sm text-ink-mid cursor-default underline decoration-dotted decoration-line-strong underline-offset-[4px]"
    >
      {org.lobbyists.length} lobbyists
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 bottom-full mb-[8px] hidden group-hover/fn:block group-focus/fn:block w-[260px] max-w-[80vw] bg-surface border border-line-strong rounded-control shadow-popover p-[12px] z-[80] font-body font-normal text-sm text-ink leading-[1.55] text-left"
      >
        {org.lobbyists.join(", ")}
      </span>
    </button>
  );
}

/** Who the lobbyist was filing for, where anyone hired them. */
function OnBehalfOf({ org }: { org: OrgLobbying }) {
  if (org.ownFiling)
    return (
      <span className="font-body text-sm text-ink-faint italic">
        Filed for themselves
      </span>
    );
  return (
    <span className="font-body font-semibold text-sm text-ink">
      {/* On a phone the columns become a stack, where "for" is what tells the
          second line apart from the first. */}
      <span className="sm:hidden font-normal text-ink-faint">for </span>
      {org.name}
    </span>
  );
}

/** One organisation's position on one bill, or the fact that they left it alone. */
function BillCell({
  side,
  label,
}: {
  side: OrgBillSide | null;
  label: string;
}) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-[7px] gap-y-[3px]">
      <StackLabel>{label}</StackLabel>
      {side ? (
        side.positions.map((p) => <Position key={p} position={p} />)
      ) : (
        // Silence is not neutrality. An organisation that never filed on this
        // bill gets said so, not a gray chip that reads as a recorded position.
        <span className="font-body text-xs text-ink-faint italic">
          No filing
        </span>
      )}
    </span>
  );
}

/**
 * The disclosure year, and which bill it belongs to when the two differ.
 *
 * Filings are semi-annual, so one organisation's two bills can land in
 * different years. One year for everything is one number; anything else has to
 * name the bill it goes with or the column is ambiguous.
 */
function Filed({
  org,
  senateLabel,
  houseLabel,
}: {
  org: OrgLobbying;
  senateLabel: string;
  houseLabel: string;
}) {
  const sides = [
    { side: org.senate, label: senateLabel },
    { side: org.house, label: houseLabel },
  ].filter((s): s is { side: OrgBillSide; label: string } => !!s.side);
  const years = [...new Set(sides.flatMap((s) => s.side.years))].sort(
    (a, b) => a - b,
  );

  return (
    <span className="flex flex-wrap items-baseline gap-x-[7px] gap-y-[2px] font-body text-xs text-ink-faint tabular-nums sm:text-right sm:justify-end">
      <StackLabel>Filed</StackLabel>
      {years.length <= 1 ? (
        <span>{years[0]}</span>
      ) : (
        sides.map((s) => (
          <span key={s.label} className="sm:block sm:w-full">
            {s.side.years.join(", ")} ({s.label})
          </span>
        ))
      )}
    </span>
  );
}

function Row({
  org,
  senateLabel,
  houseLabel,
}: {
  org: OrgLobbying;
  senateLabel: string;
  houseLabel: string;
}) {
  return (
    <div
      // The rule runs the full width of the table rather than stopping at the
      // words, and the padding that holds the cells off it is on the row. The
      // last row has the footer's own rule under it already.
      //
      // Vertical only. The card around the section holds the gutter, so an
      // inset here would start the columns in from the heading above them.
      className={`grid grid-cols-1 ${COLS} gap-x-[16px] gap-y-[3px] sm:items-baseline py-[12px] border-b border-line-ghost last:border-b-0 hover:bg-[rgba(0,0,0,0.01)] transition-colors`}
    >
      {/* The lobbyist leads, because they are who filed, but the
          organisation behind them is the name a reader is looking for, so it
          is the darker of the two. */}
      <span>
        <Lobbyists org={org} />
      </span>
      <span>
        <OnBehalfOf org={org} />
      </span>
      <BillCell side={org.senate} label={senateLabel} />
      <BillCell side={org.house} label={houseLabel} />
      <Filed org={org} senateLabel={senateLabel} houseLabel={houseLabel} />
    </div>
  );
}

/**
 * Who registered to lobby on this conference's two bills.
 *
 * One table for both bills, one row per organisation. The chamber toggle this
 * replaced could show either list but never the relation between them, and the
 * relation is the finding: the same firm can work both sides, and hold one
 * position on the Senate bill and the opposite on the House one. Side by side
 * that is a row a reader can see; a toggle asks them to hold the first list in
 * their head while they read the second.
 */
export function LobbyingDisclosures({
  c,
  titleClass,
  hideQuestion,
  flush,
  stickyHeading,
  narrowPin,
  bandHeading,
  headingRef,
  headerTop,
}: {
  c: CommitteeDetail;
  titleClass?: string;
  hideQuestion?: boolean;
  flush?: boolean;
  stickyHeading?: string;
  narrowPin?: boolean;
  bandHeading?: boolean;
  headingRef?: Ref<HTMLDivElement>;
  /** Where the column heads come to rest, for a page that pins them. Left
   *  off, they scroll with the table. */
  headerTop?: string;
}) {
  const [page, setPage] = useState(0);
  // One at a time on a phone, where each row is a stack of its own.
  const narrow = useNarrow();
  const size = narrow ? 1 : PAGE_SIZE;
  /**
   * How the table is ordered, or nothing for the order the data came in.
   *
   * The third press on a column clears it rather than cycling back to
   * ascending: the order the register gave us is a state worth being able to
   * get back to, and there is no other control that returns to it.
   */
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);
  const unsorted = orgLobbying(c.senateBill?.n, c.houseBill?.n);
  const rows = useMemo(() => {
    if (sort)
      return [...unsorted].sort((a, b) => COMPARE[sort.key](a, b) * sort.dir);
    if (!narrow) return unsorted;
    const a = [...unsorted];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
    // The list is rebuilt from the committee's two bill numbers on every
    // render, so it is those, not the array, that say when this is stale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.senateBill?.n, c.houseBill?.n, sort, narrow]);
  const onSort = (key: SortKey) =>
    setSort((v) => {
      setPage(0);
      if (v?.key !== key) return { key, dir: 1 };
      return v.dir === 1 ? { key, dir: -1 } : null;
    });
  const filings = rows.reduce(
    (n, o) => n + (o.senate?.count ?? 0) + (o.house?.count ?? 0),
    0,
  );

  // The column heading is the bill number where there is one. A committee whose
  // bills are not recorded yet still gets a table shape that names the chambers.
  const senateLabel = c.senateBill?.n ?? "Senate";
  const houseLabel = c.houseBill?.n ?? "House";

  const pageCount = Math.max(1, Math.ceil(rows.length / size));
  // Clamped as well as reset, because the row count changes with the committee
  // and the reader should never land on a blank page.
  const current = Math.min(page, pageCount - 1);
  const paged = rows.slice(current * size, current * size + size);

  /**
   * Why there is nothing here.
   *
   * One sentence, and it says the true thing rather than something about this
   * committee. The phones conference was transcribed by hand and the rest have
   * never been fetched, so an empty table is a gap in what we loaded, not a
   * finding that nobody lobbied. The page should not let a reader take it for
   * one.
   */
  const empty =
    "Lobbying disclosures will go here. They are held in MAPLE's own lobbying database, and this prototype has no access to the Firestore API that serves it, so only the phone-free schools conference has been loaded so far.";

  return (
    <Chapter
      id="lobbying"
      question="Lobbying Disclosures"
      titleClass={titleClass}
      hideQuestion={hideQuestion}
      flush={flush}
      stickyHeading={stickyHeading}
      narrowPin={narrowPin}
      bandHeading={bandHeading}
      headingRef={headingRef}
    >
      <div>
        {rows.length > 0 ? (
          <>
            {/* Head and foot on the page, rows on a card. They were inside
                the frame before, which put a tinted band inside a rounded,
                bordered box: the band's corners could not meet the card's,
                because the card's own border sits between them, and a pinned
                band carrying rounded corners down the middle of a table read
                as a mistake. Out here the chrome is chrome, the card holds
                only the data, and the pinned head passes over the white
                rows with nothing to line up with. */}
            <div>
              {/* The head is a wide-screen affordance. Stacked on a phone the
                  rows label themselves, and five headings over a one-column
                  stack would only name the first line. */}
              {/* The heads and the rows, and nothing else. A sticky element
                  is held by its parent, so this box is what decides where the
                  heads let go: the moment the last row is past, rather than
                  after the count line that follows it. */}
              <div>
                <div
                  style={headerTop ? { top: headerTop } : undefined}
                  // The same `--band` the pinned heading above it reads, so
                  // the head follows the surface it sits on: white inside a
                  // white card, the page's own ground where there is no card.
                  className={`hidden sm:grid ${COLS} gap-x-[16px] pb-[8px] bg-[var(--band,var(--color-ground))] border-b border-line ${
                    headerTop ? "sticky z-[6] pt-[10px]" : ""
                  }`}
                >
                  <Head
                    sortKey="lobbyist"
                    sort={sort ?? undefined}
                    onSort={onSort}
                  >
                    Lobbyist
                  </Head>
                  <Head sortKey="org" sort={sort ?? undefined} onSort={onSort}>
                    On behalf of
                  </Head>
                  <Head
                    sortKey="senate"
                    sort={sort ?? undefined}
                    onSort={onSort}
                  >
                    {senateLabel}
                  </Head>
                  <Head
                    sortKey="house"
                    sort={sort ?? undefined}
                    onSort={onSort}
                  >
                    {houseLabel}
                  </Head>
                  <span className="flex justify-end">
                    <Head
                      sortKey="filed"
                      sort={sort ?? undefined}
                      onSort={onSort}
                      align="right"
                    >
                      Filed
                    </Head>
                  </span>
                </div>
                <div>
                  {paged.map((org) => (
                    <Row
                      key={`${org.ownFiling}-${org.name}`}
                      org={org}
                      senateLabel={senateLabel}
                      houseLabel={houseLabel}
                    />
                  ))}
                </div>
              </div>
              {/* The count and the pager share the foot: what you are looking
                  at on the left, how to see the rest on the right. The count
                  stays when there is only one page, because it is a fact
                  about the table rather than a control. */}
              <div className="flex flex-col gap-[6px] pt-[12px] sm:flex-row sm:items-center sm:justify-between sm:gap-[16px]">
                <p
                  className={`font-body text-xs text-ink-mid ${
                    pageCount > 1 ? "hidden sm:block" : ""
                  }`}
                >
                  {rows.length} organization{rows.length === 1 ? "" : "s"},{" "}
                  {filings} filing{filings === 1 ? "" : "s"}
                </p>
                {pageCount > 1 && (
                  <Pagination
                    page={current}
                    pageCount={pageCount}
                    onPage={setPage}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <Span>
            <p className="font-body text-sm text-ink-mid leading-[1.65] max-w-[74ch] border-l-2 border-line-strong pl-[16px]">
              {empty}
            </p>
          </Span>
        )}
      </div>
    </Chapter>
  );
}
