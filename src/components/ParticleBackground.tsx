import { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import { cn } from "@/lib/utils";

interface ParticleBackgroundProps {
  className?: string;
}

// Minimal, elegant gradient + subtle particles background for pages
export default function ParticleBackground({ className }: ParticleBackgroundProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  // Align particle colors with shadcn theme CSS variables at runtime
  const primaryHsl = useMemo(() => {
    if (typeof window === "undefined") return "#34d399"; // fallback
    const v = getComputedStyle(document.documentElement).getPropertyValue("--primary");
    return v ? `hsl(${v.trim()})` : "#34d399";
  }, []);

  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {/* Gradient layers for depth and color hierarchy */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted to-background" />
      <div className="absolute -top-1/3 -left-1/4 h-[60vw] w-[60vw] rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute -bottom-1/3 -right-1/4 h-[55vw] w-[55vw] rounded-full bg-primary/10 blur-[120px]" />

      {/* Subtle particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0"
        options={{
          background: { color: { value: "transparent" } },
          fullScreen: { enable: false },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: { value: 50, density: { enable: true, area: 1000 } },
            color: { value: primaryHsl },
            opacity: { value: 0.12 },
            size: { value: { min: 0.5, max: 1.5 } },
            links: { enable: true, distance: 100, color: primaryHsl, opacity: 0.06, width: 0.8 },
            move: { enable: true, speed: 0.2, direction: "none", outModes: { default: "out" } },
          },
          interactivity: {
            events: { onHover: { enable: true, mode: "grab" }, resize: true },
            modes: { grab: { distance: 100, links: { opacity: 0.12 } } },
          },
        }}
      />

      {/* Soft vignette to enhance contrast */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-black/10" />
    </div>
  );
}
