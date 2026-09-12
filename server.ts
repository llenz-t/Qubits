import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
// @ts-ignore
import backendApp from './backend/src/server.js';

async function startServer() {
  const resolvedApp = backendApp as any;
  const app: express.Express = (typeof resolvedApp === 'function' ? resolvedApp : resolvedApp?.default) || express();
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
