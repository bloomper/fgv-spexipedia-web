"use client";

import { useTranslations } from "next-intl";
import { CompareSlider } from "@/components/wiki/compare-slider.client";
import { WikiImage, type WikiImageData } from "@/components/wiki/wiki-image";

const SIZES = "(min-width: 1024px) 48rem, 100vw";

/**
 * The rebus with its solution laid over it, revealed from the left as the divider is dragged right. It starts hidden so
 * that a reader can try the rebus first.
 */
export function RebusReveal({ rebus, solution }: { rebus: WikiImageData; solution: WikiImageData }) {
  const t = useTranslations("SpexPage");

  return (
    <div className="max-w-3xl space-y-2">
      <CompareSlider
        start={0}
        label={t("solutionSlider")}
        valueText={(percent) => t("solutionShown", { percent })}
        className="border-border rounded-lg border"
        back={
          <WikiImage
            image={rebus}
            sizes={SIZES}
            className="block w-full"
          />
        }
        front={
          <WikiImage
            image={solution}
            sizes={SIZES}
            className="object-contain"
          />
        }
      />
      <p className="text-muted-foreground text-xs">{t("revealSolution")}</p>
    </div>
  );
}
