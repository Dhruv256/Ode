import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var birthdayWorldSql: postgres.Sql | undefined;
}

/** A cached, server-only pooled connection suitable for Vercel functions. */
export function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");

  if (!global.birthdayWorldSql) {
    global.birthdayWorldSql = postgres(connectionString, {
      ssl: "require",
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  return global.birthdayWorldSql;
}

