import crypto from "crypto";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/resend-email";

const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { code } = (await req.json()) as { code?: string };
    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Please enter the 6-digit code from your email." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, emailVerified: true },
    });

    if (!user?.email) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ ok: true, message: "Email already verified." });
    }

    const record = await prisma.verifyToken.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json({ error: "No verification code found. Request a new one." }, { status: 404 });
    }

    if (record.expiresAt < new Date()) {
      await prisma.verifyToken.delete({ where: { id: record.id } });
      return NextResponse.json({ error: "This code has expired. Request a new one." }, { status: 400 });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      await prisma.verifyToken.delete({ where: { id: record.id } });
      return NextResponse.json({ error: "Too many incorrect attempts. Request a new code." }, { status: 429 });
    }

    const hashedCode = crypto.createHash("sha256").update(code.trim()).digest("hex");
    if (hashedCode !== record.token) {
      const updated = await prisma.verifyToken.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      const attemptsLeft = Math.max(0, MAX_ATTEMPTS - updated.attempts);

      if (attemptsLeft === 0) {
        await prisma.verifyToken.delete({ where: { id: record.id } });
      }

      return NextResponse.json(
        {
          error:
            attemptsLeft > 0
              ? `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`
              : "Too many incorrect attempts. Request a new code.",
          attemptsLeft,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.verifyToken.deleteMany({
        where: { userId: session.user.id },
      }),
    ]);

    void sendWelcomeEmail({
      to: user.email,
      name: user.name || "there",
      userId: session.user.id,
    }).catch((error) => {
      console.error("[verify-otp] welcome email failed", error);
    });

    return NextResponse.json({ ok: true, message: "Email verified successfully." });
  } catch (error) {
    console.error("[verify-otp]", error);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
