import { type Sequelize, DataTypes, Model } from "sequelize"

interface PositionAttributes {
  id?: number
  brokerAccountId: number
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice: number
  unrealizedPnl: number
  unrealizedPnlPercent: number
  value: number
  type: "stock" | "option"
  expirationDate?: string
  strikePrice?: number
  optionType?: "call" | "put"
  createdAt?: Date
  updatedAt?: Date
}

export class Position extends Model<PositionAttributes> implements PositionAttributes {
  public id!: number
  public brokerAccountId!: number
  public symbol!: string
  public quantity!: number
  public averagePrice!: number
  public currentPrice!: number
  public unrealizedPnl!: number
  public unrealizedPnlPercent!: number
  public value!: number
  public type!: "stock" | "option"
  public expirationDate!: string
  public strikePrice!: number
  public optionType!: "call" | "put"
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export const initPosition = (sequelize: Sequelize) => {
  Position.init(
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
      averagePrice: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
      },
      currentPrice: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
      },
      unrealizedPnl: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      unrealizedPnlPercent: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("stock", "option"),
        allowNull: false,
      },
      expirationDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      strikePrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      optionType: {
        type: DataTypes.ENUM("call", "put"),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "positions",
      indexes: [
        {
          fields: ["brokerAccountId", "symbol"],
        },
      ],
    },
  )

  return Position
}
