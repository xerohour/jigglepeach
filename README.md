# 🍑 Jiggle Peach

**A squishy 3D peach idle game** — smack, rub, jiggle, and pamper a physics-driven peach to earn juice, unlock helpers, and grow your orchard.

![Jiggle Peach](https://xerohour.github.io/jigglepeach/peachy-keen/share.jpg)

**Play it:** https://xerohour.github.io/jigglepeach/

© 2026 Maanraket. All rights reserved.

---

## About the game

Jiggle Peach is a 3D idle/clicker game built around a soft-body peach rendered in real time. Every poke, swipe, and squeeze ripples through the fruit with springy jiggle physics. Earn **juice** from your interactions, then spend it in the shop to automate and multiply your gains.

The game runs entirely in the browser — no account, no download. Your progress autosaves locally.

## How to play

- **Tap / click** the peach to smack it and earn juice.
- **Swipe** across it for bigger smacks; **tap twice quickly** to clap.
- **Press and drag** to pull and stretch it; **move slowly** to rub it.
- **Press and hold** with the buzz tool, or **toss coins** for bonus juice.
- **Heat** builds as you play — hotter peach, faster earnings. Let it cool or push through.
- The peach **ripens** over time. Harvest pits, plant them in the **Orchard**, and grow new peaches.

## The Shop

Open the shop (basket icon) to spend juice across five tabs:

| Tab | What it does |
|-----|--------------|
| **Helpers** | Hire hands — Butler, Valet, Gardener, Choir, Cult, Baron and more. They smack, fan, and pamper the peach for you, even while you're away. |
| **Upgrades** | 32 permanent upgrades: earn while offline, golden peach bonuses, heat management, dare runs, faster ripening, and more. |
| **Trophies** | 44 achievements tracking smacks, crits, bursts, harvests, ripens, and secret feats. |
| **Stats** | Lifetime numbers — juice earned, best combo, hottest streak, pits caught, guests slapped. |
| **Options** | Tune the experience (see Customization below). |

### Toys

Unlock toys to change how you interact: lips for kisses, coins to make it rain, the disco ball, lingerie wardrobe, and more. Some toys unlock at higher Spice levels.

## Customization

Under **Options → The peach**:

- **Firmness** — Firm, Ripe, or Juicy. Changes the jiggle physics.
- **Spice** — Sweet, Cheeky, or Spicy. Sets the tone and unlocks the full toy box at Spicy.
- **Voice** — High or Deep. The peach talks back.
- **Numbers** — Pick your number format (1.2M, 1.2 mil, 1.2e6).
- **Skins** — Classic, Gold, Midnight, Chrome, Gimp, and the seasonal **Lantern** (pumpkin).

## 🎃 Pumpkin Mode

This mirror adds a **Pumpkin Mode** toggle in **Options → The peach** (not present on the original site). Flip it On to swap the peach for a fully-modeled 3D jack-o'-lantern — carved face, glowing insides, "Jiggle Pumpkin" branding — then flip it back whenever you like. It uses the game's own Halloween skin and model-swap flow.

## About this mirror

This is a community mirror of https://jigglepeach.com/, published with the author's permission. The game code is byte-identical to the live site as archived 2026-11-03, with three small adaptations for static hosting:

1. **Subpath assets** — the original uses root-absolute URLs (`/assets/...`); these are rewritten to `/jigglepeach/...` so everything loads under GitHub Pages.
2. **Domain allowlist** — the game's copy-guard only runs on `jigglepeach.com`/localhost; `xerohour.github.io` was added to the allowlist with the author's OK. The guard and its reporting are otherwise untouched.
3. **No backend** — the original phones home with error/stats telemetry and offers link-based visit sharing (`/api/*`). Those calls are neutralized on this static host; everything else runs fully client-side.
4. **Pumpkin Mode toggle** (`assets/pumpkin-toggle.js`) — the only added feature, described above.

Game saves live in your browser's localStorage, per origin — progress on this mirror is separate from progress on jigglepeach.com.

### Tech notes

- Three.js WebGL renderer with a custom soft-body peach shader (squash, jiggle, heat shimmer, fuzz).
- Game state in localStorage; offline-capable via service worker.
- If the game ever fails to load after an update, a hard reload (Ctrl+Shift+R) clears the stale cache.
