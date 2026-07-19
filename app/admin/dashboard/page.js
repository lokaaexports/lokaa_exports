'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, Calendar, ChevronRight, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import Breadcrumb from '@/components/admin/Breadcrumb'
import KPICard from '@/components/admin/dashboard/KPICard'
import ChartCard from '@/components/admin/dashboard/ChartCard'
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const chartData = [
  { label: 'Mon', value: 65 },
  { label: 'Tue', value: 78 },
  { label: 'Wed', value: 92 },
  { label: 'Thu', value: 81 },
  { label: 'Fri', value: 56 },
  { label: 'Sat', value: 87 },
  { label: 'Sun', value: 73 },
]

const quickLinks = [
  { href: '/admin/products-advanced', label: 'Manage products', hint: 'Inventory, visibility, and pricing' },
  { href: '/admin/rfq', label: 'Review RFQs', hint: 'Quote follow-up and response flow' },
  { href: '/admin/customers', label: 'Customer directory', hint: 'Account and relationship overview' },
]

function MetricTile({ label, value, note, icon: Icon, tone = 'navy' }) {
  const toneClass =
    tone === 'gold'
      ? 'bg-gold/10 text-gold'
      : tone === 'emerald'
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-navy/5 text-navy'

  return (
    <Card className="border border-navy/10 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-graphite/45">{label}</p>
            <p className="mt-2 font-display text-3xl text-navy">{value}</p>
            <p className="mt-2 text-sm text-graphite/65">{note}</p>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [employeeStats, setEmployeeStats] = useState(null)
  const [departmentStats, setDepartmentStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const statsResponse = await fetch('/api/admin/employees?action=stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setEmployeeStats(statsData.data)
      }

      const deptResponse = await fetch('/api/admin/employees?action=departments')
      if (deptResponse.ok) {
        const deptData = await deptResponse.json()
        setDepartmentStats(deptData.data || [])
      }

      setError(null)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const departmentChartData = useMemo(
    () =>
      departmentStats.length > 0
        ? departmentStats.map((dept) => ({ label: dept.department, value: dept.employee_count }))
        : chartData,
    [departmentStats]
  )

  const totalEmployees = employeeStats?.total_employees || 0

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(26,71,42,0.06),_transparent_28%),linear-gradient(180deg,_#f8faf7_0%,_#ffffff_42%,_#f6f5ef_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2rem] border border-navy/10 bg-navy-deep p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/75">
                <Calendar className="h-3.5 w-3.5 text-gold" />
                Admin dashboard
              </div>
              <h1 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
                Premium control center for export operations.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/75">
                Monitor products, customers, RFQs, and operational health without the visual noise of a dense admin console.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {quickLinks.map((item) => (
                <Link key={item.href} href={item.href} className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:bg-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-sm text-white/65">{item.hint}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gold transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mt-6 border-rose-200 bg-rose-50 text-rose-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KPICard
            title="Total Employees"
            value={loading ? '...' : employeeStats?.total_employees || 0}
            change={employeeStats && totalEmployees ? `${Math.round((employeeStats.active_employees / totalEmployees) * 100)}% Active` : '-'}
            trend="up"
            icon={Users}
            color="emerald"
          />
          <KPICard
            title="Active Employees"
            value={loading ? '...' : employeeStats?.active_employees || 0}
            change={employeeStats && totalEmployees ? `${Math.round((employeeStats.active_employees / totalEmployees) * 100)}%` : '-'}
            trend="up"
            icon={Users}
            color="blue"
          />
          <KPICard
            title="On Leave"
            value={loading ? '...' : employeeStats?.on_leave_employees || 0}
            change={employeeStats && totalEmployees ? `${Math.round((employeeStats.on_leave_employees / totalEmployees) * 100)}%` : '-'}
            trend={employeeStats?.on_leave_employees > 5 ? 'down' : 'up'}
            icon={Calendar}
            color="orange"
          />
          <KPICard
            title="Inactive"
            value={loading ? '...' : employeeStats?.inactive_employees || 0}
            change={employeeStats && totalEmployees ? `${Math.round((employeeStats.inactive_employees / totalEmployees) * 100)}%` : '-'}
            trend="down"
            icon={AlertCircle}
            color="red"
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <ChartCard title="Employees by Department" subtitle="Current headcount distribution" data={departmentChartData} type="bar" />

          <Card className="border border-navy/10 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <CardHeader className="border-b border-navy/5 bg-white/70">
              <CardTitle className="text-lg text-navy">Department breakdown</CardTitle>
              <CardDescription>Composition by department and activity level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {loading ? (
                <p className="text-sm text-graphite/65">Loading department data...</p>
              ) : departmentStats.length > 0 ? (
                departmentStats.map((dept, index) => (
                  <div key={dept.department} className="rounded-2xl border border-navy/10 bg-ivory p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-navy">{dept.department}</p>
                        <p className="text-sm text-graphite/65">{dept.active_count} active</p>
                      </div>
                      <span className="text-sm font-semibold text-navy">{dept.employee_count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-gold"
                        style={{
                          width: `${(dept.employee_count / (totalEmployees || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-navy/15 bg-ivory p-6 text-sm text-graphite/65">
                  No department data available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <ActivityFeed />

          <Card className="border border-navy/10 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <CardHeader className="border-b border-navy/5 bg-white/70">
              <CardTitle className="text-lg text-navy">Operational snapshot</CardTitle>
              <CardDescription>Short-term revenue and conversion context</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
              <div className="rounded-2xl border border-navy/10 bg-ivory p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-graphite/45">Pending RFQs</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="font-display text-3xl text-navy">23</span>
                  <ShoppingCart className="h-5 w-5 text-gold" />
                </div>
              </div>
              <div className="rounded-2xl border border-navy/10 bg-ivory p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-graphite/45">This month</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="font-display text-3xl text-navy">₹45L</span>
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="rounded-2xl border border-navy/10 bg-ivory p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-graphite/45">Conversion rate</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="font-display text-3xl text-navy">34%</span>
                  <Package className="h-5 w-5 text-navy" />
                </div>
              </div>
              <div className="rounded-2xl border border-navy/10 bg-ivory p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-graphite/45">Growth rate</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="font-display text-3xl text-navy">+18%</span>
                  <TrendingUp className="h-5 w-5 text-gold" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
