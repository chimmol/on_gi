import React from 'react';
import { X, PhoneCall, ShieldAlert, HeartHandshake, ExternalLink } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="crisis-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="crisis-modal-content"
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="crisis-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-stone-900">선생님을 위한 공공 전문 지원처</h3>
            <p className="text-xs text-stone-500">혼자 감당하기 벅찬 고통이나 위기 상황일 때 손을 내밀어 주세요.</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-stone-700">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <div className="flex items-center justify-between font-medium text-stone-900">
              <span className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                시·도교육청 교원치유지원센터
              </span>
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">교원 전용</span>
            </div>
            <p className="text-xs text-stone-500">
              교육활동 침해 피해 교원 심리상담, 법률 지원 및 치료비 지원
            </p>
            <p className="text-xs font-semibold text-amber-700 pt-1">
              소속 시도교육청 대표번호 또는 교원치유센터 누리집 참조
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <div className="flex items-center justify-between font-medium text-stone-900">
              <span className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                정신건강 위기상담전화
              </span>
              <span className="text-xs font-bold text-blue-600">국번없이 1577-0199</span>
            </div>
            <p className="text-xs text-stone-500">24시간 전문가 심리상담 및 위기개입 지원</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <div className="flex items-center justify-between font-medium text-stone-900">
              <span className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-rose-600" />
                자살예방 상담전화
              </span>
              <span className="text-xs font-bold text-rose-600">국번없이 109</span>
            </div>
            <p className="text-xs text-stone-500">24시간 운영, 심리적 한계에 부딪혔을 때 즉시 연결되는 긴급 전화</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <div className="flex items-center justify-between font-medium text-stone-900">
              <span className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                한국교원단체 및 교원노조 교권상담실
              </span>
              <span className="text-xs text-stone-500">법률/고소 대응</span>
            </div>
            <p className="text-xs text-stone-500">교총, 전교조, 교사노조 등 각 단체의 교권보호국 법률자문 연계</p>
          </div>
        </div>

        <div className="pt-2 border-t border-stone-100 flex justify-end">
          <button
            id="crisis-modal-confirm-btn"
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 text-white text-xs font-medium rounded-xl hover:bg-stone-900 transition-colors"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
