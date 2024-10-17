import { useState } from "react";
export default function EngineOutput() {
  const [activeEntities, setActiveEntities] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [bank, setBank] = useState(10);
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
  }

  //object that holds default values of entities
  const entityList = {
    goblin: {
      type: "goblin",
      enemy: true,
      levels: {
        lvl1: {
          lvl: 1,
          hp: 9,
          dmg: 3,
          range: 1,
          rate: 2 * 30,
          speed: 2 * 30,
          value: 1,
          exp: 1,
        },
        lvl2: {
          lvl: 2,
          hp: 12,
          dmg: 4,
          range: 1,
          rate: 2 * 30,
          speed: 2 * 30,
          value: 3,
          exp: 2,
        },
      },
    },
    skeleton: {
      type: "skeleton",
      enemy: true,
      levels: {
        lvl1: {
          lvl: 1,
          hp: 5,
          dmg: 2,
          range: 3,
          rate: 2 * 30,
          speed: 3 * 30,
          value: 1,
          exp: 1,
        },
        lvl2: {
          lvl: 2,
          hp: 8,
          dmg: 3,
          range: 3,
          rate: 2 * 30,
          speed: 2 * 30,
          value: 3,
          exp: 2,
        },
      },
    },
    arrow: {
      type: "arrow",
      enemy: false,
      levels: {
        lvl1: {
          lvl: 1,
          hp: 10,
          dmg: 3,
          range: 3,
          rate: 2 * 30,
          speed: 0 * 30,
          value: 5,
          neededExp: 3,
        },
        lvl2: {
          lvl: 2,
          hp: 12,
          dmg: 4,
          range: 3,
          rate: 2 * 30,
          speed: 0 * 30,
          value: 10,
          neededExp: 6,
        },
        lvl3: {
          lvl: 3,
          hp: 14,
          dmg: 5,
          range: 3,
          rate: 2 * 30,
          speed: 0 * 30,
          value: 15,
          neededExp: 30,
        },
      },
    },
    king: {
      type: "king",
      enemy: false,
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

  function Engine(
    activeEntities,
    graveyard,
    bank,
    currentTurn,

    waves
  ) {
    //tells entities what to do on their turn
    function entityTurn(currentEntity) {
      let turnTaken = false;
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
            turnTaken = true;
            updateGameboardEntities(activeEntities);
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

    //checks to see if entity dies
    function healthChecker(entity, currentEntity) {
      if (entity.hp <= 0) {
        currentEntity.rateCharge = 0;
        console.log(entity.name + " was killed by " + currentEntity.name);
        if (entity.enemy) {
          bank = bank + entity.value;
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
          position = "A";
        } else if (position === "C") {
          position = "B";
        } else if (position === "D") {
          position = "C";
        } else if (position === "E") {
          position = "D";
        } else if (position === "F") {
          position = "E";
        } else if (position === "G") {
          position = "F";
        } else if (position === "H") {
          position = "G";
        } else if (position === "I") {
          position = "H";
        } else if (position === "J") {
          position = "I";
        }
        return position;
      } else if (!enemy) {
        if (position === "A") {
          position = "B";
        } else if (position === "B") {
          position = "C";
        } else if (position === "C") {
          position = "D";
        } else if (position === "D") {
          position = "E";
        } else if (position === "E") {
          position = "F";
        } else if (position === "F") {
          position = "G";
        } else if (position === "G") {
          position = "H";
        } else if (position === "H") {
          position = "I";
        } else if (position === "I") {
          position = "J";
        }
        return position;
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

  //determines if position for friendly spawn is allowed
  function friendlyPositionChecker(friendlyPosition, friendlyType) {
    let positionAllowed = true;
    if (friendlyPosition === "A1" && friendlyType !== "king") {
      console.log("Cannot place in A1, position reserved for king");
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
          Engine(
            activeEntities,
            graveyard,
            bank,
            currentTurn,

            waves
          );
        }}
      >
        Start Round
      </button>
      <GameboardRender></GameboardRender>
    </>
  );
}
