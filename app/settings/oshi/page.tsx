import Link from "next/link";
import { redirect } from "next/navigation";
import { OshiListManager } from "@/components/OshiListManager";
import { createClient } from "@/lib/supabase/server";
import type { DbOshi, DbSavingGoal } from "@/lib/types";

export default async function OshiListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: oshisData } = await supabase
    .from("oshis")
    .select("*")
    .eq("user_id", user.id)
    .order("display_order", { ascending: true })
    .returns<DbOshi[]>();

  const oshis = oshisData ?? [];

  const goalsRes = await Promise.all(
    oshis.map((o) =>
      supabase
        .from("saving_goals")
        .select("*")
        .eq("oshi_id", o.id)
        .returns<DbSavingGoal[]>()
        .maybeSingle()
    )
  );

  const goalsByOshiId: Record<string, DbSavingGoal> = {};
  for (let i = 0; i < oshis.length; i++) {
    const g = goalsRes[i].data;
    if (g) goalsByOshiId[oshis[i].id] = g;
  }

  return <OshiListManager oshis={oshis} goalsByOshiId={goalsByOshiId} />;
}
