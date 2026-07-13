import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isPlaceholder = !supabaseUrl || supabaseUrl.includes("placeholder");

// Create a custom mock supabase client for local development
const createMockSupabase = () => {
  const authStateListeners = new Set<(event: string, session: any) => void>();

  const getMockUser = (email: string) => ({
    id: "mock-user-uuid-1234-5678",
    email: email || "user@example.com",
    role: "authenticated",
    user_metadata: {
      full_name: "Mock User",
    },
  });

  const getMockSession = (email: string) => ({
    access_token: "mock-jwt-access-token",
    refresh_token: "mock-jwt-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: getMockUser(email),
  });

  return {
    auth: {
      async getSession() {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          if (token === "mock-jwt-access-token") {
            return { data: { session: getMockSession("mock@example.com") }, error: null };
          }
        }
        return { data: { session: null }, error: null };
      },
      onAuthStateChange(callback: (event: string, session: any) => void) {
        authStateListeners.add(callback);
        // Trigger initial state callback
        this.getSession().then(({ data: { session } }) => {
          callback(session ? "SIGNED_IN" : "SIGNED_OUT", session);
        });
        return {
          data: {
            subscription: {
              unsubscribe() {
                authStateListeners.delete(callback);
              },
            },
          },
        };
      },
      async signInWithPassword({ email, password }: any) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", "mock-jwt-access-token");
        }
        const session = getMockSession(email);
        authStateListeners.forEach((listener) => listener("SIGNED_IN", session));
        return { data: { user: session.user, session }, error: null };
      },
      async signUp({ email, password, options }: any) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", "mock-jwt-access-token");
        }
        const session = getMockSession(email);
        if (options?.data) {
          session.user.user_metadata = { ...session.user.user_metadata, ...options.data };
        }
        authStateListeners.forEach((listener) => listener("SIGNED_IN", session));
        return { data: { user: session.user, session }, error: null };
      },
      async signInWithOAuth({ provider, options }: any) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", "mock-jwt-access-token");
          if (options?.redirectTo) {
            window.location.href = options.redirectTo;
          } else {
            window.location.href = "/";
          }
        }
        return { data: {}, error: null };
      },
      async signOut() {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        authStateListeners.forEach((listener) => listener("SIGNED_OUT", null));
        return { error: null };
      },
    },
  };
};

export const supabase = isPlaceholder
  ? (createMockSupabase() as any)
  : createClient(supabaseUrl, supabaseAnonKey);

