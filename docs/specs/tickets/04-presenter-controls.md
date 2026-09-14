# 04: Presentation mode and speaker notes

**What to build:** Two controls the presenter uses live, and a reader uses afterwards. Pressing `p` strips the deck to content — table of contents, theme picker and navigation chrome disappear, the progress bar stays — so a screen-shared frame shows the talk rather than the furniture. A separate toggle reveals per-section speaker notes, off by default, so the link shared after the talk carries the argument rather than nine diagrams without narration.

Both are one presenter-controls surface, and both survive a reload so a refresh mid-talk does not reset the setup.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] Pressing `p` toggles presentation mode, hiding the table of contents, theme picker and navigation chrome while keeping the progress bar
- [ ] A control toggles per-section speaker notes, which are hidden by default
- [ ] Notes render per section and do not disturb the section's layout when hidden
- [ ] Both states persist across a reload
- [ ] Keyboard handling does not fire while focus is in a form field
- [ ] Arrow-key beat stepping works identically in both modes
- [ ] Notes are legible in every verified theme
