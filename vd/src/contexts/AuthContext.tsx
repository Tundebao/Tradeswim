"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { notifyLogin, notifyChange, notifyError } from "@/services/notificationService"
import axios from "axios"

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

interface User {
  id: number
  username: string
  isAdmin: boolean
  token: string
}

interface AuthContextProps {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  verifyAdminPassword: (password: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  login: async () => false,
  logout: () => {},
  verifyAdminPassword: async () => false,
})

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser)

      // Set up axios auth header
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`

      setUser({ ...userData, token: storedToken })
      setIsAuthenticated(true)
    }

    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password })

      if (response.data.success) {
        const userData = response.data.data
        const token = userData.token

        // Store user data and token
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: userData.id,
            username: userData.username,
            isAdmin: userData.isAdmin,
          }),
        )
        localStorage.setItem("token", token)

        // Set up axios auth header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        setUser({
          id: userData.id,
          username: userData.username,
          isAdmin: userData.isAdmin,
          token,
        })
        setIsAuthenticated(true)

        // Notify user login
        notifyLogin(username)

        navigate("/dashboard")
        return true
      } else {
        notifyError("Login Failed", response.data.message || "Invalid username or password")
        return false
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed. Please try again."
      notifyError("Login Failed", errorMessage)
      return false
    }
  }

  const verifyAdminPassword = async (password: string): Promise<boolean> => {
    try {
      if (!isAuthenticated || !user) {
        return false
      }

      const response = await axios.post(`${API_URL}/auth/verify-admin`, { password })

      if (response.data.success) {
        localStorage.setItem("adminVerified", "true")
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Admin verification error:", error)
      return false
    }
  }

  const logout = () => {
    const username = user?.username

    // Clear local storage
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("adminVerified")

    // Clear axios auth header
    delete axios.defaults.headers.common["Authorization"]

    setIsAuthenticated(false)
    setUser(null)

    // Notify user logout
    if (username) {
      notifyChange("User Logout", `User ${username} logged out.`)
    }

    navigate("/login")
  }

  const value: AuthContextProps = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    verifyAdminPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
