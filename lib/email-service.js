import nodemailer from 'nodemailer'

let transporter = null

function getTransporter() {
  if (transporter) return transporter

  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@lokaaexports.com'
  const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || ''
  const emailHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com'
  const emailPort = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || emailPort === 465 || emailPort === '465'

  transporter = nodemailer.createTransport({
    host: emailHost,
    port: Number(emailPort),
    secure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: true,
    },
  })

  return transporter
}

function getEmailTemplate(fullName, otp, type) {
  let subject = ''
  let htmlContent = ''

  if (type === 'registration') {
    subject = 'Verify Your Email - Lokaa Exports'
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <h1 style="color: #1a472a;">Lokaa Exports</h1>
        </div>
        <div style="padding: 40px 20px;">
          <h2 style="color: #333;">Welcome to Lokaa Exports, ${fullName}!</h2>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Thank you for registering. Please verify your email by entering the OTP below:
          </p>
          <div style="background-color: #1a472a; padding: 20px; text-align: center; margin: 30px 0; border-radius: 5px;">
            <span style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 3px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #999;">
            This OTP is valid for 10 minutes. Do not share it with anyone.
          </p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p>© 2026 Lokaa Exports. All rights reserved.</p>
        </div>
      </div>
    `
  } else if (type === 'admin-login') {
    subject = 'Your Admin Login OTP - Lokaa Exports'
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <h1 style="color: #1a472a;">Lokaa Exports Admin</h1>
        </div>
        <div style="padding: 40px 20px;">
          <h2 style="color: #333;">Admin Login Verification</h2>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Hello ${fullName || 'Admin'}, use the OTP below to complete your admin login:
          </p>
          <div style="background-color: #1a472a; padding: 20px; text-align: center; margin: 30px 0; border-radius: 5px;">
            <span style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 3px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #999;">
            This OTP is valid for 10 minutes. If you did not request this, ignore this email.
          </p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p>© 2026 Lokaa Exports. All rights reserved.</p>
        </div>
      </div>
    `
  } else if (type === 'admin-reset-link') {
    subject = 'Reset Your Admin Password - Lokaa Exports'
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <h1 style="color: #1a472a;">Lokaa Exports Admin</h1>
        </div>
        <div style="padding: 40px 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Hello ${fullName || 'Admin'}, we received a request to reset your admin password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${otp}" style="display: inline-block; background-color: #1a472a; color: white; text-decoration: none; padding: 14px 24px; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #999;">
            This link is valid for 30 minutes. If you did not request this, ignore this email.
          </p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p>© 2026 Lokaa Exports. All rights reserved.</p>
        </div>
      </div>
    `
  } else if (type === 'forgot-password') {
    subject = 'Reset Your Password - Lokaa Exports'
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <h1 style="color: #1a472a;">Lokaa Exports</h1>
        </div>
        <div style="padding: 40px 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            We received a request to reset your password. Use the OTP below to proceed:
          </p>
          <div style="background-color: #1a472a; padding: 20px; text-align: center; margin: 30px 0; border-radius: 5px;">
            <span style="font-size: 32px; font-weight: bold; color: white; letter-spacing: 3px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #999;">
            This OTP is valid for 10 minutes. Do not share it with anyone.
          </p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p>© 2026 Lokaa Exports. All rights reserved.</p>
        </div>
      </div>
    `
  }

  return { subject, htmlContent }
}

export async function sendOtpEmail(email, fullName, otp, type = 'registration') {
  try {
    console.log(`[EMAIL] Starting to send OTP email to ${email}`)
    return await sendViaSMTP(email, fullName, otp, type)
  } catch (error) {
    console.error(`[EMAIL] Failed to send OTP email to ${email}:`, error.message)
    console.error('[EMAIL] Error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      command: error.command,
    })
    throw error
  }
}

export async function sendPasswordResetEmail(email, fullName, resetUrl) {
  try {
  return await sendViaSMTP(email, fullName, resetUrl, 'admin-reset-link')
  } catch (error) {
    console.error('[EMAIL] Failed to send admin password reset email:', error.message)
    throw error
  }
}

async function sendViaSMTP(email, fullName, otp, type) {
  const transporterInstance = getTransporter()

  const { subject, htmlContent } = getEmailTemplate(fullName, otp, type)

  const info = await transporterInstance.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@lokaaexports.com',
    to: email,
    subject,
    html: htmlContent,
  })

  console.log('[EMAIL] Mail sent successfully')
  return info
}
