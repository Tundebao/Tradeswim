import { type Sequelize, DataTypes, Model } from "sequelize"

interface LogAttributes {
  id?: number
  level: "debug" | "info" | "warning" | "error"
  message: string
  source: string
  details?: string
  userId?: number
  createdAt?: Date
  updatedAt?: Date
}

export class Log extends Model<LogAttributes> implements LogAttributes {
  public id!: number
  public level!: "debug" | "info" | "warning" | "error"
  public message!: string
  public source!: string
  public details!: string
  public userId!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export const initLog = (sequelize: Sequelize) => {
  Log.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      level: {
        type: DataTypes.ENUM("debug", "info", "warning", "error"),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      source: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      tableName: "logs",
      indexes: [
        {
          fields: ["level"],
        },
        {
          fields: ["source"],
        },
        {
          fields: ["userId"],
        },
      ],
    },
  )

  return Log
}
