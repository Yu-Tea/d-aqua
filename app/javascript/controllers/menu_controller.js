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
    event.stopPropagation();
  }
}
