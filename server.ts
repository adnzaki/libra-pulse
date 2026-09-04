import express from 'express'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { createServer as createViteServer } from 'vite'

const app = express()
const PORT = 3000

// 1. Parsing Limit Standard
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// 2. Folder Storage
const coversDir = path.join(process.cwd(), 'uploads', 'covers')
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true })
}

app.use('/covers', express.static(coversDir))

// 3. Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, coversDir)
  },
  filename: (req, file, cb) => {
    const rawName =
      req.body.filename || file.originalname.replace(/\.[^/.]+$/, '')
    const cleanName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
    const ext = path.extname(file.originalname) || '.jpg'
    cb(
      null,
      `${cleanName}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`,
    )
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
})

// 4. API ROUTES (Harus didefinisikan sebelum startServer / vite.middlewares)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Endpoint Pengiriman Email Peringatan
app.post('/api/send-email', async (req, res) => {
  const { recipient, subject, message, html } = req.body || {}
  if (!recipient || !message) {
    return res.status(400).json({
      success: false,
      error: 'Recipient (email) dan isi pesan (message) wajib diisi.',
    })
  }

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  // Jika SMTP dikonfigurasi di environment variables, kirim real email via Nodemailer
  if (host && user && pass) {
    try {
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.createTransport({
        host: host,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      })

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || user,
        to: recipient,
        subject: subject || 'Pemberitahuan Peringatan Perpustakaan',
        text: message,
        html: html || message.replace(/\n/g, '<br/>'),
      })

      console.log('>>> Email berhasil dikirim via SMTP:', info.messageId)
      return res.json({
        success: true,
        mode: 'live_smtp',
        messageId: info.messageId,
        notice: 'Email berhasil dikirim langsung ke kotak masuk penerima melalui SMTP server.',
      })
    } catch (err: any) {
      console.error('>>> Gagal mengirim email via SMTP:', err)
      return res.status(500).json({
        success: false,
        mode: 'smtp_failed',
        error: err.message || 'Gagal mengirim email via SMTP server.',
      })
    }
  }

  // Jika SMTP belum diatur di server environment variables:
  console.log(`>>> [SIMULATED EMAIL] Untuk: ${recipient} | Subjek: ${subject}`)
  return res.json({
    success: true,
    mode: 'simulated_no_smtp',
    notice:
      'SMTP belum dikonfigurasi di environment variables. Pesan peringatan telah dicatat dalam sistem dan dapat langsung dikirim melalui link Gmail / Mail Client.',
  })
})

// Wrap Multer di dalam Handler agar tidak tertelan oleh Vite Middleware
app.post('/api/upload-cover', (req, res, next) => {
  console.log('>>> API UPLOAD COVER DIPANGGIL <<<')
  upload.single('cover')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ success: false, error: `Multer error: ${err.message}` })
    } else if (err) {
      return res.status(500).json({ success: false, error: err.message })
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: 'File gambar tidak ditemukan' })
    }

    const publicUrl = `/covers/${req.file.filename}`
    return res.json({
      success: true,
      url: publicUrl,
      filename: req.file.filename,
    })
  })
})

// 5. Integrasi Vite / Static Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        watch: { ignored: ['**/uploads/**'] },
      },
      appType: 'spa',
    })

    // Vite middleware DITARUH DI SINI agar hanya menangani halaman HTML / asset SPA
    app.use(vite.middlewares)
  } else {
    const distPath = path.join(process.cwd(), 'dist')
    app.use(express.static(distPath))
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`)
  })
}

startServer()
