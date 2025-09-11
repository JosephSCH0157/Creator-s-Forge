// scripts/dev-db.js
// Ensure Docker + forge_postgres are up, and server/.env exists.

import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CONTAINER = process.env.PG_CONTAINER || "forge_postgres";
const PG_USER   = process.env.PG_USER || "forge_user";
const PG_PASS   = process.env.PG_PASS || "forge_pass";
const PG_DB     = process.env.PG_DB   || "creators_forge";
const PG_PORT   = process.env.PG_PORT || "5432";

// 1) Docker available?
try {
  execSync("docker --version", { stdio: "ignore" });
} catch {
  console.log("[dev-db] Docker not found on PATH. Start Docker Desktop and try again.");
  process.exit(0); // Don't hard-fail; still let web/server run if user wants.
}

// 2) Container exists?
let exists = false;
try {
  const out = execSync(`docker ps -a --format "{{.Names}}"`).toString().trim().split(/\r?\n/);
  exists = out.includes(CONTAINER);
} catch (e) {
  console.log("[dev-db] Could not query docker containers:", e.message);
}

// 3) Create if missing, else ensure running
if (!exists) {
  console.log(`[dev-db] Creating ${CONTAINER}...`);
  const run = spawnSync("docker", [
    "run","-d",
    "--name", CONTAINER,
    "-p", `${PG_PORT}:5432`,
    "-e", `POSTGRES_USER=${PG_USER}`,
    "-e", `POSTGRES_PASSWORD=${PG_PASS}`,
    "-e", `POSTGRES_DB=${PG_DB}`,
    "postgres:16-alpine"
  ], { stdio: "inherit" });
  if (run.status !== 0) process.exit(run.status);
} else {
  try {
    const running = execSync(`docker inspect -f "{{.State.Running}}" ${CONTAINER}`).toString().trim();
    if (running !== "true") {
      console.log(`[dev-db] Starting ${CONTAINER}...`);
      execSync(`docker start ${CONTAINER}`, { stdio: "inherit" });
    } else {
      console.log(`[dev-db] ${CONTAINER} already running.`);
    }
  } catch (e) {
    console.log("[dev-db] Could not inspect/start container:", e.message);
  }
}

// 4) Ensure server/.env exists with matching creds
const envPath = join(process.cwd(), "server", ".env");
if (!existsSync(envPath)) {
  console.log("[dev-db] Creating server/.env ...");
  const serverDir = join(process.cwd(), "server");
  if (!existsSync(serverDir)) mkdirSync(serverDir, { recursive: true });
  const content =
`DATABASE_URL=postgres://${PG_USER}:${PG_PASS}@127.0.0.1:${PG_PORT}/${PG_DB}
PORT=5177
`;
  writeFileSync(envPath, content, "utf8");
} else {
  console.log("[dev-db] server/.env already present.");
}

console.log("[dev-db] Ready.");
