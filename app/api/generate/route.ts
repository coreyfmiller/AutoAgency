import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const { prompt, customInstructions } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const finalPrompt = customInstructions
      ? `${prompt}\n\n## Additional Instructions\n${customInstructions}`
      : prompt;

    // Call v0 API
    const response = await fetch("https://api.v0.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.V0_API_KEY}`,
      },
      body: JSON.stringify({
        model: "v0-1.0-md",
        messages: [
          {
            role: "user",
            content: finalPrompt,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("v0 API error:", response.status, errorText);
      return NextResponse.json(
        { error: `v0 API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      result: data,
      generatedCode: data.choices?.[0]?.message?.content || null,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
