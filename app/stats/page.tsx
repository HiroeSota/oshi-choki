import { redirect } from "next/navigation";
import { StatsView } from "@/components/StatsView";
import { createClient } from "@/lib/supabase/server";
import type { DbOshi, DbSavingRecord, SavingRecord } from "@/lib/types";

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: oshiData } = await supabase
    .from("oshis")
    .select("*")
    .eq("user_id", user.id)
    .returns<DbOshi[]>()
    .maybeSingle();

  if (!oshiData) redirect("/settings/oshi");

  const { data: recordsData } = await supabase
    .from("saving_records")
    .select("*")
    .eq("oshi_id", oshiData.id)
    .order("saved_at", { ascending: true })
    .returns<DbSavingRecord[]>();

  const records: SavingRecord[] = (recordsData ?? []).map((r) => ({
    id: r.id,
    oshiId: r.oshi_id,
    ruleId: r.rule_id,
    trigger: r.trigger,
    amount: r.amount,
    savedAt: r.saved_at,
  }));

  return (
    <StatsView
      memberColor={oshiData.member_color}
      oshiName={oshiData.name}
      oshiEmoji={oshiData.emoji}
      records={records}
    />
  );
}
