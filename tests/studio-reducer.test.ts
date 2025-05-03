import { describe, expect, it } from "vitest";
import { sampleWorkflow } from "@/data/sample-workflow";
import { applyStudioCommand } from "@/domain/studio-reducer";

const timestamp = "2026-08-20T10:00:00.000Z";

describe("studio commands", () => {
  it("adds and reorders fields without mutating the input", () => {
    const field = { id: "field-region", key: "region", label: "Region", kind: "text" as const, required: false };
    const added = applyStudioCommand(sampleWorkflow, { type: "add-field", stepId: "step-company", field }, timestamp);
    const moved = applyStudioCommand(added, { type: "move-field", fieldId: field.id, direction: -1 }, timestamp);
    expect(sampleWorkflow.steps[0]!.fields).toHaveLength(3);
    expect(moved.steps[0]!.fields.map((item) => item.id)).toEqual(["field-company", "field-email", "field-region", "field-size"]);
  });

  it("clears visibility rules when their dependency is removed", () => {
    const next = applyStudioCommand(sampleWorkflow, { type: "remove-field", fieldId: "field-regulated" }, timestamp);
    expect(next.steps[1]!.fields[0]!.visibility).toBeUndefined();
  });
});
