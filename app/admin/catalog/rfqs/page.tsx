'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import RFQViewer from '@/components/admin/catalog/RFQViewer'
import { Loader2, Search, RefreshCw, Eye } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_COLORS = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  viewed: 'bg-purple-50 text-purple-700 border-purple-200',
  quoted: 'bg-green-50 text-green-700 border-green-200',
  converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

const PRIORITY_COLORS = {
  normal: 'bg-gray-50 text-gray-700 border-gray-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
}

export default function RFQManagementPage() {
  const [rfqs, setRfqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRFQ, setSelectedRFQ] = useState<any>(null)
  const [filters, setFilters] = useState<any>({
    status: '',
    priority: '',
    search: ''
  })

  useEffect(() => {
    loadRFQs()
  }, [filters])

  const loadRFQs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/admin/catalog/rfq-enquiries?${params}`, {
        method: 'GET'
      })

      if (!response.ok) throw new Error('Failed to load RFQs')

      const result = await response.json()
      setRfqs(result.data || [])
    } catch (error: any) {
      console.error('Error loading RFQs:', error)
      toast.error('Failed to load RFQs')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (updatedRFQ) => {
    setRfqs(rfqs.map(r => r.id === updatedRFQ.id ? updatedRFQ : r))
    setSelectedRFQ(updatedRFQ)
  }

  return (
    <div className="min-h-screen bg-ivory px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-navy">RFQ Management</h1>
          <p className="mt-2 text-graphite/70">View and manage all customer requests for quotation</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-6 border-navy/10">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-graphite/60 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-graphite/40" />
                <Input
                  placeholder="Search by name, email, company..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-graphite/60 mb-2">Status</label>
              <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-graphite/60 mb-2">Priority</label>
              <Select value={filters.priority} onValueChange={(val) => setFilters({ ...filters, priority: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All priorities</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={loadRFQs} 
                disabled={loading}
                className="w-full bg-navy hover:bg-navy/90"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* RFQ Table */}
        <Card className="border-navy/10 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-gold animate-spin" />
            </div>
          ) : rfqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-graphite/60 text-lg">No RFQs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-navy/10 bg-navy/5">
                  <TableHead className="text-navy font-semibold">Reference</TableHead>
                  <TableHead className="text-navy font-semibold">Contact</TableHead>
                  <TableHead className="text-navy font-semibold">Company</TableHead>
                  <TableHead className="text-navy font-semibold">Product</TableHead>
                  <TableHead className="text-navy font-semibold">Country</TableHead>
                  <TableHead className="text-navy font-semibold">Status</TableHead>
                  <TableHead className="text-navy font-semibold">Priority</TableHead>
                  <TableHead className="text-navy font-semibold">Date</TableHead>
                  <TableHead className="text-navy font-semibold text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfqs.map((rfq) => (
                  <TableRow key={rfq.id} className="border-navy/10 hover:bg-navy/5 transition">
                    <TableCell className="font-mono text-sm font-semibold text-navy">{rfq.reference}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium text-navy">{rfq.buyerName}</p>
                        <p className="text-xs text-graphite/60">{rfq.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-navy">{rfq.companyName || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-navy">{rfq.productInterest || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-navy">{rfq.country}</TableCell>
                    <TableCell>
                      <Badge className={`${STATUS_COLORS[rfq.status]} border`}>
                        {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${PRIORITY_COLORS[rfq.priority]} border`}>
                        {rfq.priority.charAt(0).toUpperCase() + rfq.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-graphite/70">
                      {new Date(rfq.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedRFQ(rfq)}
                        className="text-gold hover:text-gold/80 hover:bg-gold/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Pagination Info */}
        {!loading && rfqs.length > 0 && (
          <div className="mt-4 text-center text-sm text-graphite/60">
            Showing {rfqs.length} RFQ{rfqs.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* RFQ Viewer Modal */}
      {selectedRFQ && (
        <RFQViewer
          rfq={selectedRFQ}
          onClose={() => setSelectedRFQ(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
