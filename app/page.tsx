import { redirect } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { createClient } from "@/lib/supabase/server";
import type {
  DbOshi,
  DbSavingGoal,
  DbSavingRecord,
  DbSavingRule,
  Oshi,
  SavingGoal,
  SavingRecord,
  SavingRule,
} from "@/lib/types";

export default async function DashboardPage() {
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

  const [rulesRes, goalRes, recordsRes] = await Promise.all([
    supabase
      .from("saving_rules")
      .select("*")
      .eq("oshi_id", oshiData.id)
      .returns<DbSavingRule[]>(),
    supabase
      .from("saving_goals")
      .select("*")
      .eq("oshi_id", oshiData.id)
      .returns<DbSavingGoal[]>()
      .maybeSingle(),
    supabase
      .from("saving_records")
      .select("*")
      .eq("oshi_id", oshiData.id)
      .order("saved_at", { ascending: false })
      .limit(20)
      .returns<DbSavingRecord[]>(),
  ]);

  if (!goalRes.data) redirect("/settings/oshi");

  const oshi: Oshi = {
    id: oshiData.id,
    name: oshiData.name,
    group: oshiData.group_name,
    memberColor: oshiData.member_color,
    emoji: oshiData.emoji,
    imageUrl: oshiData.image_url,
  };

  const rules: SavingRule[] = (rulesRes.data ?? []).map((r) => ({
    id: r.id,
    oshiId: r.oshi_id,
    trigger: r.trigger,
    amount: r.amount,
    emoji: r.emoji,
  }));

  const goal: SavingGoal = {
    id: goalRes.data.id,
    oshiId: goalRes.data.oshi_id,
    label: goalRes.data.label,
    targetAmount: goalRes.data.target_amount,
    currentAmount: goalRes.data.current_amount,
    emoji: goalRes.data.emoji,
  };

  const records: SavingRecord[] = (recordsRes.data ?? []).map((r) => ({
    id: r.id,
    oshiId: r.oshi_id,
    ruleId: r.rule_id,
    trigger: r.trigger,
    amount: r.amount,
    savedAt: r.saved_at,
  }));

  return <Dashboard oshi={oshi} goal={goal} rules={rules} records={records} />;
}
