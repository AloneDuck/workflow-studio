import { useMemo, useState } from "react";
import { visibleFields } from "@/domain/conditions";
import type { FieldDefinition, SubmissionValues, WorkflowDefinition, WorkflowValue } from "@/domain/model";
import { validateSubmission } from "@/domain/validation";

function PreviewControl({ field, value, onChange }: { field: FieldDefinition; value: WorkflowValue | undefined; onChange: (value: WorkflowValue) => void }) {
  const id = `preview-${field.id}`;
  if (field.kind === "checkbox") return <label className="preview-checkbox" htmlFor={id}><input id={id} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />{field.label}</label>;
  if (field.kind === "select") return <label htmlFor={id}><span>{field.label}{field.required && " *"}</span><select id={id} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)}><option value="">Choose an option</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
  return <label htmlFor={id}><span>{field.label}{field.required && " *"}</span><input id={id} type={field.kind} value={typeof value === "string" || typeof value === "number" ? value : ""} placeholder={field.placeholder} onChange={(event) => onChange(field.kind === "number" ? (event.target.value === "" ? null : event.target.valueAsNumber) : event.target.value)} /></label>;
}

export function WorkflowPreview({ workflow }: { workflow: WorkflowDefinition }) {
  const [values, setValues] = useState<SubmissionValues>({});
  const [submitted, setSubmitted] = useState(false);
  const fields = useMemo(() => visibleFields(workflow, values), [values, workflow]);
  const errors = submitted ? validateSubmission(workflow, values) : {};
  return (
    <section className="preview" aria-labelledby="preview-title">
      <div className="section-heading"><p>Live preview</p><h2 id="preview-title">{workflow.name}</h2></div>
      <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} noValidate>
        {fields.map((field) => <div key={field.id} className="preview-control"><PreviewControl field={field} value={values[field.key]} onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))} />{errors[field.key]?.map((error) => <small key={error} className="field-error" role="alert">{error}</small>)}</div>)}
        <button type="submit" className="primary-button">Validate preview</button>
      </form>
    </section>
  );
}
