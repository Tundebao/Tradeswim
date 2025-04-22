
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertCircle,
  CircleAlert,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrokerCredentials, BrokerType, BrokerAccount, BrokerConnectionStatus } from "@/types/broker";
import { 
  connectBrokerAccount, 
  disconnectBrokerAccount, 
  fetchBrokerAccounts,
  completeSchwabOAuth,
  checkBrokerHealth,
  getBrokerHealth
} from "@/services/brokerService";
import { useToast } from "@/components/ui/use-toast";

const BrokerAccounts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [brokerCredentials, setBrokerCredentials] = useState<BrokerCredentials[]>([]);
  const [brokerAccounts, setBrokerAccounts] = useState<BrokerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState<{open: boolean, brokerId: number | null}>({
    open: false,
    brokerId: null
  });
  
  const [formData, setFormData] = useState<{
    name: string;
    broker_type: BrokerType;
    username: string;
    password: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
  }>({
    name: "",
    broker_type: BrokerType.TASTYTRADE,
    username: "",
    password: "",
    client_id: "JtK96Q9sOAbNvbNSh9rWeaGuIK8Si335",
    client_secret: "8lrmF9APAnOTsGMn",
    redirect_uri: "https://tradeswim.org/auth/schwab/callback",
  });

  // Load broker accounts and credentials on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load broker accounts from localStorage or API
        const accounts = await fetchBrokerAccounts();
        setBrokerAccounts(accounts);
        
        // Load broker credentials from localStorage
        const credentialsStr = localStorage.getItem('tradecopy_broker_credentials');
        if (credentialsStr) {
          setBrokerCredentials(JSON.parse(credentialsStr));
        }
      } catch (error) {
        console.error("Error loading broker data:", error);
        toast({
          title: "Error",
          description: "Failed to load broker data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  // Check for Schwab OAuth callback
  useEffect(() => {
    const processOAuthCallback = async () => {
      // Check if this is a Schwab callback
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');
      const state = queryParams.get('state');
      
      if (code && state) {
        try {
          // Get the broker credentials from localStorage
          const savedCredentialsString = localStorage.getItem('tradecopy_schwab_pending');
          
          if (!savedCredentialsString) {
            toast({
              title: "Error",
              description: "No pending Schwab authorization found.",
              variant: "destructive",
            });
            return;
          }
          
          const credentials = JSON.parse(savedCredentialsString);
          
          // Complete the OAuth flow
          setIsLoadingAccounts(true);
          const result = await completeSchwabOAuth(credentials, code);
          
          if (result.success) {
            toast({
              title: "Success",
              description: result.message,
            });
            
            // Remove the pending credentials
            localStorage.removeItem('tradecopy_schwab_pending');
            
            // Refresh data
            await refreshBrokerData();
          } else {
            toast({
              title: "Error",
              description: result.message,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error processing OAuth callback:", error);
          toast({
            title: "Error",
            description: "Failed to complete Schwab authorization.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingAccounts(false);
          
          // Clear the URL parameters
          navigate('/admin/accounts', { replace: true });
        }
      }
    };
    
    processOAuthCallback();
  }, [location, navigate, toast]);

  // Refresh broker health statuses periodically
  useEffect(() => {
    const checkAllBrokerHealth = async () => {
      for (const broker of brokerCredentials) {
        if (broker.id) {
          await checkBrokerHealth(broker.id);
        }
      }
      
      // Reload credentials to get updated health status
      const credentialsStr = localStorage.getItem('tradecopy_broker_credentials');
      if (credentialsStr) {
        setBrokerCredentials(JSON.parse(credentialsStr));
      }
    };
    
    // Check health on load
    if (brokerCredentials.length > 0) {
      checkAllBrokerHealth();
    }
    
    // Set up interval for health checks (every 30 seconds)
    const intervalId = setInterval(checkAllBrokerHealth, 30000);
    
    return () => clearInterval(intervalId);
  }, [brokerCredentials.length]);

  const refreshBrokerData = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      // Load broker accounts from localStorage or API
      const accounts = await fetchBrokerAccounts();
      setBrokerAccounts(accounts);
      
      // Load broker credentials from localStorage
      const credentialsStr = localStorage.getItem('tradecopy_broker_credentials');
      if (credentialsStr) {
        const credentials = JSON.parse(credentialsStr);
        setBrokerCredentials(credentials);
        
        // Check health of all brokers
        for (const broker of credentials) {
          if (broker.id) {
            await checkBrokerHealth(broker.id);
          }
        }
        
        // Reload credentials to get updated health status
        const updatedCredentialsStr = localStorage.getItem('tradecopy_broker_credentials');
        if (updatedCredentialsStr) {
          setBrokerCredentials(JSON.parse(updatedCredentialsStr));
        }
      }
      
      toast({
        title: "Refreshed",
        description: "Broker data has been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing broker data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh broker data.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [toast]);

  const resetForm = () => {
    setFormData({
      name: "",
      broker_type: BrokerType.TASTYTRADE,
      username: "",
      password: "",
      client_id: "JtK96Q9sOAbNvbNSh9rWeaGuIK8Si335",
      client_secret: "8lrmF9APAnOTsGMn",
      redirect_uri: "https://tradeswim.org/auth/schwab/callback",
    });
    setValidationError("");
    setSubmitSuccess(false);
    setShowPassword(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      broker_type: value as BrokerType 
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setValidationError("Account name is required");
      return false;
    }
    
    if (formData.broker_type === BrokerType.TASTYTRADE) {
      if (!formData.username.trim()) {
        setValidationError("Username is required for Tastytrade");
        return false;
      }
      if (!formData.password.trim()) {
        setValidationError("Password is required for Tastytrade");
        return false;
      }
    } else if (formData.broker_type === BrokerType.SCHWAB) {
      if (!formData.client_id.trim()) {
        setValidationError("Client ID is required for Schwab");
        return false;
      }
      if (!formData.client_secret.trim()) {
        setValidationError("Client Secret is required for Schwab");
        return false;
      }
      if (!formData.redirect_uri.trim()) {
        setValidationError("Redirect URI is required for Schwab");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSubmitSuccess(false);
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const credentials: BrokerCredentials = {
        name: formData.name,
        broker_type: formData.broker_type,
        is_active: true,
        api_key: '',
        api_secret: '',
      };
      
      if (formData.broker_type === BrokerType.TASTYTRADE) {
        credentials.username = formData.username;
        credentials.password = formData.password;
        
        const result = await connectBrokerAccount(credentials);
        
        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          });
          
          setSubmitSuccess(true);
          
          setTimeout(() => {
            setIsDialogOpen(false);
            resetForm();
            refreshBrokerData();
          }, 1500);
        } else {
          setValidationError(result.message);
        }
      } else if (formData.broker_type === BrokerType.SCHWAB) {
        credentials.client_id = formData.client_id;
        credentials.client_secret = formData.client_secret;
        credentials.redirect_uri = formData.redirect_uri;
        
        const result = await connectBrokerAccount(credentials);
        
        if (result.success) {
          // Store the pending credentials for when we return from OAuth
          localStorage.setItem('tradecopy_schwab_pending', JSON.stringify(result.credentials));
          
          // Redirect to Schwab authorization URL
          const authUrl = `https://api.schwab.com/oauth/authorize?client_id=${formData.client_id}&redirect_uri=${encodeURIComponent(formData.redirect_uri)}&response_type=code&scope=accounts balances`;
          window.location.href = authUrl;
        } else {
          setValidationError(result.message);
        }
      }
    } catch (error) {
      console.error("Error connecting broker:", error);
      setValidationError("Failed to connect broker. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBroker = async (brokerId: number) => {
    // Open the confirmation dialog
    setConfirmDeleteDialog({
      open: true,
      brokerId
    });
  };
  
  const confirmDeleteBroker = async () => {
    if (!confirmDeleteDialog.brokerId) return;
    
    try {
      setIsDeleting(confirmDeleteDialog.brokerId);
      
      const result = await disconnectBrokerAccount(confirmDeleteDialog.brokerId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        
        // Update the broker credentials and accounts
        await refreshBrokerData();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error disconnecting broker:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect broker. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setConfirmDeleteDialog({ open: false, brokerId: null });
    }
  };

  // Get broker name display
  const getBrokerTypeDisplay = (type: BrokerType) => {
    switch (type) {
      case BrokerType.TASTYTRADE:
        return "Tastytrade";
      case BrokerType.SCHWAB:
        return "Charles Schwab";
      default:
        return type;
    }
  };
  
  // Render connection status indicator
  const renderConnectionStatus = (broker: BrokerCredentials) => {
    const status = broker.connection_status || BrokerConnectionStatus.DISCONNECTED;
    
    switch (status) {
      case BrokerConnectionStatus.CONNECTED:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" /> Connected
          </span>
        );
      case BrokerConnectionStatus.DISCONNECTED:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <XCircle className="h-3 w-3 mr-1" /> Disconnected
          </span>
        );
      case BrokerConnectionStatus.CONNECTING:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1 animate-spin" /> Connecting
          </span>
        );
      case BrokerConnectionStatus.ERROR:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800" title={broker.connection_error || "Error connecting to broker"}>
            <AlertTriangle className="h-3 w-3 mr-1" /> Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="h-3 w-3 mr-1" /> Unknown
          </span>
        );
    }
  };

  // Check if a broker's health was checked recently (within 2 minutes)
  const isHealthCheckRecent = (broker: BrokerCredentials) => {
    if (!broker.last_connection_check) return false;
    
    const lastCheck = new Date(broker.last_connection_check);
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    return lastCheck > twoMinutesAgo;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Broker Accounts</h1>
            <p className="text-muted-foreground">
              Manage your broker connections and credentials
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refreshBrokerData}
              disabled={isLoadingAccounts}
              className="flex items-center"
              type="button"
            >
              {isLoadingAccounts ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} type="button">
                  <Plus className="mr-2 h-4 w-4" /> Add Broker
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Connect Broker Account</DialogTitle>
                    <DialogDescription>
                      Enter your broker credentials to connect your account.
                      {formData.broker_type === BrokerType.TASTYTRADE ? (
                        " Provide your Tastytrade username and password."
                      ) : (
                        " You will be redirected to Schwab to authorize the connection."
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {validationError && (
                    <Alert variant="destructive" className="my-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {submitSuccess && (
                    <Alert className="my-4 bg-green-50 border-green-200 text-green-800">
                      <Check className="h-4 w-4" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>
                        Broker account connected successfully!
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Account Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="My Trading Account"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="broker_type" className="text-right">
                        Broker
                      </Label>
                      <div className="col-span-3">
                        <Select
                          value={formData.broker_type}
                          onValueChange={handleSelectChange}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id="broker_type">
                            <SelectValue placeholder="Select broker" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BrokerType.TASTYTRADE}>
                              Tastytrade
                            </SelectItem>
                            <SelectItem value={BrokerType.SCHWAB}>
                              Charles Schwab
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {formData.broker_type === BrokerType.TASTYTRADE ? (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="username" className="text-right">
                            Username
                          </Label>
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="col-span-3"
                            placeholder="Your Tastytrade username"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="password" className="text-right">
                            Password
                          </Label>
                          <div className="col-span-3 relative">
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={handleInputChange}
                              className="pr-10"
                              placeholder="Your Tastytrade password"
                              disabled={isSubmitting}
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="client_id" className="text-right">
                            Client ID
                          </Label>
                          <Input
                            id="client_id"
                            name="client_id"
                            value={formData.client_id}
                            onChange={handleInputChange}
                            className="col-span-3"
                            placeholder="Schwab Client ID"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="client_secret" className="text-right">
                            Client Secret
                          </Label>
                          <div className="col-span-3 relative">
                            <Input
                              id="client_secret"
                              name="client_secret"
                              type={showPassword ? "text" : "password"}
                              value={formData.client_secret}
                              onChange={handleInputChange}
                              className="pr-10"
                              placeholder="Schwab Client Secret"
                              disabled={isSubmitting}
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="redirect_uri" className="text-right">
                            Redirect URI
                          </Label>
                          <Input
                            id="redirect_uri"
                            name="redirect_uri"
                            value={formData.redirect_uri}
                            onChange={handleInputChange}
                            className="col-span-3"
                            placeholder="https://yourapp.com/callback"
                            disabled={isSubmitting}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting 
                        ? "Connecting..." 
                        : formData.broker_type === BrokerType.TASTYTRADE 
                          ? "Connect Broker"
                          : "Authorize with Schwab"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connected Brokers</CardTitle>
            <CardDescription>
              Your broker connections and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-md" />
                ))}
              </div>
            ) : brokerCredentials.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Username/Client ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Connected On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brokerCredentials.map((broker) => (
                    <TableRow key={broker.id}>
                      <TableCell className="font-medium">{broker.name}</TableCell>
                      <TableCell>
                        {getBrokerTypeDisplay(broker.broker_type)}
                      </TableCell>
                      <TableCell>
                        {broker.broker_type === BrokerType.TASTYTRADE
                          ? broker.username
                          : broker.client_id}
                      </TableCell>
                      <TableCell>
                        {renderConnectionStatus(broker)}
                      </TableCell>
                      <TableCell>
                        {broker.created_at 
                          ? new Date(broker.created_at).toLocaleDateString() 
                          : "Unknown"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => broker.id && checkBrokerHealth(broker.id)}
                            title="Check connection"
                            type="button"
                          >
                            <RefreshCw className={`h-4 w-4 ${isHealthCheckRecent(broker) ? 'text-green-500' : 'text-gray-500'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => broker.id && handleDeleteBroker(broker.id)}
                            disabled={isDeleting === broker.id}
                            title="Disconnect broker"
                            type="button"
                          >
                            {isDeleting === broker.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 border rounded-md bg-gray-50">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <DatabaseIcon className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Brokers Connected</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  You haven't connected any broker accounts yet. Add your first broker to start trading.
                </p>
                <Button onClick={() => setIsDialogOpen(true)} type="button">
                  <Plus className="mr-2 h-4 w-4" /> Add Broker
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground border-t pt-6 flex items-start gap-2">
            <CircleAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p>Only connect to real broker accounts with valid credentials.</p>
              <p className="mt-1">
                <span className="font-semibold">Tastytrade:</span> Direct username/password authentication
              </p>
              <p className="mt-1">
                <span className="font-semibold">Schwab:</span> OAuth2 authentication flow with redirect
              </p>
            </div>
          </CardFooter>
        </Card>

        {brokerAccounts.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Linked Trading Accounts</CardTitle>
              <CardDescription>
                Trading accounts associated with your broker connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account ID</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Buying Power</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brokerAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.account_id}</TableCell>
                      <TableCell>{account.account_name}</TableCell>
                      <TableCell>{account.account_type}</TableCell>
                      <TableCell>${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>${account.buying_power.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          account.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {account.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Confirmation dialog for delete */}
      <Dialog 
        open={confirmDeleteDialog.open} 
        onOpenChange={(open) => setConfirmDeleteDialog({ ...confirmDeleteDialog, open })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Disconnect</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect this broker? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDeleteDialog({ open: false, brokerId: null })}
              disabled={isDeleting !== null}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteBroker}
              disabled={isDeleting !== null}
              type="button"
            >
              {isDeleting !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Disconnecting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" /> Disconnect
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

const Check = ({ className }: { className?: string }) => (
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
);

const DatabaseIcon = ({ className }: { className?: string }) => (
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
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export default BrokerAccounts;
