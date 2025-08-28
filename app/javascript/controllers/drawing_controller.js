import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["canvas", "strokeWidth", "output", "warningMessage"];
  static values = {
    maxSize: { type: Number, default: 102400 }, // 100KB in bytes
  };

  connect() {
    this.isDrawing = false;
    this.currentPath = null;
    this.paths = [];
    this.currentStrokeWidth = 5;
    this.isDrawingBlocked = false;

    // SVG要素の設定
    this.canvasTarget.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    // 既存のイベントリスナー
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

    // タッチイベント
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
    // 描画がブロックされている場合は開始させない
    if (this.isDrawingBlocked) {
      this.showSizeWarning(
        "容量制限に達しています。描画を続けるには一部を削除してください。"
      );
      return;
    }

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
    this.currentPath.setAttribute("d", `M ${point.x} ${point.y}`);

    this.canvasTarget.appendChild(this.currentPath);
  }

  draw(event) {
    if (!this.isDrawing || !this.currentPath || this.isDrawingBlocked) return;

    event.preventDefault();
    const point = this.getMousePosition(event);
    const currentD = this.currentPath.getAttribute("d");

    // 新しい描画データを追加
    this.currentPath.setAttribute("d", `${currentD} L ${point.x} ${point.y}`);
  }

  stopDrawing(event) {
    if (this.isDrawing && this.currentPath) {
      this.paths.push(this.currentPath);

      // 描画完了時にサイズチェック
      this.checkDataSizeAndWarn();
    }

    this.isDrawing = false;
    this.currentPath = null;
    this.updateSvgData();
  }

  // 描画完了時のサイズチェック（警告のみ版）
  checkDataSizeAndWarn() {
    const currentSize = this.calculateCurrentDataSize();
    const percentage = (currentSize / this.maxSizeValue) * 100;

    if (percentage >= 100) {
      // 100%に達したら描画をブロック
      this.showSizeWarning(
        "保存できるデータ容量制限に達しました！これ以上描画できません。一部を削除してください。",
        "danger"
      );
      this.blockDrawing();
    } else if (percentage >= 95) {
      // 95%で強い警告
      this.showSizeWarning(
        "保存できるデータ容量の95%に達しました！あと少しで制限に達します。",
        "warning"
      );
    } else if (percentage >= 80) {
      // 80%で注意喚起
      this.showSizeWarning("保存できるデータ容量の80%に達しました。", "info");
    }
  }

  // 現在のデータサイズを計算
  calculateCurrentDataSize() {
    const svgData = {
      svg: this.canvasTarget.outerHTML,
      paths: this.paths.length,
      created_at: new Date().toISOString(),
    };
    return JSON.stringify(svgData).length;
  }

  // 警告メッセージを表示（レベル別）
  showSizeWarning(message, level = "info") {
    if (!this.hasWarningMessageTarget) return;

    this.warningMessageTarget.textContent = message;
    this.warningMessageTarget.classList.remove(
      "hidden",
      "warning-info",
      "warning-warning",
      "warning-danger"
    );
    this.warningMessageTarget.classList.add("show", `warning-${level}`);

    // 危険レベルでない場合は4秒後に自動で隠す
    if (level !== "danger") {
      setTimeout(() => {
        this.hideWarning();
      }, 4000);
    }
  }

  // 警告を隠す
  hideWarning() {
    if (this.hasWarningMessageTarget) {
      this.warningMessageTarget.classList.add("hidden");
      this.warningMessageTarget.classList.remove(
        "show",
        "warning-info",
        "warning-warning",
        "warning-danger"
      );
    }
  }

  // 描画をブロック
  blockDrawing() {
    this.isDrawingBlocked = true;
    this.canvasTarget.classList.add("drawing-disabled");
  }

  // 描画ブロックを解除
  unblockDrawing() {
    this.isDrawingBlocked = false;
    this.canvasTarget.classList.remove("drawing-disabled");
    this.hideWarning();
  }

  undo() {
    if (this.paths.length === 0) {
      return;
    }

    // 最後に描いた線を削除
    const lastPath = this.paths.pop();
    lastPath.remove();

    this.updateSvgData();

    // Undo後にサイズチェックして必要に応じてブロック解除
    const currentSize = this.calculateCurrentDataSize();
    const percentage = (currentSize / this.maxSizeValue) * 100;

    if (percentage < 100 && this.isDrawingBlocked) {
      this.unblockDrawing();
    }
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

    // クリア後はブロック解除して警告も隠す
    this.unblockDrawing();
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
