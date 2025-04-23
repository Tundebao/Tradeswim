import { type Sequelize, DataTypes, Model } from "sequelize"

export enum BrokerType {
  TASTYTRADE = "tastytrade",
  SCHWAB = "schwab",
}

export enum BrokerConnectionStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  ERROR = "error",
}

interface BrokerCredentialAttributes {
  id?: number
  name: string
  brokerType: BrokerType
  apiKey?: string
  apiSecret?: string
  username?: string
  password?: string
  clientId?: string
  clientSecret?: string
  redirectUri?: string
  isActive: boolean
  sessionToken?: string
  expiry?: Date
  connectionStatus?: BrokerConnectionStatus
  lastConnectionCheck?: Date
  connectionError?: string | null // Allow null
  createdAt?: Date
  updatedAt?: Date
}

export class BrokerCredential extends Model<BrokerCredentialAttributes> implements BrokerCredentialAttributes {
  public id!: number
  public name!: string
  public brokerType!: BrokerType
  public apiKey!: string
  public apiSecret!: string
  public username!: string
  public password!: string
  public clientId!: string
  public clientSecret!: string
  public redirectUri!: string
  public isActive!: boolean
  public sessionToken!: string
  public expiry!: Date
  public connectionStatus!: BrokerConnectionStatus
  public lastConnectionCheck!: Date
  public connectionError!: string | null // Allow null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export const initBrokerCredential = (sequelize: Sequelize) => {
  BrokerCredential.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      brokerType: {
        type: DataTypes.ENUM(...Object.values(BrokerType)),
        allowNull: false,
      },
      apiKey: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      apiSecret: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      clientId: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      clientSecret: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      redirectUri: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sessionToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      connectionStatus: {
        type: DataTypes.ENUM(...Object.values(BrokerConnectionStatus)),
        allowNull: true,
        defaultValue: BrokerConnectionStatus.DISCONNECTED,
      },
      lastConnectionCheck: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      connectionError: {
        type: DataTypes.TEXT,
        allowNull: true, // Allow null
      },
    },
    {
      sequelize,
      tableName: "broker_credentials",
    },
  )

  return BrokerCredential
}
