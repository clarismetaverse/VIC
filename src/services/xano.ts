const API_BASE = 'https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3';

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

export async function xanoFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!response.ok) throw new Error(`Xano request failed: ${response.status}`);
  return (await response.json()) as T;
}
