import React, { useState, useEffect } from 'react';
import { 
  Wifi, Smartphone, Send, Check, X, 
  ArrowRight, Radio, Gauge
} from 'lucide-react';
import { MediaItem, P2PPeer, P2PTransferProgress } from '../../types';
import { p2pShareService } from '../../services/p2pShareService';
import { formatBytes, formatSpeed } from '../../utils/formatters';

interface P2PShareModalProps {
  media: MediaItem;
  onClose: () => void;
  lang: 'en' | 'ur';
}

export const P2PShareModal: React.FC<P2PShareModalProps> = ({
  media,
  onClose,
  lang,
}) => {
  const [peers, setPeers] = useState<P2PPeer[]>(p2pShareService.getPeers());
  const [transfer, setTransfer] = useState<P2PTransferProgress | null>(p2pShareService.getCurrentTransfer());
  const [selectedPeer, setSelectedPeer] = useState<P2PPeer | null>(peers[0] || null);

  useEffect(() => {
    const unsub = p2pShareService.subscribe(() => {
      setPeers(p2pShareService.getPeers());
      setTransfer(p2pShareService.getCurrentTransfer());
    });
    return unsub;
  }, []);

  const handleSend = () => {
    if (!selectedPeer) return;
    p2pShareService.startTransfer(media, selectedPeer);
  };

  const transferPct = transfer 
    ? Math.min(100, Math.round((transfer.transferredBytes / transfer.totalBytes) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#151922] border border-slate-700/80 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Local P2P Share</h3>
              <span className="text-[11px] text-slate-400 font-mono">Wi-Fi Direct · Zero-Data Transfer</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Media Item Card */}
        <div className="bg-[#1D2330] border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="truncate pr-2">
            <h4 className="text-xs font-bold text-white truncate">{media.fileName}</h4>
            <span className="text-[11px] text-slate-400 font-mono">{formatBytes(media.sizeBytes)}</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-full shrink-0">
            Offline P2P
          </span>
        </div>

        {/* Nearby Devices Discovery List */}
        {!transfer ? (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Nearby Devices Found (NSD / P2P)</span>
              <span className="text-[11px] text-cyan-400 font-normal">Scanning...</span>
            </span>

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
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
              onClick={handleSend}
              disabled={!selectedPeer}
              className="mt-2 w-full py-3.5 bg-gradient-to-r from-cyan-500 to-[#5B8CFF] hover:opacity-95 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Send File (Up to 50 MB/s)</span>
            </button>
          </div>
        ) : (
          /* Live Transfer Gauge & Progress */
          <div className="flex flex-col gap-4 bg-[#1D2330] border border-cyan-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Transferring to:</span>
                <span className="text-xs font-bold text-white">{transfer.peerName}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Wi-Fi Direct Speed:</span>
                <span className="text-sm font-bold text-cyan-400 font-mono tabular-nums">
                  {formatSpeed(transfer.speedBytesPerSec)}
                </span>
              </div>
            </div>

            <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-[#5B8CFF] h-full transition-all duration-150"
                style={{ width: `${transferPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 font-mono tabular-nums">
              <span>{formatBytes(transfer.transferredBytes)} / {formatBytes(transfer.totalBytes)}</span>
              <span className="font-bold text-white">{transferPct}%</span>
            </div>

            {transfer.status === 'completed' && (
              <div className="bg-emerald-500/20 text-emerald-300 text-xs font-bold p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Transfer Succeeded (Zero Data Consumed)</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
