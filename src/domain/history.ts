export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
  limit: number;
}

export function createHistory<T>(initial: T, limit = 50): HistoryState<T> {
  if (!Number.isInteger(limit) || limit < 1) throw new Error("History limit must be a positive integer.");
  return { past: [], present: initial, future: [], limit };
}

export function commitHistory<T>(history: HistoryState<T>, next: T, equals: (left: T, right: T) => boolean = Object.is): HistoryState<T> {
  if (equals(history.present, next)) return history;
  return {
    ...history,
    past: [...history.past, history.present].slice(-history.limit),
    present: next,
    future: [],
  };
}

export function undoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  const previous = history.past.at(-1);
  if (previous === undefined) return history;
  return { ...history, past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] };
}

export function redoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  const next = history.future[0];
  if (next === undefined) return history;
  return { ...history, past: [...history.past, history.present].slice(-history.limit), present: next, future: history.future.slice(1) };
}
