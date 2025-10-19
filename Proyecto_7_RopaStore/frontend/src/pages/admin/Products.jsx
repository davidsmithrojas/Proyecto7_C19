import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Search, Filter, ArrowLeft } from 'lucide-react'
import { useProducts } from '../../context/ProductContext'
import { productService } from '../../services/productService'
import toast from 'react-hot-toast'
import { formatPrice } from '../../utils/currency'

const AdminProducts = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Usar el contexto de productos
  const { 
    products, 
    categories, 
    loading, 
    error, 
    pagination, 
    filters,
    setFilters, 
    setPage, 
    clearFilters,
    loadProducts,
    getProductById
  } = useProducts()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    code: '',
    sizes: ['M'],
    colors: ['Negro'],
    stock: '',
    isActive: true,
    image: null
  })
  const [editingProduct, setEditingProduct] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageError, setImageError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  
  // Determinar qué vista mostrar basado en la ruta
  const isNewProduct = location.pathname === '/admin/products/new'
  const isEditProduct = location.pathname.includes('/admin/products/') && location.pathname.includes('/edit')
  
  // Funciones de navegación
  const handleNewProduct = () => {
    navigate('/admin/products/new')
  }
  
  const handleEditProduct = async (productId) => {
    try {
      const product = await getProductById(productId)
      if (product) {
        setEditingProduct(product)
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          category: product.category || '',
          code: product.code || '',
          sizes: product.sizes || [],
          colors: product.colors || [],
          stock: product.stock || '',
          isActive: product.isActive !== undefined ? product.isActive : true,
          image: null
        })
        setImagePreview(product.image || null)
        setImageError('')
        setValidationErrors({})
        navigate(`/admin/products/${productId}/edit`)
      }
    } catch (error) {
      toast.error('Error al cargar el producto')
    }
  }
  
  const handleBackToList = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      code: '',
      sizes: ['M'],
      colors: ['Negro'],
      stock: '',
      isActive: true,
      image: null
    })
    setImagePreview(null)
    setImageError('')
    setValidationErrors({})
    navigate('/admin/products')
  }

  // Función de validación
  const validateForm = () => {
    const errors = {}
    
    // Validar campos obligatorios (todos excepto description)
    if (!formData.name.trim()) {
      errors.name = 'El nombre del producto es obligatorio'
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'El precio es obligatorio y debe ser mayor a 0'
    }
    
    if (!formData.category) {
      errors.category = 'La categoría es obligatoria'
    }
    
    if (!formData.code.trim()) {
      errors.code = 'El código del producto es obligatorio'
    }
    
    if (!formData.stock || formData.stock < 0) {
      errors.stock = 'El stock es obligatorio y debe ser mayor o igual a 0'
    }
    
    // Validar imagen solo para productos nuevos
    if (isNewProduct && !formData.image) {
      errors.image = 'La imagen es obligatoria para productos nuevos'
    }
    
    // Validar tamaños y colores
    if (!formData.sizes || formData.sizes.length === 0) {
      errors.sizes = 'Debe seleccionar al menos un tamaño'
    }
    
    if (!formData.colors || formData.colors.length === 0) {
      errors.colors = 'Debe seleccionar al menos un color'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validar archivo de imagen
  const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'
    }

    if (file.size > maxSize) {
      return 'El archivo no puede ser mayor a 5MB'
    }

    return null
  }

  // Manejar selección de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setImageError('')

    if (!file) {
      setFormData(prev => ({ ...prev, image: null }))
      setImagePreview(null)
      return
    }

    const error = validateImageFile(file)
    if (error) {
      setImageError(error)
      return
    }

    setFormData(prev => ({ ...prev, image: file }))
    
    // Crear vista previa
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  // Limpiar imagen
  const clearImage = () => {
    setFormData(prev => ({ ...prev, image: null }))
    setImagePreview(null)
    setImageError('')
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar formulario
    if (!validateForm()) {
      toast.error('Por favor, completa todos los campos obligatorios')
      return
    }

    try {
      const productData = new FormData()
      productData.append('name', formData.name)
      productData.append('description', formData.description)
      productData.append('price', parseFloat(formData.price))
      productData.append('category', formData.category)
      productData.append('code', formData.code)
      productData.append('stock', parseInt(formData.stock))
      productData.append('isActive', formData.isActive)
      productData.append('sizes', JSON.stringify(formData.sizes))
      productData.append('colors', JSON.stringify(formData.colors))
      
      if (formData.image) {
        productData.append('image', formData.image)
      }

      if (isNewProduct) {
        await productService.createProduct(productData)
        toast.success('Producto creado exitosamente')
      } else {
        await productService.updateProduct(editingProduct._id, productData)
        toast.success('Producto actualizado exitosamente')
      }
      
      handleBackToList()
      loadProducts() // Recargar la lista
    } catch (error) {
      const message = error.response?.data?.message || 'Error al guardar el producto'
      toast.error(message)
    }
  }

  // Manejar eliminación de producto
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await productService.deleteProduct(productId)
        toast.success('Producto eliminado exitosamente')
        loadProducts() // Recargar la lista
      } catch (error) {
        const message = error.response?.data?.message || 'Error al eliminar el producto'
        toast.error(message)
      }
    }
  }

  // Manejar filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ [name]: value })
  }

  // Manejar búsqueda
  const handleSearch = (e) => {
    const value = e.target.value
    setFilters({ search: value })
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Productos
              </h1>
              <p className="text-gray-600">
                Administra el catálogo de productos
              </p>
            </div>
              <button 
                onClick={handleNewProduct}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
              <Plus className="h-5 w-5 mr-2" />
              Agregar Producto
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                    value={filters.search}
                    onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-2">
                <select 
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
              </select>
                <select 
                  name="isActive"
                  value={filters.isActive}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                <option value="">Todos los estados</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </button>
            </div>
          </div>
        </div>

          {/* Formulario para crear/editar producto */}
          {(isNewProduct || isEditProduct) && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-6">
                <button
                  onClick={handleBackToList}
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isNewProduct ? 'Crear Nuevo Producto' : 'Editar Producto'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Producto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        validationErrors.name 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      placeholder="Ingresa el nombre del producto"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        validationErrors.category 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {validationErrors.category && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        validationErrors.price 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                    {validationErrors.price && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        validationErrors.stock 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {validationErrors.stock && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.stock}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        validationErrors.code 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      placeholder="Código del producto"
                    />
                    {validationErrors.code && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.code}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select 
                      name="isActive"
                      value={formData.isActive}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={true}>Activo</option>
                      <option value={false}>Inactivo</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción <span className="text-gray-400">(Opcional)</span>
                  </label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe el producto..."
                  />
                </div>

                {/* Campo de imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen del Producto {isNewProduct && <span className="text-red-500">*</span>}
                  </label>
                  
                  {/* Input de archivo */}
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Vista previa"
                            className="mx-auto h-32 w-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div>
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="image-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                            >
                              <span>Subir una imagen</span>
                              <input
                                id="image-upload"
                                name="image"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF, WebP hasta 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Mostrar error de imagen */}
                  {(imageError || validationErrors.image) && (
                    <p className="mt-2 text-sm text-red-600">{imageError || validationErrors.image}</p>
                  )}
                </div>

                {/* Campos de tamaños y colores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamaños <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        <label key={size} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.sizes.includes(size)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  sizes: [...prev.sizes, size]
                                }))
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  sizes: prev.sizes.filter(s => s !== size)
                                }))
                              }
                              // Limpiar error de validación
                              if (validationErrors.sizes) {
                                setValidationErrors(prev => ({
                                  ...prev,
                                  sizes: ''
                                }))
                              }
                            }}
                            className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{size}</span>
                        </label>
                      ))}
                    </div>
                    {validationErrors.sizes && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.sizes}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Colores <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Amarillo', 'Rosa', 'Gris'].map(color => (
                        <label key={color} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.colors.includes(color)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  colors: [...prev.colors, color]
                                }))
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  colors: prev.colors.filter(c => c !== color)
                                }))
                              }
                              // Limpiar error de validación
                              if (validationErrors.colors) {
                                setValidationErrors(prev => ({
                                  ...prev,
                                  colors: ''
                                }))
                              }
                            }}
                            className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{color}</span>
                        </label>
                      ))}
                    </div>
                    {validationErrors.colors && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.colors}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {isNewProduct ? 'Crear Producto' : 'Actualizar Producto'}
                  </button>
                </div>
              </form>
          </div>
        )}

          {/* Tabla de productos - Solo mostrar si no estamos creando/editando */}
          {!isNewProduct && !isEditProduct && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-4">
                  {error}
                </div>
              )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {product.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                                ID: {product._id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        product.stock < 10 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {product.stock}
                      </span>
                      {product.stock < 10 && (
                        <span className="ml-2 text-xs text-red-600">Stock bajo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                            <button 
                              onClick={() => handleEditProduct(product._id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                          <Edit className="h-4 w-4" />
                        </button>
                            <button 
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>

        {/* Paginación */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
          </div>
          <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
              Anterior
            </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setPage(page)}
                      className={`px-3 py-2 rounded-lg ${
                        page === pagination.page
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
            </button>
                  ))}
                  <button 
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
              Siguiente
            </button>
          </div>
        </div>
            </div>
          )}
      </div>
    </div>
    </>
  )
}

export default AdminProducts
