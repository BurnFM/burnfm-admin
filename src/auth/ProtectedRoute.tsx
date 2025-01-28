"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import {useAuth} from "@/auth/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Redirect if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>; // Optional loading state
  }

  return user ? <>{children}</> : null;
}
