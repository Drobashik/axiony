"use client";

import cn from "classnames";
import { OAUTH_PROVIDERS } from "../lib/data";
import type { AuthMode, OAuthProvider } from "../lib/types";
import styles from "../screen/AuthScreen.module.scss";
import { GitHubIcon, GitLabIcon, GoogleIcon, Spinner } from "./icons";

const PROVIDER_ICON: Record<OAuthProvider["id"], typeof GitHubIcon> = {
  google: GoogleIcon,
  github: GitHubIcon,
  gitlab: GitLabIcon,
};

interface OAuthRowProps {
  mode: AuthMode;
  /** Provider currently "connecting", or null. */
  pending: OAuthProvider["id"] | null;
  /** Disables the row while the email form is mid-submit. */
  disabled?: boolean;
  onSelect: (id: OAuthProvider["id"]) => void;
}

export const OAuthRow = ({ mode, pending, disabled, onSelect }: OAuthRowProps) => {
  const verb = mode === "signup" ? "Sign up" : "Continue";
  const featured = OAUTH_PROVIDERS.filter((p) => p.featured);
  const compact = OAUTH_PROVIDERS.filter((p) => !p.featured);

  const renderButton = (provider: OAuthProvider, wide: boolean) => {
    const Glyph = PROVIDER_ICON[provider.id];
    const connecting = pending === provider.id;
    const fullLabel = `${verb} with ${provider.label}`;

    return (
      <button
        key={provider.id}
        type="button"
        className={cn(
          styles.oauthBtn,
          wide && styles.oauthBtnWide,
          connecting && styles.oauthBtnBusy,
        )}
        onClick={() => onSelect(provider.id)}
        disabled={disabled || pending !== null}
        aria-busy={connecting}
        // Compact buttons show only the provider name, so give them the
        // full phrase as their accessible name.
        aria-label={wide ? undefined : fullLabel}
      >
        {connecting ? <Spinner className={styles.spin} size={17} /> : <Glyph size={17} />}
        <span>{connecting ? "Connecting…" : wide ? fullLabel : provider.label}</span>
      </button>
    );
  };

  return (
    <div className={styles.oauthGroup}>
      {featured.map((provider) => renderButton(provider, true))}
      {compact.length > 0 && (
        <div className={styles.oauthRow}>
          {compact.map((provider) => renderButton(provider, false))}
        </div>
      )}
    </div>
  );
};
