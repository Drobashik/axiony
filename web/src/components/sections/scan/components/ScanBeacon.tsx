import type { CSSProperties } from "react";
import cn from "classnames";
import { LockIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface ScanBeaconProps {
  host: string;
  reduce: boolean;
  failed: boolean;
}

// Accessibility checkpoints that "light up" as the scan beam sweeps the page.
// Tones follow the product tier accents: green / blue / violet.
const TARGETS = [
  { key: "alt text", tone: "green", top: "30%", left: "11%", delay: "0s" },
  { key: "contrast", tone: "blue", top: "63%", left: "57%", delay: "0.5s" },
  { key: "aria role", tone: "violet", top: "80%", left: "18%", delay: "1s" },
  { key: "focus", tone: "green", top: "44%", left: "73%", delay: "1.5s" },
  { key: "label", tone: "blue", top: "22%", left: "62%", delay: "2s" },
] as const;

/**
 * The hero scan visualisation: a miniature webpage being swept by an
 * accessibility scan beam, with a11y checkpoints pinging as the beam passes.
 */
export const ScanBeacon = ({ host, reduce, failed }: ScanBeaconProps) => (
  <div
    className={cn(styles.beacon, failed && styles.beaconFailed, reduce && styles.beaconStatic)}
    aria-hidden="true"
  >
    <span className={styles.beaconGrid} />
    <span className={styles.beaconAura} />

    <div className={styles.browser}>
      <div className={styles.browserTop}>
        <span className={styles.browserDots}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.browserUrl}>
          <LockIcon size={9} />
          {host || "scanning…"}
        </span>
        <span className={styles.browserTag}>{failed ? "halted" : "a11y"}</span>
      </div>

      <div className={styles.browserView}>
        <span className={cn(styles.skel, styles.skelTitle)} />
        <span className={cn(styles.skel, styles.skelMeta)} />
        <span className={cn(styles.skel, styles.skelImg)} />
        <span className={cn(styles.skel, styles.skelLine)} />
        <span className={cn(styles.skel, styles.skelLine, styles.skelLineShort)} />
        <span className={cn(styles.skel, styles.skelBtn)} />

        {TARGETS.map((target) => (
          <span
            key={target.key}
            className={styles.target}
            data-tone={target.tone}
            style={{ top: target.top, left: target.left, "--delay": target.delay } as CSSProperties}
          >
            <span className={styles.targetPing} />
            <span className={styles.targetDot} />
            <span className={styles.targetTag}>{target.key}</span>
          </span>
        ))}

        <span className={styles.beamEdge} />
        <span className={styles.beam} />
      </div>
    </div>
  </div>
);
