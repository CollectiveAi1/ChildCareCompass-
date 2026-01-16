import { Router } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get activities for a child
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { childId, limit = '50' } = req.query;
    const centerId = req.user?.centerId;

    let queryText = `
      SELECT a.*, u.first_name || ' ' || u.last_name as author_name,
             c.first_name as child_first_name, c.last_name as child_last_name
      FROM activities a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN children c ON a.child_id = c.id
      WHERE c.center_id = $1
    `;
    const params: any[] = [centerId];

    if (childId) {
      queryText += ' AND a.child_id = $2';
      params.push(childId);
    }

    queryText += ' ORDER BY a.created_at DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit as string));

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create activity
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { childId, type, title, description, mediaUrl, metadata } = req.body;
    const authorId = req.user?.id;

    if (!childId || !type || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query(
      `INSERT INTO activities (child_id, author_id, type, title, description, media_url, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [childId, authorId, type, title, description, mediaUrl, metadata ? JSON.stringify(metadata) : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk create activities (for tagging multiple children)
router.post('/bulk', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { childIds, type, title, description, mediaUrl, metadata } = req.body;
    const authorId = req.user?.id;

    if (!childIds || !Array.isArray(childIds) || childIds.length === 0) {
      return res.status(400).json({ error: 'childIds must be a non-empty array' });
    }

    const activities = [];
    for (const childId of childIds) {
      const result = await query(
        `INSERT INTO activities (child_id, author_id, type, title, description, media_url, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [childId, authorId, type, title, description, mediaUrl, metadata ? JSON.stringify(metadata) : null]
      );
      activities.push(result.rows[0]);
    }

    res.status(201).json(activities);
  } catch (error) {
    console.error('Bulk create activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
