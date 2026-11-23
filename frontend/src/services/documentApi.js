const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Erro inesperado ao comunicar com o servidor.');
  }
  return response.json();
}

export async function listDocuments() {
  return handleResponse(await fetch(`${API_BASE}/documents`));
}

export async function uploadDocument(file) {
  const form = new FormData();
  form.append('file', file);
  return handleResponse(await fetch(`${API_BASE}/upload`, { method: 'POST', body: form }));
}

export function getDownloadUrl(id) {
  return `${API_BASE}/documents/${id}/download`;
}
