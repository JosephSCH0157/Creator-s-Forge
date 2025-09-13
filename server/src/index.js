import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import unitsRouter from './routes/units.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/units', unitsRouter);

const port = process.env.PORT || 5177;
app.listen(port, () => {
  console.log(`Podcaster’s Forge running on http://127.0.0.1:${port}`);
});
