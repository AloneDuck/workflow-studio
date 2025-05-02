import { describe, expect, it } from "vitest";
import { commitHistory, createHistory, redoHistory, undoHistory } from "@/domain/history";

describe("bounded history", () => {
  it("supports undo, redo, and branch replacement", () => {
    let history = createHistory("a", 2);
    history = commitHistory(history, "b");
    history = commitHistory(history, "c");
    history = commitHistory(history, "d");
    expect(history.past).toEqual(["b", "c"]);
    history = undoHistory(history);
    expect(history.present).toBe("c");
    history = redoHistory(history);
    expect(history.present).toBe("d");
    history = undoHistory(history);
    history = commitHistory(history, "e");
    expect(history.future).toEqual([]);
  });
});
