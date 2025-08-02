"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Fix redirection issue by ensuring no navigation occurs on login failure
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      const msg = err.message || "Login failed";
      setError(msg);
      // Basic error field detection based on message
      if (msg.toLowerCase().includes("email")) {
        setEmailError(msg);
      } else if (msg.toLowerCase().includes("password")) {
        setPasswordError(msg);
      } else {
        setEmailError("");
        setPasswordError("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  // Update the color theme for a light theme
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden bg-gray-50 border-gray-200">
        {/* Left: Login Form */}
        <div className="w-full md:w-2/5 flex flex-col justify-center px-14 py-20 gap-10">
          <div className="">
            <span className="inline-block px-4 py-1 rounded-full bg-gray-200 text-gray-700 font-semibold text-lg tracking-wide mb-4">Enquiro Agents</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
            <p className="text-gray-500 text-sm">Customer Service Portal</p>
          </div>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={submitting}
                className={`rounded-xl px-4 py-3 bg-white border transition-colors duration-200 text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${emailError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                aria-invalid={!!emailError}
                placeholder="Enter your email"
              />
              {emailError && (
                <div className="text-red-500 text-xs mt-1">{emailError}</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={submitting}
                  className={`rounded-xl px-4 py-3 bg-white border transition-colors duration-200 text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 pr-12 ${passwordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
                  aria-invalid={!!passwordError}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && (
                <div className="text-red-500 text-xs mt-1">{passwordError}</div>
              )}
            </div>
            {error && !emailError && !passwordError && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}
            <Button type="submit" className="mt-2 w-full rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base py-3 transition-colors duration-200 flex items-center justify-center gap-2" disabled={submitting}>
              {submitting ? (
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <div className="mt-8 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Enquiro Agents Portal
          </div>
        </div>
        {/* Right: Custom Image Background */}
        <div
          className="hidden md:flex md:w-3/5 items-center justify-center bg-gray-100 relative"
          style={{
            backgroundImage: 'url(/animations/office.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Optionally, add overlays or decorative elements here */}
        </div>
      </div>
    </div>
  );
}
