
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

export interface User {
  id: number
  full_name: string
  email: string
  role: string
  is_active: boolean
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface Product {
  id: number
  name: string
  description: string | null
  product_code: string
  sales_price: number
  cost_price: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductCreate {
  name: string
  description?: string
  product_code: string
  sales_price: number
  cost_price: number
}

export interface ProductVariantCreate {
  variant_name: string
  sku: string
  additional_price: number
}

export interface Customer {
  id: number
  customer_code: string
  full_name: string
  email: string
  phone: string | null
  is_active: boolean
}

export interface SubscriptionPlan {
  id: number
  name: string
  description: string | null
  plan_code: string
  billing_frequency: string
  base_price: number | string
  currency: string
  is_active: boolean
}

export interface Subscription {
  id: number
  subscription_code: string
  customer_id: number
  plan_id: number | null
  status: string
  start_date: string
  end_date: string | null
  next_billing_date: string | null
  plan_name: string
  plan_price: number | string
  currency: string
  billing_frequency: string
  created_by: number | null
  creation_source: string
  created_at: string
  updated_at: string
}

export interface SubscriptionCreate {
  subscription_code: string
  customer_id: number
  plan_id: number
  start_date: string
  end_date?: string | null
  next_billing_date?: string | null
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

export function setAccessToken(token: string): void {
  localStorage.setItem('access_token', token)
}

export function clearAccessToken(): void {
  localStorage.removeItem('access_token')
}

export const getToken = getAccessToken
export const saveToken = setAccessToken
export const clearToken = clearAccessToken

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken()

  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const responseText = await response.text()
  let data: unknown = null

  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      data = responseText
    }
  }

  if (!response.ok) {
    const detail =
      typeof data === 'object' && data !== null && 'detail' in data
        ? String(data.detail)
        : response.status === 401
          ? 'Authentication required. Please log in.'
          : `Request failed (${response.status})`

    throw new Error(detail)
  }

  return data as T
}

export async function registerUser(payload: {
  full_name: string
  email: string
  password: string
}): Promise<User> {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const result = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  setAccessToken(result.access_token)
  return result
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/auth/me')
}

export async function logoutUser(): Promise<void> {
  clearAccessToken()
}

export async function getProducts(): Promise<Product[]> {
  return apiRequest<Product[]>('/products')
}

export async function createProduct(
  payload: ProductCreate,
): Promise<Product> {
  return apiRequest<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function createProductVariant(
  productId: number,
  payload: ProductVariantCreate,
) {
  return apiRequest(`/products/${productId}/variants`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getCustomers(): Promise<Customer[]> {
  return apiRequest<Customer[]>('/customers')
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return apiRequest<SubscriptionPlan[]>('/plans')
}

export async function getSubscriptions(): Promise<Subscription[]> {
  return apiRequest<Subscription[]>('/subscriptions')
}

export async function createSubscription(
  payload: SubscriptionCreate,
): Promise<Subscription> {
  return apiRequest<Subscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateSubscriptionStatus(
  subscriptionId: number,
  status: string,
): Promise<Subscription> {
  return apiRequest<Subscription>(
    `/subscriptions/${subscriptionId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  )
}
