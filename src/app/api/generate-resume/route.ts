import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
// Import fetch if needed (Node 18+ has global fetch)

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    let userId, template;
    try {
      ({ userId, template } = JSON.parse(body));
    } catch (e) {
      return NextResponse.json({ error: "Malformed JSON in request body", body }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "Missing userId", body }, { status: 400 });
    }


    // Fetch user profile and their knowledge base
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        knowledgeBase: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Gate: require at least 4 of the 5 knowledge sections to be filled
    const kb2 = user.knowledgeBase;
    const sections = [
      !!(kb2?.fullName || kb2?.birthDate || kb2?.bio),
      !!kb2?.education,
      !!kb2?.experience,
      !!kb2?.skills,
      !!kb2?.projects,
    ];
    const completedCount = sections.filter(Boolean).length;
    if (completedCount < 4) {
      return NextResponse.json(
        { error: `Resume generation requires at least 4 completed knowledge sections. You have ${completedCount}/4.` },
        { status: 403 }
      );
    }

    // Extract resume-relevant fields from knowledgeBase
    type KnowledgeBase = {
      fullName?: string | null;
      birthDate?: string | null;
      birthPlace?: string | null;
      currentLocation?: string | null;
      languages?: string | null;
      bio?: string | null;
      relationshipStatus?: string | null;
      hobbies?: string | null;
      favoriteFood?: string | null;
      education?: string | null;
      experience?: string | null;
      skills?: string | null;
      projects?: string | null;
      awards?: string | null;
      socialLinks?: string | null;
      socialUpdates?: string | null;
      qaPairs?: any;
      rawContent?: string | null;
      isModelTrained?: boolean;
      trainedPrompt?: string | null;
      lastTrainedAt?: Date | null;
      shareSlug?: string | null;
      isPubliclyShared?: boolean;
      shareViews?: number;
      createdAt?: Date;
      updatedAt?: Date;
    };
    const kb: Partial<KnowledgeBase> = user.knowledgeBase || {};
    const resumeData = {
      name: user.name || kb.fullName || undefined,
      email: user.email || undefined,
      image: user.image || undefined,
      location: kb.currentLocation || undefined,
      phone: null, // Add if you have a phone field
      linkedin: kb.socialLinks || undefined,
      summary: kb.bio || undefined,
      experience: kb.experience || undefined,
      education: kb.education || undefined,
      certifications: kb.awards || undefined, // or kb.certifications if you add it
      skills: kb.skills || undefined,
      achievements: kb.awards || undefined,
    };

    // Prepare prompt for DeepSeek LLM
    const prompt = `You are an expert resume writer and designer. Given the following user data, write a professional resume in HTML using a modern, visually appealing, and maximal design. The resume must have a clear header (name, title, contact info, location) and a detailed body with all relevant sections: Education, Experience, Skills, Achievements, Certifications, Projects, Languages, Summary, etc.

For each section, generate full, detailed entries. For education, include institution, years attended, degree, location, and a short description. For experience, include company, years, role, location, and achievements. For skills, list each skill with a short description or proficiency if available. For achievements, certifications, and projects, provide full details (name, year, description, etc.).

At the bottom left corner of the resume, add our watermark logo using <img src='/logo.png' alt='logo' style='position: absolute; left: 24px; bottom: 24px; width: 60px; opacity: 0.15;'>. The logo should be subtle and not interfere with the content.

Parse and use all available JSON/text fields (education, experience, skills, awards, projects, etc.) from the knowledge base. If a field contains JSON, parse it and display the information in the appropriate section. If a field contains plain text, display it as a paragraph or list. Each section should have detailed content, not just the header. Do not invent facts. Return only the HTML, no explanations. Don't use word like professional summary just say summary. 

User Data (JSON):
${JSON.stringify(resumeData, null, 2)}

Write the resume in HTML now:`;

    // Call DeepSeek API (replace with your actual DeepSeek endpoint and API key)
    const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "DeepSeek API key not set" }, { status: 500 });
    }

    const deepseekRes = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a professional resume writer. Return only clean HTML, no markdown fences, no explanations." },
          { role: "user", content: prompt },
        ],
        max_tokens: 2800,   // reduced from 4096 — plenty for a full resume
        temperature: 0.2,   // more deterministic = faster sampling
        stream: true,       // stream tokens as they are generated
      }),
    });

    if (!deepseekRes.ok || !deepseekRes.body) {
      const errorBody = await deepseekRes.text();
      console.error("DeepSeek API error:", deepseekRes.status, errorBody);
      return NextResponse.json({ error: "Failed to generate resume with DeepSeek.", status: deepseekRes.status, errorBody }, { status: 500 });
    }

    // Pipe the SSE stream — parse `data: {…}` lines and forward raw content tokens
    const upstreamReader = deepseekRes.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readable = new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await upstreamReader.read();
          if (done) { controller.close(); return; }

          const text = decoder.decode(value, { stream: true });
          for (const line of text.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") { controller.close(); return; }
            try {
              const parsed = JSON.parse(payload);
              const chunk: string | undefined = parsed.choices?.[0]?.delta?.content;
              if (chunk) controller.enqueue(encoder.encode(chunk));
            } catch { /* skip malformed lines */ }
          }
        }
      },
      cancel() { upstreamReader.cancel(); },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate resume." }, { status: 500 });
  }
}
