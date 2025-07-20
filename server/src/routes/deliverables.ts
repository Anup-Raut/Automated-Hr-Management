import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all deliverables (filtered by user role)
router.get('/', async (req: any, res: any) => {
  try {
    const { user } = req;
    let deliverables;

    if (user.role === 'CLIENT') {
      // For clients, get deliverables from their projects
      const userProjects = await prisma.project.findMany({
        where: { clientId: user.id },
        select: { id: true }
      });
      
      const projectIds = userProjects.map(p => p.id);
      
      deliverables = await prisma.deliverable.findMany({
        where: {
          projectId: { in: projectIds }
        },
        include: {
          project: {
            select: { id: true, name: true }
          },
          assignedUser: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { dueDate: 'asc' }
      });
    } else {
      deliverables = await prisma.deliverable.findMany({
        include: {
          project: {
            select: { id: true, name: true }
          },
          assignedUser: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { dueDate: 'asc' }
      });
    }

    res.json({ deliverables });
  } catch (error) {
    console.error('Get deliverables error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all deliverables for a project
router.get('/project/:projectId', async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const { user } = req;

    // Check if user has access to the project
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (user.role === 'CLIENT' && project.clientId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const deliverables = await prisma.deliverable.findMany({
      where: { projectId },
      include: {
        assignedUser: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json({ deliverables });
  } catch (error) {
    console.error('Get deliverables error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create deliverable
router.post('/', [
  body('name').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('dueDate').isISO8601(),
  body('projectId').isString(),
  body('assignedTo').optional().isString()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, dueDate, projectId, assignedTo } = req.body;

    const deliverable = await prisma.deliverable.create({
      data: {
        name,
        description,
        dueDate: new Date(dueDate),
        projectId,
        assignedTo: assignedTo || null
      },
      include: {
        assignedUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({ deliverable });
  } catch (error) {
    console.error('Create deliverable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update deliverable
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']),
  body('assignedTo').optional().isString()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    if (updateData.status === 'COMPLETED' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    const deliverable = await prisma.deliverable.update({
      where: { id },
      data: updateData,
      include: {
        assignedUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ deliverable });
  } catch (error) {
    console.error('Update deliverable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete deliverable
router.delete('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    await prisma.deliverable.delete({
      where: { id }
    });

    res.json({ message: 'Deliverable deleted successfully' });
  } catch (error) {
    console.error('Delete deliverable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 