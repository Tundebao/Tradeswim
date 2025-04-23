import { type Sequelize, DataTypes, Model } from "sequelize"

interface CopyTradeSettingAttributes {
  id?: number
  isActive: boolean
  allocationType: "fixed" | "percentage" | "mirror"
  fixedAmount?: number
  percentage?: number
  maxTradeSize?: number
  maxPercentagePerTrade?: number
  enableStopLoss: boolean
  stopLossPercentage?: number
  createdAt?: Date
  updatedAt?: Date
}

export class CopyTradeSetting extends Model<CopyTradeSettingAttributes> implements CopyTradeSettingAttributes {
  public id!: number
  public isActive!: boolean
  public allocationType!: "fixed" | "percentage" | "mirror"
  public fixedAmount!: number
  public percentage!: number
  public maxTradeSize!: number
  public maxPercentagePerTrade!: number
  public enableStopLoss!: boolean
  public stopLossPercentage!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export const initCopyTradeSetting = (sequelize: Sequelize) => {
  CopyTradeSetting.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      allocationType: {
        type: DataTypes.ENUM("fixed", "percentage", "mirror"),
        allowNull: false,
        defaultValue: "percentage",
      },
      fixedAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      maxTradeSize: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      maxPercentagePerTrade: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      enableStopLoss: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      stopLossPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "copy_trade_settings",
    },
  )

  return CopyTradeSetting
}
