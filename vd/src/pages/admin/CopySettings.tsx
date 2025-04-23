"use client"

import type React from "react"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Info, Loader2 } from "lucide-react"
import type { CopyTradingSettings } from "@/types/broker"
import { getCopyTradingSettings, updateCopyTradingSettings, toggleCopyTrading } from "@/services/copyTradingService"

const CopySettings = () => {
  const [settings, setSettings] = useState<CopyTradingSettings>({
    is_active: false,
    allocation_type: "percentage",
    percentage: 100,
    fixed_amount: 0,
    max_trade_size: 5000,
    max_percentage_per_trade: 5,
    enable_stop_loss: true,
    stop_loss_percentage: 10,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [hasConnectedBroker, setHasConnectedBroker] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getCopyTradingSettings()
        setSettings(data)

        // In a real app, check if broker is connected
        setHasConnectedBroker(false)
      } catch (error) {
        console.error("Failed to fetch copy trading settings:", error)
        setError("Failed to load settings. Please refresh the page.")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    // Convert numeric inputs to numbers
    if (type === "number") {
      setSettings((prev) => ({ ...prev, [name]: Number.parseFloat(value) }))
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSaveSettings = async () => {
    setError("")
    setSuccess("")
    setIsSaving(true)

    try {
      const result = await updateCopyTradingSettings(settings)

      if (result.success) {
        setSuccess("Copy trading settings updated successfully")
      } else {
        setError("Failed to update settings: " + result.message)
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      setError("An error occurred while saving settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleCopyTrading = async () => {
    setError("")
    setSuccess("")
    setIsToggling(true)

    try {
      const newStatus = !settings.is_active
      const result = await toggleCopyTrading(newStatus)

      if (result.success) {
        setSettings((prev) => ({ ...prev, is_active: newStatus }))
        setSuccess(`Copy trading ${newStatus ? "activated" : "deactivated"} successfully`)
      } else {
        setError("Failed to update status: " + result.message)
      }
    } catch (error) {
      console.error("Error toggling copy trading:", error)
      setError("An error occurred while updating status")
    } finally {
      setIsToggling(false)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading copy trading settings...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Copy Trading Settings</h1>
            <p className="text-muted-foreground">Configure how trades are copied across accounts</p>
          </div>

          <Button
            variant={settings.is_active ? "destructive" : "default"}
            onClick={handleToggleCopyTrading}
            disabled={isToggling || !hasConnectedBroker}
          >
            {isToggling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {settings.is_active ? "Disable Copy Trading" : "Enable Copy Trading"}
          </Button>
        </div>

        {!hasConnectedBroker && (
          <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Broker Connected</AlertTitle>
            <AlertDescription>
              You need to connect a broker before you can enable copy trading.
              <Button
                variant="outline"
                size="sm"
                className="ml-2 bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
                asChild
              >
                <a href="/admin/accounts">Connect Broker</a>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckIcon className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Allocation Settings</CardTitle>
            <CardDescription>Configure how trades are allocated across follower accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="allocation_type">Allocation Type</Label>
              <Select
                value={settings.allocation_type}
                onValueChange={(value) => handleSelectChange("allocation_type", value)}
                disabled={isSaving}
              >
                <SelectTrigger id="allocation_type">
                  <SelectValue placeholder="Select allocation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage of Balance</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="mirror">Mirror Exact Shares</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {settings.allocation_type === "percentage"
                  ? "Copy trades using a percentage of the follower's account balance."
                  : settings.allocation_type === "fixed"
                    ? "Copy trades using a fixed dollar amount regardless of balance."
                    : "Copy the exact number of shares/contracts from the master account."}
              </p>
            </div>

            {settings.allocation_type === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="percentage">Percentage of Balance</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="percentage"
                    name="percentage"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={settings.percentage}
                    onChange={handleInputChange}
                    disabled={isSaving}
                  />
                  <span>%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Percentage of follower's account balance to allocate for each trade.
                </p>
              </div>
            )}

            {settings.allocation_type === "fixed" && (
              <div className="space-y-2">
                <Label htmlFor="fixed_amount">Fixed Amount</Label>
                <div className="flex items-center space-x-2">
                  <span>$</span>
                  <Input
                    id="fixed_amount"
                    name="fixed_amount"
                    type="number"
                    min="1"
                    step="1"
                    value={settings.fixed_amount}
                    onChange={handleInputChange}
                    disabled={isSaving}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Fixed dollar amount to use for each copied trade.</p>
              </div>
            )}

            <Separator />

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Risk Controls</h3>

              <div className="space-y-2">
                <Label htmlFor="max_trade_size">Maximum Trade Size</Label>
                <div className="flex items-center space-x-2">
                  <span>$</span>
                  <Input
                    id="max_trade_size"
                    name="max_trade_size"
                    type="number"
                    min="0"
                    step="100"
                    value={settings.max_trade_size}
                    onChange={handleInputChange}
                    disabled={isSaving}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Maximum dollar amount allowed for any single trade (0 for no limit).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_percentage_per_trade">Maximum Percentage Per Trade</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="max_percentage_per_trade"
                    name="max_percentage_per_trade"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.max_percentage_per_trade}
                    onChange={handleInputChange}
                    disabled={isSaving}
                  />
                  <span>%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Maximum percentage of account balance allowed for any single trade.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable_stop_loss"
                  checked={settings.enable_stop_loss}
                  onCheckedChange={(checked) => handleSwitchChange("enable_stop_loss", checked)}
                  disabled={isSaving}
                />
                <Label htmlFor="enable_stop_loss">Enable Stop Loss</Label>
              </div>

              {settings.enable_stop_loss && (
                <div className="space-y-2">
                  <Label htmlFor="stop_loss_percentage">Stop Loss Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="stop_loss_percentage"
                      name="stop_loss_percentage"
                      type="number"
                      min="1"
                      max="100"
                      step="0.1"
                      value={settings.stop_loss_percentage}
                      onChange={handleInputChange}
                      disabled={isSaving}
                    />
                    <span>%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically close positions when loss reaches this percentage.
                  </p>
                </div>
              )}
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced-options">
                <AccordionTrigger>Advanced Options</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="p-4 border rounded-md bg-gray-50">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Advanced Configuration</h4>
                        <p className="text-sm text-muted-foreground">
                          These settings require a connected broker account to take effect. Make sure to test these
                          settings carefully before enabling them for production use.
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <p className="text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              These settings affect real money transactions
            </p>
            <Button onClick={handleSaveSettings} disabled={isSaving || isLoading}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  )
}

// Helper component for the check icon
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

export default CopySettings
