import { terrainMaker, ghoster } from "./Engine/EngineTools.jsx";
import {
  kingTurn,
  battleTurn,
  blobTurn,
  blobFightTurn,
  blobGobTurn,
  sandboxTurn,
} from "./Engine/GameModes.jsx";
export function engine(gameState) {
  let activeEntities = gameState.active.activeEntities;
  let activeProjectiles = gameState.active.activeProjectiles;
  let activeGround = gameState.active.activeGround;
  let activeFluid = gameState.active.activeFluid;
  let activeEffects = gameState.active.activeEffects;
  let gameMode = gameState.settings.gameMode;
  let newRound = gameState.engine.newRound;
  let gameStatePacked = gameState;

  if (newRound.current) {
    ghoster(gameStatePacked);
    terrainMaker(gameStatePacked);
    newRound.current = false;
  }

  gamemode();

  function gamemode() {
    if (gameMode.current === "king") {
      return kingTurn(gameStatePacked, nextTurn);
    }
    if (gameMode.current === "battle") {
      return battleTurn(gameStatePacked, nextTurn);
    }
    if (gameMode.current === "blob") {
      return blobTurn(gameStatePacked, nextTurn);
    }
    if (gameMode.current === "blob fight") {
      return blobFightTurn(gameStatePacked, nextTurn);
    }
    if (gameMode.current === "blob gob") {
      return blobGobTurn(gameStatePacked, nextTurn);
    }
    if (gameMode.current === "sandbox") {
      return sandboxTurn(nextTurn);
    }

    function nextTurn() {
      for (const entity of activeEntities.current) {
        entity.turn;
      }
      for (const projectile of activeProjectiles.current) {
        projectile.turn;
      }
      for (const ground of activeGround.current) {
        ground.turn;
      }
      for (const fluid of activeFluid.current) {
        fluid.turn;
      }
      for (const effect of activeEffects.current) {
        effect.turn;
      }
    }
  }
}
