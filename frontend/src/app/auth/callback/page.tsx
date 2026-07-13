"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          // If session exists, user is successfully logged in.
          localStorage.setItem("token", data.session.access_token);
          router.push("/");
        } else {
          // Listen for auth state change in case the session is being set asynchronously (e.g. from hash fragment)
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              localStorage.setItem("token", session.access_token);
              router.push("/");
            }
          });

          // Fallback timeout in case no session is found after a few seconds
          setTimeout(() => {
            if (!localStorage.getItem("token")) {
              setError("Authentication failed. No session established.");
              setTimeout(() => router.push("/login"), 3000);
            }
          }, 3000);

          return () => subscription.unsubscribe();
        }
      } catch (err: any) {
        setError(err.message || "An error occurred during authentication.");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          {error ? "Authentication Error" : "Authenticating..."}
        </h2>
        <p className="text-muted-foreground">
          {error ? error : "Please wait while we complete your login."}
        </p>
      </div>
    </div>
  );
}
