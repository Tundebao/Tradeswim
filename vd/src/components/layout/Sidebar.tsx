"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { Home, Bookmark, Users, ChevronLeft, Activity } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { logout } = useAuth()
  const location = useLocation()
  const [activeGroup, setActiveGroup] = useState<string | null>("main")

  const mainNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Symbols", path: "/symbols", icon: Bookmark },
    { name: "Profile", path: "/profile", icon: Users },
    { name: "Activity", path: "/activity", icon: Activity },
  ]

  const toggleGroup = (group: string) => {
    if (isOpen) {
      setActiveGroup(activeGroup === group ? null : group)
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full transition-all duration-300 ease-in-out flex flex-col fixed z-10 w-64 left-0",
      )}
    >
      <div className="p-4 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-primary truncate">TradeCopy</h1>
        </Link>
        <button onClick={onToggle} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <div className="mb-6">
          <button
            onClick={() => toggleGroup("main")}
            className={cn(
              "w-full flex items-center px-4 py-2 justify-between",
              activeGroup === "main" ? "text-primary" : "text-gray-600 dark:text-gray-300",
            )}
          >
            <span className="font-medium">Main Platform</span>
          </button>

          {activeGroup === "main" && (
            <div className="mt-1 space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-2 justify-start space-x-3",
                    isActive(item.path)
                      ? "bg-gray-100 dark:bg-gray-700 text-primary"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
