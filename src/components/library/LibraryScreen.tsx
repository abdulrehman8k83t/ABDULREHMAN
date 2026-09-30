import React, { useState, useRef } from 'react';
import { 
  FolderPlus, Search, ArrowUpDown, Play, MoreVertical, 
  Trash2, Edit2, Share2, Info, FileVideo, FileAudio, FileText, Image as ImageIcon,
  Check, X, HardDrive, ShieldCheck, Cpu, Radio, CheckSquare, Square,
  Layers, Lock, Sparkles, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { MediaItem, MediaCategory, LibrarySort } from '../../types';
import { getStoredMedia, removeMediaItem, renameMediaItem, addMediaItem, sortMediaItems } from '../../services/mediaStore';
import { formatBytes, formatDuration, formatDate } from '../../utils/formatters';
import { translations } from '../../data/translations';
import { vaultService } from '../../services/vaultService';
import { BatchTranscodeModal } from '../batch/BatchTranscodeModal';
import { BatchP2PModal } from '../batch/BatchP2PModal';

interface LibraryScreenProps {
  onPlayMedia: (media: MediaItem) => void;
  onMoveToVault: (media: MediaItem) => void;
  onTranscodeMedia: (media: MediaItem) => void;
  onShareP2P: (media: MediaItem) => void;
  onOpenVault: () => void;
  lang: 'en' | 'ur';
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  onPlayMedia,
  onMoveToVault,
  onTranscodeMedia,
  onShareP2P,
  onOpenVault,
  lang,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio' | 'image' | 'document'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<LibrarySort>('date_desc');
  const [mediaList, setMediaList] = useState<MediaItem[]>(getStoredMedia());
  
  // Batch Multi-Selection Mode State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchTranscodeModal, setShowBatchTranscodeModal] = useState(false);
  const [showBatchP2PModal, setShowBatchP2PModal] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Dialog & Notification states
  const [activeDetailsItem, setActiveDetailsItem] = useState<MediaItem | null>(null);
  const [renameItem, setRenameItem] = useState<MediaItem | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MediaItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const refreshList = () => {
    setMediaList(getStoredMedia());
  };

  // Handle SAF (Storage Access Framework) file import from user device
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const blobUrl = URL.createObjectURL(file);
      let cat: MediaCategory = 'other';
      if (file.type.startsWith('video/')) cat = 'video';
      else if (file.type.startsWith('audio/')) cat = 'audio';
      else if (file.type.startsWith('image/')) cat = 'image';
      else if (file.type.includes('pdf') || file.type.includes('document')) cat = 'document';

      const newItem: MediaItem = {
        id: `imported_${Date.now()}_${i}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        uri: blobUrl,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        category: cat,
        lastPlayedPositionSecs: 0,
        createdAt: Date.now(),
        sourceDomain: 'Device Storage (SAF)',
      };

      addMediaItem(newItem);
    }

    refreshList();
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast(`Imported ${files.length} file(s) into Library`);
  };

  const handleConfirmRename = () => {
    if (!renameItem || !newTitle.trim()) return;
    renameMediaItem(renameItem.id, newTitle.trim());
    setRenameItem(null);
    refreshList();
    showToast('File renamed');
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmItem) return;
    removeMediaItem(deleteConfirmItem.id);
    setDeleteConfirmItem(null);
    refreshList();
    showToast('File deleted');
  };

  // Filter & Search
  let filtered = mediaList;
  if (activeTab !== 'all') {
    filtered = filtered.filter(m => m.category === activeTab);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(m => 
      m.title.toLowerCase().includes(q) || 
      m.fileName.toLowerCase().includes(q) ||
      m.sourceDomain.toLowerCase().includes(q)
    );
  }

  const sortedList = sortMediaItems(filtered, sortOption);

  // Selection helpers
  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sortedList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedList.map(item => item.id)));
    }
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  // Bulk Operations
  const selectedItems = mediaList.filter(item => selectedIds.has(item.id));
  const selectedVideos = selectedItems.filter(item => item.category === 'video');
  const selectedTotalBytes = selectedItems.reduce((acc, curr) => acc + curr.sizeBytes, 0);

  const handleBulkMoveToVault = () => {
    if (selectedItems.length === 0) return;
    selectedItems.forEach(item => {
      vaultService.encryptAndMoveToVault(item);
    });
    refreshList();
    exitSelectMode();
    showToast(`${selectedItems.length} file(s) encrypted with AES-256 into Vault`);
  };

  const handleBulkDeleteConfirm = () => {
    selectedItems.forEach(item => {
      removeMediaItem(item.id);
    });
    setShowBulkDeleteConfirm(false);
    refreshList();
    exitSelectMode();
    showToast(`Deleted ${selectedItems.length} file(s)`);
  };

  return (
    <div className="flex flex-col gap-4 pb-28 select-none relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1D2330] border border-[#5B8CFF]/50 text-white text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#5B8CFF]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hidden File Input for SAF Import */}
      <input 
        ref={fileInputRef} 
        type="file" 
        multiple 
        className="hidden" 
        onChange={handleFileImport}
      />

      {/* Top Action Bar: Search, Selection Toggle, Vault, SAF Import */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search media library..."
            className="w-full bg-[#151922] border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5B8CFF]"
          />
        </div>

        {/* Batch Select Mode Toggle Button */}
        <button
          onClick={() => {
            if (isSelectMode) exitSelectMode();
            else setIsSelectMode(true);
          }}
          className={`px-3 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
            isSelectMode 
              ? 'bg-[#5B8CFF] text-white shadow-md shadow-[#5B8CFF]/25' 
              : 'bg-[#151922] border border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Toggle Batch Multi-Selection"
        >
          {isSelectMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          <span className="hidden sm:inline">{isSelectMode ? t.cancelSelect : t.selectItems}</span>
          <span className="sm:hidden">{isSelectMode ? 'Cancel' : 'Select'}</span>
        </button>

        {/* Private Vault Button */}
        <button
          onClick={onOpenVault}
          className="px-3 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shrink-0 active:scale-95 transition-transform"
          title="Open Biometric Vault (AES-256)"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Vault</span>
        </button>

        {/* SAF Import Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2.5 bg-gradient-to-r from-[#5B8CFF] to-[#9B7BFF] hover:opacity-95 text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#5B8CFF]/20 shrink-0 active:scale-95 transition-transform"
        >
          <FolderPlus className="w-4 h-4" />
          <span className="hidden sm:inline">{t.importMedia}</span>
          <span className="sm:hidden">Import</span>
        </button>
      </div>

      {/* Multi-Selection Control Bar (When Selection Mode is Active) */}
      {isSelectMode && (
        <div className="bg-[#1A2234] border border-[#5B8CFF]/40 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">
              {selectedIds.size} {t.itemsSelected}
            </span>
            {selectedTotalBytes > 0 && (
              <span className="text-[11px] text-[#5B8CFF] font-mono">
                ({formatBytes(selectedTotalBytes)})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-medium transition-colors"
            >
              {selectedIds.size === sortedList.length ? t.deselectAll : t.selectAll}
            </button>
            <button
              onClick={exitSelectMode}
              className="p-1 text-slate-400 hover:text-white"
              title="Close selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: t.tabAll },
          { id: 'video', label: t.tabVideos },
          { id: 'audio', label: t.tabAudio },
          { id: 'image', label: t.tabImages },
          { id: 'document', label: t.tabDocuments },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-[#5B8CFF] text-white shadow-sm'
                : 'bg-[#151922] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort & Count Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <span className="tabular-nums">{sortedList.length} items</span>

        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value as LibrarySort)}
            className="bg-[#151922] border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-300 focus:outline-none"
          >
            <option value="date_desc">{t.sortDateDesc}</option>
            <option value="date_asc">{t.sortDateAsc}</option>
            <option value="name_asc">{t.sortNameAsc}</option>
            <option value="size_desc">{t.sortSizeDesc}</option>
          </select>
        </div>
      </div>

      {/* Media Cards List */}
      {sortedList.length === 0 ? (
        <div className="bg-[#151922] border border-slate-800/80 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1D2330] border border-slate-700 flex items-center justify-center text-slate-500">
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{t.emptyLibrary}</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{t.emptyLibraryDesc}</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 px-4 py-2 bg-[#5B8CFF] text-white text-xs font-bold rounded-xl shadow-md"
          >
            {t.importMedia}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sortedList.map(item => {
            const isSelected = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isSelectMode) toggleSelect(item.id);
                }}
                className={`bg-[#151922] border rounded-2xl p-3 flex flex-col gap-2.5 transition-all shadow-sm group ${
                  isSelected 
                    ? 'border-[#5B8CFF] bg-[#171F2E] ring-2 ring-[#5B8CFF]/20 shadow-md' 
                    : 'border-slate-800/80 hover:border-slate-700'
                } ${isSelectMode ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  
                  {/* Select Checkbox (Visible in select mode or hover) */}
                  {isSelectMode && (
                    <button
                      onClick={(e) => toggleSelect(item.id, e)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-[#5B8CFF] border-[#5B8CFF] text-white' 
                          : 'border-slate-600 bg-black/40 text-transparent hover:border-slate-400'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  )}

                  {/* Thumbnail / Icon & Title */}
                  <div 
                    onClick={() => {
                      if (!isSelectMode) onPlayMedia(item);
                    }}
                    className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1"
                  >
                    <div className="relative w-12 h-12 rounded-xl bg-[#1D2330] border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[#5B8CFF]/50 transition-colors">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      ) : item.category === 'video' ? (
                        <FileVideo className="w-6 h-6 text-[#5B8CFF]" />
                      ) : item.category === 'audio' ? (
                        <FileAudio className="w-6 h-6 text-[#9B7BFF]" />
                      ) : item.category === 'document' ? (
                        <FileText className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-amber-400" />
                      )}

                      {/* Play Overlay */}
                      {!isSelectMode && (item.category === 'video' || item.category === 'audio') && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 fill-white text-white" />
                        </div>
                      )}
                    </div>

                    <div className="truncate">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-[#5B8CFF] transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate">
                        <span>{formatBytes(item.sizeBytes)}</span>
                        {item.durationSecs && (
                          <>
                            <span>·</span>
                            <span>{formatDuration(item.durationSecs)}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      {item.lastPlayedPositionSecs > 0 && (
                        <span className="text-[10px] text-[#5B8CFF] font-medium block">
                          Resume: {formatDuration(item.lastPlayedPositionSecs)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary Action Button (Play when not selecting) */}
                  {!isSelectMode && (
                    <button
                      onClick={() => onPlayMedia(item)}
                      className="w-9 h-9 rounded-xl bg-[#5B8CFF]/15 hover:bg-[#5B8CFF] text-[#5B8CFF] hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-sm"
                      title="Play"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  )}
                </div>

                {/* Extended Advanced Tools Strip (Vault, Transcode, P2P Share, Rename, Delete) */}
                {!isSelectMode && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center gap-2">
                      {/* Encrypt to Vault */}
                      <button
                        onClick={() => {
                          onMoveToVault(item);
                          refreshList();
                        }}
                        className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Encrypt & Move to AES-256 Vault"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Vault</span>
                      </button>

                      {/* Hardware Transcode (for videos) */}
                      {item.category === 'video' && (
                        <button
                          onClick={() => onTranscodeMedia(item)}
                          className="flex items-center gap-1 text-slate-400 hover:text-[#5B8CFF] transition-colors ml-1"
                          title="Compress with HEVC/AV1"
                        >
                          <Cpu className="w-3.5 h-3.5 text-[#5B8CFF]" />
                          <span>HEVC/AV1</span>
                        </button>
                      )}

                      {/* Offline P2P Share */}
                      <button
                        onClick={() => onShareP2P(item)}
                        className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors ml-1"
                        title="Send via Wi-Fi Direct"
                      >
                        <Radio className="w-3.5 h-3.5 text-cyan-400" />
                        <span>P2P Share</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveDetailsItem(item)}
                        className="text-slate-500 hover:text-slate-300"
                        title="Details"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setRenameItem(item);
                          setNewTitle(item.title);
                        }}
                        className="text-slate-500 hover:text-slate-300"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmItem(item)}
                        className="text-slate-500 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Floating Batch Processing Queue Dock */}
      {isSelectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 bg-[#151922]/95 backdrop-blur-xl border border-[#5B8CFF]/50 rounded-3xl p-3 shadow-2xl flex flex-col gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#5B8CFF]" />
              <span>{t.batchProcessingTitle}</span>
              <span className="text-[#5B8CFF] font-mono">({selectedIds.size})</span>
            </span>

            <span className="text-[10px] text-slate-400 font-mono">
              Payload: {formatBytes(selectedTotalBytes)}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {/* Bulk Transcode */}
            <button
              onClick={() => setShowBatchTranscodeModal(true)}
              className="py-2.5 px-1 bg-[#1D2330] hover:bg-[#252C3D] border border-slate-700/80 hover:border-[#5B8CFF] rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-200 hover:text-white transition-all text-center"
              title="Bulk Hardware Transcode"
            >
              <Cpu className="w-4 h-4 text-[#5B8CFF]" />
              <span className="text-[10px] font-bold block">{t.bulkTranscode}</span>
            </button>

            {/* Bulk P2P Share */}
            <button
              onClick={() => setShowBatchP2PModal(true)}
              className="py-2.5 px-1 bg-[#1D2330] hover:bg-[#252C3D] border border-slate-700/80 hover:border-cyan-500 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-200 hover:text-white transition-all text-center"
              title="Bulk Wi-Fi Direct Transfer"
            >
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-bold block">{t.bulkShare}</span>
            </button>

            {/* Bulk Encrypt to Vault */}
            <button
              onClick={handleBulkMoveToVault}
              className="py-2.5 px-1 bg-[#1D2330] hover:bg-[#252C3D] border border-slate-700/80 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-200 hover:text-white transition-all text-center"
              title="Bulk AES-256 Vault Encryption"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold block">{t.bulkVault}</span>
            </button>

            {/* Bulk Delete */}
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="py-2.5 px-1 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-500 rounded-2xl flex flex-col items-center justify-center gap-1 text-red-300 hover:text-red-200 transition-all text-center"
              title="Bulk Delete"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="text-[10px] font-bold block">{t.bulkDelete}</span>
            </button>
          </div>

        </div>
      )}

      {/* Batch Transcode Modal */}
      {showBatchTranscodeModal && (
        <BatchTranscodeModal
          items={selectedItems}
          onClose={() => setShowBatchTranscodeModal(false)}
          onBatchComplete={() => {
            setShowBatchTranscodeModal(false);
            refreshList();
            exitSelectMode();
            showToast('Batch transcoding complete!');
          }}
          lang={lang}
        />
      )}

      {/* Batch P2P Share Modal */}
      {showBatchP2PModal && (
        <BatchP2PModal
          items={selectedItems}
          onClose={() => setShowBatchP2PModal(false)}
          lang={lang}
        />
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151922] border border-red-500/40 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white text-red-400">{t.confirmDelete}</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete {selectedItems.length} selected files? This cannot be undone.
            </p>
            <div className="bg-[#1D2330] p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Total size:</span>
              <span className="text-white font-bold">{formatBytes(selectedTotalBytes)}</span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {t.delete} ({selectedItems.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Details Sheet / Modal */}
      {activeDetailsItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151922] border border-slate-700 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-[#5B8CFF]" />
                <span>{t.fileDetails}</span>
              </h3>
              <button onClick={() => setActiveDetailsItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#1D2330] rounded-2xl p-3 flex flex-col gap-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">File Name:</span>
                <span className="text-white font-mono truncate max-w-[180px]">{activeDetailsItem.fileName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Category:</span>
                <span className="text-white capitalize">{activeDetailsItem.category}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">MIME Type:</span>
                <span className="text-slate-300 font-mono">{activeDetailsItem.mimeType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Size:</span>
                <span className="text-white tabular-nums">{formatBytes(activeDetailsItem.sizeBytes)}</span>
              </div>
              {activeDetailsItem.durationSecs && (
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-white tabular-nums">{formatDuration(activeDetailsItem.durationSecs)}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Security Checksum:</span>
                <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SHA-256 Validated
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Origin:</span>
                <span className="text-[#5B8CFF] font-medium">{activeDetailsItem.sourceDomain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Saved Date:</span>
                <span className="text-slate-300">{formatDate(activeDetailsItem.createdAt)}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveDetailsItem(null)}
              className="w-full py-2.5 bg-[#5B8CFF] text-white rounded-xl text-xs font-bold mt-1"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {renameItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151922] border border-slate-700 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white">{t.rename}</h3>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-[#1D2330] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5B8CFF]"
              autoFocus
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setRenameItem(null)}
                className="flex-1 py-2 rounded-xl bg-white/5 text-slate-300 text-xs"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmRename}
                className="flex-1 py-2 rounded-xl bg-[#5B8CFF] text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151922] border border-red-500/40 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white text-red-400">{t.confirmDelete}</h3>
            <p className="text-xs text-slate-300">{t.confirmDeleteDesc}</p>
            <p className="text-xs font-mono text-slate-400 bg-[#1D2330] p-2 rounded-lg truncate">
              {deleteConfirmItem.fileName}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2 rounded-xl bg-white/5 text-slate-300 text-xs"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
