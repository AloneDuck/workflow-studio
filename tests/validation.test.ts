import { describe, expect, it } from "vitest";
import { sampleWorkflow } from "@/data/sample-workflow";
import { validateDefinition, validateSubmission } from "@/domain/validation";

describe("workflow validation", () => {
  it("accepts the production fixture", () => {
    expect(validateDefinition(sampleWorkflow)).toEqual([]);
  });

  it("reports duplicate keys and underspecified selects", () => {
    const workflow = structuredClone(sampleWorkflow);
    workflow.steps[0]!.fields[1]!.key = "company_name";
    workflow.steps[0]!.fields[2]!.options = [{ label: "Only", value: "only" }];
    expect(validateDefinition(workflow).map((issue) => issue.code)).toEqual(expect.arrayContaining(["duplicate", "options"]));
  });

  it("validates visible required values and ignores hidden ones", () => {
    const hidden = validateSubmission(sampleWorkflow, { company_name: "A", contact_email: "invalid", company_size: "small", regulated: false });
    expect(hidden.license_number).toBeUndefined();
    expect(hidden.company_name).toContain("Use at least 2 characters.");
    expect(hidden.contact_email).toContain("Enter a valid email address.");
    const visible = validateSubmission(sampleWorkflow, { company_name: "Acme", contact_email: "ops@acme.test", company_size: "small", regulated: true });
    expect(visible.license_number).toContain("This field is required.");
  });
});
