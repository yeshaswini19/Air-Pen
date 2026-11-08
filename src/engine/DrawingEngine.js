
export class DrawingEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.color = '#E96B50';
    this.brushSize = 8;
    this.tool = 'Brush';

    this.strokes = [];
    this.redoStack = [];
    this.currentStroke = null;
    this.isDrawing = false;
    this.isPanning = false;

    // Viewport controls how the artwork appears on screen.
    // It does not modify the stored artwork coordinates.
    this.viewport = {
      zoom: 1,
      panX: 0,
      panY: 0,
      rotation: 0
    };

    this.minZoom = 0.5;
    this.maxZoom = 3;

    this.spacePressed = false;
    this.lastPanPoint = null;

    this.onViewportChange = null;

    this.setupCanvas();
    this.bindEvents();
  }

  setupCanvas() {
    const resizeCanvas = () => {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      this.canvas.width = Math.round(rect.width * dpr);
      this.canvas.height = Math.round(rect.height * dpr);

      this.render();
    };

    this.resizeObserver = new ResizeObserver(resizeCanvas);
    this.resizeObserver.observe(this.canvas);

    resizeCanvas();
  }

  bindEvents() {
    window.addEventListener('keydown', event => {
      if (event.code === 'Space') {
        this.spacePressed = true;
      }
    });

    window.addEventListener('keyup', event => {
      if (event.code === 'Space') {
        this.spacePressed = false;
      }
    });

    window.addEventListener('blur', () => {
      this.spacePressed = false;
      this.stopPanning();
      this.stopDrawing();
    });

    this.canvas.addEventListener('pointerdown', event => {
      this.handlePointerDown(event);
    });

    this.canvas.addEventListener('pointermove', event => {
      this.handlePointerMove(event);
    });

    window.addEventListener('pointerup', () => {
      this.stopDrawing();
      this.stopPanning();
    });

    this.canvas.addEventListener('pointercancel', () => {
      this.stopDrawing();
      this.stopPanning();
    });

    this.canvas.addEventListener('wheel', event => {
      event.preventDefault();

      const point = this.getPointerPosition(event);
      const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;

      this.zoomAt(point, factor);
    }, { passive: false });

    this.canvas.addEventListener('contextmenu', event => {
      event.preventDefault();
    });
  }

  getCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();

    return {
      width: rect.width,
      height: rect.height
    };
  }

  getPointerPosition(event) {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  // Convert a screen position into original artwork coordinates.
  screenToWorld(point) {
    const { width, height } = this.getCanvasSize();

    const centerX = width / 2 + this.viewport.panX;
    const centerY = height / 2 + this.viewport.panY;

    const dx = point.x - centerX;
    const dy = point.y - centerY;

    const cos = Math.cos(-this.viewport.rotation);
    const sin = Math.sin(-this.viewport.rotation);

    const rotatedX = dx * cos - dy * sin;
    const rotatedY = dx * sin + dy * cos;

    return {
      x: rotatedX / this.viewport.zoom + width / 2,
      y: rotatedY / this.viewport.zoom + height / 2
    };
  }

  // Convert original artwork coordinates into screen coordinates.
  worldToScreen(point) {
    const { width, height } = this.getCanvasSize();

    const x = (point.x - width / 2) * this.viewport.zoom;
    const y = (point.y - height / 2) * this.viewport.zoom;

    const cos = Math.cos(this.viewport.rotation);
    const sin = Math.sin(this.viewport.rotation);

    return {
      x: x * cos - y * sin + width / 2 + this.viewport.panX,
      y: x * sin + y * cos + height / 2 + this.viewport.panY
    };
  }

  notifyViewportChange() {
    if (typeof this.onViewportChange === 'function') {
      this.onViewportChange({
        zoom: this.viewport.zoom,
        rotation: this.viewport.rotation,
        panX: this.viewport.panX,
        panY: this.viewport.panY
      });
    }
  }

  // Zoom around a particular screen position.
  zoomAt(screenPoint, factor) {
    const worldPoint = this.screenToWorld(screenPoint);

    const nextZoom = Math.min(
      this.maxZoom,
      Math.max(this.minZoom, this.viewport.zoom * factor)
    );

    this.viewport.zoom = nextZoom;

    const updatedScreenPoint = this.worldToScreen(worldPoint);

    this.viewport.panX += screenPoint.x - updatedScreenPoint.x;
    this.viewport.panY += screenPoint.y - updatedScreenPoint.y;

    this.render();
    this.notifyViewportChange();
  }

  zoomBy(factor) {
    const { width, height } = this.getCanvasSize();

    this.zoomAt(
      { x: width / 2, y: height / 2 },
      factor
    );
  }

  // Move the viewport without modifying artwork.
  panBy(deltaX, deltaY) {
    this.viewport.panX += deltaX;
    this.viewport.panY += deltaY;

    this.render();
    this.notifyViewportChange();
  }

  // Rotate around a screen position.
  rotateAt(screenPoint, angleDelta) {
    const worldPoint = this.screenToWorld(screenPoint);

    this.viewport.rotation += angleDelta;

    const updatedScreenPoint = this.worldToScreen(worldPoint);

    this.viewport.panX += screenPoint.x - updatedScreenPoint.x;
    this.viewport.panY += screenPoint.y - updatedScreenPoint.y;

    this.render();
    this.notifyViewportChange();
  }

  rotateBy(angleDelta) {
    const { width, height } = this.getCanvasSize();

    this.rotateAt(
      { x: width / 2, y: height / 2 },
      angleDelta
    );
  }

  resetViewport() {
    this.viewport.zoom = 1;
    this.viewport.panX = 0;
    this.viewport.panY = 0;
    this.viewport.rotation = 0;

    this.render();
    this.notifyViewportChange();
  }

  handlePointerDown(event) {
    const shouldPan =
      event.button === 1 ||
      (event.button === 0 && this.spacePressed);

    if (shouldPan) {
      event.preventDefault();

      this.stopDrawing();
      this.isPanning = true;
      this.lastPanPoint = this.getPointerPosition(event);

      this.canvas.setPointerCapture(event.pointerId);
      return;
    }

    if (event.button !== 0) return;

    event.preventDefault();

    this.startDrawingAt(this.getPointerPosition(event));
    this.canvas.setPointerCapture(event.pointerId);
  }

  handlePointerMove(event) {
    const point = this.getPointerPosition(event);

    if (this.isPanning && this.lastPanPoint) {
      const deltaX = point.x - this.lastPanPoint.x;
      const deltaY = point.y - this.lastPanPoint.y;

      this.panBy(deltaX, deltaY);
      this.lastPanPoint = point;

      return;
    }

    if (this.isDrawing) {
      this.drawAt(point);
    }
  }

  stopPanning() {
    this.isPanning = false;
    this.lastPanPoint = null;
  }

  // Start a stroke using mouse or gesture input.
  // Incoming point is in screen coordinates.
  startDrawingAt(screenPoint) {
    if (this.isDrawing) return;

    const point = this.screenToWorld(screenPoint);

    this.isDrawing = true;

    this.currentStroke = {
      tool: this.tool,
      color: this.color,
      size: this.brushSize,
      points: [{ x: point.x, y: point.y }]
    };

    this.strokes.push(this.currentStroke);
    this.redoStack = [];

    this.render();
  }

  // Add a point to the active stroke.
  // Convert screen coordinates into artwork coordinates.
  drawAt(screenPoint) {
    if (!this.isDrawing || !this.currentStroke) return;

    const point = this.screenToWorld(screenPoint);

    const lastPoint =
      this.currentStroke.points[this.currentStroke.points.length - 1];

    const distance = Math.hypot(
      point.x - lastPoint.x,
      point.y - lastPoint.y
    );

    if (distance < 1) return;

    this.currentStroke.points.push({
      x: point.x,
      y: point.y
    });

    this.render();
  }

  startDrawing(event) {
    if (event.button !== 0) return;

    event.preventDefault();

    this.startDrawingAt(this.getPointerPosition(event));
    this.canvas.setPointerCapture(event.pointerId);
  }

  draw(event) {
    if (!this.isDrawing || !this.currentStroke) return;

    this.drawAt(this.getPointerPosition(event));
  }

  stopDrawing() {
    this.isDrawing = false;
    this.currentStroke = null;
  }

  drawStroke(stroke) {
    const points = stroke.points;

    if (!points.length) return;

    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.lineWidth = stroke.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.globalAlpha = 1;

    if (stroke.tool === 'Eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = stroke.color;
    }

    this.ctx.moveTo(points[0].x, points[0].y);

    if (points.length === 1) {
      this.ctx.lineTo(points[0].x + 0.1, points[0].y);
    } else {
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i].x, points[i].y);
      }
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  // Render all artwork using the current viewport transformation.
  render() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.ctx.clearRect(0, 0, rect.width, rect.height);

    this.ctx.save();

    this.ctx.translate(
      rect.width / 2 + this.viewport.panX,
      rect.height / 2 + this.viewport.panY
    );

    this.ctx.rotate(this.viewport.rotation);
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);

    this.ctx.translate(-rect.width / 2, -rect.height / 2);

    this.strokes.forEach(stroke => {
      this.drawStroke(stroke);
    });

    this.ctx.restore();
  }

  setColor(color) {
    this.color = color;
  }

  setBrushSize(size) {
    this.brushSize = Number(size);
  }

  setTool(tool) {
    this.tool = tool;
  }

  undo() {
    if (!this.strokes.length) return;

    this.stopDrawing();
    this.redoStack.push(this.strokes.pop());

    this.render();
  }

  redo() {
    if (!this.redoStack.length) return;

    this.stopDrawing();
    this.strokes.push(this.redoStack.pop());

    this.render();
  }

  clear() {
    if (!this.strokes.length) return;

    this.stopDrawing();

    this.redoStack = [...this.strokes];
    this.strokes = [];

    this.render();
  }

  destroy() {
    this.stopDrawing();
    this.stopPanning();

    this.resizeObserver?.disconnect();
  }
}
