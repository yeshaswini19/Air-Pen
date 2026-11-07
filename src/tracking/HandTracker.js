
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

// MediaPipe's 21 landmark connections.
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

export class HandTracker {
  constructor(videoElement, canvasElement, onResults = () => {}) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    this.onResults = onResults;

    this.landmarker = null;
    this.animationFrame = null;
    this.lastVideoTime = -1;

    this.isRunning = false;
    this.isLoading = false;
  }

  async initialize() {
    if (this.landmarker) return;

    if (this.isLoading) {
      throw new Error('Hand tracking is already initializing.');
    }

    this.isLoading = true;

    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);

      this.landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL
        },

        runningMode: 'VIDEO',
        numHands: 2,

        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      console.log('MediaPipe Hand Landmarker initialized.');
    } catch (error) {
      this.landmarker?.close();
      this.landmarker = null;

      throw new Error(
        `Unable to initialize hand tracking: ${error.message}`
      );
    } finally {
      this.isLoading = false;
    }
  }

  async start() {
    if (this.isRunning) return;

    if (this.video.readyState < 2) {
      throw new Error('Camera video is not ready.');
    }

    await this.initialize();

    this.isRunning = true;
    this.lastVideoTime = -1;

    this.processFrame();
  }

  processFrame = () => {
    if (!this.isRunning) return;

    if (
      this.video.readyState >= 2 &&
      this.video.currentTime !== this.lastVideoTime
    ) {
      this.lastVideoTime = this.video.currentTime;

      const timestamp = performance.now();

      const results = this.landmarker.detectForVideo(
        this.video,
        timestamp
      );

      this.drawLandmarks(results);

      this.onResults({
        handCount: results.landmarks.length,
        landmarks: results.landmarks,
        handednesses: results.handednesses
      });
    }

    this.animationFrame = requestAnimationFrame(this.processFrame);
  };

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);

    if (
      this.canvas.width !== width ||
      this.canvas.height !== height
    ) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return {
      width: rect.width,
      height: rect.height
    };
  }

  getLandmarkPosition(landmark, width, height) {
    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;

    // Match the CSS object-fit: cover behaviour.
    const scale = Math.max(
      width / videoWidth,
      height / videoHeight
    );

    const renderedWidth = videoWidth * scale;
    const renderedHeight = videoHeight * scale;

    const offsetX = (width - renderedWidth) / 2;
    const offsetY = (height - renderedHeight) / 2;

    const x = landmark.x * renderedWidth + offsetX;
    const y = landmark.y * renderedHeight + offsetY;

    // Mirror coordinates to match the mirrored webcam preview.
    return {
      x: width - x,
      y
    };
  }

  drawLandmarks(results) {
    const { width, height } = this.resizeCanvas();

    this.ctx.clearRect(0, 0, width, height);

    results.landmarks.forEach((handLandmarks) => {
      const points = handLandmarks.map(landmark =>
        this.getLandmarkPosition(landmark, width, height)
      );

      // Draw connections.
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#A9CDB6';
      this.ctx.lineWidth = 2;

      HAND_CONNECTIONS.forEach(([start, end]) => {
        this.ctx.moveTo(points[start].x, points[start].y);
        this.ctx.lineTo(points[end].x, points[end].y);
      });

      this.ctx.stroke();

      // Draw landmark points.
      points.forEach((point, index) => {
        const isFingerTip = [4, 8, 12, 16, 20].includes(index);

        this.ctx.beginPath();

        this.ctx.arc(
          point.x,
          point.y,
          isFingerTip ? 5 : 3,
          0,
          Math.PI * 2
        );

        this.ctx.fillStyle = isFingerTip ? '#E96B50' : '#FBF8EE';
        this.ctx.fill();

        this.ctx.strokeStyle = '#292B26';
        this.ctx.lineWidth = 1.2;
        this.ctx.stroke();
      });
    });
  }

  stop() {
    this.isRunning = false;

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);

    this.onResults({
      handCount: 0,
      landmarks: [],
      handednesses: []
    });
  }

  destroy() {
    this.stop();

    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
  }
}
