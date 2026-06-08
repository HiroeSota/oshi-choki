import { redirect } from "next/navigation";
import { RulesManager } from "@/components/RulesManager";
import { createClient } from "@/lib/supabase/server";
import type { DbOshi, DbSavingRule, Oshi, SavingRule } from "@/lib/types";

export default async function RulesPage({
  searchParams,
}: {
  searchParams: Promise<{ oshi_id?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: oshiRows } = await supabase
    .from("oshis")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .returns<DbOshi[]>();

  if (!oshiRows || oshiRows.length === 0) redirect("/settings/oshi");

  const { oshi_id } = await searchParams;
  const oshiData =
    oshiRows.find((o) => o.id === oshi_id) ?? oshiRows[0];

  const allOshis: Oshi[] = oshiRows.map((o) => ({
    id: o.id,
    name: o.name,
    group: o.group_name,
    memberColor: o.member_color,
    emoji: o.emoji,
    imageUrl: o.image_url,
  }));

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
      allOshis={allOshis}
      selectedOshiId={oshiData.id}
    />
  );
}
