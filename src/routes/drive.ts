import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UPLOADS_DIR } from '../config';
import DriveFile from '../models/driveFile';

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
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
    const files = await DriveFile.find().sort({ created_at: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const file = await DriveFile.findById(req.params.id);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

router.post('/', getUploadMiddleware(), async (req: Request, res: Response) => {
  try {
    const { name, type, size } = req.body;
    const fileName = name || (req.file ? req.file.originalname : 'untitled');
    const fileType = type || (req.file ? (req.file.mimetype.startsWith('video/') ? 'video' : 'image') : 'image');
    const fileSize = size || (req.file ? `${(req.file.size / 1024 / 1024).toFixed(1)} MB` : '0 MB');
    const filePath = req.file ? req.file.filename : '';

    const driveFile = new DriveFile({
      name: fileName,
      type: fileType,
      size: fileSize,
      file_path: filePath,
    });

    const saved = await driveFile.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create file' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { name, type, size } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (size !== undefined) updates.size = size;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const file = await DriveFile.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update file' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const file = await DriveFile.findById(req.params.id);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    if (file.file_path) {
      const fullPath = path.join(UPLOADS_DIR, file.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await DriveFile.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
