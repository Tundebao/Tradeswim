import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import type { User } from "../models/user.model"

interface JwtPayload {
  id: number
  username: string
  isAdmin: boolean
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as JwtPayload
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token." })
  }
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Access denied. Not authenticated." })
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ success: false, message: "Access denied. Not authorized." })
  }

  next()
}

export const createToken = (user: User): string => {
  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
  }

  return jwt.sign(payload, process.env.JWT_SECRET || "default_secret", { expiresIn: "24h" })
}
