import React, { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

export const InstallPwa: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);

    if (isIos && !isStandalone) {
      setTimeout(() => setShowIosPrompt(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowAndroidPrompt(false);
  };

  if (!showAndroidPrompt && !showIosPrompt) return null;

  return (
    <>
      {showAndroidPrompt && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60]">
          <button
            onClick={handleAndroidInstall}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm hover:bg-slate-800 transition-all active:scale-95"
          >
            <Download size={16} strokeWidth={2.5} />
            앱 설치하기
          </button>
        </div>
      )}

      {showIosPrompt && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-4">
          <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 p-5 relative">
            <button
              onClick={() => setShowIosPrompt(false)}
              className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download size={18} className="text-slate-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">앱으로 설치하세요</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  사파리 하단 <Share size={12} className="inline align-middle mx-0.5" /> 공유 버튼 →
                  <span className="font-semibold text-slate-600"> 홈 화면에 추가</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
