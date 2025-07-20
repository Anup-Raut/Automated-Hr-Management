import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { io } from '../index';

const router = Router();
const prisma = new PrismaClient();

// Get all tickets
router.get('/', async (req: any, res: any) => {
  try {
    const { user } = req;
    let tickets;

    if (user.role === 'CLIENT') {
      tickets = await prisma.ticket.findMany({
        where: { clientId: user.id },
        include: {
          client: { select: { id: true, name: true, email: true } },
          assignedUser: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
          comments: {
            include: { author: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      tickets = await prisma.ticket.findMany({
        include: {
          client: { select: { id: true, name: true, email: true } },
          assignedUser: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
          comments: {
            include: { author: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json({ tickets });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create ticket
router.post('/', [
  body('title').trim().isLength({ min: 1 }),
  body('description').trim().isLength({ min: 1 }),
  body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('category').isIn(['BUG', 'FEATURE_REQUEST', 'SUPPORT', 'GENERAL']),
  body('projectId').optional().isString()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, priority, category, projectId } = req.body;
    const { user } = req;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
        category,
        projectId: projectId || null,
        clientId: user.id
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      }
    });

    // Emit socket event for real-time updates
    if (io) {
      io.emit('ticket_update', { type: 'created', ticket });
    }

    res.status(201).json({ ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ticket
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  body('assignedTo').optional().isString()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, email: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      }
    });

    // Emit socket event for real-time updates
    if (io) {
      io.emit('ticket_update', { type: 'updated', ticket });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to ticket
router.post('/:id/comments', [
  body('content').trim().isLength({ min: 1 })
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { content } = req.body;
    const { user } = req;

    const comment = await prisma.comment.create({
      data: {
        content,
        ticketId: id,
        authorId: user.id
      },
      include: {
        author: { select: { id: true, name: true, email: true } }
      }
    });

    // Emit socket event for real-time updates
    if (io) {
      io.emit('ticket_update', { type: 'comment_added', ticketId: id, comment });
    }

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 