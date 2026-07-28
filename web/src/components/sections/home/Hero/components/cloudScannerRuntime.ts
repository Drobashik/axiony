import { SCAN_ISSUES } from "../data";
import styles from "../Hero.module.scss";

const RUN_MS = 1600;
const START_PAUSE_MS = 160;
const PROGRESS_STEP = 4;
const IMPACT_STEP_MS = 2600;
const FINAL_SCORE = 61;
const SCORE_STEP = 13;
const MOBILE_QUERY = "(max-width: 700px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const ease = (progress: number) =>
  progress * progress * progress * (progress * (progress * 6 - 15) + 10);

const getElements = (browser: HTMLElement) => ({
  progressLabel: browser.querySelector<HTMLElement>("[data-scan-progress]"),
  foundLabel: browser.querySelector<HTMLElement>("[data-scan-found]"),
  scoreLabel: browser.querySelector<HTMLElement>("[data-scan-score]"),
  impact: browser.querySelector<HTMLElement>("[data-scan-impact]"),
  impactText: browser.querySelector<HTMLElement>("[data-scan-impact-text]"),
  impactHint: browser.querySelector<HTMLElement>("[data-scan-impact-hint]"),
  replayButton: browser.querySelector<HTMLButtonElement>("[data-scan-replay]"),
  markers: Array.from(browser.querySelectorAll<HTMLElement>("[data-scan-marker]")),
  issueButtons: Array.from(browser.querySelectorAll<HTMLButtonElement>("[data-scan-issue]")),
});

export const createCloudScannerRuntime = (browser: HTMLElement) => {
  const elements = getElements(browser);
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  const mobile = window.matchMedia(MOBILE_QUERY);
  const events = new AbortController();
  const issueCount = SCAN_ISSUES.length;

  let animationFrame = 0;
  let startTimer = 0;
  let cycleTimer = 0;
  let startedAt = 0;
  let lastProgress = -1;
  let activeIssue = 0;
  let done = false;

  const stopRun = () => {
    window.clearTimeout(startTimer);
    window.cancelAnimationFrame(animationFrame);
    startTimer = 0;
    animationFrame = 0;
  };

  const stopCycle = () => {
    window.clearInterval(cycleTimer);
    cycleTimer = 0;
  };

  const selectIssue = (index: number) => {
    activeIssue = index;
    const issue = SCAN_ISSUES[index];

    elements.markers.forEach((marker) => {
      const selected = done && Number(marker.dataset.scanMarker) === index;
      marker.classList.toggle(styles.issueActive, selected);
    });
    elements.issueButtons.forEach((button, buttonIndex) => {
      const selected = done && buttonIndex === index;
      button.classList.toggle(styles.auditItemActive, selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    if (elements.impact) elements.impact.dataset.via = issue.via;
    if (elements.impactText) elements.impactText.textContent = issue.impact;
  };

  const applyProgress = (progress: number) => {
    browser.style.setProperty("--p", String(progress));
    if (elements.progressLabel) elements.progressLabel.textContent = `${progress}%`;

    const found = SCAN_ISSUES.filter((issue) => progress >= issue.at).length;
    elements.markers.forEach((marker) => {
      const issue = SCAN_ISSUES[Number(marker.dataset.scanMarker)];
      marker.classList.toggle(styles.issueOn, progress >= issue.at);
    });
    elements.issueButtons.forEach((button, index) => {
      button.classList.toggle(styles.auditItemFound, progress >= SCAN_ISSUES[index].at);
    });

    if (elements.foundLabel) {
      elements.foundLabel.textContent = done
        ? `${issueCount} issues found`
        : `${found} of ${issueCount} found`;
    }
    if (elements.scoreLabel) {
      elements.scoreLabel.textContent = String(Math.max(FINAL_SCORE, 100 - found * SCORE_STEP));
      elements.scoreLabel.classList.toggle(styles.auditScoreWarn, found > 0);
    }
  };

  const finish = () => {
    done = true;
    applyProgress(100);
    browser.classList.add(styles.browserDone);
    elements.scoreLabel?.classList.add(styles.auditScoreDone);
    elements.issueButtons.forEach((button) => {
      button.disabled = false;
    });
    if (elements.impactHint) elements.impactHint.textContent = "Select an issue to inspect it";
    selectIssue(activeIssue);

    if (!mobile.matches && !reducedMotion.matches) {
      cycleTimer = window.setInterval(() => {
        selectIssue((activeIssue + 1) % issueCount);
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

    if (reducedMotion.matches) {
      animationFrame = window.requestAnimationFrame(finish);
      return;
    }

    startTimer = window.setTimeout(() => {
      animationFrame = window.requestAnimationFrame(tick);
    }, START_PAUSE_MS);
  };

  const replay = () => {
    stopRun();
    stopCycle();
    done = false;
    browser.classList.remove(styles.browserDone);
    elements.scoreLabel?.classList.remove(styles.auditScoreDone);
    elements.issueButtons.forEach((button) => {
      button.disabled = true;
    });
    if (elements.impactHint) elements.impactHint.textContent = "Scanning the visible page";
    selectIssue(0);
    applyProgress(0);
    start();
  };

  elements.issueButtons.forEach((button, index) => {
    button.addEventListener(
      "click",
      () => {
        if (!done) return;
        stopCycle();
        selectIssue(index);
      },
      { signal: events.signal },
    );
  });
  elements.replayButton?.addEventListener("click", replay, { signal: events.signal });
  start();

  return () => {
    stopRun();
    stopCycle();
    events.abort();
  };
};
