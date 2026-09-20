export type GoalProgressMode = "manual" | "tasks" | "habits" | "combined";

export type GoalMilestone = {
  id: string;
  title: string;
  completed: boolean;
};

export type Goal = {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  targetDate?: string;
  project?: string;
  progressMode: GoalProgressMode;
  manualProgress?: number;
  linkedTaskIds: string[];
  linkedHabitIds: string[];
  milestones: GoalMilestone[];
  completed?: boolean;
  createdAt: Date;
};
