import type { Oshi, SavingGoal, SavingRecord, SavingRule } from "./types";

export const mockOshi: Oshi = {
  id: "oshi-1",
  name: "桜井 莉子",
  group: "StarBloom",
  memberColor: "#FF6B9D",
  emoji: "🌸",
};

export const mockRules: SavingRule[] = [
  { id: "rule-1", oshiId: "oshi-1", trigger: "SNS更新", amount: 100, emoji: "📱" },
  { id: "rule-2", oshiId: "oshi-1", trigger: "生配信", amount: 500, emoji: "🎙️" },
  { id: "rule-3", oshiId: "oshi-1", trigger: "ライブ参戦", amount: 1000, emoji: "🎤" },
  { id: "rule-4", oshiId: "oshi-1", trigger: "雑誌掲載", amount: 300, emoji: "📖" },
];

export const mockGoal: SavingGoal = {
  id: "goal-1",
  oshiId: "oshi-1",
  label: "武道館ライブ遠征費",
  targetAmount: 50000,
  currentAmount: 18400,
  emoji: "🏟️",
};

export const mockRecords: SavingRecord[] = [
  {
    id: "rec-1",
    oshiId: "oshi-1",
    ruleId: "rule-2",
    trigger: "生配信",
    amount: 500,
    savedAt: new Date("2026-06-03T21:30:00"),
  },
  {
    id: "rec-2",
    oshiId: "oshi-1",
    ruleId: "rule-1",
    trigger: "SNS更新",
    amount: 100,
    savedAt: new Date("2026-06-03T14:15:00"),
  },
  {
    id: "rec-3",
    oshiId: "oshi-1",
    ruleId: "rule-4",
    trigger: "雑誌掲載",
    amount: 300,
    savedAt: new Date("2026-06-02T10:00:00"),
  },
  {
    id: "rec-4",
    oshiId: "oshi-1",
    ruleId: "rule-1",
    trigger: "SNS更新",
    amount: 100,
    savedAt: new Date("2026-06-01T18:45:00"),
  },
  {
    id: "rec-5",
    oshiId: "oshi-1",
    ruleId: "rule-3",
    trigger: "ライブ参戦",
    amount: 1000,
    savedAt: new Date("2026-05-31T19:00:00"),
  },
];
