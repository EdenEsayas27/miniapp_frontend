/**
 * apiFetch – thin wrapper around fetch() that:
 *  - Reads token from Zustand persisted state in localStorage
 *  - Attaches Authorization: Bearer <token> header
 *  - On 401, clears the auth store and redirects to /login
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5164'
const STORAGE_KEY = 'zemen-miniapp-auth'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

function clearAuth() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401) {
    clearAuth()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`
    try {
      const errorJson = await response.json()
      errorMessage = errorJson.error || errorJson.message || errorMessage
    } catch {
      const text = await response.text()
      if (text) errorMessage = text
    }
    throw new Error(errorMessage)
  }

  return response.json()
}
