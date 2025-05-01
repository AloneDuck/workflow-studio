import { describe, expect, it } from "vitest";
import { evaluateVisibility, visibilityCycles, visibleFields } from "@/domain/conditions";
import { sampleWorkflow } from "@/data/sample-workflow";

describe("visibility contracts", () => {
  it("reveals dependent fields only when their rule matches", () => {
    expect(evaluateVisibility({ fieldKey: "regulated", operator: "truthy" }, { regulated: false })).toBe(false);
    expect(visibleFields(sampleWorkflow, { regulated: false }).map((field) => field.key)).not.toContain("license_number");
    expect(visibleFields(sampleWorkflow, { regulated: true }).map((field) => field.key)).toContain("license_number");
  });

  it("reports cyclic dependencies by stable field key", () => {
    const workflow = structuredClone(sampleWorkflow);
    workflow.steps[0]!.fields[0]!.visibility = { fieldKey: "contact_email", operator: "truthy" };
    workflow.steps[0]!.fields[1]!.visibility = { fieldKey: "company_name", operator: "truthy" };
    expect(visibilityCycles(workflow)).toEqual([["company_name", "contact_email", "company_name"]]);
  });
});
