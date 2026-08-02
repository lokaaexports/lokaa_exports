'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Check, Edit3, Loader2, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

const ROLE_LEVELS = [
  { value: 0, label: 'Super Admin' },
  { value: 1, label: 'Admin' },
  { value: 2, label: 'Employee' },
]

const EMPTY_ROLE = {
  id: null,
  name: '',
  slug: '',
  description: '',
  level: 1,
  permissionIds: [],
}

const EMPTY_PERMISSION = {
  id: null,
  name: '',
  slug: '',
  description: '',
  module: 'rbac',
  action: 'read',
}

export default function RbacPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [roles, setRoles] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [matrix, setMatrix] = useState<any>({})
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE)
  const [permissionForm, setPermissionForm] = useState(EMPTY_PERMISSION)
  const [activeTab, setActiveTab] = useState('roles')

  const selectedPermissionSet = useMemo(() => new Set(roleForm.permissionIds), [roleForm.permissionIds])

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/rbac')
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load RBAC data')
      setRoles(payload.roles || [])
      setPermissions(payload.permissions || [])
      setMatrix(payload.matrix || {})
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const seedPermissions = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/rbac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'seed' }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to seed permissions')
      toast.success(`Seeded ${payload.seeded} permissions`)
      await load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const saveRole = async () => {
    try {
      setSaving(true)
      const method = roleForm.id ? 'PUT' : 'POST'
      const response = await fetch('/api/admin/rbac', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'role', ...roleForm }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to save role')
      toast.success(roleForm.id ? 'Role updated' : 'Role created')
      setRoleForm(EMPTY_ROLE)
      await load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const savePermission = async () => {
    try {
      setSaving(true)
      const method = permissionForm.id ? 'PUT' : 'POST'
      const response = await fetch('/api/admin/rbac', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'permission', ...permissionForm }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to save permission')
      toast.success(permissionForm.id ? 'Permission updated' : 'Permission created')
      setPermissionForm(EMPTY_PERMISSION)
      await load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteRecord = async (kind, id) => {
    if (!confirm('Delete this record?')) return
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/rbac?kind=${kind}&id=${id}`, { method: 'DELETE' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to delete record')
      toast.success('Deleted')
      await load()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const startEditRole = (role) => {
    setActiveTab('roles')
    setRoleForm({
      id: role.id,
      name: role.name || '',
      slug: role.slug || '',
      description: role.description || '',
      level: role.level ?? 1,
      permissionIds: (role.permissions || []).map((permission) => permission.id),
    })
  }

  const startEditPermission = (permission) => {
    setActiveTab('permissions')
    setPermissionForm({
      id: permission.id,
      name: permission.name || '',
      slug: permission.slug || '',
      description: permission.description || '',
      module: permission.module || 'rbac',
      action: permission.action || 'read',
    })
  }

  const togglePermission = (permissionId) => {
    setRoleForm((current) => {
      const next = new Set(current.permissionIds)
      if (next.has(permissionId)) {
        next.delete(permissionId)
      } else {
        next.add(permissionId)
      }
      return { ...current, permissionIds: Array.from(next) }
    })
  }

  return (
    <>
      <SectionPage
        subtitle="RBAC"
        title="Roles and permissions"
        description="Create roles, seed permissions, and assign capability matrices across the platform."
        links={[{ href: '/admin/platform', label: 'Back to Platform' }]}
        stats={[
          { label: 'Roles', value: roles.length },
          { label: 'Permissions', value: permissions.length },
          { label: 'Modules', value: Object.keys(matrix).length },
          { label: 'Levels', value: ROLE_LEVELS.length },
        ]}
        highlights={[
          { title: 'Role CRUD', description: 'Create and update Super Admin, Admin, and Employee roles.' },
          { title: 'Permission matrix', description: 'Map module/action pairs to roles.' },
          { title: 'Seed defaults', description: 'Load the standard enterprise permission catalog.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setActiveTab('roles')} className={`rounded-2xl px-4 py-2 text-sm font-semibold ${activeTab === 'roles' ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}>Roles</button>
          <button onClick={() => setActiveTab('permissions')} className={`rounded-2xl px-4 py-2 text-sm font-semibold ${activeTab === 'permissions' ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}>Permissions</button>
          <button onClick={seedPermissions} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Seed defaults
          </button>
        </div>

        {activeTab === 'roles' && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{roleForm.id ? 'Edit role' : 'Create role'}</h2>
                <button onClick={() => setRoleForm(EMPTY_ROLE)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">Reset</button>
              </div>
              <div className="mt-4 space-y-3">
                <input value={roleForm.name} onChange={(event) => setRoleForm({ ...roleForm, name: event.target.value, slug: roleForm.slug || event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} placeholder="Role name" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <input value={roleForm.slug} onChange={(event) => setRoleForm({ ...roleForm, slug: event.target.value })} placeholder="role-slug" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <select value={roleForm.level} onChange={(event) => setRoleForm({ ...roleForm, level: Number(event.target.value) })} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                  {ROLE_LEVELS.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                </select>
                <textarea value={roleForm.description} onChange={(event) => setRoleForm({ ...roleForm, description: event.target.value })} placeholder="Description" rows={4} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Permissions</p>
                  <div className="max-h-72 space-y-2 overflow-auto rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                    {permissions.map((permission) => (
                      <label key={permission.id} className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <input type="checkbox" checked={selectedPermissionSet.has(permission.id)} onChange={() => togglePermission(permission.id)} className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600" />
                        <span>
                          <span className="block text-sm font-medium text-slate-900 dark:text-white">{permission.name}</span>
                          <span className="block text-xs text-slate-500">{permission.module}:{permission.action}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={saveRole} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {roleForm.id ? 'Update role' : 'Create role'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading roles...
                </div>
              ) : roles.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">No roles defined yet.</div>
              ) : roles.map((role) => (
                <div key={role.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">Level {role.level}</p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{role.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{role.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditRole(role)} className="rounded-xl border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => deleteRecord('role', role.id)} className="rounded-xl border border-slate-200 p-2 text-red-600 dark:border-slate-700"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{role.description || 'No description provided.'}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(role.permissions || []).map((permission) => (
                      <span key={permission.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {permission.slug}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'permissions' && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{permissionForm.id ? 'Edit permission' : 'Create permission'}</h2>
                <button onClick={() => setPermissionForm(EMPTY_PERMISSION)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">Reset</button>
              </div>
              <div className="mt-4 space-y-3">
                <input value={permissionForm.name} onChange={(event) => setPermissionForm({ ...permissionForm, name: event.target.value, slug: permissionForm.slug || event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} placeholder="Permission name" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <input value={permissionForm.slug} onChange={(event) => setPermissionForm({ ...permissionForm, slug: event.target.value })} placeholder="module:action" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={permissionForm.module} onChange={(event) => setPermissionForm({ ...permissionForm, module: event.target.value })} placeholder="Module" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                  <input value={permissionForm.action} onChange={(event) => setPermissionForm({ ...permissionForm, action: event.target.value })} placeholder="Action" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                </div>
                <textarea value={permissionForm.description} onChange={(event) => setPermissionForm({ ...permissionForm, description: event.target.value })} placeholder="Description" rows={4} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
                <button onClick={savePermission} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {permissionForm.id ? 'Update permission' : 'Create permission'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading permissions...
                </div>
              ) : permissions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">No permissions defined yet.</div>
              ) : permissions.map((permission) => (
                <div key={permission.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">{permission.module}:{permission.action}</p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{permission.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{permission.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditPermission(permission)} className="rounded-xl border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => deleteRecord('permission', permission.id)} className="rounded-xl border border-slate-200 p-2 text-red-600 dark:border-slate-700"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{permission.description || 'No description provided.'}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
