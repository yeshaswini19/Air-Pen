
export class GestureRecognizer {
  constructor(options = {}) {
    this.smoothingFactor = options.smoothingFactor ?? 0.35;
    this.stableFramesRequired = options.stableFramesRequired ?? 4;

    this.smoothedLandmarks = null;
    this.pendingGesture = null;
    this.pendingFrames = 0;
    this.currentGesture = 'NONE';
  }

  distance(a, b) {
    return Math.hypot(
      a.x - b.x,
      a.y - b.y
    );
  }

  smoothLandmarks(landmarks) {
    if (!this.smoothedLandmarks) {
      this.smoothedLandmarks = landmarks.map(point => ({ ...point }));
      return this.smoothedLandmarks;
    }

    this.smoothedLandmarks = landmarks.map((point, index) => {
      const previous = this.smoothedLandmarks[index];

      return {
        x: previous.x + (point.x - previous.x) * this.smoothingFactor,
        y: previous.y + (point.y - previous.y) * this.smoothingFactor,
        z: previous.z + (point.z - previous.z) * this.smoothingFactor
      };
    });

    return this.smoothedLandmarks;
  }

  isFingerExtended(landmarks, tipIndex, pipIndex) {
    const wrist = landmarks[0];
    const tip = landmarks[tipIndex];
    const pip = landmarks[pipIndex];

    return (
      this.distance(wrist, tip) >
      this.distance(wrist, pip) * 1.15
    );
  }

  detectGesture(landmarks) {
    if (!landmarks || landmarks.length !== 21) {
      return 'NONE';
    }

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleMcp = landmarks[9];

    const palmSize = this.distance(wrist, middleMcp);

    if (palmSize < 0.0001) {
      return 'NONE';
    }

    // Detect thumb-index pinch relative to palm size.
    const pinchDistance = this.distance(thumbTip, indexTip);
    const normalizedPinchDistance = pinchDistance / palmSize;

    const indexExtended = this.isFingerExtended(landmarks, 8, 6);
    const middleExtended = this.isFingerExtended(landmarks, 12, 10);
    const ringExtended = this.isFingerExtended(landmarks, 16, 14);
    const pinkyExtended = this.isFingerExtended(landmarks, 20, 18);

    // Pinch has priority over other gestures.
    if (normalizedPinchDistance < 0.32) {
      return 'PINCH';
    }

    // All four fingers extended.
    if (
      indexExtended &&
      middleExtended &&
      ringExtended &&
      pinkyExtended
    ) {
      return 'OPEN_PALM';
    }

    // All four fingers curled.
    if (
      !indexExtended &&
      !middleExtended &&
      !ringExtended &&
      !pinkyExtended
    ) {
      return 'FIST';
    }

    // Only the index finger extended.
    if (
      indexExtended &&
      !middleExtended &&
      !ringExtended &&
      !pinkyExtended
    ) {
      return 'POINTING';
    }

    return 'UNKNOWN';
  }

  update(landmarks) {
    if (!landmarks || landmarks.length !== 21) {
      this.reset();
      return {
        gesture: 'NONE',
        stable: false
      };
    }

    const smoothed = this.smoothLandmarks(landmarks);
    const detectedGesture = this.detectGesture(smoothed);

    if (detectedGesture === this.pendingGesture) {
      this.pendingFrames++;
    } else {
      this.pendingGesture = detectedGesture;
      this.pendingFrames = 1;
    }

    const stable = this.pendingFrames >= this.stableFramesRequired;

    if (stable) {
      this.currentGesture = detectedGesture;
    }

    return {
      gesture: this.currentGesture,
      detectedGesture,
      stable,
      landmarks: smoothed
    };
  }

  reset() {
    this.smoothedLandmarks = null;
    this.pendingGesture = null;
    this.pendingFrames = 0;
    this.currentGesture = 'NONE';
  }
}
