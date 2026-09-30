import React, { useState, useEffect } from 'react';
import { 
  Cpu, Check, X, ArrowRight, FileVideo, Sparkles, 
  RefreshCw, Layers, CheckCircle2, AlertCircle
} from 'lucide-react';
import { MediaItem } from '../../types';
import { transcoderEngine } from '../../services/transcoderEngine';
import { formatBytes } from '../../utils/formatters';

interface BatchTranscodeModalProps {
  items: MediaItem[];
  onClose: () => void;
  onBatchComplete: () => void;
  lang: 'en' | 'ur';
}

interface BatchQueueItem {
  media: MediaItem;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
}

export const BatchTranscodeModal: React.FC<BatchTranscodeModalProps> = ({
  items,
  onClose,
  onBatchComplete,
  lang,
}) => {
  const [targetCodec, setTargetCodec] = useState<'hevc' | 'av1' | 'h264'>('hevc');
  const [queue, setQueue] = useState<BatchQueueItem[]>(
    items.map(m => ({ media: m, status: 'pending', progress: 0 }))
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  const videoItems = queue.filter(q => q.media.category === 'video');
  const totalInputBytes = items.reduce((acc, curr) => acc + curr.sizeBytes, 0);
  const compressionRatio = targetCodec === 'av1' ? 0.28 : targetCodec === 'hevc' ? 0.35 : 0.65;
  const estimatedOutputBytes = Math.round(totalInputBytes * compressionRatio);
  const estimatedSavedBytes = Math.max(0, totalInputBytes - estimatedOutputBytes);

  const startBatch = () => {
    setIsProcessing(true);
    processNextItem(0);
  };

  const processNextItem = (index: number) => {
    if (index >= queue.length) {
      setIsProcessing(false);
      setIsAllCompleted(true);
      onBatchComplete();
      return;
    }

    setCurrentIndex(index);
    setQueue(prev => prev.map((q, i) => i === index ? { ...q, status: 'processing', progress: 0 } : q));

    const currentMedia = queue[index].media;
    let localProgress = 0;
    
    // Simulate real hardware MediaCodec progress
    const timer = setInterval(() => {
      localProgress += 10 + Math.random() * 12;
      if (localProgress >= 100) {
        clearInterval(timer);
        transcoderEngine.startTranscoding(currentMedia, targetCodec);
        setQueue(prev => prev.map((q, i) => i === index ? { ...q, status: 'completed', progress: 100 } : q));
        // Process next item in sequence
        setTimeout(() => processNextItem(index + 1), 300);
      } else {
        setQueue(prev => prev.map((q, i) => i === index ? { ...q, progress: Math.min(99, Math.round(localProgress)) } : q));
      }
    }, 200);
  };

  const overallProgress = Math.round(
    queue.reduce((acc, curr) => acc + curr.progress, 0) / Math.max(queue.length, 1)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#151922] border border-slate-700/80 rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5B8CFF]/15 border border-[#5B8CFF]/30 flex items-center justify-center text-[#5B8CFF]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Batch Hardware Transcoder</h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {items.length} items queued · MediaCodec HW Acceleration
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Codec Selection */}
        {!isProcessing && !isAllCompleted && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300">Choose Batch Codec</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'hevc', name: 'HEVC (H.265)', desc: '65% space saved', badge: 'HW Optimized' },
                { id: 'av1', name: 'AV1 Master', desc: '72% space saved', badge: 'Maximum' },
                { id: 'h264', name: 'H.264 High', desc: '35% space saved', badge: 'Universal' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setTargetCodec(c.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    targetCodec === c.id
                      ? 'bg-[#5B8CFF]/15 border-[#5B8CFF] text-white shadow-sm'
                      : 'bg-[#1D2330] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-mono text-[#5B8CFF] block">{c.badge}</span>
                    <span className="text-xs font-bold block mt-0.5">{c.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Batch Savings Metrics Card */}
        <div className="bg-[#1D2330]/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Current Payload:</span>
            <span className="text-sm font-bold text-white font-mono">{formatBytes(totalInputBytes)}</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500" />

          <div>
            <span className="text-slate-400 text-[11px] block">Estimated Compressed:</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{formatBytes(estimatedOutputBytes)}</span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 text-[11px] block">Total Space Reclaimed:</span>
            <span className="text-xs font-bold text-[#5B8CFF]">~{formatBytes(estimatedSavedBytes)}</span>
          </div>
        </div>

        {/* Overall Batch Progress */}
        {(isProcessing || isAllCompleted) && (
          <div className="bg-[#1D2330] border border-slate-700/80 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                {isAllCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-[#5B8CFF] animate-spin" />
                )}
                <span>{isAllCompleted ? 'Batch Transcoding Complete!' : `Processing item ${currentIndex + 1} of ${queue.length}...`}</span>
              </span>
              <span className="text-sm font-bold text-[#5B8CFF] font-mono tabular-nums">{overallProgress}%</span>
            </div>

            <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#5B8CFF] to-emerald-400 h-full transition-all duration-200"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Queue Items List */}
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
          {queue.map((item, idx) => (
            <div
              key={item.media.id}
              className="bg-[#1D2330] border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-black/40 border border-slate-700 flex items-center justify-center text-[#5B8CFF] shrink-0">
                  <FileVideo className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="font-semibold text-white block text-[11px] truncate">{item.media.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatBytes(item.media.sizeBytes)} · {item.media.category}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {item.status === 'pending' && (
                  <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-md">Pending</span>
                )}
                {item.status === 'processing' && (
                  <span className="text-[10px] text-[#5B8CFF] font-mono font-bold bg-[#5B8CFF]/15 px-2 py-0.5 rounded-md tabular-nums">
                    {item.progress}%
                  </span>
                )}
                {item.status === 'completed' && (
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3" /> Done
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        {!isProcessing && !isAllCompleted ? (
          <button
            onClick={startBatch}
            className="w-full py-3.5 bg-gradient-to-r from-[#5B8CFF] to-[#9B7BFF] hover:opacity-95 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#5B8CFF]/25 active:scale-95 transition-all"
          >
            <Cpu className="w-4 h-4" />
            <span>Start Batch Transcode ({items.length} Files)</span>
          </button>
        ) : isAllCompleted ? (
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>Finish & Return to Library</span>
          </button>
        ) : null}

      </div>
    </div>
  );
};
