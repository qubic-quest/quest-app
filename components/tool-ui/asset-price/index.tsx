import { AssetPriceResult } from "./schema";

interface AssetPriceCardProps {
  result: AssetPriceResult;
}

export function AssetPriceCard({ result }: AssetPriceCardProps) {
  if (!result.success || !result.priceInQubic) {
    return (
      <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          {result.error || `No price data available for ${result.assetName}`}
        </p>
      </div>
    );
  }

  const formatQubicPrice = (price: number) => {
    return price.toLocaleString() + " QUBIC";
  };

  const formatUSDPrice = (price: number) => {
    if (price < 0.01) {
      return "$" + price.toFixed(6);
    }
    return "$" + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const eventColor = result.lastTradeEvent === "Buy" 
    ? "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400"
    : "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400";

  return (
    <div className="my-4 rounded-lg border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b bg-muted/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{result.assetName}</h3>
          <div className="flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </div>

      {/* Price Display */}
      <div className="p-6">
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-1">Current Price</div>
          <div className="text-3xl font-bold tracking-tight">
            {formatQubicPrice(result.priceInQubic)}
          </div>
          {result.priceInUSD && (
            <div className="text-lg text-muted-foreground mt-1">
              ≈ {formatUSDPrice(result.priceInUSD)}
            </div>
          )}
        </div>

        {/* Trade Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Last Trade</div>
            <div className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${eventColor}`}>
              {result.lastTradeEvent}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Tick</div>
            <div className="text-sm font-medium">
              {result.lastTradeTick?.toLocaleString()}
            </div>
          </div>

          {result.volume24h !== undefined && result.volume24h > 0 && (
            <>
              <div>
                <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
                <div className="text-sm font-medium">
                  {result.volume24h.toLocaleString()} shares
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">24h Trades</div>
                <div className="text-sm font-medium">
                  {result.trades24h?.toLocaleString()}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Timestamp */}
        {result.lastTradeTimestamp && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Last updated: {formatTimestamp(result.lastTradeTimestamp)}
            </div>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="border-t bg-muted/30 px-4 py-2">
        <p className="text-xs text-muted-foreground">
          💡 Price based on most recent {result.lastTradeEvent} transaction from database
        </p>
      </div>
    </div>
  );
}
