import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all updates
router.get('/', async (req: any, res: any) => {
  try {
    const { user } = req;
    let updates;

    if (user.role === 'CLIENT') {
      // Get updates for client's projects
      const clientProjects = await prisma.project.findMany({
        where: { clientId: user.id },
        select: { id: true }
      });
      
      const projectIds = clientProjects.map(p => p.id);
      
      updates = await prisma.update.findMany({
        where: {
          OR: [
            { projectId: { in: projectIds } },
            { projectId: null } // General updates
          ]
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      updates = await prisma.update.findMany({
        include: {
          author: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json({ updates });
  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create update
router.post('/', [
  body('title').trim().isLength({ min: 1 }),
  body('content').trim().isLength({ min: 1 }),
  body('type').isIn(['PROGRESS', 'MILESTONE', 'GENERAL', 'ANNOUNCEMENT']),
  body('projectId').optional().isString()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, type, projectId } = req.body;
    const { user } = req;

    const update = await prisma.update.create({
      data: {
        title,
        content,
        type,
        projectId: projectId || null,
        authorId: user.id
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ update });
  } catch (error) {
    console.error('Create update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update update
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1 }),
  body('content').optional().trim().isLength({ min: 1 }),
  body('type').optional().isIn(['PROGRESS', 'MILESTONE', 'GENERAL', 'ANNOUNCEMENT'])
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const update = await prisma.update.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      }
    });

    res.json({ update });
  } catch (error) {
    console.error('Update update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete update
router.delete('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const update = await prisma.update.findUnique({
      where: { id }
    });

    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    // Only author can delete their own updates
    if (update.authorId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.update.delete({
      where: { id }
    });

    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Delete update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 