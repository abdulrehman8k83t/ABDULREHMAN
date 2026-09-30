import React from 'react';
import { ShieldAlert, ExternalLink, X, AlertCircle } from 'lucide-react';
import { LinkInspectionResult } from '../../types';
import { translations } from '../../data/translations';

interface ComplianceModalProps {
  inspection: LinkInspectionResult;
  onClose: () => void;
  lang: 'en' | 'ur';
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({
  inspection,
  onClose,
  lang,
}) => {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#151922] border border-slate-700/80 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
        
        {/* Header Icon & Title */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                {t.complianceNoticeTitle}
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {inspection.policyTitle || t.restrictedPlatform}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Domain Badge */}
        <div className="bg-[#1D2330] rounded-xl px-3 py-2 text-xs font-mono text-slate-300 flex items-center justify-between border border-slate-800">
          <span className="text-slate-400">Target Host:</span>
          <span className="text-amber-300 font-semibold">{inspection.domain}</span>
        </div>

        {/* Detailed Explanation */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="font-normal text-slate-200">
              {inspection.policyMessage}
            </p>
          </div>
        </div>

        {/* Rules Highlights */}
        <div className="text-[11px] text-slate-400 space-y-1.5 pl-1">
          <p>• Recognition does not equal authorization to extract media.</p>
          <p>• Digital Rights Management (DRM) and private accounts are never bypassed.</p>
          <p>• NovaDownload operates exclusively with authorized direct sources.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {inspection.fallbackAction && (
            <a
              href={inspection.fallbackAction.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#5B8CFF] hover:bg-[#5B8CFF]/90 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#5B8CFF]/25 transition-colors"
            >
              <span>{inspection.fallbackAction.label}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs transition-colors"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
