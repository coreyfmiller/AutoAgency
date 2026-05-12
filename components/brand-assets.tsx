"use client"

import { motion } from "framer-motion"
import { Palette, Type, Image as ImageIcon, Hexagon } from "lucide-react"

const brandColors = [
  { name: "Primary", hex: "#0EA5E9", oklch: "oklch(0.65 0.18 220)" },
  { name: "Secondary", hex: "#8B5CF6", oklch: "oklch(0.55 0.2 280)" },
  { name: "Accent", hex: "#10B981", oklch: "oklch(0.65 0.18 160)" },
  { name: "Dark", hex: "#1E293B", oklch: "oklch(0.25 0.02 250)" },
]

const typography = [
  { name: "Heading", font: "Geist", weight: "Bold", size: "48px" },
  { name: "Subhead", font: "Geist", weight: "Semibold", size: "24px" },
  { name: "Body", font: "Geist", weight: "Regular", size: "16px" },
]

const images = [
  { id: 1, type: "Hero" },
  { id: 2, type: "Feature" },
  { id: 3, type: "Team" },
]

export function BrandAssets() {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <Hexagon className="w-5 h-5 text-primary" />
        Extracted Brand Assets
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Color Palette */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Palette className="w-4 h-4" />
            Color Palette
          </div>
          <div className="flex flex-wrap gap-3">
            {brandColors.map((color, index) => (
              <motion.div
                key={color.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.1,
                  rotateY: 15,
                  rotateX: -10,
                }}
                className="group relative cursor-pointer"
                style={{ perspective: "500px" }}
              >
                {/* Glass cube effect */}
                <div
                  className="w-12 h-12 rounded-xl shadow-lg relative overflow-hidden"
                  style={{
                    background: color.hex,
                    boxShadow: `0 8px 32px ${color.hex}40`,
                  }}
                >
                  {/* Faceted glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20" />
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20" />
                </div>

                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <span className="text-xs font-mono text-muted-foreground">
                    {color.hex}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Hexagon className="w-4 h-4" />
            Logo
          </div>
          <motion.div
            className="relative"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* 3D floating logo */}
            <div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl relative"
              style={{
                boxShadow: "0 20px 60px rgba(0, 180, 200, 0.3)",
                transform: "perspective(500px) rotateX(10deg) rotateY(-10deg)",
              }}
            >
              {/* Logo glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-primary/50"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ filter: "blur(15px)" }}
              />

              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                className="relative z-10"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Faceted overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-black/10" />
            </div>
          </motion.div>
        </div>

        {/* Key Images */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ImageIcon className="w-4 h-4" />
            Key Images
          </div>
          <div className="flex gap-2">
            {images.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="relative"
                style={{ perspective: "500px" }}
              >
                {/* Holographic curved screen effect */}
                <div
                  className="w-16 h-20 rounded-xl bg-gradient-to-br from-secondary to-muted overflow-hidden relative"
                  style={{
                    transform: "perspective(500px) rotateY(-5deg)",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {/* Scan lines */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,180,200,0.03) 2px, rgba(0,180,200,0.03) 4px)",
                    }}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />

                  {/* Image placeholder icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                </div>

                <span className="block mt-1 text-xs text-muted-foreground text-center">
                  {img.type}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Type className="w-4 h-4" />
            Typography
          </div>
          <div className="space-y-3">
            {typography.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  x: 5,
                  rotateY: 3,
                }}
                className="relative pl-3 border-l-2 border-primary/30"
                style={{ perspective: "500px" }}
              >
                {/* Holographic text display */}
                <div className="relative">
                  <p
                    className="font-sans text-foreground"
                    style={{
                      fontWeight: type.weight === "Bold" ? 700 : type.weight === "Semibold" ? 600 : 400,
                      fontSize: type.name === "Heading" ? "16px" : type.name === "Subhead" ? "14px" : "12px",
                    }}
                  >
                    {type.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {type.font} {type.weight}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
