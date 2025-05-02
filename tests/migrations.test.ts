import { describe, expect, it } from "vitest";
import { migrateDraft } from "@/domain/migrations";

describe("draft migrations", () => {
  it("wraps legacy fields in a version 2 step", () => {
    const migrated = migrateDraft({ schemaVersion: 1, id: "legacy", name: "Legacy form", fields: [{ id: "name", key: "name", label: "Name", kind: "text", required: true }] });
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.steps[0]?.id).toBe("step-imported");
    expect(migrated.steps[0]?.fields[0]?.key).toBe("name");
  });

  it("rejects unknown schema versions", () => {
    expect(() => migrateDraft({ schemaVersion: 9 })).toThrow("Unsupported draft version 9");
  });
});
