import { chromium, type Browser, type Page } from "playwright";
import * as cheerio from "cheerio";

export interface ScrapedData {
  url: string;
  title: string;
  description: string;
  ogImage: string | null;
  favicon: string | null;
  logos: string[];
  images: string[];
  colors: string[];
  fonts: string[];
  headings: { level: number; text: string }[];
  navLinks: string[];
  heroText: string | null;
  heroSubtext: string | null;
  socialLinks: string[];
  metaTags: Record<string, string>;
  bodyText: string;
  screenshot: Buffer | null;
}

function resolveUrl(base: string, relative: string | undefined | null): string {
  if (!relative) return "";
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000); // Let animations settle

    // Take screenshot
    const screenshot = await page.screenshot({ fullPage: true, type: "png" });

    // Extract computed styles (colors and fonts)
    const computedStyles = await page.evaluate(() => {
      const colors = new Set<string>();
      const fonts = new Set<string>();
      const elements = document.querySelectorAll("*");

      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const textColor = style.color;
        const fontFamily = style.fontFamily;

        if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
          colors.add(bgColor);
        }
        if (textColor) {
          colors.add(textColor);
        }
        if (fontFamily) {
          // Get the first font in the stack
          const primary = fontFamily.split(",")[0].trim().replace(/['"]/g, "");
          if (primary && !primary.includes("inherit")) {
            fonts.add(primary);
          }
        }
      });

      return {
        colors: Array.from(colors).slice(0, 20),
        fonts: Array.from(fonts).slice(0, 10),
      };
    });

    // Get the full HTML
    const html = await page.content();
    const $ = cheerio.load(html);

    // Extract meta tags
    const metaTags: Record<string, string> = {};
    $("meta").each((_, el) => {
      const name =
        $(el).attr("name") || $(el).attr("property") || $(el).attr("http-equiv");
      const content = $(el).attr("content");
      if (name && content) {
        metaTags[name] = content;
      }
    });

    // Extract title
    const title =
      $("title").text() || metaTags["og:title"] || metaTags["twitter:title"] || "";

    // Extract description
    const description =
      metaTags["description"] ||
      metaTags["og:description"] ||
      metaTags["twitter:description"] ||
      "";

    // Extract OG image
    const ogImage = metaTags["og:image"]
      ? resolveUrl(url, metaTags["og:image"])
      : null;

    // Extract favicon
    const favicon = resolveUrl(
      url,
      $('link[rel="icon"]').attr("href") ||
        $('link[rel="shortcut icon"]').attr("href") ||
        "/favicon.ico"
    );

    // Extract logos
    const logos: string[] = [];
    $('img[class*="logo"], img[alt*="logo"], img[id*="logo"], [class*="logo"] img, header img').each(
      (_, el) => {
        const src = $(el).attr("src");
        if (src) logos.push(resolveUrl(url, src));
      }
    );
    // Also check SVGs used as logos
    $('a[class*="logo"] svg, [class*="brand"] svg').each(() => {
      // SVG logos detected but can't extract as URL
    });

    // Extract images (top 20 by size relevance)
    const images: string[] = [];
    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src && !src.includes("data:image/svg") && !src.includes("1x1")) {
        images.push(resolveUrl(url, src));
      }
    });
    // Also get background images from inline styles
    $("[style*='background-image']").each((_, el) => {
      const style = $(el).attr("style") || "";
      const match = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
      if (match) {
        images.push(resolveUrl(url, match[1]));
      }
    });

    // Extract headings
    const headings: { level: number; text: string }[] = [];
    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
      const level = parseInt(el.tagName.replace("h", ""));
      const text = $(el).text().trim();
      if (text) headings.push({ level, text });
    });

    // Extract navigation links
    const navLinks: string[] = [];
    $("nav a, header a, [role='navigation'] a").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 50) navLinks.push(text);
    });

    // Extract hero text (first h1 or large heading)
    const heroText = $("h1").first().text().trim() || null;
    const heroSubtext =
      $("h1")
        .first()
        .next("p, span, h2")
        .text()
        .trim() ||
      $("[class*='hero'] p, [class*='banner'] p").first().text().trim() ||
      null;

    // Extract social links
    const socialLinks: string[] = [];
    const socialPatterns = [
      "facebook",
      "twitter",
      "instagram",
      "linkedin",
      "youtube",
      "tiktok",
      "github",
    ];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (socialPatterns.some((p) => href.includes(p))) {
        socialLinks.push(href);
      }
    });

    // Extract body text (for context)
    const bodyText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000);

    return {
      url,
      title,
      description,
      ogImage,
      favicon,
      logos: [...new Set(logos)].slice(0, 5),
      images: [...new Set(images)].slice(0, 20),
      colors: computedStyles.colors,
      fonts: computedStyles.fonts,
      headings: headings.slice(0, 20),
      navLinks: [...new Set(navLinks)].slice(0, 15),
      heroText,
      heroSubtext,
      socialLinks: [...new Set(socialLinks)],
      metaTags,
      bodyText,
      screenshot,
    };
  } finally {
    if (browser) await browser.close();
  }
}
