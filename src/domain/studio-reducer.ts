import { cloneWorkflow, type FieldDefinition, type StepDefinition, type WorkflowDefinition } from "./model";

export type StudioCommand =
  | { type: "rename-workflow"; name: string }
  | { type: "add-step"; step: StepDefinition }
  | { type: "rename-step"; stepId: string; title: string }
  | { type: "remove-step"; stepId: string }
  | { type: "add-field"; stepId: string; field: FieldDefinition }
  | { type: "update-field"; fieldId: string; patch: Partial<Omit<FieldDefinition, "id">> }
  | { type: "remove-field"; fieldId: string }
  | { type: "move-field"; fieldId: string; direction: -1 | 1 };

function touch(workflow: WorkflowDefinition, updatedAt: string): WorkflowDefinition {
  return { ...workflow, updatedAt };
}

export function applyStudioCommand(workflow: WorkflowDefinition, command: StudioCommand, updatedAt: string): WorkflowDefinition {
  const next = cloneWorkflow(workflow);
  if (command.type === "rename-workflow") return touch({ ...next, name: command.name }, updatedAt);
  if (command.type === "add-step") return touch({ ...next, steps: [...next.steps, command.step] }, updatedAt);
  if (command.type === "rename-step") {
    next.steps = next.steps.map((step) => step.id === command.stepId ? { ...step, title: command.title } : step);
    return touch(next, updatedAt);
  }
  if (command.type === "remove-step") return touch({ ...next, steps: next.steps.filter((step) => step.id !== command.stepId) }, updatedAt);
  if (command.type === "add-field") {
    next.steps = next.steps.map((step) => step.id === command.stepId ? { ...step, fields: [...step.fields, command.field] } : step);
    return touch(next, updatedAt);
  }
  if (command.type === "update-field") {
    next.steps = next.steps.map((step) => ({ ...step, fields: step.fields.map((field) => field.id === command.fieldId ? { ...field, ...command.patch } : field) }));
    return touch(next, updatedAt);
  }
  if (command.type === "remove-field") {
    const removed = next.steps.flatMap((step) => step.fields).find((field) => field.id === command.fieldId);
    next.steps = next.steps.map((step) => ({
      ...step,
      fields: step.fields
        .filter((field) => field.id !== command.fieldId)
        .map((field) => field.visibility?.fieldKey === removed?.key ? { ...field, visibility: undefined } : field),
    }));
    return touch(next, updatedAt);
  }

  next.steps = next.steps.map((step) => {
    const index = step.fields.findIndex((field) => field.id === command.fieldId);
    if (index < 0) return step;
    const destination = Math.max(0, Math.min(step.fields.length - 1, index + command.direction));
    if (destination === index) return step;
    const fields = [...step.fields];
    const [field] = fields.splice(index, 1);
    if (!field) return step;
    fields.splice(destination, 0, field);
    return { ...step, fields };
  });
  return touch(next, updatedAt);
}
