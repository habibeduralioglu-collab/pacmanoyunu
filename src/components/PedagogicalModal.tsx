import React from 'react';
import { BookOpen, CheckCircle, XCircle, AlertTriangle, Sparkles, X } from 'lucide-react';
import { PRIMES_UP_TO_100 } from '../utils/mathUtils';

interface PedagogicalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PedagogicalModal: React.FC<PedagogicalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-yellow-500/60 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative text-slate-100">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Başlık */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-xl border border-yellow-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
              TYMM 6. Sınıf Asal Sayılar Rehberi
            </h2>
            <p className="text-xs text-slate-400">
              Türkiye Yüzyılı Maarif Modeli Matematik Müfredatı
            </p>
          </div>
        </div>

        {/* Ana Tanım Kutusu */}
        <div className="bg-blue-950/60 border border-blue-500/40 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2 text-blue-200">
            <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-sm md:text-base">
                Temel Asal Sayı Tanımı:
              </p>
              <p className="text-sm mt-1 text-blue-100 leading-relaxed font-sans">
                <strong>1&apos;den ve kendisinden başka pozitif böleni (çarpanı) olmayan, 1&apos;den büyük doğal sayılara ASAL SAYI denir.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* 3 Altın Kural */}
        <h3 className="text-sm font-bold tracking-wider text-slate-300 uppercase mb-3 flex items-center gap-2">
          <span>Öğrencilerin En Çok Yanıldığı 3 Altın Kural</span>
        </h3>

        <div className="space-y-3 mb-6">
          {/* Kural 1 */}
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3.5 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold text-red-300">1 Sayısı Asal Sayı DEĞİLDİR!</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Bir sayının asal olması için &quot;tam olarak 2 farklı pozitif böleni&quot; olmalıdır. 1 sayısının tek böleni (sadece 1) olduğu için asal sayı kabul edilmez. Oyunda 1 yerseniz can ve puan kaybedersiniz!
              </p>
            </div>
          </div>

          {/* Kural 2 */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold text-emerald-300">2 En Küçük ve TEK ÇİFT Asal Sayıdır!</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                2&apos;den büyük tüm çift sayılar (4, 6, 8, 10, 12...) 2&apos;ye bölündüğü için asal olamaz. Bu nedenle 2, hem en küçük asal sayıdır hem de çift olan tek asal sayıdır.
              </p>
            </div>
          </div>

          {/* Kural 3 */}
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold text-amber-300">Tuzak Tek Sayılara Dikkat Edin (9, 15, 21, 27, 33, 91)!</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Her tek sayı asal değildir! Örneğin <strong>9 = 3 × 3</strong>, <strong>15 = 3 × 5</strong>, <strong>21 = 3 × 7</strong>, <strong>91 = 7 × 13</strong> bileşik sayılardır.
              </p>
            </div>
          </div>
        </div>

        {/* 1-100 Arasındaki 25 Asal Sayı Listesi */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-xs uppercase tracking-wide text-yellow-400">
              1-100 Arasındaki Tüm Asal Sayılar (25 Adet)
            </span>
            <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
              Toplam: {PRIMES_UP_TO_100.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRIMES_UP_TO_100.map(num => (
              <span
                key={num}
                className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold"
              >
                {num}
              </span>
            ))}
          </div>
        </div>

        {/* Kapat Butonu */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg active:scale-95"
          >
            Anladım, Oyuna Dön
          </button>
        </div>
      </div>
    </div>
  );
};
