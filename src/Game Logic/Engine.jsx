import { cellContents, direction, comparePosition } from "./Tools.jsx";
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
  let active = gameState.active;
  let activeEntities = gameState.active.activeEntities;
  let activeProjectiles = gameState.active.activeProjectiles;
  let activeGround = gameState.active.activeGround;
  let activeFluid = gameState.active.activeFluid;
  let activeEffects = gameState.active.activeEffects;
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
  let terrainIsFalling = gameState.engine.terrainIsFalling;
  let projectileCount = gameState.engine.projectileCount;

  function explosion(currentEntity) {
    let w = currentEntity.explosionRange;
    let h = currentEntity.explosionRange;
    let initialW = w;
    let initialH = h;
    while (w >= -initialW) {
      while (h >= -initialH) {
        let inCell = cellContents(
          [currentEntity.position[0] + w, currentEntity.position[1] + h],
          active
        );
        let dmg = parseInt(
          currentEntity.explosionDmg -
            (Math.random() * currentEntity.explosionDmg) / 4
        );
        if (inCell.entity !== undefined) {
          inCell.entity.hp -= dmg;
        }
        if (inCell.ground !== undefined) {
          inCell.ground.hp -= dmg;
        }
        if (inCell.fluid !== undefined) {
          let deathChance = Math.random() * 10;
          if (deathChance > 5) {
            entityKiller(inCell.fluid);
          }
        }
        if (inCell.projectile !== undefined) {
          entityKiller(inCell.projectile);
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
        activeEffects.current.push(effectID);
        h--;
      }
      h = initialH;
      w--;
    }
  }

  function spawn(entity) {
    let entityID = entity.name;
    let entityType = entityList[entity.spawnType];
    let entityLvl = entityType.lvls["lvl" + entity.lvl];
    entityID = new Entity(entityType, entityLvl, entity.position, entityID);
    entityID.enemy = entity.enemy;
    activeEntities.current.push(entityID);
  }

  //checks to see if entity dies
  function healthChecker(entity) {
    if (entity.hp <= 0) {
      if (entity.enemy) {
        bank += entity.value;
      }
      entityKiller(entity);
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
      }
      if (entity.death === "spawn") {
        spawn(entity);
      }
    }
    if (entity.class === "entity") {
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
      groundGraveyard.current.push(
        activeGround.current.splice(activeGround.current.indexOf(entity), 1)
      );
    } else if (entity.class === "fluid") {
      fluidGraveyard.current.push(
        activeFluid.current.splice(activeFluid.current.indexOf(entity), 1)
      );
    } else if (entity.class === "projectile") {
      activeProjectiles.current.splice(
        activeProjectiles.current.indexOf(entity),
        1
      );
    }
  }
  //tells entities what to do on their turn
  function entityTurn(currentEntity) {
    currentEntity.turn = false;
    healthChecker(currentEntity);
    liquidChecker(currentEntity);
    if (entityBoundaryHandler(currentEntity)) {
      return;
    }
    if (entityFall(currentEntity) && !currentEntity.turn) {
      return;
    }
    if (entityAttack(currentEntity) && !currentEntity.turn) {
      return;
    }
    if (entityMovement(currentEntity) && !currentEntity.turn) {
      return;
    }
    if (entityAttackGroundHandler(currentEntity) && !currentEntity.turn) {
      return;
    }

    //determines what happens to entity if hits boundary wall
    function entityBoundaryHandler(currentEntity) {
      let newPosition = [direction(currentEntity), currentEntity.position[1]];
      if (
        (newPosition[0] === 0 &&
          currentEntity.speedCharge >=
            currentEntity.speed / gameSpeed.current) ||
        (newPosition[0] === gameboardWidth.current + 1 &&
          currentEntity.speedCharge >= currentEntity.speed / gameSpeed.current)
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

  function liquidChecker(currentEntity) {
    let liquidInPosition = activeFluid.current.find((fluid) =>
      comparePosition(fluid.position, currentEntity.position)
    );
    if (liquidInPosition !== undefined) {
      if (!currentEntity.inLiquid) {
        currentEntity.inLiquid = true;
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
    } else if (currentEntity.inLiquid) {
      currentEntity.inLiquid = false;
      currentEntity.speed /= 1.5;
      currentEntity.rate /= 1.5;
      currentEntity.rateCharge /= 1.5;
      currentEntity.fallSpeed /= 8;
      currentEntity.oxygen = undefined;
    }
  }

  //holds functions for entity falling
  function entityFall(currentEntity) {
    for (let i = gameSpeed.current; i > 0; i--) {
      if (entityCanFall(currentEntity.position, currentEntity)) {
        entityFall(currentEntity);
        return true;
      }
    }

    //function to determine if there is anything under the current entity
    function entityCanFall(position, currentEntity) {
      if (position[1] !== gameboardHeight.current) {
        if (!currentEntity.climbing) {
          let positionBelow = [position[0], position[1] + 1];
          let cellBelow = cellContents(positionBelow, active);
          if (currentEntity.movement === "scaler") {
            let positionNextTo = [
              direction(currentEntity),
              currentEntity.position[1],
            ];
            let cellNextTo = cellContents(positionNextTo, active);
            if (
              cellNextTo.ground !== undefined ||
              cellNextTo.entity !== undefined
            ) {
              return false;
            }
          }
          if (
            cellBelow.ground !== undefined ||
            cellBelow.entity !== undefined
          ) {
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
        entity.position = [entity.position[0], entity.position[1] + 1];
        entity.speedCharge = entity.speed / 2;
        currentEntity.turn = true;
      }
    }
  }

  //holds functions for entity attacks
  function entityAttack(currentEntity) {
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
          console.log(currentEntity.rateCharge, currentEntity.rate);
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
        let targetCell = cellContents(cell, active);
        if (
          targetCell.entity !== undefined &&
          targetCell.entity.enemy !== currentEntity.enemy
        ) {
          return (target = targetCell.entity);
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
      currentEntity.turn = true;
    }
  }

  function projectileTargetter(currentEntity) {
    let target;
    let rangeLetter = direction(currentEntity);
    for (let i = currentEntity.range; i > 0; i--) {
      let targetCell = cellContents(
        [rangeLetter, currentEntity.position[1]],
        active
      );
      if (targetCell.ground !== undefined) {
        i = 0;
      }
      if (targetCell.entity !== undefined) {
        if (targetCell.entity.enemy !== currentEntity.enemy) {
          target = targetCell.entity;
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
    currentEntity.turn = true;
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
          let cellNextTo = cellContents(positionNextTo, active);
          if (
            cellNextTo.entity !== undefined &&
            cellNextTo.entity.enemy === currentEntity.enemy
          ) {
            return climbSpotFree(positionNextTo);
          }
          if (cellNextTo.ground !== undefined) {
            return climbSpotFree(positionNextTo);
          }
          console.log("made it");
          return false;

          //checks if position to climb into is free
          function climbSpotFree(positionNextTo) {
            let positionAbove = [positionNextTo[0], positionNextTo[1] - 1];
            let cellAbove = cellContents(positionAbove, active);
            if (
              cellAbove.entity !== undefined ||
              cellAbove.ground !== undefined
            ) {
              return false;
            }
            return true;
          }
        }

        //makes entity climb
        function climbMovement(currentEntity, positionNextTo) {
          let positionAbove = [positionNextTo[0], positionNextTo[1] - 1];
          currentEntity.position = positionAbove;
          currentEntity.speedCharge = 0;
          currentEntity.idle = 0;
          currentEntity.turn = true;
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
          let cellNewPosition = cellContents(newPosition, active);
          if (
            cellNewPosition.entity === undefined &&
            cellNewPosition.ground === undefined
          ) {
            return true;
          }
        }

        //makes entity walk
        function walkMovement(currentEntity, newPosition) {
          currentEntity.speedCharge = 0;
          currentEntity.idle = 0;
          currentEntity.position = newPosition;
          currentEntity.turn = true;
        }
      }

      function scale(currentEntity, newPosition) {
        let cellInPositionNextTo = cellContents(newPosition, active);
        if (
          cellInPositionNextTo.entity === undefined &&
          cellInPositionNextTo.ground === undefined
        ) {
          return false;
        }
        if (currentEntity.speedCharge < currentEntity.speed) {
          return false;
        }
        let positionAboveNextTo = [newPosition[0], newPosition[1] - 1];
        let cellInPositionAboveNextTo = cellContents(
          positionAboveNextTo,
          active
        );
        let canScale = false;
        if (
          cellInPositionNextTo.ground !== undefined ||
          cellInPositionNextTo.entity !== undefined
        ) {
          if (
            cellInPositionAboveNextTo.ground !== undefined ||
            cellInPositionAboveNextTo.entity !== undefined
          ) {
            canScale = true;
          }
        }
        if (canScale) {
          currentEntity.climbing = true;
          let cellAbove = [
            currentEntity.position[0],
            currentEntity.position[1] - 1,
          ];
          let cellInAbove = cellContents(cellAbove, active);
          if (
            cellInAbove.entity === undefined &&
            cellInAbove.ground === undefined
          ) {
            currentEntity.position = cellAbove;
            currentEntity.speedCharge = 0;
            currentEntity.idle = 0;
          }
          return true;
        } else {
          currentEntity.climbing = false;
          currentEntity.position = positionAboveNextTo;
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
        let targetCell = cellContents(
          [direction(currentEntity), currentEntity.position[1]],
          active
        );
        if (targetCell.ground !== undefined) {
          return true;
        }
      }
      return false;
    }

    //makes entity attack adjacent ground
    function entityAttackGround(currentEntity) {
      let targetCell = cellContents(
        [direction(currentEntity), currentEntity.position[1]],
        active
      );
      targetCell.ground.hp -= currentEntity.dmg;
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
    if (projectile.type === "arrow") {
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
        let cellBelow = cellContents(positionBelow, active);
        if (cellBelow.entity !== undefined) {
          entityKiller(projectile);
          return false;
        } else if (cellBelow.ground !== undefined) {
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
        projectile.position = [
          projectile.position[0],
          projectile.position[1] + 1,
        ];
        projectile.speedCharge = projectile.speed / 2;
      }
    }

    function barrelCanMove(projectile) {
      if (projectile.speedCharge >= projectile.speed) {
        return true;
      }
    }

    function barrelMovement(projectile) {
      let inCurrent = cellContents(projectile.position, active);
      if (inCurrent.entity !== undefined) {
        entityKiller(projectile);
      }
      let positionNextTo = [direction(projectile), projectile.position[1]];
      let inNextTo = cellContents(positionNextTo, active);
      if (inNextTo.entity !== undefined) {
        if (inNextTo.entity.enemy !== projectile.enemy) {
          entityKiller(projectile);
        }
      }
      if (inNextTo.ground !== undefined) {
        entityKiller(projectile);
      }
      projectile.position = positionNextTo;
      projectile.speedCharge = 0;
      return;
    }

    function missleCanMove(projectile) {
      if (projectile.speedCharge >= projectile.speed) {
        return true;
      }
    }

    function missileMovement(projectile) {
      if (projectile.direction === "up") {
        if (projectile.position[1] > projectile.parent.position[1] - 8) {
          let newPosition = [
            projectile.position[0],
            projectile.position[1] - 1,
          ];
          let cellInPosition = cellContents(newPosition, active);
          if (cellInPosition.entity !== undefined) {
            if (cellInPosition.entity.enemy !== projectile.enemy) {
              cellInPosition.entity.hp -= projectile.dmg;
              entityKiller(projectile);
              return;
            }
          }
          projectile.position = newPosition;
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
        let cellInPosition = cellContents(newPosition, active);
        if (cellInPosition.entity !== undefined) {
          if (cellInPosition.entity.enemy !== projectile.enemy) {
            cellInPosition.entity.hp -= projectile.dmg;
            entityKiller(projectile);
            return;
          }
        }
        projectile.position = newPosition;
        projectile.speedCharge = 0;
      } else if (projectile.direction === "down") {
        let newPosition = [projectile.position[0], projectile.position[1] + 1];
        let cellInPosition = cellContents(newPosition, active);
        if (cellInPosition.entity !== undefined) {
          if (cellInPosition.entity.enemy !== projectile.enemy) {
            cellInPosition.entity.hp -= projectile.dmg;
            entityKiller(projectile);
            return;
          }
        }
        projectile.position = newPosition;
        projectile.speedCharge = 0;
      }

      //checks to see if there is an enemy below projectile
      function belowTargetter(projectile) {
        let targetFound = false;
        for (let h = gameboardHeight.current; h > 1; h--) {
          let targetPosition = [projectile.position[0], h];
          let target = cellContents(targetPosition, active);
          if (target.entity !== undefined) {
            if (target.entity.enemy !== projectile.enemy) {
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
      let cellAtPosition = cellContents(newPosition, active);
      if (
        cellAtPosition.entity !== undefined &&
        cellAtPosition.entity.enemy !== projectile.enemy
      ) {
        cellAtPosition.entity.hp -= projectile.dmg;
        activeProjectiles.current.splice(
          activeProjectiles.current.indexOf(projectile),
          1
        );
      } else if (cellAtPosition.ground !== undefined) {
        cellAtPosition.ground.hp -= projectile.dmg;
        activeProjectiles.current.splice(
          activeProjectiles.current.indexOf(projectile),
          1
        );
      } else {
        projectile.speedCharge = 0;
        projectile.position = newPosition;
        projectile.distance--;
      }
    }
  }

  //initiates ground turn
  function groundTurn(ground) {
    healthChecker(ground);
    for (let i = gameSpeed.current; i > 0; i--) {
      if (groundCanFall(ground.position, ground)) {
        terrainIsFalling.current = true;
        ground.falling = true;
        groundFall(ground);
      } else {
        ground.falling = false;
        terrainIsFalling.current = true;
      }
    }

    //checks if ground can fall
    function groundCanFall(position, ground) {
      if (position[1] < gameboardHeight.current) {
        let spaceBelow = true;
        let positionBelow = [position[0], position[1] + 1];
        let cellBelow = cellContents(positionBelow, active);
        if (cellBelow.entity !== undefined) {
          groundAttack(ground, cellBelow.entity);
        }
        if (cellBelow.ground !== undefined) {
          spaceBelow = false;
        }
        return spaceBelow;
      }
      if (ground.ghost) {
        entityKiller(ground);
      }
    }

    //makes ground fall
    function groundFall(ground) {
      if (ground.fallCharge < ground.fallSpeed) {
        ground.fallCharge++;
      } else {
        ground.fallCharge = 0;
        let newPosition = [ground.position[0], ground.position[1] + 1];
        ground.position = newPosition;
      }
    }

    //kills entity ground falls onto
    function groundAttack(ground, entityBelow) {
      entityBelow.hp = 0;
    }
  }

  function fluidTurn(fluid) {
    for (let i = gameSpeed.current; i > 0; i--) {
      if (fluidCanFall(fluid.position, fluid)) {
        terrainIsFalling.current = true;
        fluid.speed = 5;
        fluid.falling = true;
        fluidFall(fluid);
      } else {
        fluid.falling = false;
        terrainIsFalling.current = true;
      }
    }
    if (!fluid.falling) {
      fluidMovement(fluid);
    }

    function fluidCanFall(position, fluid) {
      if (position[1] < gameboardHeight.current) {
        let positionBelow = [position[0], position[1] + 1];
        let cellBelow = cellContents(positionBelow, active);
        if (cellBelow.ground !== undefined || cellBelow.fluid !== undefined) {
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
        let newPosition = [fluid.position[0], fluid.position[1] + 1];
        fluid.position = newPosition;
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
          targetPosition[0] === 0 ||
          targetPosition[0] === gameboardWidth.current + 1
        ) {
          entityKiller(fluid);
        }
        let targetCell = cellContents(targetPosition, active);
        if (targetCell.ground === undefined && targetCell.fluid === undefined) {
          fluid.position = targetPosition;
          fluid.speedCharge = 0;
          fluid.speed *= 1.3;
          return;
        } else {
          if (fluid.direction === "left") {
            fluid.direction = "right";
          } else fluid.direction = "left";
        }
      }
      let cellBelow = cellContents(
        [fluid.position[0], fluid.position[1] + 1],
        active
      );
      if (fluid.speed > 50 && cellBelow.fluid !== undefined) {
        fluid.speed = Infinity;
      }
    }
  }

  function effectTurn(effect) {
    if (effect.durationCharge < effect.duration) {
      effect.durationCharge++;
    } else {
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

  //sets amount of turns to play
  function amountOfTurns(finished) {
    let gameFinished = finished;
    if (!gameFinished) {
      timer.current = setInterval(() => {
        turnCycler();
      }, renderSpeed.current * 4);
    }

    //runs through turn actions
    function turnCycler() {
      if (gameMode.current === "king") {
        spawnChecker(true);
      }
      if (gameMode.current === "battle") {
        spawnChecker(true);
        spawnChecker(false);
      }
      nextTurn();
      if (gameMode.current !== "sandbox") {
        if (!victoryChecker()) {
          clearInterval(timer.current);
        }
      }
      // updateGameboardEntities();
    }

    //makes all entities take turn
    function nextTurn() {
      activeEntities.current.forEach((entity) => {
        entityTurn(entity);
      });
      activeProjectiles.current.forEach((projectile) => {
        projectileTurn(projectile);
      });
      terrainIsFalling.current = false;
      activeGround.current.forEach((ground) => {
        groundTurn(ground);
      });
      activeFluid.current.forEach((fluid) => {
        fluidTurn(fluid);
      });
      activeEffects.current.forEach((effect) => {
        effectTurn(effect);
      });
    }

    //checks to see if the king died
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
        entityID += enemySpawnCount;
      } else entityID += friendlySpawnCount;
      entityID = new Entity(entityType, entityLvl, position, entityID);
      if (!enemy) {
        entityID.enemy = false;
      }
      activeEntities.current.push(entityID);
    }

    //finds the position above the highest entity in the final column
    function spawnPositionFinder(enemy) {
      let baselinePosition;
      if (enemy) {
        baselinePosition = [gameboardWidth.current, gameboardHeight.current];
      } else if (!enemy) {
        baselinePosition = [1, gameboardHeight.current];
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
  amountOfTurns(false);
}
