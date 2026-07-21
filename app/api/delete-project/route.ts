import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { projectName } = await request.json()

    if (!projectName) {
      return NextResponse.json({ error: "projectName is required" }, { status: 400 })
    }

    const vercelName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")

    const results: string[] = []

    // Delete Vercel project
    const vercelRes = await fetch(
      `https://api.vercel.com/v9/projects/${vercelName}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` },
      }
    )
    if (vercelRes.status === 204 || vercelRes.status === 200) {
      results.push("Vercel project deleted")
    } else if (vercelRes.status === 404) {
      results.push("Vercel project not found (already deleted)")
    } else {
      results.push(`Vercel delete failed: ${vercelRes.status}`)
    }

    // Delete GitHub repo
    const owner = process.env.GITHUB_OWNER || "coreyfmiller"
    const githubRes = await fetch(
      `https://api.github.com/repos/${owner}/${vercelName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    )
    if (githubRes.status === 204 || githubRes.status === 200) {
      results.push("GitHub repo deleted")
    } else if (githubRes.status === 404) {
      results.push("GitHub repo not found (already deleted)")
    } else {
      results.push(`GitHub delete failed: ${githubRes.status}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("[delete-project] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    )
  }
}
