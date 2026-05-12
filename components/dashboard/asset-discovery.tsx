"use client"

import { Palette, Type, Image, ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const extractedColors = [
  { hex: "#1E40AF", name: "Primary Blue" },
  { hex: "#3B82F6", name: "Light Blue" },
  { hex: "#10B981", name: "Accent Green" },
  { hex: "#1F2937", name: "Dark Gray" },
  { hex: "#F3F4F6", name: "Light Gray" },
  { hex: "#FFFFFF", name: "White" },
]

const sampleImages = [
  { id: 1, label: "Hero" },
  { id: 2, label: "About" },
  { id: 3, label: "Feature 1" },
  { id: 4, label: "Feature 2" },
  { id: 5, label: "Team" },
  { id: 6, label: "CTA" },
]

export function AssetDiscovery() {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-5 w-5 text-primary" />
          Asset Discovery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Colors Section */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-secondary">
              <Palette className="h-3.5 w-3.5 text-secondary-foreground" />
            </span>
            Colors
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {extractedColors.map((color) => (
              <div key={color.hex} className="group flex flex-col items-center gap-1.5">
                <div
                  className="h-10 w-10 rounded-lg border border-border shadow-sm transition-transform group-hover:scale-110"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-[10px] font-mono text-muted-foreground">{color.hex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Section */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-secondary">
              <Type className="h-3.5 w-3.5 text-secondary-foreground" />
            </span>
            Typography
          </h3>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-2xl font-bold text-foreground">Inter Bold</p>
            <p className="mt-1 text-base text-muted-foreground">
              The quick brown fox jumps over the lazy dog.
            </p>
            <p className="mt-2 text-xs text-muted-foreground font-mono">
              Font Family: Inter, -apple-system, sans-serif
            </p>
          </div>
        </div>

        {/* Logo Section */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-secondary">
              <Image className="h-3.5 w-3.5 text-secondary-foreground" />
            </span>
            Brand Logo
          </h3>
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-6">
            <div className="flex h-16 w-32 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-xl font-bold text-primary">LOGO</span>
            </div>
          </div>
        </div>

        {/* Key Images Section */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-secondary">
              <ImageIcon className="h-3.5 w-3.5 text-secondary-foreground" />
            </span>
            Key Images
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {sampleImages.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
              >
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-background/80 px-1.5 py-1 text-center backdrop-blur-sm">
                  <span className="text-[10px] font-medium text-foreground">{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
