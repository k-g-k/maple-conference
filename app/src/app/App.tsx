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
const HOME = "/conferenceCommittees/phone-free-schools";

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
          <Route index element={<Navigate to={HOME} replace />} />
          <Route
            path="conferenceCommittees"
            element={<ConferenceCommittees />}
          />
          {/* One route for all twelve. :slug is the committee, for example
              "phone-free-schools". This is also style one, and the plain
              address: the review replaces the composer in the flyout the
              composer already opens in. */}
          <Route
            path="conferenceCommittees/:slug"
            element={<ConferenceCommittee />}
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
          <Route path="*" element={<Navigate to={HOME} replace />} />
        </Routes>
      </DraftProvider>
    </div>
  );
}
