import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["creaturesArea", "modal", "modalBody", "closeModal"];

  connect() {
    console.log("深海が始まります！🌊");
    this.movementTypes = ["swim", "float", "rest"];
    this.startCreatureGeneration();

    // モーダル要素が存在する場合のみイベントをバインド
    if (this.hasModalTarget) {
      this.bindEvents();
      this.setupKeyboardEvents(); // ESCキーイベントも追加
    } else {
      console.warn("⚠️ モーダル要素が見つかりません。モーダル機能は無効です。");
    }
  }

  disconnect() {
    if (this.creatureInterval) {
      clearInterval(this.creatureInterval);
    }
  }

  bindEvents() {
    if (!this.hasModalTarget) {
      console.warn(
        "モーダル要素が存在しないため、イベントバインドをスキップします"
      );
      return;
    }

    // モーダル外クリックで閉じる
    this.modalTarget.addEventListener("click", (event) => {
      if (event.target === this.modalTarget) {
        this.closeModal();
      }
    });
  }

  startCreatureGeneration() {
    // 初回実行
    this.createCreature();

    // 定期実行
    this.creatureInterval = setInterval(() => {
      this.createCreature();
    }, 3000);
  }

  createCreature() {
    const movement =
      this.movementTypes[Math.floor(Math.random() * this.movementTypes.length)];

    fetch(`/api/v1/creatures/random?movement=${movement}`)
      .then((response) => response.json())
      .then((creature) => {
        if (creature.error) return;

        this.renderCreature(creature);
      })
      .catch((error) =>
        console.error("生き物の生成でエラーが発生しました:", error)
      );
  }

  renderCreature(creature) {
    const creatureElement = document.createElement("div");
    creatureElement.className = `creature creature-${creature.size} creature-fade-in`;
    creatureElement.dataset.creatureId = creature.id;
    creatureElement.dataset.action = "click->ocean#showCreatureDetail";

    creatureElement.style.position = "absolute";
    creatureElement.style.cursor = "pointer";
    creatureElement.style.zIndex = "1";

    // 1秒後にフェードインクラスを削除＆アニメーションクラス追加
    setTimeout(() => {
      creatureElement.classList.remove("creature-fade-in");
      creatureElement.classList.add(`creature-${creature.movement}`);
    }, 1050);

    creatureElement.innerHTML = creature.svg_content;

    // SVG要素にスタイルを適用
    const svgElement = creatureElement.querySelector("svg");
    if (svgElement) {
      svgElement.style.width = "100%";
      svgElement.style.height = "100%";
      svgElement.style.pointerEvents = "none"; // クリックイベントが親要素に伝わるように
    }

    // ランダムな位置に配置（movementに応じて調整）
    const maxX = Math.max(window.innerWidth - 100, 100);
    const maxY = Math.max(window.innerHeight - 100, 100);

    let x, y;

    // movementに応じて配置範囲を調整
    switch (creature.movement) {
      case "swim":
        // 泳ぐ生き物：海底以外の範囲（上部70%）
        x = Math.random() * maxX;
        y = Math.random() * (maxY * 0.7);
        break;

      case "float":
        // 浮遊する生き物：海底以外の範囲（上部70%）
        x = Math.random() * maxX;
        y = Math.random() * (maxY * 0.7);
        break;

      case "rest":
        // 休む生き物：海底の範囲
        x = Math.random() * maxX;
        y = maxY * 0.9 + Math.random() * (maxY * 0.005);
        break;

      default:
        // デフォルト：全体
        x = Math.random() * maxX;
        y = Math.random() * maxY;
    }

    creatureElement.style.left = `${x}px`;
    creatureElement.style.top = `${y}px`;

    this.creaturesAreaTarget.appendChild(creatureElement);

    // 一定時間後に削除
    setTimeout(() => {
      if (creatureElement.parentNode) {
        creatureElement.classList.add("creature-fade-out");
        setTimeout(() => {
          creatureElement.remove();
        }, 1000);
      }
    }, 40000);
  }

  showCreatureDetail(event) {
    if (!this.hasModalTarget || !this.hasModalBodyTarget) {
      console.warn("⚠️ モーダル要素が見つかりません");
      // フォールバック処理
      const creatureId = event.currentTarget.dataset.creatureId;
      alert(`生き物ID: ${creatureId} の詳細表示（モーダル準備中）`);
      return;
    }

    const creatureId = event.currentTarget.dataset.creatureId;

    fetch(`/api/v1/creatures/${creatureId}`)
      .then((response) => response.json())
      .then((creature) => {
        this.modalBodyTarget.innerHTML = `
          <img src="${creature.image_url || "/assets/default-creature.png"}" 
               alt="${creature.name}" class="creature-image"
               onerror="this.src='/assets/default-creature.png'">
          <h2 class="creature-name">${creature.name}</h2>
          <p class="creature-description">${creature.description}</p>
          <div class="creature-info">
            <div class="info-item">
              <span class="label">動き</span>
              <span class="value">${this.translateMovement(
                creature.movement
              )}</span>
            </div>
            <div class="info-item">
              <span class="label">サイズ</span>
              <span class="value">${this.translateSize(creature.size)}</span>
            </div>
            <div class="info-item">
              <span class="label">生息域</span>
              <span class="value">${creature.habitat || "深海"}</span>
            </div>
          </div>
          <div class="discovery-badge ${
            creature.discovered ? "already-discovered" : "new-discovery"
          }">
            ${creature.discovered ? "✅ 発見済み" : "🆕 新発見！"}
          </div>
          ${
            !creature.discovered
              ? `
            <button class="register-button" 
                    data-action="click->ocean#registerDiscovery" 
                    data-creature-id="${creature.id}">
              図鑑に登録する
            </button>
          `
              : ""
          }
        `;
        this.openModal();
      })
      .catch((error) => {
        console.error("生き物の詳細取得でエラーが発生しました:", error);
        this.showErrorModal();
      });
  }

  registerDiscovery(event) {
    const creatureId = event.currentTarget.dataset.creatureId;
    const button = event.currentTarget;

    // ボタンを無効化
    button.disabled = true;
    button.textContent = "登録中...";

    // CSRFトークンを取得
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content");

    fetch("/api/v1/books", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ creature_id: creatureId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          this.showSuccessMessage("図鑑に登録しました！🎉");
          this.closeModal();
        } else {
          throw new Error(data.message || "登録に失敗しました");
        }
      })
      .catch((error) => {
        console.error("図鑑登録でエラーが発生しました:", error);
        this.showErrorMessage("登録に失敗しました。もう一度お試しください。");

        // ボタンを元に戻す
        button.disabled = false;
        button.textContent = "図鑑に登録する";
      });
  }

  openModal() {
    if (!this.hasModalTarget) {
      console.warn("⚠️ モーダル要素が存在しません");
      return;
    }
    this.modalTarget.style.display = "block";
    document.body.style.overflow = "hidden"; // スクロール無効化
  }

  closeModal() {
    if (!this.hasModalTarget) {
      console.warn("⚠️ モーダル要素が存在しません");
      return;
    }
    this.modalTarget.style.display = "none";
    document.body.style.overflow = "auto"; // スクロール有効化
  }

  // モーダルを閉じるボタンのクリックイベント
  closeModalClick() {
    this.closeModal();
  }

  // キーボードでモーダルを閉じる（ESCキー）
  handleKeydown(event) {
    if (event.key === "Escape") {
      this.closeModal();
    }
  }

  // 翻訳ヘルパーメソッド
  translateMovement(movement) {
    const translations = {
      swim: "泳ぐ",
      float: "漂う",
      rest: "休む",
    };
    return translations[movement] || movement;
  }

  translateSize(size) {
    const translations = {
      small: "小さい",
      medium: "普通",
      large: "大きい",
    };
    return translations[size] || size;
  }

  // 成功メッセージを表示
  showSuccessMessage(message) {
    this.showNotification(message, "success");
  }

  // エラーメッセージを表示
  showErrorMessage(message) {
    this.showNotification(message, "error");
  }

  // 通知を表示する共通メソッド
  showNotification(message, type) {
    // 既存の通知があれば削除
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // 通知要素を作成
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // スタイルを設定
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      ${
        type === "success"
          ? "background-color: #4CAF50;"
          : "background-color: #f44336;"
      }
    `;

    document.body.appendChild(notification);

    // 3秒後に自動で削除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOut 0.3s ease-out";
        setTimeout(() => {
          notification.remove();
        }, 300);
      }
    }, 3000);
  }

  // エラーモーダルを表示
  showErrorModal() {
    this.modalBodyTarget.innerHTML = `
      <div class="error-content">
        <h2>⚠️ エラーが発生しました</h2>
        <p>生き物の情報を取得できませんでした。</p>
        <p>もう一度お試しください。</p>
        <button class="retry-button" data-action="click->ocean#closeModal">
          閉じる
        </button>
      </div>
    `;
    this.openModal();
  }

  // デバッグ用：現在の生き物数を表示
  getCreatureCount() {
    return this.creaturesAreaTarget.children.length;
  }

  // デバッグ用：すべての生き物を削除
  clearAllCreatures() {
    while (this.creaturesAreaTarget.firstChild) {
      this.creaturesAreaTarget.removeChild(this.creaturesAreaTarget.firstChild);
    }
  }
}
