import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

export const prisma = new PrismaClient();

const router = Router();

/**
 * FOLLOW A USER
 */
router.post('/:userId', async (req, res) => {
  const followerId = req.body.userId; // current user
  const followingId = req.params.userId;

  if (!followerId || followerId === followingId) {
    return res.status(400).json({ error: 'Invalid follow request' });
  }

  try {
    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    res.json({ success: true });
  } catch (err: any) {
    // unique constraint → already following
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Already following' });
    }
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

/**
 * UNFOLLOW A USER
 */
router.delete('/:userId', async (req, res) => {
  const followerId = req.body.userId;
  const followingId = req.params.userId;

  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Not following user' });
  }
});

router.get('/:userId/is-following', async (req, res) => {
  const followerId = req.query.followerId as string;
  const followingId = req.params.userId;

  if (!followerId) {
    return res.status(400).json({ following: false });
  }

  const exists = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  res.json({ following: !!exists });
});

/**
 * GET FOLLOW COUNTS
 */
router.get('/:userId/count', async (req, res) => {
  const userId = req.params.userId;

  const [followers, following] = await Promise.all([
    prisma.follow.count({
      where: { followingId: userId },
    }),
    prisma.follow.count({
      where: { followerId: userId },
    }),
  ]);

  res.json({ followers, following });
});

export default router;