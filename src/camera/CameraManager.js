
export class CameraManager {
  constructor(videoElement) {
    this.video = videoElement;
    this.stream = null;
    this.isActive = false;
  }

  async start() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported by this browser.");
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });

      this.video.srcObject = this.stream;
      await this.video.play();

      this.isActive = true;
      return true;

    } catch (error) {
      this.stop();

      if (error.name === "NotAllowedError") {
        throw new Error("Camera permission was denied. Please allow camera access.");
      }

      if (error.name === "NotFoundError") {
        throw new Error("No webcam was found on this device.");
      }

      if (error.name === "NotReadableError") {
        throw new Error("Camera is already being used by another application.");
      }

      throw new Error(error.message || "Unable to start the camera.");
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.video.srcObject = null;
    this.isActive = false;
  }
}
