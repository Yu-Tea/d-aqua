import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="menu"
export default class extends Controller {
  static targets = ["panel"];

  toggle() {
    this.panelTarget.classList.toggle("active");
  }

  close() {
    this.panelTarget.classList.remove("active");
  }

  stop(event) {
    // ログアウトリンクの場合は特別処理
    const isLogout = event.target.closest('[data-turbo-method="delete"]');

    if (isLogout) {
      this.close(); // メニューを閉じる
      return; // イベント処理を通す
    }

    event.stopPropagation();
  }
}
