import { toBoard, comparePosition } from "./Tools.jsx";
import EntityList from "./Lists/EntityList.jsx";
import GroundList from "./Lists/GroundList.jsx";
import FluidList from "./Lists/FluidList.jsx";
import Entity from "./Classes/Entity.jsx";
import Ground from "./Classes/Ground.jsx";
import Fluid from "./Classes/Fluid.jsx";
let entityList = EntityList;
let groundList = GroundList;
let fluidList = FluidList;

export function engine(gameState) {
  let activeEntities = gameState.active.activeEntities;
  let entityBoard = gameState.active.entityBoard;
  let activeProjectiles = gameState.active.activeProjectiles;
  let activeGround = gameState.active.activeGround;
  let activeFluid = gameState.active.activeFluid;
  let activeEffects = gameState.active.activeEffects;
  let enemySpawnCount = gameState.engine.enemySpawnCount;
  let friendlySpawnCount = gameState.engine.friendlySpawnCount;
  let lastEnemySpawnTime = gameState.engine.lastEnemySpawnTime;
  let lastFriendlySpawnTime = gameState.engine.lastFriendlySpawnTime;
  let timer = gameState.engine.timer;
  let gameboardWidth = gameState.settings.gameboardWidth;
  let gameboardHeight = gameState.settings.gameboardHeight;
  let renderWidth = gameState.render.renderWidth;
  let renderHeight = gameState.render.renderHeight;
  let groundLevel = gameState.settings.groundLevel;
  let groundRoughness = gameState.settings.groundRoughness;
  let waterLevel = gameState.settings.waterLevel;
  let gameSpeed = gameState.settings.gameSpeed;
  let totalSpawns = gameState.settings.totalSpawns;
  let spawnSpeed = gameState.settings.spawnSpeed;
  let gameMode = gameState.settings.gameMode;
  let gameStatus = gameState.render.gameStatus;
  let newRound = gameState.engine.newRound;
  let blobAtEnd = gameState.engine.blobAtEnd;
  let gameStatePacked = gameState;

  function terrainMaker() {
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
          let stoneChance;
          let type = "dirt";
          if (h > gameboardHeight.current - groundLevel.current / 3) {
            stoneChance = 40;
            if (Math.random() * 100 < stoneChance) {
              type = "stone";
            }
          }
          let position = [w, h - gameboardHeight.current];
          let groundID = type + position[0] + position[1];
          groundID = new Ground(
            groundList[type],
            position,
            groundID,
            gameStatePacked
          );
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
        waterID = new Fluid(
          fluidList["water"],
          position,
          waterID,
          gameStatePacked
        );
        activeFluid.current.push(waterID);
      }
    }
  }

  function gamemode() {
    if (gameMode.current === "king") {
      gameStatus.current = "King round in progress";
      return kingTurn();
    }
    if (gameMode.current === "battle") {
      gameStatus.current = "Battle round in progress";
      return battleTurn();
    }
    if (gameMode.current === "blob") {
      gameStatus.current = "Blob round in progress";
      return blobTurn();
    }
    if (gameMode.current === "blob fight") {
      gameStatus.current = "Blob fight in progress";
      return blobFightTurn();
    }
    if (gameMode.current === "blob gob") {
      gameStatus.current = "Blob vs enemies round in progress";
      return blobGobTurn();
      z;
    }
    if (gameMode.current === "sandbox") {
      gameStatus.current = "Sandbox in progress";
      return sandboxTurn();
    }

    function kingTurn() {
      if (!friendlySpawnCount.current) {
        entitySpawner(["king", 1], false);
        friendlySpawnCount.current++;
      }
      spawnChecker(true);
      nextTurn();
      if (!victoryChecker()) {
        clearInterval(timer.current);
      }
    }

    function battleTurn() {
      spawnChecker(true);
      spawnChecker(false);
      nextTurn();
      if (!victoryChecker()) {
        clearInterval(timer.current);
      }
    }

    function blobTurn() {
      if (lastEnemySpawnTime.current < 201) {
        lastEnemySpawnTime.current++;
      }
      if (lastEnemySpawnTime.current === 200) {
        let firstBlob = entitySpawner(["blob", 1], true);
        firstBlob.hp = firstBlob.maxHp;
        enemySpawnCount.current++;
      }
      nextTurn();
      if (!victoryChecker()) {
        clearInterval(timer.current);
      }
    }

    function blobFightTurn() {
      if (!activeEntities.current.length) {
        lastEnemySpawnTime.current++;
      }
      if (
        lastEnemySpawnTime.current === 200 / gameSpeed.current &&
        !activeEntities.current.length
      ) {
        let firstBlob = entitySpawner(["blob", 1], true);
        firstBlob.hp = firstBlob.maxHp;
        let secondBlob = entitySpawner(["blob", 1], false);
        secondBlob.hp = secondBlob.maxHp;
      }
      nextTurn();
      if (!victoryChecker()) {
        clearInterval(timer.current);
      }
    }

    function blobGobTurn() {
      lastEnemySpawnTime.current++;
      if (lastEnemySpawnTime.current === 100 / gameSpeed.current) {
        let firstBlob = entitySpawner(["blob", 1], true);
        firstBlob.hp = firstBlob.maxHp * 5;
      }
      spawnChecker(false);
      nextTurn();
      if (!victoryChecker()) {
        clearInterval(timer.current);
      }
    }

    function sandboxTurn() {
      nextTurn();
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

    function victoryChecker() {
      if (gameMode.current === "king") {
        let kingAlive = activeEntities.current.find(
          (entity) => entity.type === "king"
        );
        if (!kingAlive && totalSpawns.current) {
          gameStatus.current = "King dead, you lose";
          return false;
        }
        let enemiesAlive = activeEntities.current.filter(
          (entity) => entity.enemy
        );
        if (
          enemySpawnCount.current >= totalSpawns.current &&
          !enemiesAlive.length
        ) {
          gameStatus.current = "All enemies dead";
          return false;
        }
        return true;
      }
      if (gameMode.current === "battle") {
        let enemiesAlive = activeEntities.current.filter(
          (entity) => entity.enemy
        );
        if (
          enemySpawnCount.current >= totalSpawns.current &&
          !enemiesAlive.length
        ) {
          gameStatus.current = "All enemies dead";
          return false;
        }
        let friendliesAlive = activeEntities.current.filter(
          (entity) => !entity.enemy
        );
        if (
          friendlySpawnCount.current >= totalSpawns.current &&
          !friendliesAlive.length
        ) {
          gameStatus.current = "All friendlies dead";
          return false;
        }
        return true;
      }
      if (gameMode.current === "blob") {
        if (blobAtEnd.current) {
          gameStatus.current = "Blob at end. You lose";
          return false;
        }
        let enemiesAlive = activeEntities.current.filter(
          (entity) => entity.enemy
        );
        if (!enemiesAlive.length && enemySpawnCount.current) {
          gameStatus.current = "Enemy blob dead";
          return false;
        }
        return true;
      }
      if (gameMode.current === "blob fight") {
        let enemiesAlive = activeEntities.current.filter(
          (entity) => entity.enemy
        );
        let friendliesAlive = activeEntities.current.filter(
          (entity) => !entity.enemy
        );
        if (
          !enemiesAlive.length &&
          friendliesAlive.length &&
          enemySpawnCount.current
        ) {
          gameStatus.current = "Enemy blob dead";
          return false;
        }
        if (
          !friendliesAlive.length &&
          enemiesAlive.length &&
          friendlySpawnCount.current
        ) {
          gameStatus.current = "Friendly blob dead";
          return false;
        }
        return true;
      }
      if (gameMode.current === "blob gob") {
        let friendliesAlive = activeEntities.current.filter(
          (entity) => !entity.enemy
        );
        if (
          (friendlySpawnCount.current === totalSpawns.current &&
            !friendliesAlive.length) ||
          blobAtEnd
        ) {
          gameStatus.current = "Friendlies lose";
          return false;
        }
        let enemiesAlive = activeEntities.current.filter(
          (entity) => entity.enemy
        );
        if (!enemiesAlive.length && friendlySpawnCount.current > 1) {
          gameStatus.current = "Enemies lose";
          return false;
        }
        return true;
      }
    }

    function spawnChecker(enemy) {
      if (enemy) {
        if (enemySpawnCount.current < totalSpawns.current) {
          lastEnemySpawnTime.current++;
          if (lastEnemySpawnTime.current > spawnTime()) {
            entitySpawner(spawnType(), enemy);
            enemySpawnCount.current++;
            lastEnemySpawnTime.current = 0;
          }
        }
      } else if (!enemy) {
        if (friendlySpawnCount.current < totalSpawns.current) {
          lastFriendlySpawnTime.current++;
          if (lastFriendlySpawnTime.current > spawnTime()) {
            entitySpawner(spawnType(), enemy);
            friendlySpawnCount.current++;
            lastFriendlySpawnTime.current = 0;
          }
        }
      }
    }

    function spawnTime() {
      let baseline = 80;
      let actual =
        (baseline + 80 * Math.random()) /
        spawnSpeed.current /
        gameSpeed.current;
      return actual;
    }

    function spawnType() {
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

    function entitySpawner(entity, enemy) {
      let entityType = entityList[entity[0]];
      let entityLvl = entityType.lvls["lvl" + entity[1]];
      let position = spawnPositionFinder(enemy);
      let entityID = entity[0];
      if (enemy) {
        entityID += enemySpawnCount.current;
      } else entityID += friendlySpawnCount.current;
      entityID = new Entity(
        entityType,
        entityLvl,
        position,
        entityID,
        gameStatePacked
      );
      if (!enemy) {
        entityID.enemy = false;
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
    }

    function spawnPositionFinder(enemy) {
      let baselinePosition;
      if (enemy) {
        baselinePosition = [
          gameboardWidth.current,
          gameboardHeight.current - 1,
        ];
      } else if (!enemy) {
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

  function ghoster() {
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

  if (newRound.current) {
    ghoster();
    terrainMaker();
    newRound.current = false;
  }
  gamemode();
}
