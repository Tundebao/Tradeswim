"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Menu, Bell, User, Check, Clock } from "lucide-react"
import { formatDateTime } from "@/utils/dateUtils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { getNotifications, markNotificationAsRead, type Notification } from "@/services/notificationService"
import { getRelativeTime } from "@/utils/dateUtils"
import { Badge } from "@/components/ui/badge"
import AdminAuthModal from "@/components/admin/AdminAuthModal"

interface TopBarProps {
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

const TopBar = ({ toggleSidebar, isSidebarOpen }: TopBarProps) => {
  const { user, logout } = useAuth()
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false)

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Fetch notifications initially
    loadNotifications()

    // Set up polling to refresh notifications
    const interval = setInterval(() => {
      loadNotifications()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const loadNotifications = () => {
    const data = getNotifications()
    setNotifications(data)
  }

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id)
    loadNotifications() // Reload notifications after marking as read
  }

  const handleAdminAccess = () => {
    setShowAdminAuthModal(true)
  }

  // Get unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="mr-4 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <Menu className="h-5 w-5 text-gray-500" />
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(currentDateTime)}</div>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="h-5 w-5 text-gray-500" />
                {unreadCount > 0 && <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex justify-between items-center px-4 py-2">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
              <DropdownMenuSeparator />

              {notifications.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {getRelativeTime(notification.createdAt)}
                          </div>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-blue-500 hover:text-blue-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="justify-center text-blue-500">
                    <Link to="/admin/notifications">View all notifications</Link>
                  </DropdownMenuItem>
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-gray-500">No notifications</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center text-sm p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <User className="h-5 w-5 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-4 py-2 text-xs text-gray-500">{user?.username}</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAdminAccess} className="cursor-pointer">
                Admin Panel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-500 cursor-pointer" onClick={logout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AdminAuthModal isOpen={showAdminAuthModal} onClose={() => setShowAdminAuthModal(false)} />
    </>
  )
}

export default TopBar
