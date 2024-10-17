import { useState } from "react";
export default function EngineOutput() {
  const [activeEntities, setActiveEntities] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [bank, setBank] = useState(1000);
  const [currentTurn, setCurrentTurn] = useState(1);

  //function that creates new active entities
  function Entity(type, level, position, name) {
    this.name = name;
    this.type = type.type;
    this.position = position;
    this.level = level.lvl;
    this.hp = level.hp;
    this.dmg = level.dmg;
    this.range = level.range;
    this.rate = level.rate;
    let neededRate = level.rate;
    this.rateCharge = neededRate;
    this.speed = level.speed;
    this.speedCharge = 0;
    this.enemy = type.enemy;
    this.value = level.value;
    if (!this.enemy) {
      this.currentExp = 0;
      this.neededExp = level.neededExp;
    } else {
      this.exp = level.exp;
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
      levels: {
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
      levels: {
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
      levels: {
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
      levels: {
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
      levels: {
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
        level: "lvl1",
        position: "J9",
      },
      423: {
        name: "goblin",
        level: "lvl2",
        position: "J9",
      },
      840: {
        name: "skeleton",
        level: "lvl1",
        position: "J9",
      },
      1103: {
        name: "goblin",
        level: "lvl2",
        position: "J9",
      },
      1605: {
        name: "skeleton",
        level: "lvl2",
        position: "J9",
      },
      1932: {
        name: "goblin",
        level: "lvl2",
        position: "J9",
      },
      2134: {
        name: "goblin",
        level: "lvl2",
        position: "J9",
      },
      2234: {
        name: "goblin",
        level: "lvl2",
        position: "J9",
      },
      2342: {
        name: "goblin",
        level: "lvl2",
        position: "J9",
      },
      2600: {
        name: "goblin",
        level: "lvl1",
        position: "J9",
      },
      2800: {
        name: "goblin",
        level: "lvl2",
        position: "J9",
      },
      2950: {
        name: "skeleton",
        level: "lvl1",
        position: "J9",
      },
      3140: {
        name: "goblin",
        level: "lvl2",
        position: "J9",
      },
      3250: {
        name: "skeleton",
        level: "lvl2",
        position: "J9",
      },
      3380: {
        name: "goblin",
        level: "lvl2",
        position: "J9",
      },
      3480: {
        name: "goblin",
        level: "lvl2",
        position: "J9",
      },
      3550: {
        name: "goblin",
        level: "lvl2",
        position: "J9",
      },
      3785: {
        name: "goblin",
        level: "lvl2",
        position: "J9",
      },
    },
    wave2: {
      wave: 2,
      360: {
        name: "goblin",
        level: "lvl1",
        position: "I9",
      },
      423: {
        name: "goblin",
        level: "lvl2",
        position: "I9",
      },
      840: {
        name: "skeleton",
        level: "lvl1",
        position: "I9",
      },
      1103: {
        name: "goblin",
        level: "lvl2",
        position: "I9",
      },
      1605: {
        name: "skeleton",
        level: "lvl2",
        position: "I9",
      },
      1932: {
        name: "goblin",
        level: "lvl2",
        position: "I9",
      },
      2134: {
        name: "goblin",
        level: "lvl2",
        position: "I9",
      },
      2234: {
        name: "goblin",
        level: "lvl2",
        position: "I9",
      },
      2342: {
        name: "goblin",
        level: "lvl2",
        position: "I9",
      },
    },
  };

  function Engine(activeEntities, graveyard, bank, currentTurn, waves) {
    //tells entities what to do on their turn
    function entityTurn(currentEntity) {
      let turnTaken = false;
      if (!groundChecker(currentEntity.position)) {
        gravity(currentEntity);
        turnTaken = true;
      } else {
        let rangeCells = [];
        currentEntity.rateCharge++;
        currentEntity.speedCharge++;
        let oldPosition = currentEntity.position;
        let rangeLetter = letterParser(
          oldPosition.charAt(0),
          currentEntity.enemy
        );
        let newPosition =
          letterParser(oldPosition.charAt(0), currentEntity.enemy) +
          oldPosition.charAt(1);
        for (let i = currentEntity.range; i > 0; i--) {
          rangeCells.push(rangeLetter + oldPosition.charAt(1));
          rangeLetter = letterParser(rangeLetter, currentEntity.enemy);
        }
        rangeCells.forEach((rangeTarget) => {
          activeEntities.forEach((entity) => {
            if (
              entity.position === rangeTarget &&
              currentEntity.rateCharge >= currentEntity.rate &&
              entity.enemy !== currentEntity.enemy
            ) {
              currentEntity.rateCharge = 0;
              entity.hp = entity.hp - currentEntity.dmg;
              console.log(
                currentEntity.name +
                  " attacked " +
                  entity.name +
                  " for " +
                  currentEntity.dmg +
                  " damage. " +
                  entity.name +
                  " HP is " +
                  entity.hp
              );
              healthChecker(entity, currentEntity);
              updateGameboardEntities(activeEntities);
              currentEntity.speedCharge = 0;
              turnTaken = true;
            }
          });
        });
        if (
          currentEntity.speedCharge >= currentEntity.speed &&
          currentEntity.speed !== 0 &&
          !turnTaken
        ) {
          let spotFree = true;
          if (
            activeEntities.find((entity) => entity.position === newPosition) !==
            undefined
          ) {
            if (currentEntity.climber === true) {
              if (climbChecker(currentEntity)) {
                turnTaken = true;
              }
            }
            return (spotFree = false);
          }
          if (spotFree) {
            currentEntity.speedCharge = 0;
            currentEntity.position = newPosition;
            console.log(
              currentEntity.name + " moved to " + currentEntity.position
            );
            turnTaken = true;
            updateGameboardEntities(activeEntities);
          }
        }
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

    //function to determine if there is anything under the current entity
    function groundChecker(position) {
      let letter = position.charAt(0);
      let number = parseInt(position.charAt(1));
      if (number != 9) {
        let positionBelow = letter + (number + 1);
        if (
          activeEntities.find((entity) => entity.position === positionBelow) ===
          undefined
        ) {
          return false;
        } else return true;
      } else {
        return true;
      }
    }

    //moves entities down if falling
    function gravity(entity) {
      if (entity.fallCharge < entity.fallSpeed) {
        console.log(entity.name + " is falling");
        entity.fallCharge++;
      } else {
        entity.fallCharge = 0;
        let newPosition =
          entity.position.charAt(0) + (parseInt(entity.position.charAt(1)) + 1);
        console.log(entity.name + " fell to " + newPosition);
        entity.position = newPosition;
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
      console.log(entityInPositionNextTo);
      if (
        entityInPositionNextTo !== undefined &&
        entityInPositionNextTo.enemy === currentEntity.enemy
      ) {
        let positionAbove =
          positionNextTo.charAt(0) + (positionNextTo.charAt(1) - 1);
        if (
          activeEntities.find((entity) => entity.position === positionAbove) ===
          undefined
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
        entityList[currentEntity.type].levels[
          "lvl" + (currentEntity.level + 1)
        ] !== undefined
      ) {
        levelUp(currentEntity);
      }
    }

    //applies level up for friendly entity
    function levelUp(currentEntity) {
      let oldProperties = Object.entries(currentEntity);
      currentEntity.level++;
      let newLevel = currentEntity.level;
      let newProperties = Object.entries(
        entityList[currentEntity.type].levels["lvl" + newLevel]
      );
      oldProperties.forEach((oldProperty) => {
        newProperties.forEach((newProperty) => {
          if (
            oldProperty[0] === newProperty[0] &&
            oldProperty[1] !== newProperty[1]
          ) {
            currentEntity[oldProperty[0]] = newProperty[1];
          }
        });
      });
      console.log(
        currentEntity.name + " has leveled up to level " + currentEntity.level
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

    //spawns entities based on wave
    function spawner(currentWave, currentTurn, activeEntities) {
      let entityType = entityList[currentWave[currentTurn].name];
      let entityLevel =
        entityList[currentWave[currentTurn].name].levels[
          currentWave[currentTurn].level
        ];
      let position = currentWave[currentTurn].position;
      let entityID = currentWave[currentTurn].name + currentTurn;
      entityID = new Entity(entityType, entityLevel, position, entityID);
      activeEntities.push(entityID);
      console.log(entityID.name + " spawned at " + entityID.position + ".");
      updateGameboardEntities(activeEntities);
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
    }

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

    //spawns the king every round
    friendlySpawner("king", "A9", 1);
    updateGameboardEntities(activeEntities);
    amountOfTurns(1, false);
  }

  //runs friendly through checks before spawning
  function friendlySpawner(friendlyType, friendlyPosition, friendlyLevel) {
    if (entityList[friendlyType] !== undefined) {
      if (
        entityList[friendlyType].levels["lvl" + friendlyLevel] !== undefined
      ) {
        let friendlyCost =
          entityList[friendlyType].levels["lvl" + friendlyLevel].value;
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
            friendlyEntityParser(friendlyType, friendlyPosition, friendlyLevel);
          }
        } else {
          console.log("Insufficient funds");
        }
      } else {
        console.log("Entity level does not exist");
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
      return false;
    }
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
      let levels = Object.entries(Object.entries(entity[1])[2][1]);
      levels.forEach((level) => {
        parsedFriendlyEntityArray.push(
          name +
            " lvl" +
            level[1].lvl +
            " cost: $" +
            level[1].value +
            " dmg: " +
            level[1].dmg +
            " range: " +
            level[1].range +
            " attack speed: " +
            level[1].rate
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
  function friendlyEntityParser(entityType, entityPosition, entityLevel) {
    let ID = friendlyCount + 1;
    setFriendlyCount(ID);
    entityType = entityList[entityType];
    entityLevel = entityType.levels["lvl" + entityLevel];
    let entityID = entityType.type + friendlyCount;
    entityID = new Entity(entityType, entityLevel, entityPosition, entityID);
    activeEntities.push(entityID);
    console.log(entityID.name + " spawned at " + entityPosition);
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
  const [friendlyLevel, setFriendlyLevel] = useState(1);
  function updateFriendlyLevel(e) {
    setFriendlyLevel(e.target.value);
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
                [
                  entity.type +
                    "Lvl" +
                    entity.level +
                    " (hp: " +
                    entity.hp +
                    ")",
                ],
              ]);
            } else {
              subGrid.push([
                [entity.name],
                [
                  entity.type +
                    "Lvl" +
                    entity.level +
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
        <p>Level:</p>
        <input
          type="number"
          value={friendlyLevel}
          onChange={updateFriendlyLevel}
        ></input>
      </div>
      <button
        onClick={() => {
          friendlySpawner(friendlyType, friendlyPosition, friendlyLevel);
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
