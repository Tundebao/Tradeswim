import axios from "axios"
import { BrokerCredential, BrokerConnectionStatus } from "../models/brokerCredential.model"

// Base URL for Schwab API
const SCHWAB_API_BASE_URL = "https://api.schwab.com"
const SCHWAB_AUTH_URL = "https://api.schwab.com/oauth/authorize"
const SCHWAB_TOKEN_URL = "https://api.schwab.com/oauth/token"

// Execute a trade on Schwab
export const executeSchwabTrade = async (
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
      accountId: accountNumber,
      symbol: trade.symbol,
      quantity: trade.quantity,
      side: trade.side.toUpperCase(),
      orderType: trade.orderType.toUpperCase(),
      timeInForce: "DAY",
    }

    if (trade.orderType === "limit" && trade.limitPrice) {
      orderPayload.limitPrice = trade.limitPrice
    }

    if (trade.isOption && trade.optionDetails) {
      // Add option-specific details
      orderPayload.securityType = "OPTION"
      orderPayload.optionDetails = {
        expirationDate: trade.optionDetails.expirationDate,
        strikePrice: trade.optionDetails.strikePrice,
        optionType: trade.optionDetails.optionType.toUpperCase(),
      }
    } else {
      orderPayload.securityType = "EQUITY"
    }

    const response = await axios.post(`${SCHWAB_API_BASE_URL}/v1/accounts/${accountNumber}/orders`, orderPayload, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    })

    if (response.data && response.data.orderId) {
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
    console.error("Schwab execute trade error:", error.response?.data || error.message)
    return {
      success: false,
      message: errorMessage,
    }
  }
}

// Exchange authorization code for access token
export const exchangeSchwabAuthCode = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
) => {
  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    })

    const response = await axios.post(SCHWAB_TOKEN_URL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    if (response.data && response.data.access_token) {
      return {
        success: true,
        data: response.data,
      }
    }

    return {
      success: false,
      message: "Failed to exchange authorization code",
    }
  } catch (error: any) {
    console.error("Schwab token exchange error:", error.response?.data || error.message)
    return {
      success: false,
      message: error.response?.data?.error || "Failed to exchange authorization code",
    }
  }
}

// Fetch accounts from Schwab
export const fetchSchwabAccounts = async (accessToken: string) => {
  try {
    const response = await axios.get(`${SCHWAB_API_BASE_URL}/v1/accounts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (response.data && response.data.accounts) {
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
    console.error("Schwab fetch accounts error:", error.response?.data || error.message)
    return {
      success: false,
      message: error.response?.data?.error || "Failed to fetch accounts",
    }
  }
}

// Fetch balance for a specific account
export const fetchSchwabBalance = async (accessToken: string, accountId: string) => {
  try {
    const response = await axios.get(`${SCHWAB_API_BASE_URL}/v1/accounts/${accountId}/balances`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
    console.error("Schwab fetch balance error:", error.response?.data || error.message)
    return {
      success: false,
      message: error.response?.data?.error || "Failed to fetch balance",
    }
  }
}

// Fetch positions for a specific account
export const fetchSchwabPositions = async (accessToken: string, accountId: string) => {
  try {
    const response = await axios.get(`${SCHWAB_API_BASE_URL}/v1/accounts/${accountId}/positions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (response.data && response.data.positions) {
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
    console.error("Schwab fetch positions error:", error.response?.data || error.message)
    return {
      success: false,
      message: error.response?.data?.error || "Failed to fetch positions",
    }
  }
}

// Check broker connection health
export const checkSchwabHealth = async (brokerId: number) => {
  try {
    // Get broker credentials
    const broker = await BrokerCredential.findByPk(brokerId)

    if (!broker || !broker.sessionToken) {
      return {
        status: BrokerConnectionStatus.DISCONNECTED,
        message: "No access token available",
        timestamp: new Date().toISOString(),
      }
    }

    // Check if token is expired
    if (broker.expiry && new Date(broker.expiry) < new Date()) {
      // Try to refresh the token
      if (broker.clientId && broker.clientSecret && broker.sessionToken) {
        try {
          const refreshResult = await refreshSchwabToken(broker.sessionToken, broker.clientId, broker.clientSecret)

          if (refreshResult.success) {
            // Update broker with new token
            const expiryDate = new Date()
            expiryDate.setSeconds(expiryDate.getSeconds() + refreshResult.data.expires_in)

            await broker.update({
              sessionToken: refreshResult.data.access_token,
              expiry: expiryDate,
              connectionStatus: BrokerConnectionStatus.CONNECTED,
              lastConnectionCheck: new Date(),
              connectionError: "", // Empty string instead of null
            })

            return {
              status: BrokerConnectionStatus.CONNECTED,
              timestamp: new Date().toISOString(),
            }
          }
        } catch (refreshError) {
          console.error("Failed to refresh Schwab token:", refreshError)
        }
      }

      // Update broker status to disconnected if refresh failed
      await broker.update({
        connectionStatus: BrokerConnectionStatus.DISCONNECTED,
        lastConnectionCheck: new Date(),
        connectionError: "Access token expired and refresh failed",
      })

      return {
        status: BrokerConnectionStatus.DISCONNECTED,
        message: "Access token expired",
        timestamp: new Date().toISOString(),
      }
    }

    // Validate access token by making a simple API call
    const response = await axios.get(`${SCHWAB_API_BASE_URL}/v1/userinfo`, {
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
    throw new Error("Unexpected response from Schwab API")
  } catch (error: any) {
    console.error("Schwab health check error:", error.response?.data || error.message)

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
      message: error.response?.data?.error || "Failed to validate access token",
      timestamp: new Date().toISOString(),
    }
  }
}

// Refresh access token
export const refreshSchwabToken = async (refreshToken: string, clientId: string, clientSecret: string) => {
  try {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    })

    const response = await axios.post(SCHWAB_TOKEN_URL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    if (response.data && response.data.access_token) {
      return {
        success: true,
        data: response.data,
      }
    }

    return {
      success: false,
      message: "Failed to refresh token",
    }
  } catch (error: any) {
    console.error("Schwab token refresh error:", error.response?.data || error.message)
    return {
      success: false,
      message: error.response?.data?.error || "Failed to refresh token",
    }
  }
}
