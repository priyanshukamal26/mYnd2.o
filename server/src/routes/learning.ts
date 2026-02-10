import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/learning — all learning entries for user
router.get('/', async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const entries = await prisma.learningData.findMany({
            where: { userId: authReq.userId },
        });
        res.json(entries);
    } catch (error) {
        console.error('Get learning error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/learning/:category — upsert learning entry for a category
router.put('/:category', async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const category = req.params.category;
        const { totalEstimated, totalActual, completedCount, accuracy, adjustmentFactor } = req.body;

        const entry = await prisma.learningData.upsert({
            where: {
                userId_category: {
                    userId: authReq.userId!,
                    category,
                },
            },
            update: {
                ...(totalEstimated !== undefined && { totalEstimated }),
                ...(totalActual !== undefined && { totalActual }),
                ...(completedCount !== undefined && { completedCount }),
                ...(accuracy !== undefined && { accuracy }),
                ...(adjustmentFactor !== undefined && { adjustmentFactor }),
            },
            create: {
                userId: authReq.userId!,
                category,
                totalEstimated: totalEstimated || 0,
                totalActual: totalActual || 0,
                completedCount: completedCount || 0,
                accuracy: accuracy || 0,
                adjustmentFactor: adjustmentFactor || 1,
            },
        });

        res.json(entry);
    } catch (error) {
        console.error('Upsert learning error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/learning — reset all learning data for user
router.delete('/', async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        await prisma.learningData.deleteMany({
            where: { userId: authReq.userId },
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Reset learning error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
