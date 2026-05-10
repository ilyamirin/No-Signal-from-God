import type { GameState } from "../../game/simulation/types";

export type HudController = {
  update: (state: GameState) => void;
};

export const createHud = (root: HTMLElement): HudController => {
  root.innerHTML = `
    <div class="hud-score" data-hud-score>0pts</div>
    <div class="hud-bottom">
      <div class="hud-chip" data-hud-enemies>0/6 enemies</div>
      <div class="hud-chip" data-hud-weapon>pistol</div>
      <div class="hud-chip" data-hud-ammo>0/0 rnds</div>
    </div>
    <div class="hud-interact" data-hud-interact hidden></div>
    <div class="hud-center" data-hud-center hidden></div>
  `;

  const score = root.querySelector<HTMLElement>("[data-hud-score]");
  const enemies = root.querySelector<HTMLElement>("[data-hud-enemies]");
  const weaponLabel = root.querySelector<HTMLElement>("[data-hud-weapon]");
  const ammo = root.querySelector<HTMLElement>("[data-hud-ammo]");
  const interact = root.querySelector<HTMLElement>("[data-hud-interact]");
  const center = root.querySelector<HTMLElement>("[data-hud-center]");

  if (!score || !enemies || !weaponLabel || !ammo || !interact || !center) {
    throw new Error("HUD elements failed to initialize");
  }

  return {
    update: (state) => {
      const aliveEnemies = state.enemies.filter((enemy) => enemy.alive).length;
      const clearedEnemies = state.enemies.length - aliveEnemies;
      const weapon = state.weapons[state.player.weaponId];

      score.textContent = `${state.score}pts`;
      enemies.textContent = `${clearedEnemies}/${state.enemies.length} enemies`;
      weaponLabel.textContent = weapon.kind;
      ammo.textContent =
        weapon.reloadRemainingMs > 0
          ? "reload"
          : `${weapon.loadedRounds}/${weapon.reserveRounds} rnds`;
      interact.hidden = !state.interaction;
      interact.textContent = state.interaction?.label ?? "";

      if (state.status === "dead") {
        center.hidden = false;
        center.textContent = "DEAD - PRESS R";
      } else if (state.status === "victory") {
        center.hidden = false;
        center.textContent = "CLEAR - PRESS R";
      } else {
        center.hidden = true;
        center.textContent = "";
      }
    },
  };
};
