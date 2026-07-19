'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * DynamicFormGenerator - Renders form fields based on template
 * Supports multiple field types (TEXT, NUMBER, DROPDOWN, TEXTAREA, etc.)
 */
export default function DynamicFormGenerator({ 
  templateId,
  values = {},
  onChange,
  disabled = false
}) {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!templateId) {
      setFields([])
      return
    }

    const fetchTemplateFields = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `/api/admin/products-advanced/template-fields?templateId=${templateId}`
        )
        const data = await response.json()
        
        if (data.data && data.data.fields) {
          setFields(data.data.fields || [])
        } else if (Array.isArray(data.data)) {
          setFields(data.data)
        }
      } catch (err) {
        setError(err.message)
        console.error('Error fetching template fields:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplateFields()
  }, [templateId])

  const handleFieldChange = (fieldName, value) => {
    onChange({
      ...values,
      [fieldName]: value
    })
  }

  const renderField = (field) => {
    const fieldValue = values[field.fieldName] || ''
    const commonProps = {
      disabled: disabled,
      placeholder: field.placeholder || '',
      value: fieldValue,
      onChange: (e) => handleFieldChange(field.fieldName, e.target.value),
    }

    switch (field.fieldType) {
      case 'TEXT':
        return (
          <Input
            key={field.id}
            type="text"
            {...commonProps}
            required={field.isRequired}
          />
        )

      case 'NUMBER':
        return (
          <Input
            key={field.id}
            type="number"
            {...commonProps}
            required={field.isRequired}
          />
        )

      case 'TEXTAREA':
        return (
          <Textarea
            key={field.id}
            {...commonProps}
            required={field.isRequired}
            rows={4}
          />
        )

      case 'DROPDOWN':
      case 'MULTI_SELECT':
        const options = field.options ? JSON.parse(field.options) : []
        return (
          <Select 
            key={field.id}
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(field.fieldName, value)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'DATE':
        return (
          <Input
            key={field.id}
            type="date"
            {...commonProps}
            required={field.isRequired}
          />
        )

      case 'BOOLEAN':
        return (
          <div key={field.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.fieldName}
              checked={fieldValue === true || fieldValue === 'true'}
              onChange={(e) => handleFieldChange(field.fieldName, e.target.checked)}
              disabled={disabled}
              className="w-4 h-4"
            />
            <label htmlFor={field.fieldName} className="text-sm font-medium">
              {field.fieldLabel}
            </label>
          </div>
        )

      case 'RICH_TEXT':
        return (
          <Textarea
            key={field.id}
            {...commonProps}
            required={field.isRequired}
            rows={6}
            className="font-mono text-sm"
          />
        )

      case 'IMAGE':
        return (
          <Input
            key={field.id}
            type="file"
            accept="image/*"
            onChange={(e) => handleFieldChange(field.fieldName, e.target.files?.[0])}
            disabled={disabled}
            required={field.isRequired}
          />
        )

      default:
        return (
          <Input
            key={field.id}
            type="text"
            {...commonProps}
            required={field.isRequired}
          />
        )
    }
  }

  if (!templateId) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">
        Select a template to see dynamic fields
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 text-gray-500">Loading template fields...</div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
        Error: {error}
      </div>
    )
  }

  if (fields.length === 0) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
        No fields defined for this template
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 mb-4">Template Fields</h3>
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label className="text-gray-700">
            {field.fieldLabel}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {renderField(field)}
          {field.helpText && (
            <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
          )}
        </div>
      ))}
    </div>
  )
}
