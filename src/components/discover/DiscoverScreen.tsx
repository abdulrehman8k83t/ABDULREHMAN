import React, { useState } from 'react';
import { 
  Search, Globe, ExternalLink, Download, FileVideo, 
  FileAudio, FileText, CheckCircle2, History, Trash2, ArrowUpRight
} from 'lucide-react';
import { MediaItem, DownloadItem } from '../../types';
import { getStoredMedia } from '../../services/mediaStore';
import { downloadEngine } from '../../services/downloadEngine';
import { VERIFIED_DIRECT_SAMPLES } from '../../services/linkInspector';
import { formatBytes } from '../../utils/formatters';
import { translations } from '../../data/translations';

interface DiscoverScreenProps {
  onPlayMedia: (media: MediaItem) => void;
  onSelectUrlForDownload: (url: string) => void;
  lang: 'en' | 'ur';
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  onPlayMedia,
  onSelectUrlForDownload,
  lang,
}) => {
  const t = translations[lang];
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Big Buck Bunny',
    'Open Movies 1080p',
    'Creative Commons Audio',
    'Android Architecture'
  ]);

  const mediaList = getStoredMedia();
  const downloadHistory = downloadEngine.getItems();

  const handleSearchSubmit = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    if (!recentSearches.includes(trimmed)) {
      setRecentSearches(prev => [trimmed, ...prev.slice(0, 7)]);
    }
  };

  const clearHistory = () => {
    setRecentSearches([]);
  };

  // Local Search Matching
  const q = query.toLowerCase().trim();
  const matchedMedia = q ? mediaList.filter(m => m.title.toLowerCase().includes(q) || m.fileName.toLowerCase().includes(q)) : [];
  const matchedDownloads = q ? downloadHistory.filter(d => d.fileName.toLowerCase().includes(q) || d.sourceUrl.toLowerCase().includes(q)) : [];

  return (
    <div className="flex flex-col gap-5 pb-24 select-none">
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSearchSubmit(query);
          }}
          placeholder={t.searchPlaceholder}
          className="w-full bg-[#151922] border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5B8CFF] shadow-sm"
        />
      </div>

      {/* Recent Searches Tags */}
      {recentSearches.length > 0 && !query && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>{t.searchHistory}</span>
            </span>
            <button
              onClick={clearHistory}
              className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>{t.clearSearchHistory}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {recentSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(term);
                  handleSearchSubmit(term);
                }}
                className="px-3 py-1.5 bg-[#151922] hover:bg-[#1D2330] border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Query Search Results */}
      {query && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Search Results for "{query}"</span>
            <span className="tabular-nums">{matchedMedia.length + matchedDownloads.length} found</span>
          </div>

          {matchedMedia.length === 0 && matchedDownloads.length === 0 ? (
            <div className="bg-[#151922] border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
              {t.noSearchResults}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {matchedMedia.map(m => (
                <div
                  key={m.id}
                  onClick={() => onPlayMedia(m)}
                  className="bg-[#151922] border border-slate-800 hover:border-[#5B8CFF] rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-lg bg-[#1D2330] flex items-center justify-center text-[#5B8CFF] shrink-0">
                      {m.category === 'audio' ? <FileAudio className="w-4 h-4" /> : <FileVideo className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-semibold text-white truncate">{m.title}</h4>
                      <p className="text-[11px] text-slate-400">{formatBytes(m.sizeBytes)} · In Local Library</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#5B8CFF] font-semibold shrink-0">Play</span>
                </div>
              ))}
            </div>
          )}

          {/* Web Search Simulation with Mandatory Compliance Disclaimer */}
          <div className="bg-[#151922] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#5B8CFF]" />
                <span className="text-xs font-bold text-white">Open Web Search</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">powered by DuckDuckGo</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed bg-[#1D2330] p-2.5 rounded-xl border border-slate-800">
              {t.webSearchDisclaimer}
            </p>

            <a
              href={`https://duckduckgo.com/?q=${encodeURIComponent(query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <span>Search "{query}" in External Web Browser</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Curated Permitted Direct Resources */}
      {!query && (
        <section className="flex flex-col gap-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.curatedDirectResources}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {t.curatedDirectResourcesDesc}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {VERIFIED_DIRECT_SAMPLES.map((sample, idx) => (
              <div
                key={idx}
                className="bg-[#151922] border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#1D2330] border border-slate-700 flex items-center justify-center text-[#5B8CFF] shrink-0">
                    {sample.mimeType.startsWith('video') ? (
                      <FileVideo className="w-5 h-5 text-[#5B8CFF]" />
                    ) : sample.mimeType.startsWith('audio') ? (
                      <FileAudio className="w-5 h-5 text-[#9B7BFF]" />
                    ) : (
                      <FileText className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{sample.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {sample.mimeType} · {formatBytes(sample.sizeBytes)} · Authorized Direct
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectUrlForDownload(sample.url)}
                  className="px-3 py-1.5 rounded-xl bg-[#5B8CFF] hover:bg-[#5B8CFF]/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#5B8CFF]/20 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
