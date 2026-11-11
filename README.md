# LM GRE App — expanded Verbal bank and four full GRE mocks

Upload the **contents of this folder** directly into the same GitHub Pages repository, replacing matching files. Keep `index.html` at the root. Under **Settings → Pages**, deploy from `main`, `/ (root)`.

**Password: `lm`**. This is a basic local access gate, not data encryption.

## What's new
- 367 original Verbal practice items: 173 one-blank Text Completion, 8 multi-blank Text Completion, 118 Sentence Equivalence, 40 standard Reading Comprehension, 10 reading select-all, 10 passage-sentence selection, and 8 optional Sentence Correction.
- All four practice mocks now draw their Verbal sections from the Verbal question bank, **not** vocabulary-definition questions. Each mock has 12 questions in Verbal 1 and 15 in Verbal 2 (27 distinct questions per mock). Sections include text completion, sentence equivalence, and reading comprehension variants.
- Full mock clocks: 30-minute essay, 18-minute Verbal 1, 21-minute Quant 1, 23-minute Verbal 2, 26-minute Quant 2. Exam answers are hidden until completion; result review is optional.
- Verbal lab keeps independent difficulty filtering (four user-defined tiers), stopwatch and timed practice, two-minute sprints, and explanatory answer review.

## Important limits
- These are **original unofficial practice items**, not ETS material. Many of the new questions use deliberately varied context templates around a fixed set of distinct scenarios; they are not 367 individually researched ETS-equivalent questions. Multi-blank and long-passage coverage still needs expanding to faithfully reproduce a real GRE Verbal test.
- Verbal format distribution is a practice mix, not ETS adaptive section construction. Section-level adaptivity is not simulated.
- Existing Quant mock bank may reuse questions between tests. Analytical Writing is ungraded and all exam results are raw accuracy, not GRE scaled scores.
- Sentence Correction is bonus grammar practice, not an official GRE General Test item type.
- Cached files may require closing and reopening the PWA after GitHub deployment. Locally saved progress remains browser-specific; export a backup before clearing browser data.

## Quant format update
Quant practice and four full exams now use the four ETS response styles: four-choice Quantitative Comparison (A/B/C/D), five-choice select-one multiple choice, select-one-or-more multiple choice, and numerical entry. Mock sections use 4/5/2/1 and 5/6/2/2 counts (12/15). Additional comparison and select-all problems were added. Original Quant questions with nonnumeric answers remain typed-response drills; original selected numeric questions were converted to five-option questions, which does not itself guarantee ETS-calibrated difficulty. In contrast with ETS, some questions remain unworked and Data Interpretation passage sets remain limited.

## Quant syllabus depth patch — October 25, 2026
Expanded five priority gaps: coordinate geometry, triangles/circles/polygons, data interpretation, descriptive statistics, and normal distributions. Added 19 focused chapters and 76 separately written questions (four per chapter: Easy / Medium / Hard / Extreme) with dedicated worked explanations. Existing 372 Quant questions remain, bringing the bank to 448 across 74 chapters. New questions are available in Quant Lab and the mixed Quant pools for all four full-length mocks. This is an incremental syllabus expansion, not a guarantee that the entire GRE Math syllabus or bank is complete. Graph interpretation items currently present values in question text rather than rendered interactive graphs; real graphic-based data sets still need further work.

## October 25 — 20 questions per new chapter & linked-source Data Interpretation
- The 19 previously added syllabus chapters now have **20 questions each** (5 Easy, 5 Medium, 5 Hard, 5 Extreme). The full Quant bank is **752 questions across 74 chapters**.
- The five new Data Interpretation chapters now have 80 chart/table-backed questions, grouped into 20 four-question sets that share an underlying source dataset. Sources include a data table, horizontal bar chart, pie chart, scatterplot, and coordinated table plus chart.
- Quant Lab and the four full mocks show the relevant source visuals. Per-question explanations, answer tracking, and selectable immediate answer feedback remain enabled.
- The 304 added questions were generated from 4 topic-specific templates per chapter with varied numbers; this gives more practice but does not equal 304 wholly different conceptual problems or ETS-calibrated Extreme difficulty. Some existing 85 legacy numerical-entry questions still have no worked solutions.
- This update doesn't claim official ETS licensing or scaled scoring.


Mobile update: tap **More** at the bottom of the phone screen to open Verbal Lab, D Trap, four Full GRE Tests, Word Vault, Progress, and Settings. Existing locally saved progress keys are unchanged.

## NEW — APK source companion (November 11, 2026)

The dedicated **APK · English + Math** module is accessible from the desktop sidebar and the **More** menu on mobile. Its question bank is extracted from the user-provided Manhattan Prep GRE Android APK (2016 build). It does **not** install or emulate Android software; it recreates the accessible question/card practice in a PWA.

- 1,623 question/card records reproduced from the APK's local SQLite database, along with their answer selections and source explanations where supplied.
- **English: 958 items**, including 398 in Verbal Reasoning (Sentence Equivalence, Text Completions, Reading Comprehension, Logic-Based Reading Comprehension); 500 in the Essential GRE Words section; and 60 in the Verbal Quizzes difficulty sets.
- **Math: 665 items**, including 605 in Quantitative Reasoning's original hierarchy (Algebra, Number Properties, Statistics, Data Interpretation, Advanced Quant, Word Problems and Geometry, with specific subchapters) and 60 Quant Quizzes.
- 198 bundled images from the APK archive, MathML mathematical notation, original answer options, numeric and fractional entry, select-all, blank completion, passage content and explanations where available.
- Session lengths of 10/20/50/all, stopwatch or optional 2/10/20-minute timer, optional immediate answer feedback, answer review, separate locally saved scores and question timing. Main app export/import and erase functions now also cover this module.

**Important limitations:** This is a source-derived *study module*, not a byte-for-byte conversion of the Android user interface, cloud services, user accounts, adaptive logic, or original app animations. Three source image references were not bundled with the APK; these may require an external connection, and their availability is not guaranteed. Some source vocabulary cards have no written explanation in the APK database. The APK is from 2016, so its exam guidance may not reflect the present-day GRE format. The APK module remains separate from existing official-format practice mocks. Neither the APK-origin material nor this PWA is endorsed by the original publisher. Do not assume redistribution rights from possession of an APK.

### Required GitHub update

Upload the entire ZIP contents to the existing repository root, **not the ZIP file itself**. Replace `index.html`, `app.js`, `sw.js`, and `README.md`. Add `apk-bank.js`, `apk-module.js`, and the **entire** `apk-media/` folder. All other existing app files are included and can be kept. Update all modified files in the same deployment to avoid missing scripts. PWA updates can require closing and reopening the installed app.

## Audit repair — November 11, 2026
- Fixed 500 Essential GRE Words source entries to display as revealable flashcards with “I knew it” / “Study again” ratings instead of a one-choice fake multiple-choice quiz.
- Recovered shared passages for Verbal Quiz reading sets (Easy, Medium, Hard).
- End-session answer review now includes only questions actually answered, not skipped questions that were never attempted.
- Incremented offline cache version for update.
- This patch passed source checks; full browser navigation was blocked by execution policy, so live interactive testing remains unverified.
