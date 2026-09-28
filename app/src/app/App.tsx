// Every page this prototype has, and the URL each one answers to.
//
// Three routes and nothing else. The conference index lists the twelve
// committees sitting now; the detail route is one page per committee, chosen
// by its slug; the bill route is a single bill's own page, which the committee
// pages link out to.
//
// A path we do not recognise goes to the index rather than to an error, since
// this is a prototype and a dead end is worse than a redirect.

import { Navigate, Route, Routes } from "react-router-dom";

import { ConferenceCommittees } from "./components/conference-committees";
import { ConferenceCommittee } from "./components/conference-committee";
import BillExample from "./components/bill-example";

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
      <Routes>
        <Route index element={<Navigate to={HOME} replace />} />
        <Route path="conferenceCommittees" element={<ConferenceCommittees />} />
        {/* One route for all twelve. :slug is the committee, for example
            "phone-free-schools". */}
        <Route
          path="conferenceCommittees/:slug"
          element={<ConferenceCommittee />}
        />
        <Route path="bills/:billId" element={<BillExample />} />
        <Route path="*" element={<Navigate to={HOME} replace />} />
      </Routes>
    </div>
  );
}
