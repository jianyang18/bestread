"use client";

import { createClient } from "@/lib/supabase/client";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB — must match the Supabase bucket limit

const EXT_BY_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Uploads a book cover image directly from the browser to Supabase Storage
 * (`book-covers` bucket) under <auth.uid()>/<uuid>.<ext>, then returns the
 * public URL. Throws with a user-readable message on validation failure.
 */
export async function uploadBookCover(file) {
  if (!file) throw new Error("no file selected");
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error("only jpg, png, or webp images are allowed");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("image must be 2 mb or smaller");
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("you must be signed in to upload");

  const ext = EXT_BY_MIME[file.type];
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("book-covers")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error(uploadError.message || "upload failed");

  const { data } = supabase.storage.from("book-covers").getPublicUrl(path);
  return data.publicUrl;
}
