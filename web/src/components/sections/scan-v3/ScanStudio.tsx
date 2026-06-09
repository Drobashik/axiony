"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui";
import { ScanNav } from "@/components/layout";
import cn from "classnames";
import { UpgradeDialog } from "@/components/sections/dashboard/billing";
import { useBilling } from "@/lib/billing";
import type { BillingPlan } from "@/lib/billing";
import { useReveal } from "@/lib/hooks/useReveal";
import { useWorkspace } from "@/lib/workspace";
import { ReportView } from "./components/ReportView";
import { ResetScanDialog } from "./components/ResetScanDialog";
import { ScanStage } from "./components/ScanStage";
import { StudioCta } from "./components/StudioCta";
import { StudioHeader } from "./components/StudioHeader";
import { UrlConsole } from "./components/UrlConsole";
import { useScanEngine } from "./hooks/useScanEngine";
import type { WcagLevel } from "./types";
import styles from "./ScanStudio.module.scss";

export const ScanStudio = () => {
  useReveal();
  const router = useRouter();
  const engine = useScanEngine();
  const { workspace } = useWorkspace();
  const { billing } = useBilling();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<WcagLevel>("AA");
  const [focusSignal, setFocusSignal] = useState(0);
  const [resetDialog, setResetDialog] = useState<"report" | "scanning" | null>(null);
  const [upgradePlan, setUpgradePlan] = useState<Exclude<BillingPlan, "free"> | null>(null);
  const topRef = useRef<HTMLElement>(null);

  const busy = engine.status === "scanning";
  const active = engine.status !== "idle";

  // Signed-in users scan inside the dashboard shell (clean tool, no
  // marketing) — send them there instead of the public studio.
  useEffect(() => {
    if (workspace) router.replace("/dashboard/scan");
  }, [workspace, router]);

  // Bring the scan view to the top so the stage/results are visible without
  // the user having to scroll (e.g. after a "scan another" from the bottom).
  const scrollToTop = () => {
    requestAnimationFrame(() =>
      topRef.current?.scrollIntoView({
        behavior: engine.reduce ? "auto" : "smooth",
        block: "start",
      }),
    );
  };

  const runScan = (url: string) => {
    engine.start(url, level);
    scrollToTop();
  };

  const focusUrlConsole = () => {
    scrollToTop();
    setFocusSignal((value) => value + 1);
  };

  const clearForNewScan = () => {
    setResetDialog(null);
    engine.reset();
    setQuery("");
    scrollToTop();
    setFocusSignal((value) => value + 1);
  };

  const requestNewScan = () => {
    if (engine.status === "results" && engine.report) {
      setResetDialog("report");
      return;
    }

    if (engine.status === "scanning") {
      setResetDialog("scanning");
      return;
    }

    if (engine.status === "idle") {
      focusUrlConsole();
      return;
    }

    clearForNewScan();
  };

  const rescanCurrent = () => {
    const target = engine.url || engine.report?.url || query;
    if (!target) {
      focusUrlConsole();
      return;
    }

    setResetDialog(null);
    setQuery(target);
    engine.start(target, level);
    scrollToTop();
  };

  const stopScan = () => {
    const target = engine.url;
    setResetDialog(null);
    engine.reset();
    setQuery(target);
    scrollToTop();
    setFocusSignal((value) => value + 1);
  };

  const openUpgrade = (plan: Exclude<BillingPlan, "free"> = "pro") => setUpgradePlan(plan);

  // The URL form lives at the top while idle, then docks below the report
  // once there's a result (so the result is what the user sees first).
  const consoleBlock = (
    <div className={styles.consoleSlot}>
      {engine.status === "results" && <p className={styles.dockTitle}>Scan another site</p>}
      <UrlConsole
        url={query}
        level={level}
        busy={busy}
        onUrlChange={setQuery}
        onLevelChange={setLevel}
        focusSignal={focusSignal}
        onScan={runScan}
      />
    </div>
  );

  // Avoid flashing the public studio while the redirect above runs.
  if (workspace) return null;

  return (
    <>
      <ScanNav
        status={engine.status}
        currentUrl={engine.url}
        progress={engine.progress}
        score={engine.report?.score}
        issueCount={engine.report?.issues.length}
        onFocusUrl={focusUrlConsole}
        onNewScan={requestNewScan}
        onRescan={rescanCurrent}
        onStop={stopScan}
      />

      <section id="scanner" ref={topRef} className={cn(styles.top, active && styles.topActive)}>
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.glow} aria-hidden="true" />

        <Container className={styles.topInner}>
          {engine.status === "idle" && (
            <>
              <StudioHeader />
              {consoleBlock}
            </>
          )}

          {engine.status === "scanning" && (
            <div className={styles.runner}>
              <ScanStage
                url={engine.url}
                progress={engine.progress}
                lines={engine.lines}
                reduce={engine.reduce}
              />
            </div>
          )}

          {engine.status === "failed" && (
            <>
              <div className={styles.runner}>
                <p className={styles.srOnly} role="alert">
                  {engine.error ?? "Scan failed."}
                </p>
                <ScanStage
                  url={engine.url}
                  progress={engine.progress}
                  lines={engine.lines}
                  reduce={engine.reduce}
                  status="failed"
                />
              </div>
              <div className={styles.consoleSlot}>
                <p className={styles.dockTitle}>Try another site</p>
                <UrlConsole
                  url={query}
                  level={level}
                  busy={busy}
                  onUrlChange={setQuery}
                  onLevelChange={setLevel}
                  focusSignal={focusSignal}
                  onScan={runScan}
                />
              </div>
            </>
          )}

          {engine.status === "results" && engine.report && (
            <>
              <div className={styles.runner}>
                <p className={styles.srOnly} role="status">
                  Scan complete. Showing the accessibility report.
                </p>
                <ReportView
                  report={engine.report}
                  reduce={engine.reduce}
                  onRescan={rescanCurrent}
                  freePreview={billing.plan === "free"}
                  onUpgrade={() => openUpgrade("pro")}
                />
              </div>
              {consoleBlock}
            </>
          )}
        </Container>
      </section>

      <StudioCta />

      {resetDialog && (
        <ResetScanDialog
          mode={resetDialog}
          url={engine.url || engine.report?.url || query}
          onCancel={() => setResetDialog(null)}
          onConfirm={clearForNewScan}
        />
      )}

      {upgradePlan && (
        <UpgradeDialog
          currentPlan={billing.plan}
          initialPlan={upgradePlan}
          onClose={() => setUpgradePlan(null)}
        />
      )}
    </>
  );
};
