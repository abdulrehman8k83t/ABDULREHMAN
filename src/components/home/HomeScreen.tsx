import React, { useState, useEffect } from 'react';
import { 
  Link2, Clipboard, ArrowRight, HardDrive, Play, 
  RotateCcw, Sparkles, CheckCircle2, AlertTriangle, FileVideo, 
  FileAudio, FileText, ShieldCheck, Cpu, Radio, Share2,
  Search, X, Zap, DownloadCloud, History, Trash2, Film, Music
} from 'lucide-react';
import { inspectLink, detectVideoUrlInText } from '../../services/linkInspector';
import { LinkInspectionResult, DownloadItem, MediaItem } from '../../types';
import { DownloadOptionsSheet } from './DownloadOptionsSheet';
import { ComplianceModal } from './ComplianceModal';
import { downloadEngine } from '../../services/downloadEngine';
import { getStoredMedia } from '../../services/mediaStore';
import { formatBytes, formatDuration } from '../../utils/formatters';
import { translations } from '../../data/translations';

interface HomeScreenProps {
  onNavigateToDownloads: () => void;
  onPlayMedia: (media: MediaItem) => void;
  onOpenVault: () => void;
  onOpenTranscoder: () => void;
  onOpenP2PShare: () => void;
  onOpenBrowserSniffer: () => void;
  lang: 'en' | 'ur';
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToDownloads,
  onPlayMedia,
  onOpenVault,
  onOpenTranscoder,
  onOpenP2PShare,
  onOpenBrowserSniffer,
  lang,
}) => {
  const t = translations[lang];
  const [urlInput, setUrlInput] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<LinkInspectionResult | null>(null);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activePlatformFilter, setActivePlatformFilter] = useState<'all' | 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'pinterest'>('all');
  
  // Auto-detect Clipboard Video URL Chip State
  const [clipboardVideoChip, setClipboardVideoChip] = useState<{
    url: string;
    platformName: string;
    icon: string;
  } | null>(null);

  // Auto-check clipboard whenever app is opened or focused
  const checkClipboardForVideo = async () => {
    try {
      if (!navigator.clipboard?.readText) return;
      const text = await navigator.clipboard.readText();
      if (!text) return;

      const trimmed = text.trim();
      const dismissed = sessionStorage.getItem('dismissed_clip_url');
      if (dismissed && dismissed === trimmed) return;

      const detected = detectVideoUrlInText(trimmed);
      if (detected && detected.isValid) {
        setClipboardVideoChip(detected);
      }
    } catch {
      // Browser permission prompt or iframe policy
    }
  };

  useEffect(() => {
    // Initial check on mount
    checkClipboardForVideo();

    // Check on window focus and document visibilitychange
    const onFocus = () => {
      checkClipboardForVideo();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('allinone_user_searches_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term.trim(), ...recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase().trim())].slice(0, 4);
    setRecentSearches(updated);
    try {
      localStorage.setItem('allinone_user_searches_v1', JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('allinone_user_searches_v1');
  };

  const mediaList = getStoredMedia();
  const continueWatchingItems = mediaList.filter(m => m.lastPlayedPositionSecs > 0);
  const recentDownloads = downloadEngine.getItems().slice(0, 3);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrlInput(text.trim());
          handleInspect(text.trim());
        }
      }
    } catch {
      showToast('Could not read clipboard. Please paste manually.');
    }
  };

  const handleInspect = async (overrideUrl?: string) => {
    const target = (overrideUrl || urlInput).trim();
    if (!target) return;

    saveSearch(target);
    setIsInspecting(true);
    try {
      const result = await inspectLink(target);
      setInspectionResult(result);

      if (result.isValid && result.formats.length > 0) {
        setShowOptionsSheet(true);
      } else if (result.capability === 'DIRECT_DOWNLOAD_AVAILABLE') {
        setShowOptionsSheet(true);
      } else {
        setShowComplianceModal(true);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to inspect link.');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleStartDownload = (options: {
    format: any;
    fileName: string;
    destinationPath: string;
  }) => {
    if (!inspectionResult) return;

    const res = downloadEngine.addDownload({
      sourceUrl: options.format.url || inspectionResult.url,
      fileName: options.fileName,
      mimeType: inspectionResult.mimeType || 'video/mp4',
      sizeBytes: options.format.sizeBytes,
      destinationPath: options.destinationPath,
      category: options.format.isAudioOnly ? 'audio' : 'video',
    });

    setShowOptionsSheet(false);
    setUrlInput('');
    if (res.isDuplicate) {
      showToast(t.fileAlreadyExists);
    } else {
      showToast(`Added to download queue: ${options.fileName}`);
      onNavigateToDownloads();
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1D2330] border border-[#5B8CFF]/50 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#5B8CFF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero App Brand Bar */}
      <div className="bg-gradient-to-r from-[#151922] via-[#1D2330] to-[#151922] border border-slate-800/90 rounded-2xl p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <img 
            src="/src/assets/images/app_logo_icon_1790766892321.jpg"
            alt="App Icon"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-xl object-cover shadow-md border border-cyan-400/40"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">All-in-One Downloader</span>
              <span className="text-[9px] bg-[#5B8CFF]/20 text-[#5B8CFF] px-1.5 py-0.2 rounded font-mono font-bold">v2.4</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Direct Media · Vault · 4K Transcoder
            </span>
          </div>
        </div>

        {downloadEngine.isBatterySaverActive() ? (
          <div className="flex items-center gap-1 text-[10px] text-amber-300 font-medium bg-amber-500/15 border border-amber-500/30 px-2 py-1 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Saver Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Turbo Ready</span>
          </div>
        )}
      </div>

      {/* Advanced Capabilities Quick Row (Vault, Transcoder, P2P Share, Browser Sniffer) */}
      <div className="grid grid-cols-4 gap-1.5">
        <button
          onClick={onOpenVault}
          className="bg-[#151922] hover:bg-[#1D2330] border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-2 flex flex-col items-center gap-1 transition-all shadow-sm active:scale-95 text-center"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-white block">Vault</span>
            <span className="text-[8px] text-slate-400 font-mono">AES-256</span>
          </div>
        </button>

        <button
          onClick={onOpenTranscoder}
          className="bg-[#151922] hover:bg-[#1D2330] border border-slate-800 hover:border-[#5B8CFF]/40 rounded-2xl p-2 flex flex-col items-center gap-1 transition-all shadow-sm active:scale-95 text-center"
        >
          <div className="w-7 h-7 rounded-xl bg-[#5B8CFF]/10 border border-[#5B8CFF]/30 flex items-center justify-center text-[#5B8CFF]">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-white block">Transcoder</span>
            <span className="text-[8px] text-slate-400 font-mono">HEVC/AV1</span>
          </div>
        </button>

        <button
          onClick={onOpenP2PShare}
          className="bg-[#151922] hover:bg-[#1D2330] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-2 flex flex-col items-center gap-1 transition-all shadow-sm active:scale-95 text-center"
        >
          <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-white block">P2P Share</span>
            <span className="text-[8px] text-slate-400 font-mono">50MB/s</span>
          </div>
        </button>

        <button
          onClick={onOpenBrowserSniffer}
          className="bg-[#151922] hover:bg-[#1D2330] border border-slate-800 hover:border-pink-500/40 rounded-2xl p-2 flex flex-col items-center gap-1 transition-all shadow-sm active:scale-95 text-center"
        >
          <div className="w-7 h-7 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-white block">Sniffer</span>
            <span className="text-[8px] text-slate-400 font-mono">AdBlock</span>
          </div>
        </button>
      </div>

      {/* Subtle Auto-Detected Clipboard Confirmation Chip */}
      {clipboardVideoChip && (
        <div className="bg-gradient-to-r from-[#172033] via-[#1E293B] to-[#172033] border border-[#5B8CFF]/50 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-xl bg-[#5B8CFF]/15 border border-[#5B8CFF]/30 flex items-center justify-center text-sm shrink-0">
              {clipboardVideoChip.icon}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-tight">
                  {t.downloadThisVideo}
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
                  {clipboardVideoChip.platformName}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-[210px] mt-0.5">
                {clipboardVideoChip.url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                const u = clipboardVideoChip.url;
                setClipboardVideoChip(null);
                setUrlInput(u);
                handleInspect(u);
              }}
              className="px-3 py-1.5 bg-[#5B8CFF] hover:bg-[#5B8CFF]/90 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>{lang === 'ur' ? 'ڈاؤن لوڈ کریں' : 'Download'}</span>
            </button>

            <button
              onClick={() => {
                sessionStorage.setItem('dismissed_clip_url', clipboardVideoChip.url);
                setClipboardVideoChip(null);
              }}
              className="w-7 h-7 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Universal Search Engine & Direct Media Downloader */}
      <section className="bg-gradient-to-br from-[#151922] via-[#1D2330] to-[#151922] border border-slate-700/60 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col gap-3.5">
        
        {/* Top Title & Clipboard Paste */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Search className="w-4 h-4 text-[#5B8CFF]" />
            <span>Universal Search & Downloader</span>
          </div>
          <button
            onClick={handlePasteClipboard}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#5B8CFF]/15 hover:bg-[#5B8CFF]/25 border border-[#5B8CFF]/30 rounded-full text-xs text-[#5B8CFF] font-semibold transition-all active:scale-95"
            title="Paste from clipboard and extract"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>{t.pasteFromClipboard}</span>
          </button>
        </div>

        {/* Platform Selector Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {[
            { id: 'all', label: 'All Sources', icon: '⚡' },
            { id: 'youtube', label: 'YouTube', icon: '🔴' },
            { id: 'instagram', label: 'Instagram', icon: '📸' },
            { id: 'facebook', label: 'Facebook', icon: '📘' },
            { id: 'tiktok', label: 'TikTok', icon: '🎵' },
            { id: 'pinterest', label: 'Pinterest', icon: '📌' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setActivePlatformFilter(p.id as any)}
              className={`px-2.5 py-1 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                activePlatformFilter === p.id 
                  ? 'bg-[#5B8CFF] text-white shadow-sm font-bold' 
                  : 'bg-[#11141B] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Smart Universal Search Bar */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            {urlInput.toLowerCase().includes('youtube') || urlInput.toLowerCase().includes('youtu.be') ? (
              <span className="text-xs">🔴</span>
            ) : urlInput.toLowerCase().includes('instagram') ? (
              <span className="text-xs">📸</span>
            ) : urlInput.toLowerCase().includes('facebook') || urlInput.toLowerCase().includes('fb.') ? (
              <span className="text-xs">📘</span>
            ) : urlInput.toLowerCase().includes('tiktok') ? (
              <span className="text-xs">🎵</span>
            ) : urlInput.toLowerCase().includes('pinterest') || urlInput.toLowerCase().includes('pin.it') ? (
              <span className="text-xs">📌</span>
            ) : (
              <Search className="w-4 h-4 text-slate-500" />
            )}
          </div>

          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleInspect();
            }}
            placeholder={
              activePlatformFilter === 'youtube'
                ? "Paste YouTube video/Shorts URL or search..."
                : activePlatformFilter === 'instagram'
                ? "Paste Instagram Reel or Post URL..."
                : activePlatformFilter === 'facebook'
                ? "Paste Facebook Watch video URL..."
                : activePlatformFilter === 'tiktok'
                ? "Paste TikTok video URL..."
                : activePlatformFilter === 'pinterest'
                ? "Paste Pinterest video URL..."
                : "Paste Facebook, Instagram, YouTube link or search anything..."
            }
            className="w-full bg-[#0D0F14]/90 border border-slate-700/80 rounded-2xl pl-10 pr-24 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5B8CFF] transition-all shadow-inner"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {urlInput && (
              <button
                onClick={() => setUrlInput('')}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => handleInspect()}
              disabled={!urlInput.trim() || isInspecting}
              className="px-3.5 h-9 rounded-xl bg-[#5B8CFF] hover:bg-[#5B8CFF]/90 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-[#5B8CFF]/20"
            >
              {isInspecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Detection Card if link/query entered */}
        {urlInput.trim() && (
          <div className="bg-[#11141B] border border-slate-700/80 rounded-2xl p-2.5 flex items-center justify-between animate-in fade-in slide-in-from-top-1 text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="text-base">
                {urlInput.toLowerCase().includes('youtube') || urlInput.toLowerCase().includes('youtu.be') ? '🔴'
                 : urlInput.toLowerCase().includes('instagram') ? '📸'
                 : urlInput.toLowerCase().includes('facebook') || urlInput.toLowerCase().includes('fb.') ? '📘'
                 : urlInput.toLowerCase().includes('tiktok') ? '🎵'
                 : urlInput.toLowerCase().includes('pinterest') || urlInput.toLowerCase().includes('pin.it') ? '📌'
                 : urlInput.toLowerCase().includes('twitter') || urlInput.toLowerCase().includes('x.com') ? '✖'
                 : '⚡'}
              </span>
              <div className="truncate">
                <span className="text-white font-bold block truncate">
                  {urlInput.toLowerCase().includes('youtube') || urlInput.toLowerCase().includes('youtu.be') ? 'YouTube 4K & MP3 Stream'
                   : urlInput.toLowerCase().includes('instagram') ? 'Instagram Reel & Post Video'
                   : urlInput.toLowerCase().includes('facebook') || urlInput.toLowerCase().includes('fb.') ? 'Facebook Watch HD Video'
                   : urlInput.toLowerCase().includes('tiktok') ? 'TikTok Clean HD (No Watermark)'
                   : urlInput.toLowerCase().includes('pinterest') ? 'Pinterest HD Video'
                   : urlInput.toLowerCase().includes('twitter') || urlInput.toLowerCase().includes('x.com') ? 'X / Twitter Broadcast'
                   : 'Universal Media Direct Match'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  Ready to download in 1080p, 720p, 480p, or MP3 Audio
                </span>
              </div>
            </div>

            <button
              onClick={() => handleInspect()}
              disabled={isInspecting}
              className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-[11px] shrink-0 flex items-center gap-1 active:scale-95 transition-all"
            >
              <span>Get Options</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* User's Recent Searches & Links (History) */}
        {recentSearches.length > 0 && !urlInput && (
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <History className="w-3 h-3 text-[#5B8CFF]" />
                <span>Recent Downloads & Searches</span>
              </span>
              <button
                onClick={clearRecentSearches}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUrlInput(term);
                    handleInspect(term);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[#11141B] border border-slate-800 hover:border-[#5B8CFF]/50 text-slate-300 hover:text-white text-[11px] transition-colors flex items-center gap-1 max-w-[200px] truncate"
                >
                  <span className="truncate">{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Supported formats helper badge row */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
          <span>Supported: 1080p, 720p, 480p, MP3 (320k), M4A</span>
          <span className="text-[#5B8CFF] font-semibold">Zero Login · Direct Stream</span>
        </div>
      </section>

      {/* Storage Gauge Card */}
      <section className="bg-[#151922] border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>{t.storageUsage}</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            48.2 GB {t.storageFree} 128 GB
          </span>
        </div>

        {/* Progress meter */}
        <div className="w-full bg-[#1D2330] rounded-full h-2 overflow-hidden flex">
          <div className="bg-[#5B8CFF] h-full" style={{ width: '45%' }} title="App System" />
          <div className="bg-[#9B7BFF] h-full" style={{ width: '18%' }} title="Media Downloads" />
          <div className="bg-slate-700 h-full" style={{ width: '37%' }} title="Free Space" />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#5B8CFF]" /> System
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#9B7BFF]" /> Media Storage (14.8 GB)
            </span>
          </div>
          <span className="text-emerald-400 font-medium">Healthy</span>
        </div>
      </section>

      {/* Continue Watching Row */}
      {continueWatchingItems.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-[#5B8CFF]" />
              <span>{t.continueWatching}</span>
            </h3>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {continueWatchingItems.map(item => {
              const progressPct = item.durationSecs 
                ? Math.min(100, Math.round((item.lastPlayedPositionSecs / item.durationSecs) * 100))
                : 25;

              return (
                <div
                  key={item.id}
                  onClick={() => onPlayMedia(item)}
                  className="w-48 bg-[#151922] border border-slate-800 hover:border-[#5B8CFF]/50 rounded-2xl overflow-hidden shrink-0 cursor-pointer transition-all hover:scale-[1.02] shadow-md group flex flex-col"
                >
                  <div className="relative h-28 bg-[#1D2330] overflow-hidden">
                    {item.thumbnail ? (
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <FileVideo className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-[#5B8CFF] text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      </div>
                    </div>
                    {/* Resume position bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                      <div className="bg-[#5B8CFF] h-full" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 flex flex-col">
                    <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                    <span className="text-[11px] text-[#5B8CFF] font-medium mt-1">
                      {t.resumedFrom} {formatDuration(item.lastPlayedPositionSecs)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Downloads Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {t.recentDownloads}
          </h3>
          <button
            onClick={onNavigateToDownloads}
            className="text-xs text-[#5B8CFF] hover:underline font-medium"
          >
            View Queue
          </button>
        </div>

        {recentDownloads.length === 0 ? (
          <div className="bg-[#151922] border border-slate-800/80 rounded-2xl p-6 text-center text-xs text-slate-400">
            {t.noRecentDownloads}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentDownloads.map(dl => (
              <div
                key={dl.id}
                onClick={onNavigateToDownloads}
                className="bg-[#151922] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-[#1D2330] border border-slate-700 flex items-center justify-center text-[#5B8CFF] shrink-0">
                    {dl.category === 'audio' ? <FileAudio className="w-4 h-4" /> : <FileVideo className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-white truncate">{dl.fileName}</h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {formatBytes(dl.sizeBytes)} · Status: <span className="capitalize text-slate-300 font-medium">{dl.status}</span>
                    </p>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-400 shrink-0 ml-2">
                  {dl.status === 'completed' ? (
                    <span className="text-emerald-400 text-[11px]">Ready</span>
                  ) : (
                    <span className="text-[#5B8CFF] text-[11px]">{Math.round((dl.downloadedBytes / dl.sizeBytes) * 100)}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Download Options Bottom Sheet */}
      {showOptionsSheet && inspectionResult && (
        <DownloadOptionsSheet
          inspection={inspectionResult}
          onConfirm={handleStartDownload}
          onClose={() => setShowOptionsSheet(false)}
          lang={lang}
        />
      )}

      {/* Compliance / Policy Restriction Modal */}
      {showComplianceModal && inspectionResult && (
        <ComplianceModal
          inspection={inspectionResult}
          onClose={() => setShowComplianceModal(false)}
          lang={lang}
        />
      )}
    </div>
  );
};
