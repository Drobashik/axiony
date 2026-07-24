"use client";

import { useEffect, useState } from "react";
import { SCAN_ISSUES } from "../data";
import styles from "../Hero.module.scss";

const RUN_MS = 1600;
const START_PAUSE_MS = 160;
const PROGRESS_STEP = 4;
const IMPACT_STEP_MS = 2600;

const ease = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);

export const CloudScannerController = ({ browserId }: { browserId: string }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const app = document.querySelector<HTMLElement>("[data-boot-root]");
    if (app?.dataset.bootLoaded === "true") {
      const frame = window.requestAnimationFrame(() => setLoaded(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const onReady = () => setLoaded(true);
    window.addEventListener("axiony:boot-ready", onReady, { once: true });
    return () => window.removeEventListener("axiony:boot-ready", onReady);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const browser = document.getElementById(browserId);
    if (!browser) return;

    const progressLabel = browser.querySelector<HTMLElement>("[data-scan-progress]");
    const foundLabel = browser.querySelector<HTMLElement>("[data-scan-found]");
    const scoreLabel = browser.querySelector<HTMLElement>("[data-scan-score]");
    const impact = browser.querySelector<HTMLElement>("[data-scan-impact]");
    const impactText = browser.querySelector<HTMLElement>("[data-scan-impact-text]");
    const impactHint = browser.querySelector<HTMLElement>("[data-scan-impact-hint]");
    const replayButton = browser.querySelector<HTMLButtonElement>("[data-scan-replay]");
    const markers = Array.from(browser.querySelectorAll<HTMLElement>("[data-scan-marker]"));
    const issueButtons = Array.from(
      browser.querySelectorAll<HTMLButtonElement>("[data-scan-issue]"),
    );

    let animationFrame = 0;
    let startTimer = 0;
    let cycleTimer = 0;
    let startedAt = 0;
    let lastProgress = -1;
    let activeIssue = 0;
    let done = false;

    const stopCycle = () => {
      if (cycleTimer) window.clearInterval(cycleTimer);
      cycleTimer = 0;
    };

    const selectIssue = (index: number) => {
      activeIssue = index;
      const issue = SCAN_ISSUES[index];

      markers.forEach((marker) => {
        marker.classList.toggle(
          styles.issueActive,
          done && Number(marker.dataset.scanMarker) === index,
        );
      });
      issueButtons.forEach((button) => {
        const selected = done && Number(button.dataset.scanIssue) === index;
        button.classList.toggle(styles.auditItemActive, selected);
        button.setAttribute("aria-pressed", String(selected));
      });

      if (impact) impact.dataset.via = issue.via;
      if (impactText) impactText.textContent = issue.impact;
    };

    const applyProgress = (progress: number) => {
      browser.style.setProperty("--p", String(progress));
      if (progressLabel) progressLabel.textContent = `${progress}%`;

      const found = SCAN_ISSUES.filter((issue) => progress >= issue.at).length;
      markers.forEach((marker) => {
        const issue = SCAN_ISSUES[Number(marker.dataset.scanMarker)];
        marker.classList.toggle(styles.issueOn, progress >= issue.at);
      });
      issueButtons.forEach((button) => {
        const issue = SCAN_ISSUES[Number(button.dataset.scanIssue)];
        button.classList.toggle(styles.auditItemFound, progress >= issue.at);
      });

      if (foundLabel) foundLabel.textContent = done ? "4 issues found" : `${found} of 4 found`;
      if (scoreLabel) {
        scoreLabel.textContent = String(Math.max(61, 100 - found * 13));
        scoreLabel.classList.toggle(styles.auditScoreWarn, found > 0);
      }
    };

    const finish = () => {
      done = true;
      applyProgress(100);
      browser.classList.add(styles.browserDone);
      scoreLabel?.classList.add(styles.auditScoreDone);
      issueButtons.forEach((button) => {
        button.disabled = false;
      });
      if (foundLabel) foundLabel.textContent = "4 issues found";
      if (impactHint) impactHint.textContent = "Select an issue to inspect it";
      selectIssue(activeIssue);

      const shouldCycle =
        !window.matchMedia("(max-width: 700px)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (shouldCycle) {
        cycleTimer = window.setInterval(() => {
          selectIssue((activeIssue + 1) % SCAN_ISSUES.length);
        }, IMPACT_STEP_MS);
      }
    };

    const tick = (now: number) => {
      if (!startedAt) startedAt = now;
      const elapsed = Math.min(1, (now - startedAt) / RUN_MS);
      const easedProgress = ease(elapsed) * 100;
      const nextProgress =
        elapsed === 1 ? 100 : Math.floor(easedProgress / PROGRESS_STEP) * PROGRESS_STEP;

      if (nextProgress !== lastProgress) {
        lastProgress = nextProgress;
        applyProgress(nextProgress);
      }

      if (elapsed < 1) animationFrame = window.requestAnimationFrame(tick);
      else finish();
    };

    const start = () => {
      startedAt = 0;
      lastProgress = -1;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        animationFrame = window.requestAnimationFrame(finish);
        return;
      }

      startTimer = window.setTimeout(() => {
        animationFrame = window.requestAnimationFrame(tick);
      }, START_PAUSE_MS);
    };

    const replay = () => {
      window.clearTimeout(startTimer);
      window.cancelAnimationFrame(animationFrame);
      stopCycle();
      done = false;
      activeIssue = 0;
      browser.classList.remove(styles.browserDone);
      scoreLabel?.classList.remove(styles.auditScoreDone);
      issueButtons.forEach((button) => {
        button.disabled = true;
        button.classList.remove(styles.auditItemActive);
        button.setAttribute("aria-pressed", "false");
      });
      markers.forEach((marker) => marker.classList.remove(styles.issueActive));
      if (impactHint) impactHint.textContent = "Scanning the visible page";
      selectIssue(0);
      applyProgress(0);
      start();
    };

    const issueHandlers = issueButtons.map((button, index) => {
      const handler = () => {
        if (!done) return;
        stopCycle();
        selectIssue(index);
      };
      button.addEventListener("click", handler);
      return handler;
    });
    replayButton?.addEventListener("click", replay);
    start();

    return () => {
      window.clearTimeout(startTimer);
      window.cancelAnimationFrame(animationFrame);
      stopCycle();
      replayButton?.removeEventListener("click", replay);
      issueButtons.forEach((button, index) => {
        button.removeEventListener("click", issueHandlers[index]);
      });
    };
  }, [browserId, loaded]);

  return null;
};
