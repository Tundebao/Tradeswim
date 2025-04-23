import { type Sequelize, DataTypes, Model } from "sequelize"

interface SymbolAttributes {
  id?: number
  symbol: string
  name: string
  exchange: string
  type: "stock" | "option"
  sector?: string
  notes?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class Symbol extends Model<SymbolAttributes> implements SymbolAttributes {
  public id!: number
  public symbol!: string
  public name!: string
  public exchange!: string
  public type!: "stock" | "option"
  public sector!: string
  public notes!: string
  public isActive!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export const initSymbol = (sequelize: Sequelize) => {
  Symbol.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      symbol: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      exchange: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("stock", "option"),
        allowNull: false,
      },
      sector: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: "symbols",
      indexes: [
        {
          fields: ["symbol"],
        },
        {
          fields: ["exchange"],
        },
        {
          fields: ["type"],
        },
      ],
    },
  )

  return Symbol
}
