let csrfToken = '';
export async function api<T = any>(path: string, data?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method: data === undefined ? 'GET' : 'POST', credentials: 'same-origin', signal,
    headers: { 'Accept': 'application/json', ...(data === undefined ? {} : { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken }) },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) throw new Error(result?.error || 'No se pudo conectar con Django. Inicia el proyecto con iniciar.cmd.');
  if (result.csrfToken) csrfToken = result.csrfToken;
  return result;
}
