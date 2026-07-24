"use client";

import { Button } from "@/components/ui";
import { useSessionStatus } from "@/lib/auth/useSessionStatus";
import cn from "classnames";
import styles from "./WorkspaceCta.module.scss";

// Auth-aware landing CTA: guests create a workspace, signed-in users jump
// straight to their dashboard. While the session resolves we keep the exact
// button footprint (widest label, hidden) so the section never shifts or
// flashes the wrong link — same approach as the nav.
interface WorkspaceCtaProps {
  className?: string;
}

export const WorkspaceCta = ({ className }: WorkspaceCtaProps) => {
  const { authenticated, pending: isPending } = useSessionStatus();

  if (isPending) {
    return (
      <Button
        variant="secondary"
        size="lg"
        disabled
        aria-hidden
        className={cn(styles.pending, className)}
      >
        Create your workspace
      </Button>
    );
  }

  return authenticated ? (
    <Button href="/dashboard" prefetch={false} variant="secondary" size="lg" className={className}>
      Go to dashboard
    </Button>
  ) : (
    <Button href="/signup" prefetch={false} variant="secondary" size="lg" className={className}>
      Create your workspace
    </Button>
  );
};
