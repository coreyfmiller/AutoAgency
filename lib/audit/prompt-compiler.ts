import type { ScrapedData } from "./scraper";
import type { AnalysisResult } from "./analyzer";

export interface CompiledPrompt {
  systemPrompt: string;
  userPrompt: string;
  fullPrompt: string;
}

export function compilePrompt(
  scrapedData: ScrapedData,
  analysis: AnalysisResult,
  customInstructions?: string
): CompiledPrompt {
  const systemPrompt = `You are an expert Senior Frontend Engineer and UI/UX Designer. Your task is to rebuild a modern, high-performance version of a website based on the following audited data. Use Next.js, Tailwind CSS, and Lucide React icons. Ensure the components are accessible and responsive.`;

  const imageDescSection =
    analysis.imageDescriptions.length > 0
      ? analysis.imageDescriptions
          .map((img) => `  - ${img.description} (${img.url})`)
          .join("\n")
      : "  - No specific images extracted";

  const userPrompt = `## Target Brand DNA

**Brand Name:** ${analysis.brandName}
**Visual Style:** ${analysis.visualStyle}
**Overall Vibe:** ${analysis.overallVibe}
**Target Audience:** ${analysis.targetAudience}

## Color Palette
- Primary: ${analysis.colorPalette.primary}
- Secondary: ${analysis.colorPalette.secondary}
- Accent: ${analysis.colorPalette.accent}
- Background: ${analysis.colorPalette.background}
- Text: ${analysis.colorPalette.text}

## Typography
- Primary Font: ${analysis.typography.primary}
- Secondary Font: ${analysis.typography.secondary}

## Extracted Assets
- Logo: ${scrapedData.logos[0] || "Use brand name as text logo"}
- Hero Image: ${scrapedData.ogImage || scrapedData.images[0] || "Use a gradient or abstract background"}
- Key Images:
${imageDescSection}

## Structural Requirements

**Navigation:** Create a sticky header with the logo and these links: [${scrapedData.navLinks.slice(0, 6).join(", ")}].

**Hero Section:** Replicate the value proposition: "${scrapedData.heroText || analysis.heroDescription}". ${scrapedData.heroSubtext ? `Subtext: "${scrapedData.heroSubtext}"` : ""}

**Layout Pattern:** ${analysis.layoutPattern}

**Key Sections to Include:**
${analysis.suggestedSections.map((s) => `- ${s}`).join("\n")}

**Key Features/Services:**
${analysis.keyFeatures.map((f) => `- ${f}`).join("\n")}

**Social Links:** ${scrapedData.socialLinks.join(", ") || "Standard social media icons in footer"}

**Footer:** Standard multi-column footer with the brand logo, navigation links, and social links.

## Technical Constraints
- Only use Lucide React for icons.
- Use Shadcn/ui components for all buttons, inputs, and cards.
- Ensure the design uses a 'Dark Mode' toggle by default.
- Make it fully responsive (mobile-first approach).
- Use modern CSS features and animations where appropriate.
- Ensure WCAG 2.1 AA accessibility compliance.

${customInstructions ? `## Custom Instructions\n${customInstructions}` : ""}`;

  return {
    systemPrompt,
    userPrompt,
    fullPrompt: `${systemPrompt}\n\n${userPrompt}`,
  };
}
