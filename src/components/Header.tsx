import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  CloudRain,
  Flame,
  Wind,
  Bell,
  Heart,
  HelpCircle,
  MessageCircleHeart,
  Mail,
  DoorOpen,
  Wind as WindIcon,
  Bookmark,
  Database,
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynthesizer';
import { AppTab } from '../types';

interface HeaderProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenCrisis: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenCrisis,
  savedCount,
}) => {
  const [activeSound, setActiveSound] = useState<'rain' | 'fireplace' | 'wind' | 'chime' | 'off'>('off');
  const [volume, setVolume] = useState<number>(0.3);
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);

  const handleSoundChange = (type: 'rain' | 'fireplace' | 'wind' | 'chime' | 'off') => {
    setActiveSound(type);
    soundEngine.playSound(type);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundEngine.setVolume(newVol);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/70">
      {/* Top Banner with Identity and Actions */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-xs">
            <Heart className="w-5 h-5 fill-white/30" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight font-serif-kr">
                교사 마음 쉼터 <span className="text-amber-700 font-normal">· 온기(溫氣)</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full">
                선생님을 위한 비공개 안식처
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              오늘 교실에서 다친 선생님의 마음에 따뜻한 온기를 전합니다
            </p>
          </div>
        </div>

        {/* Ambient Sound & Crisis Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Procedural Sound Player */}
          <div className="relative">
            <button
              id="ambient-sound-toggle-btn"
              onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                activeSound !== 'off'
                  ? 'bg-amber-100/70 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
              title="마음을 가라앉히는 온기 배경음"
            >
              {activeSound === 'off' ? (
                <VolumeX className="w-4 h-4 text-stone-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-700 animate-pulse" />
              )}
              <span className="hidden md:inline">
                {activeSound === 'rain'
                  ? '창가의 빗소리'
                  : activeSound === 'fireplace'
                  ? '포근한 모닥불'
                  : activeSound === 'wind'
                  ? '퇴근길 솔바람'
                  : activeSound === 'chime'
                  ? '싱잉볼 명상'
                  : '마음 배경음'}
              </span>
            </button>

            {/* Sound Dropdown Popover */}
            {isSoundMenuOpen && (
              <div
                id="ambient-sound-popover"
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-3.5 space-y-3 z-50 animate-fade-in"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                  <span className="text-xs font-semibold text-stone-800">온기 배경음 (화이트 노이즈)</span>
                  <button
                    onClick={() => handleSoundChange('off')}
                    className="text-[11px] text-stone-400 hover:text-stone-700 underline"
                  >
                    소리 끄기
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    id="sound-rain-btn"
                    onClick={() => handleSoundChange('rain')}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs text-left transition-colors ${
                      activeSound === 'rain'
                        ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200'
                        : 'hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <span>창가 빗소리</span>
                  </button>

                  <button
                    id="sound-fire-btn"
                    onClick={() => handleSoundChange('fireplace')}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs text-left transition-colors ${
                      activeSound === 'fireplace'
                        ? 'bg-orange-50 text-orange-800 font-semibold border border-orange-200'
                        : 'hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>포근한 벽난로</span>
                  </button>

                  <button
                    id="sound-wind-btn"
                    onClick={() => handleSoundChange('wind')}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs text-left transition-colors ${
                      activeSound === 'wind'
                        ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                        : 'hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Wind className="w-4 h-4 text-emerald-500" />
                    <span>퇴근길 솔바람</span>
                  </button>

                  <button
                    id="sound-chime-btn"
                    onClick={() => handleSoundChange('chime')}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs text-left transition-colors ${
                      activeSound === 'chime'
                        ? 'bg-purple-50 text-purple-800 font-semibold border border-purple-200'
                        : 'hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Bell className="w-4 h-4 text-purple-500" />
                    <span>싱잉볼 종소리</span>
                  </button>
                </div>

                {activeSound !== 'off' && (
                  <div className="pt-2 border-t border-stone-100 space-y-1">
                    <div className="flex justify-between text-[11px] text-stone-500">
                      <span>볼륨 조절</span>
                      <span>{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      id="ambient-volume-slider"
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Emergency Crisis Contact */}
          <button
            id="crisis-info-btn"
            onClick={onOpenCrisis}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">전문 지원처</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav id="header-nav-tabs" className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-1 text-sm border-t border-stone-200/50">
          <button
            id="tab-counseling-btn"
            onClick={() => onSelectTab('counseling')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              currentTab === 'counseling'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <MessageCircleHeart className="w-4 h-4" />
            <span>마음 공감 상담실</span>
          </button>

          <button
            id="tab-letter-btn"
            onClick={() => onSelectTab('letter')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              currentTab === 'letter'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>오늘의 위로 편지 & 처방전</span>
          </button>

          <button
            id="tab-unburden-btn"
            onClick={() => onSelectTab('unburden')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              currentTab === 'unburden'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>퇴근길 마음 비우기</span>
          </button>

          <button
            id="tab-breathing-btn"
            onClick={() => onSelectTab('breathing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              currentTab === 'breathing'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <WindIcon className="w-4 h-4" />
            <span>4-7-8 이완 호흡</span>
          </button>

          <button
            id="tab-saved-btn"
            onClick={() => onSelectTab('saved')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              currentTab === 'saved'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>선생님의 마음 서랍</span>
            {savedCount > 0 && (
              <span className={`px-1.5 py-0.2 text-[11px] rounded-full font-bold ${
                currentTab === 'saved' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-900'
              }`}>
                {savedCount}
              </span>
            )}
          </button>

          <button
            id="tab-data-manage-btn"
            onClick={() => onSelectTab('data-manage')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ml-auto ${
              currentTab === 'data-manage'
                ? 'bg-amber-900 text-white shadow-xs ring-1 ring-amber-600'
                : 'text-stone-700 hover:text-stone-900 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/60'
            }`}
          >
            <Database className="w-4 h-4 text-amber-700" />
            <span>상담 데이터 관리 (서버)</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </nav>
      </div>
    </header>
  );
};
