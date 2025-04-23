// Broker types and interfaces

export enum BrokerType {
  TASTYTRADE = "tastytrade",
  SCHWAB = "schwab",
}

export enum BrokerConnectionStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  ERROR = "error",
}

export interface BrokerCredentials {
  id?: number
  name: string
  broker_type: BrokerType
  api_key?: string
  api_secret?: string
  username?: string
  password?: string
  client_id?: string
  client_secret?: string
  redirect_uri?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
  session_token?: string
  expiry?: string
  connection_status?: BrokerConnectionStatus
  last_connection_check?: string
  connection_error?: string
}

export interface BrokerAccount {
  id?: number
  broker_id: number
  account_id: string
  account_name: string
  account_type: string
  balance: number
  buying_power: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface BrokerBalance {
  total_equity: number
  cash_balance: number
  buying_power: number
  day_trading_buying_power?: number
  margin_maintenance?: number
  account_value?: number
}

export interface Position {
  symbol: string
  quantity: number
  average_price: number
  current_price: number
  unrealized_pnl: number
  unrealized_pnl_percent: number
  value: number
  type: "stock" | "option"
  expiration_date?: string
  strike_price?: number
  option_type?: "call" | "put"
  broker_account_id: number
}

export interface Trade {
  id?: number
  broker_account_id: number
  symbol: string
  quantity: number
  price: number
  side: "buy" | "sell"
  order_type: "market" | "limit"
  limit_price?: number
  status: "pending" | "filled" | "canceled" | "rejected"
  type: "manual" | "copy"
  executed_at?: string
  created_at?: string
  updated_at?: string
  execution_details?: string
  is_option: boolean
  option_details?: {
    expiration_date: string
    strike_price: number
    option_type: "call" | "put"
  }
}

export interface CopyTradingSettings {
  id?: number
  is_active: boolean
  allocation_type: "fixed" | "percentage" | "mirror"
  fixed_amount?: number
  percentage?: number
  max_trade_size?: number
  max_percentage_per_trade?: number
  enable_stop_loss: boolean
  stop_loss_percentage?: number
  created_at?: string
  updated_at?: string
}

// Auth responses
export interface TastytradeAuthResponse {
  data: {
    user: {
      email: string
      username: string
      external_id: string
    }
    session_token: string
    remember_token: string
  }
  error?: string
}

export interface TastytradeAccountsResponse {
  data: {
    items: {
      account: {
        account_number: string
        nickname: string
        account_type_name: string
        is_closed: boolean
      }
    }[]
  }
  error?: string
}

export interface TastytradeBalanceResponse {
  data: {
    account_number: string
    cash_balance: number
    equity_value: number
    margin_buying_power: number
    day_trade_buying_power: number
    maintenance_requirement: number
    net_liquidating_value: number
  }
  error?: string
}

export interface SchwarResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  error?: string
}

// New response type for broker health check
export interface BrokerHealthCheckResponse {
  status: BrokerConnectionStatus
  message?: string
  timestamp: string
}
