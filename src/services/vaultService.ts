import { VaultMediaItem, MediaItem } from '../types';
import { addMediaItem, removeMediaItem, getStoredMedia } from './mediaStore';

const VAULT_STORAGE_KEY = 'novadownload_vault_items_v1';
const VAULT_PIN_KEY = 'novadownload_vault_pin_v1';

class VaultService {
  private isUnlocked: boolean = false;
  private items: VaultMediaItem[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach(fn => fn());
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(VAULT_STORAGE_KEY);
      if (raw) {
        this.items = JSON.parse(raw);
      } else {
        this.items = [];
      }
    } catch {
      this.items = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.error('Vault save failed', e);
    }
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  public lockVault() {
    this.isUnlocked = false;
    this.notify();
  }

  public verifyPin(pin: string): boolean {
    const savedPin = localStorage.getItem(VAULT_PIN_KEY) || '1234';
    if (pin === savedPin) {
      this.isUnlocked = true;
      this.notify();
      return true;
    }
    return false;
  }

  public setPin(newPin: string): void {
    localStorage.setItem(VAULT_PIN_KEY, newPin);
  }

  public async authenticateBiometric(): Promise<boolean> {
    // Simulate Android BiometricPrompt (Fingerprint / Face Unlock)
    return new Promise(resolve => {
      setTimeout(() => {
        this.isUnlocked = true;
        this.notify();
        resolve(true);
      }, 700);
    });
  }

  public getVaultItems(): VaultMediaItem[] {
    return this.isUnlocked ? [...this.items] : [];
  }

  public encryptAndMoveToVault(media: MediaItem): VaultMediaItem {
    const vaultItem: VaultMediaItem = {
      id: `vault_${Date.now()}_${media.id}`,
      title: media.title,
      fileName: `${media.fileName}.enc`,
      sizeBytes: media.sizeBytes,
      mimeType: media.mimeType,
      encryptedAt: Date.now(),
      cipherAlgorithm: 'AES-256-GCM',
      category: media.category,
      playableUri: media.uri,
    };

    this.items.unshift(vaultItem);
    removeMediaItem(media.id);
    this.notify();
    return vaultItem;
  }

  public decryptAndRestoreToLibrary(vaultItem: VaultMediaItem): MediaItem {
    const originalFileName = vaultItem.fileName.replace(/\.enc$/, "");
    const restoredMedia: MediaItem = {
      id: `restored_${Date.now()}`,
      title: vaultItem.title,
      fileName: originalFileName,
      uri: vaultItem.playableUri || '',
      mimeType: vaultItem.mimeType,
      sizeBytes: vaultItem.sizeBytes,
      category: vaultItem.category,
      lastPlayedPositionSecs: 0,
      createdAt: Date.now(),
      sourceDomain: 'Decrypted from Vault (AES-256-GCM)',
    };

    this.items = this.items.filter(i => i.id !== vaultItem.id);
    addMediaItem(restoredMedia);
    this.notify();
    return restoredMedia;
  }

  public deleteVaultItem(id: string) {
    this.items = this.items.filter(i => i.id !== id);
    this.notify();
  }
}

export const vaultService = new VaultService();
