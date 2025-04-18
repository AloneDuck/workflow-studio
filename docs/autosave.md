# Autosave contract

Edits enter a scheduled state before persistence begins. New edits replace the pending snapshot, but never mutate a request already in flight. A successful save advances the base revision. A revision mismatch moves the editor to `conflict` and blocks automatic retries until a person resolves it.

Transient failures use bounded retry delays. Disposal cancels timers and ignores late results so navigation cannot update an unmounted editor.
