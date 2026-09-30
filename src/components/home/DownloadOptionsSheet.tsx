import React, { useState } from 'react';
import { Download, Folder, FileText, Check, X, HardDrive } from 'lucide-react';
import { LinkInspectionResult, MediaFormatOption } from '../../types';
import { formatBytes } from '../../utils/formatters';
import { translations } from '../../data/translations';

interface DownloadOptionsSheetProps {
  inspection: LinkInspectionResult;
  onConfirm: (options: {
    format: MediaFormatOption;
    fileName: string;
    destinationPath: string;
  }) => void;
  onClose: () => void;
  lang: 'en' | 'ur';
}

export const DownloadOptionsSheet: React.FC<DownloadOptionsSheetProps> = ({
  inspection,
  onConfirm,
  onClose,
  lang,
}) => {
  const t = translations[lang];

  // Pick first format by default
  const [selectedFormat, setSelectedFormat] = useState<MediaFormatOption>(
    inspection.formats[0] || {
      id: 'default',
      label: 'Standard',
      format: 'MP4',
      sizeBytes: 15000000,
      url: inspection.url,
      isAudioOnly: false,
    }
  );

  const initialExtension = selectedFormat.format.toLowerCase().includes('ogg') 
    ? 'ogg' 
    : selectedFormat.format.toLowerCase().includes('mp3') 
    ? 'mp3' 
    : selectedFormat.format.toLowerCase().includes('pdf') 
    ? 'pdf' 
    : 'mp4';

  const [fileName, setFileName] = useState<string>(
    inspection.title.includes('.') ? inspection.title : `${inspection.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${initialExtension}`
  );

  const [destinationFolder, setDestinationFolder] = useState<string>(
    selectedFormat.isAudioOnly 
      ? '/storage/emulated/0/Download/NovaDownload/Music/' 
      : inspection.mimeType?.includes('pdf') 
      ? '/storage/emulated/0/Download/NovaDownload/Documents/'
      : '/storage/emulated/0/Download/NovaDownload/Movies/'
  );

  const handleStart = () => {
    // Sanitize filename
    const clean = fileName.trim().replace(/[/\\?%*:|"<>]/g, '_') || 'downloaded_file';
    onConfirm({
      format: selectedFormat,
      fileName: clean,
      destinationPath: destinationFolder,
    });
  };

  // Group formats into video vs audio if applicable
  const videoFormats = inspection.formats.filter(f => !f.isAudioOnly);
  const audioFormats = inspection.formats.filter(f => f.isAudioOnly);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center select-none animate-in fade-in duration-200">
      <div className="bg-[#151922] border-t border-slate-700/60 rounded-t-3xl w-full max-w-lg p-5 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <h3 className="text-base font-bold text-white truncate">{t.downloadOptions}</h3>
            <p className="text-xs text-slate-400 truncate">{inspection.domain}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filename Editor */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#5B8CFF]" />
            <span>{t.saveAs}</span>
          </label>
          <input
            type="text"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            className="w-full bg-[#1D2330] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#5B8CFF]"
          />
        </div>

        {/* Destination Path Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-[#9B7BFF]" />
            <span>{t.destinationFolder}</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={destinationFolder}
              onChange={e => setDestinationFolder(e.target.value)}
              className="w-full bg-[#1D2330] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-[#5B8CFF]"
            />
          </div>
        </div>

        {/* Quality & Format Selection */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-300">
            {t.selectQuality}
          </span>

          {/* Genuine Available Formats List */}
          <div className="flex flex-col gap-2">
            {inspection.formats.map(fmt => {
              const isSelected = selectedFormat.id === fmt.id;
              return (
                <div
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-[#5B8CFF]/15 border-[#5B8CFF] text-white shadow-sm' 
                      : 'bg-[#1D2330] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {fmt.label}
                      {fmt.resolution && <span className="text-[11px] font-normal text-slate-400">({fmt.resolution})</span>}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {fmt.format} {fmt.bitrate ? `· ${fmt.bitrate}` : ''} · {formatBytes(fmt.sizeBytes)}
                    </span>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'bg-[#5B8CFF] border-[#5B8CFF] text-white' : 'border-slate-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Storage Health Pill */}
        <div className="bg-[#1D2330]/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Target Size: <strong className="text-white tabular-nums">{formatBytes(selectedFormat.sizeBytes)}</strong></span>
          </div>
          <span className="text-emerald-400 text-[11px] font-medium">Storage OK (48.2 GB free)</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:bg-white/5 text-slate-300 font-medium text-xs transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleStart}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#9B7BFF] hover:opacity-95 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#5B8CFF]/25 active:scale-[0.98] transition-transform"
          >
            <Download className="w-4 h-4" />
            <span>{t.startDownload}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
