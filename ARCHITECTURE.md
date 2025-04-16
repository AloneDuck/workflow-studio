# Architecture

The repository is split into four boundaries:

1. `domain` owns schemas, commands, history, merge rules, migrations, and autosave coordination.
2. `components` renders the editor and translates user intent into domain commands.
3. `data` contains executable contract registries and a deterministic sample workflow.
4. `tests` and `e2e` verify pure behavior, integration seams, keyboard workflows, and accessibility.

React never owns merge semantics. Storage adapters never own validation. Every boundary accepts serializable values, which makes conflicts reproducible and keeps browser behavior testable.

## Consistency model

The server revision is an opaque monotonic token. Saves include the last accepted revision. A mismatch becomes an explicit conflict result; the client never silently overwrites remote data. The merge engine compares base, local, and remote values by stable IDs and reports every unresolved path.
