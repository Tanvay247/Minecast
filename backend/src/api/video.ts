import { Router } from 'express';
import { getPrisma } from '../lib/prisma';

const prisma = getPrisma();

const router = Router();

router.post('/create', async (req, res) => {
  const { cid, creatorId, rarityScore, rarityLabel } = req.body;

  const video = await prisma.video.create({
    data: {
      cid,
      creatorId,
      rarityScore,
      rarityLabel,
    },
  });

  res.json(video);
});

export default router;