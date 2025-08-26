import { Controller } from "@hotwired/stimulus";

const CREATURE_REMOVE_DELAY = 30000; // イキモノの削除までの時間
const FADE_IN_DURATION = 500; // イキモノのフェードイン時間
const FADE_OUT_DURATION = 500; // イキモノのフェードアウト時間

export default class extends Controller {
  static targets = [
    "creaturesArea",
    "modal",
    "modalBody",
    "closeModal",
    "creatureName",
    "creatureDescription",
    "creatureSvg",
    "creatureCreatorName",
    "creatureMovement",
    "creatureSize",
    "twitterButton",
  ];

  connect() {
    this.movementTypes = ["swim", "float", "rest"];
    this.startCreatureGeneration();
  }

  disconnect() {
    if (this.creatureInterval) clearInterval(this.creatureInterval);
  }

  // イキモノの生成の開始
  startCreatureGeneration() {
    [0, 1, 2].forEach((index) => {
      setTimeout(() => {
        this.createCreature();
      }, index * 500); // 500msずつずらして最初の3匹生成
    });
    this.creatureInterval = setInterval(() => this.createCreature(), 5100); // イキモノを生成する間隔
  }

  async createCreature() {
    const movement = this.randomMovement();
    try {
      const response = await fetch(
        `/api/v1/creatures/random?movement=${movement}`
      );
      const creature = await response.json();
      if (!creature.error) {
        this.renderCreature(creature);
        this.setupTwitterButton(creature.twitter_share_url);
      }
    } catch (error) {
      console.error("イキモノの生成でエラー:", error);
    }
  }

  // イキモノの要素を生成して表示
  renderCreature(creature) {
    const creatureElement = document.createElement("div");
    creatureElement.className = `creature creature-${creature.movement}-${creature.size} creature-fade-in`;
    this.setCreatureDataAttributes(creatureElement, creature);
    creatureElement.dataset.action = "click->ocean#showCreature";
    creatureElement.style.position = "absolute";
    creatureElement.style.cursor = "pointer";
    creatureElement.style.zIndex = "1";
    creatureElement.innerHTML = creature.svg_content;

    this.applySvgStyle(creatureElement);

    const { x, y } = this.calculatePosition(creature.movement);
    creatureElement.style.left = `${x}px`;
    creatureElement.style.top = `${y}px`;

    this.creaturesAreaTarget.appendChild(creatureElement);

    setTimeout(() => {
      creatureElement.classList.remove("creature-fade-in");
      creatureElement.classList.add(`creature-${creature.movement}`);

      // 動きswimタイプの場合のみ、さらに細分化したクラスを追加
      if (creature.movement === "swim") {
        const swimPatterns = ["gentle", "active", "lazy"];
        const randomPattern =
          swimPatterns[Math.floor(Math.random() * swimPatterns.length)];

        // 基本クラス + 詳細パターンクラスを両方付与
        creatureElement.classList.add(`swim-${randomPattern}`);
      }
    }, FADE_IN_DURATION);

    setTimeout(() => {
      if (creatureElement.parentNode) {
        creatureElement.classList.add("creature-fade-out");
        setTimeout(() => creatureElement.remove(), FADE_OUT_DURATION);
      }
    }, CREATURE_REMOVE_DELAY);
  }

  // イキモノのデータ属性を設定
  setCreatureDataAttributes(element, creature) {
    element.dataset.creatureId = creature.id;
    element.dataset.creatureName = creature.name;
    element.dataset.creatureDescription = creature.description;
    element.dataset.creatureSvg = creature.svg_content;
    element.dataset.creatureMovement = creature.movement;
    element.dataset.creatureSize = creature.size;
    element.dataset.creatureCreatorName = creature.creator_name;
    element.dataset.canDiscover = creature.can_discover.toString();
    element.dataset.twitterShareUrl = creature.twitter_share_url || "";
  }

  applySvgStyle(element) {
    const svg = element.querySelector("svg");
    if (svg) {
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.pointerEvents = "none";
    }
  }

  // イキモノの位置をランダムに計算
  calculatePosition(movement) {
    const maxX = Math.max(window.innerWidth - 100, 100);
    const maxY = Math.max(window.innerHeight - 100, 100);
    let x = Math.random() * maxX;
    let y;
    switch (movement) {
      case "swim":
      case "float":
        y = maxY * 0.05 + Math.random() * (maxY * 0.65);
        break;
      case "rest":
        y = maxY * 0.9 + Math.random() * (maxY * 0.005);
        break;
      default:
        y = Math.random() * maxY;
    }
    return { x, y };
  }

  // ランダムな動きのタイプを選択
  randomMovement() {
    return this.movementTypes[
      Math.floor(Math.random() * this.movementTypes.length)
    ];
  }

  // 動きとサイズの表記変換テーブル
  movementTranslations = {
    swim: "すいすい",
    float: "ぷかぷか",
    rest: "もぞもぞ",
  };

  sizeTranslations = {
    small: "小",
    medium: "中",
    large: "大",
  };

  // イキモノのクリックイベント
  showCreature(event) {
    const element = event.currentTarget;

    const creatureData = {
      id: element.dataset.creatureId,
      name: element.dataset.creatureName,
      description: element.dataset.creatureDescription,
      svg_content: element.dataset.creatureSvg,
      movement: element.dataset.creatureMovement,
      size: element.dataset.creatureSize,
      creator_name: element.dataset.creatureCreatorName,
      can_discover: element.dataset.canDiscover === "true",
      twitter_share_url: element.dataset.twitterShareUrl,
    };

    // モーダルを表示
    this.showModal(creatureData);

    // 発見可能な場合のみ発見処理を実行
    if (creatureData.can_discover) {
      this.discoverCreature(creatureData.id);
    }
  }

  // モーダルの表示
  showModal(creatureData) {
    if (this.hasCreatureNameTarget)
      this.creatureNameTarget.textContent = creatureData.name;
    if (this.hasCreatureDescriptionTarget)
      this.creatureDescriptionTarget.textContent = creatureData.description;
    if (this.hasCreatureCreatorNameTarget)
      this.creatureCreatorNameTarget.textContent = creatureData.creator_name;
    if (this.hasCreatureSvgTarget && creatureData.svg_content)
      this.creatureSvgTarget.innerHTML = creatureData.svg_content;

    // 動きとサイズは変換テーブルを使用して日本語を渡す
    if (this.hasCreatureMovementTarget)
      this.creatureMovementTarget.textContent =
        this.movementTranslations[creatureData.movement] ||
        creatureData.movement;
    if (this.hasCreatureSizeTarget)
      this.creatureSizeTarget.textContent =
        this.sizeTranslations[creatureData.size] || creatureData.size;

    if (creatureData.twitter_share_url) {
      this.setupTwitterButton(creatureData.twitter_share_url);
    }

    this.openModal();
  }

  // イキモノをクリックしたときの呼び出し
  async discoverCreature(creatureId) {
    try {
      const response = await fetch(`/api/v1/creatures/${creatureId}/discover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector('[name="csrf-token"]').content,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      // 🔥 発見時のTwitterボタン設定
      if (data.creature_data && data.creature_data.twitter_share_url) {
        this.setupTwitterButton(data.creature_data.twitter_share_url);
      }

      if (data.success && data.is_new_discovery) {
        this.showNewDiscovery();
        // 新発見の場合、ヘッダーカウントを更新
        this.updateBookCount(data.discovered_count, data.total_creatures_count);
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
    }
  }

  // ヘッダーの図鑑カウント更新用
  updateBookCount(discoveredCount, totalCount) {
    const bookCountElement = document.querySelector("[data-book-count]");
    if (bookCountElement) {
      // カウント表示を更新
      bookCountElement.textContent = `図鑑：${discoveredCount}/${totalCount}`;
    }
  }

  setupTwitterButton(twitterUrl) {
    if (this.hasTwitterButtonTarget && twitterUrl) {
      this.twitterButtonTarget.href = twitterUrl;
    }
  }

  showNewDiscovery() {
    const newElement = this.element.querySelector(".creature-new");
    if (newElement) {
      newElement.classList.add("show");
    }
  }

  hideNewDiscovery() {
    const newElement = this.element.querySelector(".creature-new");
    if (newElement) newElement.classList.remove("show");
  }

  openModal() {
    if (this.hasModalTarget) {
      this.modalTarget.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  }

  closeModal() {
    if (this.hasModalTarget) {
      this.modalTarget.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }

  closeModalClick() {
    this.closeModal();
    this.hideNewDiscovery();
  }
}
