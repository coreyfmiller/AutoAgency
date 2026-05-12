import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsite } from "@/lib/audit/scraper";
import { analyzeWithGemini } from "@/lib/audit/analyzer";
import { compilePrompt } from "@/lib/audit/prompt-compiler";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Step 1: Scrape the website
    const scrapedData = await scrapeWebsite(url);

    // Step 2: Analyze with Gemini
    const analysis = await analyzeWithGemini(scrapedData);

    // Step 3: Compile the prompt
    const compiledPrompt = compilePrompt(scrapedData, analysis);

    // Return all data (excluding the raw screenshot buffer for JSON response)
    return NextResponse.json({
      success: true,
      scraped: {
        ...scrapedData,
        screenshot: scrapedData.screenshot
          ? `data:image/png;base64,${scrapedData.screenshot.toString("base64")}`
          : null,
      },
      analysis,
      prompt: compiledPrompt,
    });
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Audit failed" },
      { status: 500 }
    );
  }
}
