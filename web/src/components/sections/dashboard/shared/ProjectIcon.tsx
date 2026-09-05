"use client";

import { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import styles from "./ProjectIcon.module.scss";

interface ProjectIconProps {
  host: string;
  url?: string;
  size?: number;
  className?: string;
}

// switch from the square icon fit when the source is noticeably landscape-oriented
const WIDE_ICON_ASPECT_RATIO = 1.45;

const monogramOf = (host: string): string =>
  host
    .replace(/^www\./, "")
    .charAt(0)
    .toUpperCase() || "•";

const projectOrigin = (host: string, url?: string): string => {
  try {
    return new URL(url ?? `https://${host}`).origin;
  } catch {
    return `https://${host}`;
  }
};

const projectIconCache = new Map<string, Promise<string | null>>();

const resolveProjectIcon = (origin: string): Promise<string | null> => {
  const cached = projectIconCache.get(origin);

  if (cached) return cached;

  const request = fetch(`/api/projects/icon?url=${encodeURIComponent(origin)}`, {
    cache: "no-cache",
  })
    .then(async (response) => {
      if (!response.ok) return null;

      const body = (await response.json()) as { iconUrl?: unknown };

      return typeof body.iconUrl === "string" ? body.iconUrl : null;
    })
    .catch(() => null);

  projectIconCache.set(origin, request);

  void request.then((src) => {
    if (!src && projectIconCache.get(origin) === request) {
      projectIconCache.delete(origin);
    }
  });

  return request;
};

export const ProjectIcon = ({ host, url, size = 32, className }: ProjectIconProps) => {
  const origin = projectOrigin(host, url);
  const accessibleLabel = `${host.replace(/^www\./, "")} project icon`;
  const baseFavicon = `${origin}/favicon.ico`;

  const [resolvedProjectIcon, setResolvedProjectIcon] = useState<{
    origin: string;
    src: string;
  } | null>(null);
  const [failedFavicons, setFailedFavicons] = useState<string[]>([]);
  const [wideFavicons, setWideFavicons] = useState<string[]>([]);

  const resolvedFavicon = resolvedProjectIcon?.origin === origin ? resolvedProjectIcon.src : null;
  const favicon =
    resolvedFavicon && !failedFavicons.includes(resolvedFavicon) ? resolvedFavicon : baseFavicon;
  const failed = failedFavicons.includes(favicon);
  const wide = wideFavicons.includes(favicon);

  const markFaviconShape = useCallback(
    (image: HTMLImageElement | null) => {
      if (
        !image?.naturalHeight ||
        image.naturalWidth / image.naturalHeight < WIDE_ICON_ASPECT_RATIO
      ) {
        return;
      }

      setWideFavicons((current) => (current.includes(favicon) ? current : [...current, favicon]));
    },
    [favicon],
  );

  useEffect(() => {
    let cancelled = false;

    resolveProjectIcon(origin).then((src) => {
      if (!cancelled && src) setResolvedProjectIcon({ origin, src });
    });

    return () => {
      cancelled = true;
    };
  }, [origin]);

  return (
    <span
      className={cn(styles.icon, failed && styles.fallbackOnly, className)}
      style={{ width: size, height: size }}
      role={failed ? "img" : undefined}
      aria-label={failed ? accessibleLabel : undefined}
    >
      <span
        className={styles.fallback}
        style={{ fontSize: Math.max(10, Math.round(size * 0.4)) }}
        aria-hidden="true"
      >
        {monogramOf(host)}
      </span>
      {!failed && (
        <span className={styles.imagePlate}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={cn(styles.image, wide && styles.imageWide)}
            src={favicon}
            alt={accessibleLabel}
            width={size}
            height={size}
            referrerPolicy="no-referrer"
            ref={markFaviconShape}
            onLoad={(event) => markFaviconShape(event.currentTarget)}
            onError={() =>
              setFailedFavicons((current) =>
                current.includes(favicon) ? current : [...current, favicon],
              )
            }
          />
        </span>
      )}
    </span>
  );
};
