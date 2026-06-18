"use client";

import { useState } from "react";
import cn from "classnames";
import { FAQS } from "../data";
import { FaqItem } from "./FaqItem";
import styles from "../Faq.module.scss";

export const FaqList = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className={cn(styles.list, "reveal-right")}>
      {FAQS.map((item, index) => {
        const isOpen = open === index;

        return (
          <FaqItem
            key={item.q}
            item={item}
            isOpen={isOpen}
            onToggle={() => setOpen(isOpen ? null : index)}
          />
        );
      })}
    </ul>
  );
};
