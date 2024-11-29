import { onBoard, toBoard } from "../Tools.jsx";
import EffectList from "../Lists/EffectList.jsx";
import Effect from "../Classes/Effect.jsx";
export function entityKiller(entity) {
  if (entity.death) {
    if (entity.death === "explodes") {
      if (entity.armed) {
        entity.armed = false;
        explosion(entity);
      }
    } else if (entity.death === "spawn") {
      spawn(entity);
    }
  }
  if (entity.class === "entity") {
    toBoard(
      entity.gameState.active.entityBoard.current,
      entity.position,
      undefined
    );
    if (entity.enemy) {
      entity.gameState.engine.setBank(
        entity.value + entity.gameState.engine.bank
      );
      entity.gameState.graveyard.enemyGraveyard.current.push(
        entity.gameState.active.activeEntities.current.splice(
          entity.gameState.active.activeEntities.current.indexOf(entity),
          1
        )
      );
    } else {
      entity.gameState.graveyard.friendlyGraveyard.current.push(
        entity.gameState.active.activeEntities.current.splice(
          entity.gameState.active.activeEntities.current.indexOf(entity),
          1
        )
      );
    }
  } else if (entity.class === "ground") {
    toBoard(
      entity.gameState.active.groundBoard.current,
      entity.position,
      undefined
    );
    entity.gameState.graveyard.groundGraveyard.current.push(
      entity.gameState.active.activeGround.current.splice(
        entity.gameState.active.activeGround.current.indexOf(entity),
        1
      )
    );
  } else if (entity.class === "fluid") {
    toBoard(
      entity.gameState.active.fluidBoard.current,
      entity.position,
      undefined
    );
    entity.gameState.graveyard.fluidGraveyard.current.push(
      entity.gameState.active.activeFluid.current.splice(
        entity.gameState.active.activeFluid.current.indexOf(entity),
        1
      )
    );
  } else if (entity.class === "projectile") {
    toBoard(
      entity.gameState.active.projectileBoard.current,
      entity.position,
      undefined
    );
    entity.gameState.active.activeProjectiles.current.splice(
      entity.gameState.active.activeProjectiles.current.indexOf(entity),
      1
    );
  }
}

export function healthChecker(entity) {
  if (entity.hp <= 0) {
    entityKiller(entity);
    return true;
  }
}

export function explosion(currentEntity) {
  let effectList = EffectList;
  let w = currentEntity.explosionRange;
  let h = currentEntity.explosionRange;
  let initialW = w;
  let initialH = h;
  while (w >= -initialW) {
    while (h >= -initialH) {
      let position = [
        currentEntity.position[0] + w,
        currentEntity.position[1] + h,
      ];
      let entityInCell = onBoard(
        currentEntity.gameState.active.entityBoard.current,
        position
      );
      let groundInCell = onBoard(
        currentEntity.gameState.active.groundBoard.current,
        position
      );
      let fluidInCell = onBoard(
        currentEntity.gameState.active.fluidBoard.current,
        position
      );
      let projectileInCell = onBoard(
        currentEntity.gameState.active.projectileBoard.current,
        position
      );
      let dmg = parseInt(
        currentEntity.explosionDmg -
          (Math.random() * currentEntity.explosionDmg) / 4
      );
      if (entityInCell) {
        entityInCell.hp -= dmg;
      }
      if (groundInCell) {
        groundInCell.hp -= dmg;
      }
      if (fluidInCell) {
        let deathChance = Math.random() * 10;
        if (deathChance > 5) {
          entityKiller(fluidInCell);
        }
      }
      if (projectileInCell) {
        entityKiller(projectileInCell);
      }
      let effectType = effectList["explosion"];
      let effectPosition = [
        currentEntity.position[0] + w,
        currentEntity.position[1] + h,
      ];
      let effectID =
        "explosion" +
        currentEntity.position[0] +
        w +
        currentEntity.position[1] +
        h;
      effectID = new Effect(
        effectType,
        effectPosition,
        effectID,
        currentEntity.gameState
      );
      toBoard(
        currentEntity.gameState.active.effectBoard.current,
        effectPosition,
        effectID
      );
      currentEntity.gameState.active.activeEffects.current.push(effectID);
      h--;
    }
    h = initialH;
    w--;
  }
}
