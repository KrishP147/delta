/**
 * Speed Detector Service
 *
 * Detects user's speed using GPS for automatic transport mode detection.
 * Falls back to simulation when location is unavailable.
 */

import * as Location from "expo-location";

export class SpeedDetector {
  private isTracking = false;
  private currentSpeed = 0;
  private locationSubscription: Location.LocationSubscription | null = null;
  private simulationInterval: NodeJS.Timeout | null = null;
  private speedCallback: ((speed: number) => void) | null = null;

  /**
   * Start tracking speed
   */
  async startTracking(callback: (speed: number) => void): Promise<void> {
    if (this.isTracking) return;

    this.speedCallback = callback;

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.warn("Location permission not granted, using simulation");
        this.simulateSpeed();
        return;
      }

      // Start watching location for speed
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // Update every meter
        },
        (location) => {
          // Speed is in m/s, convert to km/h
          const speedKmh = (location.coords.speed || 0) * 3.6;
          this.currentSpeed = Math.max(0, speedKmh);

          if (this.speedCallback) {
            this.speedCallback(this.currentSpeed);
          }
        }
      );

      this.isTracking = true;
    } catch (error) {
      console.error("Error starting speed tracking:", error);
      // Fallback to simulation
      this.simulateSpeed();
    }
  }

  /**
   * Stop tracking speed
   */
  stopTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    this.isTracking = false;
    this.currentSpeed = 0;
  }

  /**
   * Simulate speed changes for testing/demo purposes
   */
  private simulateSpeed(): void {
    let baseSpeed = 0;
    let targetSpeed = 15; // Start with biking speed
    let mode: "walking" | "biking" | "driving" = "biking";

    const modeConfigs = {
      walking: { minSpeed: 2, maxSpeed: 6 },
      biking: { minSpeed: 10, maxSpeed: 25 },
      driving: { minSpeed: 25, maxSpeed: 60 },
    };

    this.simulationInterval = setInterval(() => {
      // Occasionally change mode (5% chance per update)
      if (Math.random() < 0.05) {
        const modes: Array<"walking" | "biking" | "driving"> = [
          "walking",
          "biking",
          "driving",
        ];
        mode = modes[Math.floor(Math.random() * modes.length)];
        const config = modeConfigs[mode];
        targetSpeed =
          config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
      }

      // Gradually adjust speed towards target (smooth transitions)
      const diff = targetSpeed - baseSpeed;
      baseSpeed += diff * 0.1;

      // Add realistic variation (± 1 km/h)
      const variation = (Math.random() - 0.5) * 2;
      this.currentSpeed = Math.max(0, baseSpeed + variation);

      if (this.speedCallback) {
        this.speedCallback(this.currentSpeed);
      }
    }, 1000);

    this.isTracking = true;
  }

  /**
   * Get current speed in km/h
   */
  getCurrentSpeed(): number {
    return this.currentSpeed;
  }

  /**
   * Get transport mode based on current speed
   */
  getSpeedMode(): "walking" | "biking" | "driving" {
    if (this.currentSpeed < 5) return "walking";
    if (this.currentSpeed < 25) return "biking";
    return "driving";
  }

  /**
   * Check if currently tracking
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}

// Singleton instance for easy access
let speedDetectorInstance: SpeedDetector | null = null;

export function getSpeedDetector(): SpeedDetector {
  if (!speedDetectorInstance) {
    speedDetectorInstance = new SpeedDetector();
  }
  return speedDetectorInstance;
}
