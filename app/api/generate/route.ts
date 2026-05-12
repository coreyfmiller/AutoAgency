import { NextRequest, NextResponse } from "next/server";
import { v0 } from "v0-sdk";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { prompt, customInstructions } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const finalPrompt = customInstructions
      ? `${prompt}\n\n## Additional Instructions\n${customInstructions}`
      : prompt;

    // Create a chat with v0 SDK
    console.log("[generate] Creating v0 chat...");
    const chat = await v0.chats.create({
      message: finalPrompt,
    });

    console.log("[generate] Chat created:", chat.id);

    // Extract generated files
    const files = chat.latestVersion?.files || [];
    const generatedCode = files
      .map((file) => `// === ${file.name} ===\n${file.content}`)
      .join("\n\n");

    const demoUrl = chat.latestVersion?.demoUrl || null;

    return NextResponse.json({
      success: true,
      chatId: chat.id,
      demoUrl,
      files: files.map((f) => ({ name: f.name, content: f.content })),
      generatedCode: generatedCode || "No code generated",
    });
  } catch (error) {
    console.error("[generate] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
