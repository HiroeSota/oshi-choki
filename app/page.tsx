import { Dashboard } from "@/components/Dashboard";
import { supabase } from "@/lib/supabase";
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

async function fetchDashboardData() {
  const [oshiRes, rulesRes, goalRes, recordsRes] = await Promise.all([
    supabase.from("oshis").select("*").single<DbOshi>(),
    supabase.from("saving_rules").select("*").returns<DbSavingRule[]>(),
    supabase.from("saving_goals").select("*").single<DbSavingGoal>(),
    supabase
      .from("saving_records")
      .select("*")
      .order("saved_at", { ascending: false })
      .limit(20)
      .returns<DbSavingRecord[]>(),
  ]);

  if (oshiRes.error) throw new Error(oshiRes.error.message);
  if (rulesRes.error) throw new Error(rulesRes.error.message);
  if (goalRes.error) throw new Error(goalRes.error.message);
  if (recordsRes.error) throw new Error(recordsRes.error.message);

  const oshi: Oshi = {
    id: oshiRes.data.id,
    name: oshiRes.data.name,
    group: oshiRes.data.group_name,
    memberColor: oshiRes.data.member_color,
    emoji: oshiRes.data.emoji,
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

  return { oshi, rules, goal, records };
}

export default async function DashboardPage() {
  const { oshi, rules, goal, records } = await fetchDashboardData();

  return <Dashboard oshi={oshi} goal={goal} rules={rules} records={records} />;
}
