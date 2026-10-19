// One joint committee's page. A shell for now: who sits on it, then an empty
// place for each step a bill takes here, so the bills and hearings work has
// somewhere to land.

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  JOINT_BY_SLUG,
  committeeUrl,
  officer,
  type JointCommittee as Committee,
  type JointMember,
  type JointRole,
} from "../../data/joint-committees/committees";
import { SiteNav } from "../site-nav";
import { Member, NoneListed, VacantSeat } from "../joint-committees/member";

const NAV_COLUMN = "w-full px-[20px] sm:px-[32px]";
const LINK =
  "font-semibold underline decoration-dotted underline-offset-[4px] text-link hover:text-brand";

/**
 * The steps of MAPLE's legislative process that happen inside a joint
 * committee, by the names mapletestimony.org/learn/legislative-process gives
 * them (its chapters 02 to 04). The page will follow that page's order.
 */
const STAGES = [
  "Committee Referral",
  "Public Hearing & Testimony",
  "Committee Report",
];

/** Six to a page, three across and two down, as the lineage's committee panel. */
const PAGE = 6;

/**
 * The three offices that open a chamber's card, in this order. The legislature
 * lists the ranking minority member further down; brought up beside the chair
 * and vice chair, the first row is the committee's three named offices.
 */
const TOP = ["Chair", "Vice Chair", "Ranking Minority"] as const;

type Seat =
  | { kind: "member"; m: JointMember }
  | { kind: "none"; role: JointRole }
  | { kind: "vacant" };

/** A chamber's seats in the order its card shows them. */
function seats(members: JointMember[], vacant: number): Seat[] {
  const top = TOP.map((role): Seat => {
    const m = officer(members, role);
    return m ? { kind: "member", m } : { kind: "none", role };
  });
  const rest = members
    .filter((m) => !TOP.some((role) => role === m.role))
    .map((m): Seat => ({ kind: "member", m }));
  const empty = Array.from({ length: vacant }, (): Seat => ({ kind: "vacant" }));
  return [...top, ...rest, ...empty];
}

/**
 * One chamber's members as their own card, paged six at a time the way the
 * lineage's committee panel pages them: chevrons at the card's edges that show
 * on hover, wrap around, and do nothing when everything fits on one page.
 */
function Roster({
  label,
  members,
  vacant,
}: {
  label: string;
  members: JointMember[];
  vacant: number;
}) {
  const all = seats(members, vacant);
  const pageCount = Math.max(1, Math.ceil(all.length / PAGE));
  const [page, setPage] = useState(0);
  const shown = all.slice(page * PAGE, page * PAGE + PAGE);
  const canStep = pageCount > 1;
  const step = (dir: 1 | -1) =>
    setPage((p) => (p + dir + pageCount) % pageCount);
  const chevron =
    "shrink-0 self-stretch w-[25px] flex items-center justify-center text-ink-mid hover:text-ink hover:bg-wash-strong disabled:text-ink-faint disabled:hover:bg-transparent disabled:cursor-default cursor-pointer opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100";
  return (
    <div>
      <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid mb-[8px]">
        {label}
      </p>
      <div className="group flex items-stretch gap-[4px] bg-sunken rounded-panel overflow-hidden">
        <button
          type="button"
          disabled={!canStep}
          onClick={() => step(-1)}
          aria-label="Previous six"
          className={chevron}
        >
          <ChevronLeft className="w-[14px] h-[14px]" />
        </button>
        {/* Three across wherever three fit, which is the card at full
            width and either side of the page. A phone has room for one. */}
        <div className="@container flex-1 min-w-0 py-[10px]">
          <ul className="grid grid-cols-1 @[440px]:grid-cols-[auto_auto_auto] auto-rows-[minmax(48px,auto)] gap-x-[20px] gap-y-[10px]">
            {shown.map((s, i) => (
              <li key={s.kind === "member" ? s.m.code : `${s.kind}-${page}-${i}`}>
                {s.kind === "member" ? (
                  <Member m={s.m} below />
                ) : s.kind === "none" ? (
                  <NoneListed role={s.role} below />
                ) : (
                  <VacantSeat />
                )}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          disabled={!canStep}
          onClick={() => step(1)}
          aria-label="Next six"
          className={chevron}
        >
          <ChevronRight className="w-[14px] h-[14px]" />
        </button>
      </div>
    </div>
  );
}

function Detail({ c }: { c: Committee }) {
  return (
    <div className="bg-ground min-h-screen font-body text-ink">
      <SiteNav inner={NAV_COLUMN} />
      <main className="mx-auto max-w-[1180px] px-[20px] sm:px-[32px] pt-[20px] pb-[64px]">
        <Link
          to="/jointCommittees"
          className="inline-flex items-center gap-[2px] font-body text-sm text-ink-mid hover:text-ink"
        >
          <ChevronLeft aria-hidden className="w-[16px] h-[16px]" />
          Joint Committees
        </Link>
        <div className="@container mt-[8px]">
          <h1 className="font-display font-bold text-[29.7px] @[800px]:text-[36px] leading-[1.2] text-[#0f2275] text-balance">
            {c.name}
          </h1>
        </div>
        <p className="font-body text-base text-ink-mid mt-[6px]">
          {c.fullName}.{" "}
          <a
            href={committeeUrl(c.code)}
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            View on malegislature.gov
          </a>
        </p>

        <section className="mt-[40px]">
          <h2 className="font-display font-medium text-xl text-ink mb-[12px]">
            Members
          </h2>
          {/* Two cards, Senate on the left and House on the right as on the
              landing page. Each its own height, so a short last page is not
              stretched to match a full one beside it. */}
          <div className="@container">
            <div className="grid items-start gap-x-[20px] gap-y-[24px] @[760px]:grid-cols-2">
              {/* Keyed by committee, so walking to another one opens both
                  cards on their first page. */}
              <Roster
                key={`${c.code}-senate`}
                label="Senate"
                members={c.senate}
                vacant={c.vacant.senate}
              />
              <Roster
                key={`${c.code}-house`}
                label="House"
                members={c.house}
                vacant={c.vacant.house}
              />
            </div>
          </div>
        </section>

        {/* Dashed, as places still to be filled rather than sections with
            nothing in them. */}
        {STAGES.map((stage) => (
          <section key={stage} className="mt-[40px]">
            <h2 className="font-display font-medium text-xl text-ink mb-[12px]">
              {stage}
            </h2>
            <p className="rounded-card border border-dashed border-line-strong px-[18px] sm:px-[24px] py-[20px] font-body text-sm text-ink-mid">
              Not built yet.
            </p>
          </section>
        ))}
      </main>
    </div>
  );
}

/** No committee at that slug. */
function NoJointCommittee() {
  return (
    <div className="bg-ground min-h-screen font-body text-ink">
      <SiteNav inner={NAV_COLUMN} />
      <main className="mx-auto max-w-[1180px] px-[20px] sm:px-[32px] pt-[48px]">
        <p className="font-body text-base text-ink-mid">
          No joint committee at that address.{" "}
          <Link
            to="/jointCommittees"
            className="underline decoration-dotted underline-offset-[4px] text-link"
          >
            See them all
          </Link>
          .
        </p>
      </main>
    </div>
  );
}

export function JointCommittee() {
  const { slug } = useParams();
  const c = slug ? JOINT_BY_SLUG[slug] : undefined;
  if (!c) return <NoJointCommittee />;
  return <Detail c={c} />;
}
