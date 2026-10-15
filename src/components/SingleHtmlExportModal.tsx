import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, ExternalLink, CheckCircle2 } from 'lucide-react';
import { downloadGameHtml } from '../utils/downloader';

interface SingleHtmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SingleHtmlExportModal: React.FC<SingleHtmlExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    await downloadGameHtml(() => {
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    });
  };

  const handleCopyCode = async () => {
    try {
      const res = await fetch('/pacman-asal-sayilar.html');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Kod panoya kopyalanamadı, lütfen İndir butonunu kullanın.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-xl border border-yellow-500/30">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-yellow-400">
              Tek Dosya HTML Kodunu Al
            </h2>
            <p className="text-xs text-slate-400">
              Sıfır harici kütüphane • Tek bir .html dosyasında tüm oyun, ses ve grafikler
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-5">
          Talebiniz doğrultusunda oyun; HTML, CSS ve Vanilla JavaScript olarak <strong>tek bir bağımsız .html dosyasında</strong> toplanmıştır. Hiçbir internet bağlantısı veya harici dosya olmadan doğrudan herhangi bir tarayıcıda çift tıklanarak çalıştırılabilir.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
          <div className="text-xs text-slate-400 mb-2 font-mono flex items-center justify-between">
            <span>Dosya Adı: pacman-asal-sayilar.html</span>
            <span className="text-emerald-400 font-bold">Hazır & Eksiksiz</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 ${
                downloaded
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {downloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>İndirildi (pacman-asal-sayilar.html)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>.HTML Dosyasını İndir</span>
                </>
              )}
            </button>
            <button
              onClick={handleCopyCode}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Tüm Kod Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-yellow-400" />
                  <span>Tek HTML Kodunu Kopyala</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <a
            href="/pacman-asal-sayilar.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-400 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Tek Sayfa Olarak Yeni Sekmede Aç
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
