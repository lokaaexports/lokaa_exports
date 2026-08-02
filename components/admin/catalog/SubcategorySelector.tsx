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
 * SubcategorySelector - Dropdown to select product subcategory
 * Fetches subcategories based on selected category
 */
export default function SubcategorySelector({ 
  categoryId,
  value, 
  onChange, 
  disabled = false,
  label = 'Subcategory'
}: any) {
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([])
      return
    }

    const fetchSubcategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `/api/admin/catalog/subcategories?categoryId=${categoryId}`
        )
        const data = await response.json()
        
        if (data.success) {
          setSubcategories(data.data || [])
        } else {
          setError('Failed to load subcategories')
        }
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching subcategories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubcategories()
  }, [categoryId])

  const isDisabled = !categoryId || disabled || loading

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Select value={value || ''} onValueChange={onChange} disabled={isDisabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={!categoryId ? 'Select category first...' : 'Select subcategory...'} />
        </SelectTrigger>
        <SelectContent>
          {!categoryId && <SelectItem value="">Select category first</SelectItem>}
          {loading && <SelectItem value="">Loading...</SelectItem>}
          {error && <SelectItem value="">Error: {error}</SelectItem>}
          {!loading && !error && subcategories.length === 0 && (
            <SelectItem value="">No subcategories available</SelectItem>
          )}
          {subcategories.map((subcategory) => (
            <SelectItem key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
