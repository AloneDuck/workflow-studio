import type { FieldDefinition, SubmissionValues, VisibilityRule, WorkflowDefinition, WorkflowValue } from "./model";

function contains(actual: WorkflowValue, expected: WorkflowValue): boolean {
  if (typeof actual === "string" && typeof expected === "string") return actual.includes(expected);
  return false;
}

export function evaluateVisibility(rule: VisibilityRule | undefined, values: SubmissionValues): boolean {
  if (!rule) return true;
  const actual = values[rule.fieldKey] ?? null;
  if (rule.operator === "truthy") return Boolean(actual);
  if (rule.operator === "equals") return actual === (rule.value ?? null);
  if (rule.operator === "not-equals") return actual !== (rule.value ?? null);
  return contains(actual, rule.value ?? null);
}

export function visibleFields(workflow: WorkflowDefinition, values: SubmissionValues): FieldDefinition[] {
  return workflow.steps.flatMap((step) => step.fields.filter((field) => evaluateVisibility(field.visibility, values)));
}

export function visibilityCycles(workflow: WorkflowDefinition): string[][] {
  const fields = workflow.steps.flatMap((step) => step.fields);
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const graph = new Map<string, string[]>();
  for (const field of fields) {
    const dependency = field.visibility?.fieldKey;
    graph.set(field.key, dependency && byKey.has(dependency) ? [dependency] : []);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const cycles: string[][] = [];

  function visit(key: string) {
    if (visiting.has(key)) {
      const start = stack.indexOf(key);
      cycles.push([...stack.slice(start), key]);
      return;
    }
    if (visited.has(key)) return;
    visiting.add(key);
    stack.push(key);
    for (const dependency of graph.get(key) ?? []) visit(dependency);
    stack.pop();
    visiting.delete(key);
    visited.add(key);
  }

  for (const key of graph.keys()) visit(key);
  return cycles;
}
