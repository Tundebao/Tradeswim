
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, ArrowRight, Check, Database, ShieldAlert, X } from "lucide-react";
import { Link } from "react-router-dom";
import { checkCopyTradingStatus } from "@/services/copyTradingService";

interface CopyTradingStatus {
  isActive: boolean;
  lastSync?: string;
  connectedAccounts: number;
}

const AdminDashboard = () => {
  const [copyTradingStatus, setCopyTradingStatus] = useState<CopyTradingStatus>({
    isActive: false,
    lastSync: "",
    connectedAccounts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [brokerConnected, setBrokerConnected] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const status = await checkCopyTradingStatus();
        setCopyTradingStatus(prev => ({
          ...prev,
          ...status,
          lastSync: status.lastSync || prev.lastSync
        }));
        
        // In a real app, check if broker is connected
        setBrokerConnected(false);
      } catch (error) {
        console.error("Failed to fetch status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage broker connections, trading settings, and monitor system status
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Broker Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant={brokerConnected ? "default" : "destructive"} className="px-2 py-1">
                  {brokerConnected ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <X className="h-3 w-3 mr-1" />
                  )}
                  {brokerConnected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {brokerConnected
                  ? "Your broker account is connected and operational."
                  : "No broker account connected. Add credentials to enable trading."}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link to="/admin/accounts">
                  Manage Broker Accounts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Copy Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <Badge
                  variant={copyTradingStatus.isActive ? "default" : "secondary"}
                  className="px-2 py-1"
                >
                  {copyTradingStatus.isActive ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {copyTradingStatus.isActive ? "Active" : "Disabled"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {copyTradingStatus.isActive
                  ? `Active with ${copyTradingStatus.connectedAccounts} follower account(s).`
                  : "Copy trading is currently disabled."}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link to="/admin/copy-settings">
                  Manage Copy Settings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Connection:</span>
                  <Badge variant="outline" className="px-2 py-1 bg-green-50 text-green-800 border-green-200">
                    <Check className="h-3 w-3 mr-1" /> Operational
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Webhook Processing:</span>
                  <Badge variant="outline" className="px-2 py-1 bg-green-50 text-green-800 border-green-200">
                    <Check className="h-3 w-3 mr-1" /> Operational
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database:</span>
                  <Badge variant="outline" className="px-2 py-1 bg-green-50 text-green-800 border-green-200">
                    <Check className="h-3 w-3 mr-1" /> Operational
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link to="/admin/logs">
                  View System Logs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and actions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {isLoading ? (
                  <div className="animate-pulse space-y-4 p-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded-md" />
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-4 text-center text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity to display</p>
                    <p className="text-sm">Activity logs will appear here as you use the system</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {isLoading ? (
                  <div className="animate-pulse space-y-4 p-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded-md" />
                    ))}
                  </div>
                ) : !brokerConnected ? (
                  <div className="p-4 border-b">
                    <div className="flex items-start space-x-3">
                      <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">No Broker Connected</h4>
                        <p className="text-sm text-muted-foreground">
                          Connect your broker account to enable trading functionality
                        </p>
                        <Button size="sm" variant="outline" className="mt-2" asChild>
                          <Link to="/admin/accounts">Connect Now</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-4 text-center text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No alerts to display</p>
                    <p className="text-sm">System is operating normally</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
