import { Router } from 'express';
import { getPrisma } from '../lib/prisma';

const router = Router();

/** LIKE / UNLIKE (toggle) */
router.post('/like', async (req, res) => {
  const { userId, videoId } = req.body;
  if (!userId || !videoId) return res.status(400).json({ error: 'Missing fields' });

  const prisma = getPrisma();

  try {
    const existing = await prisma.like.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    } else {
      await prisma.like.create({ data: { userId, videoId } });
      return res.json({ liked: true });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Like failed' });
  }
});

/** COMMENT */
router.post('/comment', async (req, res) => {
  const { userId, videoId, content } = req.body;
  if (!userId || !videoId || !content)
    return res.status(400).json({ error: 'Missing fields' });

  const prisma = getPrisma();
  try {
    const comment = await prisma.comment.create({
      data: { userId, videoId, content },
    });
    res.json(comment);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Comment failed' });
  }
});

/** SHARE */
router.post('/share', async (req, res) => {
  const { userId, videoId } = req.body;
  if (!userId || !videoId) return res.status(400).json({ error: 'Missing fields' });

  const prisma = getPrisma();
  try {
    await prisma.share.upsert({
      where: { userId_videoId: { userId, videoId } },
      update: {},
      create: { userId, videoId },
    });
    res.json({ shared: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Share failed' });
  }
});

export default router;