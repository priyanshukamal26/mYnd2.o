import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();
const SALT_ROUNDS = 12;

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                profile: {
                    create: {
                        firstName: firstName || null,
                        lastName: lastName || null,
                    },
                },
                settings: {
                    create: {},
                },
            },
            include: { profile: true },
        });

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                profile: user.profile,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                profile: user.profile,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const user = await prisma.user.findUnique({
            where: { id: authReq.userId },
            include: { profile: true },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            id: user.id,
            email: user.email,
            profile: user.profile,
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const authReq = req as AuthRequest;
        const { firstName, lastName, avatarUrl, bio, constraints, university, major, yearOfStudy } = req.body;

        const profile = await prisma.profile.upsert({
            where: { userId: authReq.userId! },
            update: {
                ...(firstName !== undefined && { firstName }),
                ...(lastName !== undefined && { lastName }),
                ...(avatarUrl !== undefined && { avatarUrl }),
                ...(bio !== undefined && { bio }),
                ...(constraints !== undefined && { constraints }),
                ...(university !== undefined && { university }),
                ...(major !== undefined && { major }),
                ...(yearOfStudy !== undefined && { yearOfStudy }),
            },
            create: {
                userId: authReq.userId!,
                firstName: firstName || null,
                lastName: lastName || null,
                avatarUrl: avatarUrl || null,
                bio: bio || null,
            },
        });

        res.json(profile);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
