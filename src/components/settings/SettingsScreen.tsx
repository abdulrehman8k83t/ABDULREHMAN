import React, { useState } from 'react';
import { 
  Moon, Sun, Globe, Wifi, Shield, HardDrive, 
  Trash2, Code2, Check, AlertTriangle, Layers, Info,
  Battery, BatteryCharging, BatteryLow, Zap, Sparkles,
  Sliders, Gauge, RefreshCw, Cpu
} from 'lucide-react';
import { AppSettings, ThemeMode, AppLanguage } from '../../types';
import { translations } from '../../data/translations';
import { downloadEngine } from '../../services/downloadEngine';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenCodeHub: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onOpenCodeHub,
}) => {
  const t = translations[settings.language];
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const isBatterySaverActive = downloadEngine.isBatterySaverActive();

  const handleClearHistory = () => {
    downloadEngine.clearCompleted();
    localStorage.removeItem('novadownload_playback_positions_v1');
    showToast(t.clearHistorySuccess);
  };

  const getBatteryColor = (level: number, charging: boolean) => {
    if (charging) return 'text-emerald-400';
    if (level <= 20) return 'text-amber-400';
    if (level <= 10) return 'text-rose-500';
    return 'text-emerald-400';
  };

  return (
    <div className="flex flex-col gap-5 pb-24 select-none animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1D2330] border border-emerald-500/50 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Battery Saver & Power Management Section */}
      <section className="bg-gradient-to-br from-[#151922] via-[#1A202C] to-[#151922] border border-amber-500/30 rounded-3xl p-4 sm:p-5 flex flex-col gap-4 shadow-lg shadow-amber-500/5 relative overflow-hidden">
        {/* Subtle Ambient Background Glow when active */}
        {isBatterySaverActive && (
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isBatterySaverActive ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
            }`}>
              <Battery className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>{t.sectionBatterySaver}</span>
                {isBatterySaverActive && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-normal animate-pulse">
                    Active
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.batterySaverDesc}</p>
            </div>
          </div>

          {/* Master Toggle */}
          <button
            onClick={() => onUpdateSettings({ ...settings, batterySaverEnabled: !settings.batterySaverEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
              settings.batterySaverEnabled ? 'bg-amber-500' : 'bg-slate-700'
            }`}
            title="Toggle Battery Saver"
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
              settings.batterySaverEnabled ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Live Battery Status Card & Simulation Controls */}
        <div className="bg-[#11141B]/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {settings.simulatedIsCharging ? (
                  <BatteryCharging className="w-6 h-6 text-emerald-400" />
                ) : settings.simulatedBatteryLevel <= 20 ? (
                  <BatteryLow className="w-6 h-6 text-amber-400 animate-pulse" />
                ) : (
                  <Battery className={`w-6 h-6 ${getBatteryColor(settings.simulatedBatteryLevel, settings.simulatedIsCharging)}`} />
                )}
                {settings.simulatedIsCharging && (
                  <Zap className="w-3 h-3 text-emerald-300 absolute -top-1 -right-1" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tabular-nums">
                    {settings.simulatedBatteryLevel}%
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    · {settings.simulatedIsCharging ? t.batteryCharging : t.batteryDischarging}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {isBatterySaverActive ? t.batterySaverStatusActiveMsg : t.batterySaverStatusNormalMsg}
                </span>
              </div>
            </div>

            {/* Charging Simulator Button */}
            <button
              onClick={() => onUpdateSettings({ ...settings, simulatedIsCharging: !settings.simulatedIsCharging })}
              className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-colors ${
                settings.simulatedIsCharging 
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400' 
                  : 'bg-[#1D2330] border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>{settings.simulatedIsCharging ? 'Unplug' : 'Plug In'}</span>
            </button>
          </div>

          {/* Battery Level Slider Simulator */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-slate-400" />
                <span>{t.batteryLevelSim}</span>
              </span>
              <span className={`font-mono font-bold ${getBatteryColor(settings.simulatedBatteryLevel, settings.simulatedIsCharging)}`}>
                {settings.simulatedBatteryLevel}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={settings.simulatedBatteryLevel}
              onChange={e => onUpdateSettings({ ...settings, simulatedBatteryLevel: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-[#1D2330] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span className="text-rose-400">10% (Critical)</span>
              <span className="text-amber-400">20% (Low Threshold)</span>
              <span className="text-emerald-400">100% (Charged)</span>
            </div>
          </div>
        </div>

        {/* Auto-activation Threshold */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">{t.autoEnableThreshold}</span>
            <span className="text-xs text-amber-400 font-bold tabular-nums">
              {settings.batterySaverAutoThreshold === 0 ? 'Off' : `≤ ${settings.batterySaverAutoThreshold}%`}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">{t.autoEnableThresholdDesc}</p>

          <div className="grid grid-cols-4 gap-1.5 mt-1">
            {[0, 15, 20, 30].map(val => (
              <button
                key={val}
                onClick={() => onUpdateSettings({ ...settings, batterySaverAutoThreshold: val })}
                className={`py-2 rounded-xl border text-[11px] font-semibold transition-all ${
                  settings.batterySaverAutoThreshold === val
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-[#11141B] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {val === 0 ? 'Disabled' : `${val}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Power Reduction Rules */}
        <div className="flex flex-col gap-3 pt-2 border-t border-slate-800/80 text-xs">
          
          {/* Limit Concurrency */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-white">{t.limitConcurrencyTitle}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.limitConcurrencyDesc}</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, batterySaverLimitConcurrency: !settings.batterySaverLimitConcurrency })}
              className={`w-11 h-5 rounded-full transition-colors relative shrink-0 ${
                settings.batterySaverLimitConcurrency ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                settings.batterySaverLimitConcurrency ? 'left-6.5' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Throttle Speed & Polling Frequency */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
            <div>
              <h4 className="font-semibold text-white">{t.throttleSpeedTitle}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.throttleSpeedDesc}</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, batterySaverThrottleSpeed: !settings.batterySaverThrottleSpeed })}
              className={`w-11 h-5 rounded-full transition-colors relative shrink-0 ${
                settings.batterySaverThrottleSpeed ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                settings.batterySaverThrottleSpeed ? 'left-6.5' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Pause Background Sniffer */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
            <div>
              <h4 className="font-semibold text-white">{t.pauseBackgroundTitle}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.pauseBackgroundDesc}</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, batterySaverPauseBackground: !settings.batterySaverPauseBackground })}
              className={`w-11 h-5 rounded-full transition-colors relative shrink-0 ${
                settings.batterySaverPauseBackground ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                settings.batterySaverPauseBackground ? 'left-6.5' : 'left-1'
              }`} />
            </button>
          </div>

        </div>

        {/* Android Native WorkManager Spec Pill */}
        <div className="bg-[#11141B]/90 border border-slate-800/90 rounded-2xl p-2.5 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
          <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">androidx.work.Constraints: RequiresBatteryNotLow() Active</span>
        </div>
      </section>

      {/* Language & RTL Section */}
      <section className="bg-[#151922] border border-slate-800/90 rounded-3xl p-4 flex flex-col gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Globe className="w-4 h-4 text-[#5B8CFF]" />
          <span>{t.sectionLanguage}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdateSettings({ ...settings, language: 'en' })}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
              settings.language === 'en'
                ? 'bg-[#5B8CFF]/15 border-[#5B8CFF] text-white shadow-sm'
                : 'bg-[#1D2330] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{t.languageEnglish}</span>
            {settings.language === 'en' && <Check className="w-4 h-4 text-[#5B8CFF]" />}
          </button>

          <button
            onClick={() => onUpdateSettings({ ...settings, language: 'ur' })}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
              settings.language === 'ur'
                ? 'bg-[#5B8CFF]/15 border-[#5B8CFF] text-white shadow-sm'
                : 'bg-[#1D2330] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{t.languageUrdu}</span>
            {settings.language === 'ur' && <Check className="w-4 h-4 text-[#5B8CFF]" />}
          </button>
        </div>
      </section>

      {/* Enhanced Appearance & Themes Selector */}
      <section className="bg-[#151922] border border-slate-800/90 rounded-3xl p-4 flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#9B7BFF]" />
            <span>{t.sectionAppearance}</span>
          </div>
          <span className="text-[10px] text-slate-400 capitalize">
            Current: {settings.themeMode}
          </span>
        </div>

        {/* 3 Interactive Rich Theme Cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* Dark Mode Card */}
          <button
            onClick={() => onUpdateSettings({ ...settings, themeMode: 'dark' })}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all relative ${
              settings.themeMode === 'dark'
                ? 'bg-gradient-to-b from-[#1D2330] to-[#121620] border-[#9B7BFF] shadow-lg shadow-[#9B7BFF]/15 text-white ring-1 ring-[#9B7BFF]'
                : 'bg-[#1D2330] border-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
              settings.themeMode === 'dark' ? 'bg-[#9B7BFF]/20 text-[#9B7BFF] scale-105' : 'bg-slate-800 text-slate-400'
            }`}>
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">{t.themeDark}</span>
            {settings.themeMode === 'dark' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#9B7BFF]" />
            )}
          </button>

          {/* Light Mode Card */}
          <button
            onClick={() => onUpdateSettings({ ...settings, themeMode: 'light' })}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all relative ${
              settings.themeMode === 'light'
                ? 'bg-gradient-to-b from-amber-500/15 to-[#1D2330] border-amber-400 shadow-lg shadow-amber-400/15 text-white ring-1 ring-amber-400'
                : 'bg-[#1D2330] border-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
              settings.themeMode === 'light' ? 'bg-amber-400/20 text-amber-300 scale-105' : 'bg-slate-800 text-slate-400'
            }`}>
              <Sun className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">{t.themeLight}</span>
            {settings.themeMode === 'light' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          {/* System Default Card */}
          <button
            onClick={() => onUpdateSettings({ ...settings, themeMode: 'system' })}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all relative ${
              settings.themeMode === 'system'
                ? 'bg-gradient-to-b from-[#5B8CFF]/15 to-[#1D2330] border-[#5B8CFF] shadow-lg shadow-[#5B8CFF]/15 text-white ring-1 ring-[#5B8CFF]'
                : 'bg-[#1D2330] border-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
              settings.themeMode === 'system' ? 'bg-[#5B8CFF]/20 text-[#5B8CFF] scale-105' : 'bg-slate-800 text-slate-400'
            }`}>
              <HardDrive className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">{t.themeSystem}</span>
            {settings.themeMode === 'system' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B8CFF]" />
            )}
          </button>
        </div>
      </section>

      {/* Download Engine Preferences */}
      <section className="bg-[#151922] border border-slate-800/90 rounded-3xl p-4 flex flex-col gap-4 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Wifi className="w-4 h-4 text-emerald-400" />
          <span>{t.sectionDownloads}</span>
        </div>

        {/* Wi-Fi Only Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-white">{t.wifiOnly}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.wifiOnlyDesc}</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ ...settings, wifiOnly: !settings.wifiOnly })}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
              settings.wifiOnly ? 'bg-[#5B8CFF]' : 'bg-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
              settings.wifiOnly ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Simultaneous Download Limit */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">{t.simultaneousLimit}</span>
            <span className="text-[#5B8CFF] font-bold tabular-nums">
              {isBatterySaverActive && settings.batterySaverLimitConcurrency 
                ? '1 active (Battery Saver Locked)' 
                : `${settings.simultaneousDownloads} active`}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            disabled={isBatterySaverActive && settings.batterySaverLimitConcurrency}
            value={settings.simultaneousDownloads}
            onChange={e => onUpdateSettings({ ...settings, simultaneousDownloads: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-[#1D2330] rounded-lg appearance-none cursor-pointer accent-[#5B8CFF] disabled:opacity-40"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>1 (Battery Saver)</span>
            <span>3 (Standard)</span>
            <span>5 (Max Turbo)</span>
          </div>
        </div>

        {/* Mobile Data Warning */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div>
            <h4 className="text-xs font-semibold text-white">{t.warnOnMobileData}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.warnOnMobileDataDesc}</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ ...settings, warnOnMobileData: !settings.warnOnMobileData })}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
              settings.warnOnMobileData ? 'bg-[#5B8CFF]' : 'bg-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
              settings.warnOnMobileData ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Auto-Detect Clipboard Video URLs Toggle */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div>
            <h4 className="text-xs font-semibold text-white">{t.autoDetectClipboardTitle}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.autoDetectClipboardDesc}</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ ...settings, autoDetectClipboard: !settings.autoDetectClipboard })}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
              settings.autoDetectClipboard ? 'bg-[#5B8CFF]' : 'bg-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
              settings.autoDetectClipboard ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>
      </section>

      {/* Privacy & Storage Section */}
      <section className="bg-[#151922] border border-slate-800/90 rounded-3xl p-4 flex flex-col gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>{t.sectionPrivacy}</span>
        </div>

        {/* Security badges */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#1D2330] p-3 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AES-256-GCM Active
            </span>
            <span className="text-[11px] text-slate-300 font-medium">On-Device Hardware Vault</span>
          </div>

          <div className="bg-[#1D2330] p-3 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-[#5B8CFF] font-mono font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#5B8CFF]" />
              SHA-256 Verification
            </span>
            <span className="text-[11px] text-slate-300 font-medium">Auto Stream Checksums</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-[#1D2330] p-3 rounded-2xl border border-slate-800">
          {t.privacyStatement}
        </p>

        <button
          onClick={handleClearHistory}
          className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 hover:border-red-500 rounded-2xl text-xs text-red-300 font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t.clearHistory}</span>
        </button>
      </section>

      {/* Android Architecture & Source Code Hub CTA */}
      <section className="bg-gradient-to-br from-[#1D2330] to-[#151922] border border-[#5B8CFF]/40 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[#5B8CFF]">
          <Code2 className="w-5 h-5" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            {t.architectureGuide}
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Inspect and export the complete production-grade Kotlin, Jetpack Compose, Room, WorkManager, and Media3 implementation files for Android Studio.
        </p>

        <button
          onClick={onOpenCodeHub}
          className="w-full py-3 bg-[#5B8CFF] hover:bg-[#5B8CFF]/90 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#5B8CFF]/25 active:scale-98 transition-all"
        >
          <Code2 className="w-4 h-4" />
          <span>{t.viewAndroidCode}</span>
        </button>
      </section>

      {/* About App Section with AI Generated App Icon */}
      <section className="bg-gradient-to-br from-[#151922] via-[#1D2330] to-[#151922] border border-slate-700/60 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          {/* AI Generated App Icon */}
          <div className="relative shrink-0">
            <img 
              src="/src/assets/images/app_logo_icon_1790766892321.jpg"
              alt="All-in-One Downloader App Icon"
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover shadow-xl border border-cyan-400/30"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#151922] flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">All-in-One Downloader</span>
              <span className="text-[10px] bg-[#5B8CFF]/20 text-[#5B8CFF] border border-[#5B8CFF]/40 px-1.5 py-0.2 rounded-full font-bold">PRO</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Media Manager, Biometric Vault & 4K Transcoder
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-emerald-400">v2.4.0-release</span>
              <span className="text-[10px] text-slate-500 font-mono">MAD (API 35)</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed bg-[#11141B] p-3 rounded-2xl border border-slate-800">
          Engineered with modern Kotlin, Jetpack Compose, ExoPlayer/Media3, Hardware MediaCodec, and Battery-Aware WorkManager constraints.
        </p>
      </section>

      {/* Legal & Compliance Charter */}
      <section className="bg-[#151922] border border-slate-800 rounded-3xl p-4 flex flex-col gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-bold text-white">
          <Info className="w-4 h-4 text-slate-400" />
          <span>{t.complianceCharter}</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          All-in-One Downloader is engineered with a strict capability-based architecture. Platform links are never presumed downloadable without verified platform authorization. DRM and private account controls are strictly respected.
        </p>
        <span className="text-[10px] text-slate-500 font-mono mt-1">All-in-One Downloader Engine v2.4.0 (WorkManager & Battery-Optimized)</span>
      </section>

    </div>
  );
};
