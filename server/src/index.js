import 'dotenv/config';

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5175;

// Static frontend (../web/public)
const publicDir = path.resolve(__dirname, "../../web/public");
app.use(express.static(publicDir));

// Simple API routes
app.get('/api/health', (_req, res) => res.send('ok'));

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from Creator’s Forge backend 👋" });
});


// Helper: read version from server/package.json
function getAppVersion() {
  try {
    const pkgPath = path.resolve(__dirname, "../package.json"); // ../ from /src
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

app.get("/api/version", (_req, res) => {
  res.json({
    app: "Creator’s Forge",
    version: getAppVersion(),
    note: "Second demo route is live 🚀"
  });
});
app.get("/api/ping", (req, res) => {
  const start = Date.now();
  // Simulate minimal processing
  const latency = Date.now() - start;

  res.json({
    app: "Creator’s Forge",
    endpoint: "/api/ping",
    timestamp: new Date().toISOString(),
    latencyMs: latency
  });
});


// Fallback to index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Creator’s Forge running at http://localhost:${PORT}`);
});

