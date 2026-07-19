import { randomUUID } from 'crypto'
import { getMysqlPool } from '@/lib/mysql-client'
import { verifyToken } from '@/lib/auth-service'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to get customer from auth token
async function getAuthenticatedCustomer() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return null
    }

    const decoded = verifyToken(token)
    if (decoded.type !== 'customer') {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

// Generate unique reference number
function generateRFQReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'RFQ-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// POST /api/rfqs - Create new RFQ
export async function POST(request) {
  try {
    const data = await request.json()
    const pool = await getMysqlPool()

    // Get authenticated customer if logged in
    const authCustomer = await getAuthenticatedCustomer()

    // If customer is logged in, auto-populate from their profile
    let customerId = null
    if (authCustomer) {
      customerId = authCustomer.id

      // Optionally update RFQ data with customer info if fields are empty
      if (!data.fullName && authCustomer.fullName) {
        data.fullName = authCustomer.fullName
      }
      if (!data.email && authCustomer.email) {
        data.email = authCustomer.email
      }
      if (!data.company && authCustomer.companyName) {
        data.company = authCustomer.companyName
      }
      if (!data.phone && authCustomer.phone) {
        data.phone = authCustomer.phone
      }
      if (!data.country && authCustomer.country) {
        data.country = authCustomer.country
      }
    }

    // Validate required fields
    if (!data.fullName || !data.email || !data.company || !data.productInterest) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: fullName, email, company, productInterest',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate RFQ ID and reference
    const rfqId = randomUUID()
    const reference = generateRFQReference()

    // Prepare RFQ data
    const rfqData = {
      id: rfqId,
      reference,
      fullName: data.fullName || '',
      email: data.email || '',
      phone: data.phone || '',
      company: data.company || '',
      country: data.country || '',
      productInterest: data.productInterest || '',
      quantity: data.quantity || '',
      packaging: data.packaging || '',
      incoterms: data.incoterms || 'CIF',
      targetPort: data.targetPort || '',
      targetPrice: data.targetPrice || '',
      preferredCurrency: data.preferredCurrency || 'USD',
      shipmentDate: data.shipmentDate || '',
      message: data.message || '',
      customSpecifications: data.customSpecifications || '',
      attachments: JSON.stringify(data.attachments || []),
      sourcePage: data.sourcePage || '',
      status: 'new',
      priority: 'normal',
      customerId: customerId,
    }

    // Insert RFQ into database
    await pool.query(
      `INSERT INTO rfqs (
        id, reference, fullName, email, phone, company, country,
        productInterest, quantity, packaging, incoterms, targetPort,
        targetPrice, preferredCurrency, shipmentDate, message,
        customSpecifications, attachments, sourcePage, status, priority,
        customer_id, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        rfqData.id,
        rfqData.reference,
        rfqData.fullName,
        rfqData.email,
        rfqData.phone,
        rfqData.company,
        rfqData.country,
        rfqData.productInterest,
        rfqData.quantity,
        rfqData.packaging,
        rfqData.incoterms,
        rfqData.targetPort,
        rfqData.targetPrice,
        rfqData.preferredCurrency,
        rfqData.shipmentDate,
        rfqData.message,
        rfqData.customSpecifications,
        rfqData.attachments,
        rfqData.sourcePage,
        rfqData.status,
        rfqData.priority,
        customerId,
      ]
    )

    // Also save to Prisma for admin dashboard
    try {
      await prisma.rfqEnquiry.create({
        data: {
          reference: rfqData.reference,
          buyerName: rfqData.fullName,
          companyName: rfqData.company,
          email: rfqData.email,
          phone: rfqData.phone,
          country: rfqData.country,
          productInterest: rfqData.productInterest,
          quantity: rfqData.quantity,
          packaging: rfqData.packaging,
          incoterms: rfqData.incoterms,
          targetPort: rfqData.targetPort,
          targetPrice: rfqData.targetPrice,
          preferredCurrency: rfqData.preferredCurrency,
          shipmentDate: rfqData.shipmentDate,
          customSpecifications: rfqData.customSpecifications,
          message: rfqData.message,
          attachments: rfqData.attachments,
          sourcePage: rfqData.sourcePage,
          status: 'new',
          priority: 'normal',
        }
      })
    } catch (error) {
      console.error('Error saving to Prisma:', error)
      // Continue even if Prisma save fails - old database is primary
    }

    // Send confirmation email (TODO: implement email service)
    // await sendRFQConfirmationEmail(rfqData.email, rfqData.fullName, reference, rfqData.productInterest)

    return new Response(
      JSON.stringify({
        success: true,
        rfq: {
          id: rfqId,
          reference,
          fullName: rfqData.fullName,
          email: rfqData.email,
          company: rfqData.company,
          productInterest: rfqData.productInterest,
          country: rfqData.country,
        },
        message: 'RFQ submitted successfully',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('RFQ submission error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create RFQ',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// GET /api/rfqs - Get RFQs (for customer dashboard)
export async function GET(request) {
  try {
    const authCustomer = await getAuthenticatedCustomer()

    if (!authCustomer) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const pool = await getMysqlPool()

    const [rfqs] = await pool.query(
      `SELECT id, reference, productInterest, quantity, status,
              assignedSalesPerson, notes, createdAt
       FROM rfqs WHERE customer_id = ? ORDER BY createdAt DESC`,
      [authCustomer.id]
    )

    return new Response(
      JSON.stringify({
        success: true,
        data: rfqs,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('RFQ fetch error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch RFQs',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
