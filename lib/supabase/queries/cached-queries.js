import { cache } from "react";
import { createClient } from "../server";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  if (!data.user) {
    return null;
  }

  // Get full user profile from users table
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return { data: profile || { id: data.user.id, email: data.user.email, username: data.user.user_metadata?.username } };
});

export const getUserLibrary = cache(async (userId) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [] };
  }

  return { data: data || [] };
});

export const getUserStreaks = cache(async (userId) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    return { data: null };
  }

  return { data };
});

export const getUserByUsername = cache(async (username) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    return { data: null };
  }

  return { data };
});
