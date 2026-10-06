# What nine agents found, and what the page still gets wrong

October 6, 2026. Ten agents read both bill texts for nine committees in full and
checked the committee entries against them. Each finding below is a claim the
page currently makes that the bills contradict, with the section to grep.

Verify before acting. These are agent reports, not verified data. Where a
finding has been checked against the text in this repo it says so.

---

## Not yet written up. Seven committees.

### energy-affordability  (S.3166 / H.5175)
- **Subtitle, `claim`, and an open item all say the local supplier opt-out is
  Senate-only. Both bills have it**, as the same new chapter 40 section 72,
  near-verbatim. Senate s39, House s14. Real differences are small: the Senate
  exempts ch.164 ss.135-137, the House only s137, and the Senate adds a 120-day
  DPU notice.
- "Supplier compliance payments, not established as a distinct Senate
  provision" is wrong. Both act on alternative compliance payments, in opposite
  directions: the House returns at least 70 percent to ratepayers as bill
  credits (s8, new ch.25A s11F-1/4); the Senate makes them the backstop for the
  EV Adoption Incentive Trust Fund (s34). Same pot, opposite destinations.

### data-privacy  (S.2619 / H.5479)
- **Settled item "Both treat minors' data as sensitive" is false.** The Senate's
  sensitive category covers a **child**, defined by COPPA as under 13 (S s1).
  The House covers a **minor**, under 18 (H s1). Massachusetts 13-to-17 year
  olds are protected in one bill and not the other.
- Settled item listing "a list of third parties who got your data" as identical
  is wrong: Senate covers parties data was **transferred** to (S s4(a)(ii));
  House covers parties it was **sold** to, excludes natural persons, and lets
  the controller withhold trade secrets on its own judgment (H s4(a)(2)).
- "No discrimination by data" is only half right. Senate bars collecting,
  processing **or transferring** and names ethnicity and gender expression on
  top of ch.151B. House bars only what "**unlawfully** discriminates," drops
  transfers, omits those two grounds.
- The entry's effective-date note is stale: January 1, 2027 is under three
  months out, not four.
- 16 differing numbers or dates counted. The `claim` of "about a dozen" is
  conservative and safe.

### workplace-violence  (S.3184 / H.4767)
- **Settled item "No employer retaliation for reporting, identical protection in
  both bills" is wrong.** Senate protects notice to "the employee's health care
  employer **or** the department" (S s1, s250(g)). House protects notice to "the
  department" only (H s1, s250(g)). Telling your manager is protected in one
  bill and not the other.
- Subtitle's "They part on one thing" is wrong. They part on at least twelve.
- Settled paid-leave item silently adopts the House's narrower list. The Senate
  covers "an acute mental health or behavioral health need directly related to
  such injury" and a harassment prevention order; the House covers neither.
- "Employers report every incident" overstates it. Both texts say incidents
  "**reported to** the health care employer."
- Enforcement is tagged `calibrate` and should be `tool`: AG-only equitable
  relief against a four-way district court complaint plus a facility closure
  power is two instruments, not two settings.
- Missing entirely: the Senate's pretrial diversion amendment (S s8), the
  Senate's proportionality mandate on DPH regulations (S s1, s250(i)), and the
  divergent definitions of a protected employee.
- FLAG: the House definition of "Employee" reads as scrambled in our extracted
  text, with a clause dangling mid-sentence. If real it narrows who is covered,
  possibly excluding security, housekeeping and food service. Needs the PDF.

### ballot-question-finance  (S.2916 / H.5558)
- **Settled item "Effective on signature... S.2916 carries an emergency preamble
  the House left intact" is wrong.** Both bills delay their operative sections
  30 days (S s12, H s17). The words "emergency" and "preamble" appear in
  neither text.
- Subtitle's "The disclosure rules are word-for-word the same in both bills" is
  too strong. The reporting machinery is identical; the chambers differ on who
  the rules define, how far the first report reaches, and what rides alongside.
- Missing, and the largest gap: **the Senate never defines the committees it
  regulates.** It uses "statewide ballot question committee" four times with no
  definition anywhere (S s7, s8, s9, s11). The House defines both terms and
  reaches constitutional amendments (H s3).
- FLAG: S s12 delays "sections 1 to 105" in a 12-section bill. Drafting error
  or an artifact of our stored text; unresolved.

### primary-care  (S.3141 / H.5630)
- **The "Deductibles" open card is not supported by S.3141.** The words
  deductible, copayment and coinsurance appear **zero times** in the Senate
  bill. Nearest provision is a delegation (S s5, s3B(b)(1)(x)). The House has a
  parallel non-commitment (H s10, s10A(e)(v)). Neither bill lowers what a
  patient pays. Belongs in absences, not open.
- The "Health center payment floor" card is **settled, not open.** Both write
  the same MassHealth prospective-payment floor into seven places each with
  identical federal citations.
- "Who carries the target" is a scope difference, not only enforcement. The
  Senate sets a target for each individual health care entity (S s1, s3, s8);
  the House sets only a statewide one (H s6). This is the load-bearing
  disagreement and deserves its own card.
- "The House adopted this from the Senate" has no textual support.
- Measurable: the Senate climbs 9 to 15 percent in 2 years (CY2028-2030); the
  House takes 6 (CY2030-2036), starting 2 years after the Senate finishes.
- The House bill carries eleven sections at the end on child sexual abuse
  claims, plus pharmacy benefit managers, drug rebate pass-through, pharmacy
  deserts, vaccine purchasing, biomarker testing and hospital capital finance.
  None of it is primary care and none is on the page.

### mass-ready  (S.3064 / H.5518)
- Senate bonds total $3,945,605,000; House $3,078,457,500.
- **FLAG: House line items in sections 2 to 2D total $2,965,051,223 against a
  $2,543,457,500 authorization, over by $421,593,723.** The Senate reconciles
  exactly. Quote the bond authorization, not the sum of line items, and do not
  assert the two agree. Same class of problem as the BRIGHT Act, opposite sign.
- 18 of 36 line items identical, worth $848,770,000.
- 187 "not less than $" earmark directives in the Senate, 358 in the House.

### public-records  (S.3244 / H.5469)  — mostly written, one item left
- The settled item about the Legislature leaving the public records law says
  what arrives and never says what goes away. Both bills switch off ch.66 for
  the General Court, which removes: the s10A civil action, the presumption of
  attorney's fees, and $1,000-$5,000 punitive damages for bad faith.
  VERIFIED in both texts in this repo.

---

## Already written up, for the record

- **pets-act**: "rabbits" was fabricated. Zero occurrences in either bill; the
  Senate ban is "a dog or cat." Three settled items were Senate-only. One card
  had the Senate as silent on cruelty when it has three provisions. VERIFIED
  and fixed.
- **bright-act**: "they agree on the mechanism" was wrong. Senate creates a new
  fund with a trust; House pledges the existing fund and caps debt service.
  "29 campuses" and "Fair Share" appear in neither bill. House bond section is
  $370,450,000 short of its own schedule because earmarks were added on the
  floor and the bond section was never conformed. VERIFIED and fixed.
- **teacher-benefits**: the House bill's sections 1-3 are a separate subject
  (teachers moving to DESE) that was not on the page at all. S.3109 is the
  Senate's replacement text for H.4361, so what the Senate left out it left out
  deliberately. VERIFIED and fixed.

---

## Still open, smaller

- The feedback link in index.tsx points at `#feedback` and goes nowhere.
- Nine of the twelve `GIST` sentences were written from agent reports rather
  than from the bills. phone-free-schools was corrected by hand; the rest
  likely share its flaw of naming the shared provision and ignoring what one
  chamber added.
- Four topic tags in COMMITTEE_TOPICS were coined, not drawn from MAPLE's
  vocabulary: "Juvenile crime and gang violence", "Labor-management relations",
  "Income tax credits", "Transportation safety". The chip row is off.
- The BRIGHT Act conference is the only one of twelve with no noticed meeting.
  Comerford sits on it. The source window was May 1 to December 1, 2026 and the
  conference was appointed in April, so a meeting could fall outside it.
  Unchecked against the General Court's hearings API.
- economic-development is `textRead: false` and accurately so: section headings
  were read in full, bodies only where they looked substantive.
