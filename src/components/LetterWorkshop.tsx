import React, { useState } from 'react';
import {
  Sparkles,
  Mail,
  Heart,
  BookmarkCheck,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Compass,
  Feather,
} from 'lucide-react';
import { ComfortLetter, TeacherRole, BurdenCategory, PrescriptionItem } from '../types';

interface LetterWorkshopProps {
  onSaveLetter: (letter: ComfortLetter) => void;
  isLetterSaved: (id: string) => boolean;
}

const BURDEN_CATEGORIES: BurdenCategory[] = [
  '학부모 민원 및 무리한 요구',
  '학생 생활지도 및 거친 행동',
  '과중한 행정 공문과 수업 부담',
  '"내가 부족해서일까" 자책감과 회의감',
  '관리자 및 동료와의 관계 갈등',
  '신규 및 저경력 교사의 불안감',
];

const EMOTION_TAGS = [
  '가슴이 쿵쾅거림',
  '눈물이 왈칵 쏟아질 것 같음',
  '자책감과 미안함',
  '모든 게 무기력함',
  '억울함과 분노',
  '학교에서 도망치고 싶음',
  '외로움과 고립감',
  '완전한 에너지 소진(탈진)',
];

export const LetterWorkshop: React.FC<LetterWorkshopProps> = ({
  onSaveLetter,
  isLetterSaved,
}) => {
  const [role, setRole] = useState<TeacherRole>('초등 담임/교과 교사');
  const [burden, setBurden] = useState<BurdenCategory>('학부모 민원 및 무리한 요구');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([
    '가슴이 쿵쾅거림',
    '자책감과 미안함',
  ]);
  const [specificStory, setSpecificStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<ComfortLetter | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleEmotion = (tag: string) => {
    if (selectedEmotions.includes(tag)) {
      setSelectedEmotions(selectedEmotions.filter((t) => t !== tag));
    } else {
      setSelectedEmotions([...selectedEmotions, tag]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherRole: role,
          mainBurden: burden,
          feelings: selectedEmotions,
          specificStory,
        }),
      });

      if (!res.ok) {
        throw new Error('편지 생성 실패');
      }

      const data = await res.json();
      const newLetter: ComfortLetter = {
        id: 'letter-' + Date.now(),
        createdAt: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        teacherRole: role,
        mainBurden: burden,
        feelings: selectedEmotions,
        title: data.title || '오늘 하루 교실의 무게를 견뎌낸 선생님께',
        quote: data.quote || '선생님은 충분히 훌륭하며, 오늘 하루도 최선을 다하셨습니다.',
        letter: data.letter || '',
        prescriptions: data.prescriptions || [],
        blessing: data.blessing || '오늘 밤은 모든 무거운 짐을 내려놓고 평안한 밤 되시기를 진심으로 기도합니다.',
      };

      setGeneratedLetter(newLetter);
    } catch (e) {
      console.error(e);
      alert('편지를 작성하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!generatedLetter) return;
    const fullText = `[${generatedLetter.title}]\n\n"${generatedLetter.quote}"\n\n${generatedLetter.letter}\n\n[오늘의 온기 처방전]\n${generatedLetter.prescriptions
      .map((p) => `- ${p.category}: ${p.action}`)
      .join('\n')}\n\n${generatedLetter.blessing}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="letter-workshop-container" className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-stone-50 rounded-2xl p-6 border border-amber-200/60 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white text-amber-800 rounded-2xl shadow-2xs border border-amber-100">
            <Feather className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-stone-900 font-serif-kr">
              오직 선생님 한 분만을 위한 위로 편지 & 처방전
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              선생님께서 교실에서 마주하신 상처와 지친 감정을 골라주시면,
              마치 평생 교단을 지켜온 따뜻한 선배이자 문학 치료사가 쓴 듯한
              깊은 안도감의 편지와 작고 실천 가능한 온기 처방전을 지어드립니다.
            </p>
          </div>
        </div>
      </div>

      {/* Input Selection Form */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200/80 shadow-xs space-y-6">
        {/* 1. Burden category */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            1. 오늘 선생님의 마음을 가장 무겁게 짓누른 짐은 무엇인가요?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {BURDEN_CATEGORIES.map((item) => (
              <button
                key={item}
                id={`burden-btn-${item.slice(0, 4)}`}
                onClick={() => setBurden(item)}
                className={`p-3 rounded-xl text-left text-xs font-medium border transition-all ${
                  burden === item
                    ? 'bg-amber-100/70 border-amber-400 text-amber-950 font-semibold shadow-2xs'
                    : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100/70'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Emotion Tags */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            2. 가슴속에 맴도는 감정들을 골라주세요 (복수 선택 가능)
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOTION_TAGS.map((tag) => {
              const active = selectedEmotions.includes(tag);
              return (
                <button
                  key={tag}
                  id={`emotion-tag-${tag.slice(0, 4)}`}
                  onClick={() => toggleEmotion(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? 'bg-rose-100/80 border-rose-300 text-rose-900 shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Optional Specific Story */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
            <span>3. 오늘 있었던 일을 조금 더 남겨주셔도 좋습니다 (선택 사항)</span>
            <span className="text-[11px] text-stone-400 font-normal">비공개로 처리됩니다</span>
          </label>
          <textarea
            id="letter-specific-story-input"
            value={specificStory}
            onChange={(e) => setSpecificStory(e.target.value)}
            rows={2}
            placeholder="예: 6교시에 학부모님께서 다그치는 전화를 받고 말문이 막혔어요. 아이들을 위해 한 일이었는데 너무 허탈합니다."
            className="w-full text-xs bg-stone-50/80 border border-stone-200 rounded-xl p-3 text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-center">
          <button
            id="generate-letter-submit-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>선생님만을 위한 온기 편지를 정성껏 적고 있습니다...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>선생님을 위한 위로 편지 받아보기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render Generated Letter (Vintage aesthetic paper style) */}
      {generatedLetter && (
        <div
          id="generated-letter-paper"
          className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-10 border border-amber-200/80 shadow-md space-y-8 relative overflow-hidden animate-fade-in"
        >
          {/* Subtle paper decorative header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/50 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 bg-amber-100/70 text-amber-900 font-medium rounded-full">
                온기 우체통
              </span>
              <span className="text-xs text-stone-400">{generatedLetter.createdAt}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="letter-copy-btn"
                onClick={handleCopyText}
                className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl transition-colors"
                title="편지 전문 복사"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사 완료' : '편지 복사'}</span>
              </button>

              <button
                id="letter-save-btn"
                onClick={() => onSaveLetter(generatedLetter)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl transition-colors ${
                  isLetterSaved(generatedLetter.id)
                    ? 'bg-amber-800 text-white'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>{isLetterSaved(generatedLetter.id) ? '보관됨' : '마음 서랍에 저장'}</span>
              </button>
            </div>
          </div>

          {/* Letter Title & Quote */}
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif-kr tracking-tight leading-snug">
              {generatedLetter.title}
            </h3>
            <div className="inline-block p-4 bg-amber-50/60 rounded-2xl border border-amber-200/40 text-amber-950 font-serif-kr text-sm sm:text-base italic leading-relaxed">
              "{generatedLetter.quote}"
            </div>
          </div>

          {/* Letter Body */}
          <div className="prose prose-stone max-w-none text-stone-800 font-serif-kr text-base sm:text-lg leading-relaxed whitespace-pre-wrap space-y-4 px-2">
            {generatedLetter.letter}
          </div>

          {/* Prescription Box */}
          {generatedLetter.prescriptions && generatedLetter.prescriptions.length > 0 && (
            <div className="mt-8 pt-6 border-t border-amber-200/60 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <h4 className="text-sm font-bold text-stone-900 font-serif-kr">
                  오늘 밤, 선생님을 위한 3가지 온기 처방전
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {generatedLetter.prescriptions.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-2xl border border-amber-200/50 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-amber-900">{p.category}</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-sans">{p.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blessing Footer */}
          <div className="pt-6 border-t border-amber-200/40 text-center space-y-1">
            <p className="text-xs sm:text-sm font-medium text-amber-950/80 font-serif-kr">
              {generatedLetter.blessing}
            </p>
            <p className="text-[11px] text-stone-400">
              — 선생님의 평안과 안식을 함께 바라는 마음 쉼터 올림
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
