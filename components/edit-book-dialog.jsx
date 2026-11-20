"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useAction } from "next-safe-action/hooks";
import { editBookAction } from "@/actions/edit-book.action";
import { deleteBookAction } from "@/actions/delete-book.action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BoilText } from "@/components/doodles";
import { doodlePaths } from "@/components/doodles/paths";
import { Input } from "@/components/ui/input";
import { uploadBookCover } from "@/lib/upload-cover";
import { toast } from "sonner";

export function EditBookDialog({ book, children }) {
  const [open, setOpen] = useState(false);
  const [progressType, setProgressType] = useState(book.progress_type ?? "page");
  const [progress, setProgress] = useState(String(book.progress ?? 0));
  const [isReading, setIsReading] = useState(book.is_reading && !book.is_finished);
  const [isFinished, setIsFinished] = useState(book.is_finished ?? false);
  const [rating, setRating] = useState(book.rating ?? 0);
  const [imageUrl, setImageUrl] = useState(book.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { execute: editBook, isPending: isEditing } = useAction(editBookAction, {
    onSuccess: () => { toast.success("updated"); setOpen(false); },
    onError: ({ error }) => toast.error(error.serverError || "failed to update"),
  });

  const { execute: deleteBook, isPending: isDeleting } = useAction(deleteBookAction, {
    onSuccess: () => { toast.success("book removed"); setOpen(false); },
    onError: ({ error }) => toast.error(error.serverError || "failed to delete"),
  });

  function handleSave() {
    const payload = {
      bookId: book.id,
      progress: Number(progress),
      progressType,
      isReading,
      isFinished,
    };
    if (rating > 0) payload.rating = rating;
    if (imageUrl !== (book.image_url ?? null)) payload.imageUrl = imageUrl;
    editBook(payload);
  }

  function handleDelete() {
    if (confirm(`remove "${book.title}"?`)) {
      deleteBook({ bookId: book.id });
    }
  }

  function handleFinishedChange(checked) {
    setIsFinished(checked);
    if (checked) setIsReading(false);
  }

  function handleReadingChange(checked) {
    setIsReading(checked);
    if (checked) setIsFinished(false);
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadBookCover(file);
      setImageUrl(url);
      toast.success("cover uploaded");
    } catch (err) {
      toast.error(err.message || "upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            edit
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-normal tracking-[0.04em] pr-8">{book.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Cover */}
          <div className="flex gap-3 items-start">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={book.title}
                width={56}
                height={84}
                unoptimized
                className="object-cover flex-shrink-0"
              />
            ) : (
              <div className="doodle-box w-14 h-[84px] flex-shrink-0 border-muted-foreground/60" />
            )}
            <div className="space-y-1.5">
              <p className="text-sm">cover</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs underline text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {uploading ? <BoilText text="uploading..." /> : imageUrl ? "replace" : "upload"}
                </button>
                {imageUrl && !uploading && (
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="text-xs underline text-muted-foreground hover:text-destructive"
                  >
                    remove
                  </button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">jpg, png, webp · max 2 mb</p>
            </div>
          </div>

          {/* Progress tracking — only for non-finished books */}
          {!book.is_finished && (
            <div className="space-y-3">
              <p className="text-sm">how are you tracking your progress?</p>

              {/* Toggle buttons */}
              <div className="flex gap-2">
                {["page", "percentage"].map((type) => (
                  <button
                    key={type}
                    onClick={() => { setProgressType(type); setProgress("0"); }}
                    aria-pressed={progressType === type}
                    className={`px-4 py-1 font-hand text-lg transition-colors ${
                      progressType === type
                        ? "doodle-pill text-foreground"
                        : "border-[1.5px] border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Progress input */}
              <Input
                type="number"
                min={0}
                max={progressType === "page" ? (book.page_count || undefined) : 100}
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
              />

              {/* Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={isReading}
                    onChange={(e) => handleReadingChange(e.target.checked)}
                    className="accent-[hsl(var(--doodle))]"
                  />
                  currently reading
                </label>
                <label className="flex items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={isFinished}
                    onChange={(e) => handleFinishedChange(e.target.checked)}
                    className="accent-[hsl(var(--doodle))]"
                  />
                  mark as finished
                </label>
              </div>
            </div>
          )}

          {/* Rating — only for finished books */}
          {book.is_finished && (
            <div className="space-y-2">
              <p className="text-sm">rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star === rating ? 0 : star)}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    aria-pressed={star <= rating}
                    className={`transition-[color,transform] duration-300 hover:-rotate-12 ${
                      star <= rating ? "text-doodle" : "text-muted-foreground/60"
                    }`}
                  >
                    <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {doodlePaths.star.map((d, i) => <path key={i} d={d} />)}
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save */}
          <Button onClick={handleSave} disabled={isEditing || uploading}>
            save
          </Button>

          {/* Remove */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="doodle-underline block w-fit text-sm text-destructive transition-colors"
          >
            remove from library
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
