"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { SavingRule } from "@/lib/types";

export async function saveMoney(rule: SavingRule, oshiId: string) {
  const { error: recordError } = await supabase.from("saving_records").insert({
    oshi_id: oshiId,
    rule_id: rule.id,
    trigger: rule.trigger,
    amount: rule.amount,
  });

  if (recordError) throw new Error(recordError.message);

  const { error: goalError } = await supabase.rpc("increment_goal_amount", {
    p_oshi_id: oshiId,
    p_amount: rule.amount,
  });

  if (goalError) throw new Error(goalError.message);

  revalidatePath("/");
}
