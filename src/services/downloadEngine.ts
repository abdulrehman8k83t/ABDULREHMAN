import { DownloadItem, DownloadStatus, MediaCategory, AppSettings } from '../types';
import { addMediaItem } from './mediaStore';

const DOWNLOADS_KEY = 'novadownload_downloads_list_v1';

// Initial sample downloads for demonstrative realism
const INITIAL_DOWNLOADS: DownloadItem[] = [
  {
    id: 'dl_sample_1',
    sourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    fileName: 'BigBuckBunny_1080p.mp4',
    fileExt: 'mp4',
    mimeType: 'video/mp4',
    sizeBytes: 158008374,
    downloadedBytes: 158008374,
    speedBytesPerSec: 0,
    etaSecs: 0,
    status: 'completed',
    supportsResume: true,
    priority: 1,
    category: 'video',
    destinationPath: '/storage/emulated/0/Download/NovaDownload/Movies/',
    playableUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
    completedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'dl_sample_2',
    sourceUrl: 'https://actions.google.com/sounds/v1/science_fiction/scifi_space_atmosphere.ogg',
    fileName: 'scifi_space_atmosphere.ogg',
    fileExt: 'ogg',
    mimeType: 'audio/ogg',
    sizeBytes: 3412580,
    downloadedBytes: 3412580,
    speedBytesPerSec: 0,
    etaSecs: 0,
    status: 'completed',
    supportsResume: true,
    priority: 2,
    category: 'audio',
    destinationPath: '/storage/emulated/0/Download/NovaDownload/Music/',
    playableUrl: 'https://actions.google.com/sounds/v1/science_fiction/scifi_space_atmosphere.ogg',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
    completedAt: Date.now() - 3600000 * 5,
  }
];

type DownloadListener = (items: DownloadItem[]) => void;

class DownloadEngine {
  private items: DownloadItem[] = [];
  private listeners: Set<DownloadListener> = new Set();
  private activeIntervals: Map<string, number> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();
  private settings: AppSettings = {
    themeMode: 'dark',
    language: 'en',
    wifiOnly: false,
    simultaneousDownloads: 3,
    warnOnMobileData: true,
    showCompletedNotifications: true,
    defaultSort: 'date_desc',
    askFilename: true,
    defaultDestination: '/storage/emulated/0/Download/NovaDownload/',
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
  };

  constructor() {
    this.loadFromStorage();
  }

  public isBatterySaverActive(): boolean {
    if (this.settings.batterySaverEnabled) return true;
    if (
      this.settings.batterySaverAutoThreshold > 0 && 
      this.settings.simulatedBatteryLevel <= this.settings.batterySaverAutoThreshold && 
      !this.settings.simulatedIsCharging
    ) {
      return true;
    }
    return false;
  }

  public isScheduledWindowActive(): boolean {
    if (!this.settings.smartSchedulerEnabled) return true;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [startH, startM] = (this.settings.scheduledStartTime || "02:00").split(':').map(Number);
    const [endH, endM] = (this.settings.scheduledEndTime || "06:00").split(':').map(Number);
    
    const startMinutes = (startH || 0) * 60 + (startM || 0);
    const endMinutes = (endH || 0) * 60 + (endM || 0);

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }

  public updateSettings(newSettings: AppSettings) {
    const wasBatterySaver = this.isBatterySaverActive();
    this.settings = newSettings;
    const isNowBatterySaver = this.isBatterySaverActive();

    // If battery saver toggled state, restart workers to apply new speed/concurrency
    if (wasBatterySaver !== isNowBatterySaver) {
      const activeIds = [...this.activeIntervals.keys()];
      activeIds.forEach(id => {
        this.stopWorker(id);
        this.startWorker(id);
      });
    }

    this.processQueue();
  }

  public subscribe(listener: DownloadListener): () => void {
    this.listeners.add(listener);
    listener([...this.items]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToStorage();
    const snapshot = [...this.items];
    this.listeners.forEach(fn => fn(snapshot));
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(DOWNLOADS_KEY);
      if (!raw) {
        this.items = INITIAL_DOWNLOADS;
        this.saveToStorage();
      } else {
        const parsed = JSON.parse(raw);
        // On app restart, any items that were "downloading" should be set to "paused"
        this.items = (Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DOWNLOADS).map((item: DownloadItem) => {
          if (item.status === 'downloading' || item.status === 'starting') {
            return { ...item, status: 'paused', speedBytesPerSec: 0, etaSecs: 0 };
          }
          return item;
        });
      }
    } catch {
      this.items = INITIAL_DOWNLOADS;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.error('Failed to persist downloads', e);
    }
  }

  public getItems(): DownloadItem[] {
    return [...this.items];
  }

  public addDownload(options: {
    sourceUrl: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    destinationPath?: string;
    category?: MediaCategory;
  }): { item: DownloadItem; isDuplicate: boolean } {
    const ext = options.fileName.split('.').pop()?.toLowerCase() || 'bin';
    
    // Duplicate check
    const existing = this.items.find(
      i => i.sourceUrl === options.sourceUrl && (i.status === 'downloading' || i.status === 'queued')
    );
    if (existing) {
      return { item: existing, isDuplicate: true };
    }

    let cat: MediaCategory = options.category || 'other';
    if (!options.category) {
      if (['mp4', 'mkv', 'webm', 'mov', 'avi'].includes(ext)) cat = 'video';
      else if (['mp3', 'm4a', 'wav', 'ogg', 'aac'].includes(ext)) cat = 'audio';
      else if (['jpg', 'png', 'webp', 'gif'].includes(ext)) cat = 'image';
      else if (['pdf', 'doc', 'docx', 'zip', 'apk'].includes(ext)) cat = 'document';
    }

    const newItem: DownloadItem = {
      id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sourceUrl: options.sourceUrl,
      fileName: options.fileName,
      fileExt: ext,
      mimeType: options.mimeType,
      sizeBytes: options.sizeBytes > 0 ? options.sizeBytes : 15000000,
      downloadedBytes: 0,
      speedBytesPerSec: 0,
      etaSecs: 0,
      status: 'queued',
      supportsResume: true,
      priority: this.items.length + 1,
      category: cat,
      destinationPath: options.destinationPath || `${this.settings.defaultDestination}${cat === 'video' ? 'Movies/' : cat === 'audio' ? 'Music/' : ''}`,
      playableUrl: options.sourceUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.items.unshift(newItem);
    this.notify();
    this.processQueue();

    return { item: newItem, isDuplicate: false };
  }

  public pauseDownload(id: string) {
    this.stopWorker(id);
    const item = this.items.find(i => i.id === id);
    if (item && (item.status === 'downloading' || item.status === 'queued' || item.status === 'starting')) {
      item.status = 'paused';
      item.speedBytesPerSec = 0;
      item.etaSecs = 0;
      item.updatedAt = Date.now();
      this.notify();
      this.processQueue();
    }
  }

  public resumeDownload(id: string) {
    const item = this.items.find(i => i.id === id);
    if (item && (item.status === 'paused' || item.status === 'failed')) {
      item.status = 'queued';
      item.errorCode = undefined;
      item.errorMessage = undefined;
      item.updatedAt = Date.now();
      this.notify();
      this.processQueue();
    }
  }

  public cancelDownload(id: string) {
    this.stopWorker(id);
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.status = 'cancelled';
      item.speedBytesPerSec = 0;
      item.etaSecs = 0;
      item.updatedAt = Date.now();
      this.notify();
      this.processQueue();
    }
  }

  public retryDownload(id: string) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.downloadedBytes = 0;
      item.status = 'queued';
      item.errorCode = undefined;
      item.errorMessage = undefined;
      item.updatedAt = Date.now();
      this.notify();
      this.processQueue();
    }
  }

  public deleteDownload(id: string) {
    this.stopWorker(id);
    this.items = this.items.filter(i => i.id !== id);
    this.notify();
    this.processQueue();
  }

  public pauseAll() {
    this.items.forEach(i => {
      if (i.status === 'downloading' || i.status === 'queued') {
        this.stopWorker(i.id);
        i.status = 'paused';
        i.speedBytesPerSec = 0;
        i.etaSecs = 0;
      }
    });
    this.notify();
  }

  public resumeAll() {
    this.items.forEach(i => {
      if (i.status === 'paused') {
        i.status = 'queued';
      }
    });
    this.notify();
    this.processQueue();
  }

  public clearCompleted() {
    this.items = this.items.filter(i => i.status !== 'completed');
    this.notify();
  }

  private processQueue() {
    // If smart scheduler is enabled and we are outside the off-peak window, hold queued items
    if (this.settings.smartSchedulerEnabled && this.settings.pauseOutsideWindow && !this.isScheduledWindowActive()) {
      return;
    }

    const isSaver = this.isBatterySaverActive();
    const activeCount = this.items.filter(i => i.status === 'downloading' || i.status === 'starting').length;
    let maxAllowed = this.settings.simultaneousDownloads || 3;
    
    // In battery saver mode, strictly clamp concurrency to 1 to reduce active CPU cores & radio usage
    if (isSaver && this.settings.batterySaverLimitConcurrency) {
      maxAllowed = 1;
    }

    if (activeCount < maxAllowed) {
      const nextQueued = this.items.find(i => i.status === 'queued');
      if (nextQueued) {
        this.startWorker(nextQueued.id);
      }
    }
  }

  private stopWorker(id: string) {
    if (this.activeIntervals.has(id)) {
      clearInterval(this.activeIntervals.get(id));
      this.activeIntervals.delete(id);
    }
    if (this.abortControllers.has(id)) {
      this.abortControllers.get(id)?.abort();
      this.abortControllers.delete(id);
    }
  }

  private startWorker(id: string) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;

    this.stopWorker(id);
    item.status = 'downloading';
    item.updatedAt = Date.now();
    this.notify();

    const isSaver = this.isBatterySaverActive();
    const throttleSpeed = isSaver && this.settings.batterySaverThrottleSpeed;

    // High performance download simulation with real byte ticks and speed smoothing
    // Battery saver throttles polling frequency to 800ms and limits bandwidth to ~550 KB/s
    let lastTick = performance.now();
    let currentBytes = item.downloadedBytes;
    const totalBytes = item.sizeBytes;
    
    // Normal: ~2.5 MB/s, Battery Saver: ~550 KB/s (low power radio profile)
    const baseSpeed = throttleSpeed ? 550000 : 2500000;
    const tickInterval = throttleSpeed ? 800 : 400;

    const interval = window.setInterval(() => {
      const currentItem = this.items.find(i => i.id === id);
      if (!currentItem || currentItem.status !== 'downloading') {
        this.stopWorker(id);
        return;
      }

      const now = performance.now();
      const deltaSec = (now - lastTick) / 1000;
      lastTick = now;

      // Realistic speed fluctuation (+/- 20%)
      const jitter = 0.8 + Math.random() * 0.4;
      const speed = Math.round(baseSpeed * jitter);
      const addedBytes = Math.round(speed * deltaSec);

      currentBytes = Math.min(totalBytes, currentBytes + addedBytes);
      currentItem.downloadedBytes = currentBytes;
      currentItem.speedBytesPerSec = speed;
      
      const remainingBytes = Math.max(0, totalBytes - currentBytes);
      currentItem.etaSecs = speed > 0 ? Math.ceil(remainingBytes / speed) : 0;
      currentItem.updatedAt = Date.now();

      if (currentBytes >= totalBytes) {
        // Completed!
        this.stopWorker(id);
        currentItem.status = 'completed';
        currentItem.downloadedBytes = totalBytes;
        currentItem.speedBytesPerSec = 0;
        currentItem.etaSecs = 0;
        currentItem.completedAt = Date.now();

        // Index in Library automatically!
        addMediaItem({
          id: `media_${currentItem.id}`,
          title: currentItem.fileName.replace(/\.[^/.]+$/, ""),
          fileName: currentItem.fileName,
          uri: currentItem.playableUrl || currentItem.sourceUrl,
          mimeType: currentItem.mimeType,
          sizeBytes: currentItem.sizeBytes,
          durationSecs: currentItem.category === 'video' ? 596 : currentItem.category === 'audio' ? 142 : undefined,
          category: currentItem.category,
          thumbnail: currentItem.category === 'video' 
            ? 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
            : undefined,
          lastPlayedPositionSecs: 0,
          createdAt: Date.now(),
          sourceDomain: new URL(currentItem.sourceUrl.startsWith('http') ? currentItem.sourceUrl : `https://${currentItem.sourceUrl}`).hostname,
        });

        this.notify();
        this.processQueue();
        return;
      }

      this.notify();
    }, tickInterval);

    this.activeIntervals.set(id, interval);
  }
}

export const downloadEngine = new DownloadEngine();
