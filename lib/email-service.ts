import nodemailer from 'nodemailer'
import { prisma } from './prisma'

let transporter = null

function getTransporter() {
  if (transporter) return transporter

  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@lokaaexports.com'
  const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || ''
  const emailHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com'
  const emailPort = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || Number(emailPort) === 465

  transporter = nodemailer.createTransport({
    host: emailHost,
    port: Number(emailPort),
    secure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      servername: emailHost,
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
  })

  return transporter
}

function getEmailTemplate(fullName: any, otp: any, type: any) {
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

export async function sendOtpEmail(email: string, fullName: string, otp: string, type = 'registration') {
  try {
    console.log(`[EMAIL] Queuing OTP email to ${email}. OTP is: ${otp}`)
    return await queueEmail(email, fullName, otp, type)
  } catch (error: any) {
    console.error(`[EMAIL] Failed to queue OTP email to ${email}:`, error.message)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, fullName: string, resetUrl: string) {
  try {
    console.log(`[EMAIL] Queuing Password Reset email to ${email}.`)
    return await queueEmail(email, fullName, resetUrl, 'admin-reset-link')
  } catch (error: any) {
    console.error('[EMAIL] Failed to queue admin password reset email:', error.message)
    throw error
  }
}

async function queueEmail(email: string, fullName: string, otp: string, type: string) {
  const { subject, htmlContent } = getEmailTemplate(fullName, otp, type)

  const emailRecord = await prisma.emailQueue.create({
    data: {
      to: email,
      subject,
      htmlContent,
      status: 'pending',
    }
  })

  console.log(`[EMAIL] Mail queued successfully. ID: ${emailRecord.id}`)
  
  // Instantly trigger sending the email asynchronously (non-blocking for response)
  processEmailQueue().catch((err) => {
    console.error('[EMAIL-AUTO-PROCESS] Failed to send queued email:', err)
  })

  return emailRecord
}

export async function processEmailQueue() {
  const pendingEmails = await prisma.emailQueue.findMany({
    where: {
      status: 'pending',
      attempts: { lt: 3 }
    },
    take: 10
  })

  if (pendingEmails.length === 0) return { processed: 0 }

  const transporterInstance = getTransporter()
  let processed = 0

  for (const email of pendingEmails) {
    try {
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { attempts: { increment: 1 } }
      })

      await transporterInstance.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@lokaaexports.com',
        to: email.to,
        subject: email.subject,
        html: email.htmlContent,
      })

      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { status: 'sent', sentAt: new Date() }
      })

      console.log(`[EMAIL-WORKER] Successfully sent email ID: ${email.id}`)
      processed++
    } catch (error: any) {
      console.error(`[EMAIL-WORKER] Failed to send email ID: ${email.id}`, error)
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          lastError: error.message || String(error),
          status: email.attempts + 1 >= 3 ? 'failed' : 'pending'
        }
      })
    }
  }

  return { processed }
}
