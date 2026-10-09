export async function askOutApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Something went wrong. Please try again.");
  return body as T;
}

export async function copyAskOutLink(path: string) {
  const url = new URL(path, location.origin).href;
  try { await navigator.clipboard.writeText(url); return "Link copied."; }
  catch { window.prompt("Copy this link", url); return "Your link is ready."; }
}
