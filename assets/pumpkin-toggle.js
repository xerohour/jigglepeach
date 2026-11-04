// Pumpkin mode toggle for the Jiggle Peach GitHub Pages mirror.
//
// Adds a "Pumpkin mode" toggle button to the top of the shop's Upgrades tab.
// The game's own boot code (index.html head script) reads
// localStorage["peachy-keen-intro-skin"]: "lantern" loads the pumpkin model,
// anything else loads the peach. Toggling sets the skin and reloads through
// the game's model-swap flow (sessionStorage["peachy-keen-swap"]) so the
// game drops straight back into play instead of replaying the intro.
(() => {
  const SKIN_KEY = "peachy-keen-intro-skin";
  const PREV_KEY = "peachy-keen-prev-skin";
  const SWAP_KEY = "peachy-keen-swap";
  const BTN_ID = "pumpkin-mode-toggle";

  const store = {
    get(k) {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v);
      } catch {}
    },
  };

  const isPumpkin = () => store.get(SKIN_KEY) === "lantern";

  function toggle(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isPumpkin()) {
      // Back to whatever skin was active before pumpkin mode.
      store.set(SKIN_KEY, store.get(PREV_KEY) || "classic");
    } else {
      store.set(PREV_KEY, store.get(SKIN_KEY) || "classic");
      store.set(SKIN_KEY, "lantern");
    }
    try {
      sessionStorage.setItem(SWAP_KEY, "1");
    } catch {}
    location.reload();
  }

  function upgradesPanel() {
    return document.querySelector(
      'aside[aria-label="Shop"] [role="tabpanel"][aria-label="Upgrades"]',
    );
  }

  function insert() {
    const panel = upgradesPanel();
    if (!panel || document.getElementById(BTN_ID)) return;
    // Borrow the game's own button styling when it's available.
    const sample = panel.querySelector("button");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = BTN_ID;
    if (sample) btn.className = sample.className;
    const on = isPumpkin();
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "\uD83C\uDF83 Pumpkin mode: On" : "\uD83C\uDF83 Pumpkin mode: Off";
    btn.title = "Swap the peach for a pumpkin (reloads the game)";
    btn.addEventListener("click", toggle);
    panel.insertBefore(btn, panel.firstChild);
  }

  // The shop renders dynamically; re-insert if the game rebuilds the panel.
  new MutationObserver(insert).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  insert();
})();
