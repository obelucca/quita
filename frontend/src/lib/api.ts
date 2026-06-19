const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;

  // Get token from localStorage
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("quita_token");
  }

  const headers = new Headers(options.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

  const config: RequestInit = {
    ...options,
    headers,
    signal: controller.signal,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new ApiError("A operação demorou mais do que o esperado. Tente novamente.", 408);
    }
    throw new ApiError(error.message || "Erro de conexão de rede.", 503, error);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/")) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("unauthorized-api-call"));
      }
    }

    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      // ignore parsing error
    }
    throw new ApiError(
      errorData?.message || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  // Check if it's PDF file download
  const contentType = response.headers.get("Content-Type");
  if (contentType && contentType.includes("application/pdf")) {
    return (await response.blob()) as unknown as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(path, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  put: <T>(path: string, body?: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(path, {
      ...options,
      method: "PUT",
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "DELETE" }),
};
