import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Heart, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer';

const TEACHER_AFFIRMATIONS = [
  '나는 교사이기 이전에, 상처받을 수 있는 온전하고 소중한 사람입니다.',
  '오늘 하루 일어난 모든 갈등이 나의 부족함 때문은 아닙니다.',
  '모든 사람의 인정과 기대를 만족시킬 수는 없습니다. 그래도 괜찮습니다.',
  '오늘 나는 교실을 지키며 내 몫의 최선을 다했습니다.',
  '퇴근 후의 나는 오롯이 나 자신을 돌볼 권리가 있습니다.',
  '실수해도 괜찮습니다. 내일은 또 다른 새로운 햇살이 뜹니다.',
];

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export const BreathingMeditation: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);
  const [affirmationIdx, setAffirmationIdx] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (isActive) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (phase === 'inhale') {
              setPhase('hold');
              return 7;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return 8;
            } else {
              setPhase('inhale');
              setCycleCount((c) => c + 1);
              setAffirmationIdx((a) => (a + 1) % TEACHER_AFFIRMATIONS.length);
              soundEngine.playSingingBowl();
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const handleToggle = () => {
    if (!isActive) {
      soundEngine.playSingingBowl();
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setTimeLeft(4);
    setCycleCount(0);
  };

  return (
    <div id="breathing-meditation-container" className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-stone-900 font-serif-kr">
          교사를 위한 4-7-8 신경 이완 호흡
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          교실에서 잔뜩 긴장했던 교감신경을 이완시키고 뇌의 피로를 씻어내는 과학적인 호흡법입니다.
        </p>
      </div>

      {/* Visual Breathing Disc */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Animated halo rings */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-1000 ${
              isActive
                ? phase === 'inhale'
                  ? 'bg-amber-200/40 scale-100'
                  : phase === 'hold'
                  ? 'bg-amber-300/40 scale-105 animate-pulse'
                  : 'bg-stone-200/40 scale-75'
                : 'bg-stone-100 scale-90'
            }`}
          />
          <div
            className={`absolute inset-4 rounded-full transition-all duration-1000 ${
              isActive
                ? phase === 'inhale'
                  ? 'bg-amber-300/30 scale-95'
                  : phase === 'hold'
                  ? 'bg-amber-400/30 scale-100'
                  : 'bg-stone-200/30 scale-70'
                : 'bg-stone-200/30 scale-80'
            }`}
          />

          {/* Core circle */}
          <div
            className={`relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-full shadow-lg flex flex-col items-center justify-center transition-all duration-700 ${
              phase === 'inhale'
                ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-white scale-105'
                : phase === 'hold'
                ? 'bg-gradient-to-tr from-amber-600 to-orange-600 text-white scale-110'
                : 'bg-gradient-to-tr from-stone-700 to-stone-800 text-white scale-90'
            }`}
          >
            <span className="text-xs uppercase tracking-widest font-bold opacity-80 mb-1">
              {phase === 'inhale'
                ? '숨 들이쉬기'
                : phase === 'hold'
                ? '숨 멈추기'
                : '천천히 내쉬기'}
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tighter">
              {isActive ? timeLeft : '4-7-8'}
            </span>
            <span className="text-[11px] opacity-75 mt-1 font-serif-kr">
              {phase === 'inhale'
                ? '온기를 채웁니다'
                : phase === 'hold'
                ? '마음을 고요히 합니다'
                : '피로를 비워냅니다'}
            </span>
          </div>
        </div>

        {/* Phase progress bars */}
        <div className="flex items-center gap-3 mt-6 text-xs text-stone-500 font-medium">
          <span className={phase === 'inhale' && isActive ? 'text-amber-700 font-bold' : ''}>
            들숨 (4초)
          </span>
          <span className="text-stone-300">·</span>
          <span className={phase === 'hold' && isActive ? 'text-orange-700 font-bold' : ''}>
            머무름 (7초)
          </span>
          <span className="text-stone-300">·</span>
          <span className={phase === 'exhale' && isActive ? 'text-stone-800 font-bold' : ''}>
            날숨 (8초)
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-6">
          <button
            id="breathing-toggle-btn"
            onClick={handleToggle}
            className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>잠시 멈춤</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>호흡 시작하기</span>
              </>
            )}
          </button>

          <button
            id="breathing-reset-btn"
            onClick={handleReset}
            className="p-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {cycleCount > 0 && (
          <p className="text-xs text-stone-400 mt-2">
            완료한 이완 호흡: <span className="font-semibold text-stone-700">{cycleCount}회</span>
          </p>
        )}
      </div>

      {/* Grounding Affirmation Card */}
      <div className="bg-white rounded-2xl p-6 border border-amber-200/70 shadow-xs text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-amber-700" />
          <span>선생님을 위한 마음 지지 확언</span>
        </div>
        <p className="text-base sm:text-lg font-serif-kr text-stone-900 italic font-medium leading-relaxed max-w-lg mx-auto">
          "{TEACHER_AFFIRMATIONS[affirmationIdx]}"
        </p>
      </div>
    </div>
  );
};
