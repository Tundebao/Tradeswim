import WebSocket from "ws"
import type http from "http"
import jwt from "jsonwebtoken"
import { Log } from "../models/log.model"

let wss: WebSocket.Server

// Initialize WebSocket server
export const initWebSocketServer = (server: http.Server) => {
  wss = new WebSocket.Server({ server })

  wss.on("connection", (ws: WebSocket & { isAlive?: boolean; userId?: number }, req) => {
    ws.isAlive = true

    // Extract token from URL query parameters
    const url = new URL(req.url || "", `http://${req.headers.host}`)
    const token = url.searchParams.get("token")

    if (!token) {
      ws.close(1008, "Authentication failed: No token provided")
      return
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as { id: number }
      ws.userId = decoded.id

      // Send initial connection message
      ws.send(
        JSON.stringify({
          type: "connection",
          message: "Connected to WebSocket server",
          timestamp: new Date().toISOString(),
        }),
      )

      // Log connection
      Log.create({
        level: "info",
        message: `WebSocket connection established for user ${decoded.id}`,
        source: "websocket",
        userId: decoded.id,
      })
    } catch (error) {
      ws.close(1008, "Authentication failed: Invalid token")
      return
    }

    // Handle pong messages to keep connection alive
    ws.on("pong", () => {
      ws.isAlive = true
    })

    // Handle messages from client
    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message)

        // Handle different message types
        if (data.type === "ping") {
          ws.send(
            JSON.stringify({
              type: "pong",
              timestamp: new Date().toISOString(),
            }),
          )
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error)
      }
    })

    // Handle connection close
    ws.on("close", () => {
      if (ws.userId) {
        Log.create({
          level: "info",
          message: `WebSocket connection closed for user ${ws.userId}`,
          source: "websocket",
          userId: ws.userId,
        })
      }
    })
  })

  // Set up heartbeat interval to detect dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket & { isAlive?: boolean }) => {
      if (ws.isAlive === false) {
        return ws.terminate()
      }

      ws.isAlive = false
      ws.ping()
    })
  }, 30000)

  // Clear interval when server closes
  wss.on("close", () => {
    clearInterval(interval)
  })

  return wss
}

// Broadcast message to all connected clients
export const broadcastMessage = (data: any) => {
  if (!wss) {
    console.error("WebSocket server not initialized")
    return
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

// Send message to specific user
export const sendMessageToUser = (userId: number, data: any) => {
  if (!wss) {
    console.error("WebSocket server not initialized")
    return
  }

  wss.clients.forEach((client: WebSocket & { userId?: number }) => {
    if (client.readyState === WebSocket.OPEN && client.userId === userId) {
      client.send(JSON.stringify(data))
    }
  })
}

// Send position updates
export const sendPositionUpdates = (positions: any[], userId?: number) => {
  const message = {
    type: "positions",
    data: positions,
    timestamp: new Date().toISOString(),
  }

  if (userId) {
    sendMessageToUser(userId, message)
  } else {
    broadcastMessage(message)
  }
}

// Send broker status updates
export const sendBrokerStatusUpdates = (statuses: any[], userId?: number) => {
  const message = {
    type: "broker_status",
    data: statuses,
    timestamp: new Date().toISOString(),
  }

  if (userId) {
    sendMessageToUser(userId, message)
  } else {
    broadcastMessage(message)
  }
}

// Send trade updates
export const sendTradeUpdates = (trades: any[], userId?: number) => {
  const message = {
    type: "trades",
    data: trades,
    timestamp: new Date().toISOString(),
  }

  if (userId) {
    sendMessageToUser(userId, message)
  } else {
    broadcastMessage(message)
  }
}

// Send notification
export const sendNotification = (notification: any, userId?: number) => {
  const message = {
    type: "notification",
    data: notification,
    timestamp: new Date().toISOString(),
  }

  if (userId) {
    sendMessageToUser(userId, message)
  } else {
    broadcastMessage(message)
  }
}
