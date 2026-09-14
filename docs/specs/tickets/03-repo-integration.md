# 03: Point the repository at the new deck

**What to build:** Anyone landing on the repository — a visitor on the root page, a contributor reading the conventions, or an agent reading the directory map — finds this deck and finds it under its correct name. Right now all three still point at a deck that was deleted.

**Blocked by:** 01 (the deck must exist to be linked).

**Status:** ready-for-agent

- [ ] The root landing page links to the new deck and the link resolves
- [ ] The root landing page's label and description match the new talk's title
- [ ] The repository's agent-instructions directory table names the new deck and no longer names the deleted one
- [ ] The documented commit-scope list names the new deck and no longer names the deleted one
- [ ] The documented commit-scope list includes the specs directory, since specs now live there
- [ ] No commit-hook code change is made — scope is already derived generically from the top-level directory name
- [ ] Each change is committed under its own scope, since these files span several
