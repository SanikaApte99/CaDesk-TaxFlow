import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await auth();

  // Already logged in → go to dashboard
  if (session) redirect("/dashboard");

  // Not logged in → go to login
  redirect("/login");
}
