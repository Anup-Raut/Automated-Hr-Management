import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all projects (filtered by user role)
router.get('/', async (req: any, res) => {
  try {
    const { user } = req;
    let projects;

    if (user.role === 'CLIENT') {
      projects = await prisma.project.findMany({
        where: { clientId: user.id },
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          manager: {
            select: { id: true, name: true, email: true }
          },
          deliverables: {
            select: { id: true, name: true, status: true, dueDate: true }
          },
          tickets: {
            select: { id: true, title: true, status: true, priority: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      projects = await prisma.project.findMany({
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          manager: {
            select: { id: true, name: true, email: true }
          },
          deliverables: {
            select: { id: true, name: true, status: true, dueDate: true }
          },
          tickets: {
            select: { id: true, title: true, status: true, priority: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, name: true, email: true, company: true }
        },
        manager: {
          select: { id: true, name: true, email: true }
        },
        deliverables: {
          include: {
            assignedUser: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        tickets: {
          include: {
            client: {
              select: { id: true, name: true, email: true }
            },
            assignedUser: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        updates: {
          include: {
            author: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to this project
    if (user.role === 'CLIENT' && project.clientId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project
router.post('/', [
  body('name').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601(),
  body('budget').optional().isFloat({ min: 0 }),
  body('managerId').optional().isString()
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user } = req;
    const { name, description, startDate, endDate, budget, managerId } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ? parseFloat(budget) : null,
        clientId: user.role === 'CLIENT' ? user.id : req.body.clientId,
        managerId: managerId || null
      },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('budget').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
  body('managerId').optional().isString()
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { user } = req;
    const updateData = req.body;

    // Check if project exists and user has access
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (user.role === 'CLIENT' && existingProject.clientId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Clean up update data
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.budget) updateData.budget = parseFloat(updateData.budget);

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (user.role === 'CLIENT' && project.clientId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.project.delete({
      where: { id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 