"use client";

import { Button } from "@/components/ui";
import { useSession } from "@/lib/auth-client";
import styles from "./WorkspaceCta.module.scss";

// Auth-aware landing CTA: guests create a workspace, signed-in users jump
// straight to their dashboard. While the session resolves we keep the exact
// button footprint (widest label, hidden) so the section never shifts or
// flashes the wrong link — same approach as the nav.
export const WorkspaceCta = () => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Button variant="secondary" size="lg" disabled aria-hidden className={styles.pending}>
        Create your workspace
      </Button>
    );
  }

  return session?.user ? (
    <Button href="/dashboard" variant="secondary" size="lg">
      Go to dashboard
    </Button>
  ) : (
    <Button href="/signup" variant="secondary" size="lg">
      Create your workspace
    </Button>
  );
};
