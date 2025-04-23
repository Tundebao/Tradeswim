"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDateTime } from "@/utils/dateUtils"
import { Download, Filter, Search, FileText, ArrowDown } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warning" | "error" | "debug"
  message: string
  source: string
  details?: string
}

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [logLevel, setLogLevel] = useState("all")
  const [logSource, setLogSource] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    // Simulate loading logs
    setTimeout(() => {
      // Generate mock logs for display
      const mockLogs: LogEntry[] = [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Admin user logged in",
          source: "authentication",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          level: "warning",
          message: "Trade limit approaching threshold",
          source: "trading",
          details: "Current daily trade count: 48/50",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          level: "error",
          message: "Failed to execute trade for symbol AAPL",
          source: "trading",
          details: "Error: Insufficient buying power",
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          level: "info",
          message: "Broker connection status checked",
          source: "system",
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
          level: "debug",
          message: "WebSocket connection established",
          source: "network",
          details: "Connected to wss://api.broker.com/stream",
        },
      ]

      setLogs(mockLogs)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleExportLogs = () => {
    // In a real app, this would generate and download a log file
    alert("In a real app, this would download the filtered logs as a file.")
  }

  const handleApplyFilters = () => {
    // In a real app, this would reload logs with the selected filters
    // Here we just show a loading state briefly
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setLogLevel("all")
    setLogSource("all")
    setDateFrom("")
    setDateTo("")
  }

  // Filter logs based on current filters
  const filteredLogs = logs.filter((log) => {
    // Search query
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Log level
    if (logLevel !== "all" && log.level !== logLevel) {
      return false
    }

    // Log source
    if (logSource !== "all" && log.source !== logSource) {
      return false
    }

    // DateFrom filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      const logDate = new Date(log.timestamp)
      if (logDate < fromDate) {
        return false
      }
    }

    // DateTo filter
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999) // End of the day
      const logDate = new Date(log.timestamp)
      if (logDate > toDate) {
        return false
      }
    }

    return true
  })

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Logs</h1>
            <p className="text-muted-foreground">View and analyze system and trading activity logs</p>
          </div>

          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="mr-2 h-4 w-4" /> Export Logs
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Log Filters</CardTitle>
            <CardDescription>Narrow down logs by applying filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Log Level</label>
                <Select value={logLevel} onValueChange={setLogLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Source</label>
                <Select value={logSource} onValueChange={setLogSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="authentication">Authentication</SelectItem>
                    <SelectItem value="trading">Trading</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={handleResetFilters} className="mr-2">
                Reset Filters
              </Button>
              <Button onClick={handleApplyFilters}>
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>System and trading activity records</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-md" />
                ))}
              </div>
            ) : filteredLogs.length > 0 ? (
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 border-b px-4 py-2 flex items-center text-sm font-medium text-gray-500">
                    <div className="w-40">Timestamp</div>
                    <div className="w-24">Level</div>
                    <div className="w-32">Source</div>
                    <div className="flex-1">Message</div>
                    <div className="w-8"></div>
                  </div>

                  <div className="divide-y">
                    {filteredLogs.map((log) => (
                      <details key={log.id} className="group">
                        <summary className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50">
                          <div className="w-40 text-sm text-gray-500">{formatDateTime(log.timestamp)}</div>
                          <div className="w-24">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                log.level === "error"
                                  ? "bg-red-100 text-red-800"
                                  : log.level === "warning"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : log.level === "info"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {log.level}
                            </span>
                          </div>
                          <div className="w-32 text-sm font-medium capitalize">{log.source}</div>
                          <div className="flex-1 text-sm overflow-hidden overflow-ellipsis whitespace-nowrap">
                            {log.message}
                          </div>
                          <div className="w-8 flex justify-end">
                            <ArrowDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
                          </div>
                        </summary>

                        {log.details && (
                          <div className="px-4 py-3 bg-gray-50 border-t text-sm">
                            <div className="font-medium mb-1">Details:</div>
                            <div className="whitespace-pre-wrap text-gray-600">{log.details}</div>
                          </div>
                        )}
                      </details>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" className="text-sm">
                    Load More Logs
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No logs found</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  {searchQuery || logLevel !== "all" || logSource !== "all" || dateFrom || dateTo
                    ? "No logs match your current filter criteria."
                    : "There are no logs to display for the selected time period."}
                </p>
                {(searchQuery || logLevel !== "all" || logSource !== "all" || dateFrom || dateTo) && (
                  <Button variant="outline" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default Logs
