"use client";

import { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import type { SiteIconAppearance } from "@/types";
import styles from "./ProjectIcon.module.scss";

interface ProjectIconProps {
  host: string;
  url?: string;
  iconUrl?: string;
  iconAppearance?: SiteIconAppearance;
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

const highResolutionCache = new Map<string, Promise<string | null>>();

const highResolutionFavicon = (origin: string): Promise<string | null> => {
  const cached = highResolutionCache.get(origin);

  if (cached) return cached;

  const candidates = [
    `${origin}/apple-touch-icon.png`,
    `${origin}/favicon-96x96.png`,
    `${origin}/favicon.svg`,
  ];

  const request = new Promise<string | null>((resolve) => {
    let candidateIndex = 0;

    const tryNextCandidate = () => {
      if (candidateIndex >= candidates.length) {
        resolve(null);

        return;
      }

      const candidate = candidates[candidateIndex];

      candidateIndex += 1;

      const probe = new window.Image();

      probe.decoding = "async";

      probe.referrerPolicy = "no-referrer";

      probe.onload = () => {
        if (candidate.endsWith(".svg") || probe.naturalWidth >= 64) {
          resolve(candidate);

          return;
        }

        tryNextCandidate();
      };

      probe.onerror = tryNextCandidate;

      probe.src = candidate;
    };

    tryNextCandidate();
  });

  highResolutionCache.set(origin, request);

  return request;
};

export const ProjectIcon = ({
  host,
  url,
  iconUrl,
  iconAppearance,
  size = 32,
  className,
}: ProjectIconProps) => {
  const origin = projectOrigin(host, url);
  const accessibleLabel = `${host.replace(/^www\./, "")} project icon`;

  const baseFavicon = `${origin}/favicon.ico`;

  const [upgradedFavicon, setUpgradedFavicon] = useState<{ origin: string; src: string } | null>(
    null,
  );
  const [failedFavicons, setFailedFavicons] = useState<string[]>([]);
  const [wideFavicons, setWideFavicons] = useState<string[]>([]);

  const resolvedFavicon = upgradedFavicon?.origin === origin ? upgradedFavicon.src : baseFavicon;
  const favicon = iconUrl && !failedFavicons.includes(iconUrl) ? iconUrl : resolvedFavicon;
  const failed = failedFavicons.includes(favicon);
  const wide = wideFavicons.includes(favicon);
  const resolvedAppearance = favicon === iconUrl ? iconAppearance : undefined;

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

    highResolutionFavicon(origin).then((src) => {
      if (!cancelled && src) setUpgradedFavicon({ origin, src });
    });

    return () => {
      cancelled = true;
    };
  }, [origin]);

  return (
    <span
      className={cn(
        styles.icon,
        resolvedAppearance === "dark" && styles.darkArtwork,
        resolvedAppearance === "light" && styles.lightArtwork,
        failed && styles.fallbackOnly,
        className,
      )}
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
