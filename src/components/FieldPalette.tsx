import type { FieldKind } from "@/domain/model";

const fieldKinds: Array<{ kind: FieldKind; label: string; detail: string; symbol: string }> = [
  { kind: "text", label: "Text", detail: "Short written answer", symbol: "Aa" },
  { kind: "email", label: "Email", detail: "Validated address", symbol: "@" },
  { kind: "number", label: "Number", detail: "Numeric input", symbol: "#" },
  { kind: "select", label: "Select", detail: "Choose one option", symbol: "⌄" },
  { kind: "checkbox", label: "Checkbox", detail: "True or false", symbol: "✓" },
  { kind: "date", label: "Date", detail: "Calendar value", symbol: "◫" },
];

export function FieldPalette({ onAdd }: { onAdd: (kind: FieldKind) => void }) {
  return (
    <section className="palette" aria-labelledby="palette-title">
      <div className="section-heading"><p>Components</p><h2 id="palette-title">Add a field</h2></div>
      <div className="palette-grid">
        {fieldKinds.map(({ kind, label, detail, symbol }) => (
          <button key={kind} type="button" className="palette-item" onClick={() => onAdd(kind)} aria-label={`Add ${label.toLowerCase()} field`}>
            <span className="palette-symbol" aria-hidden="true">{symbol}</span>
            <span><strong>{label}</strong><small>{detail}</small></span>
          </button>
        ))}
      </div>
    </section>
  );
}
