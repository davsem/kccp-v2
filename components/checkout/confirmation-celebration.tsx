"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfirmationCelebration() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const fire = (particleRatio: number, opts: confetti.Options) => {
      void confetti({
        origin: { y: 0.55 },
        ...opts,
        particleCount: Math.floor(220 * particleRatio),
      });
    };

    const timer = setTimeout(() => {
      fire(0.25, { spread: 26, startVelocity: 55, colors: ["#a61646", "#edbd0e"] });
      fire(0.2, { spread: 60, colors: ["#a61646", "#edbd0e", "#ffffff"] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#edbd0e", "#ffffff"] });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ["#a61646"] });
      fire(0.1, { spread: 120, startVelocity: 45, colors: ["#edbd0e", "#a61646"] });
    }, 350);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
