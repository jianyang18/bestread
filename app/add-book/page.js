import { getUser } from "@/lib/supabase/queries/cached-queries";
import { redirect } from "next/navigation";
import { AddBookClientPage } from "@/components/add-book-client-page";

export const metadata = { title: "add a book" };

export default async function AddBookPage() {
  const user = await getUser();
  if (!user?.data) redirect("/login");
  if (!user.data.username) redirect("/onboarding");
  return <AddBookClientPage username={user.data.username} />;
}
