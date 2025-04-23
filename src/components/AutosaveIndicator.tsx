import type { AutosaveSnapshot } from "@/domain/autosave";

const labels: Record<AutosaveSnapshot["status"], string> = {
  idle: "No pending changes",
  scheduled: "Changes queued",
  saving: "Saving changes",
  saved: "All changes saved",
  conflict: "Resolve save conflict",
  error: "Save needs attention",
};

export function AutosaveIndicator({ status }: { status: AutosaveSnapshot["status"] }) {
  return <span className={`save-state save-state--${status}`} role="status" aria-live="polite"><span aria-hidden="true" />{labels[status]}</span>;
}
