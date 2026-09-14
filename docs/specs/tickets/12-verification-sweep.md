# 12: Theme, motion and accessibility verification sweep

**What to build:** Confidence that the claims the deck makes about itself are true. The deck is checked end to end across the curated theme set, with motion disabled, and through every navigation path — and any theme-specific failure is fixed rather than noted.

This is the ticket where the Venn's blend-mode overlap either survives dark themes or falls back to its hatched treatment. It is deliberately last, because it can only be done once every section exists.

**Blocked by:** 03, 04, 05, 06, 07, 08, 09, 10, 11.

**Status:** ready-for-agent

- [ ] Every beat renders legibly across the curated theme set, covering at least one light and one dark theme
- [ ] The curated shortlist is what the theme picker offers; remaining themes stay reachable but are recorded as unverified
- [ ] The Venn's overlap is distinguishable in both light and dark themes, or the hatched fallback is applied and verified
- [ ] With reduced-motion preferred, every section is complete and legible, and no content is reachable only via animation
- [ ] Decorative overlays are hidden from assistive technology
- [ ] Arrow-key stepping traverses exactly eleven beats in order
- [ ] Presentation mode and speaker-notes state survive a reload
- [ ] Hash deep-links resolve to the correct beat
- [ ] The root landing page's link reaches the deck
- [ ] The production build succeeds and emits the page
- [ ] Archgate ADR checks, eslint and prettier all pass across the whole deck
