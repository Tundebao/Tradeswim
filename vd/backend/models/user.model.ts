import { type Sequelize, DataTypes, Model } from "sequelize"
import bcrypt from "bcrypt"

interface UserAttributes {
  id?: number
  username: string
  email: string
  password: string
  isAdmin: boolean
  lastLogin?: Date
  createdAt?: Date
  updatedAt?: Date
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number
  public username!: string
  public email!: string
  public password!: string
  public isAdmin!: boolean
  public lastLogin!: Date
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Method to validate password
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
}

export const initUser = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "users",
      hooks: {
        beforeCreate: async (user: User) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(user.password, salt)
          }
        },
        beforeUpdate: async (user: User) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(user.password, salt)
          }
        },
      },
    },
  )

  return User
}
