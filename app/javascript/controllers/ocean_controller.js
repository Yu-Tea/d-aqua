import { Controller } from "@hotwired/stimulus";

const CREATURE_REMOVE_DELAY = 30000; // 生き物の削除までの時間
const FADE_IN_DURATION = 500; // 生き物のフェードイン時間
const FADE_OUT_DURATION = 500; // 生き物のフェードアウト時間

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
  ];

  connect() {
    this.movementTypes = ["swim", "float", "rest"];
    this.startCreatureGeneration();
  }

  disconnect() {
    if (this.creatureInterval) clearInterval(this.creatureInterval);
  }

  // 生き物の生成の開始
  startCreatureGeneration() {
    [0, 1, 2].forEach((index) => {
      setTimeout(() => {
        this.createCreature();
      }, index * 500); // 500msずつずらして最初の3匹生成
    });
    this.creatureInterval = setInterval(() => this.createCreature(), 5100); // 生き物を生成する間隔
  }

  async createCreature() {
    const movement = this.randomMovement();
    try {
      const response = await fetch(
        `/api/v1/creatures/random?movement=${movement}`
      );
      const creature = await response.json();
      if (!creature.error) this.renderCreature(creature);
    } catch (error) {
      console.error("生き物の生成でエラー:", error);
    }
  }

  // 生き物の要素を生成して表示
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

  // 生き物のデータ属性を設定
  setCreatureDataAttributes(element, creature) {
    element.dataset.creatureId = creature.id;
    element.dataset.creatureName = creature.name;
    element.dataset.creatureDescription = creature.description;
    element.dataset.creatureSvg = creature.svg_content;
    element.dataset.creatureMovement = creature.movement;
    element.dataset.creatureSize = creature.size;
    element.dataset.creatureCreatorName = creature.creator_name;
    element.dataset.canDiscover = creature.can_discover.toString();
  }

  applySvgStyle(element) {
    const svg = element.querySelector("svg");
    if (svg) {
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.pointerEvents = "none";
    }
  }

  // 生き物の位置をランダムに計算
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

  // 生き物のクリックイベント
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
    if (this.hasCreatureSvgTarget && creatureData.svg_content)
      this.creatureSvgTarget.innerHTML = creatureData.svg_content;
    // 🌟 動きとサイズは変換テーブルを使用して日本語を渡す
    if (this.hasCreatureMovementTarget)
      this.creatureMovementTarget.textContent =
        this.movementTranslations[creatureData.movement] ||
        creatureData.movement;
    if (this.hasCreatureSizeTarget)
      this.creatureSizeTarget.textContent =
        this.sizeTranslations[creatureData.size] || creatureData.size;

    this.openModal();
  }

  // 🎯 生き物発見のAPI呼び出し
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

      if (data.success && data.is_new_discovery) {
        this.showNewDiscovery();
        // 新発見の場合、ヘッダーカウントを更新
        this.updateBookCount(data.discovered_count, data.total_creatures_count);
      }
    } catch (error) {
      console.error("discoverCreature でエラーが発生しました:", error);
    }
  }

  // ヘッダーのブックカウント更新関数
  updateBookCount(discoveredCount, totalCount) {
    const bookCountElement = document.querySelector("[data-book-count]");
    if (bookCountElement) {
      // カウント表示を更新
      bookCountElement.textContent = `図鑑：${discoveredCount}/${totalCount}`;
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
