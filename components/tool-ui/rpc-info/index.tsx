"use client";

import { CurrentTickResult } from "./schema";

interface CurrentTickCardProps {
  result: CurrentTickResult;
}

export function CurrentTickCard({ result }: CurrentTickCardProps) {
  if (!result.success || result.currentTick === undefined) {
    return (
      <div className="my-4 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Failed to get current tick"}
        </p>
      </div>
    );
  }

  const tickDate = result.timestamp ? new Date(result.timestamp) : new Date();

  return (
    <div className="my-4 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <div className="border-b bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-semibold">Live Network Status</h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground mb-1">Current Tick</p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
              {result.currentTick.toLocaleString()}
            </p>
          </div>

          {result.epoch !== undefined && (
            <div className="text-center md:text-left">
              <p className="text-xs text-muted-foreground mb-1">Epoch</p>
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {result.epoch}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Updated: {tickDate.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
