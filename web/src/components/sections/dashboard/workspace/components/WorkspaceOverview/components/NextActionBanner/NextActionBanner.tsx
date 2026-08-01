import { Icon } from "@/components/ui";
import type { ProjectOverviewModel } from "../../types";
import styles from "./NextActionBanner.module.scss";

interface NextActionBannerProps {
  model: ProjectOverviewModel;
  onAction: () => void;
}

export const NextActionBanner = ({ model, onAction }: NextActionBannerProps) => (
  <section className={styles.banner} data-tone={model.nextAction.tone}>
    <span className={styles.icon}>
      <Icon name={model.nextAction.icon} size={17} />
    </span>
    <div className={styles.copy}>
      <span className={styles.kicker}>Recommended next step</span>
      <h3>{model.nextAction.title}</h3>
      <p>{model.nextAction.text}</p>
    </div>
    <button type="button" className={styles.action} onClick={onAction}>
      {model.nextAction.label}
      <Icon name="arrow" size={13} />
    </button>
  </section>
);
