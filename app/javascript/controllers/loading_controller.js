import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["screen", "logo", "content"];

  connect() {
    if (this.isTopPage() && this.isReallyFirstVisit()) {
      this.showLoadingAnimation();
    } else {
      this.showContentDirectly();
    }
  }

  isTopPage() {
    return (
      window.location.pathname === "/" ||
      window.location.pathname === "" ||
      window.location.pathname === "/sea_creatures"
    );
  }

  // 本当の初回訪問かどうかを厳密に判定
  isReallyFirstVisit() {
    if (sessionStorage.getItem("loadingAnimationShown") === "true") {
      return false;
    }

    // Performance APIでナビゲーションタイプをチェック
    if (performance.getEntriesByType) {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries.length > 0) {
        const navType = navEntries[0].type;

        // navigate = 通常のリンククリック、reload = リロード、back_forward = 戻る/進む
        return (
          navType === "navigate" &&
          !document.referrer.includes(window.location.hostname)
        );
      }
    }

    // フォールバック: リファラーベースの判定
    return (
      !document.referrer ||
      !document.referrer.includes(window.location.hostname)
    );
  }

  showLoadingAnimation() {
    sessionStorage.setItem("loadingAnimationShown", "true");

    this.screenTarget.classList.remove("hidden");
    this.contentTarget.classList.add("hidden");

    setTimeout(() => {
      this.logoTarget?.classList.add("fade-in");
    }, 100);

    setTimeout(() => {
      this.endAnimation();
    }, 3000);
  }

  endAnimation() {
    this.logoTarget?.classList.add("fade-out");
    this.screenTarget.classList.add("fade-out");

    setTimeout(() => {
      this.showContentDirectly();
    }, 2000); // フェードアウト時間に合わせて調整
  }

  showContentDirectly() {

    this.screenTarget.classList.add("hidden");
    this.contentTarget.classList.remove("hidden");
    this.contentTarget.classList.add("show");
  }
}
