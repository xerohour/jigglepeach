// Pumpkin mode toggle for the Jiggle Peach GitHub Pages mirror.
//
// Adds a "Pumpkin mode" toggle button to the "The peach" section of the
// shop's Options tab, next to Firmness / Spice / Voice.
//
// How it works: the game's head script supports a ?model=pumpkin URL param
// that overrides the saved skin ("overrides the saved skin for testing").
// The toggle navigates to ?model=pumpkin (or removes it), which forces the
// pumpkin model on boot and makes the game's Rn() sync accept it instead
// of "correcting" back to the save's skin and force-reloading. This avoids
// editing the save file entirely. The swap flag
// (sessionStorage["peachy-keen-swap"]) drops straight back into play
// instead of replaying the intro.
//
// The shop is rendered by the game's minified bundle, whose exact aria
// attributes aren't stable to guess at, so the Options panel and its
// "The peach" section are located with several fallback strategies
// instead of one brittle selector.
(() => {
  const SWAP_KEY = "peachy-keen-swap";
  const BTN_ID = "pumpkin-mode-toggle";

  function isPumpkin() {
    try {
      const m = new URL(location.href).searchParams.get("model");
      if (m === "pumpkin") return true;
      if (m === "peach") return false;
    } catch {}
    try {
      return localStorage.getItem("peachy-keen-intro-skin") === "lantern";
    } catch {
      return false;
    }
  }

  // Guard against double-taps: navigation takes a moment, and a second tap
  // landing before unload would flip the toggle right back off.
  let busy = false;

  function toggle(e, wantOn) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (busy) return;
    // No-op if already in the requested state.
    if (wantOn === isPumpkin()) return;
    busy = true;
    const row = document.getElementById(BTN_ID);
    if (row) row.style.pointerEvents = "none";
    const url = new URL(location.href);
    if (wantOn) {
      url.searchParams.set("model", "pumpkin");
    } else {
      url.searchParams.delete("model");
    }
    try {
      sessionStorage.setItem(SWAP_KEY, "1");
    } catch {}
    location.href = url.toString();
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
    if (!section) return;
    // Find the opt-group (the colored box) holding the option rows.
    const group =
      section.querySelector(".opt-group") ||
      section.querySelector("div:has(> .opt-row)") ||
      section;
    const on = isPumpkin();

    // Build a native-looking option row: label + On/Off radio switches.
    const row = document.createElement("div");
    row.className = "opt-row";
    row.id = BTN_ID;

    const label = document.createElement("span");
    label.className = "opt-label";
    label.textContent = "🎃 Pumpkin Mode";
    row.appendChild(label);

    const radios = document.createElement("div");
    radios.className = "pill-track";
    radios.setAttribute("role", "radiogroup");
    radios.setAttribute("aria-label", "Pumpkin Mode");
    radios.style.setProperty("--n", "2");
    // Tighten the two switches into one segmented control.
    radios.style.display = "inline-flex";
    radios.style.gap = "4px";
    row.appendChild(radios);

    const mk = (val, text) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "switch";
      // aria-pressed drives the game's highlighted style for the active choice.
      b.setAttribute("aria-pressed", String(on === (val === "on")));
      b.textContent = text;
      b.addEventListener("click", (e) => toggle(e, val === "on"));
      radios.appendChild(b);
      return b;
    };
    mk("off", "Off");
    mk("on", "On");

    group.appendChild(row);
  }

  // The shop renders dynamically; re-insert if the game rebuilds the panel.
  new MutationObserver(insert).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  insert();
})();
