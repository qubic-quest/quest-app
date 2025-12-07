"use client";

import { QubicPriceResult } from "./schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface QubicPriceCardProps {
  result: QubicPriceResult;
}

export function QubicPriceCard({ result }: QubicPriceCardProps) {
  if (!result.success || !result.currentPrice) {
    return (
      <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          {result.error || "Unable to fetch QUBIC price data"}
        </p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price < 0.000001) {
      return "$" + price.toFixed(8);
    }
    if (price < 0.01) {
      return "$" + price.toFixed(6);
    }
    return "$" + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return "$" + (num / 1e3).toFixed(2) + "K";
    return "$" + num.toFixed(2);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const isPositiveChange = (result.priceChangePercentage24h || 0) >= 0;
  const changeColor = isPositiveChange 
    ? "text-green-600 dark:text-green-400" 
    : "text-red-600 dark:text-red-400";

  return (
    <div className="my-4 rounded-lg border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b bg-linear-to-r from-blue-500/10 to-purple-500/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/qubic_logo_new.webp" alt="Qubic Logo" className="h-8 w-8 rounded-lg" />
            <div>
              <h3 className="font-semibold text-lg">QUBIC</h3>
              <p className="text-xs text-muted-foreground">Qubic Network</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </div>

      {/* Price Display */}
      <div className="p-6">
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-1">Current Price</div>
          <div className="flex items-baseline gap-3">
            <div className="text-4xl font-bold tracking-tight">
              {formatPrice(result.currentPrice)}
            </div>
            {result.priceChangePercentage24h !== null && (
              <div className={`text-lg font-semibold ${changeColor}`}>
                {isPositiveChange ? "+" : ""}
                {result.priceChangePercentage24h.toFixed(2)}%
              </div>
            )}
          </div>
          {result.priceChange24h !== null && (
            <div className={`text-sm ${changeColor} mt-1`}>
              {isPositiveChange ? "+" : ""}
              {formatPrice(Math.abs(result.priceChange24h))} (24h)
            </div>
          )}
        </div>

        {/* Price Chart */}
        {result.priceHistory && result.priceHistory.length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-3">Price History (7 Days)</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={result.priceHistory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatDate}
                  className="text-xs"
                  stroke="currentColor"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  tickFormatter={(value) => formatPrice(value)}
                  className="text-xs"
                  stroke="currentColor"
                  style={{ fontSize: "12px" }}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), "Price"]}
                  labelFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isPositiveChange ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Market Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          {result.marketCap !== null && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
              <div className="text-sm font-medium">
                {formatLargeNumber(result.marketCap)}
              </div>
            </div>
          )}

          {result.volume24h !== null && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
              <div className="text-sm font-medium">
                {formatLargeNumber(result.volume24h)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="border-t bg-muted/30 px-4 py-2">
        <p className="text-xs text-muted-foreground">
          💡 Data from CoinGecko • Updated every 60 seconds
        </p>
      </div>
    </div>
  );
}
