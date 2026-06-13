// =============================================================================
//  /api/kv  —  Upstash Redis proxy (key-value storage for the app)
//  Actions: get | set | del   (the app only uses get + set)
//  Protected by APP_API_TOKEN (client sends NEXT_PUBLIC_API_TOKEN).
// =============================================================================
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REDIS_URL = process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN;
const APP_TOKEN = process.env.APP_API_TOKEN;

async function redis(command) {
  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + REDIS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("Redis error " + res.status + ": " + text);
  }
  const data = await res.json();
  return data.result;
}

export async function POST(req) {
  // Light gate so randoms can't hammer the KV proxy.
  const auth = req.headers.get("authorization") || "";
  if (!APP_TOKEN || auth !== "Bearer " + APP_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!REDIS_URL || !REDIS_TOKEN) {
    return NextResponse.json(
      { error: "KV not configured (set KV_REST_API_URL & KV_REST_API_TOKEN)" },
      { status: 500 }
    );
  }

  try {
    const { action, key, value } = await req.json();
    if (!key) {
      return NextResponse.json({ error: "key required" }, { status: 400 });
    }

    if (action === "get") {
      const result = await redis(["GET", key]);
      return NextResponse.json({ value: result });
    }
    if (action === "set") {
      await redis(["SET", key, value === undefined || value === null ? "" : value]);
      return NextResponse.json({ ok: true });
    }
    if (action === "del") {
      await redis(["DEL", key]);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "unknown action: " + action }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String((e && e.message) || e) }, { status: 500 });
  }
}
