import { useState } from "react";
export default function EngineOutput() {
  const [activeEntities, setActiveEntities] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [bank, setBank] = useState(10);
  const [currentTurn, setCurrentTurn] = useState(1);

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
    this.fallCharge = type.fallSpeed;
    this.climber = type.climber;
  }

  //object that holds default values of entities
  const entityList = {
    goblin: {
      type: "goblin",
      enemy: true,
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
      fallSpeed: 10,
      climber: false,
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
    arrow: {
      type: "arrow",
      enemy: false,
      fallSpeed: 1,
      climber: false,
      lvls: {
        lvl1: {
          lvl: 1,
          hp: 10,
          dmg: 3,
          range: 3,
          rate: 60,
          speed: 0,
          value: 5,
          neededExp: 3,
        },
        lvl2: {
          lvl: 2,
          hp: 12,
          dmg: 4,
          range: 3,
          rate: 50,
          speed: 0,
          value: 10,
          neededExp: 6,
        },
        lvl3: {
          lvl: 3,
          hp: 14,
          dmg: 5,
          range: 3,
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
      },
    },
    king: {
      type: "king",
      enemy: false,
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

  //object holding wave properties
  const waves = {
    wave1: {
      wave: 1,
      360: {
        name: "goblin",
        lvl: "lvl1",
        position: "J9",
      },
      423: {
        name: "goblin",
        lvl: "lvl2",
        position: "J9",
      },
      840: {
        name: "skeleton",
        lvl: "lvl1",
        position: "J9",
      },
      1103: {
        name: "goblin",
        lvl: "lvl2",
        position: "J9",
      },
      1605: {
        name: "skeleton",
        lvl: "lvl2",
        position: "J9",
      },
      1932: {
        name: "goblin",
        lvl: "lvl2",
        position: "J9",
      },
      2134: {
        name: "goblin",
        lvl: "lvl2",
        position: "J9",
      },
      2234: {
        name: "goblin",
        lvl: "lvl2",
        position: "J9",
      },
      2342: {
        name: "goblin",
        lvl: "lvl2",
        position: "J9",
      },
      2600: {
        name: "goblin",
        lvl: "lvl1",
        position: "J9",
      },
      2800: {
        name: "goblin",
        lvl: "lvl2",
        position: "J9",
      },
      2950: {
        name: "skeleton",
        lvl: "lvl1",
        position: "J9",
      },
      3140: {
        name: "goblin",
        lvl: "lvl2",
        position: "J9",
      },
      3250: {
        name: "skeleton",
        lvl: "lvl2",
        position: "J9",
      },
      3380: {
        name: "goblin",
        lvl: "lvl2",
        position: "J9",
      },
      3480: {
        name: "goblin",
        lvl: "lvl2",
        position: "J9",
      },
      3550: {
        name: "goblin",
        lvl: "lvl2",
        position: "J9",
      },
      3785: {
        name: "goblin",
        lvl: "lvl2",
        position: "J9",
      },
    },
    wave2: {
      wave: 2,
      360: {
        name: "goblin",
        lvl: "lvl1",
        position: "I9",
      },
      423: {
        name: "goblin",
        lvl: "lvl2",
        position: "I9",
      },
      840: {
        name: "skeleton",
        lvl: "lvl1",
        position: "I9",
      },
      1103: {
        name: "goblin",
        lvl: "lvl2",
        position: "I9",
      },
      1605: {
        name: "skeleton",
        lvl: "lvl2",
        position: "I9",
      },
      1932: {
        name: "goblin",
        lvl: "lvl2",
        position: "I9",
      },
      2134: {
        name: "goblin",
        lvl: "lvl2",
        position: "I9",
      },
      2234: {
        name: "goblin",
        lvl: "lvl2",
        position: "I9",
      },
      2342: {
        name: "goblin",
        lvl: "lvl2",
        position: "I9",
      },
    },
  };

  function Engine(activeEntities, graveyard, bank, currentTurn, waves) {
    //tells entities what to do on their turn
    function entityTurn(currentEntity) {
      currentEntity.rateCharge++;
      currentEntity.speedCharge++;
      let turnTaken = false;
      if (entityCanFall(currentEntity.position)) {
        entityFall(currentEntity);
        turnTaken = true;
      }
      if (entityCanAttack(currentEntity, turnTaken)) {
        entityAttack(currentEntity);
        turnTaken = true;
      }
      if (entityCanMove(currentEntity, turnTaken)) {
        entityMovement(currentEntity);
        turnTaken = true;
      }
      turnLogs(currentEntity, turnTaken);

      //function to determine if there is anything under the current entity
      function entityCanFall(position) {
        let letter = position.charAt(0);
        let number = parseInt(position.charAt(1));
        if (number != 9) {
          let positionBelow = letter + (number + 1);
          if (
            activeEntities.find(
              (entity) => entity.position === positionBelow
            ) === undefined
          ) {
            return true;
          }
        } else return false;
      }

      //moves entities down if falling
      function entityFall(entity) {
        if (entity.fallCharge < entity.fallSpeed) {
          console.log(entity.name + " is falling");
          entity.fallCharge++;
        } else {
          entity.fallCharge = 0;
          let newPosition =
            entity.position.charAt(0) +
            (parseInt(entity.position.charAt(1)) + 1);
          console.log(entity.name + " fell to " + newPosition);
          entity.position = newPosition;
          updateGameboardEntities(activeEntities);
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
        updateGameboardEntities(activeEntities);
        currentEntity.rateCharge = 0;
        currentEntity.speedCharge = 0;
      }

      //function to return array of cells entity can target
      function rangeGetter(currentEntity) {
        let rangeCells = [];
        let rangeLetter = letterParser(
          currentEntity.position.charAt(0),
          currentEntity.enemy
        );
        for (let i = currentEntity.range; i > 0; i--) {
          rangeCells.push(rangeLetter + currentEntity.position.charAt(1));
          rangeLetter = letterParser(rangeLetter, currentEntity.enemy);
        }
        return rangeCells;
      }

      //function to return entity to attack
      function attackTargetter(currentEntity, rangeCells) {
        let targetFound = false;
        let target;
        rangeCells.forEach((cell) => {
          if (targetFound === false) {
            let targetEntity = activeEntities.find(
              (entity) => entity.position === cell
            );
            if (targetEntity !== undefined) {
              if (
                targetEntity.position === cell &&
                targetEntity.enemy !== currentEntity.enemy
              ) {
                targetFound = true;
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
        let newPosition =
          letterParser(currentEntity.position.charAt(0), currentEntity.enemy) +
          currentEntity.position.charAt(1);
        let spotFree = true;
        if (
          activeEntities.find((entity) => entity.position === newPosition) !==
          undefined
        ) {
          if (currentEntity.climber) {
            if (climbChecker(currentEntity)) {
              spotFree = false;
            }
          }
        }
        if (spotFree) {
          currentEntity.speedCharge = 0;
          currentEntity.position = newPosition;
          console.log(
            currentEntity.name + " moved to " + currentEntity.position
          );
          updateGameboardEntities(activeEntities);
        }
      }

      //checks if entity wants to climb
      function climbChecker(currentEntity) {
        let letter = currentEntity.position.charAt(0);
        let number = parseInt(currentEntity.position.charAt(1));
        let positionNextTo = letterParser(letter, currentEntity.enemy) + number;
        let entityInPositionNextTo = activeEntities.find(
          (entity) => entity.position === positionNextTo
        );
        if (
          entityInPositionNextTo !== undefined &&
          entityInPositionNextTo.enemy === currentEntity.enemy
        ) {
          let positionAbove =
            positionNextTo.charAt(0) + (positionNextTo.charAt(1) - 1);
          if (
            activeEntities.find(
              (entity) => entity.position === positionAbove
            ) === undefined
          ) {
            if (currentEntity.speed <= currentEntity.speedCharge) {
              currentEntity.position = positionAbove;
              currentEntity.speedCharge = 0;
              updateGameboardEntities(activeEntities);
              return true;
            } else {
              currentEntity.speed++;
              return true;
            }
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
          entityList[currentEntity.type].lvls[
            "lvl" + (currentEntity.lvl + 1)
          ] !== undefined
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

      //lazy function to go back or forward one letter in alphabet depending on if enemy
      function letterParser(position, enemy) {
        if (enemy) {
          if (position === "B") {
            return (position = "A");
          } else if (position === "C") {
            return (position = "B");
          } else if (position === "D") {
            return (position = "C");
          } else if (position === "E") {
            return (position = "D");
          } else if (position === "F") {
            return (position = "E");
          } else if (position === "G") {
            return (position = "F");
          } else if (position === "H") {
            return (position = "G");
          } else if (position === "I") {
            return (position = "H");
          } else if (position === "J") {
            return (position = "I");
          }
        } else if (!enemy) {
          if (position === "A") {
            return (position = "B");
          } else if (position === "B") {
            return (position = "C");
          } else if (position === "C") {
            return (position = "D");
          } else if (position === "D") {
            return (position = "E");
          } else if (position === "E") {
            return (position = "F");
          } else if (position === "F") {
            return (position = "G");
          } else if (position === "G") {
            return (position = "H");
          } else if (position === "H") {
            return (position = "I");
          } else if (position === "I") {
            return (position = "J");
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

    //sets amount of turns to play
    function amountOfTurns(i, finished) {
      let wave = "wave" + i,
        gameFinished = finished,
        currentWave = waves[wave];
      if (!gameFinished) {
        let timer = setInterval(() => {
          turnCycler(currentWave, wave, timer, i);
        }, 1);
      } else console.log("Game Over");

      //runs turn functions under a timer
      function turnCycler(currentWave, wave, timer, i) {
        if (currentWave[currentTurn] !== undefined) {
          spawner(currentWave, currentTurn, activeEntities);
        }
        nextTurn(currentTurn);
        if (victoryChecker(wave, currentTurn) === "friendly victory") {
          clearInterval(timer);
          console.log("Friendly Victory - Total Money: $" + bank);
          currentTurn = 1;
          if (i + 1 > Object.keys(waves).length) {
            amountOfTurns(i + 1, true);
          } else {
            amountOfTurns(i + 1, false);
          }
        } else if (victoryChecker(wave, currentTurn) === "enemy victory") {
          clearInterval(timer);
          console.log("Enemy Victory");
        }
        currentTurn++;
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
        updateGameboardEntities(activeEntities);
      }

      //makes all entities take turn
      function nextTurn(currentTurn) {
        activeEntities.forEach((entity) => {
          entityTurn(entity);
        });
        console.log("Turn " + currentTurn + " over.");
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

    //spawns the king every round
    friendlySpawner("king", "A9", 1);
    updateGameboardEntities(activeEntities);
    amountOfTurns(1, false);
  }

  //runs friendly through checks before spawning
  function friendlySpawner(friendlyType, friendlyPosition, friendlyLvl) {
    if (validFriendly(friendlyType, friendlyLvl)) {
      let friendlyCost =
        entityList[friendlyType].lvls["lvl" + friendlyLvl].value;
      if (bankChecker(friendlyType, friendlyCost)) {
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
    if (friendlyPosition === "A9" && friendlyType !== "king") {
      console.log("Cannot place in A9, position reserved for king");
      positionAllowed = false;
    } else {
      if (
        activeEntities.find(
          (entity) => entity.position === friendlyPosition
        ) !== undefined
      ) {
        console.log("Position taken");
        return (positionAllowed = false);
      }
    }
    if (positionAllowed && !entityList[friendlyType].enemy) {
      return true;
    } else {
      console.log("Cannot spwawn enemy units");
    }
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
      let lvls = Object.entries(Object.entries(entity[1])[4][1]);
      lvls.forEach((lvl) => {
        parsedFriendlyEntityArray.push(
          name +
            " lvl" +
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

  //user inputs
  const [friendlyType, setFriendlyType] = useState("arrow");
  function updateFriendlyType(e) {
    setFriendlyType(e.target.value);
  }
  const [friendlyPosition, setFriendlyPosition] = useState("B9");
  function updateFriendlyPosition(e) {
    setFriendlyPosition(e.target.value);
  }
  const [friendlyLvl, setFriendlyLvl] = useState(1);
  function updateFriendlyLvl(e) {
    setFriendlyLvl(e.target.value);
  }

  //handles making a usable array for the grid renderer
  const [gameboardEntities, setGameboardEntities] = useState([]);

  function updateGameboardEntities(activeEntities) {
    let grid = [];
    const boardWidth = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    for (let h = 1; h < 10; h++) {
      let subGrid = [];
      boardWidth.forEach((element) => {
        let entityMade = false;
        activeEntities.forEach((entity) => {
          if (entity.position === element + h) {
            if (entity.enemy === true) {
              subGrid.push([
                [entity.name],
                [entity.type + "Lvl" + entity.lvl + " (hp: " + entity.hp + ")"],
              ]);
            } else {
              subGrid.push([
                [entity.name],
                [
                  entity.type +
                    "Lvl" +
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
        if (!entityMade) {
          subGrid.push([[element + h], [element + h]]);
        }
      });
      grid.push(subGrid);
    }
    setGameboardEntities(grid);
  }

  //pushes the active entities from updateGameboardEntities to the DOM
  function GameboardRender() {
    return (
      <table>
        <tbody>
          {gameboardEntities.map((row) => {
            return (
              <tr
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                {row.map((position) => {
                  return (
                    <td key={position[0]}>
                      <input type="text" defaultValue={position[1]}></input>
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

  return (
    <>
      <div>
        <p>Friendly spawner:</p>
        <p>Money: ${bank}</p>
        <Purchasables></Purchasables>
        <p>Type:</p>
        <input value={friendlyType} onChange={updateFriendlyType}></input>
        <p>Position:</p>
        <input
          value={friendlyPosition}
          onChange={updateFriendlyPosition}
        ></input>
        <p>lvl:</p>
        <input
          type="number"
          value={friendlyLvl}
          onChange={updateFriendlyLvl}
        ></input>
      </div>
      <button
        onClick={() => {
          friendlySpawner(friendlyType, friendlyPosition, friendlyLvl);
        }}
      >
        Add Friendly
      </button>
      <button
        onClick={() => {
          Engine(activeEntities, graveyard, bank, currentTurn, waves);
        }}
      >
        Start Round
      </button>
      <GameboardRender></GameboardRender>
    </>
  );
}
