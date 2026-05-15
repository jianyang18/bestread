export async function addBook(supabase, { title, isReading, authors, userId, pageCount, imageUrl }) {
  const { data, error } = await supabase.from("books").insert({
    title,
    is_reading: isReading ?? false,
    is_finished: false,
    authors: authors ?? [],
    user_id: userId,
    page_count: pageCount ?? 0,
    image_url: imageUrl ?? null,
    progress: 0,
    progress_type: "percentage",
    rating: null,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) throw error;
  return data;
}

export async function editBook(supabase, { bookId, isReading, isFinished, progress, progressType, rating, imageUrl, userId }) {
  const updates = {};
  if (isReading !== undefined) updates.is_reading = isReading;
  if (isFinished !== undefined) {
    updates.is_finished = isFinished;
    if (isFinished) {
      updates.is_reading = false;
      updates.finished_at = new Date().toISOString();
    }
  }
  if (progress !== undefined) updates.progress = progress;
  if (progressType !== undefined) updates.progress_type = progressType;
  if (rating !== undefined) updates.rating = rating;
  if (imageUrl !== undefined) updates.image_url = imageUrl;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("books")
    .update(updates)
    .eq("id", bookId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBook(supabase, { bookId }) {
  const { error } = await supabase.from("books").delete().eq("id", bookId);
  if (error) throw error;
}

export async function updateUser(supabase, { username }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("users")
    .upsert({ id: user.id, username, email: user.email, updated_at: new Date().toISOString() });

  if (error) throw error;
}

export async function updateStreak(supabase, { userId }) {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!existing) {
    await supabase.from("streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
    });
    return;
  }

  const lastDate = existing.last_activity_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (lastDate === today) {
    // Already updated today, nothing to do
    return;
  }

  let newStreak;
  if (lastDate === yesterdayStr) {
    newStreak = existing.current_streak + 1;
  } else {
    newStreak = 1;
  }

  await supabase.from("streaks").update({
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, existing.longest_streak),
    last_activity_date: today,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);
}
