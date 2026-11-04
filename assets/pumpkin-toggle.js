// Pumpkin mode toggle for the Jiggle Peach GitHub Pages mirror.
//
// Adds a "Pumpkin mode" toggle button to the "The peach" section of the
// shop's Options tab, next to Firmness / Spice / Voice.
//
// How the game picks its model: the index.html head script reads
// localStorage["peachy-keen-intro-skin"] ("lantern" = pumpkin, else peach)
// and sets documentElement.dataset.model before the bundle boots. BUT the
// save file (localStorage["peachy-keen-idle"].options.skin) is the real
// source of truth: the game's Rn() syncs the intro-skin FROM the save on
// every boot and force-reloads if the loaded model disagrees with the save.
// So the toggle must update BOTH, or the game "corrects" the pumpkin back
// to a peach and reloads a second time. Toggling reloads through the game's
// model-swap flow (sessionStorage["peachy-keen-swap"]) so the game drops
// straight back into play instead of replaying the intro.
//
// The shop is rendered by the game's minified bundle, whose exact aria
// attributes aren't stable to guess at, so the Options panel and its
// "The peach" section are located with several fallback strategies
// instead of one brittle selector.
(() => {
  const SKIN_KEY = "peachy-keen-intro-skin";
  const SAVE_KEY = "peachy-keen-idle";
  const PREV_KEY = "peachy-keen-prev-skin";
  const SWAP_KEY = "peachy-keen-swap";
  const BTN_ID = "pumpkin-mode-toggle";
  const LANTERN = "lantern";

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

  // The game's save is the source of truth for the skin; fall back to the
  // intro-skin flag when there is no save yet.
  function currentSkin() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const save = JSON.parse(raw);
        if (save && save.options && typeof save.options.skin === "string") {
          return save.options.skin;
        }
      }
    } catch {}
    return store.get(SKIN_KEY) || "classic";
  }

  function setSaveSkin(skin) {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const save = JSON.parse(raw);
      if (!save || typeof save !== "object" || !save.options) return false;
      save.options.skin = skin;
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
      return true;
    } catch {
      return false;
    }
  }

  const isPumpkin = () => currentSkin() === LANTERN;

  // Guard against double-taps: the reload takes a moment, and a second tap
  // landing before unload would flip the toggle right back off.
  let busy = false;

  function toggle(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (busy) return;
    busy = true;
    const btn = document.getElementById(BTN_ID);
    if (btn) btn.disabled = true;
    const wasPumpkin = isPumpkin();
    const want = wasPumpkin ? store.get(PREV_KEY) || "classic" : LANTERN;
    if (!wasPumpkin) store.set(PREV_KEY, currentSkin());
    // Update the save FIRST (it's the source of truth), then the intro flag.
    // The game does not save on unload, so this survives the reload.
    setSaveSkin(want);
    store.set(SKIN_KEY, want);
    // Verify the writes landed before reloading; otherwise we'd reboot
    // into the wrong skin with no way back.
    if (store.get(SKIN_KEY) !== want || currentSkin() !== want) {
      busy = false;
      if (btn) btn.disabled = false;
      return;
    }
    try {
      sessionStorage.setItem(SWAP_KEY, "1");
    } catch {}
    location.reload();
  }

  function optionsPanel() {
    // Strategy 1: the Options tab's aria-controls -> panel id (ARIA tabs pattern).
    const tabs = document.querySelectorAll('[role="tab"]');
    for (const tab of tabs) {
      if ((tab.textContent || "").includes("Options")) {
        const id = tab.getAttribute("aria-controls");
        const panel = id && document.getElementById(id);
        if (panel) return panel;
        if (tab.id) {
          const labelled = document.querySelector(
            `[role="tabpanel"][aria-labelledby="${tab.id}"]`,
          );
          if (labelled) return labelled;
        }
      }
    }
    // Strategy 2: the tabpanel containing the Firmness option group.
    const panels = document.querySelectorAll('[role="tabpanel"]');
    for (const panel of panels) {
      if ((panel.textContent || "").includes("Firmness")) return panel;
    }
    // Strategy 3: direct selectors, last resort.
    return (
      document.querySelector('[role="tabpanel"][aria-label="Options"]') ||
      document.querySelector('aside[aria-label="Shop"] [role="tabpanel"]')
    );
  }

  function peachSection(panel) {
    const heads = panel.querySelectorAll("h3");
    for (const h of heads) {
      if ((h.textContent || "").includes("The peach")) {
        return h.closest("section") || h.parentElement;
      }
    }
    return null;
  }

  function insert() {
    if (document.getElementById(BTN_ID)) return;
    const panel = optionsPanel();
    if (!panel) return;
    const section = peachSection(panel);
    const host = section || panel;
    // Borrow the game's own button styling when it's available.
    const sample = host.querySelector("button");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = BTN_ID;
    if (sample) btn.className = sample.className;
    const on = isPumpkin();
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "\uD83C\uDF83 Pumpkin mode: On" : "\uD83C\uDF83 Pumpkin mode: Off";
    btn.title = "Swap the peach for a pumpkin (reloads the game)";
    btn.addEventListener("click", toggle);
    if (section) section.appendChild(btn);
    else host.insertBefore(btn, host.firstChild);
  }

  // The shop renders dynamically; re-insert if the game rebuilds the panel.
  new MutationObserver(insert).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  insert();
})();
