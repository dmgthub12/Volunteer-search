import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { URL } from "node:url";

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    if (process.env[key]) continue;

    const rawValue = valueParts.join("=").trim();
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

loadLocalEnv();

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const port = Number(process.env.ANALYTICS_PORT || 4310);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function countBy(events, getter) {
  const counts = new Map();
  for (const event of events) {
    const key = getter(event) || "Unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10);
}

async function fetchEvents() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase analytics environment variables.");
  }

  const endpoint = new URL("/rest/v1/site_events", supabaseUrl);
  endpoint.searchParams.set(
    "select",
    "created_at,event_type,path,label,href,session_id,metadata"
  );
  endpoint.searchParams.set("order", "created_at.desc");
  endpoint.searchParams.set("limit", "250");

  const response = await fetch(endpoint, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${message}`);
  }

  return response.json();
}

function renderSetup(error) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bergen Volunteer Connect Analytics</title>
  <style>${styles()}</style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <p class="eyebrow">Private dashboard</p>
      <h1>Analytics setup needed</h1>
      <p>${escapeHtml(error.message)}</p>
    </section>
    <section class="card">
      <h2>Add this to <code>.env.local</code></h2>
      <pre>NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key</pre>
      <p>Then run <code>pnpm analytics</code> again. Keep the service-role key private and only on your computer.</p>
    </section>
  </main>
</body>
</html>`;
}

function renderDashboard(events) {
  const pageViews = events.filter((event) => event.event_type === "page_view");
  const clicks = events.filter((event) => event.event_type === "click");
  const sessions = new Set(events.map((event) => event.session_id).filter(Boolean));
  const topPages = countBy(pageViews, (event) => event.path);
  const topClicks = countBy(clicks, (event) => event.label || event.href);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="15" />
  <title>Bergen Volunteer Connect Analytics</title>
  <style>${styles()}</style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <p class="eyebrow">Private dashboard</p>
      <h1>Bergen Volunteer Connect Analytics</h1>
      <p>Auto-refreshes every 15 seconds. This page only runs on your computer.</p>
    </section>

    <section class="stats">
      ${statCard("Total events", events.length)}
      ${statCard("Page views", pageViews.length)}
      ${statCard("Clicks", clicks.length)}
      ${statCard("Visitors", sessions.size)}
    </section>

    <section class="grid">
      ${summaryCard("Top pages", topPages)}
      ${summaryCard("Top clicks", topClicks)}
    </section>

    <section class="card">
      <h2>Recent activity</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Page</th>
              <th>Click label</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            ${events
              .map(
                (event) => `<tr>
                  <td>${escapeHtml(new Date(event.created_at).toLocaleString())}</td>
                  <td><span class="pill">${escapeHtml(event.event_type)}</span></td>
                  <td>${escapeHtml(event.path)}</td>
                  <td>${escapeHtml(event.label || "")}</td>
                  <td>${event.href ? `<a href="${escapeHtml(event.href)}">${escapeHtml(event.href)}</a>` : ""}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  </main>
</body>
</html>`;
}

function statCard(label, value) {
  return `<article class="card stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
}

function summaryCard(title, rows) {
  return `<article class="card">
    <h2>${escapeHtml(title)}</h2>
    <ol>
      ${
        rows.length
          ? rows
              .map(
                ([label, count]) =>
                  `<li><span>${escapeHtml(label)}</span><strong>${escapeHtml(count)}</strong></li>`
              )
              .join("")
          : `<li><span>No data yet</span><strong>0</strong></li>`
      }
    </ol>
  </article>`;
}

function styles() {
  return `
    :root { color-scheme: light; --primary: #1f3b68; --mint: #eaf8f1; --green: #6fcf97; --text: #1f2937; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f7fafc; color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .shell { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 36px 0; }
    .hero { border: 1px solid #dbe7ef; border-radius: 24px; background: linear-gradient(135deg, #fff, var(--mint)); padding: 28px; box-shadow: 0 18px 45px rgba(31, 59, 104, 0.08); }
    .eyebrow { margin: 0 0 8px; color: var(--green); font-weight: 800; text-transform: uppercase; letter-spacing: .08em; font-size: 12px; }
    h1 { margin: 0; color: var(--primary); font-size: clamp(28px, 5vw, 44px); }
    h2 { margin: 0 0 16px; color: var(--primary); font-size: 18px; }
    p { line-height: 1.6; }
    .stats, .grid { display: grid; gap: 16px; margin-top: 16px; }
    .stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .card { border: 1px solid #e2e8f0; border-radius: 20px; background: #fff; padding: 20px; box-shadow: 0 12px 28px rgba(31, 59, 104, 0.06); }
    .stat span { display: block; color: #64748b; font-size: 13px; font-weight: 700; }
    .stat strong { display: block; margin-top: 10px; color: var(--primary); font-size: 34px; }
    ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
    li { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 760px; }
    th, td { border-bottom: 1px solid #edf2f7; padding: 12px 10px; text-align: left; vertical-align: top; font-size: 13px; }
    th { color: #64748b; text-transform: uppercase; letter-spacing: .06em; font-size: 11px; }
    a { color: var(--primary); }
    code, pre { border-radius: 12px; background: #f1f5f9; }
    code { padding: 2px 6px; }
    pre { overflow-x: auto; padding: 16px; }
    .pill { border-radius: 999px; background: var(--mint); color: var(--primary); padding: 4px 8px; font-weight: 700; }
    @media (max-width: 800px) { .stats, .grid { grid-template-columns: 1fr; } }
  `;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://localhost:${port}`);

  try {
    const events = await fetchEvents();

    if (url.pathname === "/events.json") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(events));
      return;
    }

    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(renderDashboard(events));
  } catch (error) {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(renderSetup(error));
  }
});

server.listen(port, () => {
  console.log(`Private analytics dashboard: http://localhost:${port}`);
});
