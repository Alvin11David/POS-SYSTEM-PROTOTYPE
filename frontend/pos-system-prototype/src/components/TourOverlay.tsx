import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTour } from "@/store/tourStore";

const TOOLTIP_WIDTH = 360;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function TourOverlay() {
  const { active, step, index, total, next, prev, stop } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!active || !step) {
      setTargetRect(null);
      return;
    }

    const update = () => {
      if (!step.selector) {
        setTargetRect(null);
        return;
      }

      const target = document.querySelector(
        step.selector,
      ) as HTMLElement | null;
      setTargetRect(target?.getBoundingClientRect() ?? null);
    };

    update();
    const raf = window.requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, step]);

  const tooltipStyle = useMemo<React.CSSProperties>(() => {
    if (!step) return {};
    if (!targetRect || step.placement === "center") {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: `min(${TOOLTIP_WIDTH}px, calc(100vw - 2rem))`,
      };
    }

    const margin = 16;
    const width = Math.min(TOOLTIP_WIDTH, window.innerWidth - 32);
    const heightGuess = 220;

    if (step.placement === "top") {
      return {
        left: clamp(targetRect.left, 16, window.innerWidth - width - 16),
        top: clamp(
          targetRect.top - heightGuess - margin,
          16,
          window.innerHeight - 16,
        ),
        width,
      };
    }

    if (step.placement === "left") {
      return {
        left: clamp(
          targetRect.left - width - margin,
          16,
          window.innerWidth - 16,
        ),
        top: clamp(targetRect.top, 16, window.innerHeight - heightGuess - 16),
        width,
      };
    }

    if (step.placement === "right") {
      return {
        left: clamp(
          targetRect.right + margin,
          16,
          window.innerWidth - width - 16,
        ),
        top: clamp(targetRect.top, 16, window.innerHeight - heightGuess - 16),
        width,
      };
    }

    return {
      left: clamp(targetRect.left, 16, window.innerWidth - width - 16),
      top: clamp(targetRect.bottom + margin, 16, window.innerHeight - 16),
      width,
    };
  }, [step, targetRect]);

  if (!active || !step) return null;

  const showHighlight = Boolean(step.selector && targetRect);
  const padding = step.padding ?? 8;
  const spotlightX = targetRect
    ? targetRect.left + targetRect.width / 2
    : window.innerWidth / 2;
  const spotlightY = targetRect
    ? targetRect.top + targetRect.height / 2
    : window.innerHeight / 2;
  const spotlightRadius = targetRect
    ? Math.max(targetRect.width, targetRect.height) / 2 + padding + 22
    : Math.min(window.innerWidth, window.innerHeight) / 4;

  return createPortal(
    <div className="fixed inset-0 z-100">
      <button
        type="button"
        aria-label="Close tour"
        className="absolute inset-0 cursor-default"
        style={{
          background: showHighlight
            ? `radial-gradient(circle ${spotlightRadius}px at ${spotlightX}px ${spotlightY}px, transparent 0, transparent ${spotlightRadius}px, rgba(0, 0, 0, 0.58) ${spotlightRadius + 1}px)`
            : "rgba(0, 0, 0, 0.58)",
        }}
        onClick={stop}
      />

      {showHighlight && targetRect && (
        <div
          className="pointer-events-none absolute rounded-2xl border-2 border-primary shadow-[0_0_0_2px_rgba(255,255,255,0.25)]"
          style={{
            left: targetRect.left - padding,
            top: targetRect.top - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
          }}
        />
      )}

      <div
        className="absolute rounded-2xl border border-border bg-card p-4 shadow-elevated"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Step {index + 1} of {total}
            </p>
            <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={stop}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prev}
            disabled={index === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={stop}>
              Skip
            </Button>
            <Button size="sm" className="shadow-glow" onClick={next}>
              {index === total - 1 ? "Done" : "Next"}
              {index !== total - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
