import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  // Already logged in → go to dashboard
  if (session) redirect("/dashboard");

  // Not logged in → go to login
  redirect("/login");
}
