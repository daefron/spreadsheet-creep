import { useState } from "react";
export default function EngineOutput() {
  const [activeEntities, setActiveEntities] = useState([]);
  const [gameboard, setGameboard] = useState(new Map());
  const [graveyard, setGraveyard] = useState([]);
  const [bank, setBank] = useState(0);
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
    let neededSpeed = level.speed;
    this.speedCharge = neededSpeed;
    this.enemy = type.enemy;
    this.value = level.value;
    if (this.enemy == false) {
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
          rate: 2,
          speed: 2,
          value: 1,
          exp: 1,
        },
        lvl2: {
          lvl: 2,
          hp: 12,
          dmg: 4,
          range: 1,
          rate: 2,
          speed: 2,
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
          rate: 2,
          speed: 0,
          value: 5,
          neededExp: 3,
        },
        lvl2: {
          lvl: 2,
          hp: 12,
          dmg: 4,
          range: 3,
          rate: 2,
          speed: 0,
          value: 10,
          neededExp: 6,
        },
        lvl3: {
          lvl: 3,
          hp: 14,
          dmg: 5,
          range: 3,
          rate: 2,
          speed: 0,
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
          rate: 1,
          speed: 0,
          value: 30,
          neededExp: 100,
        },
      },
    },
  };

  //object holding wave properties
  const waves = {
    wave1: {
      wave: 1,
      1: {
        name: "goblin",
        level: "lvl1",
        position: "J1",
      },
      3: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
      14: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
      19: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
      27: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
      30: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
      40: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
      41: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
    },
  };

  function Engine(
    activeEntities,
    gameboard,
    graveyard,
    bank,
    currentTurn,
    waveLength,
    waves
  ) {
    //creates the gameboard grid
    function gameboardMaker() {
      const boardWidth = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
      for (let h = 1; h < 10; h++) {
        boardWidth.forEach((element) => gameboard.set(element + h));
      }
      friendlyPositionChecker("king", "A1", 1, entityList, activeEntities);
    }

    //updates the gameboard entities in the gameboard
    function gameboardUpdater() {
      activeEntities.forEach((entity) => {
        gameboard.forEach((value, location) => {
          if (entity.position == location && location !== undefined) {
            gameboard.set(location, entity);
          }
        });
      });
    }

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
        if (
          gameboard.get(rangeTarget) !== undefined &&
          gameboard.get(rangeTarget).enemy !== currentEntity.enemy
        ) {
          activeEntities.forEach((entity) => {
            if (
              entity.position == rangeTarget &&
              currentEntity.rateCharge >= currentEntity.rate &&
              gameboard.get(rangeTarget).enemy !== currentEntity.enemy
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
            }
          });
        } else if (
          gameboard.get(newPosition) == undefined &&
          currentEntity.speedCharge >= currentEntity.speed &&
          currentEntity.speed !== 0 &&
          turnTaken == false
        ) {
          currentEntity.speedCharge = 0;
          gameboard.set(oldPosition, undefined);
          currentEntity.position = newPosition;
          gameboardUpdater();
          console.log(
            currentEntity.name + " moved to " + currentEntity.position
          );
          turnTaken = true;
        }
      });
      if (currentEntity.rateCharge < currentEntity.rate && turnTaken == false) {
        console.log(currentEntity.name + " charging attack.");
      } else if (
        currentEntity.speedCharge < currentEntity.speed &&
        currentEntity.speed !== 0
      ) {
        console.log(currentEntity.name + " charging movement.");
      } else if (turnTaken == false) {
        console.log(currentEntity.name + " did nothing.");
      }
    }

    //checks to see if entity dies
    function healthChecker(entity, currentEntity) {
      if (entity.hp <= 0) {
        currentEntity.rateCharge = 0;
        console.log(entity.name + " was killed by " + currentEntity.name);
        if (entity.enemy == true) {
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
        gameboard.forEach((value, location) => {
          if (entity.position == location) {
            gameboard.set(location, undefined);
          }
        });
      }
    }

    //adds and checks exp on kill
    function expTracker(entity, currentEntity) {
      currentEntity.currentExp = currentEntity.currentExp + entity.exp;
      if (currentEntity.currentExp >= currentEntity.neededExp) {
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
            oldProperty[0] == newProperty[0] &&
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
      if (enemy == true) {
        if (position == "B") {
          position = "A";
        } else if (position == "C") {
          position = "B";
        } else if (position == "D") {
          position = "C";
        } else if (position == "E") {
          position = "D";
        } else if (position == "F") {
          position = "E";
        } else if (position == "G") {
          position = "F";
        } else if (position == "H") {
          position = "G";
        } else if (position == "I") {
          position = "H";
        } else if (position == "J") {
          position = "I";
        }
        return position;
      } else if (enemy == false) {
        if (position == "A") {
          position = "B";
        } else if (position == "B") {
          position = "C";
        } else if (position == "C") {
          position = "D";
        } else if (position == "D") {
          position = "E";
        } else if (position == "E") {
          position = "F";
        } else if (position == "F") {
          position = "G";
        } else if (position == "G") {
          position = "H";
        } else if (position == "H") {
          position = "I";
        } else if (position == "I") {
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
      gameboardUpdater();
    }

    //sets amount of turns to play
    function amountOfTurns(waveLength, round) {
      let currentWave = waves[round];
      while (currentTurn <= waveLength) {
        if (currentWave[currentTurn] !== undefined) {
          spawner(currentWave, currentTurn, activeEntities);
        }
        nextTurn(currentTurn);
        if (victoryChecker(round, currentTurn, waveLength) == waveLength) {
          currentTurn = waveLength;
        }
        currentTurn++;
      }
    }

    //makes all entities take turn
    function nextTurn(currentTurn) {
      activeEntities.forEach((entity) => {
        entityTurn(entity);
      });
      console.log("Turn " + currentTurn + " over.");
    }

    //checks if and which side has won round
    function victoryChecker(round, currentTurn, waveLength) {
      let spawnTurns = [];
      Object.keys(waves[round]).forEach((element) => {
        spawnTurns.push(element);
      });
      let activeEnemies = 0;
      let activeFriendlies = 0;
      activeEntities.forEach((entity) => {
        if (entity.enemy == true) {
          activeEnemies++;
        } else activeFriendlies++;
      });
      let kingAlive;
      activeEntities.forEach((entity) => {
        if (entity.type == "king") {
          return (kingAlive = true);
        }
      });
      if (kingAlive !== true) {
        console.log("Enemy Victory");
        gameboardClearer(false);
        return waveLength;
      } else if (
        currentTurn > spawnTurns[spawnTurns.length - 2] &&
        activeEnemies == 0
      ) {
        console.log("Friendly Victory");
        gameboardClearer(true);
        setBank(bank);
        return waveLength;
      } else if (currentTurn > waveLength) {
        console.log("Wave Over");
      }
    }

    //clears the gameboard on victory
    function gameboardClearer(victory) {
      if (victory == true) {
        activeEntities.forEach((entity) => {
          if (entity.enemy == true) {
            activeEntities.pop(entity);
          }
        });
      } else {
        setActiveEntities([]);
      }
    }
    gameboardMaker();
    amountOfTurns(waveLength, "wave1");
  }

  //translates user input into data Entity maker can use
  const [friendlyCount, setFriendlyCount] = useState(1);
  function friendlyEntityParser(
    entityType,
    entityPosition,
    entityLevel,
    entityList,
    activeEntities
  ) {
    let ID = friendlyCount + 1;
    setFriendlyCount(ID);
    entityType = entityList[entityType];
    entityLevel = entityType.levels["lvl" + entityLevel];
    let entityID = entityType.type + friendlyCount;
    entityID = new Entity(entityType, entityLevel, entityPosition, entityID);
    activeEntities.push(entityID);
    console.log(entityID.name + " spawned at " + entityPosition);
  }

  //determines if position for friendly spawn is allowed
  function friendlyPositionChecker(
    friendlyType,
    friendlyPosition,
    friendlyLevel,
    entityList,
    activeEntities
  ) {
    let positionAllowed;
    if (friendlyPosition == "A1" && friendlyType !== "king") {
      console.log("Cannot place in A1, position reserved for king");
      positionAllowed = false;
    } else {
      activeEntities.forEach((entity) => {
        if (entity.position == friendlyPosition) {
          console.log("Position taken by " + entity.name);
          return (positionAllowed = false);
        }
      });
    }
    if (positionAllowed !== false) {
      friendlyEntityParser(
        friendlyType,
        friendlyPosition,
        friendlyLevel,
        entityList,
        activeEntities
      );
    }
  }

  //user inputs
  const [waveLength, setWaveLength] = useState(200);
  function updateWaveLength(e) {
    setWaveLength(e.target.value);
  }
  const [friendlyType, setFriendlyType] = useState("arrow");
  function updateFriendlyType(e) {
    setFriendlyType(e.target.value);
  }
  const [friendlyPosition, setFriendlyPosition] = useState("B1");
  function updateFriendlyPosition(e) {
    setFriendlyPosition(e.target.value);
  }
  const [friendlyLevel, setFriendlyLevel] = useState(1);
  function updateFriendlyLevel(e) {
    setFriendlyLevel(e.target.value);
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
          friendlyPositionChecker(
            friendlyType,
            friendlyPosition,
            friendlyLevel,
            entityList,
            activeEntities
          );
        }}
      >
        Add Friendly
      </button>
      <div>
        <p>Amount of rounds: </p>
        <input
          type="number"
          onChange={updateWaveLength}
          value={waveLength}
        ></input>
      </div>
      <button
        onClick={() => {
          Engine(
            activeEntities,
            gameboard,
            graveyard,
            bank,
            currentTurn,
            waveLength,
            waves
          );
        }}
      >
        Start Round
      </button>
    </>
  );
}
