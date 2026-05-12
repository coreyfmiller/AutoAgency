"use client"

import { Search, Code, Github, Triangle, Paintbrush, ArrowRight, Check, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface PipelineStep {
  id: number
  title: string
  icon: React.ReactNode
  status: "completed" | "active" | "pending"
  details: string
}

const pipelineSteps: PipelineStep[] = [
  {
    id: 1,
    title: "Site Audit",
    icon: <Search className="h-5 w-5" />,
    status: "completed",
    details: "42 images, 1 logo, 6 colors",
  },
  {
    id: 2,
    title: "v0 Generation",
    icon: <Code className="h-5 w-5" />,
    status: "completed",
    details: "Template V0-1.0",
  },
  {
    id: 3,
    title: "GitHub Upload",
    icon: <Github className="h-5 w-5" />,
    status: "completed",
    details: "project-xyz-v0",
  },
  {
    id: 4,
    title: "Vercel Deploy",
    icon: <Triangle className="h-5 w-5" />,
    status: "active",
    details: "Deploying...",
  },
  {
    id: 5,
    title: "Kiro Refinement",
    icon: <Paintbrush className="h-5 w-5" />,
    status: "pending",
    details: "Waiting...",
  },
]

function StepCard({ step }: { step: PipelineStep }) {
  const statusColors = {
    completed: "bg-accent text-accent-foreground",
    active: "bg-primary text-primary-foreground",
    pending: "bg-muted text-muted-foreground",
  }

  return (
    <Card className={`relative flex-1 border border-border transition-all ${step.status === "active" ? "ring-2 ring-primary/20" : ""}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${statusColors[step.status]}`}>
            {step.status === "completed" ? (
              <Check className="h-5 w-5" />
            ) : step.status === "active" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              step.icon
            )}
          </div>
          <Badge
            variant={step.status === "completed" ? "default" : step.status === "active" ? "secondary" : "outline"}
            className="text-xs"
          >
            {step.id}
          </Badge>
        </div>
        <CardTitle className="mt-3 text-sm font-medium">{step.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-xs text-muted-foreground">{step.details}</p>
        {step.status === "active" && (
          <Progress value={65} className="mt-3 h-1.5" />
        )}
      </CardContent>
    </Card>
  )
}

function ArrowConnector() {
  return (
    <div className="hidden items-center justify-center px-2 lg:flex">
      <ArrowRight className="h-5 w-5 text-muted-foreground" />
    </div>
  )
}

export function AutomationPipeline() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Automation Pipeline</h2>
        <Badge variant="secondary" className="text-xs">
          Step 4 of 5
        </Badge>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {pipelineSteps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <StepCard step={step} />
            {index < pipelineSteps.length - 1 && <ArrowConnector />}
          </div>
        ))}
      </div>
    </div>
  )
}
