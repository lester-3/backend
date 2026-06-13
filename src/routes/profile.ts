import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOADS_DIR } from '../config';
import Profile from '../models/profile';

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, 'avatar' + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 64 * 1024 } });

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({
        name: 'Me',
        email: 'me@nmail.com',
        phone: '',
        avatar_path: '',
      });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.patch('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const profile = await Profile.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true,
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/avatar', upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (req.file.size > 64 * 1024) {
      fs.unlinkSync(req.file.path);
      res.status(413).json({ error: 'File too large. Maximum size is 64KB.' });
      return;
    }

    const profile = await Profile.findOneAndUpdate(
      {},
      { avatar_path: req.file.filename },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

export default router;
