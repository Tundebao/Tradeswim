
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Main Platform Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Symbols from "./pages/Symbols";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import BrokerAccounts from "./pages/admin/BrokerAccounts";
import ManualTrade from "./pages/admin/ManualTrade";
import CopySettings from "./pages/admin/CopySettings";
import Positions from "./pages/admin/Positions";
import Trades from "./pages/admin/Trades";
import Notifications from "./pages/admin/Notifications";
import AdminSettings from "./pages/admin/Settings";
import Logs from "./pages/admin/Logs";
import AdminSymbols from "./pages/admin/Symbols";

import NotFound from "./pages/NotFound";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Main Platform Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/symbols" element={<Symbols />} />
            
            {/* Admin Panel Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/accounts" element={<BrokerAccounts />} />
            <Route path="/admin/manual-trade" element={<ManualTrade />} />
            <Route path="/admin/copy-settings" element={<CopySettings />} />
            <Route path="/admin/positions" element={<Positions />} />
            <Route path="/admin/trades" element={<Trades />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/logs" element={<Logs />} />
            <Route path="/admin/symbols" element={<AdminSymbols />} />
            
            {/* Catch-all route - 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
