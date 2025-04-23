import type { Request, Response } from "express"
import { BrokerCredential, BrokerType, BrokerConnectionStatus } from "../models/brokerCredential.model"
import { BrokerAccount } from "../models/brokerAccount.model"

// Connect broker account
export const connectBroker = async (req: Request, res: Response) => {
  try {
    const { name, broker_type, username, password, client_id, client_secret, redirect_uri } = req.body

    // Validate required fields
    if (!name || !broker_type) {
      return res.status(400).json({ success: false, message: "Name and broker type are required" })
    }

    // Validate broker-specific fields
    if (broker_type === BrokerType.TASTYTRADE && (!username || !password)) {
      return res.status(400).json({ success: false, message: "Username and password are required for Tastytrade" })
    }

    if (broker_type === BrokerType.SCHWAB && (!client_id || !client_secret || !redirect_uri)) {
      return res.status(400).json({
        success: false,
        message: "Client ID, client secret, and redirect URI are required for Schwab",
      })
    }

    // Create broker credentials
    const brokerCredential = await BrokerCredential.create({
      name,
      brokerType: broker_type,
      username,
      password, // Note: In a production app, you'd want to encrypt this
      clientId: client_id,
      clientSecret: client_secret,
      redirectUri: redirect_uri,
      isActive: true,
      connectionStatus: BrokerConnectionStatus.CONNECTING,
      connectionError: "", // Initialize with empty string instead of null
    })

    // Rest of the function implementation...
    return res.status(200).json({
      success: true,
      message: "Broker credentials created successfully",
      data: brokerCredential,
    })
  } catch (error: any) {
    console.error("Error connecting broker:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while connecting the broker",
      error: error.message,
    })
  }
}

// Implement other controller methods with proper type definitions
export const completeSchwabOAuth = async (req: Request, res: Response) => {
  // Implementation...
  res.status(200).json({ success: true })
}

export const createBrokerAccount = async (req: Request, res: Response) => {
  try {
    const { brokerType, name, accountNumber, apiKey, apiSecret, passphrase } = req.body

    // Create BrokerCredential
    const brokerCredential = await BrokerCredential.create({
      apiKey,
      apiSecret,
      passphrase,
    })

    // Create BrokerAccount and associate it with BrokerCredential
    const brokerAccount = await BrokerAccount.create({
      brokerType,
      name,
      accountNumber,
      userId: req.user.id, // Assuming you have user information in the request
      brokerCredentialId: brokerCredential.id,
    })

    res.status(201).json({ message: "Broker account created successfully", brokerAccount })
  } catch (error) {
    console.error("Error creating broker account:", error)
    res.status(500).json({ message: "Failed to create broker account", error: error })
  }
}

export const getBrokerAccounts = async (req: Request, res: Response) => {
  // Implementation...
  res.status(200).json({ success: true })
}

export const getBrokerAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user.id // Assuming you have user information in the request

    const account = await BrokerAccount.findOne({
      where: { id: id, userId: userId },
      include: [{ model: BrokerCredential, as: "BrokerCredential" }],
    })

    if (!account) {
      return res.status(404).json({ message: "Broker account not found" })
    }

    const brokerCredential = account.BrokerCredential as BrokerCredential

    res.status(200).json(account)
  } catch (error) {
    console.error("Error fetching broker account:", error)
    res.status(500).json({ message: "Failed to fetch broker account", error: error })
  }
}

export const updateBrokerAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user.id // Assuming you have user information in the request
    const { brokerType, name, accountNumber } = req.body

    const account = await BrokerAccount.findOne({
      where: { id: id, userId: userId },
    })

    if (!account) {
      return res.status(404).json({ message: "Broker account not found" })
    }

    await BrokerAccount.update({ brokerType, name, accountNumber }, { where: { id: id, userId: userId } })

    const updatedAccount = await BrokerAccount.findOne({
      where: { id: id, userId: userId },
      include: [{ model: BrokerCredential, as: "BrokerCredential" }],
    })

    res.status(200).json({ message: "Broker account updated successfully", brokerAccount: updatedAccount })
  } catch (error) {
    console.error("Error updating broker account:", error)
    res.status(500).json({ message: "Failed to update broker account", error: error })
  }
}

export const deleteBrokerAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user.id // Assuming you have user information in the request

    const account = await BrokerAccount.findOne({
      where: { id: id, userId: userId },
      include: [{ model: BrokerCredential, as: "BrokerCredential" }],
    })

    if (!account) {
      return res.status(404).json({ message: "Broker account not found" })
    }

    // Delete the associated BrokerCredential
    await BrokerCredential.destroy({ where: { id: account.brokerCredentialId } })

    // Delete the BrokerAccount
    await BrokerAccount.destroy({ where: { id: id, userId: userId } })

    res.status(200).json({ message: "Broker account deleted successfully" })
  } catch (error) {
    console.error("Error deleting broker account:", error)
    res.status(500).json({ message: "Failed to delete broker account", error: error })
  }
}

export const getBrokerBalance = async (req: Request, res: Response) => {
  // Implementation...
  res.status(200).json({ success: true })
}

export const getPositions = async (req: Request, res: Response) => {
  // Implementation...
  res.status(200).json({ success: true })
}

export const checkBrokerHealth = async (req: Request, res: Response) => {
  // Implementation...
  res.status(200).json({ success: true })
}

export const disconnectBroker = async (req: Request, res: Response) => {
  // Implementation...
  res.status(200).json({ success: true })
}
