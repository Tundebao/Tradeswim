"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import Sidebar from "./Sidebar"
import TopBar from "./TopBar"

interface MainLayoutProps {
  children: React.ReactNode
  requireAuth?: boolean
}

const MainLayout = ({ children, requireAuth = true }: MainLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Default to hidden
  const [brokerConnected, setBrokerConnected] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, isLoading, navigate, requireAuth])

  // Simulate checking for broker connection
  useEffect(() => {
    // In a real app, check if a broker is connected from your API
    setBrokerConnected(false)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
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

  // If authentication is required but user is not authenticated, don't render
  if (requireAuth && !isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      {isAuthenticated && isSidebarOpen && <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />}

      <div
        className={`flex flex-col flex-1 overflow-hidden ${isSidebarOpen ? "ml-64" : "ml-0"} transition-all duration-300`}
      >
        {isAuthenticated && <TopBar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">{children}</main>
      </div>
    </div>
  )
}

export default MainLayout
