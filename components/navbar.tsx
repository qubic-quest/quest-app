"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface NavbarProps {
    onWalletChange?: (address: string) => void;
}

export function Navbar({ onWalletChange }: NavbarProps) {
    const [walletAddress, setWalletAddress] = useState("");
    const [qubicPrice, setQubicPrice] = useState<number | null>(null);
    const [priceChange, setPriceChange] = useState<number | null>(null);
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
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4 w-full max-w-full">
                {/* Left: Logo and Project Name */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <img src="/logo.png" alt="Quest Logo" className="h-10 w-10 rounded-lg" />
                        <div className="flex flex-col items-start">
                            <h1 className="font-bold leading-none">Qubic Quest</h1>
                            <p className="text-xs text-muted-foreground">AI Blockchain Explorer</p>
                        </div>
                    </button>
                    <div className="hidden md:flex items-center gap-2 rounded-lg border bg-card px-4 py-2 ml-5">
                        <img src="/qubic_logo_new.webp" alt="Qubic Logo" className="h-5 w-5 rounded-lg" />
                        <div className="flex flex-col">
                            {qubicPrice !== null ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">
                                        ${qubicPrice.toFixed(8)}
                                    </span>
                                    {priceChange !== null && (
                                        <span
                                            className={`text-xs ${priceChange >= 0 ? "text-green-500" : "text-red-500"
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
                </div>

                {/* Right: Wallet Connection */}
                <div className="flex items-center gap-2">
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
                            <Wallet className="h-4 w-4 text-green-500" />
                            <span className="hidden sm:inline text-sm font-mono text-muted-foreground">
                                {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                            </span>
                            <span className="sm:hidden text-sm font-mono text-muted-foreground">
                                {walletAddress.slice(0, 6)}...
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
