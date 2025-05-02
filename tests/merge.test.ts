import { describe, expect, it } from "vitest";
import { sampleWorkflow } from "@/data/sample-workflow";
import { mergeWorkflow } from "@/domain/merge";

describe("three-way workflow merge", () => {
  it("combines independent field edits", () => {
    const local = structuredClone(sampleWorkflow);
    const remote = structuredClone(sampleWorkflow);
    local.steps[0]!.fields[0]!.label = "Legal company name";
    remote.steps[0]!.fields[1]!.required = false;
    remote.revision = "rev-18";
    const result = mergeWorkflow(sampleWorkflow, local, remote);
    expect(result.conflicts).toEqual([]);
    expect(result.workflow.steps[0]!.fields[0]!.label).toBe("Legal company name");
    expect(result.workflow.steps[0]!.fields[1]!.required).toBe(false);
    expect(result.workflow.revision).toBe("rev-18");
  });

  it("keeps local divergent values and reports their paths", () => {
    const local = structuredClone(sampleWorkflow);
    const remote = structuredClone(sampleWorkflow);
    local.steps[0]!.fields[1]!.label = "Billing email";
    remote.steps[0]!.fields[1]!.label = "Primary email";
    const result = mergeWorkflow(sampleWorkflow, local, remote);
    expect(result.workflow.steps[0]!.fields[1]!.label).toBe("Billing email");
    expect(result.conflicts[0]?.path).toBe("steps.step-company.fields.field-email.label");
  });
});
