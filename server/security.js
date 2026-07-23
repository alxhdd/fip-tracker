// Dependency-free security middleware: response headers + a tiny in-memory
// rate limiter for sensitive endpoints. No external packages by design.

export function securityHeaders(req, res, next) {
  // Content Security Policy. The client is a self-contained Vite bundle (same-origin
  // JS/CSS, no CDNs). Inline *style attributes* (React style={{}}) need 'unsafe-inline'
  // for styles only — scripts stay strict. Avatars come from Google/Facebook over https.
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      "connect-src 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY'); // legacy backup for frame-ancestors
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
}

// Sliding-window per-IP limiter. `req.ip` is the real client once trust proxy is set.
export function rateLimit({ windowMs, max }) {
  const hits = new Map(); // ip -> number[] (timestamps)
  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(ip, recent);
    // Opportunistic cleanup so the map doesn't grow unbounded.
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
    if (recent.length > max) return res.status(429).json({ error: 'rate_limited' });
    next();
  };
}
