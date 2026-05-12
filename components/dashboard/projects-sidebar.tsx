"use client"

import { ExternalLink, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Project {
  id: string
  name: string
  url: string
  status: "Designing" | "Live" | "Error"
}

const projects: Project[] = [
  { id: "1", name: "acme-landing-v0", url: "acme-v0.vercel.app", status: "Live" },
  { id: "2", name: "startup-xyz-v0", url: "startup-xyz.vercel.app", status: "Designing" },
  { id: "3", name: "portfolio-site-v0", url: "portfolio-v0.vercel.app", status: "Live" },
  { id: "4", name: "ecommerce-demo-v0", url: "ecom-demo.vercel.app", status: "Error" },
]

const statusStyles = {
  Designing: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  Live: "bg-accent/20 text-accent border-accent/30",
  Error: "bg-destructive/20 text-destructive border-destructive/30",
}

export function ProjectsSidebar() {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Active Projects</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Project</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-right text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.url}</p>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant="outline" className={`text-xs ${statusStyles[project.status]}`}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-right">
                  {project.status === "Live" ? (
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <ExternalLink className="mr-1 h-3.5 w-3.5" />
                      <span className="text-xs">View</span>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Settings2 className="mr-1 h-3.5 w-3.5" />
                      <span className="text-xs">Configure</span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
