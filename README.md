# Workflow Studio

Workflow Studio is a schema-driven editor for building multi-step operational forms. It treats autosave, undo/redo, validation, accessibility, and concurrent edits as domain contracts rather than UI afterthoughts.

## Capabilities

- Typed workflow and field schemas with visibility rules.
- Deterministic validation for definitions and submissions.
- Bounded undo/redo history and keyboard shortcuts.
- Debounced autosave with revision-aware conflict states.
- Three-way merging for steps and fields.
- Versioned local draft migration.
- Accessible editor, live preview, browser tests, and Axe checks.

## Commands

```sh
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

The sample app stores drafts locally. The domain contracts are transport-agnostic so a production API can replace the adapter without coupling the editor to a backend vendor.
