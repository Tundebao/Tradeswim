import type { Request, Response } from "express"
import { User } from "../models/user.model"
import { createToken } from "../middleware/auth.middleware"
import { Log } from "../models/log.model"

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" })
    }

    // Find user by username
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid username or password" })
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid username or password" })
    }

    // Update last login time
    user.lastLogin = new Date()
    await user.save()

    // Create JWT token
    const token = createToken(user)

    // Log successful login
    await Log.create({
      level: "info",
      message: `User ${username} logged in`,
      source: "authentication",
      userId: user.id,
    })

    // Return user info and token
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        token,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const verifyAdmin = async (req: Request, res: Response) => {
  try {
    const { password } = req.body

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    // Find user by ID
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" })
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized for admin access" })
    }

    // Log admin verification
    await Log.create({
      level: "info",
      message: `User ${user.username} verified as admin`,
      source: "authentication",
      userId: user.id,
    })

    return res.status(200).json({
      success: true,
      message: "Admin verification successful",
    })
  } catch (error) {
    console.error("Admin verification error:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

export const seedAdmin = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ where: { username: "admin" } })

    if (!adminExists) {
      // Create admin user
      await User.create({
        username: "admin",
        email: "admin@example.com",
        password: "Abdulqaudri@123456789", // Will be hashed by the model hook
        isAdmin: true,
      })
      console.log("Admin user created successfully")
    }
  } catch (error) {
    console.error("Error seeding admin user:", error)
  }
}
