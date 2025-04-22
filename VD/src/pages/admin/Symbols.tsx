
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Label } from "@/components/ui/label";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Check, 
  Loader2, 
  Pencil, 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  Database 
} from "lucide-react";

interface WatchlistSymbol {
  id: number;
  symbol: string;
  name: string;
  exchange: string;
  type: "stock" | "option";
  sector?: string;
  notes?: string;
  isActive: boolean;
  dateAdded: string;
}

const AdminSymbols = () => {
  const [symbols, setSymbols] = useState<WatchlistSymbol[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<WatchlistSymbol | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    exchange: "NYSE",
    type: "stock",
    sector: "",
    notes: "",
    isActive: true,
  });

  useEffect(() => {
    // Simulate loading symbols
    setTimeout(() => {
      const mockSymbols: WatchlistSymbol[] = [
        {
          id: 1,
          symbol: "AAPL",
          name: "Apple Inc.",
          exchange: "NASDAQ",
          type: "stock",
          sector: "Technology",
          notes: "Core tech holding",
          isActive: true,
          dateAdded: "2023-01-15",
        },
        {
          id: 2,
          symbol: "MSFT",
          name: "Microsoft Corporation",
          exchange: "NASDAQ",
          type: "stock",
          sector: "Technology",
          isActive: true,
          dateAdded: "2023-01-15",
        },
        {
          id: 3,
          symbol: "AMZN",
          name: "Amazon.com Inc.",
          exchange: "NASDAQ",
          type: "stock",
          sector: "Consumer Cyclical",
          isActive: true,
          dateAdded: "2023-02-20",
        },
        {
          id: 4,
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          exchange: "NASDAQ",
          type: "stock",
          sector: "Communication Services",
          isActive: true,
          dateAdded: "2023-02-20",
        },
        {
          id: 5,
          symbol: "SPY",
          name: "SPDR S&P 500 ETF Trust",
          exchange: "NYSE",
          type: "stock",
          sector: "ETF",
          notes: "S&P 500 index ETF",
          isActive: true,
          dateAdded: "2023-03-10",
        },
      ];
      
      setSymbols(mockSymbols);
      setIsLoading(false);
    }, 1000);
  }, []);

  const resetForm = () => {
    setFormData({
      symbol: "",
      name: "",
      exchange: "NYSE",
      type: "stock",
      sector: "",
      notes: "",
      isActive: true,
    });
    setError("");
    setSuccess("");
    setIsEditMode(false);
    setSelectedSymbol(null);
  };

  const handleOpenDialog = (symbol?: WatchlistSymbol) => {
    if (symbol) {
      setIsEditMode(true);
      setSelectedSymbol(symbol);
      setFormData({
        symbol: symbol.symbol,
        name: symbol.name,
        exchange: symbol.exchange,
        type: symbol.type,
        sector: symbol.sector || "",
        notes: symbol.notes || "",
        isActive: symbol.isActive,
      });
    } else {
      resetForm();
      setIsEditMode(false);
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const validateForm = () => {
    if (!formData.symbol.trim()) {
      setError("Symbol is required");
      return false;
    }
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateForm()) return;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isEditMode && selectedSymbol) {
      // Update existing symbol
      setSymbols(prev => 
        prev.map(s => 
          s.id === selectedSymbol.id 
            ? { 
                ...s, 
                symbol: formData.symbol,
                name: formData.name,
                exchange: formData.exchange,
                type: formData.type as "stock" | "option",
                sector: formData.sector,
                notes: formData.notes,
                isActive: formData.isActive
              } 
            : s
        )
      );
      setSuccess("Symbol updated successfully");
    } else {
      // Add new symbol
      const newSymbol: WatchlistSymbol = {
        id: Math.max(0, ...symbols.map(s => s.id)) + 1,
        symbol: formData.symbol,
        name: formData.name,
        exchange: formData.exchange,
        type: formData.type as "stock" | "option",
        sector: formData.sector,
        notes: formData.notes,
        isActive: formData.isActive,
        dateAdded: new Date().toISOString().split("T")[0],
      };
      
      setSymbols(prev => [newSymbol, ...prev]);
      setSuccess("Symbol added successfully");
    }
    
    // Close dialog after a short delay
    setTimeout(() => {
      setIsDialogOpen(false);
      resetForm();
    }, 1500);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this symbol?")) {
      setSymbols(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleToggleActive = (id: number) => {
    setSymbols(prev => 
      prev.map(s => 
        s.id === id ? { ...s, isActive: !s.isActive } : s
      )
    );
  };

  const filteredSymbols = symbols.filter(symbol => 
    symbol.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    symbol.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Symbols</h1>
            <p className="text-muted-foreground">
              Add and manage trading symbols and watchlists
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" /> Add Symbol
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "Edit Symbol" : "Add New Symbol"}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditMode
                      ? "Update the details for this symbol"
                      : "Add a new symbol to the watchlist"}
                  </DialogDescription>
                </DialogHeader>
                
                {error && (
                  <Alert variant="destructive" className="my-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="my-4 bg-green-50 border-green-200 text-green-800">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="symbol" className="text-right">
                      Symbol
                    </Label>
                    <Input
                      id="symbol"
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="e.g. AAPL"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="e.g. Apple Inc."
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="exchange" className="text-right">
                      Exchange
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.exchange}
                        onValueChange={(value) => handleSelectChange("exchange", value)}
                      >
                        <SelectTrigger id="exchange">
                          <SelectValue placeholder="Select exchange" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NYSE">NYSE</SelectItem>
                          <SelectItem value="NASDAQ">NASDAQ</SelectItem>
                          <SelectItem value="AMEX">AMEX</SelectItem>
                          <SelectItem value="OTC">OTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleSelectChange("type", value)}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stock">Stock</SelectItem>
                          <SelectItem value="option">Option</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sector" className="text-right">
                      Sector
                    </Label>
                    <Input
                      id="sector"
                      name="sector"
                      value={formData.sector}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="e.g. Technology"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="notes" className="text-right pt-2">
                      Notes
                    </Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="col-span-3 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Optional notes about this symbol"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isActive" className="text-right">
                      Active
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => handleCheckboxChange("isActive", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm text-gray-600">
                        Include in watchlist and trading
                      </label>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditMode ? "Update Symbol" : "Add Symbol"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Symbol Watchlist</CardTitle>
            <CardDescription>
              Manage symbols used in trading and copy trading
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-md" />
                ))}
              </div>
            ) : filteredSymbols.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Exchange</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSymbols.map((symbol) => (
                    <TableRow key={symbol.id}>
                      <TableCell className="font-medium">{symbol.symbol}</TableCell>
                      <TableCell>{symbol.name}</TableCell>
                      <TableCell>{symbol.exchange}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {symbol.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{symbol.sector || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={symbol.isActive ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {symbol.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{symbol.dateAdded}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(symbol.id)}
                            title={symbol.isActive ? "Deactivate" : "Activate"}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                symbol.isActive ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(symbol)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(symbol.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No symbols found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? `No results found for "${searchQuery}"`
                    : "You haven't added any symbols to your watchlist yet"}
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" /> Add Symbol
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Active symbols are available for trading and appear in watchlists
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminSymbols;
