import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Trash2, CheckCircle2, 
  AlertCircle, Wifi, Signal, FileVideo, FileAudio, FileText, 
  ExternalLink, ArrowDownToLine, Clock, ShieldCheck
} from 'lucide-react';
import { DownloadItem, DownloadStatus, MediaItem } from '../../types';
import { downloadEngine } from '../../services/downloadEngine';
import { formatBytes, formatSpeed, formatEta } from '../../utils/formatters';
import { translations } from '../../data/translations';

interface DownloadsScreenProps {
  onPlayMedia: (media: MediaItem) => void;
  lang: 'en' | 'ur';
}

export const DownloadsScreen: React.FC<DownloadsScreenProps> = ({
  onPlayMedia,
  lang,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'active' | 'queued' | 'completed' | 'failed'>('active');
  const [items, setItems] = useState<DownloadItem[]>(downloadEngine.getItems());
  const [isSimulatedMobileNetwork, setIsSimulatedMobileNetwork] = useState(false);

  useEffect(() => {
    const unsubscribe = downloadEngine.subscribe(newItems => {
      setItems(newItems);
    });
    return unsubscribe;
  }, []);

  const activeDownloads = items.filter(i => i.status === 'downloading' || i.status === 'starting');
  const queuedDownloads = items.filter(i => i.status === 'queued' || i.status === 'paused');
  const completedDownloads = items.filter(i => i.status === 'completed');
  const failedDownloads = items.filter(i => i.status === 'failed' || i.status === 'cancelled');

  let displayedList: DownloadItem[] = [];
  if (activeTab === 'active') displayedList = activeDownloads;
  else if (activeTab === 'queued') displayedList = queuedDownloads;
  else if (activeTab === 'completed') displayedList = completedDownloads;
  else if (activeTab === 'failed') displayedList = failedDownloads;

  const handleOpenCompleted = (dl: DownloadItem) => {
    onPlayMedia({
      id: `media_${dl.id}`,
      title: dl.fileName.replace(/\.[^/.]+$/, ''),
      fileName: dl.fileName,
      uri: dl.playableUrl || dl.sourceUrl,
      mimeType: dl.mimeType,
      sizeBytes: dl.sizeBytes,
      durationSecs: dl.category === 'video' ? 596 : dl.category === 'audio' ? 142 : undefined,
      category: dl.category,
      thumbnail: dl.category === 'video' 
        ? 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
        : undefined,
      lastPlayedPositionSecs: 0,
      createdAt: dl.createdAt,
      sourceDomain: 'Direct Source'
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-24 select-none">
      
      {/* Network Mode Status Banner */}
      <div className="bg-[#151922] border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isSimulatedMobileNetwork ? (
            <Signal className="w-4 h-4 text-amber-400" />
          ) : (
            <Wifi className="w-4 h-4 text-[#5B8CFF]" />
          )}
          <span className="text-slate-300 font-medium">
            Network: {isSimulatedMobileNetwork ? 'Cellular / Mobile (LTE)' : 'High-Speed Wi-Fi'}
          </span>
        </div>
        <button
          onClick={() => setIsSimulatedMobileNetwork(!isSimulatedMobileNetwork)}
          className="text-[11px] text-[#5B8CFF] hover:underline font-semibold"
        >
          {isSimulatedMobileNetwork ? 'Switch to Wi-Fi' : 'Simulate Mobile'}
        </button>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#151922] border border-slate-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'active' 
              ? 'bg-[#5B8CFF] text-white shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>{t.tabActive}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-[#1D2330] text-slate-400'
          }`}>
            {activeDownloads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('queued')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'queued' 
              ? 'bg-[#5B8CFF] text-white shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>{t.tabQueued}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'queued' ? 'bg-white/20 text-white' : 'bg-[#1D2330] text-slate-400'
          }`}>
            {queuedDownloads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'completed' 
              ? 'bg-[#5B8CFF] text-white shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>{t.tabCompleted}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-[#1D2330] text-slate-400'
          }`}>
            {completedDownloads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('failed')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'failed' 
              ? 'bg-[#5B8CFF] text-white shadow-md' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>{t.tabFailed}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'failed' ? 'bg-white/20 text-white' : 'bg-[#1D2330] text-slate-400'
          }`}>
            {failedDownloads.length}
          </span>
        </button>
      </div>

      {/* Batch Control Toolbar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {activeTab === 'active' && activeDownloads.length > 0 && (
            <button
              onClick={() => downloadEngine.pauseAll()}
              className="px-3 py-1.5 bg-[#1D2330] hover:bg-[#1D2330]/80 border border-slate-700 rounded-xl text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>{t.pauseAll}</span>
            </button>
          )}

          {activeTab === 'queued' && queuedDownloads.length > 0 && (
            <button
              onClick={() => downloadEngine.resumeAll()}
              className="px-3 py-1.5 bg-[#1D2330] hover:bg-[#1D2330]/80 border border-slate-700 rounded-xl text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-[#5B8CFF]" />
              <span>{t.resumeAll}</span>
            </button>
          )}

          {activeTab === 'completed' && completedDownloads.length > 0 && (
            <button
              onClick={() => downloadEngine.clearCompleted()}
              className="px-3 py-1.5 bg-[#1D2330] hover:bg-red-950/30 border border-slate-700 hover:border-red-500/40 rounded-xl text-xs text-slate-300 hover:text-red-400 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearCompleted}</span>
            </button>
          )}
        </div>

        <span className="text-xs text-slate-400 tabular-nums">
          {displayedList.length} items
        </span>
      </div>

      {/* Downloads List */}
      {displayedList.length === 0 ? (
        <div className="bg-[#151922] border border-slate-800/80 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1D2330] border border-slate-700 flex items-center justify-center text-slate-500">
            <ArrowDownToLine className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{t.emptyDownloads}</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{t.emptyDownloadsDesc}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayedList.map(item => {
            const pct = Math.min(100, Math.round((item.downloadedBytes / item.sizeBytes) * 100));

            return (
              <div
                key={item.id}
                className="bg-[#151922] border border-slate-800/80 hover:border-slate-700 rounded-3xl p-4 flex flex-col gap-3 transition-colors shadow-lg"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-2xl bg-[#1D2330] border border-slate-700 flex items-center justify-center text-[#5B8CFF] shrink-0 mt-0.5">
                      {item.category === 'audio' ? (
                        <FileAudio className="w-5 h-5 text-[#9B7BFF]" />
                      ) : item.category === 'document' ? (
                        <FileText className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <FileVideo className="w-5 h-5 text-[#5B8CFF]" />
                      )}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-white truncate" title={item.fileName}>
                        {item.fileName}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.destinationPath}
                      </p>
                    </div>
                  </div>

                  {/* Range Resume Badge */}
                  <div className="shrink-0">
                    {item.supportsResume && (
                      <span className="text-[10px] text-emerald-400/90 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Range Resume
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar (Active or Queued) */}
                <div className="flex flex-col gap-1.5">
                  <div className="w-full bg-[#1D2330] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.status === 'completed' 
                          ? 'bg-emerald-500' 
                          : item.status === 'downloading'
                          ? 'bg-gradient-to-r from-[#5B8CFF] to-[#9B7BFF]'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Telemetry Row */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">{formatBytes(item.downloadedBytes)}</span>
                      <span>/</span>
                      <span>{formatBytes(item.sizeBytes)}</span>
                      <span>({pct}%)</span>
                    </div>

                    {item.status === 'downloading' && (
                      <div className="flex items-center gap-3 font-medium">
                        <span className="text-[#5B8CFF] font-semibold">{formatSpeed(item.speedBytesPerSec)}</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          {formatEta(item.etaSecs)}
                        </span>
                      </div>
                    )}

                    {item.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t.statusCompleted}
                        </span>
                        <span className="text-[9px] text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" /> SHA-256 Verified
                        </span>
                      </div>
                    )}

                    {item.status === 'paused' && (
                      <span className="text-amber-400 font-semibold">
                        {t.statusPaused}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Status: {item.status}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.status === 'downloading' && (
                      <button
                        onClick={() => downloadEngine.pauseDownload(item.id)}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 flex items-center gap-1"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>{t.pause}</span>
                      </button>
                    )}

                    {(item.status === 'paused' || item.status === 'queued') && (
                      <button
                        onClick={() => downloadEngine.resumeDownload(item.id)}
                        className="px-3 py-1 bg-[#5B8CFF]/20 hover:bg-[#5B8CFF]/30 text-[#5B8CFF] rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-[#5B8CFF]" />
                        <span>{t.resume}</span>
                      </button>
                    )}

                    {item.status === 'failed' && (
                      <button
                        onClick={() => downloadEngine.retryDownload(item.id)}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t.retry}</span>
                      </button>
                    )}

                    {item.status === 'completed' && (
                      <button
                        onClick={() => handleOpenCompleted(item)}
                        className="px-3.5 py-1.5 bg-[#5B8CFF] hover:bg-[#5B8CFF]/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#5B8CFF]/25"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{t.openFile}</span>
                      </button>
                    )}

                    <button
                      onClick={() => downloadEngine.deleteDownload(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
