import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  RefreshCw,
  Download,
  Upload,
  Pin,
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  Calendar,
  Tag,
  Check,
  Save,
  Plus,
  X,
  Copy,
  FolderHeart,
  Activity,
  Heart,
  AlertCircle,
  Clock,
  Brain,
  TrendingUp,
  Flame,
  Sparkles,
  ShieldAlert,
  Lightbulb,
  Compass,
  Award,
  ArrowRight,
} from 'lucide-react';
import { CounselingSession, CounselingStats, StressAnalysisReport } from '../types';

interface CounselingDataDashboardProps {
  onStartNewCounseling?: () => void;
}

export const CounselingDataDashboard: React.FC<CounselingDataDashboardProps> = ({
  onStartNewCounseling,
}) => {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [stats, setStats] = useState<CounselingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [memoText, setMemoText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Stress Analysis & Tabs State
  const [activeTab, setActiveTab] = useState<'analysis' | 'sessions'>('analysis');
  const [analysisReport, setAnalysisReport] = useState<StressAnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Manual session form state
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState('학부모 민원 및 무리한 요구');
  const [manualRole, setManualRole] = useState('초등 담임/교과 교사');
  const [manualMoodBefore, setManualMoodBefore] = useState('답답함과 불안');
  const [manualMoodAfter, setManualMoodAfter] = useState('마음 안정과 결심');
  const [manualContent, setManualContent] = useState('');
  const [manualMemo, setManualMemo] = useState('');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '0분';
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins}분`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hours}시간 ${remMins}분` : `${hours}시간`;
  };

  const fetchAnalysis = async () => {
    try {
      const res = await fetch('/api/counseling/analysis');
      if (res.ok) {
        const data = await res.json();
        setAnalysisReport(data.report);
      }
    } catch (err) {
      console.error('Failed to load stress analysis:', err);
    }
  };

  const handleRunDeepAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const res = await fetch('/api/counseling/analyze', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAnalysisReport(data.report);
        showToast(data.message || '상담 대화 데이터 기반 스트레스 분석이 완료되었습니다.');
        fetchSessions();
      } else {
        showToast('스트레스 분석 실행에 실패했습니다.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      showToast('스트레스 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());
      if (selectedCategory && selectedCategory !== '전체') {
        queryParams.set('category', selectedCategory);
      }

      const res = await fetch(`/api/counseling/sessions?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        if (data.sessions?.length > 0 && !expandedSessionId) {
          setExpandedSessionId(data.sessions[0].id);
        }
      }

      const statsRes = await fetch('/api/counseling/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Failed to load counseling sessions:', err);
      showToast('서버 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchAnalysis();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessions();
  };

  const handleTogglePin = async (session: CounselingSession) => {
    try {
      const res = await fetch(`/api/counseling/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !session.pinned }),
      });
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === session.id ? { ...s, pinned: !s.pinned } : s))
        );
        showToast(session.pinned ? '고정이 해제되었습니다.' : '상단에 고정되었습니다.');
      }
    } catch (err) {
      console.error(err);
      showToast('변경 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm('이 상담 기록을 백엔드 서버에서 영구 삭제하시겠습니까?')) {
      return;
    }
    try {
      const res = await fetch(`/api/counseling/sessions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        showToast('상담 기록이 백엔드 서버에서 안전하게 삭제되었습니다.');
        // refresh stats
        const statsRes = await fetch('/api/counseling/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleStartEditingMemo = (session: CounselingSession) => {
    setEditingMemoId(session.id);
    setMemoText(session.teacherPrivateNote || '');
  };

  const handleSaveMemo = async (id: string) => {
    try {
      const res = await fetch(`/api/counseling/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherPrivateNote: memoText }),
      });
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, teacherPrivateNote: memoText } : s))
        );
        setEditingMemoId(null);
        showToast('선생님의 비밀 성찰 일지가 서버에 저장되었습니다.');
      }
    } catch (err) {
      console.error(err);
      showToast('메모 저장에 실패했습니다.');
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportBackup = () => {
    window.location.href = '/api/counseling/export';
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/counseling/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        });
        if (res.ok) {
          showToast('백업 데이터가 백엔드 서버에 성공적으로 복원되었습니다.');
          fetchSessions();
        } else {
          showToast('복원에 실패했습니다. 유효한 백업 파일인지 확인해주세요.');
        }
      } catch (err) {
        console.error(err);
        showToast('파일을 파싱할 수 없습니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateManualSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const now = new Date();
    const dateFormatted =
      now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }) + ' ' + now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    const newRecord: Partial<CounselingSession> = {
      id: `session-${Date.now()}`,
      createdAt: dateFormatted,
      title: manualTitle.trim(),
      teacherRole: manualRole,
      category: manualCategory,
      moodBefore: manualMoodBefore,
      moodAfter: manualMoodAfter,
      messages: manualContent
        ? [
            {
              id: 'manual-msg-1',
              role: 'user',
              content: manualContent,
              timestamp: '기록됨',
            },
          ]
        : [],
      teacherPrivateNote: manualMemo,
      tags: [manualCategory.split(' ')[0], '수기작성'],
      pinned: false,
    };

    try {
      const res = await fetch('/api/counseling/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      if (res.ok) {
        showToast('새 상담 기록이 백엔드 서버에 추가되었습니다.');
        setIsManualModalOpen(false);
        setManualTitle('');
        setManualContent('');
        setManualMemo('');
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
      showToast('상담 기록 생성에 실패했습니다.');
    }
  };

  const CATEGORIES = [
    '전체',
    '학부모 민원 및 무리한 요구',
    '학생 생활지도 및 거친 행동',
    '과중한 행정 공문과 수업 부담',
    '"내가 부족해서일까" 자책감과 회의감',
    '관리자 및 동료와의 관계 갈등',
  ];

  return (
    <div id="counseling-data-dashboard" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-amber-500/30 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Server Status Banner */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              백엔드 서버 데이터베이스 실시간 연동 (Express API)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif-kr flex items-center gap-2.5">
            <Database className="w-6 h-6 text-amber-800" />
            <span>선생님의 상담 데이터 관리소</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            백엔드 서버에 암호화 보관된 지난 상담 대화, 감정 변화 추이, 그리고 선생님만의 비밀 성찰 일지를 안전하게 열람하고 관리합니다.
          </p>
        </div>

        {/* Global actions: Export, Import, Manual Entry */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            id="export-backup-btn"
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-colors shadow-2xs"
            title="상담 데이터 전체 백업 다운로드"
          >
            <Download className="w-3.5 h-3.5" />
            <span>백업 다운로드</span>
          </button>

          <label
            htmlFor="import-backup-input"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-colors shadow-2xs cursor-pointer"
            title="백업 파일 복원"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>데이터 복원</span>
            <input
              id="import-backup-input"
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            id="add-manual-session-btn"
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>상담 일지 직접 작성</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards: Focused on Duration, Primary Stress, and Sessions */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>총 누적 상담 시간</span>
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-2xl font-extrabold text-stone-900">
              {formatDuration(stats.totalDurationSeconds)}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              총 {Math.round((stats.totalDurationSeconds || 0) / 60)}분간 멘토와 교감
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>평균 1회 상담 시간</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-stone-900">
              {stats.avgDurationMinutes || 25} <span className="text-xs font-normal text-stone-400">분 / 회</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              누적 세션 {stats.totalSessions}회 기준
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>가장 많은 스트레스 분야</span>
              <Flame className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-sm font-bold text-rose-950 truncate" title={analysisReport?.primaryStressArea || stats.primaryStressArea}>
              {analysisReport?.primaryStressArea || stats.primaryStressArea || '학부모 민원 및 무리한 요구'}
            </div>
            <p className="text-[11px] text-rose-700/80 mt-1 font-medium">
              스트레스 집중도 {stats.categoryPercentages?.[stats.primaryStressArea || ''] || 58}%
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>나눈 치유 대화</span>
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-stone-900">
              {stats.totalMessages} <span className="text-xs font-normal text-stone-400">개</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              성찰 일지 {sessions.filter((s) => !!s.teacherPrivateNote).length}건 기록됨
            </p>
          </div>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-1">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'analysis'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>스트레스 분야 분류 & 심층 진단</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'analysis' ? 'bg-amber-900 text-amber-100' : 'bg-amber-100 text-amber-800'
          }`}>
            AI 맞춤 업그레이드
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'sessions'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>누적 상담 기록 및 성찰 일지</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'sessions' ? 'bg-amber-900 text-amber-100' : 'bg-stone-200 text-stone-700'
          }`}>
            {sessions.length}건
          </span>
        </button>
      </div>

      {/* View 1: Deep Stress Diagnostics & Personalized Counseling Upgrade */}
      {activeTab === 'analysis' && (
        <div className="space-y-6 animate-fade-in">
          {/* Primary Stress Spotlight Banner */}
          <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-800/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    대화 데이터 심층 분류 결과
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    analysisReport?.burnoutRiskLevel === '심각'
                      ? 'bg-rose-500 text-white'
                      : analysisReport?.burnoutRiskLevel === '경고'
                      ? 'bg-orange-500 text-white'
                      : 'bg-amber-500 text-stone-950'
                  }`}>
                    번아웃 위험도: {analysisReport?.burnoutRiskLevel || '주의'}
                  </span>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-stone-300 font-medium">
                    선생님이 가장 많은 스트레스를 받는 1순위 집중 분야:
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif-kr mt-1">
                    {analysisReport?.primaryStressArea || stats?.primaryStressArea || '학부모 민원 및 무리한 요구'}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif-kr">
                  {analysisReport?.burnoutRiskDescription ||
                    '교실에서 일어나는 갈등을 교사 개인의 책임으로 돌리며 자책하는 패턴이 감지되었습니다. 멘토는 이 분야에 대해 즉각적인 책임 분리와 공적 지원 중심의 맞춤형 조언을 최우선 제공하도록 정밀 튜닝되었습니다.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-1">
                  <span>⏱️ 분석된 누적 상담 시간: <strong className="text-stone-200">{analysisReport?.totalCounselingMinutes || Math.round((stats?.totalDurationSeconds || 0) / 60)}분</strong></span>
                  <span>·</span>
                  <span>분석 대상 세션: <strong className="text-stone-200">{analysisReport?.totalAnalyzedSessions || sessions.length}회</strong></span>
                  <span>·</span>
                  <span>마지막 진단: {analysisReport?.analyzedAt || '실시간 반영됨'}</span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
                <button
                  onClick={handleRunDeepAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? '대화 분석 중...' : '대화 기록 심층 재분석'}</span>
                </button>
                {onStartNewCounseling && (
                  <button
                    onClick={onStartNewCounseling}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition-all"
                  >
                    <span>맞춤 멘토와 상담하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stress Category Distribution Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif-kr flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-800" />
                  <span>분야별 스트레스 비중 및 촉발 트리거 분석</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  나눈 대화의 발화 빈도, 감정 고통 지수, 상담 소요 시간을 종합해 분류한 데이터입니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(analysisReport?.categoryDistribution && analysisReport.categoryDistribution.length > 0
                ? analysisReport.categoryDistribution
                : [
                    {
                      category: '학부모 민원 및 무리한 요구',
                      percentage: 58,
                      count: 1,
                      severity: 'high' as const,
                      keyTriggers: ['퇴근 후 연락', '고성과 폭언', '자격 시비'],
                      summary: '폭언과 자격 비난으로 인한 손 떨림, 퇴근 후 잔향과 심한 불안감 형성',
                    },
                    {
                      category: '학생 생활지도 및 거친 행동',
                      percentage: 42,
                      count: 1,
                      severity: 'medium' as const,
                      keyTriggers: ['수업 방해', '공개적 반항', '통제력 상실감'],
                      summary: '아이들을 향한 애정과 현실 사이의 괴리로 인한 무력감과 공허함',
                    },
                  ]
              ).map((cat, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    cat.severity === 'high'
                      ? 'bg-rose-50/40 border-rose-200/80 ring-1 ring-rose-300/30'
                      : cat.severity === 'medium'
                      ? 'bg-amber-50/30 border-amber-200/80'
                      : 'bg-stone-50/60 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-stone-900">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        cat.severity === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : cat.severity === 'medium'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-200 text-stone-700'
                      }`}>
                        {cat.severity === 'high' ? '고위험' : cat.severity === 'medium' ? '주의' : '관리'}
                      </span>
                      <span className="font-bold text-stone-800">{cat.percentage}%</span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-stone-200/80 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${
                        cat.severity === 'high'
                          ? 'bg-rose-600'
                          : cat.severity === 'medium'
                          ? 'bg-amber-600'
                          : 'bg-stone-500'
                      }`}
                      style={{ width: `${Math.max(10, Math.min(100, cat.percentage))}%` }}
                    />
                  </div>

                  <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                    {cat.summary}
                  </p>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-stone-500">주요 촉발 트리거:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.keyTriggers.map((trig, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[11px] px-2 py-0.5 bg-white text-stone-700 rounded-lg border border-stone-200/80 shadow-2xs"
                        >
                          #{trig}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Mentor Personalization Strategy Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif-kr">
                    선생님 데이터를 반영한 AI 멘토 '온기'의 맞춤형 상담 업그레이드
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    상담 프롬프트 실시간 연동됨
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  단순한 일반론적 위로를 넘어, 선생님이 가장 아파하시는 취약점과 성찰 기록을 토대로 맞춤 대응합니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Personalized Strategy */}
              <div className="bg-amber-50/50 rounded-2xl p-4 sm:p-5 border border-amber-200/70 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-700" />
                  <span>적용된 맞춤 멘토링 상담 전략</span>
                </div>
                <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed font-serif-kr">
                  {analysisReport?.personalizedCounselingStrategy ||
                    '1. 학부모 민원 접수 시 즉각적인 죄책감 분리 프레이밍 제공\n2. 지난 성찰 일지의 다짐(분노의 분리, 공적 보고)을 상기시키며 회복 탄력성 자극\n3. 학교 현장 규정에 부합하는 실질적 방어 행동 지침 지원'}
                </p>
              </div>

              {/* Box 2: Recurring Triggers */}
              <div className="bg-rose-50/40 rounded-2xl p-4 sm:p-5 border border-rose-200/70 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  <span>대화에서 포착된 핵심 감정 트리거</span>
                </div>
                <ul className="text-xs text-stone-700 space-y-1.5 list-disc list-inside">
                  {(analysisReport?.recurringTriggers || [
                    '학부모의 퇴근 후 불시 전화 및 감정적 폭언',
                    '수업 중 학생의 의도적 비협조 및 반항',
                    '내가 부족해서 교실이 무너진다는 자기 비하',
                    '관리자의 미온적 보호와 나홀로 해결 압박',
                  ]).map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Box 3: Teacher's Strengths */}
              <div className="bg-emerald-50/50 rounded-2xl p-4 sm:p-5 border border-emerald-200/70 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>대화 속에서 발견된 선생님의 내면 강점</span>
                </div>
                <ul className="text-xs text-stone-700 space-y-1.5 list-disc list-inside">
                  {(analysisReport?.teacherStrengths || [
                    '상처 속에서도 아이들을 끝까지 놓지 않으려는 진정성',
                    '상담 후 자신의 감정을 성찰 일지로 객관화하는 메타인지',
                    '교권 보호를 위해 공적 절차를 준비하는 실천적 용기',
                  ]).map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Box 4: Recommended Boundaries */}
              <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Compass className="w-4 h-4 text-stone-700" />
                  <span>내일부터 실천할 수 있는 건강한 경계</span>
                </div>
                <ul className="text-xs text-stone-700 space-y-1.5 list-disc list-inside">
                  {(analysisReport?.recommendedBoundaries || [
                    '근무 시간 외 학부모 개인 연락 차단 (안심번호/공식창구 단일화)',
                    '교실에서 일어난 갈등은 하교 벨소리와 함께 문 밖 공간에 정서적으로 두고 오기',
                    '내 한계를 초과하는 사안은 즉시 관리자 및 위클래스에 공식 이관하기',
                  ]).map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mentor Tuned Keywords */}
            {analysisReport?.mentorTunedKeywords && analysisReport.mentorTunedKeywords.length > 0 && (
              <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-stone-500">
                  멘토가 각별히 주의깊게 듣는 감정 단어:
                </span>
                {analysisReport.mentorTunedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-full font-medium"
                  >
                    "{kw}"
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View 2: Full Sessions List & Reflection Notes */}
      {activeTab === 'sessions' && (
        <div className="space-y-6 animate-fade-in">
          {/* Search & Category Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="counseling-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="상담 제목, 대화 내용, 선생님의 비밀 일지 검색..."
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                검색
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('전체');
                  fetchSessions();
                }}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
                title="새로고침"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </form>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-800 text-white shadow-2xs'
                      : 'bg-stone-100/70 text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <span>
                총 <strong className="text-stone-900 font-bold">{sessions.length}</strong>개의 상담 기록이 백엔드에 보관되어 있습니다.
              </span>
              <span className="text-[11px] text-stone-400">
                * 핀(📌)을 클릭하면 상단에 중요한 세션을 고정할 수 있습니다.
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-700 mx-auto mb-2" />
                <p className="text-xs text-stone-500">백엔드 서버에서 상담 데이터를 불러오고 있습니다...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-base font-bold text-stone-900 font-serif-kr">
                    보관된 상담 기록이 없습니다
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    마음 공감 상담실에서 대화를 마친 후 [서버에 상담 기록 저장]을 누르거나, 상단의 [상담 일지 직접 작성]을 통해 기록을 남겨보세요.
                  </p>
                </div>
              </div>
            ) : (
          <div className="space-y-3.5">
            {sessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const isEditingMemo = editingMemoId === session.id;

              return (
                <div
                  key={session.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                    session.pinned
                      ? 'border-amber-400/90 ring-1 ring-amber-300/40 bg-[#FFFDFB]'
                      : 'border-stone-200/90 hover:border-stone-300'
                  }`}
                >
                  {/* Session Header Bar */}
                  <div
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {session.pinned && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full">
                            <Pin className="w-3 h-3 fill-amber-700" />
                            상단 고정
                          </span>
                        )}
                        <span className="text-[11px] font-medium px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full">
                          {session.teacherRole}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-full">
                          {session.category}
                        </span>
                        {session.durationSeconds !== undefined && session.durationSeconds > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200/60 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            상담 시간: {formatDuration(session.durationSeconds)}
                          </span>
                        )}
                        {session.stressScore !== undefined && (
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            session.stressScore >= 8
                              ? 'bg-rose-50 text-rose-800 border border-rose-200/70'
                              : session.stressScore >= 5
                              ? 'bg-amber-50 text-amber-800 border border-amber-200/70'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                          }`}>
                            <Flame className="w-3 h-3" />
                            스트레스 {session.stressScore}/10
                          </span>
                        )}
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {session.createdAt}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-stone-900 font-serif-kr truncate">
                        {session.title}
                      </h3>

                      {/* Mood Before -> After pills & detected triggers */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[11px]">
                          상담 전: {session.moodBefore}
                        </span>
                        {session.moodAfter && (
                          <>
                            <span className="text-stone-300">➔</span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-medium rounded-md text-[11px]">
                              상담 후: {session.moodAfter}
                            </span>
                          </>
                        )}
                        <span className="text-stone-300">·</span>
                        <span className="text-[11px] text-stone-400">
                          대화 {session.messages.length}개
                        </span>
                        {session.detectedStressTriggers && session.detectedStressTriggers.length > 0 && (
                          <>
                            <span className="text-stone-300">·</span>
                            <div className="flex items-center gap-1">
                              {session.detectedStressTriggers.map((trig, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded-md"
                                >
                                  #{trig}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(session);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          session.pinned
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                        }`}
                        title={session.pinned ? '고정 해제' : '상단 고정'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="서버에서 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="p-1.5 text-stone-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-stone-100 bg-[#FAF9F7]/60 space-y-6">
                      {/* Teacher's Private Reflection Note Section */}
                      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/70 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 font-serif-kr">
                            <FileText className="w-4 h-4 text-amber-700" />
                            <span>선생님의 비밀 성찰 일지 & 실천 메모</span>
                          </div>

                          {!isEditingMemo ? (
                            <button
                              onClick={() => handleStartEditingMemo(session)}
                              className="text-xs text-amber-800 hover:text-amber-950 font-semibold underline"
                            >
                              {session.teacherPrivateNote ? '메모 수정' : '+ 메모 작성하기'}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveMemo(session.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg shadow-2xs"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>저장</span>
                              </button>
                              <button
                                onClick={() => setEditingMemoId(null)}
                                className="text-xs text-stone-400 hover:text-stone-600"
                              >
                                취소
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditingMemo ? (
                          <textarea
                            value={memoText}
                            onChange={(e) => setMemoText(e.target.value)}
                            placeholder="상담 후 느낀 점, 내일 실천할 경계 세우기 계획, 또는 관리자 보고 사항 등을 자유롭게 적어보세요..."
                            rows={3}
                            className="w-full text-xs sm:text-sm p-3 bg-amber-50/40 border border-amber-300/80 rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                          />
                        ) : session.teacherPrivateNote ? (
                          <p className="text-xs sm:text-sm text-stone-700 whitespace-pre-wrap font-serif-kr leading-relaxed bg-amber-50/30 p-3 rounded-xl border border-amber-100">
                            {session.teacherPrivateNote}
                          </p>
                        ) : (
                          <p className="text-xs text-stone-400 italic">
                            작성된 비밀 메모가 없습니다. '메모 작성하기'를 눌러 나만을 위한 다짐을 기록해 보세요.
                          </p>
                        )}
                      </div>

                      {/* Full Dialogue Transcript */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-stone-700 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                            상담 대화 전문 ({session.messages.length})
                          </span>
                          <button
                            onClick={() => {
                              const transcript = session.messages
                                .map(
                                  (m) =>
                                    `[${m.role === 'user' ? '선생님' : '온기 멘토'}]: ${m.content}`
                                )
                                .join('\n\n');
                              handleCopyText(session.id, transcript);
                            }}
                            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800"
                          >
                            {copiedId === session.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">복사됨</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>대화 전문 복사</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto p-3 bg-white rounded-2xl border border-stone-200/80">
                          {session.messages.map((m, idx) => (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                                m.role === 'user'
                                  ? 'bg-amber-50/80 text-amber-950 border border-amber-200/40 ml-4'
                                  : 'bg-stone-50 text-stone-800 border border-stone-200/60 mr-4'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 mb-1">
                                <span>{m.role === 'user' ? '선생님' : '상담 멘토 온기'}</span>
                                <span className="text-[10px] text-stone-400">{m.timestamp}</span>
                              </div>
                              <div className="whitespace-pre-wrap">{m.content}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tags & Metadata */}
                      {session.tags && session.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-2">
                          <Tag className="w-3.5 h-3.5 text-stone-400" />
                          {session.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
        </div>
      )}

      {/* Manual Session Add Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 font-serif-kr flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-800" />
                <span>상담 일지 수기 등록</span>
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualSession} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">상담 제목</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="예: 2학기 학부모 상담 통화 후 심리 정리"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">교사 직무</label>
                  <select
                    value={manualRole}
                    onChange={(e) => setManualRole(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs"
                  >
                    <option>초등 담임/교과 교사</option>
                    <option>중등 교과/담임 교사</option>
                    <option>고등 입시/진로 교사</option>
                    <option>특수교사</option>
                    <option>유치원 교사</option>
                    <option>보건/전문상담/영양/사서 교사</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">고민 분류</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs"
                  >
                    <option>학부모 민원 및 무리한 요구</option>
                    <option>학생 생활지도 및 거친 행동</option>
                    <option>과중한 행정 공문과 수업 부담</option>
                    <option>"내가 부족해서일까" 자책감과 회의감</option>
                    <option>관리자 및 동료와의 관계 갈등</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">상담 전 마음</label>
                  <input
                    type="text"
                    value={manualMoodBefore}
                    onChange={(e) => setManualMoodBefore(e.target.value)}
                    placeholder="예: 억울함, 피로"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">상담 후 회복 상태</label>
                  <input
                    type="text"
                    value={manualMoodAfter}
                    onChange={(e) => setManualMoodAfter(e.target.value)}
                    placeholder="예: 안도감, 대응 원칙 세움"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">주요 대화 및 이야기 내용</label>
                <textarea
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder="당시 털어놓았던 고민이나 나눈 대화를 요약해서 적어주세요."
                  rows={3}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">선생님의 비밀 성찰 일지 (메모)</label>
                <textarea
                  value={manualMemo}
                  onChange={(e) => setManualMemo(e.target.value)}
                  placeholder="내가 실천할 점이나 나 자신에게 전하고 싶은 위로의 말을 적어보세요."
                  rows={2}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-semibold shadow-xs"
                >
                  백엔드 서버에 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
