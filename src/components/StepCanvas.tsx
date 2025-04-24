import type { StepDefinition } from "@/domain/model";

interface StepCanvasProps {
  steps: StepDefinition[];
  activeStepId: string;
  selectedFieldId: string | null;
  onSelectStep: (stepId: string) => void;
  onSelectField: (fieldId: string) => void;
  onMoveField: (fieldId: string, direction: -1 | 1) => void;
  onRemoveField: (fieldId: string) => void;
  onAddStep: () => void;
}

export function StepCanvas({ steps, activeStepId, selectedFieldId, onSelectStep, onSelectField, onMoveField, onRemoveField, onAddStep }: StepCanvasProps) {
  const active = steps.find((step) => step.id === activeStepId) ?? steps[0];
  return (
    <section className="canvas" aria-labelledby="canvas-title">
      <div className="step-tabs" role="group" aria-label="Workflow steps">
        {steps.map((step, index) => <button key={step.id} type="button" aria-pressed={step.id === active?.id} onClick={() => onSelectStep(step.id)}><span>{index + 1}</span>{step.title}</button>)}
        <button type="button" className="add-step" onClick={onAddStep}>+ Add step</button>
      </div>
      {active ? (
        <div className="canvas-sheet">
          <header><p>Step {steps.indexOf(active) + 1} of {steps.length}</p><h1 id="canvas-title">{active.title}</h1><span>{active.description}</span></header>
          <div className="field-stack">
            {active.fields.map((field, index) => (
              <article key={field.id} className={`field-card ${selectedFieldId === field.id ? "field-card--selected" : ""}`}>
                <button type="button" className="field-main" aria-pressed={selectedFieldId === field.id} onClick={() => onSelectField(field.id)}>
                  <span className="drag-handle" aria-hidden="true">⠿</span>
                  <span><strong>{field.label}</strong><small>{field.key} · {field.kind}{field.required ? " · required" : ""}</small></span>
                </button>
                <div className="field-actions">
                  <button type="button" onClick={() => onMoveField(field.id, -1)} disabled={index === 0} aria-label={`Move ${field.label} up`}>↑</button>
                  <button type="button" onClick={() => onMoveField(field.id, 1)} disabled={index === active.fields.length - 1} aria-label={`Move ${field.label} down`}>↓</button>
                  <button type="button" className="danger" onClick={() => onRemoveField(field.id)} aria-label={`Remove ${field.label}`}>×</button>
                </div>
              </article>
            ))}
            {active.fields.length === 0 && <div className="empty-canvas"><strong>This step has no fields</strong><span>Add a component from the palette to begin.</span></div>}
          </div>
        </div>
      ) : <div className="empty-canvas"><strong>Add the first step</strong><span>Workflows need at least one step.</span></div>}
    </section>
  );
}
