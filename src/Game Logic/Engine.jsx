import { useState } from "react";
import EntityList from "./EntityList.jsx";
import ProjectileList from "./ProjectileList.jsx";
import GroundList from "./GroundList.jsx";
export default function engineOutput() {
  const [activeEntities, setActiveEntities] = useState([]);
  const [activeProjectiles, setActiveProjectiles] = useState([]);
  const [activeGround, setActiveGround] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [bank, setBank] = useState(10000);
  const [savedTurn, setSavedTurn] = useState(1);
  const [savedEnemySpawns, setSavedEnemySpawns] = useState(0);
  const [savedLastSpawnTime, setSavedLastSpawnTime] = useState(0);
  const [timer, setTimer] = useState();
  const [gameboardWidth, setGameboardWidth] = useState(11);
  const [gameboardHeight, setGameboardHeight] = useState(20);
  const [groundLevel, setGroundLevel] = useState(7);
  const [groundRoughness, setgroundRoughness] = useState(5);
  const [renderSpeed, setRenderSpeed] = useState(1);
  const [gameSpeed, setGameSpeed] = useState(1 * renderSpeed);
  const entityList = EntityList;
  const projectileList = ProjectileList;
  const groundList = GroundList;

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
    let neededRate = lvl.rate / gameSpeed;
    this.rateCharge = neededRate;
    this.speed = lvl.speed / gameSpeed;
    this.speedCharge = 0;
    this.enemy = type.enemy;
    this.value = lvl.value;
    if (!this.enemy) {
      this.currentExp = 0;
      this.neededExp = lvl.neededExp;
    } else {
      this.exp = lvl.exp;
    }
    this.fallSpeed = type.fallSpeed / gameSpeed;
    this.fallCharge = 0;
    this.climber = type.climber;
    this.projectile = type.projectile;
    this.style = type.style;
  }

  let projectileCount = 1;
  //function that creates new active projectiles
  function Projectile(parent, name) {
    this.type = parent.projectile;
    this.parent = parent;
    let type = projectileList[this.type];
    this.dmg = parent.dmg;
    this.speed = type.speed / gameSpeed;
    this.speedCharge = 0;
    this.fallSpeed = type.fallSpeed / gameSpeed;
    this.fallCharge = 0;
    this.enemy = parent.enemy;
    this.position = parent.position;
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
    this.fallSpeed = groundList[type].fallSpeed / gameSpeed;
    this.fallCharge = 0;
    this.style = groundList[type].style;
  }

  function engine(activeEntities, graveyard, bank, paused) {
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
          let king = activeEntities.find((entity) => entity.type === "king");
          king.hp = -currentEntity.dmg * 2;
          currentEntity.hp = 0;
          healthChecker(king, currentEntity);
          healthChecker(currentEntity, king);
          return true;
        }
      }
    }

    function entityFallHolder(currentEntity) {
      if (entityCanFall(currentEntity.position)) {
        entityFall(currentEntity);
        return true;
      }

      //function to determine if there is anything under the current entity
      function entityCanFall(position) {
        if (position[1] !== gameboardHeight) {
          let positionBelow = [position[0], position[1] + 1];
          if (
            activeGround.find((ground) =>
              comparePosition(ground.position, positionBelow)
            ) !== undefined
          ) {
            return false;
          }
          if (
            activeEntities.find((entity) =>
              comparePosition(entity.position, positionBelow)
            ) !== undefined
          ) {
            return false;
          }
        }
        return true;
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

    function entityAttackHolder(currentEntity) {
      let rangeCells = rangeGetter(currentEntity);
      let targetEntity = attackTargetter(currentEntity, rangeCells);
      if (entityCanAttack(currentEntity, targetEntity)) {
        if (currentEntity.projectile !== false) {
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
          let targetEntity = activeEntities.find((entity) =>
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
        activeProjectiles.push(new Projectile(currentEntity, projectileID));
        currentEntity.rateCharge = 0;
        currentEntity.speedCharge = 0;
      }

      //function to execute attack if can
      function entityAttack(currentEntity, targetEntity) {
        targetEntity.hp = -currentEntity.dmg;
        healthChecker(targetEntity, currentEntity);
        currentEntity.rateCharge = 0;
        currentEntity.speedCharge = 0;
      }
    }

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
        if (climbHolder(currentEntity, newPosition)) {
          return true;
        }
        if (walkHolder(currentEntity, newPosition)) {
          return true;
        }
        return false;

        //holds climbing functions
        function climbHolder(currentEntity, newPosition) {
          let positionNextTo = [
            direction(currentEntity),
            currentEntity.position[1],
          ];
          if (climbChecker(currentEntity, positionNextTo, newPosition)) {
            climbMovement(currentEntity, positionNextTo);
            return true;
          }
          return false;

          //checks if entity wants to climb
          function climbChecker(currentEntity, positionNextTo, newPosition) {
            let entityInPositionNextTo = activeEntities.find((entity) =>
              comparePosition(entity.position, positionNextTo)
            );
            let groundInPositionNextTo = activeGround.find((ground) =>
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

            function climbSpotFree(positionNextTo) {
              let positionAbove = [positionNextTo[0], positionNextTo[1] - 1];
              if (
                activeEntities.find((entity) =>
                  comparePosition(entity.position, positionAbove)
                ) !== undefined
              ) {
                return false;
              }
              if (
                activeGround.find((ground) =>
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
            if (currentEntity.speed <= currentEntity.speedCharge) {
              currentEntity.position = positionAbove;
              currentEntity.speedCharge = 0;
              projectileChecker(currentEntity);
            } else {
              currentEntity.speedCharge++;
            }
          }
        }

        function walkHolder(currentEntity, newPosition) {
          if (walkChecker(newPosition)) {
            walk(currentEntity, newPosition);
            return true;
          }

          function walkChecker(newPosition) {
            if (
              !activeEntities.find((entity) =>
                comparePosition(entity.position, newPosition)
              ) &&
              !activeGround.find((ground) =>
                comparePosition(ground.position, newPosition)
              )
            ) {
              return true;
            }
          }

          function walk(currentEntity, newPosition) {
            currentEntity.speedCharge = 0;
            currentEntity.position = newPosition;
            projectileChecker(currentEntity);
          }
        }

        //checks if entity walked into projectile and applies damage if so
        function projectileChecker(currentEntity) {
          let projectileInPosition = activeProjectiles.find((projectile) =>
            comparePosition(projectile.position, currentEntity.position)
          );
          if (
            projectileInPosition !== undefined &&
            projectileInPosition.enemy !== currentEntity.enemy
          ) {
            currentEntity.hp = -projectileInPosition.dmg;
            activeProjectiles.splice(
              activeProjectiles.indexOf(projectileInPosition),
              1
            );
            healthChecker(currentEntity, projectileInPosition.parent);
          }
        }
      }
    }

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
          let targetGround = activeGround.find((ground) =>
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
        let targetGround = activeGround.find((ground) =>
          comparePosition(ground.position, [
            direction(currentEntity),
            currentEntity.position[1],
          ])
        );
        targetGround.hp = targetGround.hp - currentEntity.dmg;
        healthChecker(targetGround, currentEntity);
        currentEntity.rateCharge = 0;
        currentEntity.speedCharge = 0;
      }
    }

    //checks to see if entity dies
    function healthChecker(entity, currentEntity) {
      if (entity.enemy !== undefined) {
        if (entity.hp <= 0) {
          currentEntity.rateCharge = 0;
          if (entity.enemy) {
            bank = bank + entity.value;
            setBank(bank);
            expTracker(entity, currentEntity);
          }
          graveyard.push(
            activeEntities.splice(activeEntities.indexOf(entity), 1)
          );
        }
      } else {
        if (entity.hp <= 0) {
          currentEntity.rateCharge = 0;
          graveyard.push(activeGround.splice(activeGround.indexOf(entity), 1));
        }
      }
    }

    //adds and checks exp on kill
    function expTracker(entity, currentEntity) {
      currentEntity.currentExp = currentEntity.currentExp + entity.exp;
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

    //tells the projectile what to do on its turn
    function projectileTurn(projectile) {
      if (projectile.distance === 0) {
        activeProjectiles.splice(activeProjectiles.indexOf(projectile), 1);
      }
      projectile.speedCharge++;
      if (projectileCanMove(projectile)) {
        projectileMovement(projectile);
      }

      //checks if the projectile can move this turn
      function projectileCanMove(projectile) {
        if (projectile.speedCharge >= projectile.speed) {
          return true;
        }
      }

      //checks to see if projectile will move or attack enemy
      function projectileMovement(projectile) {
        let newPosition = [direction(projectile), projectile.position[1]];
        let entityAtPosition = activeEntities.find((entity) =>
          comparePosition(entity.position, newPosition)
        );
        if (
          entityAtPosition !== undefined &&
          entityAtPosition.enemy !== projectile.enemy
        ) {
          entityAtPosition.hp = entityAtPosition.hp - projectile.dmg;
          activeProjectiles.splice(activeProjectiles.indexOf(projectile), 1);
          healthChecker(entityAtPosition, projectile.parent);
        } else {
          projectile.speedCharge = 0;
          projectile.position = newPosition;
          projectile.distance--;
        }
      }
    }

    //initiates ground turn
    function groundTurn(ground) {
      if (groundCanFall(ground.position)) {
        groundFall(ground);
      }

      //checks if ground can fall
      function groundCanFall(position) {
        let spaceBelow = true;
        if (position[1] !== gameboardHeight) {
          let positionBelow = [position[0], position[1] + 1];
          if (
            activeEntities.find((entity) =>
              comparePosition(entity.position, positionBelow)
            ) !== undefined
          ) {
            spaceBelow = false;
          }
          if (
            activeGround.find((ground) =>
              comparePosition(ground.position, positionBelow)
            ) !== undefined
          ) {
            spaceBelow = false;
          }
          return spaceBelow;
        } else return false;
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
    }

    //creates ground based on groundHeight and type
    function groundMaker() {
      for (let h = gameboardHeight; h > gameboardHeight - groundLevel; h--) {
        for (let w = 1; w <= gameboardWidth; w++) {
          let spawnChance = 10;
          if (w < 3) {
            spawnChance = 10;
          } else if (w > gameboardWidth / 2) {
            spawnChance = Math.random() * 10;
          } else {
            spawnChance = Math.random() * 50;
          }
          if (spawnChance > groundRoughness) {
            let stoneChance;
            let type = "dirt";
            if (h > gameboardHeight - groundLevel / 3) {
              stoneChance = 40;
              if (Math.random() * 100 < stoneChance) {
                type = "stone";
              }
            }
            let position = [w, h];
            let groundID = type + position[0] + position[1];
            groundID = new Ground(type, position, groundID);
            activeGround.push(groundID);
          }
        }
      }
    }

    //sets amount of turns to play
    function amountOfTurns(finished, currentTurn) {
      let gameFinished = finished;
      let innerTimer;
      let totalSpawns = 30;
      let enemySpawns = savedEnemySpawns;
      let lastSpawnTime = savedLastSpawnTime;
      if (!gameFinished) {
        setTimer(
          (innerTimer = setInterval(() => {
            turnCycler();
          }, renderSpeed * 20))
        );
      }

      //runs through turn actions
      function turnCycler() {
        spawnChecker();
        nextTurn(currentTurn);
        if (!victoryChecker()) {
          clearInterval(innerTimer);
        }
        currentTurn++;
        setSavedTurn(currentTurn);
        updateGameboardEntities();
      }

      //makes all entities take turn
      function nextTurn(currentTurn) {
        activeEntities.forEach((entity) => {
          entityTurn(entity);
        });
        activeProjectiles.forEach((projectile) => {
          projectileTurn(projectile);
        });
        activeGround.forEach((ground) => {
          groundTurn(ground);
        });
      }

      //checks to see if the king died
      function victoryChecker() {
        let kingAlive =
          activeEntities.find((entity) => entity.type === "king") !== undefined;
        if (!kingAlive) {
          activeEntitiesClearer(false);
          return false;
        } else return true;
      }

      //checks if game is allowed to spawn on current turn
      function spawnChecker() {
        if (enemySpawns <= totalSpawns) {
          lastSpawnTime++;
          setSavedLastSpawnTime(lastSpawnTime);
          if (lastSpawnTime > spawnTime()) {
            enemySpawner(spawnType());
            enemySpawns++;
            setSavedEnemySpawns(enemySpawns);
            lastSpawnTime = 0;
            setSavedLastSpawnTime(0);
          }
        }
      }

      //sets how long until next unit spawns
      function spawnTime() {
        let baseline = 80 / gameSpeed;
        let actual = baseline + 80 * Math.random();
        return actual;
      }

      //determines what entity will spawn based on weighted chance
      function spawnType() {
        let enemyEntities = Object.entries(entityList)
          .filter((entity) => entity[1].enemy)
          .map((entity) => entity[1]);
        let parsedEntities = [];
        enemyEntities.forEach((entity) => {
          Object.entries(entity.lvls).forEach((level) => {
            parsedEntities.push([entity.type, level[1].lvl, level[1].chance]);
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

      //spawns chosen enemy
      function enemySpawner(entity) {
        let entityType = entityList[entity[0]];
        let entityLvl = entityType.lvls["lvl" + entity[1]];
        let position = spawnPositionFinder();
        let entityID = entity[0] + currentTurn;
        entityID = new Entity(entityType, entityLvl, position, entityID);
        activeEntities.push(entityID);
      }

      //finds the position above the highest entity in the final column
      function spawnPositionFinder() {
        let endGrounds = activeGround.filter(
          (ground) => ground.position[0] === gameboardWidth
        );
        let endEntities = activeEntities.filter(
          (entity) => entity.position[0] === gameboardWidth
        );
        let spawnPosition;
        let highestPosition = gameboardHeight;
        endGrounds.forEach((ground) => {
          if (ground.position[1] <= highestPosition) {
            highestPosition = ground.position[1];
            spawnPosition = [ground.position[0], ground.position[1] - 1];
          }
        });
        endEntities.forEach((entity) => {
          if (entity.position[1] < highestPosition) {
            highestPosition = entity.position[1];
            spawnPosition = [entity.position[0], entity.position[1] - 1];
          }
        });
        if (spawnPosition === undefined) {
          spawnPosition = [gameboardWidth, gameboardHeight];
        }
        return spawnPosition;
      }

      //clears the activeEntities on victory
      function activeEntitiesClearer(victory) {
        if (victory) {
          activeEntities = activeEntities.filter((entity) => !entity.enemy);
        } else {
          setActiveEntities([]);
        }
      }
    }

    if (!paused) {
      groundMaker();
      friendlySpawner("king", [1, gameboardHeight - groundLevel], 1);
      updateGameboardEntities();
      amountOfTurns(false, 1);
    } else {
      amountOfTurns(false, savedTurn);
    }
  }

  //runs friendly through checks before spawning
  function friendlySpawner(friendlyType, friendlyPosition, friendlyLvl) {
    if (validFriendly(friendlyType, friendlyLvl)) {
      let friendlyCost =
        entityList[friendlyType].lvls["lvl" + friendlyLvl].value;
      if (bankChecker(friendlyCost)) {
        if (friendlyPositionChecker(friendlyPosition, friendlyType)) {
          setBank(bank - friendlyCost);
          friendlyEntityParser(friendlyType, friendlyPosition, friendlyLvl);
        }
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

  //determines if position for friendly spawn is allowed
  function friendlyPositionChecker(friendlyPosition, friendlyType) {
    let positionAllowed = true;
    if (comparePosition(friendlyPosition, [1, 1]) && friendlyType !== "king") {
      positionAllowed = false;
    } else {
      if (
        activeEntities.find((entity) =>
          comparePosition(entity.position, friendlyPosition)
        ) !== undefined
      ) {
        return (positionAllowed = false);
      }
    }
    if (positionAllowed && !entityList[friendlyType].enemy) {
      return true;
    }
  }

  //consolidates user input
  function friendlyInput(e) {
    let input = e.target.value;
    let id = e.target.id;
    let xHit = false;
    let x = "";
    let y = "";
    for (let i = 0; i < id.length; i++) {
      let currentChar = id[i];
      if (currentChar === "x") {
        xHit = true;
      } else if (!xHit) {
        x = x + currentChar;
      } else if (xHit) {
        y = y + currentChar;
      }
    }
    let position = [parseInt(x), parseInt(y)];
    let spawn = false;
    let entityInPosition = activeEntities.find((entity) =>
      comparePosition(entity.position, position)
    );
    if (entityInPosition === undefined) {
      spawn = true;
    } else if (!entityInPosition.enemy) {
      spawn = true;
    }
    if (spawn) {
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

  //translates user input into data Entity maker can use
  const [friendlyCount, setFriendlyCount] = useState(1);
  function friendlyEntityParser(entityType, entityPosition, entitylvl) {
    let ID = friendlyCount + 1;
    setFriendlyCount(ID);
    entityType = entityList[entityType];
    entitylvl = entityType.lvls["lvl" + entitylvl];
    let entityID = entityType.type + friendlyCount;
    entityID = new Entity(entityType, entitylvl, entityPosition, entityID);
    activeEntities.push(entityID);
    updateGameboardEntities();
  }

  //gives the ground entities a thicker outline if groundline
  function groundLine(ground) {
    ground.style.boxShadow = "";
    let made = false;
    let groundAbove = activeGround.find((targetGround) =>
      comparePosition(
        [ground.position[0], ground.position[1] - 1],
        targetGround.position
      )
    );
    if (groundAbove === undefined) {
      ground.style.boxShadow = "0px -1px 0px grey, inset 0px 1px 0px grey";
      made = true;
    }
    let groundLeft = activeGround.find((targetGround) =>
      comparePosition(
        [ground.position[0] - 1, ground.position[1]],
        targetGround.position
      )
    );
    if (groundLeft === undefined && ground.position[0] - 1 !== 0 && !made) {
      ground.style.boxShadow = "-1px 0px 0px grey, inset 1px 0px 0px grey";
      made = true;
    } else if (
      groundLeft === undefined &&
      ground.position[0] - 1 !== 0 &&
      made
    ) {
      ground.style.boxShadow =
        ground.style.boxShadow + ", -1px 0px 0px grey, inset 1px 0px 0px grey";
    }
    let groundRight = activeGround.find((targetGround) =>
      comparePosition(
        [ground.position[0] + 1, ground.position[1]],
        targetGround.position
      )
    );
    if (
      groundRight === undefined &&
      ground.position[0] + 1 < gameboardWidth + 1 &&
      !made
    ) {
      ground.style.boxShadow = "1px 0px 0px grey, inset -1px 0px 0px grey";
      ground.style.position = "sticky";
      made = true;
    } else if (
      groundRight === undefined &&
      ground.position[0] + 1 < gameboardWidth + 1 &&
      made
    ) {
      ground.style.boxShadow =
        ground.style.boxShadow + ", 1px 0px 0px grey, inset -1px 0px 0px grey";
      ground.style.position = "sticky";
    }
  }

  function attackBar(currentEntity) {
    let maxWidth = 157;
    let percentage = currentEntity.rateCharge / currentEntity.rate;
    let currentWidth = maxWidth * percentage;
    currentEntity.style.boxShadow =
      "inset " + currentWidth + "px 0px 0px 0px #0000001e";
  }

  //makes a list of purchasble entities
  function Purchasables() {
    let entityArray = Object.entries(entityList);
    let friendlyEntityArray = entityArray.filter((entity) => !entity[1].enemy);
    //removes king from array
    friendlyEntityArray.pop();
    let parsedFriendlyEntityArray = [];
    friendlyEntityArray.forEach((entity) => {
      let name = entity[0];
      let lvls = Object.entries(Object.entries(entity[1])[6][1]);
      lvls.forEach((lvl) => {
        parsedFriendlyEntityArray.push(
          name +
            lvl[1].lvl +
            " cost: $" +
            lvl[1].value +
            " hp: " +
            lvl[1].hp +
            " dmg: " +
            lvl[1].dmg +
            " range: " +
            lvl[1].range +
            " attack speed: " +
            lvl[1].rate
        );
      });
    });
    return (
      <div>
        {parsedFriendlyEntityArray.map((entity) => {
          return <p key={entity}>{entity}</p>;
        })}
      </div>
    );
  }

  //stops the game loop
  function pause() {
    clearInterval(timer);
  }

  //pushes everything back into the game and starts the loop
  function resume() {
    engine(activeEntities, graveyard, bank, true);
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

  //handles making a usable array for the grid renderer
  const [gameboardEntities, setGameboardEntities] = useState([]);

  function updateGameboardEntities() {
    let grid = [];
    let height = gameboardHeight;
    let width = gameboardWidth;
    const defaultStyle = {
      outlineTopColor: "grey",
      outlineLeftColor: "grey",
      outlineRightColor: "grey",
    };
    for (let h = 0; h <= height; h++) {
      let subGrid = [];
      for (let w = 0; w <= width; w++) {
        if (w === 0) {
          if (h === 0) {
            let style = {
              width: "50px",
              position: "sticky",
              boxShadow:
                "inset -1px 0px 0px #404040, inset 0px -1px 0px #404040",
            };
            subGrid.push([[w + "x" + h], [], style]);
          } else {
            let style = {
              textAlign: "center",
              width: "50px",
              boxShadow: "inset -1px 0px 0px #404040",
              color: "#404040",
            };
            subGrid.push([[w + "x" + h], [h + " "], style]);
          }
        } else if (h === 0) {
          let style = {
            textAlign: "center",
            color: "#404040",
            position: "sticky",
            boxShadow: "inset 0px -1px 0px #404040",
          };
          subGrid.push([[w + "x" + h], [toLetter(w - 1) + " "], style]);
        } else {
          let entityMade = false;
          activeGround.forEach((ground) => {
            groundLine(ground);
            let style = {
              boxShadow: ground.style.boxShadow,
              position: ground.style.position,
            };
            if (comparePosition(ground.position, [w, h])) {
              subGrid.push([
                [w + "x" + h],
                [ground.type + "(hp: " + ground.hp + ")"],
                style,
              ]);
              entityMade = true;
            }
          });
          activeEntities.forEach((entity) => {
            if (comparePosition(entity.position, [w, h]) && !entityMade) {
              attackBar(entity);
              let style = {
                boxShadow: entity.style.boxShadow,
              };
              if (entity.enemy === true) {
                style.color = "darkRed";
                subGrid.push([
                  [w + "x" + h],
                  [entity.type + entity.lvl + " (hp: " + entity.hp + ")"],
                  style,
                ]);
              } else {
                style.color = "darkGreen";
                subGrid.push([
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
                ]);
              }
              entityMade = true;
            }
          });
          activeProjectiles.forEach((projectile) => {
            if (comparePosition(projectile.position, [w, h]) && !entityMade) {
              if (
                activeEntities.find((entity) =>
                  comparePosition(entity.position, projectile.position)
                ) === undefined
              ) {
                subGrid.push([w + "x" + h, [projectile.symbol], defaultStyle]);
                entityMade = true;
              }
            }
          });
          if (!entityMade) {
            subGrid.push([w + "x" + h, [""], defaultStyle]);
          }
        }
      }
      grid.push(subGrid);
    }
    setGameboardEntities(grid);
  }

  // pushes the entities from updateGameboardEntities to the DOM
  function GameboardRender() {
    return (
      <table id="gameboard">
        <tbody>
          {gameboardEntities.map((row) => {
            return (
              <tr
                className="boardRow"
                key={row}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
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

  function startButton(e) {
    e.target.style = "display:none";
    engine(activeEntities, graveyard, bank, false);
  }

  //temp for the moment
  let purchasableButtonClicked = false;
  function purchasableButton() {
    if (!purchasableButtonClicked) {
      document.getElementById("purchasables").style = "";
      purchasableButtonClicked = true;
    } else {
      document.getElementById("purchasables").style = "display:none";
      purchasableButtonClicked = false;
    }
  }

  function updateGameboardWidth(e) {
    setGameboardWidth(e.target.value);
  }
  function updateGameboardHeight(e) {
    setGameboardHeight(e.target.value);
  }
  function updateGroundHeight(e) {
    setGroundLevel(e.target.value);
  }
  function updateGroundRoughness(e) {
    setgroundRoughness(e.target.value);
  }
  function updateGameSpeed(e) {
    setGameSpeed(e.target.value);
  }
  function updateRenderSpeed(e) {
    setRenderSpeed(e.target.value);
  }

  return (
    <>
      <div id="menu">
        <p>Money: ${bank}</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <p>Gameboard width:</p>
            <input
              type="number"
              value={gameboardWidth}
              onChange={updateGameboardWidth}
            ></input>
          </div>
          <p>Gameboard height:</p>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="number"
              value={gameboardHeight}
              onChange={updateGameboardHeight}
            ></input>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <p>Ground height:</p>
            <input
              type="number"
              value={groundLevel}
              onChange={updateGroundHeight}
            ></input>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <p>Ground roughness:</p>
            <input
              type="number"
              value={groundRoughness}
              onChange={updateGroundRoughness}
            ></input>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <p>Game speed:</p>
            <input
              type="number"
              value={gameSpeed}
              onChange={updateGameSpeed}
            ></input>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <p>Render speed:</p>
            <input
              type="number"
              value={renderSpeed}
              onChange={updateRenderSpeed}
            ></input>
          </div>
        </div>
        <button onClick={purchasableButton}>show purchasables</button>
        <div id="purchasables" style={{ display: "none" }}>
          <Purchasables></Purchasables>
        </div>
        <button id="startButton" onClick={startButton}>
          Start Round
        </button>
      </div>
      <GameboardRender></GameboardRender>
    </>
  );
}
