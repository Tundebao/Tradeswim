"use client"

import type React from "react"

import { useState } from "react"
import AdminLayout from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { executeTrade } from "@/services/brokerService"
import type { Trade } from "@/types/broker"
import { AlertCircle, Loader2 } from "lucide-react"

const ManualTrade = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [tradeType, setTradeType] = useState<"stock" | "option">("stock")

  // Form state for stock trading
  const [stockForm, setStockForm] = useState({
    symbol: "",
    quantity: "",
    side: "buy",
    orderType: "market",
    limitPrice: "",
    brokerAccountId: "1", // In a real app, you would fetch actual broker accounts
  })

  // Form state for options trading
  const [optionForm, setOptionForm] = useState({
    symbol: "",
    quantity: "",
    side: "buy",
    orderType: "market",
    limitPrice: "",
    brokerAccountId: "1",
    expirationDate: "",
    strikePrice: "",
    optionType: "call",
  })

  const handleStockInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setStockForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleOptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setOptionForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: string, value: string, formType: "stock" | "option") => {
    if (formType === "stock") {
      setStockForm((prev) => ({ ...prev, [field]: value }))
    } else {
      setOptionForm((prev) => ({ ...prev, [field]: value }))
    }
  }

  const validateStockForm = () => {
    if (!stockForm.symbol) return "Symbol is required"
    if (!stockForm.quantity || Number.parseInt(stockForm.quantity) <= 0) return "Valid quantity is required"
    if (stockForm.orderType === "limit" && (!stockForm.limitPrice || Number.parseFloat(stockForm.limitPrice) <= 0)) {
      return "Limit price is required for limit orders"
    }
    return ""
  }

  const validateOptionForm = () => {
    if (!optionForm.symbol) return "Symbol is required"
    if (!optionForm.quantity || Number.parseInt(optionForm.quantity) <= 0) return "Valid quantity is required"
    if (!optionForm.expirationDate) return "Expiration date is required"
    if (!optionForm.strikePrice || Number.parseFloat(optionForm.strikePrice) <= 0)
      return "Valid strike price is required"
    if (optionForm.orderType === "limit" && (!optionForm.limitPrice || Number.parseFloat(optionForm.limitPrice) <= 0)) {
      return "Limit price is required for limit orders"
    }
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const validationError = tradeType === "stock" ? validateStockForm() : validateOptionForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const formData = tradeType === "stock" ? stockForm : optionForm

      const tradePayload: Omit<Trade, "id" | "created_at" | "updated_at" | "status"> = {
        broker_account_id: Number.parseInt(formData.brokerAccountId),
        symbol: formData.symbol.toUpperCase(),
        quantity: Number.parseInt(formData.quantity),
        price: formData.orderType === "limit" ? Number.parseFloat(formData.limitPrice) : 0,
        side: formData.side as "buy" | "sell",
        order_type: formData.orderType as "market" | "limit",
        type: "manual",
        is_option: tradeType === "option",
        ...(tradeType === "option" && {
          option_details: {
            expiration_date: optionForm.expirationDate,
            strike_price: Number.parseFloat(optionForm.strikePrice),
            option_type: optionForm.optionType as "call" | "put",
          },
        }),
      }

      const result = await executeTrade(tradePayload)

      if (result.success) {
        setSuccess(`Order placed successfully: ${formData.side.toUpperCase()} ${formData.quantity} ${formData.symbol}`)

        // Reset form fields
        if (tradeType === "stock") {
          setStockForm((prev) => ({ ...prev, symbol: "", quantity: "", limitPrice: "" }))
        } else {
          setOptionForm((prev) => ({
            ...prev,
            symbol: "",
            quantity: "",
            limitPrice: "",
            expirationDate: "",
            strikePrice: "",
          }))
        }
      } else {
        setError(result.error || "Failed to execute trade. Please try again.")
      }
    } catch (error) {
      console.error("Error executing trade:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manual Trade</h1>
          <p className="text-muted-foreground">Place manual trades for stocks and options</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Place Order</CardTitle>
            <CardDescription>Enter the details for your order</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="stock" onValueChange={(value) => setTradeType(value as "stock" | "option")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="stock">Stocks</TabsTrigger>
                <TabsTrigger value="option">Options</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                    <CheckIcon className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="stock" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="symbol">Symbol</Label>
                      <Input
                        id="symbol"
                        name="symbol"
                        placeholder="e.g. AAPL"
                        value={stockForm.symbol}
                        onChange={handleStockInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        placeholder="e.g. 10"
                        type="number"
                        min="1"
                        value={stockForm.quantity}
                        onChange={handleStockInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="side">Side</Label>
                      <Select
                        value={stockForm.side}
                        onValueChange={(value) => handleSelectChange("side", value, "stock")}
                      >
                        <SelectTrigger id="side">
                          <SelectValue placeholder="Select side" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Buy</SelectItem>
                          <SelectItem value="sell">Sell</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderType">Order Type</Label>
                      <Select
                        value={stockForm.orderType}
                        onValueChange={(value) => handleSelectChange("orderType", value, "stock")}
                      >
                        <SelectTrigger id="orderType">
                          <SelectValue placeholder="Select order type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="market">Market</SelectItem>
                          <SelectItem value="limit">Limit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {stockForm.orderType === "limit" && (
                      <div className="space-y-2">
                        <Label htmlFor="limitPrice">Limit Price</Label>
                        <Input
                          id="limitPrice"
                          name="limitPrice"
                          placeholder="e.g. 150.50"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={stockForm.limitPrice}
                          onChange={handleStockInputChange}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="brokerAccountId">Broker Account</Label>
                      <Select
                        value={stockForm.brokerAccountId}
                        onValueChange={(value) => handleSelectChange("brokerAccountId", value, "stock")}
                      >
                        <SelectTrigger id="brokerAccountId">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">No Accounts Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="option" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="option-symbol">Underlying Symbol</Label>
                      <Input
                        id="option-symbol"
                        name="symbol"
                        placeholder="e.g. AAPL"
                        value={optionForm.symbol}
                        onChange={handleOptionInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="option-quantity">Contracts</Label>
                      <Input
                        id="option-quantity"
                        name="quantity"
                        placeholder="e.g. 1"
                        type="number"
                        min="1"
                        value={optionForm.quantity}
                        onChange={handleOptionInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expirationDate">Expiration Date</Label>
                      <Input
                        id="expirationDate"
                        name="expirationDate"
                        type="date"
                        value={optionForm.expirationDate}
                        onChange={handleOptionInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="strikePrice">Strike Price</Label>
                      <Input
                        id="strikePrice"
                        name="strikePrice"
                        placeholder="e.g. 150"
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={optionForm.strikePrice}
                        onChange={handleOptionInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="optionType">Option Type</Label>
                      <Select
                        value={optionForm.optionType}
                        onValueChange={(value) => handleSelectChange("optionType", value, "option")}
                      >
                        <SelectTrigger id="optionType">
                          <SelectValue placeholder="Select option type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="put">Put</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="option-side">Side</Label>
                      <Select
                        value={optionForm.side}
                        onValueChange={(value) => handleSelectChange("side", value, "option")}
                      >
                        <SelectTrigger id="option-side">
                          <SelectValue placeholder="Select side" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Buy</SelectItem>
                          <SelectItem value="sell">Sell</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="option-orderType">Order Type</Label>
                      <Select
                        value={optionForm.orderType}
                        onValueChange={(value) => handleSelectChange("orderType", value, "option")}
                      >
                        <SelectTrigger id="option-orderType">
                          <SelectValue placeholder="Select order type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="market">Market</SelectItem>
                          <SelectItem value="limit">Limit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {optionForm.orderType === "limit" && (
                      <div className="space-y-2">
                        <Label htmlFor="option-limitPrice">Limit Price</Label>
                        <Input
                          id="option-limitPrice"
                          name="limitPrice"
                          placeholder="e.g. 5.50"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={optionForm.limitPrice}
                          onChange={handleOptionInputChange}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="option-brokerAccountId">Broker Account</Label>
                      <Select
                        value={optionForm.brokerAccountId}
                        onValueChange={(value) => handleSelectChange("brokerAccountId", value, "option")}
                      >
                        <SelectTrigger id="option-brokerAccountId">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">No Accounts Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <Button type="submit" className="mt-4 w-full md:w-auto" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </Button>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground border-t pt-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            All trades are executed with real money. Be sure to verify all details before submitting.
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
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

export default ManualTrade
