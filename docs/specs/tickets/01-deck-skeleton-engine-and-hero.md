# 01: Deck skeleton, scroll engine, and hero

**What to build:** A new presentation page at `maintain-markdown-for-ai-knowledge-bases/` that a presenter can open, arrow through, theme, and deep-link into. It opens on a finished hero carrying the talk's title and thesis; the remaining eight sections exist as empty placeholder beats. This is the walking skeleton every other ticket builds inside.

The page is modelled on the sibling `ai-token-economy-101` deck: a tall scroll container of full-height beat sections, one `IntersectionObserver` that reveals a beat when it enters and fires an activation hook when it becomes dominant, a table-of-contents rail with a mobile drawer built from a section model, a progress bar, arrow-key stepping between beats, hash deep-linking, and a theme picker with a pre-paint guard against flash-of-unstyled-content.

This ticket also establishes the deck's colour language, which every later section depends on: `primary` means human, `neutral`/`base-content` means machine and is deliberately desaturated, `accent` means AI. `secondary` is not used for any of the three actors.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] The page is reachable in the dev server and is emitted by the production build at its own path
- [ ] The hero renders the title "Maintain markdown for AI knowledge bases", a subtitle stating that the work moved from writing to verifying, and the presenter name at small size
- [ ] The hero background is a backdrop built from semantic theme tokens; no image is selected, generated, or copied from the sibling deck
- [ ] The section hosting the hero backdrop carries an explicit stacking context so the decorative layer cannot escape it
- [ ] Nine sections exist as beats, with section 5 present as three separate beats — eleven beats total
- [ ] Arrow keys step forward and backward through all eleven beats in order, and are ignored while focus is in a form field
- [ ] Each beat reveals on entering the viewport and fires an activation hook when it becomes the dominant beat
- [ ] The table of contents lists all nine sections and jumps to any beat
- [ ] The progress bar reflects position across the eleven beats
- [ ] The URL hash updates as beats change, and loading a hash lands on the right beat
- [ ] The theme picker changes theme, persists the choice, shares its storage key with the sibling deck, and applies the saved theme before first paint
- [ ] No CSS scroll-snap is used anywhere
- [ ] The colour language is applied consistently and documented in the page for later sections to follow
- [ ] Styling uses daisyUI semantic tokens only; the archgate ADR checks, eslint, and prettier all pass
