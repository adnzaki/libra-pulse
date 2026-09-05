import 'dotenv/config'
import express from 'express'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { createServer as createViteServer } from 'vite'

const app = express()
const PORT = 3000

// 1. Parsing Limit Standard & Headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})
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

// Endpoint Cek Status Konfigurasi SMTP
app.get('/api/email-status', (req, res) => {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const port = process.env.SMTP_PORT || '587'
  const isConfigured = Boolean(host && user && pass)

  // Mask email for security (e.g., az***@gmail.com)
  let maskedUser = ''
  if (user) {
    const parts = user.split('@')
    if (parts.length === 2) {
      maskedUser = parts[0].slice(0, 2) + '***@' + parts[1]
    } else {
      maskedUser = user.slice(0, 3) + '***'
    }
  }

  res.json({
    configured: isConfigured,
    host: host || null,
    port: port,
    user: maskedUser || null,
    from: process.env.SMTP_FROM || null,
  })
})

// Endpoint Test Kirim Email langsung dari UI Settings
app.post('/api/test-email', async (req, res) => {
  const { recipient } = req.body || {}
  const targetEmail = recipient || process.env.SMTP_USER

  if (!targetEmail) {
    return res.status(400).json({
      success: false,
      error: 'Harap masukkan alamat email tujuan pengujian.',
    })
  }

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const rawPass = process.env.SMTP_PASS

  if (!host || !user || !rawPass) {
    return res.status(400).json({
      success: false,
      error:
        'Variabel SMTP belum lengkap di server (.env). Pastikan SMTP_HOST, SMTP_USER, dan SMTP_PASS sudah diisi.',
    })
  }

  const pass = rawPass.replace(/\s+/g, '') // Bersihkan spasi dari Google App Password jika ada

  try {
    const nodemailer = await import('nodemailer')
    const isGmail = host.includes('gmail.com') || user.includes('@gmail.com')

    const transporterOptions: any = isGmail
      ? {
          service: 'gmail',
          auth: { user, pass },
          connectionTimeout: 15000,
          greetingTimeout: 15000,
        }
      : {
          host: host,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
          auth: { user, pass },
          connectionTimeout: 15000,
          greetingTimeout: 15000,
          tls: {
            rejectUnauthorized: false, // Menghindari error sertifikat self-signed pada mail server sekolah lokal
          },
        }

    const transporter = nodemailer.createTransport(transporterOptions)

    // Verifikasi koneksi SMTP terlebih dahulu
    await transporter.verify()

    // Format sender address valid untuk Gmail
    let fromAddress = process.env.SMTP_FROM || `"Perpustakaan Libra" <${user}>`
    if (isGmail && !fromAddress.includes(user)) {
      const nameMatch = fromAddress.match(/^"?(.*?)"?\s*<.*?>$/)
      const displayName = nameMatch ? nameMatch[1] : 'Libra - SDN Pengasinan VII'
      fromAddress = `"${displayName}" <${user}>`
    }

    const info = await transporter.sendMail({
      from: fromAddress,
      replyTo: user,
      to: targetEmail,
      subject: '✅ [Uji Coba Berhasil] Notifikasi Sistem Perpustakaan Libra',
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'Libra Smart Library System',
      },
      text: `Halo,\n\nIni adalah email uji coba dari Sistem Perpustakaan Libra (${host}).\nKoneksi SMTP berhasil terhubung dan siap mengirimkan notifikasi pengingat keterlambatan buku kepada siswa/anggota.\n\nWaktu pengujian: ${new Date().toLocaleString('id-ID')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #0284c7; margin: 0;">Libra Perpustakaan Digital</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Uji Coba Server Email SMTP</p>
          </div>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <h3 style="color: #166534; margin: 0 0 8px 0; font-size: 16px;">✅ Koneksi SMTP Berhasil Aktif!</h3>
            <p style="color: #15803d; font-size: 13px; margin: 0; line-height: 1.5;">
              Server email berhasil mengirimkan pesan uji coba ke <strong>${targetEmail}</strong>. Sistem siap mengirimkan pengingat keterlambatan pengembalian buku dan denda otomatis kepada anggota.
            </p>
          </div>
          <div style="font-size: 12px; color: #94a3b8; text-align: center;">
            Dikirim oleh Sistem Otomasi Libra • ${new Date().toLocaleString('id-ID')}
          </div>
        </div>
      `,
    })

    console.log('>>> [TEST EMAIL] Berhasil dikirim:', info.messageId)
    return res.json({
      success: true,
      message: `Email uji coba berhasil dikirim ke ${targetEmail}!`,
      messageId: info.messageId,
    })
  } catch (err: any) {
    console.error('>>> [TEST EMAIL] Gagal mengirim:', err)
    return res.status(500).json({
      success: false,
      error: err.message || 'Gagal mengirim email uji coba. Periksa kredensial SMTP Anda.',
    })
  }
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
  const rawPass = process.env.SMTP_PASS

  // Jika SMTP dikonfigurasi di environment variables, kirim real email via Nodemailer
  if (host && user && rawPass) {
    try {
      const pass = rawPass.replace(/\s+/g, '') // Bersihkan spasi dari Google App Password
      const nodemailer = await import('nodemailer')
      const isGmail = host.includes('gmail.com') || user.includes('@gmail.com')

      const transporterOptions: any = isGmail
        ? {
            service: 'gmail',
            auth: { user, pass },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
          }
        : {
            host: host,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
            auth: { user, pass },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            tls: {
              rejectUnauthorized: false,
            },
          }

      const transporter = nodemailer.createTransport(transporterOptions)

      // Pastikan sender format valid untuk Gmail agar tidak dianggap spoofing/spam
      let fromAddress = process.env.SMTP_FROM || `"Perpustakaan Libra" <${user}>`
      if (isGmail && !fromAddress.includes(user)) {
        // Ambil display name jika ada (misal "Libra SDN Pengasinan VII")
        const nameMatch = fromAddress.match(/^"?(.*?)"?\s*<.*?>$/)
        const displayName = nameMatch ? nameMatch[1] : 'Perpustakaan Libra'
        fromAddress = `"${displayName}" <${user}>`
      }

      const formattedHtml =
        html ||
        `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
          <div style="padding-bottom: 16px; margin-bottom: 20px; border-bottom: 2px solid #0284c7;">
            <h2 style="color: #0369a1; margin: 0; font-size: 18px; font-weight: bold;">Perpustakaan SDN Pengasinan VII</h2>
            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 12px;">Sistem Informasi & Layanan Sirkulasi Buku Digital</p>
          </div>
          <div style="font-size: 14px; color: #334155; margin-bottom: 24px; white-space: pre-line;">
${message}
          </div>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-top: 24px; font-size: 11px; color: #64748b; line-height: 1.5;">
            <p style="margin: 0 0 4px 0; font-weight: bold; color: #475569;">Layanan Perpustakaan SDN Pengasinan VII</p>
            <p style="margin: 0;">Email ini dikirim secara otomatis oleh Sistem Otomasi Sirkulasi Libra. Apabila Anda telah mengembalikan buku tersebut, mohon abaikan pemberitahuan ini.</p>
          </div>
        </div>
      `

      const info = await transporter.sendMail({
        from: fromAddress,
        replyTo: user,
        to: recipient,
        subject: subject || 'Pemberitahuan Sirkulasi Perpustakaan SDN Pengasinan VII',
        text: message,
        html: formattedHtml,
        headers: {
          'X-Priority': '3',
          'X-Mailer': 'Libra Smart Library System',
        },
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
