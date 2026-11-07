
import './style.css';
import DrawingEngine from './engine/DrawingEngine.js';

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="studio">

    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">✳</div>
        <div>
          <h1>AIR PEN<span>.</span></h1>
          <p>DRAW BEYOND THE SCREEN</p>
        </div>
      </div>

      <div class="project-name">
        <span class="status-dot"></span>
        UNTITLED CANVAS
      </div>

      <div class="top-actions">
        <button class="text-button" id="undo">↶ Undo</button>
        <button class="text-button" id="redo">↷ Redo</button>
        <button class="outline-button" id="clear">Clear</button>
        <button class="outline-button" id="save">Save</button>
        <button class="primary-button" id="export">Export ↗</button>
      </div>
    </header>

    <section class="workspace">

      <aside class="toolbar">
        <p class="eyebrow">TOOLS</p>

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

        <div class="tool-divider"></div>

        <button class="tool-button" data-tool="Symmetry">
          <span>✥</span><small>Symmetry</small>
        </button>

        <button class="tool-button" data-tool="Mandala">
          <span>❋</span><small>Mandala</small>
        </button>

        <div class="toolbar-bottom">
          <div class="tool-help">?</div>
          <small>HELP</small>
        </div>
      </aside>

      <section class="canvas-section">

        <div class="canvas-heading">
          <div>
            <p class="eyebrow">YOUR CREATIVE SPACE</p>
            <h2>Let's make something.</h2>
          </div>

          <div class="canvas-controls">
            <button id="zoom-out">−</button>
            <span id="zoom-value">100%</span>
            <button id="zoom-in">+</button>
            <button id="reset-zoom" class="reset-button">Reset</button>
          </div>
        </div>

        <div class="canvas-frame">
          <div class="canvas-grid"></div>

          <canvas id="drawing-canvas"></canvas>

          <div class="canvas-empty" id="canvas-empty">
            <div class="empty-symbol">✳</div>
            <h3>Your canvas is a blank page.</h3>
            <p>Pick a tool. Trust your imagination.</p>
            <span class="empty-hint">START DRAWING WITH YOUR MOUSE</span>
          </div>

          <div class="canvas-label">ARTBOARD 001</div>
          <div class="canvas-coordinate">X: 000 &nbsp; Y: 000</div>
        </div>

        <footer class="canvas-footer">
          <span>✳ &nbsp; INFINITE POSSIBILITIES</span>
          <span id="active-tool">BRUSH MODE</span>
          <span>V 0.1.0</span>
        </footer>

      </section>

      <aside class="inspector">

        <div class="panel-heading">
          <div>
            <p class="eyebrow">CUSTOMISE</p>
            <h3>Tool kit<span>.</span></h3>
          </div>
          <span class="panel-icon">✳</span>
        </div>

        <section class="panel-section">
          <label>ACTIVE TOOL</label>
          <div class="active-tool-card">
            <span class="tool-preview" id="tool-preview">✎</span>
            <div>
              <strong id="tool-name">Brush</strong>
              <small>Freehand drawing</small>
            </div>
            <span class="active-indicator"></span>
          </div>
        </section>

        <section class="panel-section">
          <div class="setting-heading">
            <label>BRUSH SIZE</label>
            <strong id="brush-size-value">08</strong>
          </div>
          <input type="range" id="brush-size"
                 min="1" max="40" value="8" />
          <div class="range-labels">
            <span>FINE</span><span>BOLD</span>
          </div>
        </section>

        <section class="panel-section">
          <label>COLOUR PALETTE</label>

          <div class="colour-palette">
            <button class="colour active" data-colour="#E96B50"
                    style="--swatch:#E96B50"></button>
            <button class="colour" data-colour="#E9C968"
                    style="--swatch:#E9C968"></button>
            <button class="colour" data-colour="#A9CDB6"
                    style="--swatch:#A9CDB6"></button>
            <button class="colour" data-colour="#536FC1"
                    style="--swatch:#536FC1"></button>
            <button class="colour" data-colour="#292B26"
                    style="--swatch:#292B26"></button>
            <button class="colour" data-colour="#E9A6B1"
                    style="--swatch:#E9A6B1"></button>
          </div>

          <div class="selected-colour">
            <span class="selected-colour-dot"></span>
            <span id="colour-value">#E96B50</span>
          </div>
        </section>

        <section class="panel-section">
          <div class="setting-heading">
            <label>LAYERS</label>
            <button class="small-action" id="add-layer">+ Add</button>
          </div>

          <div class="layer-list" id="layer-list">
            <div class="layer-item selected">
              <span>▧</span>
              <span>Layer 01</span>
              <span class="layer-eye">◉</span>
            </div>
            <div class="layer-item">
              <span>▧</span>
              <span>Background</span>
              <span class="layer-eye">◉</span>
            </div>
          </div>
        </section>

        <div class="gesture-card">
          <div class="gesture-card-top">
            <span class="gesture-icon">◎</span>
            <span class="live-tag">STANDBY</span>
          </div>
          <strong>Gesture control</strong>
          <p>Your hands are your new tools.</p>
          <button id="camera-button">Connect camera ↗</button>
        </div>

      </aside>
    </section>

    <footer class="statusbar">
      <div><span class="status-dot"></span> SYSTEM READY</div>
      <div>CAMERA: <strong id="camera-status">DISCONNECTED</strong></div>
      <div>INPUT: <strong>GESTURE / MOUSE</strong></div>
      <div>MADE FOR CREATORS <span>✳</span></div>
    </footer>

  </main>
`;

// Initialise drawing engine
const canvas = document.querySelector('#drawing-canvas');
const drawingEngine = new DrawingEngine(canvas);

// Hide empty canvas message when drawing starts
function updateCanvasEmptyState() {
  const empty = document.querySelector('#canvas-empty');
  empty.style.display = drawingEngine.strokes.length ? 'none' : 'block';
}

// TOOL SELECTION
const toolButtons = document.querySelectorAll('.tool-button');

const toolIcons = {
  Brush: '✎',
  Eraser: '◩',
  Select: '⌖',
  Shapes: '◇',
  Symmetry: '✥',
  Mandala: '❋'
};

toolButtons.forEach((button) => {
  button.addEventListener('click', () => {
    toolButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    const tool = button.dataset.tool;

    drawingEngine.setTool(tool);

    document.querySelector('#tool-name').textContent = tool;
    document.querySelector('#active-tool').textContent =
      tool.toUpperCase() + ' MODE';

    document.querySelector('#tool-preview').textContent = toolIcons[tool];
  });
});

// BRUSH SIZE
const brushSlider = document.querySelector('#brush-size');

brushSlider.addEventListener('input', () => {
  document.querySelector('#brush-size-value').textContent =
    brushSlider.value.padStart(2, '0');

  drawingEngine.setBrushSize(brushSlider.value);
});

// COLOUR SELECTION
const colourButtons = document.querySelectorAll('.colour');

colourButtons.forEach((button) => {
  button.addEventListener('click', () => {
    colourButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    const colour = button.dataset.colour;

    document.querySelector('#colour-value').textContent = colour;
    document.querySelector('.selected-colour-dot').style.background = colour;

    drawingEngine.setColor(colour);
  });
});

// ZOOM DISPLAY
let zoom = 100;

function updateZoom() {
  document.querySelector('#zoom-value').textContent = `${zoom}%`;
}

document.querySelector('#zoom-in').addEventListener('click', () => {
  zoom = Math.min(200, zoom + 10);
  updateZoom();
});

document.querySelector('#zoom-out').addEventListener('click', () => {
  zoom = Math.max(50, zoom - 10);
  updateZoom();
});

document.querySelector('#reset-zoom').addEventListener('click', () => {
  zoom = 100;
  updateZoom();
});

// UNDO AND REDO
document.querySelector('#undo').addEventListener('click', () => {
  drawingEngine.undo();
  updateCanvasEmptyState();
});

document.querySelector('#redo').addEventListener('click', () => {
  drawingEngine.redo();
  updateCanvasEmptyState();
});

// CLEAR CANVAS
document.querySelector('#clear').addEventListener('click', () => {
  if (!drawingEngine.strokes.length) return;

  const confirmed = confirm('Clear your entire canvas?');

  if (confirmed) {
    drawingEngine.clear();
    updateCanvasEmptyState();
  }
});

// KEYBOARD SHORTCUTS
window.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    drawingEngine.undo();
    updateCanvasEmptyState();
  }

  if (event.ctrlKey && event.key.toLowerCase() === 'y') {
    event.preventDefault();
    drawingEngine.redo();
    updateCanvasEmptyState();
  }
});

// ADD LAYER (UI placeholder)
let layerCount = 2;

document.querySelector('#add-layer').addEventListener('click', () => {
  layerCount++;

  const layer = document.createElement('div');
  layer.className = 'layer-item selected';

  layer.innerHTML = `
    <span>▧</span>
    <span>Layer ${String(layerCount).padStart(2, '0')}</span>
    <span class="layer-eye">◉</span>
  `;

  document.querySelectorAll('.layer-item').forEach((item) => {
    item.classList.remove('selected');
  });

  document.querySelector('#layer-list').prepend(layer);
});

// SAVE AND EXPORT (to be implemented)
document.querySelector('#save').addEventListener('click', () => {
  alert('Artwork saving will be implemented in the storage phase.');
});

document.querySelector('#export').addEventListener('click', () => {
  alert('PNG export will be implemented in the export phase.');
});

// CAMERA (to be implemented)
document.querySelector('#camera-button').addEventListener('click', () => {
  alert('Webcam integration is coming in the camera phase.');
});

// Keep empty message in sync with drawing activity
canvas.addEventListener('pointerdown', () => {
  document.querySelector('#canvas-empty').style.display = 'none';
});
