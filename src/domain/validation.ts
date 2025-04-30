import { evaluateVisibility, visibilityCycles } from "./conditions";
import { listFields, type FieldDefinition, type SubmissionValues, type WorkflowDefinition, type WorkflowValue } from "./model";

export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
}

function duplicateValues(values: string[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return duplicates;
}

export function validateDefinition(workflow: WorkflowDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!workflow.name.trim()) issues.push({ path: "name", code: "required", message: "Workflow name is required." });
  if (workflow.steps.length === 0) issues.push({ path: "steps", code: "required", message: "At least one step is required." });

  const duplicateStepIds = duplicateValues(workflow.steps.map((step) => step.id));
  const fields = listFields(workflow);
  const duplicateFieldIds = duplicateValues(fields.map((field) => field.id));
  const duplicateKeys = duplicateValues(fields.map((field) => field.key));
  const knownKeys = new Set(fields.map((field) => field.key));

  workflow.steps.forEach((step, stepIndex) => {
    if (duplicateStepIds.has(step.id)) issues.push({ path: `steps.${stepIndex}.id`, code: "duplicate", message: `Step ID ${step.id} is duplicated.` });
    if (!step.title.trim()) issues.push({ path: `steps.${stepIndex}.title`, code: "required", message: "Step title is required." });
    step.fields.forEach((field, fieldIndex) => {
      const path = `steps.${stepIndex}.fields.${fieldIndex}`;
      if (duplicateFieldIds.has(field.id)) issues.push({ path: `${path}.id`, code: "duplicate", message: `Field ID ${field.id} is duplicated.` });
      if (duplicateKeys.has(field.key)) issues.push({ path: `${path}.key`, code: "duplicate", message: `Field key ${field.key} is duplicated.` });
      if (!/^[a-z][a-z0-9_]*$/.test(field.key)) issues.push({ path: `${path}.key`, code: "format", message: "Field keys use lower snake case." });
      if (!field.label.trim()) issues.push({ path: `${path}.label`, code: "required", message: "Field label is required." });
      if (field.kind === "select" && (field.options?.length ?? 0) < 2) issues.push({ path: `${path}.options`, code: "options", message: "Select fields require at least two options." });
      if (field.visibility && !knownKeys.has(field.visibility.fieldKey)) issues.push({ path: `${path}.visibility`, code: "reference", message: `Visibility references unknown key ${field.visibility.fieldKey}.` });
      if (field.validation?.minLength !== undefined && field.validation?.maxLength !== undefined && field.validation.minLength > field.validation.maxLength) issues.push({ path: `${path}.validation`, code: "range", message: "Minimum length cannot exceed maximum length." });
      if (field.validation?.pattern) {
        try { new RegExp(field.validation.pattern); } catch { issues.push({ path: `${path}.validation.pattern`, code: "pattern", message: "Validation pattern is not a valid regular expression." }); }
      }
    });
  });

  for (const cycle of visibilityCycles(workflow)) issues.push({ path: "steps", code: "cycle", message: `Visibility cycle: ${cycle.join(" -> ")}.` });
  return issues;
}

function empty(value: WorkflowValue | undefined): boolean {
  return value === undefined || value === null || value === "";
}

function validateField(field: FieldDefinition, value: WorkflowValue | undefined): string[] {
  const errors: string[] = [];
  if (field.required && empty(value)) return ["This field is required."];
  if (empty(value)) return errors;
  if (field.kind === "email" && (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) errors.push("Enter a valid email address.");
  if (field.kind === "number" && typeof value !== "number") errors.push("Enter a number.");
  if (typeof value === "string") {
    if (field.validation?.minLength !== undefined && value.length < field.validation.minLength) errors.push(`Use at least ${field.validation.minLength} characters.`);
    if (field.validation?.maxLength !== undefined && value.length > field.validation.maxLength) errors.push(`Use no more than ${field.validation.maxLength} characters.`);
    if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) errors.push("Value does not match the required format.");
  }
  if (typeof value === "number") {
    if (field.validation?.min !== undefined && value < field.validation.min) errors.push(`Use a value of at least ${field.validation.min}.`);
    if (field.validation?.max !== undefined && value > field.validation.max) errors.push(`Use a value no greater than ${field.validation.max}.`);
  }
  return errors;
}

export function validateSubmission(workflow: WorkflowDefinition, values: SubmissionValues): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const field of listFields(workflow)) {
    if (!evaluateVisibility(field.visibility, values)) continue;
    const errors = validateField(field, values[field.key]);
    if (errors.length) result[field.key] = errors;
  }
  return result;
}
