import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { UPLOADS_DIR } from './config';
import { connectDB } from './db';
import { seedDatabase } from './seed';
import { authMiddleware } from './middleware/auth';
import authRouter from './routes/auth';
import emailsRouter from './routes/emails';
import contactsRouter from './routes/contacts';
import photosRouter from './routes/photos';
import driveRouter from './routes/drive';
import profileRouter from './routes/profile';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/api/uploads', express.static(UPLOADS_DIR));

app.use('/api/auth', authRouter);
app.use(authMiddleware);
app.use('/api/emails', emailsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/photos', photosRouter);
app.use('/api/drive', driveRouter);
app.use('/api/profile', profileRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  await connectDB();
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`nmail backend running on http://localhost:${PORT}`);
  });
}

// Only call start() when not in serverless (Vercel) environment
if (!process.env.VERCEL) {
  start().catch(console.error);
}

export default app;
