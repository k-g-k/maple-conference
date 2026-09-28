# MAPLE conference committee pages

A prototype of one page per Massachusetts conference committee, plus the bill
page they link to.

```
npm install
npm run dev
```

Then open `/conferenceCommittees`.

Deployed as a static site: `npm run build` writes to `dist/`, and `vercel.json`
sends every path to `index.html` so deep links work.

See `CLAUDE.md` for what lives where.
