import type { FieldDefinition, StepDefinition, WorkflowDefinition } from "./model";

export interface MergeConflict {
  path: string;
  base: unknown;
  local: unknown;
  remote: unknown;
}

export interface MergeResult {
  workflow: WorkflowDefinition;
  conflicts: MergeConflict[];
}

function equal(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function mergeValue<T>(path: string, base: T, local: T, remote: T, conflicts: MergeConflict[]): T {
  if (equal(local, remote)) return local;
  if (equal(local, base)) return remote;
  if (equal(remote, base)) return local;
  conflicts.push({ path, base, local, remote });
  return local;
}

function mergeKeyed<T extends { id: string }>(path: string, base: T[], local: T[], remote: T[], mergeItem: (path: string, base: T, local: T, remote: T) => T, conflicts: MergeConflict[]): T[] {
  const baseMap = new Map(base.map((item) => [item.id, item]));
  const localMap = new Map(local.map((item) => [item.id, item]));
  const remoteMap = new Map(remote.map((item) => [item.id, item]));
  const orderedIds = [...new Set([...local.map((item) => item.id), ...remote.map((item) => item.id)])];
  const result: T[] = [];

  for (const id of orderedIds) {
    const baseItem = baseMap.get(id);
    const localItem = localMap.get(id);
    const remoteItem = remoteMap.get(id);
    const itemPath = `${path}.${id}`;
    if (!baseItem) {
      if (localItem && remoteItem) result.push(equal(localItem, remoteItem) ? localItem : mergeItem(itemPath, localItem, localItem, remoteItem));
      else if (localItem ?? remoteItem) result.push((localItem ?? remoteItem) as T);
      continue;
    }
    if (!localItem && !remoteItem) continue;
    if (!localItem || !remoteItem) {
      const survivor = (localItem ?? remoteItem) as T;
      if (!equal(survivor, baseItem)) conflicts.push({ path: itemPath, base: baseItem, local: localItem, remote: remoteItem });
      else continue;
      result.push(survivor);
      continue;
    }
    result.push(mergeItem(itemPath, baseItem, localItem, remoteItem));
  }
  return result;
}

export function mergeWorkflow(base: WorkflowDefinition, local: WorkflowDefinition, remote: WorkflowDefinition): MergeResult {
  const conflicts: MergeConflict[] = [];
  const mergeField = (path: string, baseField: FieldDefinition, localField: FieldDefinition, remoteField: FieldDefinition): FieldDefinition => ({
    id: localField.id,
    key: mergeValue(`${path}.key`, baseField.key, localField.key, remoteField.key, conflicts),
    label: mergeValue(`${path}.label`, baseField.label, localField.label, remoteField.label, conflicts),
    kind: mergeValue(`${path}.kind`, baseField.kind, localField.kind, remoteField.kind, conflicts),
    required: mergeValue(`${path}.required`, baseField.required, localField.required, remoteField.required, conflicts),
    placeholder: mergeValue(`${path}.placeholder`, baseField.placeholder, localField.placeholder, remoteField.placeholder, conflicts),
    options: mergeValue(`${path}.options`, baseField.options, localField.options, remoteField.options, conflicts),
    visibility: mergeValue(`${path}.visibility`, baseField.visibility, localField.visibility, remoteField.visibility, conflicts),
    validation: mergeValue(`${path}.validation`, baseField.validation, localField.validation, remoteField.validation, conflicts),
  });
  const mergeStep = (path: string, baseStep: StepDefinition, localStep: StepDefinition, remoteStep: StepDefinition): StepDefinition => ({
    id: localStep.id,
    title: mergeValue(`${path}.title`, baseStep.title, localStep.title, remoteStep.title, conflicts),
    description: mergeValue(`${path}.description`, baseStep.description, localStep.description, remoteStep.description, conflicts),
    fields: mergeKeyed(`${path}.fields`, baseStep.fields, localStep.fields, remoteStep.fields, mergeField, conflicts),
  });
  return {
    workflow: {
      schemaVersion: 2,
      id: local.id,
      name: mergeValue("name", base.name, local.name, remote.name, conflicts),
      revision: remote.revision,
      updatedAt: local.updatedAt > remote.updatedAt ? local.updatedAt : remote.updatedAt,
      steps: mergeKeyed("steps", base.steps, local.steps, remote.steps, mergeStep, conflicts),
    },
    conflicts,
  };
}
