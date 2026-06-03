export type Oshi = {
  id: string;
  name: string;
  group: string;
  memberColor: string;
  emoji: string;
};

export type SavingRule = {
  id: string;
  oshiId: string;
  trigger: string;
  amount: number;
  emoji: string;
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
  name: string;
  group_name: string;
  member_color: string;
  emoji: string;
};

export type DbSavingRule = {
  id: string;
  oshi_id: string;
  trigger: string;
  amount: number;
  emoji: string;
};

export type DbSavingGoal = {
  id: string;
  oshi_id: string;
  label: string;
  target_amount: number;
  current_amount: number;
  emoji: string;
};

export type DbSavingRecord = {
  id: string;
  oshi_id: string;
  rule_id: string | null;
  trigger: string;
  amount: number;
  saved_at: string;
};
