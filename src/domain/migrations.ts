import type { FieldDefinition, WorkflowDefinition } from "./model";

interface LegacyDraft {
  schemaVersion: 1;
  id: string;
  name: string;
  revision?: string;
  updatedAt?: string;
  fields: FieldDefinition[];
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function migrateDraft(input: unknown): WorkflowDefinition {
  if (!record(input)) throw new Error("Draft must be an object.");
  if (input.schemaVersion === 2) {
    if (typeof input.id !== "string" || typeof input.name !== "string" || typeof input.revision !== "string" || typeof input.updatedAt !== "string" || !Array.isArray(input.steps)) throw new Error("Version 2 draft is malformed.");
    return structuredClone(input) as unknown as WorkflowDefinition;
  }
  if (input.schemaVersion === 1) {
    const legacy = input as unknown as LegacyDraft;
    if (typeof legacy.id !== "string" || typeof legacy.name !== "string" || !Array.isArray(legacy.fields)) throw new Error("Version 1 draft is malformed.");
    return {
      schemaVersion: 2,
      id: legacy.id,
      name: legacy.name,
      revision: legacy.revision ?? "legacy-0",
      updatedAt: legacy.updatedAt ?? "2025-01-01T00:00:00.000Z",
      steps: [{ id: "step-imported", title: "Imported fields", fields: structuredClone(legacy.fields) }],
    };
  }
  throw new Error(`Unsupported draft version ${String(input.schemaVersion)}.`);
}
