
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
    this.canvas.addEventListener('pointerdown', event => {
      this.startDrawing(event);
    });

    this.canvas.addEventListener('pointermove', event => {
      this.draw(event);
    });

    window.addEventListener('pointerup', () => {
      this.stopDrawing();
    });

    this.canvas.addEventListener('pointercancel', () => {
      this.stopDrawing();
    });

    this.canvas.addEventListener('contextmenu', event => {
      event.preventDefault();
    });
  }

  getPointerPosition(event) {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  // Start a stroke using mouse or gesture input.
  startDrawingAt(point) {
    if (this.isDrawing) return;

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
  drawAt(point) {
    if (!this.isDrawing || !this.currentStroke) return;

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

  // Mouse input.
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

  // Render an individual brush or eraser stroke.
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
      // Remove existing canvas pixels.
      this.ctx.globalCompositeOperation = 'destination-out';

      // Explicit opaque source for reliable erasing.
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

  // Redraw all strokes in their original order.
  render() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.ctx.clearRect(0, 0, rect.width, rect.height);

    this.strokes.forEach(stroke => {
      this.drawStroke(stroke);
    });
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
}
