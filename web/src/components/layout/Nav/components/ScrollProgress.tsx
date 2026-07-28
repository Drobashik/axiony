"use client";

import { useEffect, useRef } from "react";
import styles from "../Nav.module.scss";

export const ScrollProgress = () => {
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const progressElement = progressRef.current;
      if (!progressElement) return;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
      progressElement.style.transform = `scaleX(${progress})`;
      progressElement.classList.toggle(styles.progressDone, progress >= 0.985);
    };

    const queueUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
    };
  }, []);

  return <span ref={progressRef} className={styles.progress} aria-hidden="true" />;
};
