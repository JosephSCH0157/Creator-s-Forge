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

// Fallback to index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Creator’s Forge running at http://localhost:${PORT}`);
});
