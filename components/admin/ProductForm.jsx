'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, Minimize2 } from 'lucide-react'
import { useState, useRef } from 'react'

export default function ProductForm({ isOpen, onClose, onSubmit, product = null }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    price: product?.price || '',
    stock: product?.stock || '',
    sku: product?.sku || '',
    rating: product?.rating || '',
    status: product?.status || 'active',
    hsnCode: product?.hsnCode || '',
    description: product?.description || '',
    specifications: product?.specifications || '',
    images: product?.images || []
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isCentered, setIsCentered] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [imagePreview, setImagePreview] = useState(product?.images || [])
  const dragRef = useRef(null)
  const fileInputRef = useRef(null)

  // Initialize position when form opens
  if (isOpen && !isInitialized) {
    setIsInitialized(true)
    setPosition({
      x: typeof window !== 'undefined' ? window.innerWidth - 430 : 0,
      y: typeof window !== 'undefined' ? window.innerHeight - 600 : 0
    })
    setIsCentered(false)
  }

  // Reset initialization when form closes
  if (!isOpen && isInitialized) {
    setIsInitialized(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleCenterToggle = () => {
    setIsCentered(!isCentered)
    if (!isCentered) {
      setPosition({ x: 0, y: 0 })
    } else {
      setPosition({ x: window.innerWidth - 400, y: window.innerHeight - 400 })
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result])
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    if (!formData.price) newErrors.price = 'Price is required'
    if (!formData.stock && formData.stock !== '0') newErrors.stock = 'Stock quantity is required'
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required'
    if (!formData.hsnCode.trim()) newErrors.hsnCode = 'HSN Code is required'
    if (!formData.description.trim()) newErrors.description = 'Product description is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await onSubmit(formData)
      setFormData({
        name: '',
        category: '',
        price: '',
        stock: '',
        sku: '',
        rating: '',
        status: 'active',
        hsnCode: '',
        description: '',
        specifications: '',
        images: []
      })
      setImagePreview([])
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - only show when centered */}
          {isCentered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40"
            />
          )}

          {/* Tab Container - Draggable */}
          <motion.div
            ref={dragRef}
            drag={!isCentered}
            dragMomentum={false}
            onDragEnd={(event, info) => {
              setPosition({
                x: position.x + info.offset.x,
                y: position.y + info.offset.y
              })
            }}
            initial={
              isCentered
                ? { opacity: 0, scale: 0.95, y: 20 }
                : { opacity: 0, x: window.innerWidth - 400, y: window.innerHeight - 100 }
            }
            animate={
              isCentered
                ? { opacity: 1, scale: 1, y: 0, x: 'calc(50% - 150px)', position: 'fixed', left: 0, top: 0 }
                : { opacity: 1, x: position.x, y: position.y, position: 'fixed', left: 0, top: 0 }
            }
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`${
              isCentered
                ? 'z-50 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full mx-4'
                : 'fixed z-50 w-96'
            }`}
            style={{
              ...(isCentered
                ? {}
                : {
                    x: position.x,
                    y: position.y,
                  }
              ),
            }}
          >
            <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden ${
              isCentered ? 'max-h-[90vh] overflow-y-auto' : 'max-h-[80vh] overflow-y-auto'
            }`}>
              {/* Tab Header - Draggable Bar */}
              <motion.div
                className={`sticky top-0 flex items-center justify-between p-4 ${
                  isCentered
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                } ${!isCentered ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} border-b border-slate-200 dark:border-slate-700`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-2 h-2 rounded-full bg-white/50"></div>
                  <h3 className="text-sm font-semibold truncate">
                    {product ? 'Edit Product' : 'New Product'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Center Toggle Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCenterToggle}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition"
                    title={isCentered ? 'Move to corner' : 'Move to center'}
                  >
                    {isCentered ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </motion.button>

                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Organic Basmati Rice"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                    errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                    errors.category ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                  }`}
                >
                  <option value="">Select Category</option>
                  <option value="Organics">Organics</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Spices">Spices</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g., ORG-BR-001"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                    errors.sku ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
                {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 5500"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                    errors.price ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="e.g., 250"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                    errors.stock ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>

              {/* HSN Code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  HSN Code *
                </label>
                <input
                  type="text"
                  name="hsnCode"
                  value={formData.hsnCode}
                  onChange={handleChange}
                  placeholder="e.g., 07031010"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                    errors.hsnCode ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
                {errors.hsnCode && <p className="text-red-500 text-sm mt-1">{errors.hsnCode}</p>}
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Product Images
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-3 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 transition"
                >
                  + Upload Images
                </motion.button>
                
                {/* Image Previews */}
                {imagePreview.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {imagePreview.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Preview ${idx}`}
                          className="w-full h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                        <motion.button
                          type="button"
                          onClick={() => removeImage(idx)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Product Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your product, features, uses, benefits, etc."
                  rows="4"
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none ${
                    errors.description ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Product Specifications */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Product Specifications (Optional)
                </label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  placeholder="Type, Size, Color, Shape, Skin, Taste, Moisture Content, Shelf Life, Purity, Packaging, etc."
                  rows="4"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  name="rating"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  placeholder="e.g., 4.8"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
                </motion.button>
              </div>
            </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
