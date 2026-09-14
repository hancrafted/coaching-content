# Epic: Build the "Maintain markdown for AI knowledge bases" deck

**Status:** ready-for-agent
**Target:** `maintain-markdown-for-ai-knowledge-bases/` (new, does not yet exist)

## Problem Statement

Han is presenting at a company AI all-hands: 100–200 people, roughly 50/50 technical, majority AI-junior, delivered **remotely over screen share**. Budget is 20 minutes target / 25 hard cap, split ~15–18 minutes of narration and 4–5 minutes of live demo. There is currently no deck for this talk.

The argument is the **effort split**: what a machine can check, what AI can help with, and what only a human can check. AI collapsed the cost of _writing_ documentation and raised the cost of _verifying_ it, and the verification half is nobody else's job. `markdown-harness` appears as a credibility exhibit, not as an ask — adoption is driven later through the senior project group.

A previous deck on this subject existed and has been deleted. It is **not a reference** and must not be resurrected from git history. The only architectural reference is the sibling deck `ai-token-economy-101/`.

The deck also has a second life: it is shared as a link after the talk, and viewers read it on their own screens without narration.

## Solution

Build a new nine-section scrolling tower page at `maintain-markdown-for-ai-knowledge-bases/`, titled **"Maintain markdown for AI knowledge bases"**, architecturally modelled on `ai-token-economy-101/`: a single `IntersectionObserver` driving beat reveal and activation, `data-beat="SN.M"` ids on full-height `.beat` sections, a TOC rail and mobile drawer built from a section model, a progress bar, arrow-key beat stepping, hash deep-linking, and a theme picker with a pre-paint FOUC guard.

The deck delivers eleven beats across nine sections, four hand-authored SVG visualisations, one continuous frontmatter artefact carrying sections 5 → 6 → 7, a presenter-controls surface (presentation mode plus speaker notes), and a mock terminal that acts as the rescue path if the live demo fails.

## User Stories

1. As a presenter, I want the deck to open on a hero that states the thesis in one subtitle, so that the room knows the argument before I say a word.
2. As a presenter, I want my name present but small on the hero, so that attribution is clear without competing with the thesis.
3. As an AI-junior audience member, I want a plain explanation of what a markdown file actually is, so that nothing later in the talk depends on knowledge I don't have.
4. As an audience member, I want to see the three things markdown files are used for — context, knowledge, instruction — so that I understand the breadth before we narrow to one problem.
5. As an audience member, I want to see a frontmatter block appear early without explanation, so that when it is explained later I recognise it rather than meeting it cold.
6. As an audience member, I want to see creation effort and verification effort drawn as two curves over time, so that I understand the crossover as a shape rather than as a claim.
7. As an audience member, I want the point where the document reaches production marked as day zero, so that the curves are anchored to something I recognise from my own work.
8. As an audience member, I want the crossover point explicitly labelled "where the work moved", so that the single most important idea in the talk has a fixed visual anchor.
9. As a presenter, I want the curves to draw in on beat activation with the crossover label arriving last, so that the reveal follows the sentence I am speaking.
10. As an audience member, I want a Venn showing what a machine can check, what AI can help with, and what only a human can check, so that I can see the effort split at a glance.
11. As an audience member, I want the human region drawn visibly largest, so that the relative weight is communicated by the geometry and not only by the narration.
12. As an audience member, I want the AI region labelled with a question mark, so that its ambiguity reads as deliberate rather than as an omission.
13. As an audience member, I want each Venn region to carry three short phrases and no icons, so that I read the content rather than decode symbols.
14. As an audience member, I want to see one real frontmatter block assessed three times — by a machine, by an AI, by a human — so that I understand the three kinds of checking against a single concrete artefact.
15. As an audience member, I want the machine pass to resolve cleanly, so that I see what mechanical checking is genuinely good at.
16. As an audience member, I want the AI pass to return an answer that itself needs checking, so that I understand AI as an accelerator rather than a resolution.
17. As an audience member, I want the human pass to stay visibly unresolved on screen, so that the open question is the last thing I see before the talk moves on.
18. As an audience member, I want the same frontmatter block to grow across sections rather than be replaced, so that the continuity is legible instead of looking like three similar screenshots.
19. As an audience member, I want each field in the full frontmatter block annotated with _who supplies it_, so that I understand the division of labour without a schema lecture.
20. As an audience member, I want to see a machine-signed field and a human-signed field sitting adjacent with identical structure, so that the difference between them is obvious without explanation.
21. As a curious viewer, I want a link to the OKF specification, so that I can go deeper without the talk having to.
22. As an audience member, I want one sentence on screen before the demo stating that the signal is in the file but the instruction has to come from the operator, so that I know what the demo is about to prove.
23. As an audience member, I want to see the operator's actual configured sentence alongside that claim, so that "the operator writes this, not the vendor" is self-evident rather than asserted.
24. As a presenter, I want a static A/B terminal on the deck that I normally scroll past, so that if the live demo fails in front of 200 people I still land the most important moment of the talk.
25. As a presenter, I want the closing section to bring back the Venn with the human region highlighted and the others dimmed, so that the talk ends on the same image it argued from, with nothing new to read.
26. As a presenter, I want to drive the whole deck with arrow keys, so that I never have to aim a scroll wheel while talking.
27. As a presenter, I want a presentation mode that hides the TOC, theme picker and nav chrome, so that the screen-shared frame is content rather than furniture.
28. As a presenter, I want per-section speaker notes I can toggle on, defaulting off, so that the link I share afterwards carries my argument and not just nine diagrams.
29. As a presenter, I want presentation mode and notes visibility to persist across reloads, so that a refresh mid-talk doesn't reset my setup.
30. As a remote viewer, I want ordinary free scrolling when I read the shared link later, so that the page behaves like a page rather than fighting me.
31. As a viewer, I want to jump to any section from a table of contents, so that I can navigate the shared link without scrolling through everything.
32. As a viewer, I want to share a link to a specific section, so that I can point a colleague at one idea.
33. As any viewer, I want the deck to render correctly in every theme I pick, so that theming is a real feature rather than a claim.
34. As a returning viewer, I want my theme choice remembered across both decks in this repo, so that I set it once.
35. As a viewer with reduced-motion preferences, I want every animation disabled and every section fully legible without motion, so that the deck is usable rather than merely accessible-looking.
36. As a maintainer, I want the deck to use daisyUI semantic tokens exclusively, so that it survives theme changes without a visual audit.
37. As a maintainer, I want the page to pass the repo's archgate ADR checks, so that the new deck doesn't regress the design system.
38. As a visitor to the repo's landing page, I want a working link to this deck, so that I can find it — the root page currently links to a folder that no longer exists.
39. As a contributor, I want the repo's documented commit-scope list and directory map to name this deck, so that the conventions match reality.

## Implementation Decisions

### Structure

- Nine sections, eleven beats. One section equals one beat, with sub-steps as in-place animation fired on beat activation — **except section 5**, which is three beats (machine pass, AI pass, human pass) because its rhetorical structure is three separate arrivals ending on one that deliberately does not resolve.
- Beat ids follow the `data-beat="SN.M"` / `id="sN-M"` convention used by the sibling deck. Numbering starts clean at `S1.1`.
- Section content:
  1. **Hero** — title _Maintain markdown for AI knowledge bases_, subtitle carrying the thesis (the work moved from writing to verifying), presenter name small.
  2. **What a markdown file is** — hub and spoke. One markdown file at centre with a small frontmatter block at its top, deliberately planted and unexplained. Three spokes: Context (AGENTS.md, CLAUDE.md), Knowledge (wiki, LLM-wiki), Instruction (skills, prompts, commands). Narration establishes that it is a text file with nothing mechanical underneath, and that what matters is how and when it is consumed.
  3. **Why this was always hard** — two diverging curves. X axis is time with **day zero** marked where the doc reaches production; Y axis is effort. Creation effort collapses after AI; verification effort climbs with volume. The crossover is marked and labelled **"where the work moved."**
  4. **Where the effort goes** — three-region Venn, human region visibly largest. Three short phrases per region, no icons. Machine: reference resolves, file exists, template structure holds. Human: is it still true, is it stale, does the reference point at the _right_ content. AI: a question mark **as the label**, with fact-check / hard numbers / still needs checking beneath it.
  5. **Worked example, three passes** — one frontmatter block, three passes stacked vertically over it. Machine pass resolves cleanly. AI pass returns an amber result whose answer itself needs checking. Human pass **stays open and unresolved on screen**, and is the last beat before the section ends.
  6. **OKF** — the same block, now grown to the full field set, with short annotations indented to the right stating _who supplies each field_, not what it is. One slide, no deep dive, with a link to the public specification.
  7. **markdown-harness** — headline: _the signal is in the file; the instruction has to come from you._ Beneath it, the literal operator-configured sentence as the concrete instance.
  8. **Live demo** — presenter switches away from the deck. The beat itself carries the static A/B rescue terminal.
  9. **Close** — section 4's Venn returns with the human region highlighted and the machine and AI regions dimmed. Nothing new on screen.

### Colour language

- `primary` = **human**. `neutral` / `base-content` = **machine**, deliberately desaturated because mechanical checking is the settled, boring part of the argument. `accent` = **AI**.
- `secondary` is **not** used for any of the three actors. ADR FE-001 records that `secondary` renders at markedly lower chroma than the other semantic hues in this project's default theme (~0.046 vs ~0.12–0.20), so it reads near-gray — unacceptable for the region the talk argues is most important.
- The Venn's AI overlap is produced by `mix-blend-mode` between the two parent regions rather than painted as a flat third fill, so the ambiguity emerges from the geometry. Both parents are semantic tokens, so the blend stays theme-aware. **Fallback if the dark-theme result muddies:** render the overlap unfilled, as a hatched or dashed region. The `?` label itself uses `accent`.
- The colour language is established in section 4 and reused everywhere.

### Continuity

- **One** frontmatter block component, authored once with the complete field set, carries sections 5 → 6 → 7. Fields are revealed and dimmed per section rather than three separate blocks being authored. Section 5 shows only a `sources` entry and `stale_after`; section 6 reveals the full set; section 7 shows the configured sentence against it.
- Section 6's annotations are driven by a field-highlight interaction: each field is a targetable element, and its annotation activates with it.
- The block uses **real OKF v0.2 field names and shapes**, unexplained at first appearance. `sources` is a list of mappings with a required `resource` plus optional `id`/`title`. `stale_after` is an ISO 8601 datetime with explicit UTC offset. `verified` is `{ by, at }` with an actor string using the `human:` prefix convention. **`generated: { by: <model>, at: ... }` is included** — it is the machine-supplied twin of the human-signed `verified`, identical in shape, adjacent in the block, and it does the section-6 annotation work on its own.
- The frontmatter block is a **display element, not a code sample** — no syntax-highlighter defaults, no code-sized mono type.
- The Venn bookends sections 4 and 9 — the same component, re-rendered with different emphasis, not a second drawing.

### Hero image

- The hero background is a **slot the presenter fills**. The implementing agent must **not** select, generate, or borrow an image — including from the sibling deck's assets.
- Until an image is supplied, the hero renders a backdrop built from semantic tokens (gradient or texture), so an unfilled slot never reads as broken. The spec-implementing work documents the expected asset path and aspect ratio.
- Per ADR FE-001's stacking-context rule, any section hosting a negative-z-index decorative background must carry an explicit `z-0` on the section itself. This is the section where that bug appears.

### Presenter controls

- **Presentation mode**, toggled by keyboard `p`, hides TOC rail, theme picker and nav chrome while keeping the progress bar. Persisted to `localStorage`.
- **Speaker notes**, per section, toggled and **off by default**. Persisted alongside presentation mode as one presenter-controls surface. Notes carry the spoken-only material — notably the accelerator-not-solution argument in section 4 and the freelancer-with-amnesia callback, neither of which has a slide.
- Navigation is **arrow-key beat stepping only**, matching the sibling deck. **No CSS scroll-snap** is used anywhere. Free scrolling is preserved for the shared-link reader.

### Visuals and motion

- All diagrams are **hand-authored inline SVG** with `stroke="currentColor"` / `fill="currentColor"` plus semantic `text-*` utilities. No chart library, no icon library, no new dependency.
- Curves are drawn by animating `path.style.strokeDasharray` / `strokeDashoffset` from JavaScript on beat activation — the pattern ADR FE-001 documents explicitly. The crossover label animates in last.
- The Venn is three `<circle>` elements with the blend-mode overlap described above.
- Per ADR FE-001: no inline `style="..."` in HTML source and no `<style>` blocks in HTML. Runtime-animated dimensions are set via `element.style` from JS with targets stored in `data-*` attributes. Complex keyframes live in a page-scoped `animation.css`, using `currentColor` and `color-mix(in oklab, currentColor <pct>, transparent)` rather than `rgba()` or hex, so they re-skin across themes. Decorative overlays carry `aria-hidden="true"` and all motion is disabled under `prefers-reduced-motion: reduce`.

### Demo rescue path

- Section 8 carries a mock terminal presenting the two A/B legs: the same file and the same question, answered once without the hook and once with. Styled to match the sibling deck's terminal treatment.
- It is normally scrolled past during the live run. It exists so that a failed live demo does not cost the talk its load-bearing moment.

### Theming

- `src/style.css` keeps its existing daisyUI configuration with all themes enabled, shared with the sibling deck and **not modified** for this page.
- The deck's theme picker exposes a **curated shortlist** as the verified set; remaining themes stay reachable but explicitly unverified. Verification covers at least one light and one dark theme, per ADR FE-001's requirement for semantic-coloured decorative layers.
- The deck reads and writes the **same theme storage key as the sibling deck**, so a theme choice carries across both.

### Repo integration

- The root landing page's link to this deck currently points at the deleted folder and is broken. It must be repointed and its label updated to the new title.
- The repo's `AGENTS.md` directory table still names the deleted folder; its row is replaced with the new one.
- The documented commit-scope list in the governance rules still names the deleted folder. Its entry is replaced, and `docs` is added, since specs now live there. **No code change is required** — the commit-hook validator derives scope generically from the top-level directory name, so the new folder already maps to a valid scope.

## Testing Decisions

There is **one seam, and it is the built page.** This is a static presentation deck: no modules with contracts, no functions worth isolating, nothing meaningfully unit-testable. Introducing a test harness for nine SVG diagrams would be ceremony rather than coverage, and neither existing deck has one. A good check here asserts externally observable behaviour of the built page — that a beat reveals on activation, that a theme renders legibly — never that a particular class name was toggled.

Verification therefore rests on the seams that already exist in this repo:

- **archgate ADR rules** are the primary automated gate: `no-raw-inline-styles`, `no-style-tags-in-html`, `tailwind-and-daisyui-imported`. These must pass. Prior art: the sibling deck was built against exactly these rules.
- **The Vite multi-page build** must succeed and emit the page at its new path. The build discovers pages by walking the repo for `index.html` files, so a structurally broken page fails the build and a correctly placed one is registered automatically.
- **eslint and prettier**, enforced by the existing husky pre-commit hook.
- **The commit-message validator** must accept commits scoped to the new folder.
- **Manual visual verification, promoted to acceptance criteria** — this is a presentation, and its failure modes are visual:
  - Every beat renders legibly in the curated theme set, covering at least one light and one dark theme.
  - The Venn's blend-mode overlap is distinguishable in both light and dark themes. If it muddies in dark, the hatched fallback is applied and re-verified.
  - The full frontmatter block in section 6 is legible at typical screen-share scale — the densest content in the deck and the most likely thing to fail.
  - With `prefers-reduced-motion: reduce`, every section is complete and legible with no motion, and no content is reachable only via animation.
  - Arrow-key stepping traverses exactly the eleven beats in order.
  - Presentation mode and notes state survive a reload; hash deep-links resolve to the right beat.
  - The root landing page's link reaches the deck.
- **Timing rehearsal is a real acceptance criterion, not a nicety.** The premise that 15–18 minutes of narration fits across nine sections at this density is untested. Section 2 is the designated first candidate for compression if the rehearsal overruns; section 6 is the candidate for splitting if it runs long on its own.

## Out of Scope

- **The two demo repositories.** The live demo requires two local repositories — one with the `markdown-harness` Claude Code hook wired and one without — pre-opened in two terminals so the A/B switch is a window change rather than a config edit. Both run on the presenter's local machine. This is a **blocking prerequisite** for the talk, tracked separately, not built by this spec.
- **The demo repo's discovery path.** The demo question must be askable from the repository root in a Claude Code session _without pasting a file path_, which requires a root `index.md` or an `AGENTS.md` pointer directing the agent to the file. Prerequisite, not in scope here.
- **The demo content file.** The demo needs one authored file resembling the audience's own wiki — an onboarding page, deploy runbook, or deprecation notice — with a passed `stale_after` and no freshness language anywhere in its prose. Prerequisite, not in scope here.
- **`markdown-harness` itself**, its CLI, its hook script, and its skill. None are modified by this work and none live in this repository.
- **The OKF specification.** Referenced and linked; not authored, vendored, or modified here.
- **The shared daisyUI theme configuration.** Deliberately untouched.
- **The `ai-token-economy-101` deck.** The architectural reference; not modified.
- **The deleted predecessor deck.** Not a reference, not to be restored from git history, and none of its content — including its retired failure-modes comparison and amnesiac-freelancer section — is carried forward.

## Further Notes

- **The talk is delivered remotely over screen share**, not projected in a room. This retires any concern about legibility at physical viewing distance, and it raises the importance of the shared-link afterlife, since viewers read on their own screens both during and after.
- **A decision reversed by the deletion:** an earlier round settled on retaining the predecessor's failure-modes comparison and amnesiac-freelancer material as off-path sections for the senior project group. That content no longer exists and is explicitly not to be recovered, so the deck is nine sections with no off-path content. The freelancer callback survives only as narration in section 4's speaker notes.
- **The hook's signal is invisible by construction.** It is a Claude Code `PostToolUse` hook matched to the `Read` tool only; it injects `additionalContext` the user never sees, fires post-hoc, never blocks, and does not trigger for `cat` or `grep` reads. The demo solves the visibility problem by configuring the hook to answer in pirate speak as well as proposing that a ticket be opened — an unmistakable, instantly visible signature that the hook fired. **The pirate instruction is a live-demo device only.** Section 7 of the deck shows the serious instance: proposing to open a ticket.
- **A precision worth preserving in the narration:** OKF makes `type` its only required field. `stale_after` is optional. So the machine pass in section 5 passes not because the _format_ demands the field, but because the _operator's own config rule_ does. The machine only checks what it was told to check — which is section 7's sentence, arriving three sections early.
- **A spoken aside, deliberately not on any slide:** the OKF specification is pinned by sha256 in `markdown-harness` because upstream mutates it in place under an unchanged `0.2` label with no tags or releases. It is a true and self-referential example of the talk's thesis, and it is too pointed to put in writing on a slide that gets shared afterwards.
- **Three premises remain untested** and should be revisited after the first render and rehearsal: that the room is AI-junior enough for section 2 to level rather than bore; that three passes over one artefact is legible at screen-share scale; and that nine sections of narration fits the budget.

## Implementation Order

Tickets live in `docs/specs/tickets/`. Work the **frontier**: any ticket whose blockers are all complete is available. Numbering is dependency order, not a mandatory sequence — several tickets run in parallel.

| #   | Ticket                                                                | Blocked by | Parallel with          |
| --- | --------------------------------------------------------------------- | ---------- | ---------------------- |
| 01  | Deck skeleton, scroll engine, and hero                                | —          | 02                     |
| 02  | Demo repositories and demo content _(needs-human, outside this repo)_ | —          | everything             |
| 03  | Point the repository at the new deck                                  | 01         | 04–11                  |
| 04  | Presentation mode and speaker notes                                   | 01         | 03, 05–11              |
| 05  | Section 2 — what a markdown file is                                   | 01         | 03, 04, 06, 07, 09, 11 |
| 06  | Section 3 — why this was always hard                                  | 01         | 03, 04, 05, 07, 09, 11 |
| 07  | Section 4 — where the effort goes (the Venn)                          | 01         | 03, 04, 05, 06, 09, 11 |
| 08  | Section 9 — the close                                                 | 07         | 03–06, 09–11           |
| 09  | The frontmatter block, and section 5's three passes                   | 01         | 03–08, 11              |
| 10  | Sections 6 and 7 — the block in full, and the handoff                 | 09         | 03–08, 11              |
| 11  | Section 8 — the live-demo beat and its rescue terminal                | 01         | 03–10                  |
| 12  | Theme, motion and accessibility verification sweep                    | 03–11      | —                      |
| 13  | Timing rehearsal and trim pass _(needs-human)_                        | 12, 02     | —                      |

### Why this order

**01 is the only true bottleneck.** Nothing can be built until the page, the beat engine, and the colour language exist. It is deliberately scoped to produce a demoable artefact — a real page with a finished hero and eight empty beats — rather than a scaffold nobody can look at.

**02 starts on day one and never blocks the deck.** The two demo repositories are the longest-lead item in the plan and the only one requiring a human at a local machine. They gate nothing in this repository, but they gate the talk. Starting them last is the most likely way this plan fails.

**Two dependency chains carry the talk's continuity, and they are the only real sequencing constraints.** The Venn is built in 07 and re-rendered in 08; the frontmatter block is built in 09, first used in the same ticket, and grown in 10. Both chains exist because the spec commits to one drawing used twice and one block grown three times, rather than lookalike duplicates. Building 08 before 07, or 10 before 09, would produce exactly the duplication the design rejects.

**Everything else fans out from 01.** Tickets 03, 04, 05, 06, 07, 09 and 11 are mutually independent and can proceed in any order or concurrently. If working alone and sequencing by value: 09 → 10 first, because the frontmatter block is the densest work and the highest legibility risk; then 07 → 08, because the Venn is the centrepiece; then 05, 06, 11; then 04 and 03, which are the cheapest.

**12 is last by construction** — a verification sweep across themes and reduced-motion can only be meaningful once every section exists. It is where the Venn's blend-mode overlap either survives dark themes or falls back to the hatched treatment.

**13 tests the plan's riskiest untested premise.** Whether 15–18 minutes of narration fits across nine sections is unknown until it is run against a clock. It needs both the finished deck and a rehearsable demo, which is why it depends on 12 and 02.

### Commit scoping

Work in this repository spans several commit scopes, and the repo enforces one scope per commit. Deck work commits under the deck's own folder scope; ticket 03 touches the root page, the agent-instructions file, and the governance rules, and needs a separate commit for each. The commit-hook validator derives scope generically from the top-level directory, so no validator change is needed for the new folder.
