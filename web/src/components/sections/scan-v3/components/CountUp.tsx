"use client";

import { useCountUp } from "../hooks/useCountUp";

interface CountUpProps {
  value: number;
  durationMs?: number;
}

/** Renders a number that animates from 0 → value (reduced-motion aware). */
export const CountUp = ({ value, durationMs }: CountUpProps) => <>{useCountUp(value, durationMs)}</>;
