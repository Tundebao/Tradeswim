// Number and currency formatters

/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a number with commas
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num)
}

/**
 * Format a percentage value
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

/**
 * Format PnL (Profit and Loss) with color indication
 */
export const formatPnL = (amount: number): { value: string; class: string } => {
  const formatted = formatCurrency(amount)
  const isPositive = amount > 0
  const isNegative = amount < 0

  let className = ""
  if (isPositive) {
    className = "text-success font-medium"
  } else if (isNegative) {
    className = "text-error font-medium"
  }

  return {
    value: isPositive ? `+${formatted}` : formatted,
    class: className,
  }
}

/**
 * Format a quantity for display
 */
export const formatQuantity = (quantity: number): string => {
  return Math.abs(quantity).toString()
}

/**
 * Format a price with specified decimals
 */
export const formatPrice = (price: number, decimals = 2): string => {
  return price.toFixed(decimals)
}
