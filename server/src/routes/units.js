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
// ===== Assets (list + create) =====
const assetRoles = new Set([
  'raw_video','raw_audio','mixdown','render','thumbnail','transcript','image','document'
]);

// List assets for a unit
r.get('/:id/assets', async (req, res) => {
  try {
    const { rows } = await query(
      'select * from assets where content_unit_id = $1 order by created_at desc',
      [req.params.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(400).json({ error: 'AssetsListFailed', message: e.message });
  }
});

// Create an asset record (URI-based, no file upload yet)
r.post('/:id/assets', async (req, res) => {
  const { role, storage_uri, meta = {} } = req.body;
  if (!role || !assetRoles.has(role)) {
    return res.status(400).json({ error: 'BadRole', message: `role must be one of: ${[...assetRoles].join(', ')}` });
  }
  if (!storage_uri) {
    return res.status(400).json({ error: 'BadRequest', message: 'storage_uri is required' });
  }
  try {
    // ensure unit exists
    const { rows: u } = await query('select id from content_units where id=$1', [req.params.id]);
    if (!u[0]) return res.status(404).json({ error: 'NotFound', message: 'content unit not found' });

    const { rows } = await query(
      `insert into assets (content_unit_id, role, storage_uri, meta)
       values ($1, $2, $3, $4::jsonb)
       returning *`,
      [req.params.id, role, storage_uri, JSON.stringify(meta)]
    );

    // log event
    await query(
      `insert into content_events (content_unit_id, type, payload)
       values ($1, 'asset.added', $2::jsonb)`,
      [req.params.id, JSON.stringify({ asset_id: rows[0].id, role })]
    );

    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: 'AssetCreateFailed', message: e.message });
  }
});

export default r;