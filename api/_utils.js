import { createClient } from '@supabase/supabase-js';

// Files prefixed with "_" are NOT treated as routes by Vercel — shared helpers.

const ALLOWED_ORIGIN_RES = [
  /^https:\/\/([a-z0-9-]+\.)?krenke\.com\.br$/,
  /^https:\/\/[a-z0-9-]*krenke[a-z0-9-]*\.vercel\.app$/,
];

// Lock CORS to Krenke production/preview origins (was Access-Control-Allow-Origin: *).
export function setCors(req, res, methods = 'POST, OPTIONS') {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGIN_RES.some((re) => re.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function supabaseAdmin() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

// Verify a Cloudflare Turnstile token server-side.
// - No TURNSTILE_SECRET_KEY configured → skip (allows deploy before env setup).
// - Missing/invalid token → false.
// - Network error reaching siteverify → allow (availability of the lead form
//   outweighs the marginal risk of a Cloudflare outage window).
export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY not set — skipping captcha verification');
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await r.json();
    return !!data.success;
  } catch (err) {
    console.error('Turnstile siteverify unreachable:', err);
    return true;
  }
}

export function callerIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || undefined;
}

// Resolve the caller's role from the Bearer token, or null if unauthenticated.
export async function getCallerRole(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const admin = supabaseAdmin();
  const { data: { user }, error } = await admin.auth.getUser(authHeader.slice(7));
  if (error || !user) return null;
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role || null;
}

// Guard: require an authenticated caller whose role is in allowedRoles.
// Sends the error response and returns false when the check fails.
export async function requireRole(req, res, allowedRoles) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  const role = await getCallerRole(req);
  if (!role) {
    res.status(401).json({ error: 'Invalid token' });
    return false;
  }
  if (!allowedRoles.includes(role)) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
}
