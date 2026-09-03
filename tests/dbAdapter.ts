import { PGlite, type Transaction } from "@electric-sql/pglite";
/** Execute the production SQL text against real embedded PostgreSQL. Fragments
 * stay lazy just as in postgres.js; only the transport is replaced. */
export function taggedDatabase(db: PGlite | Transaction) {
  type Fragment = { text: string; values: unknown[]; then: Promise<unknown>["then"] };
  function fragment(text: string, values: unknown[]): Fragment {
    return { text, values, then(onFulfilled, onRejected) { return db.query(text, values).then(result => result.rows).then(onFulfilled, onRejected); } };
  }
  function sql(parts: TemplateStringsArray | string[], ...args: unknown[]): Fragment {
    if (!("raw" in parts)) return fragment(`(${parts.map((_, i) => `$${i + 1}`).join(",")})`, parts);
    let text = parts[0]; const values: unknown[] = [];
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg && typeof arg === "object" && "text" in arg && "values" in arg) {
        const f = arg as Fragment; text += f.text.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + values.length}`); values.push(...f.values);
      } else { values.push(arg); text += `$${values.length}`; }
      text += parts[i + 1];
    }
    return fragment(text, values);
  }
  sql.json = (value: unknown) => JSON.stringify(value);
  sql.begin = <T>(run: (tx: ReturnType<typeof taggedDatabase>) => Promise<T>): Promise<T> => (db as PGlite).transaction(tx => run(taggedDatabase(tx)));
  return sql;
}
