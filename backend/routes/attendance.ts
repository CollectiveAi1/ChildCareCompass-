import { Router } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get attendance records
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { childId, date, startDate, endDate } = req.query;
    const centerId = req.user?.centerId;

    let queryText = `
      SELECT a.*, c.first_name, c.last_name,
             u1.first_name || ' ' || u1.last_name as checked_in_by_name,
             u2.first_name || ' ' || u2.last_name as checked_out_by_name
      FROM attendance a
      JOIN children c ON a.child_id = c.id
      LEFT JOIN users u1 ON a.checked_in_by = u1.id
      LEFT JOIN users u2 ON a.checked_out_by = u2.id
      WHERE c.center_id = $1
    `;
    const params: any[] = [centerId];
    let paramIndex = 2;

    if (childId) {
      queryText += ` AND a.child_id = $${paramIndex}`;
      params.push(childId);
      paramIndex++;
    }

    if (date) {
      queryText += ` AND a.date = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    if (startDate && endDate) {
      queryText += ` AND a.date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    queryText += ' ORDER BY a.date DESC, a.check_in_time DESC';

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check-in
router.post('/check-in', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { childId, notes } = req.body;
    const userId = req.user?.id;

    if (!childId) {
      return res.status(400).json({ error: 'childId is required' });
    }

    const result = await query(
      `INSERT INTO attendance (child_id, check_in_time, checked_in_by, notes, date)
       VALUES ($1, CURRENT_TIMESTAMP, $2, $3, CURRENT_DATE)
       RETURNING *`,
      [childId, userId, notes]
    );

    // Update child status
    await query(
      `UPDATE children SET status = 'PRESENT' WHERE id = $1`,
      [childId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check-out
router.post('/check-out', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { childId, signatureUrl, notes } = req.body;
    const userId = req.user?.id;

    if (!childId) {
      return res.status(400).json({ error: 'childId is required' });
    }

    // Find today's attendance record
    const attendanceResult = await query(
      `SELECT id FROM attendance
       WHERE child_id = $1 AND date = CURRENT_DATE AND check_out_time IS NULL
       ORDER BY check_in_time DESC LIMIT 1`,
      [childId]
    );

    if (attendanceResult.rows.length === 0) {
      return res.status(404).json({ error: 'No active check-in found for today' });
    }

    const result = await query(
      `UPDATE attendance
       SET check_out_time = CURRENT_TIMESTAMP,
           checked_out_by = $1,
           signature_url = $2,
           notes = COALESCE($3, notes)
       WHERE id = $4
       RETURNING *`,
      [userId, signatureUrl, notes, attendanceResult.rows[0].id]
    );

    // Update child status
    await query(
      `UPDATE children SET status = 'CHECKED_OUT' WHERE id = $1`,
      [childId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
