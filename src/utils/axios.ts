import axios from "axios";
import toast from "react-hot-toast";
import { getAdminToken, removeAdminToken } from "./tokenCache";

const api = axios.create({
  // Use frontend proxy so Next can forward requests to Laravel and avoid CORS/html errors
  baseURL: "/api",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Attach token automatically
// Ensure CSRF cookie is present for stateful requests and attach stored bearer token.
// We make the request handler async so we can fetch the proxied CSRF cookie when needed.
api.interceptors.request.use(async (config) => {
  if (globalThis.window === undefined) return config;

  // For non-safe methods, ensure XSRF cookie exists. axios will read XSRF cookie and set X-XSRF-TOKEN header.
  // GET/HEAD/OPTIONS requests (pagination, filters) don't need CSRF - skip for these
  const method = (config.method || "get").toLowerCase();
  const needsCsrf = !["get", "head", "options"].includes(method);

  // If we need CSRF and the XSRF cookie isn't present, fetch it from the proxied endpoint.
  // GET requests (pagination/filters) automatically skip this block
  if (needsCsrf) {
    try {
      const hasXSRF = document.cookie?.includes("XSRF-TOKEN");
      if (!hasXSRF) {
        // proxied route will forward Set-Cookie to browser
        await fetch("/api/sanctum/csrf-cookie", { credentials: "include" });
      }
    } catch (e) {
      // ignore network issues here; request will likely fail with 419/401 later
      console.debug("Failed to ensure CSRF cookie:", e);
    }
  }

  // Get token from cache (sessionStorage first, then localStorage)
  // This provides faster access since sessionStorage is typically faster
  let token: string | null = null;
  if (globalThis.window !== undefined) {
    token = getAdminToken();
    
    // Fallback to legacy token keys for backward compatibility
    if (!token) {
      const tokenKeys = ["token", "access_token"];
      for (const k of tokenKeys) {
        const t = globalThis.window.localStorage.getItem(k);
        if (t) {
          token = t;
          break;
        }
      }
    }
  }

  // ensure headers object exists
  config.headers = config.headers || {};
  if (token) {
    // set Authorization header
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Global 401 handler
 */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    // Avoid handling during SSR or non-browser contexts
    if (globalThis.window !== undefined && status === 401) {
      try {
        // Clear token from both localStorage and sessionStorage (cache)
        removeAdminToken();
      } catch {}

      try {
        toast.error("Unauthenticated. Redirecting to login...");
      } catch {}

      // redirect to login after a short delay to allow toast to show
      setTimeout(() => {
        try {
          globalThis.location.href = "/";
        } catch {}
      }, 800);
    }

    return Promise.reject(error);
  }
);

export default api;
