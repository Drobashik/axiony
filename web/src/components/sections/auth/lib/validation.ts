// Pure, dependency-free validators for the auth forms. Kept separate from
// the React hook so the rules are easy to read, reuse, and reason about.

export const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export interface PasswordStrength {
  /** 0–4. Below 2 is rejected on signup. */
  score: number;
  label: string;
  /** Token name (without the `--`) used to colour the meter. */
  tone: "severity-critical" | "severity-moderate" | "green";
}

/**
 * Lightweight password strength heuristic — length plus character
 * variety. Deliberately simple: enough to nudge users toward a stronger
 * secret without pretending to be a real entropy estimator.
 */
export const getPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length === 0) return { score: 0, label: "", tone: "severity-critical" };
  if (score <= 1) return { score: 1, label: "Weak", tone: "severity-critical" };
  if (score === 2) return { score: 2, label: "Fair", tone: "severity-moderate" };
  if (score === 3) return { score: 3, label: "Good", tone: "green" };
  return { score: 4, label: "Strong", tone: "green" };
};
