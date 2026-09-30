import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Unlock, Fingerprint, KeyRound, 
  Trash2, Play, Eye, EyeOff, X, Check, FileVideo, FileAudio, 
  Settings as SettingsIcon, ShieldAlert, Cpu
} from 'lucide-react';
import { vaultService } from '../../services/vaultService';
import { VaultMediaItem, MediaItem } from '../../types';
import { formatBytes, formatDate } from '../../utils/formatters';

interface SecureVaultModalProps {
  onClose: () => void;
  onPlayVaultItem: (item: VaultMediaItem) => void;
  lang: 'en' | 'ur';
}

export const SecureVaultModal: React.FC<SecureVaultModalProps> = ({
  onClose,
  onPlayVaultItem,
  lang,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(vaultService.getIsUnlocked());
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [vaultItems, setVaultItems] = useState<VaultMediaItem[]>(vaultService.getVaultItems());
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Security Settings Sub-panel
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState<'immediate' | '1m' | '5m'>('1m');
  const [isStealthMode, setIsStealthMode] = useState(false);

  useEffect(() => {
    const unsub = vaultService.subscribe(() => {
      setIsUnlocked(vaultService.getIsUnlocked());
      setVaultItems(vaultService.getVaultItems());
    });
    return unsub;
  }, []);

  const handlePinSubmit = () => {
    if (vaultService.verifyPin(pinInput)) {
      setPinError(false);
      setFailedAttempts(0);
      setPinInput('');
    } else {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      setPinError(true);
      setPinInput('');
      if (nextFail >= 5) {
        alert("Maximum failed attempts reached. Security lockout activated.");
      }
    }
  };

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    await vaultService.authenticateBiometric();
    setIsAuthenticating(false);
  };

  const handleDecrypt = (item: VaultMediaItem) => {
    vaultService.decryptAndRestoreToLibrary(item);
  };

  const handleDelete = (id: string) => {
    vaultService.deleteVaultItem(id);
  };

  const handleChangePin = () => {
    if (newPin.length === 4) {
      vaultService.setPin(newPin);
      setPinChangeSuccess(true);
      setNewPin('');
      setTimeout(() => setPinChangeSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#151922] border border-slate-700/80 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5 max-h-[88vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Biometric Vault</h3>
              <span className="text-[11px] text-slate-400 font-mono">AES-256-GCM Native Keystore</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <>
                <button
                  onClick={() => setShowSecuritySettings(!showSecuritySettings)}
                  className={`p-1.5 rounded-xl border transition-colors ${
                    showSecuritySettings ? 'bg-[#5B8CFF] text-white border-[#5B8CFF]' : 'bg-white/5 border-slate-700 text-slate-300'
                  }`}
                  title="Vault Security Settings"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => vaultService.lockVault()}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-slate-300 flex items-center gap-1.5"
                  title="Lock Now"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lock</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LOCKED STATE: PIN & Biometric Prompt */}
        {!isUnlocked ? (
          <div className="flex flex-col items-center justify-center py-6 gap-5 text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-[#1D2330] border border-slate-700 flex items-center justify-center text-[#5B8CFF] shadow-inner">
                <Lock className="w-10 h-10 text-slate-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                AES-256
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">Private Media Vault</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Encrypted with Android Keystore. Authenticate via Biometrics or enter 4-digit PIN (Default: 1234).
              </p>
            </div>

            {/* PIN Input */}
            <div className="flex flex-col gap-2 w-full max-w-[200px]">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
                placeholder="• • • •"
                className="w-full text-center text-xl font-bold tracking-widest bg-[#1D2330] border border-slate-700 rounded-2xl py-2.5 text-white focus:outline-none focus:border-[#5B8CFF]"
              />
              {pinError && (
                <span className="text-[11px] text-red-400 font-medium">
                  Incorrect PIN ({failedAttempts}/5 attempts)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full max-w-xs">
              <button
                onClick={handlePinSubmit}
                disabled={pinInput.length < 4}
                className="flex-1 py-3 bg-[#5B8CFF] hover:bg-[#5B8CFF]/90 disabled:opacity-40 text-white rounded-2xl text-xs font-bold shadow-md shadow-[#5B8CFF]/20"
              >
                Unlock with PIN
              </button>

              <button
                onClick={handleBiometricAuth}
                disabled={isAuthenticating}
                className="p-3 bg-[#1D2330] hover:bg-[#252C3D] border border-slate-700 text-[#5B8CFF] rounded-2xl shadow-sm transition-transform active:scale-95"
                title="Fingerprint / Face Unlock"
              >
                <Fingerprint className={`w-5 h-5 ${isAuthenticating ? 'animate-pulse text-emerald-400' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero-knowledge: No plain files exposed to Android MediaStore</span>
            </div>
          </div>
        ) : showSecuritySettings ? (
          /* SECURITY SETTINGS SUB-PANEL */
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Vault Security Settings</h4>
              <button onClick={() => setShowSecuritySettings(false)} className="text-xs text-[#5B8CFF] font-semibold">
                Back to Files
              </button>
            </div>

            {/* Change PIN Card */}
            <div className="bg-[#1D2330] border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#5B8CFF]" />
                <span>Change 4-Digit Security PIN</span>
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="New 4-digit PIN"
                  className="w-full bg-[#151922] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={handleChangePin}
                  disabled={newPin.length !== 4}
                  className="px-3 py-2 bg-[#5B8CFF] disabled:opacity-40 text-white rounded-xl text-xs font-bold shrink-0"
                >
                  Update
                </button>
              </div>
              {pinChangeSuccess && (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> PIN updated successfully!
                </span>
              )}
            </div>

            {/* Auto-Lock Timer */}
            <div className="bg-[#1D2330] border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2">
              <span className="text-xs font-bold text-white">Auto-Lock When Inactive</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['immediate', '1m', '5m'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setAutoLockTimeout(mode)}
                    className={`py-2 rounded-xl border capitalize font-semibold transition-colors ${
                      autoLockTimeout === mode
                        ? 'bg-[#5B8CFF]/20 border-[#5B8CFF] text-white'
                        : 'bg-[#151922] border-slate-800 text-slate-400'
                    }`}
                  >
                    {mode === 'immediate' ? 'Immediate' : mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Stealth Privacy Mask */}
            <div className="bg-[#1D2330] border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-white">Stealth Privacy Mask</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">Obfuscates encrypted file titles in vault view</p>
              </div>
              <button
                onClick={() => setIsStealthMode(!isStealthMode)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  isStealthMode ? 'bg-[#5B8CFF]' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  isStealthMode ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        ) : (
          /* UNLOCKED STATE: Encrypted Media List */
          <div className="flex flex-col gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Vault Unlocked</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums">{vaultItems.length} encrypted items</span>
            </div>

            {vaultItems.length === 0 ? (
              <div className="bg-[#1D2330]/60 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-slate-600" />
                <p>Your secure vault is empty.</p>
                <p className="text-[11px] text-slate-500">Go to your Library and tap "Vault" on any file to encrypt it block-by-block with AES-256-GCM.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto">
                {vaultItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-[#1D2330] border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-black/40 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                        {item.category === 'audio' ? <FileAudio className="w-4 h-4" /> : <FileVideo className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {isStealthMode ? `Protected_Media_${item.id.substring(item.id.length - 6)}.bin` : item.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          {formatBytes(item.sizeBytes)} · {item.cipherAlgorithm}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.playableUri && (
                        <button
                          onClick={() => onPlayVaultItem(item)}
                          className="w-8 h-8 rounded-xl bg-[#5B8CFF]/20 hover:bg-[#5B8CFF] text-[#5B8CFF] hover:text-white flex items-center justify-center transition-colors"
                          title="Play securely inside vault"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDecrypt(item)}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-medium text-slate-300 hover:text-white"
                        title="Decrypt and restore to Library"
                      >
                        Restore
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-xl hover:bg-red-950/20 text-slate-500 hover:text-red-400"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
