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
 *   primary                = machine  (mechanical, deterministic checks)
 *   secondary              = human    (the load-bearing actor, ground truth)
 *   accent                 = AI       (the accelerator, recommendations)
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
    title: el.dataset.slideTitle || el.dataset.assertion || "",
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
 * Table of contents — executive summary, claims as titles, collapsed
 * hierarchy with only section 5 having children.
 * ------------------------------------------------------------------ */

function renderSection(section) {
  // Only section 5 has genuine subsections
  if (section.beats.length > 1) {
    const beats = section.beats
      .map(
        (b) => `
        <a
          href="#${b.id}"
          data-toc-jump="${b.id}"
          class="toc-beat block rounded-lg px-3 py-1.5 transition-colors hover:bg-base-300/50"
        >
          <span class="toc-beat-title line-clamp-1 block text-xs leading-snug text-base-content/70"
            >${escapeHtml(b.title || b.assertion)}</span
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
            class="h-4 w-4 shrink-0 text-base-content/40 transition-transform duration-200 rotate-180"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div data-section-beats="${section.num}" class="toc-beats pl-6 space-y-0.5 mt-0.5">${beats}</div>
      </div>`;
  }

  // Single-slide flat entry — no fake hierarchy, no SX.1 code
  const b = section.beats[0];
  return `
    <div class="toc-section" data-toc-section="${section.num}">
      <a
        href="#${b.id}"
        data-toc-jump="${b.id}"
        class="toc-beat block rounded-lg px-3 py-2 transition-colors hover:bg-base-300/50"
      >
        <span class="flex items-center gap-2">
          <span class="font-mono text-xs text-base-content/40">${pad2(section.num)}</span>
          <span class="toc-beat-title line-clamp-2 font-display text-sm font-semibold text-base-content/80">${escapeHtml(
            section.title,
          )}</span>
        </span>
      </a>
    </div>`;
}

function buildTOC() {
  const html = sections.map(renderSection).join("");
  ["toc-desktop", "toc-mobile"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  });

  // Section 5 accordion toggle click
  document.querySelectorAll("[data-section-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const num = btn.getAttribute("data-section-toggle");
      const beatsEl = document.querySelector(`[data-section-beats="${num}"]`);
      if (beatsEl) {
        const isHidden = beatsEl.classList.contains("hidden");
        setSectionExpanded(num, isHidden);
      }
    });
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
  anchor.classList.toggle("bg-secondary/10", active);
  if (title) {
    title.classList.toggle("text-base-content/70", !active);
    title.classList.toggle("text-secondary", active);
    title.classList.toggle("font-bold", active);
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

  sections.forEach((s) => {
    if (s.beats.length > 1) {
      setSectionExpanded(s.num, s.num === activeSection);
    }
  });

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
  // A card back is open. Arrow keys belong to whatever is inside it — stepping
  // the deck underneath a modal is never what the key was meant for. Esc is the
  // dialog's own, handled by its `cancel` listener.
  if (document.querySelector("dialog[open]")) return;

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

  const directNotesBtn = document.getElementById("direct-notes-btn");
  if (directNotesBtn) {
    directNotesBtn.classList.toggle("btn-active", isNotes);
    directNotesBtn.classList.toggle("border-secondary", isNotes);
    directNotesBtn.classList.toggle("bg-secondary/15", isNotes);
    directNotesBtn.classList.toggle("text-secondary", isNotes);
    directNotesBtn.setAttribute("aria-pressed", isNotes ? "true" : "false");
  }

  const railNotesBtn = document.getElementById("rail-toggle-notes");
  if (railNotesBtn) {
    railNotesBtn.classList.toggle("btn-active", isNotes);
    railNotesBtn.classList.toggle("border-secondary", isNotes);
    railNotesBtn.classList.toggle("bg-secondary/15", isNotes);
    railNotesBtn.classList.toggle("text-secondary", isNotes);
  }
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
    <div class="flex items-center gap-1.5">
      <!-- Direct Speaker Notes Button for high discoverability -->
      <button
        type="button"
        id="direct-notes-btn"
        class="btn btn-ghost btn-sm gap-1.5 border border-base-300 transition-colors"
        aria-label="Toggle speaker notes"
        title="Toggle speaker notes (N)"
      >
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="hidden sm:inline text-xs font-medium">Notes</span>
        <kbd class="kbd kbd-xs font-mono">N</kbd>
        <span id="speaker-notes-check" class="text-secondary font-bold text-xs"></span>
      </button>

      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-square border border-base-300" aria-label="Presenter controls" title="Presenter controls">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h10M4 18h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
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
              <span id="presentation-mode-check" class="text-secondary font-bold"></span>
            </button>
          </li>
          <li>
            <button type="button" id="toggle-notes-btn" class="justify-between py-2">
              <span class="flex items-center gap-2">
                <span>Speaker notes</span>
                <kbd class="kbd kbd-xs">N</kbd>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>`;

  const presBtn = document.getElementById("toggle-presentation-btn");
  if (presBtn) {
    presBtn.addEventListener("click", () => {
      togglePresentationMode();
    });
  }

  const directBtn = document.getElementById("direct-notes-btn");
  if (directBtn) {
    directBtn.addEventListener("click", () => {
      toggleSpeakerNotes();
    });
  }

  const notesBtn = document.getElementById("toggle-notes-btn");
  if (notesBtn) {
    notesBtn.addEventListener("click", () => {
      toggleSpeakerNotes();
    });
  }

  const railBtn = document.getElementById("rail-toggle-notes");
  if (railBtn) {
    railBtn.addEventListener("click", () => {
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

// Global delegated clicks for slide-level notes triggers and rail
document.addEventListener("click", (e) => {
  if (
    e.target.closest("[data-notes-cue]") ||
    e.target.closest("[data-close-notes]") ||
    e.target.closest("#rail-toggle-notes")
  ) {
    toggleSpeakerNotes();
  }
});

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
 * The hub is named markdown.md, not a domain file: this beat's job is to
 * establish what a markdown file IS for a non-technical room. The named
 * example files live in the three buckets, where they are examples rather
 * than the subject.
 *
 * All four cards have a back. Hovering or focusing one reveals a "Show
 * details" cue; activating it Swivels the card open into a modal that holds
 * what would not fit on the front — a markdown cheat sheet for the hub, and
 * the anatomy of each role for the three buckets. Everything the ARGUMENT
 * needs is still on the front of the cards: the backs are depth for someone
 * reading the deck alone, never a place the spoken point hides.
 *
 * All strokes and fills inherit theme colours (currentColor / semantic
 * daisyUI utilities) so the diagram re-skins across themes.
 * ------------------------------------------------------------------ */

/**
 * The affordance that says a card has a back. Parked at opacity 0 and revealed
 * by hover or focus (see `.deck-flip-cue` in animation.css), except on touch
 * devices, where there is no hover to reveal it and it is always on.
 */
function flipCue(x, y) {
  return `
        <g class="deck-flip-cue" aria-hidden="true">
          <rect
            x="${x}"
            y="${y}"
            width="116"
            height="22"
            rx="11"
            class="fill-base-content/5 stroke-base-content/25"
            stroke-width="1"
          />
          <text x="${x + 13}" y="${y + 15}" class="fill-base-content/70 font-mono text-[10px] font-semibold">Show details</text>
          <path
            d="M ${x + 95} ${y + 7} L ${x + 100} ${y + 11} L ${x + 95} ${y + 15}"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-base-content/55"
          />
        </g>`;
}

function hubSpokeMarkup() {
  return `
    <svg
      viewBox="20 38 860 380"
      role="group"
      aria-label="What a markdown file is: one file at the centre, with three roles radiating out to Context, Knowledge, and Instruction. Each card opens a panel of detail."
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
          d="M 360 170 C 310 160, 290 128, 262 120"
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
          d="M 540 226 L 628 226"
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
          d="M 360 280 C 310 290, 290 324, 262 332"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </g>

      <!-- One Lift group for all four cards: choosing any one softens the other
           three. The <g role="button"> children are why the <svg> root is
           role="group" and not role="img" — interactive descendants of a
           role="img" are invisible to assistive tech. -->
      <g class="deck-lift-group">
        <!-- Central Hub: the markdown file -->
        <g data-rise data-hub>
          <g
            class="deck-lift cursor-pointer text-base-content"
            role="button"
            tabindex="0"
            aria-haspopup="dialog"
            data-card-open="markdown"
            aria-label="markdown.md — a plain text file on disk. Open the markdown cheat sheet."
          >
            <!-- File card shadow & body -->
            <rect
              x="360"
              y="95"
              width="180"
              height="270"
              rx="10"
              class="fill-base-100 stroke-base-300"
              stroke-width="1.5"
            />
            <!-- Header bar with filename -->
            <path d="M 360 128 L 540 128" class="stroke-base-200" stroke-width="1" />
            <circle cx="376" cy="112" r="3.5" class="fill-primary/60" />
            <circle cx="388" cy="112" r="3.5" class="fill-accent/60" />
            <text x="402" y="116" class="fill-base-content/80 font-mono text-[11px] font-semibold">markdown.md</text>

            <!-- Planted frontmatter block (deliberately unexplained — §6 pays it
                 off, so nothing here and nothing on this card's back names it) -->
            <rect
              x="372"
              y="138"
              width="156"
              height="66"
              rx="6"
              class="fill-base-200/70 stroke-base-content/15"
              stroke-width="1"
            />
            <text x="382" y="153" class="fill-base-content/40 font-mono text-[9px]">---</text>
            <text x="382" y="166" class="fill-base-content/75 font-mono text-[9.5px]">type: Playbook</text>
            <text x="382" y="179" class="fill-base-content/75 font-mono text-[9.5px]">stale_after: 2026-07-01</text>
            <text x="382" y="192" class="fill-base-content/40 font-mono text-[9px]">---</text>

            <!-- Document body lines -->
            <rect x="372" y="216" width="75" height="7" rx="3.5" class="fill-primary/40" />
            <rect x="372" y="232" width="132" height="5" rx="2.5" class="fill-base-content/20" />
            <rect x="372" y="244" width="144" height="5" rx="2.5" class="fill-base-content/20" />
            <rect x="372" y="256" width="115" height="5" rx="2.5" class="fill-base-content/20" />
            <rect x="372" y="268" width="136" height="5" rx="2.5" class="fill-base-content/15" />

            <!-- The thesis of the beat, so it is read and not skimmed past:
                 same weight as a card title, not a caption. -->
            <text
              x="450"
              y="308"
              text-anchor="middle"
              class="fill-base-content/80 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            >
              Plain text on disk
            </text>
            ${flipCue(392, 324)}
          </g>
        </g>

        <!-- The three buckets. The example filenames render by default and stay on
             screen: the deck is presented remotely by arrow key, so a bucket that
             only reveals its examples on hover is a bucket whose point never gets
             made. Hover Lifts one and softens the other three — emphasis only,
             never information. -->

        <!-- 1. Context (top-left) -->
        <g data-rise data-bucket="0">
          <g
            class="deck-lift cursor-pointer text-base-content"
            role="button"
            tabindex="0"
            aria-haspopup="dialog"
            data-card-open="context"
            aria-label="Context — ambient session rules, such as AGENTS.md and CLAUDE.md. Open details."
          >
            <rect
              x="30"
              y="50"
              width="230"
              height="140"
              rx="10"
              class="fill-base-200/50 stroke-base-300"
              stroke-width="1.5"
            />
            <text x="50" y="81" class="font-display text-[15px] font-bold fill-base-content">Context</text>
            <text x="50" y="100" class="fill-base-content/60 text-[12px]">Ambient session rules</text>
            <text x="50" y="123" class="font-mono text-[11.5px] font-semibold fill-primary">AGENTS.md · CLAUDE.md</text>
            <text x="50" y="140" class="fill-base-content/45 text-[11px]">Loaded into prompts at start</text>
            ${flipCue(50, 152)}
          </g>
        </g>

        <!-- 2. Knowledge (right) -->
        <g data-rise data-bucket="1">
          <g
            class="deck-lift cursor-pointer text-base-content"
            role="button"
            tabindex="0"
            aria-haspopup="dialog"
            data-card-open="knowledge"
            aria-label="Knowledge — institutional memory, such as a wiki or docs folder. Open details."
          >
            <rect
              x="640"
              y="156"
              width="230"
              height="140"
              rx="10"
              class="fill-base-200/50 stroke-base-300"
              stroke-width="1.5"
            />
            <text x="660" y="187" class="font-display text-[15px] font-bold fill-base-content">Knowledge</text>
            <text x="660" y="206" class="fill-base-content/60 text-[12px]">Institutional memory</text>
            <text x="660" y="229" class="font-mono text-[11.5px] font-semibold fill-accent">wiki · LLM-wiki · docs</text>
            <text x="660" y="246" class="fill-base-content/45 text-[11px]">Indexed, retrieved on demand</text>
            ${flipCue(660, 258)}
          </g>
        </g>

        <!-- 3. Instruction (bottom-left) -->
        <g data-rise data-bucket="2">
          <g
            class="deck-lift cursor-pointer text-base-content"
            role="button"
            tabindex="0"
            aria-haspopup="dialog"
            data-card-open="instruction"
            aria-label="Instruction — operational guidance, such as skills, prompts and commands. Open details."
          >
            <rect
              x="30"
              y="262"
              width="230"
              height="140"
              rx="10"
              class="fill-base-200/50 stroke-base-300"
              stroke-width="1.5"
            />
            <text x="50" y="293" class="font-display text-[15px] font-bold fill-base-content">Instruction</text>
            <text x="50" y="312" class="fill-base-content/60 text-[12px]">Operational guidance</text>
            <text x="50" y="335" class="font-mono text-[11.5px] font-semibold fill-base-content/90">skills · prompts · commands</text>
            <text x="50" y="352" class="fill-base-content/45 text-[11px]">Procedures executed step by step</text>
            ${flipCue(50, 364)}
          </g>
        </g>
      </g>
    </svg>`;
}

/* ------------------------------------------------------------------ *
 * S2.1 — the card backs
 *
 * Four modals, one per card, mounted once into <body> and opened by the
 * matching [data-card-open] group in the drawing. They are daisyUI `modal`
 * dialogs, so Esc, focus trapping and focus restoration are the platform's
 * job and not ours; what we add is the Swivel and a click-anywhere-outside
 * close (the `.modal-backdrop` button).
 *
 * Content rule: a back may deepen the front, never replace it. Nothing that
 * the spoken argument depends on lives in here, because nobody in a
 * screen-shared audience is going to open one.
 * ------------------------------------------------------------------ */

/** A source excerpt dressed as the file it came from — the two dots echo the hub card. */
function codePanel(filename, source) {
  return `
    <figure class="overflow-hidden rounded-box border border-base-300 bg-base-200/40">
      <figcaption class="flex items-center gap-2 border-b border-base-300 bg-base-200/70 px-3 py-2">
        <span class="size-2 rounded-full bg-primary/60"></span>
        <span class="size-2 rounded-full bg-accent/60"></span>
        <span class="font-mono text-[0.7rem] font-semibold text-base-content/70">${escapeHtml(filename)}</span>
      </figcaption>
      <pre class="overflow-x-auto px-4 py-3 font-mono text-[0.72rem] leading-relaxed text-base-content/80"><code>${escapeHtml(source)}</code></pre>
    </figure>`;
}

const backHeading = (text) =>
  `<h4 class="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-base-content/50">${text}</h4>`;

/**
 * The three role cards share a shape, deliberately: the audience should be able
 * to compare Context against Knowledge against Instruction line for line.
 */
function roleBackBody({ files, reads, costs, breaks, filename, source }) {
  return `
    <!-- min-w-0 on both columns is load-bearing, not tidiness: a grid item
         defaults to min-width:auto, so without it the code panel's intrinsic
         line width sets the column width and the whole modal scrolls sideways
         on a phone instead of the <pre> scrolling inside its own box. -->
    <div class="grid gap-8 md:grid-cols-2">
      <div class="min-w-0">
        ${backHeading("Typical files")}
        <ul class="mt-2 flex flex-wrap gap-1.5">
          ${files.map((f) => `<li class="badge badge-ghost badge-sm font-mono">${escapeHtml(f)}</li>`).join("")}
        </ul>

        ${`<div class="mt-6">${backHeading("When the agent reads it")}<p class="mt-2 text-sm leading-relaxed text-base-content/75">${reads}</p></div>`}
        ${`<div class="mt-5">${backHeading("What it costs")}<p class="mt-2 text-sm leading-relaxed text-base-content/75">${costs}</p></div>`}

        <div class="mt-6 rounded-box border border-warning/40 bg-warning/10 p-4">
          <p class="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-warning">Goes wrong when</p>
          <p class="mt-2 text-sm leading-relaxed text-base-content/80">${breaks}</p>
        </div>
      </div>

      <div class="min-w-0">
        ${backHeading("What it looks like")}
        <div class="mt-2">${codePanel(filename, source)}</div>
      </div>
    </div>`;
}

/**
 * The markdown cheat sheet — raw on the left, rendered on the right, one row
 * per construct. Frontmatter is deliberately absent: the block planted on the
 * hub card is §6's payoff, and explaining it here would spend it early.
 */
const MD_ROWS = [
  {
    raw: ["# Heading 1", "## Heading 2", "###### Heading 6"].join("\n"),
    rendered: `
      <p class="font-display text-xl font-bold leading-snug">Heading 1</p>
      <p class="font-display text-base font-bold leading-snug">Heading 2</p>
      <p class="font-display text-[0.7rem] font-bold uppercase leading-snug tracking-wide">Heading 6</p>`,
  },
  {
    raw: "**bold** and *italic* and `code` and ~~struck~~",
    rendered: `<p><strong>bold</strong> and <em>italic</em> and <code class="rounded bg-base-200 px-1 font-mono text-[0.8em]">code</code> and <s class="opacity-60">struck</s></p>`,
  },
  {
    raw: "[the handbook](https://example.com/handbook)",
    rendered: `<p><a class="link link-primary" href="https://example.com/handbook" rel="nofollow">the handbook</a></p>`,
  },
  {
    raw: ["- context", "- knowledge", "  - nested one level", "", "1. first", "2. second"].join(
      "\n",
    ),
    rendered: `
      <ul class="list-disc pl-5">
        <li>context</li>
        <li>knowledge<ul class="list-disc pl-5"><li>nested one level</li></ul></li>
      </ul>
      <ol class="mt-2 list-decimal pl-5"><li>first</li><li>second</li></ol>`,
  },
  {
    raw: ["- [x] reviewed", "- [ ] not yet"].join("\n"),
    rendered: `
      <ul class="space-y-1">
        <li class="flex items-center gap-2"><input type="checkbox" class="checkbox checkbox-xs" checked disabled /> reviewed</li>
        <li class="flex items-center gap-2"><input type="checkbox" class="checkbox checkbox-xs" disabled /> not yet</li>
      </ul>`,
  },
  {
    raw: "> Writing got cheap. Verifying did not.",
    rendered: `<blockquote class="border-l-4 border-base-300 pl-3 italic text-base-content/70">Writing got cheap. Verifying did not.</blockquote>`,
  },
  {
    raw: ["```bash", "npm run verify", "```"].join("\n"),
    rendered: `<pre class="overflow-x-auto rounded-box bg-base-200 px-3 py-2 font-mono text-[0.78rem]"><code>npm run verify</code></pre>`,
  },
  {
    raw: [
      "| File          | Owner |",
      "| ------------- | ----- |",
      "| onboarding.md | @mo   |",
    ].join("\n"),
    rendered: `
      <div class="overflow-x-auto">
        <table class="table table-xs">
          <thead><tr><th>File</th><th>Owner</th></tr></thead>
          <tbody><tr><td class="font-mono">onboarding.md</td><td>@mo</td></tr></tbody>
        </table>
      </div>`,
  },
];

function markdownCheatSheetMarkup() {
  const rows = MD_ROWS.map(
    (row) => `
      <div class="grid gap-2 border-t border-base-200 py-3 first:border-t-0 first:pt-0 sm:grid-cols-2 sm:gap-8">
        <pre class="min-w-0 whitespace-pre-wrap font-mono text-[0.74rem] leading-relaxed text-base-content/70"><code>${escapeHtml(row.raw)}</code></pre>
        <div class="min-w-0 text-sm leading-relaxed">${row.rendered}</div>
      </div>`,
  ).join("");

  return `
    <div
      class="sticky top-0 z-10 grid gap-2 border-b border-base-300 bg-base-100 pb-2 sm:grid-cols-2 sm:gap-8"
    >
      <p class="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-base-content/50">Raw markdown</p>
      <p class="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-base-content/50">How it renders</p>
    </div>
    <div class="mt-2">${rows}</div>
    <p class="mt-4 border-t border-base-200 pt-4 text-sm leading-relaxed text-base-content/60">
      That is close to all of it. Also worth knowing:
      <code class="rounded bg-base-200 px-1 font-mono text-[0.8em]">---</code> draws a horizontal rule,
      <code class="rounded bg-base-200 px-1 font-mono text-[0.8em]">![alt](path.png)</code> embeds an image,
      and raw HTML passes straight through untouched.
    </p>`;
}

/** The four backs, in the order a reader meets them. */
const CARD_BACKS = [
  {
    key: "markdown",
    eyebrow: "markdown.md",
    title: "Eight bits of syntax, and that is the whole format",
    lede: "No runtime, no schema, no database. A handful of characters that a person can read unaided and a parser agrees on — which is exactly why both humans and machines can use the same file.",
    body: markdownCheatSheetMarkup(),
  },
  {
    key: "context",
    eyebrow: "Context",
    title: "Standing rules, loaded before the question is asked",
    lede: "The house style an agent carries into every task in a project: how you build, what you never do, who to ask. It is read whether or not the current task needs it.",
    body: roleBackBody({
      files: ["AGENTS.md", "CLAUDE.md", "README.md", ".cursorrules"],
      reads:
        "At the start of every session, in full, before your first sentence. The agent does not choose to read it — it arrives already read.",
      costs:
        "It occupies the context window for the entire session. Every line you add is a line paid for on every single turn, so length is a budget and not a virtue.",
      breaks:
        "A rule changes and the file does not. Because it is loaded unconditionally, a stale line here is applied with total confidence to work it no longer describes.",
      filename: "AGENTS.md",
      source: [
        "# AGENTS.md",
        "",
        "## Commands",
        "",
        "- Build: `npm run build`",
        "- Verify: `npm run verify`",
        "",
        "## Ground rules",
        "",
        "1. Run verify before every commit.",
        "2. Tailwind v4 + daisyUI v5 only — no inline styles.",
        "3. One commit addresses exactly one scope.",
      ].join("\n"),
    }),
  },
  {
    key: "knowledge",
    eyebrow: "Knowledge",
    title: "Institutional memory, fetched only when a question reaches for it",
    lede: "What the organisation knows and would otherwise have to re-learn: playbooks, decisions, runbooks, post-mortems. Most of it is never opened in any given session.",
    body: roleBackBody({
      files: ["docs/handbook/*.md", "wiki/", "adr/*.md", "runbooks/"],
      reads:
        "On demand. It is indexed or searched, and the pages that match the question get pulled in — three files out of four hundred.",
      costs:
        "Almost nothing to store and very little to carry, because only the matched pages enter the window. The cost is not tokens; it is upkeep.",
      breaks:
        "It is retrieved without being re-verified. A playbook that expired two quarters ago answers just as fluently and just as confidently as a current one.",
      filename: "docs/handbook/onboarding.md",
      source: [
        "# Employee onboarding",
        "",
        "## First week",
        "",
        "1. Collect the laptop from IT on day one.",
        "2. Complete the security training module.",
        "3. Meet your onboarding buddy.",
        "",
        "## Accounts to request",
        "",
        "| System | Requested from |",
        "| ------ | -------------- |",
        "| Email  | IT Helpdesk    |",
      ].join("\n"),
    }),
  },
  {
    key: "instruction",
    eyebrow: "Instruction",
    title: "A procedure, written to be executed rather than read",
    lede: "The repeatable jobs: how a review is run, how a release note is drafted, how a page gets checked. Prose describes; an instruction is followed, step by step.",
    body: roleBackBody({
      files: [".claude/skills/*/SKILL.md", ".claude/commands/*.md", "prompts/"],
      reads:
        "When its trigger matches — you type the command, or its description fits the task well enough that the agent reaches for it unprompted.",
      costs:
        "Only loaded when invoked, so it is cheap to keep many. The real cost is that a vague trigger gets it loaded for the wrong task.",
      breaks:
        "The steps drift from reality. A wrong sentence in a wiki page misleads someone; a wrong step in an instruction gets run, on your repository, without being reread.",
      filename: ".claude/skills/review-docs/SKILL.md",
      source: [
        "---",
        "name: review-docs",
        "description: Check a handbook page against the code it describes.",
        "---",
        "",
        "1. Read the page and list every factual claim it makes.",
        "2. Find the source of truth for each claim in the repo.",
        "3. Report the mismatches. Do not edit the page.",
      ].join("\n"),
    }),
  },
];

/**
 * The modal shell. Full-bleed on phones (there is no "outside the card" to tap
 * on a 390px screen, so the close control has to be a real 44px target); a
 * centred panel at roughly three-quarters of the viewport everywhere else.
 */
function cardBackMarkup(back) {
  return `
    <dialog id="card-back-${back.key}" class="modal" aria-labelledby="card-back-${back.key}-title">
      <div
        class="deck-swivel modal-box relative flex h-[100dvh] max-h-none w-full max-w-none flex-col rounded-none p-5 sm:h-auto sm:max-h-[82vh] sm:w-[86vw] sm:max-w-5xl sm:rounded-box sm:p-8"
      >
        <button
          type="button"
          data-card-close
          class="btn btn-circle btn-ghost absolute right-3 top-3 z-20 size-11 sm:size-9"
          aria-label="Close"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <header class="shrink-0 pr-14">
          <p class="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-primary">
            ${escapeHtml(back.eyebrow)}
          </p>
          <h3
            id="card-back-${back.key}-title"
            class="mt-2 font-display text-xl font-bold tracking-tight md:text-2xl"
          >
            ${back.title}
          </h3>
          <p class="mt-3 max-w-3xl text-sm font-light leading-relaxed text-base-content/70">
            ${back.lede}
          </p>
        </header>

        <div class="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">${back.body}</div>
      </div>

      <div class="modal-backdrop">
        <button type="button" data-card-close aria-label="Close">close</button>
      </div>
    </dialog>`;
}

/** Mounted once, into <body>, so a dialog is never trapped inside a transformed ancestor. */
function mountCardBacks() {
  if (document.querySelector("[data-card-backs]")) return;
  const host = document.createElement("div");
  host.setAttribute("data-card-backs", "");
  host.innerHTML = CARD_BACKS.map(cardBackMarkup).join("");
  document.body.append(host);

  host.querySelectorAll("dialog").forEach((dlg) => {
    // Esc would close instantly and skip the Swivel; take it over.
    dlg.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeCardBack(dlg);
    });
  });
}

/**
 * Swivel: the card turns to show its back, arriving from far enough away that
 * the turn reads as a zoom in as well as a rotation. Mirrors --deck-swivel.
 */
const SWIVEL = 520;

function openCardBack(key) {
  const dlg = document.getElementById(`card-back-${key}`);
  if (!dlg || dlg.open) return;
  const box = dlg.querySelector(".deck-swivel");
  box.classList.remove("is-opening", "is-closing");
  dlg.showModal();
  if (reduceMotion) return;
  void box.offsetWidth; // restart the animation if the same card is reopened
  box.classList.add("is-opening");
}

function closeCardBack(dlg) {
  if (!dlg || !dlg.open) return;
  const box = dlg.querySelector(".deck-swivel");
  box.classList.remove("is-opening");
  if (reduceMotion) {
    dlg.close();
    return;
  }
  box.classList.add("is-closing");
  const done = () => {
    box.classList.remove("is-closing");
    dlg.close();
  };
  box.addEventListener("animationend", done, { once: true });
  // animationend does not fire if the tab is backgrounded mid-turn; the dialog
  // must not be left open and half-turned.
  setTimeout(() => {
    if (box.classList.contains("is-closing")) done();
  }, SWIVEL + 120);
}

document.addEventListener("click", (e) => {
  const closer = e.target.closest?.("[data-card-close]");
  if (closer) {
    closeCardBack(closer.closest("dialog"));
    return;
  }
  const opener = e.target.closest?.("[data-card-open]");
  if (opener) openCardBack(opener.dataset.cardOpen);
});

// <g role="button"> gets no keyboard activation for free.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const opener = e.target.closest?.("[data-card-open]");
  if (!opener) return;
  e.preventDefault();
  openCardBack(opener.dataset.cardOpen);
});

/** Spokes are armed the moment they exist, so they are parked undrawn on arrival. */
function mountHubSpokes() {
  document.querySelectorAll("[data-hub-spoke]").forEach((host) => {
    host.innerHTML = hubSpokeMarkup();
    if (!reduceMotion) host.querySelectorAll("[data-draw]").forEach(armDraw);
  });
}

mountHubSpokes();
mountCardBacks();

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
          class="fill-secondary/10"
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
        class="text-secondary"
      />

      <!-- Direct labels at the curve ends, each with a short line-key. The key
           carries the series colour; the label text stays in base-content, which
           keeps it legible in every theme. -->
      <g data-rise data-chart-key>
        <line x1="748" y1="78" x2="764" y2="78" class="stroke-secondary" stroke-width="3" stroke-linecap="round" />
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
        <line x1="408" y1="200" x2="478" y2="200" class="stroke-secondary/40" stroke-width="1" stroke-dasharray="2 3" />
        <circle data-settle-ring cx="400" cy="200" r="7" fill="none" class="stroke-secondary" stroke-width="2" />
        <circle cx="400" cy="200" r="5.5" class="fill-secondary stroke-base-100" stroke-width="2" />
        <rect x="478" y="185" width="176" height="30" rx="8" class="fill-base-100 stroke-secondary/40" stroke-width="1" />
        <text x="566" y="204" text-anchor="middle" class="fill-secondary font-mono text-[11px] font-semibold tracking-wide">
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
      <g data-venn-actor="machine" class="text-primary">
        <circle
          data-venn-step="0"
          cx="290" cy="280" r="160"
          stroke-width="1.5"
          class="venn-circle fill-primary/15 stroke-primary/40"
        ></circle>
        <g data-venn-step="1">
          <text x="225" y="185" text-anchor="middle"
            class="fill-primary font-mono text-[11px] uppercase tracking-[0.3em]">machine</text>
          <text x="215" y="255" text-anchor="middle" class="fill-base-content/70 text-[13px]">reference resolves</text>
          <text x="215" y="285" text-anchor="middle" class="fill-base-content/70 text-[13px]">file exists</text>
          <text x="215" y="315" text-anchor="middle" class="fill-base-content/70 text-[13px]">template structure holds</text>
        </g>
      </g>
      <g data-venn-actor="human" class="text-secondary">
        <circle
          data-venn-step="2"
          cx="535" cy="280" r="235"
          stroke-width="1.5"
          class="venn-circle mix-blend-multiply fill-secondary/20 stroke-secondary/50 text-secondary"
        ></circle>
        <g data-venn-step="3">
          <text x="610" y="150" text-anchor="middle"
            class="fill-secondary font-mono text-[11px] uppercase tracking-[0.3em]">human</text>
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
              <tr class="${activeField === "stale_after" ? "bg-warning/10 ring-1 ring-warning" : ""}"><td class="pr-3 text-right text-base-content/30 select-none">8</td><td><span class="text-primary font-medium">stale_after</span>: <span class="text-warning font-bold">2026-07-01T00:00:00Z</span></td></tr>
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

  // Section 6: Show supplier annotations all at once, indented to the right of the frontmatter block.
  // Each annotation states who supplies the field, not what the field is.
  if (mode === "section-6") {
    const fields = [
      {
        id: "type",
        code: `<div><span class="text-base-content/50 uppercase tracking-wider text-[10px]">type:</span> <span class="font-semibold text-base-content ml-1">Playbook</span></div>`,
        supplierBadge: `<span class="badge badge-primary badge-sm font-mono uppercase tracking-wider text-primary-content">Machine</span>`,
        statement: "A machine can parse this, not judge it.",
        detail: "The author selects the taxonomy; the harness verifies syntax schema.",
      },
      {
        id: "sources",
        code: `<div>
          <span class="text-base-content/50 uppercase tracking-wider text-[10px]">sources:</span>
          <div class="ml-2 pl-2 border-l border-base-300 space-y-0.5 mt-0.5 text-[11px]">
            <div><span class="text-base-content/50">resource:</span> <span class="text-primary font-medium break-all">https://intranet.example.com/people-ops/handbook#onboarding</span></div>
            <div><span class="text-base-content/50">id:</span> <span class="text-base-content/80">people-ops-handbook</span></div>
          </div>
        </div>`,
        supplierBadge: `<span class="badge badge-secondary badge-sm font-mono uppercase tracking-wider text-secondary-content">Human</span>`,
        statement: "A human establishes the authority.",
        detail:
          "A machine checks the URI is well-formed; only a human verifies the handbook is authentic and binding.",
      },
      {
        id: "stale_after",
        code: `<div><span class="text-base-content/50 uppercase tracking-wider text-[10px]">stale_after:</span> <span class="font-bold text-secondary ml-1">2026-07-01T00:00:00Z</span></div>`,
        supplierBadge: `<span class="badge badge-secondary badge-sm font-mono uppercase tracking-wider text-secondary-content">Human</span>`,
        statement: "A human sets the review budget.",
        detail:
          "A machine can compare timestamps; only a human owner can determine when ground truth expires.",
      },
      {
        id: "generated",
        code: `<div>
          <span class="text-base-content/50 uppercase tracking-wider text-[10px]">generated:</span>
          <div class="ml-2 pl-2 border-l border-base-300 space-y-0.5 mt-0.5 text-[11px] text-base-content/80">
            <div><span class="text-base-content/50">by:</span> <span class="text-accent font-medium">ai:claude-opus-5</span></div>
            <div><span class="text-base-content/50">at:</span> <span>2026-01-20T09:00:00Z</span></div>
          </div>
        </div>`,
        supplierBadge: `<span class="badge badge-accent badge-sm font-mono uppercase tracking-wider text-accent-content">AI / Machine</span>`,
        statement: "A machine stamps model & timestamp.",
        detail: "Automated generation logs the model identifier and ISO execution time.",
      },
      {
        id: "verified",
        code: `<div>
          <span class="text-base-content/50 uppercase tracking-wider text-[10px]">verified:</span>
          <div class="ml-2 pl-2 border-l border-base-300 space-y-0.5 mt-0.5 text-[11px] text-base-content/80">
            <div><span class="text-base-content/50">by:</span> <span class="text-secondary font-bold">human:m.okonkwo</span></div>
            <div><span class="text-base-content/50">at:</span> <span>2026-01-22T11:30:00Z</span></div>
          </div>
        </div>`,
        supplierBadge: `<span class="badge badge-secondary badge-sm font-mono uppercase tracking-wider text-secondary-content">Human</span>`,
        statement: "A human signs this with their identity.",
        detail:
          "Twin structure to generated: but signed by an accountable person who attested the facts.",
      },
    ];

    const rendered = fields
      .map(
        (f) => `
      <div
        data-fm-field="${f.id}"
        tabindex="0"
        role="button"
        class="fm-field rounded-xl border border-base-300/80 bg-base-100 p-4 transition-all duration-200 hover:border-secondary/60 hover:shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-3 items-center focus:outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer"
      >
        <!-- Field frontmatter block -->
        <div class="lg:col-span-6 font-mono text-xs leading-relaxed">
          ${f.code}
        </div>
        <!-- Indented Supplier annotation -->
        <div class="lg:col-span-6 lg:border-l-2 lg:border-base-200 lg:pl-5 flex flex-col justify-center">
          <div class="fm-annotation flex items-center gap-2 mb-1" data-rise="right">
            ${f.supplierBadge}
            <span class="text-xs sm:text-sm font-sans font-bold text-base-content">${f.statement}</span>
          </div>
          <p class="text-[11px] sm:text-xs font-sans text-base-content/70 leading-normal">${f.detail}</p>
        </div>
      </div>`,
      )
      .join("");

    return `
      <div class="frontmatter-card rounded-2xl border border-base-300 bg-base-200/50 p-4 sm:p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between border-b border-base-300/70 pb-3">
          <div class="flex items-center gap-2">
            <span class="inline-block h-2.5 w-2.5 rounded-full bg-secondary/80"></span>
            <span class="font-mono text-xs font-semibold text-base-content/80">onboarding.md</span>
            <span class="font-mono text-[10px] text-base-content/40">frontmatter fields &amp; suppliers</span>
          </div>
          <span class="badge badge-ghost badge-xs font-mono text-[10px] tracking-wider text-base-content/60">OKF v0.2</span>
        </div>
        <div class="space-y-3 deck-lift-group">
          ${rendered}
        </div>
      </div>`;
  }

  // Section 7: Operator Governance
  return `
    <div class="frontmatter-card rounded-2xl border border-base-300 bg-base-200/50 p-5 md:p-6 shadow-sm font-mono text-xs md:text-sm">
      <div class="mb-4 flex items-center justify-between border-b border-base-300/70 pb-3">
        <div class="flex items-center gap-2">
          <span class="inline-block h-2.5 w-2.5 rounded-full bg-secondary/80"></span>
          <span class="font-mono text-xs font-semibold text-base-content/80">onboarding.md</span>
          <span class="font-mono text-[10px] text-base-content/40">frontmatter</span>
        </div>
        <span class="badge badge-ghost badge-xs font-mono text-[10px] tracking-wider text-base-content/60">OKF v0.2</span>
      </div>
      <div class="space-y-2.5">
        <div class="rounded-lg border border-base-300/60 bg-base-100/70 p-2.5">
          <span class="text-base-content/50 uppercase tracking-wider text-[10px]">type:</span> <span class="font-semibold text-base-content ml-2">Playbook</span>
        </div>
        <div class="rounded-lg border border-base-300/60 bg-base-100/70 p-2.5">
          <span class="text-base-content/50 uppercase tracking-wider text-[10px]">sources:</span>
          <div class="ml-3 pl-3 border-l-2 border-base-300/80 mt-1 text-xs">
            <span class="text-base-content/50">resource:</span> <span class="text-primary break-all">https://intranet.example.com/people-ops/handbook#onboarding</span>
          </div>
        </div>
        <div class="rounded-lg border-2 border-secondary bg-secondary/10 p-3.5 shadow-sm ring-1 ring-secondary/30">
          <div class="flex items-center justify-between">
            <span class="text-secondary uppercase tracking-wider text-[10px] font-bold">stale_after:</span>
            <span class="badge badge-secondary badge-xs font-mono text-secondary-content">The Signal</span>
          </div>
          <div class="mt-1.5 font-bold text-secondary text-sm md:text-base">
            2026-07-01T00:00:00Z
          </div>
        </div>
        <div class="rounded-lg border border-base-300/60 bg-base-100/70 p-2.5">
          <span class="text-base-content/50 uppercase tracking-wider text-[10px]">generated:</span> <span class="text-base-content/70 ml-2">ai:claude-opus-5</span>
        </div>
        <div class="rounded-lg border border-base-300/60 bg-base-100/70 p-2.5">
          <span class="text-base-content/50 uppercase tracking-wider text-[10px]">verified:</span> <span class="text-secondary font-bold ml-2">human:m.okonkwo</span>
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
          f.classList.remove("ring-2", "ring-secondary", "bg-secondary/5");
        }
      });
    }
    fmField.classList.toggle("ring-2");
    fmField.classList.toggle("ring-secondary");
    fmField.classList.toggle("bg-secondary/5");
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
