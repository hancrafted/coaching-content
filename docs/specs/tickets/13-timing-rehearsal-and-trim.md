# 13: Timing rehearsal and trim pass

**What to build:** Proof that the talk fits. The presenter runs the deck end to end against a clock, with the live demo, and trims until it lands inside the budget.

The spec records that fitting 15–18 minutes of narration across nine sections at this density is an untested premise. This ticket tests it, and acts on the result.

**Blocked by:** 12, 02 (the demo must be rehearsable).

**Status:** needs-human (requires the presenter)

- [ ] The full deck is run end to end against a clock, including the live demo
- [ ] Total runtime lands inside 20 minutes target, 25 minutes hard cap
- [ ] Narration is 15–18 minutes and the demo is 4–5 minutes
- [ ] If over budget, section 2 is compressed first, as the designated first candidate
- [ ] If section 6 runs long on its own, it is split
- [ ] Three premises are revisited against the rehearsal: that the room is AI-junior enough for section 2 to level rather than bore, that three passes over one artefact is legible at screen-share scale, and that the density fits the budget
- [ ] The rescue terminal in section 8 is confirmed usable as a fallback by rehearsing the demo failing
