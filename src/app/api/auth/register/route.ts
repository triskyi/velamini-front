import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { quickReject, verifyEmail } from "@/lib/email-verify";
import { prisma } from "@/lib/prisma";
import { areSignupsAllowed } from "@/lib/signup-settings";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const signupsAllowed = await areSignupsAllowed();
    if (!signupsAllowed) {
      return NextResponse.json(
        { error: "New signups are currently disabled." },
        { status: 403 }
      );
    }

    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Name, email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = parsed.data.email.toLowerCase().trim();
    const quickError = quickReject(normalizedEmail);
    if (quickError) {
      return NextResponse.json({ error: quickError }, { status: 400 });
    }

    const verification = await verifyEmail(normalizedEmail);
    if (!verification.accept) {
      return NextResponse.json({ error: verification.message }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        accountType: "personal",
        onboardingComplete: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Personal register error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
