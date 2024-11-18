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

export function engine(newRound, gameState) {
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
  let enemySpawnCount = gameState.engine.enemySpawnCount;
  let friendlySpawnCount = gameState.engine.friendlySpawnCount;
  let lastEnemySpawnTime = gameState.engine.lastEnemySpawnTime;
  let lastFriendlySpawnTime = gameState.engine.lastFriendlySpawnTime;
  let timer = gameState.engine.timer;
  let gameboardWidth = gameState.settings.gameboardWidth;
  let gameboardHeight = gameState.settings.gameboardHeight;
  let groundLevel = gameState.settings.groundLevel;
  let groundRoughness = gameState.settings.groundRoughness;
  let waterLevel = gameState.settings.waterLevel;
  let renderSpeed = gameState.settings.renderSpeed;
  let gameSpeed = gameState.settings.gameSpeed;
  let totalSpawns = gameState.settings.totalSpawns;
  let spawnSpeed = gameState.settings.spawnSpeed;
  let gameMode = gameState.settings.gameMode;
  let projectileCount = gameState.engine.projectileCount;
  let blobAtEnd = false;
  let engineTime = gameState.test.engineTime;
  let entityTime = gameState.test.entityTime;
  let projectileTime = gameState.test.projectileTime;
  let groundTime = gameState.test.groundTime;
  let fluidTime = gameState.test.fluidTime;
  let effectTime = gameState.test.effectTime;
  let testTime1 = gameState.test.testTime1;
  let testTime2 = gameState.test.testTime2;
  let testTime3 = gameState.test.testTime3;
  let testTime4 = gameState.test.testTime4;
  let testTime5 = gameState.test.testTime5;

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
        if (entityInCell !== undefined) {
          entityInCell.hp -= dmg;
        }
        if (groundInCell !== undefined) {
          groundInCell.hp -= dmg;
        }
        if (fluidInCell !== undefined) {
          let deathChance = Math.random() * 10;
          if (deathChance > 5) {
            entityKiller(fluidInCell);
          }
        }
        if (projectileInCell !== undefined) {
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
    entityID = new Entity(entityType, entityLvl, entity.position, entityID);
    entityID.enemy = entity.enemy;
    statUpdate(entityID);
    activeEntities.current.push(entityID);
  }

  //checks to see if entity dies
  function healthChecker(entity) {
    if (entity.hp <= 0) {
      entityKiller(entity);
      return true;
    }
  }

  //determines which graveyard entities get sent to
  function entityKiller(entity) {
    if (entity.death !== undefined) {
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
  //tells entities what to do on their turn
  function entityTurn(currentEntity) {
    if (healthChecker(currentEntity)) {
      return;
    }
    fluidChecker(currentEntity);
    if (entityBoundaryHandler(currentEntity)) {
      return;
    }
    if (currentEntity.type === "blob") {
      return blobTurn(currentEntity);
    }
    if (entityFall(currentEntity)) {
      return;
    }
    if (entityAttack(currentEntity)) {
      return;
    }
    if (entityMovement(currentEntity)) {
      return;
    }
    if (entityAttackGroundHandler(currentEntity)) {
      return;
    }

    function blobTurn(currentEntity) {
      let initialTestTime1 = Date.now();
      let initialTestTime5 = Date.now();
      let x = currentEntity.position[0];
      let y = currentEntity.position[1];
      let positionBelow = [x, y + 1];
      let groundBelow = onBoard(groundBoard.current, positionBelow);
      let entityBelow = onBoard(entityBoard.current, positionBelow);
      testTime5.current += Date.now() - initialTestTime5;
      if (blobFall()) {
        testTime1.current += Date.now() - initialTestTime1;
        return;
      }
      if (blobStatGain()) {
        testTime1.current += Date.now() - initialTestTime1;
        return;
      }
      initialTestTime5 = Date.now();
      if (Math.random() > 0.9) {
        return;
      }
      let positionAbove = [x, y - 1];
      let positionLeft = [x - 1, y];
      let positionRight = [x + 1, y];
      let entityAbove = onBoard(entityBoard.current, positionAbove);
      let entityLeft = onBoard(entityBoard.current, positionLeft);
      let entityRight = onBoard(entityBoard.current, positionRight);
      testTime5.current += Date.now() - initialTestTime5;
      blobSorter();
      initialTestTime5 = Date.now();
      let groundAbove = onBoard(groundBoard.current, positionAbove);
      let groundLeft = onBoard(groundBoard.current, positionLeft);
      let groundRight = onBoard(groundBoard.current, positionRight);
      testTime5.current += Date.now() - initialTestTime5;
      blobAttack();
      if (currentEntity.hp < 2) {
        testTime1.current += Date.now() - initialTestTime1;
        return;
      }
      if (blobBelow()) {
        testTime1.current += Date.now() - initialTestTime1;
        return;
      }
      if (currentEntity.hp < 3) {
        testTime1.current += Date.now() - initialTestTime1;
        return;
      }
      if (blobSide()) {
        testTime1.current += Date.now() - initialTestTime1;
        return;
      }
      if (blobAbove()) {
        testTime1.current += Date.now() - initialTestTime1;
        return;
      }
      testTime1.current += Date.now() - initialTestTime1;

      function blobStatGain() {
        if (currentEntity.hp >= currentEntity.maxHp) {
          return;
        }
        if (
          currentEntity.speed < currentEntity.speedCharge &&
          Math.random() < 0.5
        ) {
          currentEntity.hp++;
          currentEntity.speedCharge = 0;
          return true;
        }
        currentEntity.speedCharge++;
      }

      function blobFall() {
        if (
          groundBelow !== undefined ||
          entityBelow !== undefined ||
          positionBelow[1] === gameboardHeight.current + 1
        ) {
          return;
        }
        if (currentEntity.ghost) {
          if (positionBelow[1] >= gameboardHeight.current) {
            entityKiller(currentEntity);
          }
          moveBoard(entityBoard.current, positionBelow, currentEntity);
          return true;
        }
        let touchingGround = 0;
        let blobGroup = blobGrouper();
        blobGroup.forEach((entity) => {
          let x = entity.position[0];
          let y = entity.position[1];
          let groundBelow = onBoard(groundBoard.current, [x, y + 1]);
          if (y === gameboardHeight.current || groundBelow !== undefined) {
            touchingGround++;
            return;
          }
        });
        if (touchingGround === 0) {
          moveBoard(entityBoard.current, positionBelow, currentEntity);
          return true;
        }
      }

      function blobGrouper() {
        let allBlobs = activeEntities.current.filter(
          (entity) =>
            entity.type === currentEntity.type &&
            entity.enemy === currentEntity.enemy
        );
        aroundBlob(currentEntity);
        function aroundBlob(entity) {
          if (entity === undefined) {
            return;
          }
          if (entity.group !== currentEntity.name) {
            entity.group = currentEntity.name;
            let x = entity.position[0];
            let y = entity.position[1];
            let positionAbove = [x, y - 1];
            let positionBelow = [x, y + 1];
            let positionLeft = [x - 1, y];
            let positionRight = [x + 1, y];
            let blobAbove = onBoard(entityBoard.current, positionAbove);
            let blobBelow = onBoard(entityBoard.current, positionBelow);
            let blobLeft = onBoard(entityBoard.current, positionLeft);
            let blobRight = onBoard(entityBoard.current, positionRight);
            aroundBlob(blobAbove);
            aroundBlob(blobBelow);
            aroundBlob(blobLeft);
            aroundBlob(blobRight);
            return;
          }
        }
        return allBlobs.filter((entity) => entity.group === currentEntity.name);
      }

      function blobSorter() {
        if (!aboveAndBelowEqual()) {
          if (currentEntity.hp === 1) {
            return;
          }
          if (!belowLess() && !directionLess()) {
            downAndForward();
          }
        }

        function aboveAndBelowEqual() {
          if (currentEntity.hp >= currentEntity.maxHp) {
            return;
          }
          if (
            entityBelow !== undefined &&
            entityBelow.hp === currentEntity.hp &&
            entityBelow.enemy === currentEntity.enemy &&
            entityAbove !== undefined &&
            entityAbove.hp === currentEntity.hp &&
            entityAbove.enemy === currentEntity.enemy
          ) {
            if (currentEntity.hp === 1) {
              if (blobGrouper().length > 10) {
                currentEntity.hp--;
                entityAbove.hp++;
                return true;
              }
            } else {
              currentEntity.hp--;
              entityBelow.hp++;
              return true;
            }
          }
        }

        function belowLess() {
          if (
            entityBelow !== undefined &&
            entityBelow.type === currentEntity.type &&
            entityBelow.enemy === currentEntity.enemy &&
            entityBelow.hp < currentEntity.hp
          ) {
            currentEntity.hp--;
            entityBelow.hp++;
            return true;
          }
        }

        function directionLess() {
          if (currentEntity.enemy) {
            if (
              entityRight !== undefined &&
              entityRight.type === currentEntity.type &&
              entityRight.enemy === currentEntity.enemy &&
              entityRight.hp < currentEntity.hp
            ) {
              currentEntity.hp--;
              entityRight.hp++;
              return true;
            }
          } else if (!currentEntity.enemy) {
            if (
              entityLeft !== undefined &&
              entityLeft.type === currentEntity.type &&
              entityLeft.enemy === currentEntity.enemy &&
              entityLeft.hp < currentEntity.hp
            ) {
              currentEntity.hp--;
              entityLeft.hp++;
              return true;
            }
          }
        }

        function downAndForward() {
          let targets = [];
          if (currentEntity.enemy) {
            if (
              entityLeft !== undefined &&
              entityLeft.type === currentEntity.type &&
              entityLeft.enemy === currentEntity.enemy
            ) {
              targets.push(entityLeft);
            }
          } else {
            if (
              entityRight !== undefined &&
              entityRight.type === currentEntity.type &&
              entityRight.enemy === currentEntity.enemy
            ) {
              targets.push(entityRight);
            }
          }
          if (
            entityBelow !== undefined &&
            entityBelow.type === currentEntity.type &&
            entityBelow.enemy === currentEntity.enemy
          ) {
            targets.push(entityBelow);
          }
          if (targets.length === 0) {
            return;
          }
          let lowestHpEntity = { hp: Infinity };
          targets.forEach((entity) => {
            if (entity.hp < lowestHpEntity.hp) {
              lowestHpEntity = entity;
            }
          });
          let hpDiff = parseInt((currentEntity.hp - lowestHpEntity.hp) / 2);
          currentEntity.hp -= hpDiff;
          lowestHpEntity.hp += hpDiff;
        }
      }

      function blobAttack() {
        if (Math.random() < currentEntity.hp / 100) {
          if (groundAbove !== undefined) {
            groundAbove.hp--;
          } else if (
            entityAbove !== undefined &&
            entityAbove.enemy !== currentEntity.enemy
          ) {
            entityAbove.hp -= currentEntity.hp;
          }
          if (groundBelow !== undefined) {
            groundBelow.hp--;
          } else if (
            entityBelow !== undefined &&
            entityBelow.enemy !== currentEntity.enemy
          ) {
            entityBelow.hp -= currentEntity.hp;
          }
          if (groundLeft !== undefined) {
            groundLeft.hp--;
          } else if (
            entityLeft !== undefined &&
            entityLeft.enemy !== currentEntity.enemy
          ) {
            entityLeft.hp -= currentEntity.hp;
          }
          if (groundRight !== undefined) {
            groundRight.hp--;
          } else if (
            entityRight !== undefined &&
            entityRight.enemy !== currentEntity.enemy
          ) {
            entityRight.hp -= currentEntity.hp;
          }
        }
      }

      function blobBelow() {
        if (positionBelow[1] !== gameboardHeight.current + 1) {
          if (newBlobChecker(groundBelow, entityBelow, positionBelow)) {
            return true;
          }
        }
      }

      function blobSide() {
        if (Math.random() < 0.7) {
          return;
        }
        let newPosition = blobDirection();
        if (newPosition !== undefined) {
          let newGround = onBoard(groundBoard.current, newPosition);
          let newEntity = onBoard(entityBoard.current, newPosition);
          if (newBlobChecker(newGround, newEntity, newPosition)) {
            return true;
          }
        }

        function blobDirection() {
          let rightFree, leftFree;
          if (positionRight[0] > gameboardWidth.current) {
            rightFree = false;
          } else
            rightFree = groundRight === undefined || entityRight === undefined;
          if (positionLeft[0] < 1) {
            leftFree = false;
          } else
            leftFree = groundLeft === undefined || entityLeft === undefined;
          if (Math.random() > 0.5) {
            if (leftFree) {
              return positionLeft;
            } else if (rightFree) {
              return positionRight;
            }
          } else {
            if (rightFree) {
              return positionRight;
            } else if (leftFree) {
              return positionLeft;
            }
          }
        }
      }

      function blobAbove() {
        if (Math.random() < 0.2 || positionAbove[1] === 0) {
          return;
        }
        if (newBlobChecker(groundAbove, entityAbove, positionAbove)) {
          return true;
        }
      }

      function newBlobChecker(ground, entity, position) {
        if (ground === undefined && entity === undefined && position[1] > 0) {
          newBlob(position);
          return true;
        }
      }

      function newBlob(position) {
        currentEntity.hp -= 2;
        let entityType = entityList["blob"];
        let entityLvl = entityType.lvls["lvl" + currentEntity.lvl];
        let entityID = "blob" + enemySpawnCount.current;
        entityID = new Entity(entityType, entityLvl, position, entityID);
        entityID.enemy = currentEntity.enemy;
        statUpdate(entityID);
        toBoard(entityBoard.current, position, entityID);
        activeEntities.current.push(entityID);
        enemySpawnCount.current++;
      }
    }

    //determines what happens to entity if hits boundary wall
    function entityBoundaryHandler(currentEntity) {
      let newPosition = [direction(currentEntity), currentEntity.position[1]];
      if (
        (newPosition[0] === -1 ||
          newPosition[0] === gameboardWidth.current + 1) &&
        currentEntity.speedCharge >= currentEntity.speed / gameSpeed.current
      ) {
        if (gameMode.current === "king") {
          let king = activeEntities.current.find(
            (entity) => entity.type === "king"
          );
          king.hp -= currentEntity.dmg * 2;
          currentEntity.hp = 0;
          return true;
        } else if (gameMode.current === "battle") {
          if (currentEntity.enemy) {
            friendlySpawnCount.current += 2;
          } else if (!currentEntity.enemy) {
            enemySpawnCount.current += 2;
          }
          currentEntity.hp = 0;
        } else if (gameMode.current === "blob") {
          currentEntity.hp = 0;
          blobAtEnd = true;
        }
      }
    }
  }

  function fluidChecker(currentEntity) {
    if (currentEntity.position[1] < 1) {
      return;
    }
    let fluidInPosition = onBoard(fluidBoard.current, currentEntity.position);
    if (fluidInPosition !== undefined) {
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
        if (currentEntity.oxygen === 0) {
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

  //holds functions for entity falling
  function entityFall(currentEntity) {
    if (entityCanFall(currentEntity)) {
      entityFall(currentEntity);
      return true;
    }

    //function to determine if there is anything under the current entity
    function entityCanFall(currentEntity) {
      if (currentEntity.position[1] < 1) {
        currentEntity.position[1]++;
        return false;
      }
      if (currentEntity.position[1] !== gameboardHeight.current) {
        if (!currentEntity.climbing) {
          if (currentEntity.movement === "scaler") {
            let positionNextTo = [
              direction(currentEntity),
              currentEntity.position[1],
            ];
            let groundNextTo = onBoard(groundBoard.current, positionNextTo);
            let entityNextTo = onBoard(entityBoard.current, positionNextTo);
            if (groundNextTo !== undefined || entityNextTo !== undefined) {
              return false;
            }
          }
          let positionBelow = [
            currentEntity.position[0],
            currentEntity.position[1] + 1,
          ];
          let groundBelow = onBoard(groundBoard.current, positionBelow);
          let entityBelow = onBoard(entityBoard.current, positionBelow);
          if (groundBelow !== undefined || entityBelow !== undefined) {
            return false;
          }
          return true;
        }
      } else if (currentEntity.ghost) {
        entityKiller(currentEntity);
      }
    }

    //moves entities down if falling
    function entityFall(entity) {
      if (entity.fallCharge < entity.fallSpeed / gameSpeed.current) {
        entity.fallCharge++;
      } else {
        entity.fallCharge = 0;
        currentEntity.idle = 0;
        moveBoard(
          entityBoard.current,
          [entity.position[0], entity.position[1] + 1],
          entity
        );
        entity.speedCharge = entity.speed / 2;
      }
    }
  }

  //holds functions for entity attacks
  function entityAttack(currentEntity) {
    if (currentEntity.position[1] < 1) {
      currentEntity.position[1]++;
      return false;
    }
    if (currentEntity.attack !== undefined) {
      currentEntity.rateCharge++;
    }
    if (currentEntity.attack === "melee") {
      let rangeCells = meleeRange(currentEntity);
      let targetEntity = meleeAttackTargetter(currentEntity, rangeCells);
      if (entityCanAttack(currentEntity, targetEntity)) {
        meleeAttack(currentEntity, targetEntity);
        return true;
      }
      if (targetEntity !== undefined) {
        return true;
      }
    }
    if (currentEntity.attack === "projectile") {
      let target = projectileTargetter(currentEntity);
      if (target !== undefined) {
        if (entityCanAttack(currentEntity, target)) {
          rangedAttack(currentEntity);
          return true;
        }
      }
    }
    if (currentEntity.attack === "enemyExists") {
      if (enemyChecker()) {
        if (entityCanAttack(currentEntity, true)) {
          rangedAttack(currentEntity);
          return true;
        }
      }
    }
    if (currentEntity.attack === "automatic") {
      if (entityCanAttack(currentEntity, true)) {
        rangedAttack(currentEntity);
        return true;
      }
    }
    if (currentEntity.attack === "radius") {
      if (entityCanAttack(currentEntity, true)) {
        radiusAttack(currentEntity);
        return true;
      }
    }

    //function to determine if entity can attack this turn
    function entityCanAttack(currentEntity, targetEntity) {
      if (
        currentEntity.rateCharge >= currentEntity.rate &&
        currentEntity.rate !== 0
      ) {
        if (targetEntity !== undefined) {
          return true;
        }
      }
    }

    //function to return array of cells entity can target
    function meleeRange(currentEntity) {
      let rangeCells = [];
      let rangeLetter = direction(currentEntity);
      for (let i = currentEntity.range; i > 0; i--) {
        if (i === currentEntity.range) {
          rangeCells.push([rangeLetter, currentEntity.position[1] - 1]);
          rangeCells.push([
            currentEntity.position[0],
            currentEntity.position[1] - 1,
          ]);
          rangeCells.push([rangeLetter, currentEntity.position[1] + 1]);
          rangeCells.push([
            currentEntity.position[0],
            currentEntity.position[1] + 1,
          ]);
        }
        rangeCells.push([rangeLetter, currentEntity.position[1]]);
        if (currentEntity.enemy) {
          rangeLetter--;
        } else {
          rangeLetter++;
        }
      }
      return rangeCells;
    }

    //function to return entity to attack
    function meleeAttackTargetter(currentEntity, rangeCells) {
      let target;
      rangeCells.forEach((cell) => {
        let targetCell = onBoard(entityBoard.current, cell);
        if (
          targetCell !== undefined &&
          targetCell.enemy !== currentEntity.enemy
        ) {
          return (target = targetCell);
        }
      });
      return target;
    }

    //function to execute attack if can
    function meleeAttack(currentEntity, targetEntity) {
      targetEntity.hp -= currentEntity.dmg;
      currentEntity.rateCharge = 0;
      currentEntity.speedCharge = 0;
      currentEntity.idle = 0;
    }

    function projectileTargetter(currentEntity) {
      let target;
      let rangeLetter = direction(currentEntity);
      for (let i = currentEntity.range; i > 0; i--) {
        let targetPosition = [rangeLetter, currentEntity.position[1]];
        let groundTarget = onBoard(groundBoard.current, targetPosition);
        let entityTarget = onBoard(entityBoard.current, targetPosition);
        if (groundTarget !== undefined) {
          i = 0;
        }
        if (entityTarget !== undefined) {
          if (entityTarget.enemy !== currentEntity.enemy) {
            target = entityTarget;
          }
        }
        if (currentEntity.enemy) {
          rangeLetter--;
        } else {
          rangeLetter++;
        }
      }
      return target;
    }

    //function to spawn projectile
    function rangedAttack(currentEntity) {
      let projectileID =
        currentEntity.projectile + projectileCount.current + currentEntity.name;
      projectileCount.current++;
      let type = projectileList[currentEntity.projectile];
      if (currentEntity.projectile === "water") {
        projectileID = new Fluid(
          fluidList["water"],
          [currentEntity.position[0], currentEntity.position[1] - 3],
          projectileID
        );
        activeFluid.current.push(projectileID);
      } else {
        projectileID = new Projectile(currentEntity, projectileID, type);
        activeProjectiles.current.push(projectileID);
      }
      currentEntity.rateCharge = 0;
      currentEntity.speedCharge = 0;
      currentEntity.idle = 0;
    }

    function radiusAttack(currentEntity) {
      let w = currentEntity.range;
      let h = currentEntity.range;
      let initialW = w;
      let initialH = h;
      while (w >= -initialW) {
        while (h >= -initialH) {
          let position = [
            currentEntity.position[0] + w,
            currentEntity.position[1] + h,
          ];
          let entityInCell = onBoard(entityBoard.current, position);
          if (entityInCell !== currentEntity) {
            let groundInCell = onBoard(groundBoard.current, position);
            if (groundInCell === undefined) {
              if (
                entityInCell !== undefined &&
                entityInCell.enemy !== currentEntity.enemy
              ) {
                entityInCell.hp -= currentEntity.dmg;
              }
              let effectType = effectList["aura"];
              let effectID =
                "aura" +
                currentEntity.position[0] +
                w +
                currentEntity.position[1] +
                h;
              effectID = new Effect(effectType, position, effectID);
              toBoard(effectBoard.current, position, effectID);
              activeEffects.current.push(effectID);
            }
          }
          h--;
        }
        h = initialH;
        w--;
      }
      currentEntity.rateCharge = 0;
    }

    //checks to see if any enemies exist
    function enemyChecker() {
      let enemies = activeEntities.current.filter(
        (entity) => entity.enemy === true
      );
      if (enemies.length > 0) {
        return true;
      }
    }
  }

  //holds functions for entity movement
  function entityMovement(currentEntity) {
    currentEntity.speedCharge++;
    if (entityCanMove(currentEntity)) {
      return entityMovementType(currentEntity);
    }

    //function to determine if entity can move this turn
    function entityCanMove(currentEntity) {
      if (currentEntity.movement === undefined) {
        return false;
      }
      if (currentEntity.speedCharge >= currentEntity.speed) {
        return true;
      }
    }

    //function to determine how entity moves if it can
    function entityMovementType(currentEntity) {
      let newPosition = [direction(currentEntity), currentEntity.position[1]];
      if (currentEntity.movement === "walker") {
        if (climb(currentEntity)) {
          return true;
        }
        if (walk(currentEntity, newPosition)) {
          return true;
        }
      }
      if (currentEntity.movement === "scaler") {
        if (scale(currentEntity, newPosition)) {
          return true;
        }
        if (walk(currentEntity, newPosition)) {
          return true;
        }
      }
      return false;

      //holds climbing functions
      function climb(currentEntity) {
        let positionNextTo = [
          direction(currentEntity),
          currentEntity.position[1],
        ];
        if (climbChecker(currentEntity, positionNextTo)) {
          climbMovement(currentEntity, positionNextTo);
          return true;
        }

        //checks if entity wants to climb
        function climbChecker(currentEntity, positionNextTo) {
          let entityNextTo = onBoard(entityBoard.current, positionNextTo);
          if (
            entityNextTo !== undefined &&
            entityNextTo.enemy === currentEntity.enemy
          ) {
            return climbSpotFree(positionNextTo);
          }
          let groundNextTo = onBoard(groundBoard.current, positionNextTo);
          if (groundNextTo !== undefined) {
            return climbSpotFree(positionNextTo);
          }
          return false;

          //checks if position to climb into is free
          function climbSpotFree(positionNextTo) {
            let positionAbove = [positionNextTo[0], positionNextTo[1] - 1];
            let entityAbove = onBoard(entityBoard.current, positionAbove);
            let groundAbove = onBoard(groundBoard.current, positionAbove);
            if (entityAbove !== undefined || groundAbove !== undefined) {
              return false;
            }
            return true;
          }
        }

        //makes entity climb
        function climbMovement(currentEntity, positionNextTo) {
          let positionAbove = [positionNextTo[0], positionNextTo[1] - 1];
          moveBoard(entityBoard.current, positionAbove, currentEntity);
          currentEntity.speedCharge = 0;
          currentEntity.idle = 0;
        }
      }

      //holds functions for normal walking
      function walk(currentEntity, newPosition) {
        if (walkChecker(newPosition)) {
          walkMovement(currentEntity, newPosition);
          return true;
        }

        //checks if entity can walk
        function walkChecker(newPosition) {
          let entityCell = onBoard(entityBoard.current, newPosition);
          let groundCell = onBoard(groundBoard.current, newPosition);
          if (entityCell === undefined && groundCell === undefined) {
            return true;
          }
        }

        //makes entity walk
        function walkMovement(currentEntity, newPosition) {
          currentEntity.speedCharge = 0;
          currentEntity.idle = 0;
          moveBoard(entityBoard.current, newPosition, currentEntity);
        }
      }

      function scale(currentEntity, newPosition) {
        let entityNextTo = onBoard(entityBoard.current, newPosition);
        let groundNextTo = onBoard(groundBoard.current, newPosition);
        if (entityNextTo === undefined && groundNextTo === undefined) {
          return false;
        }
        if (currentEntity.speedCharge < currentEntity.speed) {
          return false;
        }
        let positionAboveNextTo = [newPosition[0], newPosition[1] - 1];
        let entityAboveNextTo = onBoard(
          entityBoard.current,
          positionAboveNextTo
        );
        let groundAboveNextTo = onBoard(
          groundBoard.current,
          positionAboveNextTo
        );
        let canScale = false;
        if (groundNextTo !== undefined || entityNextTo !== undefined) {
          if (
            entityAboveNextTo !== undefined ||
            groundAboveNextTo !== undefined
          ) {
            canScale = true;
          }
        }
        if (canScale) {
          currentEntity.climbing = true;
          let positionAbove = [
            currentEntity.position[0],
            currentEntity.position[1] - 1,
          ];
          let entityAbove = onBoard(entityBoard.current, positionAbove);
          let groundAbove = onBoard(groundBoard.current, positionAbove);
          if (entityAbove === undefined && groundAbove === undefined) {
            moveBoard(entityBoard.current, positionAbove, currentEntity);
            currentEntity.speedCharge = 0;
            currentEntity.idle = 0;
          }
          return true;
        } else {
          currentEntity.climbing = false;
          moveBoard(entityBoard.current, positionAboveNextTo, currentEntity);
          currentEntity.speedCharge = 0;
          currentEntity.idle = 0;
          return false;
        }
      }
    }
  }

  //holds functions for entities attacking ground
  function entityAttackGroundHandler(currentEntity) {
    if (entityCanAttackGround(currentEntity)) {
      entityAttackGround(currentEntity);
      return true;
    }

    //checks if entity is allowed to attack adjacent ground
    function entityCanAttackGround(currentEntity) {
      if (currentEntity.idle === undefined) {
        currentEntity.idle = 0;
      }
      currentEntity.idle++;
      if (
        currentEntity.rateCharge >= currentEntity.rate &&
        currentEntity.rate !== 0 &&
        currentEntity.idle >= 30
      ) {
        let targetGround = onBoard(groundBoard.current, [
          direction(currentEntity),
          currentEntity.position[1],
        ]);
        if (targetGround !== undefined) {
          return true;
        }
      }
      return false;
    }

    //makes entity attack adjacent ground
    function entityAttackGround(currentEntity) {
      let targetGround = onBoard(groundBoard.current, [
        direction(currentEntity),
        currentEntity.position[1],
      ]);
      targetGround.hp -= currentEntity.dmg;
      currentEntity.rateCharge = 0;
      currentEntity.speedCharge = 0;
    }
  }

  //tells the projectile what to do on its turn
  function projectileTurn(projectile) {
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
        if (entityBelow !== undefined) {
          entityKiller(projectile);
          return false;
        } else if (groundBelow !== undefined) {
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
      if (entityInCurrent !== undefined) {
        entityKiller(projectile);
      }
      let positionNextTo = [direction(projectile), projectile.position[1]];
      let entityNextTo = onBoard(entityBoard.current, positionNextTo);
      if (entityNextTo !== undefined) {
        if (entityNextTo.enemy !== projectile.enemy) {
          entityKiller(projectile);
          return;
        }
      }
      let groundNextTo = onBoard(groundBoard.current, positionNextTo);
      if (groundNextTo !== undefined) {
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
        activeGround.current.forEach((ground) => {
          if (ground.position[1] < highest.position[1]) {
            highest = ground;
          }
        });
        enemies.forEach((entity) => {
          if (entity.position[1] < highest.position[1]) {
            highest = entity;
          }
        });
        if (projectile.position[1] > highest.position[1] - 2) {
          let newPosition = [
            projectile.position[0],
            projectile.position[1] - 1,
          ];
          let entityInPosition = onBoard(entityBoard.current, newPosition);
          if (entityInPosition !== undefined) {
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
        if (entityInPosition !== undefined) {
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
        if (entityInPosition !== undefined) {
          if (entityInPosition.enemy !== projectile.enemy) {
            entityInPosition.hp -= projectile.dmg;
            entityKiller(projectile);
            return;
          }
        }
        moveBoard(projectileBoard.current, newPosition, projectile);
        projectile.speedCharge = 0;
      }

      //checks to see if there is an enemy below projectile
      function belowTargetter(projectile) {
        let targetFound = false;
        for (let h = gameboardHeight.current; h > 1; h--) {
          let targetPosition = [projectile.position[0], h];
          let targetEntity = onBoard(entityBoard.current, targetPosition);
          if (targetEntity !== undefined) {
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

    //checks if the projectile can move this turn
    function arrowCanMove(projectile) {
      if (projectile.distance === 0) {
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

    //checks to see if projectile will move or attack enemy
    function arrowMovement(projectile) {
      let newPosition = [direction(projectile), projectile.position[1]];
      let entityInPosition = onBoard(entityBoard.current, newPosition);
      let groundInPosition = onBoard(groundBoard.current, newPosition);
      if (entityInPosition !== undefined) {
        if (projectile.type === "laser") {
          entityInPosition.hp -= projectile.dmg;
        } else if (entityInPosition.enemy === projectile.enemy) {
          entityInPosition.hp -= projectile.dmg;
        }
        if (!projectile.piercing) {
          entityKiller(projectile);
        } else projectile.position = newPosition;
      } else if (groundInPosition !== undefined) {
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

  function groundTurn(ground) {
    if (healthChecker(ground)) {
      return;
    }
    if (groundCanFall(ground)) {
      return groundFall(ground);
    } else {
      return (ground.falling = false);
    }

    function groundCanFall(ground) {
      if (ground.position[1] < 0) {
        return true;
      }
      if (ground.position[1] >= gameboardHeight.current) {
        if (ground.ghost) {
          entityKiller(ground);
        }
        return false;
      }
      if (ground.fallCharge < ground.fallSpeed) {
        ground.fallCharge++;
        return false;
      }
      let positionBelow = [ground.position[0], ground.position[1] + 1];
      let groundBelow = onBoard(groundBoard.current, positionBelow);
      if (groundBelow === undefined) {
        let entityBelow = onBoard(entityBoard.current, positionBelow);
        if (entityBelow !== undefined) {
          groundAttack(ground, entityBelow);
        }
        return true;
      }
    }

    function groundFall(ground) {
      ground.fallCharge = 0;
      if (ground.position[1] < 1) {
        ground.position = [ground.position[0], ground.position[1] + 1];
      } else {
        moveBoard(
          groundBoard.current,
          [ground.position[0], ground.position[1] + 1],
          ground
        );
      }
      ground.falling = true;
    }

    function groundAttack(entityBelow) {
      entityBelow.hp = 0;
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
      if (fluid.position[1] < gameboardHeight.current) {
        let positionBelow = [fluid.position[0], fluid.position[1] + 1];
        let groundBelow = onBoard(groundBoard.current, positionBelow);
        let fluidBelow = onBoard(fluidBoard.current, positionBelow);
        if (groundBelow !== undefined || fluidBelow !== undefined) {
          return false;
        }
        return true;
      } else if (fluid.ghost) {
        entityKiller(fluid);
      }
    }

    function fluidFall(fluid) {
      if (fluid.fallCharge < fluid.fallSpeed) {
        fluid.fallCharge++;
      } else {
        fluid.fallCharge = 0;
        if (fluid.position[1] < 1) {
          fluid.position = [fluid.position[0], fluid.position[1] + 1];
        } else {
          moveBoard(
            fluidBoard.current,
            [fluid.position[0], fluid.position[1] + 1],
            fluid
          );
        }
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
        if (groundTarget === undefined && fluidTarget === undefined) {
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
      if (fluid.speed > 50 && fluidBelow !== undefined) {
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
  //creates ground based on groundHeight and type
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
          groundID = new Ground(groundList[type], position, groundID);
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
        waterID = new Fluid(fluidList["water"], position, waterID);
        activeFluid.current.push(waterID);
      }
    }
  }

  function gamemode(finished) {
    let gameFinished = finished;
    if (!gameFinished) {
      if (gameMode.current === "king") {
        timer.current = setInterval(() => {
          kingTurn();
        }, renderSpeed.current * 4);
      } else if (gameMode.current === "battle") {
        timer.current = setInterval(() => {
          battleTurn();
        }, renderSpeed.current * 4);
      } else if (gameMode.current === "blob") {
        timer.current = setInterval(() => {
          blobTurn();
        }, renderSpeed.current * 4);
      } else if (gameMode.current === "blob fight") {
        timer.current = setInterval(() => {
          blobFightTurn();
        }, renderSpeed.current * 4);
      } else if (gameMode.current === "blob gob") {
        timer.current = setInterval(() => {
          blobGobTurn();
        }, renderSpeed.current * 4);
      } else if (gameMode.current === "sandbox") {
        timer.current = setInterval(() => {
          sandboxTurn();
        }, renderSpeed.current * 4);
      }
    }

    function kingTurn() {
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
      }
      nextTurn();
      if (!victoryChecker()) {
        clearInterval(timer.current);
      }
    }

    function blobFightTurn() {
      if (activeEntities.current.length === 0) {
        lastEnemySpawnTime.current++;
      }
      if (
        lastEnemySpawnTime.current === 200 / gameSpeed.current &&
        activeEntities.current.length === 0
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

    //makes all entities take turn
    function nextTurn() {
      let initialTime = Date.now();
      let engineInitialTime = Date.now();
      activeEntities.current.forEach((entity) => {
        entityTurn(entity);
      });
      entityTime.current += Date.now() - initialTime;
      initialTime = Date.now();
      activeProjectiles.current.forEach((projectile) => {
        projectileTurn(projectile);
      });
      projectileTime.current += Date.now() - initialTime;
      initialTime = Date.now();
      activeGround.current.forEach((ground) => {
        groundTurn(ground);
      });
      groundTime.current += Date.now() - initialTime;
      initialTime = Date.now();
      activeFluid.current.forEach((fluid) => {
        fluidTurn(fluid);
      });
      fluidTime.current += Date.now() - initialTime;
      initialTime = Date.now();
      activeEffects.current.forEach((effect) => {
        effectTurn(effect);
      });
      effectTime.current += Date.now() - initialTime;
      engineTime.current += Date.now() - engineInitialTime;
    }

    function victoryChecker() {
      if (gameMode.current === "king") {
        let kingAlive =
          activeEntities.current.find((entity) => entity.type === "king") !==
          undefined;
        if (kingAlive) {
          return true;
        }
        return false;
      } else if (gameMode.current === "battle") {
        if (
          enemySpawnCount.current === totalSpawns.current ||
          friendlySpawnCount.current === totalSpawns.current
        ) {
          return false;
        }
        return true;
      } else if (gameMode.current === "blob") {
        if (blobAtEnd) {
          return false;
        } else return true;
      } else if (
        gameMode.current === "blob fight" ||
        gameMode.current === "blob gob"
      ) {
        return true;
      }
    }

    //checks if game is allowed to spawn on current turn
    function spawnChecker(enemy) {
      if (enemy) {
        if (enemySpawnCount.current <= totalSpawns.current) {
          lastEnemySpawnTime.current++;
          if (lastEnemySpawnTime.current > spawnTime()) {
            entitySpawner(spawnType(), enemy);
            enemySpawnCount.current++;
            lastEnemySpawnTime.current = 0;
          }
        }
      } else if (!enemy) {
        lastFriendlySpawnTime.current++;
        if (lastFriendlySpawnTime.current > spawnTime()) {
          entitySpawner(spawnType(), enemy);
          friendlySpawnCount.current++;
          lastFriendlySpawnTime.current = 0;
        }
      }
    }

    //sets how long until next unit spawns
    function spawnTime() {
      let baseline = 80;
      let actual =
        (baseline + 80 * Math.random()) /
        spawnSpeed.current /
        gameSpeed.current;
      return actual;
    }

    //determines what entity will spawn based on weighted chance
    function spawnType() {
      let entitiesEnemy = Object.entries(entityList)
        .filter((entity) => entity[1].enemy)
        .map((entity) => entity[1]);
      let parsedEntities = [];
      entitiesEnemy.forEach((entity) => {
        Object.entries(entity.lvls).forEach((level) => {
          if (level[1].chance !== undefined) {
            parsedEntities.push([entity.type, level[1].lvl, level[1].chance]);
          }
        });
      });
      let totalWeight = 0;
      parsedEntities.forEach((entity) => {
        totalWeight = totalWeight + entity[2];
      });
      let weightedChance = totalWeight * Math.random();
      let chancePosition = 0;
      parsedEntities.forEach((entity) => {
        entity[2] = entity[2] + chancePosition;
        chancePosition = entity[2];
      });
      let closestChance = Infinity;
      let chosenEntity;
      parsedEntities.forEach((entity) => {
        let entityChance = entity[2] - weightedChance;
        if (entityChance > 0 && entityChance < closestChance) {
          closestChance = entityChance;
          chosenEntity = entity;
        }
      });
      return chosenEntity;
    }

    //spawns chosen entity
    function entitySpawner(entity, enemy) {
      let entityType = entityList[entity[0]];
      let entityLvl = entityType.lvls["lvl" + entity[1]];
      let position = spawnPositionFinder(enemy);
      let entityID = entity[0];
      if (enemy) {
        entityID += enemySpawnCount.current;
      } else entityID += friendlySpawnCount.current;
      entityID = new Entity(entityType, entityLvl, position, entityID);
      if (!enemy) {
        entityID.enemy = false;
      }
      activeEntities.current.push(entityID);
      toBoard(entityBoard.current, position, entityID);
      return entityID;
    }

    //finds the position above the highest entity in the final column
    function spawnPositionFinder(enemy) {
      let baselinePosition;
      if (enemy) {
        baselinePosition = [gameboardWidth.current, gameboardHeight.current - 1];
      } else if (!enemy) {
        baselinePosition = [1, gameboardHeight.current - 1];
      }
      let spawnPosition = baselinePosition;
      let endEntities = activeEntities.current.filter(
        (entity) => entity.position[0] === baselinePosition[0]
      );
      endEntities.forEach((entity) => {
        if (entity.position[1] <= spawnPosition[1]) {
          spawnPosition = [entity.position[0], entity.position[1] - 1];
        }
      });
      if (!comparePosition(spawnPosition, baselinePosition)) {
        return spawnPosition;
      }
      let endGrounds = activeGround.current.filter(
        (ground) => ground.position[0] === baselinePosition[0]
      );
      endGrounds.forEach((ground) => {
        if (ground.position[1] <= spawnPosition[1]) {
          spawnPosition = [ground.position[0], ground.position[1] - 1];
        }
      });
      return spawnPosition;
    }
  }

  function ghoster() {
    activeEntities.current.forEach((entity) => {
      entity.fallSpeed = 0;
      entity.ghost = true;
    });
    activeGround.current.forEach((ground) => {
      ground.fallSpeed = 0;
      ground.ghost = true;
    });
    activeFluid.current.forEach((fluid) => {
      fluid.ghost = true;
    });
    activeProjectiles.current.forEach((projectile) => {
      activeProjectiles.current.splice(
        activeProjectiles.current.indexOf(projectile),
        1
      );
    });
  }

  if (newRound) {
    ghoster();
    terrainMaker();
    if (gameMode.current === "king") {
      let entityType = entityList["king"];
      let entityID = "king";
      entityID += friendlySpawnCount.current;
      entityID = new Entity(
        entityType,
        entityType.lvls["lvl1"],
        [1, -groundLevel.current],
        entityID
      );
      activeEntities.current.push(entityID);
    }
  }
  gamemode(false);
}
