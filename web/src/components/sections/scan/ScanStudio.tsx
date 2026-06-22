"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui";
import { ScanNav } from "@/components/layout";
import cn from "classnames";
import { useSession } from "@/lib/auth-client";
import { useReveal } from "@/lib/hooks/useReveal";
import { recordGuestScan, useGuestScanUsage } from "@/lib/scan/guest-usage";
import { pendingFromReport, writePendingScan } from "@/lib/workspace";
import { GuestScanLimitDialog } from "./components/GuestScanLimitDialog";
import { ReportView } from "./components/ReportView";
import { ResetScanDialog } from "./components/ResetScanDialog";
import { ScanStage } from "./components/ScanStage";
import { StudioHeader } from "./components/StudioHeader";
import { UrlConsole } from "./components/UrlConsole";
import { useScanEngine } from "./hooks/useScanEngine";
import type { WcagLevel } from "./types";
import styles from "./ScanStudio.module.scss";

export const ScanStudio = () => {
  useReveal();
  const router = useRouter();
  const engine = useScanEngine();
  const { data: session } = useSession();
  const guestUsage = useGuestScanUsage();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<WcagLevel>("AA");
  const [focusSignal, setFocusSignal] = useState(0);
  const [resetDialog, setResetDialog] = useState<"report" | "scanning" | null>(null);
  const [guestLimitDialog, setGuestLimitDialog] = useState(false);
  const topRef = useRef<HTMLElement>(null);
  const recordedGuestKey = useRef<string | null>(null);

  const busy = engine.status === "scanning";
  const active = engine.status !== "idle";
  const signedIn = Boolean(session?.user);
  const guestScansLeft = guestUsage.remaining;
  const guestLimitReached = guestScansLeft <= 0;

  // Signed-in users scan inside the dashboard shell (clean tool, no
  // marketing) — send them there instead of the public studio.
  useEffect(() => {
    if (signedIn) router.replace("/dashboard/scan");
  }, [router, signedIn]);

  useEffect(() => {
    if (signedIn || engine.status !== "results" || !engine.report) return;

    const resultKey = `${engine.report.url}@${engine.report.scannedAt.getTime()}`;
    if (recordedGuestKey.current === resultKey) return;

    recordedGuestKey.current = resultKey;
    recordGuestScan(engine.report.url);
  }, [engine.report, engine.status, signedIn]);

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

  const openGuestLimit = () => {
    setResetDialog(null);
    setGuestLimitDialog(true);
    scrollToTop();
  };

  const routeGuestWithReport = (dest: "/signup" | "/login") => {
    if (engine.report) writePendingScan(pendingFromReport(engine.report));
    router.push(dest);
  };

  const runScan = (url: string) => {
    if (guestLimitReached) {
      openGuestLimit();
      return;
    }

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
    if (engine.status !== "scanning" && guestLimitReached) {
      openGuestLimit();
      return;
    }

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

    if (guestLimitReached) {
      openGuestLimit();
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
        guestScansLeft={guestScansLeft}
        onScan={runScan}
      />
    </div>
  );

  // Avoid flashing the public studio while the redirect above runs.
  if (signedIn) return null;

  return (
    <>
      <ScanNav
        status={engine.status}
        currentUrl={engine.url}
        progress={engine.progress}
        score={engine.report?.score}
        issueCount={engine.report?.issues.length}
        onNewScan={requestNewScan}
        onRescan={rescanCurrent}
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
                onStop={stopScan}
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
                  guestScansLeft={guestScansLeft}
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
                  guestPreview={!signedIn}
                  onCreateAccount={() => routeGuestWithReport("/signup")}
                />
              </div>
              {consoleBlock}
            </>
          )}
        </Container>
      </section>

      {resetDialog && (
        <ResetScanDialog
          mode={resetDialog}
          url={engine.url || engine.report?.url || query}
          onCancel={() => setResetDialog(null)}
          onConfirm={clearForNewScan}
        />
      )}

      {guestLimitDialog && (
        <GuestScanLimitDialog
          currentUrl={engine.report?.url || engine.url || query}
          hasReport={Boolean(engine.report)}
          onCancel={() => setGuestLimitDialog(false)}
          onSignup={() => routeGuestWithReport("/signup")}
          onLogin={() => routeGuestWithReport("/login")}
        />
      )}
    </>
  );
};
