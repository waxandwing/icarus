import { timingSafeEqual } from 'node:crypto';

function sameSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export default function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const expected = process.env.ARC_BETA_PASSWORD;
  if (!expected) {
    return res.status(503).json({ ok: false, error: 'Beta access is temporarily unavailable.' });
  }

  const supplied = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!supplied || supplied.length > 256 || !sameSecret(supplied, expected)) {
    return res.status(401).json({ ok: false, error: 'Access could not be verified.' });
  }

  return res.status(200).json({ ok: true });
}
