export type Category =
  | 'science & nature'
  | 'psychology'
  | 'history & politics'
  | 'philosophy'
  | 'technology'
  | 'art & culture'
  | 'economics & society'
  | 'language & words';

export const ALL_CATEGORIES: Category[] = [
  'science & nature',
  'psychology',
  'history & politics',
  'philosophy',
  'technology',
  'art & culture',
  'economics & society',
  'language & words',
];

export type Angle =
  | 'how_did_we_get_here'
  | 'why_people_act'
  | 'whats_coming_next'
  | 'who_has_power';

export type SurpriseType =
  | 'nobody_knows'
  | 'challenges_belief'
  | 'explains_wonder'
  | 'wildly_unexpected';

export type SocialRole =
  | 'asks_questions'
  | 'tells_stories'
  | 'connects_dots'
  | 'listens';

export type NotificationFrequency = 1 | 2 | 3 | 4 | 5;

export interface Curiosity {
  id: string;
  category: Category;
  angle: Angle;
  surprise_type: SurpriseType;
  hook: string;
  body: string;
  deepDive?: string;
  tags: string[];
}

export interface SeenEntry {
  id: string;
  seenAt: number;
}

export interface UserPreferences {
  userName: string;
  categories: Category[];
  angle: Angle;
  socialRole: SocialRole;
  shareType: SurpriseType;
  notifFrequency: NotificationFrequency;
  startTime: string;
  endTime: string;
  onboardingComplete: boolean;
  photoUri?: string;
}
