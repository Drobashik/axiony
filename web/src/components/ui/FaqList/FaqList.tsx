import { FaqItem as FaqItemModel } from "@/types";
import { FaqItem } from "./FaqItem";

export interface FaqListProps {
  items: FaqItemModel[];
}

export function FaqList({ items }: FaqListProps) {
  return (
    <div>
      {items.map((item) => (
        <FaqItem key={item.question} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
}
