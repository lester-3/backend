import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOADS_DIR } from '../config';
import Photo from '../models/photo';

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

function getUploadMiddleware() {
  return (req: Request, res: Response, next: () => void) => {
    const isVideo = req.headers['content-type']?.startsWith('video/');
    const limits = isVideo ? { fileSize: 5 * 1024 * 1024 } : { fileSize: 64 * 1024 };
    const upload = multer({ storage, limits }).single('file');
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const limit = isVideo ? '5MB' : '64KB';
          res.status(413).json({ error: `File too large. Maximum size is ${limit}.` });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }
      if (err) {
        res.status(500).json({ error: 'Upload failed' });
        return;
      }
      // Enforce minimum 1MB for video files
      if (isVideo && req.file && req.file.size < 1024 * 1024) {
        fs.unlinkSync(req.file.path);
        res.status(413).json({ error: 'Video file too small. Minimum size is 1MB.' });
        return;
      }
      next();
    });
  };
}

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const photos = await Photo.find().sort({ created_at: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

router.post('/', getUploadMiddleware(), async (req: Request, res: Response) => {
  try {
    const { label, dateTaken, timeTaken, description, tags } = req.body;
    const filePath = req.file ? req.file.filename : null;

    if (!label) {
      res.status(400).json({ error: 'label is required' });
      return;
    }

    const photo = new Photo({
      label,
      file_path: filePath || '',
      dateTaken: dateTaken || '',
      timeTaken: timeTaken || '',
      description: description || '',
      tags: tags || '[]',
    });

    const saved = await photo.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create photo' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { label, month, color, dateTaken, timeTaken, description, tags } = req.body;
    const updates: Record<string, any> = {};
    if (label !== undefined) updates.label = label;
    if (month !== undefined) updates.month = month;
    if (color !== undefined) updates.color = color;
    if (dateTaken !== undefined) updates.dateTaken = dateTaken;
    if (timeTaken !== undefined) updates.timeTaken = timeTaken;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const photo = await Photo.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    if (photo.file_path) {
      const fullPath = path.join(UPLOADS_DIR, photo.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await Photo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

export default router;
