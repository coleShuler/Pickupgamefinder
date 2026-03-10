import { projectId, publicAnonKey } from "/utils/supabase/info";
import { createClient } from "@supabase/supabase-js";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7718d69f`;

console.log("API Configuration:", {
  projectId,
  apiBase: API_BASE,
  hasAnonKey: !!publicAnonKey
});

// Create Supabase client for auth
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Check if server is reachable
let serverHealthChecked = false;
let serverIsHealthy = false;

async function checkServerHealth() {
  if (serverHealthChecked) return serverIsHealthy;
  
  try {
    const response = await fetch(`${API_BASE}/health`, {
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
      },
    });
    serverIsHealthy = response.ok;
  } catch (error) {
    console.warn("Server health check failed:", error);
    serverIsHealthy = false;
  }
  serverHealthChecked = true;
  return serverIsHealthy;
}

// API helpers
async function apiCall(endpoint: string, options: RequestInit & { skipAuth?: boolean } = {}) {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { skipAuth, ...fetchOptions } = options;
      
      // Get session to check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if we have a REAL authenticated user session (not just anon key)
      // Supabase returns session.user.aud === 'authenticated' only for real users
      const hasValidUserSession = (
        session !== null &&
        session?.access_token && 
        session?.user && 
        session.user.id &&
        session.user.aud === 'authenticated'
      );
      
      console.log(`API call to ${endpoint} (attempt ${attempt}/${maxRetries})`, {
        method: options.method || 'GET',
        skipAuth: !!skipAuth,
        hasSession: !!session,
        hasUser: !!session?.user,
        userAud: session?.user?.aud || 'none',
        hasValidUserSession: !!hasValidUserSession,
      });
      
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      };
      
      // For public endpoints, use anon key
      // For authenticated endpoints, use user's access token if available
      if (skipAuth) {
        // Public endpoint - use anon key
        headers["Authorization"] = `Bearer ${publicAnonKey}`;
      } else if (hasValidUserSession) {
        // Authenticated endpoint with valid user session
        headers["Authorization"] = `Bearer ${session.access_token}`;
      } else {
        // Authenticated endpoint but no valid session - DON'T make the request
        console.error(`BLOCKED: Attempted to call authenticated endpoint ${endpoint} without valid session`);
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      console.log(`API response from ${endpoint}:`, {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        let errorMessage = "API request failed";
        let errorData;
        try {
          errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error(`API error from ${endpoint}:`, errorData);
        } catch {
          errorMessage = `Request failed with status ${response.status}`;
          console.error(`API error from ${endpoint}: HTTP ${response.status}`);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`API success from ${endpoint}:`, data);
      return data;
    } catch (error: any) {
      console.error(`API call to ${endpoint} failed (attempt ${attempt}/${maxRetries}):`, error);
      
      // If it's a network error and we have retries left, wait and retry
      if ((error.message === "Failed to fetch" || error.name === "TypeError") && attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // Provide more helpful error message on final failure
      if (error.message === "Failed to fetch" || error.name === "TypeError") {
        throw new Error("Unable to connect to server. The backend may be initializing. Please try again in a moment.");
      }
      throw error;
    }
  }
  
  throw new Error("Max retries exceeded");
}

// Auth API
export const authAPI = {
  signUp: async (email: string, password: string, name: string) => {
    // Auth signup endpoint doesn't need auth header
    const result = await apiCall("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
      skipAuth: true,
    });
    
    // Sign in after signup
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};

// Locations API
export const locationsAPI = {
  getAll: async () => {
    // Don't send auth token for public endpoint
    return apiCall("/locations", { skipAuth: true });
  },

  create: async (location: any) => {
    return apiCall("/locations", {
      method: "POST",
      body: JSON.stringify(location),
    });
  },
};

// Games API
export const gamesAPI = {
  getAll: async (filters?: { locationId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.locationId) params.append("locationId", filters.locationId);
    if (filters?.status) params.append("status", filters.status);
    
    // Don't send auth token for public endpoint
    return apiCall(`/games${params.toString() ? `?${params}` : ""}`, { skipAuth: true });
  },

  create: async (game: any) => {
    return apiCall("/games", {
      method: "POST",
      body: JSON.stringify(game),
    });
  },

  join: async (gameId: string) => {
    return apiCall(`/games/${gameId}/join`, {
      method: "POST",
    });
  },

  update: async (gameId: string, updates: any) => {
    return apiCall(`/games/${gameId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  getMyGames: async () => {
    return apiCall("/my-games");
  },
};

// Profile API
export const profileAPI = {
  get: async () => {
    return apiCall("/profile");
  },

  update: async (updates: any) => {
    return apiCall("/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
};