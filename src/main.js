
import './style.css';

import { DrawingEngine } from './engine/DrawingEngine.js';
import { CameraManager } from './camera/CameraManager.js';
import { HandTracker } from './tracking/HandTracker.js';

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
          <button class="tool-button active" data-tool="Brush">
            <span>✎</span><small>Brush</small>
          </button>

          <button class="tool-button" data-tool="Eraser">
            <span>◩</span><small>Eraser</small>
          </button>

          <button class="tool-button" data-tool="Select">
            <span>⌖</span><small>Select</small>
          </button>

          <button class="tool-button" data-tool="Shapes">
            <span>◇</span><small>Shapes</small>
          </button>

          <button class="tool-button" data-tool="Symmetry">
            <span>✥</span><small>Symmetry</small>
          </button>

          <button class="tool-button" data-tool="Mandala">
            <span>❋</span><small>Mandala</small>
          </button>
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
            <button id="zoom-out" class="small-control">−</button>
            <span id="zoom-level">100%</span>
            <button id="zoom-in" class="small-control">+</button>
          </div>
        </div>

        <div class="canvas-container">
          <canvas id="drawing-canvas"></canvas>

          <div class="canvas-empty" id="canvas-empty">
            <span class="empty-symbol">✳</span>
            <h2>Your canvas is waiting.</h2>
            <p>Pick a colour, choose your brush and start creating.</p>
          </div>
        </div>

        <div class="canvas-footer">
          <span>CANVAS · 1280 × 720</span>
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

          <div class="camera-status" id="camera-status" role="status">
            Camera is currently off.
          </div>

          <button class="camera-button" id="camera-toggle-btn">
            <span id="camera-button-icon">◉</span>
            <span id="camera-button-text">Start Camera</span>
          </button>
        </section>

        <section class="inspector-section gesture-section">
          <div class="panel-label">HAND TRACKING</div>

          <div class="gesture-status">
            <span class="gesture-dot" id="gesture-dot"></span>
            <span id="gesture-status-text">Tracking not started</span>
          </div>

          <p class="muted-note" id="gesture-detail">
            Start your camera to detect your hands.
          </p>
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

canvas.addEventListener('pointerdown', () => {
  canvasEmpty.classList.add('hidden');
});

document.querySelectorAll('.tool-button').forEach(button => {
  button.addEventListener('click', () => {
    const tool = button.dataset.tool;

    document.querySelectorAll('.tool-button').forEach(item => {
      item.classList.remove('active');
    });

    button.classList.add('active');
    activeToolLabel.textContent = tool;

    drawingEngine.setTool(tool);
  });
});

const brushSizeInput = document.querySelector('#brush-size');
const brushSizeValue = document.querySelector('#brush-size-value');

brushSizeInput.addEventListener('input', event => {
  const size = Number(event.target.value);

  brushSizeValue.textContent = `${size} px`;
  drawingEngine.setBrushSize(size);
});

document.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach(item => {
      item.classList.remove('selected');
    });

    swatch.classList.add('selected');
    drawingEngine.setColor(swatch.dataset.color);
  });
});

function updateCanvasEmptyState() {
  const hasArtwork = drawingEngine.strokes.length > 0;
  canvasEmpty.classList.toggle('hidden', hasArtwork);
}

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
// ZOOM DISPLAY
// --------------------------------------------------

let zoom = 100;

const zoomLevel = document.querySelector('#zoom-level');

document.querySelector('#zoom-in').addEventListener('click', () => {
  zoom = Math.min(zoom + 10, 200);
  zoomLevel.textContent = `${zoom}%`;
});

document.querySelector('#zoom-out').addEventListener('click', () => {
  zoom = Math.max(zoom - 10, 50);
  zoomLevel.textContent = `${zoom}%`;
});


// --------------------------------------------------
// CAMERA MANAGER
// --------------------------------------------------

const video = document.querySelector('#camera-video');
const cameraManager = new CameraManager(video);


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
    if (handCount === 0) {
      gestureStatusText.textContent = 'No hands detected';
      gestureDetail.textContent = 'Show your hand clearly to the camera.';
    } else {
      gestureStatusText.textContent =
        `${handCount} ${handCount === 1 ? 'hand' : 'hands'} detected`;

      gestureDetail.textContent =
        `${handCount * 21} landmarks detected successfully.`;
    }

    gestureDot.classList.toggle('tracking-active', handCount > 0);
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
  gestureStatusText.textContent = 'Tracking not started';
  gestureDetail.textContent = 'Start your camera to detect your hands.';
  gestureDot.classList.remove('tracking-active');
}

cameraToggleButton.addEventListener('click', async () => {
  cameraToggleButton.disabled = true;

  if (cameraManager.isActive) {
    handTracker.stop();
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
      await handTracker.start();

      cameraStatus.textContent = 'Camera and hand tracking are active.';
      console.log('AIR PEN hand tracking started.');
    } catch (trackingError) {
      handTracker.stop();

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
  cameraManager.stop();
});

console.log('AIR PEN workspace initialized successfully.');
