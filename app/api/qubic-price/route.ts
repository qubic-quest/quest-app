import { getQubicPriceDetails } from "@/lib/rpc";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const priceData = await getQubicPriceDetails();
    
    if (!priceData) {
      return NextResponse.json(
        { error: "Failed to fetch QUBIC price" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      price: priceData.currentPrice,
      change_24h: priceData.priceChangePercentage24h,
      market_cap: priceData.marketCap,
      volume_24h: priceData.volume24h,
    });
  } catch (error) {
    console.error("Failed to fetch QUBIC price:", error);
    return NextResponse.json(
      { error: "Failed to fetch QUBIC price" },
      { status: 500 }
    );
  }
}
