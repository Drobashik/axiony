"use client";

import { useEffect, useState } from "react";
import cn from "classnames";
import {
  TEAM_EVENTS,
  TEAM_MEMBERS,
  TEAM_REPOS,
  TEAM_SCORE_FROM,
  TEAM_SCORE_TO,
  TEAM_STEP_MS,
} from "../data";
import type { TeamEventKind } from "../types";
import { GitHubMark, GitLabMark, SlackMark } from "./marks";
import styles from "../ScanWorkflow.module.scss";

const lerp = (from: number, to: number, t: number) => Math.round(from + (to - from) * t);

const PILL_LABEL: Record<TeamEventKind, string> = {
  blocked: "blocked",
  fixed: "merged",
  joined: "joined",
  clean: "clean",
};

// Sofia (the last member) only appears once her "joined" event lands.
const JOIN_INDEX = TEAM_EVENTS.findIndex((event) => event.kind === "joined");
const SCORE_FRAMES = 24;
const SCORE_DURATION_MS = 1400;

interface TeamVizProps {
  reduce: boolean;
  /** The Team step is on screen — (re)play the week of activity. */
  active: boolean;
}

export const TeamViz = ({ reduce, active }: TeamVizProps) => {
  // Reduced-motion jumps straight to the settled, fully-synced state. The
  // initial state covers the off-screen case too — TeamViz is remounted
  // (via key) whenever the step is opened, so the week replays each time.
  const [revealed, setRevealed] = useState(reduce ? TEAM_EVENTS.length : 0);
  const [frac, setFrac] = useState(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce || !active) return undefined;

    // 1) Stream the activity feed, one event at a time.
    const timers = TEAM_EVENTS.map((_, index) =>
      window.setTimeout(() => setRevealed(index + 1), TEAM_STEP_MS * (index + 1)),
    );

    // 2) Ratchet every score up while the feed plays out.
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      setFrac(frame / SCORE_FRAMES);
      if (frame >= SCORE_FRAMES) window.clearInterval(id);
    }, SCORE_DURATION_MS / SCORE_FRAMES);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearInterval(id);
    };
  }, [active, reduce]);

  const teamScore = lerp(TEAM_SCORE_FROM, TEAM_SCORE_TO, frac);
  const fullTeam = revealed > JOIN_INDEX;
  const members = fullTeam ? TEAM_MEMBERS : TEAM_MEMBERS.slice(0, -1);

  return (
    <div className={styles.team}>
      {/* Identity + the team score that climbs as the week plays */}
      <div className={styles.teamHead}>
        <div className={styles.teamId}>
          <span className={styles.dashKicker}>acme · team workspace</span>
          <strong>One baseline, shared</strong>
        </div>

        <div className={styles.teamMeta}>
          <span className={styles.avatars} aria-hidden="true">
            {members.map((member, index) => (
              <span
                key={member.initials}
                className={cn(
                  styles.avatar,
                  fullTeam && index === members.length - 1 && styles.avatarNew,
                )}
                title={`${member.name} · ${member.role}`}
              >
                {member.initials}
              </span>
            ))}
          </span>
          <span className={styles.teamScore}>
            <em>{teamScore}</em>
            <span className={styles.teamScoreUp}>↑ team score</span>
          </span>
        </div>
      </div>

      {/* The shared baseline — one line, every repo and branch */}
      <div className={styles.repos}>
        {TEAM_REPOS.map((repo) => (
          <div key={repo.name} className={styles.repo}>
            <code className={styles.repoName}>{repo.name}</code>
            <span className={styles.repoBranches}>{repo.branches} branches</span>
            <span className={styles.repoScore}>
              {lerp(repo.from, repo.to, frac)}
              <i className={styles.repoDelta}>+{repo.to - repo.from}</i>
            </span>
          </div>
        ))}
        <span className={styles.baselineTag}>1 shared baseline</span>
      </div>

      {/* The workspace, alive: a blocked PR, an AI fix, a new hire, a clean MR.
          Every row is in the DOM from the start — they only fade in — so the
          panel never grows and the page never jumps as the week plays. */}
      <div className={styles.feed} role="log" aria-label="This week in the team workspace">
        {TEAM_EVENTS.map((event, index) => (
          <div
            key={index}
            className={cn(
              styles.feedRow,
              styles[`fk_${event.kind}`],
              index < revealed && styles.feedShown,
            )}
          >
            <span className={styles.feedActor}>{event.actor}</span>
            <span className={styles.feedBody}>
              <span className={styles.feedTop}>
                <code className={styles.feedRef}>{event.ref}</code>
                <span className={styles.feedText}>{event.text}</span>
                {event.slack && (
                  <span className={styles.feedSlack}>
                    <SlackMark />
                    {event.slack}
                  </span>
                )}
              </span>
              <span className={styles.feedDetail}>{event.detail}</span>
            </span>
            <span className={cn(styles.feedPill, styles[`fp_${event.kind}`])}>
              {PILL_LABEL[event.kind]}
            </span>
          </div>
        ))}
      </div>

      {/* Wired in, with the soul note */}
      <div className={styles.teamFoot}>
        <span className={styles.wired}>
          <span className={styles.wiredLogo}>
            <GitHubMark />
          </span>
          <span className={styles.wiredLogo}>
            <GitLabMark />
          </span>
          <span className={styles.wiredLogo}>
            <SlackMark />
          </span>
          GitHub · GitLab · Slack — in sync
        </span>
        <span className={styles.handNote}>everyone on the same baseline</span>
      </div>
    </div>
  );
};
