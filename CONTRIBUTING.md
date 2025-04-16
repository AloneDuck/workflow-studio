# Contributing

Keep changes at the narrowest boundary that owns the behavior. Domain changes require unit tests, interaction changes require Testing Library coverage, and navigation or focus changes require Playwright coverage.

Before opening a change, run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`. Run `npm run test:e2e` whenever focus order, labels, keyboard shortcuts, or autosave feedback changes.

Commit subjects use `type(scope): outcome`. A subject must describe the observable contract introduced by its diff.
