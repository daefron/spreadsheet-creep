import { toBoard, comparePosition } from "../Tools.jsx";
import Entity from "./Classes/Entity.jsx";
import Ground from "./Classes/Ground.jsx";
import Fluid from "./Classes/Fluid.jsx";
import EntityList from "./Lists/EntityList.jsx";
import GroundList from "./Lists/GroundList.jsx";
import FluidList from "./Lists/FluidList.jsx";
export function entitySpawner(entity, enemy, gameState) {
  let entityList = EntityList;
  let enemySpawnCount = gameState.engine.enemySpawnCount;
  let friendlySpawnCount = gameState.engine.friendlySpawnCount;
  let activeEntities = gameState.active.activeEntities;
  let activeGround = gameState.active.activeGround;
  let entityBoard = gameState.active.entityBoard;
  let gameboardWidth = gameState.settings.gameboardWidth;
  let gameboardHeight = gameState.settings.gameboardHeight;
  let renderWidth = gameState.render.renderWidth;
  let renderHeight = gameState.render.renderHeight;
  let entityType = entityList[entity[0]];
  let entityLvl = entityType.lvls["lvl" + entity[1]];
  let position = spawnPositionFinder(enemy);
  let entityID = entity[0];
  if (enemy) {
    entityID += enemySpawnCount.current;
  } else entityID += friendlySpawnCount.current;
  entityID = new Entity(entityType, entityLvl, position, entityID, gameState);
  if (!enemy) {
    entityID.enemy = enemy;
  }
  activeEntities.current.push(entityID);
  if (
    position[0] > 0 &&
    position[0] <= renderWidth.current &&
    position[1] > 0 &&
    position[1] <= renderHeight.current
  ) {
    toBoard(entityBoard.current, position, entityID);
  }
  return entityID;

  function spawnPositionFinder(enemy) {
    let baselinePosition;
    if (enemy) {
      baselinePosition = [gameboardWidth.current, gameboardHeight.current - 1];
    } else {
      baselinePosition = [1, gameboardHeight.current - 1];
    }
    let spawnPosition = baselinePosition;
    let endEntities = activeEntities.current.filter(
      (entity) => entity.position[0] === baselinePosition[0]
    );
    for (const entity of endEntities) {
      if (entity.position[1] <= spawnPosition[1]) {
        spawnPosition = [entity.position[0], entity.position[1] - 1];
      }
    }
    if (!comparePosition(spawnPosition, baselinePosition)) {
      return spawnPosition;
    }
    let endGrounds = activeGround.current.filter(
      (ground) => ground.position[0] === baselinePosition[0]
    );
    for (const ground of endGrounds) {
      if (ground.position[1] <= spawnPosition[1]) {
        spawnPosition = [ground.position[0], ground.position[1] - 1];
      }
    }
    return spawnPosition;
  }
}

export function spawnChecker(enemy, gameState) {
  let enemySpawnCount = gameState.engine.enemySpawnCount;
  let lastEnemySpawnTime = gameState.engine.lastEnemySpawnTime;
  let friendlySpawnCount = gameState.engine.friendlySpawnCount;
  let lastFriendlySpawnTime = gameState.engine.lastFriendlySpawnTime;
  let totalSpawns = gameState.settings.totalSpawns;
  if (enemy) {
    if (enemySpawnCount.current < totalSpawns.current) {
      lastEnemySpawnTime.current++;
      if (lastEnemySpawnTime.current > spawnTime()) {
        entitySpawner(spawnType(), enemy, gameState);
        enemySpawnCount.current++;
        lastEnemySpawnTime.current = 0;
      }
    }
    return;
  }
  if (friendlySpawnCount.current < totalSpawns.current) {
    lastFriendlySpawnTime.current++;
    if (lastFriendlySpawnTime.current > spawnTime()) {
      entitySpawner(spawnType(), enemy, gameState);
      friendlySpawnCount.current++;
      lastFriendlySpawnTime.current = 0;
      return;
    }
  }
  function spawnTime() {
    let spawnSpeed = gameState.settings.spawnSpeed;
    let gameSpeed = gameState.settings.gameSpeed;
    let baseline = 80;
    return (
      80 + (baseline * Math.random()) / spawnSpeed.current / gameSpeed.current
    );
  }

  function spawnType() {
    let entityList = EntityList;
    let entitiesEnemy = Object.entries(entityList)
      .filter((entity) => entity[1].enemy)
      .map((entity) => entity[1]);
    let parsedEntities = [];
    for (const entity of entitiesEnemy) {
      for (const level of Object.entries(entity.lvls)) {
        if (level[1].chance) {
          parsedEntities.push([entity.type, level[1].lvl, level[1].chance]);
        }
      }
    }
    let totalWeight = 0;
    for (const entity of parsedEntities) {
      totalWeight = totalWeight + entity[2];
    }
    let weightedChance = totalWeight * Math.random();
    let chancePosition = 0;
    for (const entity of parsedEntities) {
      entity[2] = entity[2] + chancePosition;
      chancePosition = entity[2];
    }
    let closestChance = Infinity;
    let chosenEntity;
    for (const entity of parsedEntities) {
      let entityChance = entity[2] - weightedChance;
      if (entityChance > 0 && entityChance < closestChance) {
        closestChance = entityChance;
        chosenEntity = entity;
      }
    }
    return chosenEntity;
  }
}

export function terrainMaker(gameState) {
  let gameboardWidth = gameState.settings.gameboardWidth;
  let gameboardHeight = gameState.settings.gameboardHeight;
  let groundLevel = gameState.settings.groundLevel;
  let groundRoughness = gameState.settings.groundRoughness;
  let waterLevel = gameState.settings.waterLevel;
  let gameMode = gameState.settings.gameMode;
  let activeGround = gameState.active.activeGround;
  let activeFluid = gameState.active.activeFluid;
  let groundList = GroundList;
  let fluidList = FluidList;
  for (
    let h = gameboardHeight.current;
    h > gameboardHeight.current - groundLevel.current;
    h--
  ) {
    for (let w = 1; w <= gameboardWidth.current; w++) {
      let spawnChance = 10;
      if (gameMode.current === "king") {
        if (w < 3) {
          spawnChance = 10;
        } else if (w > gameboardWidth.current / 2) {
          spawnChance = Math.random() * 10;
        } else {
          spawnChance = Math.random() * 50;
        }
      } else {
        spawnChance = Math.random() * 10;
      }
      if (spawnChance > groundRoughness.current) {
        let type = "dirt";
        let position = [w, h - gameboardHeight.current];
        let groundID = type + position[0] + position[1];
        groundID = new Ground(groundList[type], position, groundID, gameState);
        activeGround.current.push(groundID);
      }
    }
  }
  for (
    let h = -groundLevel.current;
    h > -groundLevel.current - waterLevel.current;
    h--
  ) {
    for (let w = 1; w <= gameboardWidth.current; w++) {
      let position = [w, h];
      let waterID = "water" + position[0] + position[1];
      waterID = new Fluid(fluidList["water"], position, waterID, gameState);
      activeFluid.current.push(waterID);
    }
  }
}

export function ghoster(gameState) {
  let activeEntities = gameState.active.activeEntities;
  let activeGround = gameState.active.activeGround;
  let activeFluid = gameState.active.activeFluid;
  let activeProjectiles = gameState.active.activeProjectiles;
  for (const entity of activeEntities.current) {
    entity.fallSpeed = 0;
    entity.ghost = true;
  }
  for (const ground of activeGround.current) {
    ground.fallSpeed = 0;
    ground.ghost = true;
  }
  for (const fluid of activeFluid.current) {
    fluid.ghost = true;
  }
  for (const projectile of activeProjectiles.current) {
    activeProjectiles.current.splice(
      activeProjectiles.current.indexOf(projectile),
      1
    );
  }
}
