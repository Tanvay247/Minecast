import { Router } from 'express';
import { getPrisma } from '../lib/prisma';

const prisma = getPrisma();

const router = Router();

router.post('/create-user', async (req, res) => {
  const { userId, walletAddress } = req.body;

  try {
    const user = await prisma.user.create({
      data: {
        id: userId,
        walletAddress,
        role: 'CREATOR',
      },
    });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: 'User already exists' });
  }
});

export default router;