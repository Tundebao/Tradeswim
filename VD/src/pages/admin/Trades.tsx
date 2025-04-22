
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trade } from "@/types/broker";
import { formatDateTime } from "@/utils/dateUtils";
import { Download, Filter, FileDown, Database, AlertTriangle } from "lucide-react";

const Trades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasConnectedBroker, setHasConnectedBroker] = useState(false);
  
  // Filter states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [symbol, setSymbol] = useState("");
  const [tradeType, setTradeType] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    // Simulate fetching trades from API
    setTimeout(() => {
      setTrades([]);
      setIsLoading(false);
      
      // Check if broker is connected
      setHasConnectedBroker(false);
    }, 1000);
  }, []);

  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    alert("In a real app, this would download a CSV of the current filtered trades.");
  };

  const handleExportPDF = () => {
    // In a real app, this would generate and download a PDF file
    alert("In a real app, this would download a PDF of the current filtered trades.");
  };

  const handleResetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSymbol("");
    setTradeType("all");
    setStatus("all");
  };

  const filteredTrades = trades;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trade History</h1>
            <p className="text-muted-foreground">
              View and analyze all trades executed on your accounts
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <FileDown className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>

        {!hasConnectedBroker && !isLoading && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  No Broker Connected
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Connect a broker account to view your trade history. Go to the
                    Accounts page to add a broker.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <a
                      href="/admin/accounts"
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    >
                      Connect Broker
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Filter Trades</CardTitle>
            <CardDescription>
              Narrow down your trade history by applying filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">From Date</label>
                <Input 
                  type="date" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">To Date</label>
                <Input 
                  type="date" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Symbol</label>
                <Input 
                  placeholder="e.g. AAPL" 
                  value={symbol} 
                  onChange={(e) => setSymbol(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Trade Type</label>
                <Select value={tradeType} onValueChange={setTradeType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="copy">Copy Trade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="filled">Filled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={handleResetFilters} className="mr-2">
                Reset Filters
              </Button>
              <Button>
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>
              Complete history of all trading activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-md" />
                ))}
              </div>
            ) : filteredTrades.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Order Type</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>
                        {trade.executed_at 
                          ? formatDateTime(trade.executed_at) 
                          : formatDateTime(trade.created_at || "")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {trade.symbol}
                        {trade.is_option && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            (Option)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${
                            trade.side === "buy" 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {trade.side}
                        </Badge>
                      </TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell>${trade.price.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">
                        {trade.order_type}
                        {trade.order_type === "limit" && trade.limit_price && (
                          <span className="ml-1">
                            @ ${trade.limit_price.toFixed(2)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {trade.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${
                            trade.status === "filled" 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : trade.status === "pending" 
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : trade.status === "rejected"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {trade.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : hasConnectedBroker ? (
              <div className="text-center py-12">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No trade history</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No trades match your current filter criteria.
                </p>
                {(dateFrom || dateTo || symbol || tradeType !== "all" || status !== "all") && (
                  <Button 
                    variant="outline" 
                    onClick={handleResetFilters} 
                    className="mt-4"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No broker connected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Connect a broker to view trade history.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Trades;
