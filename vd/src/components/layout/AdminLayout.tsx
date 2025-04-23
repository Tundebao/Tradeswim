"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import {
  Home,
  CreditCard,
  ArrowLeftRight,
  Settings,
  BarChart2,
  ClipboardList,
  Bell,
  Shield,
  Activity,
  ListChecks,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [brokerConnected, setBrokerConnected] = useState(false)

  // Check if user is authenticated and admin verified
  useEffect(() => {
    if (!isLoading) {
      const adminVerified = localStorage.getItem("adminVerified") === "true"

      if (!isAuthenticated) {
        navigate("/login")
      } else if (!adminVerified) {
        navigate("/dashboard")
      }
    }

    // Simulate checking for broker connection
    setBrokerConnected(false)
  }, [isAuthenticated, isLoading, navigate])

  // Admin navigation items
  const navItems = [
    { name: "Overview", path: "/admin", icon: Home },
    { name: "Accounts", path: "/admin/accounts", icon: CreditCard },
    { name: "Manual Trade", path: "/admin/manual-trade", icon: ArrowLeftRight },
    { name: "Copy Settings", path: "/admin/copy-settings", icon: Settings },
    { name: "Positions", path: "/admin/positions", icon: BarChart2 },
    { name: "Trades", path: "/admin/trades", icon: ClipboardList },
    { name: "Notifications", path: "/admin/notifications", icon: Bell },
    { name: "Settings", path: "/admin/settings", icon: Shield },
    { name: "Logs", path: "/admin/logs", icon: Activity },
    { name: "Symbols", path: "/admin/symbols", icon: ListChecks },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    localStorage.removeItem("adminVerified")
    logout() // Use the logout function from AuthContext
    navigate("/dashboard")
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-trading-navy bg-opacity-5">
        <div className="animate-pulse">
          <h2 className="text-xl font-semibold text-primary">Loading...</h2>
        </div>
      </div>
    )
  }

  // If not authenticated or admin not verified, don't render
  if (!isAuthenticated || localStorage.getItem("adminVerified") !== "true") {
    return null
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Admin top navigation */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <Link to="/admin" className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
            </Link>
          </div>

          <div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500" type="button">
              <LogOut className="h-4 w-4 mr-2" />
              Exit Admin
            </Button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                isActive(item.path)
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:border-gray-300",
              )}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.name}
            </Link>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
        {!brokerConnected && (
          <div className="mb-6 p-4 bg-warning-light border-l-4 border-warning rounded-md flex items-start gap-3">
            <AlertCircle className="text-warning mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-100">No Broker Connected</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You must connect a real account before trading. Go to Admin &gt; Accounts to add a broker.
              </p>
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  )
}

export default AdminLayout
