import type { WorkflowDefinition } from "@/domain/model";

export const sampleWorkflow: WorkflowDefinition = {
  schemaVersion: 2,
  id: "workflow-onboarding",
  name: "Partner onboarding",
  revision: "rev-17",
  updatedAt: "2026-08-18T09:30:00.000Z",
  steps: [
    {
      id: "step-company",
      title: "Company profile",
      description: "Collect the details needed for verification.",
      fields: [
        { id: "field-company", key: "company_name", label: "Company name", kind: "text", required: true, placeholder: "Northstar Labs", validation: { minLength: 2, maxLength: 80 } },
        { id: "field-email", key: "contact_email", label: "Contact email", kind: "email", required: true, placeholder: "ops@example.com" },
        { id: "field-size", key: "company_size", label: "Company size", kind: "select", required: true, options: [{ label: "1–20", value: "small" }, { label: "21–100", value: "medium" }, { label: "101+", value: "large" }] },
      ],
    },
    {
      id: "step-controls",
      title: "Risk controls",
      description: "Show additional review questions only when needed.",
      fields: [
        { id: "field-regulated", key: "regulated", label: "Operates in a regulated industry", kind: "checkbox", required: false },
        { id: "field-license", key: "license_number", label: "License number", kind: "text", required: true, visibility: { fieldKey: "regulated", operator: "truthy" }, validation: { minLength: 5 } },
      ],
    },
  ],
};
