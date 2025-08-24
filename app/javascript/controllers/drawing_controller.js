// app/javascript/controllers/drawing_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["canvas", "strokeWidth", "output"];

  connect() {
    this.isDrawing = false;
    this.currentPath = null;
    this.paths = [];
    this.currentStrokeWidth = 3;

    // SVG要素の設定
    this.canvasTarget.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    this.canvasTarget.addEventListener(
      "mousedown",
      this.startDrawing.bind(this)
    );
    this.canvasTarget.addEventListener("mousemove", this.draw.bind(this));
    this.canvasTarget.addEventListener("mouseup", this.stopDrawing.bind(this));
    this.canvasTarget.addEventListener(
      "mouseleave",
      this.stopDrawing.bind(this)
    );

    // タッチイベント（スマホ対応）
    this.canvasTarget.addEventListener(
      "touchstart",
      this.handleTouch.bind(this)
    );
    this.canvasTarget.addEventListener(
      "touchmove",
      this.handleTouch.bind(this)
    );
    this.canvasTarget.addEventListener("touchend", this.stopDrawing.bind(this));

    // 線の太さの初期設定
    this.strokeWidthTarget.addEventListener(
      "input",
      this.updateStrokeWidth.bind(this)
    );
  }

  startDrawing(event) {
    this.isDrawing = true;
    const point = this.getMousePosition(event);

    // 新しいパスを作成
    this.currentPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    this.currentPath.setAttribute("stroke", "#ffffff");
    this.currentPath.setAttribute("stroke-width", this.currentStrokeWidth);
    this.currentPath.setAttribute("stroke-linecap", "round");
    this.currentPath.setAttribute("stroke-linejoin", "round");
    this.currentPath.setAttribute("fill", "none");

    // パスの開始点を設定
    this.currentPath.setAttribute("d", `M ${point.x} ${point.y}`);

    // SVGに追加
    this.canvasTarget.appendChild(this.currentPath);
  }

  draw(event) {
    if (!this.isDrawing || !this.currentPath) return;

    event.preventDefault();
    const point = this.getMousePosition(event);

    // 現在のパスに線を追加
    const currentD = this.currentPath.getAttribute("d");
    this.currentPath.setAttribute("d", `${currentD} L ${point.x} ${point.y}`);

    // SVGデータを更新
    this.updateSvgData();
  }

  stopDrawing(event) {
    // 描画完了時にpathsに追加（Undo機能のため）
    if (this.isDrawing && this.currentPath) {
      this.paths.push(this.currentPath);
    }

    this.isDrawing = false;
    this.currentPath = null;
    this.updateSvgData();
  }

  // Undo機能：最後に描いた線を削除
  undo() {
    if (this.paths.length === 0) {
      return;
    }

    // 最後に描いた線を削除
    const lastPath = this.paths.pop();
    lastPath.remove();

    this.updateSvgData();
  }

  handleTouch(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent(
      event.type === "touchstart"
        ? "mousedown"
        : event.type === "touchmove"
        ? "mousemove"
        : "mouseup",
      {
        clientX: touch.clientX,
        clientY: touch.clientY,
      }
    );
    this.canvasTarget.dispatchEvent(mouseEvent);
  }

  getMousePosition(event) {
    const rect = this.canvasTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  updateStrokeWidth(event) {
    this.currentStrokeWidth = event.target.value;
  }

  clear() {
    // 全てのパスを削除
    this.paths.forEach((path) => path.remove());
    this.paths = [];
    this.updateSvgData();
  }

  updateSvgData() {
    // SVGの内容をJSON形式で保存
    const svgData = {
      svg: this.canvasTarget.outerHTML,
      paths: this.paths.length,
      created_at: new Date().toISOString(),
    };

    this.outputTarget.value = JSON.stringify(svgData);
  }
}
