import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ScrapedData } from "./scraper";

export interface ImageClassification {
  url: string;
  type: "logo" | "hero" | "team" | "product" | "testimonial" | "gallery" | "icon" | "other";
  description: string;
  confidence: number;
}

export interface AnalysisResult {
  // Business identity
  businessName: string;
  businessType: string;
  tagline: string;
  description: string;

  // Content
  headline: string;
  subheadline: string;
  services: string[];
  ctaText: string;
  phoneNumber: string | null;
  address: string | null;
  navLinks: string[];

  // Image classification
  logoUrl: string | null;
  heroImageUrl: string | null;
  allImages: ImageClassification[];

  // Generated v0 prompt
  v0Prompt: string;
}

export async function analyzeWithGemini(
  scrapedData: ScrapedData
): Promise<AnalysisResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Build context from scraped data
  const imageList = scrapedData.images
    .slice(0, 15)
    .map((url, i) => `  ${i + 1}. ${url}`)
    .join("\n");

  const logoCandidates = scrapedData.logos
    .map((url, i) => `  ${i + 1}. ${url}`)
    .join("\n");

  const prompt = `You are analyzing a scraped website to rebuild it as a modern site. Extract the business identity and classify the images.

SCRAPED DATA:
- URL: ${scrapedData.url}
- Title: ${scrapedData.title}
- Meta Description: ${scrapedData.description}
- Hero Text: ${scrapedData.heroText || "N/A"}
- Hero Subtext: ${scrapedData.heroSubtext || "N/A"}
- Headings: ${scrapedData.headings.map((h) => `H${h.level}: ${h.text}`).join(" | ")}
- Navigation Links: ${scrapedData.navLinks.join(", ")}
- Body Text (excerpt): ${scrapedData.bodyText.slice(0, 1500)}

LOGO CANDIDATES:
${logoCandidates || "  None detected"}

ALL IMAGES:
${imageList || "  None found"}

INSTRUCTIONS:
1. Identify the business name, type, tagline, and what they do.
2. Extract their real headline, services, CTA text, phone number, address.
3. Classify each image as: logo, hero, team, product, testimonial, gallery, icon, or other.
4. Pick the SINGLE best logo URL and SINGLE best hero/banner image URL. If no clear logo or hero image can be identified from the URLs, set them to null — v0 will use placeholders.
5. Write a concise v0 prompt (under 1500 chars) that will generate a modern rebuild of this site using their REAL business name, tagline, services, and content. Include ONLY the logo URL and hero image URL if they were found.

The v0 prompt should:
- Mention the business name and what they do
- Include their actual headline/tagline
- List their real nav links and services
- Reference ONLY the logo URL and hero image URL (no other images)
- Let v0 generate its own placeholder images for galleries, team sections, testimonials, etc.
- Ask for a modern, responsive design with appropriate sections for their business type
- NOT include color codes (let v0 pick a modern palette)
- NOT ask for placeholder text (use their real content)
- Explicitly say "Use placeholder images for gallery/team/other sections — real images will be added later"
- Based on the business type, include 1-2 sentences describing the design style v0 should use (layout approach, typography feel, visual weight, section style, symmetry vs asymmetry). For example: contractors get bold/masculine designs with large imagery; law firms get clean symmetrical layouts; restaurants get warm inviting designs with dark backgrounds.
- ALWAYS include these structural requirements: "Include a sticky navigation header and a footer."

Respond ONLY with valid JSON (no markdown fences):
{
  "businessName": "string",
  "businessType": "string (e.g., contractor, restaurant, saas, law firm, ecommerce)",
  "tagline": "string or empty",
  "description": "one sentence about what they do",
  "headline": "their main headline text",
  "subheadline": "their subheadline or supporting text",
  "services": ["service1", "service2"],
  "ctaText": "their call-to-action text",
  "phoneNumber": "string or null",
  "address": "string or null",
  "navLinks": ["Home", "Services", "About", "Contact"],
  "logoUrl": "best logo URL or null",
  "heroImageUrl": "best hero/banner image URL or null",
  "allImages": [
    {"url": "image_url", "type": "logo|hero|team|product|testimonial|gallery|icon|other", "description": "brief description", "confidence": 0.9}
  ],
  "v0Prompt": "The complete prompt to send to v0"
}`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: prompt },
  ];

  // Include screenshot if available for better visual understanding
  if (scrapedData.screenshot) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: scrapedData.screenshot.toString("base64"),
      },
    });
  }

  const result = await model.generateContent(parts);
  const response = result.response;
  const text = response.text();

  // Parse JSON response
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned) as AnalysisResult;
  } catch {
    console.error("[analyzer] Failed to parse Gemini response:", text.slice(0, 500));
    // Return a structured fallback
    return {
      businessName: scrapedData.title || "Unknown Business",
      businessType: "business",
      tagline: scrapedData.description || "",
      description: scrapedData.description || "",
      headline: scrapedData.heroText || scrapedData.title || "",
      subheadline: scrapedData.heroSubtext || "",
      services: [],
      ctaText: "Contact Us",
      phoneNumber: null,
      address: null,
      navLinks: scrapedData.navLinks.slice(0, 6),
      logoUrl: scrapedData.logos[0] || null,
      heroImageUrl: scrapedData.images[0] || null,
      allImages: scrapedData.images.map((url) => ({
        url,
        type: "other" as const,
        description: "Image from website",
        confidence: 0.5,
      })),
      v0Prompt: `Build a modern website for ${scrapedData.title}. Include a hero section, services, and contact form.`,
    };
  }
}
