import { describe, expect, it, vi } from "vitest";
import { AutosaveCoordinator, RevisionConflictError, type TimerScheduler } from "@/domain/autosave";
import { sampleWorkflow } from "@/data/sample-workflow";

class ManualScheduler implements TimerScheduler {
  tasks = new Map<number, () => void>();
  sequence = 0;
  set(callback: () => void): number { const id = ++this.sequence; this.tasks.set(id, callback); return id; }
  clear(handle: unknown): void { this.tasks.delete(handle as number); }
  runNext(): void { const entry = this.tasks.entries().next().value as [number, () => void] | undefined; if (!entry) return; this.tasks.delete(entry[0]); entry[1](); }
}

describe("autosave coordinator", () => {
  it("coalesces queued drafts and advances the accepted revision", async () => {
    const scheduler = new ManualScheduler();
    const save = vi.fn().mockResolvedValue({ revision: "rev-18", savedAt: "2026-08-20T10:00:00.000Z" });
    const coordinator = new AutosaveCoordinator("rev-17", save, 10, [], scheduler);
    const snapshots: string[] = [];
    coordinator.subscribe((snapshot) => snapshots.push(`${snapshot.status}:${snapshot.revision}`));
    coordinator.queue(sampleWorkflow);
    coordinator.queue({ ...sampleWorkflow, name: "Latest draft" });
    scheduler.runNext();
    await vi.waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save.mock.calls[0]?.[0].name).toBe("Latest draft");
    expect(snapshots).toContain("saved:rev-18");
    coordinator.dispose();
  });

  it("surfaces revision conflicts without retrying", async () => {
    const remote = { ...sampleWorkflow, revision: "rev-19" };
    const coordinator = new AutosaveCoordinator("rev-17", async () => { throw new RevisionConflictError(remote); });
    let status = "";
    coordinator.subscribe((snapshot) => { status = snapshot.status; });
    coordinator.queue(sampleWorkflow);
    await coordinator.flush();
    expect(status).toBe("conflict");
    coordinator.dispose();
  });
});
