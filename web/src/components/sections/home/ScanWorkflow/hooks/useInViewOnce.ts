import type { RefObject } from "react";
import { useEffect, useState } from "react";

export const useInViewOnce = (ref: RefObject<HTMLElement | null>): boolean => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -22% 0px", threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, visible]);

  return visible;
};
