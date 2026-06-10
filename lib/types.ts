export type Oshi = {
  id: string;
  name: string;
  group: string;
  memberColor: string;
  emoji: string;
  imageUrl?: string;
  congratulationMessage?: string;
};

export type SavingRule = {
  id: string;
  oshiId: string;
  trigger: string;
  amount: number;
  emoji: string;
  displayOrder: number;
};

export type SavingRecord = {
  id: string;
  oshiId: string;
  ruleId: string | null;
  trigger: string;
  amount: number;
  savedAt: string;
};

export type SavingGoal = {
  id: string;
  oshiId: string;
  label: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
};

// Supabase から返ってくる生の型
export type DbOshi = {
  id: string;
  user_id: string;
  name: string;
  group_name: string;
  member_color: string;
  emoji: string;
  image_url?: string;
  display_order: number;
  congratulation_message?: string;
};

export type DbSavingRule = {
  id: string;
  user_id: string;
  oshi_id: string;
  trigger: string;
  amount: number;
  emoji: string;
  display_order: number;
  created_at: string;
};

export type DbSavingGoal = {
  id: string;
  user_id: string;
  oshi_id: string;
  label: string;
  target_amount: number;
  current_amount: number;
  emoji: string;
};

export type DbSavingRecord = {
  id: string;
  user_id: string;
  oshi_id: string;
  rule_id: string | null;
  trigger: string;
  amount: number;
  saved_at: string;
};
