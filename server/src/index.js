import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Static frontend (../web/public)
const publicDir = path.resolve(__dirname, "../../web/public");
app.use(express.static(publicDir));

// Simple API routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Creator's Forge", time: new Date().toISOString() });
});

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from Creator’s Forge backend 👋" });
});

app.get("/api/version", (_req, res) => {
  res.json({
    app: "Creator’s Forge",
    version: "v0.1.1-dev",
    note: "Second demo route is live 🚀"
  });
});

// Fallback to index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Creator’s Forge running at http://localhost:${PORT}`);
});
// Demo: return current app version
app.get("/api/version", (_req, res) => {
  res.json({
    app: "Creator’s Forge",
    version: "v0.1.1-dev",
    note: "Second demo route is live 🚀"
  });
});
