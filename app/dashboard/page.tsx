import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = createClient();
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // if (!user) redirect("/login");
  const user = { email: "guest@example.com", id: "00000000-0000-0000-0000-000000000000" };

  return <DashboardClient userEmail={user.email ?? ""} userId={user.id} />;
}
