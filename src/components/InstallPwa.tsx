import React, { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

export const InstallPwa: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    // 1. Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // 2. Android: Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // 3. iOS: Detection logic (iPhone/iPad and not standalone)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    
    if (isIos && !isStandalone) {
      // Show iOS instruction after a short delay
      setTimeout(() => setShowIosPrompt(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowAndroidPrompt(false);
  };

  if (!showAndroidPrompt && !showIosPrompt) return null;

  return (
    <>
      {/* Android Install Button */}
      {showAndroidPrompt && (
        <div className="fixed top-4 right-4 z-[60]">
          <button
            onClick={handleAndroidInstall}
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-full shadow-xl font-bold hover:bg-brand-700 transition-all active:scale-95 animate-bounce border-2 border-white/20"
          >
            <Download size={18} strokeWidth={3} />
            앱 설치하기
          </button>
        </div>
      )}

      {/* iOS Install Instructions Banner */}
      {showIosPrompt && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 bg-white/95 backdrop-blur shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 animate-slide-up">
          <div className="max-w-md mx-auto relative">
            <button 
                onClick={() => setShowIosPrompt(false)} 
                className="absolute -top-2 -right-2 p-2 text-gray-400 hover:text-gray-600"
            >
                <X size={20} />
            </button>
            <div className="flex gap-4 items-start">
                <div className="bg-brand-100 p-3 rounded-xl text-brand-600">
                    <Download size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 mb-1">앱으로 설치하여 사용하세요</h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        사파리 하단의 <span className="inline-flex items-center align-middle mx-1"><Share size={14} /> 공유</span> 버튼을 누르고<br/>
                        <span className="font-semibold text-gray-800">'홈 화면에 추가'</span>를 선택하세요.
                    </p>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};