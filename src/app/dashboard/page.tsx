"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
// Remove the default children rendering since we now use TabContent
// The layout will handle the tab content display

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return null; // Layout will show loading spinner
  }

  if (!user) {
    return null; // Will redirect
  }

  // The dashboard content is now handled by the TabContent component in the layout
  // This page component is mainly for route matching and auth checks
  return null;
}
