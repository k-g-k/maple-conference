// A bill page's chapters.
//
// This is the bill's own page and the source of truth for the bill, whatever
// stage it happens to be at. Everything here comes from the legislature's
// record: the title, the sponsor, the cosponsors, and the action history.
//
// Where the record is empty, the page says it is empty rather than hiding the
// section. A bill with no cosponsors, no published text, or a two-line history
// is telling you something, and a page that quietly drops those sections tells
// you nothing.

import { ArrowUpRight, Landmark } from "lucide-react";
import type { BillRecord } from "../../data/bills-194";
import { MEMBER_BY_NAME, profileUrl } from "../../data/bill-lineage/members";
import { Chapter, Span, Body, Disclosure } from "./spine";

function SubHead({ title, note }: { title: string; note?: string }) {
  return (
    <>
      <h3 className="font-display font-medium text-xl text-ink mb-[4px]">
        {title}
      </h3>
      {note && (
        <p className="font-body text-sm text-ink-muted mb-[14px] max-w-[74ch]">
          {note}
        </p>
      )}
      {!note && <div className="mb-[12px]" />}
    </>
  );
}

/** Initials, for anyone the roster does not carry. */
function Mark({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter((w) => w.length > 1)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <span className="shrink-0 w-[36px] h-[36px] rounded-full bg-sunken border border-line flex items-center justify-center font-body font-semibold text-sm text-ink-muted">
      {initials}
    </span>
  );
}

const url = (n: string) =>
  `https://malegislature.gov/Bills/194/${n.replace(".", "")}`;

/** Whether a sponsor string names a committee rather than a person. */
const isCommittee = (name: string) => /\bCommittee\b/.test(name);

/**
 * One name from the sponsor record, matched against the seat roster.
 *
 * Three outcomes, and the page shows which one it got rather than flattening
 * them. A sitting member gets their portrait, their leadership title where the
 * General Court records one, and a link to their profile. A committee gets a
 * mark that is plainly not a face, because a Ways and Means redraft is filed by
 * a body and not a person. Anyone else, which here means the Governor and the
 * Attorney General, gets initials: they may file a bill and hold no seat, so
 * there is no profile to link and no portrait to show.
 */
function Person({ name }: { name: string }) {
  const member = MEMBER_BY_NAME[name];

  if (!member && isCommittee(name)) {
    return (
      <div className="flex items-center gap-[12px]">
        <span className="shrink-0 w-[36px] h-[36px] rounded-control bg-sunken border border-line flex items-center justify-center">
          <Landmark className="w-[17px] h-[17px] text-ink-faint" />
        </span>
        <span>
          <p className="font-body font-semibold text-base text-ink leading-[1.4]">
            {name}
          </p>
          <p className="font-body text-xs text-ink-faint leading-[1.4]">
            A committee, not an individual member
          </p>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[12px]">
      {member ? (
        <img
          src={member.portrait}
          alt=""
          className="shrink-0 w-[36px] h-[36px] rounded-full object-cover border border-line bg-sunken"
        />
      ) : (
        <Mark name={name} />
      )}
      <span className="min-w-0">
        {member ? (
          <a
            href={profileUrl(member.code)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-base text-ink leading-[1.4] underline decoration-dotted underline-offset-[3px] decoration-line-strong hover:decoration-ink"
          >
            {name}
          </a>
        ) : (
          <p className="font-body text-base text-ink leading-[1.4]">{name}</p>
        )}
        {member?.title && (
          <p className="font-body text-xs text-ink-faint leading-[1.4] truncate">
            {member.title}
          </p>
        )}
      </span>
    </div>
  );
}

/** The page's own note about a piece of the record that is not there. */
function Missing({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-sm text-ink-muted leading-[1.65] border-l-2 border-line-strong pl-[16px] max-w-[74ch]">
      {children}
    </p>
  );
}

// ── 1. What it does ───────────────────────────────────────────────────────

export function WhatItDoes({ bill }: { bill: BillRecord }) {
  return (
    <Chapter
      id="what-it-does"
      question="What would it do?"
      answer={
        <Span>
          <Body>{bill.title}</Body>
          {/* The Pinslip is the legislature's own one-line note on what the
              document is, and on a redrafted document it is the only place
              that says which bill it came out of. */}
          {bill.pinslip && (
            <p className="font-body text-sm text-ink-muted leading-[1.65] mt-[14px] max-w-[74ch]">
              {bill.pinslip}
            </p>
          )}
        </Span>
      }
    >
      <Span>
        <SubHead title="Bill text" />
        {bill.textLength > 0 ? (
          <p className="font-body text-sm text-ink-muted leading-[1.65] max-w-[74ch]">
            {bill.textLength.toLocaleString()} characters on file, roughly{" "}
            {Math.round(bill.textLength / 5400)} pages.
          </p>
        ) : (
          <Missing>
            No text is published for this document. That happens with a
            committee redraft: the number exists and the text has not been
            posted.
          </Missing>
        )}
        <a
          href={url(bill.number)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-[4px] mt-[14px] font-body font-semibold text-sm underline decoration-dotted underline-offset-[4px] text-official-ink hover:text-official"
        >
          Read {bill.number} on malegislature.gov
          <ArrowUpRight className="w-[13px] h-[13px] no-underline" />
        </a>
      </Span>
    </Chapter>
  );
}

// ── 2. Who filed it ───────────────────────────────────────────────────────

/** How many cosponsors show before the rest go behind a disclosure. */
const COSPONSORS_SHOWN = 12;

function Roster({ names }: { names: string[] }) {
  return (
    <ul className="grid gap-x-[32px] gap-y-[14px] sm:grid-cols-2">
      {names.map((name) => (
        <li key={name}>
          <Person name={name} />
        </li>
      ))}
    </ul>
  );
}

export function WhoFiledIt({ bill }: { bill: BillRecord }) {
  return (
    <Chapter
      id="sponsors"
      question="Who filed it?"
      answer={
        <Span>
          <p className="font-body text-sm text-ink-muted leading-[1.65] max-w-[74ch]">
            A bill is filed by one member and co-signed by others. Signing is
            not a vote: it says a member wants the bill considered.
          </p>
        </Span>
      }
    >
      <Span>
        <SubHead title="Lead sponsor" />
        {bill.sponsor ? (
          <Person name={bill.sponsor} />
        ) : (
          <Missing>
            None on file. A document reported out by a committee, or an
            amendment drafted in Ways and Means, carries no individual sponsor.
          </Missing>
        )}
      </Span>

      <Span>
        <SubHead
          title="Cosponsors"
          note={
            bill.cosponsors.length
              ? `${bill.cosponsors.length} ${bill.cosponsors.length === 1 ? "member has" : "members have"} signed on.`
              : undefined
          }
        />
        {bill.cosponsors.length ? (
          <>
            <Roster names={bill.cosponsors.slice(0, COSPONSORS_SHOWN)} />
            {/* Three of these bills run past a hundred signatures. Showing the
                first dozen keeps the chapter readable and the rest are one
                click away, rather than a page of faces before the history. */}
            {bill.cosponsors.length > COSPONSORS_SHOWN && (
              <div className="mt-[16px]">
                <Disclosure
                  label={`The other ${bill.cosponsors.length - COSPONSORS_SHOWN}`}
                >
                  <div className="pt-[12px]">
                    <Roster names={bill.cosponsors.slice(COSPONSORS_SHOWN)} />
                  </div>
                </Disclosure>
              </div>
            )}
          </>
        ) : (
          <Missing>
            None on file, which is normal for a redraft or an amendment: the
            cosponsors belong to the bill it came out of.
          </Missing>
        )}
      </Span>
    </Chapter>
  );
}

// ── 3. What has happened to it ────────────────────────────────────────────

export function History({ bill }: { bill: BillRecord }) {
  const first = bill.history[0];
  const last = bill.history[bill.history.length - 1];
  return (
    <Chapter
      id="history"
      question="What has happened to it?"
      answer={
        <Span>
          <p className="font-body text-sm text-ink-muted leading-[1.65] max-w-[74ch]">
            {bill.history.length
              ? `${bill.history.length} recorded ${bill.history.length === 1 ? "action" : "actions"}, from ${first.date} to ${last.date}. Most of a bill's history is procedural, and the gaps between entries are usually the substance.`
              : "No actions recorded against this document."}
          </p>
        </Span>
      }
    >
      <Span>
        <SubHead title="Latest" />
        {last ? (
          <div className="border-l-2 border-official pl-[16px] sm:pl-[20px]">
            <p className="font-body font-semibold text-sm text-ink-muted tabular-nums">
              {last.date} · {last.branch}
            </p>
            <p className="font-body text-lg text-ink leading-[1.5] mt-[4px] max-w-[62ch]">
              {last.action}
            </p>
          </div>
        ) : (
          <Missing>Nothing recorded.</Missing>
        )}
      </Span>

      {bill.history.length > 1 && (
        <Span>
          <Disclosure
            variant="heading"
            label={`All ${bill.history.length} actions`}
          >
            <ul className="flex flex-col">
              {[...bill.history].reverse().map((h, i) => (
                <li
                  key={`${h.date}-${i}`}
                  className="grid grid-cols-[104px_1fr] sm:grid-cols-[130px_1fr] gap-x-[16px] sm:gap-x-[22px] items-baseline py-[7px] border-b border-line last:border-0"
                >
                  <p className="font-body font-semibold text-sm text-ink-muted tabular-nums">
                    {h.date}
                  </p>
                  <p className="font-body text-sm text-ink leading-[1.55]">
                    {h.action}
                    <span className="text-ink-faint"> · {h.branch}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Disclosure>
        </Span>
      )}
    </Chapter>
  );
}
