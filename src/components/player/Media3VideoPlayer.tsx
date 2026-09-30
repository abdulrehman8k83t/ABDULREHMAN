import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize2, 
  Minimize2, Settings, ArrowLeft, Sun, Lock, Unlock, 
  Check, PictureInPicture
} from 'lucide-react';
import { MediaItem } from '../../types';
import { savePlaybackPosition, getPlaybackPosition } from '../../services/mediaStore';
import { formatDuration } from '../../utils/formatters';

interface Media3VideoPlayerProps {
  media: MediaItem;
  onClose: () => void;
  lang: 'en' | 'ur';
}

export const Media3VideoPlayer: React.FC<Media3VideoPlayerProps> = ({ media, onClose, lang }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [brightness, setBrightness] = useState(1); // 0.3 to 1.5
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOrientationLocked, setIsOrientationLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTrackMenu, setShowTrackMenu] = useState(false);
  const [resumeToast, setResumeToast] = useState<string | null>(null);

  // Gesture feedback indicators
  const [gestureFeedback, setGestureFeedback] = useState<{ type: 'vol' | 'bright'; val: number } | null>(null);

  const controlsTimeoutRef = useRef<number | null>(null);

  // Load initial resume position
  useEffect(() => {
    const savedPos = getPlaybackPosition(media.id);
    if (savedPos > 3 && videoRef.current) {
      videoRef.current.currentTime = savedPos;
      setCurrentTime(savedPos);
      setResumeToast(`${lang === 'ur' ? 'دوبارہ شروع ہوا از' : 'Resumed from'} ${formatDuration(savedPos)}`);
      setTimeout(() => setResumeToast(null), 3500);
    }
  }, [media.id, lang]);

  // Periodic position saver (every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        savePlaybackPosition(media.id, videoRef.current.currentTime);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [media.id]);

  // Auto-hide controls
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowTrackMenu(false);
      }
    }, 4000);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      savePlaybackPosition(media.id, videoRef.current.currentTime);
    }
    resetControlsTimeout();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      savePlaybackPosition(media.id, newTime);
    }
  };

  const skip = (delta: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    savePlaybackPosition(media.id, target);
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP not available', e);
    }
  };

  const changeSpeed = (newSpeed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
      setSpeed(newSpeed);
      setShowSpeedMenu(false);
    }
  };

  // Touch gesture emulation for Brightness (left side) and Volume (right side)
  const touchStartYRef = useRef<number | null>(null);
  const touchSideRef = useRef<'left' | 'right' | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    resetControlsTimeout();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      touchStartYRef.current = touch.clientY;
      const xPercent = (touch.clientX - rect.left) / rect.width;
      touchSideRef.current = xPercent < 0.5 ? 'left' : 'right';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null || !touchSideRef.current) return;
    const touch = e.touches[0];
    const deltaY = touchStartYRef.current - touch.clientY; // swipe up is positive
    
    if (touchSideRef.current === 'left') {
      // Brightness (0.4 to 1.6)
      const newBright = Math.max(0.4, Math.min(1.5, brightness + (deltaY * 0.002)));
      setBrightness(newBright);
      setGestureFeedback({ type: 'bright', val: Math.round(((newBright - 0.4) / 1.1) * 100) });
    } else {
      // Volume (0 to 1)
      const newVol = Math.max(0, Math.min(1, volume + (deltaY * 0.003)));
      setVolume(newVol);
      if (videoRef.current) videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
      setGestureFeedback({ type: 'vol', val: Math.round(newVol * 100) });
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
    touchSideRef.current = null;
    setTimeout(() => setGestureFeedback(null), 1200);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none"
      onMouseMove={resetControlsTimeout}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={media.uri}
        className="w-full h-full object-contain cursor-pointer"
        style={{ filter: `brightness(${brightness})` }}
        onClick={togglePlay}
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        onEnded={() => {
          setIsPlaying(false);
          savePlaybackPosition(media.id, 0);
        }}
        playsInline
      />

      {/* Auto-Resume Toast */}
      {resumeToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-[#1D2330]/90 backdrop-blur-md border border-[#5B8CFF]/30 px-4 py-2 rounded-full text-xs font-medium text-white shadow-xl flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5 text-[#5B8CFF]" />
          <span>{resumeToast}</span>
        </div>
      )}

      {/* Gesture Feedback HUD (Brightness / Volume) */}
      {gestureFeedback && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-black/75 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-3 text-white border border-white/10 shadow-2xl">
          {gestureFeedback.type === 'bright' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-[#5B8CFF]" />
          )}
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              {gestureFeedback.type === 'bright' ? 'Brightness' : 'Volume'}
            </span>
            <span className="text-base font-semibold tabular-nums">{gestureFeedback.val}%</span>
          </div>
        </div>
      )}

      {/* Top Bar Overlay */}
      <div 
        className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 max-w-[70%]">
          <button 
            onClick={() => {
              if (videoRef.current) savePlaybackPosition(media.id, videoRef.current.currentTime);
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="truncate">
            <h2 className="text-sm font-semibold text-white truncate">{media.title}</h2>
            <p className="text-[11px] text-slate-400 truncate">{media.sourceDomain} · {media.mimeType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Orientation Lock */}
          <button 
            onClick={() => setIsOrientationLocked(!isOrientationLocked)}
            title={isOrientationLocked ? "Orientation Locked" : "Orientation Free"}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isOrientationLocked ? 'bg-[#5B8CFF] text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isOrientationLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Picture in Picture */}
          <button 
            onClick={togglePiP}
            title="Picture in Picture"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <PictureInPicture className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowSpeedMenu(!showSpeedMenu);
                setShowTrackMenu(false);
              }}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tabular-nums"
            >
              {speed}x
            </button>
            {showSpeedMenu && (
              <div className="absolute right-0 top-10 bg-[#1D2330] border border-slate-700/60 rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 min-w-[90px] z-50">
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(s => (
                  <button
                    key={s}
                    onClick={() => changeSpeed(s)}
                    className={`px-3 py-1.5 text-xs rounded-lg flex items-center justify-between text-left transition-colors ${
                      speed === s ? 'bg-[#5B8CFF] text-white font-semibold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{s}x</span>
                    {speed === s && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Track / Audio Selector */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowTrackMenu(!showTrackMenu);
                setShowSpeedMenu(false);
              }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            {showTrackMenu && (
              <div className="absolute right-0 top-10 bg-[#1D2330] border border-slate-700/60 rounded-xl p-2 shadow-2xl flex flex-col gap-2 min-w-[160px] z-50">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                  Audio & Tracks
                </div>
                <div className="px-2 py-1 text-xs text-white bg-white/5 rounded-lg flex items-center justify-between">
                  <span>Track 1: Stereo (Default)</span>
                  <Check className="w-3.5 h-3.5 text-[#5B8CFF]" />
                </div>
                <div className="text-[11px] text-slate-400 px-2">
                  Format: {media.mimeType}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center Controls Overlay (Play / Seek 10s) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center gap-8 pointer-events-none transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button 
          onClick={() => skip(-10)}
          className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 pointer-events-auto flex items-center justify-center text-white transition-transform active:scale-90"
          title="Rewind 10s"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button 
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-[#5B8CFF] hover:bg-[#5B8CFF]/90 pointer-events-auto flex items-center justify-center text-white shadow-2xl transition-transform active:scale-95"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
        </button>

        <button 
          onClick={() => skip(10)}
          className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 pointer-events-auto flex items-center justify-center text-white transition-transform active:scale-90"
          title="Forward 10s"
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Bar Overlay (Scrubber, Timestamps, Volume, Fullscreen) */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-6 pt-8 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Progress Bar */}
        <div className="flex items-center gap-3 mb-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#5B8CFF] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2 tabular-nums font-mono text-[13px]">
            <span className="text-white font-medium">{formatDuration(currentTime)}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-400">{formatDuration(duration)}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Mute Toggle */}
            <button 
              onClick={() => {
                if (videoRef.current) {
                  const muted = !isMuted;
                  videoRef.current.muted = muted;
                  setIsMuted(muted);
                }
              }}
              className="text-white hover:text-[#5B8CFF] transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Fullscreen Button */}
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-[#5B8CFF] transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
