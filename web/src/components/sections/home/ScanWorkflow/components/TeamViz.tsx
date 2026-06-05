import { Icon } from "@/components/ui";
import cn from "classnames";
import { TEAM_OPTS } from "../data";
import { GitHubMark, GitLabMark, SlackMark } from "./marks";
import styles from "../ScanWorkflow.module.scss";

const INTEGRATIONS = [
  {
    key: "gh",
    name: "GitHub",
    detail: "Status checks + PR comments · 3 repos",
    Logo: GitHubMark,
    brand: "gh",
  },
  {
    key: "gl",
    name: "GitLab",
    detail: "MR checks + comments · 2 projects",
    Logo: GitLabMark,
    brand: "gl",
  },
  { key: "sl", name: "Slack", detail: "Live alerts to #a11y-alerts", Logo: SlackMark, brand: "sl" },
] as const;

export const TeamViz = () => (
  <div className={styles.team}>
    <div className={styles.teamHead}>
      <div>
        <span className={styles.dashKicker}>Acme · team workspace</span>
        <strong>Connected &amp; in sync</strong>
      </div>
      <span className={styles.avatars} aria-hidden="true">
        {["MC", "AP", "SK"].map((avatar) => (
          <span key={avatar} className={styles.avatar}>
            {avatar}
          </span>
        ))}
        <span className={cn(styles.avatar, styles.avatarMore)}>+5</span>
      </span>
    </div>

    <div className={styles.integrations}>
      {INTEGRATIONS.map(({ key, name, detail, Logo, brand }) => (
        <div key={key} className={styles.integration}>
          <span className={cn(styles.intLogo, styles[`brand_${brand}`])}>
            <Logo />
          </span>
          <span className={styles.intText}>
            <strong>{name}</strong>
            <span>{detail}</span>
          </span>
          <span className={styles.connected}>
            <span className={styles.connDot} />
            Connected
          </span>
        </div>
      ))}
    </div>

    <div className={styles.teamOpts}>
      {TEAM_OPTS.map((option) => (
        <span key={option} className={styles.opt}>
          <Icon name="check" size={13} className={styles.optCheck} />
          {option}
        </span>
      ))}
    </div>
  </div>
);
