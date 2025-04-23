// scripts/initDb.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { initializeModels } from "../models";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "tradfclx_platform",
  process.env.DB_USER || "tradfclx_admin",
  process.env.DB_PASSWORD || "Abdulquadri@123456789",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "3306"),
    dialect: "mysql",
    logging: console.log,
  }
);

async function initDb() {
  try {
    // Initialize models
    initializeModels(sequelize);
     
    // Sync database (force: true will drop tables if they exist)
    await sequelize.sync({ force: true });
    
    console.log("Database synchronized successfully");
    
    // Seed admin user
    const { seedAdmin } = require("../controllers/auth.controller");
    await seedAdmin();
    
    console.log("Database initialization completed");
  } catch (error) {
    console.error("Database initialization failed:", error);
  } finally {
    await sequelize.close();
  }
}

initDb();