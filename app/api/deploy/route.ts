import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { projectName, githubUrl } = await request.json();

    if (!projectName || !githubUrl) {
      return NextResponse.json(
        { error: "projectName and githubUrl are required" },
        { status: 400 }
      );
    }

    // Extract repo full name from GitHub URL
    const repoMatch = githubUrl.match(/github\.com\/([^/]+\/[^/]+)/);
    if (!repoMatch) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }
    const repoFullName = repoMatch[1];

    const vercelName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    console.log("[deploy] Deploying:", vercelName, "from", repoFullName);

    // Check if Vercel project already exists
    const checkRes = await fetch(
      `https://api.vercel.com/v9/projects/${vercelName}`,
      {
        headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` },
      }
    );

    if (!checkRes.ok) {
      // Project doesn't exist — create it
      console.log("[deploy] Creating new Vercel project...");
      const projectResponse = await fetch("https://api.vercel.com/v10/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: vercelName,
          framework: "nextjs",
          gitRepository: {
            type: "github",
            repo: repoFullName,
          },
          buildCommand: "next build",
          installCommand: "npm install",
          resourceConfig: {
            buildMachineType: "elastic",
          },
        }),
      });

      if (!projectResponse.ok) {
        const error = await projectResponse.text();
        console.error("[deploy] Project creation failed:", error);
        throw new Error(`Vercel project creation failed: ${error}`);
      }

      console.log("[deploy] Project created, waiting for initial deployment...");
      
      // Wait a moment for Vercel to pick up the repo and start building
      await new Promise((r) => setTimeout(r, 5000));
    } else {
      console.log("[deploy] Project already exists");
    }

    // Force a deployment using the Vercel Deploy Hook approach:
    // Push a trigger commit to the repo so Vercel's git integration picks it up
    let sha: string | undefined;
    const existingRes = await fetch(
      `https://api.github.com/repos/${repoFullName}/contents/.vercel-trigger`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (existingRes.ok) {
      const existing = await existingRes.json();
      sha = existing.sha;
    }

    const triggerContent = `Deployed via RefreshFactory.ai at ${new Date().toISOString()}`;

    const triggerRes = await fetch(
      `https://api.github.com/repos/${repoFullName}/contents/.vercel-trigger`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: "Trigger Vercel deployment",
          content: Buffer.from(triggerContent).toString("base64"),
          ...(sha ? { sha } : {}),
        }),
      }
    );

    if (!triggerRes.ok) {
      console.error("[deploy] Git trigger push failed:", await triggerRes.text());
    } else {
      console.log("[deploy] Triggered build via git push");
    }

    // Also try creating a deployment via the Vercel API directly as a fallback
    // This ensures a deployment happens even if git integration is slow
    try {
      const createDeployRes = await fetch("https://api.vercel.com/v13/deployments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: vercelName,
          project: vercelName,
          target: "production",
          gitSource: {
            type: "github",
            repo: repoFullName.split("/")[1],
            org: repoFullName.split("/")[0],
            ref: "main",
          },
        }),
      });

      if (createDeployRes.ok) {
        const deployData = await createDeployRes.json();
        console.log("[deploy] Direct deployment created:", deployData.url);
      } else {
        const errText = await createDeployRes.text();
        console.log("[deploy] Direct deployment fallback failed (non-critical):", errText);
      }
    } catch (e) {
      console.log("[deploy] Direct deployment attempt failed (non-critical):", e);
    }

    return NextResponse.json({
      success: true,
      url: `https://${vercelName}.vercel.app`,
    });
  } catch (error) {
    console.error("[deploy] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deployment failed" },
      { status: 500 }
    );
  }
}
