# Conflict resolution

Workflow merges are keyed by stable step and field IDs. A value changed on one side is accepted automatically. Equal local and remote changes are accepted once. Divergent changes at the same path remain local in the preview and are returned as explicit conflict records.

Deleting an entity while the other side edits it is always a conflict. The UI can then keep the local entity, accept the remote state, or ask for a field-level decision.
