import React, { useState } from 'react';
import { DoorOpen, Send, Sparkles, Wind, Waves, Lock, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer';

export const UnburdenRitual: React.FC = () => {
  const [burdenText, setBurdenText] = useState('');
  const [method, setMethod] = useState<'wind' | 'river' | 'door'>('wind');
  const [isReleasing, setIsReleasing] = useState(false);
  const [isReleased, setIsReleased] = useState(false);
  const [gatekeeperResponse, setGatekeeperResponse] = useState<string | null>(null);
  const [unburdenCount, setUnburdenCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('teacher_unburden_count') || '0', 10);
  });

  const handleRelease = async () => {
    if (!burdenText.trim() || isReleasing) return;
    setIsReleasing(true);

    // Play singing bowl chime
    soundEngine.playSingingBowl();

    try {
      const res = await fetch('/api/unburden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ burdenText }),
      });

      const data = await res.json().catch(() => ({}));
      setGatekeeperResponse(
        data.message ||
          '선생님, 그 무거운 짐은 이제 교실 문 뒤에 완전히 내려놓았습니다. 학교의 무게를 짊어지고 퇴근하지 마세요. 오늘 밤은 온전히 평온하게 쉬셔도 좋습니다.'
      );

      const newCount = unburdenCount + 1;
      setUnburdenCount(newCount);
      localStorage.setItem('teacher_unburden_count', newCount.toString());
      setIsReleased(true);
    } catch (e) {
      console.error(e);
      setGatekeeperResponse(
        '선생님, 그 무거운 짐은 이제 학교에 온전히 남겨졌습니다. 오늘 밤은 교사가 아닌 온전한 자신으로서 편안한 안식을 누리세요.'
      );
      setIsReleased(true);
    } finally {
      setIsReleasing(false);
    }
  };

  const handleReset = () => {
    setBurdenText('');
    setIsReleased(false);
    setGatekeeperResponse(null);
  };

  return (
    <div id="unburden-ritual-container" className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header Description */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center shadow-2xs">
          <DoorOpen className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 font-serif-kr tracking-tight">
          퇴근길 마음 비우기 의식
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
          교실 문을 닫으며, 오늘 나를 아프게 했던 말이나 상처를 학교에 두고 떠나세요.
          집으로 가져갈 짐이 아닙니다.
        </p>
      </div>

      {!isReleased ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
          {/* Method selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              비우는 방식을 선택하세요
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="unburden-method-wind-btn"
                onClick={() => setMethod('wind')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  method === 'wind'
                    ? 'bg-amber-100/70 border-amber-400 text-amber-950 font-semibold shadow-2xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Wind className="w-5 h-5 mx-auto mb-1 text-amber-700" />
                <span className="text-xs block">저녁 바람에 날리기</span>
              </button>

              <button
                id="unburden-method-river-btn"
                onClick={() => setMethod('river')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  method === 'river'
                    ? 'bg-blue-100/70 border-blue-400 text-blue-950 font-semibold shadow-2xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Waves className="w-5 h-5 mx-auto mb-1 text-blue-700" />
                <span className="text-xs block">잔잔한 강물에 띄우기</span>
              </button>

              <button
                id="unburden-method-door-btn"
                onClick={() => setMethod('door')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  method === 'door'
                    ? 'bg-stone-200 border-stone-400 text-stone-900 font-semibold shadow-2xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Lock className="w-5 h-5 mx-auto mb-1 text-stone-700" />
                <span className="text-xs block">교실 문 뒤에 잠가두기</span>
              </button>
            </div>
          </div>

          {/* Burden text area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              오늘 나를 다치게 한 말, 눈빛, 또는 짓누르는 걱정
            </label>
            <textarea
              id="unburden-input"
              value={burdenText}
              onChange={(e) => setBurdenText(e.target.value)}
              placeholder="예: 오늘 5교시에 학부모님께 들었던 날선 억측들, 통제되지 않는 아이를 보며 느꼈던 무기력함..."
              rows={4}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <button
              id="unburden-submit-btn"
              onClick={handleRelease}
              disabled={!burdenText.trim() || isReleasing}
              className="flex items-center gap-2 px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isReleasing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>마음의 짐을 교실에 내려놓는 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>학교에 내려놓고 홀가분하게 퇴근하기</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-stone-400">
              * 작성하신 내용은 완전히 소멸되며 어디에도 저장되지 않습니다.
            </p>
          </div>
        </div>
      ) : (
        /* Ritual completion view */
        <div
          id="unburden-completed-view"
          className="bg-gradient-to-b from-amber-50/90 to-white rounded-3xl p-8 sm:p-12 border border-amber-200/80 shadow-md text-center space-y-6 animate-fade-in"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full">
              내려놓음 완료
            </span>
            <h3 className="text-xl font-bold text-stone-900 font-serif-kr">
              짐은 교실에 남겨두었습니다
            </h3>
          </div>

          <div className="max-w-xl mx-auto p-6 bg-white/90 rounded-2xl border border-amber-200/60 shadow-2xs font-serif-kr text-base sm:text-lg text-stone-800 leading-relaxed italic">
            "{gatekeeperResponse}"
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="unburden-again-btn"
              onClick={handleReset}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl transition-colors"
            >
              다른 짐도 비워내기
            </button>
          </div>

          <p className="text-xs text-stone-400 pt-2">
            지금까지 이 공간에서 <span className="font-semibold text-stone-700">{unburdenCount}번</span>의 무거운 마음을 비워내셨습니다.
          </p>
        </div>
      )}
    </div>
  );
};
