import cors from "cors";
import express from "express";

import authRoutes from "./api/auth";
import engagementRoutes from "./api/engagement";
import videoRoutes from "./api/video";
import videoFeedRouter from "./api/videoFeed";

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/video", videoRoutes);
app.use("/api/video", videoFeedRouter);
app.use("/engagement", engagementRoutes);

// Start server (IMPORTANT: 0.0.0.0)
const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on http://0.0.0.0:${PORT}`);
});