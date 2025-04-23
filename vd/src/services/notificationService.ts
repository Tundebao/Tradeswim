import axios from "axios"

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  read: boolean
  createdAt: string
}

// Get all notifications
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await axios.get(`${API_URL}/notifications`)

    if (response.data.success) {
      return response.data.data
    }

    return []
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

// Mark a notification as read
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    const response = await axios.put(`${API_URL}/notifications/${id}/read`)
    return response.data.success
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const response = await axios.put(`${API_URL}/notifications/read-all`)
    return response.data.success
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return false
  }
}

// Delete a notification
export const deleteNotification = async (id: string): Promise<boolean> => {
  try {
    const response = await axios.delete(`${API_URL}/notifications/${id}`)
    return response.data.success
  } catch (error) {
    console.error("Error deleting notification:", error)
    return false
  }
}

// Clear all notifications
export const clearNotifications = async (): Promise<boolean> => {
  try {
    const response = await axios.delete(`${API_URL}/notifications`)
    return response.data.success
  } catch (error) {
    console.error("Error clearing notifications:", error)
    return false
  }
}

// Helper to show toast notifications
import { toast } from "sonner"

const showToast = (notification: Notification) => {
  switch (notification.type) {
    case "success":
      toast.success(notification.title, {
        description: notification.message,
        duration: 5000,
      })
      break
    case "error":
      toast.error(notification.title, {
        description: notification.message,
        duration: 10000,
      })
      break
    case "warning":
      toast.warning(notification.title, {
        description: notification.message,
        duration: 7000,
      })
      break
    case "info":
    default:
      toast.info(notification.title, {
        description: notification.message,
        duration: 5000,
      })
      break
  }
}

// Utility functions for common notifications
export const notifyLogin = (username: string) => {
  const notification = {
    type: "info" as const,
    title: "User Login",
    message: `User ${username} logged in successfully at ${new Date().toLocaleTimeString()}`,
  }

  showToast(notification as Notification)
  return notification
}

export const notifyChange = (action: string, details: string) => {
  const notification = {
    type: "success" as const,
    title: "Configuration Changed",
    message: `${action}: ${details}`,
  }

  showToast(notification as Notification)
  return notification
}

export const notifyError = (error: string, details?: string) => {
  const notification = {
    type: "error" as const,
    title: "Error Occurred",
    message: details ? `${error}: ${details}` : error,
  }

  showToast(notification as Notification)
  return notification
}

export const notifyBrokerConnection = (status: boolean, broker: string) => {
  const notification = {
    type: status ? ("success" as const) : ("error" as const),
    title: status ? "Broker Connected" : "Broker Disconnected",
    message: status ? `Successfully connected to ${broker}` : `Connection to ${broker} lost or failed`,
  }

  showToast(notification as Notification)
  return notification
}

export const notifyTrade = (status: boolean, symbol: string, action: "buy" | "sell", quantity: number) => {
  const notification = {
    type: status ? ("success" as const) : ("error" as const),
    title: status ? "Trade Executed" : "Trade Failed",
    message: status
      ? `Successfully ${action === "buy" ? "bought" : "sold"} ${quantity} ${symbol}`
      : `Failed to ${action} ${quantity} ${symbol}`,
  }

  showToast(notification as Notification)
  return notification
}

// For risk control notifications
export const notifyRiskAlert = (alert: string, details: string) => {
  const notification = {
    type: "warning" as const,
    title: `Risk Alert: ${alert}`,
    message: details,
  }

  showToast(notification as Notification)
  return notification
}
