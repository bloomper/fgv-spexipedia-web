"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Spinner } from "@bloomper/fgv-web-ui/ui/spinner";
import { WikiImage, type WikiImageData } from "@/components/wiki/wiki-image";
import { ACCEPTED_IMAGES, uploadImage } from "@/components/wiki/editor/upload.client";
import { cn } from "@/utils/utils";

/**
 * One image in its place, such as a poster, a logo, the rebus or a cover: drop or pick a file to upload and set it,
 * or remove it. `onChange` saves at once.
 */
export function ImageSlot({
  label,
  kind,
  image,
  onChange,
  disabled,
  className,
}: {
  label: string;
  kind: string;
  image: WikiImageData | null | undefined;
  onChange: (imageId: string | null) => Promise<unknown>;
  disabled?: boolean;
  className?: string;
}) {
  const t = useTranslations("Manage");
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    setBusy(true);
    try {
      const uploaded = await uploadImage(file, kind);

      await onChange(uploaded.id);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message === "tooLarge"
          ? t("tooLarge")
          : t("uploadFailed", { message: String((error as Error).message) })
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium">{label}</p>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          void upload(event.dataTransfer.files[0]);
        }}
        className={cn(
          "border-border bg-muted/30 relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg border border-dashed",
          over && "border-primary bg-primary/10"
        )}
      >
        {image ? (
          <WikiImage
            image={image}
            sizes="16rem"
            className="size-full object-contain"
          />
        ) : (
          <ImagePlus
            className="text-muted-foreground/40 size-10"
            aria-hidden
          />
        )}
        {busy && (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || busy}
          onClick={() => input.current?.click()}
        >
          <ImagePlus aria-hidden /> {image ? t("replace") : t("upload")}
        </Button>
        {image && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled || busy}
            onClick={() => onChange(null)}
          >
            <Trash2 aria-hidden /> {t("remove")}
          </Button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={ACCEPTED_IMAGES}
        hidden
        onChange={(event) => {
          void upload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
