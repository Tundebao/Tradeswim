import axios from "axios"
import type { CopyTradingSettings, Trade } from "@/types/broker"

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Get copy trading settings
export const getCopyTradingSettings = async (): Promise<CopyTradingSettings> => {
  try {
    const response = await axios.get(`${API_URL}/copy-trading/settings`)

    if (response.data.success) {
      return response.data.data
    }

    throw new Error(response.data.message || "Failed to fetch copy trading settings")
  } catch (error) {
    console.error("Error fetching copy trading settings:", error)

    // Return default settings
    return {
      is_active: false,
      allocation_type: "percentage",
      percentage: 100,
      fixed_amount: 0,
      max_trade_size: 5000,
      max_percentage_per_trade: 5,
      enable_stop_loss: true,
      stop_loss_percentage: 10,
    }
  }
}

// Update copy trading settings
export const updateCopyTradingSettings = async (
  settings: CopyTradingSettings,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.put(`${API_URL}/copy-trading/settings`, settings)

    if (response.data.success) {
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
    console.error("Error updating copy trading settings:", error)
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred while updating settings. Please try again.",
    }
  }
}

// Toggle copy trading active status
export const toggleCopyTrading = async (isActive: boolean): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/copy-trading/toggle`, { isActive })

    if (response.data.success) {
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
    console.error("Error toggling copy trading:", error)
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred while updating status. Please try again.",
    }
  }
}

// Get copy trading history
export const getCopyTradingHistory = async (filters: {
  startDate?: string
  endDate?: string
  status?: string
  symbol?: string
}): Promise<Trade[]> => {
  try {
    const response = await axios.get(`${API_URL}/copy-trading/history`, { params: filters })

    if (response.data.success) {
      return response.data.data
    }

    throw new Error(response.data.message || "Failed to fetch copy trading history")
  } catch (error) {
    console.error("Error fetching copy trading history:", error)
    return []
  }
}

// Check copy trading status
export const checkCopyTradingStatus = async (): Promise<{
  isActive: boolean
  lastSync?: string
  connectedAccounts: number
}> => {
  try {
    const response = await axios.get(`${API_URL}/copy-trading/status`)

    if (response.data.success) {
      return response.data.data
    }

    throw new Error(response.data.message || "Failed to check copy trading status")
  } catch (error) {
    console.error("Error checking copy trading status:", error)
    return {
      isActive: false,
      lastSync: new Date().toISOString(),
      connectedAccounts: 0,
    }
  }
}

// Trigger copy trade now
export const triggerCopyTrade = async (
  tradeId: number,
): Promise<{ success: boolean; message: string; results?: any[] }> => {
  try {
    const response = await axios.post(`${API_URL}/copy-trading/copy-now`, { tradeId })

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        results: response.data.data.results,
      }
    }

    return {
      success: false,
      message: response.data.message,
    }
  } catch (error: any) {
    console.error("Error triggering copy trade:", error)
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred while copying the trade. Please try again.",
    }
  }
}
