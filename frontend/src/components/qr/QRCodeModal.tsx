import React, { useState, useEffect } from 'react';
import { Facility, Language } from '../../types';
import { translations } from '../../i18n/translations';
import {
  generateFacilityQrDataUrl,
  buildFacilityDeepLink,
  openPrintableSignageWindow,
} from '../../services/qrService';
import { X, QrCode, Download, Printer, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: Facility | null;
  currentLanguage: Language;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  facility,
  currentLanguage,
}) => {
  if (!isOpen || !facility) return null;

  const t = translations[currentLanguage];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const deepLink = buildFacilityDeepLink(facility.id);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    generateFacilityQrDataUrl(facility)
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [facility]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(deepLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${facility.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;
    openPrintableSignageWindow(facility, qrDataUrl, currentLanguage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-lg">{t.qr.generatorTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {facility.category}
            </span>
            <h4 className="font-extrabold text-xl text-slate-900 mt-2">
              {facility.name[currentLanguage] || facility.name.en}
            </h4>
            <div className="text-xs font-mono font-bold text-slate-500 mt-0.5">
              Code ID: {facility.qrCodeId || facility.id}
            </div>
          </div>

          {/* QR Container */}
          <div className="inline-block p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-inner">
            {loading ? (
              <div className="w-64 h-64 flex items-center justify-center text-slate-400">
                <span className="animate-pulse font-semibold text-sm">Generating QR Code...</span>
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${facility.name.en}`}
                className="w-64 h-64 mx-auto block"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-red-500 text-sm">
                Failed to render QR Code
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            {t.qr.generatorSubtitle}
          </p>

          {/* Deep link URL chip */}
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl text-xs text-slate-600 border border-slate-200">
            <span className="truncate flex-1 font-mono text-[11px]">{deepLink}</span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1 flex-shrink-0"
              title="Copy URL"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="text-[11px] font-bold">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownload}
              disabled={!qrDataUrl}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{t.qr.downloadPng}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!qrDataUrl}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{t.qr.printSign}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
