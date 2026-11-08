
import './style.css';

import { DrawingEngine } from './engine/DrawingEngine.js';
import { CameraManager } from './camera/CameraManager.js';
import { HandTracker } from './tracking/HandTracker.js';
import { GestureRecognizer } from './gestures/GestureRecognizer.js';

document.querySelector('#app').innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">✳</span>
        <span class="brand-name">AIR PEN</span>
        <span class="brand-tag">DRAW BEYOND THE SCREEN</span>
      </div>
      <div class="document-title">Untitled Artwork</div>
      <div class="top-actions">
        <button class="icon-button" id="undo-btn" title="Undo">↶</button>
        <button class="icon-button" id="redo-btn" title="Redo">↷</button>
        <button class="icon-button" id="clear-btn" title="Clear canvas">⌫</button>
        <button class="action-button" id="save-btn">Save</button>
        <button class="action-button primary-action" id="export-btn">Export</button>
      </div>
    </header>

    <main class="workspace">
      <aside class="left-panel">
        <div class="panel-label">TOOLS</div>
        <div class="tool-list">
          <button class="tool-button active" data-tool="Brush"><span>✎</span><small>Brush</small></button>
          <button class="tool-button" data-tool="Eraser"><span>◩</span><small>Eraser</small></button>
          <button class="tool-button" data-tool="Select"><span>⌖</span><small>Select</small></button>
          <button class="tool-button" data-tool="Shapes"><span>◇</span><small>Shapes</small></button>
          <button class="tool-button" data-tool="Symmetry"><span>✥</span><small>Symmetry</small></button>
          <button class="tool-button" data-tool="Mandala"><span>❋</span><small>Mandala</small></button>
        </div>
        <div class="left-panel-bottom">
          <span class="shortcut-label">AIR PEN v1.0</span>
        </div>
      </aside>

      <section class="canvas-area">
        <div class="canvas-toolbar">
          <div>
            <span class="canvas-heading">Creative workspace</span>
            <span class="canvas-subheading">Your space. Your imagination.</span>
          </div>
          <div class="canvas-controls">
            <button id="zoom-out" class="small-control" title="Zoom out">−</button>
            <span id="zoom-level">100%</span>
            <button id="zoom-in" class="small-control" title="Zoom in">+</button>
            <button id="rotate-left" class="small-control" title="Rotate left">↶</button>
            <button id="rotate-right" class="small-control" title="Rotate right">↷</button>
            <button id="reset-view" class="small-control" title="Reset view">⟲</button>
          </div>
        </div>

        <div class="canvas-container">
          <canvas id="drawing-canvas"></canvas>
          <div class="air-cursor" id="air-cursor" aria-hidden="true">
            <span class="air-cursor-core"></span>
            <span class="air-cursor-label">AIR PEN</span>
          </div>
          <div class="canvas-empty" id="canvas-empty">
            <span class="empty-symbol">✳</span>
            <h2>Your canvas is waiting.</h2>
            <p>Pick a colour, choose your brush and start creating.</p>
          </div>
        </div>

        <div class="canvas-footer">
          <span>CANVAS · 1280 × 720</span>
          <span id="rotation-level">ROTATION · 0°</span>
          <span>DESIGNED TO CREATE</span>
        </div>
      </section>

      <aside class="right-panel">
        <section class="inspector-section">
          <div class="panel-label">TOOL SETTINGS</div>
          <div class="setting-row">
            <span>Active tool</span>
            <strong id="active-tool-label">Brush</strong>
          </div>
          <div class="setting-block">
            <div class="setting-row">
              <label for="brush-size">Brush size</label>
              <strong id="brush-size-value">8 px</strong>
            </div>
            <input type="range" id="brush-size" min="1" max="40" value="8" />
          </div>
        </section>

        <section class="inspector-section">
          <div class="panel-label">COLOUR PALETTE</div>
          <div class="color-palette">
            <button class="color-swatch selected" data-color="#E96B50" style="--swatch:#E96B50"></button>
            <button class="color-swatch" data-color="#292B26" style="--swatch:#292B26"></button>
            <button class="color-swatch" data-color="#A9CDB6" style="--swatch:#A9CDB6"></button>
            <button class="color-swatch" data-color="#E9C968" style="--swatch:#E9C968"></button>
            <button class="color-swatch" data-color="#536FC1" style="--swatch:#536FC1"></button>
            <button class="color-swatch" data-color="#F4A7B9" style="--swatch:#F4A7B9"></button>
          </div>
        </section>

        <section class="inspector-section">
          <div class="section-heading">
            <div class="panel-label">LAYERS</div>
            <button class="text-button" id="add-layer-btn">+ Add</button>
          </div>
          <div class="layer-item">
            <span class="layer-eye">◉</span>
            <span>Layer 01</span>
            <span class="layer-tag">ACTIVE</span>
          </div>
          <p class="muted-note">Layer controls will be enabled in a later phase.</p>
        </section>

        <section class="inspector-section camera-section">
          <div class="section-heading">
            <div class="panel-label">CAMERA STUDIO</div>
            <span class="camera-indicator" id="camera-indicator"></span>
          </div>
          <div class="camera-preview" id="camera-preview">
            <video id="camera-video" autoplay muted playsinline></video>
            <canvas id="hand-overlay"></canvas>
            <div class="camera-placeholder" id="camera-placeholder">
              <span class="camera-placeholder-icon">◎</span>
              <span>Camera is inactive</span>
            </div>
            <span class="camera-live-label" id="camera-live-label">LIVE</span>
          </div>
          <div class="camera-status" id="camera-status" role="status">Camera is currently off.</div>
          <button class="camera-button" id="camera-toggle-btn">
            <span id="camera-button-icon">◉</span>
            <span id="camera-button-text">Start Camera</span>
          </button>
        </section>

        <section class="inspector-section gesture-section">
          <div class="panel-label">GESTURE RECOGNITION</div>
          <div class="gesture-status">
            <span class="gesture-dot" id="gesture-dot"></span>
            <span id="gesture-status-text">Tracking not started</span>
          </div>
          <p class="muted-note" id="gesture-detail">Start your camera to recognise hand gestures.</p>
        </section>
      </aside>
    </main>

    <footer class="statusbar">
      <span><span class="status-dot"></span> SYSTEM READY</span>
      <span>DRAWING ENGINE ACTIVE</span>
      <span id="footer-camera-status">CAMERA OFF</span>
    </footer>
  </div>
`;

// --------------------------------------------------
// DRAWING ENGINE
// --------------------------------------------------

const canvas = document.querySelector('#drawing-canvas');
const drawingEngine = new DrawingEngine(canvas);

const canvasEmpty = document.querySelector('#canvas-empty');
const activeToolLabel = document.querySelector('#active-tool-label');

function updateCanvasEmptyState() {
  canvasEmpty.classList.toggle('hidden', drawingEngine.strokes.length > 0);
}

function updateActiveTool(tool) {
  activeToolLabel.textContent = tool;

  document.querySelectorAll('.tool-button').forEach(button => {
    button.classList.toggle('active', button.dataset.tool === tool);
  });
}

document.querySelectorAll('.tool-button').forEach(button => {
  button.addEventListener('click', () => {
    const tool = button.dataset.tool;

    drawingEngine.stopDrawing();
    drawingEngine.setTool(tool);
    updateActiveTool(tool);
  });
});

// --------------------------------------------------
// VIEWPORT UI
// --------------------------------------------------

const zoomLevel = document.querySelector('#zoom-level');
const rotationLevel = document.querySelector('#rotation-level');

function updateViewportUI(viewport) {
  zoomLevel.textContent = `${Math.round(viewport.zoom * 100)}%`;

  const degrees = Math.round(
    viewport.rotation * 180 / Math.PI
  );

  rotationLevel.textContent = `ROTATION · ${degrees}°`;
}

drawingEngine.onViewportChange = updateViewportUI;
updateViewportUI(drawingEngine.viewport);

document.querySelector('#zoom-in').addEventListener('click', () => {
  drawingEngine.zoomBy(1.1);
});

document.querySelector('#zoom-out').addEventListener('click', () => {
  drawingEngine.zoomBy(1 / 1.1);
});

document.querySelector('#rotate-left').addEventListener('click', () => {
  drawingEngine.rotateBy(-Math.PI / 12);
});

document.querySelector('#rotate-right').addEventListener('click', () => {
  drawingEngine.rotateBy(Math.PI / 12);
});

document.querySelector('#reset-view').addEventListener('click', () => {
  drawingEngine.resetViewport();
});

// --------------------------------------------------
// BRUSH SIZE
// --------------------------------------------------

const brushSizeInput = document.querySelector('#brush-size');
const brushSizeValue = document.querySelector('#brush-size-value');

brushSizeInput.addEventListener('input', event => {
  const size = Number(event.target.value);

  brushSizeValue.textContent = `${size} px`;
  drawingEngine.setBrushSize(size);

  if (airCursor.classList.contains('visible')) {
    updateAirCursorAppearance(currentCursorMode);
  }
});

// --------------------------------------------------
// COLOUR PALETTE
// --------------------------------------------------

document.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach(item => {
      item.classList.remove('selected');
    });

    swatch.classList.add('selected');
    drawingEngine.setColor(swatch.dataset.color);

    if (airCursor.classList.contains('visible')) {
      updateAirCursorAppearance(currentCursorMode);
    }
  });
});

// --------------------------------------------------
// UNDO / REDO / CLEAR
// --------------------------------------------------

document.querySelector('#undo-btn').addEventListener('click', () => {
  drawingEngine.undo();
  updateCanvasEmptyState();
});

document.querySelector('#redo-btn').addEventListener('click', () => {
  drawingEngine.redo();
  updateCanvasEmptyState();
});

document.querySelector('#clear-btn').addEventListener('click', () => {
  if (window.confirm('Clear your entire canvas?')) {
    drawingEngine.clear();
    updateCanvasEmptyState();
  }
});

// --------------------------------------------------
// CAMERA MANAGER
// --------------------------------------------------

const video = document.querySelector('#camera-video');
const cameraManager = new CameraManager(video);

// --------------------------------------------------
// GESTURE RECOGNITION
// --------------------------------------------------

const gestureRecognizers = new Map();

const gestureNames = {
  PINCH: 'Pinch',
  OPEN_PALM: 'Open palm',
  FIST: 'Fist',
  POINTING: 'Pointing',
  UNKNOWN: 'Hand detected',
  NONE: 'Detecting gesture...'
};

function getGestureLabel(gesture) {
  return gestureNames[gesture] || 'Detecting gesture...';
}

function resetGestureRecognizers() {
  gestureRecognizers.forEach(recognizer => recognizer.reset());
  gestureRecognizers.clear();
}

// --------------------------------------------------
// HAND POSITION TO CANVAS POSITION
// --------------------------------------------------

function getCanvasPosition(landmarks, gesture) {
  const rect = canvas.getBoundingClientRect();

  let x;
  let y;

  if (gesture === 'PINCH') {
    x = (landmarks[4].x + landmarks[8].x) / 2;
    y = (landmarks[4].y + landmarks[8].y) / 2;
  } else if (gesture === 'POINTING') {
    x = landmarks[8].x;
    y = landmarks[8].y;
  } else {
    const palmLandmarks = [0, 5, 9, 13, 17];

    x = palmLandmarks.reduce((sum, i) => sum + landmarks[i].x, 0) /
      palmLandmarks.length;

    y = palmLandmarks.reduce((sum, i) => sum + landmarks[i].y, 0) /
      palmLandmarks.length;
  }

  return {
    x: (1 - x) * rect.width,
    y: y * rect.height
  };
}

// --------------------------------------------------
// AIR CURSOR
// --------------------------------------------------

const airCursor = document.querySelector('#air-cursor');

let currentCursorMode = 'pointing';

function updateAirCursorAppearance(mode) {
  currentCursorMode = mode;

  if (mode === 'brush') {
    const diameter = Math.max(12, drawingEngine.brushSize);

    airCursor.style.width = `${diameter}px`;
    airCursor.style.height = `${diameter}px`;
    airCursor.style.borderColor = drawingEngine.color;
    airCursor.style.backgroundColor = `${drawingEngine.color}22`;
    airCursor.style.boxShadow = `0 0 0 2px ${drawingEngine.color}33`;

  } else if (mode === 'eraser') {
    const diameter = Math.max(12, drawingEngine.brushSize);

    airCursor.style.width = `${diameter}px`;
    airCursor.style.height = `${diameter}px`;
    airCursor.style.borderColor = '#292B26';
    airCursor.style.backgroundColor = 'rgba(255,255,255,0.18)';
    airCursor.style.boxShadow = '0 0 0 2px rgba(41,43,38,0.18)';

  } else {
    airCursor.style.width = '18px';
    airCursor.style.height = '18px';
    airCursor.style.borderColor = '#E96B50';
    airCursor.style.backgroundColor = 'rgba(233,107,80,0.15)';
    airCursor.style.boxShadow = '0 0 0 2px rgba(233,107,80,0.18)';
  }

  airCursor.dataset.mode = mode;
}

function showAirCursor(point, mode = 'pointing') {
  updateAirCursorAppearance(mode);

  airCursor.style.left = `${point.x}px`;
  airCursor.style.top = `${point.y}px`;
  airCursor.classList.add('visible');
}

function hideAirCursor() {
  airCursor.classList.remove('visible');
}

// --------------------------------------------------
// TWO-HAND NAVIGATION
// --------------------------------------------------

let navigationState = null;

function getDistance(pointA, pointB) {
  return Math.hypot(
    pointB.x - pointA.x,
    pointB.y - pointA.y
  );
}

function getAngle(pointA, pointB) {
  return Math.atan2(
    pointB.y - pointA.y,
    pointB.x - pointA.x
  );
}

function getMidpoint(pointA, pointB) {
  return {
    x: (pointA.x + pointB.x) / 2,
    y: (pointA.y + pointB.y) / 2
  };
}

function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;

  return angle;
}

function handleTwoHandNavigation(results) {
  const firstPoint = getCanvasPosition(results[0].landmarks, 'PINCH');
  const secondPoint = getCanvasPosition(results[1].landmarks, 'PINCH');

  const midpoint = getMidpoint(firstPoint, secondPoint);
  const distance = getDistance(firstPoint, secondPoint);
  const angle = getAngle(firstPoint, secondPoint);

  if (!navigationState) {
    navigationState = {
      midpoint,
      distance,
      angle
    };

    drawingEngine.stopDrawing();
    hideAirCursor();

    gestureDetail.textContent =
      'Two-hand navigation active. Move, spread or rotate your pinched hands.';

    return;
  }

  const deltaX = midpoint.x - navigationState.midpoint.x;
  const deltaY = midpoint.y - navigationState.midpoint.y;

  const zoomFactor = distance / Math.max(navigationState.distance, 1);

  const rotationDelta = normalizeAngle(
    angle - navigationState.angle
  );

  // Ignore very small changes to reduce hand-tracking jitter.
  if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
    drawingEngine.panBy(deltaX, deltaY);
  }

  if (Math.abs(zoomFactor - 1) > 0.005) {
    drawingEngine.zoomAt(midpoint, zoomFactor);
  }

  if (Math.abs(rotationDelta) > 0.005) {
    drawingEngine.rotateAt(midpoint, rotationDelta);
  }

  navigationState = {
    midpoint,
    distance,
    angle
  };
}

// --------------------------------------------------
// GESTURE DRAWING AND CURSOR CONTROL
// --------------------------------------------------

function handleGestureDrawing(result) {
  if (!result?.stable) {
    drawingEngine.stopDrawing();
    hideAirCursor();
    return;
  }

  if (result.gesture === 'POINTING') {
    drawingEngine.stopDrawing();

    const point = getCanvasPosition(result.landmarks, 'POINTING');
    showAirCursor(point, 'pointing');

    gestureDetail.textContent =
      'Pointing: move your index finger to control the AIR PEN cursor.';

    return;
  }

  if (result.gesture === 'PINCH') {
    const point = getCanvasPosition(result.landmarks, 'PINCH');
    showAirCursor(point, 'brush');

    if (drawingEngine.tool !== 'Brush') {
      drawingEngine.stopDrawing();
      drawingEngine.setTool('Brush');
      updateActiveTool('Brush');
    }

    if (!drawingEngine.isDrawing) {
      drawingEngine.startDrawingAt(point);
    } else {
      drawingEngine.drawAt(point);
    }

    updateCanvasEmptyState();

    gestureDetail.textContent =
      'Pinch: drawing. Preview shows the brush size and colour.';

    return;
  }

  if (result.gesture === 'FIST') {
    const point = getCanvasPosition(result.landmarks, 'FIST');
    showAirCursor(point, 'eraser');

    if (drawingEngine.tool !== 'Eraser') {
      drawingEngine.stopDrawing();
      drawingEngine.setTool('Eraser');
      updateActiveTool('Eraser');
    }

    if (!drawingEngine.isDrawing) {
      drawingEngine.startDrawingAt(point);
    } else {
      drawingEngine.drawAt(point);
    }

    gestureDetail.textContent =
      'Fist: erasing. Preview shows the eraser diameter.';

    return;
  }

  drawingEngine.stopDrawing();
  hideAirCursor();
}

// --------------------------------------------------
// HAND TRACKER
// --------------------------------------------------

const handOverlay = document.querySelector('#hand-overlay');

const gestureStatusText = document.querySelector('#gesture-status-text');
const gestureDetail = document.querySelector('#gesture-detail');
const gestureDot = document.querySelector('#gesture-dot');

const handTracker = new HandTracker(
  video,
  handOverlay,
  ({ handCount, landmarks, handednesses }) => {
    if (handCount === 0 || !landmarks?.length) {
      drawingEngine.stopDrawing();
      hideAirCursor();
      navigationState = null;
      resetGestureRecognizers();

      gestureStatusText.textContent = 'No hands detected';
      gestureDetail.textContent = 'Show your hand clearly to the camera.';
      gestureDot.classList.remove('tracking-active');

      return;
    }

    gestureDot.classList.add('tracking-active');

    const activeHandKeys = new Set();
    const detectedGestures = [];
    const recognitionResults = [];

    landmarks.forEach((handLandmarks, index) => {
      const handLabel =
        handednesses?.[index]?.[0]?.categoryName || `Hand ${index + 1}`;

      activeHandKeys.add(handLabel);

      let recognizer = gestureRecognizers.get(handLabel);

      if (!recognizer) {
        recognizer = new GestureRecognizer({
          smoothingFactor: 0.35,
          stableFramesRequired: 4
        });

        gestureRecognizers.set(handLabel, recognizer);
      }

      const result = recognizer.update(handLandmarks);

      recognitionResults.push(result);

      const gestureLabel = result.stable
        ? getGestureLabel(result.gesture)
        : 'Detecting gesture...';

      detectedGestures.push(`${handLabel}: ${gestureLabel}`);
    });

    for (const [handLabel, recognizer] of gestureRecognizers) {
      if (!activeHandKeys.has(handLabel)) {
        recognizer.reset();
        gestureRecognizers.delete(handLabel);
      }
    }

    gestureStatusText.textContent =
      `${handCount} ${handCount === 1 ? 'hand' : 'hands'} detected`;

    gestureDetail.textContent = detectedGestures.join(' · ');

    // Both hands pinched = navigation mode.
    if (
      recognitionResults.length >= 2 &&
      recognitionResults[0].stable &&
      recognitionResults[1].stable &&
      recognitionResults[0].gesture === 'PINCH' &&
      recognitionResults[1].gesture === 'PINCH'
    ) {
      handleTwoHandNavigation(recognitionResults);
      updateCanvasEmptyState();
      return;
    }

    // Leaving two-hand navigation resets its reference measurements.
    navigationState = null;

    if (recognitionResults.length > 0) {
      handleGestureDrawing(recognitionResults[0]);
    }
  }
);

// --------------------------------------------------
// CAMERA UI
// --------------------------------------------------

const cameraToggleButton = document.querySelector('#camera-toggle-btn');
const cameraButtonText = document.querySelector('#camera-button-text');
const cameraButtonIcon = document.querySelector('#camera-button-icon');
const cameraStatus = document.querySelector('#camera-status');
const cameraIndicator = document.querySelector('#camera-indicator');
const cameraPlaceholder = document.querySelector('#camera-placeholder');
const cameraLiveLabel = document.querySelector('#camera-live-label');
const footerCameraStatus = document.querySelector('#footer-camera-status');

function updateCameraUI(isActive) {
  cameraPlaceholder.classList.toggle('hidden', isActive);
  cameraLiveLabel.classList.toggle('visible', isActive);
  cameraIndicator.classList.toggle('active', isActive);
  cameraToggleButton.classList.toggle('camera-active', isActive);

  cameraButtonText.textContent = isActive ? 'Stop Camera' : 'Start Camera';
  cameraButtonIcon.textContent = isActive ? '■' : '◉';

  footerCameraStatus.textContent = isActive ? 'CAMERA LIVE' : 'CAMERA OFF';
}

function resetTrackingUI() {
  drawingEngine.stopDrawing();
  hideAirCursor();
  navigationState = null;
  resetGestureRecognizers();

  gestureStatusText.textContent = 'Tracking not started';
  gestureDetail.textContent = 'Start your camera to recognise hand gestures.';
  gestureDot.classList.remove('tracking-active');
}

cameraToggleButton.addEventListener('click', async () => {
  cameraToggleButton.disabled = true;

  if (cameraManager.isActive) {
    handTracker.stop();
    drawingEngine.stopDrawing();
    cameraManager.stop();

    updateCameraUI(false);
    resetTrackingUI();

    cameraStatus.textContent = 'Camera is currently off.';
    cameraStatus.classList.remove('error');

    cameraToggleButton.disabled = false;
    return;
  }

  cameraStatus.textContent = 'Requesting camera permission...';
  cameraStatus.classList.remove('error');

  try {
    await cameraManager.start();

    updateCameraUI(true);
    cameraStatus.textContent = 'Camera connected. Loading hand tracking...';

    try {
      resetGestureRecognizers();
      await handTracker.start();

      cameraStatus.textContent = 'Camera and hand tracking are active.';
      console.log('AIR PEN gesture drawing and navigation are ready.');

    } catch (trackingError) {
      handTracker.stop();
      resetTrackingUI();

      cameraStatus.textContent =
        `Camera is working, but hand tracking failed: ${trackingError.message}`;

      cameraStatus.classList.add('error');
      console.error('Hand tracking error:', trackingError);
    }

  } catch (cameraError) {
    updateCameraUI(false);

    cameraStatus.textContent = cameraError.message;
    cameraStatus.classList.add('error');

    console.error('Camera error:', cameraError);

  } finally {
    cameraToggleButton.disabled = false;
  }
});

// --------------------------------------------------
// PLACEHOLDER ACTIONS
// --------------------------------------------------

document.querySelector('#save-btn').addEventListener('click', () => {
  alert('Artwork saving will be implemented in a later phase.');
});

document.querySelector('#export-btn').addEventListener('click', () => {
  alert('Artwork export will be implemented in a later phase.');
});

document.querySelector('#add-layer-btn').addEventListener('click', () => {
  alert('Layer management will be implemented in a later phase.');
});

// --------------------------------------------------
// KEYBOARD SHORTCUTS
// --------------------------------------------------

document.addEventListener('keydown', event => {
  const target = event.target;

  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault();

    if (event.shiftKey) {
      drawingEngine.redo();
    } else {
      drawingEngine.undo();
    }

    updateCanvasEmptyState();
  }
});

// --------------------------------------------------
// CLEANUP
// --------------------------------------------------

window.addEventListener('beforeunload', () => {
  handTracker.destroy();
  drawingEngine.destroy();
  cameraManager.stop();
  resetGestureRecognizers();
});

console.log('AIR PEN workspace initialized successfully.');
