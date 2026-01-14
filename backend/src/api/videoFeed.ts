import { Router } from "express";
import { getPrisma } from "../lib/prisma";

const router = Router();

router.get("/feed", async (req, res) => {
  try {
    const prisma = getPrisma();
    const cursor = req.query.cursor as string | undefined;

    const videos = await prisma.video.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    });

    res.status(200).json({
      videos: videos ?? [],
      nextCursor:
        videos && videos.length > 0
          ? videos[videos.length - 1].id
          : null,
    });
  } catch (err) {
    console.error("🔥 VIDEO FEED ERROR:", err);
    res.status(200).json({
      videos: [],
      nextCursor: null,
    });
  }
});

export default router;
