import Link from "next/link";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  forwardRef,
  ReactNode,
} from "react";
import cn from "classnames";
import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** When true, the button stretches to fill its container. */
  block?: boolean;
  className?: string;
  children: ReactNode;
}

type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type NativeButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export type ButtonProps = AnchorProps | NativeButtonProps;

/**
 * Detects routes that should be handled by Next's `<Link>` (client-side
 * navigation, no full page reload) vs. external/anchor links that need
 * a real `<a>`. Internal links start with `/` and don't have `target`.
 */
function isInternalLink(href: string, target: string | undefined): boolean {
  return href.startsWith("/") && !target;
}

/**
 * Button primitive — renders as a real `<button>` by default, or as
 * a navigation element when `href` is provided. Internal links use
 * Next's `<Link>` so the SPA stays fast; external links fall back to
 * a regular `<a>`.
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button({ variant = "primary", size = "md", block, className, children, ...rest }, ref) {
    const cls = cn(
      styles.btn,
      styles[`variant_${variant}`],
      styles[`size_${size}`],
      block && styles.block,
      className,
    );

    if ("href" in rest && rest.href !== undefined) {
      const { href, target, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

      if (isInternalLink(href, target)) {
        return (
          <Link
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            className={cls}
            {...anchorRest}
          >
            {children}
          </Link>
        );
      }

      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          className={cls}
          {...anchorRest}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cls}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  },
);
