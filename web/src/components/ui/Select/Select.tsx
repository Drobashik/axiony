"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import cn from "classnames";
import styles from "./Select.module.scss";

export interface SelectOption {
  value: string;
  label: string;
  /** Leading glyph. */
  icon?: ReactNode;
  /** Leading colour dot (e.g. status / severity). */
  color?: string;
  /** Muted text after the label. */
  hint?: string;
}

export interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  size?: "sm" | "md";
  align?: "start" | "end";
  block?: boolean;
  className?: string;
}

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/** Accessible custom dropdown — keyboard-driven, closes on outside click /
 * Escape. Styled to fit the dark theme where a native <select> can't. */
export const Select = ({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder = "Select",
  size = "md",
  align = "start",
  block,
  className,
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const selectedIndex = options.findIndex((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const openMenu = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openMenu();
        else setActiveIndex((i) => Math.min(options.length - 1, (i < 0 ? selectedIndex : i) + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (open) setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) openMenu();
        else if (activeIndex >= 0) choose(options[activeIndex].value);
        break;
      case "Escape":
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className={cn(styles.root, block && styles.block, className)}>
      <button
        type="button"
        className={cn(styles.trigger, styles[size], open && styles.triggerOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        {selected?.icon && <span className={styles.glyph}>{selected.icon}</span>}
        {selected?.color && <span className={styles.dot} style={{ background: selected.color }} />}
        <span className={styles.triggerLabel}>{selected ? selected.label : placeholder}</span>
        <ChevronIcon className={cn(styles.chevron, open && styles.chevronOpen)} />
      </button>

      {open && (
        <ul className={cn(styles.menu, align === "end" && styles.menuEnd)} role="listbox">
          {options.map((option, i) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={cn(
                styles.option,
                i === activeIndex && styles.optionActive,
                option.value === value && styles.optionSelected,
              )}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => choose(option.value)}
            >
              {option.icon && <span className={styles.glyph}>{option.icon}</span>}
              {option.color && <span className={styles.dot} style={{ background: option.color }} />}
              <span className={styles.optionLabel}>
                {option.label}
                {option.hint && <span className={styles.optionHint}>{option.hint}</span>}
              </span>
              {option.value === value && (
                <span className={styles.check}>
                  <CheckIcon />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
