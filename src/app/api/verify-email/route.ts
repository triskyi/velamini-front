import { NextRequest, NextResponse } from "next/server";

import { quickReject, verifyEmail } from "@/lib/email-verify";

export async function POST(req: NextRequest) {
  try {
    const { email, isOrg = false } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ accept: false, message: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const quickError = quickReject(normalizedEmail);
    if (quickError) {
      return NextResponse.json({ accept: false, message: quickError }, { status: 200 });
    }

    const result = await verifyEmail(normalizedEmail);

    if (isOrg && result.accept && result.free) {
      return NextResponse.json(
        {
          ...result,
          message: "Email accepted; for a more professional setup, consider using a business address like you@yourcompany.com.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        accept: true,
        message: "Email accepted.",
        state: "unknown",
      },
      { status: 200 }
    );
  }
}
