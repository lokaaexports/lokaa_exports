import { NextResponse } from 'next/server'
import { promises as fsp } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { PRODUCTS, CATEGORIES } from '@/lib/products'
import COUNTRIES from '@/lib/countries'
import { rfqService } from '@/lib/services'

const DATA_DIR = path.join(process.cwd(), 'data')
const RFQ_JSON_PATH = path.join(DATA_DIR, 'rfqs.json')
const RFQ_CSV_PATH = path.join(DATA_DIR, 'rfqs.csv')
const RFQ_CSV_HEADER = [
  'reference',
  'id',
  'createdAt',
  'fullName',
  'email',
  'phone',
  'company',
  'country',
  'productInterest',
  'quantity',
  'packaging',
  'incoterms',
  'targetPort',
  'targetPrice',
  'preferredCurrency',
  'shipmentDate',
  'message',
  'attachments',
  'sourcePage',
  'status',
]

const RFQ_SCHEMA = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .max(64)
    .optional()
    .or(z.literal(''))
    .transform((value) => value?.trim() || '')
    .refine((value) => !value || /^[+]?[-\d\s()]{7,64}$/.test(value), 'Enter a valid phone number'),
  company: z.string().min(2, 'Company is required'),
  country: z.string().min(2, 'Destination country is required'),
  productInterest: z.string().min(2, 'Product interest is required'),
  quantity: z.string().max(120).optional().or(z.literal('')).transform((value) => value?.trim() || ''),
  packaging: z.string().max(200).optional().or(z.literal('')).transform((value) => value?.trim() || ''),
  incoterms: z.enum(['FOB', 'CIF', 'CFR', 'DAP', 'DDP', 'EXW']).default('CIF'),
  targetPort: z.string().max(120).optional().or(z.literal('')).transform((value) => value?.trim() || ''),
  targetPrice: z.string().max(80).optional().or(z.literal('')).transform((value) => value?.trim() || ''),
  preferredCurrency: z.enum(['USD', 'EUR', 'GBP', 'AED', 'INR', 'AUD', 'CAD']).default('USD'),
  shipmentDate: z.string().optional().or(z.literal('')).transform((value) => value?.trim() || '').refine((value) => !value || !Number.isNaN(Date.parse(value)), {
    message: 'Select a valid shipment date',
  }),
  message: z.string().max(1000).optional().or(z.literal('')).transform((value) => value?.trim() || ''),
  customSpecifications: z.string().max(2000).optional().or(z.literal('')).transform((value) => value?.trim() || ''),
  sourcePage: z.string().max(255).optional().or(z.literal('')).transform((value) => value?.trim() || ''),
  attachments: z.array(z.object({ name: z.string().max(255), url: z.string().min(1) })).optional().default([]),
})

function json(data, status = 200) {
  return NextResponse.json(data, { status })
}

async function ensureDataPaths() {
  await fsp.mkdir(DATA_DIR, { recursive: true })

  try {
    await fsp.access(RFQ_JSON_PATH)
  } catch {
    await fsp.writeFile(RFQ_JSON_PATH, '[]', 'utf8')
  }

  try {
    await fsp.access(RFQ_CSV_PATH)
  } catch {
    const header = RFQ_CSV_HEADER.map((value) => `"${value}"`).join(',') + '\n'
    await fsp.writeFile(RFQ_CSV_PATH, header, 'utf8')
  }
}

async function readRfqsFromFile() {
  await ensureDataPaths()
  try {
    const content = await fsp.readFile(RFQ_JSON_PATH, 'utf8')
    return JSON.parse(content)
  } catch (err) {
    console.warn('Failed to read RFQ JSON file, returning empty list', err.message)
    return []
  }
}

async function appendRfqToFile(rfq) {
  await ensureDataPaths()
  const rfqs = await readRfqsFromFile()
  rfqs.push(rfq)
  await fsp.writeFile(RFQ_JSON_PATH, JSON.stringify(rfqs, null, 2), 'utf8')

  const escapeValue = (value) => `"${String(value || '').replace(/"/g, '""')}"`
  const row = RFQ_CSV_HEADER.map((key) => escapeValue(rfq[key] ?? '')).join(',') + '\n'
  await fsp.appendFile(RFQ_CSV_PATH, row, 'utf8')
}

export async function GET(request, { params }) {
  const pathParts = (await params)?.path || []
  const route = pathParts.join('/')

  try {
    if (route === '' || route === 'health') {
      return json({ ok: true, service: 'Lokaa Exports API', ts: new Date().toISOString() })
    }

    if (route === 'products') {
      return json({ products: PRODUCTS, categories: CATEGORIES })
    }

    if (route.startsWith('products/')) {
      const slug = route.replace('products/', '')
      const product = PRODUCTS.find((p) => p.slug === slug)
      if (!product) return json({ error: 'Product not found' }, 404)
      return json({ product })
    }

    if (route === 'rfqs') {
      let rfqs = []
      try {
        rfqs = await rfqService.list(200)
      } catch (error) {
        console.warn('MySQL RFQ list query failed, falling back to local storage', error.message)
      }

      if (rfqs.length === 0) {
        rfqs = await readRfqsFromFile()
        rfqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }

      return json({ rfqs, count: rfqs.length })
    }

    if (route === 'stats') {
      let count = 0
      try {
        count = await rfqService.count()
      } catch (error) {
        console.warn('MySQL RFQ count query failed, falling back to local storage', error.message)
      }
      if (!count) {
        const rfqs = await readRfqsFromFile()
        count = rfqs.length
      }
      return json({
        rfqsSubmitted: count,
        countriesServed: COUNTRIES.length,
        yearsOfExcellence: 18,
        productLines: PRODUCTS.length,
        containersShipped: 2400 + count * 3,
      })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    console.error('[API GET ERROR]', route, err)
    return json({ error: 'Internal server error', detail: err.message }, 500)
  }
}

export async function POST(request, { params }) {
  const path = (await params)?.path || []
  const route = path.join('/')

  try {
    const body = await request.json().catch(() => ({}))

    if (route === 'rfqs') {
      const parsed = RFQ_SCHEMA.safeParse(body)
      if (!parsed.success) {
        const issue = parsed.error.issues[0]
        return json({ error: issue?.message || 'Invalid RFQ payload' }, 400)
      }

      const validated = parsed.data
      const rfq = {
        id: uuidv4(),
        reference: 'LKA-' + Date.now().toString(36).toUpperCase().slice(-8),
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        company: validated.company,
        country: validated.country,
        productInterest: validated.productInterest,
        quantity: validated.quantity,
        packaging: validated.packaging,
        destinationPort: validated.targetPort,
        shippingTerms: validated.incoterms,
        targetPrice: validated.targetPrice,
        preferredCurrency: validated.preferredCurrency,
        shipmentDate: validated.shipmentDate,
        message: validated.message,
        customSpecifications: validated.customSpecifications,
        attachments: validated.attachments,
        sourcePage: validated.sourcePage || request.headers.get('referer') || '',
        ipAddress: (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown').split(',')[0].trim(),
        status: 'new',
        createdAt: new Date().toISOString(),
      }

      try {
        await rfqService.create(rfq)
      } catch (error) {
        console.error('Failed to insert RFQ into MySQL', error)
      }

      try {
        await appendRfqToFile(rfq)
      } catch (error) {
        console.error('Failed to persist RFQ to local data store', error)
      }

      return json({ ok: true, rfq }, 201)
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    console.error('[API POST ERROR]', route, err)
    return json({ error: 'Internal server error', detail: err.message }, 500)
  }
}
