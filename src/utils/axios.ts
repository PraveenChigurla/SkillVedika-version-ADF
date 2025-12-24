import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  // Use frontend proxy so Next can forward requests to Laravel and avoid CORS/html errors
  baseURL: "/api",
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    Accept: "application/json",
  },
});

// Ensure CSRF cookie is present for stateful requests
// Laravel Sanctum uses HTTP-only cookies for authentication, so we don't need to attach tokens
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

  return config;
});

/**
 * Global 401 handler
 * When Laravel returns 401, the HTTP-only cookie is already invalid/cleared
 */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    
    // Avoid handling during SSR or non-browser contexts
    if (globalThis.window !== undefined && status === 401) {
      // Don't redirect or show toast if we're already on the login page
      const currentPath = globalThis.window.location.pathname;
      if (currentPath === "/" || currentPath === "/login") {
        // Already on login page, silently reject the error
        return Promise.reject(error);
      }

      // Don't show error for logout endpoint - it's expected to return 401 if already logged out
      if (url.includes("/admin/logout")) {
        return Promise.reject(error);
      }

      // Only show toast and redirect if NOT on login page and NOT logout endpoint
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
