import { MediaItem, MediaCategory, LibrarySort } from '../types';

const STORAGE_KEY = 'novadownload_media_library_v1';
const PLAYBACK_POSITION_KEY = 'novadownload_playback_positions_v1';

// Initial pre-seeded media so the user has immediate access to test video/audio playback, resume position, gestures, etc.
const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'seed_video_1',
    title: 'Big Buck Bunny (1080p Full Movie)',
    fileName: 'BigBuckBunny_1080p.mp4',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    mimeType: 'video/mp4',
    sizeBytes: 158008374,
    durationSecs: 596,
    category: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    lastPlayedPositionSecs: 45, // Pre-seeded resume position to demonstrate resume!
    createdAt: Date.now() - 3600000 * 24 * 2,
    sourceDomain: 'commondatastorage.googleapis.com',
    isFavorite: true,
    tags: ['Favorites', 'Personal'],
  },
  {
    id: 'seed_video_2',
    title: 'Elephants Dream (Sci-Fi Short)',
    fileName: 'ElephantsDream_720p.mp4',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    mimeType: 'video/mp4',
    sizeBytes: 88562145,
    durationSecs: 653,
    category: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    lastPlayedPositionSecs: 0,
    createdAt: Date.now() - 3600000 * 24 * 3,
    sourceDomain: 'commondatastorage.googleapis.com',
    tags: ['Work'],
  },
  {
    id: 'seed_audio_1',
    title: 'Deep Space Soundscape (Creative Commons)',
    fileName: 'scifi_space_atmosphere.ogg',
    uri: 'https://actions.google.com/sounds/v1/science_fiction/scifi_space_atmosphere.ogg',
    mimeType: 'audio/ogg',
    sizeBytes: 3412580,
    durationSecs: 142,
    category: 'audio',
    lastPlayedPositionSecs: 12,
    createdAt: Date.now() - 3600000 * 12,
    sourceDomain: 'actions.google.com',
    isFavorite: true,
    tags: ['Favorites'],
  },
  {
    id: 'seed_doc_1',
    title: 'Modern Android Architecture Guide',
    fileName: 'mad-arch-guide.pdf',
    uri: 'https://developer.android.com/static/topic/libraries/architecture/images/mad-arch-guide.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 4210000,
    category: 'document',
    lastPlayedPositionSecs: 0,
    createdAt: Date.now() - 3600000 * 24 * 35, // >30 days old to demonstrate Storage Optimizer!
    sourceDomain: 'developer.android.com',
    tags: ['Study', 'Work'],
  }
];

export function getStoredMedia(): MediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MEDIA));
      return DEFAULT_MEDIA;
    }
    const items = JSON.parse(raw);
    return Array.isArray(items) && items.length > 0 ? items : DEFAULT_MEDIA;
  } catch {
    return DEFAULT_MEDIA;
  }
}

export function saveStoredMedia(items: MediaItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save media library', e);
  }
}

export function addMediaItem(item: MediaItem): void {
  const current = getStoredMedia();
  const existingIdx = current.findIndex(m => m.id === item.id || m.fileName === item.fileName);
  if (existingIdx >= 0) {
    current[existingIdx] = { ...current[existingIdx], ...item };
  } else {
    current.unshift(item);
  }
  saveStoredMedia(current);
}

export function removeMediaItem(id: string): void {
  const current = getStoredMedia().filter(m => m.id !== id);
  saveStoredMedia(current);
}

export function renameMediaItem(id: string, newTitle: string): void {
  const current = getStoredMedia().map(m => {
    if (m.id === id) {
      return { ...m, title: newTitle };
    }
    return m;
  });
  saveStoredMedia(current);
}

export function updateMediaItemTags(id: string, tags: string[]): void {
  const current = getStoredMedia().map(m => {
    if (m.id === id) {
      return { ...m, tags };
    }
    return m;
  });
  saveStoredMedia(current);
}

export function savePlaybackPosition(id: string, positionSecs: number): void {
  try {
    // 1. Update in media store item
    const current = getStoredMedia().map(m => {
      if (m.id === id) {
        return { ...m, lastPlayedPositionSecs: Math.floor(positionSecs) };
      }
      return m;
    });
    saveStoredMedia(current);

    // 2. Also keep a fast lookup dictionary
    const positionsRaw = localStorage.getItem(PLAYBACK_POSITION_KEY);
    const positions = positionsRaw ? JSON.parse(positionsRaw) : {};
    positions[id] = Math.floor(positionSecs);
    localStorage.setItem(PLAYBACK_POSITION_KEY, JSON.stringify(positions));
  } catch (e) {
    console.warn('Could not save playback position', e);
  }
}

export function getPlaybackPosition(id: string): number {
  try {
    const positionsRaw = localStorage.getItem(PLAYBACK_POSITION_KEY);
    if (positionsRaw) {
      const positions = JSON.parse(positionsRaw);
      if (positions[id] !== undefined) return positions[id];
    }
    const item = getStoredMedia().find(m => m.id === id);
    return item?.lastPlayedPositionSecs || 0;
  } catch {
    return 0;
  }
}

export function sortMediaItems(items: MediaItem[], sort: LibrarySort): MediaItem[] {
  const copy = [...items];
  switch (sort) {
    case 'date_desc':
      return copy.sort((a, b) => b.createdAt - a.createdAt);
    case 'date_asc':
      return copy.sort((a, b) => a.createdAt - b.createdAt);
    case 'name_asc':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'size_desc':
      return copy.sort((a, b) => b.sizeBytes - a.sizeBytes);
    default:
      return copy;
  }
}
