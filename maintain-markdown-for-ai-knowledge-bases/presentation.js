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
          aria-hidden="true"
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

/* ------------------------------------------------------------------ *
 * The motion vocabulary
 *
 * Mirrors the custom properties at the top of animation.css. The stylesheet
 * owns the transitions and the keyframes; these numbers exist so the JS-timed
 * parts — staggers, and the hand-offs between one primitive and the next — stay
 * in the same language. Change a duration in one file and change it in the
 * other; they are one vocabulary in two syntaxes.
 *
 * Every beat's full sequence is budgeted to finish inside 2.5s, which is about
 * how long the presenter takes to say the sentence that goes with it.
 * ------------------------------------------------------------------ */

const MOTION = {
  rise: 560,
  draw: 900,
  settle: 520,
  hover: 180,
  stagger: 90,
};

/** Rise: bring a [data-rise] element in. Instant under reduced motion. */
function rise(el, at, reduced) {
  if (!el) return;
  if (reduced) el.classList.add("is-risen");
  else setTimeout(() => el.classList.add("is-risen"), at);
}

/**
 * Draw, part one: measure a path and park it fully undrawn.
 *
 * The length comes from getTotalLength(), never from a hand-guessed constant —
 * two paths of different true lengths sharing one number draw at visibly
 * different rates.
 */
function armDraw(path) {
  if (!path) return 0;
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len}`;
  return len;
}

/** Draw, part two: release an armed path so it draws over --deck-draw. */
function releaseDraw(path, at, reduced) {
  if (!path) return;
  const go = () => {
    path.style.strokeDashoffset = "0";
  };
  if (reduced) {
    path.style.strokeDasharray = "none";
    go();
  } else setTimeout(go, at);
}

/** Settle: a one-shot pop and ring on an HTML element. Silent under reduced motion. */
function settle(el, at, reduced) {
  if (!el || reduced) return;
  setTimeout(() => {
    el.classList.remove("deck-settle");
    void el.offsetWidth; // restart the animation if the beat is re-entered
    el.classList.add("deck-settle");
  }, at);
}

/** Settle, SVG flavour: the authored ring circle expands once and fades. */
function settleRing(el, at, reduced) {
  if (!el || reduced) return;
  setTimeout(() => el.classList.add("is-settling"), at);
}

/** A beat registers its on-activation animation here (keyed by beat id). */
function registerActivate(id, fn) {
  activateRegistry[id] = fn;
}

/** Rise the `[data-reveal]` children in sequence — the default beat animation. */
function revealSequence(root, reduced, { delay = 120, step = MOTION.stagger } = {}) {
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
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

// S1.1 — the hero lands line by line: eyebrow, title, thesis, name. Already does
// its job; retimed only, to adopt Rise.
registerActivate("s1-1", (reduced) => {
  const hero = document.getElementById("s1-1");
  if (!hero) return;
  revealSequence(hero, reduced, { delay: 200 });
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
      viewBox="20 45 860 355"
      role="img"
      aria-label="A markdown document at the center radiating outward to Context, Knowledge, and Instruction systems."
      class="hub-spoke isolate mx-auto block h-auto max-h-[55vh] w-full max-w-4xl"
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

      <!-- Spokes. Every path starts at the file and runs outward, so the Draw
           reads as the centre reaching the bucket rather than three cards
           arriving at once. Solid, not dashed: a dashed spoke reads as
           "provisional", and these routes are not provisional. The arrowhead is
           attached by JS when the line lands (and immediately under reduced
           motion), so it never floats at the destination ahead of its line. -->
      <g class="text-base-content/35">
        <!-- Spoke to Context (top-left) -->
        <path
          data-draw
          data-draw-step="0"
          data-marker="spoke-arrow"
          d="M 360 170 C 310 160, 290 120, 262 110"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <!-- Spoke to Knowledge (right) -->
        <path
          data-draw
          data-draw-step="1"
          data-marker="spoke-arrow"
          d="M 540 225 L 628 225"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <!-- Spoke to Instruction (bottom-left) -->
        <path
          data-draw
          data-draw-step="2"
          data-marker="spoke-arrow"
          d="M 360 280 C 310 290, 290 320, 262 330"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </g>

      <!-- Central Hub: the markdown file -->
      <g data-rise data-hub>
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
        <text x="402" y="126" class="fill-base-content/80 font-mono text-[11px] font-semibold">onboarding.md</text>

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
        <text x="382" y="176" class="fill-base-content/75 font-mono text-[9.5px]">type: Playbook</text>
        <text x="382" y="189" class="fill-base-content/75 font-mono text-[9.5px]">stale_after: 2025-07-01</text>
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

      <!-- The three buckets. The example filenames render by default and stay on
           screen: the deck is presented remotely by arrow key, so a bucket that
           only reveals its examples on hover is a bucket whose point never gets
           made. Hover Lifts one and softens the other two — emphasis only, never
           information. -->
      <g class="deck-lift-group">
        <!-- 1. Context (top-left) -->
        <g data-rise data-bucket="0"><g class="deck-lift text-base-content">
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
        </g></g>

        <!-- 2. Knowledge (right) -->
        <g data-rise data-bucket="1"><g class="deck-lift text-base-content">
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
        </g></g>

        <!-- 3. Instruction (bottom-left) -->
        <g data-rise data-bucket="2"><g class="deck-lift text-base-content">
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
        </g></g>
      </g>
    </svg>`;
}

/** Spokes are armed the moment they exist, so they are parked undrawn on arrival. */
function mountHubSpokes() {
  document.querySelectorAll("[data-hub-spoke]").forEach((host) => {
    host.innerHTML = hubSpokeMarkup();
    if (!reduceMotion) host.querySelectorAll("[data-draw]").forEach(armDraw);
  });
}

mountHubSpokes();

/* Sequence: the file Rises, then each spoke Draws outward 140ms after the last,
   and each bucket Rises as its own spoke lands. Total ≈ 1.94s. */
const SPOKE_STAGGER = 140;

function playHubSpoke(svg, reduced) {
  rise(svg.querySelector("[data-hub]"), 200, reduced);

  svg.querySelectorAll("[data-draw]").forEach((path) => {
    const i = Number(path.dataset.drawStep);
    const at = 400 + i * SPOKE_STAGGER;
    releaseDraw(path, at, reduced);

    // The arrowhead lands with the line, never ahead of it.
    const marker = () => {
      path.style.markerEnd = `url(#${path.dataset.marker})`;
    };
    if (reduced) marker();
    else setTimeout(marker, at + MOTION.draw);
  });

  svg.querySelectorAll("[data-bucket]").forEach((bucket) => {
    const i = Number(bucket.dataset.bucket);
    rise(bucket, 400 + i * SPOKE_STAGGER + 700, reduced);
  });
}

// S2.1 — heading lines Rise, then the hub and spoke assembles from the centre out.
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
 * The marquee drawing. Creation effort (accent) collapses as AI generates
 * files; verification effort (primary) climbs as volume explodes; they cross,
 * and the crossover is the argument.
 *
 * Two decisions worth recording:
 *
 * 1. Document volume rides the x-axis as a second tick row rather than a
 *    background column series. A background series would need its own implied
 *    vertical scale, making this a dual-axis chart — the most misleading chart
 *    form there is, because the alignment of the two scales is arbitrary and
 *    invents a correlation out of nothing. On the x-axis, volume is the
 *    *independent* variable driving both curves, which is the stronger version
 *    of the argument anyway: verification cost climbs *because* volume climbs.
 *    One vertical axis throughout.
 *
 * 2. The x-axis is ordinal — four evenly spaced checkpoints, not a linear time
 *    scale. The two tick rows are read together as one scale, which is why they
 *    are labelled in the left gutter rather than titled separately.
 * ------------------------------------------------------------------ */

function divergingCurvesMarkup() {
  return `
    <svg
      viewBox="0 0 950 430"
      role="img"
      aria-label="A chart of effort against time and document volume. Before day zero, creation effort is high and verification effort is low. After the document ships, creation effort collapses as AI generates files while verification effort climbs with volume, from one document to two hundred. The two curves cross partway along: that crossover is where the work moved."
      class="curves-chart mx-auto block h-auto max-h-[52vh] w-full max-w-5xl"
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
        <!-- The wash under the verification curve is revealed by this rectangle
             scaling out from the y-axis, so the area grows as the curve climbs.
             A horizontally scaled rectangle is still a rectangle, so this is a
             true wipe and nothing in the drawing is distorted. -->
        <clipPath id="curves-wipe">
          <rect data-curve-wipe x="120" y="55" width="620" height="300" />
        </clipPath>
      </defs>

      <!-- The frame: everything that is true before any data is drawn. -->
      <g data-rise data-chart-frame>
        <!-- Before day zero is its own territory, faintly shaded. -->
        <rect x="120" y="60" width="150" height="290" class="fill-base-content/5" />

        <!-- Gridlines. Solid hairlines, one step off the surface: a dashed grid
             reads as "projection" or "threshold" when it is only a grid. -->
        <g class="text-base-content/10">
          <line x1="120" y1="115" x2="740" y2="115" stroke="currentColor" stroke-width="1" />
          <line x1="120" y1="190" x2="740" y2="190" stroke="currentColor" stroke-width="1" />
          <line x1="120" y1="265" x2="740" y2="265" stroke="currentColor" stroke-width="1" />
        </g>

        <!-- Axes. Only the effort axis carries an arrow: it is the only one with
             a direction that has to be read. -->
        <g class="text-base-content/40">
          <line x1="120" y1="350" x2="120" y2="46" stroke="currentColor" stroke-width="1.5" marker-end="url(#axis-arrow)" />
          <line x1="112" y1="350" x2="748" y2="350" stroke="currentColor" stroke-width="1.5" />
        </g>
        <text x="120" y="30" class="fill-base-content/60 font-mono text-[11px] uppercase tracking-widest">
          Effort
        </text>

        <!-- Day zero is a boundary, not a tick: a rule with a labelled cap, and
             a named territory on each side. -->
        <g>
          <line x1="270" y1="54" x2="270" y2="350" class="stroke-base-content/25" stroke-width="1.5" />
          <rect x="226" y="34" width="88" height="21" rx="10.5" class="fill-base-100 stroke-base-content/30" stroke-width="1" />
          <text x="270" y="49" text-anchor="middle" class="fill-base-content font-mono text-[10.5px] font-bold uppercase tracking-wider">
            Day zero
          </text>
        </g>
        <text x="130" y="78" class="fill-base-content/40 font-mono text-[9.5px] uppercase tracking-[0.18em]">
          before it ships
        </text>
        <text x="282" y="78" class="fill-base-content/40 font-mono text-[9.5px] uppercase tracking-[0.18em]">
          after it ships
        </text>

        <!-- Two tick rows on one scale: time above, the volume it produces below.
             Volume is what drives both curves, so it belongs on the independent
             axis rather than in a second vertical scale. -->
        <g class="text-base-content/25">
          <line x1="270" y1="350" x2="270" y2="356" stroke="currentColor" stroke-width="1.5" />
          <line x1="427" y1="350" x2="427" y2="356" stroke="currentColor" stroke-width="1.5" />
          <line x1="583" y1="350" x2="583" y2="356" stroke="currentColor" stroke-width="1.5" />
          <line x1="740" y1="350" x2="740" y2="356" stroke="currentColor" stroke-width="1.5" />
        </g>
        <g class="font-mono text-[10.5px]">
          <text x="108" y="373" text-anchor="end" class="fill-base-content/40 text-[9.5px] uppercase tracking-widest">time</text>
          <text x="270" y="373" text-anchor="middle" class="fill-base-content/70">day 0</text>
          <text x="427" y="373" text-anchor="middle" class="fill-base-content/70">+30d</text>
          <text x="583" y="373" text-anchor="middle" class="fill-base-content/70">+90d</text>
          <text x="740" y="373" text-anchor="middle" class="fill-base-content/70">+180d</text>

          <text x="108" y="394" text-anchor="end" class="fill-base-content/40 text-[9.5px] uppercase tracking-widest">volume</text>
          <text x="270" y="394" text-anchor="middle" class="fill-base-content/45">1 doc</text>
          <text x="427" y="394" text-anchor="middle" class="fill-base-content/45">10 docs</text>
          <text x="583" y="394" text-anchor="middle" class="fill-base-content/45">50 docs</text>
          <text x="740" y="394" text-anchor="middle" class="fill-base-content/45">200 docs</text>
        </g>
      </g>

      <!-- The wash under the verification curve. A tint, never a block: it gives
           the climbing curve weight without claiming to be a second series. -->
      <g clip-path="url(#curves-wipe)">
        <path
          d="M 120 316 C 190 312, 235 298, 270 274 C 310 246, 355 216, 400 200 C 470 174, 570 132, 650 104 C 700 88, 722 82, 740 78 L 740 350 L 120 350 Z"
          class="fill-primary/10"
        />
      </g>

      <!-- Creation effort: high while a human writes the thing, collapsing once
           a model will write the next two hundred. -->
      <path
        data-draw
        data-draw-step="0"
        d="M 120 92 C 190 96, 235 112, 270 132 C 310 155, 355 185, 400 200 C 470 224, 570 262, 650 282 C 700 294, 722 298, 740 300"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        class="text-accent"
      />

      <!-- Verification effort: the mirror image, and the one nobody budgets for. -->
      <path
        data-draw
        data-draw-step="1"
        d="M 120 316 C 190 312, 235 298, 270 274 C 310 246, 355 216, 400 200 C 470 174, 570 132, 650 104 C 700 88, 722 82, 740 78"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        class="text-primary"
      />

      <!-- Direct labels at the curve ends, each with a short line-key. The key
           carries the series colour; the label text stays in base-content, which
           keeps it legible in every theme. -->
      <g data-rise data-chart-key>
        <line x1="748" y1="78" x2="764" y2="78" class="stroke-primary" stroke-width="3" stroke-linecap="round" />
        <text x="772" y="75" class="fill-base-content text-[12px] font-semibold">Verification</text>
        <text x="772" y="90" class="fill-base-content/60 text-[11.5px]">effort climbs</text>

        <line x1="748" y1="300" x2="764" y2="300" class="stroke-accent" stroke-width="3" stroke-linecap="round" />
        <text x="772" y="297" class="fill-base-content text-[12px] font-semibold">Creation</text>
        <text x="772" y="312" class="fill-base-content/60 text-[11.5px]">effort collapses</text>
      </g>

      <!-- The crossover. Arrives last, because it is the conclusion: the dot sits
           on a surface-coloured ring so it stays legible exactly where the two
           curves overlap, and a Settle ring marks its arrival. -->
      <g data-rise data-crossover>
        <line x1="408" y1="200" x2="478" y2="200" class="stroke-primary/40" stroke-width="1" stroke-dasharray="2 3" />
        <circle data-settle-ring cx="400" cy="200" r="7" fill="none" class="stroke-primary" stroke-width="2" />
        <circle cx="400" cy="200" r="5.5" class="fill-primary stroke-base-100" stroke-width="2" />
        <rect x="478" y="185" width="176" height="30" rx="8" class="fill-base-100 stroke-primary/40" stroke-width="1" />
        <text x="566" y="204" text-anchor="middle" class="fill-primary font-mono text-[11px] font-semibold tracking-wide">
          where the work moved
        </text>
      </g>
    </svg>`;
}

/** Curves are armed the moment they exist, so they are parked undrawn on arrival. */
function mountCurves() {
  document.querySelectorAll("[data-curves]").forEach((host) => {
    host.innerHTML = divergingCurvesMarkup();
    if (!reduceMotion) host.querySelectorAll("[data-draw]").forEach(armDraw);
  });
}

mountCurves();

/* Sequence: the frame Rises, both curves Draw at their own true rate while the
   wash wipes out beneath them, and the crossover arrives last. Total ≈ 1.6s. */
function playCurves(svg, reduced) {
  rise(svg.querySelector("[data-chart-frame]"), 0, reduced);

  svg.querySelectorAll("[data-draw]").forEach((path) => releaseDraw(path, 150, reduced));
  if (reduced) svg.classList.add("curves-on");
  else setTimeout(() => svg.classList.add("curves-on"), 150);

  rise(svg.querySelector("[data-chart-key]"), 700, reduced);
  rise(svg.querySelector("[data-crossover]"), 1050, reduced);
  settleRing(svg.querySelector("[data-settle-ring]"), 1100, reduced);
}

// S3.1 — heading lines Rise, then the chart builds and the crossover lands last.
registerActivate("s3-1", (reduced) => {
  const beat = document.getElementById("s3-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  const svg = beat.querySelector(".curves-chart");
  if (svg) playCurves(svg, reduced);
});

/* ------------------------------------------------------------------ *
 * Section 4 — The Effort Venn (and section 9 close)
 *
 * Authored once with effortVennMarkup(emphasis):
 *   emphasis = "establish" (section 4): all three regions render at
 *     equal weight, with the ? in accent representing the ambiguous
 *     overlap where AI helps but verification remains human.
 *   emphasis = "human" (section 9): re-renders the same drawing with
 *     machine and AI dimmed. Every [data-venn] element gets the drawing; its
 *     data-venn-emphasis attribute picks the state.
 * ------------------------------------------------------------------ */

const VENN_LENS = "M 352 132.5 A 235 235 0 0 0 352 427.5 A 160 160 0 0 0 352 132.5 Z";

/**
 * One drawing, mounted twice. `uid` only disambiguates the hatch pattern id
 * between the two mounts.
 *
 * Emphasis is deliberately NOT baked in here. Both mounts render identically and
 * neutrally, and the state lives as a class on the svg root that JS toggles —
 * so section 9 has a state to transition *from* rather than simply appearing in
 * its final one.
 */
function effortVennMarkup(uid) {
  return `
    <svg
      viewBox="110 25 680 510"
      role="img"
      aria-label="Three-region Venn: what a machine can check, what AI can help with, and what only a human can check. The human region is drawn largest."
      class="venn venn-emphasis-establish isolate mx-auto block h-auto max-h-[56vh] w-full max-w-4xl"
    >
      <defs>
        <pattern
          id="venn-hatch-${uid}"
          width="10"
          height="10"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10"
            stroke="currentColor"
            stroke-width="1.2"
            class="text-accent/25"
          />
        </pattern>
      </defs>
      <g data-venn-camera>
      <g data-venn-actor="machine" class="text-base-content">
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
      <g data-venn-actor="human" class="text-primary">
        <circle
          data-venn-step="2"
          cx="535" cy="280" r="235"
          stroke-width="1.5"
          class="venn-circle mix-blend-multiply fill-primary/20 stroke-primary/50 text-primary"
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
      <g data-venn-actor="ai" class="text-accent">
        <path
          data-venn-step="4"
          d="${VENN_LENS}"
          stroke-width="1.5"
          stroke-dasharray="5 7"
          fill="url(#venn-hatch-${uid})"
          class="stroke-accent/70"
        ></path>
        <text data-venn-step="4" x="375" y="180" text-anchor="middle"
          class="fill-accent font-mono text-[13px] font-bold uppercase tracking-[0.25em]">AI</text>
        <g data-venn-step="4">
          <text x="350" y="248" text-anchor="end"
            class="fill-accent font-mono text-[26px] font-extrabold tracking-wider">AI</text>
          <text x="366" y="254" text-anchor="start"
            class="fill-accent font-display text-[64px] font-bold leading-none">?</text>
        </g>
        <g data-venn-step="5">
          <text x="373" y="298" text-anchor="middle" class="fill-base-content/70 text-[12.5px]">fact-check</text>
          <text x="373" y="324" text-anchor="middle" class="fill-base-content/70 text-[12.5px]">hard numbers</text>
          <text x="373" y="350" text-anchor="middle" class="fill-base-content/70 text-[12.5px]">still needs checking</text>
        </g>
      </g>
      </g>
    </svg>`;
}

function mountVenns() {
  document.querySelectorAll("[data-venn]").forEach((host) => {
    const emphasis = host.dataset.vennEmphasis || "establish";
    host.innerHTML = effortVennMarkup(emphasis);
    const svg = host.querySelector(".venn");
    if (!svg) return;

    // Section 9 does not re-assemble the drawing — the audience has already
    // watched it build in section 4. It arrives whole so the camera push is the
    // only thing that moves. Under reduced motion it also arrives already
    // emphasised, since there is no transition to watch.
    if (emphasis === "human") {
      svg.classList.add("venn-on");
      if (reduceMotion) setVennEmphasis(svg, "human");
    }
  });
}

mountVenns();

/** Emphasis is a class on the svg root, so there is always a state to move from. */
function setVennEmphasis(svg, emphasis) {
  svg.classList.remove("venn-emphasis-establish", "venn-emphasis-human");
  svg.classList.add(`venn-emphasis-${emphasis}`);
}

function playVenn(svg, reduced, { delay = 100, step = MOTION.stagger } = {}) {
  if (reduced) {
    svg.classList.add("venn-on");
    return;
  }
  if (!svg.classList.contains("venn-on")) {
    svg.querySelectorAll("[data-venn-step]").forEach((el) => {
      el.style.transitionDelay = `${delay + Number(el.dataset.vennStep) * step}ms`;
    });
  }
  svg.classList.add("venn-on");
}

// S4.1 — heading lines Rise, then the Venn assembles actor by actor. The AI lens
// is the last step, so the overlap — the whole point of the drawing — resolves last.
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
 * In Section 5: Renders onboarding.md in an IDE editor treatment
 * with raw markdown syntax, --- frontmatter delimiters, and the body.
 * In Section 6: Full OKF 0.2 field set with who-supplies annotations.
 * In Section 7: Highlights stale_after and the configured operator sentence.
 * ------------------------------------------------------------------ */

function renderFrontmatterBlock({ mode = "section-5", activeField = null } = {}) {
  if (mode === "section-5") {
    return `
      <div class="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-md font-mono">
        <!-- IDE Editor Tab Bar -->
        <div class="flex items-center justify-between border-b border-base-300 bg-base-200/80 px-4 py-2.5 text-xs">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5 mr-2" aria-hidden="true">
              <span class="h-2.5 w-2.5 rounded-full bg-error/60"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-warning/60"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-success/60"></span>
            </div>
            <div class="flex items-center gap-1.5 rounded-t-md border-t-2 border-primary bg-base-100 px-3 py-1 font-medium text-base-content">
              <span class="text-primary font-bold text-xs">M↓</span>
              <span class="font-semibold">onboarding.md</span>
            </div>
          </div>
          <span class="badge badge-ghost badge-xs font-mono text-[10px] text-base-content/50">docs/handbook</span>
        </div>

        <!-- Raw Markdown Content imitating IDE editor with line numbers -->
        <div class="p-4 text-[11px] sm:text-xs leading-relaxed overflow-x-auto bg-base-100">
          <table class="w-full border-collapse font-mono">
            <tbody>
              <tr><td class="pr-3 text-right text-base-content/30 select-none w-6">1</td><td class="text-primary/70 font-bold">---</td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">2</td><td><span class="text-primary font-medium">type</span>: <span class="text-base-content/80">Playbook</span></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">3</td><td><span class="text-primary font-medium">title</span>: <span class="text-base-content/80">Onboarding a new employee</span></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">4</td><td><span class="text-primary font-medium">sources</span>:</td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">5</td><td class="pl-2">  - <span class="text-accent font-medium">id</span>: <span class="text-base-content/70">people-ops-handbook</span></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">6</td><td class="pl-2">    <span class="text-accent font-medium">resource</span>: <span class="text-primary/90 underline">https://intranet.example.com/people-ops/handbook#onboarding</span></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">7</td><td class="pl-2">    <span class="text-accent font-medium">title</span>: <span class="text-base-content/70">People Ops handbook, section 4</span></td></tr>
              <tr class="${activeField === "stale_after" ? "bg-warning/10 ring-1 ring-warning" : ""}"><td class="pr-3 text-right text-base-content/30 select-none">8</td><td><span class="text-primary font-medium">stale_after</span>: <span class="text-warning font-bold">2025-07-01T00:00:00Z</span></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">9</td><td class="text-primary/70 font-bold">---</td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">10</td><td></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">11</td><td class="font-bold text-base-content text-xs sm:text-sm"># Onboarding a new employee</td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">12</td><td></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">13</td><td class="font-semibold text-base-content/85">## Before day one</td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">14</td><td></td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">15</td><td class="text-base-content/70">1. Hiring manager files equipment request 5 days ahead: laptop, badge.</td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">16</td><td class="text-base-content/70">2. People Ops opens accounts: email, chat, payroll run closing on 20th.</td></tr>
              <tr><td class="pr-3 text-right text-base-content/30 select-none">17</td><td class="text-base-content/70">3. Hiring manager names buddy, books 30-min coffee on day one.</td></tr>
            </tbody>
          </table>
        </div>
      </div>`;
  }

  // Section 6 & 7: OKF 0.2 full card.
  //
  // Section 6 annotates every field with who supplies it. Those annotations are
  // always rendered — hover only emphasises, it never carries information,
  // because nobody in a screen-shared audience hovers. Unlike the Venn these are
  // real HTML elements rather than children of a role="img", so here the
  // enrichment is keyboard-reachable and each field takes a tabindex.
  const annotate = mode === "section-6";
  const fieldAttrs = annotate ? ' tabindex="0"' : "";
  const fieldClass = `fm-field rounded-lg border border-base-300/60 bg-base-100/70 p-3 transition-colors${annotate ? " deck-lift" : ""}`;
  const annotation = (text) =>
    annotate
      ? `<span data-rise="right" class="fm-annotation text-[11px] font-sans text-base-content/60 italic">${text}</span>`
      : "";

  return `
    <div class="frontmatter-card rounded-2xl border border-base-300 bg-base-200/50 p-5 md:p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between border-b border-base-300/70 pb-3">
        <div class="flex items-center gap-2">
          <span class="inline-block h-2.5 w-2.5 rounded-full bg-primary/70"></span>
          <span class="font-mono text-xs font-semibold text-base-content/80">onboarding.md</span>
          <span class="font-mono text-[10px] text-base-content/40">frontmatter</span>
        </div>
        <span class="badge badge-ghost badge-xs font-mono text-[10px] tracking-wider text-base-content/60">OKF v0.2</span>
      </div>

      <div class="space-y-3 font-mono text-xs md:text-sm${annotate ? " deck-lift-group" : ""}">
        <!-- type -->
        <div data-fm-field="type" class="${fieldClass}"${fieldAttrs}>
          <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <span class="text-base-content/50 uppercase tracking-wider text-[10px]">type:</span>
              <span class="font-semibold text-base-content ml-2">Playbook</span>
            </div>
            ${annotation("Who supplies: author chooses category")}
          </div>
        </div>

        <!-- sources -->
        <div data-fm-field="sources" class="${fieldClass}"${fieldAttrs}>
          <div class="flex flex-col gap-2">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <span class="text-base-content/50 uppercase tracking-wider text-[10px]">sources:</span>
              ${annotation("Who supplies: human defines authority")}
            </div>
            <div class="ml-3 pl-3 border-l-2 border-base-300/80 space-y-1">
              <div>
                <span class="text-base-content/50 text-[11px]">resource:</span>
                <span class="font-medium text-primary ml-1 break-all">https://intranet.example.com/people-ops/handbook#onboarding</span>
              </div>
              <div>
                <span class="text-base-content/50 text-[11px]">id:</span>
                <span class="text-base-content/80 ml-1">people-ops-handbook</span>
              </div>
              <div>
                <span class="text-base-content/50 text-[11px]">title:</span>
                <span class="text-base-content/80 ml-1">People Ops handbook, section 4</span>
              </div>
            </div>
          </div>
        </div>

        <!-- stale_after -->
        <div data-fm-field="stale_after" class="${fieldClass} ${activeField === "stale_after" ? "ring-2 ring-primary bg-primary/5" : ""}"${fieldAttrs}>
          <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div>
              <span class="text-base-content/50 uppercase tracking-wider text-[10px]">stale_after:</span>
              <span class="font-bold text-primary ml-2">2025-07-01T00:00:00Z</span>
            </div>
            ${annotation("Who supplies: human sets review budget")}
          </div>
        </div>

        <!-- generated (machine-signed) -->
        <div data-fm-field="generated" class="${fieldClass}"${fieldAttrs}>
          <div class="flex flex-col gap-1.5">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <span class="text-base-content/50 uppercase tracking-wider text-[10px]">generated:</span>
                <span class="badge badge-xs badge-neutral ml-2 font-mono text-[9px]">machine-signed</span>
              </div>
              ${annotation("Who supplies: machine stamps model & time")}
            </div>
            <div class="ml-3 pl-3 border-l-2 border-base-300/80 space-y-0.5 text-xs text-base-content/80">
              <div><span class="text-base-content/50">by:</span> <span class="text-accent font-medium">ai:claude-opus-5</span></div>
              <div><span class="text-base-content/50">at:</span> <span>2025-01-20T09:00:00Z</span></div>
            </div>
          </div>
        </div>

        <!-- verified (human-signed twin) -->
        <div data-fm-field="verified" class="${fieldClass}"${fieldAttrs}>
          <div class="flex flex-col gap-1.5">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <span class="text-base-content/50 uppercase tracking-wider text-[10px]">verified:</span>
                <span class="badge badge-xs badge-primary ml-2 font-mono text-[9px] text-primary-content">human-signed</span>
              </div>
              ${annotation("Who supplies: human verifies & signs")}
            </div>
            <div class="ml-3 pl-3 border-l-2 border-base-300/80 space-y-0.5 text-xs text-base-content/80">
              <div><span class="text-base-content/50">by:</span> <span class="text-primary font-bold">human:m.okonkwo</span></div>
              <div><span class="text-base-content/50">at:</span> <span>2025-01-22T11:30:00Z</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function mountFrontmatterBlocks() {
  document.querySelectorAll("[data-frontmatter-mount]").forEach((host) => {
    const beatId = host.dataset.frontmatterMount;
    const isSection5 = beatId.startsWith("s5");
    const mode = host.dataset.frontmatterMode || (isSection5 ? "section-5" : "section-6");
    host.innerHTML = renderFrontmatterBlock({
      mode,
      activeField: mode === "section-7" ? "stale_after" : null,
    });
  });
}

mountFrontmatterBlocks();

// Section 6 field-highlight interaction
document.addEventListener("click", (e) => {
  const fmField = e.target.closest("#s6-1 .fm-field");
  if (fmField) {
    const parent = fmField.closest(".frontmatter-card");
    if (parent) {
      parent.querySelectorAll(".fm-field").forEach((f) => {
        if (f !== fmField) {
          f.classList.remove("ring-2", "ring-primary", "bg-primary/5");
        }
      });
    }
    fmField.classList.toggle("ring-2");
    fmField.classList.toggle("ring-primary");
    fmField.classList.toggle("bg-primary/5");
  }
});

/* ------------------------------------------------------------------ *
 * Section 5 — three passes, and only two of them land
 *
 * This is where the vocabulary earns itself. The machine pass and the AI pass
 * Settle: they arrive and they finish. The human pass does not get a Settle at
 * all — it carries the Unsettled ring authored in index.html, which breathes and
 * never resolves. That contrast is the section's argument, so it is also carried
 * in words and in stroke style, never in motion alone.
 * ------------------------------------------------------------------ */

/** Settle the resolved passes on a beat, in the order they happened. */
function playPasses(beat, reduced, order) {
  order.forEach((name, i) => {
    settle(beat.querySelector(`[data-pass="${name}"]`), 500 + i * 200, reduced);
  });
}

// S5.1 — the machine pass resolves cleanly.
registerActivate("s5-1", (reduced) => {
  const beat = document.getElementById("s5-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  playPasses(beat, reduced, ["machine"]);
});

// S5.2 — the AI pass lands too, but amber: a claim, not a resolution.
registerActivate("s5-2", (reduced) => {
  const beat = document.getElementById("s5-2");
  if (!beat) return;
  revealSequence(beat, reduced);
  playPasses(beat, reduced, ["ai"]);
});

// S5.3 — both earlier passes settle again as recaps, and the human pass is left
// visibly open beneath them.
registerActivate("s5-3", (reduced) => {
  const beat = document.getElementById("s5-3");
  if (!beat) return;
  revealSequence(beat, reduced);
  playPasses(beat, reduced, ["machine", "ai"]);
});

// S6.1 — OKF: each field Settles as its annotation Rises in from the right, at
// the same instant. Paired, 300ms apart, five fields: ≈2.1s.
registerActivate("s6-1", (reduced) => {
  const beat = document.getElementById("s6-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  beat.querySelectorAll(".fm-field").forEach((field, i) => {
    const at = 350 + i * 300;
    settle(field, at, reduced);
    rise(field.querySelector(".fm-annotation"), at, reduced);
  });
});

// S7.1 — markdown-harness handoff. Deliberately quiet: one Rise for the
// headline, one for the sentence, and nothing else moves. The stale_after ring
// stays as artefact continuity but does not pulse. The contrast with §6's
// density is the point; the restraint is the design.
registerActivate("s7-1", (reduced) => {
  const beat = document.getElementById("s7-1");
  if (!beat) return;
  revealSequence(beat, reduced, { delay: 200, step: 220 });
});

/* ------------------------------------------------------------------ *
 * S8.1 — the rescue terminal
 *
 * The question types itself in, once, where it is asked — forty-odd characters
 * is short enough to feel live. The two answers then reveal line by line rather
 * than character by character: typing out two full answers would run past
 * fifteen seconds and blow the timing budget outright, and the point of the
 * beat is the divergence, which line reveal makes legible in about a second.
 *
 * Both legs open on the same command and the same file read. Then they part:
 * one carries on in ignorance, the other is intercepted and turns. The point
 * where they part is marked on both sides.
 * ------------------------------------------------------------------ */

/** Type a line out character by character, leaving a caret until it lands. */
function typeInto(el, reduced, { at = 0, total = 800 } = {}) {
  if (!el || reduced) return at;

  const chars = Array.from(el.textContent);
  const per = Math.max(12, Math.round(total / chars.length));
  const node = document.createTextNode("");
  const caret = document.createElement("span");
  caret.className = "deck-caret text-primary";
  caret.setAttribute("aria-hidden", "true");
  caret.textContent = "▌";

  el.textContent = "";
  el.append(node, caret);

  setTimeout(() => {
    let i = 0;
    const tick = setInterval(() => {
      node.data += chars[i];
      if (++i >= chars.length) {
        clearInterval(tick);
        caret.remove();
      }
    }, per);
  }, at);

  return at + chars.length * per;
}

// S8.1 — live demo rescue terminal. ≈2.2s.
registerActivate("s8-1", (reduced) => {
  const beat = document.getElementById("s8-1");
  if (!beat) return;
  revealSequence(beat, reduced);

  const asked = typeInto(beat.querySelector("[data-type]"), reduced, { at: 400, total: 800 });
  beat.querySelectorAll("[data-term-line]").forEach((el) => {
    const at = asked + 120 + Number(el.dataset.termLine) * 100;
    const show = () => el.classList.remove("opacity-0", "translate-y-3");
    if (reduced) show();
    else setTimeout(show, at);
  });
});

// S9.1 — the close. The drawing is already on screen; the camera pushes in
// towards the human region and then holds still. ≈0.9s, and deliberately no
// Unsettled here: the restlessness belongs to the middle of the argument, not
// its ending, and keeping Unsettled to one appearance is what makes it mean
// something back in §5.3.
registerActivate("s9-1", (reduced) => {
  const beat = document.getElementById("s9-1");
  if (!beat) return;
  revealSequence(beat, reduced);
  const svg = beat.querySelector(".venn");
  if (!svg || reduced) return;
  setTimeout(() => setVennEmphasis(svg, "human"), 120);
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
