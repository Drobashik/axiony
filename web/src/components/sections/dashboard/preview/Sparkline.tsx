import cn from "classnames";
import styles from "./Sparkline.module.scss";

export interface SparklineProps {
  data: number[];
}

/**
 * Tiny bar sparkline; the latest bar gets a colored grade based on
 * its value. All historical bars use a neutral grey.
 */
export function Sparkline({ data }: SparklineProps) {
  const max = Math.max(...data, 1);

  return (
    <div className={styles.spark}>
      {data.map((value, i) => {
        const ratio = value / max;
        const isLatest = i === data.length - 1;
        const grade = value < 60 ? styles.bad : value < 75 ? styles.ok : styles.good;

        return (
          <span
            key={i}
            className={cn(styles.bar, isLatest && grade)}
            style={{ height: `${Math.max(4, ratio * 28)}px` }}
          />
        );
      })}
    </div>
  );
}
