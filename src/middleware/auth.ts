import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const AUTH_EMAIL = process.env.AUTH_EMAIL || 'nMAIL@gmail.com';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || '123456';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'nmail-secret-key-2024';

export function generateToken(email: string): string {
  const payload = JSON.stringify({ email, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
  hmac.update(payload);
  const sig = hmac.digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + sig;
}

function verifyToken(token: string): { email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const payloadStr = Buffer.from(parts[0], 'base64').toString('utf8');
    const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
    hmac.update(payloadStr);
    const expectedSig = hmac.digest('hex');
    if (parts[1] !== expectedSig) return null;
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Date.now()) return null;
    if (payload.email !== AUTH_EMAIL) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export function validateCredentials(email: string, password: string): boolean {
  return email === AUTH_EMAIL && password === AUTH_PASSWORD;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) { next(); return; }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const token = authHeader.slice(7);
  const result = verifyToken(token);
  if (!result) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  next();
}
