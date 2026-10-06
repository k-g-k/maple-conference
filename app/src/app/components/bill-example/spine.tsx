import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { SynthSourcesNote, holdPress } from "../ballot";

/**
 * The page is built on one idea: a ballot question is a binary decision, so the
 * page has a center.
 *
 * Material that belongs to a side sits on that side of a hairline spine.
 * Material both sides share spans the full width and the spine simply is not
 * drawn. So the gutter opens where the campaigns diverge and closes where they
 * meet, and a reader can see the shape of the disagreement before reading a
 * word of it.
 *
 * The two sides are told apart by position and label only, never by color.
 * Green-for-yes and red-for-no is the single most common way a civic page stops
 * looking neutral, and this platform does not take positions.
 */

/** Material both sides share. The spine closes here. */
export function Span({ children }: { children: ReactNode }) {
  return <div className="max-w-[74ch]">{children}</div>;
}

/** Material that belongs to a side. The spine opens. */
export function Split({
  heads = false,
  headLabels,
  stackOnPhone = false,
  variant = "rule",
  left,
  right,
}: {
  /** Name the sides. Worth it the first time a chapter splits, noise after. */
  heads?: boolean;
  /** Override the names, for splits where the sides are not the vote itself. */
  headLabels?: { yes: string; no: string };
  /**
   * Let the sides stack below sm. Two columns on a 390px phone leaves about
   * 175px each, which is fine for a sentence and hostile to three arguments, a
   * donor table, or a filed statement. Comparison is the point, so pairing is
   * the default and this is the exception.
   */
  stackOnPhone?: boolean;
  /**
   * "rule" draws the spine between the sides. "cards" gives each side its own
   * container and drops the rule, because a border on each side plus a rule
   * between them is three vertical lines in fifty pixels and none of them reads
   * as the center. "bare" pairs the sides with neither: for chapters that
   * already carry enough vertical edges without the spine adding another.
   */
  variant?: "rule" | "cards" | "bare";
  left: ReactNode;
  right: ReactNode;
}) {
  const carded = variant === "cards";
  const gutter = carded
    ? "gap-x-[12px] sm:gap-x-[20px] lg:gap-x-[24px]"
    : "gap-x-[14px] sm:gap-x-[28px] lg:gap-x-[48px]";
  // Carded sides stretch to the taller of the two, so the pair reads as one
  // object with a divide rather than two boxes of different sizes. Ruled sides
  // stay top-aligned: there is no edge there for a ragged bottom to betray.
  const align = carded ? "" : "items-start";
  const frame = stackOnPhone
    ? `flex flex-col gap-[28px] sm:grid sm:grid-cols-[1fr_1px_1fr] ${carded ? "" : "sm:items-start"} ${gutter}`
    : `grid grid-cols-[1fr_1px_1fr] ${align} ${gutter}`;
  const side = carded
    ? "flex flex-col gap-[16px] min-w-0 rounded-card border border-line p-[14px] sm:p-[24px] lg:p-[28px]"
    : "flex flex-col gap-[16px] min-w-0";
  // Stacked, the label is the only thing saying which side you are reading, so
  // it shows regardless. Paired, position already says it.
  const headClass = stackOnPhone
    ? heads
      ? ""
      : "sm:hidden"
    : heads
      ? ""
      : "hidden";
  return (
    <div className={frame}>
      <div className={side}>
        <SideHead vote="yes" label={headLabels?.yes} className={headClass} />
        {left}
      </div>
      <div
        className={`self-stretch ${variant === "rule" ? "bg-line" : ""} ${stackOnPhone ? "hidden sm:block" : ""}`}
        aria-hidden
      />
      <div className={side}>
        <SideHead vote="no" label={headLabels?.no} className={headClass} />
        {right}
      </div>
    </div>
  );
}

export function SideHead({
  vote,
  label,
  className = "",
}: {
  vote: "yes" | "no";
  label?: string;
  className?: string;
}) {
  return (
    <p
      // All caps needs letterspacing to stay legible; without it the forms
      // crowd. No rule under it: inside a bordered card the border is already
      // doing that job.
      className={`font-display font-medium text-base sm:text-lg uppercase tracking-[0.08em] text-ink ${className}`}
    >
      {label ?? (vote === "yes" ? "Voting yes" : "Voting no")}
    </p>
  );
}

/**
 * What a section card holds around its contents, and what sits under its
 * heading. One rule, written here because more than one file draws a card: the
 * page's own box, and the committee block above it.
 *
 * The numbers are the ones the pinned, banded cards read as before the band
 * stopped taking room: a card's 20 and 24 plus the 6 the band's own margin
 * left above the heading, and the 20 under the heading plus the band's 10. Any
 * card in either view now carries them whether its heading pins or not.
 *
 * The card owns all four sides. Content inside starts against them, so a child
 * adding an inset of its own is a second gutter and reads as a mistake where
 * the thing beside it does not have one.
 */
export const CARD_PX = "px-[32px]";
export const CARD_PT = "pt-[24px]";
export const CARD_PB = "pb-[32px]";

/**
 * The gap between a section heading and the first thing under it.
 *
 * Padding rather than margin, so a banded heading's negative bottom margin
 * cannot collapse into it and take 10px of the gap with it.
 */
export const HEAD_GAP = "pt-[24px]";

/**
 * A heading that comes to rest while its section is still on screen.
 *
 * Above the section's own content, which runs under it, and below the page's
 * bar at z-10, which wins the overlap so a heading coming to rest slides under
 * it rather than over it. Opaque, not 95%: at 95% the words underneath ghost
 * through, and the blur went with the transparency it was covering for. Bled
 * to the page's gutters rather than to the words, the same pair the bar above
 * it uses, so the band reads as the full width of the page rather than as a
 * patch behind the heading.
 *
 * Above the section's own pinned chrome as well, a table head or a filter row,
 * and that is the part worth saying out loud. While the two are both at rest
 * they only touch, so the order between them never shows. It shows when the
 * chrome lets go: a sticky element cannot leave the box that holds it, so once
 * the last row is past, the head travels back up the window and across
 * whatever is still pinned above it. Painting below the heading, it cut the
 * words in half on the way out. Painting above it, there is nothing to see:
 * the band is opaque, so the head passes behind it.
 *
 * `top` is where it rests, which is the page's business: it is the sum of
 * everything already pinned above it. Left off, the band does not pin at all,
 * for a view whose headings scroll away. It keeps the ground and the paint
 * order, so chrome letting go cannot cut a heading that has not left yet.
 *
 * The color is whatever the container it sits in sets as `--band`, so a band
 * inside a white card is white and one on the page is the page's own ground,
 * without either knowing about the other.
 *
 * It takes no room. The band changed the spacing around a heading just by
 * being there, which is how two cards in the same stack came to be spaced
 * differently: the one whose heading pinned sat lower in its card and left
 * more air under its heading than the one whose heading did not. The padding
 * it needs while pinned is canceled by margins of the same size, so the
 * heading lands exactly where it would without a band, and the card and the
 * chapter are the only things holding the rhythm. See CARD_PT and HEAD_GAP.
 */
export function StickyBand({
  top,
  narrowOnly,
  inset,
  innerRef,
  data,
  children,
}: {
  /** Where it comes to rest. Left off, the band does not pin at all. */
  top?: string;
  /**
   * Pin below sm and let go above it.
   *
   * For a section that is a table on a wide screen and a stack on a phone:
   * the table has its own column heads to say what a row means, the stack has
   * nothing, so the section's own heading has to stay and say it.
   */
  narrowOnly?: boolean;
  /**
   * Paint only as wide as the content, not out to the card's edges.
   *
   * The band bleeds by default so that, pinned, it covers the full width of
   * whatever scrolls under it. Where the section is read on the page rather
   * than in a card, that bleed reads as a white stripe running past the text
   * on both sides.
   */
  inset?: boolean;
  /** For a page that has to know how tall the band is, because something
   *  below it comes to rest under it. */
  innerRef?: Ref<HTMLDivElement>;
  /** A name on the band, so something outside it can find it to measure. */
  data?: string;
  children: ReactNode;
}) {
  return (
    <div
      ref={innerRef}
      data-band={data}
      // The offset rides on a custom property rather than on `top` itself, so
      // a variant can take it away again. Set as `top` inline it could not be:
      // an inline style beats every class, and `relative` with a leftover
      // `top` does not sit still, it moves down by it, which put a section's
      // heading a hundred pixels into its own content.
      style={top ? ({ "--pin-top": top } as CSSProperties) : undefined}
      // Each padding is canceled by a negative margin of the same size, so
      // the band occupies exactly the height of the heading in the flow and
      // paints beyond it in both directions. The top padding keeps the words
      // off the underside of the bar once the band is pinned; the bottom
      // padding is the opaque strip that content passes behind on its way out,
      // so it never touches the descenders. At rest both sit on the card's own
      // padding and the gap under the heading, in the card's own color, so
      // neither shows.
      //
      // The horizontal pair is the negative twin of CARD_PX: the band bleeds
      // to the inside of the card's line and then gives the width back, so the
      // heading stays in the same column as the content under it.
      //
      // One z whether it pins or not, because the reason for it is the same
      // either way: over the section's own chrome, under the page's bar.
      //
      // The top corners are rounded to the card's own radius. The band bleeds
      // to the inside of the card's line and reaches up into its top padding,
      // so square corners painted over the corner the card had just rounded.
      className={`z-[9] rounded-t-card bg-[var(--band,var(--color-ground))] -mt-[12px] pt-[12px] -mb-[12px] pb-[12px] ${
        inset ? "" : "-mx-[32px] px-[32px] "
      }${
        top
          ? narrowOnly
            ? "sticky top-[var(--pin-top)] sm:relative sm:top-auto"
            : "sticky top-[var(--pin-top)]"
          : "relative"
      }`}
    >
      {children}
    </div>
  );
}

/**
 * One question a voter actually asks, answered before any evidence appears.
 *
 * The scale gap is the scaffolding: the question and its answer are set large
 * enough to be the only thing a hurried reader takes in, and the evidence
 * underneath is deliberately quieter. Stopping early still leaves you with
 * something true.
 */
export function Chapter({
  id,
  question,
  action,
  adornment,
  answer,
  band,
  hideQuestion = false,
  flush = false,
  stickyHeading,
  narrowPin,
  bandHeading,
  bandInset,
  headingRef,
  headingData,
  titleClass,
  rail,
  tightBody = false,
  children,
}: {
  id: string;
  question: string;
  /** Sits opposite the question, for the one thing you can do in the chapter. */
  action?: ReactNode;
  /** Sits directly beside the question, for a control that qualifies it. */
  adornment?: ReactNode;
  /** The plain-language answer. Large, and the first thing after the question. */
  answer?: ReactNode;
  /**
   * Material that shares a full-bleed white band with the question itself.
   *
   * A band is not a card. A card says "this is one object on the page"; the
   * band says "for this stretch, the page itself is a different surface", so
   * the heading sits inside it rather than above it and the white runs to the
   * window edge. `children` continue below on the ground, which is what lets a
   * chapter open at hero weight and then drop back to reading weight.
   */
  band?: ReactNode;
  /** Skip drawing the question here, for a page that draws it itself. */
  hideQuestion?: boolean;
  /** Drop the chapter's own top padding and tighten the gap under the
   *  heading, for a page that has already put the chapter in a box. */
  flush?: boolean;
  /** Pin the heading at this offset while the section's own content scrolls
   *  past it, releasing when the section ends. Any CSS length. */
  stickyHeading?: string;
  /** Pin that heading below sm only, and let go above it. */
  narrowPin?: boolean;
  /**
   * Give the heading the band without pinning it, for a view that pins the
   * section's chrome but not its headings. The heading keeps the band's paint
   * order, so chrome letting go passes behind it rather than through it.
   */
  bandHeading?: boolean;
  /** Keep the band inside the content, for a section with no card. */
  bandInset?: boolean;
  /** Handed to the pinned band, for a page measuring what rests under it. */
  headingRef?: Ref<HTMLDivElement>;
  /** A name on the heading band, for a measurement taken from outside it. */
  headingData?: string;
  /** Override the heading's type, for a page trying a different face. */
  titleClass?: string;
  /**
   * A column down the right of this chapter, flush with its top rule and with
   * the window's right edge. The chapter's own content, heading included,
   * moves left to make room.
   */
  rail?: ReactNode;
  /**
   * A heading that sits close to what it names.
   *
   * The default gap is set for a chapter of prose. A section whose whole body
   * is one card wants the heading on top of it, or the two read as unrelated.
   */
  tightBody?: boolean;
  children?: ReactNode;
}) {
  const heading = hideQuestion ? null : (
    <>
      {/* Bottom edges rather than tops. The action is a line of text beside a
          heading two or three sizes larger than it, and aligned at the top it
          floated above the words it belongs with. The only chapter that
          carries one is Public Input. */}
      <div className="flex flex-wrap items-end justify-between gap-x-[20px] gap-y-[10px]">
        <div className="flex items-baseline gap-[14px] flex-wrap min-w-0">
          <h2
            id={`${id}-q`}
            className={
              titleClass ??
              "font-display font-medium text-xl sm:text-2xl lg:text-3xl tracking-display text-ink max-w-[20ch] text-balance"
            }
          >
            {question}
          </h2>
          {adornment}
        </div>
        {/* No full width below 580. It was there to centre the control on its
            own line, and the line it was taking was one it did not need: the
            heading and a four-word link sit together at phone width. */}
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {answer && <div className="mt-[16px]">{answer}</div>}
    </>
  );
  const body = children && (
    <div className="flex flex-col gap-[28px] sm:gap-[40px]">{children}</div>
  );
  return (
    <section
      id={id}
      aria-labelledby={`${id}-q`}
      // Clears whatever is pinned: the contents bar alone on narrow, the nav
      // and the bar together once the nav becomes sticky at lg.
      className={`scroll-mt-[64px] lg:scroll-mt-[120px] ${
        band || hideQuestion || flush ? "" : "pt-[28px] sm:pt-[40px]"
      }`}
    >
      {/* The full-width rule that used to open each chapter is gone; the
          question itself is the break, and the top padding it left behind is
          the same either way. */}
      {rail ? (
        <div className="lg:flex lg:items-start">
          <div className="min-w-0 lg:flex-1 pt-[28px] sm:pt-[40px] lg:pr-[40px]">
            {heading}
            {body && <div className="mt-[28px] sm:mt-[40px]">{body}</div>}
          </div>
          {rail}
        </div>
      ) : band ? (
        <>
          {/* Out of the centred column and back into it. The bleed is measured
              against `--page-w`, the width the page currently has, not against
              the viewport: when the testimony drawer pushes the page over, the
              band has to contract with everything else rather than sliding
              underneath it. Falls back to the viewport where nothing sets it.
              The value can exceed the content box where the scrollbar takes
              width, so the page root clips the overflow. */}
          <div className="ml-[calc(50%-var(--page-w,100vw)/2)] w-[var(--page-w,100vw)]">
            <div className="mx-auto max-w-[1180px] px-[20px] sm:px-[32px] pt-[28px] sm:pt-[40px] pb-[32px] sm:pb-[44px]">
              {heading}
              <div className="mt-[28px] sm:mt-[40px]">{band}</div>
            </div>
          </div>
          {body && <div className="mt-[28px] sm:mt-[40px]">{body}</div>}
        </>
      ) : (
        <>
          {/* Pinned, the heading says which section the content under it
              belongs to for as long as that content is on screen. It sticks
              inside its own section, so it leaves with it. Banded but not
              pinned, it only takes the ground and the paint order. */}
          {stickyHeading || bandHeading ? (
            <StickyBand
              top={stickyHeading}
              narrowOnly={narrowPin}
              inset={bandInset}
              innerRef={headingRef}
              data={headingData}
            >
              {heading}
            </StickyBand>
          ) : (
            heading
          )}
          {/* No heading, no gap under it. A hidden question means something
              above the section already names it, and the space that separated
              the two is then just a hole at the top of the content. */}
          {body && (
            <div
              className={
                heading
                  ? tightBody
                    ? "pt-[14px] sm:pt-[16px]"
                    : flush
                      ? HEAD_GAP
                      : "pt-[28px] sm:pt-[40px]"
                  : ""
              }
            >
              {body}
            </div>
          )}
        </>
      )}
    </section>
  );
}

/**
 * The AI layer, wherever it appears. A coral hairline and a quiet mark rather
 * than a box: synthesis runs through this page as a texture, so it has to be
 * identifiable at a glance without becoming the loudest thing on screen.
 */
export function Synth({
  ids,
  prompt,
  children,
}: {
  ids: string[];
  prompt?: string;
  children: ReactNode;
}) {
  return (
    // `group` here rather than on the chip: hovering anywhere in the passage
    // reveals the link, so the whole synthesis is the affordance rather than a
    // small target inside it.
    <div className="group relative ml-[6px] pl-[14px] sm:pl-[20px]">
      {/* The rule is an element rather than a border, because a filter applies
          to a whole element: desaturating a border would desaturate the
          passage along with it. Same treatment as the chip, and the same group
          drives both, so the mark and its label come back to colour together
          when you hover the synthesis. */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[2px] bg-ai grayscale-[50%] group-hover:filter-none"
      />
      {children}
      <div className="mt-[10px]">
        <SynthSourcesNote ids={ids} prompt={prompt} />
      </div>
    </div>
  );
}

/** A quiet label above a block of evidence. */
export function Label({ children }: { children: ReactNode }) {
  return (
    <p className="font-body font-semibold text-xs text-ink-mid mb-[10px]">
      {children}
    </p>
  );
}

/**
 * A labeled block the reader opens, for material that answers a question they
 * may not have asked yet.
 *
 * Closed by default, so the chapter reads at its shortest and the depth is
 * there for whoever wants it. The label keeps `Label`'s voice rather than
 * becoming a heading: this is a control, not a section, and a page with several
 * of these should not look like it has gained several sections.
 */
export function Disclosure({
  label,
  defaultOpen = false,
  anchorId,
  variant = "label",
  size = "default",
  labelClass,
  contentClass,
  shaded = false,
  hover = "wash",
  openSignal = 0,
  children,
}: {
  label: string;
  /** "large" is the heading disclosure for a page where the disclosures are
   *  the main reading: same type size, but top-aligned and given a slightly
   *  bigger chevron, because these labels routinely run to two or three lines
   *  and a centred chevron drifts into the middle of the block. */
  size?: "default" | "large";
  defaultOpen?: boolean;
  /**
   * Bump to open it from elsewhere on the page. A counter rather than a
   * boolean, so a second request still opens it after the reader has closed it
   * again, and so the page can ask without having to own the state.
   */
  openSignal?: number;
  /**
   * "label" is the quiet control: a small tag for material the chapter is
   * offering. "heading" keeps the section heading exactly as it looks when the
   * material is laid out in full, and makes it the thing you press, for a
   * chapter whose sections are collapsed rather than removed. A reader should
   * see the same page either way, with parts of it folded.
   */
  variant?: "label" | "heading";
  /** Override the label's type, for a page trying a different face. */
  labelClass?: string;
  /**
   * What hovering the row looks like. "wash" shades the whole hit area, which
   * is right where the row is a control among other content. "text" leaves the
   * ground alone and moves the label's color instead, for a row that already
   * sits on a surface of its own and would otherwise gain a second one.
   * The hit area is the same either way.
   */
  hover?: "wash" | "text";
  /**
   * Shade the whole block while it is open: the label row and the material it
   * opened onto sit on one surface, so an open block reads as one object
   * rather than a pressed control with something loose under it. The row's own
   * hover wash steps aside while that is on, since the wash is already there.
   */
  shaded?: boolean;
  /**
   * Override the opened panel's indent. The default lines the panel up under
   * the label's words, which is right for prose. A panel that is a surface of
   * its own wants the width of the pressable row instead, so that the card and
   * the row it opened from have the same edges.
   */
  contentClass?: string;
  /**
   * Element to bring to the top of the viewport when this opens. Given the
   * group's id, opening any one of a stack puts the whole stack in view, so
   * the labels you did not pick stay reachable instead of being pushed off
   * screen by what you did pick.
   */
  anchorId?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const lastOpenSignal = useRef(openSignal);
  useEffect(() => {
    if (lastOpenSignal.current === openSignal) return;
    lastOpenSignal.current = openSignal;
    setOpen(true);
  }, [openSignal]);
  const toggle = (e: { currentTarget: Element }) => {
    const opening = !open;
    // The row you pressed stays where it is on screen. Opening one of these
    // adds height, and height added above the fold takes the page down with
    // it, so the label slides out from under the pointer that just hit it.
    holdPress(e, () => setOpen(opening));
    if (!opening || !anchorId) return;
    // After the browser has laid the opened content out, so the scroll lands
    // where the element actually ends up.
    requestAnimationFrame(() => {
      document.getElementById(anchorId)?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
  };
  const lit = shaded && open;
  return (
    // The padding arrives with the shading and is canceled by a matching
    // negative margin, so the block grows a surface around the words without
    // the words themselves moving.
    <div
      className={
        lit
          ? "bg-surface rounded-card -mx-[32px] px-[32px] -my-[12px] py-[12px]"
          : ""
      }
    >
      <button
        onClick={toggle}
        aria-expanded={open}
        // Negative margin against the padding, so the hover target is bigger
        // than the words without the words moving. Dropped once the whole
        // block is shaded, where the wash comes from the wrapper instead.
        //
        // Top-aligned and full width at the large size: the label runs to two
        // or three lines, a centred chevron drifts to the middle of the
        // block, and the row is the whole column so the hit area should be
        // too.
        className={`group rounded-control flex cursor-pointer -mx-[8px] -my-[4px] px-[8px] py-[4px] ${
          lit || hover === "text" ? "" : "hover:bg-wash"
        } ${
          size === "large" ? "w-full text-left items-start" : "items-center"
        } ${variant === "heading" ? "gap-[8px]" : "gap-[6px]"}`}
      >
        <ChevronRight
          aria-hidden
          className={`shrink-0 text-ink-faint group-hover:text-ink transition-transform duration-150 ${
            variant === "heading"
              ? size === "large"
                ? // Aligned to the label's first line optically rather than
                  // geometrically. The line box is about 25 and the mark is
                  // 19, so centring puts it at 3, but the words sit above the
                  // middle of their own box because the descender space is
                  // mostly empty, and the mark has to follow them up.
                  "w-[19px] h-[19px] mt-[1px]"
                : "w-[18px] h-[18px]"
              : "w-[14px] h-[14px]"
          } ${open ? "rotate-90" : ""}`}
        />
        <span
          className={`${
            labelClass ??
            (variant === "heading"
              ? `font-display font-medium text-ink text-left ${
                  size === "large" ? "text-xl leading-[1.3]" : "text-xl"
                }`
              : "font-body font-semibold text-sm text-ink-mid")
          } ${
            // Never lighter on hover. A label that fades when you reach for
            // it reads as going away rather than as answering. A heading is
            // already at the darkest ink the page has, so it simply holds;
            // the smaller variant sits muted and comes up to full ink. Either
            // way the chevron beside it darkens, which is the movement.
            hover === "text" && variant !== "heading"
              ? "group-hover:text-ink transition-colors"
              : ""
          }`}
        >
          {label}
        </span>
      </button>
      {/* Indented to the words rather than the chevron, so the opened material
          lines up under the heading it belongs to. */}
      {open && (
        <div
          // Indented to the words, not to the chevron: the panel lines up
          // with the label it opened from. 27px is the chevron at 19 plus the
          // 8px gap after it.
          className={`mt-[14px] ${
            contentClass ??
            (size === "large"
              ? "pl-[27px]"
              : variant === "heading"
                ? "pl-[26px]"
                : "pl-[20px]")
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Copy whose emphasis was decided in the data rather than at the call site.
 *
 * The page sets a clause in bold in two places, and both read their segments
 * from `content.ts`. This is the only thing that knows what emphasis looks
 * like, so the two cannot drift apart.
 */
export function Segments({
  parts,
  notes,
  strongClass = "font-extrabold",
}: {
  /** Note bodies, indexed by marker number, shown when a marker is hovered. */
  notes?: {
    text: string;
    emphasis?: boolean;
    italic?: boolean;
    block?: boolean;
  }[][];
  parts: {
    text: string;
    emphasis?: boolean;
    italic?: boolean;
    href?: string;
    /** Starts its own line, for a note that wants a heading above its body. */
    block?: boolean;
    /** Marks this phrase with a superscript, and hangs a note off it. */
    footnote?: number;
  }[];
  strongClass?: string;
}) {
  return (
    <>
      {parts.map((part, i) => {
        const cls = [
          part.emphasis ? strongClass : "",
          part.italic ? "italic" : "",
        ]
          .filter(Boolean)
          .join(" ");
        // `strong` where the point is weight and `em` where it is stress, so
        // the markup says which kind of emphasis this is rather than leaving
        // it to the class.
        const Tag = part.emphasis ? "strong" : "em";
        // An anchor on this page is a different promise from a link off it, so
        // it looks different: brand ink and no underline for a jump, official
        // blue and an underline for something that leaves. Emphasis composes
        // with either, so a phrase can be bold and be a link.
        const jump = part.href?.startsWith("#");
        const linkCls = jump
          ? "text-brand hover:text-brand-hover"
          : "text-official-ink hover:text-official underline decoration-[1.5px] underline-offset-[3px]";
        const inner = part.href ? (
          <a
            href={part.href}
            {...(jump ? {} : { target: "_blank", rel: "noopener noreferrer" })}
            className={`group ${cls} ${linkCls}`.trim()}
          >
            {part.text}
            {jump && (
              // Sized in em so it tracks the type it sits in, and inline
              // rather than flexed so a long phrase can still wrap.
              <ArrowRight
                aria-hidden
                className="inline-block align-[-0.13em] ml-[6px] w-[0.85em] h-[0.85em] group-hover:[stroke-width:2.75]"
              />
            )}
          </a>
        ) : cls ? (
          <Tag className={cls}>{part.text}</Tag>
        ) : (
          part.text
        );

        if (!part.footnote)
          return (
            <span
              key={i}
              className={part.block ? "block mt-[8px] first:mt-0" : undefined}
            >
              {inner}
            </span>
          );
        const note = notes?.[part.footnote - 1];
        return (
          // The phrase and its marker share one hover target, so the note is
          // reachable by aiming at the words rather than at a 12px digit. The
          // wrapper stays inline rather than inline-block: a marked phrase can
          // be several words long and still has to break across lines.
          <span key={i} className="group/fn relative cursor-default">
            {inner}
            <sup className="font-body font-semibold text-[0.55em] ml-[1px] align-super text-ink-faint group-hover/fn:text-ink">
              {part.footnote}
            </sup>
            {note && (
              <span
                role="tooltip"
                className="pointer-events-none absolute left-0 bottom-full mb-[8px] hidden group-hover/fn:block w-[320px] max-w-[80vw] bg-surface border border-line-strong rounded-control shadow-popover p-[12px] z-40 font-body font-normal text-sm text-ink leading-[1.55] text-left"
              >
                <Segments parts={note} strongClass="font-semibold" />
              </span>
            )}
          </span>
        );
      })}
    </>
  );
}

/**
 * A boxed aside inside a passage, for something that qualifies what was just
 * said rather than continuing it.
 *
 * A recessed surface rather than a card: it sits inside a passage that already
 * has a rule down its left, so another bordered object there would be a box in
 * a box. Sinking it says "same passage, different register".
 */
export function Callout({
  variant = "panel",
  children,
}: {
  /** "bare" drops the surface and keeps only the spacing and the type. */
  variant?: "panel" | "bare";
  children: ReactNode;
}) {
  return (
    <div
      className={`font-body text-lg sm:text-xl text-ink-mid leading-[1.5] ${
        variant === "panel"
          ? "mt-[20px] bg-sunken rounded-panel px-[18px] py-[16px]"
          : "mt-[22px] mb-[22px]"
      }`}
    >
      {children}
    </div>
  );
}

/** Body copy, the page's default voice. */
export function Body({
  children,
  size = "base",
}: {
  children: ReactNode;
  size?: "base" | "lead";
}) {
  return (
    <p
      className={`font-body text-ink ${
        size === "lead"
          ? "text-xl sm:text-[22px] sm:leading-[1.5] leading-[1.55] text-pretty"
          : "text-lg leading-[1.65] text-pretty"
      }`}
    >
      {children}
    </p>
  );
}
