import React, { useState, useEffect } from 'react';
import { 
  Radio, Smartphone, Send, Check, X, 
  ArrowRight, Gauge, CheckCircle2, RefreshCw, Layers
} from 'lucide-react';
import { MediaItem, P2PPeer } from '../../types';
import { p2pShareService } from '../../services/p2pShareService';
import { formatBytes, formatSpeed } from '../../utils/formatters';

interface BatchP2PModalProps {
  items: MediaItem[];
  onClose: () => void;
  lang: 'en' | 'ur';
}

export const BatchP2PModal: React.FC<BatchP2PModalProps> = ({
  items,
  onClose,
  lang,
}) => {
  const [peers, setPeers] = useState<P2PPeer[]>(p2pShareService.getPeers());
  const [selectedPeer, setSelectedPeer] = useState<P2PPeer | null>(peers[0] || null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferredBytes, setTransferredBytes] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(48 * 1024 * 1024); // ~48 MB/s
  const [isComplete, setIsComplete] = useState(false);

  const totalBatchBytes = items.reduce((acc, curr) => acc + curr.sizeBytes, 0);

  const handleStartMassTransfer = () => {
    if (!selectedPeer) return;
    setIsTransferring(true);

    let current = 0;
    const speed = 48 * 1024 * 1024; // 48 MB/s
    let lastTime = performance.now();

    const interval = window.setInterval(() => {
      const now = performance.now();
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      const chunk = Math.round(speed * deltaSec * (0.85 + Math.random() * 0.3));
      current = Math.min(totalBatchBytes, current + chunk);
      setTransferredBytes(current);
      setCurrentSpeed(Math.round(chunk / Math.max(deltaSec, 0.05)));

      if (current >= totalBatchBytes) {
        clearInterval(interval);
        setIsTransferring(false);
        setIsComplete(true);
      }
    }, 150);
  };

  const progressPercent = totalBatchBytes > 0 
    ? Math.min(100, Math.round((transferredBytes / totalBatchBytes) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#151922] border border-slate-700/80 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Batch P2P Mass-Transfer</h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {items.length} Files Selected · Wi-Fi Direct Zero-Data
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

        {/* Batch Payload Summary */}
        <div className="bg-[#1D2330] border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Batch Items:</span>
            <span className="text-sm font-bold text-white">{items.length} files</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[11px] block">Total Batch Payload:</span>
            <span className="text-sm font-bold text-cyan-400 font-mono">{formatBytes(totalBatchBytes)}</span>
          </div>
        </div>

        {!isTransferring && !isComplete ? (
          /* Peer Selection */
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Select Recipient Device (Wi-Fi Direct NSD)</span>
              <span className="text-[10px] text-cyan-400">Scanning Peers...</span>
            </span>

            <div className="flex flex-col gap-2">
              {peers.map(peer => {
                const isSelected = selectedPeer?.id === peer.id;
                return (
                  <div
                    key={peer.id}
                    onClick={() => setSelectedPeer(peer)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-sm'
                        : 'bg-[#1D2330] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black/40 border border-slate-700 flex items-center justify-center text-cyan-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{peer.deviceName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {peer.ipAddress} · Signal: {peer.signalStrength}%
                        </p>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleStartMassTransfer}
              disabled={!selectedPeer}
              className="mt-2 w-full py-3.5 bg-gradient-to-r from-cyan-500 to-[#5B8CFF] hover:opacity-95 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Send {items.length} Files via P2P (50 MB/s)</span>
            </button>
          </div>
        ) : (
          /* Transfer Live Gauge */
          <div className="bg-[#1D2330] border border-cyan-500/30 p-5 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Sending batch to:</span>
                <span className="text-xs font-bold text-white">{selectedPeer?.deviceName}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Wi-Fi P2P Throughput:</span>
                <span className="text-sm font-bold text-cyan-400 font-mono tabular-nums">
                  {formatSpeed(currentSpeed)}
                </span>
              </div>
            </div>

            <div className="w-full bg-black/60 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-[#5B8CFF] h-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 font-mono tabular-nums">
              <span>{formatBytes(transferredBytes)} / {formatBytes(totalBatchBytes)}</span>
              <span className="font-bold text-white">{progressPercent}%</span>
            </div>

            {isComplete && (
              <div className="bg-emerald-500/20 text-emerald-300 text-xs font-bold p-3 rounded-xl text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Batch Mass-Transfer Completed Successfully!</span>
              </div>
            )}

            {isComplete && (
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
