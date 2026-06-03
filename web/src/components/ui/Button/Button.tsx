import Link from "next/link";
import { forwardRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ForwardedRef,
  ReactNode,
  Ref,
} from "react";
import cn from "classnames";
import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children: ReactNode;
}

type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type NativeButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export type ButtonProps = AnchorProps | NativeButtonProps;

const isInternalLink = (href: string, target: string | undefined): boolean =>
  href.startsWith("/") && !target;

const ButtonBase = (
  { variant = "primary", size = "md", block, className, children, ...rest }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement | HTMLAnchorElement>,
) => {
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
          ref={ref as Ref<HTMLAnchorElement>}
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
        ref={ref as Ref<HTMLAnchorElement>}
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
      ref={ref as Ref<HTMLButtonElement>}
      className={cls}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(ButtonBase);

Button.displayName = "Button";
