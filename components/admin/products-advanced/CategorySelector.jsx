'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * CategorySelector - Dropdown to select product category
 * Fetches all categories from API and allows selection
 */
export default function CategorySelector({ 
  value, 
  onChange, 
  disabled = false,
  label = 'Category'
}) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/products-advanced/categories')
        const data = await response.json()
        
        if (data.success) {
          setCategories(data.data || [])
        } else {
          setError('Failed to load categories')
        }
      } catch (err) {
        setError(err.message)
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select category..." />
        </SelectTrigger>
        <SelectContent>
          {loading && <SelectItem value="">Loading...</SelectItem>}
          {error && <SelectItem value="">Error: {error}</SelectItem>}
          {!loading && !error && categories.length === 0 && (
            <SelectItem value="">No categories available</SelectItem>
          )}
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
