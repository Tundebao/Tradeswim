import { type Sequelize, DataTypes, Model } from "sequelize"

interface CopyTradeLogAttributes {
  id?: number
  sourceTradeId: number
  targetTradeId?: number
  sourceAccountId: number
  targetAccountId: number
  symbol: string
  quantity: number
  price: number
  side: "buy" | "sell"
  status: "pending" | "success" | "failed"
  errorMessage?: string
  createdAt?: Date
  updatedAt?: Date
}

export class CopyTradeLog extends Model<CopyTradeLogAttributes> implements CopyTradeLogAttributes {
  public id!: number
  public sourceTradeId!: number
  public targetTradeId!: number
  public sourceAccountId!: number
  public targetAccountId!: number
  public symbol!: string
  public quantity!: number
  public price!: number
  public side!: "buy" | "sell"
  public status!: "pending" | "success" | "failed"
  public errorMessage!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export const initCopyTradeLog = (sequelize: Sequelize) => {
  CopyTradeLog.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      sourceTradeId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "trades",
          key: "id",
        },
      },
      targetTradeId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "trades",
          key: "id",
        },
      },
      sourceAccountId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "broker_accounts",
          key: "id",
        },
      },
      targetAccountId: {
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
      status: {
        type: DataTypes.ENUM("pending", "success", "failed"),
        allowNull: false,
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "copy_trade_logs",
      indexes: [
        {
          fields: ["sourceTradeId"],
        },
        {
          fields: ["targetTradeId"],
        },
        {
          fields: ["sourceAccountId"],
        },
        {
          fields: ["targetAccountId"],
        },
      ],
    },
  )

  return CopyTradeLog
}
