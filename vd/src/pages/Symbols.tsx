"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Star, ArrowUp, ArrowDown, Loader2 } from "lucide-react"

interface Symbol {
  id: number
  symbol: string
  name: string
  type: "stock" | "option"
  price: number
  change: number
  changePercent: number
  isFavorite: boolean
}

const Symbols = () => {
  const [symbols, setSymbols] = useState<Symbol[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to load watchlist
    // In a real app, this would fetch from your backend
    setTimeout(() => {
      const demoSymbols: Symbol[] = [
        {
          id: 1,
          symbol: "AAPL",
          name: "Apple Inc.",
          type: "stock",
          price: 188.52,
          change: 2.34,
          changePercent: 1.25,
          isFavorite: true,
        },
        {
          id: 2,
          symbol: "MSFT",
          name: "Microsoft Corp.",
          type: "stock",
          price: 332.81,
          change: -1.56,
          changePercent: -0.47,
          isFavorite: true,
        },
        {
          id: 3,
          symbol: "AMZN",
          name: "Amazon.com Inc.",
          type: "stock",
          price: 178.22,
          change: 3.45,
          changePercent: 1.97,
          isFavorite: false,
        },
        {
          id: 4,
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          type: "stock",
          price: 137.14,
          change: 0.75,
          changePercent: 0.55,
          isFavorite: false,
        },
        {
          id: 5,
          symbol: "META",
          name: "Meta Platforms Inc.",
          type: "stock",
          price: 477.4,
          change: 5.23,
          changePercent: 1.11,
          isFavorite: true,
        },
      ]

      setSymbols(demoSymbols)
      setIsLoading(false)
    }, 1000)
  }, [])

  const toggleFavorite = (id: number) => {
    setSymbols((prev) =>
      prev.map((symbol) => (symbol.id === id ? { ...symbol, isFavorite: !symbol.isFavorite } : symbol)),
    )
  }

  const filteredSymbols = symbols.filter(
    (symbol) =>
      symbol.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      symbol.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
            <p className="text-muted-foreground">Track your favorite symbols and see real-time prices</p>
          </div>

          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Symbol
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search symbols..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button variant="outline">
            <Badge className="mr-2" variant="outline">
              {symbols.filter((s) => s.isFavorite).length}
            </Badge>
            Favorites
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Symbol Watchlist</CardTitle>
            <CardDescription>Track symbols that you're interested in trading</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSymbols.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">% Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSymbols.map((symbol) => (
                    <TableRow key={symbol.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={symbol.isFavorite ? "text-yellow-500" : "text-gray-300"}
                          onClick={() => toggleFavorite(symbol.id)}
                        >
                          <Star className="h-4 w-4" fill={symbol.isFavorite ? "currentColor" : "none"} />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{symbol.symbol}</TableCell>
                      <TableCell>{symbol.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {symbol.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">${symbol.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span className={symbol.change >= 0 ? "text-success" : "text-error"}>
                          {symbol.change >= 0 ? (
                            <ArrowUp className="h-3 w-3 inline mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 inline mr-1" />
                          )}
                          ${Math.abs(symbol.change).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={symbol.changePercent >= 0 ? "text-success" : "text-error"}>
                          {symbol.changePercent >= 0 ? "+" : ""}
                          {symbol.changePercent.toFixed(2)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No symbols found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? `No results found for "${searchQuery}"`
                    : "You haven't added any symbols to your watchlist yet"}
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Symbol
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default Symbols
