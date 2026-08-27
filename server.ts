import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure public/covers directory exists
const coversDir = path.join(process.cwd(), 'public', 'covers');
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// Serve /covers statically so /covers/image.jpg is accessible immediately
app.use('/covers', express.static(coversDir));

// ============================================================================
// ONLINE-FIRST DIRECT FIRESTORE ARCHITECTURE
// All database state (books, shelves, members, loans, bookings, configs)
// is handled directly via Firebase SDK connecting to Google Cloud Firestore.
// No in-memory arrays or local mock databases are stored on the server.
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'Google Cloud Firestore (Online-First Direct Integration)'
  });
});

// Endpoint upload gambar cover buku ke folder public/covers/
app.post('/api/upload-cover', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'Data gambar tidak ditemukan' });
    }

    // Parse base64 string
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';
      else if (mime.includes('svg')) ext = 'svg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    // Format safe unique filename
    const cleanName = (filename || 'cover').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const uniqueFileName = `${cleanName}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const destinationPath = path.join(coversDir, uniqueFileName);

    fs.writeFileSync(destinationPath, buffer);

    const publicUrl = `/covers/${uniqueFileName}`;
    return res.json({
      success: true,
      url: publicUrl,
      filename: uniqueFileName
    });
  } catch (err: any) {
    console.error('Error saving cover image:', err);
    return res.status(500).json({ success: false, error: err.message || 'Gagal menyimpan file cover' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
