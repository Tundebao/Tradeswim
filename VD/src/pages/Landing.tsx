
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-trading-navy dark:text-white mb-6">
          Professional Copy Trading Platform
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mb-12">
          Secure, real-time trading platform for stocks and options with live broker integrations.
          Designed for professional traders who demand reliability and performance.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate("/login")} 
            size="lg" 
            className="bg-trading-navy hover:bg-opacity-90 text-white px-8"
          >
            Admin Login <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Real Broker Integration</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect directly to Tastytrade or Charles Schwab. No demo accounts or paper trading.
            </p>
          </div>
          
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Live Copy Trading</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Execute trades across multiple accounts with configurable allocation strategies.
            </p>
          </div>
          
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Advanced Risk Controls</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Set maximum trade sizes, percentage limits, and emergency stop controls.
            </p>
          </div>
        </div>
        
        <p className="mt-24 text-sm text-gray-500 max-w-xl">
          This platform is for professional use only and requires valid broker credentials.
          No paper trading or simulations are provided.
        </p>
      </div>
    </div>
  );
};

export default Landing;
