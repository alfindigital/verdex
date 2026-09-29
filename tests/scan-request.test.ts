import { describe, expect, it } from "vitest";
import { makeScanRequestBody } from "@/lib/scan-request";

describe("scan request identity", () => {
  it("sends the selected platform/address rather than an array index", () => {
    expect(makeScanRequestBody("ETH", "", { platform: "Ethereum", address: "0xabc" })).toEqual({
      query: "ETH",
      platform: undefined,
      selection: { platform: "Ethereum", address: "0xabc" },
    });
  });
});
