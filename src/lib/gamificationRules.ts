export interface TitleRule {
  title: string;
  requiredContributions: number;
}

export interface BadgeRule {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const TITLES: TitleRule[] = [
  { title: "Initiate", requiredContributions: 0 },
  { title: "Junior Engineer", requiredContributions: 5 },
  { title: "Senior Developer", requiredContributions: 20 },
  { title: "System Architect", requiredContributions: 50 },
];

export const BADGES: BadgeRule[] = [
  {
    id: "first_step",
    name: "First Step",
    description: "Earned by making 1 contribution to the platform",
    icon: "Flag",
  },
  {
    id: "streak_7",
    name: "Streak Master",
    description: "Earned by maintaining a 7-day streak",
    icon: "Flame",
  },
  {
    id: "architect",
    name: "Architect",
    description: "Earned by making 50 contributions to the platform",
    icon: "Hexagon",
  },
];
