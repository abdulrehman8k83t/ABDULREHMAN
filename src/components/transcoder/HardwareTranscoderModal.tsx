import React, { useState, useEffect } from 'react';
import { 
  Cpu, HardDrive, Zap, Check, X, ArrowRight, 
  FileVideo, Sparkles, RefreshCw
} from 'lucide-react';
import { MediaItem, TranscodeJob } from '../../types';
import { transcoderEngine } from '../../services/transcoderEngine';
import { formatBytes } from '../../utils/formatters';

interface HardwareTranscoderModalProps {
  media: MediaItem;
  onClose: () => void;
  onTranscodeComplete: (newMedia: MediaItem) => void;
  lang: 'en' | 'ur';
}

export const HardwareTranscoderModal: React.FC<HardwareTranscoderModalProps> = ({
  media,
  onClose,
  onTranscodeComplete,
  lang,
}) => {
  const [targetCodec, setTargetCodec] = useState<'hevc' | 'av1' | 'h264'>('hevc');
  const [activeJob, setActiveJob] = useState<TranscodeJob | null>(null);
  const [jobs, setJobs] = useState<TranscodeJob[]>(transcoderEngine.getJobs());

  useEffect(() => {
    const unsub = transcoderEngine.subscribe(updated => {
      setJobs(updated);
      if (activeJob) {
        const found = updated.find(j => j.id === activeJob.id);
        if (found) setActiveJob(found);
      }
    });
    return unsub;
  }, [activeJob]);

  const compressionRatio = targetCodec === 'av1' ? 0.28 : targetCodec === 'hevc' ? 0.35 : 0.65;
  const estimatedSavedBytes = Math.round(media.sizeBytes * (1 - compressionRatio));
  const estimatedTargetSize = Math.round(media.sizeBytes * compressionRatio);

  const handleStartTranscode = () => {
    const job = transcoderEngine.startTranscoding(media, targetCodec, (newMedia) => {
      onTranscodeComplete(newMedia);
    });
    setActiveJob(job);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#151922] border border-slate-700/80 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5B8CFF]/15 border border-[#5B8CFF]/30 flex items-center justify-center text-[#5B8CFF]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">MediaCodec Transcoder</h3>
              <span className="text-[11px] text-slate-400 font-mono">Hardware-Accelerated Compression</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source File Card */}
        <div className="bg-[#1D2330] border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/40 border border-slate-700 flex items-center justify-center text-[#5B8CFF] shrink-0">
            <FileVideo className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate">{media.fileName}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Source Size: <strong className="text-slate-200">{formatBytes(media.sizeBytes)}</strong> · Format: H.264
            </p>
          </div>
        </div>

        {/* Codec Selection Tabs */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300">Target Container & Codec</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'hevc', name: 'HEVC / H.265', desc: 'Up to 65% space saved', badge: 'Fastest HW' },
              { id: 'av1', name: 'AV1 Master', desc: 'Up to 72% space saved', badge: 'Next-Gen' },
              { id: 'h264', name: 'H.264 High', desc: 'Max Compatibility', badge: 'Standard' }
            ].map(codec => (
              <button
                key={codec.id}
                onClick={() => setTargetCodec(codec.id as any)}
                disabled={activeJob?.status === 'processing'}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  targetCodec === codec.id
                    ? 'bg-[#5B8CFF]/15 border-[#5B8CFF] text-white shadow-sm'
                    : 'bg-[#1D2330] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono text-[#5B8CFF] block mb-1">{codec.badge}</span>
                  <span className="text-xs font-bold block">{codec.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block">{codec.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Compression Math Estimate */}
        <div className="bg-[#1D2330]/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Estimated Output Size:</span>
            <span className="text-base font-bold text-emerald-400 tabular-nums font-mono">
              {formatBytes(estimatedTargetSize)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">Storage Reclaimed:</span>
            <span className="text-xs font-semibold text-[#5B8CFF] tabular-nums">
              Save ~{formatBytes(estimatedSavedBytes)} ({Math.round((1 - compressionRatio) * 100)}%)
            </span>
          </div>
        </div>

        {/* Active Processing Bar or Start Button */}
        {activeJob?.status === 'processing' ? (
          <div className="flex flex-col gap-2 bg-[#1D2330] border border-slate-700 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#5B8CFF] animate-spin" />
                <span>Transcoding with MediaCodec...</span>
              </span>
              <span className="text-[#5B8CFF] font-bold tabular-nums">{activeJob.progress}%</span>
            </div>
            <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#5B8CFF] to-emerald-400 h-full transition-all duration-200"
                style={{ width: `${activeJob.progress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Zero-copy native stream muxing in progress</span>
          </div>
        ) : activeJob?.status === 'completed' ? (
          <div className="flex flex-col gap-2 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-center">
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Transcode Complete! File added to Library.</span>
            </span>
            <button
              onClick={onClose}
              className="mt-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartTranscode}
            className="w-full py-3.5 bg-gradient-to-r from-[#5B8CFF] to-[#9B7BFF] hover:opacity-95 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#5B8CFF]/25 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Start Hardware Transcode</span>
          </button>
        )}

      </div>
    </div>
  );
};
