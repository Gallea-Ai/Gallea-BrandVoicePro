import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Visitor ID persists across page refreshes via localStorage
// Falls back to module-level variable if localStorage is unavailable (sandboxed iframes)
let _visitorId: string | null = null;
function getVisitorId(): string {
  if (!_visitorId) {
    try {
      _visitorId = localStorage.getItem("gallea_visitor_id");
      if (!_visitorId) {
        _visitorId = crypto.randomUUID();
        localStorage.setItem("gallea_visitor_id", _visitorId);
      }
    } catch {
      // localStorage unavailable (sandboxed iframe)
      _visitorId = crypto.randomUUID();
    }
  }
  return _visitorId;
}

export function clearVisitorId() {
  _visitorId = null;
  try { localStorage.removeItem("gallea_visitor_id"); } catch {}
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = { "x-visitor-id": getVisitorId() };
  if (data) headers["Content-Type"] = "application/json";
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(`${API_BASE}${queryKey.join("/")}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
