import React, { useState, useEffect, useRef } from 'react';
import { Facility, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { findFacilityByQrRef } from '../../services/qrService';
import { FACILITIES_DATA } from '../../data/facilitiesData';
import { X, Camera, AlertCircle, Scan, ArrowRight } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFacilityFound: (facility: Facility) => void;
  currentLanguage: Language;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onFacilityFound,
  currentLanguage,
}) => {
  if (!isOpen) return null;

  const t = translations[currentLanguage];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Initialize camera when opened
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
            setCameraActive(true);
          }
        })
        .catch(() => {
          setCameraError(t.qr.cameraErrorNotice);
          setCameraActive(false);
        });
    } else {
      setCameraError(t.qr.cameraErrorNotice);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [t.qr.cameraErrorNotice]);

  const handleResolveCode = (code: string) => {
    setInputError(null);
    let target = code.trim();

    // If it's a full URL e.g. http://localhost:5173/?facility=stall-food-101
    if (target.includes('facility=')) {
      try {
        const url = new URL(target, window.location.origin);
        const facilityParam = url.searchParams.get('facility');
        if (facilityParam) target = facilityParam;
      } catch (e) {
        // Continue with raw text
      }
    }

    const facility = findFacilityByQrRef(target);
    if (facility) {
      onFacilityFound(facility);
      onClose();
    } else {
      setInputError(t.qr.invalidQrNotice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-lg">{t.qr.scannerTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            {t.qr.scannerSubtitle}
          </p>

          {/* Viewfinder or Camera Feed */}
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border-2 border-dashed border-blue-400 flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 text-slate-400 space-y-2">
                <Camera className="w-8 h-8 mx-auto text-slate-500" />
                <p className="text-xs">{cameraError || 'Camera inactive'}</p>
              </div>
            )}

            {/* Target Reticle Overlay */}
            <div className="absolute inset-8 border-2 border-white/80 rounded-lg pointer-events-none shadow-sm flex items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-white/70 bg-black/40 px-2 py-0.5 rounded">
                Align QR Code
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-snug">
            {t.qr.scannerHelp}
          </div>

          {/* Manual Entry Form */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              {t.qr.enterCodeManual}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. stall-food-101 or QR-STALL-F101"
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleResolveCode(manualCode);
                }}
              />
              <button
                onClick={() => handleResolveCode(manualCode)}
                disabled={!manualCode.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <span>Find</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {inputError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{inputError}</span>
              </div>
            )}
          </div>

          {/* Quick-test Stall Buttons (For instant test verification) */}
          <div className="pt-2">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
              Quick QR Sign Samples for Testing:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FACILITIES_DATA.filter((f) => f.isStall).slice(0, 4).map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleResolveCode(f.id)}
                  className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors"
                >
                  {f.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
