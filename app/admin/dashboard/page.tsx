'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  RefreshCw, 
  Package, 
  FileText, 
  Users, 
  Activity, 
  Plus, 
  List, 
  UsersRound, 
  Image as ImageIcon,
  Server,
  Database,
  Cpu
} from 'lucide-react'
import Breadcrumb from '@/components/admin/Breadcrumb'
import KPICard from '@/components/admin/dashboard/KPICard'
import ChartCard from '@/components/admin/dashboard/ChartCard'
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed'

export default function DashboardPage() {
  const [data, setData] = useState<any>({
    totalProducts: 0,
    activeRfqs: 0,
    totalEmployees: 0,
    recentRfqs: [],
    departments: []
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      setError(null)
      
      const [productsRes, rfqsRes, employeesRes, deptRes] = await Promise.all([
        fetch('/api/admin/catalog/products?limit=1').catch(() => null),
        fetch('/api/admin/rfqs?limit=1').catch(() => null),
        fetch('/api/admin/employees?action=stats').catch(() => null),
        fetch('/api/admin/employees?action=departments').catch(() => null)
      ])

      let totalProducts = 0
      let productsFailed = !productsRes || !productsRes.ok
      if (productsRes?.ok) {
        const productsData = await productsRes.json()
        totalProducts = Array.isArray(productsData?.data) ? productsData.data.length : (productsData?.total || 0)
      }

      let activeRfqs = 0
      let recentRfqs = []
      let rfqsFailed = !rfqsRes || !rfqsRes.ok
      if (rfqsRes?.ok) {
        const rfqsData = await rfqsRes.json()
        const rfqsList = Array.isArray(rfqsData?.data) ? rfqsData.data : []
        activeRfqs = rfqsList.filter(r => r.status === 'pending').length
        recentRfqs = rfqsList.slice(0, 5)
      }

      let totalEmployees = 0
      let employeesFailed = !employeesRes || !employeesRes.ok
      if (employeesRes?.ok) {
        const employeesData = await employeesRes.json()
        totalEmployees = employeesData?.data?.total_employees || 0
      }

      let departments = []
      let deptFailed = !deptRes || !deptRes.ok
      if (deptRes?.ok) {
        const deptData = await deptRes.json()
        departments = Array.isArray(deptData?.data) ? deptData.data : []
      }

      if (productsFailed || rfqsFailed || employeesFailed || deptFailed) {
        setError('Some dashboard data failed to load. Displayed metrics may be stale or incomplete.')
      }

      setData({
        totalProducts,
        activeRfqs,
        totalEmployees,
        recentRfqs,
        departments
      })
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      setError('An unexpected error occurred while loading dashboard metrics.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRefresh = () => {
    fetchDashboardData()
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'pending') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400">Pending</span>
    }
    if (s === 'confirmed' || s === 'approved' || s === 'completed') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">Confirmed</span>
    }
    if (s === 'rejected' || s === 'cancelled') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400">Rejected</span>
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">{status}</span>
  }

  const maxDeptEmployees = Math.max(...data.departments.map(d => d.employee_count || 0), 1)

  return (
    <div className="w-full text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Breadcrumb />
            <h1 className="text-3xl font-bold mt-2">Command Center</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{today}</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error Warning Banner */}
        {error && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-400 text-sm flex items-center gap-2">
            <span className="font-semibold">Notice:</span> {error}
          </div>
        )}

        {/* Row 1 - KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Products</p>
                <p className="text-3xl font-bold mt-2">{loading ? '...' : data.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">+12%</span>
              <span className="text-slate-500 ml-2">from last month</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active RFQs</p>
                <p className="text-3xl font-bold mt-2">{loading ? '...' : data.activeRfqs}</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-amber-600 dark:text-amber-400 font-medium">{data.activeRfqs} pending</span>
              <span className="text-slate-500 ml-2">require attention</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Employees</p>
                <p className="text-3xl font-bold mt-2">{loading ? '...' : data.totalEmployees}</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">+2%</span>
              <span className="text-slate-500 ml-2">from last month</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">System Health</p>
                <p className="text-xl font-bold mt-2 text-green-600 dark:text-green-400">Operational</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
              <span className="text-slate-500">All services running</span>
            </div>
          </motion.div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Recent RFQs */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent RFQs</h2>
              <Link href="/admin/rfqs" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">RFQ ID</th>
                    <th className="px-6 py-4 font-medium">Company</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading RFQs...</td>
                    </tr>
                  ) : data.recentRfqs.length > 0 ? (
                    data.recentRfqs.map((rfq, idx) => (
                      <tr key={rfq.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                          {rfq.rfq_number || rfq.id || `RFQ-${idx + 1000}`}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {rfq.company_name || rfq.customer_name || 'Unknown Company'}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {rfq.created_at ? new Date(rfq.created_at).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(rfq.status)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No recent RFQs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <Link href="/admin/catalog/new" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">Add Product</span>
              </Link>
              
              <Link href="/admin/rfqs" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <List className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">View RFQs</span>
              </Link>

              <Link href="/admin/customers" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <UsersRound className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">Manage Customers</span>
              </Link>

              <Link href="/admin/media" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">Media Library</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Department Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6">Department Distribution</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse flex items-center gap-4">
                    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-200 dark:bg-slate-700 w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : data.departments.length > 0 ? (
              <div className="space-y-5">
                {data.departments.map((dept, i) => {
                  const percentage = Math.round((dept.employee_count / maxDeptEmployees) * 100)
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium truncate" title={dept.department}>
                        {dept.department}
                      </div>
                      <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full bg-blue-500 rounded-full"
                        ></motion.div>
                      </div>
                      <div className="w-8 text-right text-sm text-slate-500 font-medium">
                        {dept.employee_count}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">No department data available.</div>
            )}
          </div>

          {/* Right - System Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6">System Information</h2>
            <div className="space-y-4">
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-200 dark:border-slate-600">
                    <Server className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Environment</p>
                    <p className="text-xs text-slate-500 mt-0.5">Node.js v20.x (Production)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">
                    Stable
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-200 dark:border-slate-600">
                    <Database className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Database</p>
                    <p className="text-xs text-slate-500 mt-0.5">PostgreSQL Primary</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">
                    Connected
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-200 dark:border-slate-600">
                    <Cpu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Redis Cache</p>
                    <p className="text-xs text-slate-500 mt-0.5">Hit rate: 94.2%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">
                    Active
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
