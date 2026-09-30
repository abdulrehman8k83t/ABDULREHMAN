import React, { useState } from 'react';
import { 
  FileCode, Copy, Check, ArrowLeft, Download, 
  Terminal, ShieldCheck, Cpu, Smartphone
} from 'lucide-react';
import { ANDROID_FILES, AndroidFileItem } from './androidCodeFiles';

interface AndroidCodeHubProps {
  onBackToApp: () => void;
}

export const AndroidCodeHub: React.FC<AndroidCodeHubProps> = ({ onBackToApp }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>('DownloadMediaWorker');
  const [copied, setCopied] = useState(false);

  const currentFile = ANDROID_FILES.find(f => f.id === selectedFileId) || ANDROID_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#0D0F14] text-[#F4F7FB] overflow-hidden select-none">
      
      {/* Top Header */}
      <div className="bg-[#151922] border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToApp}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1D2330] hover:bg-[#252C3D] border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#5B8CFF]" />
            <span>Return to Live Emulator</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden md:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">All-in-One Downloader</span>
              <span className="text-[10px] font-mono text-[#5B8CFF] bg-[#5B8CFF]/10 border border-[#5B8CFF]/20 px-2 py-0.5 rounded-full">
                Kotlin & Compose MAD
              </span>
            </div>
            <p className="text-xs text-slate-400">Production Android Studio Clean Architecture Source Code</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1D2330] hover:bg-[#252C3D] border border-slate-700 text-xs font-semibold text-white rounded-xl shadow-sm transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#5B8CFF]" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#5B8CFF] hover:bg-[#5B8CFF]/90 text-xs font-semibold text-white rounded-xl shadow-md shadow-[#5B8CFF]/25 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Sidebar File Tree & Code Viewer */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: File Tree */}
        <div className="w-80 bg-[#11141B] border-r border-slate-800/80 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Android Project Files</span>
            <span className="text-[10px] font-mono tabular-nums">{ANDROID_FILES.length} files</span>
          </div>

          <div className="p-3 flex flex-col gap-1">
            {ANDROID_FILES.map(file => {
              const isSelected = selectedFileId === file.id;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-[#5B8CFF]/15 border border-[#5B8CFF]/50 text-white shadow-sm'
                      : 'hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-[#5B8CFF]' : 'text-slate-500'}`} />
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate leading-tight">{file.fileName}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">{file.packagePath}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* MAD Architecture Principles Callout */}
          <div className="mt-auto p-4 border-t border-slate-800/80 bg-[#0D0F14]/60 text-xs text-slate-400 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modern Android Standards</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              • Clean Architecture + MVVM + Hilt<br />
              • Jetpack WorkManager chunked downloads<br />
              • Media3 ExoPlayer background playback<br />
              • Room DB reactive Flow caching<br />
              • MediaStore / SAF scoped storage
            </p>
          </div>
        </div>

        {/* Right Code Display Area */}
        <div className="flex-1 flex flex-col bg-[#0D0F14] overflow-hidden">
          
          {/* File Meta Header */}
          <div className="bg-[#151922]/60 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#5B8CFF] font-semibold">{currentFile.fileName}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">{currentFile.description}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">{currentFile.language}</span>
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed selection:bg-[#5B8CFF]/30">
            <pre className="text-slate-200 whitespace-pre">
              <code>{currentFile.code}</code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
