import "server-only";
import { auth } from "@clerk/nextjs/server";
import { HAMPER_LIMITS } from "@/features/hamper/config";

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
  if (error instanceof Error && error.name === "AskOutValidationError") return Response.json({ error: error.message }, { status: 400 });
  if (error instanceof Error && error.name === "ValidationError") return Response.json({ error: error.message }, { status: 422 });
  if (error instanceof RequestError) return Response.json({ error: error.message }, { status: error.status });
  const diagnostic = (error && (typeof error === "object" || typeof error === "function") ? error : {}) as {
    name?: string; message?: string; code?: string; detail?: string; details?: string; hint?: string; schema_name?: string;
    table_name?: string; column_name?: string; constraint_name?: string; stack?: string; cause?: unknown;
  };
  const code = diagnostic.code;
  if (code === "23505") return Response.json({ error: "That link is already taken. Try another name." }, { status: 409 });
  const constraint = diagnostic.constraint_name;
  if (code === "23514" && constraint === "hamper_items_type_cap") return Response.json({ error: `This hamper can hold up to ${HAMPER_LIMITS.maxItemsPerType} items in each category.` }, { status: 422 });
  if (code === "23514" && (constraint === "hamper_items_total_cap" || constraint === "hamper_items_position_check")) return Response.json({ error: `This hamper can hold up to ${HAMPER_LIMITS.maxItemsPerHamper} items.` }, { status: 422 });
  if (code === "23514") return Response.json({ error: "This would exceed the hamper's limits. Remove an item or choose a smaller file." }, { status: 422 });
  const redact = (value: unknown) => typeof value === "string"
    ? value.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "postgresql://[redacted]").slice(0, 4000)
    : undefined;
  const development = process.env.NODE_ENV !== "production";
  console.error("Studio request failed", {
    name: diagnostic.name ?? (error instanceof Error ? error.name : typeof error),
    message: development ? redact(diagnostic.message ?? (error instanceof Error ? error.message : String(error))) : undefined,
    code: code ?? "unknown",
    detail: development ? redact(diagnostic.detail ?? diagnostic.details) : undefined,
    hint: development ? redact(diagnostic.hint) : undefined,
    schema: diagnostic.schema_name,
    table: diagnostic.table_name,
    column: diagnostic.column_name,
    constraint: diagnostic.constraint_name,
    cause: development && diagnostic.cause instanceof Error ? redact(diagnostic.cause.message) : undefined,
    stack: development ? redact(diagnostic.stack ?? (error instanceof Error ? error.stack : undefined)) : undefined,
  });
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
