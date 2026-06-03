"use client";

import { useState } from "react";
import { Container, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import { PROBLEMS, type ProblemDemo } from "@/lib/data/home";
import styles from "./Problem.module.scss";

/**
 * "Feel the problem" explorer. Instead of describing accessibility issues,
 * each tab lets the visitor experience one of the four most common ones
 * first-hand — contrast, accessible names, keyboard access, and colour.
 */
export function Problem() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProblem = PROBLEMS[activeIndex];

  return (
    <Section surface>
      <Container>
        <div className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>Problem</SectionEyebrow>
          <h2>Most accessibility problems are invisible — until you feel them.</h2>
          <p className={styles.lead}>
            Over a billion people navigate software with a disability, and the
            barriers they hit rarely surface in a design review. So try four of
            the most common ones yourself — each is a real issue Axiony helps
            teams catch.
          </p>
        </div>

        <div className={cn(styles.explorer, "reveal")}>
          <div
            className={styles.list}
            role="group"
            aria-label="Common accessibility problems to try"
          >
            {PROBLEMS.map((item, i) => {
              const isActive = i === activeIndex;

              return (
                <button
                  key={item.number}
                  type="button"
                  className={cn(styles.item, isActive && styles.item_active)}
                  onClick={() => setActiveIndex(i)}
                  aria-pressed={isActive}
                >
                  <span className={styles.number}>{item.number}</span>
                  <span className={styles.itemCopy}>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </span>
                  <span className={styles.itemArrow} aria-hidden="true">
                    →
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.panel}>
            {/* Keyed so switching tabs remounts the demo with fresh state. */}
            <div key={activeIndex} className={styles.panelInner}>
              <div className={styles.panelHeader}>
                <span className={styles.tryHint}>
                  <span className={styles.tryDot} aria-hidden="true" />
                  Live demo · interact with it
                </span>
                <span className={styles.spec}>{activeProblem.spec}</span>
              </div>

              <h3 className={styles.headline}>{activeProblem.headline}</h3>

              <ProblemDemoView demo={activeProblem.demo} />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ProblemDemoView({ demo }: { demo: ProblemDemo }) {
  if (demo === "contrast") return <ContrastDemo />;
  if (demo === "screenReader") return <ScreenReaderDemo />;
  if (demo === "keyboard") return <KeyboardDemo />;
  return <ColorDemo />;
}

// =====================================================================
// Demo 01 · Contrast — a live WCAG contrast meter
// =====================================================================

type RGB = [number, number, number];

const CARD_BG: RGB = [246, 247, 249];
const TEXT_LOW: RGB = [203, 206, 212];
const TEXT_HIGH: RGB = [18, 19, 24];

function ContrastDemo() {
  // Start on a failing value so there's something to fix.
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
}

// =====================================================================
// Demo 02 · Screen reader — accessible names
// =====================================================================

const SR_CONTROLS = [
  { id: "search", label: "Search", Icon: SearchIcon },
  { id: "like", label: "Add to favourites", Icon: HeartIcon },
  { id: "share", label: "Share", Icon: ShareIcon },
  { id: "cart", label: "View cart", Icon: CartIcon },
] as const;

function ScreenReaderDemo() {
  const [named, setNamed] = useState(false);
  const [cursor, setCursor] = useState(0);
  const announced = named ? SR_CONTROLS[cursor].label : "button";

  return (
    <div className={styles.demo}>
      <div className={styles.srStage}>
        <div className={styles.srToolbar}>
          {SR_CONTROLS.map((control, i) => {
            const { Icon } = control;
            return (
              <button
                key={control.id}
                type="button"
                className={cn(styles.srIconBtn, i === cursor && styles.srIconBtn_active)}
                onClick={() => setCursor(i)}
                aria-label={control.label}
              >
                <Icon />
              </button>
            );
          })}
        </div>

        <div className={styles.srReader} aria-hidden="true">
          <span className={styles.srReaderLabel}>Screen reader announces</span>
          <strong className={named ? styles.srGood : styles.srBad}>
            “{announced}”
          </strong>
        </div>
      </div>

      <div className={styles.demoControls}>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => setCursor((c) => (c + 1) % SR_CONTROLS.length)}
        >
          Tab&nbsp;⇥
        </button>
        <Toggle checked={named} onChange={setNamed} label="Add accessible names" />
      </div>

      <p className={styles.takeaway}>
        A screen reader reads the code, not the icon. Without a name, every
        control is just <strong>“button”</strong> — impossible to tell apart.
      </p>
    </div>
  );
}

// =====================================================================
// Demo 03 · Keyboard — focus order & reachability
// =====================================================================

function KeyboardDemo() {
  const [focusable, setFocusable] = useState(false);
  const order = focusable ? ["email", "country", "pay"] : ["email", "pay"];
  const [step, setStep] = useState(-1);
  const current = step >= 0 ? order[step] : null;

  const advance = () => setStep((s) => (s + 1) % order.length);
  const reset = () => setStep(-1);
  const reachedPay = current === "pay";

  return (
    <div className={styles.demo}>
      <div className={styles.kbForm} aria-hidden="true">
        <div className={cn(styles.kbField, current === "email" && styles.kbField_focus)}>
          <span className={styles.kbLabel}>Email</span>
          <span className={styles.kbControl}>you@team.com</span>
        </div>

        <div
          className={cn(
            styles.kbField,
            styles.kbField_custom,
            current === "country" && styles.kbField_focus,
            !focusable && styles.kbField_blocked,
          )}
        >
          <span className={styles.kbLabel}>Country</span>
          <span className={styles.kbControl}>
            Select…
            <span className={styles.kbChevron}>▾</span>
          </span>
          {!focusable && <span className={styles.kbSkip}>tab skips this</span>}
        </div>

        <div className={cn(styles.kbField, styles.kbField_pay, reachedPay && styles.kbField_focus)}>
          <span>Pay $49</span>
        </div>
      </div>

      <div className={styles.demoControls}>
        <button type="button" className={styles.actionBtn} onClick={advance}>
          Tab&nbsp;⇥
        </button>
        <button type="button" className={styles.ghostBtn} onClick={reset}>
          Reset
        </button>
        <Toggle
          checked={focusable}
          onChange={(value) => {
            setFocusable(value);
            setStep(-1);
          }}
          label="Make it focusable"
        />
      </div>

      <p className={styles.takeaway}>
        {focusable
          ? "Now every control is in the tab order — keyboard and switch users can finish checkout."
          : "Press Tab. Focus jumps from Email straight to Pay — the country selector can never be reached."}
      </p>
    </div>
  );
}

// =====================================================================
// Demo 04 · Colour — meaning that depends on colour alone
// =====================================================================

const SERVICES = [
  { name: "api-gateway", up: true },
  { name: "auth-service", up: false },
  { name: "payments", up: true },
  { name: "search-index", up: false },
] as const;

function ColorDemo() {
  const [simulate, setSimulate] = useState(false);
  const [labelled, setLabelled] = useState(false);

  return (
    <div className={styles.demo}>
      {/* Inline filter that approximates red-green colour blindness. */}
      <svg className={styles.cvdFilter} aria-hidden="true" focusable="false">
        <filter id="axiony-deuteranopia" colorInterpolationFilters="linearRGB">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"
          />
        </filter>
      </svg>

      <div className={cn(styles.cvdStage, simulate && styles.cvdStage_sim)}>
        <div className={styles.statusList}>
          {SERVICES.map((service) => (
            <div key={service.name} className={styles.statusRow}>
              <span
                className={cn(
                  styles.statusDot,
                  service.up ? styles.statusDot_up : styles.statusDot_down,
                )}
              />
              {labelled && (
                <span
                  className={cn(
                    styles.statusIcon,
                    service.up ? styles.statusIcon_up : styles.statusIcon_down,
                  )}
                  aria-hidden="true"
                >
                  {service.up ? "✓" : "✕"}
                </span>
              )}
              <span className={styles.statusName}>{service.name}</span>
              {labelled && (
                <span className={styles.statusWord}>
                  {service.up ? "Operational" : "Down"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.demoControls}>
        <Toggle
          checked={simulate}
          onChange={setSimulate}
          label="Simulate red–green colour blindness"
        />
        <Toggle checked={labelled} onChange={setLabelled} label="Add icons & labels" />
      </div>

      <p className={styles.takeaway}>
        About <strong>1 in 12 men</strong> can&apos;t reliably tell red from
        green. With colour alone, “up” and “down” look identical.
      </p>
    </div>
  );
}

// =====================================================================
// Shared bits
// =====================================================================

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className={cn(styles.toggle, checked && styles.toggle_on)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.toggleTrack} aria-hidden="true">
        <span className={styles.toggleThumb} />
      </span>
      <span className={styles.toggleLabel}>{label}</span>
    </label>
  );
}

// ── Colour maths (real WCAG 2.x contrast) ────────────────────────────

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function rgbCss([r, g, b]: RGB): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function relativeLuminance([r, g, b]: RGB): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Inline icons (local to this section) ─────────────────────────────

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5S3.5 15 3.5 8.8A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8.5 1.8c0 6.2-8.5 11.7-8.5 11.7z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <path d="m8.4 13.4 7.2 4.2M15.6 6.4 8.4 10.6" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3.5H5l2.4 11.5h10L20 7.5H6" />
    </svg>
  );
}
