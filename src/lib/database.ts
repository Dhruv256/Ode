import "server-only";
import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var birthdayWorldSql: postgres.Sql | undefined;
}

function canonicalPassword(value: string) {
  try {
    // Keep a correctly encoded password stable while also handling raw special
    // characters pasted from Supabase's database password field.
    return encodeURIComponent(decodeURIComponent(value));
  } catch {
    return encodeURIComponent(value);
  }
}

/**
 * Supabase passwords may contain URL-reserved characters. A raw password in a
 * PostgreSQL URL makes Node's URL parser fail before postgres can connect.
 * Repair the password segment only; the host, port, path, and query remain
 * exactly as configured by Supabase.
 */
function normalizedConnectionString(value: string) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
      throw new Error("DATABASE_URL must be a PostgreSQL connection string.");
    }
    return value;
  } catch (cause) {
    const parts = value.match(
      /^(postgres(?:ql)?):\/\/([^:/?#]+):(.+)@([^/?#:]+(?::\d+)?)(\/[^?#]*)(\?[^#]*)?$/i
    );
    if (!parts) {
      throw new Error(
        "DATABASE_URL is malformed. Copy the Supabase Session Pooler URL, or encode the database password before saving it in Vercel.",
        { cause }
      );
    }

    const [, protocol, username, password, host, path, query = ""] = parts;
    return `${protocol}://${username}:${canonicalPassword(password)}@${host}${path}${query}`;
  }
}

/** A cached, server-only pooled connection suitable for Vercel functions. */
export function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");

  if (!global.birthdayWorldSql) {
    global.birthdayWorldSql = postgres(normalizedConnectionString(connectionString), {
      ssl: "require",
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  return global.birthdayWorldSql;
}
