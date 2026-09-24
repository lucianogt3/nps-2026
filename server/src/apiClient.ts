// src/apiClient.ts
let BASE_URL = "http://localhost:3333";
let API_KEY = "";

export function setBaseUrl(url: string) {
  BASE_URL = url.replace(/\/$/, "");
}

export function setApiKey(key: string) {
  API_KEY = key;
}

export function getApiKey() {
  return API_KEY;
}

// Mantive esses pra não quebrar seu código, mas aqui viram "sessão local"
const TOKEN_KEY = "nps_token_fake";

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

type ApiFetchOptions = RequestInit & { raw?: boolean };

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  // ✅ sempre envia x-api-key se definido
  if (API_KEY) headers["x-api-key"] = API_KEY;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // tenta JSON sempre que possível
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = typeof data === "object" && data?.error ? data.error : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}
