import { Router } from 'express';
import { getPrisma } from '../lib/prisma';

const router = Router();

router.post('/sync-user', async (req, res) => {
  const { userId, walletAddress } = req.body;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const prisma = getPrisma();

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        
      },
      create: {
        id: userId,
        walletAddress: walletAddress ?? '0xTEMP',
        role: 'VIEWER',
      },
    });

    return res.json({
      id: user.id,
      role: user.role,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('SYNC USER ERROR:', error);
    return res.status(500).json({ error: 'User sync failed' });
  }
});

export default router;