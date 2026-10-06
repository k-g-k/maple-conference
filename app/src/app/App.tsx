// Every page this prototype has, and the URL each one answers to.
//
// The conference index lists the twelve committees sitting now; the detail
// route is one page per committee, chosen by its slug; the bill route is a
// single bill's own page, which the committee pages link out to.
//
// The detail page has three addresses rather than one, because the review step
// between writing a submission and posting it is being compared in three
// containers and the trailing segment is which one you get. It is a segment
// rather than a query parameter so that the address reads as a choice of page,
// and it leaves `?view=` free to go on selecting the layout underneath it. A
// link is how the designer gets to each build, so the three are routes.
//
// A path we do not recognize goes to the index rather than to an error, since
// this is a prototype and a dead end is worse than a redirect. That is why the
// three styles are spelled out rather than matched as `:style`: an unknown
// trailing segment has to miss every route and fall through to the catch-all,
// which a parameter would have swallowed.

import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { ConferenceCommittees } from "./components/conference-committees";
import {
  ConferenceCommittee,
  ConferenceReview,
} from "./components/conference-committee";
import { DraftProvider } from "./components/conference-committee/draft";
import BillExample from "./components/bill-example";
import { FlagsProvider, BUILD, VISION } from "./flags";
import IconSample from "./components/icon-sample";

/**
 * A new page starts at the top of itself.
 *
 * The browser keeps the scroll position across a client-side navigation, which
 * is right when you come back to a page and wrong when you arrive at one: the
 * index is a long list, and pressing the twelfth row landed you two thousand
 * pixels down a committee page you had never seen.
 *
 * On the path only. The same page swapping its layout through `?view=` or
 * jumping to a section through a hash is still the page you are on, and those
 * must not throw the reader back to the top.
 */
function ToTop() {
  const { pathname } = useLocation();
  // The browser puts a reload back where the reader left off, which is right
  // for a page somebody is reading and wrong for one being worked on: every
  // refresh landed part way down the feed. Hash links still work, because the
  // browser honours those separately.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);
  useEffect(() => {
    if (window.location.hash.slice(1).includes("#")) return;
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Where "/" and anything unknown land.
 *
 * A committee rather than the index: this is a prototype and the page worth
 * seeing first is the one with the most on it, including the only bundled bill
 * text and the only real lobbying register. The index is one press away in the
 * list down the left.
 */
const HOME = "conferenceCommittees/phone-free-schools";

/**
 * Every page the prototype has, rendered under whichever prefix matched.
 *
 * `base` is "" for the build and "/playground" for the showcase. It exists for
 * the two redirects: a relative `Navigate` would resolve against whatever
 * route matched rather than against the mode, and an absolute one would throw
 * a reader in the playground back out to the build.
 */
function Prototype({ base }: { base: string }) {
  const home = `${base}/${HOME}`;
  return (
    <Routes>
      <Route index element={<Navigate to={home} replace />} />
      <Route path="conferenceCommittees" element={<ConferenceCommittees />} />
      {/* One route for all twelve. :slug is the committee, for example
              "phone-free-schools". This is also style one, and the plain
              address: the review replaces the composer in the flyout the
              composer already opens in. */}
      <Route
        path="conferenceCommittees/:slug"
        element={<ConferenceCommittee />}
      />
      {/* The co-sign experiment. The same committee page, with the one
              thing that is being built switched on, so the route everybody
              else is looking at stays as it was. Delete the route and the
              feature goes with it. */}
      <Route
        path="conferenceCommittees/:slug/cosign"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* A second copy of that route, so one reading can be worked on
              while the other stays beside it to compare against. */}
      <Route
        path="conferenceCommittees/:slug/cosign-2"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* The same again with the band at the foot of the card instead of
              over it, so the two placements can be compared. */}
      <Route
        path="conferenceCommittees/:slug/cosign-3"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* A fourth, started as a copy of the second. */}
      <Route
        path="conferenceCommittees/:slug/cosign-4"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* A fifth, started as a copy of the second. */}
      <Route
        path="conferenceCommittees/:slug/cosign-5"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* A sixth: the fifth with the section's title, the map and the
              filters drawn as one card. */}
      <Route
        path="conferenceCommittees/:slug/cosign-6"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* A seventh: the map in a column beside the list. */}
      <Route
        path="conferenceCommittees/:slug/cosign-7"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* An eighth, started as a copy of the fifth: a different flow to
              try without disturbing the reading it came from. */}
      <Route
        path="conferenceCommittees/:slug/cosign-8"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* A ninth: the eighth, landing on the reader's own section rather
              than the public one, so the two endings can be compared. */}
      <Route
        path="conferenceCommittees/:slug/cosign-9"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* A tenth: the ninth with the position bar off, its legend kept. */}
      <Route
        path="conferenceCommittees/:slug/cosign-10"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* The ninth, kept beside it under a name rather than a number: the
              same flow with the shape of the input over the list. */}
      <Route
        path="conferenceCommittees/:slug/cosign-viz"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* The second co-sign experiment: the same record shown as a quote
              rather than as a signature, so the two readings can be compared
              side by side. "repost" is a placeholder name. */}
      <Route
        path="conferenceCommittees/:slug/repost"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* The fourth: no words of your own. Your name against somebody
              else's letter, as agreement rather than as a filing. */}
      <Route
        path="conferenceCommittees/:slug/endorse"
        element={<ConferenceCommittee style="pane" />}
      />
      {/* Style two: the review over the page, with the form behind it. */}
      <Route
        path="conferenceCommittees/:slug/modal"
        element={<ConferenceCommittee style="modal" />}
      />
      {/* Style three, which is two routes: the committee, and the review
              the committee sends you to. */}
      <Route
        path="conferenceCommittees/:slug/page"
        element={<ConferenceCommittee style="page" />}
      />
      <Route
        path="conferenceCommittees/:slug/page/review"
        element={<ConferenceReview />}
      />
      <Route path="bills/:billId" element={<BillExample />} />
      {/* Scratch, for picking a mark. Delete with the component. */}
      <Route path="icons" element={<IconSample />} />
      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-ground">
      {/* Above the routes, so the submission being written is not something a
          route owns. Only the third style needs that: it navigates away from
          the committee page, which unmounts it and would take a draft held in
          it along. The other two read a provider they could do without, so
          that the three are compared on how they read rather than on which of
          them keeps your words. */}
      <DraftProvider>
        <ToTop />
        <Routes>
          {/* Everything, including the parts still being argued about. */}
          <Route
            path="playground/*"
            element={
              <FlagsProvider value={VISION}>
                <Prototype base="/playground" />
              </FlagsProvider>
            }
          />
          {/* The build, at the addresses it always had. Last, so the
              playground prefix gets first refusal on its own paths. */}
          <Route
            path="*"
            element={
              <FlagsProvider value={BUILD}>
                <Prototype base="" />
              </FlagsProvider>
            }
          />
        </Routes>
      </DraftProvider>
    </div>
  );
}
