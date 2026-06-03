import { redirect } from "next/navigation";
import { OshiSettingsForm } from "@/components/OshiSettingsForm";
import { createClient } from "@/lib/supabase/server";
import type { DbOshi, DbSavingGoal, Oshi, SavingGoal } from "@/lib/types";

export default async function OshiSettingsPage() {
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

  const { data: goalData } = oshiData
    ? await supabase
        .from("saving_goals")
        .select("*")
        .eq("oshi_id", oshiData.id)
        .returns<DbSavingGoal[]>()
        .maybeSingle()
    : { data: null };

  const oshi: Oshi | null = oshiData
    ? {
        id: oshiData.id,
        name: oshiData.name,
        group: oshiData.group_name,
        memberColor: oshiData.member_color,
        emoji: oshiData.emoji,
      }
    : null;

  const goal: SavingGoal | null = goalData
    ? {
        id: goalData.id,
        oshiId: goalData.oshi_id,
        label: goalData.label,
        targetAmount: goalData.target_amount,
        currentAmount: goalData.current_amount,
        emoji: goalData.emoji,
      }
    : null;

  return <OshiSettingsForm oshi={oshi} goal={goal} />;
}
