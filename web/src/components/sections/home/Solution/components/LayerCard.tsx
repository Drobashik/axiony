import { Icon } from "@/components/ui";
import cn from "classnames";
import { LAYER_STEPS } from "../data";
import type { SolutionLayer } from "../types";
import styles from "../Solution.module.scss";

interface LayerCardProps {
  layer: SolutionLayer;
  index: number;
}

export const LayerCard = ({ layer, index }: LayerCardProps) => (
  <div className={cn(styles.layer, styles[`layer_${layer.accent}`])}>
    <div className={styles.layerTop}>
      <span className={styles.layerStep}>
        {String(index + 1).padStart(2, "0")} · {LAYER_STEPS[index]}
      </span>
      <span className={cn(styles.tier, styles[`tier_${layer.accent}`])}>{layer.tier}</span>
    </div>

    <h3 className={styles.layerName}>{layer.name}</h3>
    <p className={styles.layerDesc}>{layer.audience}</p>

    <span className={styles.limit}>{layer.limit}</span>

    {layer.command && (
      <div className={styles.command}>
        <span className={styles.prompt}>$</span>
        {layer.command}
      </div>
    )}

    {layer.inherits && <p className={styles.inherits}>{layer.inherits}</p>}

    <ul className={styles.points}>
      {layer.points.map((point) => (
        <li key={point}>
          <Icon name="check" size={15} className={styles.pointCheck} />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  </div>
);
