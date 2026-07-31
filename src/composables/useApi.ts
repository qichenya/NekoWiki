// API 客户端 - 统一请求封装

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? '请求失败')
  return data as T
}

// --- Auth ---
export const api = {
  auth: {
    status: () => request<{ setupComplete: boolean }>('/api/auth/status'),
    setup: (username: string, password: string) =>
      request<{ ok: boolean; token: string; user: UserInfo }>('/api/auth/setup', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    login: (username: string, password: string) =>
      request<{ ok: boolean; token: string; user: UserInfo }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
    me: () => request<UserInfo>('/api/auth/me'),
  },

  pages: {
    list: () =>
      request<PageSummary[]>('/api/pages'),
    get: (id: string) =>
      request<PageFull>(`/api/pages/${id}`),
    create: (title: string, content: string) =>
      request<PageFull>('/api/pages', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      }),
    update: (id: string, data: { title?: string; content?: string }) =>
      request<PageFull>(`/api/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/pages/${id}`, { method: 'DELETE' }),
  },

  users: {
    list: () => request<UserInfo[]>('/api/users'),
    create: (username: string, password: string) =>
      request<UserInfo>('/api/users', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/users/${id}`, { method: 'DELETE' }),
  },
}

export interface UserInfo {
  id: string
  username: string
  role: 'admin' | 'editor'
  createdAt?: number
}

export interface PageSummary {
  id: string
  title: string
  updatedAt: number
}

export interface PageFull {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
  createdBy: string
}
