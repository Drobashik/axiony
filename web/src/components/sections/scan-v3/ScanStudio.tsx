"use client";

import { useRef, useState } from "react";
import { Container } from "@/components/ui";
import cn from "classnames";
import { useReveal } from "@/lib/hooks/useReveal";
import { ReportView } from "./components/ReportView";
import { ScanStage } from "./components/ScanStage";
import { StudioCta } from "./components/StudioCta";
import { StudioHeader } from "./components/StudioHeader";
import { UrlConsole } from "./components/UrlConsole";
import { useScanEngine } from "./hooks/useScanEngine";
import type { WcagLevel } from "./types";
import styles from "./ScanStudio.module.scss";

export const ScanStudio = () => {
  useReveal();
  const engine = useScanEngine();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<WcagLevel>("AA");
  const topRef = useRef<HTMLElement>(null);

  const busy = engine.status === "scanning";
  const active = engine.status !== "idle";

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
        onScan={runScan}
      />
    </div>
  );

  return (
    <>
      <section ref={topRef} className={cn(styles.top, active && styles.topActive)}>
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
              <ScanStage url={engine.url} progress={engine.progress} lines={engine.lines} reduce={engine.reduce} />
            </div>
          )}

          {engine.status === "results" && engine.report && (
            <>
              <div className={styles.runner}>
                <p className={styles.srOnly} role="status">
                  Scan complete. Showing a sample accessibility report.
                </p>
                <ReportView
                  report={engine.report}
                  reduce={engine.reduce}
                  onRescan={() => {
                    setQuery(engine.url);
                    engine.reset();
                    scrollToTop();
                  }}
                />
              </div>
              {consoleBlock}
            </>
          )}
        </Container>
      </section>

      <StudioCta />
    </>
  );
};
