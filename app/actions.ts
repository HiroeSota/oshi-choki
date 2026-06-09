"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SavingRule } from "@/lib/types";

export async function saveMoney(
  rule: SavingRule,
  oshiId: string
): Promise<{ achieved: boolean; recordId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const recordInsert = await supabase
    .from("saving_records")
    .insert({
      oshi_id: oshiId,
      rule_id: rule.id,
      trigger: rule.trigger,
      amount: rule.amount,
      user_id: user.id,
    })
    .select("id");
  if (recordInsert.error) throw new Error(recordInsert.error.message);

  const { error: goalError } = await supabase.rpc("increment_goal_amount", {
    p_oshi_id: oshiId,
    p_amount: rule.amount,
  });
  if (goalError) throw new Error(goalError.message);

  const { data: goalData } = await supabase
    .from("saving_goals")
    .select("current_amount, target_amount")
    .eq("oshi_id", oshiId)
    .single();

  revalidatePath("/");

  return {
    achieved: !!goalData && goalData.current_amount >= goalData.target_amount,
    recordId: recordInsert.data?.[0]?.id ?? "",
  };
}

export async function upsertOshi(data: {
  name: string;
  groupName: string;
  memberColor: string;
  emoji: string;
  imageUrl?: string;
  congratulationMessage?: string;
  goalLabel: string;
  goalTarget: number;
  existingOshiId?: string;
  existingGoalId?: string;
  redirectTo?: string;
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
        congratulation_message: data.congratulationMessage ?? null,
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
        congratulation_message: data.congratulationMessage ?? null,
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
  redirect(data.redirectTo ?? "/");
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

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("oshi-images")
    .upload(filePath, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data } = admin.storage.from("oshi-images").getPublicUrl(filePath);
  return { url: data.publicUrl };
}

export async function undoSave(
  recordId: string,
  oshiId: string,
  amount: number
): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error: deleteError } = await supabase
    .from("saving_records")
    .delete()
    .eq("id", recordId)
    .eq("user_id", user.id);
  if (deleteError) return { error: deleteError.message };

  await supabase.rpc("increment_goal_amount", {
    p_oshi_id: oshiId,
    p_amount: -amount,
  });

  revalidatePath("/");
}

export async function resetGoalAmount(
  oshiId: string
): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("saving_goals")
    .update({ current_amount: 0 })
    .eq("oshi_id", oshiId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/settings/oshi");
}

export async function updateOshiOrder(
  orderedIds: string[]
): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("oshis")
        .update({ display_order: index })
        .eq("id", id)
        .eq("user_id", user.id)
    )
  );

  revalidatePath("/");
  revalidatePath("/settings/oshi");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
