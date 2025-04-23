"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import MainLayout from "@/components/layout/MainLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchBrokerAccounts, fetchBrokerBalance, checkBrokerHealth } from "@/services/brokerService"
import { type BrokerAccount, type BrokerBalance, BrokerConnectionStatus } from "@/types/broker"
import { formatCurrency } from "@/utils/formatters"
import { AlertTriangle, ChevronRight, Wallet, Activity, Briefcase, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

const Dashboard = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<BrokerAccount[]>([])
  const [balances, setBalances] = useState<Record<number, BrokerBalance>>({})
  const [brokerStatuses, setBrokerStatuses] = useState<Record<number, BrokerConnectionStatus>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasConnectedBroker, setHasConnectedBroker] = useState(false)

  useEffect(() => {
    const loadBrokerData = async () => {
      try {
        setIsLoading(true)
        // Fetch broker accounts
        const brokerAccounts = await fetchBrokerAccounts()
        setAccounts(brokerAccounts)

        // Check if we have connected brokers
        setHasConnectedBroker(brokerAccounts.length > 0)

        // Fetch balances for each account and check broker health
        const balanceData: Record<number, BrokerBalance> = {}
        const statusData: Record<number, BrokerConnectionStatus> = {}

        for (const account of brokerAccounts) {
          if (account.id) {
            // Fetch balance
            const balance = await fetchBrokerBalance(account.id)
            balanceData[account.id] = balance

            // Check broker health
            if (account.broker_id) {
              const healthCheck = await checkBrokerHealth(account.broker_id)
              statusData[account.broker_id] = healthCheck.status
            }
          }
        }

        setBalances(balanceData)
        setBrokerStatuses(statusData)
      } catch (error) {
        console.error("Failed to fetch broker data:", error)
        toast({
          title: "Error",
          description: "Failed to load broker data. Please try refreshing.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadBrokerData()
  }, [toast])

  const refreshData = async () => {
    try {
      setIsRefreshing(true)
      // Fetch broker accounts
      const brokerAccounts = await fetchBrokerAccounts()
      setAccounts(brokerAccounts)

      // Check if we have connected brokers
      setHasConnectedBroker(brokerAccounts.length > 0)

      // Fetch balances for each account and check broker health
      const balanceData: Record<number, BrokerBalance> = {}
      const statusData: Record<number, BrokerConnectionStatus> = {}

      for (const account of brokerAccounts) {
        if (account.id) {
          // Fetch balance
          const balance = await fetchBrokerBalance(account.id)
          balanceData[account.id] = balance

          // Check broker health
          if (account.broker_id) {
            const healthCheck = await checkBrokerHealth(account.broker_id)
            statusData[account.broker_id] = healthCheck.status
          }
        }
      }

      setBalances(balanceData)
      setBrokerStatuses(statusData)

      toast({
        title: "Refreshed",
        description: "Dashboard data has been refreshed.",
      })
    } catch (error) {
      console.error("Failed to refresh broker data:", error)
      toast({
        title: "Error",
        description: "Failed to refresh broker data.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Calculate combined balances across all accounts
  const calculateTotalBalances = (): BrokerBalance => {
    const total: BrokerBalance = {
      total_equity: 0,
      cash_balance: 0,
      buying_power: 0,
      day_trading_buying_power: 0,
      margin_maintenance: 0,
      account_value: 0,
    }

    Object.values(balances).forEach((balance) => {
      total.total_equity += balance.total_equity || 0
      total.cash_balance += balance.cash_balance || 0
      total.buying_power += balance.buying_power || 0
      total.day_trading_buying_power += balance.day_trading_buying_power || 0
      total.margin_maintenance += balance.margin_maintenance || 0
      total.account_value += balance.account_value || 0
    })

    return total
  }

  const totalBalances = calculateTotalBalances()

  // Render connection status indicator
  const renderConnectionStatus = (brokerId: number) => {
    const status = brokerStatuses[brokerId] || BrokerConnectionStatus.DISCONNECTED

    switch (status) {
      case BrokerConnectionStatus.CONNECTED:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" /> Connected
          </span>
        )
      case BrokerConnectionStatus.DISCONNECTED:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <XCircle className="h-3 w-3 mr-1" /> Disconnected
          </span>
        )
      case BrokerConnectionStatus.ERROR:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" /> Error
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3 mr-1" /> Unknown
          </span>
        )
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your trading accounts and performance</p>
          </div>

          {hasConnectedBroker && (
            <Button variant="outline" onClick={refreshData} disabled={isRefreshing} type="button">
              {isRefreshing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh Data
            </Button>
          )}
        </div>

        {!hasConnectedBroker && !isLoading && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No Broker Connected</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You need to connect a real broker account before you can see balance information and start trading.
                    Go to the Admin Panel to connect a broker.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <Button variant="secondary" size="sm" onClick={() => navigate("/admin/accounts")} type="button">
                      Connect Broker
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Account Value</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                ) : hasConnectedBroker ? (
                  formatCurrency(totalBalances.total_equity)
                ) : (
                  "No broker connected"
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total equity across all accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                ) : hasConnectedBroker ? (
                  formatCurrency(totalBalances.cash_balance)
                ) : (
                  "No broker connected"
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Available cash in account</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buying Power</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                ) : hasConnectedBroker ? (
                  formatCurrency(totalBalances.buying_power)
                ) : (
                  "No broker connected"
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Available for new positions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Day Trading Buying Power</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                ) : hasConnectedBroker ? (
                  formatCurrency(totalBalances.day_trading_buying_power || 0)
                ) : (
                  "No broker connected"
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Available for day trades</p>
            </CardContent>
          </Card>
        </div>

        {hasConnectedBroker && (
          <div className="grid gap-4 grid-cols-1">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Connected Trading Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-md" />
                    ))}
                  </div>
                ) : accounts.length > 0 ? (
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <h3 className="font-medium">{account.account_name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>{account.account_id}</span>
                            <span>•</span>
                            <span>{account.account_type}</span>
                            <span>•</span>
                            {account.broker_id && renderConnectionStatus(account.broker_id)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(account.balance)}</div>
                          <div className="text-sm text-gray-500">BP: {formatCurrency(account.buying_power)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md bg-gray-50">
                    <p className="text-gray-500">No accounts found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate("/admin/accounts")}
                      type="button"
                    >
                      Connect Broker Account <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Account Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {isLoading ? (
                <div className="animate-pulse h-full w-full bg-gray-100 rounded-md"></div>
              ) : hasConnectedBroker ? (
                <div className="text-center text-gray-500">
                  Performance chart will appear here once you have trading history
                </div>
              ) : (
                <div className="text-center text-gray-500">Connect a broker to view performance data</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-md"></div>
                  ))}
                </div>
              ) : hasConnectedBroker ? (
                <div className="text-center text-gray-500 py-12">No recent trades</div>
              ) : (
                <div className="text-center text-gray-500 py-12">Connect a broker to view trades</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default Dashboard
