import React, { useState } from 'react';
import { 
  Globe, Shield, ShieldAlert, ArrowLeft, ArrowRight, RotateCw, 
  Search, Download, ExternalLink, Play, Sparkles, Check, Bookmark, 
  Layers, Zap, Film
} from 'lucide-react';
import { MediaFormatOption } from '../../types';
import { formatBytes } from '../../utils/formatters';

interface BrowserSnifferViewProps {
  onDownloadStream: (options: {
    sourceUrl: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    category?: 'video' | 'audio';
  }) => void;
  lang: 'en' | 'ur';
}

interface SniffedMedia {
  id: string;
  title: string;
  url: string;
  resolution: string;
  sizeBytes: number;
  format: string;
  mimeType: string;
  isAudio?: boolean;
}

export const BrowserSnifferView: React.FC<BrowserSnifferViewProps> = ({
  onDownloadStream,
  lang,
}) => {
  const [currentUrl, setCurrentUrl] = useState('https://www.instagram.com/reels/');
  const [inputUrl, setInputUrl] = useState('https://www.instagram.com/reels/');
  const [isAdBlockEnabled, setIsAdBlockEnabled] = useState(true);
  const [blockedAdsCount, setBlockedAdsCount] = useState(18);
  const [isLoading, setIsLoading] = useState(false);
  const [showSnifferSheet, setShowSnifferSheet] = useState(true);

  // Simulated sniffed media streams detected by network layer
  const [sniffedStreams, setSniffedStreams] = useState<SniffedMedia[]>([
    {
      id: 'sniff_1',
      title: 'Trending Short Reel (1080p H.264)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      resolution: '1080x1920 Full HD',
      sizeBytes: 24500000,
      format: 'MP4',
      mimeType: 'video/mp4',
      isAudio: false,
    },
    {
      id: 'sniff_2',
      title: 'Standard Quality Stream (720p)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      resolution: '720x1280 HD',
      sizeBytes: 15200000,
      format: 'MP4',
      mimeType: 'video/mp4',
      isAudio: false,
    },
    {
      id: 'sniff_3',
      title: 'Original Background Audio (320kbps)',
      url: 'https://actions.google.com/sounds/v1/science_fiction/scifi_space_atmosphere.ogg',
      resolution: 'Audio Master',
      sizeBytes: 3410000,
      format: 'MP3 / OGG',
      mimeType: 'audio/ogg',
      isAudio: true,
    }
  ]);

  const bookmarks = [
    { name: 'Instagram', url: 'https://www.instagram.com', color: 'from-pink-500 to-rose-600' },
    { name: 'TikTok', url: 'https://www.tiktok.com', color: 'from-cyan-400 to-blue-500' },
    { name: 'Facebook', url: 'https://www.facebook.com/watch', color: 'from-blue-600 to-indigo-700' },
    { name: 'Twitter/X', url: 'https://x.com', color: 'from-slate-700 to-slate-900' },
    { name: 'Reddit', url: 'https://www.reddit.com/r/videos', color: 'from-orange-500 to-red-600' },
    { name: 'Vimeo', url: 'https://vimeo.com', color: 'from-sky-400 to-blue-600' },
  ];

  const handleNavigate = (targetUrl: string) => {
    let clean = targetUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    setInputUrl(clean);
    setCurrentUrl(clean);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setBlockedAdsCount(prev => prev + Math.floor(Math.random() * 4) + 1);
    }, 600);
  };

  const handleDownloadItem = (stream: SniffedMedia) => {
    onDownloadStream({
      sourceUrl: stream.url,
      fileName: `${stream.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${stream.isAudio ? 'mp3' : 'mp4'}`,
      mimeType: stream.mimeType,
      sizeBytes: stream.sizeBytes,
      category: stream.isAudio ? 'audio' : 'video',
    });
  };

  return (
    <div className="flex flex-col h-full gap-3 pb-20 select-none">
      
      {/* Top Browser Bar */}
      <div className="bg-[#151922] border border-slate-800 rounded-2xl p-2.5 flex flex-col gap-2 shadow-md">
        
        {/* Navigation & Address Bar */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => handleNavigate('https://www.instagram.com')}
            className="w-7 h-7 rounded-lg hover:bg-white/5 text-slate-400 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          
          <button 
            onClick={() => handleNavigate(currentUrl)}
            className="w-7 h-7 rounded-lg hover:bg-white/5 text-slate-400 flex items-center justify-center transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#5B8CFF]' : ''}`} />
          </button>

          {/* URL Input Bar */}
          <div className="flex-1 relative flex items-center">
            <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
            <input
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNavigate(inputUrl)}
              className="w-full bg-[#1D2330] border border-slate-700/80 rounded-xl pl-8 pr-16 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5B8CFF]"
            />
            <button
              onClick={() => handleNavigate(inputUrl)}
              className="absolute right-1 px-2 py-0.5 bg-[#5B8CFF] text-white rounded-lg text-[10px] font-bold"
            >
              Go
            </button>
          </div>

          {/* AdBlocker Badge Toggle */}
          <button
            onClick={() => setIsAdBlockEnabled(!isAdBlockEnabled)}
            className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 transition-colors ${
              isAdBlockEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-white/5 border-slate-700 text-slate-400'
            }`}
            title="AI Ad & Tracker Blocker"
          >
            <Shield className="w-3 h-3" />
            <span className="hidden sm:inline">{isAdBlockEnabled ? `${blockedAdsCount} Ads Blocked` : 'AdBlock Off'}</span>
          </button>
        </div>

        {/* Quick Social Bookmarks Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {bookmarks.map((b, i) => (
            <button
              key={i}
              onClick={() => handleNavigate(b.url)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white whitespace-nowrap bg-gradient-to-r ${b.color} shadow-sm opacity-90 hover:opacity-100 transition-opacity flex items-center gap-1`}
            >
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulated In-App Web Browser Viewport */}
      <div className="flex-1 bg-[#11141B] border border-slate-800 rounded-3xl p-4 flex flex-col justify-between overflow-hidden relative shadow-inner min-h-[340px]">
        
        {/* Mock Web Page Content */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="font-mono text-[11px] truncate max-w-[240px] text-slate-300">{currentUrl}</span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              SSL Verified
            </span>
          </div>

          <div className="bg-[#151922] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5B8CFF] to-[#9B7BFF] flex items-center justify-center font-bold text-white text-sm">
                A
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Active Social Feed / Web Page</h4>
                <p className="text-[11px] text-slate-400">Inspecting DOM & Network Interceptor for media stream packets...</p>
              </div>
            </div>

            <div className="relative h-44 rounded-xl bg-black/60 overflow-hidden flex items-center justify-center border border-slate-800">
              <img 
                src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80" 
                alt="Sniffed Video"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                <span className="text-xs font-bold text-white">HTML5 Video Stream Active</span>
                <span className="text-[10px] text-slate-300 font-mono">codec: h264 / aac · 1080x1920 60fps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Media Sniffer Tray (Auto-Sniffer) */}
        {showSnifferSheet && (
          <div className="bg-[#1D2330]/95 backdrop-blur-md border border-[#5B8CFF]/50 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 mt-auto animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-white">
                  {sniffedStreams.length} Media Streams Sniffed!
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">WebViewClient Hook</span>
            </div>

            {/* List of Sniffed Stream Qualities */}
            <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
              {sniffedStreams.map(stream => (
                <div
                  key={stream.id}
                  className="bg-[#151922] border border-slate-800 rounded-xl p-2 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Film className={`w-3.5 h-3.5 ${stream.isAudio ? 'text-[#9B7BFF]' : 'text-[#5B8CFF]'}`} />
                    <div className="truncate">
                      <span className="font-semibold text-white block text-[11px] truncate">{stream.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {stream.resolution} · {formatBytes(stream.sizeBytes)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadItem(stream)}
                    className="px-2.5 py-1 bg-[#5B8CFF] hover:bg-[#5B8CFF]/90 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm shrink-0"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
