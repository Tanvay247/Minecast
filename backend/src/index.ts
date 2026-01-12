import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

import cors from 'cors';
import express from 'express';

import authRoutes from './api/auth';
import engagementRoutes from './api/engagement';
import videoRoutes from './api/video';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/video', videoRoutes);
app.use('/engagement', engagementRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});