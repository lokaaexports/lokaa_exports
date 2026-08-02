'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Search, Download, Trash2, Edit3, X } from 'lucide-react'
import Breadcrumb from '@/components/admin/Breadcrumb'
import { TableSkeleton, HeaderSkeleton } from '@/components/admin/LoadingSkeleton'
import { EmptyState, ErrorState } from '@/components/admin/EmptyState'
import { DataTable } from '@/components/admin/DataTable'
import { ColumnDef } from '@tanstack/react-table'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [rowSelection, setRowSelection] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<any>(null)
  const [successMessage, setSuccessMessage] = useState<any>(null)
  const [formErrors, setFormErrors] = useState<any>({})

  const [formData, setFormData] = useState<any>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: '',
    industry: '',
    website: '',
    status: 'prospect',
    notes: ''
  })

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('limit', '100')
      params.append('offset', '0')

      const res = await fetch(`/api/admin/customers?${params}`)
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const data = await res.json()
      setCustomers(data.data || [])
    } catch (err: any) {
      console.error('Customers fetch error:', err)
      setError(err.message || 'Failed to load customers')
    } finally {
      setLoading(false)
      setRowSelection({})
    }
  }, [searchTerm, statusFilter])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Validate form
  const validateForm = () => {
    const errors: any = {}
    if (!formData.companyName?.trim()) errors.companyName = 'Company name is required'
    if (!formData.email?.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format'
    if (formData.contactPerson?.trim() === '') errors.contactPerson = 'Contact person cannot be empty'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Create/Update customer
  const handleSaveCustomer = async () => {
    if (!validateForm()) return

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = '/api/admin/customers'
      const body = editingId ? { id: editingId, ...formData } : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) throw new Error(`Failed to save: ${res.status}`)
      
      setSuccessMessage(editingId ? 'Customer updated successfully' : 'Customer created successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      
      setShowForm(false)
      setEditingId(null)
      setFormData({ companyName: '', contactPerson: '', email: '', phone: '', country: '', industry: '', website: '', status: 'prospect', notes: '' })
      setFormErrors({})
      await fetchCustomers()
    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.message || 'Failed to save customer')
    }
  }

  // Edit customer
  const handleEdit = (customer) => {
    setFormData({
      companyName: customer.companyName || customer.company_name || '',
      contactPerson: customer.contactPerson || customer.contact_person || '',
      email: customer.email || '',
      phone: customer.phone || '',
      country: customer.country || '',
      industry: customer.industry || '',
      website: customer.website || '',
      status: customer.status || 'prospect',
      notes: customer.notes || ''
    })
    setEditingId(customer.id)
    setShowForm(true)
  }

  // Delete single customer
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`)
      
      setSuccessMessage('Customer deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      await fetchCustomers()
    } catch (err: any) {
      console.error('Delete error:', err)
      setError(err.message || 'Failed to delete customer')
    }
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    const ids = Object.keys(rowSelection).filter(i => rowSelection[i]).map(i => filteredCustomers[parseInt(i)].id)
    if (ids.length === 0) return
    if (!confirm(`Delete ${ids.length} customer(s)? This cannot be undone.`)) return

    try {
      for (const id of ids) {
        await fetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' })
      }
      setSuccessMessage(`${ids.length} customer(s) deleted successfully`)
      setTimeout(() => setSuccessMessage(null), 3000)
      await fetchCustomers()
    } catch (err: any) {
      console.error('Bulk delete error:', err)
      setError(err.message || 'Failed to delete customers')
    }
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const company = customer.companyName || customer.company_name || ''
      const email = customer.email || ''
      const matchesSearch = company.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [customers, searchTerm, statusFilter])

  // Export CSV
  const handleExportCSV = () => {
    const ids = Object.keys(rowSelection).filter(i => rowSelection[i]).map(i => filteredCustomers[parseInt(i)].id)
    const dataToExport = ids.length > 0 ? filteredCustomers.filter(c => ids.includes(c.id)) : filteredCustomers
    
    if (dataToExport.length === 0) {
      setError('No customers to export')
      return
    }

    const headers = ['Company', 'Contact Person', 'Email', 'Phone', 'Country', 'Industry', 'Status']
    const rows = dataToExport.map(c => [
      c.companyName || c.company_name || '',
      c.contactPerson || c.contact_person || '',
      c.email || '',
      c.phone || '',
      c.country || '',
      c.industry || '',
      c.status || ''
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Close form
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ companyName: '', contactPerson: '', email: '', phone: '', country: '', industry: '', website: '', status: 'prospect', notes: '' })
    setFormErrors({})
  }

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-slate-300"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-slate-300"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.companyName || row.original.company_name}</span>
    },
    {
      accessorKey: 'contactPerson',
      header: 'Contact',
      cell: ({ row }) => <span className="text-sm">{row.original.contactPerson || row.original.contact_person || '-'}</span>
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-sm text-slate-600 dark:text-slate-400">{row.original.email}</span>
    },
    {
      accessorKey: 'country',
      header: 'Country',
      cell: ({ row }) => <span className="text-sm">{row.original.country || '-'}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const statusStyles = status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                             status === 'prospect' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                             'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles}`}>{status}</span>
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(customer)}
              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400 transition"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(customer.id)}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      }
    }
  ], [])

  return (
    <div className="p-8 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Customers' }
      ]} />

      {/* Header */}
      {loading ? <HeaderSkeleton /> : (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Customers</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your customer base</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Customer
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
          title="Failed to load customers"
          description={error}
          onRetry={fetchCustomers}
        />
      )}

      {/* Empty State */}
      {!loading && !error && filteredCustomers.length === 0 && (
        <EmptyState
          icon={Users}
          title="No customers found"
          description={searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first customer to get started'}
          actionLabel="Add Customer"
          onAction={() => setShowForm(true)}
        />
      )}

      {/* Controls */}
      {!loading && !error && customers.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="flex gap-4 flex-wrap bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by company or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Status</option>
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {Object.keys(rowSelection).length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl flex items-center gap-4">
              <span className="text-blue-900 dark:text-blue-300 font-medium text-sm px-2">{Object.keys(rowSelection).filter(k => rowSelection[k]).length} customer(s) selected</span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 text-xs font-semibold transition shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : !error && filteredCustomers.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <DataTable 
            data={filteredCustomers} 
            columns={columns} 
            rowSelection={rowSelection} 
            setRowSelection={setRowSelection} 
          />
        </motion.div>
      ) : null}

      {/* Form Modal */}
      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Company Name *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${formErrors.companyName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                  placeholder="Enter company name"
                />
                {formErrors.companyName && <p className="text-red-600 text-xs mt-1">{formErrors.companyName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${formErrors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                  placeholder="company@example.com"
                />
                {formErrors.email && <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>}
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Contact Person</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="John Doe"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="India"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Manufacturing"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="https://example.com"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="prospect">Prospect</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Notes - Full Width */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Add any additional notes..."
                  rows={2}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleCloseForm}
                className="px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomer}
                className="px-6 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm"
              >
                {editingId ? 'Update Customer' : 'Create Customer'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
