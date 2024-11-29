import { onBoard, toBoard } from "../../Tools.jsx";
import EffectList from "../Lists/EffectList.jsx";
import EntityList from "../Lists/EntityList.jsx";
import Effect from "./Effect.jsx";
import Entity from "./Entity.jsx";
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
  function spawn(entity) {
    let entityID = entity.name;
    let entityType = EntityList[entity.spawnType];
    let entityLvl = entityType.lvls["lvl" + entity.lvl];
    entityID = new Entity(
      entityType,
      entityLvl,
      entity.position,
      entityID,
      entity.gameState
    );
    entityID.enemy = entity.enemy;
    statUpdate(entityID);
    entity.gameState.active.activeEntities.current.push(entityID);
    function statUpdate(entity) {
      let gameSpeed = entity.gameState.settings.gameSpeed;
      entity.rate /= gameSpeed.current;
      entity.speed /= gameSpeed.current;
      entity.fallSpeed /= gameSpeed.current;
    }
  }
}

export function healthChecker(entity) {
  if (entity.hp <= 0) {
    entityKiller(entity);
    return true;
  }
}

export function explosion(entity) {
  let w = entity.explosionRange;
  let h = entity.explosionRange;
  let initialW = w;
  let initialH = h;
  while (w >= -initialW) {
    while (h >= -initialH) {
      let position = [entity.position[0] + w, entity.position[1] + h];
      let entityInCell = onBoard(
        entity.gameState.active.entityBoard.current,
        position
      );
      let groundInCell = onBoard(
        entity.gameState.active.groundBoard.current,
        position
      );
      let fluidInCell = onBoard(
        entity.gameState.active.fluidBoard.current,
        position
      );
      let projectileInCell = onBoard(
        entity.gameState.active.projectileBoard.current,
        position
      );
      let dmg = parseInt(
        entity.explosionDmg - (Math.random() * entity.explosionDmg) / 4
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
      let effectType = EffectList["explosion"];
      let effectPosition = [entity.position[0] + w, entity.position[1] + h];
      let effectID =
        "explosion" + entity.position[0] + w + entity.position[1] + h;
      effectID = new Effect(
        effectType,
        effectPosition,
        effectID,
        entity.gameState
      );
      toBoard(
        entity.gameState.active.effectBoard.current,
        effectPosition,
        effectID
      );
      entity.gameState.active.activeEffects.current.push(effectID);
      h--;
    }
    h = initialH;
    w--;
  }
}

export function fluidChecker(entity) {
  if (entity.position[1] < 1) {
    return;
  }
  let fluidInPosition = onBoard(
    entity.gameState.active.fluidBoard.current,
    entity.position
  );
  if (fluidInPosition) {
    if (entity.sponge) {
      entity.hp -= 2;
      entityKiller(fluidInPosition);
      return;
    }
    if (!entity.inFluid) {
      entity.inFluid = true;
      entity.speed *= 1.5;
      entity.rate *= 1.5;
      entity.rateCharge *= 1.5;
      entity.fallSpeed *= 8;
      if (entity.breathes) {
        entity.oxygen = 300 / entity.gameState.settings.gameSpeed.current;
      }
    } else if (entity.breathes) {
      entity.oxygen--;
      if (!entity.oxygen) {
        entity.hp--;
        if (entity.hp <= 0) {
          entityKiller(entity);
        }
        entity.oxygen = 50 / entity.gameState.settings.gameSpeed.current;
      }
    }
  } else if (entity.inFluid) {
    entity.inFluid = false;
    entity.speed /= 1.5;
    entity.rate /= 1.5;
    entity.rateCharge /= 1.5;
    entity.fallSpeed /= 8;
    entity.oxygen = undefined;
  }
}
