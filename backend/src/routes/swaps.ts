import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { getDb } from '../database/init';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Create a swap request
router.post('/', [
  body('responderId').notEmpty().withMessage('Responder ID is required'),
  body('offeredSkillId').notEmpty().withMessage('Offered skill ID is required'),
  body('wantedSkillId').notEmpty().withMessage('Wanted skill ID is required')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { responderId, offeredSkillId, wantedSkillId } = req.body;
    const requesterId = req.user?.id;
    const db = getDb();

    // Check if user is trying to swap with themselves
    if (requesterId === responderId) {
      return res.status(400).json({ message: 'Cannot create swap request with yourself' });
    }

    // Verify skills exist and belong to correct users
    const offeredSkill = await db.get(
      'SELECT id, user_id, skill_name FROM skills WHERE id = ? AND user_id = ? AND approved = 1',
      [offeredSkillId, requesterId]
    );

    const wantedSkill = await db.get(
      'SELECT id, user_id, skill_name FROM skills WHERE id = ? AND user_id = ? AND approved = 1',
      [wantedSkillId, responderId]
    );

    if (!offeredSkill) {
      return res.status(400).json({ message: 'Offered skill not found or not approved' });
    }

    if (!wantedSkill) {
      return res.status(400).json({ message: 'Wanted skill not found or not approved' });
    }

    // Check if there's already a pending swap between these users for these skills
    const existingSwap = await db.get(`
      SELECT id FROM swaps 
      WHERE ((requester_id = ? AND responder_id = ?) OR (requester_id = ? AND responder_id = ?))
      AND offered_skill_id = ? AND wanted_skill_id = ? AND status = 'pending'
    `, [requesterId, responderId, responderId, requesterId, offeredSkillId, wantedSkillId]);

    if (existingSwap) {
      return res.status(400).json({ message: 'A swap request already exists for these skills' });
    }

    const swapId = uuidv4();
    await db.run(
      'INSERT INTO swaps (id, requester_id, responder_id, offered_skill_id, wanted_skill_id) VALUES (?, ?, ?, ?, ?)',
      [swapId, requesterId, responderId, offeredSkillId, wantedSkillId]
    );

    // Send notification via Socket.IO
    const io = req.app.get('io');
    io.to(responderId).emit('newSwapRequest', {
      swapId,
      requesterName: req.user?.name,
      offeredSkill: offeredSkill.skill_name,
      wantedSkill: wantedSkill.skill_name
    });

    res.status(201).json({
      message: 'Swap request created successfully',
      swapId
    });
  } catch (error) {
    console.error('Create swap error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's swap requests (incoming and outgoing)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const db = getDb();

    let query = `
      SELECT 
        s.id, s.status, s.created_at, s.updated_at,
        u1.name as requester_name, u1.id as requester_id,
        u2.name as responder_name, u2.id as responder_id,
        skill1.skill_name as offered_skill, skill1.id as offered_skill_id,
        skill2.skill_name as wanted_skill, skill2.id as wanted_skill_id
      FROM swaps s
      INNER JOIN users u1 ON s.requester_id = u1.id
      INNER JOIN users u2 ON s.responder_id = u2.id
      INNER JOIN skills skill1 ON s.offered_skill_id = skill1.id
      INNER JOIN skills skill2 ON s.wanted_skill_id = skill2.id
      WHERE s.requester_id = ? OR s.responder_id = ?
    `;
    const values = [userId, userId];

    if (status) {
      query += ' AND s.status = ?';
      values.push(status);
    }

    query += ' ORDER BY s.created_at DESC';

    const swaps = await db.all(query, values);

    // Separate incoming and outgoing requests
    const incoming = swaps.filter(swap => swap.responder_id === userId);
    const outgoing = swaps.filter(swap => swap.requester_id === userId);

    res.json({
      incoming,
      outgoing
    });
  } catch (error) {
    console.error('Get swaps error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Accept a swap request
router.put('/:swapId/accept', async (req: AuthRequest, res: Response) => {
  try {
    const { swapId } = req.params;
    const userId = req.user?.id;
    const db = getDb();

    // Check if swap exists and user is the responder
    const swap = await db.get(`
      SELECT id, status, requester_id, responder_id
      FROM swaps 
      WHERE id = ? AND responder_id = ? AND status = 'pending'
    `, [swapId, userId]);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found or cannot be accepted' });
    }

    await db.run(
      'UPDATE swaps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['accepted', swapId]
    );

    // Send notification to requester
    const io = req.app.get('io');
    io.to(swap.requester_id).emit('swapAccepted', { swapId });

    res.json({ message: 'Swap request accepted successfully' });
  } catch (error) {
    console.error('Accept swap error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject a swap request
router.put('/:swapId/reject', async (req: AuthRequest, res: Response) => {
  try {
    const { swapId } = req.params;
    const userId = req.user?.id;
    const db = getDb();

    // Check if swap exists and user is the responder
    const swap = await db.get(`
      SELECT id, status, requester_id, responder_id
      FROM swaps 
      WHERE id = ? AND responder_id = ? AND status = 'pending'
    `, [swapId, userId]);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found or cannot be rejected' });
    }

    await db.run(
      'UPDATE swaps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['rejected', swapId]
    );

    // Send notification to requester
    const io = req.app.get('io');
    io.to(swap.requester_id).emit('swapRejected', { swapId });

    res.json({ message: 'Swap request rejected successfully' });
  } catch (error) {
    console.error('Reject swap error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel a swap request (only by requester)
router.put('/:swapId/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const { swapId } = req.params;
    const userId = req.user?.id;
    const db = getDb();

    // Check if swap exists and user is the requester
    const swap = await db.get(`
      SELECT id, status, requester_id, responder_id
      FROM swaps 
      WHERE id = ? AND requester_id = ? AND status = 'pending'
    `, [swapId, userId]);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found or cannot be cancelled' });
    }

    await db.run(
      'UPDATE swaps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['cancelled', swapId]
    );

    // Send notification to responder
    const io = req.app.get('io');
    io.to(swap.responder_id).emit('swapCancelled', { swapId });

    res.json({ message: 'Swap request cancelled successfully' });
  } catch (error) {
    console.error('Cancel swap error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get swap details
router.get('/:swapId', async (req: AuthRequest, res: Response) => {
  try {
    const { swapId } = req.params;
    const userId = req.user?.id;
    const db = getDb();

    const swap = await db.get(`
      SELECT 
        s.id, s.status, s.created_at, s.updated_at,
        u1.name as requester_name, u1.id as requester_id, u1.photo as requester_photo,
        u2.name as responder_name, u2.id as responder_id, u2.photo as responder_photo,
        skill1.skill_name as offered_skill, skill1.description as offered_description,
        skill2.skill_name as wanted_skill, skill2.description as wanted_description
      FROM swaps s
      INNER JOIN users u1 ON s.requester_id = u1.id
      INNER JOIN users u2 ON s.responder_id = u2.id
      INNER JOIN skills skill1 ON s.offered_skill_id = skill1.id
      INNER JOIN skills skill2 ON s.wanted_skill_id = skill2.id
      WHERE s.id = ? AND (s.requester_id = ? OR s.responder_id = ?)
    `, [swapId, userId, userId]);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    res.json({ swap });
  } catch (error) {
    console.error('Get swap details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 