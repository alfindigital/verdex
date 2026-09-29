import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../app/api/verdict/route";
import { listSnapshotIds, loadVerdict } from "@/lib/verdict-store";

const originalV2 = process.env.VERDEX_V2;
const originalLive = process.env.VERDEX_LIVE;

function request(body: string): NextRequest {
  return new NextRequest("http://localhost/api/verdict", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("verdict route input and replay mode", () => {
  beforeEach(() => {
    delete process.env.VERDEX_V2;
    delete process.env.VERDEX_LIVE;
  });

  afterEach(() => {
    if (originalV2 === undefined) delete process.env.VERDEX_V2;
    else process.env.VERDEX_V2 = originalV2;
    if (originalLive === undefined) delete process.env.VERDEX_LIVE;
    else process.env.VERDEX_LIVE = originalLive;
  });

  it("rejects legacy pick input with an explicit migration message", async () => {
    const res = await POST(request(JSON.stringify({ query: "ETH", pick: 0 })));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("pick is no longer accepted");
  });

  it("rejects malformed and oversized bodies before replay lookup", async () => {
    expect((await POST(request("{"))).status).toBe(400);
    expect((await POST(request(JSON.stringify({ query: "ETH", note: "x".repeat(4090) })))).status).toBe(400);
  });

  it("serves a registered snapshot by exact stable identity in replay mode", async () => {
    const record = loadVerdict(listSnapshotIds()[0]);
    expect(record).toBeTruthy();
    const res = await POST(request(JSON.stringify({ query: record!.token.address, platform: record!.token.platform })));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.replayed).toBe(true);
    expect(body.id).toBe(record!.id);
    expect(body.mode).toBe("replay");
  });
});
