import { Router } from 'express';
import { query } from '../db.js';

const r = Router();

// Create one unit (keeps defaults simple)
r.post('/', async (req, res) => {
  const { title, slug, kind } = req.body;
  if (!title || !slug || !kind) {
    return res.status(400).json({ error: 'BadRequest', message: 'title, slug, kind are required' });
  }
  try {
    const sql = `
      insert into content_units (title, slug, kind, status)
      values ($1, $2, $3, 'idea')
      returning *`;
    const { rows } = await query(sql, [title, slug, kind]);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: 'CreateFailed', message: e.message });
  }
});

// List units (newest first)
r.get('/', async (_req, res) => {
  const { rows } = await query('select * from content_units order by created_at desc');
  res.json(rows);
});

export default r;
