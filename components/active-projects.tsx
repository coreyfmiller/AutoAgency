"use client"

import { motion } from "framer-motion"
import { ExternalLink, MoreHorizontal } from "lucide-react"

const projects = [
  {
    id: 1,
    name: "techstartup.io",
    status: "live",
    lastUpdated: "2 mins ago",
    progress: 100,
  },
  {
    id: 2,
    name: "creativestudio.co",
    status: "designing",
    lastUpdated: "5 mins ago",
    progress: 65,
  },
  {
    id: 3,
    name: "ecommerceplus.com",
    status: "building",
    lastUpdated: "12 mins ago",
    progress: 40,
  },
  {
    id: 4,
    name: "portfoliosite.dev",
    status: "auditing",
    lastUpdated: "18 mins ago",
    progress: 15,
  },
]

const statusConfig = {
  live: { color: "bg-[oklch(0.7_0.2_150)]", label: "Live" },
  designing: { color: "bg-[oklch(0.8_0.18_85)]", label: "Designing" },
  building: { color: "bg-primary", label: "Building" },
  auditing: { color: "bg-accent", label: "Auditing" },
}

export function ActiveProjects() {
  return (
    <div className="glass-panel rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Active Projects
        </h2>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((project, index) => {
          const status = statusConfig[project.status as keyof typeof statusConfig]
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-foreground truncate">
                      {project.name}
                    </h3>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status orb */}
                    <div className="flex items-center gap-2">
                      <motion.div
                        className={`w-2.5 h-2.5 rounded-full ${status.color}`}
                        animate={
                          project.status !== "live"
                            ? {
                                scale: [1, 1.3, 1],
                                opacity: [1, 0.6, 1],
                              }
                            : {}
                        }
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {status.label}
                      </span>
                    </div>

                    <span className="text-xs text-muted-foreground/60">•</span>

                    {/* Live updating timestamp */}
                    <motion.span
                      className="text-xs text-muted-foreground font-mono"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {project.lastUpdated}
                    </motion.span>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="ml-4 flex flex-col items-end gap-1">
                  <span className="text-xs font-medium text-foreground">
                    {project.progress}%
                  </span>
                  <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${status.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
