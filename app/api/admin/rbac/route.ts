import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth-service'
import PermissionService from '@/lib/admin/modules/rbac/services/permission.service'
import RoleService from '@/lib/admin/modules/rbac/services/role.service'

function normalizeSlug(value: any) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(request: any) {
  try {
    await verifyAdmin(request)
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'all'

    const [roles, permissions] = await Promise.all([
      RoleService.getRoleHierarchy(),
      PermissionService.getAllPermissions({ limit: 500 }),
    ])

    if (view === 'roles') {
      return NextResponse.json({ success: true, roles })
    }

    if (view === 'permissions') {
      return NextResponse.json({ success: true, permissions })
    }

    const matrix = await PermissionService.getModulePermissionMatrix()
    return NextResponse.json({ success: true, roles, permissions, matrix })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to load RBAC data' }, { status: 500 })
  }
}

export async function POST(request: any) {
  try {
    await verifyAdmin(request)
    const payload = await request.json()
    const kind = payload.kind || 'role'

    if (kind === 'seed') {
      const seeded = await PermissionService.seedDefaultPermissions()
      return NextResponse.json({ success: true, seeded })
    }

    if (kind === 'permission') {
      const permission = await PermissionService.createPermission({
        name: payload.name,
        slug: payload.slug || normalizeSlug(payload.name),
        description: payload.description,
        module: payload.module,
        action: payload.action,
      })
      return NextResponse.json({ success: true, permission }, { status: 201 })
    }

    const role = await RoleService.createRole({
      name: payload.name,
      slug: payload.slug || normalizeSlug(payload.name),
      description: payload.description,
      level: Number(payload.level ?? 0),
      permissionIds: Array.isArray(payload.permissionIds) ? payload.permissionIds.map(Number) : [],
    })
    return NextResponse.json({ success: true, role }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to create RBAC record' }, { status: 500 })
  }
}

export async function PUT(request: any) {
  try {
    await verifyAdmin(request)
    const payload = await request.json()
    const kind = payload.kind || 'role'

    if (kind === 'permission') {
      if (!payload.id) {
        return NextResponse.json({ success: false, error: 'Permission id is required' }, { status: 400 })
      }
      const permission = await PermissionService.updatePermission(Number(payload.id), {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        module: payload.module,
        action: payload.action,
      })
      return NextResponse.json({ success: true, permission })
    }

    if (!payload.id) {
      return NextResponse.json({ success: false, error: 'Role id is required' }, { status: 400 })
    }
    const role = await RoleService.updateRole(Number(payload.id), {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      level: payload.level !== undefined ? Number(payload.level) : undefined,
      permissionIds: Array.isArray(payload.permissionIds) ? payload.permissionIds.map(Number) : undefined,
    })
    return NextResponse.json({ success: true, role })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to update RBAC record' }, { status: 500 })
  }
}

export async function DELETE(request: any) {
  try {
    await verifyAdmin(request)
    const { searchParams } = new URL(request.url)
    const kind = searchParams.get('kind') || 'role'
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    }

    if (kind === 'permission') {
      await PermissionService.deletePermission(Number(id))
      return NextResponse.json({ success: true })
    }

    await RoleService.deleteRole(Number(id))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unable to delete RBAC record' }, { status: 500 })
  }
}
