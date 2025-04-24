import { useEffect, useMemo, useState } from "react";
import { AutosaveIndicator } from "./AutosaveIndicator";
import { ConflictPanel } from "./ConflictPanel";
import { FieldInspector } from "./FieldInspector";
import { FieldPalette } from "./FieldPalette";
import { StepCanvas } from "./StepCanvas";
import { WorkflowPreview } from "./WorkflowPreview";
import { contractCount } from "@/domain/contracts";
import { commitHistory, createHistory, redoHistory, undoHistory } from "@/domain/history";
import type { AutosaveSnapshot } from "@/domain/autosave";
import type { FieldDefinition, FieldKind, WorkflowDefinition } from "@/domain/model";
import type { MergeConflict } from "@/domain/merge";
import { applyStudioCommand, type StudioCommand } from "@/domain/studio-reducer";
import { validateDefinition } from "@/domain/validation";

function newField(kind: FieldKind, sequence: number): FieldDefinition {
  const label = kind === "checkbox" ? "Confirmation" : `New ${kind} field`;
  return {
    id: `field-${kind}-${sequence}`,
    key: `${kind}_${sequence}`,
    label,
    kind,
    required: false,
    placeholder: kind === "checkbox" || kind === "select" ? undefined : "Enter a value",
    options: kind === "select" ? [{ label: "First option", value: "first" }, { label: "Second option", value: "second" }] : undefined,
  };
}

export function WorkflowStudio({ initialWorkflow }: { initialWorkflow: WorkflowDefinition }) {
  const [history, setHistory] = useState(() => createHistory(initialWorkflow, 75));
  const [activeStepId, setActiveStepId] = useState(initialWorkflow.steps[0]?.id ?? "");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(initialWorkflow.steps[0]?.fields[0]?.id ?? null);
  const [saveStatus, setSaveStatus] = useState<AutosaveSnapshot["status"]>("idle");
  const [conflicts, setConflicts] = useState<MergeConflict[]>([]);
  const workflow = history.present;
  const selectedField = workflow.steps.flatMap((step) => step.fields).find((field) => field.id === selectedFieldId);
  const issues = useMemo(() => validateDefinition(workflow), [workflow]);

  function execute(command: StudioCommand) {
    const next = applyStudioCommand(workflow, command, new Date().toISOString());
    setSaveStatus("scheduled");
    setHistory((current) => commitHistory(current, next));
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      localStorage.setItem("workflow-studio:draft", JSON.stringify(workflow));
      setSaveStatus("saved");
    }, 650);
    return () => window.clearTimeout(handle);
  }, [workflow]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      setSaveStatus("scheduled");
      setHistory((current) => event.shiftKey ? redoHistory(current) : undoHistory(current));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function addField(kind: FieldKind) {
    const total = workflow.steps.flatMap((step) => step.fields).length;
    const field = newField(kind, total + 1);
    execute({ type: "add-field", stepId: activeStepId, field });
    setSelectedFieldId(field.id);
  }

  function addStep() {
    const sequence = workflow.steps.length + 1;
    const step = { id: `step-${sequence}`, title: `Step ${sequence}`, description: "Describe the outcome for this step.", fields: [] };
    execute({ type: "add-step", step });
    setActiveStepId(step.id);
    setSelectedFieldId(null);
  }

  return (
    <main className="studio-shell">
      <header className="topbar">
        <a className="brand" href="#studio" aria-label="Workflow Studio home"><span aria-hidden="true">W</span><strong>Workflow Studio</strong></a>
        <label className="workflow-name"><span className="sr-only">Workflow name</span><input value={workflow.name} onChange={(event) => execute({ type: "rename-workflow", name: event.target.value })} /></label>
        <div className="topbar-actions">
          <AutosaveIndicator status={conflicts.length ? "conflict" : saveStatus} />
          <button type="button" onClick={() => { setSaveStatus("scheduled"); setHistory((current) => undoHistory(current)); }} disabled={!history.past.length} aria-label="Undo last change">↶</button>
          <button type="button" onClick={() => { setSaveStatus("scheduled"); setHistory((current) => redoHistory(current)); }} disabled={!history.future.length} aria-label="Redo last change">↷</button>
          <button type="button" onClick={() => setConflicts([{ path: "steps.step-company.fields.field-email.label", base: "Contact email", local: "Billing email", remote: "Primary email" }])}>Review conflict</button>
          <button type="button" className="primary-button">Publish workflow</button>
        </div>
      </header>

      <div className="studio-layout" id="studio">
        <aside className="left-rail" aria-label="Field palette and contract summary"><FieldPalette onAdd={addField} /><div className="contract-card"><span>Executable contracts</span><strong>{contractCount()}</strong><small>Field, save, merge, migration, and accessibility rules</small></div></aside>
        <StepCanvas steps={workflow.steps} activeStepId={activeStepId} selectedFieldId={selectedFieldId} onSelectStep={(stepId) => { setActiveStepId(stepId); setSelectedFieldId(null); }} onSelectField={setSelectedFieldId} onMoveField={(fieldId, direction) => execute({ type: "move-field", fieldId, direction })} onRemoveField={(fieldId) => { execute({ type: "remove-field", fieldId }); if (selectedFieldId === fieldId) setSelectedFieldId(null); }} onAddStep={addStep} />
        <aside className="right-rail" aria-label="Field inspector and workflow preview"><FieldInspector field={selectedField} onChange={(patch) => selectedFieldId && execute({ type: "update-field", fieldId: selectedFieldId, patch })} /><WorkflowPreview workflow={workflow} /></aside>
      </div>

      <footer className="statusbar"><span>{workflow.steps.length} steps · {workflow.steps.flatMap((step) => step.fields).length} fields</span><span className={issues.length ? "issue-count" : "valid-count"}>{issues.length ? `${issues.length} schema issue${issues.length === 1 ? "" : "s"}` : "Schema valid"}</span><span>Revision {workflow.revision}</span></footer>
      <ConflictPanel conflicts={conflicts} onResolve={() => { setConflicts([]); setSaveStatus("scheduled"); }} />
    </main>
  );
}
