'use client'

import { useEffect, useState } from 'react'
import { Edit, Trash2, Eye, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

/**
 * ProductList - Displays products in a table format with CRUD actions
 * Supports filtering by category, status, and search
 */
export default function ProductList({ 
  onEdit,
  onDelete,
  onView,
  categoryId = null,
  status = null,
  searchQuery = null,
}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [categoryId, status, searchQuery, page])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (categoryId) params.append('categoryId', categoryId)
      if (status) params.append('status', status)
      if (searchQuery) params.append('search', searchQuery)
      
      params.append('limit', '50')
      params.append('offset', ((page - 1) * 50).toString())

      const response = await fetch(
        `/api/admin/products-advanced/products?${params.toString()}`
      )
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data?.products || [])
        setHasMore(data.data?.hasMore !== false)
      } else {
        setError('Failed to load products')
      }
    } catch (err) {
      setError(err.message)
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async (productId) => {
    try {
      const response = await fetch(
        `/api/admin/products-advanced/products/${productId}?action=duplicate`,
        { method: 'POST' }
      )
      const data = await response.json()
      
      if (data.success) {
        alert('Product duplicated successfully')
        fetchProducts()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(
        `/api/admin/products-advanced/products/${productId}`,
        { method: 'DELETE' }
      )
      const data = await response.json()
      
      if (data.success) {
        alert('Product deleted successfully')
        fetchProducts()
        onDelete?.(productId)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading products...</div>
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
        Error: {error}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No products found. Create your first product!
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.productName}</TableCell>
              <TableCell>{product.category?.name || 'N/A'}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(product.status)}>
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">{product.sku || '-'}</TableCell>
              <TableCell>{product.price ? `$${product.price}` : '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView?.(product.id)}
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(product.id)}
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(product.id)}
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    title="Delete"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="p-4 border-t flex justify-between items-center">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">Page {page}</span>
        <Button
          variant="outline"
          disabled={!hasMore}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
