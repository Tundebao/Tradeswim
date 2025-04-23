import { Sequelize } from "sequelize"
import dotenv from "dotenv"
import { initializeModels } from "../models"
import { seedAdmin } from "../controllers/auth.controller"

dotenv.config()

const sequelize = new Sequelize(process.env.DB_NAME || "", process.env.DB_USER || "", process.env.DB_PASSWORD || "", {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  dialect: "mysql",
  logging: console.log,
})

async function seedDatabase() {
  try {
    // Initialize models
    initializeModels(sequelize)

    // Sync database (force: true will drop tables if they exist)
    await sequelize.sync({ force: true })
    console.log("Database synchronized successfully")

    // Seed admin user
    await seedAdmin()
    console.log("Admin user created successfully")

    console.log("Database seeding completed")
  } catch (error) {
    console.error("Database seeding failed:", error)
  } finally {
    await sequelize.close()
  }
}

seedDatabase()
