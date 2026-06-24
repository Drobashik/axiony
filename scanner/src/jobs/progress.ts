import type { MutableScanJob } from "../types";

const PROGRESS_RANGE_BY_MESSAGE: Record<string, readonly [number, number]> = {
  "Launching browser": [6, 12],
  "Opening page": [18, 29],
  "Waiting for page readiness": [34, 48],
  "Retrying with a fresh browser session": [44, 52],
  "Injecting accessibility engine": [53, 64],
  "Validating selector": [62, 72],
  "Running accessibility checks": [74, 87],
  "Processing results": [90, 96],
};

export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomProgressForMessage = (
  job: MutableScanJob,
  message: string,
): number => {
  const range = PROGRESS_RANGE_BY_MESSAGE[message];
  if (!range) return Math.min(96, job.progress + randomInt(1, 4));

  const [min, max] = range;
  const upper = Math.min(max, 96);
  if (job.progress >= upper)
    return Math.min(96, job.progress + randomInt(0, 2));

  const lower = Math.min(Math.max(job.progress + 1, min), upper);
  return randomInt(lower, upper);
};
