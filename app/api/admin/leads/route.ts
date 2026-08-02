// app/api/admin/leads/route.js
// Leads API Endpoint

import { verifyAdmin } from '@/lib/auth-service'
import LeadService from '@/lib/admin/services/lead.service'
import { safeParseInt, sanitizeSearch } from '@/lib/sanitize'

export async function GET(request: any) {
  try {
    const user = await verifyAdmin(request, 'admin')

    const { searchParams } = new URL(request.url)
    const limit = safeParseInt(searchParams.get('limit'), 20, 1, 100)
    const offset = safeParseInt(searchParams.get('offset'), 0, 0, 10000)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedEmployee = searchParams.get('assignedEmployee')
    const search = sanitizeSearch(searchParams.get('search'))
    const action = searchParams.get('action')

    if (action === 'stats') {
      const stats = await LeadService.getLeadStats()
      return Response.json({ success: true, data: stats })
    }

    if (action === 'by-status') {
      const stats = await LeadService.getLeadsByStatus()
      return Response.json({ success: true, data: stats })
    }

    const filters = { status, priority, assignedEmployee, search }
    const pagination = { limit, offset }
    const result = await LeadService.getAllLeads(filters, pagination)

    return Response.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    })
  } catch (error: any) {
    console.error('Leads API error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: any) {
  try {
    const user = await verifyAdmin(request, 'admin')

    const body = await request.json()
    const { customerId, source, productInterest, country, status, priority, assignedEmployee, notes } = body

    if (!customerId || !productInterest) {
      return Response.json(
        { success: false, error: 'Missing required fields: customerId, productInterest' },
        { status: 400 }
      )
    }

    const lead = await LeadService.createLead(
      { customerId, source, productInterest, country, status, priority, assignedEmployee, notes },
      user.sub
    )

    return Response.json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    })
  } catch (error: any) {
    console.error('Create lead error:', error)
    return Response.json(
      { success: false, error: error.message || 'Failed to create lead' },
      { status: 500 }
    )
  }
}

export async function PUT(request: any) {
  try {
    const user = await verifyAdmin(request, 'admin')

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('id')
    const action = searchParams.get('action')

    if (!leadId) {
      return Response.json(
        { success: false, error: 'Missing lead ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    if (action === 'assign') {
      const lead = await LeadService.assignLead(leadId, body.employeeId)
      return Response.json({
        success: true,
        message: 'Lead assigned successfully',
        data: lead
      })
    }

    const lead = await LeadService.updateLead(leadId, body)

    return Response.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    })
  } catch (error: any) {
    console.error('Update lead error:', error)
    return Response.json(
      { success: false, error: error.message || 'Failed to update lead' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: any) {
  try {
    const user = await verifyAdmin(request, 'admin')

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('id')

    if (!leadId) {
      return Response.json(
        { success: false, error: 'Missing lead ID' },
        { status: 400 }
      )
    }

    await LeadService.deleteLead(leadId)

    return Response.json({
      success: true,
      message: 'Lead deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete lead error:', error)
    return Response.json(
      { success: false, error: error.message || 'Failed to delete lead' },
      { status: 500 }
    )
  }
}
