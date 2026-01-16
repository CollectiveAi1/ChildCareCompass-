import { Router } from 'express';
import { query } from '../config/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all children (filtered by center)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const centerId = req.user?.centerId;
    const classroomId = req.query.classroomId as string;

    let queryText = `
      SELECT c.*, cl.name as classroom_name
      FROM children c
      LEFT JOIN classrooms cl ON c.classroom_id = cl.id
      WHERE c.center_id = $1
    `;
    const params: any[] = [centerId];

    if (classroomId) {
      queryText += ' AND c.classroom_id = $2';
      params.push(classroomId);
    }

    queryText += ' ORDER BY c.first_name, c.last_name';

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single child
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const centerId = req.user?.centerId;

    const result = await query(
      `SELECT c.*, cl.name as classroom_name
       FROM children c
       LEFT JOIN classrooms cl ON c.classroom_id = cl.id
       WHERE c.id = $1 AND c.center_id = $2`,
      [id, centerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get child error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create child
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, dob, classroomId, avatarUrl, allergies, notes, enrollmentStatus } = req.body;
    const centerId = req.user?.centerId;

    const result = await query(
      `INSERT INTO children (center_id, classroom_id, first_name, last_name, dob, avatar_url, allergies, notes, enrollment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [centerId, classroomId, firstName, lastName, dob, avatarUrl, allergies, notes, enrollmentStatus || 'PENDING']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create child error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update child
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'TEACHER'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const centerId = req.user?.centerId;
    const { firstName, lastName, dob, classroomId, avatarUrl, allergies, notes, status, enrollmentStatus } = req.body;

    const result = await query(
      `UPDATE children
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           dob = COALESCE($3, dob),
           classroom_id = COALESCE($4, classroom_id),
           avatar_url = COALESCE($5, avatar_url),
           allergies = COALESCE($6, allergies),
           notes = COALESCE($7, notes),
           status = COALESCE($8, status),
           enrollment_status = COALESCE($9, enrollment_status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND center_id = $11
       RETURNING *`,
      [firstName, lastName, dob, classroomId, avatarUrl, allergies, notes, status, enrollmentStatus, id, centerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update child error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete child
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const centerId = req.user?.centerId;

    const result = await query(
      'DELETE FROM children WHERE id = $1 AND center_id = $2 RETURNING id',
      [id, centerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }

    res.json({ message: 'Child deleted successfully' });
  } catch (error) {
    console.error('Delete child error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
