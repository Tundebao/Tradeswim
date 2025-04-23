import { type Sequelize, DataTypes, Model } from "sequelize"

interface NotificationAttributes {
  id?: number
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  read: boolean
  userId?: number
  createdAt?: Date
  updatedAt?: Date
}

export class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
  public id!: number
  public type!: "info" | "success" | "warning" | "error"
  public title!: string
  public message!: string
  public read!: boolean
  public userId!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export const initNotification = (sequelize: Sequelize) => {
  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM("info", "success", "warning", "error"),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      tableName: "notifications",
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["read"],
        },
      ],
    },
  )

  return Notification
}
