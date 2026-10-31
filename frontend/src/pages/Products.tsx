
import { useEffect, useState, type FormEvent } from 'react'
import { apiRequest } from '../services/api'

interface Product {
  id: number
  name: string
  description: string | null
  product_code: string
  sales_price: string
  cost_price: string
  is_active: boolean
  created_at: string
  updated_at: string
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)

  const [productName, setProductName] = useState('')
  const [productCode, setProductCode] = useState('')
  const [description, setDescription] = useState('')
  const [salesPrice, setSalesPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadProducts = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await apiRequest<Product[] | { items?: Product[]; data?: Product[] }>(
        '/products'
      )

      const productList = Array.isArray(result)
        ? result
        : result.items ?? result.data ?? []

      setProducts(productList)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load products.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const resetForm = () => {
    setProductName('')
    setProductCode('')
    setDescription('')
    setSalesPrice('')
    setCostPrice('')
    setMessage('')
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const payload = {
        name: productName.trim(),
        product_code: productCode.trim(),
        description: description.trim() || null,
        sales_price: Number(salesPrice),
        cost_price: Number(costPrice),
      }

      await apiRequest<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setMessage('Product created successfully!')
      await loadProducts()

      resetForm()
      setShowModal(false)
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Unable to create product.'
      )
    } finally {
      setSaving(false)
    }
  }

  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.is_active).length

  return (
    <div className="min-h-screen bg-[#F7F9FD] p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-400">Inventory / Products</p>
          <h1 className="mt-2 text-3xl font-bold text-[#101B35]">Products</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your products, variants and pricing.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Products', value: totalProducts },
          { label: 'Active Products', value: activeProducts },
          { label: 'Product Variants', value: '—' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-[#101B35]">
              {loading ? '...' : item.value}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {item.label === 'Product Variants'
                ? 'Variant API integration pending'
                : 'Live backend data'}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-[#101B35]">
              Product Catalogue
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              All products and their details
            </p>
          </div>

          <button
            onClick={loadProducts}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center text-sm text-slate-500">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              📦
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#101B35]">
              No products available yet
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Add your first product to see it in your catalogue.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-5 rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Create your first product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Product Code</th>
                  <th className="px-5 py-4">Sales Price</th>
                  <th className="px-5 py-4">Cost Price</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#101B35]">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {product.description || 'No description'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {product.product_code}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {product.sales_price}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {product.cost_price}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.is_active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101B35]/50 p-4">
          <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#101B35]">
                  Add Product
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter product information
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Product Name *
                </label>
                <input
                  required
                  minLength={2}
                  maxLength={150}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Product Code *
                </label>
                <input
                  required
                  minLength={2}
                  maxLength={50}
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="Example: PROD-001"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Sales Price *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(e.target.value)}
                    placeholder="Enter sales price"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Cost Price *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="Enter cost price"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {message && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {message}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-1/2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 rounded-xl bg-[#5277F7] py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
