export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PrescriptionItem {
  category: string;
  action: string;
}

export interface ComfortLetter {
  id: string;
  createdAt: string;
  teacherRole: string;
  mainBurden: string;
  feelings: string[];
  title: string;
  quote: string;
  letter: string;
  prescriptions: PrescriptionItem[];
  blessing: string;
  saved?: boolean;
}

export type TeacherRole =
  | '초등 담임/교과 교사'
  | '중등 교과/담임 교사'
  | '고등 입시/진로 교사'
  | '특수교사'
  | '유치원 교사'
  | '비담임/전담 교사'
  | '보건/전문상담/영양/사서 교사';

export type BurdenCategory =
  | '학부모 민원 및 무리한 요구'
  | '학생 생활지도 및 거친 행동'
  | '과중한 행정 공문과 수업 부담'
  | '"내가 부족해서일까" 자책감과 회의감'
  | '관리자 및 동료와의 관계 갈등'
  | '신규 및 저경력 교사의 불안감';

export interface CounselingSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  teacherRole: TeacherRole | string;
  category: string;
  moodBefore: string;
  moodAfter?: string;
  messages: ChatMessage[];
  teacherPrivateNote: string;
  tags: string[];
  pinned: boolean;
  startTime?: string;
  endTime?: string;
  durationSeconds?: number;
  stressScore?: number;
  detectedStressTriggers?: string[];
}

export interface CounselingStats {
  totalSessions: number;
  totalMessages: number;
  totalDurationSeconds: number;
  avgDurationMinutes: number;
  primaryStressArea: string;
  categoryCounts: Record<string, number>;
  categoryPercentages: Record<string, number>;
  recentMoods: string[];
  lastSessionDate: string | null;
}

export interface StressCategoryInsight {
  category: string;
  count: number;
  percentage: number;
  severity: 'high' | 'medium' | 'low';
  keyTriggers: string[];
  summary: string;
}

export interface StressAnalysisReport {
  analyzedAt: string;
  totalAnalyzedSessions: number;
  totalCounselingMinutes: number;
  primaryStressArea: string;
  burnoutRiskLevel: '안정' | '주의' | '경고' | '심각';
  burnoutRiskDescription: string;
  categoryDistribution: StressCategoryInsight[];
  recurringTriggers: string[];
  personalizedCounselingStrategy: string;
  teacherStrengths: string[];
  recommendedBoundaries: string[];
  mentorTunedKeywords: string[];
}

export type AppTab = 'counseling' | 'letter' | 'unburden' | 'breathing' | 'saved' | 'data-manage';

