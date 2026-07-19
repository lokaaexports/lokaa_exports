'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Phone, MapPin, Package, Truck, DollarSign, MessageSquare, FileText, Clock } from 'lucide-react'

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

export default function RFQViewer({ rfq, onClose, onStatusChange }) {
  const [updatedRFQ, setUpdatedRFQ] = useState(rfq)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUpdatedRFQ(rfq)
  }, [rfq])

  const handleStatusChange = async (newStatus) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products-advanced/rfq-enquiries?id=${rfq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || 'test'}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')

      const result = await response.json()
      setUpdatedRFQ(result.data)
      onStatusChange?.(result.data)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePriorityChange = async (newPriority) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products-advanced/rfq-enquiries?id=${rfq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || 'test'}`
        },
        body: JSON.stringify({ priority: newPriority })
      })

      if (!response.ok) throw new Error('Failed to update priority')

      const result = await response.json()
      setUpdatedRFQ(result.data)
    } catch (error) {
      console.error('Error updating priority:', error)
    } finally {
      setLoading(false)
    }
  }

  const attachments = updatedRFQ.attachments ? JSON.parse(updatedRFQ.attachments) : []

  return (
    <Dialog open={!!rfq} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between w-full">
            <div>
              <DialogTitle className="text-2xl font-bold text-navy">
                RFQ #{updatedRFQ.reference}
              </DialogTitle>
              <p className="text-sm text-graphite/60 mt-1">
                {new Date(updatedRFQ.createdAt).toLocaleDateString()} at {new Date(updatedRFQ.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-2 flex-col">
              <div className="flex gap-2">
                <Badge className={`${STATUS_COLORS[updatedRFQ.status]}`}>
                  {updatedRFQ.status.charAt(0).toUpperCase() + updatedRFQ.status.slice(1)}
                </Badge>
                <Badge className={`${PRIORITY_COLORS[updatedRFQ.priority]}`}>
                  {updatedRFQ.priority.charAt(0).toUpperCase() + updatedRFQ.priority.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Information */}
          <Card className="p-6 border-navy/10">
            <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-1">Full Name</p>
                <p className="font-medium text-navy">{updatedRFQ.buyerName}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-1">Company</p>
                <p className="font-medium text-navy">{updatedRFQ.companyName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-1">Email</p>
                <p className="font-medium text-navy">{updatedRFQ.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-1">Phone</p>
                <p className="font-medium text-navy">{updatedRFQ.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs uppercase text-graphite/60 mb-1">Country</p>
                <p className="font-medium text-navy flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" /> {updatedRFQ.country}
                </p>
              </div>
            </div>
          </Card>

          {/* Product & Requirement Details */}
          <Card className="p-6 border-navy/10">
            <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" /> Product & Requirements
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-1">Product Interest</p>
                <p className="font-medium text-navy">{updatedRFQ.productInterest || 'N/A'}</p>
              </div>
              {updatedRFQ.product && (
                <div>
                  <p className="text-xs uppercase text-graphite/60 mb-1">Linked Product</p>
                  <p className="font-medium text-navy">{updatedRFQ.product.name}</p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-1">Quantity</p>
                <p className="font-medium text-navy">
                  {updatedRFQ.quantity || updatedRFQ.requiredQuantity || 'N/A'} {updatedRFQ.unit || 'kg'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-1">Packaging</p>
                <p className="font-medium text-navy">{updatedRFQ.packaging || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Logistics Information */}
          <Card className="p-6 border-navy/10">
            <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
              <Truck className="h-4 w-4" /> Logistics Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-1">Incoterms</p>
                <p className="font-medium text-navy">{updatedRFQ.incoterms || 'CIF'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-1">Target Port</p>
                <p className="font-medium text-navy">{updatedRFQ.targetPort || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-1">Target Price</p>
                <p className="font-medium text-navy flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gold" /> {updatedRFQ.targetPrice || 'N/A'} {updatedRFQ.preferredCurrency || 'USD'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-1">Shipment Date</p>
                <p className="font-medium text-navy flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gold" /> {updatedRFQ.shipmentDate || 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          {(updatedRFQ.message || updatedRFQ.customSpecifications) && (
            <Card className="p-6 border-navy/10">
              <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Additional Information
              </h3>
              <div className="space-y-4">
                {updatedRFQ.message && (
                  <div>
                    <p className="text-xs uppercase text-graphite/60 mb-2">Message</p>
                    <p className="text-navy bg-navy/5 rounded-lg p-3 text-sm">{updatedRFQ.message}</p>
                  </div>
                )}
                {updatedRFQ.customSpecifications && (
                  <div>
                    <p className="text-xs uppercase text-graphite/60 mb-2">Custom Specifications</p>
                    <p className="text-navy bg-navy/5 rounded-lg p-3 text-sm">{updatedRFQ.customSpecifications}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <Card className="p-6 border-navy/10">
              <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Attachments ({attachments.length})
              </h3>
              <div className="space-y-2">
                {attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-navy/5 rounded-lg hover:bg-navy/10 transition"
                  >
                    <FileText className="h-4 w-4 text-gold" />
                    <span className="text-sm font-medium text-navy">{att.name}</span>
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Status & Priority Management */}
          <Card className="p-6 border-navy/10 bg-navy/5">
            <h3 className="font-semibold text-navy mb-4">Manage RFQ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-2">Status</p>
                <Select value={updatedRFQ.status} onValueChange={handleStatusChange} disabled={loading}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="viewed">Viewed</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs uppercase text-graphite/60 mb-2">Priority</p>
                <Select value={updatedRFQ.priority} onValueChange={handlePriorityChange} disabled={loading}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-navy/10">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
