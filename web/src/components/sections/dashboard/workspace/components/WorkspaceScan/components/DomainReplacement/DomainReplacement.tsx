"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Icon, Select } from "@/components/ui";
import { ProjectIcon } from "@/components/sections/dashboard/shared/ProjectIcon";
import type { Project } from "@/lib/workspace";
import type { SiteIconAppearance } from "@/types";
import styles from "./DomainReplacement.module.scss";

interface DomainReplacementProps {
  incomingHost: string;
  incomingUrl: string;
  incomingIconUrl?: string;
  incomingIconAppearance?: SiteIconAppearance;
  projects: Project[];
  onReplace: (replacedHost: string) => Promise<void>;
}

export const DomainReplacement = ({
  incomingHost,
  incomingUrl,
  incomingIconUrl,
  incomingIconAppearance,
  projects,
  onReplace,
}: DomainReplacementProps) => {
  const [selectedHost, setSelectedHost] = useState(projects[0]?.host ?? "");
  const [confirming, setConfirming] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const selectedProject = projects.find((project) => project.host === selectedHost) ?? projects[0];
  const options = useMemo(
    () =>
      projects.map((project) => ({
        value: project.host,
        label: project.host,
        hint: `${project.pages.length} ${project.pages.length === 1 ? "page" : "pages"}`,
        icon: (
          <ProjectIcon
            host={project.host}
            url={project.pages[0]?.url}
            iconUrl={project.iconUrl}
            iconAppearance={project.iconAppearance}
            size={20}
          />
        ),
      })),
    [projects],
  );

  useEffect(() => {
    if (!confirming) return;
    cancelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !replacing) setConfirming(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirming, replacing]);

  const openConfirmation = () => {
    if (!selectedProject) return;
    setError(null);
    setConfirming(true);
  };

  const confirmReplacement = async () => {
    if (!selectedProject) return;
    setReplacing(true);
    setError(null);

    try {
      await onReplace(selectedProject.host);
      setConfirming(false);
    } catch (replacementError) {
      setError(
        replacementError instanceof Error
          ? replacementError.message
          : "Could not replace this project. Please try again.",
      );
    } finally {
      setReplacing(false);
    }
  };

  if (!selectedProject) return null;

  return (
    <>
      <section className={styles.card} aria-labelledby="domain-replacement-title">
        <div className={styles.header}>
          <span className={styles.headerIcon} aria-hidden="true">
            <Icon name="selector" size={18} />
          </span>
          <div>
            <span className={styles.kicker}>Project limit reached</span>
            <h3 id="domain-replacement-title">Make room for this project</h3>
            <p>Choose one tracked domain to remove, then save this completed scan in its place.</p>
          </div>
        </div>

        <div className={styles.swapRow}>
          <div className={styles.incomingProject}>
            <span className={styles.fieldLabel}>Ready to save</span>
            <div className={styles.projectIdentity}>
              <ProjectIcon
                host={incomingHost}
                url={incomingUrl}
                iconUrl={incomingIconUrl}
                iconAppearance={incomingIconAppearance}
                size={32}
              />
              <span>
                <strong>{incomingHost}</strong>
                <small>Completed scan</small>
              </span>
            </div>
          </div>

          <span className={styles.swapArrow} aria-hidden="true">
            <Icon name="arrow" size={17} />
          </span>

          <div className={styles.replacedProject}>
            <span className={styles.fieldLabel}>Project to replace</span>
            <Select
              value={selectedProject.host}
              options={options}
              onChange={setSelectedHost}
              ariaLabel="Choose a project to replace"
              block
              floating
              menuMinWidth={280}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <p>
            The selected project’s pages, history, and issue statuses will be removed only after
            confirmation.
          </p>
          <Button size="sm" className={styles.reviewButton} onClick={openConfirmation}>
            Review replacement
            <Icon name="arrow" size={14} />
          </Button>
        </div>
      </section>

      {confirming &&
        createPortal(
          <div
            className={styles.overlay}
            role="presentation"
            onMouseDown={() => !replacing && setConfirming(false)}
          >
            <div
              className={styles.dialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="replace-domain-title"
              aria-describedby="replace-domain-description"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <span className={styles.dialogIcon} aria-hidden="true">
                <Icon name="selector" size={20} />
              </span>
              <span className={styles.dialogKicker}>Confirm project replacement</span>
              <h3 id="replace-domain-title">
                Replace {selectedProject.host} with {incomingHost}?
              </h3>
              <p id="replace-domain-description" className={styles.dialogCopy}>
                This permanently removes the selected project and makes the completed scan the
                baseline for your new project.
              </p>

              <div className={styles.comparison}>
                <div className={styles.comparisonProject} data-tone="remove">
                  <span>Remove</span>
                  <ProjectIcon
                    host={selectedProject.host}
                    url={selectedProject.pages[0]?.url}
                    iconUrl={selectedProject.iconUrl}
                    iconAppearance={selectedProject.iconAppearance}
                    size={28}
                  />
                  <strong>{selectedProject.host}</strong>
                  <small>
                    {selectedProject.pages.length}{" "}
                    {selectedProject.pages.length === 1 ? "saved page" : "saved pages"}
                  </small>
                </div>
                <span className={styles.comparisonArrow} aria-hidden="true">
                  <Icon name="arrow" size={18} />
                </span>
                <div className={styles.comparisonProject} data-tone="add">
                  <span>Save</span>
                  <ProjectIcon
                    host={incomingHost}
                    url={incomingUrl}
                    iconUrl={incomingIconUrl}
                    iconAppearance={incomingIconAppearance}
                    size={28}
                  />
                  <strong>{incomingHost}</strong>
                  <small>New baseline</small>
                </div>
              </div>

              <div className={styles.warning}>
                <Icon name="bolt" size={15} />
                <span>Previous scan history and issue statuses cannot be restored.</span>
              </div>

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <div className={styles.actions}>
                <Button
                  ref={cancelRef}
                  variant="secondary"
                  onClick={() => setConfirming(false)}
                  disabled={replacing}
                >
                  Cancel
                </Button>
                <Button
                  className={styles.confirmButton}
                  onClick={() => void confirmReplacement()}
                  disabled={replacing}
                >
                  {replacing ? "Replacing…" : "Replace and save"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
