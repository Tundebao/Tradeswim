import { type Sequelize, DataTypes, Model } from "sequelize"
import type { BrokerCredential } from "./brokerCredential.model"

interface BrokerAccountAttributes {
  id?: number
  brokerId: number
  accountId: string
  accountName: string
  accountType: string
  balance: number
  buyingPower: number
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class BrokerAccount extends Model<BrokerAccountAttributes> implements BrokerAccountAttributes {
  public id!: number
  public brokerId!: number
  public accountId!: string
  public accountName!: string
  public accountType!: string
  public balance!: number
  public buyingPower!: number
  public isActive!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Define the association with BrokerCredential
  public BrokerCredential?: BrokerCredential
}

export const initBrokerAccount = (sequelize: Sequelize) => {
  BrokerAccount.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      brokerId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "broker_credentials",
          key: "id",
        },
      },
      accountId: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      accountName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      accountType: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      buyingPower: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: "broker_accounts",
      indexes: [
        {
          unique: true,
          fields: ["brokerId", "accountId"],
        },
      ],
    },
  )

  return BrokerAccount
}
