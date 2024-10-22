import { useState } from "react";
export default function engineOutput() {
  const [activeEntities, setActiveEntities] = useState([]);
  const [activeProjectiles, setActiveProjectiles] = useState([]);
  const [activeGround, setActiveGround] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [bank, setBank] = useState(10000);
  const [savedTurn, setSavedTurn] = useState(1);
  const [savedWave, setSavedWave] = useState();
  const [timer, setTimer] = useState();
  const [gameboardWidth, setGameboardWidth] = useState(10);
  const [gameboardHeight, setGameboardHeight] = useState(12);
  const [groundLevel, setGroundLevel] = useState(3);
  const [terrainSmoothness, setTerrainSmoothness] = useState(5);

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
    let neededRate = lvl.rate;
    this.rateCharge = neededRate;
    this.speed = lvl.speed;
    this.speedCharge = 0;
    this.enemy = type.enemy;
    this.value = lvl.value;
    if (!this.enemy) {
      this.currentExp = 0;
      this.neededExp = lvl.neededExp;
    } else {
      this.exp = lvl.exp;
    }
    this.fallSpeed = type.fallSpeed;
    this.fallCharge = 0;
    this.climber = type.climber;
    this.projectile = type.projectile;
  }

  //function that creates new active projectiles
  function Projectile(parent, name) {
    this.type = parent.projectile;
    this.parent = parent;
    let type = projectileList[this.type];
    this.dmg = parent.dmg;
    this.speed = type.speed;
    this.speedCharge = 0;
    this.fallSpeed = type.fallSpeed;
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
    this.fallSpeed = type.fallSpeed;
    this.fallCharge = 0;
  }

  //object that holds default values of entities
  const entityList = {
    goblin: {
      type: "goblin",
      enemy: true,
      projectile: false,
      fallSpeed: 10,
      climber: true,
      lvls: {
        lvl1: {
          lvl: 1,
          hp: 9,
          dmg: 3,
          range: 1,
          rate: 60,
          speed: 60,
          value: 1,
          exp: 1,
        },
        lvl2: {
          lvl: 2,
          hp: 12,
          dmg: 4,
          range: 1,
          rate: 50,
          speed: 50,
          value: 3,
          exp: 2,
        },
      },
    },
    skeleton: {
      type: "skeleton",
      enemy: true,
      projectile: "arrow",
      fallSpeed: 10,
      climber: true,
      lvls: {
        lvl1: {
          lvl: 1,
          hp: 5,
          dmg: 2,
          range: 3,
          rate: 60,
          speed: 90,
          value: 1,
          exp: 1,
        },
        lvl2: {
          lvl: 2,
          hp: 8,
          dmg: 3,
          range: 3,
          rate: 50,
          speed: 60,
          value: 3,
          exp: 2,
        },
      },
    },
    bow: {
      type: "bow",
      enemy: false,
      projectile: "arrow",
      fallSpeed: 1,
      climber: false,
      lvls: {
        lvl1: {
          lvl: 1,
          hp: 10,
          dmg: 3,
          range: 6,
          rate: 60,
          speed: 0,
          value: 5,
          neededExp: 3,
        },
        lvl2: {
          lvl: 2,
          hp: 12,
          dmg: 4,
          range: 6,
          rate: 50,
          speed: 0,
          value: 10,
          neededExp: 6,
        },
        lvl3: {
          lvl: 3,
          hp: 14,
          dmg: 5,
          range: 6,
          rate: 40,
          speed: 0,
          value: 15,
          neededExp: 30,
        },
      },
    },
    wall: {
      type: "wall",
      enemy: false,
      projectile: false,
      fallSpeed: 1,
      climber: false,
      lvls: {
        lvl1: {
          lvl: 1,
          hp: 10,
          dmg: 0,
          range: 0,
          rate: 0,
          speed: 0,
          value: 2,
          neededExp: 100,
        },
        lvl2: {
          lvl: 2,
          hp: 100000000,
          dmg: 0,
          range: 0,
          rate: 0,
          speed: 0,
          value: 2,
          neededExp: 100,
        },
      },
    },
    king: {
      type: "king",
      enemy: false,
      projectile: false,
      fallSpeed: 10,
      climber: false,
      lvls: {
        lvl1: {
          lvl: 1,
          hp: 20,
          dmg: 5,
          range: 1,
          rate: 1 * 30,
          speed: 0 * 30,
          value: 0,
          neededExp: 100,
        },
      },
    },
  };

  //object holding projectiles
  const projectileList = {
    arrow: {
      friendlySymbol: ">-<>",
      enemySymbol: "<>-<",
      projectile: true,
      speed: 30,
      fallSpeed: 40,
      distance: 5,
    },
  };

  const groundList = {
    dirt: {
      type: "dirt",
      fallSpeed: 2,
    },
    stone: {
      type: "stone",
      fallSpeed: 2,
    },
  };

  //object holding wave properties
  const waves = {
    wave1: {
      wave: 1,
      360: {
        name: "goblin",
        lvl: "lvl1",
        position: [10, 1],
      },
      423: {
        name: "goblin",
        lvl: "lvl2",
        position: [10, 1],
      },
      840: {
        name: "skeleton",
        lvl: "lvl1",
        position: [10, 1],
      },
      1103: {
        name: "goblin",
        lvl: "lvl2",
        position: [10, 1],
      },
    },
    wave2: {
      wave: 2,
      360: {
        name: "goblin",
        lvl: "lvl1",
        position: [10, 1],
      },
      423: {
        name: "goblin",
        lvl: "lvl2",
        position: [10, 1],
      },
      840: {
        name: "skeleton",
        lvl: "lvl1",
        position: [10, 1],
      },
      1103: {
        name: "goblin",
        lvl: "lvl2",
        position: [10, 1],
      },
      1605: {
        name: "skeleton",
        lvl: "lvl2",
        position: [10, 1],
      },
      1932: {
        name: "goblin",
        lvl: "lvl2",
        position: [10, 1],
      },
      2134: {
        name: "goblin",
        lvl: "lvl2",
        position: [10, 1],
      },
      2234: {
        name: "goblin",
        lvl: "lvl2",
        position: [10, 1],
      },
      2342: {
        name: "goblin",
        lvl: "lvl2",
        position: [10, 1],
      },
    },
  };
  let projectileCount = 1;

  function engine(activeEntities, graveyard, bank, waves, paused) {
    //tells entities what to do on their turn
    function entityTurn(currentEntity) {
      currentEntity.rateCharge++;
      currentEntity.speedCharge++;
      let turnTaken = false;
      let newPosition = [direction(currentEntity), currentEntity.position[1]];
      if (newPosition[0] === 0) {
        boundaryHandler(currentEntity);
        turnTaken = true;
      }
      if (entityCanFall(currentEntity.position)) {
        entityFall(currentEntity);
        turnTaken = true;
      }
      if (entityCanAttack(currentEntity, turnTaken)) {
        if (currentEntity.projectile !== false) {
          rangedAttack(currentEntity, turnTaken);
        } else entityAttack(currentEntity);
        turnTaken = true;
      }
      if (entityCanMove(currentEntity, turnTaken)) {
        entityMovement(currentEntity);
        turnTaken = true;
      }
      turnLogs(currentEntity, turnTaken);

      //function to spawn projectile
      function rangedAttack(currentEntity) {
        let projectileID =
          currentEntity.projectile + projectileCount + currentEntity.name;
        projectileCount++;
        activeProjectiles.push(new Projectile(currentEntity, projectileID));
        currentEntity.rateCharge = 0;
        currentEntity.speedCharge = 0;
        console.log(
          currentEntity.name + " shot an " + currentEntity.projectile
        );
      }

      //function to determine if there is anything under the current entity
      function entityCanFall(position) {
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

      //moves entities down if falling
      function entityFall(entity) {
        if (entity.fallCharge < entity.fallSpeed) {
          console.log(entity.name + " is falling");
          entity.fallCharge++;
        } else {
          entity.fallCharge = 0;
          let newPosition = [entity.position[0], entity.position[1] + 1];
          console.log(entity.name + " fell to " + newPosition);
          entity.position = newPosition;
          entity.speedCharge = entity.speed / 2;
          updateGameboardEntities();
        }
      }

      //function to determine if entity can attack this turn
      function entityCanAttack(currentEntity, turnTaken) {
        if (
          currentEntity.rateCharge >= currentEntity.rate &&
          currentEntity.rate !== 0 &&
          !turnTaken
        ) {
          let rangeCells = rangeGetter(currentEntity);
          let targetEntity = attackTargetter(currentEntity, rangeCells);
          if (targetEntity !== undefined) {
            return true;
          }
        }
      }

      //function to execute attack if can
      function entityAttack(currentEntity) {
        let rangeCells = rangeGetter(currentEntity);
        let targetEntity = attackTargetter(currentEntity, rangeCells);
        targetEntity.hp = targetEntity.hp - currentEntity.dmg;
        console.log(
          currentEntity.name +
            " attacked " +
            targetEntity.name +
            " for " +
            currentEntity.dmg +
            " damage. " +
            targetEntity.name +
            " HP is " +
            targetEntity.hp
        );
        healthChecker(targetEntity, currentEntity);
        updateGameboardEntities();
        currentEntity.rateCharge = 0;
        currentEntity.speedCharge = 0;
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
        let targetFound = false;
        let target;
        rangeCells.forEach((cell) => {
          if (targetFound === false) {
            let targetEntity = activeEntities.find((entity) =>
              comparePosition(entity.position, cell)
            );
            if (targetEntity !== undefined) {
              if (targetEntity.enemy !== currentEntity.enemy) {
                targetFound = true;
                if (targetFound) {
                }
                return (target = targetEntity);
              }
            }
          }
        });
        return target;
      }

      //function to determine if entity can move this turn
      function entityCanMove(currentEntity, turnTaken) {
        if (
          currentEntity.speedCharge >= currentEntity.speed &&
          currentEntity.speed !== 0 &&
          !turnTaken
        ) {
          return true;
        }
      }

      //function to determine how entity moves if it can
      function entityMovement(currentEntity) {
        let newPosition = [direction(currentEntity), currentEntity.position[1]];
        let spotFree = true;
        if (
          activeEntities.find(
            (entity) =>
              comparePosition(entity.position, newPosition) !== undefined ||
              activeGround.find(
                (ground) =>
                  comparePosition(ground.position, newPosition) !== undefined
              )
          )
        ) {
          if (currentEntity.climber) {
            if (climbChecker(currentEntity)) {
              spotFree = false;
            }
          }
        }
        if (
          spotFree &&
          !activeEntities.find((entity) =>
            comparePosition(entity.position, newPosition)
          ) &&
          !activeGround.find((ground) =>
            comparePosition(ground.position, newPosition)
          )
        ) {
          currentEntity.speedCharge = 0;
          currentEntity.position = newPosition;
          console.log(
            currentEntity.name + " moved to " + currentEntity.position
          );
          let projectileInPosition = activeProjectiles.find((projectile) =>
            comparePosition(projectile.position, currentEntity.position)
          );
          if (
            projectileInPosition !== undefined &&
            projectileInPosition.enemy !== currentEntity.enemy
          ) {
            currentEntity.hp = currentEntity.hp - projectileInPosition.dmg;
            activeProjectiles.splice(
              activeProjectiles.indexOf(projectileInPosition),
              1
            );
            healthChecker(currentEntity, projectileInPosition.parent);
          }
          updateGameboardEntities();
        }
      }

      //determines what happens to entity if hits boundary wall
      function boundaryHandler(currentEntity) {
        let king = activeEntities.find((entity) => (entity.type = "king"));
        king.hp = king.hp - currentEntity.dmg * 2;
        healthChecker(king, currentEntity);
        currentEntity.hp = 0;
        healthChecker(currentEntity, king);
        updateGameboardEntities();
      }

      //checks if entity wants to climb
      function climbChecker(currentEntity) {
        let positionNextTo = [
          direction(currentEntity),
          currentEntity.position[1],
        ];
        let entityInPositionNextTo = activeEntities.find((entity) =>
          comparePosition(entity.position, positionNextTo)
        );
        let groundInPositionNextTo = activeGround.find((ground) =>
          comparePosition(ground.position, positionNextTo)
        );
        let climbTarget;
        if (
          entityInPositionNextTo !== undefined &&
          entityInPositionNextTo.enemy === currentEntity.enemy
        ) {
          climbTarget = entityInPositionNextTo;
        } else if (groundInPositionNextTo !== undefined) {
          climbTarget = groundInPositionNextTo;
        }
        if (climbTarget !== undefined) {
          let positionAbove = [positionNextTo[0], positionNextTo[1] - 1];
          if (
            activeEntities.find((entity) =>
              comparePosition(entity.position, positionAbove)
            ) === undefined &&
            activeGround.find((ground) =>
              comparePosition(ground.position, positionAbove)
            ) === undefined
          ) {
            if (currentEntity.speed <= currentEntity.speedCharge) {
              currentEntity.position = positionAbove;
              currentEntity.speedCharge = 0;
              updateGameboardEntities();
              return true;
            } else {
              currentEntity.speed++;
              return true;
            }
          }
        }
      }

      //function purely to log things to the console
      function turnLogs(currentEntity, turnTaken) {
        if (currentEntity.rateCharge < currentEntity.rate && !turnTaken) {
          console.log(currentEntity.name + " charging attack.");
        } else if (
          currentEntity.speedCharge < currentEntity.speed &&
          currentEntity.speed !== 0 &&
          !turnTaken
        ) {
          console.log(currentEntity.name + " charging movement.");
        } else if (!turnTaken) {
          console.log(currentEntity.name + " did nothing.");
        }
      }
    }

    //checks to see if entity dies
    function healthChecker(entity, currentEntity) {
      if (entity.hp <= 0) {
        currentEntity.rateCharge = 0;
        console.log(entity.name + " was killed by " + currentEntity.name);
        if (entity.enemy) {
          bank = bank + entity.value;
          setBank(bank);
          expTracker(entity, currentEntity);
          console.log(
            currentEntity.name +
              " EXP: " +
              currentEntity.currentExp +
              "/" +
              currentEntity.neededExp
          );
          console.log("Total money: $" + bank);
        }
        graveyard.push(
          activeEntities.splice(activeEntities.indexOf(entity), 1)
        );
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
      console.log(
        currentEntity.name + " has leveled up to level " + currentEntity.lvl
      );
    }

    //tells the projectile what to do on its turn
    function projectileTurn(projectile) {
      if (projectile.distance === 0) {
        activeProjectiles.splice(activeProjectiles.indexOf(projectile), 1);
        updateGameboardEntities();
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
          updateGameboardEntities();
        } else {
          projectile.speedCharge = 0;
          projectile.position = newPosition;
          updateGameboardEntities();
          projectile.distance--;
        }
      }
    }

    function groundTurn(ground) {
      if (groundCanFall(ground.position)) {
        groundFall(ground);
      }

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

      function groundFall(ground) {
        if (ground.fallCharge < ground.fallSpeed) {
          console.log(ground.name + " is falling");
          ground.fallCharge++;
        } else {
          ground.fallCharge = 0;
          let newPosition = [ground.position[0], ground.position[1] + 1];
          console.log(ground.name + " fell to " + newPosition);
          ground.position = newPosition;
          updateGameboardEntities();
        }
      }
    }

    //sets amount of turns to play
    function amountOfTurns(i, finished, currentTurn) {
      setSavedWave(i);
      let wave = "wave" + i;
      let gameFinished = finished;
      let currentWave = waves[wave];
      let innerTimer;
      if (!gameFinished) {
        setTimer(
          (innerTimer = setInterval(() => {
            turnCycler(currentWave, wave, i);
          }, 5))
        );
      } else console.log("Game Over");

      //runs turn functions under a timer
      function turnCycler(currentWave, wave, i) {
        if (currentWave[currentTurn] !== undefined) {
          spawner(currentWave, currentTurn, activeEntities);
        }
        nextTurn(currentTurn);
        if (victoryChecker(wave, currentTurn) === "friendly victory") {
          clearInterval(innerTimer);
          console.log("Friendly Victory - Total Money: $" + bank);
          currentTurn = 1;
          if (i + 1 > Object.keys(waves).length) {
            amountOfTurns(i + 1, true, 1);
          } else {
            setSavedWave(i);
            amountOfTurns(i + 1, false, 1);
          }
        } else if (victoryChecker(wave, currentTurn) === "enemy victory") {
          clearInterval(innerTimer);
          console.log("Enemy Victory");
        }
        currentTurn++;
        setSavedTurn(currentTurn);
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
        console.log("Turn " + currentTurn + " over.");
      }

      //spawns entities based on wave
      function spawner(currentWave, currentTurn, activeEntities) {
        let entityType = entityList[currentWave[currentTurn].name];
        let entitylvl =
          entityList[currentWave[currentTurn].name].lvls[
            currentWave[currentTurn].lvl
          ];
        let position = currentWave[currentTurn].position;
        let entityID = currentWave[currentTurn].name + currentTurn;
        entityID = new Entity(entityType, entitylvl, position, entityID);
        activeEntities.push(entityID);
        console.log(entityID.name + " spawned at " + entityID.position + ".");
        updateGameboardEntities();
      }

      //checks if and which side has won round
      function victoryChecker(round, currentTurn) {
        let spawnTurns = [];
        Object.keys(waves[round]).forEach((element) => {
          spawnTurns.push(element);
        });
        let activeEnemies = activeEntities.filter(
          (entity) => entity.enemy
        ).length;
        let kingAlive =
          activeEntities.find((entity) => entity.type === "king") !== undefined;
        if (!kingAlive) {
          activeEntitiesClearer(false);
          return "enemy victory";
        } else if (
          currentTurn > spawnTurns[spawnTurns.length - 2] &&
          activeEnemies === 0
        ) {
          activeEntitiesClearer(true);
          setBank(bank);
          return "friendly victory";
        }
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
          if (spawnChance > terrainSmoothness) {
            let stoneChance;
            let type = "dirt";
            if (h > gameboardHeight - 1) {
              stoneChance = 20;
              if (Math.random() * 100 > stoneChance) {
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

    if (!paused) {
      groundMaker();
      friendlySpawner("king", [1, gameboardHeight - groundLevel], 1);
      updateGameboardEntities();
      amountOfTurns(1, false, 1);
    } else {
      amountOfTurns(savedWave, false, savedTurn);
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
          console.log(
            "Purchased " +
              friendlyType +
              " for $" +
              friendlyCost +
              ". Total money: $" +
              (bank - friendlyCost)
          );
          friendlyEntityParser(friendlyType, friendlyPosition, friendlyLvl);
        }
      }
    }
  }

  //determins if entity name and level are valid
  function validFriendly(friendlyType, friendlyLvl) {
    if (entityList[friendlyType] !== undefined) {
      if (entityList[friendlyType].lvls["lvl" + friendlyLvl] !== undefined) {
        return true;
      } else {
        console.log("Entity lvl does not exist");
      }
    } else {
      console.log("Entity does not exist");
    }
  }

  //determines if enough money in bank to spawn friendly
  function bankChecker(friendlyCost) {
    if (friendlyCost <= bank) {
      return true;
    } else {
      console.log("Insufficient funds");
    }
  }

  //determines if position for friendly spawn is allowed
  function friendlyPositionChecker(friendlyPosition, friendlyType) {
    let positionAllowed = true;
    if (comparePosition(friendlyPosition, [1, 1]) && friendlyType !== "king") {
      console.log("Cannot place in A9, position reserved for king");
      positionAllowed = false;
    } else {
      if (
        activeEntities.find((entity) =>
          comparePosition(entity.position, friendlyPosition)
        ) !== undefined
      ) {
        console.log("Position taken");
        return (positionAllowed = false);
      }
    }
    if (positionAllowed && !entityList[friendlyType].enemy) {
      return true;
    } else {
      console.log("Cannot spawn enemy units");
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
    console.log(entityID.name + " spawned at " + entityPosition);
    updateGameboardEntities();
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
      let lvls = Object.entries(Object.entries(entity[1])[5][1]);
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
    engine(activeEntities, graveyard, bank, waves, true);
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
  function toCoord(position) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let width = letters[position[0] - 1];
    let height = position[1];
    return width + height;
  }

  //handles making a usable array for the grid renderer
  const [gameboardEntities, setGameboardEntities] = useState([]);

  function updateGameboardEntities() {
    let grid = [];
    let height = gameboardHeight;
    let width = gameboardWidth;
    for (let h = 1; h <= height; h++) {
      let subGrid = [];
      for (let w = 1; w <= width; w++) {
        let entityMade = false;
        activeGround.forEach((ground) => {
          if (comparePosition(ground.position, [w, h])) {
            subGrid.push([[w + "x" + h], [ground.type]]);
            entityMade = true;
          }
        });
        activeEntities.forEach((entity) => {
          if (comparePosition(entity.position, [w, h]) && !entityMade) {
            if (entity.enemy === true) {
              subGrid.push([
                [w + "x" + h],
                [entity.type + entity.lvl + " (hp: " + entity.hp + ")"],
              ]);
            } else {
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
              subGrid.push([w + "x" + h, [projectile.symbol]]);
              entityMade = true;
            }
          }
        });
        if (!entityMade) {
          subGrid.push([w + "x" + h, [""]]);
        }
      }
      grid.push(subGrid);
    }
    setGameboardEntities(grid);
  }

  // pushes the active entities from updateGameboardEntities to, activeProjectiles the DOM
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
    engine(activeEntities, graveyard, bank, waves, false);
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

  return (
    <>
      <div id="menu">
        <p>Money: ${bank}</p>
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
