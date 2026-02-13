import { Router } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { toCamelCase } from '../utils/case-converter';
import { z } from 'zod';

const router = Router();

const ActivitySchema = z.object({
  childId: z.string().uuid(),
  type: z.enum(['CHECK_IN', 'CHECK_OUT', 'PHOTO', 'MEAL', 'NAP', 'INCIDENT', 'NOTE', 'MEDICATION']),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  mediaUrl: z.string().url().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

const BulkActivitySchema = ActivitySchema.omit({ childId: true }).extend({
  childIds: z.array(z.string().uuid()).min(1),
});

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
    res.json(toCamelCase(result.rows));
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create activity
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { childId, type, title, description, mediaUrl, metadata } = ActivitySchema.parse(req.body);
    const authorId = req.user?.id;

    const result = await query(
      `INSERT INTO activities (child_id, author_id, type, title, description, media_url, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [childId, authorId, type, title, description, mediaUrl, metadata ? JSON.stringify(metadata) : null]
    );

    const newActivity = toCamelCase(result.rows[0]);

    // Emit socket event
    const io = req.app.get('io');
    io.to(`child:${childId}`).emit('activity:new', newActivity);

    res.status(201).json(newActivity);
  } catch (error) {
    console.error('Create activity error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk create activities (for tagging multiple children)
router.post('/bulk', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { childIds, type, title, description, mediaUrl, metadata } = BulkActivitySchema.parse(req.body);
    const authorId = req.user?.id;

    const result = await query(
      `INSERT INTO activities (child_id, author_id, type, title, description, media_url, metadata)
       SELECT cid, $2, $3::activity_type, $4, $5, $6, $7
       FROM unnest($1::uuid[]) AS cid
       RETURNING *`,
      [childIds, authorId, type, title, description, mediaUrl, metadata ? JSON.stringify(metadata) : null]
    );

    const newActivities = toCamelCase(result.rows);

    // Emit socket events
    const io = req.app.get('io');
    newActivities.forEach((activity: any) => {
      io.to(`child:${activity.childId}`).emit('activity:new', activity);
    });

    res.status(201).json(newActivities);
  } catch (error) {
    console.error('Bulk create activities error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
