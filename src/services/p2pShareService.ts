import { P2PPeer, P2PTransferProgress, MediaItem } from '../types';

export const SAMPLE_PEERS: P2PPeer[] = [
  {
    id: 'peer_s24',
    deviceName: 'Galaxy S24 Ultra (Living Room)',
    ipAddress: '192.168.49.12',
    osVersion: 'Android 14 (OneUI 6.1)',
    signalStrength: 95,
    status: 'available',
  },
  {
    id: 'peer_pixel9',
    deviceName: 'Pixel 9 Pro (Nova Direct)',
    ipAddress: '192.168.49.27',
    osVersion: 'Android 15 (Vanilla Ice Cream)',
    signalStrength: 88,
    status: 'available',
  },
  {
    id: 'peer_xiaomi14',
    deviceName: 'Xiaomi 14 (Desk)',
    ipAddress: '192.168.49.34',
    osVersion: 'Android 14 (HyperOS)',
    signalStrength: 72,
    status: 'available',
  }
];

class P2PShareService {
  private peers: P2PPeer[] = SAMPLE_PEERS;
  private currentTransfer: P2PTransferProgress | null = null;
  private listeners: Set<() => void> = new Set();
  private intervalId: number | null = null;

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public getPeers(): P2PPeer[] {
    return [...this.peers];
  }

  public getCurrentTransfer(): P2PTransferProgress | null {
    return this.currentTransfer;
  }

  public startTransfer(media: MediaItem, peer: P2PPeer, onComplete?: () => void) {
    if (this.intervalId) clearInterval(this.intervalId);

    const totalBytes = media.sizeBytes;
    let transferred = 0;
    // Wi-Fi Direct speed ~40-50 MB/s
    const transferSpeedBytesPerSec = 45 * 1024 * 1024; // 45 MB/s

    this.currentTransfer = {
      fileName: media.fileName,
      totalBytes,
      transferredBytes: 0,
      speedBytesPerSec: transferSpeedBytesPerSec,
      peerName: peer.deviceName,
      status: 'transferring',
    };
    this.notify();

    let lastTime = performance.now();
    this.intervalId = window.setInterval(() => {
      const now = performance.now();
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      const added = Math.round(transferSpeedBytesPerSec * deltaSec * (0.8 + Math.random() * 0.4));
      transferred = Math.min(totalBytes, transferred + added);

      if (this.currentTransfer) {
        this.currentTransfer.transferredBytes = transferred;
        this.currentTransfer.speedBytesPerSec = Math.round(added / Math.max(deltaSec, 0.05));

        if (transferred >= totalBytes) {
          clearInterval(this.intervalId!);
          this.intervalId = null;
          this.currentTransfer.status = 'completed';
          this.notify();
          if (onComplete) onComplete();
          setTimeout(() => {
            this.currentTransfer = null;
            this.notify();
          }, 3000);
          return;
        }
      }
      this.notify();
    }, 200);
  }

  public cancelTransfer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.currentTransfer) {
      this.currentTransfer.status = 'cancelled';
      this.notify();
      setTimeout(() => {
        this.currentTransfer = null;
        this.notify();
      }, 1500);
    }
  }
}

export const p2pShareService = new P2PShareService();
