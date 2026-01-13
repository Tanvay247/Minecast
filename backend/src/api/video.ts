import { Router } from "express";
import FormData from "form-data";
import multer from "multer";
import fetch from "node-fetch";
import { getPrisma } from "../lib/prisma";
import { uploadToIPFS } from "../utils/ipfs";

const prisma = getPrisma();
const router = Router();

// Multer → memory buffer
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const file = req.file;
    const { userId } = req.body;

    if (!file || !userId) {
      return res.status(400).json({ error: "Missing video or userId" });
    }

    // 1️⃣ Upload to IPFS
    const cid = await uploadToIPFS(file.buffer);

    // 2️⃣ Call rarity service (Node-safe FormData)
    const rarityForm = new FormData();
    rarityForm.append("file", file.buffer, {
      filename: "video.mp4",
      contentType: "video/mp4",
    });

    const rarityRes = await fetch("http://localhost:8000/rarity", {
      method: "POST",
      body: rarityForm,
      headers: rarityForm.getHeaders(),
    });

    if (!rarityRes.ok) {
      throw new Error("Rarity service failed");
    }

    const data = (await rarityRes.json()) as { rarity: number };

    // 3️⃣ Save to DB
    const video = await prisma.video.create({
      data: {
        cid,
        creatorId: userId,
        rarityScore: data.rarity,
        rarityLabel: "auto",
      },
    });

    res.json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Video upload failed" });
  }
});

export default router;