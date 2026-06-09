import { redirect } from "next/navigation";
import { OshiSettingsForm } from "@/components/OshiSettingsForm";
import { createClient } from "@/lib/supabase/server";
import type { DbOshi, DbSavingGoal, Oshi, SavingGoal } from "@/lib/types";

export default async function EditOshiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const { data: oshiData } = await supabase
    .from("oshis")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .returns<DbOshi[]>()
    .maybeSingle();

  if (!oshiData) redirect("/settings/oshi");

  const { data: goalData } = await supabase
    .from("saving_goals")
    .select("*")
    .eq("oshi_id", id)
    .returns<DbSavingGoal[]>()
    .maybeSingle();

  const oshi: Oshi = {
    id: oshiData.id,
    name: oshiData.name,
    group: oshiData.group_name,
    memberColor: oshiData.member_color,
    emoji: oshiData.emoji,
    imageUrl: oshiData.image_url,
    congratulationMessage: oshiData.congratulation_message,
  };

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

  return (
    <OshiSettingsForm oshi={oshi} goal={goal} backHref="/settings/oshi" />
  );
}
