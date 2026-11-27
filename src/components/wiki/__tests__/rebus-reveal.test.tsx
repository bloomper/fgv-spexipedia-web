import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RebusReveal } from "@/components/wiki/rebus-reveal.client";

const image = (id: string, alt: string) => ({
  id,
  alt,
  width: 800,
  height: 600,
  thumbnailUrl: `/${id}/t`,
  pageUrl: `/${id}/p`,
  fullUrl: `/${id}/f`,
});

const solutionLayer = () => screen.getByAltText("Lösningen").parentElement!;

describe("The rebus reveal", () => {
  it("starts with the solution hidden and reveals it as the slider moves", () => {
    render(
      <RebusReveal
        rebus={image("r", "Rebusen")}
        solution={image("s", "Lösningen")}
      />
    );

    const slider = screen.getByRole("slider");

    expect(slider).toHaveValue("0");
    expect(solutionLayer().style.clipPath).toBe("inset(0px 100% 0px 0px)");

    fireEvent.change(slider, { target: { value: "40" } });

    expect(solutionLayer().style.clipPath).toBe("inset(0px 60% 0px 0px)");
  });
});
