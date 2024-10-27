import { useState, useEffect, useRef } from "react";
import EntityList from "./EntityList.jsx";
import ProjectileList from "./ProjectileList.jsx";
import GroundList from "./GroundList.jsx";
export default function engineOutput() {
  const [gameboardEntities, setGameboardEntities] = useState([]);
  const activeEntities = useRef([]);
  const activeProjectiles = useRef([]);
  const activeGround = useRef([]);
  const friendlyGraveyard = useRef([]);
  const enemyGraveyard = useRef([]);
  const groundGraveyard = useRef([]);
  const [bank, setBank] = useState(10000);
  const savedEnemySpawnsCount = useRef(0);
  const savedFriendlySpawnsCount = useRef(0);
  const savedLastEnemySpawnTime = useRef(0);
  const savedLastFriendlySpawnTime = useRef(0);
  const timer = useRef();
  const gameboardWidth = useRef(11);
  const gameboardHeight = useRef(20);
  const groundLevel = useRef(7);
  const groundRoughness = useRef(5);
  const renderSpeed = useRef(1);
  const gameSpeed = useRef(1 * renderSpeed.current);
  const totalSpawns = useRef(30);
  const spawnSpeed = useRef(1);
  const kingHP = useRef(20);
  const gameMode = useRef("king");
  const friendlyCount = useRef(1);
  const groundIsFalling = useRef(false);
  let entityList = EntityList;
  let projectileList = ProjectileList;
  let groundList = GroundList;

  //function that creates new active entities
  function Entity(type, lvl, position, name) {
    this.name = name;
    this.type = type.type;
    this.position = position;
    this.lvl = lvl.lvl;
    this.hp = lvl.hp;
    this.dmg = lvl.dmg;
    this.range = lvl.range;
    this.rate = lvl.rate;
    let neededRate = lvl.rate / gameSpeed.current;
    this.rateCharge = neededRate;
    this.speed = lvl.speed / gameSpeed.current;
    this.speedCharge = 0;
    this.enemy = type.enemy;
    this.value = lvl.value;
    if (!this.enemy) {
      this.currentExp = 0;
      this.neededExp = lvl.neededExp;
    } else {
      this.exp = lvl.exp;
    }
    this.fallSpeed = type.fallSpeed / gameSpeed.current;
    this.fallCharge = 0;
    this.climber = type.climber;
    this.projectile = type.projectile;
    this.style = type.style;
  }

  let projectileCount = 1;
  //function that creates new active projectiles
  function Projectile(parent, name, type) {
    this.type = type.type;
    this.parent = parent;
    this.dmg = parent.dmg;
    this.speed = type.speed / gameSpeed.current;
    this.speedCharge = 0;
    this.fallSpeed = type.fallSpeed / gameSpeed.current;
    this.fallCharge = 0;
    this.enemy = parent.enemy;
    this.position = [direction(parent), parent.position[1]];
    this.distance = parent.range;
    if (this.enemy) {
      this.symbol = type.enemySymbol;
    } else this.symbol = type.friendlySymbol;
    this.name = name;
  }

  //function that creates new active ground entities
  function Ground(type, position, ID) {
    this.type = groundList[type].type;
    this.position = position;
    this.name = ID;
    this.hp = groundList[type].hp;
    this.fallSpeed = groundList[type].fallSpeed / gameSpeed.current;
    this.fallCharge = 0;
    this.style = groundList[type].style;
  }

  function engine(paused, newRound) {
    //tells entities what to do on their turn
    function entityTurn(currentEntity) {
      entityCharge(currentEntity);
      if (entityBoundaryHandler(currentEntity)) {
        return;
      }
      if (entityFallHolder(currentEntity)) {
        return;
      }
      if (entityAttackHolder(currentEntity)) {
        return;
      }
      if (entityMovementHolder(currentEntity)) {
        return;
      }
      if (entityAttackGroundHandler(currentEntity)) {
        return;
      }

      //charges current entities movement and range
      function entityCharge(currentEntity) {
        if (currentEntity.rateCharge <= currentEntity.rate) {
          currentEntity.rateCharge++;
        }
        currentEntity.speedCharge++;
      }

      //determines what happens to entity if hits boundary wall
      function entityBoundaryHandler(currentEntity) {
        let newPosition = [direction(currentEntity), currentEntity.position[1]];
        if (
          newPosition[0] === 0 &&
          currentEntity.speedCharge >= currentEntity.speed
        ) {
          if (gameMode.current === "king") {
            let king = activeEntities.current.find(
              (entity) => entity.type === "king"
            );
            king.hp -= currentEntity.dmg * 2;
            currentEntity.hp = 0;
            healthChecker(king, currentEntity);
            healthChecker(currentEntity, king);
            return true;
          } else if (gameMode.current === "battle") {
            entityKiller(currentEntity);
          }
        }
      }
    }

    //holds functions for entity falling
    function entityFallHolder(currentEntity) {
      if (entityCanFall(currentEntity.position, currentEntity)) {
        entityFall(currentEntity);
        return true;
      }

      //function to determine if there is anything under the current entity
      function entityCanFall(position, currentEntity) {
        if (position[1] !== gameboardHeight.current) {
          let positionBelow = [position[0], position[1] + 1];
          if (
            activeGround.current.find((ground) =>
              comparePosition(ground.position, positionBelow)
            ) !== undefined
          ) {
            return false;
          }
          if (
            activeEntities.current.find((entity) =>
              comparePosition(entity.position, positionBelow)
            ) !== undefined
          ) {
            return false;
          }
          return true;
        } else if (currentEntity.ghost) {
          entityKiller(currentEntity);
        }
      }

      //moves entities down if falling
      function entityFall(entity) {
        if (entity.fallCharge < entity.fallSpeed) {
          entity.fallCharge++;
        } else {
          entity.fallCharge = 0;
          entity.position = [entity.position[0], entity.position[1] + 1];
          entity.speedCharge = entity.speed / 2;
        }
      }
    }

    //holds functions for entity attacks
    function entityAttackHolder(currentEntity) {
      let rangeCells = rangeGetter(currentEntity);
      let targetEntity = attackTargetter(currentEntity, rangeCells);
      if (entityCanAttack(currentEntity, targetEntity)) {
        if (
          currentEntity.projectile !== false &&
          !comparePosition(targetEntity.position, [
            direction(currentEntity),
            currentEntity.position[1],
          ])
        ) {
          rangedAttack(currentEntity);
        } else entityAttack(currentEntity, targetEntity);
        return true;
      }

      //function to return array of cells entity can target
      function rangeGetter(currentEntity) {
        let rangeCells = [];
        let rangeLetter = direction(currentEntity);
        for (let i = currentEntity.range; i > 0; i--) {
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
      function attackTargetter(currentEntity, rangeCells) {
        let target;
        rangeCells.forEach((cell) => {
          let targetEntity = activeEntities.current.find((entity) =>
            comparePosition(entity.position, cell)
          );
          if (
            targetEntity !== undefined &&
            targetEntity.enemy !== currentEntity.enemy
          ) {
            return (target = targetEntity);
          }
        });
        return target;
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

      //function to spawn projectile
      function rangedAttack(currentEntity) {
        let projectileID =
          currentEntity.projectile + projectileCount + currentEntity.name;
        projectileCount++;
        let type = projectileList[currentEntity.projectile];
        activeProjectiles.current.push(
          new Projectile(currentEntity, projectileID, type)
        );
        currentEntity.rateCharge = 0;
        currentEntity.speedCharge = 0;
      }

      //function to execute attack if can
      function entityAttack(currentEntity, targetEntity) {
        targetEntity.hp -= currentEntity.dmg;
        healthChecker(targetEntity, currentEntity);
        currentEntity.rateCharge = 0;
        currentEntity.speedCharge = 0;
      }
    }

    //holds functions for entity movement
    function entityMovementHolder(currentEntity) {
      if (entityCanMove(currentEntity)) {
        return entityMovementType(currentEntity);
      }

      //function to determine if entity can move this turn
      function entityCanMove(currentEntity) {
        if (
          currentEntity.speedCharge >= currentEntity.speed &&
          currentEntity.speed !== 0
        ) {
          return true;
        }
      }

      //function to determine how entity moves if it can
      function entityMovementType(currentEntity) {
        let newPosition = [direction(currentEntity), currentEntity.position[1]];
        if (climbHolder(currentEntity)) {
          return true;
        }
        if (walkHolder(currentEntity, newPosition)) {
          return true;
        }
        return false;

        //holds climbing functions
        function climbHolder(currentEntity) {
          let positionNextTo = [
            direction(currentEntity),
            currentEntity.position[1],
          ];
          if (climbChecker(currentEntity, positionNextTo)) {
            climbMovement(currentEntity, positionNextTo);
            return true;
          }
          return false;

          //checks if entity wants to climb
          function climbChecker(currentEntity, positionNextTo) {
            let entityInPositionNextTo = activeEntities.current.find((entity) =>
              comparePosition(entity.position, positionNextTo)
            );
            let groundInPositionNextTo = activeGround.current.find((ground) =>
              comparePosition(ground.position, positionNextTo)
            );
            if (
              entityInPositionNextTo !== undefined &&
              entityInPositionNextTo.enemy === currentEntity.enemy
            ) {
              return climbSpotFree(positionNextTo);
            }
            if (groundInPositionNextTo !== undefined) {
              return climbSpotFree(positionNextTo);
            }
            return false;

            //checks if position to climb into is free
            function climbSpotFree(positionNextTo) {
              let positionAbove = [positionNextTo[0], positionNextTo[1] - 1];
              if (
                activeEntities.current.find((entity) =>
                  comparePosition(entity.position, positionAbove)
                ) !== undefined
              ) {
                return false;
              }
              if (
                activeGround.current.find((ground) =>
                  comparePosition(ground.position, positionAbove)
                ) !== undefined
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
            projectileChecker(currentEntity);
          }
        }

        //holds functions for normal walking
        function walkHolder(currentEntity, newPosition) {
          if (walkChecker(newPosition)) {
            walk(currentEntity, newPosition);
            return true;
          }

          //checks if entity can walk
          function walkChecker(newPosition) {
            if (
              !activeEntities.current.find((entity) =>
                comparePosition(entity.position, newPosition)
              ) &&
              !activeGround.current.find((ground) =>
                comparePosition(ground.position, newPosition)
              )
            ) {
              return true;
            }
          }

          //makes entity walk
          function walk(currentEntity, newPosition) {
            currentEntity.speedCharge = 0;
            currentEntity.position = newPosition;
            projectileChecker(currentEntity);
          }
        }

        //checks if entity walked/climbed into projectile and applies damage if so
        function projectileChecker(currentEntity) {
          let projectileInPosition = activeProjectiles.current.find(
            (projectile) =>
              comparePosition(projectile.position, currentEntity.position)
          );
          if (
            projectileInPosition !== undefined &&
            projectileInPosition.enemy !== currentEntity.enemy
          ) {
            currentEntity.hp -= projectileInPosition.dmg;
            activeProjectiles.current.splice(
              activeProjectiles.current.indexOf(projectileInPosition),
              1
            );
            healthChecker(currentEntity, projectileInPosition.parent);
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
        if (
          currentEntity.rateCharge >= currentEntity.rate &&
          currentEntity.speedCharge >= currentEntity.speed &&
          currentEntity.rate !== 0
        ) {
          let targetGround = activeGround.current.find((ground) =>
            comparePosition(ground.position, [
              direction(currentEntity),
              currentEntity.position[1],
            ])
          );
          if (targetGround !== undefined) {
            return true;
          }
        }
        return false;
      }

      //makes entity attack adjacent ground
      function entityAttackGround(currentEntity) {
        let targetGround = activeGround.current.find((ground) =>
          comparePosition(ground.position, [
            direction(currentEntity),
            currentEntity.position[1],
          ])
        );
        targetGround.hp -= currentEntity.dmg;
        healthChecker(targetGround, currentEntity);
        currentEntity.rateCharge = 0;
        currentEntity.speedCharge = 0;
      }
    }

    //checks to see if entity dies
    function healthChecker(entity, currentEntity) {
      if (entity.hp <= 0) {
        if (entity.enemy && !currentEntity.enemy) {
          setBank(bank + entity.value);
          expTracker(entity, currentEntity);
        }
        entityKiller(entity);
      }
    }
    //adds and checks exp on kill
    function expTracker(entity, currentEntity) {
      currentEntity.currentExp += entity.exp;
      if (
        currentEntity.currentExp >= currentEntity.neededExp &&
        entityList[currentEntity.type].lvls["lvl" + (currentEntity.lvl + 1)] !==
          undefined
      ) {
        levelUp(currentEntity);
      }
    }

    //applies level up for friendly entity
    function levelUp(currentEntity) {
      let oldProperties = Object.entries(currentEntity);
      let oldHP =
        entityList[currentEntity.type].lvls["lvl" + currentEntity.lvl].hp;
      currentEntity.lvl++;
      let newlvl = currentEntity.lvl;
      let newProperties = Object.entries(
        entityList[currentEntity.type].lvls["lvl" + newlvl]
      );
      oldProperties.forEach((oldProperty) => {
        newProperties.forEach((newProperty) => {
          if (
            oldProperty[0] === newProperty[0] &&
            oldProperty[1] !== newProperty[1]
          ) {
            if (oldProperty[0] === "hp") {
              let adjustedHP = newProperty[1] - oldHP;
              currentEntity[oldProperty[0]] = currentEntity.hp + adjustedHP;
            } else {
              currentEntity[oldProperty[0]] = newProperty[1];
            }
          }
        });
      });
    }

    //determines which graveyard entities get sent to
    function entityKiller(entity) {
      if (entity.ghost === undefined) {
        if (entity.enemy === undefined) {
          groundGraveyard.current.push(
            activeGround.current.splice(activeGround.current.indexOf(entity), 1)
          );
        } else if (entity.enemy) {
          enemyGraveyard.current.push(
            activeEntities.current.splice(
              activeEntities.current.indexOf(entity),
              1
            )
          );
        } else if (!entity.enemy) {
          friendlyGraveyard.current.push(
            activeEntities.current.splice(
              activeEntities.current.indexOf(entity),
              1
            )
          );
        }
      } else {
        if (entity.enemy === undefined) {
          activeGround.current.splice(activeGround.current.indexOf(entity), 1);
        } else if (entity.enemy) {
          activeEntities.current.splice(
            activeEntities.current.indexOf(entity),
            1
          );
        } else if (!entity.enemy) {
          activeEntities.current.splice(
            activeEntities.current.indexOf(entity),
            1
          );
        }
      }
    }

    //tells the projectile what to do on its turn
    function projectileTurn(projectile) {
      projectile.speedCharge++;
      if (projectileCanMove(projectile)) {
        projectileMovement(projectile);
      }

      //checks if the projectile can move this turn
      function projectileCanMove(projectile) {
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
      function projectileMovement(projectile) {
        let newPosition = [direction(projectile), projectile.position[1]];
        let entityAtPosition = activeEntities.current.find((entity) =>
          comparePosition(entity.position, newPosition)
        );
        let groundAtPosition = activeGround.current.find((ground) =>
          comparePosition(ground.position, newPosition)
        );
        if (
          entityAtPosition !== undefined &&
          entityAtPosition.enemy !== projectile.enemy
        ) {
          entityAtPosition.hp -= projectile.dmg;
          activeProjectiles.current.splice(
            activeProjectiles.current.indexOf(projectile),
            1
          );
          healthChecker(entityAtPosition, projectile.parent);
        } else if (groundAtPosition !== undefined) {
          groundAtPosition.hp -= projectile.dmg;
          activeProjectiles.current.splice(
            activeProjectiles.current.indexOf(projectile),
            1
          );
          healthChecker(groundAtPosition, projectile.parent);
        } else {
          projectile.speedCharge = 0;
          projectile.position = newPosition;
          projectile.distance--;
        }
      }
    }

    //initiates ground turn
    function groundTurn(ground) {
      if (groundCanFall(ground.position, ground)) {
        groundIsFalling.current = true;
        ground.falling = true;
        groundFall(ground);
      } else {
        ground.falling = false;
        groundIsFalling.current = true;
      }

      //checks if ground can fall
      function groundCanFall(position, ground) {
        if (position[1] !== gameboardHeight.current) {
          let spaceBelow = true;
          let positionBelow = [position[0], position[1] + 1];
          let entityBelow = activeEntities.current.find((entity) =>
            comparePosition(entity.position, positionBelow)
          );
          if (entityBelow) {
            groundAttack(ground, entityBelow);
          }
          if (
            activeGround.current.find((ground) =>
              comparePosition(ground.position, positionBelow)
            ) !== undefined
          ) {
            spaceBelow = false;
          }
          return spaceBelow;
        } else if (ground.ghost) {
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
        healthChecker(entityBelow, ground);
      }
    }

    //creates ground based on groundHeight and type
    function groundMaker() {
      for (
        let h = gameboardHeight.current;
        h > gameboardHeight.current - groundLevel.current;
        h--
      ) {
        for (let w = 1; w <= gameboardWidth.current; w++) {
          let spawnChance = 10;
          if (w < 3) {
            spawnChance = 10;
          } else if (w > gameboardWidth.current / 2) {
            spawnChance = Math.random() * 10;
          } else {
            spawnChance = Math.random() * 50;
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
            groundID = new Ground(type, position, groundID);
            activeGround.current.push(groundID);
          }
        }
      }
    }

    //sets amount of turns to play
    function amountOfTurns(finished) {
      let gameFinished = finished;
      let enemySpawns = savedEnemySpawnsCount.current;
      let lastEnemySpawnTime = savedLastEnemySpawnTime.current;
      let lastFriendlySpawnTime;
      let friendlySpawns;
      if (gameMode.current === "battle") {
        lastFriendlySpawnTime = savedLastFriendlySpawnTime.current;
        friendlySpawns = savedEnemySpawnsCount.current;
      }
      if (!gameFinished) {
        timer.current = setInterval(() => {
          turnCycler();
        }, renderSpeed.current * 20);
      }

      //runs through turn actions
      function turnCycler() {
        spawnChecker(true);
        if (gameMode.current === "battle") {
          spawnChecker(false);
        }
        nextTurn();
        if (!victoryChecker()) {
          clearInterval(timer.current);
        }
        updateGameboardEntities();
      }

      //makes all entities take turn
      function nextTurn() {
        activeEntities.current.forEach((entity) => {
          entityTurn(entity);
        });
        activeProjectiles.current.forEach((projectile) => {
          projectileTurn(projectile);
        });
        activeGround.current.forEach((ground) => {
          groundTurn(ground);
        });
      }

      //checks to see if the king died
      function victoryChecker() {
        if (gameMode.current === "king") {
          let kingAlive =
            activeEntities.current.find((entity) => entity.type === "king") !==
            undefined;
          if (!kingAlive) {
            return false;
          } else return true;
        } else if (gameMode.current === "battle") {
          if (
            savedEnemySpawnsCount === totalSpawns.current &&
            savedFriendlySpawnsCount === totalSpawns.current
          ) {
            return false;
          } else return true;
        }
      }

      //checks if game is allowed to spawn on current turn
      function spawnChecker(enemy) {
        if (enemy) {
          if (enemySpawns <= totalSpawns.current) {
            lastEnemySpawnTime++;
            savedLastEnemySpawnTime.current = lastEnemySpawnTime;
            if (lastEnemySpawnTime > spawnTime()) {
              entitySpawner(spawnType(enemy), enemy);
              enemySpawns++;
              savedEnemySpawnsCount.current = enemySpawns;
              lastEnemySpawnTime = 0;
              savedLastEnemySpawnTime.current = 0;
            }
          }
        } else if (!enemy) {
          lastFriendlySpawnTime++;
          savedLastFriendlySpawnTime.current = lastFriendlySpawnTime;
          if (lastFriendlySpawnTime > spawnTime()) {
            entitySpawner(spawnType(enemy), enemy);
            friendlySpawns++;
            savedFriendlySpawnsCount.current = friendlySpawns;
            lastFriendlySpawnTime = 0;
            savedLastEnemySpawnTime.current = 0;
          }
        }
      }

      //sets how long until next unit spawns
      function spawnTime() {
        let baseline = 80 / gameSpeed.current;
        let actual = (baseline + 80 * Math.random()) / spawnSpeed.current;
        return actual;
      }

      //determines what entity will spawn based on weighted chance
      function spawnType(enemy) {
        let entitiesEnemy;
        if (enemy) {
          entitiesEnemy = Object.entries(entityList)
            .filter((entity) => entity[1].enemy)
            .map((entity) => entity[1]);
        } else if (!enemy) {
          entitiesEnemy = Object.entries(entityList)
            .filter((entity) => !entity[1].enemy)
            .map((entity) => entity[1]);
        }
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
          entityID += savedEnemySpawnsCount;
        } else entityID += savedFriendlySpawnsCount;
        entityID = new Entity(entityType, entityLvl, position, entityID);
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

      //clears the activeEntities.current on victory
      function activeEntitiesClearer(victory) {
        if (victory) {
          activeEntities.current = activeEntities.current.filter(
            (entity) => !entity.enemy
          );
        } else {
          activeEntities.current = [];
        }
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
      activeProjectiles.current.forEach((projectile) => {
        activeProjectiles.current.splice(
          activeProjectiles.current.indexOf(projectile),
          1
        );
      });
    }

    if (newRound) {
      ghoster();
      groundMaker();
      if (gameMode.current === "king") {
        friendlySpawner("king", [1, -groundLevel.current], 1);
      }
      updateGameboardEntities();
      amountOfTurns(false, 1);
    }
    if (paused) {
      amountOfTurns(false);
    }
  }

  //checks if two arrays share both same values
  function comparePosition(position1, position2) {
    if (position1[0] === position2[0] && position1[1] === position2[1]) {
      return true;
    } else return false;
  }

  //adds or subtracts on the x axis depending on enemy type
  function direction(currentEntity) {
    if (currentEntity.enemy) {
      return currentEntity.position[0] - 1;
    } else {
      return currentEntity.position[0] + 1;
    }
  }

  //turns position into spreadsheet style coordinate
  function toLetter(position) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let width = letters[position];
    return width;
  }

  //runs friendly through checks before spawning
  function friendlySpawner(friendlyType, friendlyPosition, friendlyLvl) {
    if (validFriendly(friendlyType, friendlyLvl)) {
      let friendlyCost =
        entityList[friendlyType].lvls["lvl" + friendlyLvl].value;
      if (bankChecker(friendlyCost)) {
        setBank(bank - friendlyCost);
        friendlyEntityMaker(friendlyType, friendlyPosition, friendlyLvl);
      }
    }
  }

  //determines if entity name and level are valid
  function validFriendly(friendlyType, friendlyLvl) {
    if (entityList[friendlyType] !== undefined) {
      if (entityList[friendlyType].lvls["lvl" + friendlyLvl] !== undefined) {
        return true;
      }
    }
  }

  //determines if enough money in bank to spawn friendly
  function bankChecker(friendlyCost) {
    if (friendlyCost <= bank) {
      return true;
    }
  }

  //translates user input into data Entity maker can use
  function friendlyEntityMaker(entityType, entityPosition, entitylvl) {
    let ID = friendlyCount.current + 1;
    friendlyCount.current = ID;
    entityType = entityList[entityType];
    entitylvl = entityType.lvls["lvl" + entitylvl];
    let entityID = entityType.type + friendlyCount.current;
    entityID = new Entity(entityType, entitylvl, entityPosition, entityID);
    activeEntities.current.push(entityID);
    updateGameboardEntities();
  }

  //parses user input into usable data
  function friendlyInput(e) {
    let input = e.target.value;
    let position = e.target.id.split("x");
    position[0] = parseInt(position[0]);
    position[1] = parseInt(position[1]);
    let entityInPosition = activeEntities.current.find((entity) =>
      comparePosition(entity.position, position)
    );
    if (entityInPosition === undefined) {
      entityInPosition = activeGround.current.find((ground) =>
        comparePosition(ground.position, position)
      );
    }
    if (entityInPosition === undefined) {
      let parsedType = "";
      let parsedLvl = "";
      let hitNumber = false;
      for (let i = 0; i < input.length; i++) {
        if (isNaN(input[i]) && !hitNumber) {
          parsedType = parsedType.concat(input[i]);
        } else parsedLvl = parsedLvl.concat(input[i]);
      }
      friendlySpawner(parsedType, position, parsedLvl);
    }
    resume();
  }

  //gives the ground entities a thicker outline if groundline
  function groundLine(ground) {
    if (!ground.falling) {
      if (ground.fallSpeed > ground.fallCharge) {
        return;
      }
      ground.style.boxShadow = "";
      let made = false;
      let groundAbove = activeGround.current.find((targetGround) =>
        comparePosition(
          [ground.position[0], ground.position[1] - 1],
          targetGround.position
        )
      );
      if (groundAbove === undefined) {
        ground.style.boxShadow = "inset 0px 2px 0px grey";
        made = true;
      }
      let groundLeft = activeGround.current.find((targetGround) =>
        comparePosition(
          [ground.position[0] - 1, ground.position[1]],
          targetGround.position
        )
      );
      if (groundLeft === undefined && ground.position[0] - 1 !== 0 && !made) {
        ground.style.boxShadow = "inset 2px 0px 0px grey";
        made = true;
      } else if (
        groundLeft === undefined &&
        ground.position[0] - 1 !== 0 &&
        made
      ) {
        ground.style.boxShadow =
          ground.style.boxShadow + ",inset 2px 0px 0px grey";
      }
      let groundRight = activeGround.current.find((targetGround) =>
        comparePosition(
          [ground.position[0] + 1, ground.position[1]],
          targetGround.position
        )
      );
      if (
        groundRight === undefined &&
        ground.position[0] < gameboardWidth.current &&
        !made
      ) {
        ground.style.boxShadow = "inset -2px 0px 0px grey";
        made = true;
      } else if (
        groundRight === undefined &&
        ground.position[0] < gameboardWidth.current &&
        made
      ) {
        ground.style.boxShadow =
          ground.style.boxShadow + ",inset -2px 0px 0px grey";
      }
    } else {
      ground.style.boxShadow = false;
    }
  }

  //gives entities an attack bar
  function attackBar(currentEntity) {
    let maxWidth = 157;
    let percentage = currentEntity.rateCharge / currentEntity.rate;
    let currentWidth = maxWidth * percentage;
    currentEntity.style.boxShadow =
      "inset " + currentWidth + "px 0px 0px 0px #0000001e";
  }

  //stops the game loop
  function pause() {
    clearInterval(timer.current);
  }

  //pushes everything back into the game and starts the loop
  function resume() {
    engine(true, false);
  }

  //handles making a usable array for the grid renderer
  function updateGameboardEntities() {
    let grid = [];
    for (let h = 0; h <= gameboardHeight.current; h++) {
      let subGrid = [];
      for (let w = 0; w <= gameboardWidth.current; w++) {
        subGrid.push(cellType(w, h));
      }
      grid.push(subGrid);
    }
    setGameboardEntities(grid);

    //determines what type function to call
    function cellType(w, h) {
      if (w === 0) {
        return firstColumnCell(w, h);
      } else if (h === 0) {
        return firstRowCell(w, h);
      }
      if (activeEntities.current.length > 0) {
        let entityInPosition = activeEntities.current.find((entity) =>
          comparePosition(entity.position, [w, h])
        );
        if (entityInPosition !== undefined) {
          return entityCell(entityInPosition, w, h);
        }
      }
      let groundInPosition = activeGround.current.find((ground) =>
        comparePosition(ground.position, [w, h])
      );
      if (groundInPosition !== undefined) {
        return groundCell(groundInPosition, w, h);
      }
      if (activeProjectiles.current.length > 0) {
        let projectileInPosition = activeProjectiles.current.find(
          (projectile) => comparePosition(projectile.position, [w, h])
        );
        if (projectileInPosition !== undefined) {
          return projectileCell(projectileInPosition, w, h);
        }
      }
      return [w + "x" + h, [""]];
    }

    //below functions return what is to be rendered in cell
    function firstColumnCell(w, h) {
      if (h === 0) {
        let style = {
          width: "50px",
          position: "sticky",
          boxShadow: "inset -1px 0px 0px #404040, inset 0px -2px 0px #404040",
        };
        return [[w + "x" + h], [], style];
      } else {
        let style = {
          textAlign: "center",
          width: "50px",
          boxShadow: "inset -1px 0px 0px #404040",
          color: "#404040",
        };
        return [[w + "x" + h], [h + " "], style];
      }
    }

    function firstRowCell(w, h) {
      let style = {
        textAlign: "center",
        color: "#404040",
        position: "sticky",
        boxShadow: "inset 0px -2px 0px #404040",
      };
      return [[w + "x" + h], [toLetter(w - 1) + " "], style];
    }

    function groundCell(ground, w, h) {
      if (groundIsFalling.current) {
        groundLine(ground);
      }
      let style = {
        boxShadow: ground.style.boxShadow,
      };
      if (comparePosition(ground.position, [w, h])) {
        return [
          [w + "x" + h],
          [ground.type + "(hp: " + ground.hp + ")"],
          style,
        ];
      }
    }

    function entityCell(entity, w, h) {
      attackBar(entity);
      let style = {
        boxShadow: entity.style.boxShadow,
      };
      if (entity.enemy === true) {
        style.color = "darkRed";
        return [
          [w + "x" + h],
          [entity.type + entity.lvl + " (hp: " + entity.hp + ")"],
          style,
        ];
      } else {
        style.color = "darkGreen";
        return [
          [w + "x" + h],
          [
            entity.type +
              entity.lvl +
              " (hp: " +
              entity.hp +
              " exp: " +
              entity.currentExp +
              "/" +
              entity.neededExp +
              ")",
          ],
          style,
        ];
      }
    }

    function projectileCell(projectile, w, h) {
      if (
        activeEntities.current.find((entity) =>
          comparePosition(entity.position, projectile.position)
        ) === undefined
      ) {
        return [w + "x" + h, [projectile.symbol]];
      }
    }
  }

  // pushes the entities from updateGameboardEntities to the DOM
  function GameboardRender() {
    return (
      <table id="gameboard">
        <tbody>
          {gameboardEntities.map((row) => {
            return (
              <tr className="boardRow" key={row}>
                {row.map((position) => {
                  return (
                    <td key={position[0]}>
                      <input
                        className="boardCell"
                        type="text"
                        style={position[2]}
                        id={position[0]}
                        defaultValue={position[1]}
                        onFocus={pause}
                        onBlur={friendlyInput}
                      ></input>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  //makes a list of purchasble entities
  function Purchasables() {
    let entityArray = Object.values(entityList);
    let friendlyEntityArray = entityArray.filter((entity) => !entity.enemy);
    //removes king from array
    friendlyEntityArray.pop();
    let parsedFriendlyEntityArray = [
      [
        [gameboardHeight.current + 1 + " "],
        ["Purchasable entities:"],
        [""],
        [""],
        [""],
        [""],
        [""],
        [""],
      ],
      [
        [gameboardHeight.current + 2 + " "],
        ["Name"],
        ["Level"],
        ["Cost"],
        ["HP"],
        ["Damage"],
        ["Range"],
        ["Rate"],
      ],
    ];
    let headerNumber = gameboardHeight.current + 3;
    friendlyEntityArray.forEach((entity) => {
      let lvls = Object.values(entity.lvls);
      lvls.forEach((lvl) => {
        let name = "";
        if (lvl.lvl === 1) {
          name = entity.type;
        }
        let thisLevel = [
          [headerNumber + " "],
          [name],
          [lvl.lvl],
          [lvl.value],
          [lvl.hp],
          [lvl.dmg],
          [lvl.range],
          [lvl.rate],
        ];
        parsedFriendlyEntityArray.push(thisLevel);
        headerNumber++;
      });
    });
    let cellCount = 0;
    let style = {};
    parsedFriendlyEntityArray.forEach((row) => {
      row.forEach((cell) => {
        cell.push(cellCount + "purchasable");
        cellCount++;
      });
    });
    parsedFriendlyEntityArray.forEach((row) => {
      style = {
        textAlign: "center",
        width: "50px",
        boxShadow: "inset -1px 0px 0px #404040",
        color: "#404040",
      };
      row[0].push(style);
    });
    parsedFriendlyEntityArray[0].forEach((cell) => {
      if (cell[0] !== gameboardHeight.current + 1 + " ") {
        style = {
          boxShadow: "inset 0px -2px 0px 0px black",
        };
        cell.push(style);
      }
    });
    return (
      <table id="purchasables">
        <tbody>
          {parsedFriendlyEntityArray.map((row) => {
            return (
              <tr className="boardRow" key={row}>
                {row.map((position) => {
                  return (
                    <td key={position[1]}>
                      <input
                        id={position[1]}
                        className="boardCell"
                        type="text"
                        defaultValue={position[0]}
                        style={position[2]}
                      ></input>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  function Stats() {
    return (
      <div id="stats">
        <div className="statHolder">
          <p
            className="statTitle"
            style={{ boxShadow: "inset 0px -2px 0px 0px black" }}
          >
            Stats:
          </p>
          <p
            className="stat"
            style={{ boxShadow: "inset 0px -2px 0px 0px black" }}
          ></p>
        </div>
        <div className="statHolder">
          <p className="statTitle">Money:</p>
          <p className="stat">{bank}</p>
        </div>
        <div className="statHolder">
          <p className="statTitle">Friendly deaths: </p>
          <p className="stat">{friendlyGraveyard.current.length}</p>
        </div>
        <div className="statHolder">
          <p className="statTitle">Enemy deaths: </p>
          <p className="stat">{enemyGraveyard.current.length}</p>
        </div>
        <div className="statHolder">
          <p className="statTitle">Terrain destroyed: </p>
          <p className="stat">{groundGraveyard.current.length}</p>
        </div>
        <div className="statHolder">
          <p className="statTitle">Enemies remaining: </p>
          <p className="stat">
            {totalSpawns.current - enemyGraveyard.current.length}/
            {totalSpawns.current}
          </p>
        </div>
        <div className="statHolder">
          <p className="statTitle"></p>
          <p className="stat"></p>
        </div>
        <div className="statHolder">
          <p className="statTitle"></p>
          <p className="stat"></p>
        </div>
        <div className="statHolder">
          <p className="statTitle"></p>
          <p className="stat"></p>
        </div>
        <div className="statHolder">
          <p className="statTitle"></p>
          <p className="stat"></p>
        </div>
        <div className="statHolder">
          <p className="statTitle"></p>
          <p className="stat"></p>
        </div>
      </div>
    );
  }

  function Settings() {
    return (
      <div id="settings">
        <div
          className="settingHolder"
          style={{ display: "flex", alignItems: "center" }}
        >
          <p
            className="settingTitle"
            style={{ boxShadow: "inset 0px -2px 0px 0px black" }}
          >
            Settings:
          </p>
          <input
            id="settingTitle"
            style={{ boxShadow: "inset 0px -2px 0px 0px black" }}
          ></input>
        </div>
        <div className="settingHolder">
          <p className="settingTitle">Gameboard width:</p>
          <input
            id="boardWidth"
            type="number"
            value={gameboardWidth.current}
            onChange={updateGameboardWidth}
          ></input>
        </div>
        <div className="settingHolder">
          <p className="settingTitle">Gameboard height:</p>
          <input
            id="boardHeight"
            type="number"
            value={gameboardHeight.current}
            onChange={updateGameboardHeight}
          ></input>
        </div>
        <div className="settingHolder">
          <p className="settingTitle">Ground height:</p>
          <input
            id="groundLevel.current"
            type="number"
            value={groundLevel.current}
            onChange={updateGroundHeight}
          ></input>
        </div>
        <div className="settingHolder">
          <p className="settingTitle">Ground roughness:</p>
          <input
            id="groundRoughness.current"
            type="number"
            value={groundRoughness.current}
            onChange={updateGroundRoughness}
          ></input>
        </div>
        <div className="settingHolder">
          <p className="settingTitle">Game speed:</p>
          <input
            id="gameSpeed.current"
            type="number"
            value={gameSpeed.current}
            onChange={updateGameSpeed}
          ></input>
        </div>
        <div className="settingHolder">
          <p className="settingTitle">Render speed:</p>
          <input
            id="renderSpeed.current"
            type="number"
            value={renderSpeed.current}
            onChange={updateRenderSpeed}
          ></input>
        </div>
        <div className="settingHolder">
          <p className="settingTitle">Total spawns:</p>
          <input
            id="totalSpawns.current"
            type="number"
            value={totalSpawns.current}
            onChange={updateTotalSpawns}
          ></input>
        </div>
        <div
          className="settingHolder"
          style={{ display: "flex", alignItems: "center" }}
        >
          <p className="settingTitle">Spawn speed:</p>
          <input
            id="spawnSpeed.current"
            type="number"
            value={spawnSpeed.current}
            onChange={updateSpawnSpeed}
          ></input>
        </div>
        <div
          className="settingHolder"
          style={{ display: "flex", alignItems: "center" }}
        >
          <p className="settingTitle">King HP:</p>
          <input
            id="kingHP.current"
            type="number"
            value={kingHP.current}
            onChange={updateKingHP}
          ></input>
        </div>
        <div
          className="settingHolder"
          style={{ display: "flex", alignItems: "center" }}
        >
          <p className="settingTitle">Gamemode.current:</p>
          <select
            id="gamemode.currentSelect"
            defaultValue={gameMode.current}
            onChange={updateGameMode}
          >
            <option value="king">king</option>
            <option value="battle">battle</option>
          </select>
        </div>
      </div>
    );
  }

  function StartButton() {
    return (
      <button
        id="newButton"
        onClick={newButton}
        onFocus={pause}
        onBlur={resume}
      >
        New Round
      </button>
    );
  }

  function newButton() {
    clearInterval(timer.current);
    enemyGraveyard.current = [];
    friendlyGraveyard.current = [];
    groundGraveyard.current = [];
    savedEnemySpawnsCount.current = 0;
    savedFriendlySpawnsCount.current = 0;
    savedLastEnemySpawnTime.current = 0;
    savedLastFriendlySpawnTime.current = 0;
    engine(false, true);
  }

  function updateGameboardWidth(e) {
    gameboardWidth.current = parseInt(e.target.value);
    updateGameboardEntities();
  }
  function updateGameboardHeight(e) {
    gameboardHeight.current = parseInt(e.target.value);
    updateGameboardEntities();
  }
  function updateGroundHeight(e) {
    groundLevel.current = parseInt(e.target.value);
    updateGameboardEntities();
  }
  function updateGroundRoughness(e) {
    groundRoughness.current = parseFloat(e.target.value);
    updateGameboardEntities();
  }
  function updateGameSpeed(e) {
    gameSpeed.current = parseFloat(e.target.value * renderSpeed.current);
    updateGameboardEntities();
  }
  function updateRenderSpeed(e) {
    renderSpeed.current = parseFloat(e.target.value);
    updateGameboardEntities();
  }
  function updateTotalSpawns(e) {
    totalSpawns.current = parseInt(e.target.value);
    updateGameboardEntities();
  }
  function updateSpawnSpeed(e) {
    spawnSpeed.current = parseFloat(e.target.value);
    updateGameboardEntities();
  }
  function updateKingHP(e) {
    kingHP.current = parseInt(e.target.value);
    entityList.king.lvls.lvl1.hp = kingHP.current + 1;
    updateGameboardEntities();
  }
  function updateGameMode(e) {
    gameMode.current = e.target.value;
    updateGameboardEntities();
  }

  //renders the gameboard once on page load
  useEffect(() => {
    updateGameboardEntities();
  }, []);

  return (
    <>
      <GameboardRender></GameboardRender>
      <div id="below" style={{ display: "flex" }}>
        <Purchasables></Purchasables>
        <Stats></Stats>
        <Settings></Settings>
      </div>
      <StartButton></StartButton>
    </>
  );
}
