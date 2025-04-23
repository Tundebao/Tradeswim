import type { Sequelize } from "sequelize"
import { initUser } from "./user.model"
import { initBrokerCredential } from "./brokerCredential.model"
import { initBrokerAccount } from "./brokerAccount.model"
import { initPosition } from "./position.model"
import { initTrade } from "./trade.model"
import { initCopyTradeSetting } from "./copyTradeSetting.model"
import { initCopyTradeLog } from "./copyTradeLog.model"
import { initSymbol } from "./symbol.model"
import { initNotification } from "./notification.model"
import { initLog } from "./log.model"
import { initRiskSetting } from "./riskSetting.model"

export const initializeModels = (sequelize: Sequelize) => {
  // Initialize models
  const User = initUser(sequelize)
  const BrokerCredential = initBrokerCredential(sequelize)
  const BrokerAccount = initBrokerAccount(sequelize)
  const Position = initPosition(sequelize)
  const Trade = initTrade(sequelize)
  const CopyTradeSetting = initCopyTradeSetting(sequelize)
  const CopyTradeLog = initCopyTradeLog(sequelize)
  const Symbol = initSymbol(sequelize)
  const Notification = initNotification(sequelize)
  const Log = initLog(sequelize)
  const RiskSetting = initRiskSetting(sequelize)

  // Define associations
  BrokerCredential.hasMany(BrokerAccount, { foreignKey: "brokerId" })
  BrokerAccount.belongsTo(BrokerCredential, { foreignKey: "brokerId" })

  BrokerAccount.hasMany(Position, { foreignKey: "brokerAccountId" })
  Position.belongsTo(BrokerAccount, { foreignKey: "brokerAccountId" })

  BrokerAccount.hasMany(Trade, { foreignKey: "brokerAccountId" })
  Trade.belongsTo(BrokerAccount, { foreignKey: "brokerAccountId" })

  Trade.hasMany(CopyTradeLog, { foreignKey: "sourceTradeid" })
  CopyTradeLog.belongsTo(Trade, { foreignKey: "sourceTradeid", as: "sourceTrade" })
  CopyTradeLog.belongsTo(Trade, { foreignKey: "targetTradeId", as: "targetTrade" })

  return {
    User,
    BrokerCredential,
    BrokerAccount,
    Position,
    Trade,
    CopyTradeSetting,
    CopyTradeLog,
    Symbol,
    Notification,
    Log,
    RiskSetting,
  }
}
