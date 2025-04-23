import express from "express"
import http from "http"
import cors from "cors"
import dotenv from "dotenv"
import helmet from "helmet"
import morgan from "morgan"
import { Sequelize } from "sequelize"
import { initializeModels } from "./models"
import { initializeWebSocketServer } from "./services/websocket.service"
import authRoutes from "./routes/auth.routes"
import brokerRoutes from "./routes/broker.routes"
import tradeRoutes from "./routes/trade.routes"
import copyTradeRoutes from "./routes/copyTrade.routes"
import settingsRoutes from "./routes/settings.routes"
import symbolRoutes from "./routes/symbol.routes"
import notificationRoutes from "./routes/notification.routes"
import logRoutes from "./routes/log.routes"
import { authenticateJWT } from "./middleware/auth.middleware"
import { seedAdmin } from "./controllers/auth.controller"

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Create HTTP server
const server = http.createServer(app)

// Middleware
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database connection
const sequelize = new Sequelize(process.env.DB_NAME || "", process.env.DB_USER || "", process.env.DB_PASSWORD || "", {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  dialect: "mysql",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

// Initialize models
const models = initializeModels(sequelize)

// Initialize WebSocket server
initializeWebSocketServer(server)

// Public routes
app.use("/api/auth", authRoutes)

// Protected routes
app.use("/api/brokers", authenticateJWT, brokerRoutes)
app.use("/api/trades", authenticateJWT, tradeRoutes)
app.use("/api/copy-trading", authenticateJWT, copyTradeRoutes)
app.use("/api/settings", authenticateJWT, settingsRoutes)
app.use("/api/symbols", authenticateJWT, symbolRoutes)
app.use("/api/notifications", authenticateJWT, notificationRoutes)
app.use("/api/logs", authenticateJWT, logRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate()
    console.log("Database connection has been established successfully.")

    // Sync database (in development, you might want to use { force: true })
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" })
    console.log("Database synchronized")

    // Seed admin user if needed
    await seedAdmin()

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Unable to start server:", error)
    process.exit(1)
  }
}

startServer()

export default app
