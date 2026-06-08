export type AuthMode = "login" | "signup";

/** Top-level state of the auth form's mock submit lifecycle. */
export type AuthStatus = "idle" | "submitting" | "success" | "error";

/** Which screen the form is showing — the credentials form or the
 * inline "forgot password" reset step (login only). */
export type AuthView = "form" | "reset";

export type AuthFieldName = "name" | "email" | "password";

/** One bullet in the value panel shown beside the form. */
export interface AuthValuePoint {
  icon: "baseline" | "trend" | "git" | "spark" | "team";
  title: string;
  desc: string;
}

export interface AuthCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  points: AuthValuePoint[];
  trust: string[];
}

export interface OAuthProvider {
  id: "google" | "github" | "gitlab";
  label: string;
  /** Rendered as a prominent full-width button rather than in the grid. */
  featured?: boolean;
}
