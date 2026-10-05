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
import {
  Check,
  ChevronDown,
  CircleCheck,
  Star,
  UsersRound,
} from "lucide-react";

import { Modal } from "../ballot";
import { SubmissionEntry } from "./testimony";
import type { Draft } from "./draft";
import type { CommitteeMember } from "../../data/bill-lineage/committees";
import {
  MEMBER_BY_SEAT,
  MINE,
  MINE_FULL,
} from "../../data/bill-lineage/members";
import {
  CONFERENCE_POSITIONS,
  POSITIONS,
} from "../../data/conference-committees/positions";
import type { ConferencePosition } from "../../data/conference-committees/positions";
import { PositionChip } from "./accounts";
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
  // The same two steps named for what is actually being done on this path.
  // "Post" is right for a filing of your own; signing somebody else's letter
  // is a co-sign from the first press to the last, and the buttons say so.
  toReviewCosign: "Review and Cosign",
  reviewTitleCosign: "Review and Cosign",
  postCosign: "Cosign",
  cosignBack: "Cancel",
  // Where the next step is the one that commits, this press only takes them
  // there, so it says so rather than claiming the act twice.
  cosignOn: "Continue",
  cosignAgree: (org: string) =>
    `I have read ${org}’s input and want to cosign it as my own.`,
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
  /** The co-sign form, where the position came with the letter. */
  cosignLabel: "You are signing",
  cosignNote:
    "The words stay theirs. Their position is filed as yours, because that is what you are agreeing to.",
  cosignBodyLabel: "Your Input",
  cosignBodyAside: "Optional",

  /** The writing step, once the offer has been taken. */
  cosignFormTitle: "Add Your Words",
  cosignPreviewLabel: "Preview",
  cosignNoWords: "I do not want to add input of my own",
  /** The step before the form: what co-signing this would do, and the press. */
  cosignInvite:
    "Add your name to this input. Its position is recorded as your own, and its words are filed under your name unchanged.",
  cosignNext:
    "Next you can add a line of your own about why it matters to you. Your cosign is public on MAPLE and counted for your district.",
  cosignInviteNote:
    "Your cosign is public on MAPLE and counted for your district.",
  cosignPrompt:
    "Why does this matter to you? One or two sentences in your own words will have more impact with lawmakers.",
  bodyLabel: "Your input",
  emptyBody: "You have not written anything yet.",
  emptyHint: "Write something first, then post it.",
  // A question, so it takes sentence case and the mark that makes it one.
  digest: "Include in MAPLE’s weekly email to the committee",
  digestCosign: "Allow us to share your input with the committee",
  /** The same offer to read more, naming both kinds of party that carry it.
      Not the organisation by name: the page behind this covers how any of them
      may use it, and one name promises a page about one. */
  digestCosignMore: "Learn how MAPLE and trusted orgs share with lawmakers",
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
    "Are you sure? Your input is valuable but will not be shared directly with lawmakers.",
  // The same opener as the general version, then the part that is only true
  // for a reader whose own legislator is in the room. That second sentence is
  // the only thing bolded, because it is the only thing that changes.
  digestOffLead:
    "Are you sure? Your input is valuable but will not be shared directly with lawmakers.",
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
  seeOthers: "Read what others are saying",

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
  body: "I am not concerned about the topics that are unresolved. What I care about already exists in both bills. I care most that this law passes as soon as possible.",
} as const;

/** Where a not-yet-posted card says its date. */
// Nothing. The card is a preview inside a panel titled Review and Post, and a
// corner saying it has not happened yet is the same fact a third time.
const PREVIEW_DATE = "";
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
                // Two rings. The outer one is white rather than the page's own
                // ground, so the faces are cut out of each other wherever the
                // row sits: on a panel the ground-coloured ring disappeared
                // and the six read as one shape. The inner one is a hairline
                // of black, drawn inside the image so a pale portrait still
                // ends somewhere definite.
                className={`block w-[23px] h-[23px] rounded-full object-cover bg-sunken border-2 border-surface shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)] transition-all duration-200 motion-reduce:transition-none ${
                  off ? "opacity-40 grayscale" : ""
                }`}
              />
              {MINE[f.key] && (
                <span className="absolute -bottom-[1px] -right-[1px] w-[12px] h-[12px] rounded-full bg-surface flex items-center justify-center">
                  <Star
                    aria-label={MINE_FULL[f.key]}
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
    <p className="font-body font-semibold text-sm text-ink-mid mb-[8px]">
      {children}
    </p>
  );
}

export function ConferenceCompose({
  draft,
  onChange,
  six,
  onCancel,
  signing = false,
  onSigning,
  noWords = false,
  onNoWords,
  skipReview = false,
  letterShown = false,
  onReview,
  active = false,
  cosign,
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
  /**
   * The letter being seconded, where this is a co-sign rather than a filing of
   * the reader's own.
   *
   * Resolved by the page and handed in whole: the form shows what is being
   * signed and drops the position control, because the position is the
   * letter's and was copied onto the draft when the reader pressed Cosign.
   */
  /**
   * Whether the reader has taken the offer on a co-sign.
   *
   * Held by the page rather than here, because the panel's own title changes
   * with it and the title is drawn outside this component.
   */
  signing?: boolean;
  onSigning?: (v: boolean) => void;
  /**
   * Whether they have said they are adding nothing of their own. Held by the
   * page for the same reason as `signing`: the review step is drawn elsewhere
   * and shows the entry this answer decides.
   */
  noWords?: boolean;
  onNoWords?: (v: boolean) => void;
  /**
   * Two steps rather than three.
   *
   * Everything a reader is told before they commit is said on the step that
   * asks them to, so the writing step ends in the act itself rather than in a
   * review of a decision they have already made twice.
   */
  skipReview?: boolean;
  /**
   * Whether the letter is already open beside this, which the panel decides.
   * Where it is, quoting four lines of it back is the same words twice and the
   * card can get on with the asking.
   */
  letterShown?: boolean;
  cosign?: {
    name: string;
    date: string;
    position: ConferencePosition;
    /** The letter itself, for the few lines the card shows of it. */
    body: string;
    /** How many have signed it, and how far into the six they reach. */
    count: number;
    inDistrict: number;
    /** Whether one of the six represents the reader. */
    yours: boolean;
  };
}) {
  // Pressing Post on nothing used to hand the reader a review of nothing, with
  // the refusal only visible once they got there. Now the refusal happens where
  // the press did: the button shakes and the field it needs goes red.
  // The acknowledgment on the offer step, and whether a press has asked for
  // it. Local, because nothing outside this step reads it.
  const [agreed, setAgreed] = useState(false);
  const [askedAgree, setAskedAgree] = useState(false);
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
    () => (cosign ? draft.cosignBody : draft.body).trim().length > 0,
  );
  useEffect(() => {
    if (save === "none" && everSaved) setShowDelete(true);
    if (save === "saved") setEverSaved(true);
  }, [save, everSaved]);
  const field = useRef<HTMLTextAreaElement>(null);
  // Whether anything has actually been typed. A committee whose form opens
  // with words already in it would otherwise report a save for a draft nobody
  // wrote: the note is the page saying the reader's change was kept, and on
  // the first render there has been no change.
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current) {
      touched.current = true;
      return;
    }
    if (!(cosign ? draft.cosignBody : draft.body).trim())
      return setSave("none");
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
  }, [draft.body, draft.cosignBody, draft.position, draft.digest]);
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
  // The words this panel is working on: a co-sign writes to its own field, so
  // a half-finished one is not mistaken for a filing of the reader's own.
  const words = cosign ? draft.cosignBody : draft.body;
  const setWords = (v: string) =>
    onChange(cosign ? { cosignBody: v } : { body: v });
  const written = words.trim().length > 0;
  /**
   * Whether the step has been answered.
   *
   * Writing something answers it. On a co-sign, so does saying there is
   * nothing to add: the field is optional and leaving it blank is a real
   * choice, but it has to be a choice rather than the reader not having
   * noticed the field. Filing input of your own has no such out, because
   * there the words are the filing.
   */
  const empty = !written && !(cosign && noWords);
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
  // The offer, and nothing else in the panel. Returned before the form rather
  // than drawn above it: the words, the field, the digest row and Review and
  // Post are all parts of writing something, and a reader who has not yet
  // agreed to sign has nothing to do with any of them.
  if (cosign && !signing)
    return (
      // A confirmation, not a second form. The reader has pressed Cosign and
      // this is the friction that makes sure they meant it: what they are
      // signing, what signing does, and the press. Anything to fill in waits
      // for the step after.
      //
      // `self-start`, because in the wide reading this is the second column of
      // a grid and a grid item stretches to the row the letter sets.
      <div className="shrink-0 self-start">
        <div className="rounded-card border border-line bg-surface overflow-hidden">
          {/* What is being signed, set as a heading rather than as a meta line.
            It was the smallest, palest thing on a card that exists to ask
            about it. */}
          <div className="px-[22px] pt-[20px] pb-[16px]">
            <p className="flex flex-wrap items-center gap-x-[8px] gap-y-[5px] font-display font-semibold text-lg text-ink leading-[1.3]">
              {cosign.name}
              <PositionChip position={cosign.position} />
            </p>
            {/* The date and the tally on one line, because both are facts about
              the letter rather than things to weigh separately. */}
            <p className="flex flex-wrap items-center gap-x-[7px] gap-y-[3px] mt-[7px] font-body text-sm text-ink-mid">
              {cosign.date}
              <span aria-hidden className="text-ink-faint">
                ·
              </span>
              <span className="inline-flex items-center gap-[6px]">
                <UsersRound
                  aria-hidden
                  className="w-[15px] h-[15px] shrink-0"
                />
                <span>
                  <span className="font-bold text-ink">{cosign.count}</span>{" "}
                  {cosign.count === 1 ? "constituent has" : "constituents have"}{" "}
                  cosigned this
                </span>
              </span>
            </p>
          </div>
          {/* A rule rather than a gap, so the asking is a section of its own and
            not the fourth paragraph in a stack of seven. */}
          <div className="border-t border-line px-[22px] py-[18px]">
            <p className="font-body text-base text-ink leading-[1.55]">
              {COPY.cosignInvite}
            </p>
            {/* Only where the letter is not already open beside this. Cut at a
              word, not at a line: a clamped box left half a sentence standing
              under the fold of its own tint. */}
            {!letterShown && cosign.body && (
              <p className="mt-[14px] rounded-control bg-wash px-[14px] py-[12px] font-body text-sm text-ink-mid leading-[1.6]">
                {excerpt(cosign.body)}
              </p>
            )}
            <p className="mt-[12px] font-body text-base text-ink leading-[1.55]">
              {COPY.cosignNext}
            </p>
          </div>
          {/* The terms and the press that accepts them, in one band rather than
            two. No tint: the rules are the quietest thing here and a filled
            strip made them the loudest, ahead of the button. */}
          {/* The terms are the foot of the thing being read. White like the
            rest of it: with the card outlined, the rule alone divides them,
            and a fill made the quietest content the heaviest block. */}
          {skipReview && (
            <div className="border-t border-line px-[22px] py-[18px]">
              <ReviewContext
                draft={draft}
                onChange={onChange}
                six={six}
                labelled={false}
              />
            </div>
          )}
        </div>
        {/* Outside the card, with the press: the card is what is being read
            and this is the reader answering for it. Said in the first person,
            because it is their statement rather than the page's. */}
        <label
          className={`flex items-start gap-[12px] mt-[16px] rounded-control px-[12px] py-[10px] cursor-pointer hover:bg-wash transition-colors ${
            askedAgree && !agreed ? "bg-wash" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => {
              setAgreed((v) => !v);
              setAskedAgree(false);
            }}
            className="mt-[2px] w-[16px] h-[16px] shrink-0 accent-brand cursor-pointer"
          />
          <span
            className={`flex-1 font-body font-light text-sm leading-[1.45] ${
              askedAgree && !agreed ? "text-negative-ink" : "text-ink"
            }`}
          >
            {COPY.cosignAgree(cosign.name)}
          </span>
        </label>
        <button
          onClick={() => (agreed ? onSigning?.(true) : setAskedAgree(true))}
          // Dressed as disabled but pressable, the way the form's own primary
          // is: the press is how the reader finds out what is missing.
          aria-disabled={!agreed}
          className={`w-full mt-[12px] rounded-control px-[22px] py-[11px] font-body font-semibold text-base text-ink-inverse cursor-pointer transition-colors ${
            agreed ? "bg-brand hover:bg-brand-hover" : "bg-brand/40"
          }`}
        >
          {skipReview ? COPY.cosignOn : COPY.postCosign}
        </button>
      </div>
    );

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain lg:overflow-visible flex flex-col gap-[16px]">
      <div className="flex flex-col lg:flex-1 lg:min-h-0">
        {cosign ? (
          <>
            {/* What this will look like in the feed, filling in as they type.
                A co-sign is filed as their own input, and a preview is the
                only thing on the page that says so rather than asserting
                it. */}
            <ComposeLabel>{COPY.cosignPreviewLabel}</ComposeLabel>
            <div className="mb-[24px] lg:mb-[20px] rounded-control border border-line bg-surface">
              <CosignPreview cosign={cosign} noWords={noWords} />
            </div>
          </>
        ) : (
          <>
            {/* One a row rather than a wrapping line of chips. Four of these are
                sentences, not one-word stances, and on a panel's width they
                wrapped into a block a reader had to pick apart. */}
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
          </>
        )}
        <ComposeLabel>
          {cosign ? (
            <>
              {COPY.cosignBodyLabel}{" "}
              {/* Set apart from the label rather than part of it: it says what
                  the field costs, not what it is. */}
              <span className="font-normal text-ink-faint">
                {COPY.cosignBodyAside}
              </span>
            </>
          ) : (
            COPY.bodyLabel
          )}
        </ComposeLabel>
        <textarea
          ref={field}
          onAnimationEnd={() => setAsking(false)}
          // Emptied while it is shut, not cleared: the words are still on the
          // draft and come back the moment the box is unticked. Shown faint
          // behind a disabled field they read as something being posted.
          value={!!cosign && noWords ? "" : words}
          onChange={(e) => {
            if (e.target.value.trim()) setRefused(false);
            setWords(e.target.value);
          }}
          placeholder={
            !!cosign && noWords ? "" : cosign ? COPY.cosignPrompt : COPY.prompt
          }
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
          // Shut while they have said they are adding nothing. The box and the
          // field are two halves of one answer, and a field still taking words
          // under a ticked box is the form disagreeing with itself.
          disabled={!!cosign && noWords}
          className={`h-[150px] lg:h-auto lg:flex-1 lg:min-h-0 lg:max-h-[280px] w-full resize-none border rounded-control p-[12px] font-body text-[16px] sm:text-base text-ink leading-[1.55] placeholder:text-base placeholder:text-ink-faint focus:outline-none disabled:bg-wash disabled:text-ink-faint disabled:placeholder:text-ink-faint disabled:cursor-not-allowed ${
            !!cosign && noWords ? "" : "bg-surface"
          } ${
            // The border carries the refusal. The placeholder is the field
            // telling you what to write, which is the same sentence whether or
            // not you have just been told off.
            refused
              ? "border-negative focus:border-negative"
              : "border-line focus:border-brand"
          } ${asking ? "animate-ask motion-reduce:animate-none" : ""}`}
        />
        {/* Always, once this is a co-sign. It used to go once there were words
            in the field, which moved the two rows under it on the first
            keystroke: a control that jumps away while somebody is typing is
            worse than one that is simply not needed yet. */}
        {cosign && (
          /* The same row the digest choice below it is: a real checkbox in
             the page's accent, the label at its weight, and the whole row a
             hover target at the same inset. A hand-drawn box beside a native
             one read as two different kinds of question. */
          <label
            className={`shrink-0 flex items-center gap-[12px] mt-[8px] rounded-control px-[12px] py-[10px] cursor-pointer hover:bg-wash transition-colors ${
              refused ? "text-negative-ink" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={noWords}
              onChange={() => {
                onNoWords?.(!noWords);
                setRefused(false);
              }}
              className="w-[16px] h-[16px] shrink-0 self-center accent-brand cursor-pointer"
            />
            <span
              className={`flex-1 font-body font-light text-sm leading-[1.45] ${
                refused ? "text-negative-ink" : "text-ink"
              }`}
            >
              {COPY.cosignNoWords}
            </span>
          </label>
        )}
        {/* Nothing to share, nothing to ask about. Where the reader has said
            they are adding no words of their own, the choice of whether those
            words may be carried has no subject. */}
        {!(cosign && noWords) && (
          <div className="shrink-0 mt-[14px]">
            <DigestChoice
              draft={draft}
              onChange={onChange}
              six={six}
              cosigning={!!cosign}
            />
          </div>
        )}
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
            className={`mr-auto inline-flex items-center gap-[5px] font-body text-xs text-ink-mid transition-opacity duration-500 motion-reduce:transition-none ${
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
        {/* A way out beside the way on, where there is no draft to delete:
            the press next to it files something, and a step that offers only
            that is a corner. */}
        {cosign && !showDelete && (
          <button
            onClick={onCancel}
            className="font-body font-semibold text-sm text-ink-mid hover:text-ink cursor-pointer px-[12px] py-[14px] sm:px-[8px] sm:py-[8px]"
          >
            {COPY.cosignBack}
          </button>
        )}
        {showDelete && (
          <button
            // It says delete, so it deletes: the words go and the position
            // goes back to the default, and then the form is put away. Closing
            // without deleting is what the panel's own control does.
            onClick={() => {
              // Whichever of the two this panel is writing. Deleting a
              // co-sign's words should not empty a filing of the reader's own
              // waiting on the same committee.
              onChange(
                cosign
                  ? { cosignBody: "" }
                  : { body: "", position: STARTING_DRAFT.position },
              );
              onCancel();
            }}
            className="font-body font-semibold text-sm text-ink-mid hover:text-ink cursor-pointer px-[12px] py-[14px] sm:px-[8px] sm:py-[8px]"
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
          {skipReview
            ? COPY.postCosign
            : cosign
              ? COPY.toReviewCosign
              : COPY.toReview}
        </button>
      </div>
    </div>
  );
}

/** A quiet label above a block of the review. The section heads' own voice. */
function ReviewLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-body font-semibold text-2xs uppercase tracking-[0.08em] text-ink-mid mb-[8px]">
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
/**
 * What a co-sign will look like in the feed, drawn as it is written.
 *
 * The card the feed draws for somebody else's co-sign, with the reader's own
 * account in it: their name, and the letter they are signing.
 *
 * The words are not mirrored into it. A preview that fills in as somebody
 * types asks them to watch two places at once and turns the panel into a
 * demonstration of itself; this says where the words will go and leaves the
 * writing to the field.
 *
 * Built here rather than by reusing `SubmissionEntry`: that card carries a
 * kebab, a date in the corner and a click-through to a submission that does
 * not exist yet, and a preview with live controls in it invites a reader to
 * press them.
 */
function CosignPreview({
  cosign,
  noWords,
  body = "",
}: {
  cosign: { name: string; position: ConferencePosition };
  /** Whether the reader has said they are adding nothing of their own. */
  noWords: boolean;
  /**
   * The words themselves, where there are any to show.
   *
   * Empty while they are being written, so the card says where they will land
   * rather than mirroring the field beside it; filled at the review, where
   * what is being checked is the entry itself.
   */
  body?: string;
}) {
  return (
    <div className="flex gap-[14px] px-[16px] pt-[14px] pb-[20px]">
      <span className="shrink-0 flex items-center justify-center w-[36px] h-[36px] rounded-full bg-brand-soft font-body font-semibold text-xs text-brand-ink">
        {VIEWER.initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-[6px] font-body font-semibold text-base text-ink leading-none">
          {VIEWER.name}
          <span className="font-normal text-ink-mid">cosigned</span>
          <span className="min-w-0 truncate">{cosign.name}</span>
          <PositionChip position={cosign.position} />
        </p>
        <p className="mt-[8px] font-body text-xs text-ink-faint">
          {VIEWER.descriptor}
        </p>
        {/* Set as the card sets a body, because that is what these lines are
            standing in for. */}
        {/* The card's own wordless line, with its last sentence standing in
            for the words: what a reader sees here is what the entry says
            before they write, and where what they write will land. */}
        {/* Once they have said they are adding nothing, this stops describing
            what will appear and shows it: the card's own wordless line, as
            the feed will set it. */}
        {body.trim() ? (
          <p className="mt-[10px] font-body text-base text-ink leading-[1.55] whitespace-pre-line">
            {body.trim()}
          </p>
        ) : noWords ? (
          <p className="mt-[10px] font-body italic text-base text-ink-faint leading-[1.55]">
            Each individual can provide input or cosign one position. This
            individual decided not to publicly share additional input.
          </p>
        ) : (
          <p className="mt-[10px] font-body text-base text-ink leading-[1.55]">
            Each individual can provide input or cosign one position, with the
            option to add their own words. This is where that message will
            appear.
          </p>
        )}
      </div>
    </div>
  );
}

export const asSubmission = (
  draft: Draft,
  /**
   * The letter this was filed under, where it was a co-sign.
   *
   * Without it the card in the feed is a filing of the reader's own, which is
   * the one thing a co-sign is not: it would stand with no letter named and no
   * wordless line, and the count beside it would be claiming a signature the
   * list cannot show.
   */
  cosignOf?: string | null,
): ConferenceSubmission => ({
  // A stable id, because nothing else in the feed may collide with it.
  id: "cc-viewer-draft",
  userId: VIEWER.id,
  position: draft.position,
  date: draft.posted ? POSTED_DATE : PREVIEW_DATE,
  // A co-sign files the words written under the letter; a filing of the
  // reader's own files theirs.
  body: (cosignOf ? draft.cosignBody : draft.body).trim(),
  ...(cosignOf ? { cosignOf } : null),
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
  cosigning,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  six: CommitteeMember[];
  /**
   * Whose words are being offered. Co-signing hands them to the organisation
   * as well as to MAPLE, because the letter is theirs and a line added to it
   * is something they may carry on with it.
   */
  cosigning?: boolean;
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
          {cosigning ? COPY.digestCosign : COPY.digest}
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
            {cosigning ? COPY.digestCosignMore : COPY.digestOnMore}
          </button>
        </p>
      ) : (
        // An orange of its own rather than the caution ink, which at this size
        // and weight read as brown and disappeared into the page. Not the
        // negative red either: nothing has gone wrong, the reader has chosen
        // something and is being asked whether they meant it. A step up in
        // weight as well, since italic light is the quietest thing here.
        <p className="px-[12px] -mt-[5px] font-body font-light italic text-xs text-ink-mid leading-[1.5]">
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
  bare = false,
}: {
  draft: Draft;
  subject: string;
  six: CommitteeMember[];
  /** Left off once posted, when there is nothing left to change. */
  onChange?: (patch: Partial<Draft>) => void;
  /** The card alone, where the container names it already. */
  bare?: boolean;
}) {
  const empty = draft.body.trim().length === 0;
  return (
    <div>
      {bare ? null : draft.posted ? (
        <p className="flex items-center gap-[6px] font-body font-semibold text-sm text-positive-ink mb-[10px]">
          <Check className="w-[15px] h-[15px] shrink-0" strokeWidth={2.5} />
          {COPY.postedStamp}
        </p>
      ) : (
        <>
          {/* One line rather than two: the label and the subject were saying
              the same thing in two registers, and the sentence they make
              together is shorter than either of them stacked. */}
          <p className="font-body font-semibold text-sm text-ink-mid mb-[8px]">
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
  labelled = true,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  six: CommitteeMember[];
  /**
   * Whether the list announces itself.
   *
   * A review needs the heading, because the rules arrive among several other
   * things. On the card that offers the co-sign they are the last thing in it
   * and a heading over three bullets is a label on a label.
   */
  labelled?: boolean;
}) {
  if (draft.posted)
    return (
      <div className="flex flex-col gap-[10px]">
        {draft.digest && (
          <p className="font-body text-base text-ink leading-[1.6]">
            {COPY.postedDigest}
          </p>
        )}
        <p className="font-body text-sm text-ink-mid leading-[1.6]">
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
        {labelled && <ReviewLabel>{COPY.rulesLabel}</ReviewLabel>}
        <ul className="list-disc list-outside pl-[16px] space-y-[8px] font-body text-xs text-ink-mid leading-[1.5] marker:text-ink-faint">
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
  complete = false,
  cosigning = false,
}: {
  draft: Draft;
  onBack: () => void;
  onPost: () => void;
  onClose: () => void;
  onSeeOthers: () => void;
  /** Full-width primary on its own line, for a container with no room across. */
  stacked?: boolean;
  /**
   * Postable although nothing is written. A co-sign whose signer has said they
   * are adding no words of their own is finished, and the usual refusal would
   * be asking them for the one thing they have already declined.
   */
  complete?: boolean;
  /** Whether this review is of a co-sign, which names its own final press. */
  cosigning?: boolean;
}) {
  const empty =
    !complete &&
    (cosigning ? draft.cosignBody : draft.body).trim().length === 0;
  const quiet =
    "font-body font-semibold text-sm text-ink-mid hover:text-ink cursor-pointer px-[12px] py-[14px] sm:px-[8px] sm:py-[8px]";
  const primary =
    "bg-brand text-ink-inverse font-body font-semibold text-sm px-[24px] py-[14px] sm:px-[18px] sm:py-[8px] rounded-control cursor-pointer hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand";

  return (
    <div className="flex flex-col gap-[8px] pt-[14px] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0">
      {/* Said once, beside the disabled button, rather than as a warning the
          reader meets before they have done anything wrong. */}
      {!draft.posted && empty && (
        <p className="font-body text-xs text-ink-mid text-right">
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
              onClick={onPost}
              disabled={empty}
              className={`${primary} ${stacked ? "w-full" : ""}`}
            >
              {complete || cosigning ? COPY.postCosign : COPY.post}
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
  /** The letter being signed, where this review is of a co-sign. */
  cosign?: { name: string; position: ConferencePosition };
  /** Whether they said they were adding nothing of their own. */
  noWords?: boolean;
}

/**
 * A few lines of a letter, cut at a word.
 *
 * Long enough to be the letter rather than a label, short enough that the card
 * asking about it is still the thing on screen.
 */
function excerpt(body: string, max = 260) {
  const one = body.trim().replace(/\s+/g, " ");
  if (one.length <= max) return one;
  const cut = one.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

/**
 * What the card under it is, and what it is about.
 *
 * One line for both paths: filing your own words and co-signing somebody
 * else's produce the same kind of entry on the same question, so the label
 * over the preview should not say they are different things.
 */
function PreviewLabel({ subject }: { subject: string }) {
  return (
    <ComposeLabel>
      {COPY.cosignPreviewLabel}{" "}
      <em className="font-normal italic text-ink-mid">
        {COPY.subjectPrefix.toLowerCase()} {subject}
      </em>
    </ComposeLabel>
  );
}

/** The header a container puts above the review, in whichever state it is in. */
export const reviewTitle = (posted: boolean, cosigning = false) =>
  posted
    ? COPY.postedTitle
    : cosigning
      ? COPY.reviewTitleCosign
      : COPY.reviewTitle;

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
  cosign,
  noWords = false,
}: ReviewProps) {
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-[24px] pb-[20px]">
        {/* The same card the writing step previewed, now with the words in
            it. A co-sign is checked as the entry it will be, not as a
            submission quoted back under a different heading; a filing of your
            own gets the same label, so the two paths read alike. */}
        {cosign ? (
          <div>
            <PreviewLabel subject={subject} />
            <div className="rounded-control border border-line bg-surface">
              <CosignPreview
                cosign={cosign}
                noWords={noWords}
                body={draft.cosignBody}
              />
            </div>
          </div>
        ) : (
          <div>
            <PreviewLabel subject={subject} />
            <ReviewSubmission
              draft={draft}
              subject={subject}
              six={six}
              onChange={onChange}
              bare
            />
          </div>
        )}
        {/* No digest choice here. It is asked on the writing step, beside the
            field it is about, and a review that asks it again is a second
            chance to answer a question nobody changed their mind on. */}
        {/* Last, under what they qualify, and well clear of it. Opening the
            panel on the terms made the first thing a reader met the conditions
            rather than the thing they wrote; sitting tight under the checkbox
            made them read as part of that one question. */}
        <div className="mt-[20px]">
          <ReviewContext draft={draft} onChange={onChange} six={six} />
        </div>
      </div>
      <div className="shrink-0 pt-[12px]">
        <ReviewActions
          draft={draft}
          onBack={onBack}
          onPost={onPost}
          onClose={onClose}
          onSeeOthers={onSeeOthers}
          complete={!!cosign && noWords}
          cosigning={!!cosign}
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
