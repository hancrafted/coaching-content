import "../src/style.css";

/**
 * Maintain markdown for AI knowledge bases — scroll-tower engine.
 *
 * The single source of truth is the semantic HTML in `#tower`: every `.beat`
 * <section> carries data-section / data-section-title / data-beat / data-assertion.
 * The table of contents (desktop rail + mobile drawer), the accordion grouping,
 * the scroll active-sync, the progress bars and the deep-link hashes are ALL derived
 * from those attributes at runtime — so adding or removing a beat is a one-block edit.
 *
 * Colour language, established in the hero and reused by every later section:
 *   primary                = human    (the load-bearing actor)
 *   neutral / base-content = machine  (deliberately desaturated)
 *   accent                 = AI       (the ambiguous middle)
 * `secondary` is not used for any of the three — per ADR FE-001 it renders
 * near-gray in the default corporate theme.
 *
 * Per ADR FE-001, runtime-animated dimensions are set here via `element.style`
 * with their targets stored in `data-*` attributes; the HTML carries no inline
 * styles and no <style> blocks, and complex keyframes live in ./animation.css.
 */

/** Shared with the sibling ai-token-economy-101 deck so a theme choice carries across both. */
const STORAGE_KEY = "token-economy-theme";

/**
 * The curated shortlist. These are the themes the deck is checked against —
 * at least one light and one dark, per ADR FE-001's requirement for
 * semantic-coloured decorative layers. Ticket 12's verification sweep confirms
 * (and may adjust) this membership; every other theme stays reachable below it,
 * explicitly marked as unverified.
 */
const CURATED_THEMES = [
  { value: "corporate", label: "Corporate" },
  { value: "winter", label: "Winter" },
  { value: "business", label: "Business" },
  { value: "night", label: "Night" },
  { value: "dim", label: "Dim" },
  { value: "luxury", label: "Luxury" },
];

const OTHER_THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "cupcake", label: "Cupcake" },
  { value: "bumblebee", label: "Bumblebee" },
  { value: "emerald", label: "Emerald" },
  { value: "synthwave", label: "Synthwave" },
  { value: "retro", label: "Retro" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "valentine", label: "Valentine" },
  { value: "halloween", label: "Halloween" },
  { value: "garden", label: "Garden" },
  { value: "forest", label: "Forest" },
  { value: "aqua", label: "Aqua" },
  { value: "lofi", label: "Lofi" },
  { value: "pastel", label: "Pastel" },
  { value: "fantasy", label: "Fantasy" },
  { value: "wireframe", label: "Wireframe" },
  { value: "black", label: "Black" },
  { value: "dracula", label: "Dracula" },
  { value: "cmyk", label: "CMYK" },
  { value: "autumn", label: "Autumn" },
  { value: "acid", label: "Acid" },
  { value: "lemonade", label: "Lemonade" },
  { value: "coffee", label: "Coffee" },
  { value: "nord", label: "Nord" },
  { value: "sunset", label: "Sunset" },
  { value: "caramellatte", label: "Caramellatte" },
  { value: "abyss", label: "Abyss" },
  { value: "silk", label: "Silk" },
];

const ALL_THEMES = [...CURATED_THEMES, ...OTHER_THEMES];
const DEFAULT_THEME = "corporate";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const tower = document.getElementById("tower");

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pad2 = (n) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ *
 * Model — derive beats + sections from the DOM
 * ------------------------------------------------------------------ */

const beatEls = tower ? Array.from(tower.querySelectorAll(".beat")) : [];
const beatOrder = beatEls.map((el) => el.id);
const total = beatEls.length;
const beatById = {};
const sectionMap = new Map();

beatEls.forEach((el) => {
  const beat = {
    id: el.id,
    section: el.dataset.section,
    code: el.dataset.beat,
    assertion: el.dataset.assertion || "",
  };
  beatById[el.id] = beat;
  if (!sectionMap.has(beat.section)) {
    sectionMap.set(beat.section, {
      num: beat.section,
      title: el.dataset.sectionTitle || `Section ${beat.section}`,
      beats: [],
    });
  }
  sectionMap.get(beat.section).beats.push(beat);
});

const sections = Array.from(sectionMap.values());

/* ------------------------------------------------------------------ *
 * Table of contents — rendered identically into both mount points
 * ------------------------------------------------------------------ */

function renderSection(section) {
  const beats = section.beats
    .map(
      (b) => `
      <a
        href="#${b.id}"
        data-toc-jump="${b.id}"
        class="toc-beat block rounded-lg px-3 py-2 transition-colors hover:bg-base-300/50"
      >
        <span class="font-mono text-[0.6rem] uppercase tracking-widest text-base-content/40">${escapeHtml(
          b.code,
        )}</span>
        <span class="toc-beat-title mt-0.5 line-clamp-2 block text-sm leading-snug text-base-content/70"
          >${escapeHtml(b.assertion)}</span
        >
      </a>`,
    )
    .join("");

  return `
    <div class="toc-section" data-toc-section="${section.num}">
      <button
        type="button"
        data-section-toggle="${section.num}"
        class="toc-section-header flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-base-300/50"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span class="font-mono text-xs text-base-content/40">${pad2(section.num)}</span>
          <span class="truncate font-display text-sm font-semibold">${escapeHtml(section.title)}</span>
        </span>
        <svg
          data-caret
          class="h-4 w-4 shrink-0 text-base-content/40 transition-transform duration-200"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div data-section-beats="${section.num}" class="toc-beats hidden pl-2">${beats}</div>
    </div>`;
}

function buildTOC() {
  const html = sections.map(renderSection).join("");
  ["toc-desktop", "toc-mobile"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  });
}

/* ------------------------------------------------------------------ *
 * Active-sync — highlight the active beat, auto-expand its section,
 * drive the progress bars and keep the URL hash in step
 * ------------------------------------------------------------------ */

let activeBeatId = null;
const progressEls = ["progress-desktop", "progress-mobile"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function markBeatAnchor(anchor, active) {
  const title = anchor.querySelector(".toc-beat-title");
  anchor.classList.toggle("bg-primary/10", active);
  if (title) {
    title.classList.toggle("text-base-content/70", !active);
    title.classList.toggle("text-primary", active);
    title.classList.toggle("font-medium", active);
  }
}

function setSectionExpanded(num, expanded) {
  document
    .querySelectorAll(`[data-section-beats="${num}"]`)
    .forEach((el) => el.classList.toggle("hidden", !expanded));
  document
    .querySelectorAll(`[data-section-toggle="${num}"] [data-caret]`)
    .forEach((caret) => caret.classList.toggle("rotate-180", expanded));
}

function setActive(id) {
  if (!beatById[id] || id === activeBeatId) return;
  activeBeatId = id;
  const activeSection = beatById[id].section;

  document
    .querySelectorAll(".toc-beat")
    .forEach((a) => markBeatAnchor(a, a.getAttribute("data-toc-jump") === id));

  sections.forEach((s) => setSectionExpanded(s.num, s.num === activeSection));

  const idx = beatOrder.indexOf(id);
  const pct = total > 1 ? (idx / (total - 1)) * 100 : 100;
  progressEls.forEach((el) => {
    el.style.width = `${pct}%`;
  });

  const hash = `#${id}`;
  if (window.location.hash !== hash) {
    window.history.replaceState(null, "", hash);
  }

  // A beat taller than the viewport may never cross the reveal ratio; becoming
  // the dominant beat is the reliable second trigger for its animation.
  fireActivate(id);
}

/* ------------------------------------------------------------------ *
 * Activation registry
 *
 * Each beat may register an `activate` callback that fires ONCE, the first
 * time the beat is substantially in view or becomes the dominant beat. It
 * receives `reduced` (prefers-reduced-motion) and must render the final state
 * instantly when true — no content may be reachable only via animation.
 *
 * A beat that registers nothing still gets the default: its `[data-reveal]`
 * children fade up in sequence. Later tickets replace that per beat by calling
 * `registerActivate("s4-1", (reduced) => { ... })`.
 * ------------------------------------------------------------------ */

const activateRegistry = {};
const activated = new Set();

/** A beat registers its on-activation animation here (keyed by beat id). */
function registerActivate(id, fn) {
  activateRegistry[id] = fn;
}

/** Fade `[data-reveal]` children up in sequence — the default beat animation. */
function revealSequence(root, reduced, { delay = 120, step = 140 } = {}) {
  const items = root.querySelectorAll("[data-reveal]");
  items.forEach((el, i) => {
    const show = () => el.classList.remove("opacity-0", "translate-y-3");
    if (reduced) show();
    else setTimeout(show, delay + i * step);
  });
}

/** Fire a beat's activate callback exactly once. */
function fireActivate(id) {
  if (activated.has(id)) return;
  const el = document.getElementById(id);
  if (!el) return;
  activated.add(id);
  const fn = activateRegistry[id];
  if (fn) fn(reduceMotion);
  else revealSequence(el, reduceMotion);
}

/* ------------------------------------------------------------------ *
 * Reveal-on-enter + active tracking via one IntersectionObserver
 * ------------------------------------------------------------------ */

function revealBeat(el) {
  const inner = el.querySelector(".beat-inner");
  if (inner) inner.classList.remove("opacity-0", "translate-y-6");
}

function setupObserver() {
  const ratios = new Map();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        if (e.isIntersecting && e.intersectionRatio > 0.1) revealBeat(e.target);
        // Run the beat's animation once it is substantially in view.
        if (e.isIntersecting && e.intersectionRatio > 0.35) fireActivate(e.target.id);
      });

      let bestId = null;
      let bestRatio = 0;
      ratios.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });
      if (bestId) setActive(bestId);
    },
    { root: tower, threshold: [0.1, 0.25, 0.5, 0.75, 1] },
  );

  beatEls.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------------ *
 * Navigation — click, keyboard, hash
 *
 * Arrow-key beat stepping only. No CSS scroll-snap is used anywhere, so the
 * reader who opens the shared link afterwards keeps ordinary free scrolling.
 * ------------------------------------------------------------------ */

function closeDrawer() {
  const cb = document.getElementById("toc-drawer");
  if (cb) cb.checked = false;
}

function scrollToBeat(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

document.addEventListener("click", (e) => {
  const jump = e.target.closest("[data-toc-jump]");
  if (jump) {
    e.preventDefault();
    scrollToBeat(jump.getAttribute("data-toc-jump"));
    closeDrawer();
    return;
  }

  const toggle = e.target.closest("[data-section-toggle]");
  if (toggle) {
    e.preventDefault();
    const num = toggle.getAttribute("data-section-toggle");
    const beatsEl = document.querySelector(`[data-section-beats="${num}"]`);
    if (beatsEl) setSectionExpanded(num, beatsEl.classList.contains("hidden"));
  }
});

/** Typing in a form field must never step the deck. */
function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable === true;
}

window.addEventListener("keydown", (e) => {
  if (isTypingTarget(document.activeElement)) return;

  if (e.key === "p" || e.key === "P") {
    e.preventDefault();
    togglePresentationMode();
    return;
  }
  if (e.key === "n" || e.key === "N") {
    e.preventDefault();
    toggleSpeakerNotes();
    return;
  }

  const idx = beatOrder.indexOf(activeBeatId);
  if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    if (idx < total - 1) scrollToBeat(beatOrder[idx + 1]);
  } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    if (idx > 0) scrollToBeat(beatOrder[idx - 1]);
  } else if (e.key === "Home") {
    e.preventDefault();
    scrollToBeat(beatOrder[0]);
  } else if (e.key === "End") {
    e.preventDefault();
    scrollToBeat(beatOrder[total - 1]);
  }
});

window.addEventListener("hashchange", () => {
  const id = window.location.hash.slice(1);
  if (beatById[id] && id !== activeBeatId) scrollToBeat(id);
});

/* ------------------------------------------------------------------ *
 * Theme picker
 * ------------------------------------------------------------------ */

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
}

function updateThemeChecks() {
  const cur = currentTheme();
  ALL_THEMES.forEach((t) => {
    document.querySelectorAll(`[data-theme-check="${t.value}"]`).forEach((el) => {
      el.textContent = t.value === cur ? "✓" : "";
    });
  });
}

function setTheme(value) {
  document.documentElement.setAttribute("data-theme", value);
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* persistence unavailable — theme still applies for this session */
  }
  updateThemeChecks();
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}

function themeItems(themes) {
  return themes
    .map(
      (t) => `
      <li>
        <button type="button" data-theme-value="${t.value}" class="justify-between">
          <span>${t.label}</span>
          <span data-theme-check="${t.value}" class="text-primary"></span>
        </button>
      </li>`,
    )
    .join("");
}

function buildThemePicker() {
  const host = document.getElementById("theme-picker");
  if (!host) return;

  host.innerHTML = `
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-1" aria-label="Choose theme">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
          <path d="M12 3a9 9 0 000 18" fill="currentColor" />
        </svg>
        <span class="hidden sm:inline">Theme</span>
      </div>
      <ul
        tabindex="0"
        class="menu dropdown-content z-50 mt-2 max-h-80 w-52 flex-col flex-nowrap overflow-y-auto rounded-box border border-base-200 bg-base-100 p-2 shadow-lg"
      >
        <li class="menu-title text-[0.65rem] uppercase tracking-[0.2em]">Curated</li>
        ${themeItems(CURATED_THEMES)}
        <li class="menu-title text-[0.65rem] uppercase tracking-[0.2em]">Unverified</li>
        ${themeItems(OTHER_THEMES)}
      </ul>
    </div>`;

  host.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-value]");
    if (btn) setTheme(btn.getAttribute("data-theme-value"));
  });

  updateThemeChecks();
}

/* ------------------------------------------------------------------ *
 * Presenter controls — presentation mode & speaker notes
 * ------------------------------------------------------------------ */

const STORAGE_KEY_PRESENTATION = "deck-presentation-mode";
const STORAGE_KEY_NOTES = "deck-speaker-notes";

function updatePresenterControlsUI() {
  const isPres = document.documentElement.classList.contains("presentation-mode");
  const isNotes = document.documentElement.classList.contains("notes-visible");

  const presCheck = document.getElementById("presentation-mode-check");
  if (presCheck) presCheck.textContent = isPres ? "✓" : "";

  const notesCheck = document.getElementById("speaker-notes-check");
  if (notesCheck) notesCheck.textContent = isNotes ? "✓" : "";
}

function setPresentationMode(enabled) {
  document.documentElement.classList.toggle("presentation-mode", enabled);
  document.body.classList.toggle("presentation-mode", enabled);
  try {
    localStorage.setItem(STORAGE_KEY_PRESENTATION, enabled ? "true" : "false");
  } catch {
    /* persistence unavailable */
  }
  updatePresenterControlsUI();
  if (enabled && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function togglePresentationMode() {
  const current = document.documentElement.classList.contains("presentation-mode");
  setPresentationMode(!current);
}

function setSpeakerNotes(enabled) {
  document.documentElement.classList.toggle("notes-visible", enabled);
  document.body.classList.toggle("notes-visible", enabled);
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, enabled ? "true" : "false");
  } catch {
    /* persistence unavailable */
  }
  updatePresenterControlsUI();
}

function toggleSpeakerNotes() {
  const current = document.documentElement.classList.contains("notes-visible");
  setSpeakerNotes(!current);
}

function buildPresenterControls() {
  const host = document.getElementById("presenter-controls");
  if (!host) return;

  host.innerHTML = `
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-1.5" aria-label="Presenter controls">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6h16M4 12h10M4 18h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="hidden sm:inline">Presenter</span>
      </div>
      <ul
        tabindex="0"
        class="menu dropdown-content z-50 mt-2 w-56 rounded-box border border-base-200 bg-base-100 p-2 shadow-lg"
      >
        <li class="menu-title text-[0.65rem] uppercase tracking-[0.2em]">Presenter controls</li>
        <li>
          <button type="button" id="toggle-presentation-btn" class="justify-between py-2">
            <span class="flex items-center gap-2">
              <span>Presentation mode</span>
              <kbd class="kbd kbd-xs">P</kbd>
            </span>
            <span id="presentation-mode-check" class="text-primary font-bold"></span>
          </button>
        </li>
        <li>
          <button type="button" id="toggle-notes-btn" class="justify-between py-2">
            <span class="flex items-center gap-2">
              <span>Speaker notes</span>
              <kbd class="kbd kbd-xs">N</kbd>
            </span>
            <span id="speaker-notes-check" class="text-primary font-bold"></span>
          </button>
        </li>
      </ul>
    </div>`;

  const presBtn = document.getElementById("toggle-presentation-btn");
  if (presBtn) {
    presBtn.addEventListener("click", () => {
      togglePresentationMode();
    });
  }

  const notesBtn = document.getElementById("toggle-notes-btn");
  if (notesBtn) {
    notesBtn.addEventListener("click", () => {
      toggleSpeakerNotes();
    });
  }

  const exitBtn = document.getElementById("exit-presentation");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      setPresentationMode(false);
    });
  }

  updatePresenterControlsUI();
}

/* ------------------------------------------------------------------ *
 * Beat animations — each beat registers its own, before Init so it exists
 * when the first beat activates. Later tickets add theirs here.
 * ------------------------------------------------------------------ */

// S1.1 — the hero lands line by line: eyebrow, title, thesis, name.
registerActivate("s1-1", (reduced) => {
  const hero = document.getElementById("s1-1");
  if (!hero) return;
  revealSequence(hero, reduced, { delay: 200, step: 220 });
});

/* ------------------------------------------------------------------ *
 * S2.1 — Hub and spoke diagram (What a markdown file is)
 *
 * One markdown file at the centre with an unlabelled, planted frontmatter
 * block at its top, and three spokes radiating out to:
 *   - Context     (AGENTS.md, CLAUDE.md)
 *   - Knowledge   (wiki, LLM-wiki)
 *   - Instruction (skills, prompts, commands)
 *
 * All strokes and fills inherit theme colours (currentColor / semantic
 * daisyUI utilities) so the diagram re-skins across themes.
 * ------------------------------------------------------------------ */

function hubSpokeMarkup() {
  return `
    <svg
      viewBox="0 0 900 460"
      role="img"
      aria-label="Hub-and-spoke diagram: one markdown file at the centre with spokes radiating out to Context, Knowledge, and Instruction."
      class="hub-spoke mx-auto block h-auto max-h-[50vh] w-full max-w-4xl"
    >
      <defs>
        <marker
          id="spoke-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 1 2 L 7 5 L 1 8 z" fill="currentColor" class="text-base-content/40" />
        </marker>
      </defs>

      <!-- Spokes (lines with arrows) -->
      <g data-spoke-step="1" class="text-base-content/35">
        <!-- Spoke to Context (top-left) -->
        <path
          d="M 360 170 C 310 160, 290 120, 260 110"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-dasharray="4 4"
          marker-end="url(#spoke-arrow)"
        />
        <!-- Spoke to Knowledge (right) -->
        <path
          d="M 540 225 L 630 225"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-dasharray="4 4"
          marker-end="url(#spoke-arrow)"
        />
        <!-- Spoke to Instruction (bottom-left) -->
        <path
          d="M 360 280 C 310 290, 290 320, 260 330"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-dasharray="4 4"
          marker-end="url(#spoke-arrow)"
        />
      </g>

      <!-- Central Hub: the markdown file -->
      <g data-spoke-step="0">
        <!-- File card shadow & body -->
        <rect
          x="360"
          y="105"
          width="180"
          height="240"
          rx="10"
          class="fill-base-100 stroke-base-300"
          stroke-width="1.5"
        />
        <!-- Header bar with filename -->
        <path d="M 360 138 L 540 138" class="stroke-base-200" stroke-width="1" />
        <circle cx="376" cy="122" r="3.5" class="fill-primary/60" />
        <circle cx="388" cy="122" r="3.5" class="fill-accent/60" />
        <text x="402" y="126" class="fill-base-content/60 font-mono text-[11px] font-medium">document.md</text>

        <!-- Planted frontmatter block (deliberately unexplained) -->
        <rect
          x="372"
          y="148"
          width="156"
          height="66"
          rx="6"
          class="fill-base-200/70 stroke-base-content/15"
          stroke-width="1"
        />
        <text x="382" y="163" class="fill-base-content/40 font-mono text-[9px]">---</text>
        <text x="382" y="176" class="fill-base-content/75 font-mono text-[9.5px]">type: guide</text>
        <text x="382" y="189" class="fill-base-content/75 font-mono text-[9.5px]">stale_after: 2026-12-01</text>
        <text x="382" y="202" class="fill-base-content/40 font-mono text-[9px]">---</text>

        <!-- Document body lines -->
        <rect x="372" y="226" width="75" height="7" rx="3.5" class="fill-primary/40" />
        <rect x="372" y="242" width="132" height="5" rx="2.5" class="fill-base-content/20" />
        <rect x="372" y="254" width="144" height="5" rx="2.5" class="fill-base-content/20" />
        <rect x="372" y="266" width="115" height="5" rx="2.5" class="fill-base-content/20" />
        <rect x="372" y="278" width="136" height="5" rx="2.5" class="fill-base-content/15" />

        <text
          x="450"
          y="322"
          text-anchor="middle"
          class="fill-base-content/40 font-mono text-[9.5px] uppercase tracking-widest"
        >
          Plain text on disk
        </text>
      </g>

      <!-- Three Spokes (Context, Knowledge, Instruction) -->
      <g data-spoke-step="2">
        <!-- 1. Context (top-left) -->
        <g class="text-base-content">
          <rect
            x="30"
            y="55"
            width="225"
            height="112"
            rx="10"
            class="fill-base-200/50 stroke-base-300"
            stroke-width="1.5"
          />
          <text x="50" y="86" class="font-display text-[15px] font-bold fill-base-content">Context</text>
          <text x="50" y="106" class="fill-base-content/60 text-[12px]">Ambient session rules</text>
          <text x="50" y="130" class="font-mono text-[11.5px] font-semibold fill-primary">AGENTS.md · CLAUDE.md</text>
          <text x="50" y="148" class="fill-base-content/45 text-[11px]">Loaded into prompts at start</text>
        </g>

        <!-- 2. Knowledge (right) -->
        <g class="text-base-content">
          <rect
            x="640"
            y="170"
            width="230"
            height="112"
            rx="10"
            class="fill-base-200/50 stroke-base-300"
            stroke-width="1.5"
          />
          <text x="660" y="201" class="font-display text-[15px] font-bold fill-base-content">Knowledge</text>
          <text x="660" y="221" class="fill-base-content/60 text-[12px]">Institutional memory</text>
          <text x="660" y="245" class="font-mono text-[11.5px] font-semibold fill-accent">wiki · LLM-wiki · docs</text>
          <text x="660" y="263" class="fill-base-content/45 text-[11px]">Indexed, retrieved on demand</text>
        </g>

        <!-- 3. Instruction (bottom-left) -->
        <g class="text-base-content">
          <rect
            x="30"
            y="275"
            width="225"
            height="112"
            rx="10"
            class="fill-base-200/50 stroke-base-300"
            stroke-width="1.5"
          />
          <text x="50" y="306" class="font-display text-[15px] font-bold fill-base-content">Instruction</text>
          <text x="50" y="326" class="fill-base-content/60 text-[12px]">Operational guidance</text>
          <text x="50" y="350" class="font-mono text-[11.5px] font-semibold fill-base-content/90">skills · prompts · commands</text>
          <text x="50" y="368" class="fill-base-content/45 text-[11px]">Procedures executed step by step</text>
        </g>
      </g>
    </svg>`;
}

document.querySelectorAll("[data-hub-spoke]").forEach((host) => {
  host.innerHTML = hubSpokeMarkup();
});

function playHubSpoke(svg, reduced, { delay = 300, step = 250 } = {}) {
  if (!reduced) {
    svg.querySelectorAll("[data-spoke-step]").forEach((el) => {
      el.style.transitionDelay = `${delay + Number(el.dataset.spokeStep) * step}ms`;
    });
  }
  svg.classList.add("spoke-on");
}

// S2.1 — heading lines fade up, then the hub and spoke assembles.
registerActivate("s2-1", (reduced) => {
  const beat = document.getElementById("s2-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  const svg = beat.querySelector(".hub-spoke");
  if (svg) playHubSpoke(svg, reduced);
});

/* ------------------------------------------------------------------ *
 * S3.1 — Diverging curves (Why this was always hard)
 *
 * Creation effort (accent) collapses as AI generates files.
 * Verification effort (primary) climbs as volume explodes.
 * X-axis marks "day zero" where the document reaches production.
 * Crossover point is marked and labelled "where the work moved".
 * ------------------------------------------------------------------ */

function divergingCurvesMarkup() {
  return `
    <svg
      viewBox="0 0 900 450"
      role="img"
      aria-label="Two diverging curves over time: creation effort collapses after day zero while verification effort climbs. Marked at the crossover: where the work moved."
      class="curves-chart mx-auto block h-auto max-h-[50vh] w-full max-w-4xl"
    >
      <defs>
        <marker
          id="axis-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 1 2 L 7 5 L 1 8 z" fill="currentColor" class="text-base-content/40" />
        </marker>
      </defs>

      <!-- Grid lines (subtle) -->
      <g class="text-base-content/10">
        <line x1="120" y1="115" x2="840" y2="115" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4" />
        <line x1="120" y1="210" x2="840" y2="210" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4" />
        <line x1="120" y1="300" x2="840" y2="300" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4" />
      </g>

      <!-- Axes -->
      <g class="text-base-content/40">
        <!-- Y Axis: Effort -->
        <line x1="120" y1="370" x2="120" y2="55" stroke="currentColor" stroke-width="1.5" marker-end="url(#axis-arrow)" />
        <text x="110" y="50" text-anchor="end" class="fill-base-content/60 font-mono text-[11px] uppercase tracking-widest">
          Effort
        </text>

        <!-- X Axis: Time -->
        <line x1="115" y1="360" x2="850" y2="360" stroke="currentColor" stroke-width="1.5" marker-end="url(#axis-arrow)" />
        <text x="850" y="385" text-anchor="end" class="fill-base-content/60 font-mono text-[11px] uppercase tracking-widest">
          Time →
        </text>
      </g>

      <!-- Day zero marker & label -->
      <g class="text-base-content">
        <line
          x1="320"
          y1="55"
          x2="320"
          y2="360"
          class="stroke-base-content/25"
          stroke-width="1.5"
          stroke-dasharray="4 4"
        />
        <circle cx="320" cy="360" r="4" class="fill-base-content/60" />
        <text x="320" y="390" text-anchor="middle" class="fill-base-content font-mono text-[12px] font-bold">
          Day zero
        </text>
        <text x="320" y="408" text-anchor="middle" class="fill-base-content/60 text-[11.5px]">
          Document reaches production
        </text>
      </g>

      <!-- Curve 1: Creation effort (collapses with AI, accent) -->
      <g class="text-accent">
        <path
          data-curve="creation"
          data-target-length="820"
          d="M 120 115 C 220 115, 300 130, 350 145 C 390 160, 420 190, 440 210 C 470 240, 530 290, 620 315 C 710 335, 770 340, 820 342"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          class="text-accent"
        />
        <text x="825" y="346" class="fill-accent font-medium text-[12px]">
          Creation effort (collapses)
        </text>
      </g>

      <!-- Curve 2: Verification effort (climbs with volume, primary) -->
      <g class="text-primary">
        <path
          data-curve="verification"
          data-target-length="820"
          d="M 120 335 C 220 335, 300 320, 350 300 C 390 275, 420 235, 440 210 C 470 180, 530 130, 620 100 C 710 80, 770 75, 820 72"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          class="text-primary"
        />
        <text x="825" y="76" class="fill-primary font-medium text-[12px]">
          Verification effort (climbs)
        </text>
      </g>

      <!-- Crossover point marker & label -->
      <g data-crossover-label class="text-primary">
        <!-- Pulse ring & point -->
        <circle cx="440" cy="210" r="11" class="fill-primary/20 stroke-primary/50" stroke-width="1.5" />
        <circle cx="440" cy="210" r="5" class="fill-base-100 stroke-primary" stroke-width="2.5" />

        <!-- Leader dashed line -->
        <line x1="440" y1="172" x2="440" y2="198" class="stroke-primary" stroke-width="1.5" stroke-dasharray="2 2" />

        <!-- Badge pill -->
        <rect
          x="345"
          y="138"
          width="190"
          height="34"
          rx="17"
          class="fill-base-100 stroke-primary shadow-lg"
          stroke-width="2"
        />
        <text
          x="440"
          y="160"
          text-anchor="middle"
          class="fill-primary font-mono text-[11.5px] font-bold uppercase tracking-wider"
        >
          where the work moved
        </text>
      </g>
    </svg>`;
}

document.querySelectorAll("[data-curves]").forEach((host) => {
  host.innerHTML = divergingCurvesMarkup();
});

function playCurves(svg, reduced) {
  const pathCreation = svg.querySelector("[data-curve='creation']");
  const pathVerification = svg.querySelector("[data-curve='verification']");

  if (reduced) {
    if (pathCreation) pathCreation.style.strokeDashoffset = "0";
    if (pathVerification) pathVerification.style.strokeDashoffset = "0";
    svg.classList.add("curves-on");
    return;
  }

  [pathCreation, pathVerification].forEach((path) => {
    if (!path) return;
    const len = Math.ceil(path.getTotalLength ? path.getTotalLength() : 820);
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    path.style.transition = "stroke-dashoffset 1.3s cubic-bezier(0.4, 0, 0.2, 1)";
  });

  requestAnimationFrame(() => {
    setTimeout(() => {
      if (pathCreation) pathCreation.style.strokeDashoffset = "0";
      if (pathVerification) pathVerification.style.strokeDashoffset = "0";
    }, 150);

    setTimeout(() => {
      svg.classList.add("curves-on");
    }, 1500);
  });
}

// S3.1 — heading lines fade up, then the curves draw in and the crossover arrives.
registerActivate("s3-1", (reduced) => {
  const beat = document.getElementById("s3-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  const svg = beat.querySelector(".curves-chart");
  if (svg) playCurves(svg, reduced);
});

/*
 * S4.1 — the effort Venn. One drawing used twice: section 4 mounts it with
 * emphasis "establish" to set the colour language, and section 9 (ticket 08)
 * re-renders the same component with emphasis "human" — human region lit,
 * machine and AI dimmed. Every [data-venn] element gets the drawing; its
 * data-venn-emphasis attribute picks the state.
 *
 * The geometry carries the argument. The human circle is visibly the largest,
 * and AI is not a circle of its own: it is the lens where the two parent
 * circles overlap, produced by mix-blend-multiply inside the svg's isolated
 * stacking context rather than painted as a flat third fill — the ambiguity
 * emerges from the geometry, and both parents are semantic tokens so the
 * blend re-skins across themes. The lens's only label is a question mark
 * (accent); its boundary is a dashed accent outline — provisional territory,
 * and the same treatment the spec names as the fallback should the blend
 * ever muddy in a dark theme.
 *
 * Machine circle: c(290,280) r160. Human circle: c(535,280) r235. Their
 * intersection tips sit at (352, 132.5) and (352, 427.5) — the lens path
 * below traces the human circle's left arc down, then the machine circle's
 * right arc back up.
 */

const VENN_LENS = "M 352 132.5 A 235 235 0 0 0 352 427.5 A 160 160 0 0 0 352 132.5 Z";

function effortVennMarkup(emphasis) {
  const dimmed = emphasis === "human";
  const dim = dimmed ? " opacity-25" : "";
  const lit = dimmed ? " venn-lit" : "";
  return `
    <svg
      viewBox="110 25 680 510"
      role="img"
      aria-label="Three-region Venn: what a machine can check, what AI can help with, and what only a human can check. The human region is drawn largest."
      class="venn isolate mx-auto block h-auto max-h-[48vh] w-full max-w-3xl"
    >
      <g data-venn-actor="machine" class="text-base-content transition-opacity duration-700${dim}">
        <circle
          data-venn-step="0"
          cx="290" cy="280" r="160"
          stroke-width="1.5"
          class="venn-circle fill-base-content/10 stroke-base-content/30"
        ></circle>
        <g data-venn-step="1">
          <text x="225" y="185" text-anchor="middle"
            class="fill-base-content/50 font-mono text-[11px] uppercase tracking-[0.3em]">machine</text>
          <text x="215" y="255" text-anchor="middle" class="fill-base-content/55 text-[13px]">reference resolves</text>
          <text x="215" y="285" text-anchor="middle" class="fill-base-content/55 text-[13px]">file exists</text>
          <text x="215" y="315" text-anchor="middle" class="fill-base-content/55 text-[13px]">template structure holds</text>
        </g>
      </g>
      <g data-venn-actor="human" class="text-primary transition-opacity duration-700">
        <circle
          data-venn-step="2"
          cx="535" cy="280" r="235"
          stroke-width="1.5"
          class="venn-circle mix-blend-multiply fill-primary/20 stroke-primary/50 text-primary${lit}"
        ></circle>
        <g data-venn-step="3">
          <text x="610" y="150" text-anchor="middle"
            class="fill-primary font-mono text-[11px] uppercase tracking-[0.3em]">human</text>
          <text x="605" y="242" text-anchor="middle" class="fill-base-content/90 text-[15px] font-medium">is it still true</text>
          <text x="605" y="280" text-anchor="middle" class="fill-base-content/90 text-[15px] font-medium">is it stale</text>
          <text x="605" y="318" text-anchor="middle" class="fill-base-content/90 text-[15px] font-medium">does the reference point</text>
          <text x="605" y="340" text-anchor="middle" class="fill-base-content/90 text-[15px] font-medium">at the right content</text>
        </g>
      </g>
      <g data-venn-actor="ai" class="text-accent transition-opacity duration-700${dim}">
        <path
          data-venn-step="4"
          d="${VENN_LENS}"
          stroke-width="1.5"
          stroke-dasharray="5 7"
          class="fill-none stroke-accent/60"
        ></path>
        <text data-venn-step="4" x="375" y="252" text-anchor="middle"
          class="fill-accent font-display text-[72px] font-bold">?</text>
        <g data-venn-step="5">
          <text x="373" y="298" text-anchor="middle" class="fill-base-content/70 text-[12.5px]">fact-check</text>
          <text x="373" y="324" text-anchor="middle" class="fill-base-content/70 text-[12.5px]">hard numbers</text>
          <text x="373" y="350" text-anchor="middle" class="fill-base-content/70 text-[12.5px]">still needs checking</text>
        </g>
      </g>
    </svg>`;
}

document.querySelectorAll("[data-venn]").forEach((host) => {
  host.innerHTML = effortVennMarkup(host.dataset.vennEmphasis || "establish");
});

/**
 * Stagger the Venn's arrival — machine first (the settled part), the human
 * circle second (the big arrival), the question mark last. Reduced motion
 * skips the stagger; the reduced-motion block in animation.css already holds
 * every step at its final, fully legible state.
 */
function playVenn(svg, reduced, { delay = 350, step = 300 } = {}) {
  if (!reduced) {
    svg.querySelectorAll("[data-venn-step]").forEach((el) => {
      el.style.transitionDelay = `${delay + Number(el.dataset.vennStep) * step}ms`;
    });
  }
  svg.classList.add("venn-on");
}

// S4.1 — heading lines fade up, then the Venn assembles actor by actor.
registerActivate("s4-1", (reduced) => {
  const beat = document.getElementById("s4-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  const svg = beat.querySelector(".venn");
  if (svg) playVenn(svg, reduced);
});

/* ------------------------------------------------------------------ *
 * Frontmatter Block Component (Sections 5, 6, 7)
 *
 * Authored once with the complete OKF v0.2 field set.
 * Designed as a display element, not a code block.
 * Mode determines visibility and annotations:
 *   - "section-5": only sources and stale_after
 *   - "section-6": full field set with who-supplies annotations
 *   - "section-7": full field set with configured sentence highlighting
 * ------------------------------------------------------------------ */

function renderFrontmatterBlock({ mode = "section-5", activeField = null } = {}) {
  const isS5 = mode === "section-5";

  return `
    <div class="frontmatter-card rounded-2xl border border-base-300 bg-base-200/50 p-5 md:p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between border-b border-base-300/70 pb-3">
        <div class="flex items-center gap-2">
          <span class="inline-block h-2.5 w-2.5 rounded-full bg-primary/70"></span>
          <span class="font-mono text-xs font-semibold text-base-content/80">document.md</span>
          <span class="font-mono text-[10px] text-base-content/40">frontmatter</span>
        </div>
        <span class="badge badge-ghost badge-xs font-mono text-[10px] tracking-wider text-base-content/60">OKF v0.2</span>
      </div>

      <div class="space-y-3 font-mono text-xs md:text-sm">
        ${
          !isS5
            ? `
        <!-- type -->
        <div data-fm-field="type" class="fm-field rounded-lg border border-base-300/60 bg-base-100/70 p-3 transition-colors">
          <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <span class="text-base-content/50 uppercase tracking-wider text-[10px]">type:</span>
              <span class="font-semibold text-base-content ml-2">guide</span>
            </div>
            ${mode === "section-6" ? `<span class="fm-annotation text-[11px] font-sans text-base-content/60 italic">Who supplies: author chooses category</span>` : ""}
          </div>
        </div>`
            : ""
        }

        <!-- sources -->
        <div data-fm-field="sources" class="fm-field rounded-lg border border-base-300/60 bg-base-100/70 p-3 transition-colors">
          <div class="flex flex-col gap-2">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <span class="text-base-content/50 uppercase tracking-wider text-[10px]">sources:</span>
              ${mode === "section-6" ? `<span class="fm-annotation text-[11px] font-sans text-base-content/60 italic">Who supplies: human defines authority</span>` : ""}
            </div>
            <div class="ml-3 pl-3 border-l-2 border-base-300/80 space-y-1">
              <div>
                <span class="text-base-content/50 text-[11px]">resource:</span>
                <span class="font-medium text-primary ml-1 break-all">https://internal.corp/spec/v2</span>
              </div>
              <div>
                <span class="text-base-content/50 text-[11px]">id:</span>
                <span class="text-base-content/80 ml-1">okf-spec-v2</span>
              </div>
              <div>
                <span class="text-base-content/50 text-[11px]">title:</span>
                <span class="text-base-content/80 ml-1">Core Architecture Specification</span>
              </div>
            </div>
          </div>
        </div>

        <!-- stale_after -->
        <div data-fm-field="stale_after" class="fm-field rounded-lg border border-base-300/60 bg-base-100/70 p-3 transition-colors ${activeField === "stale_after" ? "ring-2 ring-primary bg-primary/5" : ""}">
          <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <span class="text-base-content/50 uppercase tracking-wider text-[10px]">stale_after:</span>
              <span class="font-bold text-primary ml-2">2026-06-01T00:00:00+00:00</span>
            </div>
            ${mode === "section-6" ? `<span class="fm-annotation text-[11px] font-sans text-base-content/60 italic">Who supplies: human sets review budget</span>` : ""}
          </div>
        </div>

        ${
          !isS5
            ? `
        <!-- generated (machine-signed) -->
        <div data-fm-field="generated" class="fm-field rounded-lg border border-base-300/60 bg-base-100/70 p-3 transition-colors">
          <div class="flex flex-col gap-1.5">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <span class="text-base-content/50 uppercase tracking-wider text-[10px]">generated:</span>
                <span class="badge badge-xs badge-neutral ml-2 font-mono text-[9px]">machine-signed</span>
              </div>
              ${mode === "section-6" ? `<span class="fm-annotation text-[11px] font-sans text-base-content/60 italic">Who supplies: machine stamps model & time</span>` : ""}
            </div>
            <div class="ml-3 pl-3 border-l-2 border-base-300/80 space-y-0.5 text-xs text-base-content/80">
              <div><span class="text-base-content/50">by:</span> <span class="text-accent font-medium">claude-3-7-sonnet</span></div>
              <div><span class="text-base-content/50">at:</span> <span>2026-01-15T09:30:00+00:00</span></div>
            </div>
          </div>
        </div>

        <!-- verified (human-signed twin) -->
        <div data-fm-field="verified" class="fm-field rounded-lg border border-base-300/60 bg-base-100/70 p-3 transition-colors">
          <div class="flex flex-col gap-1.5">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <span class="text-base-content/50 uppercase tracking-wider text-[10px]">verified:</span>
                <span class="badge badge-xs badge-primary ml-2 font-mono text-[9px] text-primary-content">human-signed</span>
              </div>
              ${mode === "section-6" ? `<span class="fm-annotation text-[11px] font-sans text-base-content/60 italic">Who supplies: human verifies & signs</span>` : ""}
            </div>
            <div class="ml-3 pl-3 border-l-2 border-base-300/80 space-y-0.5 text-xs text-base-content/80">
              <div><span class="text-base-content/50">by:</span> <span class="text-primary font-bold">human:han</span></div>
              <div><span class="text-base-content/50">at:</span> <span>2026-02-01T14:15:00+00:00</span></div>
            </div>
          </div>
        </div>`
            : ""
        }
      </div>
    </div>`;
}

function mountFrontmatterBlocks() {
  document.querySelectorAll("[data-frontmatter-mount]").forEach((host) => {
    const beatId = host.dataset.frontmatterMount;
    const isSection5 = beatId.startsWith("s5");
    host.innerHTML = renderFrontmatterBlock({
      mode: isSection5 ? "section-5" : host.dataset.frontmatterMode || "section-6",
    });
  });
}

mountFrontmatterBlocks();

// S5.1 — machine pass resolves cleanly
registerActivate("s5-1", (reduced) => {
  const beat = document.getElementById("s5-1");
  if (!beat) return;
  revealSequence(beat, reduced);
});

// S5.2 — AI pass returns a claim
registerActivate("s5-2", (reduced) => {
  const beat = document.getElementById("s5-2");
  if (!beat) return;
  revealSequence(beat, reduced);
});

// S5.3 — human pass stays visibly unresolved
registerActivate("s5-3", (reduced) => {
  const beat = document.getElementById("s5-3");
  if (!beat) return;
  revealSequence(beat, reduced);
});

// S9.1 — close: heading lines fade up, then the Venn assembles with human emphasis lit.
registerActivate("s9-1", (reduced) => {
  const beat = document.getElementById("s9-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  const svg = beat.querySelector(".venn");
  if (svg) playVenn(svg, reduced, { delay: 200, step: 200 });
});

/* ------------------------------------------------------------------ *
 * Init
 * ------------------------------------------------------------------ */

buildThemePicker();
buildPresenterControls();
buildTOC();

try {
  if (localStorage.getItem(STORAGE_KEY_PRESENTATION) === "true") {
    setPresentationMode(true);
  }
  if (localStorage.getItem(STORAGE_KEY_NOTES) === "true") {
    setSpeakerNotes(true);
  }
} catch {
  /* ignore */
}

if (reduceMotion) {
  document
    .querySelectorAll(".beat-inner")
    .forEach((el) => el.classList.remove("opacity-0", "translate-y-6"));
}

const hashId = window.location.hash.slice(1);
const initialId = beatById[hashId] ? hashId : beatOrder[0];
setActive(initialId);
if (beatById[hashId]) {
  requestAnimationFrame(() => scrollToBeat(hashId));
} else if (beatOrder.length) {
  revealBeat(document.getElementById(beatOrder[0]));
}

setupObserver();
