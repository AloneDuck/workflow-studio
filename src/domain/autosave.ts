import { cloneWorkflow, type WorkflowDefinition } from "./model";

export interface SaveResult {
  revision: string;
  savedAt: string;
}

export interface AutosaveSnapshot {
  status: "idle" | "scheduled" | "saving" | "saved" | "conflict" | "error";
  revision: string;
  savedAt?: string;
  error?: string;
  remote?: WorkflowDefinition;
}

export interface TimerScheduler {
  set(callback: () => void, delay: number): unknown;
  clear(handle: unknown): void;
}

const browserScheduler: TimerScheduler = {
  set: (callback, delay) => window.setTimeout(callback, delay),
  clear: (handle) => window.clearTimeout(handle as number),
};

export class RevisionConflictError extends Error {
  constructor(public readonly remote: WorkflowDefinition) {
    super("The workflow changed on the server.");
    this.name = "RevisionConflictError";
  }
}

export class AutosaveCoordinator {
  private timer: unknown;
  private pending?: WorkflowDefinition;
  private inFlight = false;
  private disposed = false;
  private retries = 0;
  private listeners = new Set<(snapshot: AutosaveSnapshot) => void>();
  private snapshot: AutosaveSnapshot;

  constructor(
    initialRevision: string,
    private readonly save: (workflow: WorkflowDefinition, baseRevision: string) => Promise<SaveResult>,
    private readonly delay = 650,
    private readonly retryDelays = [500, 1_500],
    private readonly scheduler: TimerScheduler = browserScheduler,
  ) {
    this.snapshot = { status: "idle", revision: initialRevision };
  }

  subscribe(listener: (snapshot: AutosaveSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }

  queue(workflow: WorkflowDefinition): void {
    if (this.disposed) return;
    this.pending = cloneWorkflow(workflow);
    this.retries = 0;
    this.schedule(this.delay);
  }

  async flush(): Promise<void> {
    if (this.disposed || this.inFlight || !this.pending) return;
    if (this.timer !== undefined) this.scheduler.clear(this.timer);
    this.timer = undefined;
    const workflow = this.pending;
    this.pending = undefined;
    this.inFlight = true;
    this.publish({ ...this.snapshot, status: "saving", error: undefined });
    try {
      const result = await this.save(workflow, this.snapshot.revision);
      if (this.disposed) return;
      this.retries = 0;
      this.publish({ status: "saved", revision: result.revision, savedAt: result.savedAt });
    } catch (error) {
      if (this.disposed) return;
      if (error instanceof RevisionConflictError) {
        this.pending = undefined;
        this.publish({ ...this.snapshot, status: "conflict", remote: error.remote, error: error.message });
      } else if (this.retries < this.retryDelays.length) {
        this.pending ??= workflow;
        const retryDelay = this.retryDelays[this.retries++] ?? this.delay;
        this.publish({ ...this.snapshot, status: "scheduled", error: error instanceof Error ? error.message : "Save failed." });
        this.schedule(retryDelay);
      } else {
        this.pending ??= workflow;
        this.publish({ ...this.snapshot, status: "error", error: error instanceof Error ? error.message : "Save failed." });
      }
    } finally {
      this.inFlight = false;
      if (this.pending && this.snapshot.status !== "conflict" && this.snapshot.status !== "error" && this.timer === undefined) this.schedule(this.delay);
    }
  }

  dispose(): void {
    this.disposed = true;
    if (this.timer !== undefined) this.scheduler.clear(this.timer);
    this.timer = undefined;
    this.listeners.clear();
  }

  private schedule(delay: number): void {
    if (this.timer !== undefined) this.scheduler.clear(this.timer);
    this.publish({ ...this.snapshot, status: "scheduled" });
    this.timer = this.scheduler.set(() => { this.timer = undefined; void this.flush(); }, delay);
  }

  private publish(snapshot: AutosaveSnapshot): void {
    this.snapshot = snapshot;
    for (const listener of this.listeners) listener(snapshot);
  }
}
