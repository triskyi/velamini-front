import { NextResponse } from "next/server";
import { searchAvailableNumbers } from "@/lib/twilio-provisioning";

// GET /api/organizations/search-numbers - Search for available phone numbers
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const countryCode = searchParams.get("country") || "US";
    const areaCode = searchParams.get("areaCode") || undefined;

    const availableNumbers = await searchAvailableNumbers(countryCode, areaCode);

    return NextResponse.json({
      ok: true,
      numbers: availableNumbers.slice(0, 10), // Return first 10 numbers
      total: availableNumbers.length,
    });
  } catch (error: any) {
    console.error("Search numbers error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to search numbers" },
      { status: 500 }
    );
  }
}
