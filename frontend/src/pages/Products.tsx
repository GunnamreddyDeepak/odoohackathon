
import { useState } from 'react'

const Products = () => {
  const [showModal, setShowModal] = useState(false)
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [salesPrice, setSalesPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [variantName, setVariantName] = useState('')
  const [message, setMessage] = useState('')

  const closeModal = () => {
    setShowModal(false)
    setMessage('')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(
      'Product details entered. Backend API connection is required to save this product.'
    )
  }

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
          { label: 'Total Products', value: '—' },
          { label: 'Active Products', value: '—' },
          { label: 'Product Variants', value: '—' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-[#101B35]">{item.value}</p>
            <p className="mt-2 text-xs text-slate-400">Awaiting backend data</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#101B35]">Product Catalogue</h2>
          <p className="mt-1 text-xs text-slate-400">
            All products and their details
          </p>
        </div>

        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            📦
          </div>
          <h3 className="mt-5 text-lg font-bold text-[#101B35]">
            No products available yet
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Products from your backend will appear here once connected.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 rounded-xl bg-[#5277F7] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Create your first product
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#101B35]/50 p-4">
          <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#101B35]">Add Product</h2>
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
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
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
                    Cost Price
                  </label>
                  <input
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

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Variant Name
                </label>
                <input
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  placeholder="Enter variant name (if applicable)"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {message && (
                <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
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
                  className="w-1/2 rounded-xl bg-[#5277F7] py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Review Details
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

