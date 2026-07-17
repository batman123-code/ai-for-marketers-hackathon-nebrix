"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data.session) {
            localStorage.setItem("token", data.session.access_token);
            router.push("/");
            return;
          }
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
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
  }, [router, searchParams]);

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

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
