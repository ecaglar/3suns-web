// The site is a Cloudflare Worker with static assets: the files of this repository are served as they are,
// and only /ingest/* reaches this script (see run_worker_first in wrangler.jsonc). It passes PostHog requests
// on, so blockers that stop posthog.com do not hide visitors.
const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

async function ingest(request, url) {
  const path = url.pathname.replace(/^\/ingest/, "") || "/";
  const host = path.startsWith("/static/") || path.startsWith("/array/") ? ASSET_HOST : API_HOST;
  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.delete("host");
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) headers.set("x-forwarded-for", ip);
  const init = { method: request.method, headers, redirect: "follow" };
  if (request.method !== "GET" && request.method !== "HEAD") init.body = await request.arrayBuffer();
  const res = await fetch("https://" + host + path + url.search, init);
  const out = new Response(res.body, res);
  out.headers.delete("set-cookie");
  return out;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/ingest" || url.pathname.startsWith("/ingest/")) return ingest(request, url);
    return env.ASSETS.fetch(request);
  }
};
