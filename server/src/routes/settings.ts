import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/settings — get user settings
router.get('/', async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        let settings = await prisma.userSettings.findUnique({
            where: { userId: authReq.userId },
        });

        if (!settings) {
            settings = await prisma.userSettings.create({
                data: { userId: authReq.userId! },
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/settings — update user settings
router.put('/', async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { workStartHour, workEndHour, lunchStartHour, lunchDurationMinutes } = req.body;

        const settings = await prisma.userSettings.upsert({
            where: { userId: authReq.userId! },
            update: {
                ...(workStartHour !== undefined && { workStartHour }),
                ...(workEndHour !== undefined && { workEndHour }),
                ...(lunchStartHour !== undefined && { lunchStartHour }),
                ...(lunchDurationMinutes !== undefined && { lunchDurationMinutes }),
            },
            create: {
                userId: authReq.userId!,
                workStartHour: workStartHour ?? 8,
                workEndHour: workEndHour ?? 22,
                lunchStartHour: lunchStartHour ?? 12,
                lunchDurationMinutes: lunchDurationMinutes ?? 60,
            },
        });

        res.json(settings);
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
