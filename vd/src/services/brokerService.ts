import axios from "axios"
import {
  type BrokerCredentials,
  type BrokerBalance,
  type Position,
  type Trade,
  type BrokerAccount,
  type SchwarResponse,
  BrokerConnectionStatus,
  type BrokerHealthCheckResponse,
} from "@/types/broker"

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Local storage keys for caching
const BROKER_ACCOUNTS_KEY = "tradecopy_broker_accounts"
const BROKER_CREDENTIALS_KEY = "tradecopy_broker_credentials"
const BROKER_BALANCES_KEY = "tradecopy_broker_balances"
const BROKER_POSITIONS_KEY = "tradecopy_broker_positions"
const BROKER_HEALTH_KEY = "tradecopy_broker_health"

// Check broker connection health
export const checkBrokerHealth = async (brokerId: number): Promise<BrokerHealthCheckResponse> => {
  try {
    const response = await axios.get(`${API_URL}/brokers/${brokerId}/health`)

    if (response.data.success) {
      // Update local cache
      updateBrokerHealth(brokerId, response.data.data)
      return response.data.data
    }

    throw new Error(response.data.message || "Failed to check broker health")
  } catch (error: any) {
    console.error("Error checking broker health:", error)

    const healthCheck: BrokerHealthCheckResponse = {
      status: BrokerConnectionStatus.ERROR,
      message: error.response?.data?.message || "Error checking broker connection",
      timestamp: new Date().toISOString(),
    }

    updateBrokerHealth(brokerId, healthCheck)
    return healthCheck
  }
}

// Update broker health in localStorage
const updateBrokerHealth = (brokerId: number, healthCheck: BrokerHealthCheckResponse) => {
  try {
    const healthString = localStorage.getItem(BROKER_HEALTH_KEY)
    const healthData = healthString ? JSON.parse(healthString) : {}

    healthData[brokerId] = healthCheck
    localStorage.setItem(BROKER_HEALTH_KEY, JSON.stringify(healthData))

    // Also update the broker credentials with the latest status
    const savedCredentialsString = localStorage.getItem(BROKER_CREDENTIALS_KEY)
    let savedCredentials = savedCredentialsString ? JSON.parse(savedCredentialsString) : []

    savedCredentials = savedCredentials.map((broker: BrokerCredentials) => {
      if (broker.id === brokerId) {
        return {
          ...broker,
          connection_status: healthCheck.status,
          last_connection_check: healthCheck.timestamp,
          connection_error: healthCheck.message,
        }
      }
      return broker
    })

    localStorage.setItem(BROKER_CREDENTIALS_KEY, JSON.stringify(savedCredentials))
  } catch (error) {
    console.error("Error updating broker health:", error)
  }
}

// Get the latest broker health from localStorage
export const getBrokerHealth = (brokerId: number): BrokerHealthCheckResponse | null => {
  try {
    const healthString = localStorage.getItem(BROKER_HEALTH_KEY)
    const healthData = healthString ? JSON.parse(healthString) : {}

    return healthData[brokerId] || null
  } catch (error) {
    console.error("Error getting broker health:", error)
    return null
  }
}

// Function to validate broker credentials
export const validateBrokerCredentials = async (
  credentials: BrokerCredentials,
): Promise<{ valid: boolean; message: string; data?: any }> => {
  try {
    const response = await axios.post(`${API_URL}/brokers/validate`, credentials)

    if (response.data.success) {
      return {
        valid: true,
        message: response.data.message,
        data: response.data.data,
      }
    }

    return {
      valid: false,
      message: response.data.message,
    }
  } catch (error: any) {
    console.error("Error validating broker credentials:", error)
    return {
      valid: false,
      message: error.response?.data?.message || "An error occurred while validating credentials. Please try again.",
    }
  }
}

// Function to exchange Schwab authorization code for access token
export const exchangeSchwabAuthCode = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<SchwarResponse> => {
  try {
    const response = await axios.post(`${API_URL}/brokers/schwab/token`, {
      code,
      clientId,
      clientSecret,
      redirectUri,
    })

    if (response.data.success) {
      return response.data.data
    }

    return {
      access_token: "",
      refresh_token: "",
      expires_in: 0,
      token_type: "",
      error: response.data.message,
    }
  } catch (error: any) {
    console.error("Error exchanging Schwab auth code:", error)
    return {
      access_token: "",
      refresh_token: "",
      expires_in: 0,
      token_type: "",
      error: error.response?.data?.message || "An error occurred during token exchange.",
    }
  }
}

// Function to fetch broker account balance
export const fetchBrokerBalance = async (brokerId: number): Promise<BrokerBalance> => {
  try {
    const response = await axios.get(`${API_URL}/brokers/${brokerId}/balance`)

    if (response.data.success) {
      // Cache the balance
      const savedBalancesString = localStorage.getItem(BROKER_BALANCES_KEY)
      const savedBalances = savedBalancesString ? JSON.parse(savedBalancesString) : {}
      savedBalances[brokerId] = response.data.data
      localStorage.setItem(BROKER_BALANCES_KEY, JSON.stringify(savedBalances))

      return response.data.data
    }

    throw new Error(response.data.message || "Failed to fetch balance")
  } catch (error: any) {
    console.error("Error fetching broker balance:", error)

    // Check if we have cached balance
    const savedBalancesString = localStorage.getItem(BROKER_BALANCES_KEY)
    const savedBalances = savedBalancesString ? JSON.parse(savedBalancesString) : {}

    if (savedBalances[brokerId]) {
      return savedBalances[brokerId]
    }

    // Return empty balance
    return {
      total_equity: 0,
      cash_balance: 0,
      buying_power: 0,
      day_trading_buying_power: 0,
      margin_maintenance: 0,
      account_value: 0,
    }
  }
}

// Function to fetch positions from a broker
export const fetchPositions = async (accountId: number): Promise<Position[]> => {
  try {
    const response = await axios.get(`${API_URL}/brokers/accounts/${accountId}/positions`)

    if (response.data.success) {
      // Cache the positions
      const savedPositionsString = localStorage.getItem(BROKER_POSITIONS_KEY)
      const savedPositions = savedPositionsString ? JSON.parse(savedPositionsString) : {}
      savedPositions[accountId] = response.data.data
      localStorage.setItem(BROKER_POSITIONS_KEY, JSON.stringify(savedPositions))

      return response.data.data
    }

    throw new Error(response.data.message || "Failed to fetch positions")
  } catch (error: any) {
    console.error("Error fetching positions:", error)

    // Check if we have cached positions
    const savedPositionsString = localStorage.getItem(BROKER_POSITIONS_KEY)
    const savedPositions = savedPositionsString ? JSON.parse(savedPositionsString) : {}

    if (savedPositions[accountId]) {
      return savedPositions[accountId]
    }

    return []
  }
}

// Function to execute a trade
export const executeTrade = async (
  trade: Omit<Trade, "id" | "created_at" | "updated_at" | "status">,
): Promise<{ success: boolean; trade?: Trade; error?: string }> => {
  try {
    const response = await axios.post(`${API_URL}/trades`, trade)

    if (response.data.success) {
      return {
        success: true,
        trade: response.data.data,
      }
    }

    return {
      success: false,
      error: response.data.message,
    }
  } catch (error: any) {
    console.error("Error executing trade:", error)
    return {
      success: false,
      error: error.response?.data?.message || "An error occurred while executing the trade. Please try again.",
    }
  }
}

// Function to fetch broker accounts
export const fetchBrokerAccounts = async (): Promise<BrokerAccount[]> => {
  try {
    const response = await axios.get(`${API_URL}/brokers/accounts`)

    if (response.data.success) {
      // Cache the accounts
      localStorage.setItem(BROKER_ACCOUNTS_KEY, JSON.stringify(response.data.data))
      return response.data.data
    }

    throw new Error(response.data.message || "Failed to fetch broker accounts")
  } catch (error: any) {
    console.error("Error fetching broker accounts:", error)

    // Check if we have cached accounts
    const savedAccountsString = localStorage.getItem(BROKER_ACCOUNTS_KEY)
    if (savedAccountsString) {
      return JSON.parse(savedAccountsString)
    }

    return []
  }
}

// Function to connect a broker account
export const connectBrokerAccount = async (
  credentials: BrokerCredentials,
): Promise<{ success: boolean; message: string; brokerId?: number; credentials?: BrokerCredentials }> => {
  try {
    const response = await axios.post(`${API_URL}/brokers`, credentials)

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        brokerId: response.data.data.id,
        credentials: response.data.data,
      }
    }

    return {
      success: false,
      message: response.data.message,
    }
  } catch (error: any) {
    console.error("Error connecting broker account:", error)
    return {
      success: false,
      message:
        error.response?.data?.message || "An error occurred while connecting the broker account. Please try again.",
    }
  }
}

// Function to complete Schwab OAuth connection
export const completeSchwabOAuth = async (
  credentials: BrokerCredentials,
  code: string,
): Promise<{ success: boolean; message: string; brokerId?: number }> => {
  try {
    const response = await axios.post(`${API_URL}/brokers/schwab/complete`, {
      credentials,
      code,
    })

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        brokerId: response.data.data.id,
      }
    }

    return {
      success: false,
      message: response.data.message,
    }
  } catch (error: any) {
    console.error("Error completing Schwab OAuth:", error)
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred while connecting to Schwab. Please try again.",
    }
  }
}

// Function to disconnect a broker account
export const disconnectBrokerAccount = async (brokerId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/brokers/${brokerId}`)

    if (response.data.success) {
      // Update local cache
      const savedCredentialsString = localStorage.getItem(BROKER_CREDENTIALS_KEY)
      let savedCredentials = savedCredentialsString ? JSON.parse(savedCredentialsString) : []
      savedCredentials = savedCredentials.filter((c: BrokerCredentials) => c.id !== brokerId)
      localStorage.setItem(BROKER_CREDENTIALS_KEY, JSON.stringify(savedCredentials))

      // Remove accounts for this broker from cache
      const savedAccountsString = localStorage.getItem(BROKER_ACCOUNTS_KEY)
      let savedAccounts = savedAccountsString ? JSON.parse(savedAccountsString) : []
      savedAccounts = savedAccounts.filter((a: BrokerAccount) => a.broker_id !== brokerId)
      localStorage.setItem(BROKER_ACCOUNTS_KEY, JSON.stringify(savedAccounts))

      return {
        success: true,
        message: response.data.message,
      }
    }

    return {
      success: false,
      message: response.data.message,
    }
  } catch (error: any) {
    console.error("Error disconnecting broker account:", error)
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred while disconnecting the broker. Please try again.",
    }
  }
}
