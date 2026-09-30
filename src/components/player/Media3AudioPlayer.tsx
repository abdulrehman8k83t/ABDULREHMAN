import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, 
  Volume2, VolumeX, ChevronDown, Music, RotateCcw
} from 'lucide-react';
import { MediaItem } from '../../types';
import { savePlaybackPosition, getPlaybackPosition } from '../../services/mediaStore';
import { formatDuration } from '../../utils/formatters';

interface Media3AudioPlayerProps {
  media: MediaItem;
  queue: MediaItem[];
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  lang: 'en' | 'ur';
}

export const Media3AudioPlayer: React.FC<Media3AudioPlayerProps> = ({
  media,
  onClose,
  onNext,
  onPrev,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isShuffle, setIsShuffle] = useState(false);

  // Load resume position
  useEffect(() => {
    const savedPos = getPlaybackPosition(media.id);
    if (savedPos > 2 && audioRef.current) {
      audioRef.current.currentTime = savedPos;
      setCurrentTime(savedPos);
    }
    // Attempt auto-play when item changes
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [media.id]);

  // MediaSession API integration for Android / Lock screen controls
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: media.title,
        artist: 'NovaDownload Audio',
        album: 'Local Media Library',
        artwork: [
          { src: media.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512&auto=format&fit=crop&q=80', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play();
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
        }
      });
      if (onNext) navigator.mediaSession.setActionHandler('nexttrack', onNext);
      if (onPrev) navigator.mediaSession.setActionHandler('previoustrack', onPrev);
    }
  }, [media, duration, onNext, onPrev]);

  // Periodic position saver
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        savePlaybackPosition(media.id, audioRef.current.currentTime);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [media.id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
      savePlaybackPosition(media.id, audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      savePlaybackPosition(media.id, newTime);
    }
  };

  const cycleRepeat = () => {
    setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={media.uri}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => {
          if (repeatMode === 'one' && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else if (onNext) {
            onNext();
          } else {
            setIsPlaying(false);
            savePlaybackPosition(media.id, 0);
          }
        }}
      />

      {/* Floating Bottom Mini-Bar (Default) */}
      {!isExpanded && (
        <div 
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-18 left-2 right-2 max-w-lg mx-auto z-40 bg-[#1D2330]/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between cursor-pointer select-none transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5B8CFF]/20 to-[#9B7BFF]/20 border border-[#5B8CFF]/30 flex items-center justify-center shrink-0 text-[#5B8CFF]">
              <Music className={`w-5 h-5 ${isPlaying ? 'animate-bounce' : ''}`} />
            </div>
            <div className="truncate">
              <h4 className="text-xs font-semibold text-white truncate">{media.title}</h4>
              <p className="text-[11px] text-slate-400 truncate">{media.sourceDomain} · {formatDuration(currentTime)} / {formatDuration(duration)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#5B8CFF] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Expanded Audio Sheet */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-[#0D0F14] flex flex-col justify-between p-6 select-none overflow-y-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsExpanded(false)}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <div className="text-center">
              <span className="text-[11px] font-semibold text-[#5B8CFF] uppercase tracking-wider">Playing From Library</span>
              <p className="text-xs text-slate-400 font-medium">Background Audio Service</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Central Album Artwork & Visualizer Wave */}
          <div className="flex flex-col items-center justify-center my-auto py-8">
            <div className="relative w-56 h-56 rounded-3xl bg-gradient-to-br from-[#1D2330] via-[#151922] to-[#252C3D] border border-slate-700/60 p-4 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[#5B8CFF]/5 pointer-events-none" />
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#5B8CFF] to-[#9B7BFF] flex items-center justify-center shadow-lg text-white mb-4">
                <Music className="w-12 h-12" />
              </div>

              {/* Animated Audio Equalizer Bars */}
              <div className="flex items-end gap-1.5 h-8">
                {[12, 24, 16, 28, 14, 26, 18, 30, 15, 22].map((height, i) => (
                  <div 
                    key={i}
                    className={`w-1 rounded-full bg-[#5B8CFF] transition-all duration-300 ${
                      isPlaying ? 'opacity-90' : 'opacity-30 h-1.5'
                    }`}
                    style={{ height: isPlaying ? `${Math.max(6, (height * (0.6 + Math.sin(currentTime * 3 + i) * 0.4)))}px` : '4px' }}
                  />
                ))}
              </div>
            </div>

            <div className="text-center mt-6 max-w-sm px-4">
              <h2 className="text-lg font-bold text-white truncate">{media.title}</h2>
              <p className="text-xs text-slate-400 mt-1 truncate">{media.sourceDomain} · {media.mimeType}</p>
            </div>
          </div>

          {/* Bottom Player Controls */}
          <div className="flex flex-col gap-4 max-w-md w-full mx-auto pb-4">
            {/* Scrubber */}
            <div className="flex flex-col gap-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#5B8CFF] focus:outline-none"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 tabular-nums font-mono pt-1">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Transport Buttons */}
            <div className="flex items-center justify-between px-2">
              <button 
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 transition-colors ${isShuffle ? 'text-[#5B8CFF]' : 'text-slate-400 hover:text-white'}`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button 
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                }}
                className="p-2 text-slate-300 hover:text-white transition-colors"
                title="Rewind 10s"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button 
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-[#5B8CFF] hover:bg-[#5B8CFF]/90 text-white flex items-center justify-center shadow-xl transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>

              <button 
                onClick={onNext}
                className="p-2 text-slate-300 hover:text-white transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button 
                onClick={cycleRepeat}
                className={`p-2 relative transition-colors ${repeatMode !== 'off' ? 'text-[#5B8CFF]' : 'text-slate-400 hover:text-white'}`}
                title={`Repeat: ${repeatMode}`}
              >
                <Repeat className="w-5 h-5" />
                {repeatMode === 'one' && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-[#5B8CFF] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">1</span>
                )}
              </button>
            </div>

            {/* Volume Slider Bar */}
            <div className="flex items-center gap-3 px-4 pt-2">
              <button 
                onClick={() => {
                  const muted = !isMuted;
                  if (audioRef.current) audioRef.current.muted = muted;
                  setIsMuted(muted);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (audioRef.current) audioRef.current.volume = val;
                  setIsMuted(val === 0);
                }}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#5B8CFF]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
