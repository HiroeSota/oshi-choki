import { redirect } from "next/navigation";
import { HistoryView } from "@/components/HistoryView";
import { createClient } from "@/lib/supabase/server";
import type { DbOshi, DbSavingRecord, DbSavingRule, Oshi, SavingRecord } from "@/lib/types";

export default async function HistoryPage({
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
    .order("display_order", { ascending: true })
    .returns<DbOshi[]>();

  if (!oshiRows || oshiRows.length === 0) redirect("/settings/oshi");

  const { oshi_id } = await searchParams;
  const oshiData = oshiRows.find((o) => o.id === oshi_id) ?? oshiRows[0];

  const allOshis: Oshi[] = oshiRows.map((o) => ({
    id: o.id,
    name: o.name,
    group: o.group_name,
    memberColor: o.member_color,
    emoji: o.emoji,
    imageUrl: o.image_url,
  }));

  const [{ data: recordsData }, { data: rulesData }] = await Promise.all([
    supabase
      .from("saving_records")
      .select("*")
      .eq("oshi_id", oshiData.id)
      .order("saved_at", { ascending: false })
      .returns<DbSavingRecord[]>(),
    supabase
      .from("saving_rules")
      .select("*")
      .eq("oshi_id", oshiData.id)
      .returns<DbSavingRule[]>(),
  ]);

  const ruleEmojiMap: Record<string, string> = {};
  for (const r of rulesData ?? []) {
    ruleEmojiMap[r.id] = r.emoji;
  }

  const records: (SavingRecord & { emoji: string })[] = (recordsData ?? []).map((r) => ({
    id: r.id,
    oshiId: r.oshi_id,
    ruleId: r.rule_id,
    trigger: r.trigger,
    amount: r.amount,
    savedAt: r.saved_at,
    emoji: r.rule_id ? (ruleEmojiMap[r.rule_id] ?? "✨") : "✨",
  }));

  return (
    <HistoryView
      key={oshiData.id}
      records={records}
      memberColor={oshiData.member_color}
      allOshis={allOshis}
      selectedOshiId={oshiData.id}
    />
  );
}
