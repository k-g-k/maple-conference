// A jump list for the bills we are working on, grouped by conference committee.
//
// Development furniture, not part of the page. The grouping is only how the
// list is organised: the pages themselves know nothing about conference
// committees. Pairing House with Senate is what makes the list quick to move
// around in, since the two halves of one committee are what you want to compare.
//
// Pinned bottom-left so it never lands on the rail, and remembered open or
// closed between reloads the way the Dev Nav is.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ACTIVE, BILL_TITLES } from "../../data/conference-committees";

const KEY = "maple:bill-picker";

export function BillPicker() {
  const { billId } = useParams();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(localStorage.getItem(KEY) === "1");
  }, []);
  const toggle = () => {
    setOpen((o) => {
      localStorage.setItem(KEY, o ? "0" : "1");
      return !o;
    });
  };

  const slug = (n: string) => n.replace(".", "").toLowerCase();

  return (
    <div className="hidden lg:block fixed left-0 bottom-0 z-[70] font-body">
      {open && (
        <div className="w-[300px] max-h-[70vh] overflow-y-auto bg-inverse text-ink-inverse rounded-tr-panel shadow-panel">
          <div className="sticky top-0 bg-inverse px-[14px] pt-[14px] pb-[8px]">
            <p className="font-semibold text-2xs uppercase tracking-[0.08em] text-ink-inverse/55">
              Bills in conference
            </p>
            <p className="text-xs text-ink-inverse/45 mt-[2px]">
              {ACTIVE.length} committees · {ACTIVE.length * 2} bills
            </p>
          </div>
          <ul className="px-[14px] pb-[14px] flex flex-col gap-[14px]">
            {ACTIVE.map((c) => (
              <li key={c.id}>
                <p className="text-xs text-ink-inverse/55 leading-[1.4] mb-[5px]">
                  {c.name}
                </p>
                {/* House and Senate on one row, because the pair is the unit.
                    Reading one without the other tells you nothing about what
                    the committee is actually deciding. */}
                <div className="grid grid-cols-2 gap-[6px]">
                  {[c.house, c.senate].map((n) => {
                    const here = slug(n) === billId;
                    return (
                      <Link
                        key={n}
                        to={`/bills/${slug(n)}`}
                        title={BILL_TITLES[n]}
                        className={`block rounded-control px-[8px] py-[5px] text-xs font-semibold transition-colors ${
                          here
                            ? "bg-ink-inverse text-inverse"
                            : "bg-ink-inverse/10 text-ink-inverse/85 hover:bg-ink-inverse/20"
                        }`}
                      >
                        {n}
                      </Link>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={toggle}
        aria-expanded={open}
        className="block w-full bg-inverse text-ink-inverse font-semibold text-2xs uppercase tracking-[0.1em] px-[14px] py-[8px] rounded-tr-control cursor-pointer"
      >
        {open ? "Close" : "Bills"}
      </button>
    </div>
  );
}
