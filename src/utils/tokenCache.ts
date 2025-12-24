/**
 * Token Cache Utility
 * 
 * Provides a unified interface for storing and retrieving admin tokens
 * Uses both localStorage (persistent) and sessionStorage (session cache)
 * for better performance and reliability.
 */

const TOKEN_KEY = "admin_token";
const TOKEN_CACHE_KEY = "admin_token_cache";

/**
 * Store token in both localStorage and sessionStorage (cache)
 */
export function setAdminToken(token: string): void {
  if (typeof window === "undefined") return;

  try {
    // Store in localStorage for persistence across sessions
    localStorage.setItem(TOKEN_KEY, token);
    
    // Store in sessionStorage for faster access (session cache)
    sessionStorage.setItem(TOKEN_CACHE_KEY, token);
    
    // Also store timestamp for cache validation
    const timestamp = Date.now().toString();
    sessionStorage.setItem(`${TOKEN_CACHE_KEY}_timestamp`, timestamp);
  } catch (error) {
    console.error("Failed to store admin token:", error);
  }
}

/**
 * Get token from cache (sessionStorage) first, fallback to localStorage
 * This provides faster access since sessionStorage is typically faster
 */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    // Try sessionStorage first (cache) - faster access
    let token = sessionStorage.getItem(TOKEN_CACHE_KEY);
    
    if (token) {
      return token;
    }
    
    // Fallback to localStorage
    token = localStorage.getItem(TOKEN_KEY);
    
    // If found in localStorage, also update sessionStorage cache
    if (token) {
      sessionStorage.setItem(TOKEN_CACHE_KEY, token);
      sessionStorage.setItem(`${TOKEN_CACHE_KEY}_timestamp`, Date.now().toString());
    }
    
    return token;
  } catch (error) {
    console.error("Failed to retrieve admin token:", error);
    // Fallback to localStorage if sessionStorage fails
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }
}

/**
 * Remove token from both localStorage and sessionStorage
 */
export function removeAdminToken(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_CACHE_KEY);
    sessionStorage.removeItem(`${TOKEN_CACHE_KEY}_timestamp`);
  } catch (error) {
    console.error("Failed to remove admin token:", error);
  }
}

/**
 * Check if token exists in cache
 */
export function hasAdminToken(): boolean {
  return getAdminToken() !== null;
}

/**
 * Get token with cache timestamp (for debugging/validation)
 */
export function getAdminTokenWithTimestamp(): { token: string | null; timestamp: number | null } {
  if (typeof window === "undefined") return { token: null, timestamp: null };

  const token = getAdminToken();
  const timestampStr = sessionStorage.getItem(`${TOKEN_CACHE_KEY}_timestamp`);
  const timestamp = timestampStr ? parseInt(timestampStr, 10) : null;

  return { token, timestamp };
}

