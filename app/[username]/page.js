import { notFound } from "next/navigation";
import { getUserByUsername, getUserLibrary, getUserStreaks, getUser } from "@/lib/supabase/queries/cached-queries";
import { LibraryView } from "@/components/library-view";

export async function generateMetadata({ params }) {
  const { username } = await params;
  return {
    title: `${username}'s library`,
    description: `${username}'s reading tracker on bestRead`,
  };
}

export default async function UserLibraryPage({ params }) {
  const { username } = await params;
  const [profileResult, currentUser] = await Promise.all([
    getUserByUsername(username),
    getUser(),
  ]);

  if (!profileResult?.data) notFound();

  const profile = profileResult.data;
  const isOwner = currentUser?.data?.id === profile.id;

  const [libraryResult, streakResult] = await Promise.all([
    getUserLibrary(profile.id),
    getUserStreaks(profile.id),
  ]);

  const books = libraryResult?.data || [];
  const streak = streakResult?.data;

  return (
    <LibraryView
      books={books}
      isOwner={isOwner}
      username={username}
      streak={streak}
    />
  );
}
