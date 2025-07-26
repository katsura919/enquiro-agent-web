"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null; // Or a spinner
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.firstName}!</h1>
      <p className="text-lg mb-2">You are logged in as <span className="font-mono">{user.email}</span></p>
      <p className="text-base text-zinc-400">Business ID: {user.businessId}</p>
    </div>
  );
}
