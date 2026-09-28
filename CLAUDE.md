# MAPLE conference committee pages

A React + TypeScript + Vite + Tailwind prototype of two things: a page for each
conference committee sitting in the Massachusetts legislature, and the bill page
those committees link out to.

A conference committee is where a bill goes when the House and Senate pass
different texts. Six members, three from each chamber, meet in private and
produce one text. These pages try to make that step legible: who is deciding,
what the two texts already agree on, what is still open, who has lobbied, and
what the public has said.

## Running it

- `npm install` once, then `npm run dev`.
- `/conferenceCommittees` lists the twelve committees.
- `/conferenceCommittees/phone-free-schools` is the most complete page, and the
  only one with a bundled bill text and real lobbying data.
- `/bills/h5630` is a bill page.

Before committing: `npx tsc --noEmit` and `npm run build` should both be clean.
The build's "chunk larger than 500 kB" note is expected and harmless.

## Where things are

- `app/src/app/App.tsx` is every route in the project, three of them.
- `app/src/app/components/conference-committee/` is the detail page. `index.tsx`
  is the page itself; `lobbying.tsx` is the disclosure table.
- `app/src/app/components/conference-committees/` is the index of all twelve.
- `app/src/app/components/bill-example/` is the bill page, plus `spine.tsx`,
  which holds the shared section and disclosure components both pages use.
- `app/src/app/components/ballot/` is a small library of generic pieces:
  cards, modals, pagination, filter chips.
- `app/src/app/data/` is the content. **Copy is data, not JSX**: to change what
  a page says, edit the data file rather than the component.
  - `conference-committees/committees.ts` is the substance of all twelve: what
    is settled, what is open, and each chamber's position on each question.
  - `conference-committees/lobbying.ts` is the disclosure register.
  - `conference-committees/testimony.ts` is placeholder public input.
  - `bill-lineage/` is the legislature's own record: members, seats, committees,
    bill texts, and the district maps.

## Conventions

- Tailwind with arbitrary values (`text-[14px]`, `px-[20px]`), and the design
  tokens in `app/src/styles/theme.css` rather than raw colours.
  `font-body` is Nunito, `font-display` is Lexend.
- Comments say **why**, not what. The code already says what it does.
- No em dashes anywhere, in code comments or in copy. A comma, a colon,
  parentheses or two sentences instead.
- Nothing in the data is invented. Every figure and position comes from the
  bill texts or the legislature's own record, and where something is unknown the
  page says so rather than guessing. If you cannot source it, leave it out.

## What is placeholder

- Public input. No submission in `testimony.ts` is real; the accounts and the
  words are filler standing in for a feed that does not exist yet.
- Lobbying, for eleven of the twelve. Only the phone-free schools conference has
  been transcribed. The empty state says so on the page.
