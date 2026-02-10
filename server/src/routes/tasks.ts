import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Helper: parse postponeReasons from DB JSON string
function parseTask(task: any) {
    return {
        ...task,
        postponeReasons: JSON.parse(task.postponeReasons || '[]'),
    };
}

// GET /api/tasks — list all tasks for the authenticated user
router.get('/', async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const tasks = await prisma.task.findMany({
            where: { userId: authReq.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tasks.map(parseTask));
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/tasks — create a new task
router.post('/', async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { title, category, estimatedMinutes, deadline, energyLevel, scheduledTime } = req.body;

        if (!title || !category || !estimatedMinutes || !deadline || !energyLevel) {
            res.status(400).json({ error: 'title, category, estimatedMinutes, deadline, and energyLevel are required' });
            return;
        }

        const task = await prisma.task.create({
            data: {
                userId: authReq.userId!,
                title,
                category,
                estimatedMinutes,
                deadline,
                energyLevel,
                scheduledTime: scheduledTime || null,
                status: 'scheduled',
                postponeReasons: '[]',
            },
        });

        res.status(201).json(parseTask(task));
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/tasks/:id — update a task
router.put('/:id', async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        // Verify ownership
        const existing = await prisma.task.findFirst({
            where: { id: req.params.id, userId: authReq.userId },
        });

        if (!existing) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        const {
            title, category, estimatedMinutes, actualMinutes, deadline,
            energyLevel, status, scheduledTime, postponeCount,
            postponeReasons, completedAt,
        } = req.body;

        const task = await prisma.task.update({
            where: { id: req.params.id },
            data: {
                ...(title !== undefined && { title }),
                ...(category !== undefined && { category }),
                ...(estimatedMinutes !== undefined && { estimatedMinutes }),
                ...(actualMinutes !== undefined && { actualMinutes }),
                ...(deadline !== undefined && { deadline }),
                ...(energyLevel !== undefined && { energyLevel }),
                ...(status !== undefined && { status }),
                ...(scheduledTime !== undefined && { scheduledTime }),
                ...(postponeCount !== undefined && { postponeCount }),
                ...(postponeReasons !== undefined && { postponeReasons: JSON.stringify(postponeReasons) }),
                ...(completedAt !== undefined && { completedAt }),
            },
        });

        res.json(parseTask(task));
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const existing = await prisma.task.findFirst({
            where: { id: req.params.id, userId: authReq.userId },
        });

        if (!existing) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        await prisma.task.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
