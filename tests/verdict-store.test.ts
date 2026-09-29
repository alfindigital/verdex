import { describe, expect, it } from "vitest";
import { listSnapshotIds, snapshotPath } from "@/lib/verdict-store";

describe("snapshot sharing", () => {
  it("uses the exact registered record id", () => {
    const knownFixtureRecord = listSnapshotIds()[0];
    expect(knownFixtureRecord).toMatch(/^[a-f0-9]{12}$/);
    expect(snapshotPath(knownFixtureRecord)).toBe(`/verdict/${knownFixtureRecord}`);
  });

  it("does not advertise an unregistered live record as a snapshot", () => {
    expect(snapshotPath("54811a2bf901")).toBeNull();
  });
});
