import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ScrapedData } from "./scraper";

export interface AnalysisResult {
  brandName: string;
  visualStyle: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    primary: string;
    secondary: string;
  };
  layoutPattern: string;
  heroDescription: string;
  imageDescriptions: { url: string; description: string }[];
  overallVibe: string;
  targetAudience: string;
  keyFeatures: string[];
  suggestedSections: string[];
}

export async function analyzeWithGemini(
  scrapedData: ScrapedData
): Promise<AnalysisResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Prepare the screenshot for vision analysis
  const screenshotBase64 = scrapedData.screenshot
    ? scrapedData.screenshot.toString("base64")
    : null;

  const prompt = `You are a senior UI/UX designer analyzing a website. Based on the screenshot and extracted data below, provide a comprehensive design analysis.

EXTRACTED DATA:
- Title: ${scrapedData.title}
- Description: ${scrapedData.description}
- Headings: ${scrapedData.headings.map((h) => `H${h.level}: ${h.text}`).join(", ")}
- Navigation: ${scrapedData.navLinks.join(", ")}
- Hero Text: ${scrapedData.heroText || "N/A"}
- Hero Subtext: ${scrapedData.heroSubtext || "N/A"}
- Detected Fonts: ${scrapedData.fonts.join(", ")}
- Detected Colors (CSS): ${scrapedData.colors.slice(0, 10).join(", ")}
- Number of Images: ${scrapedData.images.length}
- Social Links: ${scrapedData.socialLinks.join(", ")}

Respond ONLY with valid JSON matching this exact structure (no markdown, no code fences):
{
  "brandName": "The company/brand name",
  "visualStyle": "e.g., Minimalist, High-Tech, Corporate, Playful, Elegant",
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "typography": {
    "primary": "Font family name",
    "secondary": "Font family name or 'system-ui'"
  },
  "layoutPattern": "Description of the overall layout approach",
  "heroDescription": "Detailed description of the hero section design and content",
  "imageDescriptions": [{"url": "image_url", "description": "what the image shows"}],
  "overallVibe": "2-3 sentence description of the brand's visual identity and feel",
  "targetAudience": "Who this site is designed for",
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "suggestedSections": ["section1", "section2", "section3"]
}`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: prompt },
  ];

  if (screenshotBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: screenshotBase64,
      },
    });
  }

  const result = await model.generateContent(parts);
  const response = result.response;
  const text = response.text();

  // Parse the JSON response (strip any markdown fences if present)
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned) as AnalysisResult;
  } catch {
    // If parsing fails, return a structured fallback
    console.error("Failed to parse Gemini response:", text);
    return {
      brandName: scrapedData.title || "Unknown Brand",
      visualStyle: "Modern",
      colorPalette: {
        primary: "#3b82f6",
        secondary: "#1e293b",
        accent: "#f59e0b",
        background: "#ffffff",
        text: "#0f172a",
      },
      typography: {
        primary: scrapedData.fonts[0] || "Inter",
        secondary: scrapedData.fonts[1] || "system-ui",
      },
      layoutPattern: "Standard single-page layout",
      heroDescription: scrapedData.heroText || "Hero section",
      imageDescriptions: [],
      overallVibe: "Modern professional website",
      targetAudience: "General audience",
      keyFeatures: [],
      suggestedSections: ["Hero", "Features", "About", "Contact"],
    };
  }
}

export async function describeImages(
  imageUrls: string[]
): Promise<{ url: string; description: string }[]> {
  if (imageUrls.length === 0) return [];

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const descriptions: { url: string; description: string }[] = [];

  // Process up to 5 key images
  const topImages = imageUrls.slice(0, 5);

  for (const imageUrl of topImages) {
    try {
      const result = await model.generateContent([
        {
          text: `Describe this image in one concise sentence for use in a web design prompt. Focus on the subject, mood, and visual style. Image URL: ${imageUrl}`,
        },
      ]);
      descriptions.push({
        url: imageUrl,
        description: result.response.text().trim(),
      });
    } catch {
      descriptions.push({
        url: imageUrl,
        description: "Image asset from the original website",
      });
    }
  }

  return descriptions;
}
