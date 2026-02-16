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

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
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
      
      // Check if video is ready
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      // Calculate the scale of the displayed video (object-cover) relative to the source video
      const videoRatio = video.videoWidth / video.videoHeight;
      const displayRatio = videoRect.width / videoRect.height;

      let renderWidth, renderHeight, renderX, renderY;

      // Logic to determine how object-cover has scaled/positioned the video
      if (displayRatio > videoRatio) {
        // Display is wider than video: Video is scaled to match width, height is cropped
        renderWidth = videoRect.width;
        renderHeight = videoRect.width / videoRatio;
        renderX = 0;
        renderY = (videoRect.height - renderHeight) / 2;
      } else {
        // Display is taller than video: Video is scaled to match height, width is cropped
        renderHeight = videoRect.height;
        renderWidth = videoRect.height * videoRatio;
        renderY = 0;
        renderX = (videoRect.width - renderWidth) / 2;
      }

      // Calculate scale factor between Rendered pixels and Source pixels
      const scale = video.videoWidth / renderWidth;

      // Calculate Overlay position relative to the Rendered Video
      // (The overlay is inside the same container, so coordinate systems align relative to the container)
      const overlayX = overlayRect.left - videoRect.left;
      const overlayY = overlayRect.top - videoRect.top;

      // Map Overlay coordinates to Source Video coordinates
      // formula: (Coordinate - RenderOffset) * Scale
      const sourceX = (overlayX - renderX) * scale;
      const sourceY = (overlayY - renderY) * scale;
      const sourceW = overlayRect.width * scale;
      const sourceH = overlayRect.height * scale;

      // Set canvas size to the cropped region size
      canvas.width = sourceW;
      canvas.height = sourceH;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Draw only the portion of the video corresponding to the overlay
        context.drawImage(
            video, 
            sourceX, sourceY, sourceW, sourceH, // Source rect
            0, 0, sourceW, sourceH              // Destination rect
        );

        const imageDataUrl = canvas.toDataURL('image/jpeg');
        
        // Stop stream and show preview
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
        setError("명함 인식에 실패했습니다. 다시 시도하거나 직접 입력해주세요.");
        setIsAnalyzing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Ensure camera is stopped if we pick a file
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
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setIsAnalyzing(false);
    setError(null);
    startCamera();
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pt-4 z-10">
            <button onClick={onCancel} className="text-gray-300 hover:text-white p-2">
              <X size={24} />
            </button>
            <h2 className="text-lg font-medium">명함 스캔</h2>
            <div className="w-8"></div> {/* Spacer */}
        </div>

        {/* Main Viewfinder Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden rounded-2xl bg-gray-900">
            {/* Hidden Canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {previewUrl ? (
                // Captured Image Preview
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-full object-contain" />
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-20">
                            <Loader2 className="animate-spin text-brand-400 mb-3" size={48} />
                            <p className="text-brand-100 font-medium animate-pulse">AI가 명함을 분석 중입니다...</p>
                        </div>
                    )}
                </div>
            ) : (
                // Live Camera Feed
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                    {/* Video Element */}
                    <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Guide Overlay */}
                    <div 
                        ref={overlayRef}
                        className="relative z-10 w-full max-w-sm aspect-[1.586/1] border-2 border-dashed border-white/50 rounded-xl flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                    >
                        <p className="text-white/80 text-sm font-medium drop-shadow-md bg-black/20 px-3 py-1 rounded-full">명함을 사각형 안에 맞춰주세요</p>
                        
                        {/* Corner Markers */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-500 rounded-tl-lg -mt-0.5 -ml-0.5"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-500 rounded-tr-lg -mt-0.5 -mr-0.5"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-500 rounded-bl-lg -mb-0.5 -ml-0.5"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-500 rounded-br-lg -mb-0.5 -mr-0.5"></div>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute bottom-4 left-4 right-4 z-30 bg-red-900/80 text-red-100 px-4 py-3 rounded-lg text-sm text-center backdrop-blur-md border border-red-500/30">
                    <p>{error}</p>
                    <button 
                        onClick={handleReset}
                        className="mt-2 text-white font-bold underline"
                    >
                        다시 시도
                    </button>
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="h-32 flex flex-col justify-center">
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {!isAnalyzing && !previewUrl ? (
                <div className="flex justify-around items-center px-8">
                    {/* Gallery Button */}
                    <button 
                        onClick={triggerGallery}
                        className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors w-16"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-800/80 flex items-center justify-center border border-gray-600">
                            <ImageIcon size={20} />
                        </div>
                        <span className="text-[10px]">갤러리</span>
                    </button>

                    {/* Shutter Button */}
                    <button 
                        onClick={handleCapture}
                        className="w-20 h-20 bg-white rounded-full border-[6px] border-gray-300/30 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-black/10"></div>
                    </button>

                    {/* Spacer for layout balance */}
                     <div className="w-16"></div>
                </div>
            ) : (
                !isAnalyzing && (
                    <div className="flex justify-center">
                        <button 
                            onClick={handleReset}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-full text-white font-medium hover:bg-gray-700 transition-colors"
                        >
                            <RefreshCw size={18} />
                            다시 촬영하기
                        </button>
                    </div>
                )
            )}
        </div>
    </div>
  );
};