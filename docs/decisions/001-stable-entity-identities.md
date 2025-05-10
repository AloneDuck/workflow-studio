# stable entity identities

Status: accepted

Use persistent step and field IDs so ordering and labels can evolve independently.

## Consequences

- The constraint is verified by runtime or test contracts.
- Exceptions require an explicit review and migration note.
- The public behavior remains observable without repository-specific tooling.
