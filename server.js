import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const distPath = path.join(__dirname, 'dist');

// Health check endpoint for Cloud Run
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// Serve static assets from dist
app.use(express.static(distPath));

// SPA fallback: any unknown route serves index.html
app.get('*', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).send('Application bundle is being compiled. Please refresh in a moment.');
  }
});

app.listen(PORT, HOST, () => {
  console.log(`REA Web Application server running on http://${HOST}:${PORT}`);
});
