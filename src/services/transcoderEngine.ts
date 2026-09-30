import { TranscodeJob, MediaItem } from '../types';
import { addMediaItem } from './mediaStore';

type TranscodeListener = (jobs: TranscodeJob[]) => void;

class TranscoderEngine {
  private jobs: TranscodeJob[] = [];
  private listeners: Set<TranscodeListener> = new Set();
  private activeIntervals: Map<string, number> = new Map();

  public subscribe(listener: TranscodeListener): () => void {
    this.listeners.add(listener);
    listener([...this.jobs]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snapshot = [...this.jobs];
    this.listeners.forEach(fn => fn(snapshot));
  }

  public startTranscoding(
    media: MediaItem,
    targetCodec: 'hevc' | 'av1' | 'h264' = 'hevc',
    onComplete?: (newMedia: MediaItem) => void
  ): TranscodeJob {
    // HEVC achieves ~60-70% compression, AV1 achieves ~70-75% compression
    const compressionRatio = targetCodec === 'av1' ? 0.28 : targetCodec === 'hevc' ? 0.35 : 0.65;
    const estimatedTargetSize = Math.round(media.sizeBytes * compressionRatio);

    const job: TranscodeJob = {
      id: `transcode_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      mediaId: media.id,
      fileName: media.fileName,
      sourceSize: media.sizeBytes,
      estimatedTargetSize,
      codec: targetCodec,
      progress: 0,
      status: 'processing',
    };

    this.jobs.unshift(job);
    this.notify();

    // Hardware-accelerated MediaCodec pipeline simulation
    let currentProgress = 0;
    const interval = window.setInterval(() => {
      currentProgress += 5 + Math.random() * 8;
      const targetJob = this.jobs.find(j => j.id === job.id);
      if (!targetJob) {
        clearInterval(interval);
        return;
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        targetJob.progress = 100;
        targetJob.status = 'completed';
        targetJob.actualTargetSize = estimatedTargetSize;
        targetJob.savedBytesPercent = Math.round((1 - compressionRatio) * 100);

        // Add newly transcoded compressed video to Media Library!
        const cleanName = media.fileName.replace(/\.[^/.]+$/, "");
        const newMediaItem: MediaItem = {
          id: `media_transcoded_${Date.now()}`,
          title: `${media.title} [${targetCodec.toUpperCase()} Compressed]`,
          fileName: `${cleanName}_${targetCodec.toUpperCase()}.mp4`,
          uri: media.uri,
          mimeType: 'video/mp4',
          sizeBytes: estimatedTargetSize,
          durationSecs: media.durationSecs,
          category: 'video',
          thumbnail: media.thumbnail,
          lastPlayedPositionSecs: 0,
          createdAt: Date.now(),
          sourceDomain: `Hardware MediaCodec (${targetCodec.toUpperCase()})`,
        };

        addMediaItem(newMediaItem);
        if (onComplete) onComplete(newMediaItem);
        this.notify();
      } else {
        targetJob.progress = Math.min(99, Math.round(currentProgress));
        this.notify();
      }
    }, 300);

    this.activeIntervals.set(job.id, interval);
    return job;
  }

  public cancelTranscode(jobId: string) {
    if (this.activeIntervals.has(jobId)) {
      clearInterval(this.activeIntervals.get(jobId));
      this.activeIntervals.delete(jobId);
    }
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      job.status = 'failed';
      this.notify();
    }
  }

  public getJobs(): TranscodeJob[] {
    return [...this.jobs];
  }
}

export const transcoderEngine = new TranscoderEngine();
