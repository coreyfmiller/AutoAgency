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

    // Extract repo full name from GitHub URL (e.g., "coreyfmiller/smith-roofing")
    const repoMatch = githubUrl.match(/github\.com\/([^/]+\/[^/]+)/);
    if (!repoMatch) {
      return NextResponse.json(
        { error: "Invalid GitHub URL" },
        { status: 400 }
      );
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

    // Trigger a deployment
    const deployResponse = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: vercelName,
        project: project.id,
        target: "production",
        gitSource: {
          type: "github",
          repoId: String(project.link?.repoId || ""),
          ref: "main",
        },
        projectSettings: {
          buildCommand: "next build",
          framework: "nextjs",
          resourceConfig: {
            buildMachineType: "elastic",
          },
        },
      }),
    });

    if (!deployResponse.ok) {
      const error = await deployResponse.text();
      console.error("[deploy] Deployment trigger failed:", error);
      // Project is created and linked — it will auto-deploy on next push
      return NextResponse.json({
        success: true,
        url: `https://${vercelName}.vercel.app`,
        projectId: project.id,
        note: "Project created and linked to GitHub. Push to the repo to trigger a build.",
      });
    }

    const deployment = await deployResponse.json();
    console.log("[deploy] Deployment triggered:", deployment.url);

    // Use the clean project URL, not the unique deployment URL
    return NextResponse.json({
      success: true,
      url: `https://${vercelName}.vercel.app`,
      projectId: project.id,
      deploymentId: deployment.id,
    });
  } catch (error) {
    console.error("[deploy] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deployment failed" },
      { status: 500 }
    );
  }
}
