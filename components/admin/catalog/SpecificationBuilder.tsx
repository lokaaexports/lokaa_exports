'use client'

import { useEffect, useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * SpecificationBuilder - Manage product specifications
 * Add, edit, and delete specifications with drag-to-reorder support
 */
export default function SpecificationBuilder({ 
  productId,
  onSpecsChange
}: any) {
  const [specs, setSpecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [newSpec, setNewSpec] = useState({ specName: '', specValue: '' })
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    if (productId) {
      fetchSpecifications()
    }
  }, [productId])

  const fetchSpecifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/catalog/specifications?productId=${productId}`
      )
      const data = await response.json()
      
      if (data.success) {
        setSpecs(data.data || [])
        onSpecsChange?.(data.data || [])
      }
    } catch (err: any) {
      console.error('Error fetching specifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSpec = async () => {
    if (!newSpec.specName.trim() || !newSpec.specValue.trim()) {
      alert('Please fill in specification name and value')
      return
    }

    try {
      const response = await fetch('/api/admin/catalog/specifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          ...newSpec,
          displayOrder: specs.length
        })
      })
      const data = await response.json()
      
      if (data.success) {
        setSpecs([...specs, data.data])
        setNewSpec({ specName: '', specValue: '' })
        onSpecsChange?.([...specs, data.data])
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleDeleteSpec = async (specId) => {
    if (!confirm('Delete this specification?')) return

    try {
      const response = await fetch(
        `/api/admin/catalog/specifications/${specId}`,
        { method: 'DELETE' }
      )
      const data = await response.json()
      
      if (data.success) {
        setSpecs(specs.filter(s => s.id !== specId))
        onSpecsChange?.(specs.filter(s => s.id !== specId))
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleUpdateSpec = async (specId, newValue) => {
    try {
      const response = await fetch(
        `/api/admin/catalog/specifications/${specId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ specValue: newValue })
        }
      )
      const data = await response.json()
      
      if (data.success) {
        const updated = specs.map(s => 
          s.id === specId ? { ...s, specValue: newValue } : s
        )
        setSpecs(updated)
        setEditingId(null)
        onSpecsChange?.(updated)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  if (!productId) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
        Create product first to add specifications
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Specifications</h3>

      {/* Add New Specification */}
      <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
        <h4 className="font-medium text-sm text-gray-700">Add New Specification</h4>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="spec-name" className="text-xs">Name</Label>
            <Input
              id="spec-name"
              placeholder="e.g., Size, Color, Weight"
              value={newSpec.specName}
              onChange={(e) => setNewSpec({ ...newSpec, specName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="spec-value" className="text-xs">Value</Label>
            <Input
              id="spec-value"
              placeholder="e.g., 30mm, Red, 50kg"
              value={newSpec.specValue}
              onChange={(e) => setNewSpec({ ...newSpec, specValue: e.target.value })}
              className="mt-1"
            />
          </div>
          <Button onClick={handleAddSpec} className="self-end" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Specifications List */}
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading specifications...</div>
      ) : specs.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specs.map((spec) => (
              <TableRow key={spec.id}>
                <TableCell className="font-medium">{spec.specName}</TableCell>
                <TableCell>
                  {editingId === spec.id ? (
                    <div className="flex gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateSpec(spec.id, editValue)}
                        className="h-8"
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <span
                      onClick={() => {
                        setEditingId(spec.id)
                        setEditValue(spec.specValue)
                      }}
                      className="cursor-pointer hover:text-blue-600"
                    >
                      {spec.specValue}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSpec(spec.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-4 text-gray-500 text-sm">
          No specifications added yet
        </div>
      )}
    </div>
  )
}
