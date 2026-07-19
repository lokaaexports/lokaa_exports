import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import CustomerTaskService from '@/lib/admin/services/customer-task.service'
import { logAudit } from '@/lib/admin/services/audit.service'
import { hasPermission } from '@/lib/admin/modules/rbac/utils/permissions'

const taskService = new CustomerTaskService()

export async function GET(request) {
  try {
    const user = await verifyAdmin(request, 'admin')
    if (!await hasPermission(user.id, 'tasks:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const customerId = searchParams.get('customerId')
    const leadId = searchParams.get('leadId')
    const limit = parseInt(searchParams.get('limit')) || 20
    const offset = parseInt(searchParams.get('offset')) || 0

    if (action === 'stats') {
      const stats = await taskService.getTaskStats()
      return NextResponse.json({ data: stats })
    }

    if (action === 'overdue') {
      const tasks = await taskService.getOverdueTasks()
      return NextResponse.json({ data: tasks })
    }

    if (customerId) {
      const tasks = await taskService.getTasksByCustomer(customerId, limit, offset)
      return NextResponse.json({ data: tasks })
    }

    if (leadId) {
      const tasks = await taskService.getTasksByLead(leadId, limit, offset)
      return NextResponse.json({ data: tasks })
    }

    const filters = {}
    if (searchParams.get('status')) filters.status = searchParams.get('status')
    if (searchParams.get('priority')) filters.priority = searchParams.get('priority')
    if (searchParams.get('search')) filters.search = searchParams.get('search')

    const tasks = await taskService.getAllTasks(filters, limit, offset)
    return NextResponse.json({ data: tasks })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await verifyAdmin(request, 'admin')
    if (!await hasPermission(user.id, 'tasks:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const taskData = await request.json()
    const result = await taskService.createTask(taskData, taskData.createdBy)
    await logAudit({ userId: user.id, action: 'task_created', entity: 'task', entityId: result.insertId ? String(result.insertId) : null, changes: taskData, ipAddress: request.headers.get('x-forwarded-for'), userAgent: request.headers.get('user-agent') })
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await verifyAdmin(request, 'admin')
    if (!await hasPermission(user.id, 'tasks:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')
    const action = searchParams.get('action')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const updateData = await request.json()

    if (action === 'complete') {
      const result = await taskService.completeTask(taskId)
      await logAudit({ userId: user.id, action: 'task_completed', entity: 'task', entityId: taskId, ipAddress: request.headers.get('x-forwarded-for'), userAgent: request.headers.get('user-agent') })
      return NextResponse.json({ data: result })
    }

    const result = await taskService.updateTask(taskId, updateData)
    await logAudit({ userId: user.id, action: 'task_updated', entity: 'task', entityId: taskId, changes: updateData, ipAddress: request.headers.get('x-forwarded-for'), userAgent: request.headers.get('user-agent') })
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const user = await verifyAdmin(request, 'admin')
    if (!await hasPermission(user.id, 'tasks:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const result = await taskService.deleteTask(taskId)
    await logAudit({ userId: user.id, action: 'task_deleted', entity: 'task', entityId: taskId, ipAddress: request.headers.get('x-forwarded-for'), userAgent: request.headers.get('user-agent') })
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
