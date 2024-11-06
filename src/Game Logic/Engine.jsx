import { useState, useEffect, useRef } from "react";
import EntityList from "./EntityList.jsx";
import ProjectileList from "./ProjectileList.jsx";
import GroundList from "./GroundList.jsx";
import FluidList from "./FluidList.jsx";
import EffectList from "./EffectList.jsx";
export default function engineOutput() {
  const cellsToUpdate = useRef([]);
  const activeEntities = useRef([]);
  const activeProjectiles = useRef([]);
  const activeGround = useRef([]);
  const activeFluid = useRef([]);
  const activeEffects = useRef([]);
  const friendlyGraveyard = useRef([]);
  const enemyGraveyard = useRef([]);
  const groundGraveyard = useRef([]);
  const fluidGraveyard = useRef([]);
  const [bank, setBank] = useState(10000);
  const enemySpawnCount = useRef(0);
  const friendlySpawnCount = useRef(0);
  const lastEnemySpawnTime = useRef(0);
  const lastFriendlySpawnTime = useRef(0);
  const timer = useRef();
  const gameboardWidth = useRef(11);
  const gameboardHeight = useRef(33);
  const groundLevel = useRef(15);
  const groundRoughness = useRef(5);
  const waterLevel = useRef(1);
  const renderSpeed = useRef(5);
  const gameSpeed = useRef(0.5);
  const totalSpawns = useRef(30);
  const spawnSpeed = useRef(1);
  const kingHP = useRef(20);
  const gameMode = useRef("king");
  const friendlyCount = useRef(1);
  const terrainIsFalling = useRef(false);
  const projectileCount = useRef(0);
  const selectedCell = useRef();
  const cellTyping = useRef(false);
  const currentInput = useRef("");
  const [gameboardEntities, setGameboardEntities] = useState([]);
  const [settingsState, setSettingsState] = useState("none");
  let entityList = EntityList;
  let projectileList = ProjectileList;
  let groundList = GroundList;
  let fluidList = FluidList;
  let effectList = EffectList;

  //function that creates new active entities
  class Entity {
    constructor(type, lvl, position, ID) {
      this.name = ID;
      this.type = type.type;
      this.position = position;
      this.lvl = lvl.lvl;
      this.hp = lvl.hp;
      this.enemy = type.enemy;
      this.value = lvl.value;
      this.dmg = lvl.dmg;
      this.range = lvl.range;
      this.rate = lvl.rate / gameSpeed.current;
      this.rateCharge = this.rate;
      this.speed = lvl.speed / gameSpeed.current;
      this.speedCharge = 0;
      this.fallSpeed = type.fallSpeed / gameSpeed.current;
      this.fallCharge = 0;
      this.climber = type.climber;
      this.breathes = type.breathes;
      this.projectile = type.projectile;
      this.style = type.style;
      this.explosionDmg = lvl.explosionDmg;
      this.explosionRange = lvl.explosionRange;
      this.explodes = type.explodes;
    }

    get canExplode() {
      if (this.explodes) {
        return this.explode();
      }
    }

    explode() {
      let w = this.explosionRange;
      let h = this.explosionRange;
      let initialW = w;
      let initialH = h;
      while (w >= -initialW) {
        while (h >= -initialH) {
          let inCell = cellContents([
            this.position[0] + w,
            this.position[1] + h,
          ]);
          let dmg = parseInt(
            this.explosionDmg - (Math.random() * this.explosionDmg) / 4
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
          let effectType = effectList["explosion"];
          let effectPosition = [this.position[0] + w, this.position[1] + h];
          let effectID =
            "explosion" + this.position[0] + w + this.position[1] + h;
          effectID = new Effect(effectType, effectPosition, effectID);
          activeEffects.current.push(effectID);
          h--;
        }
        h = initialH;
        w--;
      }
    }
  }

  //function that creates new active projectiles
  class Projectile {
    constructor(parent, name, type) {
      this.type = type.type;
      this.parent = parent;
      this.enemy = parent.enemy;
      this.dmg = parent.dmg;
      this.speed = type.speed / gameSpeed.current;
      this.speedCharge = 0;
      this.fallSpeed = type.fallSpeed / gameSpeed.current;
      this.fallCharge = 0;
      this.position = [direction(parent), parent.position[1]];
      this.distance = parent.range;
      if (this.enemy) {
        this.symbol = type.enemySymbol;
      } else this.symbol = type.friendlySymbol;
      this.name = name;
    }
  }

  //function that creates new active ground entities
  class Ground {
    constructor(type, position, ID) {
      this.name = ID;
      this.type = type.type;
      this.position = position;
      this.hp = type.hp;
      this.fallSpeed = type.fallSpeed / gameSpeed.current;
      this.fallCharge = 0;
      this.style = type.style;
    }
  }

  class Fluid {
    constructor(type, position, ID) {
      this.name = ID;
      this.type = type.type;
      this.position = position;
      this.fallSpeed = type.fallSpeed / gameSpeed.current;
      this.fallCharge = 0;
      this.speed = type.speed / gameSpeed.current;
      this.speedCharge = 0;
      if (type.speed !== undefined) {
        let directionDecider = Math.random() * 10;
        if (directionDecider > 5) {
          this.direction = "left";
        } else {
          this.direction = "right";
        }
      }
      this.weight = type.weight;
      this.style = type.style;
    }
  }

  class Effect {
    constructor(type, position, ID) {
      this.name = ID;
      this.type = type.type;
      this.position = position;
      this.symbol = type.symbol;
      this.duration = type.duration;
      this.durationCharge = 0;
      this.style = type.style;
    }
  }

  //checks to see if entity dies
  function healthChecker(entity) {
    if (entity.hp <= 0) {
      if (entity.enemy) {
        setBank(bank + entity.value);
      }
      entityKiller(entity);
    }
  }

  //determines which graveyard entities get sent to
  function entityKiller(entity) {
    entity.canExplode;
    let isEntity = activeEntities.current.find(
      (targetEntity) => entity === targetEntity
    );
    let isGround = activeGround.current.find(
      (targetGround) => entity === targetGround
    );
    let isFluid = activeFluid.current.find(
      (targetFluid) => entity === targetFluid
    );
    if (isEntity !== undefined) {
      if (isEntity.enemy) {
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
    } else if (isGround !== undefined) {
      activeGround.current.splice(activeGround.current.indexOf(entity), 1);
    } else if (isFluid !== undefined) {
      fluidGraveyard.current.push(
        activeFluid.current.splice(activeFluid.current.indexOf(entity), 1)
      );
    }
  }

  function engine(paused, newRound) {
    //tells entities what to do on their turn
    function entityTurn(currentEntity) {
      healthChecker(currentEntity);
      entityCharge(currentEntity);
      liquidChecker(currentEntity);
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
          (newPosition[0] === 0 &&
            currentEntity.speedCharge >= currentEntity.speed) ||
          (newPosition[0] === gameboardWidth.current + 1 &&
            currentEntity.speedCharge >= currentEntity.speed)
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
            entityKiller(currentEntity);
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
          currentEntity.speed *= 2;
          currentEntity.rate *= 2;
          currentEntity.rateCharge *= 2;
          currentEntity.fallSpeed *= 4;
          if (currentEntity.breathes) {
            currentEntity.oxygen = 300;
          }
        } else {
          currentEntity.oxygen--;
          if (currentEntity.oxygen === 0) {
            currentEntity.hp--;
            if (currentEntity.hp === 0) {
              entityKiller(currentEntity);
            }
            currentEntity.oxygen = 50;
          }
        }
      } else if (currentEntity.inLiquid) {
        currentEntity.inLiquid = false;
        currentEntity.speed /= 2;
        currentEntity.rate /= 2;
        currentEntity.rateCharge /= 2;
        currentEntity.fallSpeed /= 4;
        currentEntity.oxygen = undefined;
      }
    }

    //holds functions for entity falling
    function entityFallHolder(currentEntity) {
      for (let i = gameSpeed.current; i > 0; i--) {
        if (entityCanFall(currentEntity.position, currentEntity)) {
          entityFall(currentEntity);
          return true;
        }
      }

      //function to determine if there is anything under the current entity
      function entityCanFall(position, currentEntity) {
        if (position[1] !== gameboardHeight.current) {
          let positionBelow = [position[0], position[1] + 1];
          let cellBelow = cellContents(positionBelow);
          if (
            cellBelow.ground !== undefined ||
            cellBelow.entity !== undefined
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
          currentEntity.projectile &&
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
          if (!currentEntity.projectile) {
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
          let targetCell = cellContents(cell);
          if (
            targetCell.entity !== undefined &&
            targetCell.entity.enemy !== currentEntity.enemy
          ) {
            return (target = targetCell.entity);
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
          currentEntity.projectile +
          projectileCount.current +
          currentEntity.name;
        projectileCount.current++;
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
            let cellNextTo = cellContents(positionNextTo);
            if (
              cellNextTo.entity !== undefined &&
              cellNextTo.entity.enemy === currentEntity.enemy
            ) {
              return climbSpotFree(positionNextTo);
            }
            if (cellNextTo.ground !== undefined) {
              return climbSpotFree(positionNextTo);
            }
            return false;

            //checks if position to climb into is free
            function climbSpotFree(positionNextTo) {
              let positionAbove = [positionNextTo[0], positionNextTo[1] - 1];
              let cellAbove = cellContents(positionAbove);
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
            let cellNewPosition = cellContents(newPosition);
            if (
              cellNewPosition.entity === undefined &&
              cellNewPosition.ground === undefined
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
          let cellInPosition = cellContents(currentEntity.position);
          if (
            cellInPosition.projectile !== undefined &&
            cellInPosition.projectile.enemy !== currentEntity.enemy
          ) {
            currentEntity.hp -= cellInPosition.projectile.dmg;
            activeProjectiles.current.splice(
              activeProjectiles.current.indexOf(cellInPosition.projectile),
              1
            );
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
          let targetCell = cellContents([
            direction(currentEntity),
            currentEntity.position[1],
          ]);
          if (targetCell.ground !== undefined) {
            return true;
          }
        }
        return false;
      }

      //makes entity attack adjacent ground
      function entityAttackGround(currentEntity) {
        let targetCell = cellContents([
          direction(currentEntity),
          currentEntity.position[1],
        ]);
        targetCell.ground.hp -= currentEntity.dmg;
        currentEntity.rateCharge = 0;
        currentEntity.speedCharge = 0;
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
        let cellAtPosition = cellContents(newPosition);
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
          let cellBelow = cellContents(positionBelow);
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
          let cellBelow = cellContents(positionBelow);
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
          let targetCell = cellContents(targetPosition);
          if (
            targetCell.ground === undefined &&
            targetCell.fluid === undefined
          ) {
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
        let cellBelow = cellContents([
          fluid.position[0],
          fluid.position[1] + 1,
        ]);
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
        friendlySpawner("king", [1, -groundLevel.current], 1);
      }
      updateGameboardEntities();
    }
    amountOfTurns(false);
  }

  //checks if two arrays share both same values
  function comparePosition(position1, position2) {
    if (position1[0] === position2[0] && position1[1] === position2[1]) {
      return true;
    }
    return false;
  }

  //returns an object of what is currently in selected position
  function cellContents(position) {
    let entityInCell = activeEntities.current.find((entity) =>
      comparePosition(entity.position, position)
    );
    let groundInCell = activeGround.current.find((ground) =>
      comparePosition(ground.position, position)
    );
    let fluidInCell = activeFluid.current.find((fluid) =>
      comparePosition(fluid.position, position)
    );
    let projectileInCell = activeProjectiles.current.find((projectile) =>
      comparePosition(projectile.position, position)
    );
    let effectInCell = activeEffects.current.find((effect) =>
      comparePosition(effect.position, position)
    );
    let inCell = {
      entity: entityInCell,
      ground: groundInCell,
      fluid: fluidInCell,
      projectile: projectileInCell,
      effect: effectInCell,
    };
    return inCell;
  }

  //adds or subtracts on the x axis depending on enemy type
  function direction(currentEntity) {
    if (currentEntity.enemy) {
      return currentEntity.position[0] - 1;
    }
    return currentEntity.position[0] + 1;
  }

  //turns position into spreadsheet style coordinate
  function toLetter(position) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[position];
  }

  //checks to see if user input is in space of other entity
  function typingChecker(position) {
    let targetCell = cellContents(position);
    if (targetCell.ground === undefined && targetCell.entity === undefined) {
      return true;
    }
  }

  //parses user input into usable data
  function friendlyInput(position) {
    let input = currentInput.current;
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
        if (gameMode.current === "sandbox") {
          return true;
        }
        if (!entityList[friendlyType].enemy) {
          return true;
        }
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

  //gives the ground entities a thicker outline if groundline
  function groundLine(ground) {
    if (!ground.falling) {
      if (ground.fallSpeed > ground.fallCharge) {
        return;
      }
      ground.style.boxShadow = "";
      let made = false;
      let cellAbove = cellContents([
        ground.position[0],
        ground.position[1] - 1,
      ]);
      let cellLeft = cellContents([ground.position[0] - 1, ground.position[1]]);
      let cellRight = cellContents([
        ground.position[0] + 1,
        ground.position[1],
      ]);
      if (cellAbove.ground === undefined) {
        ground.style.boxShadow = "inset 0px 2px 0px grey";
        made = true;
      }
      if (
        cellLeft.ground === undefined &&
        ground.position[0] - 1 !== 0 &&
        !made
      ) {
        ground.style.boxShadow = "inset 2px 0px 0px grey";
        made = true;
      } else if (
        cellLeft.ground === undefined &&
        ground.position[0] - 1 !== 0 &&
        made
      ) {
        ground.style.boxShadow =
          ground.style.boxShadow + ",inset 2px 0px 0px grey";
      }
      if (
        cellRight.ground === undefined &&
        ground.position[0] < gameboardWidth.current &&
        !made
      ) {
        ground.style.boxShadow = "inset -2px 0px 0px grey";
        made = true;
      } else if (
        cellRight.ground === undefined &&
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

  function fluidLine(fluid) {
    if (!fluid.falling) {
      if (fluid.fallSpeed > fluid.fallCharge) {
        return;
      }
      fluid.style.boxShadow = "";
      let made = false;
      let cellAbove = cellContents([fluid.position[0], fluid.position[1] - 1]);
      let cellLeft = cellContents([fluid.position[0] - 1, fluid.position[1]]);
      let cellRight = cellContents([fluid.position[0] + 1, fluid.position[1]]);
      if (cellAbove.fluid === undefined) {
        fluid.style.boxShadow = "inset 0px 1px 0px blue";
        made = true;
      }
      if (
        cellLeft.fluid === undefined &&
        cellLeft.ground === undefined &&
        !made
      ) {
        fluid.style.boxShadow = "inset 1px 0px 0px blue";
        made = true;
      } else if (
        cellLeft.fluid === undefined &&
        cellLeft.ground === undefined &&
        made
      ) {
        fluid.style.boxShadow =
          fluid.style.boxShadow + ",inset 1px 0px 0px blue";
      }
      if (
        cellRight.fluid === undefined &&
        cellRight.ground === undefined &&
        !made
      ) {
        fluid.style.boxShadow = "inset -1px 0px 0px blue";
        made = true;
      } else if (
        cellRight.fluid === undefined &&
        cellRight.ground === undefined &&
        made
      ) {
        fluid.style.boxShadow =
          fluid.style.boxShadow + ",inset -1px 0px 0px blue";
      }
    } else {
      fluid.style.boxShadow = false;
    }
  }

  //gives entities an attack bar
  function attackBar(currentEntity) {
    let maxWidth = 157;
    let percentage = currentEntity.rateCharge / currentEntity.rate;
    let currentWidth = maxWidth * percentage;
    if (currentEntity.enemy) {
      currentEntity.style.boxShadow =
        "inset " + -currentWidth + "px 0px 0px 0px #0000001e";
    } else {
      currentEntity.style.boxShadow =
        "inset " + currentWidth + "px 0px 0px 0px #0000001e";
    }
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
    cellsToUpdate.current = [];
    setGameboardEntities(grid);

    //determines what type function to call
    function cellType(w, h) {
      let id = w + "x" + h;
      let cell = cellContents([w, h]);
      let key = id;
      if (selectedCell.current !== undefined && currentInput.current !== "") {
        let inputPosition = selectedCell.current.id.split("x");
        inputPosition[0] = parseInt(inputPosition[0]);
        inputPosition[1] = parseInt(inputPosition[1]);
        if (comparePosition(inputPosition, [w, h])) {
          return [key, id, currentInput.current];
        }
      }
      if (w === 0) {
        return firstColumnCell(h, id, key);
      }
      if (h === 0) {
        return firstRowCell(w, id, key);
      }
      if (cell.effect !== undefined) {
        return effectCell(cell.effect, id, key);
      }
      if (cell.entity !== undefined) {
        return entityCell(cell.entity, id, key);
      }
      if (cell.ground !== undefined) {
        return groundCell(cell.ground, id, key);
      }
      if (cell.fluid !== undefined) {
        return fluidCell(cell.fluid, id, key);
      }
      if (cell.projectile !== undefined) {
        return projectileCell(cell.projectile, id, key);
      }
      let style = {};
      return [key, id, "", style];
    }

    //below functions return what is to be rendered in cell
    function firstColumnCell(h, id, key) {
      if (h === 0) {
        let style = {
          width: "50px",
          position: "sticky",
          boxShadow: "inset -1px 0px 0px #404040, inset 0px -2px 0px #404040",
        };
        return [key, id, "", style];
      } else {
        let style = {
          textAlign: "center",
          width: "50px",
          boxShadow: "inset -1px 0px 0px #404040",
          color: "#404040",
        };
        return [key, id, h + " ", style];
      }
    }

    function firstRowCell(w, id, key) {
      let style = {
        textAlign: "center",
        color: "#404040",
        position: "sticky",
        boxShadow: "inset 0px -2px 0px #404040",
      };
      return [key, id, toLetter(w - 1) + " ", style];
    }

    function groundCell(ground, id, key) {
      if (terrainIsFalling.current) {
        groundLine(ground);
      }
      let style = {
        boxShadow: ground.style.boxShadow,
      };
      return [key, id, ground.type + " (hp: " + ground.hp + ")", style];
    }

    function fluidCell(fluid, id, key) {
      if (terrainIsFalling.current) {
        fluidLine(fluid);
      }
      let style = {
        boxShadow: fluid.style.boxShadow,
      };
      style.fontStyle = "italic";
      return [key, id, fluid.type, style];
    }

    function effectCell(effect, id, key) {
      let style = {
        backgroundColor: effect.style.backgroundColor,
        color: effect.style.color,
      };
      return [key, id, effect.symbol, style];
    }

    function entityCell(entity, id, key) {
      attackBar(entity);
      let style = {
        boxShadow: entity.style.boxShadow,
      };
      let cellText = entity.type + entity.lvl + " (hp: " + entity.hp + ")";
      if (entity.enemy === true) {
        style.color = "darkRed";
      } else {
        style.color = "darkGreen";
      }
      if (entity.inLiquid) {
        style.fontStyle = "italic";
        let cellAbove = cellContents([
          entity.position[0],
          entity.position[1] - 1,
        ]);
        let cellLeft = cellContents([
          entity.position[0] - 1,
          entity.position[1],
        ]);
        let cellRight = cellContents([
          entity.position[0] + 1,
          entity.position[1],
        ]);
        if (cellAbove.fluid === undefined) {
          style.boxShadow = style.boxShadow + ",inset 0px 1px 0px blue";
        }
        if (cellLeft.fluid === undefined && cellLeft.ground === undefined) {
          style.boxShadow = style.boxShadow + ",inset 1px 0px 0px blue";
        }
        if (cellRight.fluid === undefined && cellRight.ground === undefined) {
          style.boxShadow = style.boxShadow + ",inset -1px 0px 0px blue";
        }
      } else {
        style.fontStyle = "normal";
      }
      return [key, id, cellText, style];
    }

    function projectileCell(projectile, id, key) {
      if (
        activeEntities.current.find((entity) =>
          comparePosition(entity.position, projectile.position)
        ) === undefined
      ) {
        let style = {};
        return [key, id, projectile.symbol, style];
      }
    }
  }

  useEffect(() => {
    function handleKeyPress(e) {
      keyboardSelect(e);
    }
    function handleClick(e) {
      clickSelect(e);
    }
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("click", handleClick);
    return function cleanup() {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  function clickSelect(e) {
    if (e.target === selectedCell.current) {
      e.target.readOnly = false;
      cellTyping.current = true;
    } else if (e.target.className === "boardCell") {
      if (selectedCell.current !== undefined) {
        selectedCell.current.readOnly = true;
      }
      selectedCell.current = e.target;
      currentInput.current = "";
    }
  }
  //gives the user input a spreadsheet like experience
  function keyboardSelect(e) {
    let position = selectedCell.current.id.split("x");
    position[0] = parseInt(position[0]);
    position[1] = parseInt(position[1]);
    let newPosition = keyPosition(e.key, position, e);
    function keyPosition(keyPressed, position, e) {
      if (keyPressed === "ArrowUp") {
        if (cellTyping.current) {
          return;
        }
        e.preventDefault();
        cellTyping.current = false;
        return [position[0], position[1] - 1];
      }
      if (keyPressed === "ArrowDown") {
        if (cellTyping.current) {
          return;
        }
        e.preventDefault();
        cellTyping.current = false;
        return [position[0], position[1] + 1];
      }
      if (keyPressed === "ArrowLeft") {
        if (cellTyping.current) {
          return;
        }
        e.preventDefault();
        cellTyping.current = false;
        return [position[0] - 1, position[1]];
      }
      if (keyPressed === "ArrowRight") {
        if (cellTyping.current) {
          return;
        }
        e.preventDefault();
        cellTyping.current = false;
        return [position[0] + 1, position[1]];
      }
      if (keyPressed === "Enter") {
        if (cellTyping.current) {
          cellTyping.current = false;
          friendlyInput(position);
          currentInput.current = "";
          return [position[0], position[1] + 1];
        }
        if (typingChecker(position)) {
          selectedCell.current.readOnly = false;
          cellTyping.current = true;
          return;
        }
        return;
      }
      if (keyPressed === "Tab") {
        e.preventDefault();
        cellTyping.current = false;
        friendlyInput(position);
        currentInput.current = "";
        return [position[0] + 1, position[1]];
      }
      if (keyPressed.length === 1 || keyPressed === "space") {
        if (typingChecker(position)) {
          cellTyping.current = true;
          selectedCell.current.readOnly = false;
          if (keyPressed === "space") {
            currentInput.current += " ";
          }
          currentInput.current += keyPressed;
          updateGameboardEntities();
        } else e.preventDefault();
      }
      if (keyPressed === "Backspace") {
        currentInput.current = currentInput.current.slice(0, -1);
        updateGameboardEntities();
      }
    }
    if (
      newPosition === undefined ||
      newPosition[0] === 0 ||
      newPosition[0] > gameboardWidth.current ||
      newPosition[1] === 0 ||
      newPosition[1] > gameboardHeight.current
    ) {
      return;
    }
    selectedCell.current.readOnly = true;
    let newID = newPosition[0] + "x" + newPosition[1];
    selectedCell.current = document.getElementById(newID);
    selectedCell.current.focus();
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
              <tr className="purchasableRow" key={row}>
                {row.map((position) => {
                  return (
                    <td key={position[1]}>
                      <input
                        id={position[1]}
                        className="purchasableCell"
                        type="text"
                        defaultValue={position[0]}
                        style={position[2]}
                        readOnly
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

  function newButton() {
    clearInterval(timer.current);
    enemyGraveyard.current = [];
    friendlyGraveyard.current = [];
    groundGraveyard.current = [];
    enemySpawnCount.current = 0;
    friendlySpawnCount.current = 0;
    lastEnemySpawnTime.current = 0;
    lastFriendlySpawnTime.current = 0;
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
  function updateWaterLevel(e) {
    waterLevel.current = parseInt(e.target.value);
    updateGameboardEntities();
  }
  function updateGroundRoughness(e) {
    groundRoughness.current = parseFloat(e.target.value);
    updateGameboardEntities();
  }
  function updateGameSpeed(e) {
    gameSpeed.current = parseFloat(e.target.value);
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

  function toggleSettings() {
    if (settingsState === "flex") {
      setSettingsState("none");
    } else setSettingsState("flex");
  }

  //renders the gameboard once on page load
  useEffect(() => {
    updateGameboardEntities();
  }, []);

  return (
    <>
      <div id="above">
        <div id="stats">
          <p className="statTitle" id="firstStat"></p>
          <p className="statTitle">Money:</p>
          <p className="stat">{bank}</p>

          <p className="statTitle">Friendly deaths: </p>
          <p className="stat">{friendlyGraveyard.current.length}</p>

          <p className="statTitle">Enemy deaths: </p>
          <p className="stat">{enemyGraveyard.current.length}</p>

          <p className="statTitle">Terrain destroyed: </p>
          <p className="stat">{groundGraveyard.current.length}</p>

          <p className="statTitle">Enemies remaining: </p>
          <p className="stat">
            {totalSpawns.current - enemySpawnCount.current}/
            {totalSpawns.current}
          </p>
          <button
            className="statTitle"
            id="settingsButton"
            onClick={toggleSettings}
          >
            Settings/Entities &nbsp;
          </button>
        </div>
        <table id="gameboard">
          <tbody>
            {gameboardEntities.map((row) => {
              return (
                <tr className="boardRow" key={row[0][0].split("x")[1]}>
                  {row.map((position) => {
                    return (
                      <td key={position[0]} id={position[1] + "xtd"}>
                        <input
                          className="boardCell"
                          type="text"
                          style={position[3]}
                          id={position[1]}
                          value={position[2]}
                          readOnly={true}
                        ></input>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div id="below" style={{ display: settingsState }}>
        <Purchasables></Purchasables>
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
            <div>
              <p>{gameboardWidth.current}</p>
              <input
                id="boardWidth"
                className="settingSlider"
                type="range"
                min="2"
                max="80"
                value={gameboardWidth.current}
                onChange={updateGameboardWidth}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p className="settingTitle">Gameboard height:</p>
            <div>
              <p>{gameboardHeight.current}</p>
              <input
                id="boardHeight"
                className="settingSlider"
                type="range"
                min="1"
                max="50"
                value={gameboardHeight.current}
                onChange={updateGameboardHeight}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p className="settingTitle">Ground height:</p>
            <div>
              <p>{groundLevel.current}</p>
              <input
                id="groundLevel.current"
                className="settingSlider"
                type="range"
                min="0"
                max={gameboardHeight.current}
                value={groundLevel.current}
                onChange={updateGroundHeight}
              ></input>
            </div>
          </div>{" "}
          <div className="settingHolder">
            <p className="settingTitle">Water level:</p>
            <div>
              <p>{waterLevel.current}</p>
              <input
                id="waterLevel.current"
                className="settingSlider"
                type="range"
                min="0"
                max={gameboardHeight.current}
                value={waterLevel.current}
                onChange={updateWaterLevel}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p className="settingTitle">Ground roughness:</p>
            <div>
              <p>{groundRoughness.current}</p>
              <input
                id="groundRoughness.current"
                className="settingSlider"
                type="range"
                min="0"
                max="10"
                value={groundRoughness.current}
                onChange={updateGroundRoughness}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p className="settingTitle">Game speed:</p>
            <div>
              <p>{gameSpeed.current}</p>
              <input
                id="gameSpeed.current"
                className="settingSlider"
                type="range"
                min="1"
                max="100"
                value={gameSpeed.current}
                onChange={updateGameSpeed}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p className="settingTitle">Render speed:</p>
            <div>
              <p>{renderSpeed.current}</p>
              <input
                id="renderSpeed.current"
                className="settingSlider"
                type="range"
                min="1"
                max="10"
                value={renderSpeed.current}
                onChange={updateRenderSpeed}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p className="settingTitle">Total spawns:</p>
            <div>
              <p>{totalSpawns.current}</p>
              <input
                id="totalSpawns.current"
                className="settingSlider"
                type="range"
                min="1"
                max="300"
                value={totalSpawns.current}
                onChange={updateTotalSpawns}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p className="settingTitle">Spawn speed:</p>
            <div>
              <p>{spawnSpeed.current}</p>
              <input
                id="spawnSpeed.current"
                className="settingSlider"
                type="range"
                min="1"
                max="100"
                value={spawnSpeed.current}
                onChange={updateSpawnSpeed}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p className="settingTitle">King HP:</p>
            <div>
              <p>{kingHP.current}</p>
              <input
                id="kingHP.current"
                className="settingSlider"
                type="range"
                min="10"
                max="10000"
                value={kingHP.current}
                onChange={updateKingHP}
              ></input>
            </div>
          </div>
          <div
            className="settingHolder"
            style={{ display: "flex", alignItems: "center" }}
          >
            <p className="settingTitle">Gamemode:</p>
            <select
              id="gamemode.currentSelect"
              defaultValue={gameMode.current}
              onChange={updateGameMode}
            >
              <option value="king">king</option>
              <option value="battle">battle</option>
              <option value="sandbox">sandbox</option>
            </select>
          </div>
        </div>
      </div>
      <button id="newButton" onClick={newButton}>
        New Round
      </button>
    </>
  );
}
