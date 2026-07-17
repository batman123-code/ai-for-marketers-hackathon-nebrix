import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        // Sign out of Supabase to clear its internal storage, breaking the loop!
        import("@/lib/supabase").then(({ supabase }) => {
          supabase.auth.signOut().finally(() => {
            console.log("[api-client] 401 Unauthorized received, redirecting to /login");
            window.location.href = "/login";
          });
        });
      }
    }
    return Promise.reject(error);
  }
);
