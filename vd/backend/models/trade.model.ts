import { type Sequelize, DataTypes, Model } from "sequelize"

interface TradeAttributes {
  id?: number
  brokerAccountId: number
  symbol: string
  quantity: number
  price: number
  side: "buy" | "sell"
  orderType: "market" | "limit"
  limitPrice?: number
  status: "pending" | "filled" | "canceled" | "rejected"
  type: "manual" | "copy"
  executedAt?: Date
  isOption: boolean
  optionDetails?: {
    expirationDate: string
    strikePrice: number
    optionType: "call" | "put"
  }
  executionDetails?: string
  createdAt?: Date
  updatedAt?: Date
}

export class Trade extends Model<TradeAttributes> implements TradeAttributes {
  public id!: number
  public brokerAccountId!: number
  public symbol!: string
  public quantity!: number
  public price!: number
  public side!: "buy" | "sell"
  public orderType!: "market" | "limit"
  public limitPrice!: number
  public status!: "pending" | "filled" | "canceled" | "rejected"
  public type!: "manual" | "copy"
  public executedAt!: Date
  public isOption!: boolean
  public optionDetails!: {
    expirationDate: string
    strikePrice: number
    optionType: "call" | "put"
  }
  public executionDetails!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export const initTrade = (sequelize: Sequelize) => {
  Trade.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      brokerAccountId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "broker_accounts",
          key: "id",
        },
      },
      symbol: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
      },
      side: {
        type: DataTypes.ENUM("buy", "sell"),
        allowNull: false,
      },
      orderType: {
        type: DataTypes.ENUM("market", "limit"),
        allowNull: false,
      },
      limitPrice: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "filled", "canceled", "rejected"),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("manual", "copy"),
        allowNull: false,
      },
      executedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isOption: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      optionDetails: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      executionDetails: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "trades",
      indexes: [
        {
          fields: ["brokerAccountId"],
        },
        {
          fields: ["symbol"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["type"],
        },
      ],
    },
  )

  return Trade
}
