// =============================================================================
//  CLIENT RUNTIME BRIDGE
//  Connects the (unmodified) Nusa Snipe app to the production backend:
//
//   1. window.storage  ->  POST /api/kv   (Upstash Redis)
//      The app's internal `storage` helper looks for window.storage with the
//      shape: get(key) -> { value } | null  and  set(key, value) -> truthy.
//
//   2. fetch() interception  ->  POST /api/ai
//      The app calls https://api.anthropic.com/v1/messages directly (with no
//      API key, which only works inside the Claude artifact sandbox). In
//      production we transparently redirect those calls to our own serverless
//      proxy, which injects ANTHROPIC_API_KEY server-side. The browser never
//      sees the key.
//
//  This keeps components/NusaSnipe.jsx byte-for-byte identical to the version
//  you iterate on as a Claude artifact — no app code changes required.
// =============================================================================

let installed = false;

export function installClientRuntime() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "";
  const origFetch = window.fetch.bind(window);

  async function kv(action, key, value) {
    const res = await origFetch("/api/kv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      },
      body: JSON.stringify({ action, key, value }),
    });
    if (!res.ok) throw new Error("kv request failed: " + res.status);
    return res.json();
  }

  // ---- 1. Storage bridge -----------------------------------------------------
  window.storage = {
    async get(key) {
      const r = await kv("get", key);
      return r && r.value !== null && r.value !== undefined ? { value: r.value } : null;
    },
    async set(key, value) {
      await kv("set", key, value);
      return { value };
    },
  };

  // ---- 2. Email bridge -------------------------------------------------------
  //  The app calls window.sendEmail(payload) / window.emailStatus(); in the
  //  Claude artifact these are undefined, so the app falls back to mailto.
  window.sendEmail = async function (payload) {
    const res = await origFetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data && data.error) || "Gagal kirim email (" + res.status + ")");
    return data;
  };

  window.emailStatus = async function () {
    try {
      const res = await origFetch("/api/send-email", {
        method: "GET",
        headers: { Authorization: "Bearer " + TOKEN },
      });
      if (!res.ok) return { configured: false };
      return await res.json();
    } catch (e) {
      return { configured: false };
    }
  };

  // ---- 3. AI proxy (fetch interception) -------------------------------------
  window.fetch = function (input, init) {
    try {
      const url =
        typeof input === "string" ? input : input && input.url ? input.url : "";
      if (url.indexOf("api.anthropic.com/v1/messages") !== -1) {
        return origFetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: init && init.body ? init.body : "{}",
        });
      }
    } catch (e) {
      /* ignore and fall through to the real fetch */
    }
    return origFetch(input, init);
  };
}
