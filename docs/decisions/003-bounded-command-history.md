# bounded command history

Status: accepted

Keep undo and redo deterministic, bounded, and separate from server revisions.

## Consequences

- The constraint is verified by runtime or test contracts.
- Exceptions require an explicit review and migration note.
- The public behavior remains observable without repository-specific tooling.
