import { CopyTradeSetting } from "../models/copyTradeSetting.model"
import { BrokerAccount } from "../models/brokerAccount.model"
import { Trade } from "../models/trade.model"
import { CopyTradeLog } from "../models/copyTradeLog.model"
import { RiskSetting } from "../models/riskSetting.model"
import { Log } from "../models/log.model"
import { Notification } from "../models/notification.model"
import { executeTastytradeTrade } from "./tastytrade.service"
// Import Op directly from sequelize
import { Sequelize, Op } from "sequelize"
import { BrokerCredential, BrokerType } from "../models/brokerCredential.model"
import { Symbol } from "../models/symbol.model"

// Get a Sequelize instance
const sequelize = new Sequelize(process.env.DB_NAME || "", process.env.DB_USER || "", process.env.DB_PASSWORD || "", {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  dialect: "mysql",
  logging: false,
})

// Process a trade for copy trading
export const processCopyTrade = async (sourceTrade: Trade) => {
  const t = await sequelize.transaction()

  try {
    // Get copy trading settings
    const settings = await CopyTradeSetting.findOne({ transaction: t })

    // If copy trading is not active, do nothing
    if (!settings || !settings.isActive) {
      await t.commit()
      return { success: false, message: "Copy trading is not active" }
    }

    // Get risk settings
    const riskSettings = await RiskSetting.findOne({ transaction: t })

    // Check if symbol is allowed
    const symbol = await Symbol.findOne({
      where: {
        symbol: sourceTrade.symbol,
        isActive: true,
      },
      transaction: t,
    })

    if (!symbol) {
      await Log.create(
        {
          level: "warning",
          message: `Copy trade rejected: Symbol ${sourceTrade.symbol} is not in the allowed list`,
          source: "copy-trading",
          details: JSON.stringify(sourceTrade),
        },
        { transaction: t },
      )

      await t.commit()
      return { success: false, message: `Symbol ${sourceTrade.symbol} is not in the allowed list` }
    }

    // Get source account
    const sourceAccount = await BrokerAccount.findByPk(sourceTrade.brokerAccountId, { transaction: t })
    if (!sourceAccount) {
      await t.commit()
      return { success: false, message: "Source account not found" }
    }

    // Get all target accounts (excluding the source account)
    const targetAccounts = await BrokerAccount.findAll({
      where: {
        id: { [Op.ne]: sourceTrade.brokerAccountId }, // Use Op directly
        isActive: true,
      },
      include: [
        {
          model: BrokerCredential,
          where: { isActive: true },
        },
      ],
      transaction: t,
    })

    if (targetAccounts.length === 0) {
      await t.commit()
      return { success: false, message: "No target accounts found" }
    }

    // Process each target account
    const copyResults = []

    for (const targetAccount of targetAccounts) {
      try {
        // Calculate quantity based on allocation type
        let quantity = 0

        if (settings.allocationType === "mirror") {
          // Mirror exact shares
          quantity = sourceTrade.quantity
        } else if (settings.allocationType === "fixed" && settings.fixedAmount) {
          // Fixed amount
          const tradeValue = settings.fixedAmount
          quantity = Math.floor(tradeValue / sourceTrade.price)
        } else if (settings.allocationType === "percentage" && settings.percentage) {
          // Percentage of balance
          const percentageDecimal = settings.percentage / 100
          const tradeValue = targetAccount.balance * percentageDecimal
          quantity = Math.floor(tradeValue / sourceTrade.price)
        }

        // Apply risk controls
        if (riskSettings && riskSettings.enableRiskControls) {
          // Check max trade size
          const tradeValue = quantity * sourceTrade.price
          if (riskSettings.maxTradeSize > 0 && tradeValue > riskSettings.maxTradeSize) {
            const adjustedQuantity = Math.floor(riskSettings.maxTradeSize / sourceTrade.price)

            await Log.create(
              {
                level: "warning",
                message: `Trade size reduced due to max trade size limit`,
                source: "risk-management",
                details: `Original: ${quantity}, Adjusted: ${adjustedQuantity}`,
              },
              { transaction: t },
            )

            quantity = adjustedQuantity
          }

          // Check max percentage per trade
          const percentageOfBalance = ((quantity * sourceTrade.price) / targetAccount.balance) * 100
          if (percentageOfBalance > riskSettings.maxPercentagePerTrade) {
            const adjustedQuantity = Math.floor(
              ((riskSettings.maxPercentagePerTrade / 100) * targetAccount.balance) / sourceTrade.price,
            )

            await Log.create(
              {
                level: "warning",
                message: `Trade size reduced due to max percentage per trade limit`,
                source: "risk-management",
                details: `Original: ${quantity}, Adjusted: ${adjustedQuantity}`,
              },
              { transaction: t },
            )

            quantity = adjustedQuantity
          }
        }

        // Skip if quantity is zero
        if (quantity <= 0) {
          await CopyTradeLog.create(
            {
              sourceTradeId: sourceTrade.id!,
              sourceAccountId: sourceAccount.id!,
              targetAccountId: targetAccount.id!,
              symbol: sourceTrade.symbol,
              quantity: 0,
              price: sourceTrade.price,
              side: sourceTrade.side,
              status: "failed",
              errorMessage: "Calculated quantity is zero or negative",
            },
            { transaction: t },
          )

          continue
        }

        // Get broker credentials
        const brokerCredential = targetAccount.BrokerCredential

        if (!brokerCredential) {
          throw new Error("Broker credential not found for target account")
        }

        // Create copy trade log entry
        const copyTradeLog = await CopyTradeLog.create(
          {
            sourceTradeId: sourceTrade.id!,
            sourceAccountId: sourceAccount.id!,
            targetAccountId: targetAccount.id!,
            symbol: sourceTrade.symbol,
            quantity,
            price: sourceTrade.price,
            side: sourceTrade.side,
            status: "pending",
          },
          { transaction: t },
        )

        // Execute trade based on broker type
        let tradeResult

        if (brokerCredential.brokerType === BrokerType.TASTYTRADE) {
          tradeResult = await executeTastytradeTrade(brokerCredential.sessionToken!, targetAccount.accountId, {
            symbol: sourceTrade.symbol,
            quantity,
            side: sourceTrade.side,
            orderType: sourceTrade.orderType,
            limitPrice: sourceTrade.limitPrice,
            isOption: sourceTrade.isOption,
            optionDetails: sourceTrade.optionDetails,
          })
        } else if (brokerCredential.brokerType === BrokerType.SCHWAB) {
          // For now, implement a placeholder for Schwab trades
          // This should be replaced with the actual implementation once available
          tradeResult = {
            success: false,
            message: "Schwab trade execution not implemented yet",
          }
        } else {
          throw new Error(`Unsupported broker type: ${brokerCredential.brokerType}`)
        }

        if (tradeResult.success) {
          // Create trade record
          const copyTrade = await Trade.create(
            {
              brokerAccountId: targetAccount.id!,
              symbol: sourceTrade.symbol,
              quantity,
              price: sourceTrade.price,
              side: sourceTrade.side,
              orderType: sourceTrade.orderType,
              limitPrice: sourceTrade.limitPrice,
              status: "pending",
              type: "copy",
              isOption: sourceTrade.isOption,
              optionDetails: sourceTrade.optionDetails,
              executionDetails: JSON.stringify(tradeResult.data),
            },
            { transaction: t },
          )

          // Update copy trade log
          await copyTradeLog.update(
            {
              targetTradeId: copyTrade.id,
              status: "success",
            },
            { transaction: t },
          )

          copyResults.push({
            success: true,
            accountId: targetAccount.id,
            accountName: targetAccount.accountName,
            tradeId: copyTrade.id,
          })
        } else {
          // Update copy trade log with error
          await copyTradeLog.update(
            {
              status: "failed",
              errorMessage: tradeResult.message,
            },
            { transaction: t },
          )

          copyResults.push({
            success: false,
            accountId: targetAccount.id,
            accountName: targetAccount.accountName,
            error: tradeResult.message,
          })

          // Create notification for failed trade
          await Notification.create(
            {
              type: "error",
              title: "Copy Trade Failed",
              message: `Failed to copy trade for ${sourceTrade.symbol} to account ${targetAccount.accountName}: ${tradeResult.message}`,
              read: false,
            },
            { transaction: t },
          )
        }
      } catch (accountError: any) {
        console.error(`Error processing copy trade for account ${targetAccount.id}:`, accountError)

        // Log the error
        await CopyTradeLog.create(
          {
            sourceTradeId: sourceTrade.id!,
            sourceAccountId: sourceAccount.id!,
            targetAccountId: targetAccount.id!,
            symbol: sourceTrade.symbol,
            quantity: 0,
            price: sourceTrade.price,
            side: sourceTrade.side,
            status: "failed",
            errorMessage: accountError.message,
          },
          { transaction: t },
        )

        copyResults.push({
          success: false,
          accountId: targetAccount.id,
          accountName: targetAccount.accountName,
          error: accountError.message,
        })
      }
    }

    await t.commit()

    // Create summary notification
    const successCount = copyResults.filter((r) => r.success).length
    const failCount = copyResults.filter((r) => !r.success).length

    await Notification.create({
      type: successCount > 0 ? (failCount > 0 ? "warning" : "success") : "error",
      title: "Copy Trading Summary",
      message: `Copied trade for ${sourceTrade.symbol}: ${successCount} successful, ${failCount} failed`,
      read: false,
    })

    return {
      success: true,
      message: `Processed copy trade for ${targetAccounts.length} accounts`,
      results: copyResults,
    }
  } catch (error: any) {
    await t.rollback()
    console.error("Error processing copy trade:", error)

    // Log the error
    await Log.create({
      level: "error",
      message: "Copy trading error",
      source: "copy-trading",
      details: error.message,
    })

    return {
      success: false,
      message: `Error processing copy trade: ${error.message}`,
    }
  }
}
