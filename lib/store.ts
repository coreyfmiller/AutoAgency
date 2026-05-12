"use client";

import { create } from "zustand";
import type { AnalysisResult } from "./audit/analyzer";

export type PipelineStep = "idle" | "auditing" | "reviewing" | "generating" | "deploying" | "complete" | "error";

export interface ScrapedInfo {
  url: string;
  title: string;
  description: string;
  images: string[];
  logos: string[];
  fonts: string[];
  colors: string[];
  navLinks: string[];
  headings: { level: number; text: string }[];
  heroText: string | null;
  heroSubtext: string | null;
  socialLinks: string[];
  screenshot: string | null;
}

export interface AuditResult {
  scraped: ScrapedInfo;
  analysis: AnalysisResult;
}

export interface ProjectState {
  // Pipeline state
  currentStep: PipelineStep;
  error: string | null;

  // Audit data
  targetUrl: string;
  auditResult: AuditResult | null;

  // Generation
  customInstructions: string;
  generatedCode: string | null;
  demoUrl: string | null;

  // Deployment
  deploymentUrl: string | null;
  githubUrl: string | null;

  // Actions
  setTargetUrl: (url: string) => void;
  startAudit: () => Promise<void>;
  setCustomInstructions: (instructions: string) => void;
  startGeneration: () => Promise<void>;
  startDeployment: (projectName: string) => Promise<void>;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentStep: "idle",
  error: null,
  targetUrl: "",
  auditResult: null,
  customInstructions: "",
  generatedCode: null,
  demoUrl: null,
  deploymentUrl: null,
  githubUrl: null,

  setTargetUrl: (url) => set({ targetUrl: url }),

  startAudit: async () => {
    const { targetUrl } = get();
    if (!targetUrl) return;

    set({ currentStep: "auditing", error: null });

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Audit failed");
      }

      const data = await response.json();
      set({
        auditResult: data,
        currentStep: "reviewing",
      });
    } catch (error) {
      set({
        currentStep: "error",
        error: error instanceof Error ? error.message : "Audit failed",
      });
    }
  },

  setCustomInstructions: (instructions) =>
    set({ customInstructions: instructions }),

  startGeneration: async () => {
    const { auditResult, customInstructions } = get();
    if (!auditResult) return;

    set({ currentStep: "generating", error: null });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          v0Prompt: auditResult.analysis.v0Prompt,
          customInstructions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await response.json();
      set({
        generatedCode: data.generatedCode,
        demoUrl: data.demoUrl,
        currentStep: "complete",
      });
    } catch (error) {
      set({
        currentStep: "error",
        error: error instanceof Error ? error.message : "Generation failed",
      });
    }
  },

  startDeployment: async (projectName) => {
    const { generatedCode, auditResult } = get();
    if (!generatedCode || !auditResult) return;

    set({ currentStep: "deploying", error: null });

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          generatedCode,
          brandName: auditResult.analysis.businessName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Deployment failed");
      }

      const data = await response.json();
      set({
        deploymentUrl: data.vercel.url,
        githubUrl: data.github.url,
        currentStep: "complete",
      });
    } catch (error) {
      set({
        currentStep: "error",
        error: error instanceof Error ? error.message : "Deployment failed",
      });
    }
  },

  reset: () =>
    set({
      currentStep: "idle",
      error: null,
      targetUrl: "",
      auditResult: null,
      customInstructions: "",
      generatedCode: null,
      demoUrl: null,
      deploymentUrl: null,
      githubUrl: null,
    }),
}));
