"use client";

import { useState } from "react";
import { contrastRatio, lerpRgb, rgbCss } from "../helpers/color";
import type { RGB } from "../types";
import styles from "../Problem.module.scss";
import cn from "classnames";

const CARD_BG: RGB = [246, 247, 249];
const TEXT_LOW: RGB = [203, 206, 212];
const TEXT_HIGH: RGB = [18, 19, 24];

export const ContrastDemo = () => {
  const [amount, setAmount] = useState(26);
  const t = amount / 100;
  const text = lerpRgb(TEXT_LOW, TEXT_HIGH, t);
  const ratio = contrastRatio(text, CARD_BG);
  const passes = ratio >= 4.5;
  const textColor = rgbCss(text);

  return (
    <div className={styles.demo}>
      <div className={styles.contrastCard} style={{ background: rgbCss(CARD_BG) }}>
        <span className={styles.contrastKicker} style={{ color: textColor }}>
          BILLING
        </span>
        <p className={styles.contrastText} style={{ color: textColor }}>
          Your free trial ends in 2 days. Renew now to keep your reports and
          team history.
        </p>
        <span className={styles.contrastButton} style={{ color: textColor, borderColor: textColor }}>
          Renew plan
        </span>
      </div>

      <div className={styles.contrastControls}>
        <div className={styles.readout}>
          <strong className={passes ? styles.readout_pass : styles.readout_fail}>
            {ratio.toFixed(2)}:1
          </strong>
          <span
            className={cn(
              styles.verdict,
              passes ? styles.verdict_pass : styles.verdict_fail,
            )}
          >
            {passes ? "Passes AA" : "Fails AA"}
          </span>
        </div>

        <label className={styles.sliderRow}>
          <span>Contrast</span>
          <input
            type="range"
            min={0}
            max={100}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            aria-label="Adjust the text contrast"
          />
        </label>

        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => setAmount(90)}
          disabled={passes}
        >
          Fix it
        </button>
      </div>

      <p className={styles.takeaway}>
        Below <strong>4.5 : 1</strong>, this copy is invisible to many users —
        and it&apos;s the #1 issue found on the web today.
      </p>
    </div>
  );
};
