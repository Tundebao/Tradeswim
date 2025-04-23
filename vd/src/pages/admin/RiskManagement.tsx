"use client"

import type React from "react"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Check, Loader2, Shield } from "lucide-react"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

interface RiskSettings {
  maxTradeSize: number
  maxPercentagePerTrade: number
  maxDailyDrawdown: number
  enableRiskControls: boolean
}

const RiskManagement = () => {
  const { toast } = useToast()
  const [settings, setSettings] = useState<RiskSettings>({
    maxTradeSize: 5000,
    maxPercentagePerTrade: 5,
    maxDailyDrawdown: 10,
    enableRiskControls: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings/risk`)

        if (response.data.success) {
          setSettings(response.data.data)
        } else {
          setError("Failed to load risk settings")
        }
      } catch (error) {
        console.error("Error fetching risk settings:", error)
        setError("Failed to load risk settings. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    if (type === "number") {
      setSettings((prev) => ({
        ...prev,
        [name]: Number(value),
      }))
    } else {
      setSettings((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSaveSettings = async () => {
    setError("")
    setSuccess("")
    setIsSaving(true)

    try {
      const response = await axios.put(`${API_URL}/settings/risk`, settings)

      if (response.data.success) {
        setSuccess("Risk settings updated successfully")
        toast({
          title: "Success",
          description: "Risk settings updated successfully",
        })
      } else {
        setError(response.data.message || "Failed to update risk settings")
        toast({
          title: "Error",
          description: response.data.message || "Failed to update risk settings",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error saving risk settings:", error)
      setError(error.response?.data?.message || "An error occurred while saving settings")
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred while saving settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Risk Management</h1>
          <p className="text-muted-foreground">Configure risk controls and trading limits</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Risk Control Settings</CardTitle>
            <CardDescription>Configure global risk parameters for all trading activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableRiskControls">Enable Risk Controls</Label>
                <p className="text-sm text-muted-foreground">Toggle all risk management rules on or off</p>
              </div>
              <Switch
                id="enableRiskControls"
                checked={settings.enableRiskControls}
                onCheckedChange={(checked) => handleSwitchChange("enableRiskControls", checked)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxTradeSize">Maximum Trade Size ($)</Label>
                <Input
                  id="maxTradeSize"
                  name="maxTradeSize"
                  type="number"
                  min="0"
                  step="100"
                  value={settings.maxTradeSize}
                  onChange={handleInputChange}
                  disabled={!settings.enableRiskControls}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum dollar amount allowed for any single trade (0 for no limit)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPercentagePerTrade">Maximum Percentage Per Trade (%)</Label>
                <Input
                  id="maxPercentagePerTrade"
                  name="maxPercentagePerTrade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.maxPercentagePerTrade}
                  onChange={handleInputChange}
                  disabled={!settings.enableRiskControls}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum percentage of account balance allowed for any single trade
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDailyDrawdown">Maximum Daily Drawdown (%)</Label>
                <Input
                  id="maxDailyDrawdown"
                  name="maxDailyDrawdown"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.maxDailyDrawdown}
                  onChange={handleInputChange}
                  disabled={!settings.enableRiskControls}
                />
                <p className="text-sm text-muted-foreground">Maximum percentage loss allowed in a single trading day</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <div className="flex items-center text-sm text-muted-foreground">
              <Shield className="h-4 w-4 mr-2" />
              These settings affect all trading operations
            </div>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Monitoring</CardTitle>
            <CardDescription>View current risk metrics and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Daily P&L</div>
                  <div className="text-2xl font-bold text-green-500">+$0.00</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Largest Position</div>
                  <div className="text-2xl font-bold">$0.00</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Risk Utilization</div>
                  <div className="text-2xl font-bold">0%</div>
                </div>
              </div>

              <div className="p-6 text-center border rounded-md">
                <Shield className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <h3 className="text-lg font-medium">No Active Risk Alerts</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Risk alerts will appear here when trading activity approaches configured limits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default RiskManagement
