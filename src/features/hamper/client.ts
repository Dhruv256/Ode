export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { ...(init?.body instanceof FormData ? {} : { "content-type": "application/json" }), ...init?.headers } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Something went wrong. Please try again.");
  return body as T;
}
export async function shareLink(path: string, title: string, copyOnly = false) {
  const url = new URL(path, location.origin).href;
  if (!copyOnly && navigator.share) { await navigator.share({ title, url }); return "Shared"; }
  try { await navigator.clipboard.writeText(url); return "Link copied"; }
  catch { window.prompt("Copy this link", url); return "Your link is ready"; }
}
