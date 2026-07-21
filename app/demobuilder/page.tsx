"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Rocket,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Github,
  Globe,
  Sparkles,
  Copy,
  RotateCcw,
} from "lucide-react"

type JobStatus = "queued" | "generating" | "pushing" | "deploying" | "done" | "error"

interface DemoJob {
  id: string
  projectName: string
  prompt: string
  status: JobStatus
  error?: string
  demoUrl?: string
  githubUrl?: string
  deploymentUrl?: string
}

const INDUSTRY_PRESETS = [
  {
    label: "Plumber / HVAC",
    projectName: "atlantic-plumbing-co",
    prompt: `Build a modern, professional single-page website for a plumbing and HVAC company in New Brunswick, Canada. Business name: "Atlantic Plumbing & Heating". Dark navy and orange color scheme. Include: hero with emergency call CTA, services grid (drain cleaning, water heater, furnace repair, AC installation, bathroom reno, pipe repair), service area map section (Saint John, Fredericton, Moncton), trust badges (licensed, insured, 24/7 emergency), testimonials carousel, and a contact form with phone number prominently displayed. Mobile-first. Use Next.js with Tailwind CSS v4 and shadcn/ui components.`,
  },
  {
    label: "Roofing / Siding",
    projectName: "summit-roofing-nb",
    prompt: `Build a modern, bold single-page website for a roofing and siding company in Atlantic Canada. Business name: "Summit Roofing & Exteriors". Dark charcoal with red accent color scheme. Include: hero with before/after imagery concept and free estimate CTA, services section (asphalt shingles, metal roofing, vinyl siding, soffit & fascia, gutters, emergency repairs), why-choose-us section (GAF certified, 25-year warranty, local crew), gallery grid section, testimonials, financing callout, and contact form. Mention serving Greater Saint John and Fredericton areas. Use Next.js with Tailwind CSS v4 and shadcn/ui.`,
  },
  {
    label: "Landscaping / Hardscaping",
    projectName: "greenstone-landscaping",
    prompt: `Build a modern, nature-inspired single-page website for a landscaping and hardscaping company in New Brunswick. Business name: "Greenstone Landscaping". Earthy green and stone gray color scheme with warm accents. Include: hero with seasonal service CTA, services grid (lawn maintenance, garden design, retaining walls, patios & walkways, irrigation, snow removal), seasonal packages section, project gallery with categories, about section with team photo placeholder, testimonials, and a quote request form. Serving Kennebecasis Valley, Rothesay, Quispamsis. Use Next.js with Tailwind CSS v4 and shadcn/ui.`,
  },
]

let jobCounter = 0
function makeJobId() {
  jobCounter++
  return `job-${Date.now()}-${jobCounter}`
}

const STORAGE_KEY = 'demobuilder_jobs'

function loadJobs(): DemoJob[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveJobs(jobs: DemoJob[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs)) } catch {}
}

export default function DemoBuilderPage() {
  const [jobs, setJobs] = useState<DemoJob[]>([])
  const [newProjectName, setNewProjectName] = useState("")
  const [newPrompt, setNewPrompt] = useState("")
  const [isRunning, setIsRunning] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadJobs()
    if (saved.length > 0) setJobs(saved)
  }, [])

  // Save to localStorage on every change
  useEffect(() => {
    if (jobs.length > 0) saveJobs(jobs)
  }, [jobs])

  const addJob = useCallback(() => {
    if (!newProjectName.trim() || !newPrompt.trim()) return
    
    // Sanitize and validate project name
    const sanitized = newProjectName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
    
    if (sanitized.length < 3) {
      alert("Project name must be at least 3 characters")
      return
    }
    if (sanitized.length > 50) {
      alert("Project name must be under 50 characters")
      return
    }
    
    // Check for common typos — double letters that shouldn't be there
    const suspiciousDoubles = sanitized.match(/(.)\1{2,}/g)
    if (suspiciousDoubles) {
      if (!confirm(`Project name "${sanitized}" has repeated characters (${suspiciousDoubles.join(", ")}). Continue anyway?`)) return
    }
    
    // Check if name already exists in queue
    if (jobs.some(j => j.projectName === sanitized)) {
      alert(`"${sanitized}" is already in the queue`)
      return
    }

    const job: DemoJob = {
      id: makeJobId(),
      projectName: sanitized,
      prompt: newPrompt.trim(),
      status: "queued",
    }
    setJobs((prev) => [...prev, job])
    setNewProjectName("")
    setNewPrompt("")
  }, [newProjectName, newPrompt, jobs])

  const loadPreset = useCallback((preset: typeof INDUSTRY_PRESETS[number]) => {
    setNewProjectName(preset.projectName)
    setNewPrompt(preset.prompt)
  }, [])

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }, [])

  const updateJob = useCallback((id: string, updates: Partial<DemoJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)))
  }, [])

  const runPipeline = useCallback(async () => {
    setIsRunning(true)
    const queued = jobs.filter((j) => j.status === "queued")

    for (const job of queued) {
      try {
        // Step 1: Generate with v0
        updateJob(job.id, { status: "generating" })
        const genRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            v0Prompt: job.prompt,
            customInstructions: undefined,
            skipImages: false,
          }),
        })
        if (!genRes.ok) {
          let errMsg = "Generation failed"
          try {
            const err = await genRes.json()
            errMsg = err.error || errMsg
          } catch {
            const text = await genRes.text().catch(() => "")
            errMsg = text.slice(0, 200) || `HTTP ${genRes.status}`
          }
          throw new Error(errMsg)
        }
        const genData = await genRes.json()
        updateJob(job.id, { demoUrl: genData.demoUrl })

        // Step 2: Push to GitHub
        updateJob(job.id, { status: "pushing" })
        const gitRes = await fetch("/api/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: job.projectName,
            files: genData.files,
            brandName: job.projectName,
            images: [],
            logoUrl: null,
            heroUrl: null,
          }),
        })
        if (!gitRes.ok) {
          let errMsg = "GitHub push failed"
          try {
            const err = await gitRes.json()
            errMsg = err.error || errMsg
          } catch {
            errMsg = `GitHub push HTTP ${gitRes.status}`
          }
          throw new Error(errMsg)
        }
        const gitData = await gitRes.json()
        updateJob(job.id, { githubUrl: gitData.url })

        // Step 3: Deploy to Vercel
        updateJob(job.id, { status: "deploying" })
        const deployRes = await fetch("/api/deploy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: job.projectName,
            githubUrl: gitData.url,
          }),
        })
        if (!deployRes.ok) {
          let errMsg = "Deploy failed"
          try {
            const err = await deployRes.json()
            errMsg = err.error || errMsg
          } catch {
            errMsg = `Deploy HTTP ${deployRes.status}`
          }
          throw new Error(errMsg)
        }
        const deployData = await deployRes.json()
        
        // Step 4: Poll until deployment is actually ready (up to 90 seconds)
        const deployUrl = deployData.url
        let ready = false
        for (let i = 0; i < 18; i++) {
          await new Promise(r => setTimeout(r, 5000))
          try {
            const check = await fetch(deployUrl, { method: "HEAD", redirect: "follow" })
            if (check.ok || check.status === 308 || check.status === 307) {
              ready = true
              break
            }
          } catch {}
        }
        
        updateJob(job.id, { 
          status: "done", 
          deploymentUrl: deployUrl,
          error: ready ? undefined : "Deployed but site may still be building. Check in 1-2 minutes."
        })
      } catch (error) {
        updateJob(job.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    setIsRunning(false)
  }, [jobs, updateJob])

  const retryJob = useCallback((job: DemoJob) => {
    updateJob(job.id, { status: "queued", error: undefined, githubUrl: undefined, deploymentUrl: undefined, demoUrl: undefined })
  }, [updateJob])

  const deleteJob = useCallback(async (job: DemoJob) => {
    try {
      await fetch("/api/delete-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: job.projectName }),
      })
    } catch {}
    setJobs((prev) => prev.filter((j) => j.id !== job.id))
  }, [])

  const queuedCount = jobs.filter((j) => j.status === "queued").length
  const doneCount = jobs.filter((j) => j.status === "done").length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em]">RefreshFactory</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Demo Builder</h1>
          <p className="mt-2 text-muted-foreground">
            Write a prompt, pick a name, hit deploy. Each job runs: v0 generation → GitHub push → Vercel deploy.
          </p>
        </header>

        {/* Input Section */}
        <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Plus className="size-4" />
            Add Demo
          </div>

          {/* Presets */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Quick presets:</p>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => loadPreset(preset)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Project name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="project-name">
              Project name (becomes repo name & vercel subdomain)
            </label>
            <input
              id="project-name"
              type="text"
              placeholder="e.g. atlantic-plumbing-co"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {newProjectName.trim() && (
              <p className="mt-1 text-xs text-muted-foreground">
                Will deploy to: <span className="font-mono text-primary">{newProjectName.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")}.vercel.app</span>
              </p>
            )}
          </div>

          {/* Prompt */}
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="prompt">
              Prompt (describe the site you want v0 to build)
            </label>
            <textarea
              id="prompt"
              rows={6}
              placeholder="Build a modern, professional single-page website for a plumbing company in New Brunswick..."
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addJob}
                disabled={!newProjectName.trim() || !newPrompt.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="size-4" />
                Add to Queue
              </button>
              {jobs.length > 0 && (
                <button
                  type="button"
                  onClick={() => { if (confirm('Clear all jobs?')) { setJobs([]); localStorage.removeItem(STORAGE_KEY) } }}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-red-400 hover:border-red-400/40 transition-colors"
                >
                  <Trash2 className="size-3" />
                  Clear All
                </button>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {jobs.length} job{jobs.length !== 1 ? "s" : ""} total · {queuedCount} queued · {doneCount} done
            </span>
          </div>
        </section>

        {/* Queue */}
        {jobs.length > 0 && (
          <section className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Job Queue</h2>
              {queuedCount > 0 && (
                <button
                  type="button"
                  onClick={runPipeline}
                  disabled={isRunning}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Rocket className="size-4" />
                      Deploy All ({queuedCount})
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onRemove={() => removeJob(job.id)}
                  onRetry={() => retryJob(job)}
                  onDelete={() => deleteJob(job)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Results summary */}
        {doneCount > 0 && (
          <section className="mt-10 rounded-2xl border border-primary/25 bg-primary/5 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              Deployed Sites ({doneCount})
            </h2>
            <div className="space-y-2">
              {jobs
                .filter((j) => j.status === "done")
                .map((job) => (
                  <div key={job.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                    <span className="text-sm font-medium">{job.projectName}</span>
                    <div className="flex items-center gap-3">
                      {job.githubUrl && (
                        <a href={job.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                          <Github className="size-4" />
                        </a>
                      )}
                      {job.deploymentUrl && (
                        <a href={job.deploymentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                          <Globe className="size-3.5" />
                          {job.deploymentUrl.replace("https://", "")}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function JobCard({ job, onRemove, onRetry, onDelete }: { job: DemoJob; onRemove: () => void; onRetry: () => void; onDelete: () => void }) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete "${job.projectName}"? This removes the Vercel site and GitHub repo permanently.`)) return
    setIsDeleting(true)
    onDelete()
  }

  const statusConfig: Record<JobStatus, { icon: typeof Loader2; label: string; color: string }> = {
    queued: { icon: Rocket, label: "Queued", color: "text-muted-foreground" },
    generating: { icon: Loader2, label: "Generating with v0...", color: "text-primary" },
    pushing: { icon: Loader2, label: "Pushing to GitHub...", color: "text-primary" },
    deploying: { icon: Loader2, label: "Deploying to Vercel...", color: "text-primary" },
    done: { icon: CheckCircle2, label: "Deployed", color: "text-green-500" },
    error: { icon: XCircle, label: "Failed", color: "text-red-500" },
  }

  const config = statusConfig[job.status]
  const Icon = config.icon
  const isLoading = ["generating", "pushing", "deploying"].includes(job.status)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Icon className={`size-5 mt-0.5 shrink-0 ${config.color} ${isLoading ? "animate-spin" : ""}`} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{job.projectName}</p>
            <p className={`text-xs ${config.color}`}>{config.label}</p>
            {job.error && <p className="text-xs text-red-400 mt-1">{job.error}</p>}
            {job.deploymentUrl && (
              <a
                href={job.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
              >
                <ExternalLink className="size-3" />
                {job.deploymentUrl}
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {job.status === "error" && (
            <button type="button" onClick={onRetry} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Retry">
              <RotateCcw className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowPrompt((s) => !s)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Show prompt"
          >
            <Copy className="size-3.5" />
          </button>
          {job.status === "queued" && (
            <button type="button" onClick={onRemove} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-red-400" title="Remove from queue">
              <Trash2 className="size-3.5" />
            </button>
          )}
          {(job.status === "done" || job.status === "error") && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400 disabled:opacity-50"
              title="Delete project (removes Vercel + GitHub)"
            >
              {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            </button>
          )}
        </div>
      </div>
      {showPrompt && (
        <pre className="mt-3 rounded-lg bg-background border border-border p-3 text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">
          {job.prompt}
        </pre>
      )}
    </div>
  )
}
