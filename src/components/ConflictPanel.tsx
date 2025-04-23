import type { MergeConflict } from "@/domain/merge";

export function ConflictPanel({ conflicts, onResolve }: { conflicts: MergeConflict[]; onResolve: (choice: "local" | "remote") => void }) {
  if (conflicts.length === 0) return null;
  return (
    <section className="conflict-panel" role="alertdialog" aria-modal="false" aria-labelledby="conflict-title">
      <div><p>Concurrent update</p><h2 id="conflict-title">{conflicts.length} field-level conflict{conflicts.length === 1 ? "" : "s"}</h2><span>Automatic saving is paused until the base revision is reconciled.</span></div>
      <ul>{conflicts.map((conflict) => <li key={conflict.path}><code>{conflict.path}</code><span>Local and remote values changed.</span></li>)}</ul>
      <div className="conflict-actions"><button type="button" onClick={() => onResolve("remote")}>Accept remote</button><button type="button" className="primary-button" onClick={() => onResolve("local")}>Keep local</button></div>
    </section>
  );
}
