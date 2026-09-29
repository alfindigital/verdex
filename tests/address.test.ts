import { describe, expect, it } from "vitest";
import { canonicalAddress, canonicalChain, tokenIdentity } from "@/lib/address";

describe("address identity", () => {
  it.each([
    ["eth", "Ethereum"],
    ["bsc", "BSC"],
    ["sol", "Solana"],
    ["arb", "Arbitrum"],
    ["op", "Optimism"],
    ["polygon", "Polygon"],
    ["gnosis", "Gnosis"],
    ["base", "Base"],
    ["avalanche", "Avalanche"],
  ])("canonicalizes %s to %s", (input, expected) => {
    expect(canonicalChain(input)).toBe(expected);
  });

  it("does not collapse case-sensitive Solana identities", () => {
    const a = "Abcdefghijkmnopqrstuvwxyz123456789";
    const b = "abcdef ghijkmnopqrstuvwxyz123456789".replace(" ", "");
    expect(tokenIdentity("Solana", a)).not.toBe(tokenIdentity("Solana", b));
  });

  it("lowercases EVM addresses only on EVM chains", () => {
    expect(canonicalAddress("Ethereum", "0xAbC0000000000000000000000000000000000001")).toBe("0xabc0000000000000000000000000000000000001");
    expect(canonicalAddress("Solana", "Abcdefghijkmnopqrstuvwxyz123456789")).toBe("Abcdefghijkmnopqrstuvwxyz123456789");
  });

  it("rejects unsupported chains and malformed addresses", () => {
    expect(canonicalChain("not-a-chain")).toBeNull();
    expect(canonicalAddress("Ethereum", "0xabc")).toBeNull();
    expect(tokenIdentity("not-a-chain", "0xabc")).toBeNull();
  });
});
