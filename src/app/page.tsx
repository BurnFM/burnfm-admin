import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  // Not logged in → go to login
  if (!session) {
    redirect("/api/auth/signin");
  }

  // Logged in → go to shows
  redirect("/shows");
}