import { redirect } from "next/navigation";
import { RulesManager } from "@/components/RulesManager";
import { createClient } from "@/lib/supabase/server";
import type { DbOshi, DbSavingRule, SavingRule } from "@/lib/types";

export default async function RulesPage() {
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

  const { data: rulesData } = await supabase
    .from("saving_rules")
    .select("*")
    .eq("oshi_id", oshiData.id)
    .order("created_at", { ascending: true })
    .returns<DbSavingRule[]>();

  const rules: SavingRule[] = (rulesData ?? []).map((r) => ({
    id: r.id,
    oshiId: r.oshi_id,
    trigger: r.trigger,
    amount: r.amount,
    emoji: r.emoji,
  }));

  return (
    <RulesManager
      oshiId={oshiData.id}
      memberColor={oshiData.member_color}
      initialRules={rules}
    />
  );
}
