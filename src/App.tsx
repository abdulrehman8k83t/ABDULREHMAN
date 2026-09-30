import React, { useState, useEffect } from 'react';
import { 
  Home, ArrowDownToLine, FolderHeart, Compass, Settings, 
  Code2, Smartphone, Moon, Sun, Globe, Wifi, Battery, BatteryCharging,
  Zap, Sparkles, Maximize2, Minimize2, ShieldCheck, Film
} from 'lucide-react';
import { AppSettings, MediaItem, VaultMediaItem } from './types';
import { HomeScreen } from './components/home/HomeScreen';
import { BrowserSnifferView } from './components/browser/BrowserSnifferView';
import { DownloadsScreen } from './components/downloads/DownloadsScreen';
import { LibraryScreen } from './components/library/LibraryScreen';
import { DiscoverScreen } from './components/discover/DiscoverScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { Media3VideoPlayer } from './components/player/Media3VideoPlayer';
import { Media3AudioPlayer } from './components/player/Media3AudioPlayer';
import { AndroidCodeHub } from './components/codehub/AndroidCodeHub';
import { SecureVaultModal } from './components/vault/SecureVaultModal';
import { HardwareTranscoderModal } from './components/transcoder/HardwareTranscoderModal';
import { P2PShareModal } from './components/share/P2PShareModal';
import { downloadEngine } from './services/downloadEngine';
import { getStoredMedia } from './services/mediaStore';
import { vaultService } from './services/vaultService';
import { translations } from './data/translations';

type NavTab = 'home' | 'browser' | 'downloads' | 'library' | 'discover' | 'settings';
type ViewMode = 'phone' | 'code';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('phone');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isPhoneExpanded, setIsPhoneExpanded] = useState(false);

  // Settings
  const [settings, setSettings] = useState<AppSettings>({
    themeMode: 'dark',
    language: 'en',
    wifiOnly: false,
    simultaneousDownloads: 3,
    warnOnMobileData: true,
    showCompletedNotifications: true,
    defaultSort: 'date_desc',
    askFilename: true,
    defaultDestination: '/storage/emulated/0/Download/AllInOne/',
    autoDetectClipboard: true,
    smartSchedulerEnabled: false,
    scheduledStartTime: '02:00',
    scheduledEndTime: '06:00',
    pauseOutsideWindow: true,
    batterySaverEnabled: false,
    batterySaverAutoThreshold: 20,
    batterySaverThrottleSpeed: true,
    batterySaverLimitConcurrency: true,
    batterySaverPauseBackground: true,
    simulatedBatteryLevel: 85,
    simulatedIsCharging: false
  });

  // Media Players State
  const [activeVideoMedia, setActiveVideoMedia] = useState<MediaItem | null>(null);
  const [activeAudioMedia, setActiveAudioMedia] = useState<MediaItem | null>(null);

  // Advanced Tools Modal State
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [selectedTranscodeMedia, setSelectedTranscodeMedia] = useState<MediaItem | null>(null);
  const [selectedP2PMedia, setSelectedP2PMedia] = useState<MediaItem | null>(null);

  // Active Downloads Count Badge
  const [activeDownloadCount, setActiveDownloadCount] = useState(0);

  useEffect(() => {
    downloadEngine.updateSettings(settings);
    const unsub = downloadEngine.subscribe(items => {
      const count = items.filter(i => i.status === 'downloading' || i.status === 'starting').length;
      setActiveDownloadCount(count);
    });
    return unsub;
  }, [settings]);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    downloadEngine.updateSettings(newSettings);
  };

  const handlePlayMedia = (media: MediaItem) => {
    if (media.category === 'video') {
      setActiveVideoMedia(media);
    } else if (media.category === 'audio') {
      setActiveAudioMedia(media);
    } else {
      window.open(media.uri, '_blank');
    }
  };

  const handlePlayVaultItem = (vaultItem: VaultMediaItem) => {
    const tempMedia: MediaItem = {
      id: vaultItem.id,
      title: vaultItem.title,
      fileName: vaultItem.fileName,
      uri: vaultItem.playableUri || '',
      mimeType: vaultItem.mimeType,
      sizeBytes: vaultItem.sizeBytes,
      category: vaultItem.category,
      lastPlayedPositionSecs: 0,
      createdAt: vaultItem.encryptedAt,
      sourceDomain: 'Decrypted Stream (AES-256-GCM)',
    };
    handlePlayMedia(tempMedia);
  };

  const handleDownloadFromBrowser = (options: {
    sourceUrl: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    category?: 'video' | 'audio';
  }) => {
    downloadEngine.addDownload({
      sourceUrl: options.sourceUrl,
      fileName: options.fileName,
      mimeType: options.mimeType,
      sizeBytes: options.sizeBytes,
      category: options.category || 'video',
    });
    setActiveTab('downloads');
  };

  const t = translations[settings.language];
  const isRtl = settings.language === 'ur';
  const isDark = settings.themeMode === 'dark' || (settings.themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (viewMode === 'code') {
    return (
      <div className={isDark ? 'dark bg-[#0D0F14]' : 'bg-[#0D0F14]'}>
        <AndroidCodeHub onBackToApp={() => setViewMode('phone')} />
      </div>
    );
  }

  const allMedia = getStoredMedia();
  const defaultVideoForTranscode = allMedia.find(m => m.category === 'video') || allMedia[0];
  const isBatterySaverActive = downloadEngine.isBatterySaverActive();

  return (
    <div 
      className={`min-h-screen ${isDark ? 'bg-[#090B0E] text-[#F4F7FB]' : 'bg-[#F0F4F8] text-[#11141B]'} flex flex-col font-sans transition-colors`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#11141B]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
        
        {/* Zone 1: Brand Wordmark with AI-Generated App Launcher Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => setActiveTab('home')}>
            <img 
              src="/src/assets/images/app_logo_icon_1790766892321.jpg"
              alt="All-in-One Downloader"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-2xl object-cover shadow-lg shadow-[#5B8CFF]/25 border border-cyan-400/40 group-hover:scale-105 transition-transform"
            />
            {isBatterySaverActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-[#11141B] animate-pulse" title="Battery Saver Mode Active" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">All-in-One Downloader</span>
              <span className="text-[9px] bg-gradient-to-r from-[#5B8CFF] to-[#9B7BFF] text-white px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider">
                PRO
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-slate-400">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button 
            onClick={() => setActiveTab('home')}
            className={`transition-colors hover:text-white ${activeTab === 'home' ? 'text-[#5B8CFF]' : ''}`}
          >
            {t.navHome}
          </button>
          <button 
            onClick={() => setActiveTab('browser')}
            className={`transition-colors hover:text-white flex items-center gap-1.5 ${activeTab === 'browser' ? 'text-[#5B8CFF]' : ''}`}
          >
            <span>{t.navBrowser}</span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">AdBlock</span>
          </button>
          <button 
            onClick={() => setActiveTab('downloads')}
            className={`transition-colors hover:text-white flex items-center gap-1.5 ${activeTab === 'downloads' ? 'text-[#5B8CFF]' : ''}`}
          >
            <span>{t.navDownloads}</span>
            {activeDownloadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#5B8CFF] text-white text-[10px] flex items-center justify-center font-bold">
                {activeDownloadCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`transition-colors hover:text-white ${activeTab === 'library' ? 'text-[#5B8CFF]' : ''}`}
          >
            {t.navLibrary}
          </button>
          <button 
            onClick={() => setActiveTab('discover')}
            className={`transition-colors hover:text-white ${activeTab === 'discover' ? 'text-[#5B8CFF]' : ''}`}
          >
            {t.navDiscover}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`transition-colors hover:text-white flex items-center gap-1.5 ${activeTab === 'settings' ? 'text-[#5B8CFF]' : ''}`}
          >
            <span>{t.navSettings}</span>
            {isBatterySaverActive && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          {/* Battery Saver Status Indicator Badge in Header */}
          {isBatterySaverActive && (
            <button
              onClick={() => setActiveTab('settings')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-500/40 rounded-xl text-[11px] font-bold text-amber-300 hover:bg-amber-500/25 transition-colors"
              title="Battery Saver Active: Background throttled"
            >
              <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Battery Saver ({settings.simulatedBatteryLevel}%)</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => handleUpdateSettings({ ...settings, language: settings.language === 'en' ? 'ur' : 'en' })}
            className="px-2.5 py-1.5 bg-[#1D2330] hover:bg-[#252C3D] border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
            title="Toggle English / Urdu"
          >
            <Globe className="w-3.5 h-3.5 text-[#5B8CFF]" />
            <span>{settings.language === 'en' ? 'اردو' : 'EN'}</span>
          </button>

          {/* Upgraded Theme Toggle Button with Rich Icon & Glow */}
          <button
            onClick={() => handleUpdateSettings({ ...settings, themeMode: isDark ? 'light' : 'dark' })}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
              isDark 
                ? 'bg-[#181A25] hover:bg-[#212433] border-purple-500/30 text-purple-200 shadow-purple-500/10' 
                : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-amber-400/10'
            }`}
            title="Toggle Dark / Light Mode"
          >
            {isDark ? (
              <>
                <Moon className="w-3.5 h-3.5 text-[#9B7BFF]" />
                <span className="text-[11px] font-semibold">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span className="text-[11px] font-semibold">Light</span>
              </>
            )}
          </button>

          {/* Android Code Hub Switcher */}
          <button
            onClick={() => setViewMode('code')}
            className="px-3.5 py-1.5 bg-[#5B8CFF] hover:bg-[#5B8CFF]/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#5B8CFF]/20 active:scale-95 transition-all"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.codeView}</span>
            <span className="sm:hidden">Code</span>
          </button>
        </div>
      </header>

      {/* Main Body Canvas */}
      <main className="flex-1 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
        
        {/* Android Device Shell Frame */}
        <div 
          className={`w-full transition-all duration-300 flex flex-col ${
            isPhoneExpanded 
              ? 'max-w-4xl h-[92vh] rounded-3xl shadow-2xl border border-slate-800' 
              : 'max-w-md h-[88vh] rounded-[40px] shadow-2xl border-4 border-[#252C3D]'
          } bg-[#0D0F14] overflow-hidden relative`}
        >
          {/* Smartphone Status Bar with Live Battery Status & Dynamic Island */}
          <div className="h-10 bg-[#0D0F14] border-b border-slate-900 px-5 flex items-center justify-between text-xs text-slate-400 select-none shrink-0 z-20">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white text-[11px] tabular-nums">09:41</span>
              {isBatterySaverActive && (
                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded-md font-mono flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" />
                  SAVER
                </span>
              )}
            </div>
            
            {/* Center Camera Punch Hole */}
            <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-[#182030]" />
            </div>

            {/* Network & Battery State */}
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[10px] font-mono font-semibold text-slate-300">5G</span>
              
              <div 
                className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setActiveTab('settings')}
                title={`Battery: ${settings.simulatedBatteryLevel}% ${settings.simulatedIsCharging ? '(Charging)' : ''}`}
              >
                <span className="text-[10px] font-mono font-bold text-slate-200">
                  {settings.simulatedBatteryLevel}%
                </span>
                {settings.simulatedIsCharging ? (
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                ) : isBatterySaverActive ? (
                  <Battery className="w-4 h-4 text-amber-400" />
                ) : settings.simulatedBatteryLevel <= 15 ? (
                  <Battery className="w-4 h-4 text-rose-500 animate-pulse" />
                ) : (
                  <Battery className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>
          </div>

          {/* Battery Saver Active Banner in Device Frame */}
          {isBatterySaverActive && (
            <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-[10px] text-amber-300 font-medium shrink-0 animate-in fade-in">
              <div className="flex items-center gap-1.5 truncate">
                <Zap className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />
                <span className="truncate">Battery Saver: 1 download limit · Bandwidth throttled</span>
              </div>
              <button 
                onClick={() => setActiveTab('settings')}
                className="text-amber-200 font-bold hover:underline shrink-0 ml-2"
              >
                Config
              </button>
            </div>
          )}

          {/* Screen Content Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 scrollbar-none relative">
            {activeTab === 'home' && (
              <HomeScreen 
                onNavigateToDownloads={() => setActiveTab('downloads')}
                onPlayMedia={handlePlayMedia}
                onOpenVault={() => setShowVaultModal(true)}
                onOpenTranscoder={() => {
                  setSelectedTranscodeMedia(defaultVideoForTranscode);
                }}
                onOpenP2PShare={() => {
                  setSelectedP2PMedia(defaultVideoForTranscode);
                }}
                onOpenBrowserSniffer={() => setActiveTab('browser')}
                lang={settings.language}
              />
            )}

            {activeTab === 'browser' && (
              <BrowserSnifferView
                onDownloadStream={handleDownloadFromBrowser}
                lang={settings.language}
              />
            )}

            {activeTab === 'downloads' && (
              <DownloadsScreen 
                onPlayMedia={handlePlayMedia}
                lang={settings.language}
              />
            )}

            {activeTab === 'library' && (
              <LibraryScreen 
                onPlayMedia={handlePlayMedia}
                onMoveToVault={(media) => {
                  vaultService.encryptAndMoveToVault(media);
                  setShowVaultModal(true);
                }}
                onTranscodeMedia={(media) => {
                  setSelectedTranscodeMedia(media);
                }}
                onShareP2P={(media) => {
                  setSelectedP2PMedia(media);
                }}
                onOpenVault={() => setShowVaultModal(true)}
                lang={settings.language}
              />
            )}

            {activeTab === 'discover' && (
              <DiscoverScreen 
                onPlayMedia={handlePlayMedia}
                onSelectUrlForDownload={(url) => {
                  setActiveTab('home');
                }}
                lang={settings.language}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsScreen 
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onOpenCodeHub={() => setViewMode('code')}
              />
            )}
          </div>

          {/* Floating Audio Player (Active in background) */}
          {activeAudioMedia && (
            <Media3AudioPlayer
              media={activeAudioMedia}
              queue={getStoredMedia().filter(m => m.category === 'audio')}
              onClose={() => setActiveAudioMedia(null)}
              lang={settings.language}
            />
          )}

          {/* Fullscreen Media3 Video Player */}
          {activeVideoMedia && (
            <Media3VideoPlayer
              media={activeVideoMedia}
              onClose={() => setActiveVideoMedia(null)}
              lang={settings.language}
            />
          )}

          {/* Secure Biometric Vault Modal */}
          {showVaultModal && (
            <SecureVaultModal
              onClose={() => setShowVaultModal(false)}
              onPlayVaultItem={handlePlayVaultItem}
              lang={settings.language}
            />
          )}

          {/* Hardware Transcoder Modal */}
          {selectedTranscodeMedia && (
            <HardwareTranscoderModal
              media={selectedTranscodeMedia}
              onClose={() => setSelectedTranscodeMedia(null)}
              onTranscodeComplete={(newMedia) => {
                setSelectedTranscodeMedia(null);
                handlePlayMedia(newMedia);
              }}
              lang={settings.language}
            />
          )}

          {/* P2P Wi-Fi Direct Share Modal */}
          {selectedP2PMedia && (
            <P2PShareModal
              media={selectedP2PMedia}
              onClose={() => setSelectedP2PMedia(null)}
              lang={settings.language}
            />
          )}

          {/* Bottom Navigation Tab Bar (Material 3 Touch Anchored - 6 Responsive Tabs) */}
          <nav className="h-16 bg-[#11141B]/95 backdrop-blur-md border-t border-slate-800/80 grid grid-cols-6 items-center px-1 select-none shrink-0 z-30">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors py-1 ${
                activeTab === 'home' ? 'text-[#5B8CFF]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[9px] font-semibold tracking-tight">{t.navHome}</span>
            </button>

            <button
              onClick={() => setActiveTab('browser')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors py-1 relative ${
                activeTab === 'browser' ? 'text-[#5B8CFF]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="text-[9px] font-semibold tracking-tight">{t.navBrowser}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-3" />
            </button>

            <button
              onClick={() => setActiveTab('downloads')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors py-1 relative ${
                activeTab === 'downloads' ? 'text-[#5B8CFF]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span className="text-[9px] font-semibold tracking-tight">{t.navDownloads}</span>
              {activeDownloadCount > 0 && (
                <span className="absolute top-1 right-2.5 w-3.5 h-3.5 rounded-full bg-[#5B8CFF] text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
                  {activeDownloadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors py-1 ${
                activeTab === 'library' ? 'text-[#5B8CFF]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderHeart className="w-4 h-4" />
              <span className="text-[9px] font-semibold tracking-tight">{t.navLibrary}</span>
            </button>

            <button
              onClick={() => setActiveTab('discover')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors py-1 ${
                activeTab === 'discover' ? 'text-[#5B8CFF]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="text-[9px] font-semibold tracking-tight">{t.navDiscover}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors py-1 ${
                activeTab === 'settings' ? 'text-[#5B8CFF]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="text-[9px] font-semibold tracking-tight">{t.navSettings}</span>
            </button>
          </nav>

          {/* Android Home Gesture Pill */}
          <div className="h-4 bg-[#11141B] flex items-center justify-center shrink-0">
            <div className="w-28 h-1 rounded-full bg-slate-600" />
          </div>

        </div>

      </main>

    </div>
  );
}
