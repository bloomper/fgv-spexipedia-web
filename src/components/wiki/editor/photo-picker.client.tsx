"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, Images, Lock, Save } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Spinner } from "@bloomper/fgv-web-ui/ui/spinner";
import { spexgramAlbumsAction } from "@/app/(app)/manage/actions.server";
import { cn } from "@/utils/utils";

type Item = { itemId: string; caption?: string | null; thumbnailUrl: string; public: boolean; video: boolean };

/**
 * Picks photos and films for a section from the spex's albums in Spexgram: the group photo, the board, or an actor's
 * photos. Only the items' ids are stored; public items are shown to everyone, members' items to those with access to
 * Spexgram.
 */
export function PhotoPicker({ title, spexId, chosen, onSave, albumId }: {
  title: string;
  spexId: string;
  chosen: string[];
  /** Only this album's items, e.g. for a section that shows some items of one album. */
  albumId?: string;
  onSave: (itemIds: string[]) => Promise<boolean>;
}) {
  const t = useTranslations("Manage");
  const [albums, setAlbums] = useState<{ id: string; title: string; items: Item[] }[] | null>(null);
  const [selected, setSelected] = useState(chosen);
  const [loading, startLoading] = useTransition();
  const [saving, startSaving] = useTransition();

  const toggle = (id: string) => setSelected(current => current.includes(id) ? current.filter(c => c !== id) : [...current, id]);

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{title} <span className="text-sm font-normal text-muted-foreground">({t("chosenCount", { count: selected.length })})</span></h3>
        <div className="flex gap-2">
          {albums === null && (
            <Button type="button" size="sm" variant="outline" disabled={loading} onClick={() => startLoading(async () => {
              const result = await spexgramAlbumsAction(spexId);

              setAlbums(result.ok ? result.data : []);
            })}>{loading ? <Spinner /> : <Images aria-hidden />} {t("pickFromSpexgram")}</Button>
          )}
          <Button type="button" size="sm" disabled={saving || JSON.stringify(selected) === JSON.stringify(chosen)}
                  onClick={() => startSaving(async () => void await onSave(selected))}><Save aria-hidden /> {t("save")}</Button>
        </div>
      </div>
      {albums?.length === 0 && <p className="text-sm text-muted-foreground">{t("noAlbums")}</p>}
      {albums?.filter(album => !albumId || album.id === albumId).map(album => (
        <div key={album.id} className="space-y-2">
          <p className="text-sm font-medium">{album.title}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
            {album.items.map(item => {
              const index = selected.indexOf(item.itemId);

              return (
                <button key={item.itemId} type="button" aria-pressed={index >= 0} title={item.caption ?? undefined} onClick={() => toggle(item.itemId)}
                        className={cn("relative overflow-hidden rounded border-2", index >= 0 ? "border-primary" : "border-transparent")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.thumbnailUrl} alt={item.caption ?? ""} className="aspect-square w-full object-cover" />
                  {!item.public && <Lock className="absolute top-1 left-1 size-4 rounded bg-background/80 p-0.5" aria-label={t("membersOnly")} />}
                  {index >= 0 && <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"><Check className="size-3" />{index + 1}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
