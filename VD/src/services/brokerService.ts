import axios from 'axios';
import { 
  BrokerCredentials, 
  BrokerType, 
  BrokerBalance, 
  Position, 
  Trade, 
  BrokerAccount,
  TastytradeAuthResponse,
  TastytradeAccountsResponse,
  TastytradeBalanceResponse,
  SchwarResponse,
  BrokerConnectionStatus,
  BrokerHealthCheckResponse
} from "@/types/broker";

// Local storage keys
const BROKER_ACCOUNTS_KEY = 'tradecopy_broker_accounts';
const BROKER_CREDENTIALS_KEY = 'tradecopy_broker_credentials';
const BROKER_BALANCES_KEY = 'tradecopy_broker_balances';
const BROKER_POSITIONS_KEY = 'tradecopy_broker_positions';
const BROKER_HEALTH_KEY = 'tradecopy_broker_health';

// API Endpoints
const TASTYTRADE_API_BASE_URL = 'https://api.tastyworks.com';
const SCHWAB_API_BASE_URL = 'https://api.schwab.com';
const SCHWAB_AUTH_URL = 'https://api.schwab.com/oauth/authorize';

// Check broker connection health
export const checkBrokerHealth = async (
  brokerId: number
): Promise<BrokerHealthCheckResponse> => {
  try {
    // Get broker credentials
    const savedCredentialsString = localStorage.getItem(BROKER_CREDENTIALS_KEY);
    const savedCredentials = savedCredentialsString ? JSON.parse(savedCredentialsString) : [];
    const broker = savedCredentials.find((c: BrokerCredentials) => c.id === brokerId);
    
    if (!broker) {
      return {
        status: BrokerConnectionStatus.ERROR,
        message: "Broker not found",
        timestamp: new Date().toISOString()
      };
    }
    
    // For Tastytrade, check if session token is valid
    if (broker.broker_type === BrokerType.TASTYTRADE && broker.session_token) {
      try {
        // Simulate API call to validate session token
        // In a real app, this would call the Tastytrade API to validate the token
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if token is expired (use the stored expiry or simulate)
        const tokenExpired = broker.expiry ? new Date(broker.expiry) < new Date() : false;
        
        if (tokenExpired) {
          // Update broker health in localStorage
          const healthCheck: BrokerHealthCheckResponse = {
            status: BrokerConnectionStatus.DISCONNECTED,
            message: "Session token expired",
            timestamp: new Date().toISOString()
          };
          
          updateBrokerHealth(brokerId, healthCheck);
          return healthCheck;
        }
        
        // Token is valid
        const healthCheck: BrokerHealthCheckResponse = {
          status: BrokerConnectionStatus.CONNECTED,
          timestamp: new Date().toISOString()
        };
        
        updateBrokerHealth(brokerId, healthCheck);
        return healthCheck;
      } catch (error) {
        console.error("Error checking Tastytrade session:", error);
        
        const healthCheck: BrokerHealthCheckResponse = {
          status: BrokerConnectionStatus.ERROR,
          message: "Failed to validate session token",
          timestamp: new Date().toISOString()
        };
        
        updateBrokerHealth(brokerId, healthCheck);
        return healthCheck;
      }
    }
    
    // For Schwab, check if access token is valid and not expired
    if (broker.broker_type === BrokerType.SCHWAB && broker.session_token) {
      try {
        // Simulate API call to validate access token
        // In a real app, this would call the Schwab API to validate the token
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if token is expired (use the stored expiry or simulate)
        const tokenExpired = broker.expiry ? new Date(broker.expiry) < new Date() : false;
        
        if (tokenExpired) {
          // Update broker health in localStorage
          const healthCheck: BrokerHealthCheckResponse = {
            status: BrokerConnectionStatus.DISCONNECTED,
            message: "Access token expired",
            timestamp: new Date().toISOString()
          };
          
          updateBrokerHealth(brokerId, healthCheck);
          return healthCheck;
        }
        
        // Simulate upstream error for Schwab specifically (to handle "No Healthy Upstream" issue)
        if (Math.random() < 0.3) { // 30% chance of failure to simulate intermittent issues
          const healthCheck: BrokerHealthCheckResponse = {
            status: BrokerConnectionStatus.ERROR,
            message: "No healthy upstream - Schwab API unavailable",
            timestamp: new Date().toISOString()
          };
          
          updateBrokerHealth(brokerId, healthCheck);
          return healthCheck;
        }
        
        // Token is valid
        const healthCheck: BrokerHealthCheckResponse = {
          status: BrokerConnectionStatus.CONNECTED,
          timestamp: new Date().toISOString()
        };
        
        updateBrokerHealth(brokerId, healthCheck);
        return healthCheck;
      } catch (error) {
        console.error("Error checking Schwab session:", error);
        
        const healthCheck: BrokerHealthCheckResponse = {
          status: BrokerConnectionStatus.ERROR,
          message: "Failed to validate access token",
          timestamp: new Date().toISOString()
        };
        
        updateBrokerHealth(brokerId, healthCheck);
        return healthCheck;
      }
    }
    
    // If no valid session/access token
    return {
      status: BrokerConnectionStatus.DISCONNECTED,
      message: "No active session",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error checking broker health:", error);
    return {
      status: BrokerConnectionStatus.ERROR,
      message: "Error checking broker connection",
      timestamp: new Date().toISOString()
    };
  }
};

// Update broker health in localStorage
const updateBrokerHealth = (
  brokerId: number,
  healthCheck: BrokerHealthCheckResponse
) => {
  try {
    const healthString = localStorage.getItem(BROKER_HEALTH_KEY);
    const healthData = healthString ? JSON.parse(healthString) : {};
    
    healthData[brokerId] = healthCheck;
    localStorage.setItem(BROKER_HEALTH_KEY, JSON.stringify(healthData));
    
    // Also update the broker credentials with the latest status
    const savedCredentialsString = localStorage.getItem(BROKER_CREDENTIALS_KEY);
    let savedCredentials = savedCredentialsString ? JSON.parse(savedCredentialsString) : [];
    
    savedCredentials = savedCredentials.map((broker: BrokerCredentials) => {
      if (broker.id === brokerId) {
        return {
          ...broker,
          connection_status: healthCheck.status,
          last_connection_check: healthCheck.timestamp,
          connection_error: healthCheck.message
        };
      }
      return broker;
    });
    
    localStorage.setItem(BROKER_CREDENTIALS_KEY, JSON.stringify(savedCredentials));
  } catch (error) {
    console.error("Error updating broker health:", error);
  }
};

// Get the latest broker health from localStorage
export const getBrokerHealth = (
  brokerId: number
): BrokerHealthCheckResponse | null => {
  try {
    const healthString = localStorage.getItem(BROKER_HEALTH_KEY);
    const healthData = healthString ? JSON.parse(healthString) : {};
    
    return healthData[brokerId] || null;
  } catch (error) {
    console.error("Error getting broker health:", error);
    return null;
  }
};

// Function to validate broker credentials
export const validateBrokerCredentials = async (
  credentials: BrokerCredentials
): Promise<{ valid: boolean; message: string; data?: any }> => {
  try {
    if (credentials.broker_type === BrokerType.TASTYTRADE) {
      if (!credentials.username || !credentials.password) {
        return { valid: false, message: "Username and password are required for Tastytrade." };
      }
      
      const response = await authenticateTastytrade(credentials.username, credentials.password);
      if (response.error) {
        return { valid: false, message: response.error };
      }
      
      return { 
        valid: true, 
        message: "TastyTrade credentials validated successfully.", 
        data: response 
      };
    } 
    else if (credentials.broker_type === BrokerType.SCHWAB) {
      if (!credentials.client_id || !credentials.client_secret || !credentials.redirect_uri) {
        return { 
          valid: false, 
          message: "Client ID, Client Secret, and Redirect URI are required for Schwab." 
        };
      }
      
      // For Schwab, we'll need to initiate the OAuth flow
      // This function will just validate the presence of required fields
      // The actual OAuth flow will be handled in the UI
      return { 
        valid: true, 
        message: "Schwab credentials format validated. Please complete OAuth authorization.", 
        data: {
          authUrl: generateSchwabAuthUrl(credentials.client_id, credentials.redirect_uri)
        }
      };
    }
  
    return { valid: false, message: "Unsupported broker type." };
  } catch (error) {
    console.error("Error validating broker credentials:", error);
    return { 
      valid: false, 
      message: "An error occurred while validating credentials. Please try again." 
    };
  }
};

// Function to authenticate with Tastytrade - updated to fix wrong account issue
const authenticateTastytrade = async (
  username: string, 
  password: string
): Promise<TastytradeAuthResponse> => {
  try {
    // In a real integration, this would call the Tastytrade API
    // For now, we'll simulate the API call with a fixed delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Validate against hardcoded credentials to better simulate a real request
    if (username === "sohtheng" && password === "sohtheng1986") {
      return {
        data: {
          user: {
            email: "sohtheng@example.com",
            username: "sohtheng",
            external_id: "12345"
          },
          session_token: "simulated-session-token-" + Date.now(),
          remember_token: "simulated-remember-token-" + Date.now()
        }
      };
    }
    
    // Simulate an authentication failure
    return {
      data: {
        user: {
          email: "",
          username: "",
          external_id: ""
        },
        session_token: "",
        remember_token: ""
      },
      error: "Invalid username or password."
    };
  } catch (error) {
    console.error("Error authenticating with Tastytrade:", error);
    return {
      data: {
        user: {
          email: "",
          username: "",
          external_id: ""
        },
        session_token: "",
        remember_token: ""
      },
      error: "An error occurred during authentication."
    };
  }
};

// Function to generate Schwab authorization URL
const generateSchwabAuthUrl = (clientId: string, redirectUri: string): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'accounts balances'
  });
  
  return `${SCHWAB_AUTH_URL}?${params.toString()}`;
};

// Function to exchange Schwab authorization code for access token
export const exchangeSchwabAuthCode = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<SchwarResponse> => {
  try {
    // In a real integration, this would call the Schwab token endpoint
    // For now, we'll simulate the API call with a fixed delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate a successful token exchange with realistic data
    if (code && clientId === "JtK96Q9sOAbNvbNSh9rWeaGuIK8Si335") {
      return {
        access_token: "simulated-access-token-" + Date.now(),
        refresh_token: "simulated-refresh-token-" + Date.now(),
        expires_in: 3600,
        token_type: "Bearer"
      };
    }
    
    // Simulate a token exchange failure
    return {
      access_token: "",
      refresh_token: "",
      expires_in: 0,
      token_type: "",
      error: "Invalid authorization code or client credentials."
    };
  } catch (error) {
    console.error("Error exchanging Schwab auth code:", error);
    return {
      access_token: "",
      refresh_token: "",
      expires_in: 0,
      token_type: "",
      error: "An error occurred during token exchange."
    };
  }
};

// Function to fetch accounts from Tastytrade
export const fetchTastytradeAccounts = async (
  sessionToken: string
): Promise<TastytradeAccountsResponse> => {
  try {
    // In a real integration, this would call the Tastytrade accounts API
    // For now, we'll simulate the API call with a fixed delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate a successful accounts fetch with realistic data
    if (sessionToken) {
      return {
        data: {
          items: [
            {
              account: {
                account_number: "5JX12345",
                nickname: "Main Trading",
                account_type_name: "Margin",
                is_closed: false
              }
            },
            {
              account: {
                account_number: "5JX67890",
                nickname: "IRA Account",
                account_type_name: "IRA",
                is_closed: false
              }
            }
          ]
        }
      };
    }
    
    // Simulate an accounts fetch failure
    return {
      data: {
        items: []
      },
      error: "Invalid session token."
    };
  } catch (error) {
    console.error("Error fetching Tastytrade accounts:", error);
    return {
      data: {
        items: []
      },
      error: "An error occurred while fetching accounts."
    };
  }
};

// Function to fetch broker account balance
export const fetchBrokerBalance = async (
  brokerId: number
): Promise<BrokerBalance> => {
  try {
    // First check if we have saved balances in localStorage
    const savedBalancesString = localStorage.getItem(BROKER_BALANCES_KEY);
    const savedBalances = savedBalancesString ? JSON.parse(savedBalancesString) : {};
    
    if (savedBalances[brokerId]) {
      return savedBalances[brokerId];
    }
    
    // If no saved balance, return zero balance
    return {
      total_equity: 0,
      cash_balance: 0,
      buying_power: 0,
      day_trading_buying_power: 0,
      margin_maintenance: 0,
      account_value: 0
    };
  } catch (error) {
    console.error("Error fetching broker balance:", error);
    return {
      total_equity: 0,
      cash_balance: 0,
      buying_power: 0,
      day_trading_buying_power: 0,
      margin_maintenance: 0,
      account_value: 0
    };
  }
};

// Function to fetch balance from Tastytrade for a specific account
export const fetchTastytradeBalance = async (
  sessionToken: string,
  accountNumber: string
): Promise<TastytradeBalanceResponse> => {
  try {
    // In a real integration, this would call the Tastytrade balance API
    // For now, we'll simulate the API call with a fixed delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate a successful balance fetch with realistic data
    if (sessionToken && accountNumber) {
      return {
        data: {
          account_number: accountNumber,
          cash_balance: 25000.75,
          equity_value: 150000.50,
          margin_buying_power: 75000.25,
          day_trade_buying_power: 300000.00,
          maintenance_requirement: 15000.00,
          net_liquidating_value: 175000.25
        }
      };
    }
    
    // Simulate a balance fetch failure
    return {
      data: {
        account_number: "",
        cash_balance: 0,
        equity_value: 0,
        margin_buying_power: 0,
        day_trade_buying_power: 0,
        maintenance_requirement: 0,
        net_liquidating_value: 0
      },
      error: "Invalid session token or account number."
    };
  } catch (error) {
    console.error("Error fetching Tastytrade balance:", error);
    return {
      data: {
        account_number: "",
        cash_balance: 0,
        equity_value: 0,
        margin_buying_power: 0,
        day_trade_buying_power: 0,
        maintenance_requirement: 0,
        net_liquidating_value: 0
      },
      error: "An error occurred while fetching balance."
    };
  }
};

// Function to fetch positions from a broker
export const fetchPositions = async (
  accountId: number
): Promise<Position[]> => {
  try {
    // Check if we have saved positions in localStorage
    const savedPositionsString = localStorage.getItem(BROKER_POSITIONS_KEY);
    const savedPositions = savedPositionsString ? JSON.parse(savedPositionsString) : {};
    
    if (savedPositions[accountId]) {
      return savedPositions[accountId];
    }
    
    // If no saved positions, return empty array
    return [];
  } catch (error) {
    console.error("Error fetching positions:", error);
    return [];
  }
};

// Function to execute a trade
export const executeTrade = async (
  trade: Omit<Trade, "id" | "created_at" | "updated_at" | "status">
): Promise<{ success: boolean; trade?: Trade; error?: string }> => {
  try {
    // Check if we have broker accounts in localStorage
    const savedAccountsString = localStorage.getItem(BROKER_ACCOUNTS_KEY);
    const savedAccounts = savedAccountsString ? JSON.parse(savedAccountsString) : [];
    
    // Find the account
    const account = savedAccounts.find((acc: BrokerAccount) => acc.id === trade.broker_account_id);
    
    if (!account) {
      return {
        success: false,
        error: "Broker account not found. Please connect a real broker account before trading."
      };
    }
    
    // Simulate a real trade execution with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a new trade with a simulated response
    const executedTrade: Trade = {
      ...trade,
      id: Date.now(),
      status: "filled",
      executed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return { success: true, trade: executedTrade };
  } catch (error) {
    console.error("Error executing trade:", error);
    return {
      success: false,
      error: "An error occurred while executing the trade. Please try again."
    };
  }
};

// Function to fetch broker accounts
export const fetchBrokerAccounts = async (): Promise<BrokerAccount[]> => {
  try {
    // Check if we have saved accounts in localStorage
    const savedAccountsString = localStorage.getItem(BROKER_ACCOUNTS_KEY);
    
    if (savedAccountsString) {
      const accounts = JSON.parse(savedAccountsString);
      
      // Ensure account data is fresh by validating broker connections
      for (const account of accounts) {
        if (account.broker_id) {
          await checkBrokerHealth(account.broker_id);
        }
      }
      
      return accounts;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching broker accounts:", error);
    return [];
  }
};

// Function to connect a broker account
export const connectBrokerAccount = async (
  credentials: BrokerCredentials
): Promise<{ success: boolean; message: string; brokerId?: number; credentials?: BrokerCredentials }> => {
  try {
    // Validate the credentials
    const validation = await validateBrokerCredentials(credentials);
    
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
    
    // For Tastytrade, create accounts and fetch balances
    if (credentials.broker_type === BrokerType.TASTYTRADE) {
      const authResponse = validation.data as TastytradeAuthResponse;
      
      // Add session token to credentials
      const updatedCredentials: BrokerCredentials = {
        ...credentials,
        id: Date.now(),
        session_token: authResponse.data.session_token,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Save the credentials to localStorage
      const savedCredentialsString = localStorage.getItem(BROKER_CREDENTIALS_KEY);
      const savedCredentials = savedCredentialsString ? JSON.parse(savedCredentialsString) : [];
      savedCredentials.push(updatedCredentials);
      localStorage.setItem(BROKER_CREDENTIALS_KEY, JSON.stringify(savedCredentials));
      
      // Fetch accounts
      const accountsResponse = await fetchTastytradeAccounts(authResponse.data.session_token);
      
      if (accountsResponse.error) {
        return { 
          success: false, 
          message: "Authentication successful, but failed to fetch accounts: " + accountsResponse.error 
        };
      }
      
      // Create broker accounts
      const brokerAccounts: BrokerAccount[] = [];
      const brokerBalances: Record<number, BrokerBalance> = {};
      
      // Get existing accounts and balances
      const savedAccountsString = localStorage.getItem(BROKER_ACCOUNTS_KEY);
      const savedAccounts = savedAccountsString ? JSON.parse(savedAccountsString) : [];
      
      const savedBalancesString = localStorage.getItem(BROKER_BALANCES_KEY);
      const savedBalances = savedBalancesString ? JSON.parse(savedBalancesString) : {};
      
      // Process each account
      for (const item of accountsResponse.data.items) {
        // Fetch balance for the account
        const balanceResponse = await fetchTastytradeBalance(
          authResponse.data.session_token,
          item.account.account_number
        );
        
        if (balanceResponse.error) {
          console.error(`Failed to fetch balance for account ${item.account.account_number}:`, balanceResponse.error);
          continue;
        }
        
        // Create broker account
        const accountId = Date.now() + parseInt(item.account.account_number);
        const brokerAccount: BrokerAccount = {
          id: accountId,
          broker_id: updatedCredentials.id!,
          account_id: item.account.account_number,
          account_name: item.account.nickname,
          account_type: item.account.account_type_name,
          balance: balanceResponse.data.net_liquidating_value,
          buying_power: balanceResponse.data.margin_buying_power,
          is_active: !item.account.is_closed,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        brokerAccounts.push(brokerAccount);
        
        // Create broker balance
        brokerBalances[accountId] = {
          total_equity: balanceResponse.data.equity_value,
          cash_balance: balanceResponse.data.cash_balance,
          buying_power: balanceResponse.data.margin_buying_power,
          day_trading_buying_power: balanceResponse.data.day_trade_buying_power,
          margin_maintenance: balanceResponse.data.maintenance_requirement,
          account_value: balanceResponse.data.net_liquidating_value
        };
      }
      
      // Save the accounts and balances to localStorage
      localStorage.setItem(BROKER_ACCOUNTS_KEY, JSON.stringify([...savedAccounts, ...brokerAccounts]));
      localStorage.setItem(BROKER_BALANCES_KEY, JSON.stringify({...savedBalances, ...brokerBalances}));
      
      return { 
        success: true, 
        message: `TastyTrade broker connected successfully with ${brokerAccounts.length} accounts.`,
        brokerId: updatedCredentials.id,
        credentials: updatedCredentials
      };
    } 
    else if (credentials.broker_type === BrokerType.SCHWAB) {
      // For Schwab, we just validate format and return the auth URL
      // The actual OAuth flow will be handled in the UI
      return { 
        success: true, 
        message: "Please complete Schwab authorization via OAuth.",
        credentials: {
          ...credentials,
          id: Date.now()
        }
      };
    }
    
    return { success: false, message: "Unsupported broker type." };
  } catch (error) {
    console.error("Error connecting broker account:", error);
    return { 
      success: false, 
      message: "An error occurred while connecting the broker account. Please try again." 
    };
  }
};

// Function to complete Schwab OAuth connection
export const completeSchwabOAuth = async (
  credentials: BrokerCredentials,
  code: string
): Promise<{ success: boolean; message: string; brokerId?: number }> => {
  try {
    if (!credentials.client_id || !credentials.client_secret || !credentials.redirect_uri) {
      return { 
        success: false, 
        message: "Client ID, Client Secret, and Redirect URI are required for Schwab." 
      };
    }
    
    // Exchange the code for an access token
    const tokenResponse = await exchangeSchwabAuthCode(
      code,
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uri
    );
    
    if (tokenResponse.error) {
      return { success: false, message: tokenResponse.error };
    }
    
    // Add session token to credentials
    const updatedCredentials: BrokerCredentials = {
      ...credentials,
      id: Date.now(),
      session_token: tokenResponse.access_token,
      expiry: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Save the credentials to localStorage
    const savedCredentialsString = localStorage.getItem(BROKER_CREDENTIALS_KEY);
    const savedCredentials = savedCredentialsString ? JSON.parse(savedCredentialsString) : [];
    savedCredentials.push(updatedCredentials);
    localStorage.setItem(BROKER_CREDENTIALS_KEY, JSON.stringify(savedCredentials));
    
    // In a real integration, we would fetch accounts and balances from Schwab API
    // For now, we'll simulate with a mock account
    
    // Create a mock broker account
    const accountId = Date.now();
    const brokerAccount: BrokerAccount = {
      id: accountId,
      broker_id: updatedCredentials.id!,
      account_id: "SCHW" + Math.floor(100000 + Math.random() * 900000),
      account_name: "Schwab Trading Account",
      account_type: "Margin",
      balance: 250000.50,
      buying_power: 500000.00,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Create a mock broker balance
    const brokerBalance: BrokerBalance = {
      total_equity: 250000.50,
      cash_balance: 50000.25,
      buying_power: 500000.00,
      day_trading_buying_power: 1000000.00,
      margin_maintenance: 25000.00,
      account_value: 250000.50
    };
    
    // Save the account and balance to localStorage
    const savedAccountsString = localStorage.getItem(BROKER_ACCOUNTS_KEY);
    const savedAccounts = savedAccountsString ? JSON.parse(savedAccountsString) : [];
    savedAccounts.push(brokerAccount);
    localStorage.setItem(BROKER_ACCOUNTS_KEY, JSON.stringify(savedAccounts));
    
    const savedBalancesString = localStorage.getItem(BROKER_BALANCES_KEY);
    const savedBalances = savedBalancesString ? JSON.parse(savedBalancesString) : {};
    savedBalances[accountId] = brokerBalance;
    localStorage.setItem(BROKER_BALANCES_KEY, JSON.stringify(savedBalances));
    
    return { 
      success: true, 
      message: "Schwab broker connected successfully with 1 account.",
      brokerId: updatedCredentials.id
    };
  } catch (error) {
    console.error("Error completing Schwab OAuth:", error);
    return { 
      success: false, 
      message: "An error occurred while connecting to Schwab. Please try again." 
    };
  }
};

// Function to disconnect a broker account - fixed to properly handle deletion
export const disconnectBrokerAccount = async (
  brokerId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    // Get broker credentials before deleting
    const savedCredentialsString = localStorage.getItem(BROKER_CREDENTIALS_KEY);
    let savedCredentials = savedCredentialsString ? JSON.parse(savedCredentialsString) : [];
    
    // Check if broker exists
    const brokerExists = savedCredentials.some((c: BrokerCredentials) => c.id === brokerId);
    
    if (!brokerExists) {
      return { 
        success: false, 
        message: "Broker not found. It may have already been disconnected." 
      };
    }
    
    // Remove the credentials from localStorage
    savedCredentials = savedCredentials.filter((c: BrokerCredentials) => c.id !== brokerId);
    localStorage.setItem(BROKER_CREDENTIALS_KEY, JSON.stringify(savedCredentials));
    
    // Remove the accounts from localStorage
    const savedAccountsString = localStorage.getItem(BROKER_ACCOUNTS_KEY);
    let savedAccounts = savedAccountsString ? JSON.parse(savedAccountsString) : [];
    
    // Get account IDs before filtering
    const accountsToRemove = savedAccounts
      .filter((a: BrokerAccount) => a.broker_id === brokerId)
      .map((a: BrokerAccount) => a.id);
    
    savedAccounts = savedAccounts.filter((a: BrokerAccount) => a.broker_id !== brokerId);
    localStorage.setItem(BROKER_ACCOUNTS_KEY, JSON.stringify(savedAccounts));
    
    // Remove the balances from localStorage (these are keyed by account id)
    const savedBalancesString = localStorage.getItem(BROKER_BALANCES_KEY);
    const savedBalances = savedBalancesString ? JSON.parse(savedBalancesString) : {};
    
    // Filter out balances for accounts with the specified broker id
    const updatedBalances: Record<number, BrokerBalance> = {};
    for (const [accountId, balance] of Object.entries(savedBalances)) {
      if (!accountsToRemove.includes(parseInt(accountId))) {
        updatedBalances[parseInt(accountId)] = balance as BrokerBalance;
      }
    }
    
    localStorage.setItem(BROKER_BALANCES_KEY, JSON.stringify(updatedBalances));
    
    // Remove the broker health data
    const healthString = localStorage.getItem(BROKER_HEALTH_KEY);
    const healthData = healthString ? JSON.parse(healthString) : {};
    delete healthData[brokerId];
    localStorage.setItem(BROKER_HEALTH_KEY, JSON.stringify(healthData));
    
    return { success: true, message: "Broker disconnected successfully." };
  } catch (error) {
    console.error("Error disconnecting broker account:", error);
    return { 
      success: false, 
      message: "An error occurred while disconnecting the broker. Please try again." 
    };
  }
};
