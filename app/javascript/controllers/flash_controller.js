import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    // 2秒後にフェードアウト
    this.timeout = setTimeout(() => {
      this.fadeOut();
    }, 2000);
  }

  disconnect() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  fadeOut() {
    this.element.classList.add("fade-out");

    // アニメーション完了後に要素を削除
    setTimeout(() => {
      this.element.remove();
    }, 300);
  }

  // クリックで手動削除
  dismiss() {
    this.fadeOut();
  }
}
