
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

  // Shared method for starting both mouse and gesture strokes.
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

  // Shared method for adding a point to the active stroke.
  drawAt(point) {
    if (!this.isDrawing || !this.currentStroke) return;

    const lastPoint =
      this.currentStroke.points[this.currentStroke.points.length - 1];

    // Ignore extremely small movements to reduce unnecessary points.
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

  drawStroke(stroke) {
    const points = stroke.points;

    if (!points.length) return;

    this.ctx.beginPath();
    this.ctx.lineWidth = stroke.size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (stroke.tool === 'Eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
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
    this.ctx.globalCompositeOperation = 'source-over';
  }

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
