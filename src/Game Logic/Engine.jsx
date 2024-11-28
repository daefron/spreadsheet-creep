import {
  toBoard,
  onBoard,
  moveBoard,
  direction,
  comparePosition,
} from "./Tools.jsx";
import EntityList from "./Lists/EntityList.jsx";
import ProjectileList from "./Lists/ProjectileList.jsx";
import GroundList from "./Lists/GroundList.jsx";
import FluidList from "./Lists/FluidList.jsx";
import EffectList from "./Lists/EffectList.jsx";
import Entity from "./Classes/Entity.jsx";
import Projectile from "./Classes/Projectile.jsx";
import Ground from "./Classes/Ground.jsx";
import Fluid from "./Classes/Fluid.jsx";
import Effect from "./Classes/Effect.jsx";
let entityList = EntityList;
let projectileList = ProjectileList;
let groundList = GroundList;
let fluidList = FluidList;
let effectList = EffectList;

export function engine(gameState) {
  let activeEntities = gameState.active.activeEntities;
  let entityBoard = gameState.active.entityBoard;
  let activeProjectiles = gameState.active.activeProjectiles;
  let projectileBoard = gameState.active.projectileBoard;
  let activeGround = gameState.active.activeGround;
  let groundBoard = gameState.active.groundBoard;
  let activeFluid = gameState.active.activeFluid;
  let fluidBoard = gameState.active.fluidBoard;
  let activeEffects = gameState.active.activeEffects;
  let effectBoard = gameState.active.effectBoard;
  let friendlyGraveyard = gameState.graveyard.friendlyGraveyard;
  let enemyGraveyard = gameState.graveyard.enemyGraveyard;
  let groundGraveyard = gameState.graveyard.groundGraveyard;
  let fluidGraveyard = gameState.graveyard.fluidGraveyard;
  let bank = gameState.engine.bank;
  let setBank = gameState.engine.setBank;
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
  let projectileCount = gameState.engine.projectileCount;
  let newRound = gameState.engine.newRound;
  let gameState1 = gameState;
  let blobAtEnd;

  function explosion(currentEntity) {
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
        let entityInCell = onBoard(entityBoard.current, position);
        let groundInCell = onBoard(groundBoard.current, position);
        let fluidInCell = onBoard(fluidBoard.current, position);
        let projectileInCell = onBoard(projectileBoard.current, position);
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
        effectID = new Effect(effectType, effectPosition, effectID);
        toBoard(effectBoard.current, effectPosition, effectID);
        activeEffects.current.push(effectID);
        h--;
      }
      h = initialH;
      w--;
    }
  }

  function statUpdate(currentEntity) {
    currentEntity.rate /= gameSpeed.current;
    currentEntity.speed /= gameSpeed.current;
    currentEntity.fallSpeed /= gameSpeed.current;
  }

  function spawn(entity) {
    let entityID = entity.name;
    let entityType = entityList[entity.spawnType];
    let entityLvl = entityType.lvls["lvl" + entity.lvl];
    entityID = new Entity(
      entityType,
      entityLvl,
      entity.position,
      entityID,
      gameState
    );
    entityID.enemy = entity.enemy;
    statUpdate(entityID);
    activeEntities.current.push(entityID);
  }

  function entityKiller(entity) {
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
      toBoard(entityBoard.current, entity.position, undefined);
      if (entity.enemy) {
        setBank(entity.value + bank);
        enemyGraveyard.current.push(
          activeEntities.current.splice(
            activeEntities.current.indexOf(entity),
            1
          )
        );
      } else {
        friendlyGraveyard.current.push(
          activeEntities.current.splice(
            activeEntities.current.indexOf(entity),
            1
          )
        );
      }
    } else if (entity.class === "ground") {
      toBoard(groundBoard.current, entity.position, undefined);
      groundGraveyard.current.push(
        activeGround.current.splice(activeGround.current.indexOf(entity), 1)
      );
    } else if (entity.class === "fluid") {
      toBoard(fluidBoard.current, entity.position, undefined);
      fluidGraveyard.current.push(
        activeFluid.current.splice(activeFluid.current.indexOf(entity), 1)
      );
    } else if (entity.class === "projectile") {
      toBoard(projectileBoard.current, entity.position, undefined);
      activeProjectiles.current.splice(
        activeProjectiles.current.indexOf(entity),
        1
      );
    }
  }

  function fluidChecker(currentEntity) {
    if (currentEntity.position[1] < 1) {
      return;
    }
    let fluidInPosition = onBoard(fluidBoard.current, currentEntity.position);
    if (fluidInPosition) {
      if (currentEntity.sponge) {
        currentEntity.hp -= 2;
        entityKiller(fluidInPosition);
      } else if (!currentEntity.inFluid) {
        currentEntity.inFluid = true;
        currentEntity.speed *= 1.5;
        currentEntity.rate *= 1.5;
        currentEntity.rateCharge *= 1.5;
        currentEntity.fallSpeed *= 8;
        if (currentEntity.breathes) {
          currentEntity.oxygen = 300 / gameSpeed.current;
        }
      } else {
        currentEntity.oxygen--;
        if (!currentEntity.oxygen) {
          currentEntity.hp--;
          if (currentEntity.hp <= 0) {
            entityKiller(currentEntity);
          }
          currentEntity.oxygen = 50 / gameSpeed.current;
        }
      }
    } else if (currentEntity.inFluid) {
      currentEntity.inFluid = false;
      currentEntity.speed /= 1.5;
      currentEntity.rate /= 1.5;
      currentEntity.rateCharge /= 1.5;
      currentEntity.fallSpeed /= 8;
      currentEntity.oxygen = undefined;
    }
  }

  function projectileTurn(projectile) {
    fluidChecker(projectile);
    projectile.speedCharge++;
    if (projectile.type === "missile") {
      if (missleCanMove(projectile)) {
        missileMovement(projectile);
        return;
      }
    }
    if (projectile.type === "arrow" || projectile.type === "laser") {
      if (arrowCanMove(projectile)) {
        arrowMovement(projectile);
        return;
      }
    }
    if (projectile.type === "barrel") {
      if (barrelCanFall(projectile.position)) {
        barrelFall(projectile);
        return;
      }
      if (barrelCanMove(projectile)) {
        barrelMovement(projectile);
        return;
      }
    }

    function barrelCanFall(position) {
      if (position[1] !== gameboardHeight.current) {
        let positionBelow = [position[0], position[1] + 1];
        let entityBelow = onBoard(entityBoard.current, positionBelow);
        let groundBelow = onBoard(groundBoard.current, positionBelow);
        if (entityBelow) {
          entityKiller(projectile);
          return false;
        } else if (groundBelow) {
          return false;
        }
        return true;
      }
    }

    function barrelFall(projectile) {
      if (projectile.fallCharge < projectile.fallSpeed) {
        projectile.fallCharge++;
      } else {
        projectile.fallCharge = 0;
        let position = [projectile.position[0], projectile.position[1] + 1];
        moveBoard(projectileBoard.current, position, projectile);
        projectile.speedCharge = projectile.speed / 2;
      }
    }

    function barrelCanMove(projectile) {
      if (projectile.speedCharge >= projectile.speed) {
        return true;
      }
    }

    function barrelMovement(projectile) {
      let entityInCurrent = onBoard(entityBoard.current, projectile.position);
      if (entityInCurrent) {
        entityKiller(projectile);
        return;
      }
      let positionNextTo = [direction(projectile), projectile.position[1]];
      let entityNextTo = onBoard(entityBoard.current, positionNextTo);
      if (entityNextTo) {
        if (entityNextTo.enemy !== projectile.enemy) {
          entityKiller(projectile);
          return;
        }
      }
      let groundNextTo = onBoard(groundBoard.current, positionNextTo);
      if (groundNextTo) {
        entityKiller(projectile);
        return;
      }
      if (
        positionNextTo[0] === -1 ||
        positionNextTo[0] === gameboardWidth.current
      ) {
        entityKiller(projectile);
        return;
      }
      moveBoard(projectileBoard.current, positionNextTo, projectile);
      projectile.speedCharge = 0;
    }

    function missleCanMove(projectile) {
      if (projectile.speedCharge >= projectile.speed) {
        return true;
      }
    }

    function missileMovement(projectile) {
      if (projectile.direction === "up") {
        let enemies = activeEntities.current.filter((entity) => entity.enemy);
        let highest = { position: [1, Infinity] };
        for (const ground of activeGround.current) {
          if (ground.position[1] < highest.position[1]) {
            highest = ground;
          }
        }
        for (const entity of enemies) {
          if (entity.position[1] < highest.position[1]) {
            highest = entity;
          }
        }
        if (projectile.position[1] > highest.position[1] - 4) {
          let newPosition = [
            projectile.position[0],
            projectile.position[1] - 1,
          ];
          let entityInPosition = onBoard(entityBoard.current, newPosition);
          if (entityInPosition) {
            if (entityInPosition.enemy !== projectile.enemy) {
              entityInPosition.hp -= projectile.dmg;
              entityKiller(projectile);
              return;
            }
          }
          moveBoard(projectileBoard.current, newPosition, projectile);
          projectile.speedCharge = 0;
        } else {
          projectile.direction = "right";
          projectile.speed = 4;
          projectile.symbol = projectileList[projectile.type].rightSymbol;
          return;
        }
      } else if (projectile.direction === "right") {
        if (belowTargetter(projectile)) {
          projectile.direction = "down";
          projectile.speed = 0;
          projectile.symbol = projectileList[projectile.type].downSymbol;
          return;
        }
        let newPosition = [projectile.position[0] + 1, projectile.position[1]];
        let entityInPosition = onBoard(entityBoard.current, newPosition);
        if (entityInPosition) {
          if (entityInPosition.enemy !== projectile.enemy) {
            entityInPosition.hp -= projectile.dmg;
            entityKiller(projectile);
            return;
          }
        }
        moveBoard(projectileBoard.current, newPosition, projectile);
        projectile.speedCharge = 0;
      } else if (projectile.direction === "down") {
        let newPosition = [projectile.position[0], projectile.position[1] + 1];
        let entityInPosition = onBoard(entityBoard.current, newPosition);
        if (entityInPosition) {
          if (entityInPosition.enemy !== projectile.enemy) {
            entityInPosition.hp -= projectile.dmg;
            entityKiller(projectile);
            return;
          }
        }
        let groundInPosition = onBoard(groundBoard.current, newPosition);
        if (groundInPosition || newPosition[1] === gameboardHeight.current) {
          entityKiller(projectile);
          return;
        }
        moveBoard(projectileBoard.current, newPosition, projectile);
        projectile.speedCharge = 0;
      }

      function belowTargetter(projectile) {
        let targetFound;
        for (let h = gameboardHeight.current; h > 1; h--) {
          let targetPosition = [projectile.position[0], h];
          let targetEntity = onBoard(entityBoard.current, targetPosition);
          if (targetEntity) {
            if (targetEntity.enemy !== projectile.enemy) {
              targetFound = true;
            }
          }
        }
        if (targetFound) {
          return true;
        }
      }
    }

    function arrowCanMove(projectile) {
      if (!projectile.distance) {
        activeProjectiles.current.splice(
          activeProjectiles.current.indexOf(projectile),
          1
        );
        return false;
      }
      if (projectile.speedCharge >= projectile.speed) {
        return true;
      }
    }

    function arrowMovement(projectile) {
      let newPosition = [direction(projectile), projectile.position[1]];
      let entityInPosition = onBoard(entityBoard.current, newPosition);
      let groundInPosition = onBoard(groundBoard.current, newPosition);
      if (entityInPosition) {
        if (projectile.type === "laser") {
          entityInPosition.hp -= projectile.dmg;
        } else if (entityInPosition.enemy === projectile.enemy) {
          entityInPosition.hp -= projectile.dmg;
        }
        if (!projectile.piercing) {
          entityKiller(projectile);
        } else projectile.position = newPosition;
      } else if (groundInPosition) {
        groundInPosition.hp -= projectile.dmg;
        if (!projectile.piercing) {
          entityKiller(projectile);
        } else projectile.position = newPosition;
      } else {
        projectile.speedCharge = 0;
        moveBoard(projectileBoard.current, newPosition, projectile);
        projectile.distance--;
      }
    }
  }

  function fluidTurn(fluid) {
    if (fluidCanFall(fluid)) {
      fluid.speed = 5;
      fluid.falling = true;
      fluidFall(fluid);
    } else {
      fluid.falling = false;
      fluidMovement(fluid);
    }

    function fluidCanFall(fluid) {
      if (fluid.position[1] < 0) {
        return true;
      }
      if (fluid.position[1] >= gameboardHeight.current) {
        if (fluid.ghost) {
          entityKiller(fluid);
          return true;
        }
        return false;
      }
      if (fluid.fallCharge < fluid.fallSpeed) {
        fluid.fallCharge++;
        return false;
      }
      let positionBelow = [fluid.position[0], fluid.position[1] + 1];
      let groundBelow = onBoard(groundBoard.current, positionBelow);
      let fluidBelow = onBoard(fluidBoard.current, positionBelow);
      if (groundBelow || fluidBelow) {
        return false;
      }
      return true;
    }

    function fluidFall(fluid) {
      fluid.fallCharge = 0;
      if (fluid.position[1] < 0) {
        fluid.position = [fluid.position[0], fluid.position[1] + 1];
      } else {
        moveBoard(
          fluidBoard.current,
          [fluid.position[0], fluid.position[1] + 1],
          fluid
        );
      }
    }

    function fluidMovement(fluid) {
      if (fluid.speedCharge < fluid.speed) {
        fluid.speedCharge++;
      } else {
        let targetPosition;
        if (fluid.direction === "left") {
          targetPosition = [fluid.position[0] - 1, fluid.position[1]];
        } else if (fluid.direction === "right") {
          targetPosition = [fluid.position[0] + 1, fluid.position[1]];
        }
        if (
          targetPosition[0] === -1 ||
          targetPosition[0] === gameboardWidth.current
        ) {
          return entityKiller(fluid);
        }
        let groundTarget = onBoard(groundBoard.current, targetPosition);
        let fluidTarget = onBoard(fluidBoard.current, targetPosition);
        if (!groundTarget && !fluidTarget) {
          moveBoard(fluidBoard.current, targetPosition, fluid);
          fluid.speedCharge = 0;
          fluid.speed *= 1.3;
          return;
        } else {
          if (fluid.direction === "left") {
            fluid.direction = "right";
          } else fluid.direction = "left";
        }
      }
      let fluidBelow = onBoard(fluidBoard.current, [
        fluid.position[0],
        fluid.position[1] + 1,
      ]);
      if (fluid.speed > 50 && fluidBelow) {
        fluid.speed = Infinity;
      }
    }
  }

  function effectTurn(effect) {
    if (effect.durationCharge < effect.duration) {
      effect.durationCharge++;
    } else {
      toBoard(effectBoard.current, effect.position, undefined);
      activeEffects.current.splice(activeEffects.current.indexOf(effect), 1);
    }
  }
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
            gameState1
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
        waterID = new Fluid(fluidList["water"], position, waterID, gameState1);
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
        projectileTurn(projectile);
      }
      for (const ground of activeGround.current) {
        ground.turn;
      }
      for (const fluid of activeFluid.current) {
        fluid.turn;
      }
      for (const effect of activeEffects.current) {
        effectTurn(effect);
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
        if (blobAtEnd) {
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
        gameState1
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
