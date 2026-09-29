import { describe, expect, it } from "vitest";
import { matchReplayRecords } from "@/lib/replay-match";

const records = [
  { id: "b00000000002", token: { platform: "Ethereum", address: "0x0000000000000000000000000000000000000002", symbol: "ETH", name: "Ether" }, result: { verdict: "LAYAK" } },
  { id: "a00000000001", token: { platform: "BSC", address: "0x0000000000000000000000000000000000000002", symbol: "ETH", name: "Ether" }, result: { verdict: "RAWAN" } },
];

describe("replay identity matching", () => {
  it("returns all candidates in stable id order when a ticker is ambiguous", () => {
    expect(matchReplayRecords(records, { query: "ETH" }).map((r) => r.id)).toEqual(["a00000000001", "b00000000002"]);
  });

  it("requires the selected chain and address to match exactly", () => {
    expect(matchReplayRecords(records, { query: "ETH", selection: { platform: "Ethereum", address: "0x0000000000000000000000000000000000000002" } }).map((r) => r.id)).toEqual(["b00000000002"]);
    expect(matchReplayRecords(records, { query: "ETH", selection: { platform: "Ethereum", address: "0x0000000000000000000000000000000000000003" } })).toEqual([]);
  });

  it("does not cross chain when platform is supplied", () => {
    expect(matchReplayRecords(records, { query: "ETH", platform: "Ethereum" }).map((r) => r.id)).toEqual(["b00000000002"]);
  });
});
