/**
 * Screen Recorder Service
 *
 * Records short video clips with bounding box overlays.
 * Uses expo-av for video recording and captures the camera feed
 * with detection overlays rendered on top.
 */

import { Paths, File, Directory } from 'expo-file-system';
import { CameraView } from 'expo-camera';
import { DetectedObject } from './api';

export interface RecordingSettings {
  maxDurationSeconds: number;  // Maximum clip duration (default: 30)
  quality: 'low' | 'medium' | 'high';
}

export interface RecordingClip {
  id: string;
  uri: string;
  duration: number;
  timestamp: Date;
  thumbnail?: string;
  objectsDetected: number;
  hasAlerts: boolean;
}

const DEFAULT_SETTINGS: RecordingSettings = {
  maxDurationSeconds: 30,
  quality: 'medium',
};

// Directory for storing recordings - using new expo-file-system API
const getRecordingsDir = () => new Directory(Paths.document, 'recordings');

class ScreenRecorderService {
  private isRecording: boolean = false;
  private recordingStartTime: number = 0;
  private currentCameraRef: CameraView | null = null;
  private settings: RecordingSettings = DEFAULT_SETTINGS;
  private clips: RecordingClip[] = [];
  private recordingTimer: NodeJS.Timeout | null = null;
  private detectedObjectsCount: number = 0;
  private hasAlertsInClip: boolean = false;

  constructor() {
    this.ensureRecordingsDirectory();
  }

  private async ensureRecordingsDirectory(): Promise<void> {
    try {
      const recordingsDir = getRecordingsDir();
      if (!recordingsDir.exists) {
        recordingsDir.create();
      }
    } catch (error) {
      console.error('[ScreenRecorder] Failed to create recordings directory:', error);
    }
  }

  /**
   * Start recording a video clip
   */
  async startRecording(cameraRef: CameraView): Promise<boolean> {
    if (this.isRecording) {
      console.warn('[ScreenRecorder] Already recording');
      return false;
    }

    try {
      this.currentCameraRef = cameraRef;
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.detectedObjectsCount = 0;
      this.hasAlertsInClip = false;

      // Start the camera recording
      const recordPromise = cameraRef.recordAsync({
        maxDuration: this.settings.maxDurationSeconds,
      });

      // Set up auto-stop timer
      this.recordingTimer = setTimeout(() => {
        this.stopRecording();
      }, this.settings.maxDurationSeconds * 1000);

      console.log('[ScreenRecorder] Recording started');

      // Handle recording completion
      recordPromise.then(async (video) => {
        if (video && video.uri) {
          await this.saveClip(video.uri);
        }
      }).catch((error) => {
        console.error('[ScreenRecorder] Recording error:', error);
      });

      return true;
    } catch (error) {
      console.error('[ScreenRecorder] Failed to start recording:', error);
      this.isRecording = false;
      return false;
    }
  }

  /**
   * Stop the current recording
   */
  async stopRecording(): Promise<RecordingClip | null> {
    if (!this.isRecording || !this.currentCameraRef) {
      return null;
    }

    try {
      // Clear the auto-stop timer
      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer);
        this.recordingTimer = null;
      }

      // Stop the camera recording
      this.currentCameraRef.stopRecording();

      const duration = (Date.now() - this.recordingStartTime) / 1000;
      this.isRecording = false;

      console.log(`[ScreenRecorder] Recording stopped. Duration: ${duration.toFixed(1)}s`);

      // The clip will be saved in the recordAsync promise handler
      return null;
    } catch (error) {
      console.error('[ScreenRecorder] Failed to stop recording:', error);
      this.isRecording = false;
      return null;
    }
  }

  /**
   * Save a recorded clip
   */
  private async saveClip(tempUri: string): Promise<RecordingClip | null> {
    try {
      const clipId = `clip_${Date.now()}`;
      const fileName = `${clipId}.mp4`;
      const recordingsDir = getRecordingsDir();
      const destFile = new File(recordingsDir, fileName);

      // Move the temp file to permanent storage
      const tempFile = new File(tempUri);
      await tempFile.move(destFile);

      const duration = (Date.now() - this.recordingStartTime) / 1000;

      const clip: RecordingClip = {
        id: clipId,
        uri: destFile.uri,
        duration,
        timestamp: new Date(),
        objectsDetected: this.detectedObjectsCount,
        hasAlerts: this.hasAlertsInClip,
      };

      this.clips.push(clip);
      console.log(`[ScreenRecorder] Clip saved: ${fileName}`);

      return clip;
    } catch (error) {
      console.error('[ScreenRecorder] Failed to save clip:', error);
      return null;
    }
  }

  /**
   * Update detection stats for the current recording
   */
  updateDetectionStats(objects: DetectedObject[]): void {
    if (!this.isRecording) return;

    this.detectedObjectsCount += objects.length;

    // Check if any objects have alerts
    const hasAlerts = objects.some(obj => obj.isProblematicColor || obj.alertPriority === 'critical');
    if (hasAlerts) {
      this.hasAlertsInClip = true;
    }
  }

  /**
   * Get recording status
   */
  getStatus(): { isRecording: boolean; duration: number } {
    return {
      isRecording: this.isRecording,
      duration: this.isRecording ? (Date.now() - this.recordingStartTime) / 1000 : 0,
    };
  }

  /**
   * Get all saved clips
   */
  async getClips(): Promise<RecordingClip[]> {
    return this.clips;
  }

  /**
   * Delete a clip
   */
  async deleteClip(clipId: string): Promise<boolean> {
    try {
      const clipIndex = this.clips.findIndex(c => c.id === clipId);
      if (clipIndex === -1) return false;

      const clip = this.clips[clipIndex];
      const file = new File(clip.uri);
      if (file.exists) {
        await file.delete();
      }
      this.clips.splice(clipIndex, 1);

      console.log(`[ScreenRecorder] Clip deleted: ${clipId}`);
      return true;
    } catch (error) {
      console.error('[ScreenRecorder] Failed to delete clip:', error);
      return false;
    }
  }

  /**
   * Delete all clips
   */
  async deleteAllClips(): Promise<void> {
    try {
      for (const clip of this.clips) {
        const file = new File(clip.uri);
        if (file.exists) {
          await file.delete();
        }
      }
      this.clips = [];
      console.log('[ScreenRecorder] All clips deleted');
    } catch (error) {
      console.error('[ScreenRecorder] Failed to delete all clips:', error);
    }
  }

  /**
   * Get total storage used by clips
   */
  async getStorageUsed(): Promise<number> {
    let totalSize = 0;
    try {
      for (const clip of this.clips) {
        const file = new File(clip.uri);
        if (file.exists) {
          totalSize += file.size || 0;
        }
      }
    } catch (error) {
      console.error('[ScreenRecorder] Failed to calculate storage:', error);
    }
    return totalSize;
  }

  /**
   * Update recording settings
   */
  setSettings(settings: Partial<RecordingSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   */
  getSettings(): RecordingSettings {
    return { ...this.settings };
  }
}

// Export singleton instance
export const screenRecorder = new ScreenRecorderService();
