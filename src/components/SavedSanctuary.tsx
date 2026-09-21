import React, { useState } from 'react';
import {
  Bookmark,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Calendar,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { ComfortLetter } from '../types';

interface SavedSanctuaryProps {
  savedLetters: ComfortLetter[];
  savedQuotes: { id: string; quote: string; author: string; date: string }[];
  onRemoveLetter: (id: string) => void;
  onRemoveQuote: (id: string) => void;
}

export const SavedSanctuary: React.FC<SavedSanctuaryProps> = ({
  savedLetters,
  savedQuotes,
  onRemoveLetter,
  onRemoveQuote,
}) => {
  const [expandedLetterId, setExpandedLetterId] = useState<string | null>(
    savedLetters.length > 0 ? savedLetters[0].id : null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isEmpty = savedLetters.length === 0 && savedQuotes.length === 0;

  return (
    <div id="saved-sanctuary-container" className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-stone-900 font-serif-kr flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-800" />
          <span>선생님의 마음 서랍</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-500">
          선생님의 마음에 온기를 주었던 소중한 위로 편지와 글귀들을 간직하는 공간입니다.
        </p>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-stone-300 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 mx-auto flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-stone-900 font-serif-kr">
              아직 보관된 온기 글귀가 없습니다
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              [오늘의 위로 편지]나 [마음 상담실]에서 마음에 닿는 편지와 조언을 '마음 서랍'에 저장해 보세요.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Saved Letters Section */}
          {savedLetters.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                보관된 위로 편지 ({savedLetters.length})
              </h3>

              <div className="space-y-3">
                {savedLetters.map((letter) => {
                  const isExpanded = expandedLetterId === letter.id;
                  return (
                    <div
                      key={letter.id}
                      className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all"
                    >
                      {/* Accordion header */}
                      <div
                        onClick={() => setExpandedLetterId(isExpanded ? null : letter.id)}
                        className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/70 select-none"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] px-2 py-0.5 bg-amber-100/70 text-amber-900 font-medium rounded-full">
                              {letter.mainBurden}
                            </span>
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {letter.createdAt}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-stone-900 font-serif-kr">
                            {letter.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveLetter(letter.id);
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-stone-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded letter contents */}
                      {isExpanded && (
                        <div className="px-5 sm:px-8 pb-6 pt-2 border-t border-stone-100 bg-[#FFFDFB] space-y-6">
                          <div className="p-3.5 bg-amber-50/70 border border-amber-200/50 rounded-xl text-xs sm:text-sm font-serif-kr text-amber-950 italic">
                            "{letter.quote}"
                          </div>

                          <div className="text-sm font-serif-kr text-stone-800 whitespace-pre-wrap leading-relaxed space-y-3">
                            {letter.letter}
                          </div>

                          {letter.prescriptions && letter.prescriptions.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-stone-200/60">
                              <span className="text-xs font-bold text-amber-900 font-serif-kr">
                                실천했던 온기 처방전
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {letter.prescriptions.map((p, idx) => (
                                  <div
                                    key={idx}
                                    className="p-3 bg-white rounded-xl border border-amber-200/40 text-xs text-stone-700"
                                  >
                                    <span className="font-bold text-amber-900 block mb-1">
                                      {p.category}
                                    </span>
                                    {p.action}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                            <p className="text-xs text-stone-500 font-serif-kr italic">
                              {letter.blessing}
                            </p>
                            <button
                              onClick={() => handleCopy(letter.id, `${letter.title}\n\n${letter.letter}`)}
                              className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 p-1.5 rounded-lg hover:bg-stone-100"
                            >
                              {copiedId === letter.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">복사됨</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>전문 복사</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saved Quotes Section */}
          {savedQuotes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                보관된 상담 온기 글귀 ({savedQuotes.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3 relative group"
                  >
                    <p className="text-xs sm:text-sm text-stone-800 font-serif-kr leading-relaxed whitespace-pre-wrap">
                      "{q.quote}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                      <span>{q.author} · {q.date}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(q.id, q.quote)}
                          className="p-1 hover:text-stone-700"
                          title="복사"
                        >
                          {copiedId === q.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => onRemoveQuote(q.id)}
                          className="p-1 hover:text-rose-600"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
