import { Router } from 'express';
import { getPrisma } from '../lib/prisma';

const prisma = getPrisma();

const router = Router();

router.post('/like', async (req, res) => {
  const { userId, videoId } = req.body;

  const like = await prisma.like.create({
    data: { userId, videoId },
  });

  res.json(like);
});

export default router;