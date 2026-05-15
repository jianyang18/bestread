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
          <DialogTitle className="text-sm font-medium">{book.title}</DialogTitle>
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
              <div className="w-14 h-[84px] bg-secondary flex-shrink-0" />
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
                  {uploading ? "uploading..." : imageUrl ? "replace" : "upload"}
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
                    className={`px-4 py-1.5 text-sm border transition-colors ${
                      progressType === type
                        ? "bg-foreground text-background border-foreground"
                        : "border-input bg-background hover:bg-accent"
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
                    className="accent-primary"
                  />
                  currently reading
                </label>
                <label className="flex items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={isFinished}
                    onChange={(e) => handleFinishedChange(e.target.checked)}
                    className="accent-primary"
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
                    className={`text-lg transition-colors ${
                      star <= rating ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save */}
          <Button onClick={handleSave} disabled={isEditing || uploading} className="w-full">
            save
          </Button>

          {/* Remove */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full text-center text-sm text-destructive hover:text-destructive/80 transition-colors"
          >
            remove from library
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
