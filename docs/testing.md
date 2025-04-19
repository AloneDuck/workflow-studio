# Testing strategy

Pure domain tests cover validation, visibility, history, commands, migration, merging, and autosave races. Component tests verify accessible names and observable editing behavior. Playwright covers the complete editor in Chromium and runs Axe against the rendered workspace.

Fixtures use stable IDs and timestamps. Tests do not rely on animation timing, network access, or randomly generated values.
