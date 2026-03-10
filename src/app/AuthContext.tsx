import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, profileAPI } from "./api";
import { Player } from "./types";

interface AuthContextType {
  user: Player | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authAPI.getSession();
      
      // Debug: log the actual session object structure
      console.log("Session check - full session object:", JSON.stringify({
        hasSession: !!session,
        sessionIsNull: session === null,
        sessionType: typeof session,
        hasUser: !!session?.user,
        userIsNull: session?.user === null,
        hasAccessToken: !!session?.access_token,
        accessTokenIsNull: session?.access_token === null,
        userId: session?.user?.id || null,
        accessTokenPreview: session?.access_token ? session.access_token.substring(0, 20) + '...' : null
      }, null, 2));
      
      // CRITICAL: Only load profile if we have a NON-NULL session with a NON-NULL access_token and NON-NULL user with id
      // ALSO: The access_token must NOT be the anon key (which indicates no authenticated user)
      // Check each condition explicitly to be 100% sure
      const hasValidSession = (
        session !== null &&
        session !== undefined &&
        typeof session === 'object' &&
        session.access_token !== null &&
        session.access_token !== undefined &&
        typeof session.access_token === 'string' &&
        session.access_token.length > 0 &&
        session.user !== null &&
        session.user !== undefined &&
        typeof session.user === 'object' &&
        session.user.id !== null &&
        session.user.id !== undefined &&
        typeof session.user.id === 'string' &&
        session.user.id.length > 0 &&
        // CRITICAL: Check that we have a real user token, not just the anon key
        session.user.aud === 'authenticated'
      );
      
      if (hasValidSession) {
        console.log("✓ Valid authenticated user session found, loading user profile for user:", session.user.id);
        await loadUserProfile();
      } else {
        console.log("✗ No authenticated user session found (user is anonymous), skipping profile load");
      }
    } catch (error) {
      console.error("Error checking session:", error);
      // Don't block the app if session check fails
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      // Double-check we have a valid session before calling profile API
      const session = await authAPI.getSession();
      if (!session || !session.access_token || !session.user || !session.user.id) {
        console.log("Cannot load profile: no valid session available");
        return;
      }
      
      console.log("Loading profile for user:", session.user.id);
      const { profile } = await profileAPI.get();
      setUser({
        id: profile.id,
        name: profile.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
        verified: profile.verified,
        stats: profile.stats,
      });
    } catch (error: any) {
      // If it's an authentication error, that's expected when user isn't logged in
      if (error.message === "Authentication required") {
        console.log("Profile load skipped: user not authenticated");
        return;
      }
      
      console.error("Error loading profile:", error);
      // If profile fails to load, still allow the session but with limited data
      try {
        const session = await authAPI.getSession();
        if (session?.user) {
          console.log("Using session data as fallback for profile");
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email || "User",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
            verified: false,
            stats: {
              totalGames: 0,
              wins: 0,
              sportBreakdown: {
                basketball: 0,
                soccer: 0,
                volleyball: 0,
              },
            },
          });
        }
      } catch (sessionError) {
        console.error("Error getting session:", sessionError);
        // If both profile and session fail, we'll show auth page
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    await authAPI.signIn(email, password);
    await loadUserProfile();
  };

  const signUp = async (email: string, password: string, name: string) => {
    await authAPI.signUp(email, password, name);
    await loadUserProfile();
  };

  const signOut = async () => {
    await authAPI.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}