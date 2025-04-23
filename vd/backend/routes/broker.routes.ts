import express from "express"
import {
  connectBroker,
  completeSchwabOAuth,
  getBrokerAccounts,
  getBrokerBalance,
  getPositions,
  checkBrokerHealth,
  disconnectBroker,
} from "../controllers/broker.controller"

const router = express.Router()

// Connect broker account
router.post("/", connectBroker)

// Complete Schwab OAuth flow
router.post("/schwab/complete", completeSchwabOAuth)

// Get all broker accounts
router.get("/accounts", getBrokerAccounts)

// Get broker account balance
router.get("/accounts/:accountId/balance", getBrokerBalance)

// Get positions for a broker account
router.get("/accounts/:accountId/positions", getPositions)

// Check broker health
router.get("/:brokerId/health", checkBrokerHealth)

// Disconnect broker
router.delete("/:brokerId", disconnectBroker)

export default router
