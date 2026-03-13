import crypto from "crypto";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canSendResendEmail, sendOtpEmail } from "@/lib/resend-email";

const OTP_EXPIRY_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 60;

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    if (!session.user.email) {
      return NextResponse.json({ error: "Your account does not have an email address." }, { status: 400 });
    }

    if (!canSendResendEmail()) {
      return NextResponse.json({ error: "Email delivery is not configured yet." }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true, email: true, name: true },
    });

    if (!user?.email) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    const recentToken = await prisma.verifyToken.findFirst({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentToken) {
      const cooldown = Math.max(
        1,
        Math.ceil((recentToken.createdAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000)
      );
      return NextResponse.json(
        { error: `Please wait ${cooldown} seconds before requesting a new code.`, cooldown },
        { status: 429 }
      );
    }

    await prisma.verifyToken.deleteMany({ where: { userId: session.user.id } });

    const code = String(crypto.randomInt(100000, 1000000));
    const token = crypto.createHash("sha256").update(code).digest("hex");

    await prisma.verifyToken.create({
      data: {
        userId: session.user.id,
        email: user.email,
        token,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    });

    await sendOtpEmail({
      to: user.email,
      name: user.name || "there",
      code,
      expiresMinutes: OTP_EXPIRY_MINUTES,
      userId: session.user.id,
    });

    return NextResponse.json({
      ok: true,
      expiresMinutes: OTP_EXPIRY_MINUTES,
      cooldown: RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    console.error("[send-otp]", error);
    const message =
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? error.message
        : "Failed to send verification code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
