import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Loader2, RefreshCw, X } from 'lucide-react';
import { analyzeBusinessCardImage } from '../services/geminiService';
import { BusinessCardData } from '../types';

interface CardScannerProps {
  onScanComplete: (data: Partial<BusinessCardData>, imageUrl: string) => void;
  onCancel: () => void;
}

export const CardScanner: React.FC<CardScannerProps> = ({ onScanComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => { stopCamera(); };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera initialization error:", err);
      setError("카메라를 실행할 수 없습니다. 권한을 확인하거나 갤러리를 이용해주세요.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && overlayRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const overlay = overlayRef.current;

      const videoRect = video.getBoundingClientRect();
      const overlayRect = overlay.getBoundingClientRect();

      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const videoRatio = video.videoWidth / video.videoHeight;
      const displayRatio = videoRect.width / videoRect.height;

      let renderWidth, renderHeight, renderX, renderY;

      if (displayRatio > videoRatio) {
        renderWidth = videoRect.width;
        renderHeight = videoRect.width / videoRatio;
        renderX = 0;
        renderY = (videoRect.height - renderHeight) / 2;
      } else {
        renderHeight = videoRect.height;
        renderWidth = videoRect.height * videoRatio;
        renderY = 0;
        renderX = (videoRect.width - renderWidth) / 2;
      }

      const scale = video.videoWidth / renderWidth;

      const overlayX = overlayRect.left - videoRect.left;
      const overlayY = overlayRect.top - videoRect.top;

      const sourceX = (overlayX - renderX) * scale;
      const sourceY = (overlayY - renderY) * scale;
      const sourceW = overlayRect.width * scale;
      const sourceH = overlayRect.height * scale;

      canvas.width = sourceW;
      canvas.height = sourceH;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        stopCamera();
        setPreviewUrl(imageDataUrl);
        processImage(imageDataUrl);
      }
    }
  };

  const processImage = async (base64String: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const extractedData = await analyzeBusinessCardImage(base64String);
      onScanComplete(extractedData, base64String);
    } catch (err) {
      console.error(err);
      setError("명함 인식에 실패했습니다. 다시 시도해주세요.");
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    stopCamera();
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewUrl(base64String);
      processImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const triggerGallery = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setIsAnalyzing(false);
    setError(null);
    startCamera();
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-14 pb-4 z-10">
        <button onClick={onCancel} className="p-2 text-white/60 hover:text-white transition-colors rounded-xl">
          <X size={22} />
        </button>
        <h2 className="text-sm font-semibold text-white/80">명함 스캔</h2>
        <div className="w-10"></div>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden mx-4 rounded-3xl bg-neutral-900">
        <canvas ref={canvasRef} className="hidden" />

        {previewUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-full object-contain" />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-md">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  <Loader2 className="animate-spin text-white" size={32} />
                </div>
                <p className="text-white/80 text-sm font-medium">AI가 명함을 분석 중...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              ref={overlayRef}
              className="relative z-10 w-[85%] max-w-sm aspect-[1.586/1] border-2 border-white/30 rounded-2xl flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
            >
              <p className="text-white/60 text-xs font-medium bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">명함을 맞춰주세요</p>
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg -mt-px -ml-px"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg -mt-px -mr-px"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg -mb-px -ml-px"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg -mb-px -mr-px"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute bottom-4 left-4 right-4 z-30 bg-red-500/90 text-white px-4 py-3 rounded-2xl text-sm text-center backdrop-blur-md">
            <p>{error}</p>
            <button onClick={handleReset} className="mt-2 text-white font-bold underline text-xs">다시 시도</button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-32 flex flex-col justify-center px-4">
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

        {!isAnalyzing && !previewUrl ? (
          <div className="flex justify-around items-center px-8">
            <button
              onClick={triggerGallery}
              className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <ImageIcon size={18} />
              </div>
              <span className="text-[10px]">갤러리</span>
            </button>

            <button
              onClick={handleCapture}
              className="w-18 h-18 bg-white rounded-full border-4 border-white/20 flex items-center justify-center active:scale-90 transition-transform"
              style={{ width: '72px', height: '72px' }}
            >
              <div className="w-14 h-14 rounded-full bg-white border-2 border-neutral-200"></div>
            </button>

            <div className="w-11"></div>
          </div>
        ) : (
          !isAnalyzing && (
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-2xl text-white text-sm font-medium hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <RefreshCw size={16} />
                다시 촬영
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};
