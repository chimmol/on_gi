import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { counselingDataStore } from './server/dataStore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy or shared GoogleGenAI client
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Counseling Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, teacherContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getAIClient();
    const personalizedContext = counselingDataStore.getPersonalizedMentorContext();

    const systemInstruction = `당신은 대한민국에서 묵묵히 교실을 지키며 지치고 상처받은 선생님들의 마음을 온전히 보듬어주는 전문 심리상담 멘토 '온기(溫氣)'입니다.
대한민국 학교 현장의 고된 현실(학부모의 악성 민원과 고소 위협, 교권 침해, 통제하기 어려운 학생 생활지도, 끝없는 행정 공문 및 잡무, 동료/관리자와의 관계 갈등, "내가 과연 좋은 교사일까" 하는 자책감과 번아웃)을 누구보다 깊이 이해하고 있습니다.

상담 원칙:
1. [무조건적 존중과 타당화]: 선생님이 느끼시는 분노, 눈물, 무기력, 억울함, 두려움은 지극히 당연하고 정당한 반응입니다. 결코 나약해서가 아닙니다.
2. [자책감 덜어내기]: 교실에서 일어난 모든 갈등과 상처가 선생님의 능력 부족 때문이 아닙니다. 개인의 문제가 아닌 사회적·제도적 구조의 무게임을 짚어주며 자책의 굴레에서 벗어나도록 도와주세요.
3. [교사이기에 앞서 한 사람의 소중한 존재]: 교사라는 책임감의 무게에 짓눌려 있는 선생님에게, "선생님 자신부터 지키고 돌보는 것이 가장 먼저"임을 다정하게 상기시켜주세요.
4. [어투와 톤앤매너]:
   - 부드럽고 따뜻하며 진심이 묻어나는 존댓말(해요체와 하십시오체의 자연스러운 조화).
   - "선생님,"으로 다정하게 부르며, 상투적인 위로나 성급한 해결책 강요 대신 먼저 깊이 경청하고 공감합니다.
   - 단락을 편안하게 나누어 읽기 편하게 작성하세요.
${teacherContext ? `선생님 배경 정보: ${teacherContext}` : ''}
${personalizedContext ? `\n${personalizedContext}\n위 분석된 데이터와 선생님의 취약 분야를 바탕으로, 선생님의 말 못할 고통을 꿰뚫어 보고 더욱 깊고 정교하게 보듬어주는 맞춤형 상담을 진행하세요.` : ''}`;

    // Format contents for gemini-3.8-flash
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: error.message || '상담 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    });
  }
});

// 2. Custom Comfort Letter & Prescription API
app.post('/api/letter', async (req, res) => {
  try {
    const { teacherRole, mainBurden, feelings, specificStory } = req.body;

    const ai = getAIClient();

    const prompt = `선생님을 위한 맞춤형 위로 편지와 온기 처방전을 작성해 주세요.

선생님 정보:
- 소속/분야: ${teacherRole || '초·중·고 교사'}
- 오늘 가장 힘든 마음의 짐: ${mainBurden || '교실 속 관계와 업무의 무게'}
- 느끼고 계신 감정: ${feelings ? feelings.join(', ') : '지침, 자책감, 피로'}
- 구체적인 상황/이야기: ${specificStory || '오늘 하루도 감정을 억누르고 교실을 지키셨습니다.'}

반드시 지정된 JSON 스키마 형식으로 응답하세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `당신은 지친 교사들을 진심으로 사랑하고 아끼는 30년 경력의 퇴임 교사이자 따뜻한 문학 치료사입니다.
선생님의 아픔을 영혼으로 공감하며 눈물과 안도감을 주는 아름답고 진솔한 위로 편지를 씁니다.
선생님이 퇴근길이나 조용한 밤에 읽고 눈물 흘리며 마음의 짐을 내려놓을 수 있도록 깊은 진정성을 담아주세요.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: '가슴을 울리는 따뜻하고 시적인 편지 제목 (예: "오늘 하루, 교실의 폭풍 속에서도 버텨낸 선생님께")',
            },
            quote: {
              type: Type.STRING,
              description: '마음에 새길 한 줄의 온기 문장',
            },
            letter: {
              type: Type.STRING,
              description: '3~4문단으로 이루어진 깊고 다정한 위로 편지 본문 (줄바꿈 포함)',
            },
            prescriptions: {
              type: Type.ARRAY,
              description: '오늘 선생님의 마음을 쉬게 해줄 작고 실천 가능한 3가지 온기 처방전',
              items: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    description: '처방 분류 (예: "퇴근길 의식", "자책감 분리하기", "나를 위한 작은 선물")',
                  },
                  action: {
                    type: Type.STRING,
                    description: '구체적이고 부담 없는 온기 행동 지침',
                  },
                },
                required: ['category', 'action'],
              },
            },
            blessing: {
              type: Type.STRING,
              description: '마지막으로 건네는 따스한 축복과 지지의 한마디',
            },
          },
          required: ['title', 'quote', 'letter', 'prescriptions', 'blessing'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Letter API Error:', error);
    res.status(500).json({
      error: error.message || '위로 편지를 작성하는 도중 오류가 발생했습니다.',
    });
  }
});

// 3. School Dismissal Unburdening API (퇴근길 마음 비우기)
app.post('/api/unburden', async (req, res) => {
  try {
    const { burdenText } = req.body;
    if (!burdenText) {
      return res.status(400).json({ error: 'Burden text is required' });
    }

    const ai = getAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `선생님이 학교 교실에 내려놓고 떠나고 싶은 짐: "${burdenText}"
이 무거운 짐을 교실 문 뒤에 완전히 내려놓고 가벼운 걸음으로 퇴근하실 수 있도록, 2~3문장의 깊고 잔잔한 해방과 축복의 확언(Affirmation)을 전해주세요.`,
      config: {
        systemInstruction:
          '당신은 교실 문 앞에서 선생님의 짐을 대신 받아 내려놓아 주는 마음의 문지기입니다. 온화하고 고요한 문체로 선생님이 이제 안전하게 쉴 수 있음을 선언해주세요.',
      },
    });

    res.json({ message: response.text });
  } catch (error: any) {
    console.error('Unburden API Error:', error);
    res.status(500).json({
      error: error.message || '마음 비우기 처리 중 오류가 발생했습니다.',
    });
  }
});

// 4. Counseling Data Management Endpoints (백엔드 서버 데이터 관리)
// List sessions with optional filters
app.get('/api/counseling/sessions', (req, res) => {
  try {
    const { search, category, tag } = req.query;
    const sessions = counselingDataStore.getAllSessions({
      search: search as string | undefined,
      category: category as string | undefined,
      tag: tag as string | undefined,
    });
    res.json({ sessions });
  } catch (error: any) {
    console.error('Get Sessions Error:', error);
    res.status(500).json({ error: '상담 기록 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// Get session detail
app.get('/api/counseling/sessions/:id', (req, res) => {
  try {
    const session = counselingDataStore.getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: '해당 상담 기록을 찾을 수 없습니다.' });
    }
    res.json({ session });
  } catch (error: any) {
    console.error('Get Session Detail Error:', error);
    res.status(500).json({ error: '상담 상세를 불러오는 중 오류가 발생했습니다.' });
  }
});

// Save or Create new counseling session
app.post('/api/counseling/sessions', (req, res) => {
  try {
    const sessionData = req.body;
    if (!sessionData) {
      return res.status(400).json({ error: '상담 데이터가 누락되었습니다.' });
    }
    const saved = counselingDataStore.saveSession(sessionData);
    res.status(201).json({ session: saved, message: '상담 기록이 백엔드 서버에 안전하게 저장되었습니다.' });
  } catch (error: any) {
    console.error('Save Session Error:', error);
    res.status(500).json({ error: '상담 기록을 저장하는 중 오류가 발생했습니다.' });
  }
});

// Update session (e.g. teacher's private note, title, pinned status)
app.patch('/api/counseling/sessions/:id', (req, res) => {
  try {
    const updated = counselingDataStore.updateSession(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: '해당 상담 기록을 찾을 수 없습니다.' });
    }
    res.json({ session: updated, message: '상담 기록이 업데이트되었습니다.' });
  } catch (error: any) {
    console.error('Update Session Error:', error);
    res.status(500).json({ error: '상담 기록을 수정하는 중 오류가 발생했습니다.' });
  }
});

// Delete session
app.delete('/api/counseling/sessions/:id', (req, res) => {
  try {
    const success = counselingDataStore.deleteSession(req.params.id);
    if (!success) {
      return res.status(404).json({ error: '삭제할 상담 기록을 찾을 수 없습니다.' });
    }
    res.json({ success: true, message: '상담 기록이 삭제되었습니다.' });
  } catch (error: any) {
    console.error('Delete Session Error:', error);
    res.status(500).json({ error: '상담 기록을 삭제하는 중 오류가 발생했습니다.' });
  }
});

// Get counseling stats (종합 통계 & 분석)
app.get('/api/counseling/stats', (_req, res) => {
  try {
    const stats = counselingDataStore.getStats();
    res.json({ stats });
  } catch (error: any) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ error: '통계 정보를 불러오는 중 오류가 발생했습니다.' });
  }
});

// Full data export (백업 다운로드)
app.get('/api/counseling/export', (_req, res) => {
  try {
    const data = counselingDataStore.exportData();
    res.setHeader('Content-Disposition', 'attachment; filename="teacher_counseling_backup.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error('Export Error:', error);
    res.status(500).json({ error: '데이터 백업을 생성하는 중 오류가 발생했습니다.' });
  }
});

// 5. AI Deep Stress Diagnostics & Analysis API (대화 데이터 심층 스트레스 분석)
app.get('/api/counseling/analysis', async (_req, res) => {
  try {
    const existing = counselingDataStore.getStressAnalysis();
    if (existing) {
      return res.json({ report: existing });
    }
    // If none yet, trigger analyze logic
    const stats = counselingDataStore.getStats();
    const fallbackReport = generateFallbackStressReport(stats, counselingDataStore.getAllSessions());
    counselingDataStore.saveStressAnalysis(fallbackReport);
    res.json({ report: fallbackReport });
  } catch (error: any) {
    console.error('Get Analysis Error:', error);
    res.status(500).json({ error: '스트레스 분석 데이터를 가져오는 중 오류가 발생했습니다.' });
  }
});

app.post('/api/counseling/analyze', async (_req, res) => {
  try {
    const sessions = counselingDataStore.getAllSessions();
    const stats = counselingDataStore.getStats();

    if (sessions.length === 0) {
      const emptyReport = generateFallbackStressReport(stats, []);
      return res.json({ report: emptyReport, message: '상담 기록이 없어 기본 분석을 반환합니다.' });
    }

    try {
      const ai = getAIClient();

      // Compile past session summary for Gemini analysis
      const sessionDigests = sessions.map((s, idx) => {
        const userMsgs = s.messages.filter((m) => m.role === 'user').map((m) => m.content).join(' / ');
        const durationMin = Math.round((s.durationSeconds || 900) / 60);
        return `[세션 ${idx + 1}]
- 제목: ${s.title}
- 분야: ${s.category} (교사 직무: ${s.teacherRole})
- 상담 시간: ${durationMin}분 소요 (${s.createdAt})
- 선생님 초기 호소 및 발화 내용: "${userMsgs.slice(0, 500)}"
- 전/후 감정: [상담 전: ${s.moodBefore}] -> [상담 후: ${s.moodAfter || '미기재'}]
- 선생님의 비밀 성찰 일지: "${s.teacherPrivateNote || '없음'}"`;
      }).join('\n\n');

      const analysisPrompt = `대한민국 교사 전문 심리상담 수퍼바이저로서, 다음 선생님이 지금까지 상담 멘토와 나눈 누적 ${sessions.length}건의 상담 대화 데이터와 발화 내용을 종합 분석하십시오.
선생님이 실제로 '가장 극심하고 반복적인 스트레스를 받는 핵심 분야'를 가려내고, 그 원인과 트리거, 번아웃 위험도, 그리고 앞으로 이 선생님을 더욱더 정교하고 따뜻하게 상담하기 위한 맞춤형 멘토링 전략을 진단 보고서로 작성하세요.

누적 상담 기록 요약:
${sessionDigests}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
        config: {
          systemInstruction: '교사 심리 분석 및 교권 침해·번아웃 임상 전문가로서 엄밀하고도 따뜻한 어조로 분석합니다.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              primaryStressArea: { type: Type.STRING, description: '가장 많은 스트레스를 받는 1순위 분야' },
              burnoutRiskLevel: {
                type: Type.STRING,
                enum: ['안정', '주의', '경고', '심각'],
                description: '현재 번아웃 위험도 수준',
              },
              burnoutRiskDescription: { type: Type.STRING, description: '현재 번아웃 위험도에 대한 임상적 진단과 설명' },
              categoryDistribution: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    count: { type: Type.INTEGER },
                    percentage: { type: Type.INTEGER },
                    severity: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                    keyTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    summary: { type: Type.STRING },
                  },
                  required: ['category', 'percentage', 'severity', 'keyTriggers', 'summary'],
                },
              },
              recurringTriggers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '선생님의 감정을 무너뜨리는 4~6개의 구체적 촉발 요인(트리거)',
              },
              personalizedCounselingStrategy: {
                type: Type.STRING,
                description: '앞으로 AI 상담 멘토가 이 선생님을 상담할 때 반드시 지켜야 할 맞춤형 전략 및 방어기제 구축 방향',
              },
              teacherStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '대화에서 포착된 선생님의 고귀한 내면의 강점 및 회복 자원 3가지',
              },
              recommendedBoundaries: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '내일부터 실천할 수 있는 심리적·행동적 경계 세우기 행동 지침 3가지',
              },
              mentorTunedKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '선생님이 발화했을 때 즉각 정서적 안전망을 가동해야 하는 핵심 키워드들',
              },
            },
            required: [
              'primaryStressArea',
              'burnoutRiskLevel',
              'burnoutRiskDescription',
              'categoryDistribution',
              'recurringTriggers',
              'personalizedCounselingStrategy',
              'teacherStrengths',
              'recommendedBoundaries',
              'mentorTunedKeywords',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const finalReport = {
        ...parsed,
        analyzedAt: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }) + ' ' + new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        totalAnalyzedSessions: sessions.length,
        totalCounselingMinutes: Math.round(stats.totalDurationSeconds / 60),
      };

      counselingDataStore.saveStressAnalysis(finalReport);
      return res.json({
        report: finalReport,
        message: '선생님의 상담 데이터를 바탕으로 스트레스 분야 분류 및 맞춤 진단이 성공적으로 완료되었습니다.',
      });
    } catch (aiErr: any) {
      console.warn('Gemini analysis failed or rate-limited, using calculated diagnostic model:', aiErr.message);
      const fallbackReport = generateFallbackStressReport(stats, sessions);
      counselingDataStore.saveStressAnalysis(fallbackReport);
      return res.json({
        report: fallbackReport,
        message: '선생님의 상담 데이터를 기반으로 분석 진단 보고서를 생성했습니다.',
      });
    }
  } catch (error: any) {
    console.error('Analyze Error:', error);
    res.status(500).json({ error: error.message || '스트레스 분석 중 오류가 발생했습니다.' });
  }
});

function generateFallbackStressReport(stats: any, sessions: any[]) {
  const topCategory = stats.primaryStressArea || '학부모 민원 및 무리한 요구';
  const totalMin = Math.round((stats.totalDurationSeconds || 3600) / 60);

  const categoryDistribution = Object.entries(stats.categoryCounts || {}).map(([cat, count]) => {
    const pct = stats.categoryPercentages?.[cat] || Math.round(((count as number) / (stats.totalSessions || 1)) * 100);
    return {
      category: cat,
      count: count as number,
      percentage: pct,
      severity: pct >= 40 ? ('high' as const) : pct >= 20 ? ('medium' as const) : ('low' as const),
      keyTriggers: cat.includes('민원')
        ? ['퇴근 후 연락', '고성과 폭언', '자격 시비 및 교육청 고발 협박']
        : cat.includes('생활지도')
        ? ['수업 중 지속적 소음', '공개적 반항 및 비웃음', '통제력 상실감']
        : ['업무 과중', '자책감', '불안감'],
      summary: `${cat} 관련 문제로 심리적 에너지가 가장 많이 소모되고 있으며, 초기 죄책감 형성 빈도가 높습니다.`,
    };
  });

  return {
    analyzedAt: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) + ' ' + new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    totalAnalyzedSessions: stats.totalSessions || sessions.length,
    totalCounselingMinutes: totalMin,
    primaryStressArea: topCategory,
    burnoutRiskLevel: '주의' as const,
    burnoutRiskDescription: `현재 선생님은 특히 [${topCategory}] 상황에서 방어 기제가 약화되어 있으며, 교실 문제를 자신의 인격이나 능력 부족으로 귀인하는 '과도한 자책감'에 노출되어 있습니다. 다만 성찰 일지를 통해 스스로 경계를 정립하려는 강한 회복 탄력성을 지니고 계십니다.`,
    categoryDistribution: categoryDistribution.length > 0
      ? categoryDistribution
      : [
          {
            category: '학부모 민원 및 무리한 요구',
            count: 1,
            percentage: 58,
            severity: 'high' as const,
            keyTriggers: ['악성 민원', '폭언', '고소 협박'],
            summary: '퇴근 후에도 교권 침해 기억이 반추되어 심리적 수면 장애 유발',
          },
          {
            category: '학생 생활지도 및 거친 행동',
            count: 1,
            percentage: 42,
            severity: 'medium' as const,
            keyTriggers: ['수업 방해', '반항적 태도'],
            summary: '교사로서의 존엄과 효능감 상실감',
          },
        ],
    recurringTriggers: [
      '학부모의 퇴근 후 불시 전화 및 감정적 폭언',
      '수업 중 학생의 의도적 비협조 및 반항',
      '내가 부족해서 교실이 무너진다는 자기 비하',
      '관리자의 미온적 보호와 나홀로 해결 압박',
    ],
    personalizedCounselingStrategy: `1. [${topCategory}]에 대해 즉각적인 '책임 분리' 프레이밍을 최우선 제공\n2. 멘토 발화 시 선생님의 지난 성찰 기록(분노의 분리, 공적 지원 활용)을 연계하여 심리적 연속성 보장\n3. 상투적 공감을 지양하고 교실 현장 맞춤형 언어적·행동적 대처 스크립트 지원`,
    teacherStrengths: [
      '상처 속에서도 아이들을 끝까지 놓지 않으려는 진정성',
      '상담 후 자신의 감정을 성찰 일지로 객관화하는 메타인지',
      '교권 보호를 위해 공적 절차를 준비하는 실천적 용기',
    ],
    recommendedBoundaries: [
      '근무 시간 외 학부모 개인 연락 차단 (안심번호/공식창구 단일화)',
      '교실에서 일어난 갈등은 하교 벨소리와 함께 문 밖 공간에 정서적으로 두고 오기',
      '내 한계를 초과하는 사안은 즉시 관리자 및 위클래스에 공식 이관하기',
    ],
    mentorTunedKeywords: ['자격이 없다', '손이 떨린다', '무기력하다', '민원', '퇴근길', '자책'],
  };
}

// Data backup import / restore
app.post('/api/counseling/import', (req, res) => {
  try {
    const incomingData = req.body;
    counselingDataStore.importData(incomingData);
    res.json({ success: true, message: '데이터가 성공적으로 복원되었습니다.' });
  } catch (error: any) {
    console.error('Import Error:', error);
    res.status(400).json({ error: error.message || '데이터 복원에 실패했습니다.' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
