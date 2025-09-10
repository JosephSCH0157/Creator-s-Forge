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

// Allowed state machine (simple for now)
const allowed = [
  'idea','script','recording','edit','packaging',
  'ready_to_upload','scheduled','published','archived','canceled'
];

// Transition a unit's status and write an event
r.post('/:id/transition', async (req, res) => {
  const { to } = req.body;
  if (!allowed.includes(to)) {
    return res.status(400).json({ error: 'BadTargetState', message: `Unknown state: ${to}` });
  }

  try {
    const { rows: cur } = await query('select status from content_units where id=$1', [req.params.id]);
    if (!cur[0]) return res.status(404).json({ error: 'NotFound' });

    // TODO: tighten allowed transitions (enforce sequence) if you want
    await query('update content_units set status=$1 where id=$2', [to, req.params.id]);
    await query(
      `insert into content_events (content_unit_id, type, from_state, to_state)
       values ($1, 'state.transition', $2, $3)`,
      [req.params.id, cur[0].status, to]
    );

    const { rows } = await query('select * from content_units where id=$1', [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: 'TransitionFailed', message: e.message });
  }
});

export default r;