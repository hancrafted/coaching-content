# Implementation Plan — AI Token Economy Tower Page

- **Status:** Ready — global decisions, Slice 0, Slice 1, and all 17 per-beat slices locked (grill complete 2026-07-06).
- **Date:** 2026-07-06
- **Source PRD:** `vault/projects/P-001-cyberlab-masterclass/prd/P-001-PRD-002-token-economics.md`
- **Target file:** `dev/coaching-content/ai-token-economy-101/index.html` (+ `presentation.js`, `src/style.css`)
- **Method:** Tracer-bullet vertical slices — each slice cuts through all layers (semantic HTML → Tailwind/daisyUI → JS visualization → scroll/TOC integration → verification) and is demoable on its own. Prefactor first.

---

## 1. Context & Goal

Replace the current horizontal keyboard slide deck (throwaway crypto placeholder content) with a **single long-scroll "tower" page**: a hero as the first slide, then one full-viewport section per beat. A sticky left table-of-contents tracks the active section on scroll. The page is a **standalone, SEO-optimized, interactive scrollytelling article** that doubles as a live-talk backdrop and a homepage-embeddable credibility artifact (audience: decision-makers — CTOs/CPOs/VPs).

## 2. Locked Decisions (from grill, 2026-07-06)

**Foundation**

- Full replace of the horizontal deck engine with a vertical scroll tower. Scroll is primary; keep `↑/↓` + `PageUp/PageDown` as optional jump-to-section.
- Scroll tech: **hand-rolled vanilla JS** — `IntersectionObserver` (active-section + reveal) + CSS `scroll-snap` + `requestAnimationFrame` (counters). **Zero new dependencies.**
- Sections: `min-h-screen` + `snap-start`, allowed to grow taller than viewport when content demands — **no clipping**.

**Layout / responsive**

- Desktop (`lg+`): sticky left rail listing the **8 PRD sections**, active one highlighted.
- Mobile: rail collapses to a slim top progress bar + tap-to-open **daisyUI drawer**.

**Design language / theming**

- **Theme picker** in the top-right navbar: dropdown of curated **daisyUI built-in themes**, selection saved to `localStorage`, applied on load (inline pre-paint script to avoid flash). No separate dark-mode toggle.
- Themes enabled: `corporate` (**default**), `business`, `luxury`, `night`, `dim`.
- Whole page built with **daisyUI semantic tokens** (`bg-base-100`, `text-base-content`, `text-primary`, …) so themes reskin everything.

**Content model**

- Standalone scrollytelling article: each section = **assertion headline** (PRD beat title) + **evidence visualization** + **concise supporting prose** distilled from the PRD `Content` field (NOT the verbatim talk track).
- Real semantic HTML (`section`/`h1`/`h2`/`nav`) + `meta`/OG/Twitter tags for SEO + embed.

**Reveal / interactivity**

- Section-level reveal: each section fades/slides in on enter (IntersectionObserver); its signature visualization animates when the section becomes active. **Respect `prefers-reduced-motion`** (instant, no motion).
- Default visualization interactivity = **Level 2 (animate on activation)**; upgrade specific beats to Level 3 (hover/click/toggle) only where it adds credibility.

**Slice structure**

- **Slice 0 (prefactor):** teardown + theming base.
- **Slice 1 (skeleton tracer bullet):** hero + all 8 section anchors + sticky TOC + mobile drawer + IO active-sync + keyboard jump + deep-link hashes + section reveal + theme picker.
- **Slices 2…N:** one thin slice **per beat** (17 beats), each delivering assertion + prose + its signature visualization end-to-end.

**Testing (no new deps)**

- Per-slice automated gate = `npm run verify` (Archgate + ESLint + Prettier + Vite build).
- Per-slice manual checklist (projector legibility, `prefers-reduced-motion`, theme switching, mobile/drawer).
- Optional: a tiny custom Archgate structural rule (all 8 sections + TOC entries present; headings match assertions).

## 3. Technical Constraints

- **Archgate FE-001:** no `<style>` blocks, no inline `style="..."` (SVG exempt); must use Tailwind v4 + daisyUI v5; no third-party CSS/UI libs. Inline `<script>` is allowed.
- **RULE-001 git commits:** one commit = one scope. Relevant scopes: `src`, `ai-token-economy-101`, `root`, `.archgate`. Conventional Commits + Keep-a-Changelog body. Commit dependencies first.
- **Vite MPA:** page auto-registered by `index.html` discovery; `base: "/coaching-content/"`; GitHub Pages hosting.
- daisyUI v5 theme config syntax: `@plugin "daisyui" { themes: corporate --default, business, luxury, night, dim; }`; switch via `data-theme` on `<html>`.

## 4. Slice Roadmap

| Slice | Name                               | Scope(s)                                   | Delivers                                                                                                         |
| :---- | :--------------------------------- | :----------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| 0     | Prefactor: teardown + theming base | `src`, `ai-token-economy-101`              | Blank themed scroll shell that builds                                                                            |
| 1     | Skeleton tracer bullet             | `ai-token-economy-101`, (`.archgate` opt.) | Navigable empty tower: hero + 8 anchors + TOC + drawer + active-sync + keyboard + hashes + reveal + theme picker |
| 2–18  | Per-beat visualizations (17 beats) | `ai-token-economy-101`                     | One beat each: assertion + prose + signature viz (detailed in §7)                                                |

Beats (17): S1.1 · S2.1 · S2.2 · S2.3 · S2.4 · S2.5 · S3.1 · S3.2 · S3.3 · S4.1 · S4.2 · S4.3 · S5.1 · S6.1 · S7.1 · S8.1 · S8.2. (S1.1 hero is realized in Slice 1; remaining beats are the content slices.)

---

## 5. Slice 0 — Prefactor: Teardown + Theming Base (detailed / handoff-ready)

**Goal:** Remove the horizontal deck engine, enable curated daisyUI themes, convert the page to a semantic-token base shell that builds & deploys blank. **Demoable:** a blank, themed, scrollable page that passes `npm run verify`. No beats yet.

Two atomic commits (dependency `src` first, then `ai-token-economy-101`).

### Commit 1 — scope `src` (`src/style.css`)

- Replace `@plugin "daisyui";` with:
  ```css
  @plugin "daisyui" {
    themes:
      corporate --default,
      business,
      luxury,
      night,
      dim;
  }
  ```
- Delete deck-specific CSS: `.slide`, `.slide.active`, the four `slide-*` keyframes, and the `::view-transition-*` rules (all served the horizontal deck).
- Keep the `@theme` font vars (Inter/Outfit/Fira) and the `prefers-reduced-motion` block (repurposed for reveal animations in Slice 1).

### Commit 2 — scope `ai-token-economy-101` (`index.html` + `presentation.js`)

- `<html lang="en" data-theme="corporate">`.
- `<head>`: keep fonts + `../src/style.css`; add a tiny **inline `<script>`** that reads `localStorage.theme` and sets `document.documentElement.dataset.theme` **before paint** (prevents theme flash). Update `<title>` / `<meta name="description">` for the token-economy talk; add OG/Twitter meta placeholders (SEO/embed).
- `<body class="min-h-screen bg-base-100 text-base-content font-sans">` — drop all hardcoded slate/blue/gradient classes; use **semantic tokens**.
- Replace deck markup with a base shell:
  - daisyUI `navbar`: start = back-to-dashboard link; center = page title; end = empty theme-picker container (`#theme-picker`, filled in Slice 1).
  - empty `<main id="tower">` container (the scroll tower, empty for now).
  - minimal footer.
  - Remove the kbd hint block, prev/next buttons, `#slide-progress`, `#slide-num-hud`.
- `presentation.js` → reduce to a stub: `import "../src/style.css";` only. All scroll/observer/theme-picker logic lands in Slice 1. Keep the filename (referenced by `index.html`).

### Verification (Slice 0)

- `npm run verify` green (Archgate: no `<style>`/inline style; ESLint; Prettier; Vite build).
- Page loads blank-but-themed; manually changing `data-theme` in devtools reskins it.
- No console errors; no dangling references to removed deck DOM.

### Suggested commit subjects

1. `refactor(src): enable curated daisyUI themes and drop deck-specific CSS`
2. `refactor(ai-token-economy-101): replace horizontal deck with themed scroll shell`

---

## 6. Slice 1 — Skeleton Tracer Bullet (detailed / handoff-ready)

**Goal:** A fully navigable but content-empty tower: hero + 8 section shells (with assertion `h2`s + empty visualization placeholders), sticky left TOC, mobile drawer/progress bar, IntersectionObserver active-sync, keyboard jump, deep-link hashes, section reveal-on-enter, and a working theme picker. **Demoable:** you can scroll/click/keyboard through the whole talk structure and switch themes; only the signature visualizations are missing. One atomic commit (scope `ai-token-economy-101`; optional second commit `.archgate` for the structural rule).

### 6.1 Section registry (data-driven)

Define a single JS array in `presentation.js` — the source of truth for both TOC and section shells — so beats can't drift out of sync:

```js
const SECTIONS = [
  { id: "hero", nav: "Intro", assertion: "…S1.1 hero headline…" },
  { id: "freelancer", nav: "The Freelancer", assertion: "…S2.1…" },
  // …8 PRD sections total; beats live inside their parent section…
];
```

- 8 top-level nav entries (the 8 PRD sections). The 17 beats are rendered as `<section>`/sub-blocks inside their parent section; TOC tracks the 8 parents.
- Each section shell: `<section id snap-start min-h-screen>` → assertion `h2` (`text-primary`, projector-scale) + concise prose slot + an empty `[data-viz="<beatId>"]` placeholder box (bordered `bg-base-200` panel) that each later slice fills.

### 6.2 Layout & TOC

- Two-column shell at `lg+`: sticky left rail (`sticky top-0 h-screen`) = daisyUI `menu` listing the 8 sections; main column = the scroll tower. Below `lg`: rail hidden; a fixed top **progress bar** (daisyUI `progress`) + a navbar hamburger opening a daisyUI **drawer** with the same menu.
- Active-section highlight: `IntersectionObserver` (rootMargin tuned so a section counts as active near viewport center) toggles `menu-active` on the matching TOC item and updates the progress bar.
- TOC click / drawer click → `scrollIntoView({ behavior: reduced-motion ? 'auto' : 'smooth' })`; closes drawer on mobile.

### 6.3 Interactivity

- **Keyboard jump:** `↓`/`PageDown` → next section, `↑`/`PageUp` → prev (guard against inputs/focus in the theme dropdown). Uses the same section index as the observer.
- **Deep-link hashes:** on active-section change, update `location.hash` via `history.replaceState` (no scroll jump / no history spam); on load, honor an incoming `#id`.
- **Section reveal:** each section starts `opacity-0 translate-y-4`; observer adds `opacity-100 translate-y-0` (Tailwind utilities + `transition`) on first enter. `prefers-reduced-motion` → start already-revealed (no transform/transition).
- **Theme picker:** fills the `#theme-picker` navbar slot (from Slice 0) with a daisyUI dropdown of the 5 themes; on select → set `data-theme` on `<html>` + write `localStorage.theme`. (Pre-paint read already added in Slice 0.)

### 6.4 Verification (Slice 1)

- `npm run verify` green.
- Manual: TOC highlights the section in view; clicking TOC/drawer scrolls to it; progress bar advances; keyboard jumps sections; `#id` deep-links land correctly and back/forward isn't polluted; theme persists across reload; reduced-motion shows everything instantly; projector legibility of assertion `h2`s; mobile drawer opens/closes.
- Optional `.archgate` commit: a tiny structural rule asserting all 8 section `id`s + matching TOC entries exist (guards against beats drifting).

### Suggested commit subject

`feat(ai-token-economy-101): scaffold vertical scroll tower with sticky TOC, drawer, and theme picker`

---

## 7. Slices 2–18 — Per-beat Visualizations

Each slice = **one atomic commit** (scope `ai-token-economy-101`) that fills one beat's placeholder end-to-end: assertion (already stubbed in Slice 1) + concise prose distilled from the PRD `Content` + the signature visualization wired to the section's activation observer + reduced-motion fallback. Every slice ends green on `npm run verify` and the per-slice manual checklist (projector legibility, reduced-motion, theme switch, mobile). Default interactivity = **Level 2 (animate on activation)** unless noted.

**Shared motif — the context meter:** build once (first needed in S3.2) as a reusable component/helper and reuse in S4.1, S4.3, S8.1 so the `/context` % reads as the spine of the talk.

### Locked tension beats (grilled 2026-07-06)

**Slice — S2.3 · The four eras.** Four cards horizontal on desktop, stacked on mobile. Each card: year range (overlap allowed), the AI trend, emerging disciplines, processes/workflows, and a small **workshop CTA** ("Workshop → coming soon", placeholder anchor). The **4th card (Loop Engineering)** rendered dashed/ghost border + muted styling + an **"emerging" badge** so it reads as not-yet-settled. A full-width **foundation plinth** under the row, labeled **"Token Economy — the currency of every era"**, on mobile beneath the stack. Level 2: cards fade/rise in **left→right** on activation, foundation bar draws in **last**. Reduced-motion: all shown, foundation already filled.

**Slice — S3.2 · The live `/context` + `/usage` demo.** Faithful terminal reproduction via daisyUI `mockup-window`/`mockup-code`, populated with the **real captured numbers** from the dry-run (PRD gate). Line-by-line **typewriter reveal** on activation; token counts / % full / breakdown highlighted. **Builds the reusable context-meter motif** here. Zero asset weight, fully themeable. (Live talk still runs the real terminal.) Reduced-motion: full output shown instantly.

**Slice — S4.1 · Context window = attention span that fills.** Reuses the S3.2 `/context` % meter. Starts **~10% pre-loaded** (system/rules/memory), then animates filling **step-by-step** as messages add, with **two diverging lanes** — "plain chat" fills slowly vs "agentic" balloons fast. "Fresh → full (4PM)" attention-span label on the meter. Level 2 on activation; reduced-motion shows final filled state.

**Slice — S5.1 · One bug fix → ~55k tokens.** Large **odometer-style running total** (rAF count-up, mono numerals) climbing as each step reveals beside it (query+system prompt → read file 1 → read file 2 → write patch); **pauses at ~4k/11k/17k**, then a bigger jump lands **~55k as the punch**, emphasized. **`~` / "illustrative"** marking so it never reads as exact (PRD credibility gate). Level 2 on activation; reduced-motion lists steps + final ~55k statically. (Optional Level-3 later: replay button for the recording viewer.)

**Slice — S6.1 · Tiered model stack + decision-maker bridge.** **Vertical tier ladder**, highest stakes/most expensive at top → cheapest at bottom (~6 rungs: Gemini flat-rate · Opus · Sonnet/Gemini Pro · Flash High · Haiku/Flash Low · Deepseek voice). Each rung shows **Stakes | Model tier | Engineer example | Leader-bridge example**, all visible at once (satisfies PRD "bridge visible on the same visual"). Level 2: rungs reveal **top→bottom** with a cost/capability gradient down the ladder. Mobile: each rung collapses to a card (stakes+tier header, two example lines). Voice names the extremes; the visual names all tiers; no unverified competitor claims.

### Accepted Level-2 concepts (remaining 12 beats)

These take the recommended Level-2 treatment (animate on activation, semantic tokens, reduced-motion fallback). Detail/refine at build time from the PRD `Content`.

- **S1.1 · Hero (realized in Slice 1).** Split "what AI can do (loud)" vs "what it costs (a dim, barely-visible meter)" — seeds the recurring cost/meter motif. Prose = the talk's promise.
- **S2.1 · The AI freelancer portrait.** Character card revealing three flaws in sequence: never asks questions · bills per word (hidden cost) · amnesia.
- **S2.2 · Lead one, upskill many.** One figure branches into a team; the **5–20× multiplier** surfaces as a count-up stat.
- **S2.4 · Visible invoice vs invisible AI cost.** Two-column: an approved/signed freelancer invoice vs AI charges dripping in small increments with no signature; AI side animates to the same total → "same cost, no signature."
- **S2.5 · Outcome per euro.** Quality-vs-cost showdown where the cheaper option wins financially despite lower quality; the **3–10× subsidy** fact as a stat/badge.
- **S3.1 · Text resolves into billable tokens.** A sentence splits into token chips on activation, each tagged billable; **four billing-dimension** tags appear → tokens are the metered unit.
- **S3.3 · CLI transparency vs web-tool obscurity.** CLI side = mini terminal echo with real numbers (named tools, e.g. Claude Code) vs web side = vague progress bar / abstract credits → "build a sense," not exact numbers.
- **S4.2 · The lost middle.** A message sequence fades in the middle while beginning + recent stay bright; subtle **auto-compaction** tag noting partial mitigation only.
- **S4.3 · Fullness gauge + two levers.** Reuses the meter with a **50% smart/dumb threshold** (green below / red above); two lever callouts — monitor with `/context`, compact via handoff; needle animates across the threshold; points forward to the S5.1 cost build-up.
- **S7.1 · Levers: automated vs team practices.** Two side-by-side buckets — automated (Headroom, RTK, Caveman **with net-negative caveat visible**) and team practices (edit-don't-restart, session hygiene, match billing); framed as a diagnostic checklist (automate vs practice).
- **S8.1 · The single CTA + echo meter.** One call-to-action with the recurring meter echoed; converges the motif.
- **S8.2 · Close — freelancer callback.** Callback to the S2.1 freelancer (bills by word, dumber under load) → "lead your people to lead the AI," landing on **outcome per euro + the upskilling gap** as the final emotional beat; callback motifs converge.

---

## 8. Open Items / PRD Gates (carry into build)

- **Dry-run capture (blocks S3.2, and the numbers echoed in S4.1/S4.3/S8.1):** capture real `/context` + `/usage` output before building those slices.
- **S2.3 4th-era label:** confirm final on-visual wording ("Loop Engineering", kept explicitly not-settled).
- **S5.1 figures:** keep ~4k/11k/17k/55k as round/illustrative; never render as exact.
- **S6.1 stack:** confirm the exact 6 rungs + one engineer + one leader example per rung; no unverified competitor claims.
- **Workshop CTAs (S2.3):** placeholder anchors until per-discipline pages exist.
