"use client";

import { type ReactNode, useRef, useState } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { cn } from "@/utils/utils";

/**
 * Two pictures in one frame with a divider between them, as the compare slider on the Apps Script pages: `front` shows
 * left of the divider, `back` right of it. Dragging anywhere in the frame moves the divider; the range input underneath
 * takes the keyboard. The frame takes its size from `back`, or from `className` (e.g. an aspect ratio).
 */
export function CompareSlider({
  back,
  front,
  start = 50,
  label,
  valueText,
  className,
}: {
  back: ReactNode;
  front: ReactNode;
  /** Where the divider starts, in percent from the left. */
  start?: number;
  label: string;
  valueText?: (percent: number) => string;
  className?: string;
}) {
  const [shown, setShown] = useState(start);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const moveTo = (clientX: number) => {
    const rect = box.current?.getBoundingClientRect();

    if (rect && rect.width > 0) {
      setShown(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    }
  };

  return (
    <div
      ref={box}
      className={cn("bg-card relative cursor-ew-resize touch-pan-y overflow-hidden select-none", className)}
      onPointerDown={(event) => {
        dragging.current = true;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // A pointer the browser does not track (e.g. synthetic events) still moves the divider
        }
        moveTo(event.clientX);
      }}
      onPointerMove={(event) => dragging.current && moveTo(event.clientX)}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      <div className="pointer-events-none size-full [&>*]:size-full">{back}</div>
      <div
        data-front
        className="bg-card pointer-events-none absolute inset-0 [&>*]:size-full"
        style={{ clipPath: `inset(0 ${100 - shown}% 0 0)` }}
      >
        {front}
      </div>
      <div
        className="bg-primary pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 shadow-[0_0_6px_rgba(0,0,0,0.5)]"
        style={{ left: `${shown}%` }}
      />
      {/* The handle stays within the frame at either end */}
      <span
        className="border-primary bg-background text-link pointer-events-none absolute top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-md"
        style={{ left: `clamp(1.25rem, ${shown}%, calc(100% - 1.25rem))` }}
      >
        <ChevronsLeftRight
          className="size-5"
          aria-hidden
        />
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(shown)}
        onChange={(event) => setShown(Number(event.target.value))}
        aria-label={label}
        aria-valuetext={valueText?.(Math.round(shown))}
        className="peer sr-only"
      />
      <span className="ring-ring pointer-events-none absolute inset-0 peer-focus-visible:ring-2 peer-focus-visible:ring-inset" />
    </div>
  );
}
