import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const { opportunities } = await import("../lib/opportunities.ts");

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const rows = opportunities
  .map(
    (opportunity) =>
      `(${sqlString(opportunity.id)}, ${sqlString(JSON.stringify(opportunity))}::jsonb)`
  )
  .join(",\n");

const sql = `insert into public.volunteer_opportunities (id, data)
values
${rows}
on conflict (id) do update
set data = excluded.data;
`;

const outputPath = resolve(process.cwd(), "supabase", "seed-opportunities.sql");
writeFileSync(outputPath, sql);
console.log(`Wrote ${opportunities.length} opportunities to ${outputPath}`);
