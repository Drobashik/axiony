import { AuthAside } from "../components/AuthAside";
import { AuthForm } from "../form/AuthForm";
import type { AuthMode } from "../lib/types";
import styles from "./AuthScreen.module.scss";

/**
 * The split auth card: value panel on the left, form on the right. Shared by
 * the login and signup routes via the `mode` prop.
 */
export const AuthScreen = ({ mode }: { mode: AuthMode }) => (
  <div className={styles.card}>
    <AuthAside mode={mode} />
    <div className={styles.panel}>
      <AuthForm mode={mode} />
    </div>
  </div>
);
