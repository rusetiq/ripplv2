export type User = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  streak: number;
  points: number;
  rank: number;
  loggedToday: boolean;
  badge: string;
  city: string;
  co2Saved: number;
  weeklyPoints: number;
};

export type Action = {
  id: string;
  userId: string;
  user: User;
  type: string;
  icon: string;
  name: string;
  points: number;
  co2: number;
  context: string;
  timestamp: string;
  ripples: number;
  comments: number;
  rippled: boolean;
};

export type LogCategory = {
  id: string;
  label: string;
  icon: string;
  color: string;
  actions: LogAction[];
};

export type LogAction = {
  id: string;
  name: string;
  points: number;
  co2: number;
  unit: string;
};

export const CURRENT_USER: User = {
  id: "me",
  name: "You",
  username: "renz",
  avatar: "R",
  streak: 7,
  points: 2840,
  rank: 4,
  loggedToday: false,
  badge: "🌊",
  city: "Dubai",
  co2Saved: 47.3,
  weeklyPoints: 680,
};

export const USERS: User[] = [
  {
    id: "1",
    name: "Sara Al Mansoori",
    username: "sara_m",
    avatar: "S",
    streak: 14,
    points: 4120,
    rank: 1,
    loggedToday: true,
    badge: "🔥",
    city: "Abu Dhabi",
    co2Saved: 89.2,
    weeklyPoints: 1020,
  },
  {
    id: "2",
    name: "Khalid Rashid",
    username: "khalid_r",
    avatar: "K",
    streak: 9,
    points: 3670,
    rank: 2,
    loggedToday: true,
    badge: "⚡",
    city: "Dubai",
    co2Saved: 72.1,
    weeklyPoints: 890,
  },
  {
    id: "3",
    name: "Meera Nair",
    username: "meera_n",
    avatar: "M",
    streak: 5,
    points: 3210,
    rank: 3,
    loggedToday: true,
    badge: "🌿",
    city: "Sharjah",
    co2Saved: 61.5,
    weeklyPoints: 770,
  },
  CURRENT_USER,
  {
    id: "5",
    name: "Omar Hassan",
    username: "omar_h",
    avatar: "O",
    streak: 3,
    points: 1980,
    rank: 5,
    loggedToday: true,
    badge: "💧",
    city: "Dubai",
    co2Saved: 38.9,
    weeklyPoints: 420,
  },
];

export const FEED_ACTIONS: Action[] = [
  {
    id: "a1",
    userId: "1",
    user: USERS[0],
    type: "transport",
    icon: "🚇",
    name: "Metro instead of car",
    points: 60,
    co2: 2.4,
    context: "UAE transport must cut 23% by 2030 — you moved it.",
    timestamp: "12m ago",
    ripples: 18,
    comments: 4,
    rippled: false,
  },
  {
    id: "a2",
    userId: "2",
    user: USERS[1],
    type: "food",
    icon: "🥗",
    name: "Plant-based meal",
    points: 40,
    co2: 1.8,
    context: "Food accounts for 26% of global emissions. This plate matters.",
    timestamp: "34m ago",
    ripples: 11,
    comments: 2,
    rippled: false,
  },
  {
    id: "a3",
    userId: "3",
    user: USERS[2],
    type: "energy",
    icon: "☀️",
    name: "Solar panels on — AC off",
    points: 80,
    co2: 3.6,
    context: "UAE targets 44% clean energy by 2050. Your roof counts.",
    timestamp: "1h ago",
    ripples: 27,
    comments: 6,
    rippled: true,
  },
  {
    id: "a4",
    userId: "5",
    user: USERS[4],
    type: "waste",
    icon: "♻️",
    name: "Zero-waste grocery run",
    points: 30,
    co2: 0.9,
    context: "UAE generates 2.7 kg waste/person/day. You chose different.",
    timestamp: "2h ago",
    ripples: 8,
    comments: 1,
    rippled: false,
  },
  {
    id: "a5",
    userId: "1",
    user: USERS[0],
    type: "water",
    icon: "💧",
    name: "Low-flow shower — 5 min",
    points: 25,
    co2: 0.6,
    context: "UAE has among the world's highest water consumption. Cut it.",
    timestamp: "3h ago",
    ripples: 14,
    comments: 3,
    rippled: false,
  },
];

export const LOG_CATEGORIES: LogCategory[] = [
  {
    id: "transport",
    label: "Transport",
    icon: "🚗",
    color: "#00E5A0",
    actions: [
      { id: "t1", name: "Metro / bus instead of car", points: 60, co2: 2.4, unit: "trip" },
      { id: "t2", name: "Cycled to destination", points: 80, co2: 3.2, unit: "trip" },
      { id: "t3", name: "Walked (>15 min)", points: 30, co2: 1.0, unit: "trip" },
      { id: "t4", name: "Carpooled", points: 40, co2: 1.6, unit: "trip" },
      { id: "t5", name: "EV charged (home solar)", points: 100, co2: 4.5, unit: "session" },
    ],
  },
  {
    id: "food",
    label: "Food",
    icon: "🥗",
    color: "#7B61FF",
    actions: [
      { id: "f1", name: "Plant-based meal", points: 40, co2: 1.8, unit: "meal" },
      { id: "f2", name: "No food waste today", points: 20, co2: 0.8, unit: "day" },
      { id: "f3", name: "Local produce only", points: 35, co2: 1.4, unit: "shop" },
      { id: "f4", name: "Reusable bag / container", points: 15, co2: 0.5, unit: "use" },
    ],
  },
  {
    id: "energy",
    label: "Energy",
    icon: "⚡",
    color: "#FFB547",
    actions: [
      { id: "e1", name: "AC set to 24°C+", points: 25, co2: 1.0, unit: "day" },
      { id: "e2", name: "Solar used today", points: 80, co2: 3.6, unit: "day" },
      { id: "e3", name: "Lights off (empty room)", points: 10, co2: 0.4, unit: "instance" },
      { id: "e4", name: "Hang-dried laundry", points: 20, co2: 0.8, unit: "load" },
    ],
  },
  {
    id: "water",
    label: "Water",
    icon: "💧",
    color: "#38BDF8",
    actions: [
      { id: "w1", name: "5-min shower", points: 25, co2: 0.6, unit: "shower" },
      { id: "w2", name: "Reused greywater", points: 30, co2: 0.8, unit: "instance" },
      { id: "w3", name: "No bottled water", points: 15, co2: 0.4, unit: "day" },
    ],
  },
  {
    id: "waste",
    label: "Waste",
    icon: "♻️",
    color: "#34D399",
    actions: [
      { id: "r1", name: "Recycled correctly", points: 20, co2: 0.7, unit: "session" },
      { id: "r2", name: "Composted food scraps", points: 35, co2: 1.2, unit: "session" },
      { id: "r3", name: "Repaired instead of bought", points: 50, co2: 2.0, unit: "item" },
      { id: "r4", name: "Donated / upcycled item", points: 30, co2: 1.1, unit: "item" },
    ],
  },
];

export const IMPACT_DATA = {
  totalCO2: 47.3,
  totalPoints: 2840,
  streak: 7,
  treesEquivalent: 2.1,
  drivingKmAvoided: 284,
  waterSavedLiters: 1840,
  mealsOffset: 26,
  weeklyHistory: [
    { day: "Mon", points: 120, co2: 2.1 },
    { day: "Tue", points: 95, co2: 1.7 },
    { day: "Wed", points: 180, co2: 3.2 },
    { day: "Thu", points: 60, co2: 1.1 },
    { day: "Fri", points: 145, co2: 2.6 },
    { day: "Sat", points: 80, co2: 1.4 },
    { day: "Sun", points: 0, co2: 0 },
  ],
  uaeContext: {
    netZeroYear: 2050,
    currentProgress: 31,
    transportTarget: 23,
    energyTarget: 44,
    userContributionRank: "Top 12%",
  },
  badges: [
    { id: "b1", icon: "🌊", name: "Wave Maker", desc: "7-day streak", unlocked: true },
    { id: "b2", icon: "⚡", name: "Solar Powered", desc: "Used solar 5 times", unlocked: true },
    { id: "b3", icon: "🚇", name: "Metro Rider", desc: "30 transit trips", unlocked: true },
    { id: "b4", icon: "🌿", name: "Green Plate", desc: "20 plant-based meals", unlocked: false },
    { id: "b5", icon: "💎", name: "Carbon Crusher", desc: "50 kg CO₂ saved", unlocked: false },
    { id: "b6", icon: "🏆", name: "Top 10", desc: "Reach top 10 UAE", unlocked: false },
  ],
};
