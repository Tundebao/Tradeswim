import express from "express"
import { login, verifyAdmin } from "../controllers/auth.controller"
import { authenticateJWT } from "../middleware/auth.middleware"

const router = express.Router()

// Login route
router.post("/login", login)

// Verify admin credentials
router.post("/verify-admin", authenticateJWT, verifyAdmin)

export default router
