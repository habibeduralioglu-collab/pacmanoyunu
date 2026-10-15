import React, { useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  RotateCcw,
  Play,
  Heart,
  Trophy,
  ShieldAlert,
  Info,
  Maximize2,
  FileCode,
  CheckCircle2,
  Download
} from 'lucide-react';
import { PacmanCanvas } from './components/PacmanCanvas';
import { PedagogicalModal } from './components/PedagogicalModal';
import { EratosthenesModal } from './components/EratosthenesModal';
import { SingleHtmlExportModal } from './components/SingleHtmlExportModal';
import { sound } from './utils/soundEffects';
import { downloadGameHtml } from './utils/downloader';

export default function App() {
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [primesEaten, setPrimesEaten] = useState<number>(0);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [finalStats, setFinalStats] = useState<{ score: number; primes: number }>({ score: 0, primes: 0 });

  const [feedback, setFeedback] = useState<{
    title: string;
    detail: string;
    isPrime: boolean;
    equation?: string;
  } | null>(null);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showPedagogicalModal, setShowPedagogicalModal] = useState<boolean>(false);
  const [showEratosthenesModal, setShowEratosthenesModal] = useState<boolean>(false);
  const [showHtmlExportModal, setShowHtmlExportModal] = useState<boolean>(false);
  const [justDownloaded, setJustDownloaded] = useState<boolean>(false);

  // Doğrudan tek dosya HTML indir
  const handleDirectDownload = async () => {
    await downloadGameHtml(() => {
      setJustDownloaded(true);
      setTimeout(() => setJustDownloaded(false), 3000);
    });
  };

  // Ses aç/kapat
  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.setMuted(nextState);
  };

  // Tam ekran yap/çık
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Oyunu Başlat
  const handleStartGame = () => {
    sound.setMuted(isMuted);
    setIsGameRunning(true);
    setIsGameOver(false);
    setScore(0);
    setLives(3);
    setPrimesEaten(0);
    setFeedback({
      title: "OYUN BAŞLADI!",
      detail: "Labirentteki sarı Pac-Man'i yönlendirerek sadece ASAL SAYILARI ye. Hayaletlerden kaç!",
      isPrime: true
    });
  };

  // Oyun Bitti
  const handleGameOver = useCallback((finalScore: number, primesCount: number) => {
    setIsGameRunning(false);
    setIsGameOver(true);
    setFinalStats({ score: finalScore, primes: primesCount });
  }, []);

  // Yeniden Başlat
  const handleRestart = () => {
    handleStartGame();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-2 sm:p-4 md:p-6 select-none font-sans">
      {/* Üst Gezinme ve Başlık Bandı */}
      <header className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-3 mb-4 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/20 text-slate-950 font-black text-xl">
            C
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-yellow-400 tracking-wide flex items-center gap-2">
              PAC-MAN: ASAL SAYILAR
            </h1>
            <p className="text-xs text-slate-400">
              Türkiye Yüzyılı Maarif Modeli • 6. Sınıf Matematik
            </p>
          </div>
        </div>

        {/* Araç Çubuğu Butonları */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Birincil Doğrudan HTML İndir Butonu */}
          <button
            onClick={handleDirectDownload}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold transition-all shadow-md active:scale-95 ${
              justDownloaded
                ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/50 shadow-emerald-600/20'
            }`}
            title="Tek dosya pacman-asal-sayilar.html dosyasını bilgisayarına indir"
          >
            {justDownloaded ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <Download className="w-4 h-4 text-white" />}
            <span>{justDownloaded ? 'HTML İndirildi!' : 'HTML İndir'}</span>
          </button>

          <button
            onClick={() => setShowPedagogicalModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded-xl border border-yellow-500/30 transition-all font-semibold active:scale-95"
            title="TYMM 6. Sınıf Asal Sayı Kuralları"
          >
            <BookOpen className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">Konu Özeti</span>
          </button>

          <button
            onClick={() => setShowEratosthenesModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl border border-emerald-500/30 transition-all font-semibold active:scale-95"
            title="1-100 Eratosthenes Kalburu"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">1-100 Kalburu</span>
          </button>

          <button
            onClick={() => setShowHtmlExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-950/80 hover:bg-blue-900 text-blue-300 rounded-xl border border-blue-500/40 transition-all font-semibold active:scale-95"
            title="Tek Dosya HTML Kodunu İncele ve Kopyala"
          >
            <FileCode className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Kodu Gör</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-300 transition-colors"
            title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
            aria-label="Ses Ayarı"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={toggleFullScreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-300 transition-colors hidden sm:block"
            title="Tam Ekran"
            aria-label="Tam Ekran"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Gösterge Paneli (HUD) */}
      <div className="w-full max-w-[532px] grid grid-cols-3 gap-2 mb-3">
        {/* Skor */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400 font-semibold uppercase">Puan</span>
          </div>
          <span className="text-lg md:text-xl font-mono font-black text-yellow-400">
            {score}
          </span>
        </div>

        {/* Toplanan Asal */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400 font-semibold uppercase">Asal</span>
          </div>
          <span className="text-lg md:text-xl font-mono font-black text-emerald-400">
            {primesEaten}
          </span>
        </div>

        {/* Kalan Can */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-slate-400 font-semibold uppercase">Can</span>
          </div>
          <div className="flex gap-1 text-rose-500">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-all ${
                  i < lives ? 'fill-rose-500 text-rose-500 scale-105' : 'text-slate-700 opacity-40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hedef Hatırlatma Şeridi */}
      <div className="w-full max-w-[532px] bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-3 py-1.5 mb-3 flex items-center justify-between text-xs text-emerald-300 font-medium shadow-inner">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <strong>HEDEF:</strong> Labirentteki Sadece <strong>ASAL SAYILARI</strong> Ye!
        </span>
        <span className="text-[11px] text-emerald-400/80 bg-emerald-900/40 px-2 py-0.5 rounded">
          Asal: +10 | Bileşik: -5 & -1 Can
        </span>
      </div>

      {/* Oyun Sahnesi Alanı & Overlay Katmanları */}
      <div className="relative w-full max-w-[532px] flex flex-col items-center">
        {/* Canvas Oyunu */}
        <PacmanCanvas
          onScoreChange={setScore}
          onLivesChange={setLives}
          onPrimesEatenChange={setPrimesEaten}
          onFeedback={setFeedback}
          onGameOver={handleGameOver}
          isGameRunning={isGameRunning}
          onResetGame={handleRestart}
        />

        {/* BAŞLANGIÇ EKRANI OVERLAY */}
        {!isGameRunning && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20 border-4 border-yellow-500/40 shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 mb-3 shadow-lg shadow-yellow-500/20">
              <Play className="w-8 h-8 ml-1" />
            </div>

            <h2 className="text-2xl font-black text-yellow-400 tracking-wide mb-1 font-arcade">
              PAC-MAN ASAL
            </h2>
            <p className="text-xs text-slate-400 mb-4 max-w-sm">
              Labirentte dolaş, sayılar arasından yalnızca <strong>asal sayıları</strong> topla, puanları kap ve hayaletlere yakalanma!
            </p>

            {/* Hızlı Kurallar Kartı */}
            <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-left text-xs space-y-2 mb-5">
              <div className="flex items-start gap-2 text-emerald-300">
                <span className="text-sm">⭐</span>
                <span><strong>Asal Sayı Yersen:</strong> +10 Puan kazanırsın.</span>
              </div>
              <div className="flex items-start gap-2 text-rose-300">
                <span className="text-sm">⚠️</span>
                <span><strong>Bileşik Sayı veya 1 Yersen:</strong> -5 Puan ve 1 Can kaybedersin!</span>
              </div>
              <div className="flex items-start gap-2 text-amber-300">
                <span className="text-sm">💡</span>
                <span><strong>Altın Kural:</strong> 1 ASAL DEĞİLDİR! Çift sayılardan sadece 2 asaldır!</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleStartGame}
                className="px-8 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-base tracking-wider uppercase transition-all shadow-xl shadow-yellow-500/25 active:scale-95 flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                OYUNA BAŞLA
              </button>

              <button
                onClick={handleDirectDownload}
                className="px-5 py-3.5 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 border border-emerald-500/40"
                title="Tek parça HTML dosyasını hemen indir"
              >
                <Download className="w-4 h-4" />
                HTML Dosyasını İndir
              </button>
            </div>
          </div>
        )}

        {/* OYUN BİTTİ (GAME OVER) EKRANI OVERLAY */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20 border-4 border-rose-500/40 shadow-2xl animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 mb-3">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-rose-500 tracking-wide mb-1">
              OYUN BİTTİ!
            </h2>
            <p className="text-sm text-slate-300 mb-4">
              Canların tükendi. Tekrar denemek ister misin?
            </p>

            {/* Skor ve Başarı Kutusu */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Toplam Puan</div>
                <div className="text-xl font-bold font-mono text-yellow-400">{finalStats.score}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Toplanan Asal</div>
                <div className="text-xl font-bold font-mono text-emerald-400">{finalStats.primes}</div>
              </div>
            </div>

            {/* TYMM 6. Sınıf Eğitici Hatırlatma Mesajı (Zorunlu Kriter) */}
            <div className="w-full max-w-md bg-blue-950/60 border border-blue-500/40 rounded-xl p-3.5 text-left text-xs text-blue-200 mb-5 leading-relaxed">
              <div className="font-bold text-yellow-300 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>6. Sınıf TYMM Asal Sayı Özeti:</span>
              </div>
              <p className="text-slate-200">
                &quot;Unutma: 1&apos;den ve kendisinden başka böleni olmayan 1&apos;den büyük doğal sayılara <strong>asal sayı</strong> denir.&quot;
              </p>
              <ul className="mt-2 space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                <li><strong>1 sayısı asal sayı DEĞİLDİR!</strong></li>
                <li><strong>2 sayısı en küçük ve tek ÇİFT asal sayıdır!</strong></li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-sm tracking-wider uppercase transition-all shadow-xl shadow-yellow-500/25 active:scale-95 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                YENİDEN OYNA
              </button>

              <button
                onClick={handleDirectDownload}
                className="px-5 py-3 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 border border-emerald-500/40"
              >
                <Download className="w-4 h-4" />
                HTML İndir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Anlık Eğitici Geribildirim / Matematik İpucu Çubuğu */}
      <div className="w-full max-w-[532px] mt-3">
        <div
          className={`p-3 rounded-xl border transition-all text-xs flex items-start gap-2.5 shadow-lg ${
            feedback
              ? feedback.isPrime
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <Info
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              feedback ? (feedback.isPrime ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-500'
            }`}
          />
          <div className="flex-1">
            <div className="font-bold text-white text-xs flex items-center justify-between">
              <span>{feedback ? feedback.title : "Matematik Rehberi"}</span>
              {feedback?.equation && (
                <span className="font-mono text-[11px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 text-yellow-300">
                  {feedback.equation}
                </span>
              )}
            </div>
            <p className="mt-0.5 leading-relaxed text-slate-300 text-[11px] md:text-xs">
              {feedback
                ? feedback.detail
                : "Klavyedeki Yön Tuşları (veya WASD) ile Pac-Man'i yönlendir. Akıllı tahta veya telefonda alt D-Pad'i kullanabilirsin."}
            </p>
          </div>
        </div>
      </div>

      {/* Kontrol & Sınıf İpuçları Alt Bilgisi */}
      <footer className="w-full max-w-[532px] mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
        <span>Kontroller: <strong>↑ ↓ ← →</strong> veya <strong>W A S D</strong></span>
        <span>MEB Türkiye Yüzyılı Maarif Modeli Uyumludur</span>
      </footer>

      {/* Modallar */}
      <PedagogicalModal
        isOpen={showPedagogicalModal}
        onClose={() => setShowPedagogicalModal(false)}
      />

      <EratosthenesModal
        isOpen={showEratosthenesModal}
        onClose={() => setShowEratosthenesModal(false)}
      />

      <SingleHtmlExportModal
        isOpen={showHtmlExportModal}
        onClose={() => setShowHtmlExportModal(false)}
      />
    </div>
  );
}
