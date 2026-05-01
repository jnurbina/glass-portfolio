/**
 * Helper for talking to the OpenClaw gateway from glass-portfolio API routes.
 *
 * The gateway lives behind Cloudflare Access (Service Token policy), so every
 * request must carry CF-Access-Client-Id and CF-Access-Client-Secret headers.
 *
 * Env vars (set per-branch in Vercel preview):
 *   OPENCLAW_GATEWAY_URL       e.g. https://cs-jason.onejas.one
 *   CF_ACCESS_CLIENT_ID
 *   CF_ACCESS_CLIENT_SECRET
 */

export type OpenclawFetchInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  /** AbortSignal timeout in ms (default 5000) */
  timeoutMs?: number;
};

export class OpenclawConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenclawConfigError";
  }
}

function getConfig() {
  const baseUrl = process.env.OPENCLAW_GATEWAY_URL;
  const id = process.env.CF_ACCESS_CLIENT_ID;
  const secret = process.env.CF_ACCESS_CLIENT_SECRET;
  if (!baseUrl || !id || !secret) {
    const missing = [
      !baseUrl && "OPENCLAW_GATEWAY_URL",
      !id && "CF_ACCESS_CLIENT_ID",
      !secret && "CF_ACCESS_CLIENT_SECRET",
    ]
      .filter(Boolean)
      .join(", ");
    throw new OpenclawConfigError(`Missing OpenClaw env vars: ${missing}`);
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), id, secret };
}

export async function openclawFetch(path: string, init: OpenclawFetchInit = {}) {
  const { baseUrl, id, secret } = getConfig();
  const { timeoutMs = 5000, headers = {}, ...rest } = init;

  return fetch(`${baseUrl}${path.startsWith("/") ? path : "/" + path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      "CF-Access-Client-Id": id,
      "CF-Access-Client-Secret": secret,
      ...headers,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
}
