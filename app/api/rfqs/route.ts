import { randomUUID, randomBytes } from 'crypto'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth-service'
import { cookies } from 'next/headers'

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
  } catch (error: any) {
    return null
  }
}

// Generate unique reference number
function generateRFQReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = randomBytes(8)
  let result = 'RFQ-'
  for (let i = 0; i < 8; i++) {
    result += chars[bytes[i] % chars.length]
  }
  return result
}

// POST /api/rfqs - Create new RFQ
export async function POST(request: any) {
  try {
    const data = await request.json()

    // Sanitize string inputs
    const sanitizeStr = (val: any, maxLen = 500) => String(val || '').trim().slice(0, maxLen)

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const safeEmail = sanitizeStr(data.email, 254)
    if (!emailRegex.test(safeEmail)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email format' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Get authenticated customer if logged in
    const authCustomer = await getAuthenticatedCustomer()
    let customer = null

    if (authCustomer) {
      customer = await prisma.customer.findUnique({ where: { id: authCustomer.id } })
    }

    if (!customer) {
      // Find by email
      customer = await prisma.customer.findUnique({ where: { email: safeEmail } })
      
      if (!customer) {
        // Create new customer
        const companyName = sanitizeStr(data.company) || 'Unknown Company'
        customer = await prisma.customer.create({
          data: {
            email: safeEmail,
            companyName: companyName,
            contactName: sanitizeStr(data.fullName),
            phone: sanitizeStr(data.phone, 50),
            country: sanitizeStr(data.country, 100),
            slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()
          }
        })
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

    const reference = generateRFQReference()
    
    // Parse quantity and shipment date safely
    const quantityNum = data.quantity ? parseInt(data.quantity, 10) : null
    const shipDateStr = sanitizeStr(data.shipmentDate, 50)
    let shipmentDate = null
    if (shipDateStr) {
      const parsed = new Date(shipDateStr)
      if (!isNaN(parsed.getTime())) {
        shipmentDate = parsed
      }
    }

    // Create RFQ in Prisma
    const rfq = await prisma.rFQ.create({
      data: {
        reference,
        customerId: customer.id,
        submittedDate: new Date(),
        productInterest: sanitizeStr(data.productInterest),
        quantity: isNaN(quantityNum as number) ? null : quantityNum,
        unit: 'unit', // Default
        shipmentDate,
        status: 'new',
        priority: 'normal',
        internalNotes: sanitizeStr(data.message, 2000) + '\n\nCustom Specs: ' + sanitizeStr(data.customSpecifications, 2000),
      }
    })

    // Send confirmation email (TODO: implement email service)
    // await sendRFQConfirmationEmail(safeEmail, sanitizeStr(data.fullName), reference, sanitizeStr(data.productInterest))

    return new Response(
      JSON.stringify({
        success: true,
        rfq: {
          id: rfq.id,
          reference: rfq.reference,
          fullName: sanitizeStr(data.fullName),
          email: safeEmail,
          company: sanitizeStr(data.company),
          productInterest: rfq.productInterest,
          country: sanitizeStr(data.country),
        },
        message: 'RFQ submitted successfully',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
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
export async function GET(request: any) {
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

    const rfqs = await prisma.rFQ.findMany({
      where: { customerId: authCustomer.id },
      select: {
        id: true,
        reference: true,
        productInterest: true,
        quantity: true,
        status: true,
        assignedSalesPerson: true,
        internalNotes: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format notes as per legacy expectation if needed
    const formattedRfqs = rfqs.map(r => ({
      ...r,
      notes: r.internalNotes
    }))

    return new Response(
      JSON.stringify({
        success: true,
        data: formattedRfqs,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
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
