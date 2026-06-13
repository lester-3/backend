import { Router, Request, Response } from 'express';
import { validateCredentials, generateToken } from '../middleware/auth';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }
  if (!validateCredentials(email, password)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const token = generateToken(email);
  res.json({ token, email, name: 'nMAIL Admin' });
});

export default router;
