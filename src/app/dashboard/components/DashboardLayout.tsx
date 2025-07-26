import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-950 text-white shadow">
        <div className="font-bold text-xl">CRM Dashboard</div>
        <div className="flex items-center gap-4">
          {/* Profile, notifications, etc. */}
          <span className="rounded-full bg-gray-800 px-3 py-1">Agent</span>
        </div>
      </header>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-gray-900 text-zinc-200 flex flex-col py-6 px-4 gap-2">
          <a href="/dashboard" className="py-2 px-3 rounded hover:bg-gray-800">Dashboard</a>
          <a href="/cases" className="py-2 px-3 rounded hover:bg-gray-800">Escalation Cases</a>
          <a href="/chat" className="py-2 px-3 rounded hover:bg-gray-800">Chat</a>
        </aside>
        {/* Main Content */}
        <main className="flex-1 bg-gradient-to-br from-gray-950 to-gray-900 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
