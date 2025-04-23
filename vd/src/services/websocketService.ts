"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { notifyError } from "./notificationService"

// WebSocket base URL
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000"

let socket: WebSocket | null = null
let reconnectTimer: number | null = null
const MAX_RECONNECT_DELAY = 5000
let reconnectAttempts = 0

// Event listeners
const listeners: { [key: string]: ((data: any) => void)[] } = {
  positions: [],
  broker_status: [],
  trades: [],
  notification: [],
  connection: [],
  error: [],
}

// Initialize WebSocket connection
export const initWebSocket = (token: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return
  }

  // Clear any existing reconnect timer
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  try {
    socket = new WebSocket(`${WS_URL}/ws?token=${token}`)

    socket.onopen = () => {
      console.log("WebSocket connection established")
      reconnectAttempts = 0

      // Notify listeners of connection
      listeners.connection.forEach((listener) => {
        listener({ connected: true })
      })

      // Send initial ping
      socket.send(JSON.stringify({ type: "ping" }))
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Handle different message types
        if (data.type && listeners[data.type]) {
          listeners[data.type].forEach((listener) => {
            listener(data.data)
          })
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error)
      }
    }

    socket.onerror = (error) => {
      console.error("WebSocket error:", error)

      // Notify listeners of error
      listeners.error.forEach((listener) => {
        listener({ error: "WebSocket connection error" })
      })
    }

    socket.onclose = (event) => {
      console.log(`WebSocket connection closed: ${event.code} ${event.reason}`)

      // Notify listeners of disconnection
      listeners.connection.forEach((listener) => {
        listener({ connected: false })
      })

      // Attempt to reconnect with exponential backoff
      if (event.code !== 1000) {
        // Not a normal closure
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY)
        reconnectAttempts++

        reconnectTimer = window.setTimeout(() => {
          initWebSocket(token)
        }, delay)
      }
    }
  } catch (error) {
    console.error("Failed to establish WebSocket connection:", error)
    notifyError("WebSocket Connection Failed", "Unable to establish real-time connection")
  }
}

// Close WebSocket connection
export const closeWebSocket = () => {
  if (socket) {
    socket.close(1000, "User logged out")
    socket = null
  }

  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

// Add event listener
export const addEventListener = (type: string, callback: (data: any) => void) => {
  if (!listeners[type]) {
    listeners[type] = []
  }

  listeners[type].push(callback)
}

// Remove event listener
export const removeEventListener = (type: string, callback: (data: any) => void) => {
  if (listeners[type]) {
    listeners[type] = listeners[type].filter((listener) => listener !== callback)
  }
}

// Send message to server
export const sendMessage = (message: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message))
    return true
  }
  return false
}

// Custom hook for using WebSocket
export const useWebSocket = () => {
  const { user } = useAuth()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (user?.token) {
      // Initialize WebSocket connection
      initWebSocket(user.token)

      // Add connection listener
      const connectionListener = (data: { connected: boolean }) => {
        setConnected(data.connected)
      }

      addEventListener("connection", connectionListener)

      // Clean up on unmount
      return () => {
        removeEventListener("connection", connectionListener)
      }
    } else {
      // Close connection if user is not authenticated
      closeWebSocket()
      setConnected(false)
    }
  }, [user])

  return {
    connected,
    addEventListener,
    removeEventListener,
    sendMessage,
  }
}

// Custom hook for real-time positions
export const usePositions = (initialPositions: any[] = []) => {
  const [positions, setPositions] = useState(initialPositions)
  const { connected } = useWebSocket()

  useEffect(() => {
    const handlePositionUpdate = (data: any[]) => {
      setPositions(data)
    }

    addEventListener("positions", handlePositionUpdate)

    return () => {
      removeEventListener("positions", handlePositionUpdate)
    }
  }, [])

  return {
    positions,
    isRealTime: connected,
  }
}

// Custom hook for broker status
export const useBrokerStatus = (initialStatuses: any[] = []) => {
  const [statuses, setStatuses] = useState(initialStatuses)
  const { connected } = useWebSocket()

  useEffect(() => {
    const handleStatusUpdate = (data: any[]) => {
      setStatuses(data)
    }

    addEventListener("broker_status", handleStatusUpdate)

    return () => {
      removeEventListener("broker_status", handleStatusUpdate)
    }
  }, [])

  return {
    statuses,
    isRealTime: connected,
  }
}

// Custom hook for real-time trades
export const useTrades = (initialTrades: any[] = []) => {
  const [trades, setTrades] = useState(initialTrades)
  const { connected } = useWebSocket()

  useEffect(() => {
    const handleTradeUpdate = (data: any[]) => {
      setTrades(data)
    }

    addEventListener("trades", handleTradeUpdate)

    return () => {
      removeEventListener("trades", handleTradeUpdate)
    }
  }, [])

  return {
    trades,
    isRealTime: connected,
  }
}

// Custom hook for real-time notifications
export const useNotifications = (initialNotifications: any[] = []) => {
  const [notifications, setNotifications] = useState(initialNotifications)
  const { connected } = useWebSocket()

  useEffect(() => {
    const handleNotification = (data: any) => {
      setNotifications((prev) => [data, ...prev])
    }

    addEventListener("notification", handleNotification)

    return () => {
      removeEventListener("notification", handleNotification)
    }
  }, [])

  return {
    notifications,
    isRealTime: connected,
  }
}
