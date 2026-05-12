import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

interface DeployRequest {
  projectName: string;
  generatedCode: string;
  brandName: string;
}

export async function POST(request: NextRequest) {
  try {
    const { projectName, generatedCode, brandName }: DeployRequest =
      await request.json();

    if (!projectName || !generatedCode) {
      return NextResponse.json(
        { error: "Project name and generated code are required" },
        { status: 400 }
      );
    }

    const repoName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    // Step 1: Create GitHub repository
    const githubRepo = await createGitHubRepo(repoName, brandName);

    // Step 2: Push generated code to the repo
    await pushCodeToRepo(githubRepo.full_name, generatedCode, brandName);

    // Step 3: Create Vercel project and deploy
    const deployment = await createVercelDeployment(
      repoName,
      githubRepo.full_name
    );

    return NextResponse.json({
      success: true,
      github: {
        url: githubRepo.html_url,
        fullName: githubRepo.full_name,
      },
      vercel: {
        url: deployment.url,
        projectId: deployment.projectId,
        deploymentId: deployment.id,
      },
    });
  } catch (error) {
    console.error("Deploy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deployment failed" },
      { status: 500 }
    );
  }
}

async function createGitHubRepo(name: string, description: string) {
  const response = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify({
      name,
      description: `Auto-generated rebuild of ${description} by AutoAgency`,
      private: false,
      auto_init: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub repo creation failed: ${error}`);
  }

  return response.json();
}

async function pushCodeToRepo(
  fullName: string,
  code: string,
  brandName: string
) {
  // Create a package.json for the generated project
  const packageJson = JSON.stringify(
    {
      name: fullName.split("/")[1],
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
      dependencies: {
        next: "^14",
        react: "^18",
        "react-dom": "^18",
        "lucide-react": "^0.400",
        "tailwindcss": "^3.4",
        "class-variance-authority": "^0.7",
        clsx: "^2",
        "tailwind-merge": "^2",
      },
    },
    null,
    2
  );

  // Push files to the repo
  const files = [
    { path: "app/page.tsx", content: code },
    { path: "package.json", content: packageJson },
    {
      path: "README.md",
      content: `# ${brandName} - Rebuilt by AutoAgency\n\nThis project was automatically generated and deployed by AutoAgency.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`,
    },
  ];

  for (const file of files) {
    await fetch(
      `https://api.github.com/repos/${fullName}/contents/${file.path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Add ${file.path} - AutoAgency generated`,
          content: Buffer.from(file.content).toString("base64"),
        }),
      }
    );
  }
}

async function createVercelDeployment(
  projectName: string,
  githubRepo: string
) {
  // Create Vercel project linked to GitHub repo
  const projectResponse = await fetch("https://api.vercel.com/v10/projects", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      framework: "nextjs",
      gitRepository: {
        type: "github",
        repo: githubRepo,
      },
      buildCommand: "next build",
      outputDirectory: ".next",
      resourceConfig: {
        buildMachineType: "ELASTIC",
      },
    }),
  });

  if (!projectResponse.ok) {
    const error = await projectResponse.text();
    throw new Error(`Vercel project creation failed: ${error}`);
  }

  const project = await projectResponse.json();

  // Trigger deployment
  const deployResponse = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      project: project.id,
      target: "production",
      gitSource: {
        type: "github",
        repoId: githubRepo,
        ref: "main",
      },
      projectSettings: {
        buildCommand: "next build",
        outputDirectory: ".next",
        framework: "nextjs",
        resourceConfig: {
          buildMachineType: "ELASTIC",
        },
      },
    }),
  });

  if (!deployResponse.ok) {
    const error = await deployResponse.text();
    throw new Error(`Vercel deployment failed: ${error}`);
  }

  const deployment = await deployResponse.json();

  return {
    url: `https://${deployment.url}`,
    projectId: project.id,
    id: deployment.id,
  };
}
