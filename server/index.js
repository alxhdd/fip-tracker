import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './env.js';

loadEnv(path.dirname(path.dirname(fileURLToPath(import.meta.url))));

const { sessionMiddleware, registerAuthRoutes } = await import('./auth.js');
const { registerApiRoutes } = await import('./api.js');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));
app.use(sessionMiddleware);

registerAuthRoutes(app);
registerApiRoutes(app);

// Serve the built client. In dev, run `npm run dev:client` instead and let
// Vite proxy /api + /auth here.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`FIP Tracker listening on http://localhost:${port}`);
});
