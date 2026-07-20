import { AuthAside } from "../components/AuthAside";
import { AuthForm } from "../form/AuthForm";
import type { AuthMode } from "../lib/types";
import styles from "./AuthScreen.module.scss";

/**
 * The split auth card: form first in the document for focused mobile and
 * assistive-tech navigation, while the desktop grid keeps the value panel
 * visually on the left. Shared by login and signup via the `mode` prop.
 */
export const AuthScreen = ({ mode }: { mode: AuthMode }) => (
  <div className={styles.card}>
    <div className={styles.panel}>
      <AuthForm mode={mode} />
    </div>
    <AuthAside mode={mode} />
  </div>
);
