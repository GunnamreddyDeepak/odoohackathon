import { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../services/api'

type Product = {
  id: number
  name: string
  description: string | null
  product_code: string
  sales_price: string | number
  cost_price: string | number
  is_active: boolean
  created_at: string
  updated_at: string
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [productName, setProductName] = useState('')
  const [productCode, setProductCode] = useState('')
  const [description, setDescription] = useState('')
  const [salesPrice, setSalesPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get<Product[]>('/products')
      setProducts(res.data)
    } catch {
      setError('Could not load products. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const closeModal = () => {
    setShowModal(false)
    setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setSaving(true)
      setMessage('')
      await api.post('/products', {
        name: productName,
        product_code: productCode,
        description: description || null,
        sales_price: Number(salesPrice),
        cost_price: Number(costPrice),
      })
      setProductName('')
      setProductCode('')
      setDescription('')
      setSalesPrice('')
      setCostPrice('')
      setShowModal(false)
      await loadProducts()
    } catch (err) {
      let text = 'Could not save the product.'
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        if (typeof detail === 'string') text = detail
        else if (Array.isArray(detail)) text = 'Please check the entered values (name and code need at least 2 characters).'
      }
      setMessage(text)
    } finally {
      setSaving(false)
    }
  }

  const activeCount = products.filter((p) => p.is_active).length
  const stats = [
    { label: 'Total Products', value: String(products.length), note: 'From backend' },
    { label: 'Active Products', value: String(activeCount), note: 'From backend' },
    { label: 'Product Variants', value: '—', note: 'Not connected yet' },
  ]

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
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-[#101B35]">
              {loading || error ? '—' : item.value}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {loading ? 'Loading...' : error ? 'Unavailable' : item.note}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#101B35]">Product Catalogue</h2>
          <p className="mt-1 text-xs text-slate-400">All products and their details</p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Loading products...</div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              📦
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#101B35]">No products available yet</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              No products have been created yet.
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
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Sales Price</th>
                  <th className="px-5 py-3">Cost Price</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-[#101B35]">{p.product_code}</td>
                    <td className="px-5 py-3">{p.name}</td>
                    <td className="px-5 py-3">{Number(p.sales_price).toFixed(2)}</td>
                    <td className="px-5 py-3">{Number(p.cost_price).toFixed(2)}</td>
                    <td className="px-5 py-3">{p.is_active ? 'Active' : 'Inactive'}</td>
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
                <h2 className="text-xl font-bold text-[#101B35]">Add Product</h2>
                <p className="mt-1 text-sm text-slate-500">Enter product information</p>
              </div>
              <button
                onClick={closeModal}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Product Name *
                  </label>
                  <input
                    required
                    minLength={2}
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
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    placeholder="e.g. PROD-001"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
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
                <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{message}</p>
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