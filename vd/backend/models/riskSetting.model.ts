import { type Sequelize, DataTypes, Model } from "sequelize"

interface RiskSettingAttributes {
  id?: number
  maxTradeSize: number
  maxPercentagePerTrade: number
  maxDailyDrawdown: number
  enableRiskControls: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class RiskSetting extends Model<RiskSettingAttributes> implements RiskSettingAttributes {
  public id!: number
  public maxTradeSize!: number
  public maxPercentagePerTrade!: number
  public maxDailyDrawdown!: number
  public enableRiskControls!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export const initRiskSetting = (sequelize: Sequelize) => {
  RiskSetting.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      maxTradeSize: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 5000,
      },
      maxPercentagePerTrade: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 5,
      },
      maxDailyDrawdown: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 10,
      },
      enableRiskControls: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: "risk_settings",
    },
  )

  return RiskSetting
}
