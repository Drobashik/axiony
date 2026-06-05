import cn from "classnames";
import styles from "../Problem.module.scss";

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

export const Toggle = ({ checked, onChange, label }: ToggleProps) => (
  <label className={cn(styles.toggle, checked && styles.toggle_on)}>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <span className={styles.toggleTrack} aria-hidden="true">
      <span className={styles.toggleThumb} />
    </span>
    <span className={styles.toggleLabel}>{label}</span>
  </label>
);
