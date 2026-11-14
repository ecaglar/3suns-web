// Cloudflare Pages Function: forwards https://3suns.app/ingest/* to PostHog (US cloud), so the
// analytics script and its requests come from the site itself and are not stopped by blockers.
// /ingest/static/* and /ingest/array/* are the PostHog script and its settings, everything else is event data.
const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/ingest/, "") || "/";
  const host = path.startsWith("/static/") || path.startsWith("/array/") ? ASSET_HOST : API_HOST;

  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.delete("host");
  // PostHog places a visitor by IP address; pass on the visitor's own address.
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) headers.set("x-forwarded-for", ip);

  const init = { method: request.method, headers, redirect: "follow" };
  if (request.method !== "GET" && request.method !== "HEAD") init.body = await request.arrayBuffer();
  const res = await fetch("https://" + host + path + url.search, init);

  const out = new Response(res.body, res);
  out.headers.delete("set-cookie");
  return out;
}
