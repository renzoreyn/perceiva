"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TutorialStep {
  id: string;
  target: string; // CSS selector
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  offset?: { x?: number; y?: number };
}

interface SpotlightTutorialProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

const PADDING = 12; // spotlight padding around target

export default function SpotlightTutorial({ steps, onComplete, onSkip }: SpotlightTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const rafRef = useRef<number>(0);

  const step = steps[currentStep];

  const measureTarget = useCallback(() => {
    const el = document.querySelector(step.target);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [step.target]);

  useEffect(() => {
    setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
      measureTarget();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measureTarget]);

  useEffect(() => {
    // Wait for next frame so DOM has painted
    rafRef.current = requestAnimationFrame(() => {
      measureTarget();
      // Scroll target into view
      const el = document.querySelector(step.target);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [currentStep, measureTarget]);

  function next() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onComplete();
    }
  }

  function prev() {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  }

  const isLast = currentStep === steps.length - 1;

  // Build SVG clip path for the "hole" effect
  const getClipPath = () => {
    if (!targetRect) return "none";
    const { w, h } = windowSize;
    const r = targetRect;
    const x = r.left - PADDING;
    const y = r.top - PADDING;
    const width = r.width + PADDING * 2;
    const height = r.height + PADDING * 2;
    const radius = 16;

    return `path('M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${x + radius} ${y} Q ${x} ${y} ${x} ${y + radius} L ${x} ${y + height - radius} Q ${x} ${y + height} ${x + radius} ${y + height} L ${x + width - radius} ${y + height} Q ${x + width} ${y + height} ${x + width} ${y + height - radius} L ${x + width} ${y + radius} Q ${x + width} ${y} ${x + width - radius} ${y} Z')`;
  };

  // Tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const { position } = step;
    const GAP = 20;
    const r = targetRect;

    switch (position) {
      case "bottom":
        return { top: r.bottom + PADDING + GAP, left: r.left + r.width / 2, transform: "translateX(-50%)" };
      case "top":
        return { top: r.top - PADDING - GAP, left: r.left + r.width / 2, transform: "translate(-50%, -100%)" };
      case "right":
        return { top: r.top + r.height / 2, left: r.right + PADDING + GAP, transform: "translateY(-50%)" };
      case "left":
        return { top: r.top + r.height / 2, left: r.left - PADDING - GAP, transform: "translate(-100%, -50%)" };
      default:
        return { top: r.bottom + PADDING + GAP, left: r.left + r.width / 2, transform: "translateX(-50%)" };
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Dark overlay with cutout */}
        <motion.div
          key={`overlay-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 pointer-events-all"
          style={{
            background: "rgba(0, 0, 0, 0.65)",
            clipPath: getClipPath(),
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
          onClick={onSkip}
        />

        {/* Spotlight ring glow */}
        {targetRect && (
          <motion.div
            key={`glow-${currentStep}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute pointer-events-none"
            style={{
              left: targetRect.left - PADDING - 2,
              top: targetRect.top - PADDING - 2,
              width: targetRect.width + (PADDING + 2) * 2,
              height: targetRect.height + (PADDING + 2) * 2,
              borderRadius: 18,
              boxShadow: "0 0 0 2px rgba(10, 132, 255, 0.8), 0 0 40px rgba(10, 132, 255, 0.25)",
            }}
          />
        )}

        {/* Tooltip card */}
        <motion.div
          key={`tooltip-${currentStep}`}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
          className="absolute pointer-events-all"
          style={{ ...getTooltipStyle(), position: "fixed" }}
        >
          <div className="w-72 rounded-3xl border border-border/80 bg-card shadow-apple-xl overflow-hidden">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5 px-5 pt-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === currentStep ? "w-4 h-1.5 bg-primary" : i < currentStep ? "w-1.5 h-1.5 bg-primary/40" : "w-1.5 h-1.5 bg-border"
                  )}
                />
              ))}
              <span className="ml-auto text-[10px] text-muted-foreground">{currentStep + 1}/{steps.length}</span>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-2">
              <h3 className="text-base font-semibold leading-tight">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-5 pb-5 gap-2">
              <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs text-muted-foreground">
                Skip tour
              </Button>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={prev} className="gap-1">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button size="sm" onClick={next} className="gap-2">
                  {isLast ? "Done" : "Next"} {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
