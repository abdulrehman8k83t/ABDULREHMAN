export type DownloadStatus = 
  | 'queued' 
  | 'starting' 
  | 'downloading' 
  | 'paused' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type MediaCategory = 'video' | 'audio' | 'image' | 'document' | 'other';

export type CapabilityType = 
  | 'DIRECT_DOWNLOAD_AVAILABLE' 
  | 'PREVIEW_ONLY' 
  | 'OPEN_ORIGINAL_APP' 
  | 'RESTRICTED' 
  | 'UNSUPPORTED';

export type PlatformType = 
  | 'direct' 
  | 'youtube' 
  | 'instagram' 
  | 'facebook' 
  | 'tiktok' 
  | 'twitter' 
  | 'reddit' 
  | 'vimeo' 
  | 'web';

export interface MediaFormatOption {
  id: string;
  label: string;
  resolution?: string;
  bitrate?: string;
  format: string;
  sizeBytes: number;
  url: string;
  isAudioOnly?: boolean;
}

export interface LinkInspectionResult {
  url: string;
  domain: string;
  isValid: boolean;
  capability: CapabilityType;
  platform: PlatformType;
  title: string;
  thumbnail?: string;
  mimeType?: string;
  formats: MediaFormatOption[];
  policyTitle?: string;
  policyMessage?: string;
  fallbackAction?: {
    label: string;
    url: string;
  };
  isSocialMediaStream?: boolean;
  authorName?: string;
}

export interface TranscodeJob {
  id: string;
  mediaId: string;
  fileName: string;
  sourceSize: number;
  estimatedTargetSize: number;
  actualTargetSize?: number;
  codec: 'hevc' | 'av1' | 'h264';
  progress: number;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  savedBytesPercent?: number;
}

export interface VaultMediaItem {
  id: string;
  title: string;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  encryptedAt: number;
  cipherAlgorithm: 'AES-256-GCM';
  category: MediaCategory;
  playableUri?: string;
}

export interface P2PPeer {
  id: string;
  deviceName: string;
  ipAddress: string;
  osVersion: string;
  signalStrength: number;
  status: 'available' | 'connecting' | 'transferring' | 'connected';
}

export interface P2PTransferProgress {
  fileName: string;
  totalBytes: number;
  transferredBytes: number;
  speedBytesPerSec: number;
  peerName: string;
  status: 'starting' | 'transferring' | 'completed' | 'cancelled';
}

export interface DownloadItem {
  id: string;
  sourceUrl: string;
  fileName: string;
  fileExt: string;
  mimeType: string;
  sizeBytes: number;
  downloadedBytes: number;
  speedBytesPerSec: number;
  etaSecs: number;
  status: DownloadStatus;
  supportsResume: boolean;
  priority: number;
  category: MediaCategory;
  destinationPath: string;
  blobUrl?: string;
  playableUrl?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  uri: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  durationSecs?: number;
  category: MediaCategory;
  thumbnail?: string;
  lastPlayedPositionSecs: number;
  createdAt: number;
  sourceDomain: string;
  isFavorite?: boolean;
  tags?: string[];
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type AppLanguage = 'en' | 'ur';
export type LibrarySort = 'date_desc' | 'date_asc' | 'name_asc' | 'size_desc';

export interface AppSettings {
  themeMode: ThemeMode;
  language: AppLanguage;
  wifiOnly: boolean;
  simultaneousDownloads: number;
  warnOnMobileData: boolean;
  showCompletedNotifications: boolean;
  defaultSort: LibrarySort;
  askFilename: boolean;
  defaultDestination: string;
  autoDetectClipboard: boolean;
  // Smart Scheduler
  smartSchedulerEnabled: boolean;
  scheduledStartTime: string; // e.g. "02:00"
  scheduledEndTime: string;   // e.g. "06:00"
  pauseOutsideWindow: boolean;
  // Battery Saver Mode
  batterySaverEnabled: boolean;
  batterySaverAutoThreshold: number; // 0 = off, 15, 20, 25, 30
  batterySaverThrottleSpeed: boolean;
  batterySaverLimitConcurrency: boolean;
  batterySaverPauseBackground: boolean;
  simulatedBatteryLevel: number; // 0 - 100
  simulatedIsCharging: boolean;
}
