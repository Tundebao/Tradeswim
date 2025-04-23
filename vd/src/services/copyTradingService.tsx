import type { CopyTradingSettings } from "@/types/broker"

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Get copy trading settings
export const getCopyTradingSettings = async (): Promise<CopyTradingSettings> => {
  try {
    // Mock implementation for now
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
    // Mock implementation for now
    return {
      success: true,
      message: "Copy trading settings updated successfully",
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
    // Mock implementation for now
    return {
      success: true,
      message: `Copy trading ${isActive ? "activated" : "deactivated"} successfully`,
    }
  } catch (error: any) {
    console.error("Error toggling copy trading:", error)
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred while updating status. Please try again.",
    }
  }
}

// Check copy trading status
export const checkCopyTradingStatus = async (): Promise<{
  isActive: boolean
  lastSync?: string
  connectedAccounts: number
}> => {
  try {
    // Mock implementation for now
    return {
      isActive: false,
      lastSync: new Date().toISOString(),
      connectedAccounts: 0,
    }
  } catch (error) {
    console.error("Error checking copy trading status:", error)
    return {
      isActive: false,
      lastSync: new Date().toISOString(),
      connectedAccounts: 0,
    }
  }
}
