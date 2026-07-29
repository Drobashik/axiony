import { Button, Icon, Select } from "@/components/ui";
import { relativeTime } from "@/lib/workspace";
import type { PortfolioOverviewModel, WindowDays } from "../../types";
import { plural } from "../../utils";
import styles from "./PortfolioHeader.module.scss";

interface PortfolioHeaderProps {
  model: PortfolioOverviewModel;
  windowDays: WindowDays;
  onWindowChange: (windowDays: WindowDays) => void;
  onProjects: () => void;
}

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

export const PortfolioHeader = ({
  model,
  windowDays,
  onWindowChange,
  onProjects,
}: PortfolioHeaderProps) => (
  <header className={styles.header}>
    <div className={styles.copy}>
      <span className={styles.kicker}>Portfolio overview</span>
      <h2>All projects</h2>
      <p>
        {plural(model.summary.projectCount, "project")} ·{" "}
        {plural(model.summary.pageCount, "tracked page")}
        {model.latestScan ? ` · Last scan ${relativeTime(model.latestScan)}` : ""}
      </p>
    </div>
    <div className={styles.actions}>
      <Select
        size="sm"
        floating
        ariaLabel="Portfolio activity range"
        value={String(windowDays)}
        options={RANGE_OPTIONS}
        onChange={(value) => onWindowChange(Number(value) as WindowDays)}
      />
      <Button size="sm" variant="secondary" onClick={onProjects}>
        <Icon name="globe" size={14} />
        Review projects
      </Button>
    </div>
  </header>
);
