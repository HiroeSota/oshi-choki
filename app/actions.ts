"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SavingRule } from "@/lib/types";

export async function saveMoney(rule: SavingRule, oshiId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error: recordError } = await supabase.from("saving_records").insert({
    oshi_id: oshiId,
    rule_id: rule.id,
    trigger: rule.trigger,
    amount: rule.amount,
    user_id: user.id,
  });
  if (recordError) throw new Error(recordError.message);

  const { error: goalError } = await supabase.rpc("increment_goal_amount", {
    p_oshi_id: oshiId,
    p_amount: rule.amount,
  });
  if (goalError) throw new Error(goalError.message);

  revalidatePath("/");
}

export async function upsertOshi(data: {
  name: string;
  groupName: string;
  memberColor: string;
  emoji: string;
  imageUrl?: string;
  goalLabel: string;
  goalTarget: number;
  existingOshiId?: string;
  existingGoalId?: string;
}): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  let oshiId = data.existingOshiId;

  if (oshiId) {
    const { error } = await supabase
      .from("oshis")
      .update({
        name: data.name,
        group_name: data.groupName,
        member_color: data.memberColor,
        emoji: data.emoji,
        image_url: data.imageUrl ?? null,
      })
      .eq("id", oshiId);
    if (error) return { error: error.message };
  } else {
    const { data: newOshi, error } = await supabase
      .from("oshis")
      .insert({
        user_id: user.id,
        name: data.name,
        group_name: data.groupName,
        member_color: data.memberColor,
        emoji: data.emoji,
        image_url: data.imageUrl ?? null,
      })
      .select()
      .single();
    if (error) return { error: error.message };
    oshiId = newOshi.id;
  }

  if (data.existingGoalId) {
    await supabase
      .from("saving_goals")
      .update({ label: data.goalLabel, target_amount: data.goalTarget })
      .eq("id", data.existingGoalId);
  } else {
    await supabase.from("saving_goals").insert({
      user_id: user.id,
      oshi_id: oshiId,
      label: data.goalLabel,
      target_amount: data.goalTarget,
      current_amount: 0,
      emoji: "🏆",
    });
  }

  revalidatePath("/");
  revalidatePath("/settings/oshi");
  redirect("/");
}

export async function addRule(data: {
  oshiId: string;
  trigger: string;
  amount: number;
  emoji: string;
}): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("saving_rules").insert({
    user_id: user.id,
    oshi_id: data.oshiId,
    trigger: data.trigger,
    amount: data.amount,
    emoji: data.emoji,
  });
  if (error) return { error: error.message };

  revalidatePath("/settings/rules");
  revalidatePath("/");
}

export async function updateRule(
  id: string,
  data: { trigger: string; amount: number; emoji: string }
): Promise<{ error: string } | void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("saving_rules")
    .update({ trigger: data.trigger, amount: data.amount, emoji: data.emoji })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/settings/rules");
  revalidatePath("/");
}

export async function deleteRule(id: string): Promise<{ error: string } | void> {
  const supabase = await createClient();

  const { error } = await supabase.from("saving_rules").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/settings/rules");
  revalidatePath("/");
}

export async function uploadOshiImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop();
  const filePath = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("oshi-images")
    .upload(filePath, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabase.storage.from("oshi-images").getPublicUrl(filePath);
  return { url: data.publicUrl };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
