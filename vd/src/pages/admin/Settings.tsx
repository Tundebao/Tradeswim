"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Check, Loader2 } from "lucide-react"

interface SettingsState {
  general: {
    tradingEnabled: boolean
    defaultCopyMode: string
    tradeDelay: number
    maxActivePositions: number
  }
  notifications: {
    emailNotifications: boolean
    tradeAlerts: boolean
    marketAlerts: boolean
    riskAlerts: boolean
    systemAlerts: boolean
    emailAddress: string
  }
  webhook: {
    enabled: boolean
    url: string
    secret: string
    sendTradeEvents: boolean
    sendSystemEvents: boolean
  }
  logs: {
    detailedLogging: boolean
    retentionPeriod: number
  }
}

const Settings = () => {
  const [settings, setSettings] = useState<SettingsState>({
    general: {
      tradingEnabled: true,
      defaultCopyMode: "percentage",
      tradeDelay: 500,
      maxActivePositions: 10,
    },
    notifications: {
      emailNotifications: false,
      tradeAlerts: true,
      marketAlerts: false,
      riskAlerts: true,
      systemAlerts: true,
      emailAddress: "",
    },
    webhook: {
      enabled: false,
      url: "",
      secret: "",
      sendTradeEvents: true,
      sendSystemEvents: true,
    },
    logs: {
      detailedLogging: true,
      retentionPeriod: 30,
    },
  })

  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSwitchChange = (section: keyof SettingsState, field: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: checked,
      },
    }))
  }

  const handleInputChange = (section: keyof SettingsState, field: string, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleSelectChange = (section: keyof SettingsState, field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleSaveSettings = async () => {
    setError("")
    setSuccess("")
    setIsSaving(true)

    try {
      // In a real app, this would save to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess("Settings updated successfully")
    } catch (error) {
      console.error("Failed to save settings:", error)
      setError("Failed to save settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground">Configure global settings for the trading platform</p>
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

        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure platform-wide settings for trading operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="tradingEnabled">Enable Trading</Label>
                    <p className="text-sm text-muted-foreground">Toggle all trading operations on or off</p>
                  </div>
                  <Switch
                    id="tradingEnabled"
                    checked={settings.general.tradingEnabled}
                    onCheckedChange={(checked) => handleSwitchChange("general", "tradingEnabled", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="defaultCopyMode">Default Copy Mode</Label>
                  <Select
                    value={settings.general.defaultCopyMode}
                    onValueChange={(value) => handleSelectChange("general", "defaultCopyMode", value)}
                  >
                    <SelectTrigger id="defaultCopyMode">
                      <SelectValue placeholder="Select default copy mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage of Balance</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="mirror">Mirror Exact Shares</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Default allocation method for new copy trading accounts
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tradeDelay">Trade Delay (ms)</Label>
                    <Input
                      id="tradeDelay"
                      type="number"
                      min="0"
                      step="50"
                      value={settings.general.tradeDelay}
                      onChange={(e) => handleInputChange("general", "tradeDelay", Number.parseInt(e.target.value))}
                    />
                    <p className="text-sm text-muted-foreground">Delay in milliseconds between copy trades</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxActivePositions">Max Active Positions</Label>
                    <Input
                      id="maxActivePositions"
                      type="number"
                      min="1"
                      value={settings.general.maxActivePositions}
                      onChange={(e) =>
                        handleInputChange("general", "maxActivePositions", Number.parseInt(e.target.value))
                      }
                    />
                    <p className="text-sm text-muted-foreground">Maximum number of concurrent positions allowed</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive important alerts via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleSwitchChange("notifications", "emailNotifications", checked)}
                  />
                </div>

                {settings.notifications.emailNotifications && (
                  <div className="space-y-2">
                    <Label htmlFor="emailAddress">Email Address</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      placeholder="admin@example.com"
                      value={settings.notifications.emailAddress}
                      onChange={(e) => handleInputChange("notifications", "emailAddress", e.target.value)}
                    />
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Notification Types</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="tradeAlerts">Trade Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notifications for trades and order status</p>
                    </div>
                    <Switch
                      id="tradeAlerts"
                      checked={settings.notifications.tradeAlerts}
                      onCheckedChange={(checked) => handleSwitchChange("notifications", "tradeAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketAlerts">Market Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications for market events and price movements
                      </p>
                    </div>
                    <Switch
                      id="marketAlerts"
                      checked={settings.notifications.marketAlerts}
                      onCheckedChange={(checked) => handleSwitchChange("notifications", "marketAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="riskAlerts">Risk Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notifications for risk management events</p>
                    </div>
                    <Switch
                      id="riskAlerts"
                      checked={settings.notifications.riskAlerts}
                      onCheckedChange={(checked) => handleSwitchChange("notifications", "riskAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="systemAlerts">System Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notifications for platform status and errors</p>
                    </div>
                    <Switch
                      id="systemAlerts"
                      checked={settings.notifications.systemAlerts}
                      onCheckedChange={(checked) => handleSwitchChange("notifications", "systemAlerts", checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Integration</CardTitle>
                <CardDescription>Configure webhooks to integrate with external systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="webhookEnabled">Enable Webhook</Label>
                    <p className="text-sm text-muted-foreground">Send real-time events to an external endpoint</p>
                  </div>
                  <Switch
                    id="webhookEnabled"
                    checked={settings.webhook.enabled}
                    onCheckedChange={(checked) => handleSwitchChange("webhook", "enabled", checked)}
                  />
                </div>

                {settings.webhook.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">Webhook URL</Label>
                      <Input
                        id="webhookUrl"
                        placeholder="https://example.com/webhook"
                        value={settings.webhook.url}
                        onChange={(e) => handleInputChange("webhook", "url", e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">Endpoint URL that will receive webhook events</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="webhookSecret">Secret Key</Label>
                      <Input
                        id="webhookSecret"
                        type="password"
                        placeholder="Your webhook secret"
                        value={settings.webhook.secret}
                        onChange={(e) => handleInputChange("webhook", "secret", e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">Secret used to sign webhook payloads</p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-medium">Event Types</h3>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sendTradeEvents">Trade Events</Label>
                          <p className="text-sm text-muted-foreground">
                            Send notifications for trades and order status
                          </p>
                        </div>
                        <Switch
                          id="sendTradeEvents"
                          checked={settings.webhook.sendTradeEvents}
                          onCheckedChange={(checked) => handleSwitchChange("webhook", "sendTradeEvents", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sendSystemEvents">System Events</Label>
                          <p className="text-sm text-muted-foreground">
                            Send notifications for system status and errors
                          </p>
                        </div>
                        <Switch
                          id="sendSystemEvents"
                          checked={settings.webhook.sendSystemEvents}
                          onCheckedChange={(checked) => handleSwitchChange("webhook", "sendSystemEvents", checked)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Log Settings</CardTitle>
                <CardDescription>Configure logging behavior and retention policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="detailedLogging">Detailed Logging</Label>
                    <p className="text-sm text-muted-foreground">Capture comprehensive debug information</p>
                  </div>
                  <Switch
                    id="detailedLogging"
                    checked={settings.logs.detailedLogging}
                    onCheckedChange={(checked) => handleSwitchChange("logs", "detailedLogging", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Log Retention (days)</Label>
                  <Select
                    value={settings.logs.retentionPeriod.toString()}
                    onValueChange={(value) => handleInputChange("logs", "retentionPeriod", Number.parseInt(value))}
                  >
                    <SelectTrigger id="retentionPeriod">
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    How long logs are kept before being automatically purged
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

export default Settings
