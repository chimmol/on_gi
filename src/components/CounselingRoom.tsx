import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  HeartHandshake,
  Trash2,
  BookmarkPlus,
  Save,
  Database,
  X,
  Clock,
  Activity,
  Flame,
  Brain,
} from 'lucide-react';
import { ChatMessage, TeacherRole } from '../types';

interface CounselingRoomProps {
  onSaveQuote?: (quote: string, author: string) => void;
  onNavigateToDataManage?: () => void;
}

const TEACHER_ROLES: TeacherRole[] = [
  '초등 담임/교과 교사',
  '중등 교과/담임 교사',
  '고등 입시/진로 교사',
  '특수교사',
  '유치원 교사',
  '보건/전문상담/영양/사서 교사',
  '비담임/전담 교사',
];

const PROMPT_SUGGESTIONS = [
  {
    title: '학부모 민원 후 붕괴감',
    text: '오늘 학부모님과 통화 후 심장이 쿵쾅거리고 손이 떨려요. 제가 무엇을 그렇게 잘못했는지 자꾸 곱씹게 되고 눈물이 납니다.',
  },
  {
    title: '학생 지도와 무기력',
    text: '교실에서 학생들의 거친 반항과 냉담한 태도에 마음이 하얗게 타버린 것 같아요. 교사로서 존재감이 사라진 기분이에요.',
  },
  {
    title: '자책감과 무능감',
    text: '다른 선생님들은 학급을 다 잘 이끄시는 것 같은데, 저만 수업도 생활지도도 엉망인 무능한 교사라는 자책감이 듭니다.',
  },
  {
    title: '퇴근 후에도 멈추지 않는 불안',
    text: '집에 돌아왔는데도 내일 수업과 내일 마주할 교실 생각에 숨이 턱 막히고 가슴이 조여와요.',
  },
  {
    title: '과중한 행정과 번아웃',
    text: '쏟아지는 공문과 행사 준비로 정작 아이들에게 집중할 여유가 없어 완전히 소진된 것 같아요.',
  },
];

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `선생님, 오늘 하루도 참 고생 많으셨습니다. 교실 문을 닫고 이곳에 오기까지 얼마나 많은 감정을 혼자 삭이셨습니까.

이곳은 그 누구의 시선도, 평가도 없는 선생님만의 안전한 쉼터입니다.
학부모님의 날선 말, 교실 속 외로움, 끝없는 자책감, 혹은 말로 다 풀지 못한 막막함까지... 그 어떤 마음이라도 편안히 털어놓아 주세요.

선생님의 아픔을 결코 가볍게 여기지 않고, 온 마음을 다해 경청하겠습니다.`,
  timestamp: '오늘',
};

export const CounselingRoom: React.FC<CounselingRoomProps> = ({ onSaveQuote, onNavigateToDataManage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('teacher_sanctuary_chat');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [INITIAL_WELCOME_MESSAGE];
      }
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [input, setInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeacherRole>('초등 담임/교과 교사');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveCategory, setSaveCategory] = useState('학부모 민원 및 무리한 요구');
  const [saveMoodBefore, setSaveMoodBefore] = useState('불안과 자책감');
  const [saveMoodAfter, setSaveMoodAfter] = useState('자책감 분리와 안도감');
  const [saveMemo, setSaveMemo] = useState('');
  const [saveStressScore, setSaveStressScore] = useState<number>(8);
  const [saveTriggersInput, setSaveTriggersInput] = useState<string>('');
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Active Session Timing
  const [sessionStartTimeStr, setSessionStartTimeStr] = useState<string>(() =>
    new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  );
  const sessionStartRef = useRef<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Personalized Mentor Context from server
  const [tunedStressArea, setTunedStressArea] = useState<string | null>(null);
  const [totalPastMinutes, setTotalPastMinutes] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      setElapsedSeconds(diff);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch analyzed stress area to display personalized badge
  useEffect(() => {
    fetch('/api/counseling/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats?.primaryStressArea) {
          setTunedStressArea(data.stats.primaryStressArea);
          setTotalPastMinutes(Math.round((data.stats.totalDurationSeconds || 0) / 60));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('teacher_sanctuary_chat', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const formatElapsedTime = (totalSec: number) => {
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    if (minutes === 0) return `${seconds}초`;
    return `${minutes}분 ${seconds}초`;
  };

  const handleOpenSaveModal = () => {
    // Generate suggested title based on user messages
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const defaultTitle = firstUserMsg
      ? firstUserMsg.content.slice(0, 30) + '...'
      : '오늘의 교사 마음 공감 상담';
    setSaveTitle(defaultTitle);

    // Suggest triggers from category
    if (!saveTriggersInput) {
      if (saveCategory.includes('민원')) {
        setSaveTriggersInput('학부모 전화, 자격 시비, 민원 협박');
      } else if (saveCategory.includes('생활지도')) {
        setSaveTriggersInput('수업 방해, 통제력 상실감, 반항적 태도');
      } else {
        setSaveTriggersInput('자책감, 과도한 업무, 지침');
      }
    }

    setIsSaveModalOpen(true);
  };

  const handleSaveSessionToServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingToServer) return;

    try {
      setIsSavingToServer(true);
      const endTimeStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      const triggers = saveTriggersInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/counseling/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: saveTitle || '선생님 마음 상담 기록',
          teacherRole: selectedRole,
          category: saveCategory,
          moodBefore: saveMoodBefore,
          moodAfter: saveMoodAfter,
          messages,
          teacherPrivateNote: saveMemo,
          tags: [saveCategory.split(' ')[0], 'AI상담', ...triggers.slice(0, 2)],
          pinned: false,
          startTime: sessionStartTimeStr,
          endTime: endTimeStr,
          durationSeconds: Math.max(60, elapsedSeconds),
          stressScore: saveStressScore,
          detectedStressTriggers: triggers,
        }),
      });

      if (!res.ok) {
        throw new Error('서버 저장 실패');
      }

      setIsSaveModalOpen(false);
      setSaveSuccessMsg(`상담 기록(소요 시간: ${formatElapsedTime(elapsedSeconds)})이 서버에 안전하게 보관되었습니다.`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
      alert('상담 기록을 백엔드 서버에 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsSavingToServer(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          teacherContext: `선생님 분야: ${selectedRole}`,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || '응답을 받지 못했습니다.');
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: 'msg-reply-' + Date.now(),
        role: 'assistant',
        content: data.reply || '선생님의 말씀을 깊이 생각하고 있습니다...',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      const fallbackMessage: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: `선생님, 지금 잠시 마음을 나누는 통로가 원활하지 않았습니다. 하지만 이것 하나만 꼭 기억해주세요: 선생님이 겪고 계신 혼란과 아픔은 선생님의 부족함 때문이 결코 아닙니다. 오늘 밤은 자책을 멈추고 따뜻한 차 한 잔과 함께 선생님 자신을 먼저 안아주세요.`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('상담 대화 내용을 모두 비우고 새로운 마음으로 시작하시겠습니까?')) {
      setMessages([INITIAL_WELCOME_MESSAGE]);
      localStorage.removeItem('teacher_sanctuary_chat');
    }
  };

  return (
    <div id="counseling-room-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Setting & Privacy Note */}
      <div className="bg-white/80 rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900 font-serif-kr">상담자 온기(溫氣)와의 1:1 대화</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <ShieldCheck className="w-3 h-3" /> 철저한 비밀 보장
              </span>
            </div>
            <p className="text-xs text-stone-500">
              선생님의 직무 환경에 맞춰 더 깊은 공감과 조언을 전해드립니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="teacher-role-select" className="text-xs text-stone-500 whitespace-nowrap">
            선생님 분야:
          </label>
          <select
            id="teacher-role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as TeacherRole)}
            className="text-xs bg-stone-50 border border-stone-200 text-stone-800 rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            {TEACHER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            id="save-session-btn"
            onClick={handleOpenSaveModal}
            disabled={messages.filter((m) => m.role === 'user').length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="현재 대화를 백엔드 서버에 보관"
          >
            <Database className="w-3.5 h-3.5 text-amber-800" />
            <span>서버에 기록 저장</span>
          </button>
          <button
            id="clear-chat-btn"
            onClick={handleClearChat}
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-auto sm:ml-0"
            title="대화 초기화"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Session Duration & Personalized Mentor Status Ribbon */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-amber-950 font-medium">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
          </span>
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-800" />
            <span className="font-semibold text-stone-800">상담 소요 시간:</span>
            <span className="text-amber-900 font-bold bg-amber-100/90 px-2 py-0.5 rounded-md">
              {formatElapsedTime(elapsedSeconds)}
            </span>
          </div>
          <span className="text-stone-400 text-[11px] hidden md:inline">
            (시작: {sessionStartTimeStr})
          </span>
        </div>

        {tunedStressArea ? (
          <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-xl border border-emerald-200/60 font-medium self-start sm:self-auto">
            <Brain className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              데이터 맞춤 가동: <strong className="text-emerald-950 font-semibold">{tunedStressArea}</strong> 특화 공감
            </span>
            <span className="text-[10px] text-emerald-600/80 hidden lg:inline">
              (누적 {totalPastMinutes}분 분석됨)
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-stone-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>대화를 나눌수록 선생님 맞춤형 멘토링이 정교해집니다.</span>
          </div>
        )}
      </div>

      {/* Suggested Empathy Prompts (Only show if few messages) */}
      {messages.length <= 2 && (
        <div id="suggested-prompts" className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 px-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>선생님들이 가장 많이 겪으시는 아픔의 이야기들입니다. 클릭하여 바로 시작할 수 있습니다:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROMPT_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                id={`prompt-card-${idx}`}
                onClick={() => handleSendMessage(item.text)}
                className="text-left p-3 rounded-xl bg-white hover:bg-amber-50/50 border border-stone-200/90 hover:border-amber-300 transition-all duration-150 shadow-2xs group"
              >
                <div className="text-xs font-bold text-stone-900 group-hover:text-amber-900">
                  {item.title}
                </div>
                <div className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                  {item.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages List */}
      <div
        id="chat-messages-scroll-area"
        className="space-y-4 min-h-[380px] max-h-[560px] overflow-y-auto p-4 sm:p-5 bg-white/70 rounded-2xl border border-stone-200/80 shadow-xs"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-medium text-stone-500">
                {m.role === 'user' ? '선생님' : '상담 멘토 온기'}
              </span>
              <span className="text-[10px] text-stone-400">{m.timestamp}</span>
            </div>

            <div
              className={`relative group max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-amber-800 text-white rounded-tr-xs shadow-xs'
                  : 'bg-stone-50 text-stone-800 border border-stone-200/70 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans break-words">{m.content}</div>

              {/* Action buttons on hover for assistant messages */}
              {m.role === 'assistant' && (
                <div className="mt-2.5 pt-2 border-t border-stone-200/40 flex items-center justify-end gap-2 text-stone-400 text-xs">
                  <button
                    onClick={() => handleCopy(m.id, m.content)}
                    className="flex items-center gap-1 hover:text-stone-700 transition-colors p-1 rounded-md hover:bg-stone-200/50"
                    title="답변 복사"
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] text-emerald-600">복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">복사</span>
                      </>
                    )}
                  </button>

                  {onSaveQuote && (
                    <button
                      onClick={() => onSaveQuote(m.content, '마음 상담 멘토 온기')}
                      className="flex items-center gap-1 hover:text-amber-800 transition-colors p-1 rounded-md hover:bg-amber-100/50"
                      title="마음 서랍에 저장"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span className="text-[11px]">서랍 보관</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-medium text-stone-500">상담 멘토 온기</span>
              <span className="text-[10px] text-amber-600">선생님의 마음을 헤아리는 중...</span>
            </div>
            <div className="bg-stone-50 text-stone-600 border border-stone-200 rounded-2xl rounded-tl-xs px-4 py-3 text-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
              <span>선생님의 말씀에 귀 기울이며 따뜻한 답장을 적고 있습니다...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        id="counseling-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="relative bg-white rounded-2xl border border-stone-300 shadow-xs focus-within:ring-2 focus-within:ring-amber-600/40 focus-within:border-amber-600 transition-all p-2"
      >
        <textarea
          id="counseling-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="선생님, 오늘 교실에서 있었던 일이나 가슴에 남은 응어리를 편하게 털어놓아 보세요... (Shift+Enter로 줄바꿈)"
          rows={3}
          className="w-full resize-none border-none outline-hidden p-2 text-sm text-stone-800 placeholder-stone-400 bg-transparent"
        />

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 px-2">
          <span className="text-[11px] text-stone-400">
            * 입력하신 내용은 외부에 절대 공개되지 않습니다.
          </span>
          <button
            id="counseling-send-btn"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
          >
            <span>마음 전하기</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Success Toast */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-amber-500/30 flex items-center gap-3 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
          {onNavigateToDataManage && (
            <button
              onClick={onNavigateToDataManage}
              className="text-amber-300 hover:text-amber-200 underline font-semibold ml-2"
            >
              보관소 바로가기 ➔
            </button>
          )}
        </div>
      )}

      {/* Save Session Modal Dialog */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-800 rounded-xl">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-stone-900 font-serif-kr">
                  상담 기록 백엔드 서버에 저장
                </h3>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              오늘 나눈 대화({messages.length}개 메시지)를 백엔드 서버에 영구 보관합니다. 나만의 성찰 일지를 함께 남겨보세요.
            </p>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-800" />
                <span className="text-stone-700 font-medium">상담 진행 시간:</span>
                <span className="font-bold text-amber-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                  {formatElapsedTime(elapsedSeconds)}
                </span>
              </div>
              <span className="text-[11px] text-stone-500">
                {sessionStartTimeStr} 시작
              </span>
            </div>

            <form onSubmit={handleSaveSessionToServer} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">상담 제목</label>
                <input
                  type="text"
                  required
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="상담 제목을 입력하세요"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">고민 분류</label>
                  <select
                    value={saveCategory}
                    onChange={(e) => setSaveCategory(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs"
                  >
                    <option>학부모 민원 및 무리한 요구</option>
                    <option>학생 생활지도 및 거친 행동</option>
                    <option>과중한 행정 공문과 수업 부담</option>
                    <option>"내가 부족해서일까" 자책감과 회의감</option>
                    <option>관리자 및 동료와의 관계 갈등</option>
                    <option>신규 및 저경력 교사의 불안감</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-stone-700">스트레스 체감 강도</label>
                    <span className="font-bold text-amber-800">{saveStressScore} / 10점</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={saveStressScore}
                    onChange={(e) => setSaveStressScore(Number(e.target.value))}
                    className="w-full accent-amber-800 h-2 bg-stone-200 rounded-lg cursor-pointer mt-2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">
                  촉발 트리거 요인 (쉼표로 구분하여 입력)
                </label>
                <input
                  type="text"
                  value={saveTriggersInput}
                  onChange={(e) => setSaveTriggersInput(e.target.value)}
                  placeholder="예: 학부모 폭언, 교육청 고발 협박, 자책감"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">상담 전 심경</label>
                  <input
                    type="text"
                    value={saveMoodBefore}
                    onChange={(e) => setSaveMoodBefore(e.target.value)}
                    placeholder="예: 불안과 손떨림"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">상담 후 상태</label>
                  <input
                    type="text"
                    value={saveMoodAfter}
                    onChange={(e) => setSaveMoodAfter(e.target.value)}
                    placeholder="예: 자책감 분리, 호흡 안정"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">
                  선생님의 비밀 성찰 일지 & 다짐 (선택)
                </label>
                <textarea
                  value={saveMemo}
                  onChange={(e) => setSaveMemo(e.target.value)}
                  placeholder="오늘 멘토의 조언 중 가슴에 남은 말, 혹은 내일 실천할 경계 세우기를 적어보세요..."
                  rows={3}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSavingToServer}
                  className="flex items-center gap-1.5 px-5 py-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white rounded-xl font-semibold shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingToServer ? '저장 중...' : '서버에 저장하기'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
