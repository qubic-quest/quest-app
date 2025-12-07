"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wallet, Activity } from "lucide-react";

interface NavbarProps {
    onWalletChange?: (address: string) => void;
}

export function Navbar({ onWalletChange }: NavbarProps) {
    const [walletAddress, setWalletAddress] = useState("");
    const [qubicPrice, setQubicPrice] = useState<number | null>(null);
    const [priceChange, setPriceChange] = useState<number | null>(null);
    const [currentTick, setCurrentTick] = useState<number | null>(null);
    const [isEditingWallet, setIsEditingWallet] = useState(false);

    // Load wallet from localStorage on mount
    useEffect(() => {
        const savedWallet = localStorage.getItem("qubic-wallet-address");
        if (savedWallet) {
            setWalletAddress(savedWallet);
            onWalletChange?.(savedWallet);
        }
    }, [onWalletChange]);

    // Fetch QUBIC price
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const res = await fetch("/api/qubic-price");
                const data = await res.json();
                setQubicPrice(data.price);
                setPriceChange(data.change_24h);
            } catch (error) {
                console.error("Failed to fetch QUBIC price:", error);
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    // Fetch current tick
    useEffect(() => {
        const fetchTick = async () => {
            try {
                const res = await fetch("https://rpc.qubic.org/v1/tick-info");
                const data = await res.json();
                const tick = data.tickInfo?.tick || data.tick || 0;
                setCurrentTick(tick);
            } catch (error) {
                console.error("Failed to fetch current tick:", error);
            }
        };

        fetchTick();
        const interval = setInterval(fetchTick, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const handleWalletSubmit = () => {
        if (walletAddress.trim()) {
            localStorage.setItem("qubic-wallet-address", walletAddress.trim());
            onWalletChange?.(walletAddress.trim());
            setIsEditingWallet(false);
        }
    };

    const handleWalletClear = () => {
        setWalletAddress("");
        localStorage.removeItem("qubic-wallet-address");
        onWalletChange?.("");
        setIsEditingWallet(false);
    };

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4 w-full max-w-full">
                {/* Left: Logo and Project Name */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <img src="/logo_2.png" alt="Quest Logo" className="h-8 w-8 rounded-px" />
                        <div className="flex flex-col items-start">
                            <h1 className="font-bold leading-none">Qubic Quest</h1>
                            <p className="text-xs text-muted-foreground">AI Blockchain Explorer</p>
                        </div>
                    </button>
                    <div className="hidden md:flex items-center gap-3 ml-5">
                        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
                            <img src="/qubic_logo_new.webp" alt="Qubic Logo" className="h-5 w-5 rounded-lg" />
                            <div className="flex flex-col">
                                {qubicPrice !== null ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">
                                            ${qubicPrice.toFixed(8)}
                                        </span>
                                        {priceChange !== null && (
                                            <span
                                                className={`text-xs ${priceChange >= 0 ? "text-emerald-500" : "text-red-500"
                                                    }`}
                                            >
                                                {priceChange >= 0 ? "↑" : "↓"}{" "}
                                                {Math.abs(priceChange).toFixed(2)}%
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-sm text-muted-foreground">Loading...</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
                            <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                            <div className="flex flex-col">
                                {/* <span className="text-xs text-muted-foreground">Current Tick</span> */}
                                {currentTick !== null ? (
                                    <span className="text-sm font-semibold font-mono">
                                        {currentTick.toLocaleString()}
                                    </span>
                                ) : (
                                    <span className="text-sm text-muted-foreground">Loading...</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Wallet Connection */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.open("https://github.com/qubic-quest", "_blank")}
                        className="p-2 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
                    >
                        <img src="/github-mark.svg" alt="GitHub" className="h-5 w-5" />
                    </button>
                    {!walletAddress && !isEditingWallet ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingWallet(true)}
                            className="gap-2 cursor-pointer"
                        >
                            <Wallet className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Wallet (read only)</span>
                        </Button>
                    ) : isEditingWallet ? (
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="Enter wallet address..."
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleWalletSubmit();
                                    if (e.key === "Escape") setIsEditingWallet(false);
                                }}
                                className="w-64 h-9"
                                autoFocus
                            />
                            <Button size="sm" onClick={handleWalletSubmit}>
                                Save
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsEditingWallet(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5">
                            <Wallet className="h-4 w-4 text-emerald-500" />
                            <span className="hidden sm:inline text-sm font-mono text-muted-foreground">
                                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                            </span>
                            <span className="sm:hidden text-sm font-mono text-muted-foreground">
                                {walletAddress.slice(0, 4)}...
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsEditingWallet(true)}
                                className="h-6 px-2 text-xs"
                            >
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleWalletClear}
                                className="h-6 px-2 text-xs text-destructive"
                            >
                                Clear
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
