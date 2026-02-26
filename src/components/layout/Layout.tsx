import { Outlet } from "react-router-dom"
import { AppSidebar } from "./AppSidebar"
import { Header } from "./Header";
import { useState } from "react";
export function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      </div>
    </div>
  )
}