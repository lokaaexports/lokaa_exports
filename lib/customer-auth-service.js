import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import prisma from './prisma.js'
import { sendOtpEmail } from './email-service.js'

const OTP_TYPE = 'EMAIL_VERIFICATION'
const RESET_TYPE = 'PASSWORD_RESET'
const OTP_TTL_MS = 10 * 60 * 1000
const RESET_TTL_MS = 10 * 60 * 1000

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex')
}

function generateOTP() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}

async function throttle(scope, identifier, limit, windowMs) {
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowMs)
  const record = await prisma.authThrottle.findUnique({
    where: { scope_identifier: { scope, identifier } },
  })

  if (!record || record.resetAt <= now) {
    await prisma.authThrottle.upsert({
      where: { scope_identifier: { scope, identifier } },
      create: { scope, identifier, count: 1, resetAt },
      update: { count: 1, resetAt },
    })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  await prisma.authThrottle.update({
    where: { scope_identifier: { scope, identifier } },
    data: { count: { increment: 1 } },
  })

  return true
}

async function storeToken({ email, customerId, type, token, expiresAt }) {
  await prisma.authToken.updateMany({
    where: {
      email,
      type,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  })

  return prisma.authToken.create({
    data: {
      email,
      customerId,
      type,
      tokenHash: sha256(token),
      expiresAt,
    },
  })
}

async function consumeToken({ email, type, token }) {
  const records = await prisma.authToken.findMany({
    where: {
      email,
      type,
      usedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const tokenHash = sha256(token)
  const match = records.find((record) => record.tokenHash === tokenHash && record.expiresAt > new Date())
  if (!match) {
    throw new Error('Invalid or expired OTP')
  }

  await prisma.authToken.update({
    where: { id: match.id },
    data: {
      usedAt: new Date(),
      attempts: { increment: 1 },
    },
  })

  return match
}

export async function generateCustomerNumber() {
  const prefix = 'CUST'
  const timestamp = Date.now().toString().slice(-6)
  const random = crypto.randomBytes(3).toString('hex').slice(0, 4).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export async function registerCustomer(data) {
  const { fullName, companyName, email, phone, country, password } = data

  if (!fullName || !companyName || !email || !password || password.length < 8) {
    throw new Error('Invalid registration data')
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const existing = await prisma.customer.findUnique({ where: { email: normalizedEmail } })
  if (existing?.emailVerified) {
    throw new Error('Email already registered and verified')
  }

  if (existing && !existing.emailVerified) {
    await prisma.authToken.deleteMany({ where: { customerId: existing.id, type: OTP_TYPE } })
    await prisma.customer.delete({ where: { id: existing.id } }).catch(() => {})
  }

  const customerId = crypto.randomUUID()
  const customerNumber = await generateCustomerNumber()
  const otp = generateOTP()
  const passwordHash = await bcrypt.hash(password, 12)

  const customer = await prisma.customer.create({
    data: {
      id: customerId,
      customerNumber,
      companyName,
      slug: `${companyName}-${customerNumber}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      email: normalizedEmail,
      phone: phone || null,
      country: country || null,
      contactName: fullName,
      status: 'pending_verification',
      passwordHash,
      emailVerified: false,
    },
  })

  await storeToken({
    email: normalizedEmail,
    customerId: customer.id,
    type: OTP_TYPE,
    token: otp,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  })

  await sendOtpEmail(normalizedEmail, fullName, otp).catch((error) => {
    console.error('Background email send failed:', error.message)
  })

  return {
    customerId: customer.id,
    customerNumber: customer.customerNumber || customerNumber,
    email: normalizedEmail,
    message: 'Registration successful. Please check your email for OTP.',
  }
}

export async function verifyEmailOTP(email, otp) {
  const normalizedEmail = String(email).trim().toLowerCase()
  const customer = await prisma.customer.findUnique({ where: { email: normalizedEmail } })
  if (!customer) {
    throw new Error('Customer not found')
  }

  await consumeToken({ email: normalizedEmail, type: OTP_TYPE, token: otp })

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      emailVerified: true,
      status: 'active',
      otpCodeHash: null,
      otpExpiresAt: null,
      otpAttempts: 0,
    },
  })

  return {
    customerId: customer.id,
    customerNumber: customer.customerNumber || customer.id,
    message: 'Email verified successfully',
  }
}

export async function resendOTP(email) {
  const normalizedEmail = String(email).trim().toLowerCase()
  const customer = await prisma.customer.findUnique({ where: { email: normalizedEmail } })
  if (!customer) {
    throw new Error('Customer not found')
  }

  const allowed = await throttle('customer_resend_otp', normalizedEmail, 5, 60 * 60 * 1000)
  if (!allowed) {
    return { message: 'OTP sent to your email' }
  }

  const otp = generateOTP()
  await storeToken({
    email: normalizedEmail,
    customerId: customer.id,
    type: OTP_TYPE,
    token: otp,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  })

  await sendOtpEmail(normalizedEmail, customer.contactName || customer.companyName, otp).catch((error) => {
    console.error('Background email send failed:', error.message)
  })

  return { message: 'OTP sent to your email' }
}

export async function loginCustomer(email, password) {
  const normalizedEmail = String(email).trim().toLowerCase()
  const customer = await prisma.customer.findUnique({ where: { email: normalizedEmail } })

  if (!customer) {
    throw new Error('Invalid email or password')
  }

  const allowed = await throttle('customer_login', normalizedEmail, 10, 15 * 60 * 1000)
  if (!allowed) {
    throw new Error('Too many login attempts. Please try again later.')
  }

  if (!customer.emailVerified) {
    throw new Error('Please verify your email first')
  }

  if (customer.status !== 'active') {
    throw new Error('Account is not active')
  }

  const isPasswordValid = await bcrypt.compare(password, customer.passwordHash || '')
  if (!isPasswordValid) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        loginAttempts: { increment: 1 },
        lastLoginAttempt: new Date(),
      },
    })
    throw new Error('Invalid email or password')
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      loginAttempts: 0,
      lastLogin: new Date(),
    },
  })

  return {
    customerId: customer.id,
    customerNumber: customer.customerNumber || customer.id,
    fullName: customer.contactName || '',
    email: customer.email,
    companyName: customer.companyName,
  }
}

export async function initiateForgotPassword(email) {
  const normalizedEmail = String(email).trim().toLowerCase()
  const customer = await prisma.customer.findUnique({ where: { email: normalizedEmail } })

  if (!customer) {
    return { message: 'OTP sent to your email' }
  }

  const allowed = await throttle('customer_forgot_password', normalizedEmail, 5, 60 * 60 * 1000)
  if (!allowed) {
    return { message: 'OTP sent to your email' }
  }

  const otp = generateOTP()
  await storeToken({
    email: normalizedEmail,
    customerId: customer.id,
    type: RESET_TYPE,
    token: otp,
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  })

  await sendOtpEmail(normalizedEmail, customer.contactName || customer.companyName, otp, 'forgot-password').catch((error) => {
    console.error('Background email send failed:', error.message)
  })

  return { message: 'OTP sent to your email' }
}

export async function resetPasswordWithOTP(email, otp, newPassword) {
  const normalizedEmail = String(email).trim().toLowerCase()
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }

  const customer = await prisma.customer.findUnique({ where: { email: normalizedEmail } })
  if (!customer) {
    throw new Error('Customer not found')
  }

  await consumeToken({ email: normalizedEmail, type: RESET_TYPE, token: otp })

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      passwordHash,
      otpCodeHash: null,
      otpExpiresAt: null,
      lastPasswordChange: new Date(),
      loginAttempts: 0,
    },
  })

  return { message: 'Password reset successfully' }
}

export async function getCustomerProfile(customerId) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer) {
    throw new Error('Customer not found')
  }

  return {
    id: customer.id,
    customerNumber: customer.customerNumber || customer.id,
    fullName: customer.contactName || '',
    companyName: customer.companyName,
    email: customer.email,
    phone: customer.phone,
    country: customer.country,
    address: customer.address,
    gstNumber: customer.gstNumber,
    website: customer.website,
    profilePicture: customer.profilePicture,
    lastLogin: customer.lastLogin,
  }
}

export async function updateCustomerProfile(customerId, data) {
  const { fullName, companyName, phone, country, address, gstNumber, website } = data

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      contactName: fullName || '',
      companyName: companyName || '',
      phone: phone || '',
      country: country || '',
      address: address || '',
      gstNumber: gstNumber || '',
      website: website || '',
    },
  })

  return { message: 'Profile updated successfully' }
}

export async function getCustomerRFQs(customerId) {
  const rfqs = await prisma.rfq.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  })

  return rfqs.map((rfq) => ({
    id: rfq.id,
    rfqNumber: rfq.reference,
    product: rfq.productInterest,
    quantity: rfq.quantity,
    status: rfq.status,
    assignedTo: rfq.assignedSalesPerson,
    date: rfq.createdAt,
    notes: rfq.notes,
  }))
}
