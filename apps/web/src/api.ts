const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('menu-codexa-token')

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (response.status === 401) {
    localStorage.removeItem('menu-codexa-token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  const data = response.headers.get('content-type')?.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status}`)
  }

  return data as T
}
