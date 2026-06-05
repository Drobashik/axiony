import { Icon } from "@/components/ui";
import cn from "classnames";
import { HISTORY, STORED } from "../data";
import { ClockMark, SparkleMark } from "./marks";
import styles from "../ScanWorkflow.module.scss";

export const ScannerViz = () => (
  <div className={styles.scanner}>
    <div className={styles.targetBar}>
      <span className={styles.target}>
        <Icon name="globe" size={15} />
        acme.com
        <span className={styles.pages}>47 pages</span>
      </span>
      <span className={styles.schedule}>
        <ClockMark />
        Daily · 02:00
      </span>
      <span className={styles.scanNow}>Scan now</span>
    </div>

    <div className={styles.block}>
      <div className={styles.blockHead}>
        <span>Scan history</span>
        <span className={styles.blockMeta}>kept for every run</span>
      </div>
      <div className={styles.history}>
        {HISTORY.map((item) => (
          <div key={item.when} className={styles.histRow}>
            <span className={styles.histWhen}>{item.when}</span>
            <span className={styles.histTrigger}>{item.trigger}</span>
            <span className={styles.histScore}>{item.score}</span>
            <span className={cn(styles.histDelta, styles[`d_${item.dir}`])}>{item.delta}</span>
          </div>
        ))}
      </div>
    </div>

    <div className={styles.block}>
      <div className={styles.blockHead}>
        <span>Stored issues</span>
        <span className={styles.blockMeta}>7 open · saved across runs</span>
      </div>
      <div className={styles.stored}>
        {STORED.map((item) => (
          <div key={item.rule} className={styles.storedRow}>
            <span className={cn(styles.sev, styles[`sev_${item.sev}`])} />
            <code>{item.rule}</code>
            <span className={styles.where}>{item.where}</span>
            <span className={styles.storedRight}>
              {item.ai && (
                <span className={styles.aiFix}>
                  <SparkleMark />
                  AI fix
                </span>
              )}
              <span className={cn(styles.statusPill, styles[`st_${item.tone}`])}>
                {item.status}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
