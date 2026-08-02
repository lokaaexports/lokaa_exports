import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'auth@lokaaexports.com',
    pass: process.env.SMTP_PASS || 'Lokaa@2026',
  },
  tls: {
    rejectUnauthorized: false,
  },
})

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection failed:', error)
    process.exit(1)
  } else {
    console.log('SMTP Connection successful. Ready to send messages.')
    process.exit(0)
  }
})
