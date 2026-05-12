"use client"

import { motion } from "framer-motion"
import { Search, Code2, GitBranch, Rocket, Bot } from "lucide-react"

const steps = [
  { id: 1, name: "Audit", icon: Search, status: "complete" },
  { id: 2, name: "v0", icon: Code2, status: "active" },
  { id: 3, name: "GitHub", icon: GitBranch, status: "pending" },
  { id: 4, name: "Vercel", icon: Rocket, status: "idle" },
  { id: 5, name: "Kiro", icon: Bot, status: "idle" },
]

const statusColors = {
  complete: "from-[oklch(0.7_0.2_150)] to-[oklch(0.65_0.18_170)]",
  active: "from-primary to-accent",
  pending: "from-[oklch(0.8_0.18_85)] to-[oklch(0.75_0.15_60)]",
  idle: "from-muted to-secondary",
}

const statusGlow = {
  complete: "bg-[oklch(0.7_0.2_150)]",
  active: "bg-primary",
  pending: "bg-[oklch(0.8_0.18_85)]",
  idle: "bg-muted-foreground/20",
}

export function PipelineVisualization() {
  return (
    <div className="relative w-full">
      {/* 3D Grid Background */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <svg
          className="w-full h-full opacity-[0.15]"
          viewBox="0 0 800 200"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Perspective grid lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.line
              key={`v-${i}`}
              x1={40 * i}
              y1="0"
              x2={40 * i + 100}
              y2="200"
              stroke="url(#gridGrad)"
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.line
              key={`h-${i}`}
              x1="0"
              y1={20 * i}
              x2="800"
              y2={20 * i + 20}
              stroke="url(#gridGrad)"
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            />
          ))}
        </svg>
      </div>

      <div className="relative glass-panel rounded-2xl p-8">
        <h2 className="text-lg font-semibold text-foreground mb-8 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Automation Pipeline
        </h2>

        <div className="flex items-center justify-between relative">
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-24 pointer-events-none" style={{ top: "20px" }}>
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
            </defs>
            {steps.slice(0, -1).map((_, i) => {
              const x1 = (i + 1) * (100 / (steps.length + 1)) * 7.5 + 50
              const x2 = (i + 2) * (100 / (steps.length + 1)) * 7.5 + 50
              return (
                <g key={i}>
                  {/* Background line */}
                  <line
                    x1={`${x1}%`}
                    y1="35"
                    x2={`${x2}%`}
                    y2="35"
                    stroke="var(--border)"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                  />
                  {/* Animated data flow */}
                  <motion.line
                    x1={`${x1}%`}
                    y1="35"
                    x2={`${x2}%`}
                    y2="35"
                    stroke="url(#lineGrad)"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.3,
                    }}
                  />
                </g>
              )
            })}
          </svg>

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="relative z-10 flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Glow effect */}
              <motion.div
                className={`absolute w-20 h-20 rounded-full ${statusGlow[step.status as keyof typeof statusGlow]} blur-xl`}
                animate={{
                  scale: step.status === "active" ? [1, 1.3, 1] : 1,
                  opacity: step.status === "active" ? [0.3, 0.6, 0.3] : 0.2,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Node */}
              <motion.div
                className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${statusColors[step.status as keyof typeof statusColors]} flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={
                  step.status === "active"
                    ? {
                        boxShadow: [
                          "0 0 20px rgba(0, 180, 200, 0.3)",
                          "0 0 40px rgba(0, 180, 200, 0.5)",
                          "0 0 20px rgba(0, 180, 200, 0.3)",
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Step number badge */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-foreground">
                  {step.id}
                </div>
                <step.icon className="w-7 h-7 text-white" />

                {/* Data particles around active node */}
                {step.status === "active" && (
                  <>
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-white"
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 2 + i * 0.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{
                          top: "50%",
                          left: "50%",
                          transformOrigin: `${-20 - i * 5}px 0px`,
                        }}
                      />
                    ))}
                  </>
                )}
              </motion.div>

              {/* Label */}
              <span className="text-sm font-medium text-foreground">{step.name}</span>

              {/* Status indicator */}
              <motion.div
                className={`w-2 h-2 rounded-full ${statusGlow[step.status as keyof typeof statusGlow]}`}
                animate={
                  step.status === "active" || step.status === "pending"
                    ? {
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1],
                      }
                    : {}
                }
                transition={{
                  duration: step.status === "pending" ? 1.5 : 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
