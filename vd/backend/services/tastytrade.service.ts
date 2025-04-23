import axios from "axios"
import { BrokerCredential, BrokerConnectionStatus } from "../models/brokerCredential.model"

// Base URL for Tastytrade API
const TASTYTRADE_API_BASE_URL = "https://api.tastytrade.com"

// Authenticate with Tastytrade
export const authenticateTastytrade = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${TASTYTRADE_API_BASE_URL}/sessions`, {
      login: username,
      password: password,
    })

    if (response.data && response.data.session_token) {
      return {
        success: true,
        data: {
          user: {
            email: response.data.user.email,
            username: response.data.user.username,
            external_id: response.data.user.external_id,
          },
          session_token: response.data.session_token,
          remember_token: response.data.remember_token,
        },
      }
    }

    return {
      success: false,
      message: "Authentication failed",
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || "Authentication failed"
    console.error("Tastytrade authentication error:", error.response?.data || error.message)
    return {
      success: false,
      message: errorMessage,
    }
  }
}

// Fetch accounts from Tastytrade
export const fetchTastytradeAccounts = async (sessionToken: string) => {
  try {
    const response = await axios.get(`${TASTYTRADE_API_BASE_URL}/customers/me/accounts`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })

    if (response.data && response.data.items) {
      return {
        success: true,
        data: response.data,
      }
    }

    return {
      success: false,
      message: "Failed to fetch accounts",
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || "Failed to fetch accounts"
    console.error("Tastytrade fetch accounts error:", error.response?.data || error.message)
    return {
      success: false,
      message: errorMessage,
    }
  }
}

// Fetch balance for a specific account
export const fetchTastytradeBalance = async (sessionToken: string, accountNumber: string) => {
  try {
    const response = await axios.get(`${TASTYTRADE_API_BASE_URL}/accounts/${accountNumber}/balances`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })

    if (response.data) {
      return {
        success: true,
        data: response.data,
      }
    }

    return {
      success: false,
      message: "Failed to fetch balance",
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || "Failed to fetch balance"
    console.error("Tastytrade fetch balance error:", error.response?.data || error.message)
    return {
      success: false,
      message: errorMessage,
    }
  }
}

// Fetch positions for a specific account
export const fetchTastytradePositions = async (sessionToken: string, accountNumber: string) => {
  try {
    const response = await axios.get(`${TASTYTRADE_API_BASE_URL}/accounts/${accountNumber}/positions`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })

    if (response.data && response.data.items) {
      return {
        success: true,
        data: response.data,
      }
    }

    return {
      success: false,
      message: "Failed to fetch positions",
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || "Failed to fetch positions"
    console.error("Tastytrade fetch positions error:", error.response?.data || error.message)
    return {
      success: false,
      message: errorMessage,
    }
  }
}

// Execute a trade on Tastytrade
export const executeTastytradeTrade = async (
  sessionToken: string,
  accountNumber: string,
  trade: {
    symbol: string
    quantity: number
    side: "buy" | "sell"
    orderType: "market" | "limit"
    limitPrice?: number
    isOption: boolean
    optionDetails?: {
      expirationDate: string
      strikePrice: number
      optionType: "call" | "put"
    }
  },
) => {
  try {
    // Construct order payload based on trade type
    const orderPayload: any = {
      account_number: accountNumber,
      source: "API",
      order_type: trade.orderType.toUpperCase(),
      price: trade.limitPrice,
      price_effect: trade.side === "buy" ? "debit" : "credit",
      time_in_force: "Day",
    }

    if (trade.isOption && trade.optionDetails) {
      // Option order
      const optionSymbol = `${trade.symbol}${trade.optionDetails.expirationDate.replace(/-/g, "")}${trade.optionDetails.optionType[0].toUpperCase()}${(trade.optionDetails.strikePrice * 1000).toString().padStart(8, "0")}`

      orderPayload.legs = [
        {
          instrument_type: "Equity Option",
          symbol: optionSymbol,
          quantity: trade.quantity,
          side: trade.side.toUpperCase(),
        },
      ]
    } else {
      // Stock order
      orderPayload.legs = [
        {
          instrument_type: "Equity",
          symbol: trade.symbol,
          quantity: trade.quantity,
          side: trade.side.toUpperCase(),
        },
      ]
    }

    const response = await axios.post(`${TASTYTRADE_API_BASE_URL}/accounts/${accountNumber}/orders`, orderPayload, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    })

    if (response.data && response.data.order_id) {
      return {
        success: true,
        data: response.data,
      }
    }

    return {
      success: false,
      message: "Failed to execute trade",
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || "Failed to execute trade"
    console.error("Tastytrade execute trade error:", error.response?.data || error.message)
    return {
      success: false,
      message: errorMessage,
    }
  }
}

// Check broker connection health
export const checkTastytradeHealth = async (brokerId: number) => {
  try {
    // Get broker credentials
    const broker = await BrokerCredential.findByPk(brokerId)

    if (!broker || !broker.sessionToken) {
      return {
        status: BrokerConnectionStatus.DISCONNECTED,
        message: "No session token available",
        timestamp: new Date().toISOString(),
      }
    }

    // Check if token is expired
    if (broker.expiry && new Date(broker.expiry) < new Date()) {
      // Update broker status
      await broker.update({
        connectionStatus: BrokerConnectionStatus.DISCONNECTED,
        lastConnectionCheck: new Date(),
        connectionError: "Session token expired",
      })

      return {
        status: BrokerConnectionStatus.DISCONNECTED,
        message: "Session token expired",
        timestamp: new Date().toISOString(),
      }
    }

    // Validate session token by making a simple API call
    const response = await axios.get(`${TASTYTRADE_API_BASE_URL}/customers/me`, {
      headers: {
        Authorization: `Bearer ${broker.sessionToken}`,
      },
    })

    if (response.status === 200) {
      // Update broker status
      await broker.update({
        connectionStatus: BrokerConnectionStatus.CONNECTED,
        lastConnectionCheck: new Date(),
        connectionError: "", // Empty string instead of null
      })

      return {
        status: BrokerConnectionStatus.CONNECTED,
        timestamp: new Date().toISOString(),
      }
    }

    // If we get here, something unexpected happened
    throw new Error("Unexpected response from Tastytrade API")
  } catch (error: any) {
    console.error("Tastytrade health check error:", error.response?.data || error.message)

    // Update broker status
    if (brokerId) {
      const broker = await BrokerCredential.findByPk(brokerId)
      if (broker) {
        await broker.update({
          connectionStatus: BrokerConnectionStatus.ERROR,
          lastConnectionCheck: new Date(),
          connectionError: error.response?.data?.error || error.message,
        })
      }
    }

    return {
      status: BrokerConnectionStatus.ERROR,
      message: error.response?.data?.error || "Failed to validate session",
      timestamp: new Date().toISOString(),
    }
  }
}
