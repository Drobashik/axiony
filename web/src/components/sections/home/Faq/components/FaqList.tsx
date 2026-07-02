"use client";

import { useState } from "react";
import cn from "classnames";
import { FAQS } from "../data";
import { FaqItem } from "./FaqItem";
import styles from "../Faq.module.scss";

export const FaqList = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn(styles.listShell, "reveal-right")}>
      <div className={styles.listHeader}>
        <span>faq</span>
        <strong>{String(FAQS.length).padStart(2, "0")} questions</strong>
      </div>

      <ul className={styles.list}>
        {FAQS.map((item, index) => {
          const isOpen = open === index;

          return (
            <FaqItem
              key={item.q}
              item={item}
              index={index}
              isOpen={isOpen}
              onToggle={() => setOpen(isOpen ? null : index)}
            />
          );
        })}
      </ul>
    </div>
  );
};
