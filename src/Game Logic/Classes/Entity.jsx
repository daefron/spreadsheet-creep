import { onBoard, toBoard, moveBoard, direction } from "../Tools.jsx";

export class Entity {
  constructor(type, lvl, position, ID, gameState) {
    this.name = ID;
    this.type = type.type;
    this.class = type.class;
    this.position = position;
    this.lvl = lvl.lvl;
    this.hp = lvl.hp;
    this.enemy = type.enemy;
    this.value = lvl.value;
    this.dmg = lvl.dmg;
    this.range = lvl.range;
    this.rate = lvl.rate;
    this.rateCharge = this.rate;
    this.speed = lvl.speed;
    this.speedCharge = 0;
    this.fallSpeed = type.fallSpeed;
    this.fallCharge = 0;
    this.movement = type.movement;
    this.attack = type.attack;
    this.breathes = type.breathes;
    this.projectile = type.projectile;
    this.death = type.death;
    this.spawnType = type.spawnType;
    if (type.death === "explodes") {
      this.explosionDmg = lvl.explosionDmg;
      this.explosionRange = lvl.explosionRange;
      this.armed = true;
    }
    this.sponge = type.sponge;
    this.maxHp = lvl.maxHp;
    this.gameState = gameState;
  }
  get turn() {
    let activeEntities = gameState.active.activeEntities;
    let entityBoard = gameState.active.entityBoard;
    let activeProjectiles = gameState.active.activeProjectiles;
    let groundBoard = gameState.active.groundBoard;
    let activeFluid = gameState.active.activeFluid;
    let fluidBoard = gameState.active.fluidBoard;
    let activeEffects = gameState.active.activeEffects;
    let effectBoard = gameState.active.effectBoard;
    let enemySpawnCount = gameState.engine.enemySpawnCount;
    let friendlySpawnCount = gameState.engine.friendlySpawnCount;
    let gameboardWidth = gameState.settings.gameboardWidth;
    let gameboardHeight = gameState.settings.gameboardHeight;
    let gameSpeed = gameState.settings.gameSpeed;
    let gameMode = gameState.settings.gameMode;
    let projectileCount = gameState.engine.projectileCount;
    if (healthChecker(this)) {
      return;
    }
    fluidChecker(this);
    if (this.movement) {
      if (entityBoundaryHandler(this)) {
        return;
      }
    }
    if (this.type === "blob") {
      return blobHolder(this);
    }
    if (entityFall(this)) {
      return;
    }
    if (entityAttack(this)) {
      return;
    }
    if (entityMovement(this)) {
      return;
    }
    if (entityAttackGroundHandler(this)) {
      return;
    }

    function blobHolder(currentEntity) {
      let x = currentEntity.position[0];
      let y = currentEntity.position[1];
      let positionBelow = [x, y + 1];
      let groundBelow = onBoard(groundBoard.current, positionBelow);
      let entityBelow = onBoard(entityBoard.current, positionBelow);
      if (blobFall()) {
        return;
      }
      if (blobStatGain()) {
        return;
      }
      if (Math.random() > 0.9) {
        return;
      }
      let positionAbove = [x, y - 1];
      let positionLeft = [x - 1, y];
      let positionRight = [x + 1, y];
      let entityAbove = onBoard(entityBoard.current, positionAbove);
      let entityLeft = onBoard(entityBoard.current, positionLeft);
      let entityRight = onBoard(entityBoard.current, positionRight);
      blobSorter();
      let groundAbove = onBoard(groundBoard.current, positionAbove);
      let groundLeft = onBoard(groundBoard.current, positionLeft);
      let groundRight = onBoard(groundBoard.current, positionRight);
      blobAttack();
      if (currentEntity.hp < 2) {
        return;
      }
      if (blobBelow()) {
        return;
      }
      if (currentEntity.hp < 3) {
        return;
      }
      if (blobSide()) {
        return;
      }
      if (blobAbove()) {
        return;
      }

      function blobStatGain() {
        if (currentEntity.hp >= currentEntity.maxHp) {
          return;
        }
        if (
          currentEntity.speedCharge >= currentEntity.speed &&
          Math.random() < 0.5
        ) {
          currentEntity.hp++;
          currentEntity.speedCharge = 0;
          return true;
        }
        currentEntity.speedCharge++;
      }

      function blobFall() {
        if (currentEntity.ghost) {
          if (currentEntity.position[1] >= gameboardHeight.current) {
            entityKiller(currentEntity);
            return true;
          }
          if (!groundBelow && !entityBelow) {
            moveBoard(entityBoard.current, positionBelow, currentEntity);
          }
          return true;
        }
        if (
          groundBelow ||
          entityBelow ||
          positionBelow[1] === gameboardHeight.current + 1
        ) {
          return;
        }
        let touchingGround;
        let blobGroup = blobGrouper();
        (() => {
          for (const entity of blobGroup) {
            let y = entity.position[1];
            if (y === gameboardHeight.current) {
              return (touchingGround = true);
            }
            let x = entity.position[0];
            let groundBelow = onBoard(groundBoard.current, [x, y + 1]);
            if (groundBelow) {
              return (touchingGround = true);
            }
          }
        })();
        if (!touchingGround) {
          moveBoard(entityBoard.current, positionBelow, currentEntity);
          return true;
        }
      }

      function blobGrouper() {
        aroundBlob(currentEntity);
        function aroundBlob(entity) {
          if (
            !entity ||
            entity.group === currentEntity.name ||
            entity.enemy !== currentEntity.enemy ||
            entity.type !== currentEntity.type
          ) {
            return;
          }
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
        let allBlobs = activeEntities.current.filter(
          (entity) => entity.group && entity.group === currentEntity.name
        );
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
            entityBelow &&
            entityBelow.hp === currentEntity.hp &&
            entityBelow.enemy === currentEntity.enemy &&
            entityBelow.type === currentEntity.type &&
            entityAbove &&
            entityAbove.hp === currentEntity.hp &&
            entityAbove.enemy === currentEntity.enemy &&
            entityAbove.type === currentEntity.type
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
            entityBelow &&
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
              entityRight &&
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
              entityLeft &&
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
              entityLeft &&
              entityLeft.type === currentEntity.type &&
              entityLeft.enemy === currentEntity.enemy
            ) {
              targets.push(entityLeft);
            }
          } else {
            if (
              entityRight &&
              entityRight.type === currentEntity.type &&
              entityRight.enemy === currentEntity.enemy
            ) {
              targets.push(entityRight);
            }
          }
          if (
            entityBelow &&
            entityBelow.type === currentEntity.type &&
            entityBelow.enemy === currentEntity.enemy
          ) {
            targets.push(entityBelow);
          }
          if (!targets.length) {
            return;
          }
          let lowestHpEntity = { hp: Infinity };
          for (const entity of targets) {
            if (entity.hp < lowestHpEntity.hp) {
              lowestHpEntity = entity;
            }
          }
          let hpDiff = parseInt((currentEntity.hp - lowestHpEntity.hp) / 2);
          currentEntity.hp -= hpDiff;
          lowestHpEntity.hp += hpDiff;
        }
      }

      function blobAttack() {
        if (Math.random() < currentEntity.hp / 100) {
          if (groundAbove) {
            groundAbove.hp--;
          } else if (entityAbove && entityAbove.enemy !== currentEntity.enemy) {
            entityAbove.hp -= currentEntity.hp;
          }
          if (groundBelow) {
            groundBelow.hp--;
          } else if (entityBelow && entityBelow.enemy !== currentEntity.enemy) {
            entityBelow.hp -= currentEntity.hp;
          }
          if (groundLeft) {
            groundLeft.hp--;
          } else if (entityLeft && entityLeft.enemy !== currentEntity.enemy) {
            entityLeft.hp -= currentEntity.hp;
          }
          if (groundRight) {
            groundRight.hp--;
          } else if (entityRight && entityRight.enemy !== currentEntity.enemy) {
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
        if (newPosition) {
          let newGround = onBoard(groundBoard.current, newPosition);
          let newEntity = onBoard(entityBoard.current, newPosition);
          if (newBlobChecker(newGround, newEntity, newPosition)) {
            return true;
          }
        }

        function blobDirection() {
          let rightFree, leftFree;
          if (
            currentEntity.enemy &&
            positionRight[0] > gameboardWidth.current
          ) {
            rightFree = false;
          } else rightFree = !groundRight || !entityRight;
          if (!currentEntity.enemy && positionLeft[0] < 1) {
            leftFree = false;
          } else leftFree = !groundLeft || !entityLeft;
          if (Math.random() > 0.5) {
            if (leftFree) {
              return positionLeft;
            } else if (rightFree) {
              return positionRight;
            }
          }
          if (rightFree) {
            return positionRight;
          } else if (leftFree) {
            return positionLeft;
          }
        }
      }

      function blobAbove() {
        if (Math.random() < 0.2) {
          return;
        }
        if (newBlobChecker(groundAbove, entityAbove, positionAbove)) {
          return true;
        }
      }

      function newBlobChecker(ground, entity, position) {
        if (!ground && !entity && position[1] > 0) {
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
      }
    }

    function entityBoundaryHandler(currentEntity) {
      let newPosition = [direction(currentEntity), currentEntity.position[1]];
      if (
        newPosition[0] === -1 ||
        newPosition[0] === gameboardWidth.current + 1
      ) {
        if (gameMode.current === "blob" || gameMode.current === "blob gob") {
          currentEntity.hp = 0;
          if (currentEntity.type === "blob") {
            blobAtEnd = true;
          }
        } else {
          if (
            currentEntity.speedCharge >=
            currentEntity.speed / gameSpeed.current
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
            }
          }
        }
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

    function entityFall(currentEntity) {
      if (entityCanFall(currentEntity)) {
        entityFall(currentEntity);
        return true;
      }

      function entityCanFall(currentEntity) {
        if (currentEntity.position[1] < 0) {
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
              if (groundNextTo || entityNextTo) {
                return false;
              }
            }
            let positionBelow = [
              currentEntity.position[0],
              currentEntity.position[1] + 1,
            ];
            let groundBelow = onBoard(groundBoard.current, positionBelow);
            let entityBelow = onBoard(entityBoard.current, positionBelow);
            if (groundBelow || entityBelow) {
              return false;
            }
            return true;
          }
        } else if (currentEntity.ghost) {
          entityKiller(currentEntity);
        }
      }

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

    function entityAttack(currentEntity) {
      if (currentEntity.position[1] < 1) {
        currentEntity.position[1]++;
        return false;
      }
      if (currentEntity.attack) {
        currentEntity.rateCharge++;
      }
      if (currentEntity.attack === "melee") {
        let rangeCells = meleeRange(currentEntity);
        let targetEntity = meleeAttackTargetter(currentEntity, rangeCells);
        if (entityCanAttack(currentEntity, targetEntity)) {
          meleeAttack(currentEntity, targetEntity);
          return true;
        }
        if (targetEntity) {
          return true;
        }
      }
      if (currentEntity.attack === "projectile") {
        let target = projectileTargetter(currentEntity);
        if (target) {
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

      function entityCanAttack(currentEntity, targetEntity) {
        if (
          currentEntity.rateCharge >= currentEntity.rate &&
          currentEntity.rate
        ) {
          if (targetEntity) {
            return true;
          }
        }
      }

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

      function meleeAttackTargetter(currentEntity, rangeCells) {
        for (const cell of rangeCells) {
          let targetCell = onBoard(entityBoard.current, cell);
          if (targetCell && targetCell.enemy !== currentEntity.enemy) {
            return targetCell;
          }
        }
      }

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
          if (groundTarget) {
            i = 0;
          }
          if (entityTarget) {
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

      function rangedAttack(currentEntity) {
        let projectileID =
          currentEntity.projectile +
          projectileCount.current +
          currentEntity.name;
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
              if (!groundInCell) {
                if (
                  entityInCell &&
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

      function enemyChecker() {
        let enemies = activeEntities.current.filter((entity) => entity.enemy);
        if (enemies.length > 0) {
          return true;
        }
      }
    }

    function entityMovement(currentEntity) {
      currentEntity.speedCharge++;
      if (entityCanMove(currentEntity)) {
        return entityMovementType(currentEntity);
      }

      function entityCanMove(currentEntity) {
        if (!currentEntity.movement) {
          return false;
        }
        if (currentEntity.speedCharge >= currentEntity.speed) {
          return true;
        }
      }

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

        function climb(currentEntity) {
          let positionNextTo = [
            direction(currentEntity),
            currentEntity.position[1],
          ];
          if (climbChecker(currentEntity, positionNextTo)) {
            climbMovement(currentEntity, positionNextTo);
            return true;
          }

          function climbChecker(currentEntity, positionNextTo) {
            let entityNextTo = onBoard(entityBoard.current, positionNextTo);
            if (entityNextTo && entityNextTo.enemy === currentEntity.enemy) {
              return climbSpotFree(positionNextTo);
            }
            let groundNextTo = onBoard(groundBoard.current, positionNextTo);
            if (groundNextTo) {
              return climbSpotFree(positionNextTo);
            }
            return false;

            function climbSpotFree(positionNextTo) {
              let positionAbove = [positionNextTo[0], positionNextTo[1] - 1];
              let entityAbove = onBoard(entityBoard.current, positionAbove);
              let groundAbove = onBoard(groundBoard.current, positionAbove);
              if (entityAbove || groundAbove) {
                return false;
              }
              return true;
            }
          }

          function climbMovement(currentEntity, positionNextTo) {
            let positionAbove = [positionNextTo[0], positionNextTo[1] - 1];
            moveBoard(entityBoard.current, positionAbove, currentEntity);
            currentEntity.speedCharge = 0;
            currentEntity.idle = 0;
          }
        }

        function walk(currentEntity, newPosition) {
          if (walkChecker(newPosition)) {
            walkMovement(currentEntity, newPosition);
            return true;
          }

          function walkChecker(newPosition) {
            let entityCell = onBoard(entityBoard.current, newPosition);
            let groundCell = onBoard(groundBoard.current, newPosition);
            if (!entityCell && !groundCell) {
              return true;
            }
          }

          function walkMovement(currentEntity, newPosition) {
            currentEntity.speedCharge = 0;
            currentEntity.idle = 0;
            moveBoard(entityBoard.current, newPosition, currentEntity);
          }
        }

        function scale(currentEntity, newPosition) {
          let entityNextTo = onBoard(entityBoard.current, newPosition);
          let groundNextTo = onBoard(groundBoard.current, newPosition);
          if (!entityNextTo && !groundNextTo) {
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
          let canScale;
          if (groundNextTo || entityNextTo) {
            if (entityAboveNextTo || groundAboveNextTo) {
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
            if (!entityAbove && !groundAbove) {
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

    function entityAttackGroundHandler(currentEntity) {
      if (entityCanAttackGround(currentEntity)) {
        entityAttackGround(currentEntity);
        return true;
      }

      function entityCanAttackGround(currentEntity) {
        if (!currentEntity.idle) {
          currentEntity.idle = 0;
        }
        currentEntity.idle++;
        if (
          currentEntity.rateCharge >= currentEntity.rate &&
          currentEntity.rate &&
          currentEntity.idle >= 30
        ) {
          let targetGround = onBoard(groundBoard.current, [
            direction(currentEntity),
            currentEntity.position[1],
          ]);
          if (targetGround) {
            return true;
          }
        }
        return false;
      }

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
  }
}

export default Entity;
