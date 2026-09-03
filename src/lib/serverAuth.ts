import "server-only";
import { auth } from "@clerk/nextjs/server";

export class RequestError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

/** Never accept a browser-supplied owner or fall back to a shared dev account. */
export async function requireOwner() {
  if (process.env.NEXT_PUBLIC_CLERK_ENABLED === "false") throw new RequestError("Please sign in to save to your studio.", 401);
  const { userId } = await auth();
  if (!userId) throw new RequestError("Please sign in to your studio.", 401);
  return userId;
}
export async function localDraftOwner() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (process.env.NEXT_PUBLIC_CLERK_ENABLED === "false" || !key?.startsWith("pk_") || key.includes("your_key")) return "device";
  return (await auth()).userId || "device";
}

export function requestError(error: unknown) {
  if (error instanceof Error && error.name === "ValidationError") return Response.json({ error: error.message }, { status: 422 });
  if (error instanceof RequestError) return Response.json({ error: error.message }, { status: error.status });
  const code = (error as { code?: string }).code;
  if (code === "23505") return Response.json({ error: "That link is already taken. Try another name." }, { status: 409 });
  if (code === "23514") return Response.json({ error: "This would exceed the hamper's limits. Remove an item or choose a smaller file." }, { status: 422 });
  const diagnostic = error as { table_name?: string; column_name?: string; constraint_name?: string };
  // PostgreSQL's detail/message can contain private row values. Only log
  // schema identifiers, so a missing migration is diagnosable without leaks.
  console.error("Studio request failed", { code: code ?? "unknown", table: diagnostic?.table_name, column: diagnostic?.column_name, constraint: diagnostic?.constraint_name });
  return Response.json({ error: "Your changes could not be saved. Please try again." }, { status: 500 });
}

export async function readBytes(request: Request, maxBytes: number): Promise<Buffer> {
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError("A request body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new RequestError("There is too much content in this request.", 413); }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function readJson(request: Request, maxBytes = 256 * 1024): Promise<unknown> {
  const bytes = await readBytes(request, maxBytes);
  try {
    const value = JSON.parse(bytes.toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid object");
    return value;
  }
  catch { throw new RequestError("Please send valid JSON."); }
}
