
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
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
import { Position } from "@/types/broker";
import { fetchPositions } from "@/services/brokerService";
import { formatCurrency, formatPnL } from "@/utils/formatters";
import { AlertTriangle, ArrowDown, ArrowUp, Loader2, Database } from "lucide-react";

const Positions = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasConnectedBroker, setHasConnectedBroker] = useState(false);

  useEffect(() => {
    const loadPositions = async () => {
      try {
        const data = await fetchPositions(1);
        setPositions(data);
        
        setHasConnectedBroker(false);
      } catch (error) {
        console.error("Failed to fetch positions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPositions();
  }, []);

  const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
  const totalPnL = positions.reduce(
    (sum, pos) => sum + pos.unrealized_pnl,
    0
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Positions</h1>
          <p className="text-muted-foreground">
            View all open positions across your accounts
          </p>
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
                    Connect a broker account to view your positions. Go to the
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

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Position Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                ) : hasConnectedBroker ? (
                  formatCurrency(totalValue)
                ) : (
                  "No broker connected"
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unrealized P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                ) : hasConnectedBroker ? (
                  <span className={totalPnL >= 0 ? "text-success" : "text-error"}>
                    {totalPnL >= 0 ? "+" : ""}
                    {formatCurrency(totalPnL)}
                  </span>
                ) : (
                  "No broker connected"
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Open Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                ) : hasConnectedBroker ? (
                  positions.length
                ) : (
                  "No broker connected"
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
            <CardDescription>
              Real-time view of all positions across accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-md" />
                ))}
              </div>
            ) : positions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Avg. Price</TableHead>
                    <TableHead className="text-right">Current Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Unrealized P&L</TableHead>
                    <TableHead className="text-right">% Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position, index) => {
                    const pnl = formatPnL(position.unrealized_pnl);
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {position.symbol}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {position.type}
                            {position.type === "option" && position.option_type && (
                              <span className="ml-1">
                                ({position.option_type})
                              </span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {position.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(position.average_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(position.current_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(position.value)}
                        </TableCell>
                        <TableCell className={`text-right ${pnl.class}`}>
                          {pnl.value}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              position.unrealized_pnl_percent >= 0
                                ? "text-success flex items-center justify-end"
                                : "text-error flex items-center justify-end"
                            }
                          >
                            {position.unrealized_pnl_percent >= 0 ? (
                              <ArrowUp className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDown className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(position.unrealized_pnl_percent).toFixed(2)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : hasConnectedBroker ? (
              <div className="text-center py-12">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No open positions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any open positions at this time.
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No broker connected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Connect a broker to view positions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Positions;
