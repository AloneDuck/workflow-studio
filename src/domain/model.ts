export type FieldKind = "text" | "email" | "number" | "select" | "checkbox" | "date";
export type WorkflowValue = string | number | boolean | null;

export interface FieldOption {
  label: string;
  value: string;
}

export interface VisibilityRule {
  fieldKey: string;
  operator: "equals" | "not-equals" | "contains" | "truthy";
  value?: WorkflowValue;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface FieldDefinition {
  id: string;
  key: string;
  label: string;
  kind: FieldKind;
  required: boolean;
  placeholder?: string;
  options?: FieldOption[];
  visibility?: VisibilityRule;
  validation?: FieldValidation;
}

export interface StepDefinition {
  id: string;
  title: string;
  description?: string;
  fields: FieldDefinition[];
}

export interface WorkflowDefinition {
  schemaVersion: 2;
  id: string;
  name: string;
  revision: string;
  updatedAt: string;
  steps: StepDefinition[];
}

export type SubmissionValues = Record<string, WorkflowValue>;

export function cloneWorkflow(workflow: WorkflowDefinition): WorkflowDefinition {
  return structuredClone(workflow);
}

export function listFields(workflow: WorkflowDefinition): FieldDefinition[] {
  return workflow.steps.flatMap((step) => step.fields);
}

export function findField(workflow: WorkflowDefinition, fieldId: string): FieldDefinition | undefined {
  return listFields(workflow).find((field) => field.id === fieldId);
}
