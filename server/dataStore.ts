import fs from 'fs';
import path from 'path';

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CounselingSessionRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  teacherRole: string;
  category: string;
  moodBefore: string;
  moodAfter?: string;
  messages: StoredMessage[];
  teacherPrivateNote: string;
  tags: string[];
  pinned: boolean;
  startTime?: string;
  endTime?: string;
  durationSeconds?: number;
  stressScore?: number;
  detectedStressTriggers?: string[];
}

export interface CounselingDataStore {
  version: number;
  sessions: CounselingSessionRecord[];
  lastBackupDate?: string;
  analysisReport?: any;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'counseling_store.json');

const INITIAL_SESSIONS: CounselingSessionRecord[] = [
  {
    id: 'session-seed-1',
    createdAt: '2026. 09. 19. 오후 5:40',
    updatedAt: '2026. 09. 19. 오후 6:15',
    title: '학부모 악성 민원 전화 후 붕괴된 마음 회복 상담',
    teacherRole: '초등 담임/교과 교사',
    category: '학부모 민원 및 무리한 요구',
    moodBefore: '심장 두근거림, 손 떨림, 억울함과 자책감',
    moodAfter: '자책감 분리, 호흡 안정, 내일 대응 원칙 정립',
    startTime: '오후 5:40',
    endTime: '오후 6:15',
    durationSeconds: 2100, // 35 minutes
    stressScore: 9,
    detectedStressTriggers: ['학부모 고성 폭언', '자질 공격 및 자격 시비', '교육청 고발 협박', '퇴근 후 연락'],
    messages: [
      {
        id: 'seed-m-1',
        role: 'user',
        content: '오늘 방과후에 학부모님께서 다짜고짜 아이들 다툼 문제로 전화를 하셔서 고성을 지르셨어요. "선생 자격이 없다", "교육청에 민원 넣겠다"고 하시는데 머리가 하얘지고 손이 덜덜 떨립니다. 제가 무엇을 그렇게 잘못했을까요?',
        timestamp: '오후 5:41',
      },
      {
        id: 'seed-m-2',
        role: 'assistant',
        content: `선생님, 지금 얼마나 놀라고 심장이 방망이질치듯 뛰셨습니까. 퇴근길까지 그 거친 폭언의 잔향이 귓가에 맴돌아 숨조차 편히 쉬지 못하셨을 것을 생각하니 마음이 미어집니다.

가장 먼저 단호하게 말씀드립니다:
선생님은 잘못하신 것이 결코 없습니다.
학부모님의 격앙된 분노와 거친 폭언은 학부모 본인의 미숙한 감정 조절 실패이지, 선생님의 교사로서의 자질이나 인격의 결함 때문이 아닙니다.

이 상처는 혼자 짊어질 문제가 아닙니다. 오늘 밤은 다음을 기억해주세요:
1. "이 분노는 내 것이 아니다": 학부모의 감정 쓰레기통이 되어주실 필요가 없습니다.
2. 교실 밖으로 퇴근한 지금, 선생님은 온전히 한 사람의 소중한 인간으로 쉬어야 합니다.
3. 내일 아침 관리자(교감/교장선생님)와 교권보호 담당 부서에 상황을 객관적으로 보고하여 공적 보호 울타리를 먼저 요청하십시오.

지금 가슴에 손을 얹고 천천히 숨을 깊게 들이쉬어 보세요. 선생님은 오늘 아이들을 위해 최선을 다하셨습니다.`,
        timestamp: '오후 5:42',
      },
      {
        id: 'seed-m-3',
        role: 'user',
        content: '멘토님 말씀 읽고 눈물이 왈칵 쏟아졌어요... "이 분노는 내 것이 아니다"라는 말이 갇혀있던 숨을 터주네요. 내일 아침 관리자께 먼저 보고드리고 혼자 끙끙 앓지 않겠습니다.',
        timestamp: '오후 5:48',
      },
    ],
    teacherPrivateNote: '멘토님의 조언 덕분에 자책에서 빠져나왔다. 내일 통화 녹취록 일시 정리 후 교감선생님께 공식 보고하기로 함. 나 자신을 지키는 것이 먼저다.',
    tags: ['학부모민원', '교권보호', '자책감분리'],
    pinned: true,
  },
  {
    id: 'session-seed-2',
    createdAt: '2026. 09. 15. 오후 4:20',
    updatedAt: '2026. 09. 15. 오후 4:45',
    title: '학생 생활지도 한계와 교사로서의 무기력감',
    teacherRole: '중등 교과/담임 교사',
    category: '학생 생활지도 및 거친 행동',
    moodBefore: '기력 소진, 회의감, 공허함',
    moodAfter: '나의 한계 수용, 따뜻한 자기돌봄',
    startTime: '오후 4:20',
    endTime: '오후 4:45',
    durationSeconds: 1500, // 25 minutes
    stressScore: 8,
    detectedStressTriggers: ['수업 중 지속적 소음', '공개적 반항 및 비웃음', '통제 상실감', '교사 자책감'],
    messages: [
      {
        id: 'seed-m-4',
        role: 'user',
        content: '수업 시간에 지속적으로 소음을 내고 반항하는 학생을 지도하다가 목소리를 높였습니다. 아이는 비웃듯 쳐다보고 교실 전체 분위기가 싸늘해졌는데, 교단에 서 있는 제 자신이 너무 초라하고 무능하게 느껴집니다.',
        timestamp: '오후 4:21',
      },
      {
        id: 'seed-m-5',
        role: 'assistant',
        content: `선생님, 온 에너지를 쏟아 준비한 교단에서 마주한 그 냉담함과 무력감이 얼마나 시리고 아프셨을지 깊이 공감합니다.

교사는 전지전능한 성자가 아니며, 사람의 마음을 기계처럼 즉각 개조할 수 있는 존재도 아닙니다. 학생의 반항적인 태도는 학생 내면의 결핍이나 환경적 반작용일 가능성이 높으며, 결코 선생님의 수업 능력이나 교사로서의 존엄을 훼손할 수 없습니다.

선생님이 흔들리셨던 것은 아이들을 잘 지도하고 싶었던 '열정'과 '애정'이 있었기 때문입니다. 오늘은 자책하는 대신 교실의 불을 끄고 나 자신에게 "오늘도 교실을 지키느라 참 애썼다"고 말해주세요.`,
        timestamp: '오후 4:23',
      },
    ],
    teacherPrivateNote: '학생의 반항을 개인적 공격으로 받아들이지 않고, 상담실 및 위클래스 연계를 고려하기로 했다. 완벽한 교사라는 강박을 내려놓자.',
    tags: ['생활지도', '무기력극복', '위클래스연계'],
    pinned: false,
  },
];

function ensureDataFile(): CounselingDataStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
      const initialData: CounselingDataStore = {
        version: 1,
        sessions: INITIAL_SESSIONS,
        lastBackupDate: new Date().toISOString(),
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }

    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading counseling data store:', error);
    return {
      version: 1,
      sessions: INITIAL_SESSIONS,
    };
  }
}

function saveDataFile(data: CounselingDataStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (error) {
    console.error('Error writing counseling data store:', error);
    throw error;
  }
}

export const counselingDataStore = {
  // 1. Get all sessions with search & filter
  getAllSessions(options?: { search?: string; category?: string; tag?: string }) {
    const data = ensureDataFile();
    let sessions = [...data.sessions];

    if (options?.category && options.category !== '전체') {
      sessions = sessions.filter((s) => s.category === options.category);
    }

    if (options?.tag) {
      sessions = sessions.filter((s) => s.tags?.includes(options.tag!));
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      sessions = sessions.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.teacherPrivateNote?.toLowerCase().includes(q) ||
          s.messages.some((m) => m.content.toLowerCase().includes(q))
      );
    }

    // Sort: pinned first, then newest updatedAt / createdAt
    return sessions.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.id.localeCompare(a.id);
    });
  },

  // 2. Get session by ID
  getSessionById(id: string) {
    const data = ensureDataFile();
    return data.sessions.find((s) => s.id === id) || null;
  },

  // 3. Create or Save Session
  saveSession(sessionData: Partial<CounselingSessionRecord>): CounselingSessionRecord {
    const data = ensureDataFile();
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) + ' ' + now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    const newSession: CounselingSessionRecord = {
      id: sessionData.id || `session-${Date.now()}`,
      createdAt: sessionData.createdAt || dateFormatted,
      updatedAt: dateFormatted,
      title: sessionData.title || '선생님 마음 상담 기록',
      teacherRole: sessionData.teacherRole || '초등 담임/교과 교사',
      category: sessionData.category || '기타 고민',
      moodBefore: sessionData.moodBefore || '지침',
      moodAfter: sessionData.moodAfter || '안정',
      messages: sessionData.messages || [],
      teacherPrivateNote: sessionData.teacherPrivateNote || '',
      tags: sessionData.tags || [],
      pinned: sessionData.pinned || false,
      startTime: sessionData.startTime || '',
      endTime: sessionData.endTime || '',
      durationSeconds: typeof sessionData.durationSeconds === 'number'
        ? sessionData.durationSeconds
        : Math.max(300, (sessionData.messages?.length || 2) * 180), // default ~3min per turn
      stressScore: typeof sessionData.stressScore === 'number' ? sessionData.stressScore : 7,
      detectedStressTriggers: sessionData.detectedStressTriggers || [],
    };

    // Check if updating existing
    const existingIndex = data.sessions.findIndex((s) => s.id === newSession.id);
    if (existingIndex >= 0) {
      data.sessions[existingIndex] = {
        ...data.sessions[existingIndex],
        ...newSession,
        updatedAt: dateFormatted,
      };
    } else {
      data.sessions.unshift(newSession);
    }

    saveDataFile(data);
    return newSession;
  },

  // 4. Update partial session (e.g., teacher's private note, title, pinned status)
  updateSession(id: string, updates: Partial<CounselingSessionRecord>): CounselingSessionRecord | null {
    const data = ensureDataFile();
    const index = data.sessions.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) + ' ' + now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    data.sessions[index] = {
      ...data.sessions[index],
      ...updates,
      updatedAt: dateFormatted,
    };

    saveDataFile(data);
    return data.sessions[index];
  },

  // 5. Delete session
  deleteSession(id: string): boolean {
    const data = ensureDataFile();
    const initialLen = data.sessions.length;
    data.sessions = data.sessions.filter((s) => s.id !== id);
    if (data.sessions.length !== initialLen) {
      saveDataFile(data);
      return true;
    }
    return false;
  },

  // 6. Get aggregate statistics with duration and stress distribution
  getStats() {
    const data = ensureDataFile();
    const totalSessions = data.sessions.length;
    let totalMessages = 0;
    let totalDurationSeconds = 0;
    const categoryCounts: Record<string, number> = {};
    const recentMoods: string[] = [];

    data.sessions.forEach((s) => {
      totalMessages += s.messages.length;
      totalDurationSeconds += s.durationSeconds || 900; // default 15min if legacy
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
      if (s.moodAfter && !recentMoods.includes(s.moodAfter)) {
        recentMoods.push(s.moodAfter);
      }
    });

    // Calculate category percentages
    const categoryPercentages: Record<string, number> = {};
    let primaryStressArea = '기타 스트레스';
    let maxCount = 0;

    if (totalSessions > 0) {
      for (const [cat, count] of Object.entries(categoryCounts)) {
        const pct = Math.round((count / totalSessions) * 100);
        categoryPercentages[cat] = pct;
        if (count > maxCount) {
          maxCount = count;
          primaryStressArea = cat;
        }
      }
    }

    const avgDurationMinutes = totalSessions > 0
      ? Math.round((totalDurationSeconds / totalSessions) / 60)
      : 0;

    const lastSessionDate = data.sessions.length > 0 ? data.sessions[0].createdAt : null;

    return {
      totalSessions,
      totalMessages,
      totalDurationSeconds,
      avgDurationMinutes,
      primaryStressArea,
      categoryCounts,
      categoryPercentages,
      recentMoods: recentMoods.slice(0, 5),
      lastSessionDate,
    };
  },

  // 7. Generate a tailored context prompt for Gemini counseling
  getPersonalizedMentorContext(): string {
    const data = ensureDataFile();
    if (data.sessions.length === 0) {
      return '';
    }

    const stats = this.getStats();
    const allTriggers = Array.from(
      new Set(data.sessions.flatMap((s) => s.detectedStressTriggers || []).filter(Boolean))
    );

    const privateNotes = data.sessions
      .map((s) => s.teacherPrivateNote?.trim())
      .filter(Boolean)
      .slice(0, 3);

    const topCategories = Object.entries(stats.categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => `${cat} (${count}회, ${stats.categoryPercentages[cat]}%)`)
      .join(', ');

    const totalMinutes = Math.round(stats.totalDurationSeconds / 60);

    return `
[선생님 맞춤 상담 데이터 분석 프로필 - 상담 멘토 지침]:
- 총 누적 상담 세션: ${stats.totalSessions}회 / 총 누적 대화 시간: 약 ${totalMinutes}분 (평균 세션 ${stats.avgDurationMinutes}분)
- 가장 극심한 스트레스 호소 분야 1위: "${stats.primaryStressArea}"
- 스트레스 분야별 빈도: ${topCategories}
${allTriggers.length > 0 ? `- 자주 반복되는 주요 스트레스 트리거: ${allTriggers.slice(0, 6).join(', ')}` : ''}
${privateNotes.length > 0 ? `- 선생님이 과거 상담 후 남긴 다짐 및 회복 메모: "${privateNotes.join(' / ')}"` : ''}
- 멘토의 심층 맞춤 상담 전략:
  1. 선생님은 "${stats.primaryStressArea}" 상황에 노출될 때 죄책감과 심리적 탈진이 가장 극대화되는 패턴을 보입니다.
  2. 대화 시 선생님이 또다시 자신을 탓하거나 능력을 의심하지 않도록 "이것은 선생님의 자질 부족이 아니며, 온 힘을 다해 견디고 계신 것"임을 먼저 단호하고 따뜻하게 짚어주세요.
  3. 과거 상담에서 큰 위안을 얻었던 "분노의 분리", "교실 문 밖으로의 정서적 퇴근", "공적 교권보호 지원 요청"과 연결된 맞춤형 경계 세우기를 자연스럽게 제안해주세요.`;
  },

  // 8. Stress analysis caching
  getStressAnalysis() {
    const data = ensureDataFile();
    return data.analysisReport || null;
  },

  saveStressAnalysis(report: any) {
    const data = ensureDataFile();
    data.analysisReport = report;
    saveDataFile(data);
    return report;
  },

  // 9. Full data export
  exportData(): CounselingDataStore {
    return ensureDataFile();
  },

  // 10. Restore / Import data
  importData(incoming: Partial<CounselingDataStore>): boolean {
    if (!incoming.sessions || !Array.isArray(incoming.sessions)) {
      throw new Error('유효하지 않은 데이터 백업 포맷입니다.');
    }
    const current = ensureDataFile();
    current.sessions = incoming.sessions;
    current.analysisReport = incoming.analysisReport || current.analysisReport;
    current.lastBackupDate = new Date().toISOString();
    saveDataFile(current);
    return true;
  },
};
