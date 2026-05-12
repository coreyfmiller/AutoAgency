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

    console.log("[deploy] Creating Vercel project:", vercelName, "from", repoFullName);

    // Create Vercel project linked to GitHub repo
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

    const project = await projectResponse.json();
    console.log("[deploy] Project created:", project.id);

    // Trigger a build by pushing a deploy trigger file to the repo
    // This forces Vercel to pick up the repo and start building
    const triggerContent = `Deployed via ClientFactory at ${new Date().toISOString()}`;
    
    await fetch(
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
        }),
      }
    );

    console.log("[deploy] Triggered build via git push");

    return NextResponse.json({
      success: true,
      url: `https://${vercelName}.vercel.app`,
      projectId: project.id,
    });
  } catch (error) {
    console.error("[deploy] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deployment failed" },
      { status: 500 }
    );
  }
}
