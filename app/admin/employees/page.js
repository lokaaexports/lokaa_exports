'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Search, Download, Trash2, Edit3, X, Calendar } from 'lucide-react'
import Breadcrumb from '@/components/admin/Breadcrumb'
import { TableSkeleton, HeaderSkeleton } from '@/components/admin/LoadingSkeleton'
import { EmptyState, ErrorState } from '@/components/admin/EmptyState'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    roleId: '',
    status: 'active',
    joiningDate: ''
  })

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/employees?action=list-departments')
      if (res.ok) {
        const data = await res.json()
        setDepartments(data.data || [])
      }
    } catch (err) {
      console.error('Departments fetch error:', err)
    }
  }, [])

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/employees?action=roles')
      if (res.ok) {
        const data = await res.json()
        setRoles(data.data || [])
        if (!formData.roleId) {
          const employeeRole = (data.data || []).find(role => role.slug === 'employee')
          if (employeeRole) {
            setFormData(current => ({ ...current, roleId: String(employeeRole.id) }))
          }
        }
      }
    } catch (err) {
      console.error('Roles fetch error:', err)
    }
  }, [formData.roleId])

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (deptFilter !== 'all') params.append('department', deptFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('limit', '100')
      params.append('offset', '0')

      const res = await fetch(`/api/admin/employees?${params}`)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const data = await res.json()
      setEmployees(data.data || [])
    } catch (err) {
      console.error('Employees fetch error:', err)
      setError(err.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, deptFilter, statusFilter])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // Validate form
  const validateForm = () => {
    const errors = {}
    if (!formData.firstName?.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName?.trim()) errors.lastName = 'Last name is required'
    if (!formData.email?.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format'
    if (!formData.department?.trim()) errors.department = 'Department is required'
    if (!formData.joiningDate) errors.joiningDate = 'Joining date is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Create/Update employee
  const handleSaveEmployee = async () => {
    if (!validateForm()) return

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = '/api/admin/employees'
      const body = editingId ? { id: editingId, ...formData } : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) throw new Error(`Failed to save: ${res.status}`)
      
      setSuccessMessage(editingId ? 'Employee updated successfully' : 'Employee created successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      
      setShowForm(false)
      setEditingId(null)
      setFormData({ firstName: '', lastName: '', email: '', phone: '', department: '', roleId: '', status: 'active', joiningDate: '' })
      setFormErrors({})
      await fetchEmployees()
    } catch (err) {
      console.error('Save error:', err)
      setError(err.message || 'Failed to save employee')
    }
  }

  // Edit employee
  const handleEdit = (emp) => {
    setFormData({
      firstName: emp.firstName || emp.first_name || '',
      lastName: emp.lastName || emp.last_name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || '',
      roleId: String(emp.roleId || emp.role?.id || ''),
      status: emp.status || 'active',
      joiningDate: emp.joiningDate || emp.joining_date || ''
    })
    setEditingId(emp.id)
    setShowForm(true)
  }

  // Delete single employee
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/admin/employees?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`)
      
      setSuccessMessage('Employee deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      await fetchEmployees()
    } catch (err) {
      console.error('Delete error:', err)
      setError(err.message || 'Failed to delete employee')
    }
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} employee(s)? This cannot be undone.`)) return

    try {
      for (const id of selectedIds) {
        await fetch(`/api/admin/employees?id=${id}`, { method: 'DELETE' })
      }
      setSuccessMessage(`${selectedIds.length} employee(s) deleted successfully`)
      setTimeout(() => setSuccessMessage(null), 3000)
      setSelectedIds([])
      await fetchEmployees()
    } catch (err) {
      console.error('Bulk delete error:', err)
      setError(err.message || 'Failed to delete employees')
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    if (employees.length === 0) {
      setError('No employees to export')
      return
    }

    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Role', 'Status', 'Joining Date']
    const rows = employees.map(e => [
      e.firstName || e.first_name || '',
      e.lastName || e.last_name || '',
      e.email || '',
      e.phone || '',
      e.department || '',
      e.role?.name || e.roleId || '',
      e.status || '',
      e.joiningDate || e.joining_date || ''
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `employees_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Close form
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ firstName: '', lastName: '', email: '', phone: '', department: '', roleId: '', status: 'active', joiningDate: '' })
    setFormErrors({})
  }

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName || emp.first_name} ${emp.lastName || emp.last_name}`.toLowerCase()
    const email = (emp.email || '').toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         email.includes(searchTerm.toLowerCase())
    const matchesDept = deptFilter === 'all' || emp.department === deptFilter
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter
    return matchesSearch && matchesDept && matchesStatus
  })

  return (
    <div className="p-8 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Employees' }
      ]} />

      {/* Header */}
      {loading ? <HeaderSkeleton /> : (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Employees</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your team members</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </motion.div>
      )}

      {/* Success Message */}
      {successMessage && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-800 dark:text-emerald-300">
          {successMessage}
        </motion.div>
      )}

      {/* Error State */}
      {error && !loading && (
        <ErrorState
          title="Failed to load employees"
          description={error}
          onRetry={fetchEmployees}
        />
      )}

      {/* Empty State */}
      {!loading && !error && filteredEmployees.length === 0 && (
        <EmptyState
          icon={Users}
          title="No employees found"
          description={searchTerm || deptFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first employee to get started'}
          actionLabel="Add Employee"
          onAction={() => setShowForm(true)}
        />
      )}

      {/* Controls */}
      {!loading && !error && employees.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id || d.name} value={d.name || d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
            <button
              onClick={handleExportCSV}
              className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg flex items-center justify-between">
              <span className="text-blue-900 dark:text-blue-300 font-medium">{selectedIds.length} employee(s) selected</span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-2 text-sm transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} columns={8} />
      ) : !error && filteredEmployees.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(filteredEmployees.map(e => e.id))
                      else setSelectedIds([])
                    }}
                    className="w-5 h-5 rounded border-slate-300"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Joining Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredEmployees.map((emp, index) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(emp.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds([...selectedIds, emp.id])
                        else setSelectedIds(selectedIds.filter(id => id !== emp.id))
                      }}
                      className="w-5 h-5 rounded border-slate-300"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-sm">{emp.firstName || emp.first_name} {emp.lastName || emp.last_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{emp.email}</td>
                  <td className="px-6 py-4 text-sm">{emp.department}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      emp.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                      emp.status === 'inactive' ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {emp.joiningDate || emp.joining_date ? new Date(emp.joiningDate || emp.joining_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400 transition"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : null}

      {/* Form Modal */}
      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${formErrors.firstName ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                  placeholder="John"
                />
                {formErrors.firstName && <p className="text-red-600 text-sm mt-1">{formErrors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${formErrors.lastName ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                  placeholder="Doe"
                />
                {formErrors.lastName && <p className="text-red-600 text-sm mt-1">{formErrors.lastName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${formErrors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                  placeholder="john@example.com"
                />
                {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${formErrors.department ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id || d.name} value={d.name || d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {formErrors.department && <p className="text-red-600 text-sm mt-1">{formErrors.department}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hire Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Joining Date *</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${formErrors.joiningDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                />
                {formErrors.joiningDate && <p className="text-red-600 text-sm mt-1">{formErrors.joiningDate}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleCloseForm}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEmployee}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
              >
                {editingId ? 'Update Employee' : 'Create Employee'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
