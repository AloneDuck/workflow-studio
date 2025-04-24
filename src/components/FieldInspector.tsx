import type { FieldDefinition } from "@/domain/model";

export function FieldInspector({ field, onChange }: { field?: FieldDefinition; onChange: (patch: Partial<Omit<FieldDefinition, "id">>) => void }) {
  if (!field) return <section className="inspector empty-inspector"><div className="section-heading"><p>Inspector</p><h2>Nothing selected</h2></div><span>Select a field to edit its contract.</span></section>;
  return (
    <section className="inspector" aria-labelledby="inspector-title">
      <div className="section-heading"><p>Inspector</p><h2 id="inspector-title">Field settings</h2></div>
      <label><span>Label</span><input value={field.label} onChange={(event) => onChange({ label: event.target.value })} /></label>
      <label><span>Field key</span><input value={field.key} onChange={(event) => onChange({ key: event.target.value.toLowerCase().replace(/\W+/g, "_") })} /></label>
      <label><span>Placeholder</span><input value={field.placeholder ?? ""} onChange={(event) => onChange({ placeholder: event.target.value })} /></label>
      <label><span>Type</span><select value={field.kind} onChange={(event) => onChange({ kind: event.target.value as FieldDefinition["kind"] })}><option value="text">Text</option><option value="email">Email</option><option value="number">Number</option><option value="select">Select</option><option value="checkbox">Checkbox</option><option value="date">Date</option></select></label>
      <label className="toggle-row"><span><strong>Required field</strong><small>Block submission when empty</small></span><input type="checkbox" checked={field.required} onChange={(event) => onChange({ required: event.target.checked })} /></label>
      <div className="inspector-note"><strong>Stable ID</strong><code>{field.id}</code><span>IDs survive labels, ordering, and schema migrations.</span></div>
    </section>
  );
}
