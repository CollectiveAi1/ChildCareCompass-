import { Router } from 'express';
import { query } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { toCamelCase } from '../utils/case-converter';
import { z } from 'zod';

const router = Router();

const MessageSchema = z.object({
  recipientId: z.string().uuid(),
  content: z.string().min(1),
  childId: z.string().uuid().optional().nullable(),
});

// Get messages for current user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { conversationWith } = req.query;

    let queryText = `
      SELECT m.*,
             sender.first_name || ' ' || sender.last_name as sender_name,
             sender.avatar_url as sender_avatar,
             recipient.first_name || ' ' || recipient.last_name as recipient_name
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users recipient ON m.recipient_id = recipient.id
      WHERE (m.sender_id = $1 OR m.recipient_id = $1)
    `;
    const params: any[] = [userId];

    if (conversationWith) {
      queryText += ' AND (m.sender_id = $2 OR m.recipient_id = $2)';
      params.push(conversationWith);
    }

    queryText += ' ORDER BY m.created_at DESC';

    const result = await query(queryText, params);
    res.json(toCamelCase(result.rows));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { recipientId, content, childId } = MessageSchema.parse(req.body);
    const senderId = req.user?.id;

    const result = await query(
      `INSERT INTO messages (sender_id, recipient_id, child_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [senderId, recipientId, childId, content]
    );

    const newMessage = toCamelCase(result.rows[0]);

    // Emit socket event
    const io = req.app.get('io');
    io.to(`user:${recipientId}`).emit('message:new', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark message as read
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await query(
      `UPDATE messages
       SET is_read = true
       WHERE id = $1 AND recipient_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
