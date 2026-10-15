import React, { useState } from 'react';
import { X, Filter, Sparkles, HelpCircle } from 'lucide-react';
import { isPrime, getFactors } from '../utils/mathUtils';

interface EratosthenesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EratosthenesModal: React.FC<EratosthenesModalProps> = ({ isOpen, onClose }) => {
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [highlightFilter, setHighlightFilter] = useState<'all' | 'primes' | 'evens' | 'multi3' | 'multi5'>('all');

  if (!isOpen) return null;

  const numbers = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 shadow-2xl relative text-slate-100">
        {/* Kapat */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Başlık */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-400">
              Eratosthenes Kalburu (1 - 100 Tablosu)
            </h2>
            <p className="text-xs text-slate-400">
              M.Ö. 200&apos;lerde Antik Yunan bilgini Eratosthenes tarafından geliştirilen asal sayı eleği
            </p>
          </div>
        </div>

        {/* Filtreleme Butonları */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          <span className="flex items-center gap-1 text-slate-400 py-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Vurgula:
          </span>
          <button
            onClick={() => setHighlightFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              highlightFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tüm Sayılar
          </button>
          <button
            onClick={() => setHighlightFilter('primes')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              highlightFilter === 'primes'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            }`}
          >
            Sadece Asallar (25 Adet)
          </button>
          <button
            onClick={() => setHighlightFilter('evens')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              highlightFilter === 'evens'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
            }`}
          >
            Çift Sayılar (2 hariç elenir)
          </button>
          <button
            onClick={() => setHighlightFilter('multi3')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              highlightFilter === 'multi3'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
            }`}
          >
            3&apos;ün Katları (3 hariç elenir)
          </button>
          <button
            onClick={() => setHighlightFilter('multi5')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              highlightFilter === 'multi5'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
            }`}
          >
            5&apos;in Katları (5 hariç elenir)
          </button>
        </div>

        {/* 10x10 Izgara Tablosu */}
        <div className="grid grid-cols-10 gap-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4 select-none">
          {numbers.map(num => {
            const isPrimeNum = isPrime(num);
            let isFiltered = false;

            if (highlightFilter === 'primes' && isPrimeNum) isFiltered = true;
            if (highlightFilter === 'evens' && num % 2 === 0) isFiltered = true;
            if (highlightFilter === 'multi3' && num % 3 === 0) isFiltered = true;
            if (highlightFilter === 'multi5' && num % 5 === 0) isFiltered = true;

            const isSelected = selectedNum === num;

            return (
              <button
                key={num}
                onClick={() => setSelectedNum(num)}
                className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'ring-2 ring-yellow-400 scale-105 z-10'
                    : ''
                } ${
                  num === 1
                    ? 'bg-red-950/70 text-red-400 line-through border border-red-500/30'
                    : isPrimeNum
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-black'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                } ${
                  isFiltered && highlightFilter !== 'all'
                    ? 'ring-2 ring-white scale-105 shadow-lg'
                    : ''
                }`}
                title={`Sayı: ${num}`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Seçilen Sayı Detay Kartı */}
        {selectedNum !== null ? (
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 mb-4 text-xs md:text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white text-base">
                İncelenen Sayı: <strong className="text-yellow-400">{selectedNum}</strong>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  selectedNum === 1
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : isPrime(selectedNum)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {selectedNum === 1
                  ? 'ASAL DEĞİL (ÖZEL DURUM)'
                  : isPrime(selectedNum)
                  ? 'ASAL SAYI'
                  : 'BİLEŞİK SAYI'}
              </span>
            </div>
            <p className="text-slate-300">
              <strong>Tüm Pozitif Bölenleri:</strong> {getFactors(selectedNum).join(', ')} (Toplam {getFactors(selectedNum).length} bölen)
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            Herhangi bir sayının çarpanlarını görmek için tablodaki kutucuğa tıklayabilirsiniz.
          </p>
        )}

        {/* Kapat Butonu */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-xs md:text-sm"
          >
            Tamam, Oyuna Dön
          </button>
        </div>
      </div>
    </div>
  );
};
