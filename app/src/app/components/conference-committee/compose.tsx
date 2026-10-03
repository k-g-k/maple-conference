// Filing on a conference: the writing step, the review step, and the three
// containers the review step is being compared in.
//
// One review, three shells. The content is written once, in ReviewSubmission
// and ReviewContext, and each container only decides where those two sit and
// how the actions are drawn. That is the whole point of the comparison: if the
// three had three slightly different reviews in them, the thing being judged
// would be the copy rather than the container.
//
// The split is the same one in all three. ReviewSubmission is what the reader
// is about to become, and it leads. ReviewContext is everything that qualifies
// posting it: who reads it, whether MAPLE may carry it to the conferees, and
// the three rules. The pane stacks them, the modal puts the second in its aside,
// the page puts it in a column. Nothing here knows which.
//
// Nothing posts. The primary action sets a flag on the draft and the page reads
// it, which is as far as a prototype with no backend can honestly go.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, CircleCheck, Star } from "lucide-react";

import { Modal } from "../ballot";
import { SubmissionEntry } from "./testimony";
import type { Draft } from "./draft";
import type { CommitteeMember } from "../../data/bill-lineage/committees";
import { MEMBER_BY_SEAT, MINE } from "../../data/bill-lineage/members";
import { CONFERENCE_POSITIONS } from "../../data/conference-committees/positions";
import type { ConferencePosition } from "../../data/conference-committees/positions";
import type { ConferenceSubmission } from "../../data/conference-committees/testimony";
import { VIEWER } from "../../data/conference-committees/testimony";

/**
 * Every word the two steps say, in one place.
 *
 * Here rather than in the conference data, which is the record of what the
 * committees are deciding: this is the form's own voice, and the form's other
 * strings (the prompt in the textarea, the labels on the five positions' own
 * file) have always sat with the thing that says them. A copy pass is this
 * screen.
 *
 * Casing follows one test: Title Case for a title, sentence case only where the
 * title is itself a full sentence, and a command is not a sentence. So the
 * review's own header is Title Case and the posted one is not, because "Your
 * input is on the record" is a sentence. Buttons are commands and take neither
 * rule; they say what happens.
 *
 * The three rules are still a proposal. Everything else here has been decided.
 */
const COPY = {
  /** The writing step. */
  prompt:
    "What do you want lawmakers and other voters to know about this question?",
  cancel: "Delete Draft",
  saving: "Saving…",
  saved: "Saved",
  toReview: "Review and Post",
  /** The one rule the form states, where the posting happens. The link is a
      placeholder: there is no page behind it in the prototype. */
  conduct: "All posts are governed by our ",
  conductLink: "Code of Conduct",

  /** The review step, before posting. */
  reviewTitle: "Review and Post",
  submissionLabel: "Your submission",
  subjectPrefix: "On",
  changePosition: "Change position",
  editLabel: "Edit",
  doneLabel: "Done",
  positionLabel: "Your position",
  bodyLabel: "Your input",
  emptyBody: "You have not written anything yet.",
  emptyHint: "Write something first, then post it.",
  // A question, so it takes sentence case and the mark that makes it one.
  digest: "Include in MAPLE’s weekly email to the committee",
  // Only when it is off, so it reads as what is being turned down rather than
  // as a justification of something already chosen.
  // Two halves, because the star is a word in the middle of the sentence
  // rather than a mark at the end of it: it stands where the badge on the
  // portrait stands, against the member it belongs to.
  // Shown while it is ticked: what the email is, and who reads it first.
  // Split after "constituent", which is the word the badge qualifies.
  digestWhy:
    "Each committee member receives a weekly roundup of the public’s input. If you are a constituent of a committee member, they will see your input first.",
  digestWhyRest: "",
  digestMore: "Learn more",
  // Ticked, there is nothing to argue, so the line is only the way to read
  // more about the thing that is now going to happen.
  digestOnMore: "Learn more about our weekly email",
  // Shown once it is unticked. Two versions of the same question: the second
  // is for a reader one of whose own legislators is in the room, where the
  // cost of not being read is higher and the reason is different.
  digestOff:
    "Are you sure? Each committee member receives a weekly roundup of the public’s input and yours will not be included.",
  // The same opener as the general version, then the part that is only true
  // for a reader whose own legislator is in the room. That second sentence is
  // the only thing bolded, because it is the only thing that changes.
  digestOffLead:
    "Are you sure? Each committee member receives a weekly roundup of the public’s input and yours will not be included.",
  // Split where the badge goes: the mark closes the sentence, in place of the
  // full stop, against the weight it is the sign of.
  // Split at the badge: it sits between "Your" and "legislator", against the
  // person wearing it in the row above.
  digestOffMine: "Your legislator is on this committee",
  digestOffMineRest: "so your input has added weight.",
  email: "Email my input to my own senator and representative",
  rulesLabel: "Before You Post",
  rules: [
    "Posting is public and stays attached to your account.",
    "You can revise it later; earlier versions stay on the record.",
  ],
  back: "Back to editing",
  // Not "Post publicly". The three rules directly above it already say that
  // posting is public and stays attached to your account, so the button would
  // be repeating the line it sits under.
  post: "Post",

  /** The review step, after posting. A sentence, so it keeps sentence case. */
  postedTitle: "Your input is on the record",
  postedStamp: "Posted just now",
  postedDigest: "It will go in this week’s update to the conferees.",
  postedRevise: "You can revise it later. Earlier versions stay on the record.",
  close: "Close",
  seeOthers: "Read what others filed",

  /** The page style only, which is the one place there is room for a sentence. */
  pageLead:
    "Read it once more before it goes on the record. Nothing is sent until you post it.",
  pageBack: "Back to the committee",
} as const;

/**
 * What the draft holds before anybody types.
 *
 * Empty, so the box is what a reader actually meets: their own blank page. It
 * carried a sentence for a while, which let the flow be walked through without
 * typing, but a demo that starts with somebody else's words in the box is
 * showing the wrong thing. Putting one back is one line.
 *
 * The position and the words have to agree, or the review step shows a card
 * that argues with its own chip.
 */
export const STARTING_DRAFT = {
  position: "pass",
  body: "",
} as const;

/** Where a not-yet-posted card says its date. */
const PREVIEW_DATE = "Not posted yet";
const POSTED_DATE = "Just now";

/**
 * Who a submission is written for, as faces.
 *
 * The six deciding it, and nobody else. A legislator of the reader's own who
 * is not on this committee does not read what is filed here, so putting them
 * in the row said they did.
 *
 * The reader's own go last, because the row is read left to right and the
 * question it answers is "who gets this", which ends at the person who is
 * yours. Where both of them sit on the committee, they take the last two.
 *
 * Moved here from the page so the review step and the Public Input section draw
 * the same row. It is the strongest thing on the review step, and a second copy
 * of it would have been a second answer to who is reading you.
 */
export function Audience({
  six,
  off = false,
}: {
  six: CommitteeMember[];
  /** Drawn as nobody's audience: the update they are the recipients of is off. */
  off?: boolean;
}) {
  const mine = six.filter((m) => MINE[m.key]);
  const faces = [...six.filter((m) => !MINE[m.key]), ...mine].map((m) => ({
    key: m.key,
    name: m.name,
    portrait: m.portrait,
  }));
  if (!faces.length) return null;
  return (
    <div aria-hidden className="flex items-center">
      <span className="flex items-center">
        {faces.map((f, i) => {
          // The row sits at the right edge of a 400px panel, so a tooltip
          // centred on one of the last faces runs off it. Those hang from
          // their own right edge instead and open leftwards, which keeps the
          // connection to the face while staying in the panel.
          const fromRight = i >= faces.length - 2;
          return (
            <span key={f.key} className="group relative -ml-[6px] first:ml-0">
              {/* A real tooltip rather than the browser's, which arrives after
                about a second and paints in the operating system's own style.
                The delay is on the way in only: a third of a second is long
                enough that running the pointer across six faces does not flash
                six labels, and short enough to feel like an answer. */}
              <span
                className={`pointer-events-none absolute bottom-full z-[80] mb-[7px] w-max max-w-[180px] text-center rounded-control bg-ink px-[8px] py-[4px] font-body text-2xs leading-[1.35] text-ink-inverse opacity-0 transition-opacity duration-100 delay-0 group-hover:opacity-100 group-hover:delay-[320ms] ${
                  fromRight
                    ? // Out to the row's own padding edge rather than the last
                      // face's, so the box uses the width the panel has rather
                      // than stopping short of it.
                      "right-[-12px]"
                    : "left-1/2 -translate-x-1/2"
                }`}
              >
                {f.name}
                {MINE[f.key] && (
                  // Its own line: the name is who they are, the role is what
                  // they are to the reader, and running the two together made
                  // a long name wrap inside itself.
                  <span className="block text-ink-inverse/70">
                    {MINE[f.key]!.toLowerCase()}
                  </span>
                )}
              </span>
              <img
                src={f.portrait}
                alt=""
                // Two rings. The outer one is the row's own background, which is
                // what cuts each face out of the one behind it; the inner one is
                // a hairline of black, drawn inside the image so a pale portrait
                // still ends somewhere definite.
                className={`block w-[23px] h-[23px] rounded-full object-cover bg-sunken border-2 border-ground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)] transition-all duration-200 motion-reduce:transition-none ${
                  off ? "opacity-40 grayscale" : ""
                }`}
              />
              {MINE[f.key] && (
                <span className="absolute -bottom-[1px] -right-[1px] w-[12px] h-[12px] rounded-full bg-ground flex items-center justify-center">
                  <Star
                    aria-label={MINE[f.key]}
                    className="w-[8px] h-[8px] text-caution fill-caution"
                  />
                </span>
              )}
            </span>
          );
        })}
      </span>
    </div>
  );
}

/**
 * Filing on a conference.
 *
 * The ballot pages' composer, with the one thing a conference changes: the
 * positions are the five a conferee could act on rather than support and
 * oppose. Nothing else: a position, what you want to say, and the way out. The
 * guidance block that used to sit on top is gone, three lines of rules before
 * the reader has done anything, and so is the weekly-update checkbox, which
 * belongs with the other choices on review rather than in front of the writing.
 *
 * The five come from the conference data rather than from a list in here, so the
 * form, the feed's filter, the chip on a submission and the map are all reading
 * the same five.
 *
 * The fields are controlled now, where the textarea used to keep its own words
 * in the DOM. The review step has to be able to show what was written, and a
 * value only the browser knows is not something a second pane, a modal or a
 * page could read.
 */
/**
 * The name of a part of the form.
 *
 * Sentence case rather than the small caps the review step uses: these sit
 * directly over things you fill in, and a label shouting at the field under it
 * is the loudest thing on a form whose point is the writing.
 */
function ComposeLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-body font-semibold text-sm text-ink-muted mb-[8px]">
      {children}
    </p>
  );
}

export function ConferenceCompose({
  draft,
  onChange,
  six,
  onCancel,
  onReview,
  active = false,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  six: CommitteeMember[];
  onCancel: () => void;
  onReview: () => void;
  /**
   * Whether this pane is the one showing.
   *
   * The panel keeps every view mounted, so a draft survives being put away.
   * That also means this never remounts, and `autoFocus` fires once in the
   * page's life rather than each time the composer is opened. The page says
   * when it is showing instead.
   */
  active?: boolean;
}) {
  // Pressing Post on nothing used to hand the reader a review of nothing, with
  // the refusal only visible once they got there. Now the refusal happens where
  // the press did: the button shakes and the field it needs goes red.
  const [refused, setRefused] = useState(false);
  const [asking, setAsking] = useState(false);
  // Autosave, as the reader sees it. Nothing is sent anywhere: the draft is
  // already kept the moment it changes, per committee, so this is the page
  // saying so rather than the page doing it. Three seconds of quiet first,
  // because a note that appears on every keystroke is noise, and the thing it
  // is reporting has already happened by then.
  const [save, setSave] = useState<"none" | "saving" | "saved" | "fading">(
    "none",
  );
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const read = () => setKeyboard(window.innerHeight - vv.height > 120);
    read();
    vv.addEventListener("resize", read);
    return () => vv.removeEventListener("resize", read);
  }, []);
  const [everSaved, setEverSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(
    () => draft.body.trim().length > 0,
  );
  useEffect(() => {
    if (save === "none" && everSaved) setShowDelete(true);
    if (save === "saved") setEverSaved(true);
  }, [save, everSaved]);
  const field = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!draft.body.trim()) return setSave("none");
    // Nothing while the keys are going, then the answer 1.2s after they stop:
    // the 500ms it takes to know they have stopped, plus the .7s the "Saving"
    // step used to fill. The wait is what makes it read as a save rather than
    // as a label that was always there.
    setSave("none");
    const saved = setTimeout(() => setSave("saved"), 1200);
    // Fading, not vanishing. It pops in because appearing is the event; going
    // is not, so it goes quietly. The state stays "fading" for the length of
    // the transition and only then clears, since an unmounted element has
    // nothing to animate.
    const fading = setTimeout(() => setSave("fading"), 3200);
    const gone = setTimeout(() => setSave("none"), 3800);
    return () => {
      clearTimeout(saved);
      clearTimeout(fading);
      clearTimeout(gone);
    };
  }, [draft.body, draft.position, draft.digest]);
  useEffect(() => {
    // A frame's wait: the panel is sliding in, and focusing mid-transition
    // makes the browser scroll to the field before it has arrived.
    if (!active) return;
    const id = requestAnimationFrame(() => {
      const el = field.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      // At the end of what is already there rather than in front of it: coming
      // back to a draft is carrying on, and a caret at the start means typing
      // pushes the reader's own sentence along in front of it.
      el.setSelectionRange(el.value.length, el.value.length);
    });
    return () => cancelAnimationFrame(id);
  }, [active]);
  const empty = draft.body.trim().length === 0;
  const review = () => {
    if (!empty) return onReview();
    // The refusal happens on the thing that needs an answer, not on the button
    // that was pressed: the field takes the cursor, comes into view if it is
    // not, and rings once. A control that shakes says no; this says where.
    setRefused(true);
    setAsking(false);
    field.current?.focus({ preventScroll: true });
    field.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    // A frame's gap, so a second press replays the ring rather than doing
    // nothing because the class never left.
    requestAnimationFrame(() => setAsking(true));
  };
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain lg:overflow-visible flex flex-col gap-[16px]">
      <div className="flex flex-col lg:flex-1 lg:min-h-0">
        {/* One a row rather than a wrapping line of chips. Four of these are
            sentences, not one-word stances, and on a panel's width they wrapped
            into a block a reader had to pick apart. */}
        <ComposeLabel>{COPY.positionLabel}</ComposeLabel>
        <div className="flex flex-col gap-[8px] mb-[32px] lg:mb-[20px]">
          {CONFERENCE_POSITIONS.map((o) => {
            const on = draft.position === o.k;
            return (
              <button
                key={o.k}
                type="button"
                onClick={() => onChange({ position: o.k })}
                aria-pressed={on}
                className={`w-full text-left rounded-control border px-[14px] py-[10px] font-body text-sm cursor-pointer transition-colors ${
                  on
                    ? // The chosen one keeps the weight, so the list reads as
                      // one thing picked out of four rather than four things
                      // set in the same voice.
                      `font-semibold ${o.on}`
                    : "font-light bg-[#fdfdff] border-line text-ink hover:bg-wash hover:border-line-strong"
                }`}
              >
                {/* The sentence alone. No thumb: the form has room to state each
                    position in full, and the mark is for the filter row, where
                    a row of sentences would not fit. */}
                {o.l}
              </button>
            );
          })}
        </div>
        <ComposeLabel>{COPY.bodyLabel}</ComposeLabel>
        <textarea
          ref={field}
          onAnimationEnd={() => setAsking(false)}
          value={draft.body}
          onChange={(e) => {
            if (e.target.value.trim()) setRefused(false);
            onChange({ body: e.target.value });
          }}
          placeholder={COPY.prompt}
          // White on the panel's gray: the one place you are meant to type
          // should look like the one place you are meant to type.
          // Capped rather than filling: on a tall panel the field ran most of the
          // window for a submission that is usually a paragraph. The cap takes
          // the height off the field and leaves it in the column, so everything
          // under it stays where it was.
          // The red goes when there is something in the field, not when it is
          // merely looked at: focusing an empty field has not answered the
          // thing the red is asking for.
          onFocus={undefined}
          className={`h-[150px] lg:h-auto lg:flex-1 lg:min-h-0 lg:max-h-[280px] w-full resize-none bg-surface border rounded-control p-[12px] font-body text-[16px] sm:text-base text-ink leading-[1.55] placeholder:text-base placeholder:text-ink-muted focus:outline-none ${
            // The border carries the refusal. The placeholder is the field
            // telling you what to write, which is the same sentence whether or
            // not you have just been told off.
            refused
              ? "border-negative focus:border-negative"
              : "border-line focus:border-brand"
          } ${asking ? "animate-ask motion-reduce:animate-none" : ""}`}
        />
        <div className="shrink-0 mt-[14px]">
          <DigestChoice draft={draft} onChange={onChange} six={six} />
        </div>
      </div>

      <div
        className={`shrink-0 flex items-center justify-end gap-[12px] mt-[8px] pb-[4px] lg:mt-0 lg:pb-0 lg:static lg:bg-transparent lg:pt-0 ${
          keyboard
            ? ""
            : "sticky bottom-0 bg-ground pt-[14px] pb-[env(safe-area-inset-bottom)]"
        }`}
      >
        {save !== "none" && (
          // Far left, on the buttons' own line: it reports on the thing the
          // buttons act on, and a line of its own would make it an event.
          <span
            className={`mr-auto inline-flex items-center gap-[5px] font-body text-xs text-ink-muted transition-opacity duration-500 motion-reduce:transition-none ${
              save === "fading" ? "opacity-0" : "opacity-100"
            }`}
          >
            {save !== "saving" && (
              // Filled, in the page's own positive green: the mark is the
              // answer, and an outline reads as one more thing in progress.
              <CircleCheck className="w-[14px] h-[14px] text-surface fill-positive-ink" />
            )}
            {save === "saving" ? COPY.saving : COPY.saved}
          </span>
        )}
        {showDelete && (
          <button
            // It says delete, so it deletes: the words go and the position
            // goes back to the default, and then the form is put away. Closing
            // without deleting is what the panel's own control does.
            onClick={() => {
              onChange({ body: "", position: STARTING_DRAFT.position });
              onCancel();
            }}
            className="font-body font-semibold text-sm text-ink-muted hover:text-ink cursor-pointer px-[12px] py-[14px] sm:px-[8px] sm:py-[8px]"
          >
            {COPY.cancel}
          </button>
        )}
        <button
          onClick={review}
          // Dressed as disabled but still pressable, because a truly disabled
          // button answers nothing: the press is how the reader finds out what
          // is missing, and the field is where the answer arrives.
          aria-disabled={empty}
          className={`font-body font-semibold text-sm px-[24px] py-[14px] sm:px-[18px] sm:py-[8px] rounded-control cursor-pointer transition-colors ${
            empty
              ? "bg-brand/35 text-ink-inverse"
              : "bg-brand text-ink-inverse hover:bg-brand-hover"
          }`}
        >
          {COPY.toReview}
        </button>
      </div>
    </div>
  );
}

/** A quiet label above a block of the review. The section heads' own voice. */
function ReviewLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-muted mb-[8px]">
      {children}
    </p>
  );
}

/**
 * The draft as the thing the feed will render, which is what review is for.
 *
 * Exported because the page prepends this same object to the feed once it is
 * posted. One conversion, so the card a reader approved and the card that
 * arrives in the list cannot come out different.
 */
export const asSubmission = (draft: Draft): ConferenceSubmission => ({
  // A stable id, because nothing else in the feed may collide with it.
  id: "cc-viewer-draft",
  userId: VIEWER.id,
  position: draft.position,
  date: draft.posted ? POSTED_DATE : PREVIEW_DATE,
  body: draft.body.trim(),
});

/**
 * The weekly update, and who it goes to.
 *
 * Both steps draw it. On the writing step it sits under what you are writing,
 * because the six faces are the reason to write at all; on the review step it
 * sits with the other things that qualify posting. One component, so the two
 * cannot drift into saying different things about the same choice.
 */
export function DigestChoice({
  draft,
  onChange,
  six,
  locked = false,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  six: CommitteeMember[];
  /**
   * Shown but not answerable.
   *
   * On the review step this is part of the submission, and the submission is
   * read only until the reader presses Edit. Locked it still says what it is
   * set to, because that is the thing being reviewed.
   */
  locked?: boolean;
}) {
  // Whether one of the six is the reader's own, which changes what turning the
  // email off costs them.
  const mine = six.filter((m) => MINE[m.key]);
  return (
    // The faces are inside the label, so they are part of the control rather
    // than a picture beside it: pressing them toggles the thing they are the
    // recipients of. Unticked they gray out, which is the only job they have.
    // Ticked, the row says these six get it; untouched by the checkbox, it was
    // decoration in a form, which is the one place decoration costs something.
    <div>
      {/* No frame in either state. The tick and the faces carry what it is set
          to, and a box around them was a third thing saying the same. The wash
          arrives on hover, the only moment it needs to look pressable. */}
      <label
        className={`flex items-center gap-[12px] rounded-control px-[12px] py-[10px] transition-colors ${
          locked ? "cursor-default" : "cursor-pointer hover:bg-wash"
        }`}
      >
        <input
          type="checkbox"
          checked={draft.digest}
          disabled={locked}
          onChange={(e) => onChange({ digest: e.target.checked })}
          // Centred against the pair beside it rather than against the first
          // line of it, so the box sits with the whole choice.
          className={`w-[16px] h-[16px] shrink-0 self-center accent-brand ${
            locked ? "cursor-default" : "cursor-pointer"
          }`}
        />
        <span className="flex-1 font-body font-light text-sm text-ink leading-[1.45]">
          {COPY.digest}
        </span>
        {/* Hard right, at the far end of the line the sentence starts: the words
          say what happens and the faces say who it happens to, so the two ends
          of one row carry the two halves of one sentence. */}
        <Audience six={six} off={!draft.digest} />
      </label>
      {/* Only once it is off. Ticked, the row is the answer and needs no
          argument; unticked, this is the case for turning it back on. Outside
          the label, so pressing the link does not toggle the thing it is
          explaining. */}
      {draft.digest ? (
        <p className="px-[12px] -mt-[5px]">
          <button
            type="button"
            className="font-body font-semibold text-xs text-brand-ink hover:text-brand underline decoration-dotted underline-offset-[3px] cursor-pointer"
          >
            {COPY.digestOnMore}
          </button>
        </p>
      ) : (
        // An orange of its own rather than the caution ink, which at this size
        // and weight read as brown and disappeared into the page. Not the
        // negative red either: nothing has gone wrong, the reader has chosen
        // something and is being asked whether they meant it. A step up in
        // weight as well, since italic light is the quietest thing here.
        <p className="px-[12px] -mt-[5px] font-body font-light italic text-xs text-ink-muted leading-[1.5]">
          {mine.length > 0 ? (
            <>
              {COPY.digestOffLead}{" "}
              <span className="font-bold">
                {COPY.digestOffMine} {COPY.digestOffMineRest}
              </span>
            </>
          ) : (
            COPY.digestOff
          )}
          {"\u00a0\u00a0"}
          <button
            type="button"
            className="font-body not-italic font-semibold text-xs text-brand-ink hover:text-brand underline decoration-dotted underline-offset-[3px] cursor-pointer"
          >
            {COPY.digestMore}
          </button>
        </p>
      )}
    </div>
  );
}

/**
 * The four positions as a menu.
 *
 * The chip says the short form, because that is what it will say on the card.
 * The menu says the sentences, because choosing between them is the moment the
 * difference matters and two words cannot carry it. No thumbs: the mark belongs
 * to the filter row, where a row of sentences would not fit.
 */
function PositionMenu({
  value,
  onChange,
}: {
  value: ConferencePosition;
  onChange: (k: ConferencePosition) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = CONFERENCE_POSITIONS.find((o) => o.k === value);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`inline-flex items-center gap-[8px] rounded-control border px-[12px] py-[7px] font-body font-semibold text-sm cursor-pointer transition-colors ${
          current?.on ?? "bg-surface border-line text-ink"
        }`}
      >
        {current?.short ?? "Position"}
        <ChevronDown className="w-[14px] h-[14px] shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-[240px] rounded-control border border-line bg-surface shadow-popover py-[6px]">
          {CONFERENCE_POSITIONS.map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => {
                onChange(o.k);
                setOpen(false);
              }}
              className={`w-full text-left px-[14px] py-[8px] font-body text-base leading-[1.4] cursor-pointer hover:bg-ground ${
                o.k === value ? "font-semibold text-brand-ink" : "text-ink"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * What was written, and then what it will look like.
 *
 * Two halves. The top is the submission as a thing still being made: the
 * position as the same chips the feed filters by, and the words with a pencil
 * that turns them into a field without leaving the page. The bottom is the
 * same SubmissionEntry the feed draws, so the preview is not a picture of a
 * submission, it is one.
 *
 * Changing either used to mean going back to the form, which is a page away
 * from the thing you are checking. A review you can act on is a review; one
 * you can only read is a receipt.
 */
export function ReviewSubmission({
  draft,
  subject,
  six,
  onChange,
}: {
  draft: Draft;
  subject: string;
  six: CommitteeMember[];
  /** Left off once posted, when there is nothing left to change. */
  onChange?: (patch: Partial<Draft>) => void;
}) {
  const empty = draft.body.trim().length === 0;
  return (
    <div>
      {draft.posted ? (
        <p className="flex items-center gap-[6px] font-body font-semibold text-sm text-positive-ink mb-[10px]">
          <Check className="w-[15px] h-[15px] shrink-0" strokeWidth={2.5} />
          {COPY.postedStamp}
        </p>
      ) : (
        <>
          {/* One line rather than two: the label and the subject were saying
              the same thing in two registers, and the sentence they make
              together is shorter than either of them stacked. */}
          <p className="font-body font-semibold text-sm text-ink-muted mb-[8px]">
            {COPY.submissionLabel}{" "}
            <em className="italic">
              {COPY.subjectPrefix.toLowerCase()} {subject}
            </em>
          </p>
        </>
      )}

      {/* White, and the card radius rather than the control one: in the feed
          this sits on a surface of its own, and a review that put it on the
          panel's grey would be showing it somewhere it never appears. */}
      <div className="bg-surface border border-line rounded-card">
        {empty ? (
          <p className="font-body text-base text-ink-faint leading-[1.55] p-[20px]">
            {COPY.emptyBody}
          </p>
        ) : (
          // Clamped, like every other place a submission body is printed. It was
          // not, on the argument that a review should not cover the end of what
          // you are checking; a long one then made the pane several screens tall
          // with the Post button under all of it, and the control that opens it
          // is the same control the feed uses, in the same place, one press away.
          <SubmissionEntry
            t={asSubmission(draft)}
            accounts={[VIEWER]}
            actions={false}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Everything that qualifies posting, rather than being part of it.
 *
 * Who reads this, then the weekly update, then the rules. The faces come first
 * because the checkbox under them is a question about those faces, and a
 * checkbox about the conferees reads differently once you have seen them.
 *
 * After posting it says what happens next instead. Same slot, because the
 * question and its answer belong in the same place.
 */
export function ReviewContext({
  draft,
  onChange,
  six,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  six: CommitteeMember[];
}) {
  if (draft.posted)
    return (
      <div className="flex flex-col gap-[10px]">
        {draft.digest && (
          <p className="font-body text-base text-ink leading-[1.6]">
            {COPY.postedDigest}
          </p>
        )}
        <p className="font-body text-sm text-ink-muted leading-[1.6]">
          {COPY.postedRevise}
        </p>
      </div>
    );

  return (
    <div className="flex flex-col gap-[20px]">
      {/* On the surface it sits on, with no tint of its own. A band around one
          line of text made it the loudest thing in the old form, ahead of what
          the reader came to write. */}
      <div>
        <ReviewLabel>{COPY.rulesLabel}</ReviewLabel>
        <ul className="list-disc list-outside pl-[16px] space-y-[8px] font-body text-xs text-ink-muted leading-[1.5] marker:text-ink-faint">
          {COPY.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
          <li>
            {COPY.conduct}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="font-semibold text-brand-ink hover:text-brand underline decoration-dotted underline-offset-[3px]"
            >
              {COPY.conductLink}
            </a>
            .
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * The two actions, whichever state the review is in.
 *
 * Two and never three. Every container already has a way out that means
 * "put this away", the panel's close control, the modal's, the page's back
 * link, so a Cancel here would be a second one of those next to the one that
 * matters.
 */
export function ReviewActions({
  draft,
  onBack,
  onPost,
  onClose,
  onSeeOthers,
  stacked = false,
}: {
  draft: Draft;
  onBack: () => void;
  onPost: () => void;
  onClose: () => void;
  onSeeOthers: () => void;
  /** Full-width primary on its own line, for a container with no room across. */
  stacked?: boolean;
}) {
  const empty = draft.body.trim().length === 0;
  const quiet =
    "font-body font-semibold text-sm text-ink-muted hover:text-ink cursor-pointer px-[12px] py-[14px] sm:px-[8px] sm:py-[8px]";
  const primary =
    "bg-brand text-ink-inverse font-body font-semibold text-sm px-[24px] py-[14px] sm:px-[18px] sm:py-[8px] rounded-control cursor-pointer hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand";

  return (
    <div className="flex flex-col gap-[8px] pt-[14px] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0">
      {/* Said once, beside the disabled button, rather than as a warning the
          reader meets before they have done anything wrong. */}
      {!draft.posted && empty && (
        <p className="font-body text-xs text-ink-muted text-right">
          {COPY.emptyHint}
        </p>
      )}
      <div
        className={
          stacked
            ? "flex flex-col-reverse gap-[8px]"
            : "flex items-center justify-end gap-[12px]"
        }
      >
        {draft.posted ? (
          <>
            <button onClick={onClose} className={quiet}>
              {COPY.close}
            </button>
            <button
              onClick={onSeeOthers}
              className={`${primary} ${stacked ? "w-full" : ""}`}
            >
              {COPY.seeOthers}
            </button>
          </>
        ) : (
          <>
            <button onClick={onBack} className={quiet}>
              {COPY.back}
            </button>
            <button
              onClick={undefined}
              disabled={empty}
              className={`${primary} ${stacked ? "w-full" : ""}`}
            >
              {COPY.post}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** What all three containers are handed. */
export interface ReviewProps {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  six: CommitteeMember[];
  subject: string;
  onBack: () => void;
  onPost: () => void;
  onClose: () => void;
  onSeeOthers: () => void;
}

/** The header a container puts above the review, in whichever state it is in. */
export const reviewTitle = (posted: boolean) =>
  posted ? COPY.postedTitle : COPY.reviewTitle;

/**
 * Style one: the review as a second pane in the flyout.
 *
 * Stacked, because the panel is between 400 and 520 wide and has no beside. The
 * body scrolls and the actions do not, which is what the writing pane beside it
 * already does, so moving between the two does not move the buttons.
 */
export function ReviewPane({
  draft,
  onChange,
  six,
  subject,
  onBack,
  onPost,
  onClose,
  onSeeOthers,
}: ReviewProps) {
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-[24px] pb-[20px]">
        <ReviewContext draft={draft} onChange={onChange} six={six} />
        <ReviewSubmission
          draft={draft}
          subject={subject}
          six={six}
          onChange={onChange}
        />
        <DigestChoice draft={draft} onChange={onChange} six={six} />
      </div>
      <div className="shrink-0 pt-[12px]">
        <ReviewActions
          draft={draft}
          onBack={onBack}
          onPost={onPost}
          onClose={onClose}
          onSeeOthers={onSeeOthers}
        />
      </div>
    </div>
  );
}

/**
 * Style two: the review as a modal over the page.
 *
 * The aside is the same ReviewContext the pane stacks, which is the one place
 * the modal's shape genuinely helps: the rules and the checkbox stay put while
 * a long submission scrolls beside them.
 *
 * Capped well below the modal's own default. The point of a review is to show
 * the submission at the width it will be read at, and the feed's column is
 * narrow in the panel and about this wide on the page. A modal given its full
 * 860 would re-set the reader's paragraph in a measure it will never appear in,
 * at exactly the moment they are checking where the lines break.
 */
export function ReviewModal({
  draft,
  onChange,
  six,
  subject,
  onBack,
  onPost,
  onClose,
  onSeeOthers,
}: ReviewProps) {
  return (
    <Modal
      onClose={onClose}
      maxWidth="800px"
      minHeight="420px"
      mainMinWidth="420px"
      title={
        <p className="font-body font-normal text-xl text-ink">
          {reviewTitle(draft.posted)}
        </p>
      }
      aside={<ReviewContext draft={draft} onChange={onChange} six={six} />}
      footer={
        <ReviewActions
          draft={draft}
          onBack={onBack}
          onPost={onPost}
          onClose={onClose}
          onSeeOthers={onSeeOthers}
        />
      }
    >
      <ReviewSubmission
        draft={draft}
        subject={subject}
        six={six}
        onChange={onChange}
      />
      <div className="mt-[16px]">
        <DigestChoice draft={draft} onChange={onChange} six={six} />
      </div>
    </Modal>
  );
}

/**
 * Style three: the review with the page to itself.
 *
 * The one container with room for the two columns, so it takes them: the
 * submission at a comfortable measure on the left, everything qualifying it in
 * a column that stays put on the right. Below the two-column width it is the
 * pane's own stack, in the same order.
 *
 * The heading and the way back out belong to the route rather than to this, so
 * the page that owns the URL draws those and hands the rest here.
 */
export function ReviewPageBody({
  draft,
  onChange,
  six,
  subject,
  onBack,
  onPost,
  onClose,
  onSeeOthers,
}: ReviewProps) {
  return (
    <div className="mt-[28px] flex flex-col gap-[28px] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:gap-[48px] lg:items-start">
      <div className="flex flex-col gap-[20px]">
        <ReviewSubmission
          draft={draft}
          subject={subject}
          six={six}
          onChange={onChange}
        />
        <DigestChoice draft={draft} onChange={onChange} six={six} />
        {/* Under the submission on a wide window, because the submission is what
            the reader came to check and the actions follow it. The context
            column beside them is reference, not sequence. */}
        <div className="pt-[8px]">
          <ReviewActions
            draft={draft}
            onBack={onBack}
            onPost={onPost}
            onClose={onClose}
            onSeeOthers={onSeeOthers}
          />
        </div>
      </div>
      <div className="lg:sticky lg:top-[calc(var(--nav-h)+24px)]">
        <ReviewContext draft={draft} onChange={onChange} six={six} />
      </div>
    </div>
  );
}

/** The page style's own lead and back link, so the route file stays short. */
export const REVIEW_PAGE_COPY = {
  lead: COPY.pageLead,
  back: COPY.pageBack,
};
