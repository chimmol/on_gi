/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CounselingRoom } from './components/CounselingRoom';
import { LetterWorkshop } from './components/LetterWorkshop';
import { UnburdenRitual } from './components/UnburdenRitual';
import { BreathingMeditation } from './components/BreathingMeditation';
import { SavedSanctuary } from './components/SavedSanctuary';
import { CounselingDataDashboard } from './components/CounselingDataDashboard';
import { CrisisModal } from './components/CrisisModal';
import { AppTab, ComfortLetter } from './types';
import { Heart, Sparkles } from 'lucide-react';

const SEED_LETTER: ComfortLetter = {
  id: 'seed-letter-1',
  createdAt: '항상 선생님 곁에',
  teacherRole: '초·중·고 모든 선생님께',
  mainBurden: '"내가 부족해서일까" 자책감과 회의감',
  feelings: ['탈진', '자책감'],
  title: '오늘 하루, 교실의 폭풍 속에서도 묵묵히 버텨낸 선생님께',
  quote: '선생님은 한 사람의 인간으로서 이미 온 힘을 다하셨습니다.',
  letter: `선생님, 오늘 하루 교실의 문을 열고 들어서기까지 얼마나 무거운 마음이셨습니까.

아이들의 날선 눈빛 하나, 쏟아지는 업무와 공문, 혹은 학부모님의 날카로운 목소리 한마디에 심장이 덜컥 내려앉고 가슴이 조여왔을 것입니다. 퇴근길 버스나 차 안에서 '내가 더 참았어야 했나', '내가 교사로서 부족한 탓일까' 하며 스스로를 다그치고 계시지는 않나요.

선생님, 결코 그렇지 않습니다.
교실에서 일어나는 모든 아픔과 갈등이 선생님 개인의 능력이나 인격의 결함 때문이 아닙니다. 지금 우리 교육 현장이 한 사람의 교사에게 지우고 있는 무게가 너무나 가혹하고 거대할 뿐입니다.

선생님은 오늘 하루도 최선을 다해 교실의 자리를 지켜내셨습니다. 그것만으로도 선생님은 충분히 훌륭하고 귀한 존재입니다. 오늘은 교사라는 무거운 짐을 잠시 내려놓고, 온전히 선생님 자신만을 위한 따뜻한 저녁을 선물해주세요.`,
  prescriptions: [
    {
      category: '퇴근길 경계',
      action: '현관문을 열고 들어서는 순간, 학교에서 있었던 일은 문 밖에 두고 나를 위한 공간으로 입장하기',
    },
    {
      category: '따뜻한 온기',
      action: '온도감 있는 차 한 잔을 손으로 감싸 쥐고 그 온기가 가슴까지 닿는 것을 3분간 느끼기',
    },
    {
      category: '자책 멈추기',
      action: '"오늘 나는 내 몫을 다했다. 나를 자책하지 않겠다"라고 소리 내어 말해주기',
    },
  ],
  blessing: '선생님의 마음에 다시 따스한 온기와 평화가 깃들기를 두 손 모아 응원합니다.',
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('counseling');
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);

  // Saved items state with localStorage
  const [savedLetters, setSavedLetters] = useState<ComfortLetter[]>(() => {
    const saved = localStorage.getItem('teacher_saved_letters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [SEED_LETTER];
      }
    }
    return [SEED_LETTER];
  });

  const [savedQuotes, setSavedQuotes] = useState<{ id: string; quote: string; author: string; date: string }[]>(() => {
    const saved = localStorage.getItem('teacher_saved_quotes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'seed-q-1',
        quote: '선생님, 오늘 교실에서 다친 마음은 결코 선생님의 나약함 때문이 아닙니다. 상처받았다는 것은 그만큼 온 마음으로 아이들을 대했다는 증거입니다.',
        author: '상담 멘토 온기',
        date: '마음의 선물',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('teacher_saved_letters', JSON.stringify(savedLetters));
  }, [savedLetters]);

  useEffect(() => {
    localStorage.setItem('teacher_saved_quotes', JSON.stringify(savedQuotes));
  }, [savedQuotes]);

  const handleSaveLetter = (letter: ComfortLetter) => {
    if (savedLetters.some((l) => l.id === letter.id)) {
      setSavedLetters((prev) => prev.filter((l) => l.id !== letter.id));
    } else {
      setSavedLetters((prev) => [letter, ...prev]);
    }
  };

  const isLetterSaved = (id: string) => {
    return savedLetters.some((l) => l.id === id);
  };

  const handleRemoveLetter = (id: string) => {
    setSavedLetters((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSaveQuote = (quote: string, author: string) => {
    const newQuote = {
      id: 'q-' + Date.now(),
      quote,
      author,
      date: new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
    };
    setSavedQuotes((prev) => [newQuote, ...prev]);
    alert('온기 글귀가 선생님의 마음 서랍에 소중히 보관되었습니다.');
  };

  const handleRemoveQuote = (id: string) => {
    setSavedQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  const totalSavedCount = savedLetters.length + savedQuotes.length;

  return (
    <div id="app-root" className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2D2A26] selection:bg-amber-100 selection:text-amber-900">
      {/* Header with sound & tabs */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCrisis={() => setIsCrisisOpen(true)}
        savedCount={totalSavedCount}
      />

      {/* Main Tab Content */}
      <main id="main-content-area" className="flex-1 pb-16">
        {currentTab === 'counseling' && (
          <CounselingRoom
            onSaveQuote={handleSaveQuote}
            onNavigateToDataManage={() => setCurrentTab('data-manage')}
          />
        )}

        {currentTab === 'letter' && (
          <LetterWorkshop
            onSaveLetter={handleSaveLetter}
            isLetterSaved={isLetterSaved}
          />
        )}

        {currentTab === 'unburden' && <UnburdenRitual />}

        {currentTab === 'breathing' && <BreathingMeditation />}

        {currentTab === 'saved' && (
          <SavedSanctuary
            savedLetters={savedLetters}
            savedQuotes={savedQuotes}
            onRemoveLetter={handleRemoveLetter}
            onRemoveQuote={handleRemoveQuote}
          />
        )}

        {currentTab === 'data-manage' && (
          <CounselingDataDashboard
            onStartNewCounseling={() => setCurrentTab('counseling')}
          />
        )}
      </main>

      {/* Emergency Crisis Contact Modal */}
      <CrisisModal isOpen={isCrisisOpen} onClose={() => setIsCrisisOpen(false)} />

      {/* Gentle Footer */}
      <footer id="app-footer" className="mt-auto border-t border-stone-200/80 bg-white/50 py-6 px-4 text-center text-xs text-stone-500 space-y-1">
        <p className="flex items-center justify-center gap-1.5 font-medium text-stone-700 font-serif-kr">
          <Heart className="w-3.5 h-3.5 text-amber-700 fill-amber-700/20" />
          <span>선생님의 온기를 지키는 작은 마음 쉼터 · 온기(溫氣)</span>
        </p>
        <p className="text-[11px] text-stone-400 max-w-lg mx-auto">
          본 서비스는 교육 현장에서 헌신하시는 선생님들의 심리적 치유와 정서적 회복을 돕기 위해 제작된 심리 지지 공간입니다.
          응급 위기 상황 발생 시 전문 지원센터(1577-0199 / 109)의 도움을 받으실 수 있습니다.
        </p>
      </footer>
    </div>
  );
}
