const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api/v1'

export const getAccessToken = () => localStorage.getItem('access_token')

export const setAccessToken = (token: string) => {
  localStorage.setItem('access_token', token)
}

export const clearAccessToken = () => {
  localStorage.removeItem('access_token')
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (response.status === 401) {
    clearAccessToken()

    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }

    throw new Error('Session expired. Please log in again.')
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `API error: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}