'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * TemplateSelector - Dropdown to select form template
 * Fetches templates based on selected category
 */
export default function TemplateSelector({ 
  categoryId,
  value, 
  onChange, 
  disabled = false,
  label = 'Product Template'
}) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!categoryId) {
      setTemplates([])
      return
    }

    const fetchTemplates = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `/api/admin/products-advanced/templates?categoryId=${categoryId}`
        )
        const data = await response.json()
        
        if (data.success) {
          setTemplates(data.data || [])
        } else {
          setError('Failed to load templates')
        }
      } catch (err) {
        setError(err.message)
        console.error('Error fetching templates:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [categoryId])

  const isDisabled = !categoryId || disabled || loading

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Select value={value || ''} onValueChange={onChange} disabled={isDisabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={!categoryId ? 'Select category first...' : 'Select template...'} />
        </SelectTrigger>
        <SelectContent>
          {!categoryId && <SelectItem value="">Select category first</SelectItem>}
          {loading && <SelectItem value="">Loading templates...</SelectItem>}
          {error && <SelectItem value="">Error: {error}</SelectItem>}
          {!loading && !error && templates.length === 0 && (
            <SelectItem value="">No templates available</SelectItem>
          )}
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
